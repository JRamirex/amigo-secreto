const $=s=>document.querySelector(s);let C,yo=null,deseos=[];const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Config embebida (GitHub Pages no tiene /api).
const CONFIG={"presupuesto": 200000, "fechaLimite": "2026-11-26T23:59:00-05:00", "participantes": ["Hilda", "Elio", "Jenny", "Claudia", "Leonor", "Nancy", "William", "Juanda", "Diana", "Santi", "Moni", "Willi", "Naty", "Juan Pa", "Leonardo", "Pilar", "Liliana", "Juancho", "Juanse", "María", "July", "Andrew"]};
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
async function names(){const counts=await Promise.all(C.participantes.map(n=>store.list(n).then(l=>l.length)));
$('#names').innerHTML=C.participantes.map((n,i)=>`<button class="${counts[i]?'has':''} ${n===yo?'sel':''}" data-n="${esc(n)}"><span class="av" style="background:${avatarColor(n)}">${initials(n)}</span>${esc(n)}</button>`).join('');}
async function pick(n){yo=n;localStorage.setItem('yo',n);$('#panel').hidden=false;$('#ptitle').textContent=`Los deseos de ${n}`;const pv=$('#pav');pv.textContent=initials(n);pv.style.background=avatarColor(n);await list();names();$('#panel').scrollIntoView({behavior:'smooth'});}
$('#names').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.n)};
const slots=[];let chain=Promise.resolve();
function card(i){const d=deseos[i]||{descripcion:'',urls:[]};const u=d.urls.length?d.urls:[''];
return `<div class="gift${d.descripcion.trim()?' ok':''}" data-i="${i}"><div class="gh"><span class="gl">Regalo ${i+1}</span><span class="ck" aria-label="listo">✓</span></div>
<textarea class="gd" rows="2" placeholder="${['Ej: saco de lana delgada, talla M, gris','Otra idea que te haría feliz','Una alternativa más, por si acaso'][i]}">${esc(d.descripcion)}</textarea>
<div class="gu">${u.map(x=>`<input class="gk" type="url" inputmode="url" placeholder="🔗 Enlace (opcional)" value="${esc(x)}">`).join('')}</div>
<button type="button" class="add"${u.length>=3?' hidden':''}>+ añadir otro enlace</button></div>`}
async function list(){deseos=(await store.list(yo)).slice(0,3);for(let i=0;i<3;i++)slots[i]=deseos[i]?.id||null;$('#list').innerHTML=[0,1,2].map(card).join('');prog();}
function prog(){const n=[...document.querySelectorAll('.gift.ok')].length;$('#prog').textContent=`Llevas ${n} de 3.`}
const tm={};function flag(t){const s=$('#saved');s.textContent=t;s.className='saved on'+(t.startsWith('No')?' bad':'');clearTimeout(tm.f);if(t==='Guardado ✓')tm.f=setTimeout(()=>s.className='saved',1800)}
function persist(g){const i=+g.dataset.i,who=yo;const b={descripcion:g.querySelector('.gd').value.trim(),urls:[...g.querySelectorAll('.gk')].map(x=>x.value.trim().replace(/\s+/g,'')).filter(Boolean).slice(0,3)};
g.classList.toggle('ok',!!b.descripcion);prog();
const key=JSON.stringify(b);if(g.dataset.last===key)return;g.dataset.last=key;flag('Guardando…');
chain=chain.then(async()=>{try{if(!b.descripcion&&!b.urls.length){if(slots[i])await store.del(who,slots[i]);slots[i]=null}else{if(!slots[i])slots[i]=Date.now().toString(36)+i;await store.put(who,slots[i],b)}flag('Guardado ✓');names()}catch{flag('No se pudo guardar, reintenta')}})}
$('#list').addEventListener('input',e=>{const g=e.target.closest('.gift');if(!g)return;clearTimeout(tm[g.dataset.i]);tm[g.dataset.i]=setTimeout(()=>persist(g),900)});
$('#list').addEventListener('focusout',e=>{const g=e.target.closest('.gift');if(g){clearTimeout(tm[g.dataset.i]);persist(g)}});
$('#list').addEventListener('click',e=>{if(!e.target.matches('.add'))return;const g=e.target.closest('.gift'),w=g.querySelector('.gu');const n=w.querySelectorAll('.gk').length;if(n<3){w.insertAdjacentHTML('beforeend','<input class="gk" type="url" inputmode="url" placeholder="🔗 Otro enlace (opcional)">');w.lastChild.focus()}if(n+1>=3)e.target.hidden=true});
(async()=>{C=CONFIG;$('#pres').textContent='$'+Number(C.presupuesto).toLocaleString('es-CO')+' COP';tick();setInterval(tick,1000);await names();const s=localStorage.getItem('yo');if(s&&C.participantes.includes(s))pick(s);})();
