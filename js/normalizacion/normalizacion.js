/* Normalización: pantalla de trabajo. Usa NZ (normalizacion-core.js) y se engancha al editor de app.js. */
(()=>{
 const g=id=>document.getElementById(id),set=a=>'{'+a.join(', ')+'}',LB=['1FN','2FN','3FN','FNBC'];
 const EJ={name:'PRESTAMO',attrs:'id_socio, ISBN, fecha, nombre_socio, titulo',fds:'id_socio -> nombre_socio\nISBN -> titulo'};
 S.norm=Object.assign({name:'R',attrs:'',fds:'',keys:'',nfs:'',dec:'',cl:''},S.norm||{});
 function parse(){const n=S.norm,U=[...new Set(NZ.sp(n.attrs))],F=[],bad=new Set();
  n.fds.split('\n').forEach(l=>{const m=l.split(/->|→/);if(m.length==2){const L=NZ.sp(m[0]),R=NZ.sp(m[1]);if(L.length&&R.length){F.push([L,R]);L.concat(R).forEach(a=>{if(!U.includes(a))bad.add(a)})}}});
  let err='';if(!U.length)err='Escribe los atributos de la relación.';else if(U.length>12)err='Máximo 12 atributos en esta versión.';else if(bad.size)err='Atributos que no están en la relación: '+[...bad].join(', ')+'.';
  return{U,F,err}}
 const decOf=U=>S.norm.dec.split('\n').map(l=>{const m=l.match(/\(([^)]*)\)/);return NZ.sp(m?m[1]:l)}).filter(r=>r.length);
 const kk=ks=>ks.map(k=>[...k].sort().join(',')).sort().join('|');
 /* Verificación en el panel lateral (modos Verificar y Pistas) */
 function normChecks(){
  if(S.level=='practice'||S.level=='auto')return[];
  const{U,F,err}=parse();if(err)return[[false,err,'Revisa los atributos y las dependencias.']];
  const I=NZ.info(U,F),n=S.norm,o=[];
  const uk=n.keys.split(/[;\n]/).map(NZ.sp).filter(k=>k.length);
  if(!uk.length)o.push([false,'Claves candidatas: pendientes','Calcula el cierre de los atributos que no aparecen a la derecha de ninguna dependencia.']);
  else{const ok=kk(uk)==kk(I.ks);o.push([ok,ok?'Claves candidatas: correctas':'Claves candidatas: no coinciden',uk.length<I.ks.length?'Hay más claves de las que has indicado.':uk.length>I.ks.length?'Has indicado alguna clave de más, o no es mínima.':'Comprueba que el cierre de cada clave cubre todos los atributos y que no sobra ninguno.'])}
  if(n.nfs==='')o.push([false,'Forma normal: pendiente','Mira si algún atributo no primo depende de una parte de la clave (2FN) o de otro atributo no primo (3FN).']);
  else{const v=+n.nfs,ok=v==I.nf;o.push([ok,ok?'Forma normal: correcta':'Forma normal: no es la correcta',v<I.nf?'Quizá has contado una violación que no lo es: revisa si el determinante es superclave o si el atributo es primo.':'Revisa las dependencias parciales y las transitivas.'])}
  const D=decOf(U);
  if(D.length){const cov=U.every(a=>D.some(r=>r.includes(a))),unk=D.some(r=>r.some(a=>!U.includes(a)));
   o.push([cov&&!unk,cov&&!unk?'Descomposición: cubre todos los atributos':'Descomposición: no cubre bien los atributos','Cada atributo debe aparecer en alguna relación y no puede haber atributos nuevos.']);
   if(cov&&!unk){const ll=NZ.lossless(U,F,D),pp=NZ.preserved(F,D),mn=Math.min(...D.map(r=>NZ.nfOf(r,F)));
    o.push([ll,ll?'Sin pérdida de información':'Pierde información (join con pérdida)','La intersección de dos relaciones debe ser clave de al menos una de ellas.']);
    o.push([pp,pp?'Conserva las dependencias':'No conserva todas las dependencias','Cada dependencia debería poder comprobarse dentro de una sola relación.']);
    o.push([mn>=2,'La peor relación está en '+LB[mn],'Busca en cada relación dependencias cuyo determinante no sea superclave.'])}}
  else o.push([false,'Descomposición: pendiente','Escribe una relación por línea, por ejemplo R1(A, B).']);
  return o}
 /* Solución explicada paso a paso (modo Automático) */
 const li=(l,a)=>esc(l.join(', '))+' → '+esc(a);
 function props(U,F,D){const ll=NZ.lossless(U,F,D),pp=NZ.preserved(F,D),mn=Math.min(...D.map(r=>NZ.nfOf(r,F)));
  const t=(ok,s)=>`<span class="tg ${ok?'ok':'no'}">${ok?'Sí':'No'}</span> ${s}`;
  return`<ul>${D.map((r,i)=>`<li><b>R${i+1}</b>${esc('('+r.join(', ')+')')}, clave: ${esc(NZ.keysOf(r,NZ.project(r,F)).map(set).join(' o '))}</li>`).join('')}</ul><p>${t(ll,'Sin pérdida de información')} ${t(pp,'Conserva las dependencias')} ${t(mn>=2,'Todas en '+LB[mn]+' o mejor')}</p>`}
 function solution(U,F){const I=NZ.info(U,F),G=NZ.minCover(U,F),np=U.filter(a=>!I.prime.has(a));
  const row=(nm,list,why)=>`<li><span class="tg ${list.length?'no':'ok'}">${list.length?'No cumple':'Cumple'}</span> <b>${nm}</b>${list.length?'<ul>'+list.map(([l,a])=>'<li>'+li(l,a)+': '+why(l,a)+'</li>').join('')+'</ul>':''}</li>`;
  let h=`<div class="nb"><h3>1. Cobertura mínima</h3><ul>${G.map(([l,r])=>'<li>'+li(l,r[0])+'</li>').join('')||'<li>No hay dependencias.</li>'}</ul><p class="mu">Se deja un solo atributo a la derecha, se quitan los atributos sobrantes del determinante y las dependencias que ya se deducen de las demás.</p></div>`;
  h+=`<div class="nb"><h3>2. Claves candidatas</h3><ul>${I.ks.map(k=>`<li><b>${esc(set(k))}</b>: su cierre es ${esc(set(U.filter(a=>NZ.closure(k,F).has(a))))}, todos los atributos, y no sobra ninguno.</li>`).join('')}</ul><p class="mu">Primos: ${esc(set(U.filter(a=>I.prime.has(a))))}. No primos: ${esc(set(np))}.</p></div>`;
  h+=`<div class="nb"><h3>3. Formas normales</h3><ul><li><span class="tg ok">Se asume</span> <b>1FN</b>: atributos atómicos.</li>${row('2FN',I.part,(l,a)=>esc(a)+' depende solo de una parte de la clave')}${row('3FN',I.tr,(l,a)=>esc(set(l))+' no es superclave y '+esc(a)+' no es primo')}${row('FNBC',I.bc,l=>esc(set(l))+' no es superclave')}</ul><p><b>La relación está en ${LB[I.nf]}.</b></p></div>`;
  const D3=NZ.synth(U,F),DB=NZ.bcnf(U,F);
  h+=`<div class="nb"><h3>4. Descomposición en 3FN (síntesis)</h3><p class="mu">Una relación por cada determinante de la cobertura mínima, y otra con una clave si ninguna la contiene.</p>${props(U,F,D3)}</div>`;
  h+=`<div class="nb"><h3>5. Descomposición en FNBC</h3><p class="mu">Se parte la relación por cada dependencia cuyo determinante no es superclave.</p>${props(U,F,DB)}</div>`;
  return h}
 function cierre(){const{U,F,err}=parse(),r=g('ncr'),X=NZ.sp(S.norm.cl);
  if(err||!X.length){r.textContent='';return}
  if(X.some(a=>!U.includes(a))){r.textContent='Hay atributos que no están en la relación.';return}
  const{c,st}=NZ.csteps(X,NZ.sing(F));
  r.innerHTML=`<ul>${st.map(([l,a])=>'<li>'+esc(set(l))+' ⊆ cierre, añadimos '+esc(a.join(', '))+'</li>').join('')}</ul><p><b>${esc(set(X))}⁺ = ${esc(set(U.filter(a=>c.includes(a))))}</b>${c.length>=U.length?' (es superclave)':''}</p>`}
 let built=false;
 function build(o){
  o.innerHTML=`<div class="nw"><h2>Normalización</h2>
<div class="nb"><label>Nombre de la relación<input id="nn" maxlength="60"></label><label>Atributos (separados por comas)<input id="na" placeholder="A, B, C, D"></label>
<label>Dependencias funcionales (una por línea)<textarea id="nd0" spellcheck="false" placeholder="A, B -> C"></textarea></label><div><button class="btn" id="nej">Cargar un ejemplo</button></div></div>
<div class="nb" id="nans"><h3>Tu respuesta</h3><label>Claves candidatas (separa con ; )<input id="nk" placeholder="A,B ; C"></label>
<label>Forma normal de la relación<select id="nfs"><option value="">Elige…</option>${LB.map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select></label>
<label>Descomposición (una relación por línea)<textarea id="nd" spellcheck="false" placeholder="R1(A, B)"></textarea></label></div>
<div class="nb" id="ncw"><h3>Calculadora de cierre</h3><label>Conjunto de atributos<input id="nc" placeholder="A, B"></label><div id="ncr"></div></div>
<div id="nr"></div></div>`;
  [['nn','name'],['na','attrs'],['nd0','fds'],['nk','keys'],['nfs','nfs'],['nd','dec'],['nc','cl']].forEach(([id,f])=>{const e=g(id);e.value=S.norm[f];
   e.oninput=()=>{S.norm[f]=e.value;save();calc()}});
  g('nej').onclick=()=>{Object.assign(S.norm,EJ,{keys:'',nfs:'',dec:'',cl:''});['nn','na','nd0','nk','nfs','nd','nc'].forEach((id,i)=>{g(id).value=S.norm[['name','attrs','fds','keys','nfs','dec','cl'][i]]});save();calc()}}
 function calc(){
  const{U,F,err}=parse(),L=S.level,r=g('nr');
  g('nans').style.display=L=='verify'||L=='hints'?'':'none';
  g('ncw').style.display=L=='hints'||L=='auto'?'':'none';
  r.innerHTML=L=='practice'?'<p class="mu">Modo práctica: aquí no se comprueba nada. Resuélvelo tú.</p>':L=='auto'?(err?'<p class="mu">'+esc(err)+'</p>':solution(U,F)):'';
  if(g('ncw').style.display=='')cierre();
  side()}
 const draw0=draw;
 draw=function(r){draw0(r);const o=g('nrm')||(()=>{const d=document.createElement('div');d.id='nrm';g('cw').appendChild(d);return d})();
  if(S.tab!='norm'){o.style.display='none';built=false;return}
  o.style.display='block';if(!built){build(o);built=true}calc()};
 const checks0=checks;checks=function(){return S.tab=='norm'?normChecks():checks0()};
 draw();
})();
