// AHOS PDFs: the owner adds a PDF from the phone (stored in Firestore in chunks, no extra service); students open and read it inside the app
(()=>{
const api=window.AHOS_API;if(!api)return;
Object.assign(D,{x_pa:['إضافة PDF من الموبايل','Add a PDF from phone'],x_pbig:['الملف أكبر من 10 ميجا','File is larger than 10 MB'],x_pok:['اتضاف ✓','Added ✓'],x_pld:['بيحمّل الملف…','Loading the file…'],x_perr:['مقدرش يفتح الملف (النت؟)','Could not open the file (internet?)']});
const CH=700000,MAX=10*1048576;
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
let PV=null,PVE=null,PREV='files';

// owner: pick a PDF -> split into chunks -> save chunks + one list item
A.padd=()=>{const f=$('#pf');if(f)f.click()};
document.addEventListener('change',async e=>{if(e.target.id!='pf'||!e.target.files[0])return;const f=e.target.files[0];e.target.value='';
if(f.size>MAX)return toast(t('x_pbig'));
const ti=(($('#ti')||{}).value||'').trim()||f.name.replace(/\.pdf$/i,''),id=Date.now();
try{const s=b64(new Uint8Array(await f.arrayBuffer())),n=Math.ceil(s.length/CH);
for(let i=0;i<n;i++){toast(`⬆ ${i+1}/${n}`);await api.fs('PATCH','/pdfs/'+id+'_'+i,api.enc({d:s.slice(i*CH,(i+1)*CH)}))}
await api.fs('PATCH','/s_files/'+id,api.enc({id,t:ti,k:'pdfdb',n,z:f.size}));
if(api.bump)api.bump('files',ti);toast(t('x_pok'));api.pull(['i_files'])}catch(x){toast('❌ '+(x.message||x))}});

// download chunks (cached on the phone for offline use)
const idb=(m,k,v)=>new Promise((ok,no)=>{const r=indexedDB.open('ahos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>{const s=r.result.transaction('p',m).objectStore('p'),q=m=='readonly'?s.get(k):s.put(v,k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)};r.onerror=()=>no(r.error)});
const getData=async it=>{try{const parts=await Promise.all(Array.from({length:it.n},(_,i)=>api.fs('GET','/pdfs/'+it.id+'_'+i).then(d=>api.dec(d).d)));
const u=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));idb('readwrite',String(it.id),u).catch(()=>{});return u}
catch(e){const c=await idb('readonly',String(it.id)).catch(()=>null);if(c)return c;throw e}};

// pdf.js: bundled with the app (build step copies it); falls back to cdnjs if the files are missing
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
const lib=async()=>{if(window.pdfjsLib)return pdfjsLib;
try{await load('pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js'}catch(e){await load(CDN+'pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=CDN+'pdf.worker.min.js'}
return pdfjsLib};
const show=async u8=>{const P=await lib(),pdf=await P.getDocument({data:u8}).promise;PVE=document.createElement('div');PVE.id='pvp';PVE.style.cssText='display:flex;flex-direction:column;gap:10px';
const io=new IntersectionObserver(es=>es.forEach(async en=>{if(!en.isIntersecting)return;const c=en.target;io.unobserve(c);
const pg=await pdf.getPage(+c.dataset.p),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(3,Math.max(c.clientWidth,300)*(devicePixelRatio||1)/v0.width)});
c.width=v.width;c.height=v.height;await pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise}),{rootMargin:'600px'});
for(let i=1;i<=pdf.numPages;i++){const c=document.createElement('canvas');c.dataset.p=i;c.style.cssText='width:100%;background:#fff;border-radius:10px;aspect-ratio:auto 1/1.414';PVE.appendChild(c);io.observe(c)}
const m=$('#pvm');if(m)m.remove();const h=$('#pvp');if(h)h.replaceWith(PVE)};
A.pview=async d=>{const it=L.get('i_'+V.s,[]).find(r=>r.id==d.i);if(!it)return;PV=it;PVE=null;PREV=V.s;V={p:'sec',s:'pview'};render();
try{await show(await getData(it))}catch(e){const m=$('#pvm');if(m)m.textContent='⚠ '+t('x_perr')}};
const pvV=()=>`<div class=w><div class=row><button class=chip data-a=open data-s=${PREV}>${lang=='ar'?'→':'←'} ${t('back')}</button><h2 style="font:900 18px Cairo,sans-serif;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(PV.t)}</h2></div><div id=pvm class=m style="text-align:center;padding:20px">⏳ ${t('x_pld')}</div><div id=pvp></div></div>`;

// delete: remove the chunks too
const od=A.del;A.del=async d=>{const it=L.get('i_'+V.s,[]).find(r=>r.id==d.i);if(it&&it.k=='pdfdb')await Promise.all(Array.from({length:it.n},(_,i)=>api.fs('DELETE','/pdfs/'+it.id+'_'+i).catch(()=>{})));return od(d)};

// views
const vs=views.sec;views.sec=()=>{if(V.s=='pview'&&PV)return pvV();let h=vs();if(V.s!='files')return h;
for(const r of L.get('i_files',[])){if(r.k!='pdfdb')continue;h=h.split(`<b style="flex:1">${esc(r.t)}</b>`).join(`<b style="flex:1">${esc(r.t)}<div class=m>📄 ${(r.z/1048576).toFixed(1)} MB</div></b><button class="b s" data-a=pview data-i=${r.id}>📖 ${t('op')}</button>`)}
if(own())h=h.replace('<button class=b data-a=add>',`<input type=file id=pf hidden accept="application/pdf"><button class=chip data-a=padd style="margin-bottom:10px">📄 ${t('x_pa')}</button><button class=b data-a=add>`);
return h};
const r6=render;render=()=>{r6();if(V.s=='pview'&&PVE){const h=$('#pvp');if(h)h.replaceWith(PVE);const m=$('#pvm');if(m)m.remove()}};
})();
