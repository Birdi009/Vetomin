import { test, expect } from '@playwright/test';

const views = [
  ['home',''],
  ['work','work/'],
  ['case','projects/atlas/'],
  ['contact','contact/']
] as const;

for (const [name,path] of views) {
  test(`visual: ${name}`, async ({ page }, testInfo) => {
    await page.goto(path);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
    if (process.env.VISUAL_BASELINES === '1') {
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 });
    }
  });
}

// Assertions always run: screenshot capture alone cannot detect an overlapping rail.
test('route rail stays hidden without a dedicated desktop gutter', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('');
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  const rail = page.getByRole('navigation', { name: 'Page route', includeHidden: true });
  const sizes = [
    { width: 320, height: 700 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 393, height: 852 },
    { width: 416, height: 904 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 820, height: 1180 },
    { width: 821, height: 900 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1280, height: 900 },
    { width: 1440, height: 900 },
    { width: 1479, height: 900 }
  ];
  for (const size of sizes) {
    await test.step(`${size.width}x${size.height}: hidden before and after scrolling`, async () => {
      await page.setViewportSize(size);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(rail).toHaveCSS('display', 'none');
      await expect(rail).toBeHidden();
      expect(await rail.boundingBox()).toBeNull();
      if (size.width === 390 || size.width === 844) {
        await page.screenshot({ path: testInfo.outputPath(`route-rail-${size.width}x${size.height}.png`) });
      }
      await page.evaluate(() => window.scrollTo(0, 700));
      await expect(rail).toBeHidden();
    });
  }
  console.log('Verified hidden route rail:', page.url(), sizes.map(size => size.width).join(','));
});

test('route rail only appears in a non-overlapping wide-screen gutter', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('');
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  const rail = page.getByRole('navigation', { name: 'Page route' });
  for (const width of [1480, 1920]) {
    await page.setViewportSize({ width, height: 1080 });
    await expect(rail).toBeVisible();
    const railBox = await rail.boundingBox();
    const contentBox = await page.locator('#arrival .hero').boundingBox();
    expect(railBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    expect(railBox!.x + railBox!.width + 16).toBeLessThanOrEqual(contentBox!.x);
  }
  console.log('Verified route rail has a separate gutter:', page.url());
});

test('route rail removal leaves mobile actions and navigation usable', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('');
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  const trigger = page.locator('[data-command-open]').first();
  const brand = await page.locator('.brand').boundingBox();
  const triggerBox = await trigger.boundingBox();
  expect(brand).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(brand!.x + brand!.width).toBeLessThanOrEqual(triggerBox!.x);
  await page.locator('#arrival .actions a[href="#work"]').click();
  await expect(page).toHaveURL(/#work$/);
  await trigger.click();
  await expect(page.locator('#command-palette')).toBeVisible();
  await expect(page.locator('#command-results').getByRole('link', { name: 'Work', exact: true })).toBeVisible();
  await page.locator('[data-command-close]').click();
  await expect(page.locator('#command-palette')).not.toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('route-rail-mobile-after-interaction.png') });
  console.log('Verified mobile actions and command navigation:', page.url());
});
