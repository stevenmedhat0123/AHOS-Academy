// AHOS cloud layer: Firebase Auth (email/password) + Firestore over REST. Fill CFG; empty = local demo mode.
(()=>{
const CFG=window.AHOS_CFG||{apiKey:'PUT_API_KEY',projectId:'PUT_PROJECT_ID'};
if(CFG.apiKey.startsWith('PUT_'))return;
const K=CFG.apiKey,P=`projects/${CFG.projectId}/databases/(default)/documents`,FS='https://firestore.googleapis.com/v1/'+P,ID='https://identitytoolkit.googleapis.com/v1/accounts:';
Object.assign(D,{lg:['دخول','Log in'],rg:['إنشاء حساب جديد','Create account'],fp:['نسيت الباسورد؟','Forgot password?'],fps:['اتبعت رابط الاستعادة على الإيميل','Reset link sent to your email'],fn:['الاسم الكامل','Full name'],fa:['اسم الأب','Father’s name'],bd:['تاريخ الميلاد','Birth date'],ph:['رقم موبايلك','Your phone'],gp:['رقم موبايل ولي الأمر','Guardian phone'],em:['الإيميل','Email'],pw:['الباسورد (6 على الأقل)','Password (6+ characters)'],req:['املا كل البيانات','Fill in all fields'],bph:['رقم الموبايل غير صحيح (11 رقم)','Invalid phone number (11 digits)'],bad2:['الإيميل أو الباسورد غلط','Wrong email or password'],ss:['السماح بتصوير الشاشة والتسجيل','Allow screenshots & screen recording'],ssn:['بيتطبق في الـ APK بس','Enforced in the APK only'],stu:['الطلاب','Students'],rv:['إلغاء الاشتراك','Revoke'],cl:['اجعلني المالك','Make me the owner'],offw:['مفيش نت — العملية دي محتاجة اتصال','No internet — this needs a connection'],offl:['وضع بدون نت — آخر تحديث','Offline mode — last update'],clk:['ساعة الموبايل متغيرة، اتصل بالنت وظبط الوقت','Your phone clock looks wrong, connect and fix the time']});
let AU=L.get('auth',null),TAB='l',NOOW=false,LK=1;
let OFF=0;const er=e=>toast(e instanceof TypeError?t('offw'):String((e&&(e.message||e.status))||e));
const post=async(u,b)=>{const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}),j=await r.json();if(!r.ok)throw j.error||j;return j};
const save=j=>{AU={id:j.idToken||j.id_token,r:j.refreshToken||j.refresh_token,u:j.localId||j.user_id,e:Date.now()+(+(j.expiresIn||j.expires_in)-60)*1e3};L.set('auth',AU)};
const tok=async()=>{if(AU&&AU.e>Date.now())return AU.id;
if(AU&&AU.r){try{const r=await fetch('https://securetoken.googleapis.com/v1/token?key='+K,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+AU.r}),j=await r.json();if(r.ok){save(j);return AU.id}}catch(e){}}
throw{message:'AUTH'}};
const fs=async(m,p,b)=>{const r=await fetch(FS+p,{method:m,headers:{Authorization:'Bearer '+await tok(),'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});if(r.status==404)return null;const j=await r.json();if(!r.ok)throw j.error||j;return j};
const enc=o=>({fields:Object.fromEntries(Object.entries(o).map(([k,v])=>[k,typeof v=='number'?{doubleValue:v}:{stringValue:String(v)}]))});
const dec=d=>Object.fromEntries(Object.entries(d.fields||{}).map(([k,v])=>[k,v.doubleValue!==undefined?+v.doubleValue:v.integerValue!==undefined?+v.integerValue:v.stringValue]));
const nm=k=>['codes','profiles','users'].includes(k)?k:'s_'+k.slice(2);
const col=async n=>{const j=await fs('GET','/'+n+'?pageSize=300');return((j&&j.documents)||[]).map(d=>({...dec(d),_i:d.name.split('/').pop()})).sort((a,b)=>(b.id||b.t||0)-(a.id||a.t||0))};
const pull=async ks=>{try{await Promise.all(ks.map(async k=>{L.set(k,await col(nm(k)))}));OFF=0;L.set('syn',Date.now())}catch(e){if(e instanceof TypeError||e.message=='AUTH')OFF=1;else er(e)}render()};
const put=(c,r,id)=>fs('PATCH','/'+c+'/'+id,enc(r)).catch(er);
const dg=s=>s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,''),PH=/^01[0-25]\d{8}$/;

// screenshot / screen-recording switch: owner sets config/app.ss (1 = allowed); enforced natively by the privacy-screen plugin
const sec=async()=>{const pl=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.PrivacyScreen;if(!pl)return;try{L.get('ss',0)?await pl.disable():await pl.enable()}catch(e){}};
const pubGet=async()=>{try{const r=await fetch(FS+'/config/app?key='+K);if(r.ok)L.set('ss',dec(await r.json()).ss||0)}catch(e){}sec()};
A.ss=async()=>{const v=L.get('ss',0)?0:1;try{await fs('PATCH','/config/app',enc({ss:v}));L.set('ss',v);sec()}catch(e){er(e)}render()};

// session sync: owner flag, subscription, profile
const sync=async()=>{const ow=await fs('GET','/config/owner');L.set('own',ow&&dec(ow).uid==AU.u?1:0);L.set('claim',ow?0:1);if(L.get('own',0)){const lk=await fs('GET','/config/lock');L.set('lh',lk?dec(lk).h:'')}
const us=await fs('GET','/users/'+AU.u),u=us&&dec(us);L.set('sess',u&&u.x>Date.now()?{c:u.cid,s:u.s||Date.now(),x:u.x}:null);
const p=await fs('GET','/profiles/'+AU.u);if(p){const d=dec(p);L.set('name',d.n);L.set('wm',d.n+' · '+d.p)}
await pubGet()};
const prefetch=()=>(own()||sess())&&pull(['i_files','i_grades','i_quiz','i_games','i_videos','i_live','i_chat','i_notif'].concat(own()?['codes','profiles','users']:[]));
const enter=async()=>{L.set('in',1);await sync();LK=own()?1:0;V={p:'home'};render();prefetch()};

// auth screens
const logV=()=>`<div class=w><div class=logo>A</div><h1 style="text-align:center;font:900 34px Cairo,sans-serif;letter-spacing:3px">AHOS</h1><p class=m style="text-align:center;margin-top:-8px">${t('tag')}</p><div class=c><input id=em type=email class=mono placeholder="${t('em')}" autocapitalize=off><input id=pw type=password placeholder="${t('pw')}"><div class=e id=msg>${esc(V.e||'')}</div><button class=b data-a=login>${t('lg')}</button><button class=chip style="margin-top:12px" data-a=forgot>${t('fp')}</button></div><button class="b g" data-a=goreg>${t('rg')}</button>${tools()}</div>`;
const regV=()=>`<div class=w><div class=logo>📝</div><div class=c><b>${t('rg')}</b><input id=fn placeholder="${t('fn')}" style="margin-top:10px"><input id=fa placeholder="${t('fa')}"><div class=m style="margin-bottom:4px">${t('bd')}</div><input id=bd type=date><input id=ph type=tel class=mono placeholder="${t('ph')}"><input id=gp type=tel class=mono placeholder="${t('gp')}"><input id=em type=email class=mono placeholder="${t('em')}" autocapitalize=off><input id=pw type=password placeholder="${t('pw')}">${NOOW?`<div class=m style="margin-bottom:4px">👑 ${t('p2')}</div><input id=p2 type=password placeholder="${t('p2')}">`:''}<div class=e id=msg></div><button class=b data-a=reg>${t('rg')}</button></div><button class="b g" data-a=gol>${t('lg')}</button></div>`;
const codeV=()=>`<div class=w><div class=logo>🔑</div><div class=c><b>${t('cph')}</b><input id=code class=mono style="margin-top:10px" autocapitalize=off autocomplete=off spellcheck=false><div class=e id=msg>${esc(V.e||'')}</div><button class=b data-a=redeem>${t('en')}</button></div><button class="b g" data-a=logout>${t('lo')}</button>${tools()}</div>`;
views.gate=()=>L.get('in',0)?codeV():TAB=='r'?regV():logV();
A.goreg=async()=>{let r=null;try{r=(await fetch(FS+'/config/owner?key='+K)).status}catch(e){}NOOW=r===404;TAB='r';render()};A.gol=()=>{TAB='l';render()};
A.login=async()=>{const e=$('#msg');e.textContent='…';try{save(await post(ID+'signInWithPassword?key='+K,{email:$('#em').value.trim(),password:$('#pw').value,returnSecureToken:true}));await enter()}catch(x){e.textContent=x instanceof TypeError?t('offw'):t('bad2')}};
A.forgot=async()=>{const em=$('#em').value.trim(),e=$('#msg');if(!em)return e.textContent=t('req');try{await post(ID+'sendOobCode?key='+K,{requestType:'PASSWORD_RESET',email:em});e.textContent=t('fps')}catch(x){e.textContent=x instanceof TypeError?t('offw'):t('bad2')}};
A.reg=async()=>{const g=i=>$('#'+i).value.trim(),e=$('#msg'),f=g('fn'),fa=g('fa'),bd=g('bd'),ph=dg(g('ph')),gp=dg(g('gp')),em=g('em'),pw=$('#pw').value,p2=NOOW?$('#p2').value:'';
if(!f||!fa||!bd||!em)return e.textContent=t('req');if(NOOW&&p2.length<6)return e.textContent=t('p2');if(!PH.test(ph)||!PH.test(gp))return e.textContent=t('bph');if(pw.length<6)return e.textContent=t('pw');
e.textContent='…';try{save(await post(ID+'signUp?key='+K,{email:em,password:pw,returnSecureToken:true}));await fs('PATCH','/profiles/'+AU.u,enc({n:f,f:fa,b:bd,p:ph,g:gp,e:em,t:Date.now()}));if(NOOW){await fs('PATCH','/config/owner',enc({uid:AU.u}));await fs('PATCH','/config/lock',enc({h:await H('lock:'+p2)}))}await enter()}catch(x){e.textContent=x instanceof TypeError?t('offw'):String(x.message||x)}};
A.logout=()=>{['auth','in','own','sess','claim','lh'].forEach(k=>L.set(k,k=='in'||k=='own'||k=='claim'?0:null));AU=null;V={p:'gate'};render()};
A.claim=async()=>{try{await fs('PATCH','/config/owner',enc({uid:AU.u}));L.set('own',1);L.set('claim',0)}catch(x){er(x)}render()};

// student redeem: atomic commit (code marked used + access record) so a code works once, on any device
A.redeem=async()=>{const c=$('#code').value.trim(),e=$('#msg');e.textContent='…';
try{const id=await H('c:'+c),d=await fs('GET','/codes/'+id);if(!d)return e.textContent=t('bad');const k=dec(d),mx=k.n===undefined?1:k.n;if(mx&&k.u>=mx)return e.textContent=t('usd');
const now=Date.now(),x=now+k.d*864e5,u=AU.u;
await fs('POST',':commit',{writes:[{update:{name:P+'/codes/'+id,...enc({u:k.u+1,by:u,at:now})},updateMask:{fieldPaths:['u','by','at']},currentDocument:{updateTime:d.updateTime}},{update:{name:P+'/users/'+u,...enc({x,cid:id,s:now})}}]});
L.set('sess',{c:id,s:now,x});V={p:'home'};render()}catch(x){e.textContent=x instanceof TypeError?t('offw'):t('usd')+' / '+t('bad')}};

// owner: code generation (reuses the original generator, intercepts the save), revoke, students list
const s0=A.sync;A.sync=()=>{s0();const q=$('#nu');if(q)G.nu=q.value===''?0:Math.max(1,parseInt(q.value)||1)};A.inf=()=>{A.sync();G.nu=0;render()};
const og=A.gen;A.gen=async()=>{const ls=L.set;let n;L.set=(k,v)=>{if(k=='codes')n=v[0];else ls(k,v)};try{og()}finally{L.set=ls}
if(n){await put('codes',{c:n.c,d:n.d,t:n.t,u:0,n:G.nu===undefined?1:G.nu},await H('c:'+n.c));pull(['codes'])}};
A.delc=async d=>{await fs('DELETE','/codes/'+await H('c:'+d.c)).catch(er);pull(['codes'])};
A.rv=async d=>{await put('users',{x:0,cid:'revoked'},d.u);pull(['users'])};
const op=A.ownerp;A.ownerp=()=>{op();pull(['codes','profiles','users'])};
const vo=views.owner;views.owner=()=>{const ss=L.get('ss',0),pf=L.get('profiles',[]),us=Object.fromEntries(L.get('users',[]).map(u=>[u._i,u]));
const card=`<div class=c><div class=row><div class=ic>📵</div><div style="flex:1"><b>${t('ss')}</b><div class=m>${t('ssn')}</div></div><button class="chip ${ss?'on':''}" data-a=ss>${ss?'ON':'OFF'}</button></div></div>`;
const list=`<div class=c><b>${t('stu')} (${pf.length})</b>${pf.map(p=>{const u=us[p._i],on=u&&u.x>Date.now();return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--bd)"><div class=row><b style="flex:1">${esc(p.n)} · ${esc(p.f)}</b><span class=tag>${on?dt(u.x):'—'}</span></div><div class=m>${esc(p.b)} · ${esc(p.e)}</div><div class=row style="margin-top:8px;flex-wrap:wrap"><a class=chip href="tel:${esc(p.p)}">📞 ${esc(p.p)}</a><a class=chip href="tel:${esc(p.g)}">👨‍👩‍👦 ${esc(p.g)}</a><a class=chip target=_blank rel=noopener href="https://wa.me/20${esc(p.g.slice(1))}">💬</a>${on?`<button class=chip data-a=rv data-u="${esc(p._i)}">${t('rv')}</button>`:''}<button class=chip data-a=rdev data-u="${esc(p._i)}">📱 ${t('x_rd')}</button></div></div>`}).join('')}</div>`;
if(G.nu===undefined)G.nu=1;const nuC=`<div class=c><b>${t('nu')}</b><div class=row style="margin-top:10px"><input id=nu type=number min=1 value="${G.nu===0?'':G.nu}" placeholder="∞" style="margin:0"><button class="chip ${G.nu===0?'on':''}" data-a=inf>∞ ${t('inf')}</button></div></div>`;const cs=L.get('codes',[]);const codes=`<div class=c><b>${t('cds')} (${cs.length})</b>${cs.map(k=>{const n=k.n===undefined?1:k.n;return `<div class=row style="margin-top:12px;padding-top:12px;border-top:1px solid var(--bd)"><div style="flex:1;min-width:0"><div class=mono data-a=copy data-c="${esc(k.c)}" style="font-weight:800;cursor:pointer">${esc(k.c)}</div><div class=m>${dl(k.d)} · <span class=tag>${k.u||0}/${n||'∞'}</span></div></div><button class=chip data-a=delc data-c="${esc(k.c)}">✕</button></div>`}).join('')}</div>`;const h=vo().replace('<div class=c>',card+nuC+'<div class=c>');const i=h.lastIndexOf('<div class=c><b>'+t('cds'));return h.slice(0,i)+codes+list+'</div>'};

// content + chat
const oo=A.open;A.open=d=>{oo(d);if(d.s!='pay')pull(['i_'+d.s])};
A.add=async()=>{const ti=$('#ti').value.trim();if(!ti)return;const r={id:Date.now(),t:ti};
if(V.s=='grades'){const s=parseFloat($('#sc').value);if(isNaN(s))return;r.s=Math.max(0,Math.min(100,s))}
else{const l=$('#li').value.trim();if(l){if(!/^https?:\/\//i.test(l))return toast(t('bl'));r.l=l}}
await put('s_'+V.s,r,r.id);pull(['i_'+V.s])};
A.send=async()=>{const m=$('#ti').value.trim();if(!m)return;const r={id:Date.now(),t:m,n:L.get('name','')||t(own()?'ro':'rs'),o:own()?1:0};await put('s_chat',r,r.id);pull(['i_chat'])};
A.del=async d=>{await fs('DELETE','/s_'+V.s+'/'+d.i).catch(er);pull(['i_'+V.s])};

// owner second-password lock, live chat (cloud), code-uses strings
Object.assign(D,{p2:['الباسورد التاني للمالك (6 على الأقل)','Owner second password (6+)'],lkt:['اكتب الباسورد التاني','Enter your second password'],lks:['اعمل باسورد تاني للمالك','Create your second owner password'],nu:['عدد مرات استخدام الكود','Uses per code'],inf:['بلا نهاية','Unlimited']});
const lockV=()=>{const st=!L.get('lh','');return `<div class=w><div class=logo>🔐</div><div class=c><b>${t(st?'lks':'lkt')}</b><input id=lk type=password style="margin-top:10px"><div class=e id=msg></div><button class=b data-a=${st?'setlock':'unlock'}>${t('en')}</button></div><button class="b g" data-a=logout>${t('lo')}</button></div>`};
A.unlock=async()=>{if(await H('lock:'+$('#lk').value)===L.get('lh',''))return(LK=0,render());$('#msg').textContent=t('pbad')};
A.setlock=async()=>{const p=$('#lk').value;if(p.length<6)return $('#msg').textContent=t('p2');try{const h=await H('lock:'+p);await fs('PATCH','/config/lock',enc({h}));L.set('lh',h);LK=0;render()}catch(x){er(x)}};
A.lsend=async()=>{const q=$('#lm'),m=q.value.trim();if(!m)return;const r={id:Date.now(),t:m,n:L.get('name','')||t(own()?'ro':'rs'),o:own()?1:0};q.value='';await put('s_livechat',r,r.id);toast(t('x_ok'));if(own())pull(['i_livechat'])};
const lc0=A.lc;A.lc=()=>{lc0();if(own())pull(['i_livechat'])};
setInterval(()=>{if(V.p=='sec'&&V.s=='live'&&own()&&$('.lcp')&&!($('#lm')||{}).value)pull(['i_livechat'])},5000);
// render wrapper: lock, offline banner, student watermark
const r0=render;let HP=0;render=()=>{const n=Date.now(),mx=L.get('mx',0),bk=n<mx-36e5&&sess()&&!own();if(bk)L.set('sess',null);else L.set('mx',Math.max(n,mx));r0();if(own()&&LK)$('#app').innerHTML=lockV();if(bk){const m=$('#msg');if(m)m.textContent=t('clk')}
let w=$('#wm');if(!own()&&sess()){if(!w){w=document.createElement('div');w.id='wm';document.body.appendChild(w);w.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;opacity:.09'}const lb=L.get('wm','');if(w.dataset.l!==lb){w.dataset.l=lb;w.style.background='url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="280" height="160"><text x="10" y="100" transform="rotate(-20 10 100)" font-size="15" font-family="sans-serif" font-weight="700" fill="gray">'+esc(lb)+'</text></svg>')+'")'}}else if(w)w.remove();
let b=$('#off');if(OFF){if(!b){b=document.createElement('div');b.id='off';b.style.cssText='position:fixed;left:0;right:0;top:env(safe-area-inset-top,0px);z-index:8;text-align:center;font:700 12px Cairo,sans-serif;padding:4px;background:#b45309;color:#fff';document.body.appendChild(b)}b.textContent='📴 '+t('offl')+(L.get('syn',0)?' '+new Date(L.get('syn',0)).toLocaleString(lang=='ar'?'ar-EG':'en-GB'):'')}else if(b)b.remove()};
sec();addEventListener('online',()=>{OFF=0;render();if(L.get('in',0)&&AU)sync().then(()=>{render();prefetch()}).catch(()=>{OFF=1;render()})});addEventListener('offline',()=>{OFF=1;render()});
if(L.get('in',0)&&AU)sync().then(()=>{render();prefetch()}).catch(()=>{OFF=1;render()});else pubGet();
window.AHOS_API={fs,dec,enc,pull,uid:()=>AU&&AU.u};
render();
})();
