import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {routes} from './routes';
for(const route of routes)for(const theme of ['light','dark'] as const){
 test(`axe ${theme}: ${route||'home'}`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});await page.goto(route);await page.waitForLoadState('networkidle');
  const result=await new AxeBuilder({page}).analyze();expect(result.violations).toEqual([]);
 });
}
test('keyboard command palette tolerates repeated shortcut and restores focus',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('');const trigger=page.locator('[data-command-open]').first();await expect(trigger).toBeVisible();await trigger.focus();
 const shortcut=process.platform==='darwin'?'Meta+K':'Control+K';
 await page.keyboard.press(shortcut);await expect(page.locator('#command-palette')).toBeVisible();await page.keyboard.press(shortcut);await expect(page.locator('#command-input')).toBeFocused();
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();expect(errors).toEqual([]);
});
test('mobile disclosure works with keyboard and Escape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('');const summary=page.locator('[data-mobile-menu] summary');await summary.focus();await page.keyboard.press('Enter');await expect(page.getByRole('navigation',{name:'Mobile navigation'})).toBeVisible();await page.keyboard.press('Escape');await expect(summary).toBeFocused();await expect(page.getByRole('navigation',{name:'Mobile navigation'})).toBeHidden();
});
test('search dialog and invalid form states are accessible',async({page})=>{
 await page.goto('');await page.locator('[data-command-open]').click();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');
 await page.goto('contact/');await page.evaluate(()=>{const form=document.querySelector<HTMLFormElement>('#contact-form')!;form.dataset.endpoint='https://contact.example.test/contact';form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 await expect(page.locator('#form-errors')).toBeVisible();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
