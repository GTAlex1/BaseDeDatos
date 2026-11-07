/* Cuenta: foto de perfil (con recorte), apodo#etiqueta, tema y, para el admin, panel de almacenamiento. Sustituye a accountDlg y acct de home.js. */
const MB=1048576,fmt=b=>b>=MB*1024?(b/MB/1024).toFixed(2)+' GB':b>=MB?(b/MB).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
DB.avatarUrl=p=>p?DB.url+'/storage/v1/object/public/avatars/'+p:'';
/* Recorte: arrastrar, zoom con deslizador, rueda o pellizco. Devuelve un blob de 256x256 (WebP o JPEG) o null si se cancela. */
function cropDlg(file){return new Promise((ok,ko)=>{
 const V=280,im=new Image(),url=URL.createObjectURL(file);
 im.onerror=()=>{URL.revokeObjectURL(url);ko(new Error('Imagen no válida.'))};
 im.onload=()=>{
  const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px';
  o.innerHTML='<div class="box" style="max-width:340px;width:100%"><p class="lbl">Ajusta tu foto</p><canvas id="cv" width="280" height="280" style="width:100%;max-width:280px;aspect-ratio:1;align-self:center;touch-action:none;cursor:grab;border-radius:8px"></canvas><input id="cz" type="range" min="1" max="5" step="0.01" value="1" aria-label="Zoom"><p class="mu">Arrastra para mover y usa el zoom para acercar.</p><div class="row"><button class="btn" id="cc">Cancelar</button><button class="btn pri" id="cu">Usar foto</button></div></div>';
  document.body.appendChild(o);
  const cv=o.querySelector('#cv'),g=cv.getContext('2d'),zs=o.querySelector('#cz'),min=V/Math.min(im.width,im.height),P=new Map();
  let z=1,ox=(V-im.width*min)/2,oy=(V-im.height*min)/2,d0=0;
  const sc=()=>min*z,clamp=()=>{ox=Math.min(0,Math.max(V-im.width*sc(),ox));oy=Math.min(0,Math.max(V-im.height*sc(),oy))};
  const draw=()=>{g.clearRect(0,0,V,V);g.drawImage(im,ox,oy,im.width*sc(),im.height*sc());g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.rect(0,0,V,V);g.arc(V/2,V/2,V/2-2,0,Math.PI*2,true);g.fill('evenodd')};
  const zoom=n=>{n=Math.min(5,Math.max(1,n));const k=n/z,c=V/2;ox=c-(c-ox)*k;oy=c-(c-oy)*k;z=n;zs.value=z;clamp();draw()};
  const dist=()=>{const[a,b]=[...P.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};
  cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size==2)d0=dist()};
  cv.onpointermove=e=>{if(!P.has(e.pointerId))return;const p=P.get(e.pointerId),f=V/cv.clientWidth;
   if(P.size==1){ox+=(e.clientX-p[0])*f;oy+=(e.clientY-p[1])*f;P.set(e.pointerId,[e.clientX,e.clientY]);clamp();draw()}
   else{P.set(e.pointerId,[e.clientX,e.clientY]);const d=dist();if(d0)zoom(z*d/d0);d0=d}};
  cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);d0=0};
  cv.onwheel=e=>{e.preventDefault();zoom(z*(e.deltaY<0?1.1:1/1.1))};
  zs.oninput=()=>zoom(+zs.value);
  const end=()=>{o.remove();URL.revokeObjectURL(url)};
  o.querySelector('#cc').onclick=()=>{end();ok(null)};
  o.querySelector('#cu').onclick=()=>{const out=document.createElement('canvas');out.width=out.height=256;const s=sc();out.getContext('2d').drawImage(im,-ox/s,-oy/s,V/s,V/s,0,0,256,256);end();
   out.toBlob(b=>{if(b&&b.type=='image/webp')return ok(b);out.toBlob(j=>j?ok(j):ko(new Error('No se pudo procesar la imagen.')),'image/jpeg',.85)},'image/webp',.85)};
  draw()};
 im.src=url})}
/* Borra de la carpeta del usuario todo lo que no sea la foto actual (la anterior y cualquier resto). */
DB.cleanAvatars=async keep=>{const st=DB.client.storage.from('avatars'),uid=DB.user.id,l=await st.list(uid,{limit:100});
 if(l.error)return;const old=l.data.map(f=>uid+'/'+f.name).filter(p=>p!==keep);if(old.length)await st.remove(old)};
DB.setAvatar=async blob=>{const c=DB.client,st=c.storage.from('avatars'),uid=DB.user.id,path=uid+'/'+Date.now()+(blob.type=='image/webp'?'.webp':'.jpg');
 let r=await st.upload(path,blob,{contentType:blob.type,cacheControl:'31536000'});if(r.error)throw r.error;
 r=await c.from('profiles').update({avatar_path:path}).eq('id',uid);if(r.error){await st.remove([path]);throw r.error}
 DB.profile.avatar_path=path;await DB.cleanAvatars(path)};
DB.clearAvatar=async()=>{const c=DB.client,uid=DB.user.id;
 const r=await c.from('profiles').update({avatar_path:null}).eq('id',uid);if(r.error)throw r.error;DB.profile.avatar_path=null;await DB.cleanAvatars('')};
const paintAv=(el,p,u)=>{const s=el.style;if(p&&p.avatar_path){el.textContent='';s.backgroundImage='url('+DB.avatarUrl(p.avatar_path)+')';s.backgroundSize='cover';s.backgroundPosition='center'}else{s.backgroundImage='';el.textContent=((p&&p.nick)||(u&&u.email)||'?')[0].toUpperCase()}};
function accountDlg(){const p=DB.profile||{nick:'',tag:'',theme:'auto'},d=$('#dlg');let th=p.theme;
 d.innerHTML='<div class="box"><p class="lbl">Mi cuenta</p><p class="mu" id="ae"></p><div style="display:flex;gap:12px;align-items:center"><span class="av" id="apv" style="display:grid;place-items:center;width:64px;height:64px;font-size:24px;border-radius:50%;flex:none"></span><div style="display:flex;flex-direction:column;gap:6px"><button class="btn" id="aph">Cambiar foto</button><button class="btn" id="apx">Quitar foto</button></div><input id="apf" type="file" accept="image/*" hidden></div><div style="display:flex;gap:8px;align-items:center"><input id="anick" maxlength="20" placeholder="Apodo" autocomplete="off" style="flex:1;min-width:0"><b>#</b><input id="atag" maxlength="8" placeholder="Etiqueta" autocomplete="off" style="width:110px"></div><p class="mu">Apodo de 2 a 20 caracteres, sin espacios ni #. Etiqueta de hasta 8 letras o números (mayúsculas y minúsculas cuentan distinto). La combinación debe ser única. La foto se guarda al elegirla.</p><p class="lbl" style="margin-top:4px">Tema</p><div class="seg" id="ts"><button data-t="auto">Automático</button><button data-t="light">Claro</button><button data-t="dark">Oscuro</button></div><div class="row"><button class="btn" id="acx">Cancelar</button><button class="btn pri" id="asv">Guardar</button></div><p class="mu" id="am"></p></div>';d.style.display='flex';
 const m=x=>{$('#am').textContent=x},pv=()=>{paintAv($('#apv'),DB.profile,DB.user);$('#apx').hidden=!(DB.profile&&DB.profile.avatar_path)};
 $('#ae').textContent=(DB.user&&DB.user.email)||'';$('#anick').value=p.nick;$('#atag').value=p.tag;pv();
 const mark=()=>document.querySelectorAll('#ts button').forEach(b=>b.classList.toggle('on',b.dataset.t==th));mark();
 document.querySelectorAll('#ts button').forEach(b=>b.onclick=()=>{th=b.dataset.t;DB.applyTheme(th);mark()});
 $('#aph').onclick=()=>$('#apf').click();
 $('#apf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const b=await cropDlg(f);if(!b)return;m('Subiendo…');await DB.setAvatar(b);m('');pv();acct()}catch(x){m(x.message||'No se pudo subir la foto.')}};
 $('#apx').onclick=async()=>{try{await DB.clearAvatar();pv();acct()}catch(x){m(x.message)}};
 $('#acx').onclick=()=>{DB.applyTheme(p.theme);shut()};
 $('#asv').onclick=async()=>{const n=$('#anick').value.trim(),t=$('#atag').value.trim();
  if(!/^[^#\s]{2,20}$/.test(n))return m('El apodo debe tener de 2 a 20 caracteres, sin espacios ni #.');
  if(!/^[A-Za-z0-9]{1,8}$/.test(t))return m('La etiqueta debe tener de 1 a 8 letras o números.');
  $('#asv').disabled=true;
  try{await DB.setProfile(n,t,th);shut();acct();toast('Cuenta actualizada.')}
  catch(e){m(e.code=='23505'?'Ese apodo con esa etiqueta ya está en uso.':(e.message||'No se pudo guardar.'));$('#asv').disabled=false}}}
function acct(){const a=$('#acct'),u=DB.user;$('#note').hidden=!DB.client||!!u;
 if(!DB.client){a.innerHTML='';return}
 a.innerHTML=u?'<button class="av" id="av" aria-label="Cuenta"></button>':'<button class="btn" id="li">Iniciar sesión</button>';
 if(u){const b=$('#av'),p=DB.profile;paintAv(b,p,u);
  b.onclick=()=>{const r=b.getBoundingClientRect(),it=[[p?p.nick+'#'+p.tag+' · Mi cuenta':'Mi cuenta',accountDlg]];if(DB.admin)it.push(['Almacenamiento',storageDlg]);it.push(['Cerrar sesión',async()=>{await DB.client.auth.signOut()}]);menu(r.right-210,r.bottom+6,it)}}
 else $('#li').onclick=loginDlg}
async function storageDlg(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Almacenamiento</p><div id="sb" class="mu">Cargando…</div><div class="row"><button class="btn" id="sx">Cerrar</button></div></div>';d.style.display='flex';$('#sx').onclick=shut;
 const r=await DB.client.rpc('admin_storage'),B=$('#sb');if(r.error){B.textContent=r.error.message;return}
 const s=r.data,U=s.unused,bar=(t,u,l)=>{const p=Math.min(100,u/l*100);return '<div style="margin:6px 0 14px"><div style="display:flex;justify-content:space-between;gap:8px"><b>'+t+'</b><span>'+fmt(u)+' de '+fmt(l)+' · '+p.toFixed(1)+' %</span></div><div style="height:10px;border-radius:6px;background:#8884;overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+(p>85?'#e5484d':p>60?'#f5a524':'#6e8bff')+'"></div></div></div>'};
 let h=bar('Archivos (fotos)',s.files_bytes,MB*1024)+bar('Base de datos',s.db_bytes,MB*500)+'<p class="mu">'+s.files+' archivo(s) guardado(s). Plan gratuito: 1 GB de archivos y 500 MB de base de datos.</p><p class="lbl">Fotos sin usar</p>';
 if(!U.length)h+='<p class="mu">No hay fotos sin usar (se ignoran las de la última hora).</p>';
 else{h+='<p class="mu">'+U.length+' foto(s) que ningún perfil usa · '+fmt(U.reduce((n,x)=>n+x.size,0))+'</p><div style="display:flex;flex-wrap:wrap;gap:6px;max-height:140px;overflow:auto">'+U.slice(0,60).map(x=>'<img src="'+DB.avatarUrl(x.name)+'" alt="" width="40" height="40" style="border-radius:50%;object-fit:cover">').join('')+'</div><div class="row"><button class="btn pri" id="sdel">Borrar las '+U.length+'</button></div>'}
 B.innerHTML=h;B.className='';
 if(U.length)$('#sdel').onclick=()=>confirmDlg('¿Borrar '+U.length+' foto(s) sin usar? No se puede deshacer.','Borrar',async()=>{
  for(let i=0;i<U.length;i+=100){const q=await DB.client.storage.from('avatars').remove(U.slice(i,i+100).map(x=>x.name));if(q.error){toast(q.error.message);break}}
  toast('Fotos sin usar borradas.');storageDlg()})}
