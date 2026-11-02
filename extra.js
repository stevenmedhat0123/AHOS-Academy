// AHOS extras: look (colors/shapes), whiteboard, live chat tab
(()=>{
Object.assign(D,{x_lc:['رسايل اللايف','Live messages'],x_lr:['قراءة الرسائل','Read messages'],x_lp:['اكتب رسالتك في اللايف','Write in the live'],x_ok:['اتبعتت ✓','Sent ✓'],x_pen:['قلم','Pen'],x_hl:['تظليل','Highlight'],x_er:['ممحاة','Eraser'],x_tx:['نص','Text'],x_txp:['اكتب النص','Type your text'],x_sz:['مساحة القلم','Stroke size'],x_fz:['حجم الخط','Font size'],x_un:['تراجع','Undo'],x_cl:['مسح','Clear'],x_sv:['حفظ','Save'],x_bg:['الخلفية','Background'],x_pal:['الألوان','Colors'],x_shp:['الأشكال','Shapes'],x_cs:['شكل الكروت','Card style'],x_g:['زجاجي','Glass'],x_s:['سادة','Solid'],x_o:['حدود','Outline']});
S.push(['board','🎨','السبورة','Whiteboard','',''],['look','✨','المظهر','Look','','']);
const HUE={files:200,grades:45,quiz:270,games:320,videos:8,live:150,chat:185,notif:35,pay:130,board:25,look:300};
const st=document.createElement('style');
st.textContent=`.t{position:relative;overflow:hidden}.t::after{content:"";position:absolute;inset-inline-end:-28px;top:-28px;width:92px;height:92px;border-radius:50%;background:hsl(var(--h,200) 85% 55%/.14)}
.t .ic{background:linear-gradient(135deg,hsl(var(--h,200) 85% 56%),hsl(calc(var(--h,200) + 45) 85% 46%));color:#fff;box-shadow:0 6px 16px hsl(var(--h,200) 85% 50%/.35)}
html[data-cs=solid] .c{background:color-mix(in srgb,var(--tx) 7%,var(--bg))}html[data-cs=outline] .c{background:transparent;border-width:2px}
.sw{width:30px;height:30px;border-radius:50%;border:2px solid var(--bd);cursor:pointer;padding:0}.sw.on{outline:3px solid var(--ac);outline-offset:2px}
#cv{width:100%;aspect-ratio:3/4;touch-action:none;border-radius:var(--r,22px);border:1px solid var(--bd)}
.fab{position:fixed;top:42%;inset-inline-end:0;z-index:6;border:0;padding:14px 10px;font-size:20px;color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--ac),var(--ac2));border-start-start-radius:16px;border-end-start-radius:16px;box-shadow:0 6px 20px var(--glow)}
.lcp{position:fixed;inset-inline:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:7;max-width:536px;margin:auto;background:var(--bg)}.lcl{max-height:36vh;overflow:auto;margin:10px 0}`
+Object.entries(HUE).map(([k,h])=>`.t[data-s=${k}]{--h:${h}}`).join('')+'.t[data-a=ownerp]{--h:50}';
document.head.appendChild(st);

// look
const PAL=[['#14b8a6','#8b5cf6'],['#3b82f6','#06b6d4'],['#f97316','#ec4899'],['#22c55e','#14b8a6'],['#a855f7','#ec4899'],['#f59e0b','#ef4444'],['#f43f5e','#f59e0b'],['#94a3b8','#e2e8f0']];
const ap=()=>{const l=L.get('look',{p:0,r:22,c:0}),h=document.documentElement,p=PAL[l.p]||PAL[0];h.style.setProperty('--ac',p[0]);h.style.setProperty('--ac2',p[1]);h.style.setProperty('--glow',`color-mix(in srgb,${p[0]} 35%,transparent)`);h.style.setProperty('--r',l.r+'px');h.dataset.cs=['','solid','outline'][l.c]||''};
const upl=o=>{L.set('look',{...L.get('look',{p:0,r:22,c:0}),...o});ap();render()};
A.pal=d=>upl({p:+d.i});A.shp=d=>upl({r:+d.r});A.cst=d=>upl({c:+d.i});ap();
const lookV=()=>{const l=L.get('look',{p:0,r:22,c:0});return `<div class=w>${hd('✨ '+(lang=='ar'?'المظهر':'Look'))}<div class=c><b>${t('x_pal')}</b><div class=row style="flex-wrap:wrap;margin-top:12px;gap:10px">${PAL.map((p,i)=>`<button class="sw ${l.p==i?'on':''}" data-a=pal data-i=${i} style="width:42px;height:42px;background:linear-gradient(135deg,${p[0]},${p[1]})"></button>`).join('')}</div></div><div class=c><b>${t('x_shp')}</b><div class=row style="flex-wrap:wrap;margin-top:12px;gap:10px">${[6,14,22,34].map(r=>`<button class="chip ${l.r==r?'on':''}" data-a=shp data-r=${r} style="padding:14px 24px;border-radius:${r}px"></button>`).join('')}</div></div><div class=c><b>${t('x_cs')}</b><div class=row style="margin-top:12px;gap:8px">${['x_g','x_s','x_o'].map((k,i)=>`<button class="chip ${l.c==i?'on':''}" data-a=cst data-i=${i}>${t(k)}</button>`).join('')}</div></div></div>`};

// whiteboard
const B={tool:'pen',color:'#ffffff',w:4,fs:28,bg:'#0b1220',h:[]},COLS=['#ffffff','#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#a855f7','#ec4899','#000000'];
const C_=window.AHOS_CFG||{},pgu=()=>B.pdf.u.replace('/upload/','/upload/pg_'+B.pdf.i+',q_auto,w_1200/').replace(/\.pdf$/i,'.jpg');B.pp={};
const cv=()=>$('#cv'),keep=()=>{if(cv()){B.h.push(cv().toDataURL('image/webp',.7));if(B.h.length>12)B.h.shift()}};
const load=u=>{const c=cv();if(!c)return;const x=c.getContext('2d'),i=new Image();x.clearRect(0,0,c.width,c.height);if(u){i.onload=()=>x.drawImage(i,0,0,c.width,c.height);i.src=u}};
const mark=(sel,f)=>document.querySelectorAll(sel).forEach(b=>b.classList.toggle('on',f(b)));
A.tool=d=>{B.tool=d.t;mark('[data-a=tool]',b=>b.dataset.t==B.tool)};
A.col=d=>{B.color=d.c;$('#cc').value=d.c;mark('.sw',b=>b.dataset.c==B.color)};
A.undo=()=>{B.h.pop();load(B.h[B.h.length-1])};A.clr=()=>{B.h=[];load(null)};
A.bgt=()=>{B.bg=B.bg=='#0b1220'?'#ffffff':'#0b1220';cv().style.background=B.bg};
A.sv=()=>{const c=cv(),o=document.createElement('canvas');o.width=c.width;o.height=c.height;const x=o.getContext('2d');x.fillStyle=B.bg;x.fillRect(0,0,o.width,o.height);
const fin=()=>{x.drawImage(c,0,0);const a=document.createElement('a');a.href=o.toDataURL('image/png');a.download='ahos-board.png';a.click()};
if(B.pdf){const i=new Image();i.crossOrigin='anonymous';i.onload=()=>{const r=Math.min(o.width/i.width,o.height/i.height),w=i.width*r,h=i.height*r;x.drawImage(i,(o.width-w)/2,(o.height-h)/2,w,h);fin()};i.onerror=fin;i.src=pgu()}else fin()};
const boardV=()=>`<div class=w>${hd('🎨 '+(lang=='ar'?'السبورة':'Whiteboard'))}<div class=c style="padding:12px"><div class=row style="flex-wrap:wrap;gap:8px">${[['pen','✏️'],['hl','🖍️'],['er','🧽'],['tx','🔤']].map(k=>`<button class="chip ${B.tool==k[0]?'on':''}" data-a=tool data-t=${k[0]}>${k[1]} ${t('x_'+k[0])}</button>`).join('')}</div><div class=row style="flex-wrap:wrap;gap:8px;margin:10px 0">${COLS.map(c=>`<button class="sw ${B.color==c?'on':''}" data-a=col data-c="${c}" style="background:${c}"></button>`).join('')}<input id=cc type=color value="${B.color}" style="width:34px;height:34px;padding:0;margin:0;border-radius:50%"></div><div class=m>${t('x_sz')}</div><input id=sz type=range min=1 max=30 value=${B.w} style="margin:2px 0 8px"><div class=m>${t('x_fz')}</div><input id=fz type=range min=12 max=90 value=${B.fs} style="margin:2px 0 8px"><div class=row style="flex-wrap:wrap;gap:8px"><button class=chip data-a=undo>↩ ${t('x_un')}</button><button class=chip data-a=clr>🗑 ${t('x_cl')}</button><button class=chip data-a=bgt>◐ ${t('x_bg')}</button>${own()&&C_.cloud&&!String(C_.cloud).startsWith('PUT_')?`<input type=file id=bf hidden accept="application/pdf"><button class=chip data-a=bpdf>📄 PDF</button>`:''}${B.pdf?`<button class=chip data-a=bpg data-d=-1>‹</button><span class=m>${B.pdf.i}/${B.pdf.n}</span><button class=chip data-a=bpg data-d=1>›</button>`:''}<button class=chip data-a=sv>💾 ${t('x_sv')}</button></div></div><canvas id=cv width=900 height=1200 style="background:${B.bg}${B.pdf?` url('${pgu()}') center/contain no-repeat`:''}"></canvas></div>`;
let dr=0,lp;
const pt=e=>{const r=cv().getBoundingClientRect();return[(e.clientX-r.left)*cv().width/r.width,(e.clientY-r.top)*cv().height/r.height]};
const stroke=(a,b)=>{const c=cv().getContext('2d');c.lineCap=c.lineJoin='round';c.lineWidth=B.w*2*(B.tool=='hl'||B.tool=='er'?3:1);c.globalCompositeOperation=B.tool=='er'?'destination-out':'source-over';c.globalAlpha=B.tool=='hl'?.3:1;c.strokeStyle=B.color;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.globalAlpha=1};
document.addEventListener('pointerdown',e=>{if(e.target.id!='cv')return;e.target.setPointerCapture(e.pointerId);const p=pt(e);
if(B.tool=='tx'){const s=prompt(t('x_txp'));if(s){const c=cv().getContext('2d');c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle=B.color;c.font=`700 ${B.fs*2}px Cairo,sans-serif`;c.fillText(s,p[0],p[1]);keep()}return}
dr=1;lp=p;stroke(p,p)});
document.addEventListener('pointermove',e=>{if(dr&&e.target.id=='cv'){const p=pt(e);stroke(lp,p);lp=p}});
document.addEventListener('pointerup',()=>{if(dr){dr=0;keep()}});
document.addEventListener('input',e=>{const i=e.target.id;if(i=='sz')B.w=+e.target.value;if(i=='fz')B.fs=+e.target.value;if(i=='cc'){B.color=e.target.value;mark('.sw',()=>0)}});

A.bpdf=()=>{const f=$('#bf');if(f)f.click()};
document.addEventListener('change',e=>{if(e.target.id!='bf'||!e.target.files[0])return;const fd=new FormData();fd.append('file',e.target.files[0]);fd.append('upload_preset',C_.preset);toast('⬆ …');
fetch(`https://api.cloudinary.com/v1_1/${C_.cloud}/auto/upload`,{method:'POST',body:fd}).then(r=>r.json()).then(j=>{if(!j.secure_url||j.format!='pdf')throw 0;B.pdf={u:j.secure_url,n:j.pages||1,i:1};B.pp={};B.h=[];render()}).catch(()=>toast('PDF ✖'))});
A.bpg=d=>{if(!B.pdf)return;const c=cv();if(c)B.pp[B.pdf.i]=c.toDataURL('image/webp',.7);const n=Math.min(B.pdf.n,Math.max(1,B.pdf.i+ +d.d));B.pdf.i=n;B.h=B.pp[n]?[B.pp[n]]:[];render()};
// live chat tab
let LC=0;
A.lc=()=>{LC=LC?0:1;render()};A.lr=()=>{L.set('lr',L.get('lr',1)?0:1);render()};
A.lsend=()=>{const q=$('#lm'),m=q.value.trim();if(!m)return;const it=L.get('i_livechat',[]);it.unshift({id:Date.now(),t:m,n:L.get('name','')||t(own()?'ro':'rs'),o:own()?1:0});L.set('i_livechat',it.slice(0,200));q.value='';toast(t('x_ok'));if(own())render()};
const liveV=()=>`<button class=fab data-a=lc>💬</button>${LC?`<div class="c lcp"><div class=row><b style="flex:1">${t('x_lc')}</b>${own()?`<button class="chip ${L.get('lr',1)?'on':''}" data-a=lr>${t('x_lr')}</button>`:''}<button class=chip data-a=lc>✕</button></div>${own()&&L.get('lr',1)?`<div class=lcl>${L.get('i_livechat',[]).map(r=>`<div class=m style="margin-bottom:6px"><b>${esc(r.n)}</b> ${esc(r.t)}</div>`).join('')||'<div class=m>—</div>'}</div>`:''}<div class=row style="margin-top:10px"><input id=lm placeholder="${t('x_lp')}" style="margin:0"><button class="b s" data-a=lsend>${t('snd')}</button></div></div>`:''}`;

const vs=views.sec;views.sec=()=>V.s=='board'?boardV():V.s=='look'?lookV():vs()+(V.s=='live'?liveV():'');
const r1=render;render=()=>{r1();if(V.p=='sec'&&V.s=='board')load(B.h[B.h.length-1])};
})();
