/* Portada: lista de diagramas, crear, abrir, renombrar, duplicar y borrar. */
const $=q=>document.querySelector(q),ADMIN_ID='1610b5c9-9d5d-4c44-8f0c-3d98b93976ec';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let docs=[],qy='';
const shut=()=>{$('#dlg').style.display='none'};
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',3200)}
function ask(t,v,cb){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl" id="at"></p><input id="ai" maxlength="200"><div class="row"><button class="btn" id="c">Cancelar</button><button class="btn pri" id="o">Aceptar</button></div></div>';d.style.display='flex';$('#at').textContent=t;const i=$('#ai');i.value=v;i.focus();i.select();const ok=()=>{const x=i.value.trim();shut();if(x)cb(x)};$('#o').onclick=ok;$('#c').onclick=shut;i.onkeydown=e=>{if(e.key=='Enter')ok();if(e.key=='Escape')shut()}}
function confirmDlg(t,label,cb){const d=$('#dlg');d.innerHTML='<div class="box"><p id="ct" style="margin:0"></p><div class="row"><button class="btn" id="cn">Cancelar</button><button class="btn pri" id="ck"></button></div></div>';d.style.display='flex';$('#ct').textContent=t;$('#ck').textContent=label;$('#cn').onclick=shut;$('#ck').onclick=()=>{shut();cb()}}
function menu(x,y,it){const m=$('#menu');m.innerHTML='';it.forEach(([t,f,c])=>{const b=document.createElement('button');b.textContent=t;if(c)b.className='dg';b.onclick=()=>{closeMenu();f()};m.appendChild(b)});m.style.display='block';m.style.left=Math.max(4,Math.min(x,innerWidth-215))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-it.length*38-20))+'px'}
const closeMenu=()=>{$('#menu').style.display='none'};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#menu'))closeMenu()},true);
function ago(s){const d=(Date.now()-new Date(s))/1000,f=new Intl.RelativeTimeFormat('es',{numeric:'auto'});if(d<60)return 'Editado hace un momento';const r=d<3600?f.format(-Math.round(d/60),'minute'):d<86400?f.format(-Math.round(d/3600),'hour'):f.format(-Math.round(d/86400),'day');return 'Editado '+r}
function thumb(d){
 const E=d.er||{},R=d.rel||{},B=[],it=[],ents=E.ents||[],rels=E.rels||[],tabs=R.tabs||[];
 if(ents.length||rels.length){ents.forEach(n=>{B.push([n.x-60,n.y-24,n.x+60,n.y+((n.attrs||[]).length?92:24)]);it.push(['e',n])});rels.forEach(n=>{B.push([n.x-58,n.y-34,n.x+58,n.y+34]);it.push(['r',n])})}
 else tabs.forEach(t=>{const h=52+26*((t.rows||[]).length+1);B.push([t.x,t.y,t.x+250,t.y+h]);it.push(['t',t,h])});
 if(!B.length)return '';
 const x0=Math.min(...B.map(b=>b[0])),y0=Math.min(...B.map(b=>b[1])),x1=Math.max(...B.map(b=>b[2])),y1=Math.max(...B.map(b=>b[3])),s=Math.min(180/(x1-x0||1),96/(y1-y0||1),1.2),ox=100-(x0+x1)/2*s,oy=60-(y0+y1)/2*s,X=v=>(v*s+ox).toFixed(1),Y=v=>(v*s+oy).toFixed(1),by={};
 ents.concat(rels).forEach(n=>by[n.id]=n);
 let o='';
 (E.links||[]).forEach(l=>{const a=by[l.e],b=by[l.r];if(a&&b)o+=`<line x1="${X(a.x)}" y1="${Y(a.y)}" x2="${X(b.x)}" y2="${Y(b.y)}" class="tl"/>`});
 it.forEach(([k,n,h])=>{
  if(k=='e'){o+=`<rect x="${X(n.x-60)}" y="${Y(n.y-24)}" width="${(120*s).toFixed(1)}" height="${(48*s).toFixed(1)}" rx="2" class="te"/>`;(n.attrs||[]).forEach((a,i,A)=>{o+=`<circle cx="${X(n.x+(i-(A.length-1)/2)*38)}" cy="${Y(n.y+66)}" r="${Math.max(2,7*s).toFixed(1)}" class="${a.k=='key'?'tk':'ta'}"/>`})}
  else if(k=='r')o+=`<polygon points="${X(n.x)},${Y(n.y-34)} ${X(n.x+58)},${Y(n.y)} ${X(n.x)},${Y(n.y+34)} ${X(n.x-58)},${Y(n.y)}" class="te"/>`;
  else o+=`<rect x="${X(n.x)}" y="${Y(n.y)}" width="${(250*s).toFixed(1)}" height="${(h*s).toFixed(1)}" rx="3" class="te"/><rect x="${X(n.x)}" y="${Y(n.y)}" width="${(250*s).toFixed(1)}" height="${(30*s).toFixed(1)}" rx="3" class="tH"/>`});
 return `<svg viewBox="0 0 200 120" aria-hidden="true">${o}</svg>`}
function render(){
 const L=docs.filter(d=>String(d.title).toLowerCase().includes(qy));
 let h='<button class="card new" id="nw"><span class="plus">+</span><b>Nuevo diagrama</b><small>Empieza con un lienzo en blanco</small></button>';
 L.forEach(d=>{const u='editor.html?id='+encodeURIComponent(d.id);
  h+=`<article class="card"><a class="th" href="${esc(u)}" tabindex="-1" aria-hidden="true">${thumb(d.thumb||d.data||{})||'<span class="blank">Vacío</span>'}</a><div class="meta"><a class="tt" href="${esc(u)}">${esc(d.title)}</a><button class="kb" data-m="${esc(d.id)}" aria-label="Más opciones">⋯</button></div><div class="sub">${ago(d.updated_at)}${d.local?' · <span class="pill">Solo en este navegador</span>':''}</div></article>`});
 $('#grid').innerHTML=h;$('#empty').hidden=docs.length>0}
async function refresh(){try{docs=await DB.list()}catch(e){toast(e.message||'No se pudieron cargar los diagramas.');docs=[]}render()}
function newDoc(){ask('Nombre del diagrama','Sin título',async t=>{try{const id=await DB.create(t,DB.blank());location.href='editor.html?id='+encodeURIComponent(id)}catch(e){toast(e.message)}})}
function cardMenu(id,btn){const d=docs.find(x=>x.id==id);if(!d)return;const r=btn.getBoundingClientRect(),it=[],run=f=>async()=>{try{await f()}catch(x){toast(x.message)}refresh()};
 it.push(['Abrir',()=>{location.href='editor.html?id='+encodeURIComponent(id)}]);
 it.push(['Renombrar',()=>ask('Nombre del diagrama',d.title,t=>run(()=>DB.rename(id,t))())]);
 it.push(['Duplicar',run(async()=>{const f=await DB.get(id);if(f)await DB.create(d.title+' (copia)',f.data,d.local)})]);
 if(d.local&&DB.user)it.push(['Subir a la nube',run(()=>DB.toCloud(id))]);
 it.push(['Eliminar',()=>confirmDlg('¿Eliminar «'+d.title+'»? No se puede deshacer.','Eliminar',run(()=>DB.remove(id))),1]);
 menu(r.left,r.bottom+4,it)}
function loginDlg(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Cuenta</p><input id="em" type="email" placeholder="Correo" autocomplete="email"><input id="pw" type="password" placeholder="Contraseña (mínimo 6 caracteres)" autocomplete="current-password"><div class="row"><button class="btn" id="lc">Cancelar</button><button class="btn" id="su">Crear cuenta</button><button class="btn pri" id="si">Entrar</button></div><p class="mu" id="lm"></p></div>';d.style.display='flex';$('#em').focus();
 $('#lc').onclick=shut;const c=DB.client,cr=()=>({email:$('#em').value.trim(),password:$('#pw').value}),m=t=>{$('#lm').textContent=t};
 $('#si').onclick=async()=>{const{error}=await c.auth.signInWithPassword(cr());if(error)m(error.message);else{shut();toast('Sesión iniciada.')}};
 $('#su').onclick=async()=>{const{data,error}=await c.auth.signUp(cr());if(error)m(error.message);else if(!data.session)m('Cuenta creada. Revisa tu correo para confirmarla y luego pulsa Entrar.');else{shut();toast('Cuenta creada.')}}}
function acct(){const a=$('#acct'),u=DB.user;$('#note').hidden=!DB.client||!!u;
 if(!DB.client){a.innerHTML='';return}
 a.innerHTML=u?'<button class="av" id="av" aria-label="Cuenta"></button>':'<button class="btn" id="li">Iniciar sesión</button>';
 if(u){const b=$('#av');b.textContent=(u.email||'?')[0].toUpperCase();b.onclick=()=>{const r=b.getBoundingClientRect(),it=[[u.email||'Cuenta',()=>{}]];if(u.id===ADMIN_ID)it.push(['Ver sugerencias',sugList]);it.push(['Cerrar sesión',async()=>{await DB.client.auth.signOut()}]);menu(r.right-210,r.bottom+6,it)}}
 else $('#li').onclick=loginDlg}
function sugDlg(){
 if(!DB.client){toast('La nube no está disponible.');return}
 const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Sugerencias</p><p class="mu">Cuéntame qué mejorarías o qué fallo has visto.</p><textarea id="sg" maxlength="1000" placeholder="Tu sugerencia…" style="height:140px;font-family:inherit;font-size:14px"></textarea><div class="row"><button class="btn" id="sc">Cancelar</button><button class="btn pri" id="ss">Enviar</button></div><p class="mu" id="sm"></p></div>';d.style.display='flex';$('#sg').focus();
 $('#sc').onclick=shut;
 $('#ss').onclick=async()=>{const m=$('#sg').value.trim();if(m.length<3){$('#sm').textContent='Escribe al menos 3 caracteres.';return}
  $('#ss').disabled=true;const{error}=await DB.client.from('suggestions').insert({message:m});
  if(error){$('#sm').textContent=error.message;$('#ss').disabled=false}else{shut();toast('¡Gracias por tu sugerencia!')}}}
async function sugList(){
 if(!DB.client||!DB.user||DB.user.id!==ADMIN_ID)return;
 const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Sugerencias recibidas</p><div id="sl" class="mu">Cargando…</div><div class="row"><button class="btn" id="sx">Cerrar</button></div></div>';d.style.display='flex';$('#sx').onclick=shut;
 const r=await DB.client.from('suggestions').select('id,message,created_at').order('created_at',{ascending:false}),L=$('#sl');
 if(r.error){L.textContent=r.error.message;return}if(!r.data.length){L.textContent='Todavía no hay sugerencias.';return}
 L.innerHTML='';L.style.cssText='display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto';
 r.data.forEach(x=>{const row=document.createElement('div');row.className='ex';const s=document.createElement('span');s.style.whiteSpace='pre-wrap';s.style.wordBreak='break-word';
  const t=document.createElement('span');t.className='tag';t.textContent=new Date(x.created_at).toLocaleString('es-ES');s.append(t,document.createElement('br'),x.message);
  const b=document.createElement('button');b.className='btn';b.style.flex='none';b.textContent='Borrar';
  b.onclick=async()=>{const q=await DB.client.from('suggestions').delete().eq('id',x.id);if(q.error)toast(q.error.message);else sugList()};
  row.append(s,b);L.appendChild(row)})}
function migrate(){try{if(localStorage.getItem('ddb-migrated'))return;localStorage.setItem('ddb-migrated','1');
 const j=JSON.parse(localStorage.getItem('ddb-v1'));if(!j||!j.er||!j.rel)return;
 if(!((j.er.ents||[]).length||(j.er.rels||[]).length||(j.rel.tabs||[]).length))return;
 if(Object.keys(JSON.parse(localStorage.getItem('ddb-docs')||'{}')).length)return;
 DB.create('Mi primer diagrama',{v:1,level:j.level||'verify',er:j.er,rel:j.rel,exc:j.exc||[]},true)}catch(e){}}
$('#nw2').onclick=newDoc;$('#sg').onclick=sugDlg;$('#li2').onclick=loginDlg;
$('#qs').oninput=e=>{qy=e.target.value.trim().toLowerCase();render()};
$('#grid').addEventListener('click',e=>{if(e.target.closest('#nw'))newDoc();const m=e.target.closest('[data-m]');if(m)cardMenu(m.dataset.m,m)});
DB.onauth=()=>{acct();refresh()};
(async()=>{await DB.ready;migrate();acct();refresh()})();
