/* __QC_BUILD__ is replaced by postbuild with the exact release fingerprint. */
const VERSION = '__QC_BUILD__';
const BASE = new URL('./', self.location).pathname;
const PREFIX = 'qc:' + BASE + ':';
const CACHE = PREFIX + VERSION;
const shell = ['', 'work/', 'about/', 'journal/', 'contact/', 'icon.svg'].map(path => BASE + path);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(shell.map(async url => { try { const response = await fetch(url, { cache: 'reload' }); if (response.ok) await cache.put(url, response); } catch {} }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
const offline = () => new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline — Quiet Compass</title><body><main><h1>This page is not saved offline yet.</h1><p>Reconnect to open it. Previously visited pages may still be available.</p><a href="' + BASE + '">Return to Quiet Compass</a></main></body></html>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  // Release metadata and search indexes must not be pinned to an older cached deployment.
  if (url.pathname.endsWith('/release.json') || url.pathname.includes('/pagefind/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = request.mode === 'navigate' ? new Request(url.origin + url.pathname) : request;
    const hit = await cache.match(key);
    const hashedAsset = url.pathname.includes('/_astro/');
    if (hit && hashedAsset) return hit;
    try {
      const response = await fetch(request, request.mode === 'navigate' ? { cache: 'no-cache' } : undefined);
      if (response.status >= 500 && hit) return hit;
      if (response.ok && response.type !== 'opaque') event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
      return response;
    } catch { return hit || (request.mode === 'navigate' ? offline() : Response.error()); }
  })());
});
