/* Importar / exportar: el JSON incluye ER, relacional, excepciones y normalización; el SQL sale del esquema relacional. Sustituye a io de app.js. */
(()=>{
 const NF=[['nn','name'],['na','attrs'],['nd0','fds'],['nk','keys'],['nfs','nfs'],['nd','dec'],['nc','cl']],ND={name:'R',attrs:'',fds:'',keys:'',nfs:'',dec:'',cl:''};
 io=function(){const d=$('#dlg');d.innerHTML='<div class="box"><p class="lbl">Importar / exportar</p><textarea id="ta" spellcheck="false"></textarea><input type="file" id="fi" accept=".json,application/json"><div class="row"><button class="btn" id="cp">Copiar</button><button class="btn" id="js">JSON</button><button class="btn" id="sq">SQL</button><button class="btn pri" id="ap">Importar</button><button class="btn" id="cl">Cerrar</button></div><p class="mu" id="ms">El JSON incluye el ER, el relacional, las excepciones y la normalización. El SQL se genera solo desde el esquema relacional.</p></div>';d.style.display='flex';
  const ta=$('#ta'),pack=()=>JSON.stringify({v:1,level:S.level,er:S.er,rel:S.rel,exc:S.exc,norm:S.norm},null,1);ta.value=pack();
  $('#cl').onclick=()=>d.style.display='none';
  $('#sq').onclick=()=>{ta.value=sql();$('#ms').textContent='SQL generado desde el esquema relacional.'};
  $('#js').onclick=()=>{ta.value=pack();$('#ms').textContent='JSON con todo el diagrama.'};
  $('#cp').onclick=async()=>{try{await navigator.clipboard.writeText(ta.value);$('#ms').textContent='Copiado.'}catch(e){ta.select();$('#ms').textContent='Selecciona y copia manualmente.'}};
  $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>ta.value=r.result;r.readAsText(f)};
  $('#ap').onclick=()=>{try{const j=JSON.parse(ta.value),E=j.er,R=j.rel;if(!E||!R||!Array.isArray(E.ents)||!Array.isArray(E.rels)||!Array.isArray(E.links)||!Array.isArray(R.tabs)||!Array.isArray(R.arrows))throw 0;
   E.notes=Array.isArray(E.notes)?E.notes:[];S.er=E;S.rel=R;S.exc=Array.isArray(j.exc)?j.exc:[];
   if(j.norm&&typeof j.norm=='object')S.norm=Object.assign({},ND,j.norm);
   S.sel=null;d.style.display='none';draw(true);NF.forEach(([id,f])=>{const e=document.getElementById(id);if(e&&S.norm)e.value=S.norm[f]});snap()}
   catch(e){$('#ms').textContent='El archivo no tiene el formato esperado.'}}}
})();
