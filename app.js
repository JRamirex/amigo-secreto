const $=s=>document.querySelector(s);let C,yo=null,edit=null,deseos=[];const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Config embebida (GitHub Pages no tiene /api).
const CONFIG={"presupuesto": "200.000 COP", "fechaLimite": "2026-11-26T23:59:00-05:00", "participantes": ["Hilda", "Elio", "Jenny", "Claudia", "Leonor", "Nancy", "William", "Juanda", "Diana", "Santi", "Moni", "Willi", "Naty", "Juan Pa", "Leonardo", "Pilar", "Liliana", "Juancho", "Juanse", "María", "July", "Andrew"]};
// Pegar aquí la URL /exec del Apps Script cuando exista. Vacío = guardar en este navegador (localStorage).
const SHEET_URL='https://script.google.com/macros/s/AKfycbwHOja_hFOcAJs7QagSRZAcVKCdVQAptQFM3ZRPn9Vvqi1uO5xyrM1gqcVySaTfZzTb/exec';
const LS='deseos:';const lsGet=n=>{try{return JSON.parse(localStorage.getItem(LS+n))||[]}catch{return[]}};const lsSet=(n,l)=>localStorage.setItem(LS+n,JSON.stringify(l));
// Contrato Apps Script: GET ?persona= -> [{persona,deseo,url,timestamp}]; POST text/plain (sin preflight) {persona,deseo,url[,action,timestamp]}.
const post=b=>fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(b)}).then(r=>r.json()).then(j=>{if(!j||!j.ok)throw Error((j&&j.error)||'error');return j});
let ALL=null;const loadAll=async()=>{const r=await fetch(SHEET_URL+'?t='+Date.now());const j=await r.json();if(!Array.isArray(j))throw Error('bad');ALL=j;return j};
const row2w=r=>({id:String(r.timestamp),descripcion:r.deseo||'',urls:String(r.url||'').split(/\s+/).filter(Boolean),fecha:r.timestamp});
const store={
 async list(n,fresh){if(SHEET_URL){try{const a=(fresh||!ALL)?await loadAll():ALL;const l=a.filter(r=>r.persona===n).map(row2w);lsSet(n,l);return l}catch{}}return lsGet(n)},
 async save(n,id,b){const body={persona:n,deseo:b.descripcion.trim(),url:b.urls.join(' ')};
  if(SHEET_URL){try{await post(id?{action:'update',timestamp:id,...body}:body);ALL=null;return}catch(e){if(/inválida|requerid/.test(e.message))throw e}}
  const l=lsGet(n);if(id){const d=l.find(x=>x.id===id);if(d)Object.assign(d,b)}else l.push({id:Date.now().toString(36),...b,fecha:new Date().toISOString()});lsSet(n,l)},
 async del(n,id){if(SHEET_URL){try{await post({action:'delete',persona:n,timestamp:id});ALL=null;return}catch{}}lsSet(n,lsGet(n).filter(x=>x.id!==id))}
};
function tick(){let s=Math.max(0,(Date.parse(C.fechaLimite)-Date.now())/1e3);const v=[s/86400,s%86400/3600,s%3600/60,s%60].map(Math.floor);
$('#cd').innerHTML=s?v.map((n,i)=>`<div><b>${String(n).padStart(2,'0')}</b><span>${['días','horas','min','seg'][i]}</span></div>`).join(''):'<div style="grid-column:1/-1"><b>¡Lista cerrada!</b></div>';}
async function names(){const counts=await Promise.all(C.participantes.map(n=>store.list(n).then(l=>l.length)));
$('#names').innerHTML=C.participantes.map((n,i)=>`<button class="${counts[i]?'has':''} ${n===yo?'sel':''}" data-n="${esc(n)}"><span class="av" style="background:${avatarColor(n)}">${initials(n)}</span>${esc(n)}</button>`).join('');}
async function pick(n){yo=n;localStorage.setItem('yo',n);edit=null;$('#panel').hidden=false;$('#ptitle').textContent=`Los deseos de ${n}`;const pv=$('#pav');pv.textContent=initials(n);pv.style.background=avatarColor(n);await list();names();$('#panel').scrollIntoView({behavior:'smooth'});}
async function list(){deseos=await store.list(yo,true);
$('#list').innerHTML=deseos.length?deseos.map(d=>`<div class="wish"><div class="t">${esc(d.descripcion)}</div>${d.urls.length?`<div class="links">${d.urls.map(u=>{let h=u;try{h=new URL(u).hostname.replace(/^www\./,'')}catch{}return `<a class="lk" href="${esc(u)}" target="_blank" rel="noopener"><img src="https://www.google.com/s2/favicons?domain=${esc(h)}&sz=64" alt=""><span>${esc(h)}</span></a>`}).join('')}</div>`:''}<div class="acts"><button class="btn sec min" data-e="${d.id}">Editar</button><button class="btn sec min" data-d="${d.id}">Borrar</button></div></div>`).join(''):'<p class="empty">Aún no hay deseos. ¡Agrega el primero! ✨</p>';}
function reset(){edit=null;$('#desc').value=$('#urls').value='';$('#save').textContent='Agregar deseo';$('#cancel').hidden=true;$('#err').textContent='';}
$('#names').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.n)};
$('#list').onclick=async e=>{const t=e.target;if(t.dataset.d){if(confirm('¿Borrar este deseo?')){await store.del(yo,t.dataset.d);list();names();}}
if(t.dataset.e){const d=deseos.find(x=>x.id===t.dataset.e);edit=d.id;$('#desc').value=d.descripcion;$('#urls').value=d.urls.join('\n');$('#save').textContent='Guardar cambios';$('#cancel').hidden=false;$('#desc').focus();}};
$('#cancel').onclick=reset;
$('#f').onsubmit=async e=>{e.preventDefault();const b={descripcion:$('#desc').value,urls:$('#urls').value.split(/\s+/).filter(Boolean)};
try{if(!b.descripcion.trim())throw Error('Escribe una descripción');await store.save(yo,edit,b);reset();list();names();}catch(x){$('#err').textContent=x.message}};
(async()=>{C=CONFIG;$('#pres').textContent=C.presupuesto;tick();setInterval(tick,1000);await names();const s=localStorage.getItem('yo');if(s&&C.participantes.includes(s))pick(s);})();
