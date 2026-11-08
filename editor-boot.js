/* Carga el diagrama pedido en la URL, arranca el editor (app.js) y lo guarda solo. */
(async()=>{
 const q=s=>document.querySelector(s),id=new URLSearchParams(location.search).get('id');
 if(!id){location.replace('index.html');return}
 await DB.ready;
 let doc=null;try{doc=await DB.get(id)}catch(e){}
 const d=doc&&doc.data;
 if(!doc||!d||!d.er||!d.rel){document.body.innerHTML='<p class="mu" style="padding:24px">No se encontró este diagrama o no tienes acceso. <a href="index.html">Volver a mis diagramas</a></p>';return}
 q('#ttl').value=doc.title;document.title=doc.title+' · DiagramaDB';
 /* app.js arranca leyendo esta copia de trabajo */
 localStorage.setItem('ddb-v1',JSON.stringify({level:d.level||'verify',tab:'er',sel:null,er:d.er,rel:d.rel,exc:d.exc||[],norm:d.norm}));
 const cur=()=>JSON.stringify({level:S.level,er:S.er,rel:S.rel,exc:S.exc,norm:S.norm}),st=t=>{q('#st').textContent=t},ok=()=>st(DB.isLocal(id)?'Guardado en este navegador':'Guardado en la nube');
 let last='',busy=false;
 async function flush(){
  if(typeof S==='undefined')return;
  while(busy)await new Promise(r=>setTimeout(r,50));
  const c=cur();if(c===last)return;
  busy=true;st('Guardando…');
  try{await DB.save(id,q('#ttl').value.trim()||'Sin título',Object.assign({v:1},JSON.parse(c)));last=c;ok()}catch(e){st('No se pudo guardar')}
  busy=false}
 q('#ttl').onchange=async()=>{const t=q('#ttl').value.trim()||'Sin título';q('#ttl').value=t;document.title=t+' · DiagramaDB';st('Guardando…');try{await DB.rename(id,t);ok()}catch(e){st('No se pudo guardar')}};
 q('#bk').onclick=async e=>{e.preventDefault();await flush();location.href='index.html'};
 addEventListener('pagehide',flush);
 const add=src=>new Promise(r=>{const e=document.createElement('script');e.src=src;e.onload=r;e.onerror=r;document.body.appendChild(e)});
 await add('app.js');
 await add('normalizacion-core.js');
 await add('normalizacion.js');
 await add('historial.js');
 await add('exportar.js');
 last=cur();ok();setInterval(flush,1200);
})();
