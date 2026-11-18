/* Editor UML: diagramas de clases y de casos de uso. Se carga desde uml.html y usa DB (store.js) y UMLD (dibujo.js). */
(async()=>{
 const $=q=>document.querySelector(q),ID=new URLSearchParams(location.search).get('id'),uid=()=>Math.random().toString(36).slice(2,9);
 const{NS,LIGHT,VARS,el,paint,size,box}=UMLD;
 if(!ID){location.replace('index.html');return}
 await DB.ready;
 let doc=null;try{doc=await DB.get(ID)}catch(e){}
 const d0=doc&&doc.data;
 if(!doc||!d0){document.body.innerHTML='<p class="mu" style="padding:24px">No se encontró este diagrama o no tienes acceso. <a href="index.html">Volver a mis diagramas</a></p>';return}
 if(d0.type!=='uml'){location.replace('editor.html?id='+encodeURIComponent(ID));return}
 $('#ttl').value=doc.title;document.title=doc.title+' · UML';

 let M={els:Array.isArray(d0.els)?d0.els:[],rels:Array.isArray(d0.rels)?d0.rels:[]},sel=null,mode=null,src=null,V={x:0,y:0,k:1},D=null,H=[],HI=-1,LP=0;
 const cv=$('#cv'),find=i=>M.els.find(e=>e.id==i);
 const UC=[['assoc','Asociación'],['incl','«include» (incluye)'],['ext','«extend» (extiende)'],['inh','Generalización']];
 const CL=[['assoc','Asociación'],['nav','Asociación dirigida →'],['dep','Dependencia'],['inh','Herencia (hacia la clase padre)'],['real','Realización (implementa la interfaz)'],['agg','Agregación (rombo en el origen)'],['comp','Composición (rombo en el origen)']];
 const NT=[['note','Línea de nota']];

 function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3000)}
 function ask(t,v,cb){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl" id="at"></p><input id="ai" maxlength="200"><div class="row"><button class="btn" id="c">Cancelar</button><button class="btn pri" id="o">Aceptar</button></div></div>';d.style.display='flex';$('#at').textContent=t;const i=$('#ai');i.value=v||'';i.focus();i.select();const ok=()=>{const x=i.value.trim();d.style.display='none';cb(x)};$('#o').onclick=ok;$('#c').onclick=()=>d.style.display='none';i.onkeydown=e=>{if(e.key=='Enter')ok();if(e.key=='Escape')d.style.display='none'}}
 function menu(x,y,it){const m=$('#menu');m.innerHTML='';it.forEach(([t,f,c])=>{const b=document.createElement('button');b.textContent=t;if(c)b.className='dg';b.onclick=()=>{m.style.display='none';f()};m.appendChild(b)});m.style.display='block';m.style.left=Math.max(4,Math.min(x,innerWidth-215))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-Math.min(it.length*38+12,innerHeight*.7)-8))+'px'}
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#menu'))$('#menu').style.display='none'},true);

 /* Historial y guardado */
 const snap=()=>{const s=JSON.stringify(M);if(H[HI]===s)return;H=H.slice(0,HI+1);H.push(s);if(H.length>80)H.shift();HI=H.length-1};
 const hist=d=>{const i=HI+d;if(i<0||i>=H.length)return;HI=i;M=JSON.parse(H[i]);sel=null;draw(true)};
 const cur=()=>JSON.stringify({v:1,type:'uml',els:M.els,rels:M.rels}),st=t=>{$('#st').textContent=t},ok=()=>st(DB.isLocal(ID)?'Guardado en este navegador':'Guardado en la nube');
 let last=cur(),busy=false;
 async function flush(){while(busy)await new Promise(r=>setTimeout(r,50));const c=cur();if(c===last)return;busy=true;st('Guardando…');try{await DB.save(ID,$('#ttl').value.trim()||'Sin título',JSON.parse(c));last=c;ok()}catch(e){st('No se pudo guardar')}busy=false}
 $('#ttl').onchange=async()=>{const t=$('#ttl').value.trim()||'Sin título';$('#ttl').value=t;document.title=t+' · UML';st('Guardando…');try{await DB.rename(ID,t);ok()}catch(e){st('No se pudo guardar')}};
 $('#bk').onclick=async e=>{e.preventDefault();await flush();location.href='index.html'};
 addEventListener('pagehide',flush);

 function bar(){const b=(a,t,on)=>`<button class="btn${on?' on':''}" data-a="${a}">${t}</button>`;
  $('#ubar').innerHTML=b('undo','Deshacer')+b('redo','Rehacer')+'<span class="sp"></span>'+b('class','+ Clase')+b('iface','+ Interfaz')+b('actor','+ Actor')+b('uc','+ Caso de uso')+b('sys','+ Sistema')+b('pkg','+ Paquete')+b('note','+ Nota')+'<span class="sp"></span>'+b('conn',mode?(src?'Elige el destino…':'Elige el origen…'):'Conectar',!!mode)+'<span class="sp"></span>'+b('png','PNG')+b('svg','SVG')}
 function draw(r){cv.innerHTML='';const vp=el('g',{transform:`translate(${V.x} ${V.y}) scale(${V.k})`},cv);paint(M,vp,VARS,true,sel);bar();if(!r)snap()}
 const spot=()=>{const r=cv.getBoundingClientRect(),n=M.els.length;return{x:Math.round((r.width/2-V.x)/V.k-75+(n*37)%120-60),y:Math.round((r.height/2-V.y)/V.k-40+(n*53)%100-50)}};
 function addEl(t,name,extra){const p=spot(),e=Object.assign({id:uid(),t,x:p.x,y:p.y,name},extra||{});M.els.push(e);sel=e.id;draw();return e}

 function editClass(e){const d=$('#dlg');
  d.innerHTML='<div class="box"><p class="lbl">Clase</p><input id="un" maxlength="80" placeholder="Nombre"><input id="us" list="usl" maxlength="30" placeholder="Estereotipo (opcional): abstract, interface, enum, entity…"><datalist id="usl"><option value="abstract"><option value="interface"><option value="enum"><option value="entity"><option value="utility"></datalist><p class="lbl" style="margin:0">Atributos (uno por línea, p. ej. - nombre: String)</p><textarea id="ua" spellcheck="false" style="height:90px"></textarea><p class="lbl" style="margin:0">Métodos (uno por línea, p. ej. + calcular(): int)</p><textarea id="um" spellcheck="false" style="height:90px"></textarea><p class="mu">Visibilidad: + público, - privado, # protegido, ~ paquete. Añade {static} para subrayar un miembro estático y {abstract} para ponerlo en cursiva.</p><div class="row"><button class="btn" id="uc">Cancelar</button><button class="btn pri" id="uo">Aceptar</button></div></div>';d.style.display='flex';
  $('#un').value=e.name;$('#us').value=e.st||'';$('#ua').value=(e.attrs||[]).join('\n');$('#um').value=(e.meths||[]).join('\n');$('#un').focus();
  const ls=id=>$(id).value.split('\n').map(s=>s.trim()).filter(Boolean);
  $('#uc').onclick=()=>d.style.display='none';
  $('#uo').onclick=()=>{e.name=$('#un').value.trim()||'Clase';e.st=$('#us').value.trim().replace(/[«»<>]/g,'');e.attrs=ls('#ua');e.meths=ls('#um');d.style.display='none';draw()}}
 function rename(e){if(e.t=='class')return editClass(e);ask(e.t=='note'?'Texto de la nota':'Nombre',e.name,v=>{if(v){e.name=v;draw()}})}
 function del(id){if(find(id)){M.els=M.els.filter(e=>e.id!=id);M.rels=M.rels.filter(r=>r.a!=id&&r.b!=id);M.rels.forEach(r=>{if(r.ac==id)r.ac=null})}else M.rels=M.rels.filter(r=>r.id!=id);if(sel==id)sel=null;draw()}
 function listFor(a,b){return[a,b].some(e=>e&&e.t=='note')?NT:[a,b].some(e=>e&&(e.t=='actor'||e.t=='uc'))?UC:CL}
 function typeMenu(a,b,x,y){menu(x,y,listFor(a,b).map(([t,nm])=>[nm,()=>{const r={id:uid(),a:a.id,b:b.id,t,lab:'',ma:'',mb:'',ra:'',rb:''};M.rels.push(r);sel=r.id;draw()}]))}
 function relMenu(id,x,y){const r=M.rels.find(z=>z.id==id);if(!r)return;
  const set=(k,t)=>ask(t,r[k]||'',v=>{r[k]=v;draw()}),it=listFor(find(r.a),find(r.b)).map(([t,nm])=>[(r.t==t?'✓ ':'')+nm,()=>{r.t=t;draw()}]);
  it.push(['Etiqueta…',()=>set('lab','Etiqueta de la relación')]);
  it.push(['Multiplicidad origen…',()=>set('ma','Multiplicidad en el origen (p. ej. 1, 0..*, 1..*)')]);it.push(['Multiplicidad destino…',()=>set('mb','Multiplicidad en el destino (p. ej. 1, 0..*, 1..*)')]);
  it.push(['Rol origen…',()=>set('ra','Rol en el origen')]);it.push(['Rol destino…',()=>set('rb','Rol en el destino')]);
  it.push(['Clase de asociación…',()=>{const cs=M.els.filter(e=>e.t=='class'),o=cs.map(c=>[(r.ac==c.id?'✓ ':'')+c.name,()=>{r.ac=c.id;draw()}]);if(r.ac)o.push(['Quitar la clase de asociación',()=>{r.ac=null;draw()}]);menu(x,y,o.length?o:[['(No hay clases)',()=>{}]])}]);
  it.push(['Invertir sentido',()=>{[r.a,r.b]=[r.b,r.a];[r.ma,r.mb]=[r.mb,r.ma];[r.ra,r.rb]=[r.rb,r.ra];draw()}]);it.push(['Eliminar',()=>del(id),1]);menu(x,y,it)}
 function elMenu(e,x,y){const it=[];
  it.push([e.t=='class'?'Editar clase':'Renombrar',()=>rename(e)]);
  if(e.t!='sys')it.push(['Conectar desde aquí',()=>{mode=true;src=e.id;sel=e.id;draw(true)}]);
  if(box(e))it.push(['Tamaño…',()=>ask('Ancho x alto (p. ej. 400x300)',Math.round(e.w)+'x'+Math.round(e.h),v=>{const m=v.match(/(\d+)\D+(\d+)/);if(m){e.w=Math.max(120,+m[1]);e.h=Math.max(80,+m[2]);draw()}})]);
  it.push(['Duplicar',()=>{const c=JSON.parse(JSON.stringify(e));c.id=uid();c.x+=30;c.y+=30;M.els.push(c);sel=c.id;draw()}]);it.push(['Eliminar',()=>del(e.id),1]);menu(x,y,it)}
 function pick(e,ev){if(e.t=='sys')return;if(!src){src=e.id;sel=e.id;draw(true);return}const a=find(src);mode=null;src=null;typeMenu(a,e,ev.clientX,ev.clientY);draw(true)}

 /* Interacción: mover elementos, desplazar el lienzo y zoom con la rueda */
 cv.addEventListener('pointerdown',e=>{if(e.button)return;const t=e.target.closest('[data-k]');clearTimeout(LP);
  if(t&&t.dataset.k=='el'){const n=find(t.dataset.id);if(!n)return;if(mode){pick(n,e);return}sel=n.id;D={m:'mv',n,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,moved:0};cv.setPointerCapture(e.pointerId);
   if(e.pointerType!='mouse')LP=setTimeout(()=>{D=null;elMenu(n,e.clientX,e.clientY)},550);draw(true);return}
  if(t&&t.dataset.k=='rel'){sel=t.dataset.id;D={m:'rel',id:sel,sx:e.clientX,sy:e.clientY,moved:0};cv.setPointerCapture(e.pointerId);draw(true);return}
  if(mode){mode=null;src=null;draw(true);return}
  sel=null;D={m:'pan',sx:e.clientX,sy:e.clientY,ox:V.x,oy:V.y,moved:0};cv.setPointerCapture(e.pointerId);draw(true)});
 cv.addEventListener('pointermove',e=>{if(!D)return;const dx=e.clientX-D.sx,dy=e.clientY-D.sy;D.moved=Math.max(D.moved,Math.hypot(dx,dy));if(D.moved>6)clearTimeout(LP);
  if(D.m=='mv'){D.n.x=D.ox+dx/V.k;D.n.y=D.oy+dy/V.k;draw(true)}else if(D.m=='pan'){V.x=D.ox+dx;V.y=D.oy+dy;draw(true)}});
 cv.addEventListener('pointerup',e=>{clearTimeout(LP);if(!D)return;const d=D;D=null;
  if(d.m=='rel'&&d.moved<=5)relMenu(d.id,e.clientX,e.clientY);draw(!(d.m=='mv'&&d.moved>5))});
 cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),k=Math.min(3,Math.max(.25,V.k*(e.deltaY<0?1.1:1/1.1))),x=e.clientX-r.left,y=e.clientY-r.top;V.x=x-(x-V.x)*k/V.k;V.y=y-(y-V.y)*k/V.k;V.k=k;draw(true)},{passive:false});
 cv.addEventListener('dblclick',e=>{const t=e.target.closest('[data-k]');if(!t)return;if(t.dataset.k=='el'){const n=find(t.dataset.id);if(n)rename(n)}else{const r=M.rels.find(z=>z.id==t.dataset.id);if(r)ask('Etiqueta de la relación',r.lab||'',v=>{r.lab=v;draw()})}});
 cv.addEventListener('contextmenu',e=>{e.preventDefault();const t=e.target.closest('[data-k]');
  if(t&&t.dataset.k=='el'){const n=find(t.dataset.id);if(n)elMenu(n,e.clientX,e.clientY)}else if(t)relMenu(t.dataset.id,e.clientX,e.clientY)
  else if(M.els.length)menu(e.clientX,e.clientY,[['Borrar todo el diagrama',()=>ask('Escribe «sí» para borrar todo (se puede deshacer con Ctrl+Z)','',v=>{if(/^s[ií]/i.test(v)){M={els:[],rels:[]};sel=null;draw()}}),1]])});

 /* Exportar como imagen: siempre con colores claros y recortada al contenido */
 function dl(blob,nm){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=nm;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)}
 function img(fmt){if(!M.els.length){toast('No hay nada que exportar.');return}
  M.els.forEach(size);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;M.els.forEach(e=>{x0=Math.min(x0,e.x);y0=Math.min(y0,e.y);x1=Math.max(x1,e.x+e.w+(M.rels.some(r=>r.a==e.id&&r.b==e.id)?60:0));y1=Math.max(y1,e.y+e.h)});
  const PAD=40,w=Math.ceil(x1-x0+2*PAD),h=Math.ceil(y1-y0+2*PAD),s=document.createElementNS(NS,'svg');
  s.setAttribute('xmlns',NS);s.setAttribute('viewBox',`${x0-PAD} ${y0-PAD} ${w} ${h}`);s.setAttribute('width',w);s.setAttribute('height',h);
  el('rect',{x:x0-PAD,y:y0-PAD,width:w,height:h,fill:'#FBFBFD'},s);paint(M,s,LIGHT,false);
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(s),nm=($('#ttl').value.replace(/[\\/:*?"<>|]+/g,'').trim()||'diagrama')+'-uml';
  if(fmt=='svg'){dl(new Blob([xml],{type:'image/svg+xml'}),nm+'.svg');return}
  const k=Math.max(1,Math.min(2,Math.sqrt(16e6/(w*h)))),im=new Image(),u=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
  im.onload=()=>{const c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);const g=c.getContext('2d');g.fillStyle='#FBFBFD';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b&&dl(b,nm+'.png'),'image/png')};
  im.onerror=()=>{URL.revokeObjectURL(u);toast('No se pudo crear el PNG. Prueba con el SVG.')};im.src=u}

 $('#ubar').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a=='undo')hist(-1);else if(a=='redo')hist(1);else if(a=='png'||a=='svg')img(a);
  else if(a=='conn'){mode=mode?null:true;src=null;draw(true)}
  else if(a=='class'){editClass(addEl('class','Clase',{st:'',attrs:[],meths:[]}))}
  else if(a=='iface'){editClass(addEl('class','Interfaz',{st:'interface',attrs:[],meths:[]}))}
  else{const T={actor:'Actor',uc:'Caso de uso',sys:'Sistema',pkg:'Paquete',note:'Nota'};ask(a=='note'?'Texto de la nota':'Nombre',T[a],v=>{if(v)addEl(a,v)})}});
 addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;const d=$('#dlg');if(d&&d.style.display=='flex')return;const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&(k=='z'||k=='y')){e.preventDefault();hist(k=='y'||e.shiftKey?1:-1)}
  else if((k=='delete'||k=='backspace')&&sel){e.preventDefault();del(sel)}else if(k=='escape'){mode=null;src=null;draw(true)}});

 snap();draw(true);ok();setInterval(flush,1200);
})();
