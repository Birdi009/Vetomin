import {test,expect} from '@playwright/test';
import {routes} from './routes';

test('every generated destination and responsive asset resolves over HTTP',async({page,request,baseURL},info)=>{
 test.skip(info.project.name!=='desktop','One exhaustive HTTP crawl; all browser projects separately load every page and rendered image.');
 test.setTimeout(180000);
 const base=new URL(baseURL!);
 const queue=new Map<string,string>();
 const add=(raw:string,current:string,canonicalOrigin:string,kind='resource')=>{
  if(!raw||/^(data:|mailto:|tel:)/.test(raw))return;
  const url=new URL(raw,current);
  if(url.origin!==base.origin&&url.origin!==canonicalOrigin)return;
  expect(url.pathname,`Resource leaves the configured base: ${raw}`).toMatch(new RegExp('^'+base.pathname.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  url.hash='';url.search='';url.protocol=base.protocol;url.host=base.host;queue.set(url.href,kind);
 };
 for(const route of routes){
  await page.goto(route);
  const data=await page.evaluate(()=>({canonical:(document.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href||location.href),urls:[...document.querySelectorAll<HTMLElement>('[href],[src],[srcset],[poster]')].flatMap(element=>{
   const result:string[]=[];for(const key of ['href','src','poster']){const value=element.getAttribute(key);if(value)result.push(value);}
   const srcset=element.getAttribute('srcset');if(srcset)for(const part of srcset.split(',')){const url=part.trim().split(/\s+/)[0];if(url)result.push(url);}return result;
  }),og:document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content||''}));
  const canonicalOrigin=new URL(data.canonical).origin;
  for(const raw of [...data.urls,data.og])add(raw,page.url(),canonicalOrigin);
 }
 for(const path of ['manifest.webmanifest','sw.js','pagefind/pagefind.js','release.json','sitemap-index.xml','robots.txt'])add(path,base.href,base.origin);
 const checked:string[]=[];
 for(const [url]of queue){const response=await request.get(url);expect(response.status(),url).toBe(200);checked.push(url);
  if(new URL(url).pathname.endsWith('.css')){
   const css=await response.text();const assets=[...css.matchAll(/url\([\s"']*([^\)"']+)/g)].map(match=>match[1]);
   for(const asset of assets)add(asset,url,base.origin);
  }
 }
 await info.attach('HTTP route and asset inventory',{body:JSON.stringify(checked,null,2),contentType:'application/json'});
 expect(checked.length).toBeGreaterThan(60);
});
