const $=s=>document.querySelector(s);let C,yo=null,edit=null,deseos=[];const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const api=(u,o={})=>fetch(u,{headers:{'Content-Type':'application/json'},...o}).then(async r=>{if(r.status==204)return null;const j=await r.json();if(!r.ok)throw Error(j.error);return j});
function tick(){let s=Math.max(0,(Date.parse(C.fechaLimite)-Date.now())/1e3);const v=[s/86400,s%86400/3600,s%3600/60,s%60].map(Math.floor);
$('#cd').innerHTML=s?v.map((n,i)=>`<div><b>${String(n).padStart(2,'0')}</b><span>${['días','horas','min','seg'][i]}</span></div>`).join(''):'<div style="grid-column:1/-1"><b>¡Lista cerrada!</b></div>';}
async function names(){const counts=await Promise.all(C.participantes.map(n=>api('/api/deseos/'+encodeURIComponent(n)).then(l=>l.length)));
$('#names').innerHTML=C.participantes.map((n,i)=>`<button class="${counts[i]?'has':''} ${n===yo?'sel':''}" data-n="${esc(n)}"><span class="av" style="background:${avatarColor(n)}">${initials(n)}</span>${esc(n)}</button>`).join('');}
async function pick(n){yo=n;localStorage.setItem('yo',n);edit=null;$('#panel').hidden=false;$('#ptitle').textContent=`Los deseos de ${n}`;const pv=$('#pav');pv.textContent=initials(n);pv.style.background=avatarColor(n);await list();names();$('#panel').scrollIntoView({behavior:'smooth'});}
async function list(){deseos=await api('/api/deseos/'+encodeURIComponent(yo));
$('#list').innerHTML=deseos.length?deseos.map(d=>`<div class="wish"><div class="t">${esc(d.descripcion)}</div>${d.urls.length?`<div class="links">${d.urls.map(u=>{let h=u;try{h=new URL(u).hostname.replace(/^www\./,'')}catch{}return `<a class="lk" href="${esc(u)}" target="_blank" rel="noopener"><img src="https://www.google.com/s2/favicons?domain=${esc(h)}&sz=64" alt=""><span>${esc(h)}</span></a>`}).join('')}</div>`:''}<div class="acts"><button class="btn sec min" data-e="${d.id}">Editar</button><button class="btn sec min" data-d="${d.id}">Borrar</button></div></div>`).join(''):'<p class="empty">Aún no hay deseos. ¡Agrega el primero! ✨</p>';}
function reset(){edit=null;$('#desc').value=$('#urls').value='';$('#save').textContent='Agregar deseo';$('#cancel').hidden=true;$('#err').textContent='';}
$('#names').onclick=e=>{const b=e.target.closest('button');if(b)pick(b.dataset.n)};
$('#list').onclick=async e=>{const t=e.target;if(t.dataset.d){if(confirm('¿Borrar este deseo?')){await api(`/api/deseos/${encodeURIComponent(yo)}/${t.dataset.d}`,{method:'DELETE'});list();names();}}
if(t.dataset.e){const d=deseos.find(x=>x.id===t.dataset.e);edit=d.id;$('#desc').value=d.descripcion;$('#urls').value=d.urls.join('\n');$('#save').textContent='Guardar cambios';$('#cancel').hidden=false;$('#desc').focus();}};
$('#cancel').onclick=reset;
$('#f').onsubmit=async e=>{e.preventDefault();const b={descripcion:$('#desc').value,urls:$('#urls').value.split(/\s+/).filter(Boolean)};
try{await api(`/api/deseos/${encodeURIComponent(yo)}`+(edit?'/'+edit:''),{method:edit?'PUT':'POST',body:JSON.stringify(b)});reset();list();names();}catch(x){$('#err').textContent=x.message}};
(async()=>{C=await api('/api/config');$('#pres').textContent=C.presupuesto;tick();setInterval(tick,1000);await names();const s=localStorage.getItem('yo');if(s&&C.participantes.includes(s))pick(s);})();
