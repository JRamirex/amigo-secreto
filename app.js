const $=s=>document.querySelector(s);let C,yo=null,deseos=[];const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Config embebida (GitHub Pages no tiene /api).
const CONFIG={"presupuesto": 200000, "fechaLimite": "2026-11-30T23:59:00-05:00", "participantes": ["Hilda", "Elio", "Jenny", "Claudia", "Leonor", "Nancy", "William", "Juanda", "Diana", "Santi", "Moni", "Willi", "Naty", "Juan Pa", "Leonardo", "Pilar", "Liliana", "Juancho", "Juanse", "María", "July", "Andrew", "Daniela"]};
const LS='deseos:';const lsGet=n=>{try{return JSON.parse(localStorage.getItem(LS+n))||[]}catch{return[]}};const lsSet=(n,l)=>localStorage.setItem(LS+n,JSON.stringify(l));
// Store: nube (store.js) con respaldo en este navegador (localStorage).
const store={
 async list(n){try{const l=await kvGet(n);lsSet(n,l);return l}catch{return lsGet(n)}},
 async save(n,id,b){let l;try{l=await kvGet(n)}catch{l=lsGet(n)}
  if(id){const d=l.find(x=>x.id===id);if(d)Object.assign(d,b)}else l.push({id:Date.now().toString(36),...b,fecha:new Date().toISOString()});
  lsSet(n,l);try{await kvSet(n,l)}catch{}},
 async put(n,id,b){let l;try{l=await kvGet(n)}catch{l=lsGet(n)}const d=l.find(x=>x.id===id);if(d)Object.assign(d,b);else l.push({id,...b,fecha:new Date().toISOString()});lsSet(n,l);await kvSet(n,l)},
 async del(n,id){let l;try{l=await kvGet(n)}catch{l=lsGet(n)}l=l.filter(x=>x.id!==id);lsSet(n,l);try{await kvSet(n,l)}catch{}}
};
function tick(){let s=Math.max(0,(Date.parse(C.fechaLimite)-Date.now())/1e3);const v=[s/86400,s%86400/3600,s%3600/60,s%60].map(Math.floor);
$('#cd').innerHTML=s?v.map((n,i)=>`<div><b>${String(n).padStart(2,'0')}</b><span>${['días','horas','min','seg'][i]}</span></div>`).join(''):'<div style="grid-column:1/-1"><b>¡Lista cerrada!</b></div>';}
async function names(){const counts=await Promise.all(C.participantes.map(n=>store.list(n).then(l=>toLista(l).lista.trim()?1:0)));
$('#names').innerHTML=C.participantes.map((n,i)=>`<button class="${counts[i]?'has':''} ${n===yo?'sel':''}" data-n="${esc(n)}"><span class="av" style="background:${avatarColor(n)}">${initials(n)}</span>${esc(n)}</button>`).join('');}
async function pick(n){yo=n;localStorage.setItem('yo',n);$('#panel').hidden=false;$('#ptitle').textContent=`Los deseos de ${n}`;const pv=$('#pav');pv.textContent=initials(n);pv.style.background=avatarColor(n);await list();names();$('#panel').scrollIntoView({behavior:'smooth'});}
$('#names').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.n)};
// Forma v4: un solo registro {id:'lista',lista,urls}. Datos viejos (varias tarjetas) se convierten al vuelo.
function toLista(l){const r=l.find(x=>x.id==='lista'&&'lista' in x);if(r)return{lista:r.lista||'',urls:r.urls||[]};
 const d=l.filter(x=>(x.descripcion||'').trim());return{lista:d.map((x,i)=>(d.length>1?(i+1)+'. ':'')+x.descripcion.trim()).join('\n'),urls:l.flatMap(x=>x.urls||[])}}
const MAXL=6;let chain=Promise.resolve(),last='';
// Enlaces: solo http(s). 'www.algo' se completa con https://. Lo demás se rechaza con aviso.
const fixUrl=v=>{v=v.trim().replace(/\s+/g,'');if(/^www\./i.test(v))v='https://'+v;return /^https?:\/\/[^\s\/]+\.[^\s]+$/i.test(v)?v:null};
const linkIn=(v='')=>`<div class="lrow"><span class="lic">🔗</span><input class="gk" type="url" inputmode="url" placeholder="https://… (opcional)" value="${esc(v)}"></div>`;
async function list(){const w=toLista(await store.list(yo));const u=w.urls.slice(0,MAXL);while(u.length<3)u.push('');last=JSON.stringify({lista:w.lista.trim(),urls:w.urls.filter(Boolean)});
$('#list').innerHTML=`<div class="wl${w.lista.trim()?' ok':''}"><label class="wlab" for="wtxt">✍️ Mi lista de deseos <span class="ck">✓</span></label>
<textarea id="wtxt" rows="7" maxlength="500" placeholder="1. Saco de lana gris talla M&#10;2. Libro “El infinito en un junco”&#10;3. Audífonos inalámbricos">${esc(w.lista)}</textarea><p class="cnt" id="cnt">${w.lista.length}/500</p>
<p class="hint">Escribe unas <b>3 opciones</b> dentro del límite, una por línea, con detalles (talla, color, marca).</p></div>
<div class="wlinks"><div class="wlab">🛍️ Enlaces de referencia</div><div class="gu">${u.map(linkIn).join('')}</div><button type="button" class="add"${u.length>=MAXL?' hidden':''}>+ añadir otro enlace</button></div>`;}
const tm={};function flag(t){const s=$('#saved');s.textContent=t;s.className='saved on'+(t.startsWith('No')?' bad':'');clearTimeout(tm.f);if(t==='Guardado ✓')tm.f=setTimeout(()=>s.className='saved',1800)}
function checkLinks(){const out=[];document.querySelectorAll('.gk').forEach(x=>{const r=x.closest('.lrow'),raw=x.value.trim(),u=raw?fixUrl(raw):'';let e=r.nextElementSibling;if(!e||!e.matches('.lerr')){e=null}
 if(raw&&!u){if(!e){r.insertAdjacentHTML('afterend','<p class="lerr" role="alert">Enlace no válido: usa uno que empiece por https://</p>')}}else{e&&e.remove();if(u){out.push(u);if(u!==raw&&document.activeElement!==x)x.value=u}}});return out}
function persist(){const who=yo,b={lista:$('#wtxt').value.trim().slice(0,500),urls:checkLinks().slice(0,MAXL)};
$('.wl').classList.toggle('ok',!!b.lista);const key=JSON.stringify(b);if(key===last)return;last=key;flag('Guardando…');
// Protección: nunca se escribe vacío sobre un deseo guardado sin confirmación explícita.
chain=chain.then(async()=>{try{const vacio=!b.lista&&!b.urls.length;
 if(vacio){let r;try{r=toLista(await kvGet(who))}catch{flag('No se pudo guardar, reintenta');last='';return}
  if(r.lista.trim()||r.urls.length){if(!confirm('¿Seguro que quieres BORRAR toda la lista de deseos de '+who+'?')){if(who===yo)await list();flag('No se borró nada');return}}
  else{flag('Guardado ✓');return}}
 const l=vacio?[]:[{id:'lista',...b,fecha:new Date().toISOString()}];lsSet(who,l);await kvSet(who,l);flag('Guardado ✓');names()}catch{flag('No se pudo guardar, reintenta')}})}
$('#list').addEventListener('input',()=>{const c=$('#cnt');if(c)c.textContent=$('#wtxt').value.length+'/500';clearTimeout(tm.s);tm.s=setTimeout(persist,900)});
$('#list').addEventListener('focusout',()=>{clearTimeout(tm.s);persist()});
$('#list').addEventListener('click',e=>{if(!e.target.matches('.add'))return;const w=$('.gu');w.insertAdjacentHTML('beforeend',linkIn());w.lastElementChild.querySelector('input').focus();if(w.children.length>=MAXL)e.target.hidden=true});
(async()=>{C=CONFIG;$('#pres').textContent='$'+Number(C.presupuesto).toLocaleString('es-CO')+' COP';tick();setInterval(tick,1000);await names();const s=localStorage.getItem('yo');if(s&&C.participantes.includes(s))pick(s);})();
