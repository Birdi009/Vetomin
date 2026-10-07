import {test,expect,type Page} from '@playwright/test';
// Reserved .invalid origin intercepted before use: tests never contact AWS or a real recipient.
const endpoint='https://inquiry.invalid/test';
async function installMock(page:Page,reply:'success'|'failure'|'network'){
  const requests:{body:Record<string,unknown>}[]=[];
  await page.route('**/contact/',async route=>{const response=await route.fetch();const body=(await response.text()).replace(/data-endpoint="[^"]*"/,`data-endpoint="${endpoint}"`);await route.fulfill({response,body});});
  await page.route(endpoint,async route=>{requests.push({body:route.request().postDataJSON()});if(reply==='network'){await route.abort('failed');return;}await new Promise(resolve=>setTimeout(resolve,500));await route.fulfill({status:reply==='success'?200:503,contentType:'application/json',body:JSON.stringify({ok:reply==='success'})});});
  await page.goto('contact/');return requests;
}
async function fill(page:Page){await page.locator('#name').fill('Test participant');await page.locator('#email').fill('tester@example.invalid');await page.locator('#message').fill('Test-only inquiry for validating the browser behavior. Nothing is sent to a real service.');}

test('inquiry errors identify fields and focus the first error',async({page})=>{
  const requests=await installMock(page,'success');await page.locator('[data-send]').click();await expect(page.locator('#form-errors')).toContainText('3 fields');await expect(page.locator('#name')).toBeFocused();await expect(page.locator('#email')).toHaveAttribute('aria-invalid','true');await expect(page.locator('#email-error')).toContainText('name@example.com');expect(requests).toHaveLength(0);
});
test('mock acceptance prevents duplicate sends and confirms service acceptance',async({page})=>{
  const requests=await installMock(page,'success');await fill(page);await page.waitForTimeout(1300);await page.locator('[data-send]').click();await expect(page.locator('[data-send]')).toBeDisabled();await page.locator('#contact-form').dispatchEvent('submit');await expect(page.locator('#form-status')).toContainText('Message accepted by the inquiry service');expect(requests).toHaveLength(1);expect(requests[0].body.email).toBe('tester@example.invalid');await expect(page.locator('#message')).toHaveValue('');await expect(page.locator('[data-send]')).toBeEnabled();
});
for(const reply of ['failure','network'] as const)test(`inquiry ${reply} preserves the draft and allows recovery`,async({page})=>{
  const requests=await installMock(page,reply);await fill(page);await page.waitForTimeout(1300);const original=await page.locator('#message').inputValue();await page.locator('[data-send]').click();await expect(page.locator('#form-status')).toContainText('Your message is still here');await expect(page.locator('#message')).toHaveValue(original);await expect(page.locator('[data-send]')).toBeEnabled();expect(requests).toHaveLength(1);await page.locator('[data-prepare]').click();expect(await page.locator('[data-draft-preview]').inputValue()).toContain(original);
});
test('unconfigured inquiry offers a local draft, not a dead Send action',async({page})=>{
  await page.route('**/contact/',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/data-endpoint="[^"]*"/,'data-endpoint=""')});});await page.goto('contact/');await expect(page.locator('[data-send]')).toBeHidden();await page.locator('#message').fill('A private local draft.');await page.locator('[data-prepare]').click();await expect(page.locator('#form-status')).toContainText('Nothing has been sent');expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('private local draft');
});
