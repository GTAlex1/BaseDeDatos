/* Papelera, favoritos, caducidad y ajustes. Sustituye a render, cardMenu y acct (en cuenta.js) de la portada. */
const DAY=864e5,daysLeft=d=>{const e=DB.expiry(d);return e?Math.ceil((e-Date.now())/DAY):null};
const mkB=(t,f)=>{const b=document.createElement('button');b.className='btn';b.style.flex='none';b.textContent=t;b.onclick=f;return b};
function expiring(){const old=$('#exb');if(old)old.remove();
 const L=docs.filter(d=>!d.local&&daysLeft(d)!==null&&daysLeft(d)<=7);if(!L.length)return;
 const b=document.createElement('div');b.className='note';b.id='exb';
 b.textContent='Estos diagramas pasarán a la papelera en menos de una semana por llevar tiempo sin abrirse: '+L.map(d=>'«'+d.title+'» ('+Math.max(0,daysLeft(d))+' d)').join(', ')+'. Ábrelos o márcalos como favoritos para conservarlos.';
 $('#qs').before(b)}
function render(){
 const L=docs.filter(d=>String(d.title).toLowerCase().includes(qy)).sort((a,b)=>(b.favorite?1:0)-(a.favorite?1:0));
 let h='<button class="card new" id="nw"><span class="plus">+</span><b>Nuevo diagrama</b><small>Empieza con un lienzo en blanco</small></button>';
 L.forEach(d=>{const u='editor.html?id='+encodeURIComponent(d.id),n=d.local?null:daysLeft(d);
  h+=`<article class="card"><a class="th" href="${esc(u)}" tabindex="-1" aria-hidden="true">${thumb(d.thumb||d.data||{})||'<span class="blank">Vacío</span>'}</a><div class="meta"><a class="tt" href="${esc(u)}">${esc(d.title)}</a>${d.local?'':`<button class="kb" data-f="${esc(d.id)}" aria-label="${d.favorite?'Quitar de favoritos':'Marcar como favorito'}" style="${d.favorite?'color:#f5a524':''}">${d.favorite?'★':'☆'}</button>`}<button class="kb" data-m="${esc(d.id)}" aria-label="Más opciones">⋯</button></div><div class="sub">${ago(d.updated_at)}${d.local?' · <span class="pill">Solo en este navegador</span>':''}${n!==null&&n<=7?' · <span class="pill" style="color:#e5484d">Se borra en '+Math.max(0,n)+' d</span>':''}</div></article>`});
 $('#grid').innerHTML=h;$('#empty').hidden=docs.length>0;expiring()}
$('#grid').addEventListener('click',async e=>{const b=e.target.closest('[data-f]');if(!b)return;const d=docs.find(x=>x.id==b.dataset.f);if(!d)return;try{await DB.setFav(d.id,!d.favorite)}catch(x){toast(x.message)}refresh()});
function cardMenu(id,btn){const d=docs.find(x=>x.id==id);if(!d)return;const r=btn.getBoundingClientRect(),it=[],run=f=>async()=>{try{await f()}catch(x){toast(x.message)}refresh()};
 it.push(['Abrir',()=>{location.href='editor.html?id='+encodeURIComponent(id)}]);
 if(!d.local)it.push([d.favorite?'Quitar de favoritos':'Marcar como favorito',run(()=>DB.setFav(id,!d.favorite))]);
 it.push(['Renombrar',()=>ask('Nombre del diagrama',d.title,t=>run(()=>DB.rename(id,t))())]);
 it.push(['Duplicar',run(async()=>{const f=await DB.get(id);if(f)await DB.create(d.title+' (copia)',f.data,d.local)})]);
 if(d.local&&DB.user)it.push(['Subir a la nube',run(()=>DB.toCloud(id))]);
 it.push([d.local?'Eliminar':'Mover a la papelera',()=>confirmDlg(d.local?'¿Eliminar «'+d.title+'»? No se puede deshacer.':'¿Mover «'+d.title+'» a la papelera? Podrás restaurarlo durante un mes.',d.local?'Eliminar':'Mover',run(()=>DB.remove(id))),1]);
 menu(r.left,r.bottom+4,it)}
function settingsDlg(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Ajustes</p><label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer"><input type="checkbox" id="sad" style="width:auto;margin-top:3px"><span>Mandar a la papelera los diagramas que no abra en 2 meses</span></label><p class="mu">Los diagramas favoritos (★) nunca se mandan a la papelera por inactividad. Aunque desactives esta opción, los que no abras en 500 días y no sean favoritos también pasarán a la papelera. Te avisamos en la portada una semana antes. Solo afecta a los diagramas de la nube.</p><div class="row"><button class="btn" id="sc2">Cerrar</button></div></div>';d.style.display='flex';
 const c=$('#sad');c.checked=DB.autoDel();$('#sc2').onclick=shut;
 c.onchange=async()=>{try{await DB.setAuto(c.checked);toast(c.checked?'Borrado automático activado.':'Borrado automático desactivado.');refresh()}catch(x){c.checked=!c.checked;toast(x.message)}}}
async function trashDlg(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Papelera</p><div id="tl" class="mu">Cargando…</div><p class="mu">Los diagramas se borran definitivamente un mes después de llegar aquí.</p><div class="row"><button class="btn" id="tx">Cerrar</button></div></div>';d.style.display='flex';$('#tx').onclick=shut;
 let L;try{L=await DB.trash()}catch(e){$('#tl').textContent=e.message;return}
 const T=$('#tl');if(!L.length){T.textContent='La papelera está vacía.';return}
 T.innerHTML='';T.style.cssText='display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow:auto';
 L.forEach(x=>{const e=new Date(x.deleted_at);e.setMonth(e.getMonth()+1);const n=Math.max(0,Math.ceil((e-Date.now())/DAY)),row=document.createElement('div');row.className='ex';
  const s=document.createElement('span');s.style.cssText='flex:1;min-width:0;word-break:break-word';s.append(x.title);const t=document.createElement('span');t.className='tag';t.textContent=n<=7?'Se borra definitivamente en '+n+' d':'Quedan '+n+' d';s.append(document.createElement('br'),t);
  row.append(s,mkB('Restaurar',async()=>{try{await DB.restore(x.id);toast('Diagrama restaurado.');refresh()}catch(er){toast(er.message)}trashDlg()}),mkB('Borrar ya',()=>confirmDlg('¿Borrar «'+x.title+'» definitivamente? No se puede deshacer.','Borrar',async()=>{try{await DB.purge(x.id)}catch(er){toast(er.message)}trashDlg()})));T.appendChild(row)})}
const acctBase=acct;
acct=function(){acctBase();const b=$('#av');if(!b)return;const p=DB.profile;
 b.onclick=()=>{const r=b.getBoundingClientRect(),it=[[p?p.nick+'#'+p.tag+' · Mi cuenta':'Mi cuenta',accountDlg],['Ajustes',settingsDlg],['Papelera',trashDlg]];if(DB.admin)it.push(['Almacenamiento',storageDlg]);it.push(['Cerrar sesión',async()=>{await DB.client.auth.signOut()}]);menu(r.right-210,r.bottom+6,it)}};
if(DB.user)acct();
