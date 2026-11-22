#!/usr/bin/env node
// Sorteo OFFLINE. Genera public sorteo.js con un blob cifrado por persona (AES-GCM, clave PBKDF2 del nombre).
// El emparejamiento completo nunca se publica. Uso:
//   node tools/sorteo.mjs <grupos.json> [--activar] [--out sorteo.js]
import fs from 'fs';import {webcrypto as wc,randomInt,randomBytes} from 'crypto';
const a=process.argv.slice(2),oi=a.indexOf("--out"),gf=a.find((x,i)=>!x.startsWith("--")&&(oi<0||i!==oi+1));
const out=a.includes('--out')?a[a.indexOf('--out')+1]:new URL('../sorteo.js',import.meta.url).pathname;
const G=Object.values(JSON.parse(fs.readFileSync(gf,'utf8'))),P=G.flat(),g={};G.forEach((l,i)=>l.forEach(p=>g[p]=i));
let M=null;for(let t=0;t<100000&&!M;t++){const r=P.slice();for(let i=r.length-1;i>0;i--){const j=randomInt(i+1);[r[i],r[j]]=[r[j],r[i]]}
 if(P.every((p,i)=>r[i]!==p&&g[p]!==g[r[i]]))M=Object.fromEntries(P.map((p,i)=>[p,r[i]]))}
if(!M)throw Error('sin solución');
const te=new TextEncoder(),b64=u=>Buffer.from(u).toString('base64'),salt=b64(randomBytes(16)),N=s=>s.normalize('NFC');
const hash=async n=>Buffer.from(await wc.subtle.digest('SHA-256',te.encode(salt+'|'+N(n)))).toString('hex').slice(0,24);
const key=async n=>wc.subtle.deriveKey({name:'PBKDF2',salt:te.encode(salt),iterations:200000,hash:'SHA-256'},await wc.subtle.importKey('raw',te.encode(N(n)),'PBKDF2',false,['deriveKey']),{name:'AES-GCM',length:256},false,['encrypt']);
const blobs={};for(const p of P){const iv=randomBytes(12),ct=await wc.subtle.encrypt({name:'AES-GCM',iv},await key(p),te.encode(M[p]));blobs[await hash(p)]=b64(Buffer.concat([iv,Buffer.from(ct)]))}
const S={activa:a.includes('--activar'),salt,iter:200000,blobs};
fs.writeFileSync(out,'// Generado por tools/sorteo.mjs. Cada blob solo se abre con el nombre de su dueño.\nconst SORTEO='+JSON.stringify(S)+';\n');
// Verificación local (no se imprime el resultado)
const ok=P.every(p=>M[p]!==p&&g[p]!==g[M[p]])&&new Set(Object.values(M)).size===P.length;
console.log(`OK ${P.length} personas, ${G.length} grupos, reglas ${ok?'cumplidas':'FALLAN'}, activa=${S.activa} -> ${out}`);if(!ok)process.exit(1);
