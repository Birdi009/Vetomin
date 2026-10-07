import {test,expect} from '@playwright/test';

test.use({serviceWorkers:'allow'});
test('service worker saves a visited page, survives offline reload and recovers online',async({page,context,baseURL})=>{
 await page.goto('');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 await page.reload();
 await page.waitForLoadState('networkidle');
 const heading=await page.locator('h1').innerText();
 const origin=new URL(baseURL!).origin;
 const path=new URL(baseURL!).pathname;
 await expect.poll(()=>page.evaluate(async url=>Boolean(await caches.match(url)),origin+path)).toBe(true);
 await context.setOffline(true);
 await page.reload({waitUntil:'load'});
 await expect(page.locator('h1')).toHaveText(heading);
 await expect(page.locator('[data-mobile-menu] summary')).toHaveCount(1);
 await context.setOffline(false);
 const response=await page.reload();
 expect(response?.status()).toBe(200);
 await expect(page.locator('h1')).toHaveText(heading);
 const metadata=await page.evaluate(async()=>{const response=await fetch(document.body.dataset.base+'release.json',{cache:'no-store'});return response.json();});
 if(process.env.EXPECTED_RELEASE_SHA)expect(metadata.commit).toBe(process.env.EXPECTED_RELEASE_SHA);
});
