/* Generación del relacional desde el ER: entidades (con multivalor y débiles), relaciones binarias (1:1, 1:N, N:M) y n-arias, con sus atributos propios. */
function buildRel(E){
 const mx=c=>c=='M'?'N':c,T=[],A=[],m={};let n=0;
 const mk=(name,rows)=>{const t={id:uid(),x:30+(n%3)*300,y:30+Math.floor(n/3)*230,name,rows};n++;T.push(t);return t};
 const pks=p=>{const r=[];p.rows.forEach((x,i)=>{if(x.k.includes('PK'))r.push(i)});return r.length?r:[0]};
 const fk=(c,p,ty,pk)=>pks(p).forEach(pi=>{const r=p.rows[pi]||{n:'id',t:'INT'};c.rows.push({n:r.n,t:r.t,k:pk?['PK','FK']:['FK']});A.push({id:uid(),f:[c.id,c.rows.length-1],t:[p.id,pi],ty})});
 E.ents.forEach(e=>{m[e.id]=mk(e.name.toUpperCase(),e.attrs.filter(a=>a.k!='multi').map(a=>({n:a.n,t:a.k=='key'?'INT':'VARCHAR(50)',k:a.k=='key'||a.k=='part'?['PK']:a.k=='alt'?['UQ']:[]})))});
 /* Entidades débiles: su clave primaria incluye la de la entidad propietaria (relación identificadora) */
 const handled=new Set(),isW=l=>(E.ents.find(e=>e.id==l.e)||{}).weak;
 E.rels.filter(r=>r.ident).forEach(r=>{const L=E.links.filter(l=>l.r==r.id&&m[l.e]),ws=L.filter(isW),os=L.filter(l=>!isW(l));if(!ws.length||!os.length)return;handled.add(r.id);
  ws.forEach(wl=>{const W=m[wl.e],list=[];os.forEach(ol=>{const P=m[ol.e];if(!P||P===W)return;pks(P).forEach(pi=>list.push({P,pi,r:P.rows[pi]||{n:'id',t:'INT'}}))});
   A.forEach(a=>{if(a.f[0]==W.id)a.f[1]+=list.length});
   W.rows.unshift(...list.map(x=>({n:x.r.n,t:x.r.t,k:['PK','FK']})));list.forEach((x,j)=>A.push({id:uid(),f:[W.id,j],t:[x.P.id,x.pi],ty:'1N'}))})});
 E.ents.forEach(e=>e.attrs.filter(a=>a.k=='multi').forEach(a=>{const c=mk(e.name.toUpperCase()+'_'+a.n.toUpperCase(),[]);fk(c,m[e.id],'1N',1);c.rows.push({n:a.n,t:'VARCHAR(50)',k:['PK']})}));
 E.rels.forEach(r=>{if(handled.has(r.id))return;const L=E.links.filter(l=>l.r==r.id&&m[l.e]);if(L.length<2||L.some(l=>!l.c))return;
  const at=(r.attrs||[]).filter(a=>a.k!='multi').map(a=>({n:a.n,t:'VARCHAR(50)',k:[]})),mn=L.filter(l=>mx(l.c)!='1');
  if(L.length==2){const[a,b]=L,x=m[a.e],y=m[b.e];
   if(mn.length==2){const c=mk(r.name.toUpperCase(),[]);fk(c,x,'1N',1);fk(c,y,'1N',1);c.rows.push(...at)}
   else if(a.c=='1'&&mx(b.c)!='1'){fk(y,x,'1N');y.rows.push(...at)}
   else if(b.c=='1'&&mx(a.c)!='1'){fk(x,y,'1N');x.rows.push(...at)}
   else{fk(x,y,'11');x.rows.push(...at)}}
  else{const c=mk(r.name.toUpperCase(),[]);L.forEach(l=>fk(c,m[l.e],'1N',mn.length?mx(l.c)!='1':true));c.rows.push(...at)}});
 return{tabs:T,arrows:A}}
function gen(){S.rel=buildRel(S.er);S.tab='rel';draw()}
if(typeof module!=='undefined')module.exports={buildRel};
