/* Relaciones reflexivas: una entidad puede asociarse dos veces a la misma relación (p. ej. EMPLEADO dirige a EMPLEADO). Las dos líneas se dibujan curvadas, cada una con su cardinalidad y su rol, y al generar el relacional las columnas FK se nombran con el rol. */
(()=>{
 const dr=draw;
 draw=function(x){dr(x);if(S.tab!='er')return;const E=S.er,cv=document.getElementById('cv'),m={};E.ents.concat(E.rels).forEach(n=>m[n.id]=n);
  const V=E.links.filter(l=>m[l.e]&&m[l.r]),lines=[...cv.querySelectorAll(':scope>line')].slice(0,V.length);
  V.forEach((l,i)=>{const a=m[l.e],b=m[l.r],P=V.filter(z=>z.e==l.e&&z.r==l.r),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,t=Math.min(86,d/2-20),g=cv.querySelector('[data-k=card][data-id="'+l.id+'"]');
   if(P.length>1&&lines[i]){const off=P.indexOf(l)?-70:70,nx=-dy/d,ny=dx/d,p=el('path',{d:`M${a.x} ${a.y}Q${(a.x+b.x)/2+nx*off} ${(a.y+b.y)/2+ny*off} ${b.x} ${b.y}`,class:'ln',fill:'none'});lines[i].replaceWith(p);
    if(g){const u=t/d,o=2*u*(1-u)*off;g.setAttribute('transform',`translate(${a.x+dx/d*t+nx*o} ${a.y+dy/d*t+ny*o})`)}}
   if(g&&l.rol)el('text',{x:0,y:32,'text-anchor':'middle',style:'font-style:italic;font-size:12px'},g,l.rol)})};
 /* Menú de entidad o relación: añade «Asociar otra vez con…» cuando ya hay una sola asociación entre las dos */
 const ctx1=ctx;ctx=function(t,x,y){const k=t.dataset.k;if(k!='ent'&&k!='rel')return ctx1(t,x,y);
  const m0=menu;menu=function(px,py,it){menu=m0;const E=S.er,n=(e,r)=>E.links.filter(l=>l.e==e&&l.r==r).length,add=[];
   if(k=='ent')E.rels.forEach(r=>{if(n(t.dataset.id,r.id)==1)add.push(['Asociar otra vez con: '+r.name+' (reflexiva)',()=>{E.links.push({id:uid(),e:t.dataset.id,r:r.id,c:null});draw()}])});
   else E.ents.forEach(e=>{if(n(e.id,t.dataset.id)==1)add.push(['Asociar otra vez con: '+e.name+' (reflexiva)',()=>{E.links.push({id:uid(),e:e.id,r:t.dataset.id,c:null});draw()}])});
   it.splice(Math.max(0,it.length-1),0,...add);m0(px,py,it)};
  try{ctx1(t,x,y)}finally{menu=m0}};
 /* Al generar el relacional, las FK de una relación reflexiva toman el nombre del rol (id_jefe) en vez de repetir el de la PK */
 const gen1=gen;gen=function(){const s0=H[HI];gen1();if(S.tab!='rel')return;const E=S.er,used=new Set(),rn=(b,r)=>b+'_'+String(r).trim().toLowerCase().replace(/\s+/g,'_');let ch=0;
  E.rels.forEach(r=>{const L=E.links.filter(l=>l.r==r.id);if(L.length!=2||L[0].e!=L[1].e||L.some(l=>!l.c))return;const[a,b]=L,ent=E.ents.find(e=>e.id==a.e);if(!ent)return;
   if(a.c!='1'&&b.c!='1'){const c=S.rel.tabs.find(t=>t.name==r.name.toUpperCase());if(c&&c.rows.length>=2){[a,b].forEach((l,i)=>{c.rows[i].n=rn(c.rows[i].n,l.rol||i+1)});ch=1}}
   else{const t=S.rel.tabs.find(t=>t.name==ent.name.toUpperCase()),one=b.c=='1'&&a.c!='1'?b:a,w=t&&S.rel.arrows.find(x=>x.f[0]==t.id&&x.t[0]==t.id&&!used.has(x.id));
    if(w){used.add(w.id);const row=t.rows[w.f[1]];row.n=rn(row.n,one.rol||r.name);ch=1}}});
  if(ch){if(H[HI]!==s0&&H.length>1){H.pop();HI=H.length-1}draw()}};
 draw();
})();
