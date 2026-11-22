const $=s=>document.querySelector(s);let C,yo=null,edit=null,deseos=[];const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Config embebida (GitHub Pages no tiene /api).
const CONFIG={"presupuesto": 200000, "fechaLimite": "2026-11-26T23:59:00-05:00", "participantes": ["Hilda", "Elio", "Jenny", "Claudia", "Leonor", "Nancy", "William", "Juanda", "Diana", "Santi", "Moni", "Willi", "Naty", "Juan Pa", "Leonardo", "Pilar", "Liliana", "Juancho", "Juanse", "María", "July", "Andrew"]};
const LS='deseos:';const lsGet=n=>{try{return JSON.parse(localStorage.getItem(LS+n))||[]}catch{return[]}};const lsSet=(n,l)=>localStorage.setItem(LS+n,JSON.stringify(l));
// Store: nube (store.js) con respaldo en este navegador (localStorage).
const store={
 async list(n){try{const l=await kvGet(n);lsSet(n,l);return l}catch{return lsGet(n)}},
 async save(n,id,b){let l;try{l=await kvGet(n)}catch{l=lsGet(n)}
  if(id){const d=l.find(x=>x.id===id);if(d)Object.assign(d,b)}else l.push({id:Date.now().toString(36),...b,fecha:new Date().toISOString()});
  lsSet(n,l);try{await kvSet(n,l)}catch{}},
 async del(n,id){let l;try{l=await kvGet(n)}catch{l=lsGet(n)}l=l.filter(x=>x.id!==id);lsSet(n,l);try{await kvSet(n,l)}catch{}}
};
function tick(){let s=Math.max(0,(Date.parse(C.fechaLimite)-Date.now())/1e3);const v=[s/86400,s%86400/3600,s%3600/60,s%60].map(Math.floor);
$('#cd').innerHTML=s?v.map((n,i)=>`<div><b>${String(n).padStart(2,'0')}</b><span>${['días','horas','min','seg'][i]}</span></div>`).join(''):'<div style="grid-column:1/-1"><b>¡Lista cerrada!</b></div>';}
async function names(){const counts=await Promise.all(C.participantes.map(n=>store.list(n).then(l=>l.length)));
$('#names').innerHTML=C.participantes.map((n,i)=>`<button class="${counts[i]?'has':''} ${n===yo?'sel':''}" data-n="${esc(n)}"><span class="av" style="background:${avatarColor(n)}">${initials(n)}</span>${esc(n)}</button>`).join('');}
async function pick(n){yo=n;localStorage.setItem('yo',n);edit=null;$('#panel').hidden=false;$('#ptitle').textContent=`Los deseos de ${n}`;const pv=$('#pav');pv.textContent=initials(n);pv.style.background=avatarColor(n);await list();names();$('#panel').scrollIntoView({behavior:'smooth'});}
async function list(){deseos=await store.list(yo,true);
$('#list').innerHTML=deseos.length?deseos.map(d=>`<div class="wish"><div class="on">Opción ${deseos.indexOf(d)+1}</div><div class="t">${esc(d.descripcion)}</div>${d.urls.length?`<div class="links">${d.urls.map(u=>{let h=u;try{h=new URL(u).hostname.replace(/^www\./,'')}catch{}return `<a class="lk" href="${esc(u)}" target="_blank" rel="noopener"><img src="https://www.google.com/s2/favicons?domain=${esc(h)}&sz=64" alt=""><span>${esc(h)}</span></a>`}).join('')}</div>`:''}<div class="acts"><button class="btn sec min" data-e="${d.id}">Editar</button><button class="btn sec min" data-d="${d.id}">Borrar</button></div></div>`).join(''):'';
for(let i=deseos.length;i<3;i++)$('#list').innerHTML+=`<div class="wish ghost"><div class="on">Opción ${i+1}</div><div class="t">${i===deseos.length?'Escríbela abajo ✨':'Pendiente'}</div></div>`;
$('#prog').textContent=`Llevas ${deseos.length} de 3.`;$('#flab').textContent=edit?'Editando · Describe tu deseo':`Opción ${Math.min(deseos.length+1,99)} · Describe tu deseo`;}
function reset(){edit=null;$('#desc').value='';document.querySelectorAll('.u').forEach(x=>x.value='');$('#save').textContent='Agregar opción';list();$('#cancel').hidden=true;$('#err').textContent='';}
$('#names').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.n)};
$('#list').onclick=async e=>{const t=e.target;if(t.dataset.d){if(confirm('¿Borrar este deseo?')){await store.del(yo,t.dataset.d);list();names();}}
if(t.dataset.e){const d=deseos.find(x=>x.id===t.dataset.e);edit=d.id;$('#desc').value=d.descripcion;[1,2,3].forEach(i=>$('#u'+i).value=d.urls[i-1]||'');$('#flab').textContent='Editando · Describe tu deseo';$('#save').textContent='Guardar cambios';$('#cancel').hidden=false;$('#desc').focus();}};
$('#cancel').onclick=reset;
$('#f').onsubmit=async e=>{e.preventDefault();const b={descripcion:$('#desc').value,urls:[...document.querySelectorAll('.u')].map(x=>x.value.trim().replace(/\s+/g,'')).filter(Boolean).slice(0,3)};
try{if(!b.descripcion.trim())throw Error('Escribe una descripción');await store.save(yo,edit,b);reset();names();}catch(x){$('#err').textContent=x.message}};
(async()=>{C=CONFIG;$('#pres').textContent='$'+Number(C.presupuesto).toLocaleString('es-CO')+' COP';tick();setInterval(tick,1000);await names();const s=localStorage.getItem('yo');if(s&&C.participantes.includes(s))pick(s);})();
