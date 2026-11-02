// AHOS quizzes: owner writes questions as text, students take timed quizzes, auto-graded; results, parent reports, expiry alert, CSV export
(()=>{
const api=window.AHOS_API;
Object.assign(D,{x_qn:['اختبار جديد','New quiz'],x_qt:['عنوان الاختبار','Quiz title'],x_qm:['المدة بالدقايق','Minutes'],x_qh:['السؤال الأول؟\n- اختيار أ\n- اختيار ب *\n- اختيار ج\n\nالسؤال التاني؟\n- ...\n\n(علامة * بعد الإجابة الصح)','First question?\n- Option A\n- Option B *\n- Option C\n\nSecond question?\n- ...\n\n(put * after the correct answer)'],x_qs:['ابدأ','Start'],x_qsub:['تسليم','Submit'],x_qsc:['درجتك','Your score'],x_qr:['النتايج والتقارير','Results & reports'],x_qe:['تصدير الطلاب CSV','Export students CSV'],x_qw:['تقرير لولي الأمر','Parent report'],x_qx:['اشتراكهم قرب يخلص','Plans ending soon'],x_qbad:['كل سؤال محتاج اختيارين على الأقل وإجابة صح واحدة بعلامة *','Each question needs 2+ options and exactly one correct answer marked *'],x_qdone:['الاختبار ده اتحل قبل كده','You already took this quiz']});
const res=()=>L.get('res',{}),TA='width:100%;background:var(--in);color:var(--tx);border:1px solid var(--bd);border-radius:14px;padding:12px;font:600 14px Cairo,sans-serif;outline:0;margin-bottom:10px';
let QZ=null,QT=0,RS=null;
const num=r=>Object.entries(r).filter(e=>/^q\d+$/.test(e[0])).map(e=>e[1]),avgOf=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
const loadRes=async()=>{if(!api||!api.uid())return;try{const d=await api.fs('GET','/results/'+api.uid());if(d){const f=api.dec(d);delete f.n;L.set('res',f)}}catch(e){}render()};
const parse=txt=>txt.split(/\n\s*\n/).map(b=>b.trim().split('\n').map(l=>l.trim()).filter(Boolean)).filter(a=>a.length).map(a=>{const o=a.slice(1).map(l=>l.replace(/^[-•]\s*/,'')),st=o.filter(x=>/\*\s*$/.test(x)).length;return{q:a[0],o:o.map(x=>x.replace(/\s*\*\s*$/,'')),c:o.findIndex(x=>/\*\s*$/.test(x)),st}});
const fmt=ms=>{const s=Math.ceil(ms/1e3);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};

// create
const newV=()=>`<div class=w>${hd('➕ '+t('x_qn'))}<div class=c><input id=qt placeholder="${t('x_qt')}"><input id=qm type=number min=1 value=10 placeholder="${t('x_qm')}"><textarea id=qq rows=12 placeholder="${esc(t('x_qh'))}" style="${TA}"></textarea><div class=e id=msg></div><button class=b data-a=qsave>${t('add')}</button></div></div>`;
A.qnew=()=>{V={p:'sec',s:'qnew'};render()};
A.qsave=async()=>{const ti=$('#qt').value.trim(),m=Math.max(1,+$('#qm').value||10),qs=parse($('#qq').value),e=$('#msg');
if(!ti||!qs.length||qs.some(q=>q.o.length<2||q.st!=1))return e.textContent=t('x_qbad');
const r={id:Date.now(),t:ti,m,k:'quiz',q:JSON.stringify(qs.map(({q,o,c})=>({q,o,c})))};
if(api){try{await api.fs('PATCH','/s_quiz/'+r.id,api.enc(r));api.bump&&api.bump('quiz',ti)}catch(x){return e.textContent=String(x.message||x)}}
else{const it=L.get('i_quiz',[]);it.unshift(r);L.set('i_quiz',it)}
V={p:'sec',s:'quiz'};if(api)api.pull(['i_quiz']);else render()};

// take
const runV=()=>`<div class=w><div class="c row" style="position:sticky;top:env(safe-area-inset-top,0px);z-index:4;background:var(--bg)"><b style="flex:1">${esc(QZ.it.t)}</b><span class=tag id=qtm style="font-size:15px">--:--</span></div>${QZ.qs.map((q,i)=>`<div class=c><b>${i+1}. ${esc(q.q)}</b>${q.o.map((o,j)=>`<button class="chip ${QZ.ans[i]===j?'on':''}" data-a=qa data-i=${i} data-j=${j} style="display:block;width:100%;text-align:start;margin-top:8px;border-radius:14px">${esc(o)}</button>`).join('')}</div>`).join('')}<button class=b data-a=qsub>${t('x_qsub')}</button></div>`;
A.qstart=d=>{const it=L.get('i_quiz',[]).find(r=>r.id==d.i);if(!it)return;if(!own()&&res()['q'+it.id]!==undefined)return toast(t('x_qdone'));
let qs;try{qs=JSON.parse(it.q)}catch(e){return}QZ={it,qs,ans:[],end:Date.now()+it.m*6e4};V={p:'sec',s:'qrun'};render();clearInterval(QT);
QT=setInterval(()=>{const l=Math.max(0,QZ.end-Date.now()),el=$('#qtm');if(el)el.textContent=fmt(l);if(!l)A.qsub()},500)};
A.qa=d=>{QZ.ans[+d.i]=+d.j;document.querySelectorAll(`[data-a=qa][data-i="${d.i}"]`).forEach(b=>b.classList.toggle('on',b.dataset.j==d.j))};
const save=async(id,sc)=>{const r=res();r['q'+id]=sc;L.set('res',r);if(!api)return;try{await api.fs('PATCH','/results/'+api.uid()+'?updateMask.fieldPaths=n&updateMask.fieldPaths=q'+id,api.enc({n:L.get('name','')||'-',['q'+id]:sc}))}catch(e){}};
A.qsub=()=>{if(!QZ||QZ.done)return;clearInterval(QT);const ok=QZ.qs.filter((q,i)=>QZ.ans[i]===q.c).length,sc=Math.round(100*ok/QZ.qs.length);QZ.sc=sc;QZ.ok=ok;QZ.done=1;if(!own())save(QZ.it.id,sc);if(V.s=='qrun'){V={p:'sec',s:'qres'};render()}};
const resV=()=>{const q=QZ;return `<div class=w>${hd(t('x_qsc'))}<div class=c style="text-align:center"><div style="font:900 56px Cairo,sans-serif;color:var(--ac)">${q.sc}%</div><div class=m>${q.ok}/${q.qs.length}</div></div>${q.qs.map((x,i)=>`<div class=c><b>${i+1}. ${esc(x.q)}</b>${x.o.map((o,j)=>`<div class=m style="margin-top:6px;${j==x.c?'color:#22c55e;font-weight:800':q.ans[i]===j?'color:#f87171':''}">${j==x.c?'✔':q.ans[i]===j?'✖':'•'} ${esc(o)}</div>`).join('')}</div>`).join('')}</div>`};

// owner: results, parent reports, expiring plans, CSV
A.qall=async()=>{V={p:'sec',s:'qall'};RS=null;render();RS=[];if(api){try{const j=await api.fs('GET','/results?pageSize=300');RS=((j&&j.documents)||[]).map(d=>({...api.dec(d),_i:d.name.split('/').pop()}))}catch(e){}}render()};
const allV=()=>{const pf=Object.fromEntries(L.get('profiles',[]).map(p=>[p._i,p])),soon=L.get('users',[]).filter(u=>u.x>Date.now()&&u.x-Date.now()<=3*864e5);
const rows=(RS||[]).map(r=>{const sc=num(r),p=pf[r._i]||{},av=avgOf(sc),nm=r.n||p.n||'-',tx=lang=='ar'?`تقرير AHOS للطالب ${nm}: عدد الاختبارات ${sc.length}، المتوسط ${av??'-'}%.`:`AHOS report for ${nm}: ${sc.length} quizzes, average ${av??'-'}%.`;
return `<div class="c row"><div style="flex:1;min-width:0"><b>${esc(nm)}</b><div class=m>${sc.length} ❓</div></div><span class=tag style="font-size:15px">${av===null?'—':av+'%'}</span>${p.g?`<a class=chip target=_blank rel=noopener href="https://wa.me/20${esc(p.g.slice(1))}?text=${encodeURIComponent(tx)}">💬 ${t('x_qw')}</a>`:''}</div>`}).join('');
return `<div class=w>${hd('📊 '+t('x_qr'))}<button class="b g" data-a=csv>⬇ ${t('x_qe')}</button>${soon.length?`<div class=c><b>⏳ ${t('x_qx')}</b>${soon.map(u=>`<div class=m style="margin-top:6px">${esc((pf[u._i]||{}).n||'-')} · ${dt(u.x)}</div>`).join('')}</div>`:''}${RS===null?'<div class=m>…</div>':rows||'<div class=c style="text-align:center">—</div>'}</div>`};
A.csv=()=>{const us=Object.fromEntries(L.get('users',[]).map(u=>[u._i,u])),rs=Object.fromEntries((RS||[]).map(r=>[r._i,r])),q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
const rows=[['name','father','birth','phone','guardian_phone','email','subscription_end','quizzes_avg','quizzes']].concat(L.get('profiles',[]).map(p=>{const sc=num(rs[p._i]||{}),u=us[p._i];return[p.n,p.f,p.b,p.p,p.g,p.e,u&&u.x>0?new Date(u.x).toISOString().slice(0,10):'',avgOf(sc)??'',sc.length]}));
const f=new File(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\n')],'ahos-students.csv',{type:'text/csv'});
if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(()=>{});else{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click()}};

// views
const vs=views.sec;views.sec=()=>{const s=V.s;if(s=='qnew')return newV();if(s=='qrun'&&QZ)return runV();if(s=='qres'&&QZ&&QZ.done)return resV();if(s=='qall')return allV();
let h=vs();if(s!='quiz')return h;
for(const r of L.get('i_quiz',[])){if(!r.q)continue;let n=0;try{n=JSON.parse(r.q).length}catch(e){}const sc=res()['q'+r.id];
h=h.split(`<b style="flex:1">${esc(r.t)}</b>`).join(`<b style="flex:1">${esc(r.t)}<div class=m>${n} ❓ · ${r.m} ⏱${sc!==undefined?` · ✔ ${sc}%`:''}</div></b><button class="b s" data-a=qstart data-i=${r.id}>▶ ${t('x_qs')}</button>`)}
if(own())h=h.replace('<div class=c><input id=ti',`<div class="c row" style="gap:8px"><button class="b s" data-a=qnew>➕ ${t('x_qn')}</button><button class="b s" data-a=qall>📊 ${t('x_qr')}</button></div><div class=c><input id=ti`);
return h};
const ao=A.open;A.open=d=>{ao(d);if(d.s=='quiz')loadRes()};

// plan-ending reminder (≤3 days), once a day
const warn=()=>{const s=sess();if(!s||own())return;const d=Math.ceil((s.x-Date.now())/864e5),td=new Date().toDateString();
if(d<=3&&d>=0&&L.get('exn','')!=td){L.set('exn',td);const m=lang=='ar'?`اشتراكك هيخلص ${d?'بعد '+d+' يوم':'النهاردة'} — اطلب كود جديد`:`Your plan ends ${d?'in '+d+' days':'today'} — get a new code`;if(api&&api.show)api.show('AHOS',m);else toast(m)}};
setTimeout(warn,6000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)warn()});
})();
