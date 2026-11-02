// AHOS private chats: end-to-end encrypted (ECDH P-256 + AES-GCM), username/phone lookup, star ticks, edit/delete, read-receipt switch, voice + files
(()=>{
const api=window.AHOS_API;if(!api)return;
const C=window.AHOS_CFG||{},S_=crypto.subtle,te=s=>new TextEncoder().encode(s),td=b=>new TextDecoder().decode(b);
const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)},ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
Object.assign(D,{x_dt:['محادثات خاصة مشفرة','Private encrypted chats'],x_dn:['مشفرة من طرف لطرف — محدش يقراها غيركم','End-to-end encrypted — only you two can read'],x_dsu:['اختار يوزر (حروف إنجليزي وأرقام و . _ من 3 لـ 20)','Choose a username (a-z, 0-9, . _ ; 3–20)'],x_dtk:['اليوزر ده مستخدم','Username taken'],x_dq:['يوزر أو رقم موبايل','Username or phone'],x_dnf:['مش لاقيه','Not found'],x_dm:['اكتب رسالة','Message'],x_dedit:['تعديل','Edit'],x_dme:['حذف عندي','Delete for me'],x_dall:['حذف عند الطرفين','Delete for everyone'],x_ddel:['🚫 الرسالة اتحذفت','🚫 Message deleted'],x_dold:['🔒 رسالة قديمة (جهاز تاني)','🔒 Old message (other device)'],x_ded:['معدّلة','edited'],x_drr:['إيصال القراءة','Read receipts'],x_drec:['🎙 بيسجل… اضغط تاني للإرسال','🎙 Recording… tap again to send'],x_dnew:['رسالة جديدة','New message']});
const st=document.createElement('style');st.textContent='.dmb{background:#000;border-radius:var(--r,22px);padding:10px;display:flex;flex-direction:column;gap:8px;min-height:50vh}.bb{max-width:82%;padding:8px 12px;border-radius:16px;background:#1f2937;color:#e5e7eb;word-break:break-word;font-size:15px}.bb.me{margin-inline-start:auto;background:#bfe3ff;color:#000}.bb .in{display:flex;gap:6px;justify-content:flex-end;font-size:11px;opacity:.8;margin-top:2px;align-items:center}.stz{letter-spacing:-3px;font-size:14px;color:#1d4ed8}.stz .d{opacity:.3}.stz.sn{color:#000}.mk{background:#374151;border-radius:10px;padding:6px;display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.mk .chip{color:#fff}#mic.on{background:#ef4444;color:#fff}';document.head.appendChild(st);
let PEER=null,CID='',MSGS=[],MENU=0,SK={},MB={},REC=null,busy=0,GO=0;
const cidOf=u=>[api.uid(),u].sort().join('_');

// crypto
const gen=async()=>{const k=await S_.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);L.set('ek',{priv:await S_.exportKey('jwk',k.privateKey),pub:await S_.exportKey('jwk',k.publicKey)})};
const shared=async pub=>{const e=L.get('ek'),pr=await S_.importKey('jwk',e.priv,{name:'ECDH',namedCurve:'P-256'},false,['deriveKey']),pu=await S_.importKey('jwk',JSON.parse(pub),{name:'ECDH',namedCurve:'P-256'},false,[]);return S_.deriveKey({name:'ECDH',public:pu},pr,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])};
const ce=async(k,by)=>{const iv=crypto.getRandomValues(new Uint8Array(12));return b64(iv)+'.'+b64(new Uint8Array(await S_.encrypt({name:'AES-GCM',iv},k,by)))};
const cd=async(k,s)=>{const[i,c]=s.split('.');return new Uint8Array(await S_.decrypt({name:'AES-GCM',iv:ub64(i)},k,ub64(c)))};
const kf=async c=>SK[c.uid+c.k]||(SK[c.uid+c.k]=await shared(c.k));

// data
const fetchM=async cid=>{const j=await api.fs('GET','/dm/'+cid+'/m?orderBy=id%20desc&pageSize=60');return((j&&j.documents)||[]).map(d=>({...api.dec(d),_i:d.name.split('/').pop()})).reverse()};
const open=async(c,docs)=>{const k=await kf(c);return Promise.all(docs.map(async m=>{if(m.de)return{...m,del:1};try{return{...m,p:JSON.parse(td(await cd(k,m.c)))}}catch(e){return{...m,old:1}}}))};
const prev=m=>m.del?'🚫':m.old?'🔒':m.p.t!==undefined?m.p.t:m.p.k=='a'?'🎙':m.p.k=='i'?'🖼️':m.p.k=='v'?'🎬':'📎';
const ping=u=>api.fs('PATCH','/inbox/'+u+'?updateMask.fieldPaths='+api.uid(),api.enc({[api.uid()]:Date.now()})).catch(()=>{});
const mark=(cid,docs,to,other)=>{let n=0;for(const m of docs)if(m.f!==api.uid()&&m.st<to){n++;api.fs('PATCH','/dm/'+cid+'/m/'+m._i+'?updateMask.fieldPaths=st',api.enc({st:to})).catch(()=>{})}if(n)ping(other)};
const upConv=(c,list,cur)=>{const cs=L.get('dms',[]),i=cs.findIndex(x=>x.uid==c.uid),last=list[list.length-1],ls=L.get('lsn',{})[cidOf(c.uid)]||0,
o={...(cs[i]||{}),...c,last:last?prev(last):'',ts:last?last.id:(cs[i]||{}).ts||Date.now(),un:cur?0:list.filter(m=>m.f!==api.uid()&&m.id>ls&&!m.del).length};if(i<0)cs.push(o);else cs[i]=o;cs.sort((a,b)=>b.ts-a.ts);L.set('dms',cs)};
const sync_=async(u,notify)=>{const c=L.get('dms',[]).find(x=>x.uid==u)||await(async()=>{const d=await api.fs('GET','/dir/i_'+u);if(!d)return null;const f=api.dec(d);return{uid:u,n:f.n,k:f.k}})();if(!c)return;
const cid=cidOf(u),docs=await fetchM(cid),list=await open(c,docs),cur=!!(PEER&&V.s=='dmc'&&PEER.uid==u),fresh=docs.filter(m=>m.f!==api.uid()&&m.st==0).length;
if(cur){MSGS=list;L.set('dm_'+cid,list)}
mark(cid,docs,cur&&L.get('rr',1)?2:1,u);upConv(c,list,cur);
if(cur){const l=L.get('lsn',{});l[cid]=Date.now();L.set('lsn',l)}
else if(notify&&fresh){const ub=L.get('ub',{});ub.chat=(ub.chat||0)+fresh;L.set('ub',ub);api.show&&api.show('AHOS · '+c.n,'🔒 '+t('x_dnew'))}
render()};
const dmPoll=async()=>{if(!L.get('me',null)||document.hidden||!L.get('in',0)||busy)return;busy=1;
try{const d=await api.fs('GET','/inbox/'+api.uid());if(!d)return;const f=api.dec(d),ib=L.get('ib',{}),first=!L.get('ibf',0);
for(const u in f){if(u=='_i'||f[u]<=(ib[u]||0))continue;ib[u]=f[u];await sync_(u,!first)}L.set('ib',ib);L.set('ibf',1)}catch(e){}finally{busy=0}};
setInterval(dmPoll,8000);setTimeout(dmPoll,5000);

// setup + lookup + open
A.dm=()=>{V={p:'sec',s:'dm'};render();dmPoll()};
A.dmsetup=async()=>{const u=$('#du').value.trim().toLowerCase(),e=$('#msg');if(!/^[a-z0-9._]{3,20}$/.test(u))return e.textContent=t('x_dsu');e.textContent='…';
try{if(!L.get('ek'))await gen();const pr=await api.fs('GET','/profiles/'+api.uid()),ph=pr?api.dec(pr).p:'',pub=JSON.stringify(L.get('ek').pub),ex=await api.fs('GET','/dir/u_'+u);
if(ex&&api.dec(ex).uid!==api.uid())return e.textContent=t('x_dtk');
const rec=api.enc({uid:api.uid(),n:L.get('name',''),k:pub});await api.fs('PATCH','/dir/u_'+u,rec);await api.fs('PATCH','/dir/i_'+api.uid(),rec);if(ph)await api.fs('PATCH','/dir/p_'+ph,rec);
L.set('me',{u,ph});render()}catch(x){e.textContent=String(x.message||x)}};
A.dfind=async()=>{const q=$('#dq').value.trim().toLowerCase(),e=$('#msg');if(!q)return;const dgt=q.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s+-]/g,''),id=/^01\d{9}$/.test(dgt)?'p_'+dgt:'u_'+q.replace(/^@/,'');e.textContent='…';
try{const d=await api.fs('GET','/dir/'+id);if(!d)return e.textContent=t('x_dnf');const f=api.dec(d);if(f.uid==api.uid())return e.textContent=t('x_dnf');
const cs=L.get('dms',[]);if(!cs.find(x=>x.uid==f.uid)){cs.unshift({uid:f.uid,n:f.n,k:f.k,last:'',ts:Date.now(),un:0});L.set('dms',cs)}A.dmo({u:f.uid})}catch(x){e.textContent=String(x.message||x)}};
A.dmo=async d=>{const c=L.get('dms',[]).find(x=>x.uid==d.u);if(!c)return;PEER=c;CID=cidOf(c.uid);MENU=0;MSGS=L.get('dm_'+CID,[]);V={p:'sec',s:'dmc'};GO=1;
const l=L.get('lsn',{});l[CID]=Date.now();L.set('lsn',l);const ub=L.get('ub',{});ub.chat=0;L.set('ub',ub);render();
try{const x=await api.fs('GET','/dir/i_'+c.uid);if(x){const f=api.dec(x),cs=L.get('dms',[]),i=cs.findIndex(y=>y.uid==c.uid);cs[i]={...cs[i],n:f.n,k:f.k};L.set('dms',cs);PEER=cs[i]}}catch(e){}
sync_(c.uid,false).catch(()=>{})};

// send / edit / delete
const put_=async p=>{try{const id=Date.now(),c=await ce(await kf(PEER),te(JSON.stringify(p)));await api.fs('PATCH','/dm/'+CID+'/m/'+id,api.enc({id,f:api.uid(),c,st:0,de:0,ed:0}));ping(PEER.uid);await sync_(PEER.uid,false)}catch(e){toast(String(e.message||e))}};
A.dmsend=async()=>{const i=$('#dmt'),v=i.value.trim();if(!v||!PEER)return;i.value='';await put_({t:v})};
A.dmedit=async d=>{const m=MSGS.find(x=>x.id==d.i);if(!m||!m.p||m.p.t===undefined)return;const n=prompt(t('x_dedit'),m.p.t);MENU=0;if(!n||!n.trim())return render();
const c=await ce(await kf(PEER),te(JSON.stringify({t:n.trim()})));await api.fs('PATCH','/dm/'+CID+'/m/'+m._i+'?updateMask.fieldPaths=c&updateMask.fieldPaths=ed',api.enc({c,ed:1})).catch(()=>{});ping(PEER.uid);sync_(PEER.uid,false)};
A.dmdel=async d=>{const m=MSGS.find(x=>x.id==d.i);if(!m)return;MENU=0;await api.fs('PATCH','/dm/'+CID+'/m/'+m._i+'?updateMask.fieldPaths=c&updateMask.fieldPaths=de',api.enc({c:'',de:1})).catch(()=>{});ping(PEER.uid);sync_(PEER.uid,false)};
A.dmhide=d=>{const h=L.get('hid',[]);h.push(+d.i);L.set('hid',h);MENU=0;render()};
A.dmenu=d=>{MENU=MENU==d.i?0:+d.i;render()};
A.dmrr=()=>{L.set('rr',L.get('rr',1)?0:1);render()};

// files + voice (encrypted before upload; the key travels inside the encrypted message)
const sendF=async(blob,name,k)=>{if(!C.cloud||String(C.cloud).startsWith('PUT_'))return toast('Cloudinary ✖');if(blob.size>9e6)return toast('≤ 9MB');
try{toast('⬆ …');const fk=await S_.generateKey({name:'AES-GCM',length:256},true,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await S_.encrypt({name:'AES-GCM',iv},fk,await blob.arrayBuffer())),fd=new FormData();
fd.append('file',new Blob([ct]),'x.bin');fd.append('upload_preset',C.preset);
const j=await(await fetch(`https://api.cloudinary.com/v1_1/${C.cloud}/raw/upload`,{method:'POST',body:fd})).json();if(!j.secure_url)throw(j.error||'upload');
await put_({k,u:j.secure_url,fk:b64(new Uint8Array(await S_.exportKey('raw',fk))),iv:b64(iv),m:blob.type,n:name})}catch(e){toast('❌ '+(e.message||e))}};
A.dmatt=()=>$('#dmf').click();
document.addEventListener('change',async e=>{if(e.target.id!='dmf'||!e.target.files[0])return;const f=e.target.files[0],m=f.type;await sendF(f,f.name,m.startsWith('image/')?'i':m.startsWith('video/')?'v':m.startsWith('audio/')?'a':'f');e.target.value=''});
A.dmmic=async()=>{if(REC){REC.stop();return}try{const s=await navigator.mediaDevices.getUserMedia({audio:true}),ch=[],mr=new MediaRecorder(s);REC=mr;mr.ondataavailable=e=>ch.push(e.data);
mr.onstop=async()=>{s.getTracks().forEach(x=>x.stop());REC=null;const b=$('#mic');if(b)b.classList.remove('on');await sendF(new Blob(ch,{type:mr.mimeType||'audio/webm'}),'voice.webm','a')};mr.start();$('#mic').classList.add('on');toast(t('x_drec'))}catch(e){toast('🎙 ✖')}};
const media=(m,u)=>m.p.k=='i'?`<img src="${u}" style="max-width:100%;border-radius:10px">`:m.p.k=='v'?`<video src="${u}" controls playsinline style="max-width:100%;border-radius:10px"></video>`:m.p.k=='a'?`<audio src="${u}" controls style="max-width:100%"></audio>`:`<a class=chip style="color:inherit" href="${u}" download="${esc(m.p.n||'file')}">📄 ${esc(m.p.n||'file')}</a>`;
const hyd=async()=>{for(const el of document.querySelectorAll('[data-mid]')){const m=MSGS.find(x=>x.id==el.dataset.mid);if(!m||!m.p||!m.p.u)continue;
try{let u=MB[m.id];if(!u){const ct=new Uint8Array(await(await fetch(m.p.u)).arrayBuffer()),k=await S_.importKey('raw',ub64(m.p.fk),'AES-GCM',false,['decrypt']),pt=await S_.decrypt({name:'AES-GCM',iv:ub64(m.p.iv)},k,ct);u=MB[m.id]=URL.createObjectURL(new Blob([pt],{type:m.p.m||'application/octet-stream'}))}el.outerHTML=media(m,u)}catch(e){el.textContent='⚠'}}};

// views
const stars=m=>{let s=m.st||0;if(!L.get('rr',1)&&s>1)s=1;return `<span class="stz ${s==2?'sn':''}">★<span class="${s>=1?'':'d'}">★</span></span>`};
const body=m=>m.del?`<i>${t('x_ddel')}</i>`:m.old?`<i>${t('x_dold')}</i>`:m.p.t!==undefined?esc(m.p.t):MB[m.id]?media(m,MB[m.id]):`<div data-mid=${m.id}>⏳ ${esc(m.p.n||'')}</div>`;
const av=(n,s)=>`<div class=av style="width:${s}px;height:${s}px;font-size:${s*.4}px">${esc((n||'?')[0]).toUpperCase()}</div>`;
const dmV=()=>{const me=L.get('me',null);
if(!me)return `<div class=w>${hd('🔒 '+t('x_dt'))}<div class=c><b>${t('x_dsu')}</b><input id=du class=mono style="margin-top:10px" autocapitalize=off><div class=e id=msg></div><button class=b data-a=dmsetup>${t('en')}</button></div></div>`;
return `<div class=w>${hd('🔒 '+t('x_dt'))}<div class=c><div class=row><div style="flex:1"><b>@${esc(me.u)}</b><div class=m>${t('x_dn')}</div></div><button class="chip ${L.get('rr',1)?'on':''}" data-a=dmrr>${t('x_drr')}</button></div></div><div class=c><div class=row><input id=dq class=mono placeholder="${t('x_dq')}" style="margin:0" autocapitalize=off><button class="b s" data-a=dfind>🔍</button></div><div class=e id=msg style="margin:6px 0 0"></div></div>${L.get('dms',[]).map(c=>`<div class="c row" data-a=dmo data-u="${esc(c.uid)}">${av(c.n,44)}<div style="flex:1;min-width:0"><b>${esc(c.n)}</b><div class=m style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.last||'🔒')}</div></div>${c.un?`<span class=bdg style="position:static">${c.un}</span>`:''}</div>`).join('')}</div>`};
const dmcV=()=>{const hid=L.get('hid',[]),me=api.uid();
return `<div class=w><div class=row><button class=chip data-a=dm>${lang=='ar'?'→':'←'}</button>${av(PEER.n,40)}<div style="flex:1;min-width:0"><b>${esc(PEER.n)}</b><div class=m>🔒 ${t('x_dn')}</div></div></div>
<div class=dmb>${MSGS.filter(m=>!hid.includes(m.id)).map(m=>{const mine=m.f===me,tx=!m.del&&m.p&&m.p.t!==undefined;return `<div class="bb ${mine?'me':''}" data-a=dmenu data-i=${m.id}>${body(m)}<div class=in>${m.ed&&!m.del?t('x_ded'):''}<span>${new Date(m.id).toLocaleTimeString(lang=='ar'?'ar-EG':'en-GB',{hour:'2-digit',minute:'2-digit'})}</span>${mine&&!m.del?stars(m):''}</div>${MENU==m.id?`<div class=mk>${mine&&tx?`<button class=chip data-a=dmedit data-i=${m.id}>✏️ ${t('x_dedit')}</button>`:''}<button class=chip data-a=dmhide data-i=${m.id}>🗑 ${t('x_dme')}</button>${mine&&!m.del?`<button class=chip data-a=dmdel data-i=${m.id}>🚫 ${t('x_dall')}</button>`:''}</div>`:''}</div>`}).join('')||`<div class=m style="margin:auto">🔒 ${t('x_dn')}</div>`}</div>
<input type=file id=dmf hidden><div class=row style="position:sticky;bottom:calc(76px + env(safe-area-inset-bottom,0px));background:var(--bg);padding:8px 0;z-index:3"><button class=chip data-a=dmatt>📎</button><input id=dmt placeholder="${t('x_dm')}" style="margin:0"><button class=chip id=mic data-a=dmmic>🎙</button><button class="b s" data-a=dmsend>➤</button></div></div>`};
const vs=views.sec;views.sec=()=>{if(V.s=='dm')return dmV();if(V.s=='dmc'&&PEER)return dmcV();let h=vs();if(V.s=='chat')h=h.replace('</h2></div>',`</h2></div><button class="b g" data-a=dm>🔒 ${t('x_dt')}</button>`);return h};
const r4=render;render=()=>{const dr=($('#dmt')||{}).value;r4();if(dr&&$('#dmt'))$('#dmt').value=dr;if(V.s=='dmc'){hyd();if(GO){GO=0;setTimeout(()=>scrollTo(0,document.body.scrollHeight),60)}}};
})();
