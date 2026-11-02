// AHOS shell: organized home (grouped + search), bottom navigation, More/settings page, page transitions
(()=>{
Object.assign(D,{x_gl:['تعلّم','Learn'],x_gc:['تواصل','Connect'],x_gt:['أدواتي','My tools'],x_srch:['ابحث في الأقسام','Search sections'],x_more:['المزيد','More'],x_hm:['الرئيسية','Home'],x_cht:['الدردشة','Chat'],x_nbt:['الإشعارات','Alerts'],x_acc:['الحساب','Account'],x_set:['الإعدادات','Settings'],x_th:['الوضع الفاتح / الداكن','Light / Dark']});
const GR=[['x_gl',['files','hw','quiz','games','videos']],['x_gc',['live','chat','notif']],['x_gt',['grades','pay','board','look','honor','att']]];
const st=document.createElement('style');st.textContent=`
button{-webkit-tap-highlight-color:transparent}.c{transition:transform .15s}.c[data-a]:active,.mr:active{transform:scale(.97)}
.pg{animation:pg .25s ease-out}@keyframes pg{from{opacity:0;transform:translateY(8px)}}
.hero2{background:linear-gradient(135deg,color-mix(in srgb,var(--ac) 42%,transparent),color-mix(in srgb,var(--ac2) 42%,transparent))}
.av{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;font:900 24px Cairo,sans-serif;color:#fff;background:linear-gradient(135deg,var(--ac),var(--ac2));box-shadow:0 0 22px var(--glow);flex:none}
.nm{font:900 22px Cairo,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:14px;padding-top:12px;border-top:1px solid var(--bd);text-align:center}.stats b{display:block;font-size:20px}.stats span{font-size:12px;color:var(--mut)}.warn{color:#f87171}
.gt{font-weight:800;font-size:13px;color:var(--mut);margin:8px 4px 0;display:flex;align-items:center;gap:8px}.gt::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--ac)}
.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:10px}.tg .t{min-height:98px;padding:12px;font-size:13px}.tg .ic{width:40px;height:40px;font-size:19px}
.sq{margin:0;border-radius:999px;padding:12px 18px}
.mr{width:100%;font:inherit;color:inherit;cursor:pointer;text-align:start}
#nav{position:fixed;left:0;right:0;bottom:0;z-index:9;display:flex;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));background:color-mix(in srgb,var(--bg) 94%,transparent);border-top:1px solid var(--bd)}
#nav button{flex:1;background:none;border:0;color:var(--mut);font:700 11px Cairo,sans-serif;display:grid;gap:2px;justify-items:center;position:relative;cursor:pointer}#nav button.on{color:var(--ac)}#nav .i{font-size:22px}
.hasnav .w{padding-bottom:96px}.hasnav .lcp{bottom:calc(84px + env(safe-area-inset-bottom,0px))}.hasnav #toast{bottom:calc(92px + env(safe-area-inset-bottom,0px))}`;
document.head.appendChild(st);
let NAV=0;
const pnm=id=>{const x=S.find(r=>r[0]==id);return x?x[lang=='ar'?2:3]:id};

views.home=()=>{
const a=L.get('att',[]),td=new Date().toDateString();if(!a.includes(td)){a.push(td);L.set('att',a)}
const g=L.get('i_grades',[]).map(x=>x.s||0).concat(Object.entries(L.get('res',{})).filter(e=>/^q\d+$/.test(e[0])).map(e=>e[1])),avg=g.length?Math.round(g.reduce((q,x)=>q+x,0)/g.length):null,sx=sess(),left=sx?Math.max(0,Math.ceil((sx.x-Date.now())/864e5)):0,ub=L.get('ub',{}),nv=L.get('name','')||t(own()?'ro':'rs');
const stars=Array.from({length:5},(_,i)=>`<span style="opacity:${avg!==null&&i<Math.round(avg/20)?1:.25}">★</span>`).join('');
const tile=id=>S.find(r=>r[0]==id)?`<div class="c t" data-a=open data-s=${id}>${ub[id]?`<span class=bdg>${ub[id]}</span>`:''}<div class=ic>${S.find(r=>r[0]==id)[1]}</div><b>${pnm(id)}</b></div>`:'';
const grp=(k,ids)=>`<div class=gt>${t(k)}</div><div class=tg>${ids.map(tile).join('')}${k=='x_gt'&&own()?`<div class="c t" data-a=ownerp><div class=ic>👑</div><b>${t('own2')}</b></div>`:''}</div>`;
return `<div class=w><div class="c hero2"><div class=row><div class=av>${esc((nv[0]||'A').toUpperCase())}</div><div style="flex:1;min-width:0"><div class=m>${t('hi')}</div><div class=nm>${esc(nv)}</div></div><span class=tag>${own()?'👑 '+t('ro'):'🎓 '+t('rs')}</span></div><div style="margin-top:10px;font-size:20px;color:#fde68a">${stars}</div><div class=stats><div><b>${a.length}</b><span>${t('att')}</span></div><div><b>${avg===null?'—':avg}</b><span>${t('avg')}</span></div><div><b class="${!own()&&left<=3?'warn':''}">${own()?'∞':left}</b><span>${t('left')} (${t('day')})</span></div></div></div><input id=sq class=sq placeholder="🔍 ${t('x_srch')}">${GR.map(q=>grp(q[0],q[1])).join('')}</div>`};

const row=(ic,tx,act,ex='')=>`<button class="c row mr" data-a=${act}${ex}><div class=ic style="width:40px;height:40px;font-size:19px">${ic}</div><b style="flex:1">${tx}</b><span class=m>›</span></button>`;
const moreV=()=>{const sx=sess(),nv=L.get('name','')||t(own()?'ro':'rs');
return `<div class=w>${hd('☰ '+t('x_more'))}<div class=c><div class=row><div class=av>${esc((nv[0]||'A').toUpperCase())}</div><div><b>${esc(nv)}</b><div class=m>${own()?'👑 '+t('ro'):sx?t('en2')+': '+dt(sx.x):''}</div></div></div></div>
<div class=gt>${t('x_set')}</div>${row('✨',pnm('look'),'open',' data-s=look')}${row('🌐',lang=='ar'?'English':'عربي','lang')}${row('🌗',t('x_th'),'theme')}${A.snd?row('🔊',t('x_snd')+' '+(L.get('snd',1)?'ON':'OFF'),'snd'):''}
<div class=gt>${t('x_acc')}</div>${own()?row('👑',t('own2'),'ownerp'):''}${row('💳',pnm('pay'),'open',' data-s=pay')}${row('🚪',t('lo'),'logout')}<div class=m style="text-align:center;margin-top:8px">AHOS · build ${window.AHOS_BUILD||'?'}</div></div>`};
const vs=views.sec;views.sec=()=>V.s=='more'?moreV():vs();

const ob=A.back;A.back=()=>{NAV=1;ob()};const oo=A.open;A.open=d=>{NAV=1;oo(d)};
A.nav=d=>{NAV=1;navigator.vibrate&&navigator.vibrate(8);if(d.k=='home')ob();else if(d.k=='more'){V={p:'sec',s:'more'};render()}else oo({s:d.k})};
document.addEventListener('input',e=>{if(e.target.id!='sq')return;const q=e.target.value.trim().toLowerCase();document.querySelectorAll('#app .t').forEach(b=>b.style.display=!q||b.textContent.toLowerCase().includes(q)?'':'none')});

const r2=render;render=()=>{r2();const ok=['home','sec','owner'].includes(V.p)&&!$('#lk');document.body.classList.toggle('hasnav',ok);let n=$('#nav');
if(!ok){if(n)n.remove();return}
if(!n){n=document.createElement('div');n.id='nav';document.body.appendChild(n)}
const ub=L.get('ub',{}),tot=Object.values(ub).reduce((p,c)=>p+c,0),cur=V.p=='home'?'home':V.p=='sec'?V.s:'';
n.innerHTML=[['home','🏠','x_hm'],['chat','💬','x_cht'],['notif','🔔','x_nbt'],['more','☰','x_more']].map(k=>`<button class="${cur==k[0]?'on':''}" data-a=nav data-k=${k[0]}><span class=i>${k[1]}</span>${t(k[2])}${k[0]=='notif'&&tot?`<span class=bdg style="top:-2px;inset-inline-end:22%">${tot}</span>`:''}</button>`).join('');
if(NAV){const w=document.querySelector('#app>.w');if(w)w.classList.add('pg');NAV=0}};
render();
})();
