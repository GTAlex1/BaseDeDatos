/* Zoom y desplazamiento del lienzo. Se hace cambiando el viewBox del SVG (VB, definido en app.js),
   así las coordenadas de los elementos no cambian. Rueda: desplazar · Ctrl + rueda o pellizco: zoom · arrastrar un hueco: mover la vista. */
(()=>{
 const cw=document.getElementById('cw'),cv=document.getElementById('cv'),MIN=.2,MAX=3;
 const ctl=document.createElement('div'),P=new Map();let pan=null,pinch=null;
 ctl.id='zoomctl';
 ctl.innerHTML='<button class="btn" data-z="out" aria-label="Alejar" title="Alejar">−</button><button class="btn" id="zlbl" data-z="reset" title="Volver al 100 %">100%</button><button class="btn" data-z="in" aria-label="Acercar" title="Acercar (Ctrl + rueda)">+</button><button class="btn" data-z="fit" title="Ajustar el diagrama a la pantalla">Ajustar</button>';
 cw.appendChild(ctl);
 const lbl=ctl.querySelector('#zlbl');

 /* Pasa la vista (VB) al SVG y mueve también los puntos del fondo para que acompañen al dibujo. */
 function aplicar(){
  const r=cv.getBoundingClientRect(),c=cw.getBoundingClientRect(),w=r.width||1,h=r.height||1;
  cv.setAttribute('viewBox',VB.x+' '+VB.y+' '+w/VB.k+' '+h/VB.k);
  cw.style.backgroundSize=20*VB.k+'px '+20*VB.k+'px';
  cw.style.backgroundPosition=(r.left-c.left-VB.x*VB.k)+'px '+(r.top-c.top-VB.y*VB.k)+'px';
  lbl.textContent=Math.round(VB.k*100)+'%'}

 /* Zoom por el factor f dejando quieto el punto (cx,cy) de la pantalla, medido desde la esquina del lienzo. */
 function zoomEn(f,cx,cy){
  const k=Math.min(MAX,Math.max(MIN,VB.k*f));
  VB.x+=cx/VB.k-cx/k;VB.y+=cy/VB.k-cy/k;VB.k=k}

 function ajustar(){
  const b=cv.getBBox(),r=cv.getBoundingClientRect(),m=40;
  if(!(b.width>0&&b.height>0)){VB.x=0;VB.y=0;VB.k=1;return}
  const k=Math.min(MAX,Math.max(MIN,Math.min((r.width-2*m)/b.width,(r.height-2*m)/b.height,1.5)));
  VB.k=k;VB.x=b.x-(r.width/k-b.width)/2;VB.y=b.y-(r.height/k-b.height)/2}

 ctl.addEventListener('click',e=>{
  const b=e.target.closest('[data-z]');if(!b)return;
  const a=b.dataset.z,r=cv.getBoundingClientRect();
  if(a=='in')zoomEn(1.25,r.width/2,r.height/2);
  else if(a=='out')zoomEn(.8,r.width/2,r.height/2);
  else if(a=='reset')zoomEn(1/VB.k,r.width/2,r.height/2);
  else ajustar();
  aplicar()});

 cv.addEventListener('wheel',e=>{
  e.preventDefault();
  const r=cv.getBoundingClientRect(),m=e.deltaMode==1?16:1;
  if(e.ctrlKey||e.metaKey)zoomEn(Math.exp(-Math.max(-30,Math.min(30,e.deltaY*m))*.01),e.clientX-r.left,e.clientY-r.top);
  else{VB.x+=e.deltaX*m/VB.k;VB.y+=e.deltaY*m/VB.k}
  aplicar()},{passive:false});

 /* Mover la vista: arrastrar con un dedo o el ratón sobre un hueco. Con dos dedos, pellizco. */
 cv.addEventListener('pointerdown',e=>{
  if(e.target.closest('[data-k]')||(typeof D!=='undefined'&&D))return;
  if(e.pointerType=='mouse'&&e.button!==0&&e.button!==1)return;
  if(e.button===1)e.preventDefault();
  P.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(P.size===2){const[a,b]=[...P.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,x:(a.x+b.x)/2,y:(a.y+b.y)/2};pan=null}
  else{pan={x:e.clientX,y:e.clientY};cw.classList.add('pan')}});
 cv.addEventListener('pointermove',e=>{
  if(!P.has(e.pointerId))return;
  P.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&P.size===2){
   const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y)||1,x=(a.x+b.x)/2,y=(a.y+b.y)/2,r=cv.getBoundingClientRect();
   VB.x-=(x-pinch.x)/VB.k;VB.y-=(y-pinch.y)/VB.k;zoomEn(d/pinch.d,x-r.left,y-r.top);pinch={d,x,y};aplicar()}
  else if(pan){
   VB.x-=(e.clientX-pan.x)/VB.k;VB.y-=(e.clientY-pan.y)/VB.k;pan={x:e.clientX,y:e.clientY};aplicar()}});
 const fin=e=>{
  if(!P.delete(e.pointerId))return;
  if(P.size<2)pinch=null;
  if(P.size===1){const[a]=[...P.values()];pan={x:a.x,y:a.y}}else{pan=null;cw.classList.remove('pan')}};
 ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,fin));

 if(window.ResizeObserver)new ResizeObserver(aplicar).observe(cv);else addEventListener('resize',aplicar);
 aplicar();
})();
