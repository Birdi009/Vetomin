const CACHE='quiet-compass-v3';
const SHELL=['./','./work/','./about/','./journal/','./contact/','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          if(response&&response.status===200){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreSearch:true})))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async cache=>{
      const cached=await cache.match(event.request);
      const network=fetch(event.request)
        .then(response=>{
          if(response&&response.status===200&&response.type!=='opaque')cache.put(event.request,response.clone());
          return response;
        })
        .catch(()=>null);
      return cached || await network || Response.error();
    })
  );
});
