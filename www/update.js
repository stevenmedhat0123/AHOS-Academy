// AHOS updates via GitHub Releases: manual check (More page) + silent daily check + one-time "what's new" box
(()=>{
const V0=window.AHOS_VER||{code:0,name:'0',notes:{}},U=window.AHOS_UPD||{};
Object.assign(D,{x_upd:['التحقق من التحديثات','Check for updates'],x_uck:['بيتحقق…','Checking…'],x_uok:['إنت على أحدث نسخة من التطبيق ✓','You are on the latest version ✓'],x_unew:['فيه تحديث جديد','A new update is available'],x_udl:['تحميل التحديث','Download update'],x_uerr:['مقدرش يتحقق دلوقتي (النت أو الإعداد)','Could not check right now (network or setup)'],x_uwn:['اللي اتضاف في التحديث','What’s new'],x_ugo:['تمام','Got it'],x_ucur:['نسختك','Your version'],x_ulat:['الأحدث','Latest'],x_uhow:['بعد التحميل افتح الملف من الإشعارات أو التنزيلات واضغط تثبيت','After the download, open the file from notifications or Downloads and tap Install']});
const st=document.createElement('style');st.textContent='#um{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:20px}.umc{background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:var(--r,22px);padding:18px;max-width:420px;width:100%;max-height:80vh;overflow:auto}.nt{white-space:pre-wrap;font-size:14px;margin:10px 0}';document.head.appendChild(st);
const modal=h=>{let m=$('#um');if(!m){m=document.createElement('div');m.id='um';document.body.appendChild(m)}m.innerHTML=`<div class=umc>${h}</div>`};
let UPD=null;
const showUpd=u=>{UPD=u;const parts=String(u.body||'').split('\n\n'),nt=parts[lang=='ar'?0:1]||u.body||'';
modal(`<b style="font-size:18px">🆕 ${t('x_unew')} · ${esc(u.name)}</b><div class=m style="margin:6px 0">${t('x_ucur')}: ${esc(V0.name)} → ${t('x_ulat')}: ${esc(u.name)}</div><div class=nt>${esc(nt)}</div><div class=m style="margin-bottom:10px">${t('x_uhow')}</div><button class=b data-a=udl>⬇ ${t('x_udl')}${u.size?' ('+(u.size/1048576).toFixed(1)+' MB)':''}</button><button class="b g" style="margin-top:8px" data-a=uclose>${t('x_ugo')}</button>`)};
const check=async silent=>{if(!U.repo||String(U.repo).startsWith('PUT')){if(!silent)toast(t('x_uerr'));return}
if(!silent)toast(t('x_uck'));
try{const r=await fetch(`https://api.github.com/repos/${U.repo}/releases/latest`,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw 0;const j=await r.json(),code=parseInt(String(j.tag_name).replace(/\D/g,''))||0,a=(j.assets||[]).find(x=>/\.apk$/i.test(x.name));
if(code>V0.code&&a)showUpd({code,name:j.name||j.tag_name,body:j.body||'',url:a.browser_download_url,size:a.size});else if(!silent)toast(t('x_uok'))}
catch(e){if(!silent)toast(t('x_uerr'))}};
A.upd=()=>check(false);
A.udl=()=>{if(UPD)window.open(UPD.url,'_system')};
A.uclose=()=>{const m=$('#um');if(m)m.remove()};

// first launch after an update: show what was added (not on a fresh install)
setTimeout(()=>{const prev=L.get('lastver',0);
if(prev&&prev<V0.code){const n=(V0.notes&&V0.notes[lang])||[];modal(`<b style="font-size:18px">🎉 ${t('x_uwn')} · ${esc(V0.name)}</b><div class=nt>${n.map(x=>'• '+esc(x)).join('\n')}</div><button class=b data-a=uclose>${t('x_ugo')}</button>`)}
L.set('lastver',V0.code)},1500);
// silent check once a day
setTimeout(()=>{const td=new Date().toDateString();if(L.get('uchk','')!=td){L.set('uchk',td);check(true)}},6000);
})();
