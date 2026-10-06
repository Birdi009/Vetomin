import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['', 'work/', 'contact/', 'projects/atlas/']) {
  test(`axe: ${path || 'home'}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter(v => ['critical','serious'].includes(v.impact || ''))).toEqual([]);
  });
}

test('keyboard command palette restores focus', async ({ page }) => {
  await page.goto('');
  const trigger = page.locator('[data-command-open]').first();
  await trigger.focus();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await expect(page.locator('#command-palette')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});