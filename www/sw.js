// AHOS service worker — build 2026-11-02-2
// online = always the newest files from GitHub Pages, offline = last cached copy. Every build changes this file, so phones pick up the update and reload by themselves.
const BUILD='2026-11-02-2';
const V='ahos-cache';
const SHELL=["./", "build.js", "class.js", "cloud.js", "dm.js", "extra.js", "hw.js", "icon-192.png", "icon-512.png", "icon-maskable.png", "index.html", "manifest.webmanifest", "notify.js", "pdfdb.js", "quiz.js", "shell.js", "upload.js", "config.js", "uploads-config.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
if(r.url.startsWith('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/')){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{caches.open(V).then(c=>c.put(r,res.clone()));return res})));return}
if(new URL(r.url).origin!==location.origin)return;
e.respondWith(fetch(r.url,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r.url,cp))}return res}).catch(()=>caches.match(r.url).then(m=>m||caches.match('index.html'))))});
