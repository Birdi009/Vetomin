import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../../public/sw.js',import.meta.url),'utf8');
const origin='https://example.test';
function harness(version='test-a',stores=new Map()){
 const listeners=new Map();let network=async()=>new Response('fresh');
 const key=input=>typeof input==='string'?new URL(input,origin).href:input.url;
 const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return{async match(request){return store.get(key(request))?.clone();},async put(request,response){store.set(key(request),response.clone());}};},
  async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);}
 };
 const self={location:new URL(origin+'/Vetomin/sw.js'),addEventListener:(name,fn)=>listeners.set(name,fn),skipWaiting:async()=>{},clients:{claim:async()=>{}}};
 vm.runInNewContext(source.replaceAll('__QC_BUILD__',version),{self,caches,URL,Request,Response,fetch:(...args)=>network(...args),Promise});
 return{stores,caches,listeners,setNetwork:fn=>network=fn,async event(name){const promises=[];listeners.get(name)({waitUntil:p=>promises.push(p)});await Promise.all(promises);},async fetch(url,mode='navigate',method='GET'){const promises=[];let result;listeners.get('fetch')({request:{url,mode,method},respondWith:p=>result=p,waitUntil:p=>promises.push(p)});if(!result)return null;const response=await result;await Promise.all(promises);return response;}};
}
test('navigation prefers network, supports offline return and online recovery',async()=>{
 const h=harness();const url=origin+'/Vetomin/work/';
 assert.equal(await(await h.fetch(url)).text(),'fresh');h.setNetwork(async()=>{throw new Error('offline');});assert.equal(await(await h.fetch(url)).text(),'fresh');
 const missing=await h.fetch(origin+'/Vetomin/not-visited/');assert.equal(missing.status,503);assert.match(await missing.text(),/not saved offline/);
 h.setNetwork(async()=>new Response('new edition'));assert.equal(await(await h.fetch(url)).text(),'new edition');
});
test('new version deletes only caches owned by this application',async()=>{
 const h=harness();await h.event('install');await h.caches.open('another-app');await h.caches.open('qc:/Elsewhere/:old');
 const next=harness('test-b',h.stores);await next.event('install');await next.event('activate');
 assert.deepEqual((await next.caches.keys()).sort(),['another-app','qc:/Elsewhere/:old','qc:/Vetomin/:test-b'].sort());
});
test('does not intercept writes, external sites, other scopes or freshness metadata',async()=>{
 const h=harness();for(const [url,mode,method]of[[origin+'/Vetomin/contact/','navigate','POST'],['https://other.test/Vetomin/','navigate','GET'],[origin+'/Other/','navigate','GET'],[origin+'/Vetomin/release.json','cors','GET'],[origin+'/Vetomin/pagefind/pagefind.js','cors','GET']])assert.equal(await h.fetch(url,mode,method),null);
});
test('hashed assets reuse cache but non-hashed resources refresh',async()=>{
 const h=harness();let count=0;h.setNetwork(async()=>new Response('version-'+ ++count));
 const hashed=origin+'/Vetomin/_astro/app.hash.js';assert.equal(await(await h.fetch(hashed,'cors')).text(),'version-1');assert.equal(await(await h.fetch(hashed,'cors')).text(),'version-1');
 const image=origin+'/Vetomin/media/atlas-after-640.webp';assert.equal(await(await h.fetch(image,'cors')).text(),'version-2');assert.equal(await(await h.fetch(image,'cors')).text(),'version-3');
});
