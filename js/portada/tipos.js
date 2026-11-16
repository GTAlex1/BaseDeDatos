/* Tipo de diagrama: al crear uno se elige Base de datos o UML. Los dos comparten el límite de 30 por cuenta. */
newDoc=function(){const d=$('#dlg');
 d.innerHTML='<div class="box"><p class="lbl">Tipo de diagrama</p><button class="btn" id="tb" style="text-align:left;padding:10px 14px;min-height:56px"><b>Base de datos</b><br><small>Entidad-relación, relacional y normalización</small></button><button class="btn" id="tu" style="text-align:left;padding:10px 14px;min-height:56px"><b>UML</b><br><small>Diagramas de clases y de casos de uso</small></button><div class="row"><button class="btn" id="tc">Cancelar</button></div></div>';d.style.display='flex';
 const go=uml=>ask('Nombre del diagrama','Sin título',async t=>{try{const id=await DB.create(t,uml?DB.blankUml():DB.blank());location.href=(uml?'uml.html':'editor.html')+'?id='+encodeURIComponent(id)}catch(e){toast(e.message)}});
 $('#tb').onclick=()=>go(false);$('#tu').onclick=()=>go(true);$('#tc').onclick=shut};
$('#nw2').onclick=()=>newDoc();

/* Las tarjetas UML abren uml.html y llevan su etiqueta */
const render1=render;render=function(){render1();docs.forEach(d=>{if(d.kind!='uml')return;const h='editor.html?id='+encodeURIComponent(d.id);
  document.querySelectorAll('#grid a[href="'+h+'"]').forEach(a=>{a.setAttribute('href','uml.html?id='+encodeURIComponent(d.id));if(a.classList.contains('tt')){const s=a.closest('.card').querySelector('.sub');if(s&&!s.querySelector('.uml'))s.insertAdjacentHTML('afterbegin','<span class="pill uml" style="background:var(--ti);color:var(--ac)">UML</span> · ')}})})};
const cardMenu1=cardMenu;cardMenu=function(id,btn){const d=docs.find(x=>x.id==id);if(!d||d.kind!='uml')return cardMenu1(id,btn);
 const m0=menu;menu=function(x,y,it){menu=m0;const o=it.find(i=>i[0]=='Abrir');if(o)o[1]=()=>{location.href='uml.html?id='+encodeURIComponent(id)};m0(x,y,it)};
 try{cardMenu1(id,btn)}finally{menu=m0}};

/* Miniatura de los diagramas UML (cajas y líneas, como la del ER) */
const thumb1=thumb;thumb=function(d){if(!d||d.type!='uml')return thumb1(d);const B=d.els||[];if(!B.length)return '';
 const x0=Math.min(...B.map(e=>e.x)),y0=Math.min(...B.map(e=>e.y)),x1=Math.max(...B.map(e=>e.x+(e.w||150))),y1=Math.max(...B.map(e=>e.y+(e.h||60))),s=Math.min(180/(x1-x0||1),96/(y1-y0||1),1.2),ox=100-(x0+x1)/2*s,oy=60-(y0+y1)/2*s,by={};B.forEach(e=>by[e.id]=e);
 const cx=e=>((e.x+(e.w||150)/2)*s+ox).toFixed(1),cy=e=>((e.y+(e.h||60)/2)*s+oy).toFixed(1);let o='';
 (d.rels||[]).forEach(r=>{const a=by[r.a],b=by[r.b];if(a&&b)o+='<line x1="'+cx(a)+'" y1="'+cy(a)+'" x2="'+cx(b)+'" y2="'+cy(b)+'" class="tl"/>'});
 B.forEach(e=>{const w=((e.w||150)*s).toFixed(1),h=((e.h||60)*s).toFixed(1);o+=e.t=='uc'?'<ellipse cx="'+cx(e)+'" cy="'+cy(e)+'" rx="'+w/2+'" ry="'+h/2+'" class="te"/>':e.t=='sys'?'<rect x="'+((e.x*s+ox).toFixed(1))+'" y="'+((e.y*s+oy).toFixed(1))+'" width="'+w+'" height="'+h+'" rx="3" fill="none" stroke-dasharray="4 3" class="tl"/>':'<rect x="'+((e.x*s+ox).toFixed(1))+'" y="'+((e.y*s+oy).toFixed(1))+'" width="'+w+'" height="'+h+'" rx="2" class="te"/>'});
 return '<svg viewBox="0 0 200 120" aria-hidden="true">'+o+'</svg>'};
refresh();
