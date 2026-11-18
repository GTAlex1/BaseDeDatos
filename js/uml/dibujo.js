/* Dibujo de los diagramas UML (clases y casos de uso): tamaños, geometría de las líneas y pintado en SVG. Lo usan uml.js (editor) y las pruebas. */
const UMLD=(()=>{
 const NS='http://www.w3.org/2000/svg',FF='Inter,system-ui,sans-serif',LH=16,tw=s=>String(s).length*7.2,DASH=['dep','real','incl','ext','note'];
 const LIGHT={sf:'#fff',tx:'#1B1F24',mu:'#5B6470',ac:'#2F5BEA',ti:'#EEF2FF',nt:'#FFF6CC',ntt:'#4A3B00'},VARS={sf:'var(--sf)',tx:'var(--tx)',mu:'var(--mu)',ac:'var(--ac)',ti:'var(--ti)',nt:'var(--nt)',ntt:'var(--ntt)'};
 function el(t,a,p,tx){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(tx!=null)e.textContent=tx;if(p)p.appendChild(e);return e}
 const wrap=(s,n)=>{const o=[];let l='';String(s).split(/\s+/).forEach(w=>{if((l+' '+w).trim().length>n){if(l)o.push(l);l=w}else l=(l+' '+w).trim()});o.push(l);return o};
 const find=(M,i)=>M.els.find(e=>e.id==i),box=e=>e.t=='sys'||e.t=='pkg';
 /* Un atributo o método puede llevar {static} (subrayado) o {abstract} (cursiva) */
 const mem=s=>({t:String(s).replace(/\s*\{[^}]*\}\s*/g,' ').trim(),u:/\{(static|est[aá]tic[oa])\}/i.test(s),i:/\{(abstract|abstract[oa])\}/i.test(s)});
 function size(e){
  if(e.t=='class'){const A=(e.attrs||[]).map(s=>mem(s).t),Me=(e.meths||[]).map(s=>mem(s).t),hd=e.st?46:32;e.w=Math.ceil(Math.max(150,...[e.name,...A,...Me].map(s=>tw(s)+24)));e.h=hd+(A.length?A.length*LH+10:12)+(Me.length?Me.length*LH+10:12)}
  else if(e.t=='actor'){e.w=70;e.h=96}
  else if(e.t=='uc'){e.w=Math.ceil(Math.max(150,tw(e.name)+36));e.h=64}
  else if(e.t=='note'){e.w=190;e.h=wrap(e.name,26).length*LH+16}
  else{e.w=e.w||340;e.h=e.h||240}}
 function edge(e,tx,ty){const cx=e.x+e.w/2,cy=e.y+e.h/2,dx=tx-cx,dy=ty-cy;if(!dx&&!dy)return[cx,cy];
  if(e.t=='uc'){const a=e.w/2,b=e.h/2,k=1/Math.sqrt(dx*dx/(a*a)+dy*dy/(b*b));return[cx+dx*k,cy+dy*k]}
  const k=Math.min(e.w/2/Math.abs(dx||1e-9),e.h/2/Math.abs(dy||1e-9));return[cx+dx*k,cy+dy*k]}
 /* Geometría de una relación. Varias entre los mismos dos elementos se dibujan en paralelo; varias sobre uno mismo, en bucles distintos */
 function geo(M,r){const a=find(M,r.a),b=find(M,r.b);if(!a||!b)return null;
  if(a===b){const g=M.rels.filter(z=>z.a==r.a&&z.b==r.a),i=g.indexOf(r),x=a.x+a.w,y=a.y+a.h*(.15+.3*i),y2=y+a.h*.2,o=38+10*i,P=[[x,y],[x+o,y],[x+o,y2],[x,y2]];return{pts:P,pa:P[0],pb:P[3],da:[-1,0],db:[-1,0],mid:[x+o,(y+y2)/2],n:[0,-1]}}
  const ca=[a.x+a.w/2,a.y+a.h/2],cb=[b.x+b.w/2,b.y+b.h/2];let pa=edge(a,cb[0],cb[1]),pb=edge(b,ca[0],ca[1]);
  const all=M.rels.filter(z=>(z.a==r.a&&z.b==r.b)||(z.a==r.b&&z.b==r.a));
  if(all.length>1){const[p,q]=a.id<b.id?[ca,cb]:[cb,ca],L0=Math.hypot(q[0]-p[0],q[1]-p[1])||1,n0=[-(q[1]-p[1])/L0,(q[0]-p[0])/L0],off=(all.indexOf(r)-(all.length-1)/2)*22;pa=[pa[0]+n0[0]*off,pa[1]+n0[1]*off];pb=[pb[0]+n0[0]*off,pb[1]+n0[1]*off]}
  const L=Math.hypot(pb[0]-pa[0],pb[1]-pa[1])||1,u=[(pb[0]-pa[0])/L,(pb[1]-pa[1])/L];
  return{pts:[pa,pb],pa,pb,da:[-u[0],-u[1]],db:u,mid:[(pa[0]+pb[0])/2,(pa[1]+pb[1])/2],n:[-u[1],u[0]]}}
 function mark(g,P,k,pt,d){const[ux,uy]=d,nx=-uy,ny=ux,q=(a,b)=>[pt[0]-ux*a+nx*b,pt[1]-uy*a+ny*b];
  if(k=='ar')el('path',{d:`M${q(12,6)}L${pt}L${q(12,-6)}`,fill:'none',stroke:P.tx,'stroke-width':1.5},g);
  else if(k=='tr')el('path',{d:`M${pt}L${q(14,8)}L${q(14,-8)}Z`,fill:P.sf,stroke:P.tx,'stroke-width':1.5},g);
  else el('path',{d:`M${pt}L${q(10,6)}L${q(20,0)}L${q(10,-6)}Z`,fill:k=='df'?P.tx:P.sf,stroke:P.tx,'stroke-width':1.5},g)}
 /* P: paleta (variables CSS en pantalla, colores fijos al exportar). live: añade selección y datos para los eventos */
 function paint(M,g,P,live,sel){
  const T=(p,x,y,s,o={})=>{const t=el('text',{x,y,fill:o.c||P.tx,'font-family':FF,'font-size':o.fs||13,'font-weight':o.b?700:400,'font-style':o.i?'italic':'normal','text-anchor':o.a||'start'},p,s);if(o.u)t.setAttribute('text-decoration','underline');return t};
  const sk=id=>live&&sel==id?P.ac:P.tx,sw=id=>live&&sel==id?2.6:1.6,at=(id,x)=>live?Object.assign({'data-k':'el','data-id':id},x||{}):{};
  M.els.forEach(size);
  M.els.filter(box).forEach(e=>{const q=el('g',at(e.id),g),pk=e.t=='pkg';
   if(pk){el('path',{d:`M${e.x} ${e.y}H${e.x+110}V${e.y+18}H${e.x+e.w}V${e.y+e.h}H${e.x}Z`,fill:'none',stroke:sk(e.id),'stroke-width':sw(e.id),style:'pointer-events:stroke'},q);
    el('rect',{x:e.x,y:e.y,width:e.w,height:36,fill:'transparent'},q);T(q,e.x+10,e.y+14,e.name,{b:1})}
   else{el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,rx:6,fill:'none',stroke:sk(e.id),'stroke-width':sw(e.id),style:'pointer-events:stroke'},q);
    el('rect',{x:e.x,y:e.y,width:e.w,height:26,fill:'transparent'},q);T(q,e.x+e.w/2,e.y+18,e.name,{a:'middle',b:1})}});
  M.rels.forEach(r=>{const o=geo(M,r);if(!o)return;const q=el('g',live?{'data-k':'rel','data-id':r.id}:{},g),d=o.pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join('');
   el('path',{d,fill:'none',stroke:'transparent','stroke-width':14},q);
   el('path',{d,fill:'none',stroke:sk(r.id),'stroke-width':sw(r.id),'stroke-dasharray':DASH.includes(r.t)?'6 4':'none'},q);
   const A={agg:'dh',comp:'df'}[r.t],B={nav:'ar',dep:'ar',incl:'ar',ext:'ar',inh:'tr',real:'tr'}[r.t];
   if(A)mark(q,P,A,o.pa,o.da);if(B)mark(q,P,B,o.pb,o.db);
   const ac=r.ac&&find(M,r.ac);if(ac){const p=edge(ac,o.mid[0],o.mid[1]);el('path',{d:`M${o.mid}L${p}`,fill:'none',stroke:P.tx,'stroke-width':1.2,'stroke-dasharray':'4 3'},q)}
   const lb=r.lab||(r.t=='incl'?'«include»':r.t=='ext'?'«extend»':'');if(lb)T(q,o.mid[0]+o.n[0]*12,o.mid[1]+o.n[1]*12+4,lb,{a:'middle',i:1});
   const end=(pt,d,m,rl)=>{const n=[-d[1],d[0]],px=pt[0]-d[0]*22,py=pt[1]-d[1]*22;if(m)T(q,px+n[0]*12,py+n[1]*12+4,m,{a:'middle'});if(rl)T(q,px-n[0]*12,py-n[1]*12+4,rl,{a:'middle',i:1,c:P.mu})};
   end(o.pa,o.da,r.ma,r.ra);end(o.pb,o.db,r.mb,r.rb)});
  M.els.filter(e=>!box(e)).forEach(e=>{const q=el('g',at(e.id,{style:'cursor:move'}),g),s=sk(e.id),w=sw(e.id),cx=e.x+e.w/2;
   if(e.t=='class'){const A=e.attrs||[],Me=e.meths||[],ab=e.st=='abstract',lbl=e.st=='interface'?'«interface»':e.st=='enum'?'«enum»':ab?'{abstract}':e.st?'«'+e.st+'»':'',hd=lbl?46:32,y1=e.y+hd,y2=y1+(A.length?A.length*LH+10:12);
    el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,rx:4,fill:P.sf,stroke:s,'stroke-width':w},q);el('rect',{x:e.x+.8,y:e.y+.8,width:e.w-1.6,height:hd-.8,rx:3,fill:P.ti},q);
    if(lbl)T(q,cx,e.y+16,lbl,{a:'middle',fs:11,c:P.mu});T(q,cx,e.y+(lbl?36:21),e.name,{a:'middle',b:1,i:ab});
    el('path',{d:`M${e.x} ${y1}H${e.x+e.w}M${e.x} ${y2}H${e.x+e.w}`,stroke:s,'stroke-width':1.2,fill:'none'},q);
    A.forEach((t,i)=>{const m=mem(t);T(q,e.x+10,y1+14+i*LH,m.t,{u:m.u,i:m.i})});Me.forEach((t,i)=>{const m=mem(t);T(q,e.x+10,y2+14+i*LH,m.t,{u:m.u,i:m.i})})}
   else if(e.t=='actor'){el('rect',{x:e.x,y:e.y,width:e.w,height:e.h,fill:'transparent'},q);const y=e.y;
    el('circle',{cx,cy:y+14,r:9,fill:P.sf,stroke:s,'stroke-width':w},q);el('path',{d:`M${cx} ${y+23}V${y+54}M${cx-16} ${y+34}H${cx+16}M${cx} ${y+54}L${cx-14} ${y+74}M${cx} ${y+54}L${cx+14} ${y+74}`,fill:'none',stroke:s,'stroke-width':w,'stroke-linecap':'round'},q);T(q,cx,y+91,e.name,{a:'middle'})}
   else if(e.t=='uc'){el('ellipse',{cx,cy:e.y+e.h/2,rx:e.w/2,ry:e.h/2,fill:P.sf,stroke:s,'stroke-width':w},q);const L=wrap(e.name,22);L.forEach((t,i)=>T(q,cx,e.y+e.h/2+4+(i-(L.length-1)/2)*LH,t,{a:'middle'}))}
   else if(e.t=='note'){const c=14;el('path',{d:`M${e.x} ${e.y}H${e.x+e.w-c}L${e.x+e.w} ${e.y+c}V${e.y+e.h}H${e.x}Z`,fill:P.nt,stroke:live&&sel==e.id?P.ac:'#D9BC4B','stroke-width':w},q);
    el('path',{d:`M${e.x+e.w-c} ${e.y}V${e.y+c}H${e.x+e.w}`,fill:'none',stroke:'#D9BC4B','stroke-width':1.2},q);wrap(e.name,26).forEach((t,i)=>T(q,e.x+10,e.y+22+i*LH,t,{c:P.ntt,fs:12.5}))}})}
 return{NS,LIGHT,VARS,el,wrap,find,size,edge,geo,paint,box}})();
if(typeof module!=='undefined')module.exports=UMLD;
