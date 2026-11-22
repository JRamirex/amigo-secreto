// Backend: textdb.dev (sin cuenta, CORS abierto). Una clave por persona para evitar choques entre escrituras.
// Ojo: textdb.dev da 500 con 'text/plain;charset=...'; por eso se envía un Blob 'text/plain'.
const KV_BASE='https://textdb.dev/api/data/amigo-secreto-9qp0id-';
const kvKey=n=>KV_BASE+encodeURIComponent(n.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-'));
async function kvGet(n){const r=await fetch(kvKey(n)+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('kv '+r.status);const t=(await r.text()).trim();if(!t)return[];const j=JSON.parse(t);if(!Array.isArray(j))throw Error('bad');return j}
async function kvSet(n,l){const r=await fetch(kvKey(n),{method:'POST',body:new Blob([JSON.stringify(l)],{type:'text/plain'})});if(!r.ok)throw Error('kv '+r.status)}
// Todas las filas en formato plano (admin / CSV / ruleta).
async function kvAll(P){const ls=await Promise.all(P.map(n=>kvGet(n).catch(()=>[])));return P.flatMap((n,i)=>ls[i].map(w=>({persona:n,deseo:('lista' in w?w.lista:w.descripcion)||'',url:(w.urls||[]).join(' '),timestamp:w.fecha||w.id})).filter(w=>w.deseo.trim()||w.url))}
// Candado de giro (fase 2): una clave 'giro-<nombre>' por persona. Vacía = no ha girado.
async function lockGet(n){const r=await fetch(kvKey('giro-'+n)+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('kv '+r.status);const t=(await r.text()).trim();return t?JSON.parse(t):null}
async function lockSet(n,v){const r=await fetch(kvKey('giro-'+n),{method:'POST',body:new Blob([JSON.stringify(v)],{type:'text/plain'})});if(!r.ok)throw Error('kv '+r.status)}
