import {test,expect,type Page} from '@playwright/test';
import {routes} from './routes';
async function workLink(page:Page){const desktop=page.getByRole('navigation',{name:'Primary',exact:true});if(await desktop.isVisible())return desktop.getByRole('link',{name:'Work',exact:true});await page.locator('[data-mobile-menu] summary').click();return page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Work',exact:true});}
for(const route of routes){test(`smoke: ${route||'home'} loads with real media and no runtime errors`,async({page,baseURL})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.url().startsWith(new URL(baseURL!).origin)&&response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
 await page.emulateMedia({reducedMotion:'reduce'});const response=await page.goto(route);expect(response?.status()).toBe(200);await page.waitForLoadState('networkidle');await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('h1')).toBeVisible();
 await page.locator('main details').evaluateAll(elements=>elements.forEach(element=>(element as HTMLDetailsElement).open=true));
 const images=page.locator('main img:visible');for(let i=0;i<await images.count();i++){const image=images.nth(i);await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)).toBe(true);}
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);expect(overflow).toBe(false);expect(errors).toEqual([]);
});}
test('critical journey: Home → Work → Atlas → Contact',async({page})=>{
 await page.goto('');await(await workLink(page)).click();await expect(page).toHaveURL(/\/work\/$/);await page.locator('[data-study=atlas][data-project]').click();await expect(page).toHaveURL(/\/projects\/atlas\/$/);await expect(page.getByRole('heading',{level:1})).toContainText('Atlas');await page.locator('.next-action a').click();await expect(page).toHaveURL(/\/contact\/\?project=Atlas$/);await expect(page.locator('#project')).toHaveValue('Strategy / systems');
});
test('mobile Menu → About → Journal → complete essay',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('');await page.locator('[data-mobile-menu] summary').click();await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'About',exact:true}).click();await expect(page).toHaveURL(/\/about\/$/);await page.locator('[data-mobile-menu] summary').click();await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Journal',exact:true}).click();await page.locator('.journal-card .text-link').first().click();await expect(page.locator('.prose')).toBeVisible();expect((await page.locator('.prose').innerText()).split(/\s+/).length).toBeGreaterThan(350);
});
test('filters change visible cards, history and reload state',async({page})=>{
 await page.goto('work/');const counts:{[key:string]:number}={all:3,strategy:1,identity:1,research:1,web:2,product:1};
 for(const [name,count]of Object.entries(counts)){await page.locator(`[data-filter=${name}]`).click();await expect(page.locator('[data-project]:visible')).toHaveCount(count);await expect(page.locator('#filter-status')).toContainText(`${count} route`);for(const hidden of await page.locator('[data-project][hidden]').all())expect(await hidden.boundingBox()).toBeNull();}
 await page.reload();await expect(page.locator('[data-project]:visible')).toHaveCount(1);await page.locator('[data-filter=all]').click();await expect(page.locator('[data-project]:visible')).toHaveCount(3);await page.goBack();await expect(page.locator('[data-filter=product]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-project]:visible')).toHaveCount(1);
});
test('recommendation is local, explained and shareable',async({page})=>{
 await page.goto('');await page.locator('[data-intent=product]').click();const panel=page.locator('[data-recommendation=product]');await expect(panel).toBeVisible();await expect(panel).toContainText('Threshold');await expect(page).toHaveURL(/intent=product/);await page.reload();await expect(panel).toBeVisible();await panel.getByRole('link',{name:'Explore Threshold →'}).click();await expect(page).toHaveURL(/\/projects\/threshold\/$/);
});
test('comparison has useful snap states and keyboard operation',async({page})=>{
 await page.goto('projects/atlas/');await page.locator('[data-compare-snap="0"]').click();const range=page.locator('.compare-range');await expect(range).toHaveValue('0');await expect(page.locator('.comparison-stage .after')).toHaveCSS('clip-path','inset(0px 100% 0px 0px)');await range.focus();await page.keyboard.press('End');await expect(range).toHaveValue('100');await expect(range).toHaveAttribute('aria-valuetext','After design');await page.locator('[data-compare-snap="50"]').click();await expect(range).toHaveValue('50');
});
test('decision map changes the relevant artifact and explanation',async({page})=>{
 await page.goto('projects/atlas/');const buttons=page.locator('[data-diagram-node]');for(let i=0;i<await buttons.count();i++){const button=buttons.nth(i);await button.click();await expect(button).toHaveAttribute('aria-pressed','true');const id=await button.getAttribute('aria-controls');await expect(page.locator('#'+id)).toBeVisible();await expect(page.locator('[data-diagram-panel]:visible')).toHaveCount(1);}
});
test('search finds a real project and navigates into it',async({page})=>{
 await page.goto('');await page.locator('[data-command-open]').click();await page.locator('#command-input').fill('Atlas');const result=page.locator('#search-results a').filter({hasText:'Atlas'}).first();await expect(result).toBeVisible({timeout:20000});await result.click();await expect(page).toHaveURL(/\/projects\/atlas\/$/);
});
test('search failure leaves navigation usable and empty input clears stale results',async({page})=>{
 await page.route('**/pagefind/**',route=>route.abort());await page.goto('');await page.locator('[data-command-open]').click();await page.locator('#command-input').fill('workflow');await expect(page.locator('#search-status')).toContainText('temporarily unavailable');await expect(page.locator('#command-results a')).toHaveCount(8);await page.locator('#command-input').fill('');await expect(page.locator('#search-results a')).toHaveCount(0);await page.locator('#command-results').getByRole('link',{name:'Work',exact:true}).click();await expect(page).toHaveURL(/\/work\/$/);
});
test('theme survives navigation and reload',async({page})=>{
 await page.emulateMedia({colorScheme:'light'});await page.goto('');await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.goto('work/');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('no JavaScript: reading, menu and comparison stay usable',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(baseURL!);await expect(page.locator('h1')).toBeVisible();await expect(page.locator('h1')).toHaveCSS('opacity','1');await page.locator('[data-mobile-menu] summary').click();await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Work',exact:true}).click();await expect(page.locator('[data-project]:visible')).toHaveCount(3);await page.locator('[data-project][data-study=atlas]').click();await expect(page.locator('[data-comparison-fallback]')).toBeVisible();await expect(page.locator('[data-diagram-panel]:visible')).toHaveCount(4);await context.close();
});
test('production release identity matches expected commit',async({request,baseURL})=>{
 const response=await request.get(new URL('release.json',baseURL!).href);expect(response.ok()).toBe(true);const release=await response.json();expect(release.pages).toHaveLength(routes.length);if(process.env.EXPECTED_RELEASE_SHA)expect(release.commit).toBe(process.env.EXPECTED_RELEASE_SHA);expect(release.base).toBe(new URL(baseURL!).pathname);
});
test('unconfigured contact is explicit and can save a local brief',async({page})=>{
 await page.goto('contact/');const endpoint=await page.locator('#contact-form').getAttribute('data-endpoint');test.skip(Boolean(endpoint),'This build has a real endpoint; delivery must be validated separately by the owner.');await expect(page.locator('[data-contact-unavailable]')).toBeVisible();await expect(page.locator('[data-contact-submit]')).toBeDisabled();await page.locator('#message').fill('A clearer project workflow for the people on our team.');const download=page.waitForEvent('download');await page.locator('[data-download-brief]').click();expect((await download).suggestedFilename()).toBe('quiet-compass-project-brief.txt');await expect(page.locator('#form-status')).toContainText('Nothing has been sent');
});
test('contact validation, failure recovery, success and duplicate prevention (mocked)',async({page})=>{
 const endpoint='https://contact.example.test/contact';let count=0;let fail=true;
 await page.route(endpoint,async route=>{count++;await new Promise(resolve=>setTimeout(resolve,250));await route.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify({ok:!fail})});});
 await page.goto('contact/');await page.evaluate(url=>{const form=document.querySelector<HTMLFormElement>('#contact-form')!;form.dataset.endpoint=url;document.querySelector<HTMLButtonElement>('[data-contact-submit]')!.disabled=false;},endpoint);
 await page.locator('[data-contact-submit]').click();await expect(page.locator('#form-errors')).toBeFocused();await expect(page.locator('#email')).toHaveAttribute('aria-invalid','true');expect(count).toBe(0);
 await page.locator('#name').fill('Test reviewer');await page.locator('#email').fill('reviewer@example.test');await page.locator('#message').fill('This is a mocked quality test, not an actual inquiry.');await page.locator('[data-contact-submit]').click();await expect(page.locator('[data-contact-submit]')).toBeDisabled();await expect(page.locator('#form-status')).toContainText('could not confirm');await expect(page.locator('#message')).toHaveValue('This is a mocked quality test, not an actual inquiry.');fail=false;await page.locator('[data-contact-submit]').click();await expect(page.locator('#form-status')).toContainText('Message sent');await expect(page.locator('#message')).toHaveValue('');expect(count).toBe(2);
});
