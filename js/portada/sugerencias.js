/* Sugerencias: cualquiera envía; el administrador, al pulsar el botón, lee y borra las recibidas (con apodo#etiqueta del autor). */
const sugSend=sugDlg;
async function sugList(){
 if(!DB.client||!DB.admin)return;
 const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Sugerencias recibidas</p><div id="sl" class="mu">Cargando…</div><div class="row"><button class="btn" id="sx">Cerrar</button></div></div>';d.style.display='flex';$('#sx').onclick=shut;
 const r=await DB.client.from('suggestions').select('id,message,author,created_at').order('created_at',{ascending:false}),L=$('#sl');
 if(r.error){L.textContent=r.error.message;return}if(!r.data.length){L.textContent='Todavía no hay sugerencias.';return}
 L.innerHTML='';L.style.cssText='display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto';
 r.data.forEach(x=>{const row=document.createElement('div');row.className='ex';const s=document.createElement('span');s.style.whiteSpace='pre-wrap';s.style.wordBreak='break-word';
  const t=document.createElement('span');t.className='tag';t.textContent=(x.author||'Anónimo')+' · '+new Date(x.created_at).toLocaleString('es-ES');s.append(t,document.createElement('br'),x.message);
  const b=document.createElement('button');b.className='btn';b.style.flex='none';b.textContent='Borrar';
  b.onclick=async()=>{const q=await DB.client.from('suggestions').delete().eq('id',x.id);if(q.error)toast(q.error.message);else sugList()};
  row.append(s,b);L.appendChild(row)})}
$('#sg').onclick=()=>DB.admin?sugList():sugSend();
