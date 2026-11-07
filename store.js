/* Almacén de diagramas: nube (Supabase) si hay sesión y navegador si no. */
const DB=(()=>{
 const url='https://bgnntvhlyuslrvkkejic.supabase.co',key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbm50dmhseXVzbHJ2a2tlamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2OTQzOTUsImV4cCI6MjEwOTI3MDM5NX0.L7POvQFo8BbGydWRgw1QYUdq9Cr-uGz2KHBjJLequJs';
 let c=null;try{if(window.supabase)c=window.supabase.createClient(url,key)}catch(e){}
 const LK='ddb-docs',TK='ddb-theme',db={client:c,user:null,profile:null,admin:false,onauth:null};
 const rd=()=>{try{return JSON.parse(localStorage.getItem(LK))||{}}catch(e){return{}}},wr=o=>localStorage.setItem(LK,JSON.stringify(o));
 const isL=id=>String(id).startsWith('l-'),now=()=>new Date().toISOString();
 /* Tema: auto (sistema), light u oscuro; se recuerda en el navegador y en el perfil. */
 db.applyTheme=t=>{const r=document.documentElement;if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme')};
 try{db.applyTheme(localStorage.getItem(TK))}catch(e){}
 const keepTheme=t=>{try{localStorage.setItem(TK,t)}catch(e){}db.applyTheme(t)};
 const PF='nick,tag,theme,avatar_path';
 const loadMe=async()=>{db.profile=null;db.admin=false;if(!c||!db.user)return;
  try{const[p,a]=await Promise.all([c.from('profiles').select(PF).eq('id',db.user.id).maybeSingle(),c.rpc('is_admin')]);
   db.profile=p.data||null;db.admin=a.data===true;if(db.profile)keepTheme(db.profile.theme)}catch(e){}};
 db.setProfile=async(nick,tag,theme)=>{
  const r=await c.from('profiles').upsert({id:db.user.id,nick,tag,theme}).select(PF).single();
  if(r.error)throw r.error;db.profile=r.data;keepTheme(theme);return r.data};
 /* Miniatura: solo posiciones y tipos, sin nombres ni notas. Así la portada no descarga el diagrama entero. */
 const mkThumb=d=>{const E=d.er||{},R=d.rel||{};return{er:{ents:(E.ents||[]).map(n=>({id:n.id,x:n.x,y:n.y,attrs:(n.attrs||[]).map(a=>({k:a.k}))})),rels:(E.rels||[]).map(n=>({id:n.id,x:n.x,y:n.y})),links:(E.links||[]).map(l=>({e:l.e,r:l.r}))},rel:{tabs:(R.tabs||[]).map(t=>({x:t.x,y:t.y,rows:(t.rows||[]).map(()=>0)}))}}};
 db.isLocal=isL;
 db.blank=()=>({v:1,level:'verify',er:{ents:[],rels:[],links:[],notes:[]},rel:{tabs:[],arrows:[]},exc:[]});
 db.ready=c?c.auth.getSession().then(async({data})=>{db.user=data.session?data.session.user:null;await loadMe()}).catch(()=>{}):Promise.resolve();
 if(c)c.auth.onAuthStateChange((_e,s)=>{db.user=s?s.user:null;setTimeout(async()=>{await loadMe();if(db.onauth)db.onauth()},0)});
 db.list=async()=>{
  const out=Object.entries(rd()).map(([id,d])=>({id,title:d.title,updated_at:d.updated_at,data:d.data,local:true}));
  if(c&&db.user){const r=await c.from('diagrams').select('id,title,updated_at,thumb').order('updated_at',{ascending:false});if(r.error)throw r.error;r.data.forEach(d=>out.push(Object.assign(d,{local:false})))}
  return out.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at))};
 db.get=async id=>{
  if(isL(id)){const d=rd()[id];return d?{id,title:d.title,data:d.data}:null}
  if(!c||!db.user)return null;
  const r=await c.from('diagrams').select('id,title,data').eq('id',id).single();return r.error?null:r.data};
 db.create=async(title,data,local)=>{
  if(!local&&c&&db.user){const r=await c.from('diagrams').insert({title,kind:'er',data,thumb:mkThumb(data)}).select('id').single();if(r.error)throw r.error;return r.data.id}
  const id='l-'+Math.random().toString(36).slice(2,10),o=rd();o[id]={title,updated_at:now(),data};wr(o);return id};
 db.save=async(id,title,data)=>{
  if(isL(id)){const o=rd();if(o[id]){o[id]={title,updated_at:now(),data};wr(o)}return}
  const r=await c.from('diagrams').update({title,data,thumb:mkThumb(data)}).eq('id',id);if(r.error)throw r.error};
 db.rename=async(id,title)=>{
  if(isL(id)){const o=rd();if(o[id]){o[id].title=title;o[id].updated_at=now();wr(o)}return}
  const r=await c.from('diagrams').update({title}).eq('id',id);if(r.error)throw r.error};
 db.remove=async id=>{
  if(isL(id)){const o=rd();delete o[id];wr(o);return}
  const r=await c.from('diagrams').delete().eq('id',id);if(r.error)throw r.error};
 db.toCloud=async id=>{const d=await db.get(id);if(!d)return;await db.create(d.title,d.data);await db.remove(id)};
 db.url=url;
 return db})();
