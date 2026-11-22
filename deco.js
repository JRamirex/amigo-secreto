// Decoración compartida: guirnalda de cabecera + nieve suave
(function(){
const g=`<svg class="orn" viewBox="0 0 320 110" aria-hidden="true">
<g stroke="#5d7a5a" stroke-width="2.2" stroke-linecap="round" fill="none">
<path d="M8 22 Q160 62 312 22"/>
${[...Array(14)].map((_,i)=>{const x=20+i*21,y=22+40*Math.sin(Math.PI*(x-8)/304)*.98;return `<path d="M${x} ${y} l-7 -9 M${x} ${y} l8 -8 M${x} ${y} l-6 8 M${x} ${y} l7 7" stroke="${i%2?'#8fa98a':'#5d7a5a'}" stroke-width="2"/>`}).join('')}
</g>
<line x1="70" y1="44" x2="70" y2="62" stroke="#b8a888" stroke-width="1.2"/><circle cx="70" cy="72" r="10" fill="#c8694a"/><path d="M63 70 h14" stroke="#f6f0e4" stroke-width="2" stroke-dasharray="2 2"/><rect x="66" y="60" width="8" height="4" rx="1" fill="#d9b25a"/>
<line x1="125" y1="52" x2="125" y2="62" stroke="#b8a888" stroke-width="1.2"/><g transform="translate(125 74)" stroke="#8fa98a" stroke-width="2.2" stroke-linecap="round"><path d="M-9 0h18M-4.5-8l9 16M4.5-8l-9 16"/></g>
<line x1="160" y1="54" x2="160" y2="60" stroke="#b8a888" stroke-width="1.2"/><path d="M160 60 l16 34 h-32z" fill="#5d7a5a"/><path d="M160 70 l11 22 h-22z" fill="#8fa98a"/><circle cx="160" cy="59" r="4" fill="#d9b25a"/><circle cx="155" cy="84" r="2" fill="#c8694a"/><circle cx="166" cy="78" r="2" fill="#f6f0e4"/>
<line x1="195" y1="52" x2="195" y2="64" stroke="#b8a888" stroke-width="1.2"/><path d="M195 64 l3.5 7 7.5 1-5.5 5 1.3 7.5-6.8-3.6-6.8 3.6 1.3-7.5-5.5-5 7.5-1z" fill="#d9b25a"/>
<line x1="250" y1="44" x2="250" y2="62" stroke="#b8a888" stroke-width="1.2"/><circle cx="250" cy="72" r="10" fill="#8fa98a"/><path d="M243 72 h14" stroke="#fffaf1" stroke-width="2"/><rect x="246" y="60" width="8" height="4" rx="1" fill="#d9b25a"/>
</svg>`;
document.querySelectorAll('[data-orn]').forEach(e=>e.outerHTML=g);
const s=document.createElement('div');s.className='snow';s.setAttribute('aria-hidden','true');
for(let i=0;i<26;i++){const f=document.createElement('i');const z=3+Math.random()*5;f.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${9+Math.random()*10}s;animation-delay:-${Math.random()*15}s;opacity:${.35+Math.random()*.45}`;s.appendChild(f);}
document.body.prepend(s);
})();
window.avatarColor=n=>{const c=['#c8694a','#5d7a5a','#8fa98a','#d9a35a','#a8584a','#6f8f86','#b7825f','#7d8f5a'];let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;return c[h%c.length]};
window.initials=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
