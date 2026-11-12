const $=q=>document.querySelector(q),X='http://www.w3.org/2000/svg',KEY='ddb-v1',W=250;
let S={level:'verify',tab:'er',sel:null,er:{ents:[],rels:[],links:[],notes:[]},rel:{tabs:[],arrows:[]},exc:[]};
try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&j.er&&j.rel)S=Object.assign(S,j)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function el(t,a,p,tx){const e=document.createElementNS(X,t);for(const k in a)e.setAttribute(k,a[k]);if(tx!=null)e.textContent=tx;if(p)p.appendChild(e);return e}
const LV=[['practice','Práctica'],['verify','Verificar'],['hints','Pistas'],['auto','Automático']],TB=[['er','Entidad-relación'],['rel','Relacional'],['norm','Normalización']];
const AK=[['key','Clave primaria'],['alt','Clave alternativa'],['attr','Atributo simple'],['multi','Multivalor']];
const find=(k,id)=>k=='ent'?S.er.ents.find(n=>n.id==id):k=='rel'?S.er.rels.find(n=>n.id==id):k=='note'?S.er.notes.find(n=>n.id==id):S.rel.tabs.find(n=>n.id==id);
const spot=n=>({x:Math.round(VB.x+$('#cw').clientWidth/2/VB.k+((n*47)%200)-100),y:Math.round(VB.y+$('#cw').clientHeight/2/VB.k+((n*61)%160)-100)});
function ask(t,v,cb){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl" id="at"></p><input id="ai"><div class="row"><button class="btn" id="c">Cancelar</button><button class="btn pri" id="o">Aceptar</button></div></div>';d.style.display='flex';$('#at').textContent=t;const i=$('#ai');i.value=v;i.focus();i.select();const ok=()=>{const x=i.value.trim();d.style.display='none';if(x)cb(x)};$('#o').onclick=ok;$('#c').onclick=()=>d.style.display='none';i.onkeydown=e=>{if(e.key=='Enter')ok();if(e.key=='Escape')d.style.display='none'}}
function menu(x,y,it){const m=$('#menu');m.innerHTML='';it.forEach(([t,f,c])=>{const b=document.createElement('button');b.textContent=t;if(c)b.className='dg';b.onclick=()=>{closeMenu();f()};m.appendChild(b)});m.style.display='block';m.style.left=Math.max(4,Math.min(x,innerWidth-215))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-Math.min(it.length*38+12,innerHeight*.7)-8))+'px'}
const closeMenu=()=>{$('#menu').style.display='none'};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#menu'))closeMenu()},true);
function wrap(s,n){const o=[];let l='';s.split(/\s+/).forEach(w=>{if((l+' '+w).trim().length>n){o.push(l);l=w}else l=(l+' '+w).trim()});o.push(l);return o}
function circ(g,cx,cy,k,r){r=r||8;if(k=='key')return el('circle',{cx,cy,r,class:'fl'},g);el('circle',{cx,cy,r:k=='multi'?r+1:r,class:'sh'},g);if(k=='alt')el('path',{d:`M${cx} ${cy-r}A${r} ${r} 0 0 0 ${cx} ${cy+r}z`,class:'fl'},g);if(k=='multi')el('circle',{cx,cy,r:r-2.5,class:'ln'},g)}
function drawER(g){const E=S.er,by={};E.ents.concat(E.rels).forEach(n=>by[n.id]=n);
 E.links.forEach(l=>{const a=by[l.e],b=by[l.r];if(a&&b)el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'ln'},g)});
 E.notes.forEach(n=>{const t=by[n.t];if(t)el('line',{x1:n.x+95,y1:n.y+20,x2:t.x,y2:t.y,class:'ln','stroke-dasharray':'4 3'},g)});
 E.ents.forEach(n=>{const q=el('g',{'data-k':'ent','data-id':n.id,class:'nd'+(S.sel==n.id?' sel':'')},g);
  n.attrs.forEach((a,i,A)=>{const o=i-(A.length-1)/2,cx=n.x+o*38,cy=n.y+66,w=el('g',{'data-k':'attr','data-id':n.id,'data-i':i,class:'hit'},g);
   el('path',{d:`M${n.x+o*24} ${n.y+24}L${cx} ${cy-8}`,class:'ln'},w);circ(w,cx,cy,a.k);
   el('text',{transform:`translate(${cx+4} ${cy+(a.k=='multi'?20:18)}) rotate(-45)`,'text-anchor':'end',class:a.k=='key'?'u':''},w,a.n)});
  el('rect',{x:n.x-60,y:n.y-24,width:120,height:48,class:'sh'},q);el('text',{x:n.x,y:n.y+5,'text-anchor':'middle',class:'b'},q,n.name)});
 E.rels.forEach(n=>{const q=el('g',{'data-k':'rel','data-id':n.id,class:'nd'+(S.sel==n.id?' sel':'')},g);
  el('polygon',{points:`${n.x},${n.y-34} ${n.x+58},${n.y} ${n.x},${n.y+34} ${n.x-58},${n.y}`,class:'sh'},q);el('text',{x:n.x,y:n.y+5,'text-anchor':'middle'},q,n.name)});
 E.links.forEach(l=>{const a=by[l.e],b=by[l.r];if(!a||!b)return;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,t=Math.min(86,d/2-20);
  const c=el('g',{'data-k':'card','data-id':l.id,class:'hit',transform:`translate(${a.x+dx/d*t} ${a.y+dy/d*t})`},g);
  el('rect',{x:-17,y:-12,width:34,height:24,rx:12,class:'cd'+(l.c?'':' ph')},c);el('text',{class:'ct','text-anchor':'middle',y:5},c,l.c||'?')});
 E.notes.forEach(n=>{const ls=wrap(n.text,26),q=el('g',{'data-k':'note','data-id':n.id,class:'nd'},g);
  el('rect',{x:n.x,y:n.y,width:190,height:ls.length*16+16,rx:4,class:'nt'},q);ls.forEach((s,i)=>el('text',{x:n.x+10,y:n.y+22+i*16,class:'nl'},q,s))});
 if(!E.ents.length&&!E.rels.length)el('text',{x:40,y:60},g,'Empieza con «Entidad» en la barra. Clic derecho sobre un elemento para añadir atributos o asociarlo.')}
const rowY=(t,i)=>t.y+52+26*i+13,tab=id=>S.rel.tabs.find(t=>t.id==id);
function sym(g,x,y,d,k,c){const p=k=='one'?`M${x+d*9} ${y-7}v14M${x+d*14} ${y-7}v14`:`M${x+d*14} ${y}L${x} ${y-7}M${x+d*14} ${y}L${x} ${y+7}`;el('path',{d:p,fill:'none',stroke:c,'stroke-width':1.8},g)}
function drawREL(g){const R=S.rel;
 R.arrows.forEach(a=>{const f=tab(a.f[0]),t=tab(a.t[0]);if(!f||!t)return;let sd=1,ed=-1;if(f.x+W+30<=t.x){}else if(t.x+W+30<=f.x){sd=-1;ed=1}else{sd=1;ed=1}
  const sx=sd>0?f.x+W:f.x,ex=ed>0?t.x+W:t.x,sy=rowY(f,a.f[1]),ey=rowY(t,a.t[1]),mx=sd!=ed?(sx+ex)/2:(sd>0?Math.max(sx,ex):Math.min(sx,ex))+sd*34;
  const q=el('g',{'data-k':'arrow','data-id':a.id,class:'hit'},g),c=a.ty?'var(--ac)':'var(--ac)',d=`M${sx} ${sy}H${mx}V${ey}H${ex}`;
  el('path',{d,fill:'none',stroke:'transparent','stroke-width':14},q);el('path',{d,class:'ar'+(a.ty?'':' ph')},q);el('circle',{cx:sx,cy:sy,r:3.5,class:'fl'},q);
  if(a.ty){sym(q,ex,ey,ed,a.ty=='NM'?'many':'one',c);sym(q,sx,sy,sd,a.ty=='11'?'one':'many',c)}
  else{el('path',{d:`M${ex} ${ey}l${-ed*9} -5v10z`,fill:'var(--ac)'},q);const p=el('g',{transform:`translate(${mx} ${(sy+ey)/2})`},q);el('rect',{x:-17,y:-12,width:34,height:24,rx:12,class:'cd ph'},p);el('text',{class:'ct','text-anchor':'middle',y:5},p,'?')}});
 R.tabs.forEach(t=>{const H=52+26*(t.rows.length+1),q=el('g',{},g);el('rect',{x:t.x,y:t.y,width:W,height:H,rx:6,class:'tb'},q);
  const h=el('g',{'data-k':'tbl','data-id':t.id,class:'hit nd'+(S.sel==t.id?' sel':'')},q);el('rect',{x:t.x,y:t.y,width:W,height:30,rx:6,class:'th'},h);el('text',{x:t.x+12,y:t.y+20,class:'b'},h,t.name);
  el('rect',{x:t.x+1,y:t.y+30,width:W-2,height:22,fill:'var(--bg)'},q);[['Campo',12],['Tipo',104],['Clave',190]].forEach(([s,o])=>el('text',{x:t.x+o,y:t.y+45,class:'cn'},q,s));
  t.rows.forEach((r,i)=>{const y=t.y+52+26*i,a={'data-id':t.id,'data-i':i,class:'hit'};el('rect',Object.assign({x:t.x,y,width:W,height:26,fill:'transparent'},a),q);
   el('text',Object.assign({x:t.x+12,y:y+17,'data-k':'ncell'},a,{class:'hit'+(r.k.includes('PK')?' u':'')}),q,r.n);el('text',Object.assign({x:t.x+104,y:y+17,'data-k':'tcell',fill:'var(--mu)'},a),q,r.t);
   const kc=el('g',Object.assign({'data-k':'kcell'},a),q);if(!r.k.length){el('rect',{x:t.x+190,y:y+5,width:24,height:16,rx:4,class:'ky f','stroke-dasharray':'3 2'},kc);el('text',{x:t.x+202,y:y+17,'text-anchor':'middle',class:'kt'},kc,'+')}
   r.k.forEach((k,j)=>{const x=t.x+190+28*j;el('rect',{x,y:y+5,width:24,height:16,rx:4,class:'ky'+(k=='PK'?'':' f')},kc);el('text',{x:x+12,y:y+17,'text-anchor':'middle',class:'kt'},kc,k)});
   if(r.k.includes('FK'))el('circle',{cx:t.x+W,cy:y+13,r:6,class:'fl','data-k':'fkh','data-id':t.id,'data-i':i,style:'cursor:crosshair'},q)});
  el('text',{x:t.x+12,y:t.y+52+26*t.rows.length+17,fill:'var(--ac)','data-k':'addrow','data-id':t.id,class:'hit'},q,'+ campo')})}
function drawNorm(g){['Normalización: próximamente.','Aquí irán las dependencias funcionales, las claves candidatas y las formas normales.'].forEach((s,i)=>el('text',{x:40,y:60+i*24},g,s))}
function draw(r){const g=$('#cv');g.innerHTML='';({er:drawER,rel:drawREL,norm:drawNorm})[S.tab](g);
 if(D&&D.m=='fk'&&D.xy){const f=tab(D.tid);el('line',{x1:f.x+W,y1:rowY(f,D.ri),x2:D.xy[0],y2:D.xy[1],class:'ar ph'},g)}
 $('#tabs').innerHTML=TB.map(([k,n])=>`<button data-a="tab" data-v="${k}" class="${S.tab==k?'on':''}">${n}</button>`).join('');
 $('#lv').innerHTML=LV.map(([k,n])=>`<button data-a="lv" data-v="${k}" class="${S.level==k?'on':''}">${n}</button>`).join('');
 $('#bar').innerHTML='<button class="btn" data-a="undo">Deshacer</button><button class="btn" data-a="redo">Rehacer</button>'+(S.tab=='er'?'<button class="btn" data-a="ent">+ Entidad</button><button class="btn" data-a="rel">+ Relación</button><button class="btn" data-a="note">+ Nota</button>':S.tab=='rel'?'<button class="btn" data-a="tbl">+ Tabla</button>':'')+(S.level=='auto'&&S.tab!='norm'?'<button class="btn pri" data-a="gen">Generar relacional desde el ER</button>':'')+'<span class="mu">'+(S.tab=='rel'?'Arrastra desde el punto de una FK hasta su PK. Clic derecho en la flecha: 1:1, 1:N o N:M.':S.tab=='er'?'Clic derecho (o mantener pulsado) sobre un elemento.':'')+'</span>';
 side();save();if(!r&&!D)snap()}
function checks(){const o=[],E=S.er,R=S.rel;
 if(S.tab=='er'){E.ents.forEach(e=>{const k=e.attrs.some(a=>a.k=='key');o.push([k,e.name+(k?': tiene clave primaria':': falta la clave primaria'),'Añade un atributo de tipo clave primaria (círculo negro).'])});
  E.rels.forEach(r=>{const n=E.links.filter(l=>l.r==r.id).length;o.push([n>=2,r.name+(n>=2?': asociada a '+n+' entidades':': necesita al menos dos entidades'),'Clic derecho en una entidad y elige «Asociar con».'])});
  E.links.forEach(l=>{const e=E.ents.find(x=>x.id==l.e),r=E.rels.find(x=>x.id==l.r);if(e&&r&&!l.c)o.push([false,e.name+'–'+r.name+': falta la cardinalidad','Pulsa el signo ? y elige 1, N o M.'])})}
 else if(S.tab=='rel'){R.tabs.forEach(t=>{const k=t.rows.some(r=>r.k.includes('PK'));o.push([k,t.name+(k?': tiene PK':': falta la clave primaria'),'Marca un campo como PK en la columna Clave.']);
   t.rows.forEach((r,i)=>{if(r.k.includes('FK')&&!R.arrows.some(a=>a.f[0]==t.id&&a.f[1]==i))o.push([false,t.name+'.'+r.n+': FK sin flecha','Arrastra desde el punto de la FK hasta su PK.'])})});
  R.arrows.forEach(a=>{if(!a.ty)o.push([false,'Hay una flecha sin tipo','Clic derecho en la flecha y elige 1:1, 1:N o N:M.'])})}
 return o}
function selName(){const n=find('ent',S.sel)||find('rel',S.sel)||find('tbl',S.sel);return n?n.name:'General'}
function side(){let h='<p class="lbl" style="margin:0">Verificación</p>';
 if(S.level=='practice')h+='<p class="mu">Modo práctica: el lienzo no valida nada. Tú haces todo.</p>';
 else{const c=checks();if(!c.length&&S.tab!='norm')h+='<p class="mu">Aún no hay nada que comprobar.</p>';c.forEach(([ok,m,hi])=>{h+=`<span class="fb ${ok?'ok':'wn'}"><b>${esc(m)}</b>${!ok&&(S.level=='hints'||S.level=='auto')?'<i>Pista: '+esc(hi)+'</i>':''}</span>`})}
 h+='<div style="flex:1"></div><div style="border-top:1px solid var(--ln);padding-top:12px;display:flex;flex-direction:column;gap:8px"><div class="lbl" style="margin:0">Excepciones ('+S.exc.length+')</div>';
 S.exc.forEach((x,i)=>{h+=`<div class="ex"><span><span class="tag">${esc(x.tag)}</span>${esc(x.text)}</span><button class="x" data-a="xd" data-v="${i}" aria-label="Quitar excepción">×</button></div>`});
 $('#side').innerHTML=h+'<button class="btn" data-a="xa">Añadir excepción</button></div>'}
let D=null,J=false,LP=0,H=[],HI=-1,VB={x:0,y:0,k:1};
function snap(){const s=JSON.stringify({er:S.er,rel:S.rel,exc:S.exc});if(H[HI]===s)return;H=H.slice(0,HI+1);H.push(s);if(H.length>80)H.shift();HI=H.length-1}
function hist(d){const i=HI+d;if(i<0||i>=H.length)return;HI=i;const j=JSON.parse(H[i]);S.er=j.er;S.rel=j.rel;S.exc=j.exc;S.sel=null;draw(true)}
const pt=e=>{const r=$('#cv').getBoundingClientRect();return[VB.x+(e.clientX-r.left)/VB.k,VB.y+(e.clientY-r.top)/VB.k]};
const cv=$('#cv');
cv.addEventListener('pointerdown',e=>{if(e.button)return;const t=e.target.closest('[data-k]');if(!t){if(S.sel){S.sel=null;draw()}return}
 const k=t.dataset.k,id=t.dataset.id;clearTimeout(LP);if(e.pointerType!='mouse')LP=setTimeout(()=>{D=null;ctx(t,e.clientX,e.clientY)},550);
 if(k=='fkh'){D={m:'fk',tid:id,ri:+t.dataset.i,moved:0};cv.setPointerCapture(e.pointerId);return}
 if(['ent','rel','note','tbl'].includes(k)){const n=find(k,id);D={m:'mv',n,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,moved:0};S.sel=id;cv.setPointerCapture(e.pointerId);draw()}});
cv.addEventListener('pointermove',e=>{if(!D)return;D.moved=Math.max(D.moved,Math.hypot(e.clientX-(D.sx||e.clientX),e.clientY-(D.sy||e.clientY)));if(D.moved>6)clearTimeout(LP);
 if(D.m=='mv'){D.n.x=D.ox+(e.clientX-D.sx)/VB.k;D.n.y=D.oy+(e.clientY-D.sy)/VB.k;draw()}else{D.xy=pt(e);D.moved=9;clearTimeout(LP);draw()}});
cv.addEventListener('pointerup',e=>{clearTimeout(LP);if(!D)return;const d=D;D=null;J=d.moved>5;setTimeout(()=>J=false,0);
 if(d.m=='fk'){const c=document.elementFromPoint(e.clientX,e.clientY),t=c&&c.closest('[data-i]');
  if(t&&t.dataset.k!='fkh'){const tt=tab(t.dataset.id),ri=+t.dataset.i;if(tt&&tt.rows[ri]&&tt.rows[ri].k.includes('PK')&&!(tt.id==d.tid&&ri==d.ri)&&!S.rel.arrows.some(a=>a.f[0]==d.tid&&a.f[1]==d.ri&&a.t[0]==tt.id&&a.t[1]==ri))S.rel.arrows.push({id:uid(),f:[d.tid,d.ri],t:[tt.id,ri],ty:null})}}draw()});
cv.addEventListener('click',e=>{if(J)return;const t=e.target.closest('[data-k]');if(!t)return;const k=t.dataset.k,id=t.dataset.id,i=+t.dataset.i;
 if(k=='card'){const l=S.er.links.find(x=>x.id==id),o=[null,'1','N','M'];l.c=o[(o.indexOf(l.c)+1)%4];draw()}
 else if(k=='tcell'){const r=tab(id).rows[i];ask('Tipo de dato',r.t,v=>{r.t=v;draw()})}
 else if(k=='kcell')ctx(t,e.clientX,e.clientY);else if(k=='arrow')ctx(t,e.clientX,e.clientY);
 else if(k=='addrow'){tab(id).rows.push({n:'campo',t:'VARCHAR(50)',k:[]});draw()}});
cv.addEventListener('dblclick',e=>{const t=(document.elementFromPoint(e.clientX,e.clientY)||e.target).closest('[data-k]');if(!t)return;const k=t.dataset.k,id=t.dataset.id,i=+t.dataset.i;
 if(['ent','rel','tbl'].includes(k)){const n=find(k,id);ask('Nombre',n.name,v=>{n.name=v;draw()})}
 else if(k=='attr'){const a=find('ent',id).attrs[i];ask('Nombre del atributo',a.n,v=>{a.n=v;draw()})}
 else if(k=='ncell'){const r=tab(id).rows[i];ask('Nombre del campo',r.n,v=>{r.n=v;draw()})}
 else if(k=='note'){const n=find('note',id);ask('Texto de la nota',n.text,v=>{n.text=v;draw()})}});
cv.addEventListener('contextmenu',e=>{e.preventDefault();const t=e.target.closest('[data-k]');if(t)ctx(t,e.clientX,e.clientY)});
function ctx(t,x,y){const k=t.dataset.k,id=t.dataset.id,i=+t.dataset.i,E=S.er,R=S.rel,it=[],del=(f)=>it.push(['Eliminar',f,1]);
 const rn=(n,tt)=>it.push(['Renombrar',()=>ask('Nombre',n.name,v=>{n.name=v;draw()})]);
 const nt=tg=>it.push(['Añadir nota',()=>ask('Texto de la nota','',v=>{const p=find(tg.k,tg.id);E.notes.push({id:uid(),x:p.x+90,y:p.y+(tg.k=='ent'?150:60),text:v,t:tg.id});draw()})]);
 if(k=='ent'){const n=find('ent',id);rn(n);AK.forEach(([a,nm])=>it.push(['+ '+nm,()=>ask('Nombre del atributo','',v=>{n.attrs.push({n:v,k:a});draw()})]));
  E.rels.forEach(r=>{if(!E.links.some(l=>l.e==id&&l.r==r.id))it.push(['Asociar con: '+r.name,()=>{E.links.push({id:uid(),e:id,r:r.id,c:null});draw()}])});nt({k,id});
  del(()=>{E.ents=E.ents.filter(a=>a.id!=id);E.links=E.links.filter(l=>l.e!=id);E.notes=E.notes.filter(a=>a.t!=id);draw()})}
 else if(k=='rel'){const n=find('rel',id);rn(n);E.ents.forEach(e=>{if(!E.links.some(l=>l.e==e.id&&l.r==id))it.push(['Asociar con: '+e.name,()=>{E.links.push({id:uid(),e:e.id,r:id,c:null});draw()}])});nt({k,id});
  del(()=>{E.rels=E.rels.filter(a=>a.id!=id);E.links=E.links.filter(l=>l.r!=id);E.notes=E.notes.filter(a=>a.t!=id);draw()})}
 else if(k=='attr'){const e=find('ent',id),a=e.attrs[i];it.push(['Renombrar',()=>ask('Nombre del atributo',a.n,v=>{a.n=v;draw()})]);AK.forEach(([c,nm])=>it.push([(a.k==c?'✓ ':'')+nm,()=>{a.k=c;draw()}]));del(()=>{e.attrs.splice(i,1);draw()})}
 else if(k=='note'){const n=find('note',id);it.push(['Editar texto',()=>ask('Texto de la nota',n.text,v=>{n.text=v;draw()})]);del(()=>{E.notes=E.notes.filter(a=>a.id!=id);draw()})}
 else if(k=='card'){const l=E.links.find(a=>a.id==id);['1','N','M'].forEach(c=>it.push([(l.c==c?'✓ ':'')+'Cardinalidad '+c,()=>{l.c=c;draw()}]));it.push(['Sin elegir',()=>{l.c=null;draw()}]);it.push(['Eliminar asociación',()=>{E.links=E.links.filter(a=>a.id!=id);draw()},1])}
 else if(k=='tbl'){const n=find('tbl',id);rn(n);del(()=>{R.tabs=R.tabs.filter(a=>a.id!=id);R.arrows=R.arrows.filter(a=>a.f[0]!=id&&a.t[0]!=id);draw()})}
 else if(k=='ncell'||k=='tcell'||k=='kcell'){const tb=tab(id),r=tb.rows[i];if(k=='kcell')[['PK','Clave primaria'],['FK','Clave foránea'],['UQ','Clave alternativa']].forEach(([c,nm])=>it.push([(r.k.includes(c)?'✓ ':'')+nm+' ('+c+')',()=>{r.k=r.k.includes(c)?r.k.filter(z=>z!=c):r.k.concat(c);draw()}]));
  it.push(['Eliminar campo',()=>{tb.rows.splice(i,1);R.arrows=R.arrows.filter(a=>!((a.f[0]==id&&a.f[1]==i)||(a.t[0]==id&&a.t[1]==i))).map(a=>{[a.f,a.t].forEach(p=>{if(p[0]==id&&p[1]>i)p[1]--});return a});draw()},1])}
 else if(k=='arrow'){const a=R.arrows.find(z=>z.id==id);[['11','1:1 · uno a uno'],['1N','1:N · uno a muchos'],['NM','N:M · muchos a muchos']].forEach(([c,nm])=>it.push([(a.ty==c?'✓ ':'')+nm,()=>{a.ty=c;draw()}]));it.push(['Eliminar flecha',()=>{R.arrows=R.arrows.filter(z=>z.id!=id);draw()},1])}
 if(it.length)menu(x,y,it)}
function gen(){const E=S.er,T=[],A=[],m={};let n=0;const mk=(name,rows)=>{const t={id:uid(),x:30+(n%3)*300,y:30+Math.floor(n/3)*230,name,rows};n++;T.push(t);return t};
 const fk=(c,p,ty,pk)=>{let pi=p.rows.findIndex(r=>r.k.includes('PK'));if(pi<0)pi=0;const r=p.rows[pi]||{n:'id',t:'INT'};c.rows.push({n:r.n,t:r.t,k:pk?['PK','FK']:['FK']});A.push({id:uid(),f:[c.id,c.rows.length-1],t:[p.id,pi],ty})};
 E.ents.forEach(e=>{m[e.id]=mk(e.name.toUpperCase(),e.attrs.filter(a=>a.k!='multi').map(a=>({n:a.n,t:a.k=='key'?'INT':'VARCHAR(50)',k:a.k=='key'?['PK']:a.k=='alt'?['UQ']:[]})))});
 E.ents.forEach(e=>e.attrs.filter(a=>a.k=='multi').forEach(a=>{const c=mk(e.name.toUpperCase()+'_'+a.n.toUpperCase(),[]);fk(c,m[e.id],'1N',1);c.rows.push({n:a.n,t:'VARCHAR(50)',k:['PK']})}));
 E.rels.forEach(r=>{const L=E.links.filter(l=>l.r==r.id);if(L.length!=2||L.some(l=>!l.c||!m[l.e]))return;const[a,b]=L,x=m[a.e],y=m[b.e];
  if(a.c!='1'&&b.c!='1'){const c=mk(r.name.toUpperCase(),[]);fk(c,x,'1N',1);fk(c,y,'1N',1)}else if(a.c=='1'&&b.c!='1')fk(y,x,'1N');else if(b.c=='1'&&a.c!='1')fk(x,y,'1N');else fk(x,y,'11')});
 S.rel={tabs:T,arrows:A};S.tab='rel';draw()}
function sql(){const id=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\W+/g,'_').toLowerCase(),T=S.rel.tabs;
 const c=T.map(t=>{const pk=t.rows.filter(r=>r.k.includes('PK')).map(r=>id(r.n)),L=t.rows.map(r=>'  '+id(r.n)+' '+r.t+(r.k.includes('UQ')?' UNIQUE':''));if(pk.length)L.push('  PRIMARY KEY ('+pk.join(', ')+')');return 'CREATE TABLE '+id(t.name)+' (\n'+L.join(',\n')+'\n);'});
 const f=S.rel.arrows.map(a=>{const x=tab(a.f[0]),y=tab(a.t[0]);return x&&y?'ALTER TABLE '+id(x.name)+' ADD FOREIGN KEY ('+id(x.rows[a.f[1]].n)+') REFERENCES '+id(y.name)+' ('+id(y.rows[a.t[1]].n)+');':''}).filter(Boolean);
 return c.concat(f).join('\n\n')||'-- Aún no hay tablas en el esquema relacional.'}
function io(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Importar / exportar (JSON)</p><textarea id="ta" spellcheck="false"></textarea><input type="file" id="fi" accept=".json,application/json"><div class="row"><button class="btn" id="cp">Copiar</button><button class="btn" id="js">JSON</button><button class="btn" id="sq">SQL</button><button class="btn pri" id="ap">Importar</button><button class="btn" id="cl">Cerrar</button></div><p class="mu" id="ms"></p></div>';d.style.display='flex';
 const ta=$('#ta');ta.value=JSON.stringify({v:1,level:S.level,er:S.er,rel:S.rel,exc:S.exc},null,1);$('#cl').onclick=()=>d.style.display='none';$('#sq').onclick=()=>{ta.value=sql();$('#ms').textContent='SQL generado desde el esquema relacional.'};$('#js').onclick=()=>{ta.value=JSON.stringify({v:1,level:S.level,er:S.er,rel:S.rel,exc:S.exc},null,1);$('#ms').textContent=''};
 $('#cp').onclick=async()=>{try{await navigator.clipboard.writeText(ta.value);$('#ms').textContent='Copiado.'}catch(e){ta.select();$('#ms').textContent='Selecciona y copia manualmente.'}};
 $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>ta.value=r.result;r.readAsText(f)};
 $('#ap').onclick=()=>{try{const j=JSON.parse(ta.value),E=j.er,R=j.rel;if(!E||!R||!Array.isArray(E.ents)||!Array.isArray(E.rels)||!Array.isArray(E.links)||!Array.isArray(R.tabs)||!Array.isArray(R.arrows))throw 0;E.notes=Array.isArray(E.notes)?E.notes:[];S.er=E;S.rel=R;S.exc=Array.isArray(j.exc)?j.exc:[];S.sel=null;d.style.display='none';draw()}catch(e){$('#ms').textContent='El archivo no tiene el formato esperado.'}}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,v=t.dataset.v,c=spot(S.er.ents.length+S.er.rels.length+S.rel.tabs.length);
 if(a=='tab'){S.tab=v;S.sel=null;draw()}else if(a=='lv'){S.level=v;draw()}
 else if(a=='ent')ask('Nombre de la entidad','Entidad',n=>{S.er.ents.push({id:uid(),x:c.x,y:c.y,name:n,attrs:[]});draw()});
 else if(a=='rel')ask('Nombre de la relación','Relación',n=>{S.er.rels.push({id:uid(),x:c.x,y:c.y,name:n});draw()});
 else if(a=='note')ask('Texto de la nota','',n=>{S.er.notes.push({id:uid(),x:c.x,y:c.y,text:n,t:S.sel&&(find('ent',S.sel)||find('rel',S.sel))?S.sel:null});draw()});
 else if(a=='tbl')ask('Nombre de la tabla','TABLA',n=>{S.rel.tabs.push({id:uid(),x:c.x-100,y:c.y-60,name:n,rows:[{n:'id',t:'INT',k:['PK']}]});draw()});
 else if(a=='gen'){if(S.rel.tabs.length)ask('Ya hay tablas. Escribe «sí» para reemplazarlas','',x=>{if(/^s[ií]/i.test(x))gen()});else gen()}
 else if(a=='undo')hist(-1);else if(a=='redo')hist(1);else if(a=='io')io();else if(a=='xd'){S.exc.splice(+v,1);draw()}
 else if(a=='xa')ask('Excepción (se asocia a: '+selName()+')','',x=>{S.exc.push({tag:selName(),text:x});draw()})});
document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const k=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&(k=='z'||k=='y')){e.preventDefault();hist(k=='y'||e.shiftKey?1:-1)}});
draw();
