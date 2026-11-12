/* Normalización: algoritmos puros (sin DOM). */
const NZ=(()=>{
 const sp=s=>String(s).split(/[,\s]+/).map(x=>x.trim()).filter(Boolean);
 const pc=m=>{let c=0;while(m){c+=m&1;m>>=1}return c};
 const subs=R=>{const o=[];for(let m=1;m<1<<R.length;m++)o.push(R.filter((_,i)=>m>>i&1));return o};
 const closure=(X,F)=>{const c=new Set(X);let ch=true;while(ch){ch=false;for(const[l,r]of F)if(l.every(a=>c.has(a)))r.forEach(a=>{if(!c.has(a)){c.add(a);ch=true}})}return c};
 const csteps=(X,F)=>{const c=new Set(X),st=[];let ch=true;while(ch){ch=false;for(const[l,r]of F)if(l.every(a=>c.has(a))&&r.some(a=>!c.has(a))){const add=r.filter(a=>!c.has(a));add.forEach(a=>c.add(a));st.push([l,add]);ch=true}}return{c:[...c],st}};
 const sing=F=>F.flatMap(([l,r])=>r.map(a=>[l,[a]]));
 const keysOf=(U,F)=>{const ms=[];for(let m=1;m<1<<U.length;m++)ms.push(m);ms.sort((a,b)=>pc(a)-pc(b));const ks=[];
  for(const m of ms){if(ks.some(k=>(k&m)==k))continue;if(closure(U.filter((_,i)=>m>>i&1),F).size>=U.length)ks.push(m)}
  return ks.map(m=>U.filter((_,i)=>m>>i&1))};
 /* nf: 0=1FN, 1=2FN, 2=3FN, 3=FNBC */
 const info=(U,F)=>{const ks=keysOf(U,F),prime=new Set(ks.flat()),part=[],tr=[],bc=[];
  sing(F).filter(([l,[a]])=>!l.includes(a)).forEach(([l,[a]])=>{
   if(closure(l,F).size<U.length){bc.push([l,a]);if(!prime.has(a))tr.push([l,a])}
   if(!prime.has(a)&&ks.some(k=>l.length<k.length&&l.every(x=>k.includes(x))))part.push([l,a])});
  return{ks,prime,part,tr,bc,nf:part.length?0:tr.length?1:bc.length?2:3}};
 const minCover=(U,F)=>{let G=sing(F).filter(([l,[a]])=>!l.includes(a));
  G=G.map(([l,r])=>{let L=[...l];for(const b of [...L]){if(L.length>1){const L2=L.filter(x=>x!=b);if(closure(L2,G).has(r[0]))L=L2}}return[L,r]});
  const seen=new Set();G=G.filter(([l,r])=>{const k=[...l].sort()+'>'+r;if(seen.has(k))return false;seen.add(k);return true});
  for(let i=G.length-1;i>=0;i--){const H=G.filter((_,j)=>j!=i);if(closure(G[i][0],H).has(G[i][1][0]))G=H}
  return G};
 const synth=(U,F)=>{const m=new Map();minCover(U,F).forEach(([l,[a]])=>{const k=[...l].sort().join(',');if(!m.has(k))m.set(k,new Set(l));m.get(k).add(a)});
  let R=[...m.values()].map(s=>U.filter(x=>s.has(x)));const ks=keysOf(U,F);
  if(!R.some(r=>ks.some(k=>k.every(x=>r.includes(x)))))R.push(ks[0]);
  return R.filter((r,i)=>!R.some((s,j)=>j!=i&&r.every(x=>s.includes(x))&&(s.length>r.length||j<i)))};
 const bcnf=(U,F,R)=>{R=R||U;const n=R.length;
  for(let m=1;m<(1<<n)-1;m++){const X=R.filter((_,i)=>m>>i&1),C=[...closure(X,F)].filter(a=>R.includes(a));
   if(C.length>X.length&&C.length<R.length)return[...bcnf(U,F,R.filter(a=>C.includes(a))),...bcnf(U,F,R.filter(a=>!C.includes(a)||X.includes(a)))]}
  return[R]};
 const project=(R,F)=>subs(R).map(X=>[X,[...closure(X,F)].filter(a=>R.includes(a)&&!X.includes(a))]).filter(([,Y])=>Y.length);
 const nfOf=(R,F)=>info(R,project(R,F)).nf;
 const lossless=(U,F,D)=>{const T=D.map((r,i)=>U.map((a,j)=>r.includes(a)?'a'+j:'b'+i+'_'+j));let ch=true;
  while(ch){ch=false;for(const[l,r]of sing(F)){const L=l.map(a=>U.indexOf(a)),y=U.indexOf(r[0]);
   for(let i=0;i<T.length;i++)for(let k=i+1;k<T.length;k++)if(L.every(c=>T[i][c]==T[k][c])&&T[i][y]!=T[k][y]){
    const v=T[i][y][0]=='a'?T[i][y]:T[k][y],o=T[i][y]==v?T[k][y]:T[i][y];T.forEach(t=>{if(t[y]==o)t[y]=v});ch=true}}}
  return T.some(t=>t.every((c,j)=>c=='a'+j))};
 const preserved=(F,D)=>sing(F).every(([l,[a]])=>{const Z=new Set(l);let ch=true;
  while(ch){ch=false;for(const R of D){closure([...Z].filter(x=>R.includes(x)),F).forEach(x=>{if(R.includes(x)&&!Z.has(x)){Z.add(x);ch=true}})}}
  return Z.has(a)});
 return{sp,closure,csteps,sing,keysOf,info,minCover,synth,bcnf,project,nfOf,lossless,preserved}})();
if(typeof module!=='undefined')module.exports=NZ;
