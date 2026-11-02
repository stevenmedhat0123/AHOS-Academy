// AHOS assignments: owner posts an assignment, each student submits one file (PDF or photo), owner opens it and gives a score
(()=>{
const api=window.AHOS_API;if(!api||!api.putChunks)return;
Object.assign(D,{x_hs:['تسليم','Submit'],x_hv:['التسليمات','Submissions'],x_hdone:['تم التسليم','Submitted'],x_hno:['لسه ما سلمتش','Not submitted yet'],x_hsc:['الدرجة','Score'],x_hok:['اتسلّم ✓','Submitted ✓'],x_hnone:['مفيش تسليمات لسه','No submissions yet']});
S.push(['hw','📝','الواجبات','Assignments','لسه مفيش واجبات','No assignments yet']);
let HWID=0,HWT='',HS=null;
const icon=k=>k=='pdfdb'?'📖':k=='imgdb'?'🖼️':'📄';

// student: pick a file -> chunks (sf) + one submission doc (subs); one submission per assignment
A.hsub=d=>{HWID=d.i;const f=$('#hf');if(f)f.click()};
document.addEventListener('change',async e=>{if(e.target.id!='hf'||!e.target.files[0])return;let f=e.target.files[0];e.target.value='';const hw=HWID,k=api.kindOf(f.type);if(!k||k=='viddb'||!hw)return;
try{const fn=f.name;if(k=='imgdb')f=await api.shrink(f);if(f.size>10485760)return toast(t('x_pbig'));
const id=hw+'_'+api.uid(),n=await api.putChunks('sf',id,new Uint8Array(await f.arrayBuffer()));
await api.fs('PATCH','/subs/'+id,api.enc({hw:String(hw),u:api.uid(),n:L.get('name','')||'-',k,nn:n,z:f.size,m:f.type||'',t:Date.now(),fn}));
const m=L.get('mysubs',{});m[hw]={t:Date.now()};L.set('mysubs',m);toast(t('x_hok'));render()}catch(x){toast('❌ '+(x.message||x))}});
const loadMine=async()=>{const m=L.get('mysubs',{});try{for(const r of L.get('i_hw',[])){const d=await api.fs('GET','/subs/'+r.id+'_'+api.uid());if(d){const f=api.dec(d);m[r.id]={t:f.t,sc:f.sc}}}L.set('mysubs',m)}catch(e){}render()};

// owner: list submissions of one assignment, open, score
A.hview=async d=>{HWID=d.i;HWT=(L.get('i_hw',[]).find(r=>r.id==d.i)||{}).t||'';HS=null;V={p:'sec',s:'hws'};render();
try{const j=await api.fs('GET','/subs?pageSize=300');HS=((j&&j.documents)||[]).map(x=>({...api.dec(x),_i:x.name.split('/').pop()})).filter(x=>x.hw==String(d.i))}catch(e){HS=[]}render()};
A.hopen=d=>{const r=(HS||[]).find(x=>x._i==d.i);if(r)api.viewBytes(r.n+' — '+(r.fn||''),()=>api.getChunks('sf',r._i,r.nn),r.k,r.m,'hws')};
A.hscore=async d=>{const v=parseFloat(($('#sc_'+d.i)||{}).value);if(isNaN(v))return;try{await api.fs('PATCH','/subs/'+d.i+'?updateMask.fieldPaths=sc',api.enc({sc:Math.max(0,Math.min(100,v))}));toast('✓')}catch(e){toast(String(e.message||e))}};
const hwsV=()=>`<div class=w><div class=row><button class=chip data-a=open data-s=hw>${lang=='ar'?'→':'←'} ${t('back')}</button><h2 style="font:900 18px Cairo,sans-serif;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">📥 ${esc(HWT)}</h2></div>${HS===null?'<div class=m>…</div>':HS.length?HS.map(r=>`<div class=c><div class=row><b style="flex:1">${esc(r.n)}</b><span class=m>${esc(r.fn||'')}</span></div><div class=row style="margin-top:8px;gap:8px"><button class="b s" data-a=hopen data-i="${esc(r._i)}">${icon(r.k)} ${t('op')}</button><input id="sc_${esc(r._i)}" type=number min=0 max=100 value="${r.sc==null?'':r.sc}" placeholder="/100" style="margin:0;width:90px"><button class=chip data-a=hscore data-i="${esc(r._i)}">✔</button></div></div>`).join(''):`<div class=c style="text-align:center">${t('x_hnone')}</div>`}</div>`;

const vs=views.sec;views.sec=()=>{if(V.s=='hws')return hwsV();let h=vs();if(V.s!='hw')return h;
h=h.replace('</h2></div>','</h2></div><input type=file id=hf hidden accept="application/pdf,image/*">');
const mine=L.get('mysubs',{});
for(const r of L.get('i_hw',[])){const m=mine[r.id];
const st=own()?'':m?`<div class=m>✅ ${t('x_hdone')}${m.sc!=null?` · ${t('x_hsc')}: ${m.sc}/100`:''}</div>`:`<div class=m>⏳ ${t('x_hno')}</div>`;
const bt=own()?`<button class="b s" data-a=hview data-i=${r.id}>📥 ${t('x_hv')}</button>`:m?'':`<button class="b s" data-a=hsub data-i=${r.id}>📤 ${t('x_hs')}</button>`;
h=h.split(`<b style="flex:1">${esc(r.t)}</b>`).join(`<b style="flex:1">${esc(r.t)}${st}</b>${bt}`)}
return h};
const ao=A.open;A.open=d=>{ao(d);if(d.s=='hw'&&!own())loadMine()};
})();
