#!/usr/bin/env node
// Sorteo OFFLINE. Genera sorteo.js con un blob cifrado por persona (AES-GCM, clave PBKDF2 del nombre).
// El emparejamiento completo nunca se publica. Uso:
//   node tools/sorteo.mjs <grupos.json> [--activar] [--desde ISO] [--out sorteo.js]
//        [--previo sorteo.js] [--girados "A,B" | --girados-nube]
// Inscripción tardía: con --previo, quien ya giró conserva su resultado; el resto (y los nuevos)
// se re-sortea entre los que aún no han sido sacados, respetando grupos. Búsqueda exhaustiva:
// si existe una asignación válida la encuentra, así el último nunca queda sin pareja.
import fs from 'fs';import {webcrypto as wc,randomInt,randomBytes} from 'crypto';
const a=process.argv.slice(2),opt=k=>{const i=a.indexOf(k);return i<0?null:a[i+1]},VAL=new Set(['--out','--desde','--previo','--girados']);
const gf=a.find((x,i)=>!x.startsWith('--')&&!VAL.has(a[i-1]));
const out=opt('--out')||new URL('../sorteo.js',import.meta.url).pathname;
const G=Object.values(JSON.parse(fs.readFileSync(gf,'utf8'))),P=G.flat(),g={};G.forEach((l,i)=>l.forEach(p=>g[p]=i));
if(new Set(P).size!==P.length)throw Error('nombre repetido');
const te=new TextEncoder(),b64=u=>Buffer.from(u).toString('base64'),N=s=>s.normalize('NFC');
const hashS=async(salt,n)=>Buffer.from(await wc.subtle.digest('SHA-256',te.encode(salt+'|'+N(n)))).toString('hex').slice(0,24);
const keyS=async(salt,iter,n,u)=>wc.subtle.deriveKey({name:'PBKDF2',salt:te.encode(salt),iterations:iter,hash:'SHA-256'},await wc.subtle.importKey('raw',te.encode(N(n)),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,[u]);
// Fijos: quienes ya giraron conservan su resultado
const fijo={};
if(opt('--previo')){const S0=JSON.parse(fs.readFileSync(opt('--previo'),'utf8').match(/const SORTEO=(\{.*\});/)[1]);
 let gir=[];if(a.includes('--girados-nube')){const slug=n=>n.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  for(const p of Object.keys(g)){const r=await fetch('https://textdb.dev/api/data/amigo-secreto-9qp0id-'+slug('giro-'+p)+'?t='+Date.now());if(!r.ok)throw Error('nube '+r.status);if((await r.text()).trim())gir.push(p)}}
 else if(opt('--girados'))gir=opt('--girados').split(',').map(s=>s.trim()).filter(Boolean);
 for(const p of gir){const bl=S0.blobs[await hashS(S0.salt,p)];if(!bl)throw Error('giró pero no está en el previo: '+p);const u=Buffer.from(bl,'base64');
  fijo[p]=new TextDecoder().decode(await wc.subtle.decrypt({name:'AES-GCM',iv:u.subarray(0,12)},await keyS(S0.salt,S0.iter,p,'decrypt'),u.subarray(12)));
  if(!(p in g)||!(fijo[p] in g))throw Error('par fijo con persona fuera de grupos: '+p)}
 console.log(`Fijos (ya giraron): ${gir.length}`)}
// Backtracking aleatorio: el más restringido primero
const usados=new Set(Object.values(fijo)),M={...fijo},libres=P.filter(p=>!(p in fijo)),pool=P.filter(p=>!usados.has(p));
const shuf=l=>{l=l.slice();for(let i=l.length-1;i>0;i--){const j=randomInt(i+1);[l[i],l[j]]=[l[j],l[i]]}return l};
const ok=(p,r)=>r!==p&&g[p]!==g[r];
function bt(rest){if(!rest.length)return true;let best=null,bc=null;
 for(const p of rest){const c=pool.filter(r=>!usados.has(r)&&ok(p,r));if(!best||c.length<bc.length){best=p;bc=c}if(!c.length)return false}
 for(const r of shuf(bc)){M[best]=r;usados.add(r);if(bt(rest.filter(x=>x!==best)))return true;usados.delete(r);delete M[best]}return false}
if(!bt(shuf(libres))){
 // No se relajan reglas. Buscar UN giro ya hecho que, rehecho, permite completar el sorteo.
 console.error('SIN SOLUCIÓN: con los que ya giraron no queda asignación válida para '+libres.join(', ')+'. No se generó sorteo.js.');
 let prop=null;
 for(const f of Object.keys(fijo).sort()){const r0=fijo[f];usados.delete(r0);delete M[f];pool.push(r0);
  const rest=[f,...libres];if(bt(rest)){prop={f,r0,nuevo:rest.map(p=>`${p} -> ${M[p]}`)};break}
  pool.pop();usados.add(r0);M[f]=r0}
 if(prop)console.error(`PROPUESTA: ${prop.f} ya giró y le salió ${prop.r0}. Pídele a ${prop.f} que vuelva a girar (o arréglalo a mano) con esta asignación válida:\n  `+prop.nuevo.join('\n  ')+`\nLuego quita a ${prop.f} de --girados y vuelve a correr.`);
 else console.error('PROPUESTA: ni rehaciendo un solo giro hay solución; hay que rehacer varios o todo el sorteo.');
 process.exit(2)}
const salt=b64(randomBytes(16)),blobs={};
for(const p of P){const iv=randomBytes(12),ct=await wc.subtle.encrypt({name:'AES-GCM',iv},await keyS(salt,200000,p,'encrypt'),te.encode(M[p]));blobs[await hashS(salt,p)]=b64(Buffer.concat([iv,Buffer.from(ct)]))}
const S={activa:a.includes('--activar'),desde:opt('--desde')||null,participantes:P,salt,iter:200000,blobs};
fs.writeFileSync(out,'// Generado por tools/sorteo.mjs. Cada blob solo se abre con el nombre de su dueño.\nconst SORTEO='+JSON.stringify(S)+';\n');
const good=P.every(p=>ok(p,M[p]))&&new Set(Object.values(M)).size===P.length&&Object.keys(fijo).every(p=>M[p]===fijo[p]);
console.log(`OK ${P.length} personas, ${G.length} grupos, reglas ${good?'cumplidas':'FALLAN'}, activa=${S.activa} desde=${S.desde} -> ${out}`);if(!good)process.exit(1);
if(process.env.SORTEO_DEBUG)fs.writeFileSync(process.env.SORTEO_DEBUG,JSON.stringify(M));
