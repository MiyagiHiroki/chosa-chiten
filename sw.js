// 調査地点台帳：オフライン用キャッシュ（初回に通信がある状態で開くと保存されます）
const CACHE="chosa-chiten-v1";
const CORE=["./","index.html","manifest.webmanifest","icon-180.png","icon-512.png",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{mode:u.startsWith("http")?"no-cors":"same-origin"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net}))});
