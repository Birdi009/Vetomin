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