/**
 * The Minato Maru's CAD engine, shared by the survey sheets (tools/ferry-exterior-cad.mjs, Rev A–B, and
 * tools/ferry-cad.mjs, Rev C): her triangles as the game builds them, orthographic views with hidden lines removed
 * against a software depth buffer, cut by planes for plans and sections, and drawn onto A1 sheets written as SVG and
 * AutoCAD R12 DXF. Moved here unchanged from ferry-exterior-cad.mjs (9 November 2026); Rev C adds several clip planes a
 * view (a section cropped to a room), the depth buffer's resolution per view, and the title block's details per set.
 */
import * as THREE from '../vendor/three.module.js';
export const r2=n=>Math.round(n*100)/100;

/** Every visible triangle in her frame (metres; +x port, y up from the laden waterline, +z forward, origin amidships). */
export function soup(root){
 const P=[],owner=[],parts=[],marks=[],m4=new THREE.Matrix4(),v=new THREE.Vector3();
 root.traverseVisible(o=>{
  if(!o.isMesh)return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  if(mats.every(m=>!m||m.visible===false||m.colorWrite===false))return;
  const g=o.geometry,pos=g.attributes.position;if(!pos)return;
  const idx=g.index,n=(idx?idx.count:pos.count)-(idx?idx.count:pos.count)%3,count=o.isInstancedMesh?o.count:1,part=parts.length;
  parts.push(o.name||o.parent?.name||'unnamed');marks.push(MARKING.test(o.name)?1:0);
  for(let k=0;k<count;k++){
   if(o.isInstancedMesh){o.getMatrixAt(k,m4);m4.premultiply(o.matrixWorld);}else m4.copy(o.matrixWorld);
   for(let i=0;i<n;i++){v.fromBufferAttribute(pos,idx?idx.getX(i):i).applyMatrix4(m4);P.push(v.x,v.y,v.z);}
   for(let t=0;t<n/3;t++)owner.push(part);
  }
 });
 return {P:Float64Array.from(P),owner:Int32Array.from(owner),parts,mark:Uint8Array.from(owner,o=>marks[o])};
}
/** Paint, not structure: the painted words and marks, the red walkways, labels and tags. Drawn as markings, thin and dashed. */
export const MARKING=/^Minato Maru (decal|markings)$|^label:|KKS tag|^badge$|^wordmark$/;

/** Welds the vertices (0.5 mm) and finds every edge with the faces that meet on it. */
export function topology(P){
 const T3=P.length/3,vid=new Int32Array(T3),map=new Map();let nv=0;
 for(let i=0;i<T3;i++){const k=Math.round(P[i*3]*2000)+','+Math.round(P[i*3+1]*2000)+','+Math.round(P[i*3+2]*2000);let id=map.get(k);if(id===undefined){id=nv++;map.set(k,id);}vid[i]=id;}
 const nt=T3/3,N=new Float64Array(nt*3),ok=new Uint8Array(nt);
 for(let t=0;t<nt;t++){const a=t*9;const ux=P[a+3]-P[a],uy=P[a+4]-P[a+1],uz=P[a+5]-P[a+2],wx=P[a+6]-P[a],wy=P[a+7]-P[a+1],wz=P[a+8]-P[a+2];
  const nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,l=Math.hypot(nx,ny,nz);
  if(l>1e-10&&vid[t*3]!==vid[t*3+1]&&vid[t*3+1]!==vid[t*3+2]&&vid[t*3]!==vid[t*3+2]){ok[t]=1;N[t*3]=nx/l;N[t*3+1]=ny/l;N[t*3+2]=nz/l;}}
 const E=new Map();
 for(let t=0;t<nt;t++){if(!ok[t])continue;for(let e=0;e<3;e++){const i=t*3+e,j=t*3+(e+1)%3,a=vid[i],b=vid[j],key=a<b?a*4194304+b:b*4194304+a;
  let r=E.get(key);if(!r){r={i,j,f:[]};E.set(key,r);}r.f.push(t);}}
 const edges=[];const cos=Math.cos(50*Math.PI/180);
 for(const r of E.values()){
  let crease=r.f.length===1;
  for(let a=0;a<r.f.length&&!crease;a++)for(let b=a+1;b<r.f.length;b++){const p=r.f[a]*3,q=r.f[b]*3;if(N[p]*N[q]+N[p+1]*N[q+1]+N[p+2]*N[q+2]<cos){crease=true;break;}}
  edges.push({a:r.i,b:r.j,f:r.f,crease});
 }
 return {N,ok,edges};
}

// ------------------------------------------------------------------ hidden-line removal
/** Orthographic views: screen right U, screen up V, depth D (away from the eye). */
export const VIEWS={
 starboard:{U:[0,0,1],V:[0,1,0],D:[1,0,0],title:'STARBOARD PROFILE'},
 port:{U:[0,0,-1],V:[0,1,0],D:[-1,0,0],title:'PORT PROFILE'},
 plan:{U:[0,0,1],V:[1,0,0],D:[0,-1,0],title:'PLAN FROM ABOVE'},
 bow:{U:[1,0,0],V:[0,1,0],D:[0,0,-1],title:'BOW ELEVATION, LOOKING AFT'},
 stern:{U:[-1,0,0],V:[0,1,0],D:[0,0,1],title:'STERN ELEVATION, LOOKING FORWARD'},
};
export const dot=(a,x,y,z)=>a[0]*x+a[1]*y+a[2]*z;
export const RES=.01;   // 1 cm a pixel of the depth buffer: 0.1 mm on the sheet at 1:100

/**
 * Projects her into a view, fills the depth buffer, and returns the visible edges as segments in view metres. With
 * `clip` ({axis 0|1|2, value, keep +1 to keep the side where the coordinate is greater, −1 less}) she is cut by that
 * plane first, as a section or a plan cut above a deck: what is cut away is not drawn, and `cut` holds the lines where
 * the plane cuts her faces.
 */
export function hiddenLine(model,view,clip=null,{res=RES}={}){
 const {N,ok,edges,mark}=model,V=typeof view==='string'?VIEWS[view]:view;let P=model.P,owner=null;
 // One plane, or several: crop planes (cut: false) first, then the plane that cuts (its lines drawn heavy).
 const planes=clip?(Array.isArray(clip)?clip:[clip]).map(c=>({cut:true,...c})).sort((a,b)=>(a.cut?1:0)-(b.cut?1:0)):[];
 const sideOf=(c,x,y,z)=>c.keep*([x,y,z][c.axis]-c.value);
 const cut=[];
 if(planes.length){
  // Cut every triangle by each plane in turn (Sutherland–Hodgman): keep what is on the kept side (fan-triangulated),
  // and note where the cutting plane cuts it.
  const out=[],own=[],tri=model.P;
  for(let t=0;t<tri.length/9;t++){
   let poly=[0,1,2].map(k=>[tri[t*9+k*3],tri[t*9+k*3+1],tri[t*9+k*3+2]]),whole=true,xs=[];
   for(const c of planes){
    const d=poly.map(p=>sideOf(c,...p));
    if(d.every(x=>x>=0))continue;if(d.every(x=>x<0)){poly=null;break;}
    whole=false;const next=[],cx=[];
    for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length],da=d[k],db=d[(k+1)%poly.length];if(da>=0)next.push(a);
     if((da>=0)!==(db>=0)){const f=da/(da-db),q=a.map((v,i)=>v+(b[i]-v)*f);next.push(q);cx.push(q);}}
    poly=next;if(c.cut)xs=cx;
   }
   if(!poly)continue;
   if(whole){out.push(...poly.flat());own.push(t);continue;}
   for(let k=1;k+1<poly.length;k++){out.push(...poly[0],...poly[k],...poly[k+1]);own.push(t);}
   if(xs.length===2)cut.push(xs);
  }
  P=Float64Array.from(out);owner=Int32Array.from(own);
 }
 const nt=P.length/9,n3=P.length/3,tid=t=>owner?owner[t]:t;
 const pu=new Float64Array(n3),pv=new Float64Array(n3),pd=new Float64Array(n3);
 let u0=Infinity,u1=-Infinity,v0=Infinity,v1=-Infinity;
 for(let i=0;i<n3;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2];pu[i]=dot(V.U,x,y,z);pv[i]=dot(V.V,x,y,z);pd[i]=dot(V.D,x,y,z);
  if(pu[i]<u0)u0=pu[i];if(pu[i]>u1)u1=pu[i];if(pv[i]<v0)v0=pv[i];if(pv[i]>v1)v1=pv[i];}
 u0-=.2;v0-=.2;u1+=.2;v1+=.2;
 const W=Math.ceil((u1-u0)/res),H=Math.ceil((v1-v0)/res),depth=new Float32Array(W*H).fill(Infinity),tri=new Int32Array(W*H).fill(-1);
 const sx=u=>(u-u0)/res,sy=v=>(v1-v)/res;
 for(let t=0;t<nt;t++){
  const a=t*3,x0=sx(pu[a]),y0=sy(pv[a]),x1=sx(pu[a+1]),y1=sy(pv[a+1]),x2=sx(pu[a+2]),y2=sy(pv[a+2]);
  const area=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(Math.abs(area)<1e-9)continue;
  const d0=pd[a],d1=pd[a+1],d2=pd[a+2];
  const minX=Math.max(0,Math.ceil(Math.min(x0,x1,x2)-.5)),maxX=Math.min(W-1,Math.floor(Math.max(x0,x1,x2)-.5));
  const minY=Math.max(0,Math.ceil(Math.min(y0,y1,y2)-.5)),maxY=Math.min(H-1,Math.floor(Math.max(y0,y1,y2)-.5));
  for(let y=minY;y<=maxY;y++){const py=y+.5;for(let x=minX;x<=maxX;x++){const px=x+.5;
   const w0=((x1-px)*(y2-py)-(x2-px)*(y1-py))/area,w1=((x2-px)*(y0-py)-(x0-px)*(y2-py))/area,w2=1-w0-w1;
   if(w0<-1e-7||w1<-1e-7||w2<-1e-7)continue;const d=w0*d0+w1*d1+w2*d2,k=y*W+x;if(d<depth[k]){depth[k]=d;tri[k]=tid(t);}}}
 }
 const EPS=.02;
 /** Visible when, at the point or a pixel beside it, nothing nearer covers it (or what covers it is its own face). */
 const visible=(px,py,d,faces)=>{const ix=Math.floor(px),iy=Math.floor(py);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=ix+dx,y=iy+dy;if(x<0||y<0||x>=W||y>=H)return true;const k=y*W+x;
   if(tri[k]<0||depth[k]>=d-EPS||(faces&&faces.includes(tri[k])))return true;}
  return false;};
 const D=V.D,out={outline:[],detail:[],marking:[]};
 const MP=model.P,mu=i=>dot(V.U,MP[i*3],MP[i*3+1],MP[i*3+2]),mv=i=>dot(V.V,MP[i*3],MP[i*3+1],MP[i*3+2]),md=i=>dot(V.D,MP[i*3],MP[i*3+1],MP[i*3+2]);
 for(const e of edges){
  let sil=false;if(!e.crease){let pos=false,neg=false;for(const f of e.f){const s=N[f*3]*D[0]+N[f*3+1]*D[1]+N[f*3+2]*D[2];if(s>1e-6)pos=true;else neg=true;}sil=pos&&neg;}   // a face seen edge-on counts as turned away: a flat bottom's edge is an outline
  if(!e.crease&&!sil)continue;
  const A=e.a,B=e.b;let t0=0,t1=1;
  let gone=false;for(const c of planes){const da=sideOf(c,MP[A*3],MP[A*3+1],MP[A*3+2]),db=sideOf(c,MP[B*3],MP[B*3+1],MP[B*3+2]);if(da<0&&db<0){gone=true;break;}if(da<0)t0=Math.max(t0,da/(da-db));if(db<0)t1=Math.min(t1,da/(da-db));}
  if(gone||t1<=t0)continue;
  const U0=mu(A)+(mu(B)-mu(A))*t0,V0=mv(A)+(mv(B)-mv(A))*t0,D0=md(A)+(md(B)-md(A))*t0,U1=mu(A)+(mu(B)-mu(A))*t1,V1=mv(A)+(mv(B)-mv(A))*t1,D1=md(A)+(md(B)-md(A))*t1;
  const ax=sx(U0),ay=sy(V0),bx=sx(U1),by=sy(V1),len=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(len/.7));
  let run=null;const list=e.f.every(f=>mark[f])?out.marking:sil||e.f.length===1?out.outline:out.detail;
  for(let i=0;i<=n;i++){const t=i/n,px=ax+(bx-ax)*t,py=ay+(by-ay)*t,d=D0+(D1-D0)*t;
   if(visible(px,py,d,e.f)){if(run===null)run=t;if(i===n)list.push(seg(run,1));}
   else if(run!==null){list.push(seg(run,(i-1)/n));run=null;}}
  function seg(ta,tb){return [U0+(U1-U0)*ta,V0+(V1-V0)*ta,U0+(U1-U0)*tb,V0+(V1-V0)*tb];}
 }
 /** Tests a 3D polyline (a mooring line) against the depth buffer: its visible and hidden runs. */
 const polyline=(pts,step=.05)=>{const vis=[],hid=[];
  for(let s=0;s+1<pts.length;s++){const a=pts[s],b=pts[s+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(L/step));let run=null,state=null;
   const at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
   for(let i=0;i<=n;i++){const p=at(i/n),u=dot(V.U,...p),v=dot(V.V,...p),d=dot(V.D,...p),seen=visible(sx(u),sy(v),d,null);
    if(state===null){state=seen;run=i/n;}else if(seen!==state||i===n){const q0=at(run),q1=at(i/n);(state?vis:hid).push([dot(V.U,...q0),dot(V.V,...q0),dot(V.U,...q1),dot(V.V,...q1)]);state=seen;run=i/n;}}}
  return {vis,hid};};
 return {outline:merge(out.outline),detail:merge(out.detail),marking:merge(out.marking),cut:merge(cut.map(([a,b])=>[dot(V.U,...a),dot(V.V,...a),dot(V.U,...b),dot(V.V,...b)])),bounds:{u0:u0+.2,u1:u1-.2,v0:v0+.2,v1:v1-.2},polyline,project:p=>[dot(V.U,...p),dot(V.V,...p)]};
}

/** Joins collinear, touching pieces into one line and drops duplicates (1 mm). */
export function merge(segs){
 const groups=new Map();
 for(const s of segs){let [x0,y0,x1,y1]=s;const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);if(L<.002)continue;
  let ux=dx/L,uy=dy/L;if(ux<-1e-9||(Math.abs(ux)<=1e-9&&uy<0)){ux=-ux;uy=-uy;}
  const ang=Math.round(Math.atan2(uy,ux)*2000),c=Math.round((-uy*x0+ux*y0)*1000),key=ang+'|'+c;
  const t0=ux*x0+uy*y0,t1=ux*x1+uy*y1;let g=groups.get(key);if(!g){g={ux,uy,c:-uy*x0+ux*y0,iv:[]};groups.set(key,g);}g.iv.push([Math.min(t0,t1),Math.max(t0,t1)]);}
 const out=[];
 for(const g of groups.values()){g.iv.sort((a,b)=>a[0]-b[0]);let cur=null;
  const emit=([a,b])=>out.push([g.ux*a-g.uy*g.c,g.uy*a+g.ux*g.c,g.ux*b-g.uy*g.c,g.uy*b+g.ux*g.c]);
  for(const iv of g.iv){if(cur&&iv[0]<=cur[1]+.001)cur[1]=Math.max(cur[1],iv[1]);else{if(cur)emit(cur);cur=[...iv];}}if(cur)emit(cur);}
 return out;
}

// ------------------------------------------------------------------ the sheet: one display list → SVG and DXF
export const A1={w:841,h:594};
export function sheet(){
 const items=[];
 return {items,
  line:(x1,y1,x2,y2,layer)=>items.push({k:'line',x1,y1,x2,y2,layer}),
  poly:(pts,layer,closed=false)=>items.push({k:'poly',pts,layer,closed}),
  circle:(x,y,r,layer)=>items.push({k:'circle',x,y,r,layer}),
  text:(x,y,s,h,layer='TEXT',o={})=>items.push({k:'text',x,y,s:String(s),h,layer,anchor:o.anchor||'start',rot:o.rot||0,bold:!!o.bold}),
  image:(x,y,w,h,href)=>items.push({k:'image',x,y,w,h,href}),
 };
}
/** Line weights (mm) and colours by layer, as a CAD office's pen table. */
export const LAYERS={
 'OUTLINE':{w:.35,c:'#1d2326',aci:7},'CUT':{w:.6,c:'#1d2326',aci:7},'RESOLVED':{w:.35,c:'#2f7a4a',aci:3},'RESOLVED-TEXT':{w:0,c:'#2f7a4a',aci:3},'ROOM':{w:0,c:'#4a5a5d',aci:8},'SEAT':{w:.3,c:'#24585c',aci:4},'SEAT-TEXT':{w:0,c:'#24585c',aci:4},'MARKING':{w:.1,c:'#4f7d84',aci:4,dash:'1.2 .8'},'DETAIL':{w:.13,c:'#1d2326',aci:8},'FRAME':{w:.5,c:'#1d2326',aci:7},'THIN':{w:.18,c:'#1d2326',aci:7},
 'CENTRE':{w:.18,c:'#2f6f74',aci:4,dash:'6 1.5 1 1.5'},'WATERLINE':{w:.25,c:'#2f6f74',aci:4,dash:'5 2'},'DIM':{w:.13,c:'#1d2326',aci:3},
 'TEXT':{w:0,c:'#1d2326',aci:7},'PIER':{w:.25,c:'#6d5a3a',aci:42,dash:'3 1.2'},'SECTION':{w:.35,c:'#6d5a3a',aci:42},'HATCH':{w:.1,c:'#6d5a3a',aci:42},'ROPE':{w:.3,c:'#7a6a36',aci:42},
 'MARKUP':{w:.35,c:'#c0302a',aci:1},'MARKUP-HIDDEN':{w:.3,c:'#c0302a',aci:1,dash:'2.5 1.5'},'MARKUP-TEXT':{w:0,c:'#c0302a',aci:1},
};
export const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function toSVG(sh,title){
 const byLayer=new Map(),rest=[];
 for(const it of sh.items){
  if(it.k==='line'){const d=`M${r2(it.x1)} ${r2(it.y1)}L${r2(it.x2)} ${r2(it.y2)}`;(byLayer.get(it.layer)||byLayer.set(it.layer,[]).get(it.layer)).push(d);}
  else if(it.k==='poly'){const d='M'+it.pts.map(p=>r2(p[0])+' '+r2(p[1])).join('L')+(it.closed?'Z':'');(byLayer.get(it.layer)||byLayer.set(it.layer,[]).get(it.layer)).push(d);}
  else rest.push(it);}
 let body='';
 for(const [layer,ds] of byLayer){const L=LAYERS[layer];body+=`<path data-layer="${layer}" fill="none" stroke="${L.c}" stroke-width="${L.w}" stroke-linecap="round" stroke-linejoin="round"${L.dash?` stroke-dasharray="${L.dash}"`:''} d="${ds.join('')}"/>\n`;}
 for(const it of rest){const L=LAYERS[it.layer]||LAYERS.TEXT;
  if(it.k==='circle')body+=`<circle data-layer="${it.layer}" cx="${r2(it.x)}" cy="${r2(it.y)}" r="${r2(it.r)}" fill="${it.layer.startsWith('MARKUP')?'#fff':'none'}" stroke="${L.c}" stroke-width="${L.w}"${L.dash?` stroke-dasharray="${L.dash}"`:''}/>\n`;
  else if(it.k==='text')body+=`<text data-layer="${it.layer}" x="${r2(it.x)}" y="${r2(it.y)}" font-size="${it.h}" fill="${L.c}" text-anchor="${it.anchor}"${it.bold?' font-weight="bold"':''}${it.rot?` transform="rotate(${it.rot} ${r2(it.x)} ${r2(it.y)})"`:''}>${esc(it.s)}</text>\n`;
  else if(it.k==='image')body+=`<image x="${r2(it.x)}" y="${r2(it.y)}" width="${r2(it.w)}" height="${r2(it.h)}" href="${it.href}" preserveAspectRatio="xMidYMid meet"/>\n`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${A1.w}mm" height="${A1.h}mm" viewBox="0 0 ${A1.w} ${A1.h}" font-family="Helvetica, Arial, 'WenQuanYi Zen Hei', sans-serif">
<title>${esc(title)}</title><rect width="${A1.w}" height="${A1.h}" fill="#fbfaf6"/>
${body}</svg>\n`;
}
/** AutoCAD R12 ASCII DXF, millimetres at sheet size (the views at the scales printed under them). */
export function toDXF(sh){
 const o=[],g=(c,v)=>o.push(String(c),String(v)),Y=y=>r2(A1.h-y);
 const ascii=s=>[...s].map(c=>c.charCodeAt(0)<128?c:'\\U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join('');
 g(0,'SECTION');g(2,'HEADER');g(9,'$ACADVER');g(1,'AC1009');g(9,'$EXTMIN');g(10,0);g(20,0);g(9,'$EXTMAX');g(10,A1.w);g(20,A1.h);g(0,'ENDSEC');
 g(0,'SECTION');g(2,'TABLES');
 const types=[['CONTINUOUS','Solid',[]],['DASHED','Dashed',[3,-1.5]],['CENTER','Centre',[6,-1.5,1,-1.5]]];
 g(0,'TABLE');g(2,'LTYPE');g(70,types.length);
 for(const [n,d,p] of types){g(0,'LTYPE');g(2,n);g(70,0);g(3,d);g(72,65);g(73,p.length);g(40,p.reduce((a,b)=>a+Math.abs(b),0));for(const x of p)g(49,x);}
 g(0,'ENDTAB');g(0,'TABLE');g(2,'LAYER');g(70,Object.keys(LAYERS).length);
 for(const [n,L] of Object.entries(LAYERS)){g(0,'LAYER');g(2,n);g(70,0);g(62,L.aci);g(6,L.dash?(n==='CENTRE'?'CENTER':'DASHED'):'CONTINUOUS');}
 g(0,'ENDTAB');g(0,'ENDSEC');g(0,'SECTION');g(2,'ENTITIES');
 for(const it of sh.items){
  if(it.k==='line'){g(0,'LINE');g(8,it.layer);g(10,r2(it.x1));g(20,Y(it.y1));g(30,0);g(11,r2(it.x2));g(21,Y(it.y2));g(31,0);}
  else if(it.k==='poly'){const pts=it.closed?[...it.pts,it.pts[0]]:it.pts;for(let i=0;i+1<pts.length;i++){g(0,'LINE');g(8,it.layer);g(10,r2(pts[i][0]));g(20,Y(pts[i][1]));g(30,0);g(11,r2(pts[i+1][0]));g(21,Y(pts[i+1][1]));g(31,0);}}
  else if(it.k==='circle'){g(0,'CIRCLE');g(8,it.layer);g(10,r2(it.x));g(20,Y(it.y));g(30,0);g(40,r2(it.r));}
  else if(it.k==='text'){const j=it.anchor==='middle'?1:it.anchor==='end'?2:0;g(0,'TEXT');g(8,it.layer);g(10,r2(it.x));g(20,Y(it.y));g(30,0);g(40,r2(it.h*.72));g(1,ascii(it.s));if(it.rot)g(50,-it.rot);
   if(j){g(72,j);g(11,r2(it.x));g(21,Y(it.y));g(31,0);}}
 }
 g(0,'ENDSEC');g(0,'EOF');return o.join('\n')+'\n';
}

// ------------------------------------------------------------------ drawing helpers
export const CHAR=.55;export const tw=(s,h)=>[...s].reduce((w,c)=>w+(c.charCodeAt(0)>0x2e80?1:CHAR)*h,0);
export function wrap(s,width,h){const words=s.split(' '),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(tw(t,h)>width&&line){lines.push(line);line=w;}else line=t;}if(line)lines.push(line);return lines;}
/** Places a view on the sheet: view metres → sheet millimetres at 1:scale, `datum` (view u, v) at (x, y). */
export function place(sh,hl,scale,x,y,datum=[0,0]){
 const k=1000/scale,X=u=>x+(u-datum[0])*k,Y=v=>y-(v-datum[1])*k;
 for(const s of hl.marking)sh.line(X(s[0]),Y(s[1]),X(s[2]),Y(s[3]),'MARKING');
 for(const s of hl.detail)sh.line(X(s[0]),Y(s[1]),X(s[2]),Y(s[3]),'DETAIL');
 for(const s of hl.outline)sh.line(X(s[0]),Y(s[1]),X(s[2]),Y(s[3]),'OUTLINE');
 for(const s of hl.cut||[])sh.line(X(s[0]),Y(s[1]),X(s[2]),Y(s[3]),'CUT');
 return {X,Y,k,box:{x0:X(hl.bounds.u0),x1:X(hl.bounds.u1),y0:Y(hl.bounds.v1),y1:Y(hl.bounds.v0)}};
}
export function viewTitle(sh,x,y,s,scale){sh.text(x,y,s,4,'TEXT',{bold:true});const w=tw(s,4)*1.02;sh.line(x,y+1.3,x+w,y+1.3,'THIN');sh.line(x,y+2.1,x+w,y+2.1,'THIN');sh.text(x+w+4,y,'SCALE 1:'+scale,2.8);}
/** A dimension with arrowheads; vertical when x1 === x2. */
export function dim(sh,x1,y1,x2,y2,label,off){
 const vert=Math.abs(x1-x2)<1e-6,nx=vert?off:0,ny=vert?0:off,ax=x1+nx,ay=y1+ny,bx=x2+nx,by=y2+ny,s=Math.sign(off)||1;
 sh.line(x1+(vert?s*1:0),y1+(vert?0:s*1),ax+(vert?s*1.5:0),ay+(vert?0:s*1.5),'DIM');sh.line(x2+(vert?s*1:0),y2+(vert?0:s*1),bx+(vert?s*1.5:0),by+(vert?0:s*1.5),'DIM');
 sh.line(ax,ay,bx,by,'DIM');
 const L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L;
 for(const [px,py,d] of [[ax,ay,1],[bx,by,-1]])sh.poly([[px+d*ux*2.2-uy*.6,py+d*uy*2.2+ux*.6],[px,py],[px+d*ux*2.2+uy*.6,py+d*uy*2.2-ux*.6]],'DIM');
 if(vert)sh.text(ax-1.2*s+(s<0?0:0),(ay+by)/2,label,2.5,'TEXT',{anchor:'middle',rot:-90});else sh.text((ax+bx)/2,ay-1.2,label,2.5,'TEXT',{anchor:'middle'});
}
/** A level mark: a small triangle on a line, with its figure. */
export function level(sh,x,y,label,len=14){sh.line(x,y,x+len,y,'DIM');sh.poly([[x+2,y],[x+3.2,y-2],[x+.8,y-2]],'DIM',true);sh.text(x+4,y-.9,label,2.2);}
/** A numbered balloon with a leader to (tx, ty). */
export function balloon(sh,x,y,n,tx,ty,ok=false){const L=ok?'RESOLVED':'MARKUP';sh.circle(x,y,3.4,L);sh.text(x,y+1.25,n,3.4,L+'-TEXT',{anchor:'middle',bold:true});
 if(tx!==undefined){const d=Math.hypot(tx-x,ty-y);if(d>3.6){sh.line(x+(tx-x)/d*3.4,y+(ty-y)/d*3.4,tx,ty,L);sh.circle(tx,ty,.6,L);}}}
export function frameAndTitle(sh,{no,title,subtitle,sheetNo,scales,notes,meta}){
 const M={status:'AS-BUILT SURVEY',drawn:'Claude, AI survey',checked:'owner review open',data:'buildFerryModel() as built',disclaimer:'AS-BUILT SURVEY OF THE GAME MODEL · Johansson World vessel · no flag, class or construction approval · drawn by projecting buildFerryModel() with hidden lines removed',...meta};
 const {w,h}=A1;sh.poly([[10,10],[w-10,10],[w-10,h-10],[10,h-10]],'FRAME',true);sh.poly([[5,5],[w-5,5],[w-5,h-5],[5,h-5]],'THIN',true);
 const cols=8,rows=6;
 for(let i=0;i<cols;i++){const x=10+(w-20)*(i+.5)/cols;sh.text(x,8.6,String.fromCharCode(65+i),2.5,'TEXT',{anchor:'middle'});sh.text(x,h-6.4,String.fromCharCode(65+i),2.5,'TEXT',{anchor:'middle'});if(i){const xl=10+(w-20)*i/cols;sh.line(xl,5,xl,10,'THIN');sh.line(xl,h-10,xl,h-5,'THIN');}}
 for(let i=0;i<rows;i++){const y=10+(h-20)*(i+.5)/rows;sh.text(7.5,y+1,i+1,2.5,'TEXT',{anchor:'middle'});sh.text(w-7.5,y+1,i+1,2.5,'TEXT',{anchor:'middle'});if(i){const yl=10+(h-20)*i/rows;sh.line(5,yl,10,yl,'THIN');sh.line(w-10,yl,w-5,yl,'THIN');}}
 // The title block, 180 × 56 mm at the bottom right.
 const bx=w-10-180,by=h-10-56,cell=(x,y,cw,ch,label,value,size=3)=>{sh.poly([[bx+x,by+y],[bx+x+cw,by+y],[bx+x+cw,by+y+ch],[bx+x,by+y+ch]],'THIN',true);sh.text(bx+x+1.5,by+y+3,label,1.8);
  (Array.isArray(value)?value:[value]).forEach((v,i,a)=>sh.text(bx+x+1.5,by+y+ch-2-(a.length-1-i)*(size+1),v,i===a.length-1?size:2.4,'TEXT',{bold:i===a.length-1&&size>3.5}));};
 sh.poly([[bx,by],[bx+180,by],[bx+180,by+56],[bx,by+56]],'FRAME',true);
 cell(0,0,80,14,'YARD',['Johansson Shipyard, Innoshima','JOHANSSON SHIPYARD'],4);cell(80,0,62,14,'SHIP',['M/V MINATO MARU','hull No. 127, built 1994'],3);cell(142,0,38,14,'DRAWING No.',no,4.5);
 cell(0,14,142,16,'TITLE',[title,subtitle],3.6);cell(142,14,38,16,'SCALE',scales,3);
 cell(0,30,46,13,'SOURCE',M.source,2.3);cell(46,30,48,13,'DATA',M.data,2.3);cell(94,30,48,13,'STATUS',M.status,3);cell(142,30,38,13,'SHEET',sheetNo+' / '+M.sheets,3.5);
 cell(0,43,46,13,'DRAWN',M.drawn,2.6);cell(46,43,48,13,'CHECKED',M.checked,2.6);cell(94,43,48,13,'DATE',M.date,3);cell(142,43,38,13,'REV',M.rev+(M.revNote?' · '+M.revNote:''),2.6);
 if(notes?.length){const lines=notes.flatMap(n=>[...wrap(n,174,2.3),'']).slice(0,-1),nh=lines.length*3+7;sh.poly([[bx,by-nh-2],[bx+180,by-nh-2],[bx+180,by-2],[bx,by-2]],'THIN',true);sh.text(bx+1.5,by-nh+1,'NOTES',1.8);lines.forEach((l,i)=>sh.text(bx+1.5,by-nh+5+i*3,l,2.3));}
 sh.text(14,h-12.5,M.disclaimer,2.2,'MARKUP-TEXT');
}


/** Liang–Barsky: the part of segment [x0,y0,x1,y1] inside the rectangle [xmin,ymin,xmax,ymax], or null. */
export function clip(s,[xa,ya,xb,yb]){
 const [x0,y0,x1,y1]=s,dx=x1-x0,dy=y1-y0;let t0=0,t1=1;
 for(const [p,q] of [[-dx,x0-xa],[dx,xb-x0],[-dy,y0-ya],[dy,yb-y0]]){if(Math.abs(p)<1e-12){if(q<0)return null;continue;}const r=q/p;if(p<0){if(r>t1)return null;if(r>t0)t0=r;}else{if(r<t0)return null;if(r<t1)t1=r;}}
 return [x0+dx*t0,y0+dy*t0,x0+dx*t1,y0+dy*t1];
}
