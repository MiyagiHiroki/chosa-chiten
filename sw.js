// 調査地点台帳 v1.1：オフライン用キャッシュ
// ・アプリ本体：通信できるときは最新版を取得し、圏外では保存済みの版で起動
// ・地理院タイル：一度表示した範囲を端末に一時保存（上限あり）
const CACHE="chosa-chiten-v1.1",TILES="chosa-chiten-tiles",TILE_MAX=2000;
const CORE=["./","index.html","manifest.webmanifest","icon-180.png","icon-512.png",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
 "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{mode:u.startsWith("http")?"no-cors":"same-origin",cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
let puts=0;
async function trim(c){if(++puts%50)return;const ks=await c.keys();for(let i=0;i<ks.length-TILE_MAX;i++)await c.delete(ks[i])}
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const u=new URL(req.url);
  if(u.hostname==="cyberjapandata.gsi.go.jp"){
    e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(req);if(hit)return hit;
      try{const r=await fetch(req);if(r.ok){c.put(req,r.clone());trim(c)}return r}catch(err){return Response.error()}}));return}
  if(u.origin===self.location.origin){
    e.respondWith(caches.open(CACHE).then(async c=>{try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}
      catch(err){return (await c.match(req,{ignoreSearch:true}))||(await c.match("index.html"))||Response.error()}}));return}
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req,{ignoreSearch:true});if(hit)return hit;
    try{const r=await fetch(req);if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r}catch(err){return Response.error()}}));
});
