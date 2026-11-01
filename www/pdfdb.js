// AHOS media: the owner adds a PDF / photo / short video / audio / voice note from the phone (stored in Firestore in chunks, no extra service); students open and view inside the app
(()=>{
const api=window.AHOS_API;if(!api)return;
Object.assign(D,{x_pm:['إضافة PDF / صورة / فيديو / صوت من الموبايل','Add PDF / photo / video / audio from phone'],x_prec:['تسجيل صوت','Record voice'],x_prec2:['🎙 بيسجل… اضغط تاني للرفع','🎙 Recording… tap again to upload'],x_pbig:['الملف أكبر من 10 ميجا (للفيديوهات الكبيرة استخدم رابط يوتيوب)','Larger than 10 MB (for big videos use a YouTube link)'],x_pok:['اتضاف ✓','Added ✓'],x_pld:['بيحمّل الملف…','Loading the file…'],x_perr:['مقدرش يفتح الملف (النت؟)','Could not open the file (internet?)']});
const CH=700000,MAX=10*1048576,KS=['pdfdb','imgdb','viddb','auddb'],SEC=['files','videos','notif','games'];
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const kindOf=m=>m=='application/pdf'?'pdfdb':/^image\//.test(m||'')?'imgdb':/^video\//.test(m||'')?'viddb':/^audio\//.test(m||'')?'auddb':'';
const shrink=f=>new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{const r=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*r);c.height=Math.round(i.height*r);c.getContext('2d').drawImage(i,0,0,c.width,c.height);c.toBlob(b=>b?ok(b):no(new Error('img')),'image/jpeg',.82);URL.revokeObjectURL(u)};i.onerror=()=>no(new Error('img'));i.src=u});
const idb=(m,k,v)=>new Promise((ok,no)=>{const r=indexedDB.open('ahos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>{const s=r.result.transaction('p',m).objectStore('p'),q=m=='readonly'?s.get(k):s.put(v,k);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)};r.onerror=()=>no(r.error)});
const putChunks=async(col,id,u8)=>{const s=b64(u8),n=Math.ceil(s.length/CH);for(let i=0;i<n;i++){toast(`⬆ ${i+1}/${n}`);await api.fs('PATCH','/'+col+'/'+id+'_'+i,api.enc({d:s.slice(i*CH,(i+1)*CH)}))}return n};
const getChunks=async(col,id,n)=>{const key=col+id;try{const parts=await Promise.all(Array.from({length:n},(_,i)=>api.fs('GET','/'+col+'/'+id+'_'+i).then(d=>api.dec(d).d)));const u=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));idb('readwrite',key,u).catch(()=>{});return u}catch(e){const c=await idb('readonly',key).catch(()=>null);if(c)return c;throw e}};

// pdf.js: bundled file if present, otherwise cdnjs
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
const lib=async()=>{if(window.pdfjsLib)return pdfjsLib;try{await load('pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='pdf.worker.min.js'}catch(e){await load(CDN+'pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=CDN+'pdf.worker.min.js'}return pdfjsLib};
let PV=null,PVE=null,PREV='files';
const show=async(u8,k,mime)=>{PVE=document.createElement('div');PVE.id='pvp';PVE.style.cssText='display:flex;flex-direction:column;gap:10px';
if(k=='pdfdb'){const P=await lib(),pdf=await P.getDocument({data:u8}).promise;
const io=new IntersectionObserver(es=>es.forEach(async en=>{if(!en.isIntersecting)return;const c=en.target;io.unobserve(c);const pg=await pdf.getPage(+c.dataset.p),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(3,Math.max(c.clientWidth,300)*(devicePixelRatio||1)/v0.width)});c.width=v.width;c.height=v.height;await pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise}),{rootMargin:'600px'});
for(let i=1;i<=pdf.numPages;i++){const c=document.createElement('canvas');c.dataset.p=i;c.style.cssText='width:100%;background:#fff;border-radius:10px;aspect-ratio:auto 1/1.414';PVE.appendChild(c);io.observe(c)}}
else{const u=URL.createObjectURL(new Blob([u8],{type:mime||(k=='imgdb'?'image/jpeg':k=='auddb'?'audio/webm':'video/mp4')}));PVE.innerHTML=k=='auddb'?`<audio src="${u}" controls style="width:100%"></audio>`:k=='imgdb'?`<img src="${u}" style="width:100%;border-radius:14px">`:`<video src="${u}" controls playsinline controlsList="nodownload" style="width:100%;border-radius:14px;background:#000"></video>`}
const m=$('#pvm');if(m)m.remove();const h=$('#pvp');if(h)h.replaceWith(PVE)};
const viewBytes=async(title,get,k,mime,back)=>{PV={t:title};PVE=null;PREV=back;V={p:'sec',s:'pview'};render();try{await show(await get(),k,mime)}catch(e){const m=$('#pvm');if(m)m.textContent='⚠ '+t('x_perr')}};
Object.assign(api,{shrink,putChunks,getChunks,kindOf,viewBytes});
const pvV=()=>`<div class=w><div class=row><button class=chip data-a=open data-s=${PREV}>${lang=='ar'?'→':'←'} ${t('back')}</button><h2 style="font:900 18px Cairo,sans-serif;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(PV.t)}</h2></div><div id=pvm class=m style="text-align:center;padding:20px">⏳ ${t('x_pld')}</div><div id=pvp></div></div>`;
A.pview=d=>{const it=L.get('i_'+V.s,[]).find(r=>r.id==d.i);if(it)viewBytes(it.t,()=>getChunks('pdfs',it.id,it.n),it.k,it.m,V.s)};

// owner: pick or record -> (photos are shrunk) -> chunks + one list item
const upFile=async(f,name)=>{const sec=V.s,k=kindOf(f.type);if(!k)return;
try{if(k=='imgdb')f=await shrink(f);if(f.size>MAX)return toast(t('x_pbig'));
const ti=(($('#ti')||{}).value||'').trim()||(name=='voice.webm'?'🎙 '+new Date().toLocaleString(lang=='ar'?'ar-EG':'en-GB'):name.replace(/\.[^.]+$/,'')),id=Date.now(),n=await putChunks('pdfs',id,new Uint8Array(await f.arrayBuffer()));
await api.fs('PATCH','/s_'+sec+'/'+id,api.enc({id,t:ti,k,n,z:f.size,m:f.type||''}));
if(api.bump)api.bump(sec,ti);toast(t('x_pok'));api.pull(['i_'+sec])}catch(x){toast('❌ '+(x.message||x))}};
A.padd=()=>{const f=$('#pf');if(f)f.click()};
document.addEventListener('change',e=>{if(e.target.id!='pf'||!e.target.files[0])return;const f=e.target.files[0];e.target.value='';upFile(f,f.name)});
let REC=null;
A.prec=async()=>{if(REC){REC.stop();return}try{const s=await navigator.mediaDevices.getUserMedia({audio:true}),ch=[],mr=new MediaRecorder(s);REC=mr;mr.ondataavailable=e=>ch.push(e.data);
mr.onstop=()=>{s.getTracks().forEach(x=>x.stop());REC=null;const b=$('#rec');if(b)b.classList.remove('on');upFile(new Blob(ch,{type:mr.mimeType||'audio/webm'}),'voice.webm')};mr.start();$('#rec').classList.add('on');toast(t('x_prec2'))}catch(e){toast('🎙 ✖')}};

// delete: remove the chunks too
const od=A.del;A.del=async d=>{const it=L.get('i_'+V.s,[]).find(r=>r.id==d.i);if(it&&KS.includes(it.k))await Promise.all(Array.from({length:it.n},(_,i)=>api.fs('DELETE','/pdfs/'+it.id+'_'+i).catch(()=>{})));return od(d)};

// views
const vs=views.sec;views.sec=()=>{if(V.s=='pview'&&PV)return pvV();let h=vs();if(!SEC.includes(V.s))return h;
for(const r of L.get('i_'+V.s,[])){if(!KS.includes(r.k))continue;h=h.split(`<b style="flex:1">${esc(r.t)}</b>`).join(`<b style="flex:1">${esc(r.t)}<div class=m>${r.k=='pdfdb'?'📄':r.k=='imgdb'?'🖼️':r.k=='auddb'?'🎧':'🎬'} ${(r.z/1048576).toFixed(1)} MB</div></b><button class="b s" data-a=pview data-i=${r.id}>${r.k=='pdfdb'?'📖':r.k=='imgdb'?'🖼️':r.k=='auddb'?'🎧':'▶'} ${t('op')}</button>`)}
if(own())h=h.replace('<button class=b data-a=add>',`<input type=file id=pf hidden accept="${V.s=='videos'?'video/*':'application/pdf,image/*,audio/*,video/*'}"><button class=chip data-a=padd style="margin-bottom:10px">📎 ${t('x_pm')}</button>${V.s!='videos'?`<button class=chip id=rec data-a=prec style="margin:0 6px 10px">🎙 ${t('x_prec')}</button>`:''}<button class=b data-a=add>`);
return h};
const r6=render;render=()=>{r6();if(V.s=='pview'&&PVE){const h=$('#pvp');if(h)h.replaceWith(PVE);const m=$('#pvm');if(m)m.remove()}};
})();
