/* Cardinalidades con mínimo y máximo (solo 1 o N): en el ER, (0,N) en cada línea entidad–relación y el tipo (1:1, 1:N, N:M) sobre el rombo; en el relacional, cada extremo de la flecha tiene su propio (mín,máx) con símbolos de pata de gallo. También coloca las tablas generadas bajo la barra flotante. */
(()=>{
 const mx=c=>c=='M'?'N':c;
 const lab=l=>l.c||l.mn?'('+(l.mn||'?')+','+(mx(l.c)||'?')+')':'?';
 const kind=(E,r)=>{const L=E.links.filter(l=>l.r==r.id);if(L.length!=2||L.some(l=>!l.c))return '';const a=L[0].c=='1',b=L[1].c=='1';return a&&b?'1:1':a||b?'1:N':'N:M'};
 const PR=[['0','1','como mucho uno'],['1','1','exactamente uno'],['0','N','cualquier número'],['1','N','al menos uno']];
 /* Relacional: extremos de cada flecha. Las flechas antiguas (solo con tipo) se interpretan como FK (0,N) → PK (1,1), 1:1 como (1,1)–(1,1) y N:M como (0,N)–(0,N) */
 const ends=a=>{if(a.fm&&a.fc&&a.tm&&a.tc)return{f:[a.fm,mx(a.fc)],t:[a.tm,mx(a.tc)]};if(!a.ty)return null;return a.ty=='11'?{f:['1','1'],t:['1','1']}:a.ty=='NM'?{f:['0','N'],t:['0','N']}:{f:['0','N'],t:['1','1']}};
 const geo=a=>{const f=tab(a.f[0]),t=tab(a.t[0]);if(!f||!t)return null;let sd=1,ed=-1;if(f.x+W+30<=t.x){}else if(t.x+W+30<=f.x){sd=-1;ed=1}else{sd=1;ed=1}
  return{f,t,sd,ed,sx:sd>0?f.x+W:f.x,ex:ed>0?t.x+W:t.x,sy:rowY(f,a.f[1]),ey:rowY(t,a.t[1])}};
 /* Zona del máximo: barra (1) o pata de gallo (N) junto a la tabla; más allá, el mínimo: barra (1) o círculo (0) */
 const endSym=(g,x,y,d,mn,c)=>{const P=k=>x+d*k;let p=c=='1'?`M${P(7)} ${y-7}v14`:`M${P(14)} ${y}L${x} ${y-7}M${P(14)} ${y}L${x} ${y+7}`;if(mn=='1')p+=`M${P(22)} ${y-7}v14`;
  el('path',{d:p,fill:'none',stroke:'var(--ac)','stroke-width':1.8},g);if(mn=='0')el('circle',{cx:P(23),cy:y,r:4.5,fill:'var(--bg)',stroke:'var(--ac)','stroke-width':1.8},g)};
 /* Se quita el puntito blanco del origen de la flecha; los símbolos de cada extremo se redibujan con (mín,máx) */
 const arrows=cv=>cv.querySelectorAll('[data-k=arrow]').forEach(q=>{q.querySelectorAll('circle').forEach(c=>c.remove());
  const a=S.rel.arrows.find(z=>z.id==q.dataset.id),e=a&&ends(a),o=a&&geo(a);if(!e||!o)return;
  q.querySelectorAll('path[stroke-width="1.8"]').forEach(p=>p.remove());
  endSym(q,o.sx,o.sy,o.sd,e.f[0],e.f[1]);endSym(q,o.ex,o.ey,o.ed,e.t[0],e.t[1])});
 /* Un clic en la flecha ofrece las cuatro opciones del extremo más cercano al clic */
 function arrowMenu(t,x,y){const a=S.rel.arrows.find(z=>z.id==t.dataset.id),o=a&&geo(a);if(!o)return;
  const r=document.getElementById('cv').getBoundingClientRect(),px=x-r.left,py=y-r.top,s=Math.hypot(px-o.sx,py-o.sy)<=Math.hypot(px-o.ex,py-o.ey)?'f':'t';
  const cur=ends(a),e=cur||{f:['0','N'],t:['1','1']},it=PR.map(([mn,c,nm])=>[(cur&&cur[s][0]==mn&&cur[s][1]==c?'✓ ':'')+'('+mn+','+c+') · '+nm,()=>{
   const n={f:s=='f'?[mn,c]:e.f,t:s=='t'?[mn,c]:e.t};a.fm=n.f[0];a.fc=n.f[1];a.tm=n.t[0];a.tc=n.t[1];a.ty=n.f[1]=='1'&&n.t[1]=='1'?'11':n.f[1]!='1'&&n.t[1]!='1'?'NM':'1N';draw()}]);
  it.push(['Eliminar flecha',()=>{S.rel.arrows=S.rel.arrows.filter(z=>z.id!=a.id);draw()},1]);menu(x,y,it)}
 const dr=draw;
 draw=function(x){dr(x);const E=S.er,cv=document.getElementById('cv');if(S.tab=='rel'){arrows(cv);return}if(S.tab!='er')return;
  cv.querySelectorAll('[data-k=card]').forEach(g=>{const l=E.links.find(z=>z.id==g.dataset.id);if(!l)return;const rc=g.querySelector('rect');rc.setAttribute('x',-27);rc.setAttribute('width',54);rc.classList.toggle('ph',!(l.c&&l.mn));g.querySelector('text').textContent=lab(l)});
  E.rels.forEach(r=>{const t=kind(E,r);if(t)el('text',{x:r.x,y:r.y-42,'text-anchor':'middle',class:'ct',style:'font-weight:700'},cv,t)})};
 function cardMenu(t,x,y){const E=S.er,l=E.links.find(z=>z.id==t.dataset.id);if(!l)return;
  const it=PR.map(([mn,c,nm])=>[(l.mn==mn&&mx(l.c)==c?'✓ ':'')+'('+mn+','+c+') · '+nm,()=>{l.mn=mn;l.c=c;draw()}]);
  it.push(['Sin elegir',()=>{l.mn=null;l.c=null;draw()}]);it.push(['Eliminar asociación',()=>{E.links=E.links.filter(a=>a.id!=l.id);draw()},1]);menu(x,y,it)}
 /* Un clic en la cardinalidad abre el menú (antes giraba entre 1, N y M) */
 document.getElementById('cv').addEventListener('click',e=>{const t=e.target.closest('[data-k=card]');if(!t)return;e.stopImmediatePropagation();cardMenu(t,e.clientX,e.clientY)},true);
 const ctx0=ctx;ctx=function(t,x,y){if(t.dataset.k=='card')return cardMenu(t,x,y);if(t.dataset.k=='arrow')return arrowMenu(t,x,y);ctx0(t,x,y)};
 const ck=checks;checks=function(){const o=ck();if(S.tab=='er')S.er.links.forEach(l=>{const e=S.er.ents.find(x=>x.id==l.e),r=S.er.rels.find(x=>x.id==l.r);if(e&&r&&l.c&&!l.mn)o.push([false,e.name+'–'+r.name+': falta el mínimo','Pulsa la cardinalidad y elige (0,…) o (1,…).'])});return o};
 /* Las tablas generadas nacen en y=30, justo bajo la barra flotante: se bajan y el cambio cuenta como un solo paso del historial */
 const gen0=gen;gen=function(){const s0=H[HI];gen0();if(S.tab!='rel'||!S.rel.tabs.length)return;if(H[HI]!==s0&&H.length>1){H.pop();HI=H.length-1}S.rel.tabs.forEach(t=>{t.y+=80});draw()};
 draw();
})();
