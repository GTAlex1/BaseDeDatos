/* Editor UML: diagramas de clases y de casos de uso. Se carga desde uml.html y usa DB (store.js). */
(async()=>{
 const $=q=>document.querySelector(q),NS='http://www.w3.org/2000/svg',ID=new URLSearchParams(location.search).get('id'),uid=()=>Math.random().toString(36).slice(2,9);
 if(!ID){location.replace('index.html');return}
 await DB.ready;
 let doc=null;try{doc=await DB.get(ID)}catch(e){}
 const d0=doc&&doc.data;
 if(!doc||!d0){document.body.innerHTML='<p class="mu" style="padding:24px">No se encontró este diagrama o no tienes acceso. <a href="index.html">Volver a mis diagramas</a></p>';return}
 if(d0.type!=='uml'){location.replace('editor.html?id='+encodeURIComponent(ID));return}
 $('#ttl').value=doc.title;document.title=doc.title+' · UML';

 let M={els:Array.isArray(d0.els)?d0.els:[],rels:Array.isArray(d0.rels)?d0.rels:[]},sel=null,mode=null,src=null,V={x:0,y:0,k:1},D=null,H=[],HI=-1,LP=0;
 const cv=$('#cv'),FF='Inter,system-ui,sans-serif',LH=16,tw=s=>String(s).length*7.2,find=i=>M.els.find(e=>e.id==i);
 const LIGHT={sf:'#fff',tx:'#1B1F24',mu:'#5B6470',ac:'#2F5BEA',ti:'#EEF2FF',nt:'#FFF6CC',ntt:'#4A3B00'},VARS={sf:'var(--sf)',tx:'var(--tx)',mu:'var(--mu)',ac:'var(--ac)',ti:'var(--ti)',nt:'var(--nt)',ntt:'var(--ntt)'};
 const UC=[['assoc','Asociación'],['incl','«include» (incluye)'],['ext','«extend» (extiende)'],['inh','Generalización']];
 const CL=[['assoc','Asociación'],['nav','Asociación dirigida →'],['dep','Dependencia'],['inh','Herencia (hacia la clase padre)'],['real','Realización (implementa la interfaz)'],['agg','Agregación (rombo en el origen)'],['comp','Composición (rombo en el origen)']];
 const DASH=['dep','real','incl','ext','note'];

 function el(t,a,p,tx){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(tx!=null)e.textContent=tx;if(p)p.appendChild(e);return e}
 const wrap=(s,n)=>{const o=[];let l='';String(s).split(/\s+/).forEach(w=>{if((l+' '+w).trim().length>n){if(l)o.push(l);l=w}else l=(l+' '+w).trim()});o.push(l);return o};
 function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3000)}
 function ask(t,v,cb){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl" id="at"></p><input id="ai" maxlength="200"><div class="row"><button class="btn" id="c">Cancelar</button><button class="btn pri" id="o">Aceptar</button></div></div>';d.style.display='flex';$('#at').textContent=t;const i=$('#ai');i.value=v||'';i.focus();i.select();const ok=()=>{const x=i.value.trim();d.style.display='none';cb(x)};$('#o').onclick=ok;$('#c').onclick=()=>d.style.display='none';i.onkeydown=e=>{if(e.key=='Enter')ok();if(e.key=='Escape')d.style.display='none'}}
 function menu(x,y,it){const m=$('#menu');m.innerHTML='';it.forEach(([t,f,c])=>{const b=document.createElement('button');b.textContent=t;if(c)b.className='dg';b.onclick=()=>{m.style.display='none';f()};m.appendChild(b)});m.style.display='block';m.style.left=Math.max(4,Math.min(x,innerWidth-215))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-Math.min(it.length*38+12,innerHeight*.7)-8))+'px'}
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#menu'))$('#menu').style.display='none'},true);

 /* Tamaños: se calculan a partir del contenido y se guardan en cada elemento (w, h) */
 function size(e){
  if(e.t=='class'){const A=e.attrs||[],Me=e.meths||[],hd=e.st&&e.st!='abstract'||e.st=='abstract'?46:32;e.w=Math.ceil(Math.max(150,...[e.name,...A,...Me].map(s=>tw(s)+24)));e.h=hd+(A.length?A.length*LH+10:12)+(Me.length?Me.length*LH+10:12)}
  else if(e.t=='actor'){e.w=70;e.h=96}
  else if(e.t=='uc'){e.w=Math.ceil(Math.max(150,tw(e.name)+36));e.h=64}
  else if(e.t=='note'){e.w=190;e.h=wrap(e.name,26).length*LH+16}
  else{e.w=e.w||340;e.h=e.h||240}}
 function edge(e,tx,ty){const cx=e.x+e.w/2,cy=e.y+e.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return[cx,cy];
  if(e.t=='uc'){const a=e.w/2,b=e.h/2,k=1/Math.sqrt(dx*dx/(a*a)+dy*dy/(b*b));return[cx+dx*k,cy+dy*k]}
  const k=Math.min(e.w/2/Math.abs(dx||1e-9),e.h/2/Math.abs(dy||1e-9));return[cx+dx*k,cy+dy*k]}
 function geo(a,b){
  if(a===b){const x=a.x+a.w,y=a.y+a.h*.3,y2=a.y+a.h*.7,P=[[x,y],[x+38,y],[x+38,y2],[x,y2]];return{pts:P,pa:P[0],pb:P[3],da:[-1,0],db:[-1,0],mid:[x+38,(y+y2)/2],n:[0,-1]}}
  const ca=[a.x+a.w/2,a.y+a.h/2],cb=[b.x+b.w/2,b.y+b.h/2],pa=edge(a,cb[0],cb[1]),pb=edge(b,ca[0],ca[1]),L=Math.hypot(pb[0]-pa[0],pb[1]-pa[1])||1,u=[(pb[0]-pa[0])/L,(pb[1]-pa[1])/L];
  return{pts:[pa,pb],pa,pb,da:[-u[0],-u[1]],db:u,mid:[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2],n:[-u[1],u[0]]}}

 /* Dibujo: P es la paleta (variables CSS en pantalla, colores fijos al exportar); live añade selección y datos para los eventos */
 function mark(g,P,k,pt,d){const[ux,uy]=d,nx=-uy,ny=ux,q=(a,b)=>[pt[0]-ux*a+nx*b,pt[1]-uy*a+ny*b];
  if(k=='ar')el('path',{d:`M${q(12,6)}L${pt}L${q(12,-6)}`,fill:'none',stroke:P.tx,'stroke-width':1.5},g);
  else if(k=='tr')el('path',{d:`M${pt}L${q(14,8)}L${q(14,-8)}Z`,fill:P.sf,stroke:P.tx,'stroke-width':1.5},g);
  else el('path',{d:`M${pt}L${q(10,6)}L${q(20,0)}L${q(10,-6)}Z`,fill:k=='df'?P.tx:P.sf,stroke:P.tx,'stroke-width':1.5},g)}
 function paint(g,P,live){
  const T=(p,x,y,s,o={})=>el('text',{x,y,fill:o.c||P.tx,'font-family':FF,'font-size':o.fs||13,'font-weight':o.b?700:400,'font-style':o.i?'italic':'normal','text-anchor':o.a||'start'},p,s);
  const sk=id=>live&&sel==id?P.ac:P.tx,sw=id=>live&&sel==id?2.6:1.6,at=(id,x)=>live?Object.assign({'data-k':'el','data-id':id},x||{}):{};
  M.els.forEach(size);
  M.els.filter(e=>e.t=='sys').forEach(e=>{const q=el('g',at(e.id),g);
   el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,rx:6,fill:'none',stroke:sk(e.id),'stroke-width':sw(e.id),style:'pointer-events:stroke'},q);
   el('rect',{x:e.x,y:e.y,width:e.w,height:26,fill:'transparent'},q);T(q,e.x+e.w/2,e.y+18,e.name,{a:'middle',b:1})});
  M.rels.forEach(r=>{const a=find(r.a),b=find(r.b);if(!a||!b)return;const o=geo(a,b),q=el('g',live?{'data-k':'rel','data-id':r.id}:{},g),d=o.pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join('');
   el('path',{d,fill:'none',stroke:'transparent','stroke-width':14},q);
   el('path',{d,fill:'none',stroke:sk(r.id),'stroke-width':sw(r.id),'stroke-dasharray':DASH.includes(r.t)?'6 4':'none'},q);
   const A={agg:'dh',comp:'df'}[r.t],B={nav:'ar',dep:'ar',incl:'ar',ext:'ar',inh:'tr',real:'tr'}[r.t];
   if(A)mark(q,P,A,o.pa,o.da);if(B)mark(q,P,B,o.pb,o.db);
   const lb=r.lab||(r.t=='incl'?'«include»':r.t=='ext'?'«extend»':'');if(lb)T(q,o.mid[0]+o.n[0]*12,o.mid[1]+o.n[1]*12+4,lb,{a:'middle',i:1});
   const end=(pt,d,m,rl)=>{const n=[-d[1],d[0]],px=pt[0]-d[0]*22,py=pt[1]-d[1]*22;if(m)T(q,px+n[0]*12,py+n[1]*12+4,m,{a:'middle'});if(rl)T(q,px-n[0]*12,py-n[1]*12+4,rl,{a:'middle',i:1,c:P.mu})};
   end(o.pa,o.da,r.ma,r.ra);end(o.pb,o.db,r.mb,r.rb)});
  M.els.filter(e=>e.t!='sys').forEach(e=>{const q=el('g',at(e.id,{style:'cursor:move'}),g),s=sk(e.id),w=sw(e.id),cx=e.x+e.w/2;
   if(e.t=='class'){const A=e.attrs||[],Me=e.meths||[],ab=e.st=='abstract',lbl=e.st=='interface'?'«interface»':e.st=='enum'?'«enum»':ab?'{abstract}':'',hd=lbl?46:32,y1=e.y+hd,y2=y1+(A.length?A.length*LH+10:12);
    el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,rx:4,fill:P.sf,stroke:s,'stroke-width':w},q);el('rect',{x:e.x+.8,y:e.y+.8,width:e.w-1.6,height:hd-.8,rx:3,fill:P.ti},q);
    if(lbl)T(q,cx,e.y+16,lbl,{a:'middle',fs:11,c:P.mu});T(q,cx,e.y+(lbl?36:21),e.name,{a:'middle',b:1,i:ab});
    el('path',{d:`M${e.x} ${y1}H${e.x+e.w}M${e.x} ${y2}H${e.x+e.w}`,stroke:s,'stroke-width':1.2,fill:'none'},q);
    A.forEach((t,i)=>T(q,e.x+10,y1+14+i*LH,t));Me.forEach((t,i)=>T(q,e.x+10,y2+14+i*LH,t))}
   else if(e.t=='actor'){el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,fill:'transparent'},q);const y=e.y;
    el('circle',{cx,cy:y+14,r:9,fill:P.sf,stroke:s,'stroke-width':w},q);el('path',{d:`M${cx} ${y+23}V${y+54}M${cx-16} ${y+34}H${cx+16}M${cx} ${y+54}L${cx-14} ${y+74}M${cx} ${y+54}L${cx+14} ${y+74}`,fill:'none',stroke:s,'stroke-width':w,'stroke-linecap':'round'},q);T(q,cx,y+91,e.name,{a:'middle'})}
   else if(e.t=='uc'){el('ellipse',{cx,cy:e.y+e.h/2,rx:e.w/2,ry:e.h/2,fill:P.sf,stroke:s,'stroke-width':w},q);const L=wrap(e.name,22);L.forEach((t,i)=>T(q,cx,e.y+e.h/2+4+(i-(L.length-1)/2)*LH,t,{a:'middle'}))}
   else if(e.t=='note'){const c=14;el('path',{d:`M${e.x} ${e.y}H${e.x+e.w-c}L${e.x+e.w} ${e.y+c}V${e.y+e.h}H${e.x}Z`,fill:P.nt,stroke:live&&sel==e.id?P.ac:'#D9BC4B','stroke-width':w},q);
    el('path',{d:`M${e.x+e.w-c} ${e.y}V${e.y+c}H${e.x+e.w}`,fill:'none',stroke:'#D9BC4B','stroke-width':1.2},q);wrap(e.name,26).forEach((t,i)=>T(q,e.x+10,e.y+22+i*LH,t,{c:P.ntt,fs:12.5}))}})}

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
  $('#ubar').innerHTML=b('undo','Deshacer')+b('redo','Rehacer')+'<span class="sp"></span>'+b('class','+ Clase')+b('iface','+ Interfaz')+b('actor','+ Actor')+b('uc','+ Caso de uso')+b('sys','+ Sistema')+b('note','+ Nota')+'<span class="sp"></span>'+b('conn',mode?(src?'Elige el destino…':'Elige el origen…'):'Conectar',!!mode)+'<span class="sp"></span>'+b('png','PNG')+b('svg','SVG')}
 function draw(r){cv.innerHTML='';const vp=el('g',{transform:`translate(${V.x} ${V.y}) scale(${V.k})`},cv);paint(vp,VARS,true);bar();if(!r)snap()}
 const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-V.x)/V.k,y:(e.clientY-r.top-V.y)/V.k}};
 const spot=()=>{const r=cv.getBoundingClientRect(),n=M.els.length;return{x:Math.round((r.width/2-V.x)/V.k-75+(n*37)%120-60),y:Math.round((r.height/2-V.y)/V.k-40+(n*53)%100-50)}};
 function addEl(t,name,extra){const p=spot(),e=Object.assign({id:uid(),t,x:p.x,y:p.y,name},extra||{});M.els.push(e);sel=e.id;draw();return e}

 function editClass(e){const d=$('#dlg');
  d.innerHTML='<div class="box"><p class="lbl">Clase</p><input id="un" maxlength="80" placeholder="Nombre"><select id="us" style="font:14px Inter,sans-serif;padding:10px;border-radius:8px;border:1px solid var(--ln);background:var(--bg);color:var(--tx)"><option value="">Clase</option><option value="abstract">Clase abstracta</option><option value="interface">Interfaz</option><option value="enum">Enumeración</option></select><p class="lbl" style="margin:0">Atributos (uno por línea, p. ej. - nombre: String)</p><textarea id="ua" spellcheck="false" style="height:90px"></textarea><p class="lbl" style="margin:0">Métodos (uno por línea, p. ej. + calcular(): int)</p><textarea id="um" spellcheck="false" style="height:90px"></textarea><p class="mu">Visibilidad: + público, - privado, # protegido, ~ paquete.</p><div class="row"><button class="btn" id="uc">Cancelar</button><button class="btn pri" id="uo">Aceptar</button></div></div>';d.style.display='flex';
  $('#un').value=e.name;$('#us').value=e.st||'';$('#ua').value=(e.attrs||[]).join('\n');$('#um').value=(e.meths||[]).join('\n');$('#un').focus();
  const ls=id=>$(id).value.split('\n').map(s=>s.trim()).filter(Boolean);
  $('#uc').onclick=()=>d.style.display='none';
  $('#uo').onclick=()=>{e.name=$('#un').value.trim()||'Clase';e.st=$('#us').value;e.attrs=ls('#ua');e.meths=ls('#um');d.style.display='none';draw()}}
 function rename(e){if(e.t=='class')return editClass(e);ask(e.t=='note'?'Texto de la nota':'Nombre',e.name,v=>{if(v){e.name=v;draw()}})}
 function del(id){if(find(id)){M.els=M.els.filter(e=>e.id!=id);M.rels=M.rels.filter(r=>r.a!=id&&r.b!=id)}else M.rels=M.rels.filter(r=>r.id!=id);if(sel==id)sel=null;draw()}
 function relList(r){const a=find(r.a),b=find(r.b),u=[a,b].some(e=>e&&(e.t=='actor'||e.t=='uc')),n=[a,b].some(e=>e&&e.t=='note');return n?[['note','Línea de nota']]:u?UC:CL}
 function typeMenu(a,b,x,y){const n=[a,b].some(e=>e.t=='note'),u=[a,b].some(e=>e.t=='actor'||e.t=='uc'),L=n?[['note','Línea de nota']]:u?UC:CL;
  menu(x,y,L.map(([t,nm])=>[nm,()=>{const r={id:uid(),a:a.id,b:b.id,t,lab:'',ma:'',mb:'',ra:'',rb:''};M.rels.push(r);sel=r.id;draw()}]))}
 function relMenu(id,x,y){const r=M.rels.find(z=>z.id==id);if(!r)return;
  const set=(k,t,e)=>ask(t,r[k]||'',v=>{r[k]=v;draw()}),it=relList(r).map(([t,nm])=>[(r.t==t?'✓ ':'')+nm,()=>{r.t=t;draw()}]);
  it.push(['Etiqueta…',()=>set('lab','Etiqueta de la relación')]);
  it.push(['Multiplicidad origen…',()=>set('ma','Multiplicidad en el origen (p. ej. 1, 0..*, 1..*)')]);it.push(['Multiplicidad destino…',()=>set('mb','Multiplicidad en el destino (p. ej. 1, 0..*, 1..*)')]);
  it.push(['Rol origen…',()=>set('ra','Rol en el origen')]);it.push(['Rol destino…',()=>set('rb','Rol en el destino')]);
  it.push(['Invertir sentido',()=>{[r.a,r.b]=[r.b,r.a];[r.ma,r.mb]=[r.mb,r.ma];[r.ra,r.rb]=[r.rb,r.ra];draw()}]);it.push(['Eliminar',()=>del(id),1]);menu(x,y,it)}
 function elMenu(e,x,y){const it=[];
  it.push([e.t=='class'?'Editar clase':'Renombrar',()=>rename(e)]);
  if(e.t!='sys')it.push(['Conectar desde aquí',()=>{mode=true;src=e.id;sel=e.id;draw(true)}]);
  if(e.t=='sys')it.push(['Tamaño…',()=>ask('Ancho x alto (p. ej. 400x300)',Math.round(e.w)+'x'+Math.round(e.h),v=>{const m=v.match(/(\d+)\D+(\d+)/);if(m){e.w=Math.max(120,+m[1]);e.h=Math.max(80,+m[2]);draw()}})]);
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
  M.els.forEach(size);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;M.els.forEach(e=>{x0=Math.min(x0,e.x);y0=Math.min(y0,e.y);x1=Math.max(x1,e.x+e.w+(M.rels.some(r=>r.a==e.id&&r.b==e.id)?50:0));y1=Math.max(y1,e.y+e.h)});
  const PAD=40,w=Math.ceil(x1-x0+2*PAD),h=Math.ceil(y1-y0+2*PAD),s=document.createElementNS(NS,'svg');
  s.setAttribute('xmlns',NS);s.setAttribute('viewBox',`${x0-PAD} ${y0-PAD} ${w} ${h}`);s.setAttribute('width',w);s.setAttribute('height',h);
  el('rect',{x:x0-PAD,y:y0-PAD,width:w,height:h,fill:'#FBFBFD'},s);paint(s,LIGHT,false);
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
  else{const T={actor:'Actor',uc:'Caso de uso',sys:'Sistema',note:'Nota'};ask(a=='note'?'Texto de la nota':'Nombre',T[a],v=>{if(v)addEl(a,v)})}});
 addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;const d=$('#dlg');if(d&&d.style.display=='flex')return;const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&(k=='z'||k=='y')){e.preventDefault();hist(k=='y'||e.shiftKey?1:-1)}
  else if((k=='delete'||k=='backspace')&&sel){e.preventDefault();del(sel)}else if(k=='escape'){mode=null;src=null;draw(true)}});

 snap();draw(true);ok();setInterval(flush,1200);
})();
