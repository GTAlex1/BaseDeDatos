/* Menú del lienzo vacío (clic derecho o mantener pulsado en un hueco): borrar todo lo de la pestaña o todo el diagrama. Se puede deshacer con Ctrl+Z. */
(()=>{
 const cv=document.getElementById('cv'),nEr=()=>S.er.ents.length+S.er.rels.length+S.er.notes.length;
 const wipe=k=>{if(k=='er'||k=='all')S.er={ents:[],rels:[],links:[],notes:[]};if(k=='rel'||k=='all')S.rel={tabs:[],arrows:[]};if(k=='all')S.exc=[];S.sel=null;draw()};
 const sure=(t,k)=>ask('Escribe «sí» para borrar '+t+' (se puede deshacer con Ctrl+Z)','',v=>{if(/^s[ií]/i.test(v))wipe(k)});
 const show=(x,y)=>{if(S.tab=='norm')return;const it=[];
  if(S.tab=='er'&&nEr())it.push(['Borrar todo el ER',()=>sure('todos los elementos del ER','er'),1]);
  if(S.tab=='rel'&&S.rel.tabs.length)it.push(['Borrar todas las tablas',()=>sure('todas las tablas y flechas','rel'),1]);
  if(nEr()+S.rel.tabs.length)it.push(['Borrar todo el diagrama',()=>sure('todo el diagrama (ER, relacional y excepciones)','all'),1]);
  if(it.length)menu(x,y,it)};
 cv.addEventListener('contextmenu',e=>{if(e.target.closest('[data-k]'))return;e.preventDefault();show(e.clientX,e.clientY)});
 let lp=0;
 cv.addEventListener('pointerdown',e=>{clearTimeout(lp);if(e.pointerType=='mouse'||e.target.closest('[data-k]'))return;const x=e.clientX,y=e.clientY;lp=setTimeout(()=>show(x,y),550)});
 ['pointerup','pointermove','pointercancel'].forEach(t=>cv.addEventListener(t,()=>clearTimeout(lp)));
})();
