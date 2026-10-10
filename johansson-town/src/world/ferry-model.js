import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {FERRY_SHIP,FERRY_DECKS,FERRY_MACHINERY} from './ferry-ship.js';

/**
 * The Minato Maru, modelled whole (docs/FERRY-AUDIT.md): the hull lofted from its sections, as a
 * shipyard draws it, with the underwater body a dry dock will show (keel and skeg, two shafts on
 * their brackets, two four-bladed screws, two spade rudders, the bow-thruster tunnel, bilge keels,
 * sea chests and zinc anodes), the draft marks and load line, the car deck with its lanes, lashing
 * points, scuppers and the hydraulic bow ramp, the deckhouse, the upper deck and the wheelhouse
 * with its mast, radar, lights and whistle.
 *
 * Ship frame: +z forward (bow ramp hinge at +11), +x the port side, y up. The model's origin is
 * 0.12 m above the waterline, where the old hull sat, so the ramp still meets the quay where it
 * did: the waterline is at y = WL. Static parts are merged by material into a handful of meshes.
 */
const S=FERRY_SHIP,D=FERRY_DECKS;
export const WL=-S.origin;
const HALF=S.length/2,KEEL=WL-S.draft,DECK=D.car.y,BULWARK=D.car.bulwark;

/** The sheer: the deck edge rises toward the bow, a little toward the stern. */
export const sheer=z=>z>0?.28*(z/HALF)**2:.08*(z/HALF)**2;
export const deckEdge=z=>DECK-.06+sheer(z);
export const bulwarkTop=z=>deckEdge(z)+BULWARK;
/** Half-breadth at the deck: parallel midbody, drawn in toward the ramp, a touch at the transom. */
export const halfBreadth=z=>z>7?S.beam/2-.55*((z-7)/4)**2:z< -9?S.beam/2-.12*((-9-z)/2)**2:S.beam/2;
/** The keel line: a spoon forefoot under the ramp, and a counter rising aft over the screws. */
export function keelY(z){
 if(z>5)return KEEL+1.12*((z-5)/6)**2;
 if(z< -4){const t=Math.min(1,(-4-z)/4),s=t*t*(3-2*t);let y=KEEL+1.17*s;if(z< -8)y+=.06*((-8-z)/3);return y;}
 return KEEL;
}
/** How full the section is: boxy amidships (a small bilge radius), rounder at the ends. */
const fullness=z=>z>4?7-4*((z-4)/7):z< -6?7-2*((-6-z)/5):7;
const narrowing=z=>z>5?.12*((z-5)/6)**2:0;
/** A point on the section at z, for θ from 0 (the keel, on the centreline) to π/2 (the deck edge). */
function sectionPoint(z,theta){
 const n=fullness(z),k=keelY(z),top=deckEdge(z),hb=halfBreadth(z);
 const sn=Math.sin(theta),cs=Math.cos(theta);
 const y=k+(top-k)*(1-Math.pow(Math.max(0,cs),2/n));
 const x=hb*Math.pow(Math.max(0,sn),2/n)*(1-narrowing(z)*Math.max(0,Math.min(1,(top-y)/(top-k))));
 return [x,y];
}
/** The hull's half-breadth at a height y and station z (for marks that sit on the plating). */
export function hullX(y,z){
 const k=keelY(z),top=deckEdge(z);if(y>=top)return halfBreadth(z);if(y<=k)return 0;
 let a=0,b=Math.PI/2;for(let i=0;i<40;i++){const m=(a+b)/2;if(sectionPoint(z,m)[1]<y)a=m;else b=m;}
 return sectionPoint(z,(a+b)/2)[0];
}

const ANTIFOULING=0x8e3a30,BOOT=0x26292b,HULL=0x2f5f6a,WHITE=0xeeeae0,DECKGREEN=0x6f7d6c,BULWARK_IN=0xd9d6cb,
 STEEL=0x7d8586,DARK=0x2a2f31,BRONZE=0xb08a4a,ORANGE=0xe0702a,RED=0xc2412f,YELLOW=0xe0b93a,ZINC=0xb9bcb8,TEAK=0x8d6f4c;
/** Paint bands on the hull, by height: antifouling, the black boot-top, the company teal, white bulwarks. */
const BANDS=[WL-.02,WL+.22,null];
const bandColour=(y,z)=>y<WL-.02?ANTIFOULING:y<WL+.22?BOOT:y<deckEdge(z)-.02?HULL:WHITE;

/** The hull shell: an indexed loft of sections, each split exactly at the paint lines. */
function hullShell(){
 const stations=[];for(let z=-HALF;z<=HALF+1e-6;z+=.5)stations.push(+z.toFixed(3));
 const thetas=[];for(let i=0;i<=24;i++){const u=i/24;thetas.push(Math.PI/2*(u<.5?2*u*u:1-2*(1-u)*(1-u)));}
 const sectionRows=z=>{
  const solve=y=>{let a=0,b=Math.PI/2;for(let i=0;i<40;i++){const m=(a+b)/2;if(sectionPoint(z,m)[1]<y)a=m;else b=m;}return (a+b)/2;};
  const marks=[WL-.02,WL+.22,deckEdge(z)-.02].map(y=>({t:solve(y),dup:true}));
  const rows=[...thetas.map(t=>({t})),...marks].sort((a,b)=>a.t-b.t);
  const out=[];for(const r of rows){const [x,y]=sectionPoint(z,r.t);out.push({x,y,c:bandColour(y-.001,z)});if(r.dup)out.push({x,y,c:bandColour(y+.001,z)});}
  out.push({x:halfBreadth(z),y:bulwarkTop(z),c:WHITE});
  return out;
 };
 const pos=[],col=[],idx=[],c=new THREE.Color();let per=0;
 for(const z of stations){
  const rows=sectionRows(z);per=rows.length*2;
  // Port side top-down to the keel, then starboard keel-up to the top.
  for(const side of [1,-1]){const list=side===1?[...rows].reverse():rows;for(const r of list){pos.push(r.x*side,r.y,z);c.setHex(r.c);col.push(c.r,c.g,c.b);}}
 }
 // The port bulwark is open at the gangway gate (GATE): no plating between those two stations.
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<per-1;j++){if(j===0&&stations[i]>=GATE.from-1e-6&&stations[i+1]<=GATE.to+1e-6)continue;const a=i*per+j,b=a+1,d=a+per,e=d+1;idx.push(a,d,b,b,d,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 // Normals must face out: a port-side vertex amidships points to +x.
 const mid=Math.floor(stations.length/2)*per+Math.floor(per/4),n=g.getAttribute('normal');
 if(n.getX(mid)<0){for(let k=0;k<idx.length;k+=3){const t=idx[k];idx[k]=idx[k+1];idx[k+1]=t;}g.setIndex(idx);g.computeVertexNormals();}
 // The ends: the transom full height, the bow up to the deck (the ramp closes the rest). Each is
 // plated in strips between the port and starboard rows, so the paint lines stay sharp across it.
 const ends=[];
 for(const [z,full,facing] of [[-HALF,true,-1],[HALF,false,1]]){
  const rows=sectionRows(z).filter(r=>full||r.y<=deckEdge(z)+1e-6),p=[],cc=[];
  const put=(q,hex)=>{p.push(q[0],q[1],z);c.setHex(hex);cc.push(c.r,c.g,c.b);};
  for(let k=0;k<rows.length-1;k++){
   const a=rows[k],b=rows[k+1];if(Math.abs(a.y-b.y)<1e-6&&Math.abs(a.x-b.x)<1e-6)continue;
   const hex=a.c===b.c?a.c:b.c,quad=[[a.x,a.y],[-a.x,a.y],[b.x,b.y],[-a.x,a.y],[-b.x,b.y],[b.x,b.y]];
   for(let t=0;t<6;t+=3){
    const tri=quad.slice(t,t+3),[[x0,y0],[x1,y1],[x2,y2]]=tri,cz=(x1-x0)*(y2-y0)-(y1-y0)*(x2-x0);
    if(Math.abs(cz)<1e-10)continue;                       // a sliver where two rows meet at the keel
    if(Math.sign(cz)!==facing)tri.reverse();              // wound to face out: aft for the transom, forward for the bow
    for(const q of tri)put(q,hex);
   }
  }
  const e=new THREE.BufferGeometry();e.setAttribute('position',new THREE.Float32BufferAttribute(p,3));e.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));e.computeVertexNormals();
  ends.push(e);
 }
 return [g.toNonIndexed(),...ends];
}

/** The inside of the bulwarks and the car deck plating, following the hull's breadth. */
function deckAndBulwarks(){
 const p=[],cc=[],c=new THREE.Color(),A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
 /** A triangle, wound so that it faces `toward` (its normal points that way). */
 const tri=(a,b,d,toward,hex)=>{A.set(...a);B.set(...b).sub(A);C.set(...d).sub(A);const n=B.cross(C);const list=n.dot(toward)>=0?[a,b,d]:[a,d,b];c.setHex(hex);for(const q of list){p.push(...q);cc.push(c.r,c.g,c.b);}};
 const up=new THREE.Vector3(0,1,0);
 for(let z=-HALF;z<HALF-1e-6;z+=.5){
  const z2=z+.5,w1=halfBreadth(z)-.07,w2=halfBreadth(z2)-.07;
  tri([-w1,DECK,z],[w1,DECK,z],[-w2,DECK,z2],up,DECKGREEN);tri([w1,DECK,z],[w2,DECK,z2],[-w2,DECK,z2],up,DECKGREEN);
  for(const side of [1,-1]){
   if(side===1&&z>=GATE.from-1e-6&&z2<=GATE.to+1e-6)continue;     // the gangway gate's opening
   const inward=new THREE.Vector3(-side,0,0),a=[side*w1,DECK,z],b=[side*w1,bulwarkTop(z)-.02,z],d=[side*w2,DECK,z2],e=[side*w2,bulwarkTop(z2)-.02,z2];
   tri(a,b,d,inward,BULWARK_IN);tri(b,e,d,inward,BULWARK_IN);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));g.computeVertexNormals();return g;
}

/** Collects static parts by material and merges them. */
function createKit(shadows){
 const groups=new Map();const c=new THREE.Color();
 const prep=(geo,hex)=>{let g=geo.index?geo.toNonIndexed():geo;g.deleteAttribute('uv');g.deleteAttribute('uv1');
  if(!g.getAttribute('color')){const n=g.getAttribute('position').count,a=new Float32Array(n*3);c.setHex(hex);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));}
  return g;};
 const add=(cls,geo,hex=WHITE,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{
  const m=new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot,'YXZ')),new THREE.Vector3(...scale));
  const g=prep(geo,hex);g.applyMatrix4(m);(groups.get(cls)||groups.set(cls,[]).get(cls)).push(g);return g;};
 const box=(cls,size,pos,hex,rot)=>add(cls,new THREE.BoxGeometry(...size),hex,pos,rot);
 const cyl=(cls,rt,rb,h,pos,hex,rot,seg=12)=>add(cls,new THREE.CylinderGeometry(rt,rb,h,seg),hex,pos,rot);
 /** A round bar from a to b. */
 const bar=(cls,a,b,r,hex,seg=6)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),len=A.distanceTo(B);const g=new THREE.CylinderGeometry(r,r,len,seg);g.translate(0,len/2,0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()));g.translate(...a);return add(cls,g,hex);};
 const materials={
  paint:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:.05}),
  metal:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.55}),
  rubber:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}),
 };
 const finish=parent=>{
  for(const [cls,list] of groups){const mesh=new THREE.Mesh(mergeGeometries(list,false),materials[cls]||materials.paint);mesh.name='Minato Maru '+cls;mesh.castShadow=mesh.receiveShadow=!!shadows;parent.add(mesh);}
 };
 return {add,box,cyl,bar,finish,materials};
}

/** Painted words and marks: name, port of registry, draft marks, load line, signs. */
function markings(){
 const W=1024,H=512,canvas=typeof document!=='undefined'?document.createElement('canvas'):null;
 if(!canvas)return null;
 canvas.width=W;canvas.height=H;const x=canvas.getContext('2d');x.clearRect(0,0,W,H);
 const cell=(i,j,w,h)=>[i*W/4,j*H/4,w*W/4,h*H/4];
 // Row 0: the name on the bow (white on teal hull).
 x.fillStyle='#f4f1e8';x.textAlign='center';x.textBaseline='middle';
 x.font='bold 66px "Hiragino Sans","Noto Sans JP",sans-serif';x.fillText('みなと丸',W*.25,H*.09);
 x.font='bold 40px sans-serif';x.fillText('MINATO MARU',W*.25,H*.19);
 // Row 0 right: the transom: name and port of registry.
 x.font='bold 54px "Hiragino Sans","Noto Sans JP",sans-serif';x.fillText('みなと丸',W*.75,H*.08);
 x.font='bold 34px sans-serif';x.fillText('MINATO',W*.75,H*.19);
 // Row 2: draft marks, metric: every 0.2 m, numerals 0.1 m tall, the bottom of a figure on its mark.
 x.fillStyle='#f4f1e8';x.textAlign='left';x.textBaseline='bottom';x.font='bold 30px sans-serif';
 const [dx,dy,dw,dh]=cell(0,2,1,2);
 for(let k=0;k<=7;k++){const v=(k*.2).toFixed(1).replace('0.','.').replace('1.','1.');const y=dy+dh-k*dh/7.5;x.fillText(k%5===0?(k*.2).toFixed(0)+'M':((k*2)%10)+'',dx+8,y);}
 // Row 2: the load line mark (満載喫水線標): a ring with a bar through it, J G either side.
 const [lx,ly]=cell(1,2,1,2);x.strokeStyle='#f4f1e8';x.lineWidth=7;x.beginPath();x.arc(lx+128,ly+120,58,0,Math.PI*2);x.stroke();
 x.fillStyle='#f4f1e8';x.fillRect(lx+40,ly+116,176,9);x.font='bold 38px sans-serif';x.textBaseline='middle';x.fillText('J',lx+70,ly+72);x.fillText('G',lx+166,ly+72);
 // Row 2: the bow-thruster and "no tugs" mark and the ship's number.
 const [tx,ty]=cell(2,2,1,2);x.lineWidth=6;x.strokeRect(tx+40,ty+70,90,90);x.beginPath();x.moveTo(tx+60,ty+115);x.lineTo(tx+110,ty+115);x.moveTo(tx+60,ty+115);x.lineTo(tx+74,ty+100);x.moveTo(tx+60,ty+115);x.lineTo(tx+74,ty+130);x.moveTo(tx+110,ty+115);x.lineTo(tx+96,ty+100);x.moveTo(tx+110,ty+115);x.lineTo(tx+96,ty+130);x.stroke();
 // Row 2 last cell: the muster and life-jacket signs.
 const [sx,sy]=cell(3,2,1,2);x.fillStyle='#1f7a4a';x.fillRect(sx+10,sy+20,236,90);x.fillStyle='#fff';x.font='bold 36px "Hiragino Sans","Noto Sans JP",sans-serif';x.textAlign='center';x.fillText('救命胴衣',sx+128,sy+52);x.font='bold 22px sans-serif';x.fillText('LIFE JACKETS',sx+128,sy+90);
 x.fillStyle='#e0702a';x.fillRect(sx+10,sy+140,236,90);x.fillStyle='#fff';x.font='bold 36px "Hiragino Sans","Noto Sans JP",sans-serif';x.fillText('集合場所',sx+128,sy+172);x.font='bold 22px sans-serif';x.fillText('MUSTER STATION',sx+128,sy+210);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 return {tex,cell:(i,j,w,h)=>[i/4,1-(j+h)/4,w/4,h/4]};
}

/** The ferry, whole. Returns the group with its moving parts in userData. */
export function buildFerryModel({shadows=false}={}){
 const ferry=new THREE.Group();ferry.name='Minato Maru';
 const kit=createKit(shadows);
 // ---- The hull and the deck.
 for(const g of hullShell())kit.add('paint',g);
 kit.add('paint',deckAndBulwarks());
 // The rubbing strake (fender belt): a half-round steel bar along the sheer, and the bulwark cap rail.
 for(const side of [1,-1]){
  for(let z=-HALF+.25;z<HALF-.2;z+=1){const z2=Math.min(HALF-.2,z+1);
   kit.bar('rubber',[side*(halfBreadth(z)+.05),deckEdge(z)-.12,z],[side*(halfBreadth(z2)+.05),deckEdge(z2)-.12,z2],.09,DARK,6);
   if(side===1&&z2>GATE.from&&z<GATE.to){for(const [a,b] of [[z,GATE.from],[GATE.to,z2]])if(b-a>.05)kit.bar('paint',[side*(halfBreadth(a)-.03),bulwarkTop(a)+.02,a],[side*(halfBreadth(b)-.03),bulwarkTop(b)+.02,b],.045,HULL,5);}
   else kit.bar('paint',[side*(halfBreadth(z)-.03),bulwarkTop(z)+.02,z],[side*(halfBreadth(z2)-.03),bulwarkTop(z2)+.02,z2],.045,HULL,5);}
  // Bulwark stiffeners on the inside, every 1.2 m, and the scuppers (freeing ports) at the deck.
  for(let z=-8.4;z<10.2;z+=1.2){if(side===1&&z>GATE.from-.1&&z<GATE.to+.1)continue;const hb=halfBreadth(z)-.1;kit.box('paint',[.06,BULWARK-.08,.08],[side*hb,DECK+BULWARK/2-.04+sheer(z),z],BULWARK_IN);}
  for(let z=-.6;z<10;z+=2.2)kit.box('paint',[.03,.12,.42],[side*(halfBreadth(z)+.005),DECK+.07,z],DARK);
 }
 // The gangway gate's posts: the opening's edges, plated and capped.
 for(const z of [GATE.from,GATE.to]){kit.box('paint',[.12,BULWARK+.04,.08],[halfBreadth(z)-.05,DECK+BULWARK/2,z],WHITE);}
 // ---- Under the water: keel bar, skeg, bilge keels, shafts, brackets, screws, rudders, thruster, anodes, sea chests.
 kit.box('paint',[.16,.12,17],[0,KEEL+.02,-1.5],ANTIFOULING);
 {const skeg=new THREE.Shape();skeg.moveTo(-2,KEEL+.05);skeg.lineTo(-8.2,KEEL-.04);skeg.lineTo(-8.2,keelY(-8.2)+.02);skeg.lineTo(-4,keelY(-4)+.1);skeg.closePath();
  const g=new THREE.ExtrudeGeometry(skeg,{depth:.14,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(.07,0,0);kit.add('paint',g,ANTIFOULING);}
 for(const side of [1,-1]){
  // Bilge keels at the turn of the bilge amidships.
  for(let z=-5;z<4;z+=1){const t=Math.PI/2*.42,[x,y]=sectionPoint(z,t),[x2,y2]=sectionPoint(z+1,t);kit.bar('paint',[side*(x+.1),y-.08,z],[side*(x2+.1),y2-.08,z+1],.05,ANTIFOULING,4);}
  const sx=side*1.25,cy=-.975,P=FERRY_MACHINERY.propellers;
  kit.bar('metal',[sx,cy+.12,-5.6],[sx,cy,-8.3],.055,STEEL,8);                 // the shaft out of its stern tube
  kit.cyl('metal',.13,.13,.5,[sx,cy+.05,-5.75],STEEL,[Math.PI/2,0,0]);          // the stern-tube boss
  for(const k of [-1,1])kit.bar('paint',[sx,cy,-7.8],[sx+k*.55,keelY(-7.8)+.35+.15,-7.6],.04,ANTIFOULING,5); // the A-bracket
  kit.cyl('metal',.1,.1,.32,[sx,cy,-7.8],STEEL,[Math.PI/2,0,0]);
  // The rudder, a spade behind the screw, on its stock up into the counter.
  kit.box('paint',[.09,.98,.72],[sx,-.86,-9.75],ANTIFOULING);kit.cyl('metal',.05,.05,.4,[sx,-.2,-9.62],STEEL);
  for(const z of [-9.55,-10])kit.box('metal',[.12,.08,.16],[sx,-.62,z],ZINC);               // anodes on the rudder
  kit.box('metal',[.06,.1,.3],[side*(hullX(-.75,-6.5)+.03),-.75,-6.5],ZINC);                  // and on the hull
  kit.box('paint',[.03,.22,.5],[side*(hullX(-1.2,-3.2)+.012),-1.2,-3.2],DARK);              // sea-chest grating
 }
 // The screws: a hub and four blades, which turn when she is under way.
 const screws=[];
 for(const side of [1,-1]){
  const screw=new THREE.Group();screw.position.set(side*1.25,-.975,-8.55);screw.name='Minato Maru '+(side>0?'port':'starboard')+' screw';
  const bronze=new THREE.MeshStandardMaterial({color:BRONZE,roughness:.32,metalness:.85});
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.34,10),bronze);hub.rotation.x=Math.PI/2;screw.add(hub);
  const blade=new THREE.Shape();blade.moveTo(0,0);blade.quadraticCurveTo(.2,.18,.12,.5);blade.quadraticCurveTo(-.05,.53,-.12,.4);blade.quadraticCurveTo(-.14,.15,0,0);
  const bladeGeo=new THREE.ShapeGeometry(blade,6);
  for(let b=0;b<4;b++){const m=new THREE.Mesh(bladeGeo,bronze);m.material.side=THREE.DoubleSide;m.rotation.set(0,side*.5,b*Math.PI/2);const holder=new THREE.Group();holder.rotation.z=b*Math.PI/2;m.rotation.set(0,side*.5,0);m.position.y=.06;holder.add(m);screw.add(holder);}
  screw.userData.hand=side;ferry.add(screw);screws.push(screw);
 }
 // The bow-thruster tunnel, through the forefoot.
 {const r=.28,y=-.75,z=8,w=hullX(y,z);const tube=new THREE.CylinderGeometry(r,r,2*w,16,1,true);tube.rotateZ(Math.PI/2);kit.add('paint',tube,DARK,[0,y,z]);
  for(const side of [1,-1])for(let k=-1;k<=1;k++)kit.box('metal',[.02,.04,.5],[side*(w-.01),y+k*.15,z],STEEL);}
 // ---- The car deck: lanes, lashing points, hydrant, the ladder up, the fans.
 for(const x of [0,2.7,-2.7].map(v=>v))kit.box('paint',[.1,.012,11.8],[x,DECK+.007,5],x?WHITE:YELLOW);
 for(let z=-.6;z<10.4;z+=1.2)for(const x of [-2.55,-.25,.25,2.55])kit.cyl('metal',.05,.05,.02,[x,DECK+.01,z],DARK,[0,0,0],8);
 kit.box('paint',[.18,.5,.18],[2.85,DECK+.25,-.4],RED);kit.box('paint',[.3,.32,.14],[-2.85,DECK+.45,-.6],RED);
 // Ladders from the car deck up to the upper deck at the deckhouse front, both sides.
 for(const side of [1,-1]){
  const x=side*2.35,top=D.upper.y,base=[x,DECK,-.15],up=[x,top,D.saloon.fore];
  for(const k of [-.3,.3])kit.bar('metal',[base[0]+k,base[1],base[2]],[up[0]+k,up[1],up[2]],.03,STEEL);
  for(let s=1;s<9;s++){const f=s/9;kit.box('metal',[.6,.03,.14],[x,DECK+(top-DECK)*f,-.15+(D.saloon.fore+.15)*f],STEEL);}
  for(const k of [-.3,.3])kit.bar('paint',[x+k,DECK+.9,-.15],[x+k,top+.9,D.saloon.fore],.02,YELLOW);
 }
 // An open car deck breathes on its own: no exhaust fans. The engine room's supply fans are on the upper deck aft.
 // ---- Forward: mooring bitts and fairleads each side of the ramp, the windlass and the anchor.
 for(const side of [1,-1]){
  const x=side*(halfBreadth(9.6)-.55);kit.box('paint',[.8,.25,1.4],[x,DECK+.12,9.6],HULL);
  for(const dz of [-.25,.25])kit.cyl('metal',.11,.11,.42,[x,DECK+.45,9.6+dz],DARK);
  kit.box('metal',[.12,.24,.46],[side*(halfBreadth(10.4)-.06),bulwarkTop(10.4)-.3,10.4],DARK);
 }
 kit.cyl('metal',.22,.22,.36,[-(halfBreadth(10)-.5),DECK+.5,10.2],DARK,[0,0,Math.PI/2]);   // the windlass drum, starboard
 // The anchor, a stockless (Hall) anchor housed in its pocket on the starboard bow: shank up the
 // hawse, crown and two flukes against the plating, the cable down from the windlass through the hawse pipe.
 {const z=9.9,y=.55,ax=-(hullX(y,z)+.06);
  kit.box('paint',[.06,.66,.6],[ax+.04,y,z],DARK);                                                  // the pocket's recess
  kit.box('metal',[.08,.62,.09],[ax-.03,y+.06,z],DARK);                                             // shank
  kit.box('metal',[.12,.12,.34],[ax-.04,y-.26,z],DARK);                                             // crown
  for(const k of [-1,1])kit.add('metal',new THREE.ConeGeometry(.07,.32,4),DARK,[ax-.04,y-.16,z+k*.17],[0,0,0]); // flukes
  kit.cyl('metal',.05,.05,.2,[ax+.02,y+.42,z],DARK);}                                               // the hawse pipe's lip
 // ---- The hydraulic ramp posts, which carry the rams.
 for(const side of [1,-1])kit.box('paint',[.42,2.2,.42],[side*2.25,DECK+1.1,10.55],HULL);
 // ---- The deckhouse (saloon), its windows, doors and the safety signs.
 const SAL=D.saloon,salZ=(SAL.fore+SAL.aft)/2,salL=SAL.fore-SAL.aft,salTop=DECK+SAL.height;
 kit.box('paint',[SAL.width,SAL.height,salL],[0,DECK+SAL.height/2,salZ],WHITE);
 kit.box('paint',[SAL.width+.1,.1,salL+.1],[0,salTop+.05,salZ],HULL);
 kit.box('paint',[SAL.width-.1,.012,salL-.1],[0,salTop+.106,salZ],DECKGREEN);                       // the upper deck's deck paint
 const glass=[];
 for(const side of [1,-1]){
  for(let z=SAL.fore-1.95;z>SAL.aft+.6;z-=1.15)glass.push([[.04,.62,.9],[side*(SAL.width/2+.01),DECK+1.45,z]]);
  kit.box('paint',[.04,1.9,.8],[side*(SAL.width/2+.02),DECK+.95,GATE.z],0x5d6b6a);                   // the side door, at the gangway gate
  kit.box('metal',[.05,.06,.82],[side*(SAL.width/2+.03),DECK+1.92,GATE.z],STEEL);
 }
 for(const x of [-1.6,1.6])glass.push([[.9,.62,.04],[x,DECK+1.45,SAL.fore+.01]]);
 kit.box('paint',[.9,1.9,.04],[0,DECK+.95,SAL.fore+.02],0x5d6b6a);                                 // the front door
 kit.box('paint',[.9,1.9,.04],[0,DECK+.95,SAL.aft-.02],0x5d6b6a);                                  // the aft door to the mooring deck
 // ---- The stern mooring deck: capstan, bitts, fairleads, the flagstaff.
 kit.cyl('metal',.2,.24,.42,[0,DECK+.21,-10.35],DARK);kit.cyl('metal',.16,.16,.08,[0,DECK+.46,-10.35],STEEL);
 for(const side of [1,-1]){const x=side*2.3;for(const dz of [-.22,.22])kit.cyl('metal',.11,.11,.42,[x,DECK+.21,-10.2+dz],DARK);
  kit.box('metal',[.46,.24,.12],[side*1.5,bulwarkTop(-HALF)-.3,-HALF+.06],DARK);}
 kit.bar('paint',[0,bulwarkTop(-HALF),-HALF+.1],[0,bulwarkTop(-HALF)+2.1,-HALF-.05],.025,WHITE);
 // ---- The upper deck: rails, benches, life floats, lifebuoys, the funnel and the vents.
 const UP=D.upper,uy=UP.y,uw=SAL.width/2-.08;
 const railLine=(a,b)=>{for(const h of [.5,1])kit.bar('paint',[a[0],uy+h,a[1]],[b[0],uy+h,b[1]],.022,WHITE,5);
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/1.1));for(let i=0;i<=n;i++){const f=i/n;kit.bar('paint',[a[0]+(b[0]-a[0])*f,uy,a[1]+(b[1]-a[1])*f],[a[0]+(b[0]-a[0])*f,uy+1,a[1]+(b[1]-a[1])*f],.022,WHITE,5);}};
 railLine([uw,SAL.fore-.05],[uw,SAL.aft+.05]);railLine([-uw,SAL.fore-.05],[-uw,SAL.aft+.05]);railLine([uw,SAL.aft+.05],[-uw,SAL.aft+.05]);
 railLine([uw,SAL.fore-.05],[1.95,SAL.fore-.05]);railLine([-1.95,SAL.fore-.05],[-uw,SAL.fore-.05]);
 for(const x of [1.75,-1.75]){kit.box('paint',[.45,.06,2.4],[x,uy+.44,-8],TEAK);kit.box('paint',[.06,.4,2.4],[x+Math.sign(x)*.22,uy+.66,-8],TEAK);for(const dz of [-1,1])kit.box('metal',[.4,.42,.06],[x,uy+.21,-8+dz],STEEL);}
 for(const side of [1,-1]){
  kit.box('paint',[.42,.36,1.9],[side*(uw-.35),uy+.62,-5.6],ORANGE);                                  // a rigid life float (救命浮器)
  for(const dz of [-.7,.7])kit.box('metal',[.4,.42,.06],[side*(uw-.35),uy+.21,-5.6+dz],STEEL);
  kit.add('paint',new THREE.TorusGeometry(.3,.06,8,18),ORANGE,[side*(uw+.04),uy+.75,-7.1],[0,Math.PI/2,0]);
  kit.box('paint',[.5,.55,.5],[side*(uw-.3),uy+.28,-9.1],ORANGE);                                     // life-jacket locker
 }
 kit.add('paint',new THREE.TorusGeometry(.3,.06,8,18),ORANGE,[1.2,bulwarkTop(-HALF)-.2,-HALF-.04]);
 kit.add('paint',new THREE.TorusGeometry(.3,.06,8,18),ORANGE,[-1.2,bulwarkTop(-HALF)-.2,-HALF-.04]);
 // The funnel: one casing round both engines' exhausts, in the town's teal with a white band.
 {const fz=-6.9,f=new THREE.CylinderGeometry(.5,.62,2.4,14);f.scale(1,1,1.5);kit.add('paint',f,WHITE,[0,uy+1.2,fz]);
  const band=new THREE.CylinderGeometry(.505,.53,.42,14);band.scale(1,1,1.5);kit.add('paint',band,HULL,[0,uy+1.9,fz]);
  for(const x of [-.2,.2])kit.cyl('metal',.09,.09,.5,[x,uy+2.55,fz-.15],DARK);}
 for(const side of [1,-1]){kit.cyl('paint',.16,.16,.7,[side*1.5,uy+.35,-8.95],WHITE);kit.cyl('paint',.28,.2,.16,[side*1.5,uy+.78,-8.95],WHITE);}
 // ---- The wheelhouse, its wings, the mast and everything on it.
 const WH=D.wheelhouse,whZ=(WH.fore+WH.aft)/2,whL=WH.fore-WH.aft,whTop=uy+WH.height;
 kit.box('paint',[WH.width,WH.height,whL],[0,uy+WH.height/2,whZ],WHITE);
 kit.box('paint',[WH.width+.3,.1,whL+.35],[0,whTop+.05,whZ+.05],WHITE);
 kit.box('paint',[WH.width+.32,.12,.05],[0,whTop-.02,WH.fore+.22],HULL);                             // the visor over the windows
 for(let i=0;i<4;i++)glass.push([[.82,.62,.04],[-1.29+i*.86,uy+1.35,WH.fore+.02],[-.12,0,0]]);
 for(const side of [1,-1]){glass.push([[.04,.55,1.6],[side*(WH.width/2+.01),uy+1.35,whZ+.1]]);
  // The wing: the open upper deck beside the wheelhouse, out to the ship's side, with a steel
  // dodger on the rail and the wing console on its pedestal, where the master berths her.
  kit.box('paint',[.05,1.1,1.1],[side*uw,uy+.55,WH.fore-.55],WHITE);
  kit.box('metal',[.12,.95,.12],[side*(uw-.35),uy+.48,WH.fore-.35],STEEL);
  kit.box('metal',[.3,.18,.26],[side*(uw-.35),uy+1.02,WH.fore-.35],DARK);                           // throttles and thruster lever
 }
 // The mast on the wheelhouse top: radar platform, horn, VHF whips, GPS, the halyard yard.
 const mastZ=whZ-.3;
 kit.bar('paint',[0,whTop,mastZ],[0,whTop+3,mastZ],.06,WHITE,8);
 kit.box('paint',[.9,.06,.7],[0,whTop+1.1,mastZ],WHITE);
 kit.bar('paint',[-1,whTop+2.3,mastZ],[1,whTop+2.3,mastZ],.03,WHITE,5);
 kit.cyl('metal',.05,.11,.32,[.26,whTop+1.75,mastZ+.15],STEEL,[Math.PI/2.4,0,0]);                    // the whistle
 for(const x of [-.9,.9])kit.bar('paint',[x,whTop+.1,mastZ-.8],[x,whTop+2.6,mastZ-.8],.012,WHITE,4);
 kit.cyl('paint',.12,.12,.12,[.6,whTop+.16,mastZ-.6],WHITE);kit.add('paint',new THREE.SphereGeometry(.12,10,6,0,Math.PI*2,0,Math.PI/2),WHITE,[.6,whTop+.22,mastZ-.6]);
 kit.cyl('metal',.14,.18,.24,[-.7,whTop+.25,whZ+.7],STEEL);kit.cyl('metal',.12,.12,.18,[-.7,whTop+.45,whZ+.7],0xdedad0,[Math.PI/2,0,0]); // the searchlight
 const radar=new THREE.Group();radar.name='Radar scanner';radar.position.set(0,whTop+1.32,mastZ);
 {const m=new THREE.Mesh(new THREE.BoxGeometry(1.4,.12,.16),new THREE.MeshStandardMaterial({color:0xeeeae0,roughness:.5}));radar.add(m);const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.16,8),new THREE.MeshStandardMaterial({color:DARK,roughness:.6}));p.position.y=-.13;radar.add(p);}
 ferry.add(radar);
 // The glass: one mesh, lit from inside at night.
 const glassMat=new THREE.MeshStandardMaterial({color:0x2d4a55,roughness:.15,metalness:.2,emissive:0xf0d8a0,emissiveIntensity:0});
 {const parts=glass.map(([size,pos,rot=[0,0,0]])=>{const g=new THREE.BoxGeometry(...size).toNonIndexed();g.deleteAttribute('uv');g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(1,1,1)));return g;});
  const mesh=new THREE.Mesh(mergeGeometries(parts,false),glassMat);mesh.name='Minato Maru windows';ferry.add(mesh);}
 // ---- Navigation lights (COLREG): masthead white, sidelights red to port and green to starboard, stern light, anchor light.
 const lamp=(colour,pos,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.11,.14,.11),new THREE.MeshBasicMaterial({color:0x333333}));m.position.set(...pos);m.name=name;m.userData.on=colour;ferry.add(m);return m;};
 const navLights=[lamp(0xfff6d8,[0,whTop+2.95,mastZ+.08],'Masthead light'),lamp(0xff3a2a,[WH.width/2+.08,uy+1.95,WH.fore-.2],'Port sidelight'),lamp(0x2aff70,[-WH.width/2-.08,uy+1.95,WH.fore-.2],'Starboard sidelight'),lamp(0xfff6d8,[0,bulwarkTop(-HALF)+.25,-HALF+.05],'Stern light')];
 for(const side of [1,-1])kit.box('paint',[.03,.25,.6],[side*(WH.width/2+.15),uy+1.95,WH.fore-.42],0x111111); // sidelight screens
 // ---- Painted words and marks on the hull.
 const marks=markings();
 if(marks){
  const mat=new THREE.MeshBasicMaterial({map:marks.tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const decal=(cell,w,h,pos,rotY)=>{const g=new THREE.PlaneGeometry(w,h);const uv=g.getAttribute('uv'),[u0,v0,uw2,vh]=marks.cell(...cell);for(let i=0;i<uv.count;i++)uv.setXY(i,u0+uv.getX(i)*uw2,v0+uv.getY(i)*vh);g.rotateY(rotY);g.translate(...pos);return g;};
  const pieces=[];
  for(const side of [1,-1]){
   const rot=side>0?Math.PI/2:-Math.PI/2;
   pieces.push(decal([0,0,2,1],2.4,.6,[side*(hullX(.55,5.4)+.012),.55,5.4],rot));                  // name forward, on the parallel side
   // Draft marks fore and aft, where the side is upright: the marks read the draft at that station.
   for(const z of [6.8,-8.8]){const x=Math.max(hullX(WL-.36,z),hullX(WL+.46,z),halfBreadth(z)*0)+.015;pieces.push(decal([0,2,1,2],.32,.82,[side*x,WL+.06,z],rot));}
   pieces.push(decal([1,2,1,2],.55,.55,[side*(hullX(WL+.35,-.5)+.012),WL+.38,-.5],rot));              // the load line, amidships
   pieces.push(decal([2,2,1,2],.4,.4,[side*(hullX(.15,8)+.012),.18,8],rot));                         // the thruster mark
   pieces.push(decal([3,2,1,1],.7,.35,[side*(SAL.width/2+.03),DECK+1.95,SAL.fore-1.95],rot));        // life jackets, over the first window
  }
  pieces.push(decal([2,0,2,1],1.9,.55,[0,.42,-HALF-.012],Math.PI));                                  // name and port on the transom
  pieces.push(decal([3,3,1,1],.7,.35,[.9,DECK+1.95,SAL.fore+.04],0));                                // muster station, saloon front
  const mesh=new THREE.Mesh(mergeGeometries(pieces,false),mat);mesh.name='Minato Maru markings';mesh.renderOrder=2;ferry.add(mesh);
 }
 kit.finish(ferry);

 // ---- The bow ramp on its hinge, with its two hydraulic rams.
 const RAMP=FERRY_RAMP;
 const ramp=new THREE.Group();ramp.name='Ferry bow ramp';ramp.position.set(0,DECK-.01,HALF);ferry.add(ramp);
 {const k2=createKit(shadows);k2.box('paint',[RAMP.width,.12,RAMP.length],[0,0,RAMP.length/2],DECKGREEN);
  for(let i=0;i<7;i++)k2.box('metal',[RAMP.width-.1,.04,.05],[0,.07,.25+i*.33],STEEL);
  k2.box('paint',[RAMP.width,.14,.12],[0,.04,RAMP.length+.02],YELLOW);                              // the toe, painted
  for(const side of [1,-1])k2.box('paint',[.12,.42,RAMP.length],[side*(RAMP.width/2-.06),-.12,RAMP.length/2],HULL); // side girders
  k2.cyl('metal',.08,.08,RAMP.width,[0,0,0],STEEL,[0,0,Math.PI/2]);                                // the hinge pin
  k2.finish(ramp);}
 const rams=[];
 const ramMat=new THREE.MeshStandardMaterial({color:0x58646a,roughness:.4,metalness:.6}),rodMat=new THREE.MeshStandardMaterial({color:0xd8dcdc,roughness:.18,metalness:.9});
 for(const side of [1,-1]){
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1,10),ramMat),rod=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1,8),rodMat);
  barrel.name=rod.name='Ramp ram';ferry.add(barrel,rod);rams.push({side,barrel,rod,pivot:new THREE.Vector3(side*2.25,DECK+2.15,10.55),pin:new THREE.Vector3(side*(RAMP.width/2-.06),.1,1.5)});
 }
 const up=new THREE.Vector3(0,1,0),tmp=new THREE.Vector3(),q=new THREE.Quaternion();
 const placeRams=()=>{ramp.updateMatrix();for(const r of rams){const pin=r.pin.clone().applyMatrix4(ramp.matrix),dir=tmp.copy(pin).sub(r.pivot),len=dir.length();dir.normalize();q.setFromUnitVectors(up,dir);
  const bl=Math.min(1.25,len*.6);r.barrel.scale.set(1,bl,1);r.barrel.quaternion.copy(q);r.barrel.position.copy(r.pivot).addScaledVector(dir,bl/2);
  const rl=len-bl*.55;r.rod.scale.set(1,rl,1);r.rod.quaternion.copy(q);r.rod.position.copy(pin).addScaledVector(dir,-rl/2);}};
 ferry.userData.ramp=ramp;
 /** 0 raised and closed, 1 down on the quay. */
 ferry.userData.setRamp=(down,slope=.24)=>{ramp.rotation.x=-1.45*(1-down)+slope*down;placeRams();};
 ferry.userData.setRamp(0);
 ferry.userData.deckY=DECK;
 ferry.userData.passengerDeck=D.passenger;
 // ---- The gangway, run out from the port side door to the pier while she is boarding.
 const gangway=new THREE.Group();gangway.name='Ferry gangway';gangway.visible=false;ferry.add(gangway);
 {const k3=createKit(shadows);k3.box('paint',[1.7,.06,.9],[.85,0,0],DECKGREEN);for(const dz of [-.43,.43]){k3.box('metal',[1.7,.04,.04],[.85,.85,dz],WHITE);for(const x of [.1,.85,1.6])k3.box('metal',[.03,.85,.03],[x,.42,dz],WHITE);}k3.finish(gangway);}
 gangway.position.set(halfBreadth(GANGWAY_Z)-.05,DECK,GANGWAY_Z);gangway.rotation.z=-.3;
 ferry.userData.gangway=gangway;
 // The gate leaf, hinged on its forward post: shut across the opening at sea; alongside it folds right
 // back against the inside of the bulwark, forward of the opening, and is hooked there.
 const gate=new THREE.Group();gate.name='Gangway gate';gate.position.set(halfBreadth(GATE.to)-.1,DECK,GATE.to);ferry.add(gate);
 {const k4=createKit(shadows);k4.box('paint',[.04,BULWARK-.06,GATE.to-GATE.from-.06],[0,BULWARK/2,-(GATE.to-GATE.from)/2],WHITE);k4.box('paint',[.05,.06,GATE.to-GATE.from-.06],[0,BULWARK-.05,-(GATE.to-GATE.from)/2],HULL);k4.finish(gate);}
 ferry.userData.gate=gate;
 ferry.userData.setGate=open=>{gate.rotation.y=open?Math.PI:0;};
 ferry.userData.setGate(false);
 // ---- Moving parts: screws turn and the radar sweeps while she is under way.
 ferry.userData.screws=screws;ferry.userData.radar=radar;
 ferry.userData.underway=(dt,speed)=>{for(const s of screws)s.rotation.z+=s.userData.hand*dt*speed*25;radar.rotation.y+=dt*(speed>0?2.6:0);};
 ferry.userData.lights=on=>{glassMat.emissiveIntensity=on?.55:0;for(const l of navLights)l.material.color.setHex(on?l.userData.on:0x333333);};
 ferry.userData.model='Minato Maru';
 return ferry;
}

/** The gangway gate in the port bulwark, beside the deckhouse's port door: a 1 m opening between two loft stations. */
export const GATE=Object.freeze({z:-2,from:-2.5,to:-1.5});
/** The bow ramp: 3.8 m wide (a 4-tonne truck is 2.2 m), 2.4 m long from its hinge to its toe. */
export const FERRY_RAMP=Object.freeze({width:3.8,length:2.4});
/** The port side door, where the gangway lands on the pier: 1.6 m aft of the deckhouse front. */
export const GANGWAY_Z=GATE.z;
