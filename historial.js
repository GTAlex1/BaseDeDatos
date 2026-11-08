/* Historial: deshacer (Ctrl+Z) y rehacer (Ctrl+Mayús+Z o Ctrl+Y) en ER, relacional y normalización. Sustituye a snap y hist de app.js. */
(()=>{
 let T=0;
 const NF=[['nn','name'],['na','attrs'],['nd0','fds'],['nk','keys'],['nfs','nfs'],['nd','dec'],['nc','cl']];
 snap=function(){const s=JSON.stringify({er:S.er,rel:S.rel,exc:S.exc,norm:S.norm});if(H[HI]===s)return;H=H.slice(0,HI+1);H.push(s);if(H.length>80)H.shift();HI=H.length-1};
 hist=function(d){clearTimeout(T);snap();const i=HI+d;if(i<0||i>=H.length)return;HI=i;const j=JSON.parse(H[i]);
  S.er=j.er;S.rel=j.rel;S.exc=j.exc;if(j.norm)S.norm=j.norm;S.sel=null;draw(true);
  NF.forEach(([id,f])=>{const e=document.getElementById(id);if(e&&S.norm)e.value=S.norm[f]})};
 /* Escribir en la pantalla de normalización guarda un paso del historial tras una breve pausa */
 document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#nrm')){clearTimeout(T);T=setTimeout(snap,500)}});
 document.addEventListener('click',e=>{if(e.target.id=='nej'){clearTimeout(T);snap()}});
 /* En campos de texto de otras ventanas se deja el deshacer nativo; en los de normalización y fuera de campos se usa este historial */
 addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const k=e.key.toLowerCase();if(k!='z'&&k!='y')return;
  const f=e.target.closest&&e.target.closest('input,textarea');if(f&&!f.closest('#nrm'))return;
  const d=document.getElementById('dlg');if(d&&d.style.display=='flex')return;
  e.preventDefault();e.stopPropagation();hist(k=='y'||e.shiftKey?1:-1)},true);
 H.length=0;HI=-1;snap();
})();
