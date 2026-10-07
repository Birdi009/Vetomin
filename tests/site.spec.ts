import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['','work/','about/','journal/','contact/','projects/atlas/','projects/fieldnote/','projects/threshold/','journal/calm-can-feel-alive/','journal/decisions-not-screens/','journal/reduced-motion/','search/','colophon/','privacy/'];

test('@smoke published release and every generated resource resolve',async({request,baseURL},info)=>{
  test.skip(info.project.name!=='desktop','One full HTTP crawl per build');test.setTimeout(180000);
  const response=await request.get(new URL('release.json',baseURL).href);expect(response.status()).toBe(200);const release=await response.json();
  if(process.env.EXPECTED_BUILD_SHA)expect(release.sha).toBe(process.env.EXPECTED_BUILD_SHA);
  expect(release.routes.length).toBeGreaterThanOrEqual(14);expect(release.checkedReferences).toBeGreaterThan(100);
  for(const path of [...release.routes,...release.resources]){const r=await request.get(new URL(path,baseURL).href);expect(r.status(),path).toBe(200);if(path.endsWith('.js'))expect(r.headers()['content-type'],path).toMatch(/javascript/);if(/\.(avif|webp|png)$/.test(path))expect(r.headers()['content-type'],path).toMatch(/^image\//);}
});

test('@smoke complete mobile and desktop visitor journey',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('');await page.locator('#arrival .actions a[href="#work"]').click();await expect(page).toHaveURL(/#work$/);
  await page.locator('[data-project]').filter({hasText:'Atlas /'}).click();await expect(page).toHaveURL(/\/projects\/atlas\/$/);
  await expect(page.getByRole('heading',{level:1})).toContainText('Atlas');
  await page.getByRole('link',{name:'Before & after',exact:true}).click();await page.getByRole('button',{name:'After',exact:true}).click();await expect(page.locator('[data-compare-status]')).toContainText('complete redesigned');
  await page.getByRole('button',{name:'Bring context closer',exact:true}).click();await expect(page.locator('[data-decision-title]')).toHaveText('Bring context closer');
  await page.getByRole('link',{name:'Prepare a project note →',exact:true}).click();await expect(page).toHaveURL(/contact\/\?project=Atlas$/);
  await expect(page.locator('#project')).toHaveValue('Strategy / systems');
  await page.locator('#message').fill('A test draft that remains local to this browser.');await page.getByRole('button',{name:'Prepare a local draft'}).click();await expect(page.locator('[data-draft-preview]')).toHaveValue(/test draft/);await expect(page.locator('#form-status')).toContainText('Nothing has been sent');expect(errors).toEqual([]);
});

test('@smoke explicit mobile Menu reaches About and Journal',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('');const menu=page.locator('.mobile-menu');await menu.locator('summary').click();await menu.getByRole('link',{name:'About',exact:true}).click();await expect(page).toHaveURL(/\/about\/$/);await menu.locator('summary').click();await menu.getByRole('link',{name:'Journal',exact:true}).click();await expect(page).toHaveURL(/\/journal\/$/);await page.getByRole('link',{name:'Calm can still feel alive',exact:true}).click();await expect(page.locator('article.prose')).toContainText('Give the response a job');
});

test('@smoke filters change visible cards and survive reload',async({page})=>{
  await page.goto('work/');for(const [filter,count]of [['identity',1],['research',1],['web',2],['all',3]] as const){await page.getByRole('button',{name:filter,exact:true}).click();await expect(page.locator('[data-project]:visible')).toHaveCount(count);await expect(page.locator('#filter-status')).toContainText(`${count} route`);for(const card of await page.locator('[data-project][hidden]').all())expect(await card.boundingBox()).toBeNull();}
  await page.getByRole('button',{name:'identity',exact:true}).click();await page.reload();await expect(page.locator('[data-project]:visible')).toHaveCount(1);
});

test('@smoke local recommendations are actionable and shareable',async({page})=>{
  await page.goto('');await page.getByRole('button',{name:'I need product design',exact:false}).click();await expect(page.locator('[data-recommend-title]')).toHaveText('Start with Threshold');await expect(page).toHaveURL(/intent=product/);await page.reload();await expect(page.locator('[data-recommend-title]')).toHaveText('Start with Threshold');await page.locator('[data-recommend-link]').click();await expect(page).toHaveURL(/\/projects\/threshold\/$/);
});

test('@smoke Pagefind search reaches the selected project',async({page})=>{
  await page.goto('');await page.locator('[data-command-open]').first().click();await page.locator('#command-input').fill('Atlas');await expect(page.locator('#search-status')).toContainText('result',{timeout:15000});const result=page.locator('#command-results a[href*="/projects/atlas/"]').first();await expect(result).toBeVisible();await result.click();await expect(page).toHaveURL(/\/projects\/atlas\//);
});

test('search failure retains understandable navigation',async({page})=>{
  await page.route('**/pagefind/**',route=>route.abort());await page.goto('');await page.locator('[data-command-open]').click();await page.locator('#command-input').fill('Atlas');await expect(page.locator('#search-status')).toContainText('temporarily unavailable',{timeout:15000});await page.locator('#command-results').getByRole('link',{name:'Work',exact:true}).click();await expect(page).toHaveURL(/\/work\/$/);
});

test('@smoke theme persists and repeated shortcuts restore focus',async({page})=>{
  await page.goto('');await page.locator('[data-theme-toggle]').click();const theme=await page.locator('html').getAttribute('data-theme');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme',theme!);await expect(page.locator('h1')).toBeVisible();await page.locator('[data-command-open]').focus();await page.keyboard.press('Control+k');await page.keyboard.press('Control+k');await page.keyboard.press('Escape');await expect(page.locator('[data-command-open]')).toBeFocused();
});

test('@smoke every page reflows and every image loads',async({page},info)=>{
  test.setTimeout(180000);await page.emulateMedia({reducedMotion:'reduce'});const widths=[320,360,375,390,393,430,768,820,844,1024,1280,1440,1480,1920];
  for(const path of routes){const r=await page.goto(path);expect(r?.status(),path).toBe(200);for(const width of widths){await page.setViewportSize({width,height:width===844?390:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${path} at ${width}px`).toBeLessThanOrEqual(1);}
    for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth),{message:`Image failed on ${path}`}).toBeGreaterThan(0);}
    if(['','projects/atlas/','contact/'].includes(path)){await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:info.outputPath(`${path.replaceAll('/','-')||'home'}-390.png`),fullPage:true});}
  }
});

test('@smoke no-JavaScript reading and mobile navigation remain usable',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();for(const path of ['','work/','projects/atlas/','contact/']){await page.goto(path);await expect(page.locator('h1')).toBeVisible();expect(await page.locator('main').innerText()).not.toBe('');}await page.goto('');await page.locator('.mobile-menu summary').click();await page.locator('.menu-sheet').getByRole('link',{name:'Work',exact:true}).click();await expect(page).toHaveURL(/\/work\/$/);await expect(page.locator('[data-project]:visible')).toHaveCount(3);await context.close();
});

test('light and dark accessibility across routes and open controls',async({page})=>{
  test.setTimeout(180000);await page.emulateMedia({reducedMotion:'reduce'});for(const path of routes){await page.goto(path);for(const theme of ['light','dark']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations,`${path} ${theme}`).toEqual([]);}}
  await page.goto('');await page.locator('[data-command-open]').click();expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});await page.locator('.mobile-menu summary').click();expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('comparison keyboard operation and text alternative',async({page})=>{
  await page.goto('projects/atlas/');const range=page.locator('input[type=range]');await range.focus();await range.press('End');await expect(range).toHaveValue('100');await range.press('Home');await expect(range).toHaveValue('0');await page.getByText('Comparison explained without dragging',{exact:true}).click();await expect(page.getByRole('link',{name:'Open the full before image'})).toBeVisible();
});

test.describe('offline reliability',()=>{test.use({serviceWorkers:'allow'});test('visited pages remain readable offline and recover online',async({page,context},info)=>{test.skip(info.project.name!=='desktop','Service worker lifecycle checked once');await page.goto('');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForLoadState('networkidle');await context.setOffline(true);await page.goto('');await expect(page.locator('h1')).toBeVisible();await context.setOffline(false);await page.goto('work/');await expect(page.locator('[data-project]')).toHaveCount(3);});});
