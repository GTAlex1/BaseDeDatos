/* ===== Sugerencias ===== */
const ADMIN_ID='1610b5c9-9d5d-4c44-8f0c-3d98b93976ec';
const isAdmin=()=>!!(user&&user.id===ADMIN_ID);
const hdr0=hdr;
hdr=function(){hdr0();const a=$('#adm');if(a)a.innerHTML=isAdmin()?'<button class="btn" data-s="list">Ver sugerencias</button>':''};
function sugDlg(){
 if(!sb){toast('La nube no está disponible.');return}
 const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Sugerencias</p><p class="mu">Cuéntame qué mejorarías o qué fallo has visto.</p><textarea id="sg" maxlength="1000" placeholder="Tu sugerencia…" style="height:140px;font-family:inherit;font-size:14px"></textarea><div class="row"><button class="btn" id="sc">Cancelar</button><button class="btn pri" id="ss">Enviar</button></div><p class="mu" id="sm"></p></div>';d.style.display='flex';$('#sg').focus();
 $('#sc').onclick=shut;
 $('#ss').onclick=async()=>{const m=$('#sg').value.trim();if(m.length<3){$('#sm').textContent='Escribe al menos 3 caracteres.';return}
  $('#ss').disabled=true;const{error}=await sb.from('suggestions').insert({message:m});
  if(error){$('#sm').textContent=error.message;$('#ss').disabled=false}else{shut();toast('¡Gracias por tu sugerencia!')}}}
async function sugList(){
 if(!sb||!isAdmin())return;
 const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Sugerencias recibidas</p><div id="sl" class="mu">Cargando…</div><div class="row"><button class="btn" id="sx">Cerrar</button></div></div>';d.style.display='flex';$('#sx').onclick=shut;
 const r=await sb.from('suggestions').select('id,message,created_at').order('created_at',{ascending:false}),L=$('#sl');
 if(r.error){L.textContent=r.error.message;return}if(!r.data.length){L.textContent='Todavía no hay sugerencias.';return}
 L.innerHTML='';L.style.cssText='display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto';
 r.data.forEach(x=>{const row=document.createElement('div');row.className='ex';const s=document.createElement('span');s.style.whiteSpace='pre-wrap';s.style.wordBreak='break-word';
  const t=document.createElement('span');t.className='tag';t.textContent=new Date(x.created_at).toLocaleString('es-ES');s.append(t,document.createElement('br'),x.message);
  const b=document.createElement('button');b.className='btn';b.style.flex='none';b.textContent='Borrar';
  b.onclick=async()=>{const q=await sb.from('suggestions').delete().eq('id',x.id);if(q.error)toast(q.error.message);else sugList()};
  row.append(s,b);L.appendChild(row)})}
document.addEventListener('click',e=>{const t=e.target.closest('[data-s]');if(!t)return;if(t.dataset.s=='open')sugDlg();else sugList()});
hdr();
