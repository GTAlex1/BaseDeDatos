/* Cardinalidades con mínimo y máximo, p. ej. (0,N), en cada línea entidad–relación; y encima de cada relación su tipo (1:1, 1:N o N:M). También coloca las tablas generadas debajo de la barra flotante. */
(()=>{
 const lab=l=>l.c||l.mn?'('+(l.mn||'?')+','+(l.c||'?')+')':'?';
 const kind=(E,r)=>{const L=E.links.filter(l=>l.r==r.id);if(L.length!=2||L.some(l=>!l.c))return '';const a=L[0].c=='1',b=L[1].c=='1';return a&&b?'1:1':a||b?'1:N':'N:M'};
 const dr=draw;
 draw=function(x){dr(x);if(S.tab!='er')return;const E=S.er,cv=document.getElementById('cv');
  cv.querySelectorAll('[data-k=card]').forEach(g=>{const l=E.links.find(z=>z.id==g.dataset.id);if(!l)return;const rc=g.querySelector('rect');rc.setAttribute('x',-27);rc.setAttribute('width',54);rc.classList.toggle('ph',!(l.c&&l.mn));g.querySelector('text').textContent=lab(l)});
  E.rels.forEach(r=>{const t=kind(E,r);if(t)el('text',{x:r.x,y:r.y-42,'text-anchor':'middle',class:'ct',style:'font-weight:700'},cv,t)})};
 function cardMenu(t,x,y){const E=S.er,l=E.links.find(z=>z.id==t.dataset.id);if(!l)return;
  const it=[['0','1','(0,1) · como mucho uno'],['1','1','(1,1) · exactamente uno'],['0','N','(0,N) · cualquier número'],['1','N','(1,N) · al menos uno'],['0','M','(0,M) · cualquier número'],['1','M','(1,M) · al menos uno']].map(([mn,c,nm])=>[(l.mn==mn&&l.c==c?'✓ ':'')+nm,()=>{l.mn=mn;l.c=c;draw()}]);
  it.push(['Sin elegir',()=>{l.mn=null;l.c=null;draw()}]);it.push(['Eliminar asociación',()=>{E.links=E.links.filter(a=>a.id!=l.id);draw()},1]);menu(x,y,it)}
 /* Un clic en la cardinalidad abre el menú (antes giraba entre 1, N y M) */
 document.getElementById('cv').addEventListener('click',e=>{const t=e.target.closest('[data-k=card]');if(!t)return;e.stopImmediatePropagation();cardMenu(t,e.clientX,e.clientY)},true);
 const ctx0=ctx;ctx=function(t,x,y){if(t.dataset.k=='card')return cardMenu(t,x,y);ctx0(t,x,y)};
 const ck=checks;checks=function(){const o=ck();if(S.tab=='er')S.er.links.forEach(l=>{const e=S.er.ents.find(x=>x.id==l.e),r=S.er.rels.find(x=>x.id==l.r);if(e&&r&&l.c&&!l.mn)o.push([false,e.name+'–'+r.name+': falta el mínimo','Pulsa la cardinalidad y elige (0,…) o (1,…).'])});return o};
 /* Las tablas generadas nacen en y=30, justo bajo la barra flotante: se bajan y el cambio cuenta como un solo paso del historial */
 const gen0=gen;gen=function(){const n=H.length,i=HI;gen0();if(S.tab!='rel'||!S.rel.tabs.length)return;H.length=n;HI=i;S.rel.tabs.forEach(t=>{t.y+=80});draw()};
 draw();
})();
