import * as THREE from '../../../vendor/three.module.js';

/**
 * The cheerful half of a real konbini, and Thuan's back office.
 *
 * - A hot-snack case on the counter where the ledger used to lie: warm glass, golden
 *   karaage, steamed buns and American dogs, and an oden pot at the end of the counter.
 * - Bunting and hanging POP cards over the aisles, a welcome mat at the door and floor
 *   stickers that walk you to the till.
 * - The ledger moves to a desk in the small room behind the shop floor: a lamp, a chair,
 *   a wall calendar and a "staff only" plate on the door.
 *
 * Every piece is plain geometry and small canvas signs, built once when the shop is.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';

function sign(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
const signText=(ctx,text,x,y,size,colour,weight='bold')=>{ctx.fillStyle=colour;ctx.font=`${weight} ${size}px ${MARU}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y);};
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
function add(room,geometry,material,x,y,z,name){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;room.add(m);return m;}
function card(room,texture,w,h,x,y,z,yaw=0,name='Sakura POP',side=THREE.DoubleSide){
 const m=add(room,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side,toneMapped:false}),x,y,z,name);m.rotation.y=yaw;return m;
}

/** The glass hot case and the oden pot on the counter. The customer stands at x < 4.54. */
export const HOT_CASE=Object.freeze({x:4.82,z:1.7,w:.4,d:.52,h:.36,top:1.0});
export const ODEN_POT=Object.freeze({x:4.8,z:3.2});
function buildHotCase(room,anchor,action){
 const C=HOT_CASE,y0=C.top,cx=C.x,cz=C.z;
 const frame=mat(0xd7263d),steel=mat(0xc9ced2,{metalness:.4,roughness:.35});
 // Base, back and roof in red; glass front and sides; a warm lit floor inside.
 add(room,new THREE.BoxGeometry(C.w,.05,C.d),frame,cx,y0+.025,cz,'Sakura hot case');
 add(room,new THREE.BoxGeometry(C.w+.02,.05,C.d+.02),frame,cx,y0+C.h,cz,'Sakura hot case');
 add(room,new THREE.BoxGeometry(.02,C.h,C.d),frame,cx+C.w/2,y0+C.h/2,cz,'Sakura hot case');
 const glass=new THREE.MeshStandardMaterial({color:0xfff3d6,transparent:true,opacity:.22,roughness:.05,depthWrite:false});
 add(room,new THREE.BoxGeometry(.012,C.h-.05,C.d),glass,cx-C.w/2,y0+C.h/2,cz,'Sakura hot case glass');
 for(const s of [-1,1])add(room,new THREE.BoxGeometry(C.w,C.h-.05,.012),glass,cx,y0+C.h/2,cz+s*C.d/2,'Sakura hot case glass');
 const warm=new THREE.MeshStandardMaterial({color:0xffc46b,emissive:0xff9a3c,emissiveIntensity:.55});
 add(room,new THREE.BoxGeometry(C.w-.04,.01,C.d-.04),warm,cx,y0+.055,cz,'Sakura hot case tray');
 add(room,new THREE.BoxGeometry(C.w-.04,.008,C.d-.04),new THREE.MeshStandardMaterial({color:0xfff2c8,emissive:0xffd89a,emissiveIntensity:.9}),cx,y0+C.h-.03,cz,'Sakura hot case lamp');
 // The food: karaage cups, buns, American dogs on sticks.
 const fried=mat(0xd99a3a,{roughness:.9}),bun=mat(0xfbf6ea,{roughness:.95}),cup=mat(0xd7263d),batter=mat(0xe0a64a),stick=mat(0xe8d7b0);
 for(let i=0;i<3;i++){
  const z=cz-.17+i*.1;add(room,new THREE.CylinderGeometry(.035,.03,.05,10),cup,cx-.08,y0+.085,z,'Sakura karaage cup');
  for(let k=0;k<3;k++)add(room,new THREE.SphereGeometry(.018,8,6),fried,cx-.08+(k-1)*.017,y0+.12+(k%2)*.008,z+(k-1)*.006,'Sakura karaage');
 }
 for(let i=0;i<3;i++){const m=add(room,new THREE.SphereGeometry(.04,12,8),bun,cx+.08,y0+.085,cz-.15+i*.1,'Sakura nikuman');m.scale.y=.75;}
 for(let i=0;i<2;i++){
  const m=add(room,new THREE.CapsuleGeometry(.018,.07,4,8),batter,cx,y0+.09,cz+.16+i*.05,'Sakura American dog');m.rotation.z=Math.PI/2;
  const s=add(room,new THREE.CylinderGeometry(.004,.004,.06,6),stick,cx+.07,y0+.09,cz+.16+i*.05,'Sakura American dog stick');s.rotation.z=Math.PI/2;
 }
 // A header card facing the customer.
 const header=sign(512,128,(ctx,w,h)=>{ctx.fillStyle='#d7263d';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ffe28a';ctx.fillRect(0,h-14,w,14);signText(ctx,"Hot snack",w/2,h*.42,58,'#ffffff');signText(ctx,"HOT SNACKS · Hot!",w/2,h*.8,24,'#ffe28a');});
 card(room,header,C.d,C.d/4,cx-C.w/2-.012,y0+C.h+.07,cz,-Math.PI/2,'Sakura hot case header');
 anchor([cx-.3,y0+.25,cz],'Buy hot snacks from the case',()=>action('sakura-hot-snacks'));
 // Oden: a square steel pot with a lid half off and a ladle.
 const O=ODEN_POT;
 add(room,new THREE.BoxGeometry(.32,.12,.32),steel,O.x,y0+.06,O.z,'Sakura oden pot');
 add(room,new THREE.BoxGeometry(.28,.01,.28),mat(0xc98a3a,{emissive:0x5a3210,emissiveIntensity:.3}),O.x,y0+.11,O.z,'Sakura oden broth');
 for(const [dx,dz,c] of [[-.07,-.07,0xf4f0e2],[.06,-.05,0xf7e7a0],[-.05,.07,0xd8b88a],[.07,.07,0xf4f0e2]])add(room,new THREE.SphereGeometry(.035,10,6),mat(c),O.x+dx,y0+.12,O.z+dz,'Sakura oden');
 const ladle=add(room,new THREE.CylinderGeometry(.006,.006,.3,6),steel,O.x+.1,y0+.22,O.z,'Sakura oden ladle');ladle.rotation.z=-.6;
 const oden=sign(256,128,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d7263d';ctx.lineWidth=10;ctx.strokeRect(5,5,w-10,h-10);signText(ctx,"Oden",w/2,h*.45,56,'#d7263d');signText(ctx,"1Ko ¥70〜",w/2,h*.8,24,'#5a3a1a');});
 card(room,oden,.22,.11,O.x-.17,y0+.2,O.z,-Math.PI/2,'Sakura oden card');
}

/** Bunting, hanging POP cards, the welcome mat and floor stickers to the till. */
function buildCheer(room){
 const colours=[0xff6b6b,0xffc93c,0x5ec8f2,0x7ccc4a,0xf06ba8,0x9b7bf0];
 const flag=new THREE.BufferGeometry();flag.setAttribute('position',new THREE.Float32BufferAttribute([-.09,0,0,.09,0,0,0,-.17,0],3));flag.computeVertexNormals();
 const flagMats=colours.map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,toneMapped:false}));
 const string=new THREE.MeshBasicMaterial({color:0xfff6e0});
 // No bunting: one promotion band and a card at each end cap say more than flags across
 // the whole ceiling did (docs/SAKURA-SHOP-PLAN.md).
 // Round POP cards hanging on threads over the islands: sale, new, oden, stamp card.
 // One card, over what it is about: the new crisps. The till canopy already says oden.
 const pops=[["New release!",'NEW',0xf06ba8,-1.55,1.9]];
 for(const [jp,en,colour,x,z] of pops){
  const hex='#'+colour.toString(16).padStart(6,'0');
  // Lettered to fit inside the white disc, with the corners left clear.
  const tex=sign(256,256,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle=hex;ctx.beginPath();ctx.arc(w/2,h/2,w/2-4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(w/2,h/2,w/2-22,0,Math.PI*2);ctx.fill();
   const fit=(s,size,room)=>{ctx.font=`bold ${size}px ${MARU}`;while(size>14&&ctx.measureText(s).width>room){size-=1;ctx.font=`bold ${size}px ${MARU}`;}return size;};
   signText(ctx,jp,w/2,h*.45,fit(jp,54,w-80),hex);signText(ctx,en,w/2,h*.68,fit(en,30,w-110),'#3b3f55');});
  // Hung high enough to clear a grown-up's eye line: at 2.05 m they sat in your face.
  // Back to back, facing up and down the aisle: crossed cards cut through each other's
  // lettering, and a double-sided one reads backwards from behind.
  for(const [yaw,dz] of [[0,.004],[Math.PI,-.004]])card(room,tex,.36,.36,x,2.27,z+dz,yaw,'Sakura hanging POP',THREE.FrontSide).material.alphaTest=.5;
  add(room,new THREE.CylinderGeometry(.003,.003,.5,4),string,x,2.7,z,'Sakura POP thread');
 }
 // Welcome mat inside the door, and paw-print stickers from the door to the till.
 const matTex=sign(512,256,(ctx,w,h)=>{ctx.fillStyle='#2a8fcc';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#ffffff';ctx.lineWidth=12;ctx.strokeRect(14,14,w-28,h-28);signText(ctx,"Welcome",w/2,h*.45,62,'#ffffff');signText(ctx,'SAKURA SHOP',w/2,h*.75,30,'#ffe28a');});
 const welcome=add(room,new THREE.PlaneGeometry(1.5,.75),new THREE.MeshStandardMaterial({map:matTex,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}),0,.006,3.35,'Sakura welcome mat');welcome.rotation.x=-Math.PI/2;
 const paw=sign(128,128,(ctx,w,h)=>{ctx.fillStyle='#f06ba8';ctx.beginPath();ctx.ellipse(w/2,h*.62,26,22,0,0,Math.PI*2);ctx.fill();for(const [dx,dy] of [[-30,-14],[-11,-30],[11,-30],[30,-14]]){ctx.beginPath();ctx.arc(w/2+dx,h*.5+dy,10,0,Math.PI*2);ctx.fill();}});
 const pawMat=new THREE.MeshStandardMaterial({map:paw,transparent:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false});
 const steps=[[1.1,2.7],[1.6,2.3],[2.1,1.95],[2.6,1.6],[3.1,1.3],[3.6,1.05]];
 steps.forEach(([x,z],i)=>{const m=add(room,new THREE.PlaneGeometry(.2,.2),pawMat,x+(i%2?.08:-.08),.007,z,'Sakura floor sticker');m.rotation.set(-Math.PI/2,0,Math.atan2(3.6-1.1,1.05-2.7)+Math.PI);});
 const tillTex=sign(256,96,(ctx,w,h)=>{ctx.fillStyle='#ffc93c';ctx.fillRect(0,0,w,h);signText(ctx,"Cash register ▶",w/2,h/2,54,'#3b3f55');});
 const till=add(room,new THREE.PlaneGeometry(.5,.19),new THREE.MeshStandardMaterial({map:tillTex,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}),3.95,.007,.85,'Sakura till sticker');till.rotation.set(-Math.PI/2,0,-Math.PI/2);
}

/** The room behind the shop floor, east side: x 4.66..6.8, z -3.93..-1.23, door at x 5.14..6.28. */
export const BACK_OFFICE=Object.freeze({desk:{x:6.4,z:-2.7,w:.7,d:1.2,h:.74},chair:{x:5.78,z:-2.7},door:{x:5.71,z:-1.17}});
function buildBackOffice(room,anchor,action){
 const {desk,chair,door}=BACK_OFFICE,wood=mat(0x9b7650),dark=mat(0x5b4633),top=desk.h;
 add(room,new THREE.BoxGeometry(desk.w,.04,desk.d),wood,desk.x,top-.02,desk.z,'Sakura office desk');
 for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(room,new THREE.BoxGeometry(.04,top-.04,.04),dark,desk.x+dx*(desk.w/2-.04),(top-.04)/2,desk.z+dz*(desk.d/2-.04),'Sakura office desk leg');
 add(room,new THREE.BoxGeometry(desk.w-.1,.26,.4),dark,desk.x,top-.2,desk.z-desk.d/2+.24,'Sakura office drawers');
 // The ledger, open, with a pencil; a green cash-book shut beside it; a lamp and a mug.
 const page=mat(0xfbf6e6,{roughness:.95}),cover=mat(0x436454,{roughness:.8});
 add(room,new THREE.BoxGeometry(.3,.025,.21),cover,desk.x-.05,top+.012,desk.z+.05,'Sakura sales ledger');
 for(const s of [-1,1]){const p=add(room,new THREE.BoxGeometry(.14,.006,.2),page,desk.x-.05,top+.028,desk.z+.05+s*.075,'Sakura ledger page');p.rotation.x=s*.05;}
 const pencil=add(room,new THREE.CylinderGeometry(.004,.004,.16,6),mat(0xffc93c),desk.x-.14,top+.035,desk.z+.08,'Sakura pencil');pencil.rotation.z=Math.PI/2;pencil.rotation.y=.4;
 add(room,new THREE.BoxGeometry(.24,.035,.17),mat(0x2f6f9a),desk.x+.15,top+.018,desk.z-.3,'Sakura stock book');
 add(room,new THREE.CylinderGeometry(.08,.09,.02,14),dark,desk.x+.2,top+.01,desk.z+.35,'Sakura desk lamp');
 const arm=add(room,new THREE.CylinderGeometry(.008,.008,.34,6),dark,desk.x+.2,top+.17,desk.z+.35,'Sakura desk lamp');arm.rotation.x=.25;
 const shade=add(room,new THREE.ConeGeometry(.09,.1,16,1,true),mat(0x7ccc4a,{side:THREE.DoubleSide,emissive:0xffe0a0,emissiveIntensity:.25}),desk.x+.2,top+.34,desk.z+.3,'Sakura desk lamp shade');shade.rotation.x=.4;
 add(room,new THREE.CylinderGeometry(.035,.03,.09,12),mat(0xf06ba8),desk.x+.18,top+.045,desk.z-.05,'Sakura mug');
 // A stool of a chair: seat, back, four legs.
 add(room,new THREE.BoxGeometry(.42,.05,.42),mat(0x5ec8f2),chair.x,.46,chair.z,'Sakura office chair');
 add(room,new THREE.BoxGeometry(.05,.42,.4),mat(0x5ec8f2),chair.x-.2,.7,chair.z,'Sakura office chair');
 for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])add(room,new THREE.CylinderGeometry(.015,.015,.44,6),dark,chair.x+dx*.17,.22,chair.z+dz*.17,'Sakura office chair leg');
 // The wall calendar and a shift rota pinned above the desk.
 const cal=sign(256,320,(ctx,w,h)=>{ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff6b6b';ctx.fillRect(0,0,w,70);signText(ctx,"Heisei9Year",w/2,36,40,'#ffffff');ctx.fillStyle='#3b3f55';ctx.font=`bold 20px ${MARU}`;ctx.textAlign='center';for(let d=0;d<30;d++)ctx.fillText(String(d+1),26+(d%7)*34,110+Math.floor(d/7)*44);ctx.strokeStyle='#d7263d';ctx.lineWidth=4;ctx.beginPath();ctx.arc(26+4*34,110+44*1,17,0,Math.PI*2);ctx.stroke();});
 card(room,cal,.36,.45,6.78,1.55,desk.z-.25,-Math.PI/2,'Sakura office calendar');
 const rota=sign(256,256,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);signText(ctx,"Staff Schedule",w/2,34,34,'#2a8fcc');ctx.fillStyle='#3b3f55';ctx.font=`bold 22px ${MARU}`;ctx.textAlign='left';["Month Thuan 9-20","Fire Thuan 9-20","Water Thuan 9-20","Tree Thuan 9-20","Gold Thuan 9-20"].forEach((l,i)=>ctx.fillText(l,22,84+i*36));});
 card(room,rota,.3,.3,6.78,1.5,desk.z+.3,-Math.PI/2,'Sakura shift rota');
 // "Staff only", on the corridor side of the door.
 const plate=sign(256,96,(ctx,w,h)=>{ctx.fillStyle='#3b3f55';ctx.fillRect(0,0,w,h);signText(ctx,"Office",w/2,h*.4,40,'#ffffff');signText(ctx,'STAFF ONLY',w/2,h*.78,20,'#ffc93c');});
 // Over the door casing, where the head trim cannot cover it.
 card(room,plate,.36,.135,door.x,2.44,door.z+.07,0,'Sakura office plate',THREE.FrontSide);
 anchor([desk.x-.4,top+.35,desk.z+.05],'Read Sakura sales ledger',()=>action('shop-ledger'));
}

export function buildSakuraCheer(room,{anchor,action}){
 buildHotCase(room,anchor,action);
 buildCheer(room);
 buildBackOffice(room,anchor,action);
}

/**
 * Inner faces of the shop-floor walls, the band's height, and the counter's customer face.
 * Everything stops short of the shop window, which is at local z 3.61: past it, the
 * interior shows on the street side of the glass.
 */
export const SAKURA_BAND=Object.freeze({y0:2.56,y1:2.86,runs:Object.freeze([
 // Both runs stop at the restroom (x < -4.02, z < -2.42), which has its own tiles.
 {x:-6.8,z0:-2.42,z1:3.2,yaw:Math.PI/2},
 {z:-3.93,x0:-4.02,x1:6.8,yaw:0},
 {x:6.8,z0:-1.1,z1:3.52,yaw:-Math.PI/2},
]),counter:{x:4.52,z0:.1,z1:3.52,y0:.08,y1:.92}});
export function buildSakuraBand(room){
 const B=SAKURA_BAND,h=B.y1-B.y0;
 // A family shop's boards rather than a chain's band: planed wood round the top of the
 // walls, lettered by hand with what the shop has always sold.
 const tex=sign(1024,128,(ctx,w,H)=>{
  ctx.fillStyle='#d9b27a';ctx.fillRect(0,0,w,H);
  for(let i=0;i<14;i++){ctx.strokeStyle=i%2?'rgba(120,80,40,.18)':'rgba(255,240,210,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,8+i*8.5);ctx.bezierCurveTo(w*.3,4+i*8.5,w*.6,14+i*8.5,w,8+i*8.5);ctx.stroke();}
  ctx.fillStyle='#7c5230';ctx.fillRect(0,0,w,6);ctx.fillRect(0,H-6,w,6);
  ctx.fillStyle='#3a2414';ctx.font=`bold 50px ${MARU}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText("Sakura Shop",28,H*.5);
  // The list starts where the name ends and stops short of the crest, at whatever size fits.
  // Two lines, so the letters stay big enough to read from the aisle.
  const from=28+ctx.measureText("Sakura Shop").width+34,room=w-52-30-24-from,lines=["Groceries · Daily miscellaneous goods","Stamp · Ship ticket"];
  let size=28;const widest=()=>Math.max(...lines.map(l=>ctx.measureText(l).width));ctx.font=`bold ${size}px ${MARU}`;
  while(size>14&&widest()>room){size-=1;ctx.font=`bold ${size}px ${MARU}`;}
  lines.forEach((l,i)=>ctx.fillText(l,from,H*.5+(i-.5)*size*1.15));
  ctx.fillStyle='#b8332c';ctx.beginPath();ctx.arc(w-52,H*.5,30,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff6e6';ctx.font=`bold 34px ${MARU}`;ctx.textAlign='center';ctx.fillText("Sakura",w-52,H*.52);
 });
 tex.wrapS=THREE.RepeatWrapping;
 const make=(length,x,z,yaw)=>{
  const t=tex.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(length/3.2)),1);
  const m=add(room,new THREE.PlaneGeometry(length,h),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),x,(B.y0+B.y1)/2,z,'Sakura wall band');m.rotation.y=yaw;return m;
 };
 for(const r of B.runs){
  if(r.x!=null)make(r.z1-r.z0,r.x,(r.z0+r.z1)/2,r.yaw);
  else make(r.x1-r.x0,(r.x0+r.x1)/2,r.z,r.yaw);
 }
 // The shop's crest now rides on the till canopy, once, rather than on the counter too.
 buildTillCanopy(room);buildCigaretteRack(room);buildTillFloor(room);
}

/**
 * The till canopy: a hung fascia the length of the counter, white with the konbini's
 * yellow-orange-red stripes and Sakura's round crest in the middle, the way every till
 * in 1997 had its chain's band over it. Tubes underneath (sakura-shell.js buildTubes).
 */
// It stops short of the shop window (the glass is at local z 3.61); it used to run
// 0.37 m out through the pane, a shelf floating over the street.
export const TILL_CANOPY=Object.freeze({x0:4.25,x1:5.25,y0:2.18,y1:2.5,z0:-.02,z1:3.45});
function buildTillCanopy(room){
 const T=TILL_CANOPY,len=T.z1-T.z0,h=T.y1-T.y0;
 const face=sign(2048,Math.round(2048*h/len),(ctx,w,H)=>{
  ctx.fillStyle='#fbf8f0';ctx.fillRect(0,0,w,H);
  const band=H*.17;
  [['#f2c21a',H-band*3],['#f08a1c',H-band*2],['#d7263d',H-band]].forEach(([c,y])=>{ctx.fillStyle=c;ctx.fillRect(0,y,w,band);});
  ctx.fillStyle='#d7263d';ctx.fillRect(0,0,w,H*.05);
  const textY=(H-band*3)*.55;
  signText(ctx,'Tobacco · Stamps · Ferry tickets',w*.2,textY,Math.round(H*.24),'#3a2a1e');
  signText(ctx,'Hot snacks · Oden',w*.8,textY,Math.round(H*.24),'#3a2a1e');
  // The crest: a round badge breaking over the stripes, as the chains' logos did.
  const cx=w/2,cy=H*.5,r=H*.47;
  ctx.fillStyle='#d7263d';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fbf8f0';ctx.beginPath();ctx.arc(cx,cy,r*.86,0,Math.PI*2);ctx.fill();
  // Five petals round a gold heart.
  ctx.fillStyle='#f2a6b8';for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2;ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*r*.3,cy-r*.12+Math.sin(a)*r*.3,r*.2,r*.13,a,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#f2c21a';ctx.beginPath();ctx.arc(cx,cy-r*.12,r*.1,0,Math.PI*2);ctx.fill();
  signText(ctx,'Sakura',cx,cy+r*.5,Math.round(r*.4),'#d7263d');
  signText(ctx,'SAKURA SHOP',cx-w*.11,H*.14+band*.1,Math.round(H*.1),'#fbf8f0');
 });
 const plain=new THREE.MeshStandardMaterial({color:0xf3eee2,roughness:.8});
 const front=new THREE.MeshBasicMaterial({map:face,toneMapped:false});
 // BoxGeometry faces: +x, -x, +y, -y, +z, -z. The customer side is -x.
 const box=add(room,new THREE.BoxGeometry(T.x1-T.x0,h,len),[plain,front,plain,plain,plain,plain],(T.x0+T.x1)/2,(T.y0+T.y1)/2,(T.z0+T.z1)/2,'Sakura till canopy');
 return box;
}

/**
 * Cigarettes behind the till, over the medicine boards: a glass-fronted case of packs in
 * rows, every brand in its own colours, the way a konbini sells them from behind the
 * counter. Drawn on one board, so it costs one draw.
 */
function buildCigaretteRack(room){
 const z0=.6,z1=3.5,y0=2.14,y1=2.52,x=6.8;
 const packs=['#f4f1ea|#1e3c8c','#ffffff|#c8102e','#1d1d1d|#d4af37','#f4f1ea|#2e7d32','#2a4a8a|#f4f1ea','#f2e6c8|#7a3b1a','#e8e8e8|#5b6dc1','#c8102e|#ffffff','#f4f1ea|#e07a10','#0f5132|#f4f1ea','#ffffff|#3a7fc0','#3b2b6a|#e8d48a'];
 const tex=sign(2048,256,(ctx,w,H)=>{
  ctx.fillStyle='#ece6d8';ctx.fillRect(0,0,w,H);
  const rows=2,cols=34,pw=w/cols,ph=H/rows;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const [bg,fg]=packs[(c*7+r*5)%packs.length].split('|'),x0=c*pw+pw*.14,y0=r*ph+ph*.1,ww=pw*.72,hh=ph*.62;
   ctx.fillStyle=bg;ctx.fillRect(x0,y0,ww,hh);ctx.fillStyle=fg;ctx.fillRect(x0,y0+hh*.36,ww,hh*.2);ctx.fillRect(x0+ww*.3,y0+hh*.08,ww*.4,hh*.16);
   ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;ctx.strokeRect(x0,y0,ww,hh);
   // The price strip under each column.
   ctx.fillStyle='#fffdf4';ctx.fillRect(x0,y0+hh+ph*.06,ww,ph*.16);ctx.fillStyle='#2a2a2a';ctx.font=`bold ${Math.round(ph*.12)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(['220','250','230','240','270','300'][(c+r)%6],x0+ww/2,y0+hh+ph*.14);
  }
 });
 const board=add(room,new THREE.PlaneGeometry(z1-z0,y1-y0),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}),x,(y0+y1)/2,(z0+z1)/2,'Sakura cigarette rack');
 board.rotation.y=-Math.PI/2;
 const frame=mat(0x6f553b);
 add(room,new THREE.BoxGeometry(.16,.03,z1-z0+.06),frame,x-.06,y0-.015,(z0+z1)/2,'Sakura cigarette rack');
 add(room,new THREE.BoxGeometry(.16,.03,z1-z0+.06),frame,x-.06,y1+.015,(z0+z1)/2,'Sakura cigarette rack');
 add(room,new THREE.BoxGeometry(.01,y1-y0,z1-z0),new THREE.MeshStandardMaterial({color:0xeef6f6,transparent:true,opacity:.18,roughness:.05,depthWrite:false}),x-.13,(y0+y1)/2,(z0+z1)/2,'Sakura cigarette rack glass');
}

/** Dark green tiles at the till, in front of the counter and behind it, as in a konbini. */
function buildTillFloor(room){
 const tile=.3,tex=sign(256,256,(ctx,w,H)=>{
  ctx.fillStyle='#1f4a3c';ctx.fillRect(0,0,w,H);
  for(const [x,y,c] of [[0,0,'#24564a'],[128,128,'#24564a'],[128,0,'#1c4337'],[0,128,'#1c4337']]){ctx.fillStyle=c;ctx.fillRect(x+4,y+4,120,120);}
  ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(10,10,40,6);ctx.fillRect(138,138,40,6);
 });
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 for(const [x0,x1] of [[3.05,4.54],[5.06,6.67]]){
  const z0=.0,z1=3.56,t=tex.clone();t.needsUpdate=true;t.repeat.set((x1-x0)/(tile*2),(z1-z0)/(tile*2));
  const floor=add(room,new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshStandardMaterial({map:t,roughness:.35}),(x0+x1)/2,.006,(z0+z1)/2,'Sakura till floor');
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
 }
}
