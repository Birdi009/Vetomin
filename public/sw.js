/* Replaced with the exact build identifier by scripts/verify-build.mjs. */
const VERSION='qc-v4-__BUILD__';
const ROOT=new URL(self.registration.scope).pathname;
const CACHE=`quiet-compass:${ROOT}:${VERSION}`;
const LEGACY=['quiet-compass-v2','quiet-compass-v3'];
const local=request=>{const url=new URL(request.url);return request.method==='GET'&&url.origin===self.location.origin&&url.pathname.startsWith(ROOT);};
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>(key.startsWith(`quiet-compass:${ROOT}:`)&&key!==CACHE)||LEGACY.includes(key)).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
  if(!local(event.request))return;
  const url=new URL(event.request.url);
  // Contact, search, release markers and resources with query strings always use the network.
  if(url.pathname.includes('/contact/')||url.pathname.includes('/pagefind/')||url.pathname.endsWith('/release.json')||url.search)return;
  const hashed=url.pathname.includes('/_astro/');
  const operation=(async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request);
    if(hashed&&cached)return cached;
    try{const response=await fetch(event.request,{cache:event.request.mode==='navigate'?'no-cache':'default'});if(response.ok&&response.type!=='opaque'){try{await cache.put(event.request,response.clone());const keys=await cache.keys();if(keys.length>120)await cache.delete(keys[0]);}catch{/* Quota failure must not break the response. */}}return response;}
    catch{if(cached)return cached;return new Response(event.request.mode==='navigate'?'This page has not been saved for offline reading. Reconnect to open it.':'Offline',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
  })();
  event.respondWith(operation);event.waitUntil(operation.then(()=>undefined).catch(()=>undefined));
});
