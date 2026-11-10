/* Exportar el diagrama como imagen (SVG o PNG). Se añade al diálogo «Importar / exportar».
   La imagen sale siempre con el tema claro, sin selección y recortada al contenido, lista para pegar en un trabajo. */
(()=>{
 const NS='http://www.w3.org/2000/svg',PAD=28,MAXPX=16e6;
 const PROPS=['fill','fill-opacity','stroke','stroke-width','stroke-dasharray','stroke-opacity','opacity','font-family','font-size','font-weight','text-anchor'];
 const nombre=()=>{const t=((document.getElementById('ttl')||{}).value||'').trim().replace(/[\\/:*?"<>|]+/g,'').slice(0,80)||'diagrama';return t+'-'+(S.tab=='rel'?'relacional':'er')};

 /* Copia del lienzo con los estilos escritos en cada elemento, para que se vea igual fuera de la web. */
 function construir(){
  const cv=document.getElementById('cv'),raiz=document.documentElement,tema=raiz.getAttribute('data-theme'),sel=[...cv.querySelectorAll('.sel')];
  raiz.setAttribute('data-theme','light');sel.forEach(n=>n.classList.remove('sel'));
  try{
   const b=cv.getBBox();if(!(b.width>0&&b.height>0))return null;
   const x=Math.floor(b.x-PAD),y=Math.floor(b.y-PAD),w=Math.ceil(b.width+2*PAD),h=Math.ceil(b.height+2*PAD);
   const fondo=getComputedStyle(raiz).getPropertyValue('--cv').trim()||'#FBFBFD',copia=cv.cloneNode(true);
   const pintar=(o,c)=>{
    if(o.localName!=='g'){const cs=getComputedStyle(o);let s=PROPS.map(p=>p+':'+cs.getPropertyValue(p)).join(';');
     if(cs.getPropertyValue('text-decoration-line').includes('underline'))s+=';text-decoration:underline';
     c.setAttribute('style',s)}
    c.removeAttribute('class');[...c.attributes].filter(a=>a.name.startsWith('data-')).forEach(a=>c.removeAttribute(a.name));
    for(let i=0;i<o.children.length;i++)pintar(o.children[i],c.children[i])};
   pintar(cv,copia);
   ['id','class','style'].forEach(a=>copia.removeAttribute(a));
   copia.setAttribute('viewBox',x+' '+y+' '+w+' '+h);copia.setAttribute('width',w);copia.setAttribute('height',h);
   const r=document.createElementNS(NS,'rect');[['x',x],['y',y],['width',w],['height',h],['fill',fondo]].forEach(([k,v])=>r.setAttribute(k,v));copia.insertBefore(r,copia.firstChild);
   return{svg:'<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(copia),w,h,fondo}
  }finally{
   if(tema===null)raiz.removeAttribute('data-theme');else raiz.setAttribute('data-theme',tema);
   sel.forEach(n=>n.classList.add('sel'))}}

 const bajar=(blob,nom)=>{const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=nom;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)};

 /* PNG al doble de tamaño (más nítido); se reduce si el diagrama es enorme para no pasarse de memoria. */
 const aPNG=o=>new Promise((ok,ko)=>{
  const k=Math.max(1,Math.min(2,Math.sqrt(MAXPX/(o.w*o.h)))),img=new Image(),u=URL.createObjectURL(new Blob([o.svg],{type:'image/svg+xml;charset=utf-8'}));
  img.onload=()=>{const c=document.createElement('canvas');c.width=Math.round(o.w*k);c.height=Math.round(o.h*k);const g=c.getContext('2d');
   g.fillStyle=o.fondo;g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):ko(),'image/png')};
  img.onerror=()=>{URL.revokeObjectURL(u);ko()};img.src=u});

 /* Añade los botones debajo de los de exportar.js sin tocar ese archivo. */
 const base=io;
 io=function(){
  base();
  const caja=document.querySelector('#dlg .box'),ms=caja&&caja.querySelector('#ms');if(!ms)return;
  const t=document.createElement('p'),f=document.createElement('div');t.className='lbl';t.textContent='Imagen de la pestaña actual';f.className='row';
  f.innerHTML='<button class="btn" id="xsvg">Descargar SVG</button><button class="btn" id="xpng">Descargar PNG</button>';
  caja.insertBefore(t,ms);caja.insertBefore(f,ms);
  const msg=s=>{ms.textContent=s},listo=()=>{
   if(S.tab=='norm'){msg('La imagen se genera desde la pestaña Entidad-relación o Relacional.');return null}
   const o=construir();if(!o)msg('No hay nada que exportar en esta pestaña.');return o};
  f.querySelector('#xsvg').onclick=()=>{const o=listo();if(!o)return;bajar(new Blob([o.svg],{type:'image/svg+xml'}),nombre()+'.svg');msg('SVG descargado.')};
  f.querySelector('#xpng').onclick=async()=>{const o=listo();if(!o)return;try{bajar(await aPNG(o),nombre()+'.png');msg('PNG descargado.')}catch(e){msg('No se pudo crear el PNG. Prueba con el SVG.')}}}
})();
