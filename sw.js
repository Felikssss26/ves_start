// Весёлые старты — офлайн-кэш. При изменении файлов приложения увеличьте номер версии V.
const V='ves-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./lib/jszip.min.js','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(V);
  await c.addAll(SHELL);
  await Promise.all(CDN.map(u=>fetch(u,{mode:'cors'}).then(r=>{if(!r.ok)throw 0;return c.put(u,r)}).catch(()=>{})));
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V)await caches.delete(k);
  await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(r.mode==='navigate'){                       // страница: сначала сеть (чтобы приходили обновления), без сети — из кэша
      try{const n=await fetch(r);if(n.ok)c.put('./index.html',n.clone());return n}
      catch(_){return (await c.match('./index.html'))||Response.error()}
    }
    const hit=await c.match(r);if(hit)return hit;   // остальное: сначала кэш
    try{const n=await fetch(CDN.includes(r.url)?new Request(r.url,{mode:'cors'}):r);if(n.ok)c.put(r,n.clone());return n}
    catch(_){return Response.error()}
  })());
});
