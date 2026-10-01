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
function card(room,texture,w,h,x,y,z,yaw=0,name='Sakura POP'){
 const m=add(room,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false}),x,y,z,name);m.rotation.y=yaw;return m;
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
 const header=sign(512,128,(ctx,w,h)=>{ctx.fillStyle='#d7263d';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ffe28a';ctx.fillRect(0,h-14,w,14);signText(ctx,'ホットスナック',w/2,h*.42,58,'#ffffff');signText(ctx,'HOT SNACKS · あつあつ！',w/2,h*.8,24,'#ffe28a');});
 card(room,header,C.d,C.d/4,cx-C.w/2-.012,y0+C.h+.07,cz,-Math.PI/2,'Sakura hot case header');
 anchor([cx-.3,y0+.25,cz],'Buy hot snacks from the case',()=>action('sakura-hot-snacks'));
 // Oden: a square steel pot with a lid half off and a ladle.
 const O=ODEN_POT;
 add(room,new THREE.BoxGeometry(.32,.12,.32),steel,O.x,y0+.06,O.z,'Sakura oden pot');
 add(room,new THREE.BoxGeometry(.28,.01,.28),mat(0xc98a3a,{emissive:0x5a3210,emissiveIntensity:.3}),O.x,y0+.11,O.z,'Sakura oden broth');
 for(const [dx,dz,c] of [[-.07,-.07,0xf4f0e2],[.06,-.05,0xf7e7a0],[-.05,.07,0xd8b88a],[.07,.07,0xf4f0e2]])add(room,new THREE.SphereGeometry(.035,10,6),mat(c),O.x+dx,y0+.12,O.z+dz,'Sakura oden');
 const ladle=add(room,new THREE.CylinderGeometry(.006,.006,.3,6),steel,O.x+.1,y0+.22,O.z,'Sakura oden ladle');ladle.rotation.z=-.6;
 const oden=sign(256,128,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d7263d';ctx.lineWidth=10;ctx.strokeRect(5,5,w-10,h-10);signText(ctx,'おでん',w/2,h*.45,56,'#d7263d');signText(ctx,'1コ ¥70〜',w/2,h*.8,24,'#5a3a1a');});
 card(room,oden,.22,.11,O.x-.17,y0+.2,O.z,-Math.PI/2,'Sakura oden card');
}

/** Bunting, hanging POP cards, the welcome mat and floor stickers to the till. */
function buildCheer(room){
 const colours=[0xff6b6b,0xffc93c,0x5ec8f2,0x7ccc4a,0xf06ba8,0x9b7bf0];
 const flag=new THREE.BufferGeometry();flag.setAttribute('position',new THREE.Float32BufferAttribute([-.09,0,0,.09,0,0,0,-.17,0],3));flag.computeVertexNormals();
 const flagMats=colours.map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide,toneMapped:false}));
 const string=new THREE.MeshBasicMaterial({color:0xfff6e0});
 // Strings run across the shop floor from wall to wall, over the aisles.
 for(const z of [-2.6,-.6,1.4,3.1]){
  // The back string stops at the restroom wall (x -4.02) instead of running through it.
  const x0=z<-2.4?-3.85:-6.6,x1=4.3,sag=.12,y=2.42;
  const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push(new THREE.Vector3(x0+(x1-x0)*t,y-Math.sin(Math.PI*t)*sag,z));}
  const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.006,4),string);tube.name='Sakura bunting string';room.add(tube);
  const n=Math.floor((x1-x0)/.24);
  for(let i=0;i<n;i++){const t=(i+.5)/n,m=new THREE.Mesh(flag,flagMats[i%flagMats.length]);m.position.set(x0+(x1-x0)*t,y-Math.sin(Math.PI*t)*sag,z);m.name='Sakura bunting';room.add(m);}
 }
 // Round POP cards hanging on threads over the islands: sale, new, oden, stamp card.
 const pops=[['新発売！','NEW',0xf06ba8,-4.2,-1.6],['お買い得','SALE',0xff6b6b,-1.2,.4],['おでん','始めました',0xffc93c,1.6,-1.6],['スタンプ','10コで お茶1本',0x5ec8f2,-2.8,2.3]];
 for(const [jp,en,colour,x,z] of pops){
  const hex='#'+colour.toString(16).padStart(6,'0');
  const tex=sign(256,256,(ctx,w,h)=>{ctx.fillStyle=hex;ctx.beginPath();ctx.arc(w/2,h/2,w/2-4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(w/2,h/2,w/2-22,0,Math.PI*2);ctx.fill();signText(ctx,jp,w/2,h*.45,jp.length>4?42:54,hex);signText(ctx,en,w/2,h*.68,en.length>4?22:30,'#3b3f55');});
  for(const yaw of [0,Math.PI/2])card(room,tex,.42,.42,x,2.05,z,yaw,'Sakura hanging POP');
  add(room,new THREE.CylinderGeometry(.003,.003,.7,4),string,x,2.61,z,'Sakura POP thread');
 }
 // Welcome mat inside the door, and paw-print stickers from the door to the till.
 const matTex=sign(512,256,(ctx,w,h)=>{ctx.fillStyle='#2a8fcc';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#ffffff';ctx.lineWidth=12;ctx.strokeRect(14,14,w-28,h-28);signText(ctx,'いらっしゃいませ',w/2,h*.45,62,'#ffffff');signText(ctx,'SAKURA SHŌTEN',w/2,h*.75,30,'#ffe28a');});
 const welcome=add(room,new THREE.PlaneGeometry(1.5,.75),new THREE.MeshStandardMaterial({map:matTex,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}),0,.006,3.35,'Sakura welcome mat');welcome.rotation.x=-Math.PI/2;
 const paw=sign(128,128,(ctx,w,h)=>{ctx.fillStyle='#f06ba8';ctx.beginPath();ctx.ellipse(w/2,h*.62,26,22,0,0,Math.PI*2);ctx.fill();for(const [dx,dy] of [[-30,-14],[-11,-30],[11,-30],[30,-14]]){ctx.beginPath();ctx.arc(w/2+dx,h*.5+dy,10,0,Math.PI*2);ctx.fill();}});
 const pawMat=new THREE.MeshStandardMaterial({map:paw,transparent:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false});
 const steps=[[1.1,2.7],[1.6,2.3],[2.1,1.95],[2.6,1.6],[3.1,1.3],[3.6,1.05]];
 steps.forEach(([x,z],i)=>{const m=add(room,new THREE.PlaneGeometry(.2,.2),pawMat,x+(i%2?.08:-.08),.007,z,'Sakura floor sticker');m.rotation.set(-Math.PI/2,0,Math.atan2(3.6-1.1,1.05-2.7)+Math.PI);});
 const tillTex=sign(256,96,(ctx,w,h)=>{ctx.fillStyle='#ffc93c';ctx.fillRect(0,0,w,h);signText(ctx,'レジ ▶',w/2,h/2,54,'#3b3f55');});
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
 const cal=sign(256,320,(ctx,w,h)=>{ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff6b6b';ctx.fillRect(0,0,w,70);signText(ctx,'平成9年',w/2,36,40,'#ffffff');ctx.fillStyle='#3b3f55';ctx.font=`bold 20px ${MARU}`;ctx.textAlign='center';for(let d=0;d<30;d++)ctx.fillText(String(d+1),26+(d%7)*34,110+Math.floor(d/7)*44);ctx.strokeStyle='#d7263d';ctx.lineWidth=4;ctx.beginPath();ctx.arc(26+4*34,110+44*1,17,0,Math.PI*2);ctx.stroke();});
 card(room,cal,.36,.45,6.78,1.55,desk.z-.25,-Math.PI/2,'Sakura office calendar');
 const rota=sign(256,256,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);signText(ctx,'シフト表',w/2,34,34,'#2a8fcc');ctx.fillStyle='#3b3f55';ctx.font=`bold 22px ${MARU}`;ctx.textAlign='left';['月 トゥアン 9-20','火 トゥアン 9-20','水 トゥアン 9-20','木 トゥアン 9-20','金 トゥアン 9-20'].forEach((l,i)=>ctx.fillText(l,22,84+i*36));});
 card(room,rota,.3,.3,6.78,1.5,desk.z+.3,-Math.PI/2,'Sakura shift rota');
 // "Staff only", on the corridor side of the door.
 const plate=sign(256,96,(ctx,w,h)=>{ctx.fillStyle='#3b3f55';ctx.fillRect(0,0,w,h);signText(ctx,'事務所',w/2,h*.4,40,'#ffffff');signText(ctx,'STAFF ONLY',w/2,h*.78,20,'#ffc93c');});
 card(room,plate,.36,.135,door.x,2.2,door.z+.08,0,'Sakura office plate');
 anchor([desk.x-.4,top+.35,desk.z+.05],'Read Sakura sales ledger',()=>action('shop-ledger'));
}

export function buildSakuraCheer(room,{anchor,action}){
 buildHotCase(room,anchor,action);
 buildCheer(room);
 buildBackOffice(room,anchor,action);
}

/**
 * Konbini colours for the supplied shell: white walls and ceiling, a pale counter, and
 * the chain's band — Sakura pink with a red pinstripe and white lettering — running
 * round the top of the walls, the way a Lawson is blue up there and a FamilyMart green.
 * The model paints everything with one vertex colour per mesh, so each mesh gets its
 * own flat colour instead.
 */
// Cool whites, so the room reads crisp under the warm tubes rather than cream. White
// gondolas with Sakura-pink end panels, the way chains paint their end caps. The
// fittings take no glow: nothing that holds stock is emissive.
export const SAKURA_PAINT=Object.freeze({
 'sakura-building':[0xf2f6fa,.5],'sakura-ceiling':[0xf8fbff,.72],'sakura-counter':[0xeef0f2,.34],
 'sakura-shelf':[0xf4f6f8,0],'sakura-shelf-ends':[0xf27aa4,0],'sakura-fridge':[0xf2f6f8,0],
 // Porcelain rather than the model's grey; no normals either, so it needs some glow.
 'sakura-toilet':[0xf4f2ec,.42],
});
const paintFor=name=>SAKURA_PAINT[name]||SAKURA_PAINT[name.split(' ')[0]];
export function paintSakuraShell(model){
 model.traverse(o=>{
  const spec=o.isMesh&&paintFor(o.name||'');if(!spec)return;
  // The shell has no normals, so its walls catch little of the fill; a share of their own
  // colour as glow is what tube light bouncing round a white room looks like.
  const [colour,glow]=spec;
  const paint=m=>{const c=m.clone();c.vertexColors=false;c.color.setHex(colour);if(glow){c.emissive.setHex(colour);c.emissiveIntensity=glow;}c.needsUpdate=true;return c;};
  o.material=Array.isArray(o.material)?o.material.map(paint):paint(o.material);
 });
}
/** Inner faces of the shop-floor walls, the band's height, and the counter's customer face. */
export const SAKURA_BAND=Object.freeze({y0:2.56,y1:2.86,runs:Object.freeze([
 // Both runs stop at the restroom (x < -4.02, z < -2.42), which has its own tiles.
 {x:-6.8,z0:-2.42,z1:3.2,yaw:Math.PI/2},
 {z:-3.93,x0:-4.02,x1:6.8,yaw:0},
 {x:6.8,z0:-1.1,z1:3.9,yaw:-Math.PI/2},
]),counter:{x:4.52,z0:.1,z1:3.84,y0:.08,y1:.92}});
export function buildSakuraBand(room){
 const B=SAKURA_BAND,h=B.y1-B.y0;
 const tex=sign(1024,128,(ctx,w,H)=>{
  ctx.fillStyle='#f06b9a';ctx.fillRect(0,0,w,H);ctx.fillStyle='#d7263d';ctx.fillRect(0,H-16,w,16);ctx.fillStyle='#ffffff';ctx.fillRect(0,H-22,w,4);
  ctx.fillStyle='#ffffff';ctx.font=`bold 54px ${MARU}`;ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText('桜 SAKURA SHŌTEN',30,H*.42);
  ctx.font=`bold 30px ${MARU}`;ctx.fillText('いつでも、ちかくに。',w*.62,H*.44);
  ctx.beginPath();ctx.arc(w-40,H*.42,18,0,Math.PI*2);ctx.fill();
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
 // The counter's customer face in the chain colours, with the logo in the middle.
 const C=B.counter,len=C.z1-C.z0,ch=C.y1-C.y0;
 const front=sign(1024,256,(ctx,w,H)=>{
  ctx.fillStyle='#fff6f8';ctx.fillRect(0,0,w,H);ctx.fillStyle='#f06b9a';ctx.fillRect(0,H*.55,w,H*.45);ctx.fillStyle='#d7263d';ctx.fillRect(0,H*.55,w,10);
  ctx.fillStyle='#d7263d';ctx.beginPath();ctx.arc(w/2,H*.42,58,0,Math.PI*2);ctx.fill();
  signText(ctx,'桜',w/2,H*.42,70,'#ffffff');signText(ctx,'SAKURA SHŌTEN',w/2,H*.8,44,'#ffffff');
 });
 const panel=add(room,new THREE.PlaneGeometry(len,ch),new THREE.MeshBasicMaterial({map:front,toneMapped:false}),C.x,(C.y0+C.y1)/2,(C.z0+C.z1)/2,'Sakura counter front');
 panel.rotation.y=-Math.PI/2;
}
