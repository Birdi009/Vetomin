import {test,expect} from '@playwright/test';
import {routes,widths} from './routes';
for(const path of routes){test(`visual and reflow: ${path||'home'}`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(path);await page.waitForLoadState('networkidle');
 for(const width of widths){await page.setViewportSize({width,height:width===844?390:900});const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));expect(size.scroll,`${path} overflows at ${width}`).toBeLessThanOrEqual(size.client+1);}
 await page.setViewportSize(info.project.name==='desktop'?{width:1440,height:900}:{width:390,height:844});
 // Capture review evidence, but never confuse capture alone with a regression assertion.
 await page.screenshot({path:info.outputPath('page.png'),fullPage:true});
 if(process.env.VISUAL_BASELINES==='1')await expect(page).toHaveScreenshot({fullPage:true,maxDiffPixelRatio:.01});
});}
test('route rail stays hidden without a dedicated desktop gutter',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('');const rail=page.locator('.route-rail');
 for(const width of widths.filter(value=>value<1480)){
  await page.setViewportSize({width,height:width===844?390:844});await page.evaluate(()=>window.scrollTo(0,0));await expect(rail).toHaveCSS('display','none');await expect(rail).toBeHidden();expect(await rail.boundingBox()).toBeNull();
  if(width===390||width===844)await page.screenshot({path:info.outputPath(`route-rail-${width}.png`)});
  await page.evaluate(()=>window.scrollTo(0,700));await expect(rail).toBeHidden();
 }
});
test('route rail only appears in a non-overlapping wide-screen gutter',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('');for(const width of [1480,1920]){await page.setViewportSize({width,height:1080});const rail=page.locator('.route-rail');await expect(rail).toBeVisible();const a=await rail.boundingBox();const b=await page.locator('#arrival .hero').boundingBox();expect(a!.x+a!.width+16).toBeLessThanOrEqual(b!.x);}
});
test('route rail removal leaves mobile actions and navigation usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('');const brand=await page.locator('.brand').first().boundingBox();const trigger=await page.locator('[data-command-open]').boundingBox();expect(brand!.x+brand!.width).toBeLessThanOrEqual(trigger!.x);
 await page.locator('#arrival .actions a[href="#work"]').click();await expect(page).toHaveURL(/#work$/);await page.locator('[data-command-open]').click();await expect(page.locator('#command-palette')).toBeVisible();await expect(page.locator('#command-results').getByRole('link',{name:'Work',exact:true})).toBeVisible();await page.locator('[data-command-close]').click();await expect(page.locator('#command-palette')).toBeHidden();
});
test('comfortable mobile controls and dark mode',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.goto('');for(const selector of ['[data-command-open]','[data-theme-toggle]','[data-mobile-menu] summary']){const box=await page.locator(selector).boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);}
 await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.screenshot({path:info.outputPath('home-dark.png'),fullPage:true});
});
