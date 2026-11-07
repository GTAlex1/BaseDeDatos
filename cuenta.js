/* Cuenta: foto de perfil, apodo#etiqueta, tema y, para el admin, panel de almacenamiento. Sustituye a accountDlg y acct de home.js. */
const MB=1048576,fmt=b=>b>=MB*1024?(b/MB/1024).toFixed(2)+' GB':b>=MB?(b/MB).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
DB.avatarUrl=p=>p?DB.url+'/storage/v1/object/public/avatars/'+p:'';
function resizeAvatar(file){return new Promise((ok,ko)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{URL.revokeObjectURL(u);const s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=256;c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);c.toBlob(b=>{if(b&&b.type=='image/webp')return ok(b);c.toBlob(j=>j?ok(j):ko(new Error('No se pudo procesar la imagen.')),'image/jpeg',.85)},'image/webp',.85)};im.onerror=()=>ko(new Error('Imagen no válida.'));im.src=u})}
DB.setAvatar=async blob=>{const c=DB.client,st=c.storage.from('avatars'),uid=DB.user.id,old=DB.profile&&DB.profile.avatar_path,path=uid+'/'+Date.now()+(blob.type=='image/webp'?'.webp':'.jpg');
 let r=await st.upload(path,blob,{contentType:blob.type,cacheControl:'31536000'});if(r.error)throw r.error;
 r=await c.from('profiles').update({avatar_path:path}).eq('id',uid);if(r.error){await st.remove([path]);throw r.error}
 DB.profile.avatar_path=path;if(old)await st.remove([old])};
DB.clearAvatar=async()=>{const c=DB.client,uid=DB.user.id,old=DB.profile&&DB.profile.avatar_path;if(!old)return;
 const r=await c.from('profiles').update({avatar_path:null}).eq('id',uid);if(r.error)throw r.error;DB.profile.avatar_path=null;await c.storage.from('avatars').remove([old])};
const paintAv=(el,p,u)=>{if(p&&p.avatar_path){el.textContent='';el.style.cssText='background:url('+DB.avatarUrl(p.avatar_path)+') center/cover'}else{el.style.cssText='';el.textContent=((p&&p.nick)||(u&&u.email)||'?')[0].toUpperCase()}};
function accountDlg(){const p=DB.profile||{nick:'',tag:'',theme:'auto'},d=$('#dlg');let th=p.theme;
 d.innerHTML='<div class="box"><p class="lbl">Mi cuenta</p><p class="mu" id="ae"></p><div style="display:flex;gap:12px;align-items:center"><span class="av" id="apv" style="width:64px;height:64px;font-size:24px;flex:none"></span><div style="display:flex;flex-direction:column;gap:6px"><button class="btn" id="aph">Cambiar foto</button><button class="btn" id="apx">Quitar foto</button></div><input id="apf" type="file" accept="image/*" hidden></div><div style="display:flex;gap:8px;align-items:center"><input id="anick" maxlength="20" placeholder="Apodo" autocomplete="off" style="flex:1;min-width:0"><b>#</b><input id="atag" maxlength="8" placeholder="Etiqueta" autocomplete="off" style="width:110px"></div><p class="mu">Apodo de 2 a 20 caracteres, sin espacios ni #. Etiqueta de hasta 8 letras o números (mayúsculas y minúsculas cuentan distinto). La combinación debe ser única. La foto se guarda al elegirla.</p><p class="lbl" style="margin-top:4px">Tema</p><div class="seg" id="ts"><button data-t="auto">Automático</button><button data-t="light">Claro</button><button data-t="dark">Oscuro</button></div><div class="row"><button class="btn" id="acx">Cancelar</button><button class="btn pri" id="asv">Guardar</button></div><p class="mu" id="am"></p></div>';d.style.display='flex';
 const m=x=>{$('#am').textContent=x},pv=()=>{paintAv($('#apv'),DB.profile,DB.user);$('#apx').hidden=!(DB.profile&&DB.profile.avatar_path)};
 $('#ae').textContent=(DB.user&&DB.user.email)||'';$('#anick').value=p.nick;$('#atag').value=p.tag;pv();
 const mark=()=>document.querySelectorAll('#ts button').forEach(b=>b.classList.toggle('on',b.dataset.t==th));mark();
 document.querySelectorAll('#ts button').forEach(b=>b.onclick=()=>{th=b.dataset.t;DB.applyTheme(th);mark()});
 $('#aph').onclick=()=>$('#apf').click();
 $('#apf').onchange=async e=>{const f=e.target.files[0];if(!f)return;m('Subiendo…');try{await DB.setAvatar(await resizeAvatar(f));m('');pv();acct()}catch(x){m(x.message||'No se pudo subir la foto.')}};
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
