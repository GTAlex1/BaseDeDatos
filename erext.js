/* Extensiones del ER: atributos en las relaciones, entidades débiles (doble rectángulo), relaciones identificadoras (doble rombo) y clave parcial. */
(()=>{
 AK.push(['part','Clave parcial (entidad débil)']);
 const RK=[['attr','Atributo simple'],['multi','Multivalor']],cv=document.getElementById('cv');
 const dr=draw;
 draw=function(x){dr(x);if(S.tab!='er')return;const E=S.er;
  cv.querySelectorAll('[data-k=attr]').forEach(g=>{const e=E.ents.find(z=>z.id==g.dataset.id),a=e&&e.attrs[+g.dataset.i];
   if(a&&a.k=='part'){const c=g.querySelector('circle'),t=g.querySelector('text');if(c)c.setAttribute('stroke-dasharray','3 2');if(t)t.style.textDecoration='underline dashed'}});
  E.ents.forEach(n=>{if(!n.weak)return;const g=cv.querySelector('[data-k=ent][data-id="'+n.id+'"]');if(g)el('rect',{x:n.x-55,y:n.y-19,width:110,height:38,class:'sh',style:'fill:none'},g)});
  E.rels.forEach(r=>{const g=cv.querySelector('[data-k=rel][data-id="'+r.id+'"]');
   if(r.ident&&g)el('polygon',{points:`${r.x},${r.y-28} ${r.x+49},${r.y} ${r.x},${r.y+28} ${r.x-49},${r.y}`,class:'sh',style:'fill:none'},g);
   (r.attrs||[]).forEach((a,i,A)=>{const o=i-(A.length-1)/2,cx=r.x+o*38,cy=r.y+72,w=el('g',{'data-k':'rattr','data-id':r.id,'data-i':i,class:'hit'},cv);
    el('path',{d:`M${r.x+o*16} ${r.y+26}L${cx} ${cy-8}`,class:'ln'},w);circ(w,cx,cy,a.k);
    el('text',{transform:`translate(${cx+4} ${cy+(a.k=='multi'?20:18)}) rotate(-45)`,'text-anchor':'end'},w,a.n)})})};
 /* Menús: atributos de relación, y marcar entidad débil / relación identificadora */
 const ctx1=ctx;ctx=function(t,x,y){const k=t.dataset.k,E=S.er,id=t.dataset.id;
  if(k=='rattr'){const r=E.rels.find(z=>z.id==id),i=+t.dataset.i,a=r&&(r.attrs||[])[i];if(!a)return;
   const it=[['Renombrar',()=>ask('Nombre del atributo',a.n,v=>{a.n=v;draw()})]];RK.forEach(([c,nm])=>it.push([(a.k==c?'✓ ':'')+nm,()=>{a.k=c;draw()}]));
   it.push(['Eliminar',()=>{r.attrs.splice(i,1);draw()},1]);return menu(x,y,it)}
  if(k!='ent'&&k!='rel')return ctx1(t,x,y);
  const m0=menu;menu=function(px,py,it){menu=m0;const add=[];
   if(k=='ent'){const n=E.ents.find(z=>z.id==id);if(n)add.push([n.weak?'✓ Entidad débil (quitar)':'Marcar como entidad débil',()=>{n.weak=!n.weak;draw()}])}
   else{const r=E.rels.find(z=>z.id==id);if(r){add.push(['+ Atributo de la relación',()=>ask('Nombre del atributo','',v=>{(r.attrs=r.attrs||[]).push({n:v,k:'attr'});draw()})]);
    add.push([r.ident?'✓ Relación identificadora (quitar)':'Marcar como relación identificadora',()=>{r.ident=!r.ident;draw()}])}}
   it.splice(Math.max(0,it.length-1),0,...add);m0(px,py,it)};
  try{ctx1(t,x,y)}finally{menu=m0}};
 cv.addEventListener('dblclick',e=>{const t=(document.elementFromPoint(e.clientX,e.clientY)||e.target).closest('[data-k=rattr]');if(!t)return;
  const r=S.er.rels.find(z=>z.id==t.dataset.id),a=r&&(r.attrs||[])[+t.dataset.i];if(a)ask('Nombre del atributo',a.n,v=>{a.n=v;draw()})});
 /* Una entidad débil no necesita clave primaria, sino clave parcial y relación identificadora */
 const ck=checks;checks=function(){let o=ck();if(S.tab!='er')return o;const E=S.er;
  E.ents.filter(e=>e.weak).forEach(e=>{o=o.filter(c=>!c[1].startsWith(e.name+': falta la clave primaria')&&!c[1].startsWith(e.name+': tiene clave primaria'));
   const p=e.attrs.some(a=>a.k=='part'),d=E.rels.some(r=>r.ident&&E.links.some(l=>l.r==r.id&&l.e==e.id));
   o.push([p,e.name+(p?': tiene clave parcial':': falta la clave parcial'),'Añade un atributo de tipo «Clave parcial» (círculo discontinuo).']);
   o.push([d,e.name+(d?': tiene relación identificadora':': falta la relación identificadora'),'Marca como identificadora la relación que la une con su entidad propietaria.'])});
  return o};
 draw();
})();
