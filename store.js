// Backend: textdb.dev (sin cuenta, CORS abierto). Una clave por persona para evitar choques entre escrituras.
const KV_BASE='https://textdb.dev/api/data/amigo-secreto-9qp0id-';
const kvKey=n=>KV_BASE+encodeURIComponent(n.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-'));
async function kvGet(n){const r=await fetch(kvKey(n)+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('kv '+r.status);const t=(await r.text()).trim();if(!t)return[];const j=JSON.parse(t);if(!Array.isArray(j))throw Error('bad');return j}
async function kvSet(n,l){const r=await fetch(kvKey(n),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(l)});if(!r.ok)throw Error('kv '+r.status)}
// Todas las filas en formato plano (admin / CSV / ruleta).
async function kvAll(P){const ls=await Promise.all(P.map(n=>kvGet(n).catch(()=>[])));return P.flatMap((n,i)=>ls[i].map(w=>({persona:n,deseo:w.descripcion||'',url:(w.urls||[]).join(' '),timestamp:w.fecha||w.id})))}
