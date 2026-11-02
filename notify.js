// AHOS notifications: cheap feed polling -> sound + phone notification + badges + log; FCM token for push when the app is closed
(()=>{
const api=window.AHOS_API;if(!api)return;
Object.assign(D,{x_snd:['الصوت','Sound'],x_tst:['تجربة إشعار','Test notification'],x_tb:['ده إشعار تجريبي من AHOS','This is a test from AHOS']});
const SECS=['files','grades','quiz','games','videos','live','notif','hw','chat','livechat'],P=n=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins[n];
const st=document.createElement('style');st.textContent='.bdg{position:absolute;top:10px;inset-inline-end:10px;z-index:2;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:#ef4444;color:#fff;font:700 12px Cairo,sans-serif;display:grid;place-items:center;box-shadow:0 0 12px rgba(239,68,68,.6)}';document.head.appendChild(st);
const nm=s=>s=='livechat'?t('x_lc'):(S.find(r=>r[0]==s)||[])[lang=='ar'?2:3]||s;
const ring=()=>{if(!L.get('snd',1))return;try{navigator.vibrate&&navigator.vibrate([120,60,120]);const c=new(window.AudioContext||window.webkitAudioContext)();[880,1175].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),t0=c.currentTime+i*.18;o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.4);o.start(t0);o.stop(t0+.45)})}catch(e){}};
const show=async(title,body)=>{ring();const n=P('LocalNotifications');
if(n){try{await n.schedule({notifications:[{id:Date.now()%2147483000,title,body,channelId:'ahos'}]})}catch(e){}}
else{if(window.Notification&&Notification.permission=='granted'&&navigator.serviceWorker){try{const r=await navigator.serviceWorker.getRegistration();if(r)r.showNotification(title,{body,icon:'icon-192.png',vibrate:[120,60,120]})}catch(e){}}toast(title+': '+body)}};
const news=(s,b,quiet)=>{const key=s=='livechat'?'live':s,ub=L.get('ub',{});
if(!(V.p=='sec'&&V.s==key)){ub[key]=(ub[key]||0)+1;L.set('ub',ub)}
const lg=L.get('nlog',[]);lg.unshift({id:Date.now(),t:nm(s),b:b||''});L.set('nlog',lg.slice(0,50));
if(!quiet)show('AHOS · '+nm(s),b||'')};

let RG=0,SU=0;
const setup=async()=>{const n=P('LocalNotifications');if(!n&&window.Notification&&Notification.permission=='default')try{await Notification.requestPermission()}catch(e){}
if(n){try{await n.requestPermissions();await n.createChannel({id:'ahos',name:'AHOS',description:'AHOS',importance:5,visibility:1,vibration:true})}catch(e){}}
const p=P('PushNotifications');
if(p&&!RG&&api.uid()){RG=1;try{p.addListener('registration',k=>{L.set('po',1);api.fs('PATCH','/tokens/'+api.uid(),api.enc({tk:k.value,t:Date.now()})).catch(()=>{})});const r=await p.requestPermissions();if(r.receive=='granted')await p.register()}catch(e){}}};

let busy=0,QUIET=0;
const poll=async()=>{if(busy||document.hidden||!L.get('in',0)||!(own()||sess()))return;busy=1;
if(!SU){SU=1;setup()}
try{const d=await api.fs('GET','/config/feed');if(!d)return;const f=api.dec(d),old=L.get('ft',null),ft=old||{},ks=[];
for(const s of SECS){const tt=f[s+'_t']||0;if(tt<=(ft[s]||0))continue;ft[s]=tt;if(s=='livechat'&&!own())continue;
if(old&&f[s+'_u']!==api.uid())news(s,f[s+'_n'],QUIET);ks.push('i_'+s)}
L.set('ft',ft);
if(old&&ks.length){const a=document.activeElement,typing=a&&a.tagName=='INPUT'&&a.value,kk=typing?ks.filter(k=>!(V.p=='sec'&&k=='i_'+V.s&&V.s!='chat')):ks;if(kk.length)api.pull(kk)}else if(ks.length)render()}
catch(e){}finally{busy=0}};
setInterval(poll,25000);setInterval(()=>{if(V.p=='sec'&&V.s=='chat')poll()},2500);setTimeout(poll,4000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){QUIET=L.get('po',0)?1:0;poll().then(()=>QUIET=0)}});

// owner/student writes bump the shared feed doc (1 tiny write) so everyone else gets notified
const bump=(s,title)=>api.fs('PATCH','/config/feed?'+['t','n','u'].map(k=>'updateMask.fieldPaths='+s+'_'+k).join('&'),api.enc({[s+'_t']:Date.now(),[s+'_n']:String(title).slice(0,80),[s+'_u']:api.uid()})).catch(()=>{});
const aa=A.add;A.add=async()=>{const s=V.s,ti=(($('#ti')||{}).value||'').trim();await aa();if(ti&&(L.get('i_'+s,[])[0]||{}).t===ti)bump(s,ti)};
const as=A.send;A.send=async()=>{const m=(($('#ti')||{}).value||'').trim();await as();if(m&&(L.get('i_chat',[])[0]||{}).t===m)bump('chat',m)};
const al=A.lsend;A.lsend=async()=>{const m=(($('#lm')||{}).value||'').trim();await al();if(m)bump('livechat',m)};

api.bump=bump;api.show=show;
// UI: badges on tiles, clear on open, notification log + sound switch + test
const vh=views.home;views.home=()=>{let h=vh();const ub=L.get('ub',{});for(const s in ub)if(ub[s])h=h.replace(`data-s=${s}><div class=ic>`,`data-s=${s}><span class=bdg>${ub[s]}</span><div class=ic>`);return h};
const ao=A.open;A.open=d=>{const ub=L.get('ub',{});if(ub[d.s]){ub[d.s]=0;L.set('ub',ub)}ao(d)};
const vs=views.sec;views.sec=()=>{let h=vs();if(V.s=='notif'){const top=`<div class=row style="gap:8px"><button class=chip data-a=snd>🔊 ${t('x_snd')} ${L.get('snd',1)?'ON':'OFF'}</button><button class=chip data-a=tst>🔔 ${t('x_tst')}</button></div>`+L.get('nlog',[]).map(r=>`<div class=c style="padding:12px 14px"><b>${esc(r.t)}</b><div>${esc(r.b)}</div><div class=m>${new Date(r.id).toLocaleString(lang=='ar'?'ar-EG':'en-GB')}</div></div>`).join('');h=h.replace('</h2></div>','</h2></div>'+top)}return h};
A.snd=()=>{L.set('snd',L.get('snd',1)?0:1);render()};
A.tst=async()=>{await setup();show('AHOS',t('x_tb'))};
const r7=render;render=()=>{const i=$('#ti'),v=i?i.value:'',f=!!i&&document.activeElement===i;r7();if(V.s=='chat'){const n=$('#ti');if(n&&v&&!n.value){n.value=v;if(f)n.focus()}}};
})();
