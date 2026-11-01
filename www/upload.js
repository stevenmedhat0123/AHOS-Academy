// AHOS uploads: owner uploads video/PDF/images from the phone (Cloudinary), students watch/read inside the app
(()=>{
const C=window.AHOS_CFG||{},api=window.AHOS_API,up=()=>C.cloud&&!String(C.cloud).startsWith('PUT_')&&C.preset;
let UP=null,VW=null,PREV='files';
const guess=u=>/youtu\.be|youtube\.com/.test(u)?{k:'yt'}:/\/video\/upload\/|\.(mp4|webm|mov|m3u8)(\?|$)/i.test(u)?{k:'video'}:/\.(jpe?g|png|webp|gif)(\?|$)/i.test(u)?{k:'img'}:/^https?:/.test(u)?{k:'link'}:{k:'file'};
const kind=r=>r.k||guess(r.l||'').k;

// pick + upload with progress
A.pick=()=>{const f=$('#fu');if(f)f.click()};
document.addEventListener('change',e=>{if(e.target.id!='fu'||!e.target.files[0])return;const f=e.target.files[0],x=new XMLHttpRequest(),fd=new FormData(),say=s=>{const u=$('#up');if(u)u.textContent=s};
fd.append('file',f);fd.append('upload_preset',C.preset);
x.open('POST',`https://api.cloudinary.com/v1_1/${C.cloud}/auto/upload`);
x.upload.onprogress=ev=>{if(ev.lengthComputable)say(`⬆ ${Math.round(ev.loaded/ev.total*100)}% — ${f.name}`)};
x.onload=()=>{try{const j=JSON.parse(x.responseText);if(j.error)throw j.error;
const k=j.resource_type=='video'?'video':j.resource_type=='raw'?'file':j.format=='pdf'?'pdf':'img';
UP={url:j.secure_url,k,p:j.pages||0,name:f.name,title:f.name.replace(/\.[^.]+$/,'')};
const l=$('#li'),ti=$('#ti');if(l)l.value=UP.url;if(ti&&!ti.value)ti.value=UP.title;say('✅ '+f.name)}catch(er){say('❌ '+(er.message||er))}};
x.onerror=()=>say('❌ offline');x.send(fd)});

// after "add": stamp the new item with its kind (+ page count for PDFs)
const oa=A.add;A.add=async()=>{const s=V.s,ti=(($('#ti')||{}).value||'').trim(),l=(($('#li')||{}).value||'').trim(),u=UP;await oa();
if(!l||s=='grades'||s=='chat')return;const it=L.get('i_'+s,[])[0];if(!it||it.t!==ti||it.l!==l)return;
const g=u&&u.url==l?u:guess(l);UP=null;
if(api){await api.fs('PATCH','/s_'+s+'/'+it.id+'?updateMask.fieldPaths=k&updateMask.fieldPaths=p',api.enc({k:g.k,p:g.p||0})).catch(()=>{});api.pull(['i_'+s])}
else{it.k=g.k;if(g.p)it.p=g.p;L.set('i_'+s,L.get('i_'+s,[]));render()}};

// in-app viewer
const ytid=u=>(u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)||[])[1];
A.view=d=>{const it=L.get('i_'+V.s,[]).find(r=>r.id==d.i);if(!it)return;VW=it;PREV=V.s;V={p:'sec',s:'view'};render()};
const viewV=()=>{const r=VW||{},k=kind(r),u=esc(r.l||'');let b;
if(k=='yt')b=`<div class=c style="padding:0;overflow:hidden"><iframe style="width:100%;aspect-ratio:16/9;border:0;display:block" src="https://www.youtube-nocookie.com/embed/${ytid(r.l||'')}?rel=0&modestbranding=1" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>`;
else if(k=='video')b=`<div class=c style="padding:0;overflow:hidden"><video src="${u}" controls playsinline controlsList="nodownload" disablePictureInPicture style="width:100%;display:block;background:#000"></video></div>`;
else if(k=='pdf'&&r.p)b=Array.from({length:r.p},(_,i)=>`<img loading=lazy style="width:100%;border-radius:10px;background:#fff;min-height:200px" src="${esc((r.l||'').replace('/upload/','/upload/pg_'+(i+1)+',q_auto,w_1000/').replace(/\.pdf$/i,'.jpg'))}">`).join('');
else if(k=='img')b=`<img style="width:100%;border-radius:14px" src="${u}">`;
else b=`<a class=b style="text-decoration:none" href="${u}" target=_blank rel=noopener>${t('op')}</a>`;
return `<div class=w><div class=row><button class=chip data-a=open data-s=${PREV}>${lang=='ar'?'→':'←'} ${t('back')}</button><h2 style="font:900 18px Cairo,sans-serif;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(r.t||'')}</h2></div>${b}</div>`};

// section pages: in-app "open" buttons + upload row for the owner
const vs=views.sec;views.sec=()=>{if(V.s=='view')return viewV();let h=vs();
if(V.s!='more'&&V.s!='board'&&V.s!='look'){
for(const r of L.get('i_'+V.s,[])){if(!r.l)continue;const k=kind(r);if(!['yt','video','pdf','img'].includes(k))continue;
h=h.split(`<a class="b s" style="text-decoration:none" href="${esc(r.l)}" target=_blank rel=noopener>${t('op')}</a>`).join(`<button class="b s" data-a=view data-i=${r.id}>${k=='pdf'?'📖':k=='img'?'🖼️':'▶'} ${t('op')}</button>`)}
if(own()&&up()&&!['grades','chat','pay','notif'].includes(V.s))h=h.replace('<button class=b data-a=add>',`<input type=file id=fu hidden accept="video/*,image/*,application/pdf,.doc,.docx,.ppt,.pptx,.zip"><button class=chip data-a=pick style="margin-bottom:10px">📎 ${lang=='ar'?'رفع من الموبايل':'Upload from phone'}</button><div id=up class=m style="margin-bottom:10px"></div><button class=b data-a=add>`)}
return h};
const r3=render;render=()=>{r3();if(UP){const l=$('#li'),ti=$('#ti'),u=$('#up');if(l&&!l.value)l.value=UP.url;if(ti&&!ti.value)ti.value=UP.title;if(u&&!u.textContent)u.textContent='✅ '+UP.name}};
})();
