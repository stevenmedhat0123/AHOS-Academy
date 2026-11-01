// AHOS classroom: honor board, attendance by class code, one device per account
(()=>{
const api=window.AHOS_API;if(!api)return;
Object.assign(D,{x_hn:['لوحة الشرف','Honor board'],x_hp:['نشر / تحديث اللوحة','Publish / update'],x_at:['الحضور','Attendance'],x_ac:['كود الحصة','Class code'],x_as:['ابدأ الحصة','Start class'],x_am:['المدة بالدقايق','Minutes'],x_ar:['سجّل حضوري','Mark me present'],x_aok:['اتسجل حضورك ✓','You are marked present ✓'],x_abad:['الكود غلط أو الوقت خلص أو اتسجلت قبل كده','Wrong code, time is up, or already marked'],x_aw:['حاضرين','Present'],x_bl:['الحساب ده مربوط بجهاز تاني — كلم المالك لفك الربط','This account is linked to another device — ask the owner to unlink it'],x_rd:['فك ربط الجهاز','Unlink device']});
S.push(['honor','🏆','لوحة الشرف','Honor board','',''],['att','✋','الحضور','Attendance','','']);
const hm=ms=>new Date(ms).toLocaleTimeString(lang=='ar'?'ar-EG':'en-GB',{hour:'2-digit',minute:'2-digit'});

// honor board: owner publishes the top 10 by quiz average; students read it
const loadB=async()=>{try{const d=await api.fs('GET','/config/board');if(d){const f=api.dec(d);L.set('board',{l:JSON.parse(f.j),t:f.t})}}catch(e){}render()};
A.hpub=async()=>{try{const j=await api.fs('GET','/results?pageSize=300'),rows=((j&&j.documents)||[]).map(d=>api.dec(d)).map(r=>{const sc=Object.entries(r).filter(e=>/^q\d+$/.test(e[0])).map(e=>e[1]);return{n:r.n,a:sc.length?Math.round(sc.reduce((x,y)=>x+y,0)/sc.length):-1,c:sc.length}}).filter(r=>r.a>=0).sort((x,y)=>y.a-x.a||y.c-x.c).slice(0,10);
await api.fs('PATCH','/config/board',api.enc({j:JSON.stringify(rows),t:Date.now()}));L.set('board',{l:rows,t:Date.now()});toast('✓');render()}catch(e){toast(String(e.message||e))}};
const honorV=()=>{const b=L.get('board',{l:[]}).l||[],md=['🥇','🥈','🥉'];
return `<div class=w>${hd('🏆 '+t('x_hn'))}${own()?`<button class="b g" data-a=hpub>🔄 ${t('x_hp')}</button>`:''}${b.length?b.map((r,i)=>`<div class="c row"><span style="font-size:26px;width:34px;text-align:center">${md[i]||i+1}</span><b style="flex:1">${esc(r.n)}</b><span class=tag style="font-size:15px">${r.a}%</span></div>`).join(''):'<div class=c style="text-align:center;padding:30px">—</div>'}</div>`};

// attendance: owner opens a class with a 4-digit code; the server rule checks code + time, one mark per student
let AT=null,ADUR=10,AL=[];
const loadA=async()=>{if(!own()){render();return}try{const d=await api.fs('GET','/config/att');AT=d?api.dec(d):null;if(AT){const j=await api.fs('GET','/att?pageSize=300');AL=((j&&j.documents)||[]).map(x=>api.dec(x)).filter(x=>x.t>=AT.st&&x.code==AT.code)}}catch(e){}render()};
A.ad=d=>{ADUR=+d.m;render()};A.ref=loadA;
A.as=async()=>{const code=String(Math.floor(1000+Math.random()*9000)),now=Date.now();try{await api.fs('PATCH','/config/att',api.enc({code,st:now,until:now+ADUR*6e4}));AT={code,st:now,until:now+ADUR*6e4};AL=[];render()}catch(e){toast(String(e.message||e))}};
A.ar=async()=>{const code=$('#ac').value.trim(),e=$('#msg');if(!code)return;e.textContent='…';
try{await api.fs('PATCH','/att/'+code+'_'+api.uid(),api.enc({code,n:L.get('name','')||'-',t:Date.now()}));const l=L.get('attl',[]);l.unshift(Date.now());L.set('attl',l.slice(0,30));e.style.color='#22c55e';e.textContent=t('x_aok')}catch(x){e.style.color='';e.textContent=t('x_abad')}};
const attV=()=>{const left=AT?Math.max(0,AT.until-Date.now()):0;
if(own())return `<div class=w>${hd('✋ '+t('x_at'))}<div class=c><div class=m>${t('x_am')}</div><div class=row style="flex-wrap:wrap;gap:8px;margin:10px 0">${[5,10,20,30,60].map(m=>`<button class="chip ${ADUR==m?'on':''}" data-a=ad data-m=${m}>${m}</button>`).join('')}</div><button class=b data-a=as>▶ ${t('x_as')}</button></div>${AT?`<div class=c style="text-align:center"><div class=m>${t('x_ac')}</div><div class=mono style="font:900 52px ui-monospace,Menlo,monospace;letter-spacing:8px;color:var(--ac)">${esc(AT.code)}</div><div class=m>${left?Math.ceil(left/6e4)+' min':'⏹'} · ${t('x_aw')}: ${AL.length}</div><button class=chip data-a=ref style="margin-top:8px">🔄</button></div>${AL.map(r=>`<div class="c row" style="padding:10px 14px"><b style="flex:1">${esc(r.n||'-')}</b><span class=m>${hm(r.t)}</span></div>`).join('')}`:''}</div>`;
return `<div class=w>${hd('✋ '+t('x_at'))}<div class=c><input id=ac class=mono inputmode=numeric placeholder="${t('x_ac')}"><div class=e id=msg></div><button class=b data-a=ar>✔ ${t('x_ar')}</button></div>${L.get('attl',[]).slice(0,10).map(x=>`<div class=c style="padding:10px 14px">✅ ${new Date(x).toLocaleString(lang=='ar'?'ar-EG':'en-GB')}</div>`).join('')}</div>`};
setInterval(()=>{if(V.p=='sec'&&V.s=='att'&&own()&&AT&&!document.hidden)loadA()},8000);
const vs=views.sec;views.sec=()=>V.s=='honor'?honorV():V.s=='att'?attV():vs();
const ao=A.open;A.open=d=>{ao(d);if(d.s=='honor')loadB();if(d.s=='att')loadA()};

// one device per account: first device that checks in is locked in; the owner can unlink from the students list
const DV=()=>{let d=L.get('dev','');if(!d){d=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random());L.set('dev',d)}return d};
let chkd='';
const chk=async()=>{const u=api.uid();if(!L.get('in',0)||own()||!u||chkd==u)return;chkd=u;
try{const r=await api.fs('GET','/devices/'+u);if(!r)await api.fs('PATCH','/devices/'+u,api.enc({d:DV(),t:Date.now()}));L.set('blk',r&&api.dec(r).d!==DV()?1:0);render()}catch(e){chkd=''}};
setInterval(chk,15000);setTimeout(chk,3500);
const lo=A.logout;A.logout=()=>{chkd='';L.set('blk',0);lo()};
A.rdev=async d=>{await api.fs('DELETE','/devices/'+d.u).catch(()=>{});toast('✓')};
const st=document.createElement('style');st.textContent='body.blk #nav{display:none}';document.head.appendChild(st);
const r5=render;render=()=>{r5();const b=L.get('blk',0)&&!own();document.body.classList.toggle('blk',!!b);if(b)$('#app').innerHTML=`<div class=w><div class=logo>📵</div><div class=c style="text-align:center"><b>${t('x_bl')}</b></div><button class="b g" data-a=logout>${t('lo')}</button></div>`};
})();
