import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {SAKURA_LAYOUT,AISLE_LEVELS,CHILLER,BUN_STEAMER,FRONT_ENDCAPS,COPY_MACHINE} from './sakura-layout.js';
import {MEDICINE_SHELF} from './sakura-dressing.js';
import {BACKROOM} from './sakura-backroom.js';
import {RESTROOM} from './sakura-restroom.js';
import {MAGAZINE_RACK} from './sakura-magazine-rack.js';

/**
 * Sakura Shōten, built: the family shop Thuan keeps, drawn from scratch to the shop's own
 * measurements (sakura-layout.js) instead of the supplied convenience-store model, which
 * came with no licence (docs/AMPLIFY-AUDIT.md, B5).
 *
 * A 1960s harbour shōten that has taken on konbini habits: terrazzo floor, honey-wood
 * wainscot under cream plaster, a ceiling of white boards on dark beams with bare tubes
 * on battens and a striped till canopy over the counter; wooden gondolas with green end
 * panels and cream price rails; a long wooden counter; the glass bun cabinet on the west
 * wall with dagashi jars on top; an ice-cream chest by the window; the medicine boards
 * behind the till; a steel rack in the back room; the office and the restroom.
 *
 * The meshes keep the names the rest of the shop looks for: `sakura-building` (the
 * shell, hidden when the shop is seen from the street), `sakura-ceiling`, `sakura-floor`,
 * `sakura-counter`, `sakura-shelf` (wall shelving), `sakura-shelf <island>` and
 * `sakura-shelf-ends <island>` (the three gondolas), `sakura-light` (the tubes, which
 * glow), `sakura-door`, `sakura-toilet` and `sakura-register`. Each is one draw: every
 * piece is a box with a vertex colour, merged by name. Shelf tops are taken from the
 * stock layout itself, so every product stands on a board.
 */
export const SAKURA_SHELL=Object.freeze({
 ceiling:2.98,floorFront:3.91,partitionZ:-3.99,backZ:-6.86,westX:-6.86,eastX:6.86,backWestX:-5.76,backEastX:5.76,
 /** The shop's colours, in one place. */
 colours:Object.freeze({
  plaster:0xf3ead6,wainscot:0x9c7148,wainscotDark:0x6e4c30,ceiling:0xf6f1e6,beam:0x8a5a36,
  wood:0xb08a5e,woodDark:0x7f5a38,spine:0xe7dfc8,end:0x3f6e58,rail:0xf5ecd6,plinth:0x5a4636,
  steel:0x9aa4a6,concrete:0xb9b6ac,tile:0xd8e8e0,porcelain:0xf6f4ee,
 }),
});

/** Island footprints, read off the colliders the layout already moves with them. */
export const SAKURA_ISLANDS=Object.freeze({
 east:SAKURA_LAYOUT.colliders[0],middle:SAKURA_LAYOUT.colliders[1],endcap:SAKURA_LAYOUT.colliders[2],west:SAKURA_LAYOUT.colliders[3],
});

const C=SAKURA_SHELL.colours;
function parts(name){
 const list=[],colour=new THREE.Color();
 const box=(w,h,d,x,y,z,hex,{ry=0}={})=>{
  if(w<=0||h<=0||d<=0)return;
  const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);g.deleteAttribute('uv');
  colour.set(hex);const n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set([colour.r,colour.g,colour.b],i*3);
  g.setAttribute('color',new THREE.BufferAttribute(c,3));list.push(g);
 };
 /** A box by its extents. */
 const span=(x0,x1,y0,y1,z0,z1,hex)=>box(x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,hex);
 const cyl=(r,h,x,y,z,hex,seg=12)=>{const g=new THREE.CylinderGeometry(r,r,h,seg);g.translate(x,y,z);g.deleteAttribute('uv');colour.set(hex);const n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set([colour.r,colour.g,colour.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(c,3));list.push(g.index?g.toNonIndexed():g);};
 const mesh=(material)=>{
  const geometries=list.map(g=>g.index?g.toNonIndexed():g);
  const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
  // Indexed, so the triangles can be counted and picked out the way the old model's were.
  merged.setIndex(Array.from({length:merged.attributes.position.count},(_,i)=>i));
  merged.computeBoundingBox();merged.computeBoundingSphere();
  const m=new THREE.Mesh(merged,material);m.name=name;m.receiveShadow=true;return m;
 };
 return {box,span,cyl,mesh};
}

const material=(extra={})=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,...extra});

/** Walls, floor and ceiling of the shop floor, the back room, the office and the restroom. */
function buildShell(){
 const {span,box,mesh}=parts('sakura-building');
 const S=SAKURA_SHELL,top=S.ceiling,W=S.westX,E=S.eastX,F=S.floorFront,P=S.partitionZ,B=S.backZ;
 // A wall with its wainscot: wood to 0.9 m, a dark rail, plaster above.
 // A wall whose inner face is exactly on the line given, built outward from it, with its
 // wainscot: wood to 0.9 m, a dark rail, plaster above. `face` points into the room.
 const wallX=(x,z0,z1,face)=>{const t=.08;
  span(Math.min(x,x-face*t),Math.max(x,x-face*t),0,top,z0,z1,C.plaster);
  const at=(d,w)=>[Math.min(x+face*d,x+face*(d+w)),Math.max(x+face*d,x+face*(d+w))];
  span(...at(0,.018),.08,.9,z0,z1,C.wainscot);span(...at(0,.03),.88,.94,z0,z1,C.wainscotDark);span(...at(0,.025),0,.08,z0,z1,C.wainscotDark);};
 const wallZ=(z,x0,x1,face,{wains=true}={})=>{const t=.08;
  span(x0,x1,0,top,Math.min(z,z-face*t),Math.max(z,z-face*t),C.plaster);
  if(!wains)return;
  const at=(d,w)=>[Math.min(z+face*d,z+face*(d+w)),Math.max(z+face*d,z+face*(d+w))];
  span(x0,x1,.08,.9,...at(0,.018),C.wainscot);span(x0,x1,.88,.94,...at(0,.03),C.wainscotDark);span(x0,x1,0,.08,...at(0,.025),C.wainscotDark);};
 // Shop floor: west and east walls; the partition with its passage (x 3.25..4.39) to the back.
 wallX(W+.04,P,F,1);wallX(E-.04,P,F,-1);
 wallZ(P+.04,-3.96,3.25,1);wallZ(P+.04,4.39,E,1);wallZ(P+.04,W,-3.96,1,{wains:false});
 span(3.25,4.39,2.2,top,P-.04,P+.04,C.plaster);
 // The back room: concrete, plain, its own walls round x -5.76..5.76.
 for(const [x,face] of [[S.backWestX,-1],[S.backEastX,1]])span(x-.04,x+.04,0,top,B,P,C.concrete);
 span(S.backWestX,S.backEastX,0,top,B-.08,B,C.concrete);
 // The delivery door in the back wall, steel, painted green.
 span(3.0,4.3,0,2.3,B+.005,B+.05,0x4f7a64);span(3.85,4.15,1.0,1.08,B+.05,B+.09,C.steel);
 // The office (x 4.6..6.8, z -3.95..-1.17): its west wall and the front with its doorway.
 span(4.56,4.64,0,top,P,-1.25,C.plaster);span(4.58,5.14,0,top,-1.21,-1.13,C.plaster);span(6.28,E,0,top,-1.21,-1.13,C.plaster);span(5.14,6.28,2.2,top,-1.21,-1.13,C.plaster);
 span(4.64,4.66,.08,.9,P,-1.25,C.wainscot);
 // The restroom (x -6.82..-4.09, z -3.95..-2.58): its east wall with the doorway at z -3.66..-2.78, and its front.
 span(-4.08,-3.96,0,top,P,-3.66,C.plaster);span(-4.08,-3.96,0,top,-2.78,-2.42,C.plaster);span(-4.08,-3.96,2.2,top,-3.66,-2.78,C.plaster);
 span(W,-3.96,0,top,-2.54,-2.42,C.plaster);
 // Skirting where floors meet: a thin dark line round the back room.
 span(S.backWestX,S.backEastX,0,.1,B,B+.02,0x77746c);
 // Ceiling beams across the shop, dark wood on the white boards.
 for(let x=-6.2;x<=6.3;x+=1.55)span(x-.07,x+.07,top-.16,top,P,F,C.beam);
 span(W,E,top-.12,top,-.02-.06,-.02+.06,C.beam);
 return mesh(material());
}

/** Indoor facade; the street storefront supplies its own frame outside. */
function buildFrontFrame(){
 const {span,mesh}=parts('sakura-front-frame');
 const S=SAKURA_SHELL,W=S.westX,E=S.eastX,F=S.floorFront,top=S.ceiling;
 // The front: no glass here (the storefront has it), only the frame. A kick panel under
 // each pane, posts between them, the transom bar and a band of wall to the ceiling.
 const doorHalf=.95;
 for(const [x0,x1] of [[W,-doorHalf],[doorHalf,E]]){
  span(x0,x1,0,.32,F-.04,F+.06,C.wainscotDark);
  const n=Math.max(1,Math.round((x1-x0)/1.45));
  for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;span(x-.05,x+.05,0,2.55,F-.04,F+.06,C.woodDark);}
 }
 span(W,E,2.5,2.6,F-.05,F+.07,C.woodDark);span(W,E,2.6,top,F-.03,F+.05,C.plaster);
 for(const x of [-doorHalf,doorHalf])span(x-.06,x+.06,0,2.6,F-.05,F+.07,C.woodDark);
 return mesh(material());
}

function buildCeilingAndFloor(page){
 const S=SAKURA_SHELL,out=[];
 {const {span,mesh}=parts('sakura-ceiling');
  span(S.westX,S.eastX,S.ceiling,S.ceiling+.04,S.partitionZ,S.floorFront,C.ceiling);
  span(S.backWestX,S.backEastX,S.ceiling,S.ceiling+.04,S.backZ,S.partitionZ,0xe6e2d8);
  out.push(mesh(material()));}
 // Terrazzo on the shop floor, grey concrete in the back room.
 const floorMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});
 if(page){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#e9e1cf';ctx.fillRect(0,0,256,256);
  let seed=3;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<900;i++){ctx.fillStyle=['#c9bda6','#b8ab92','#f6f1e6','#a99a80','#d7c7aa'][i%5];const s=1+rnd()*3;ctx.fillRect(rnd()*256,rnd()*256,s,s);}
  ctx.strokeStyle='#cfc3aa';ctx.lineWidth=3;ctx.strokeRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set((S.eastX-S.westX)/.6,(S.floorFront-S.partitionZ)/.6);t.anisotropy=8;
  floorMat.map=t;
 }else floorMat.color.setHex(0xe9e1cf);
 const shopFloor=new THREE.Mesh(new THREE.PlaneGeometry(S.eastX-S.westX,S.floorFront-S.partitionZ),floorMat);
 shopFloor.rotation.x=-Math.PI/2;shopFloor.position.set((S.westX+S.eastX)/2,0,(S.floorFront+S.partitionZ)/2);shopFloor.name='sakura-floor';shopFloor.receiveShadow=true;out.push(shopFloor);
 const back=new THREE.Mesh(new THREE.PlaneGeometry(S.backEastX-S.backWestX,S.partitionZ-S.backZ),new THREE.MeshStandardMaterial({color:0xb4b1a8,roughness:.9}));
 back.rotation.x=-Math.PI/2;back.position.set(0,.001,(S.partitionZ+S.backZ)/2);back.name='sakura-floor back room';back.receiveShadow=true;out.push(back);
 return out;
}

/**
 * One gondola, from its collider: a plinth, a cream spine down the middle with a header
 * board, four wooden boards each side at the aisle levels, price rails, and green end panels.
 */
function buildIsland(id){
 const R=SAKURA_ISLANDS[id],shelf=parts('sakura-shelf '+id),ends=parts('sakura-shelf-ends '+id);
 const x0=R.x-R.w/2,x1=R.x+R.w/2,z0=R.z-R.d/2,z1=R.z+R.d/2,inZ0=z0+.05,inZ1=z1-.05;
 shelf.span(x0+.04,x1-.04,0,.12,inZ0,inZ1,C.plinth);
 shelf.span(R.x-.02,R.x+.02,.12,1.48,inZ0,inZ1,C.spine);
 for(const side of [-1,1]){
  const a=side<0?x0+.01:R.x+.02,b=side<0?R.x-.02:x1-.01;
  shelf.span(a,b,.12,.2,inZ0,inZ1,C.wood);
  for(const level of AISLE_LEVELS){
   shelf.span(a,b,level-.022,level,inZ0,inZ1,C.wood);
   // The price rail at the board's lip.
   const lip=side<0?a:b;shelf.span(Math.min(lip,lip-side*.018),Math.max(lip,lip-side*.018),level-.05,level+.012,inZ0,inZ1,C.rail);
  }
 }
 // Two compact bays on the daily-goods island, with a visible upright between them.
 if(id==='east')ends.span(x0,x1,.12,1.5,R.z-.018,R.z+.018,C.end);
 // A header board on the spine with the shop's hand-painted aisle card.
 shelf.span(R.x-.015,R.x+.015,1.48,1.5,inZ0,inZ1,C.woodDark);
 for(const z of [z0+.025,z1-.025])ends.span(x0,x1,0,1.5,z-.025,z+.025,C.end);
 for(const z of [z0+.025,z1-.025])ends.span(x0+.05,x1-.05,1.1,1.36,z+(z<R.z?-.03:.03)-.004,z+(z<R.z?-.03:.03)+.004,C.rail);
 return [shelf.mesh(material()),ends.mesh(material())];
}

/** The middle island's end cap, facing the door: the month's offer stacked on two boards. */
function buildEndcap(){
 const R=SAKURA_ISLANDS.endcap,{span,mesh}=parts('sakura-shelf-ends endcap');
 const x0=R.x-R.w/2,x1=R.x+R.w/2,z0=R.z-R.d/2,z1=R.z+R.d/2;
 span(x0+.03,x1-.03,0,.12,z0+.03,z1,C.plinth);
 span(x0,x1,0,1.55,z1-.04,z1,C.end);
 for(const x of [x0,x1-.04])span(x,x+.04,0,1.2,z0,z1,C.end);
 for(const level of [.202,.805])span(x0+.04,x1-.04,level-.022,level,z0+.02,z1-.04,C.wood);
 span(x0+.08,x1-.08,1.22,1.5,z1-.06,z1-.04,C.rail);
 return mesh(material());
}

/** The front end caps (FRONT_ENDCAPS): two boards and a header card, facing the window. */
function buildFrontEndcaps(){
 const {span,mesh}=parts('sakura-shelf-ends front');
 for(const E of FRONT_ENDCAPS){
  const x0=E.x-E.w/2,x1=E.x+E.w/2,z0=E.z-E.d/2,z1=E.z+E.d/2;
  span(x0+.03,x1-.03,0,.12,z0,z1-.03,C.plinth);
  span(x0,x1,0,1.5,z0,z0+.04,C.end);
  for(const x of [x0,x1-.04])span(x,x+.04,0,1.2,z0,z1,C.end);
  for(const level of E.levels)span(x0+.04,x1-.04,level-.022,level,z0+.04,z1-.02,C.wood);
  span(x0+.08,x1-.08,1.22,1.46,z0+.04,z0+.06,C.rail);
 }
 return mesh(material());
}

/** Wall shelving: the open chiller, the bun steamer, the copy machine, the delivery shelf, the medicine boards and the back-room rack. */
function buildWallShelving(){
 const {span,cyl,mesh}=parts('sakura-shelf');
 // The open chiller on the west wall (CHILLER): a dark well at the foot, four stepped
 // decks narrowing as they rise, a white back, end panels and a lit canopy on top.
 {const K=CHILLER,L=K.levels;
  span(K.x0,K.x1,0,L[0]-.02,K.z0,K.z1,0x3a4a50);
  span(K.x1-.06,K.x1,L[0]-.02,L[0]+.1,K.z0,K.z1,0xdfe6e8);
  L.forEach((y,i)=>{const front=K.x1-.06-i*.08;span(K.x0,front,y-.025,y,K.z0+.02,K.z1-.02,0xe9eeef);span(front-.015,front,y-.03,y+.05,K.z0+.02,K.z1-.02,C.rail);});
  span(K.x0,K.x0+.04,L[0],K.canopy,K.z0,K.z1,0xf4f6f6);
  for(const z of [K.z0,K.z1])span(K.x0,K.x1,0,K.canopy+.18,z-.03,z+.03,0x2f5f4a);
  span(K.x0,K.x1-.18,K.canopy,K.canopy+.18,K.z0,K.z1,0x2f5f4a);
  span(K.x1-.2,K.x1-.16,K.canopy-.02,K.canopy+.02,K.z0+.05,K.z1-.05,0xfffbee);
  // The two bays' dividers, so each pair of lines reads as its own section.
  for(const z of [-.27,1.11])span(K.x0+.04,K.x1-.3,L[0],K.canopy,z-.012,z+.012,0xcfd8da);}
 // The bun steamer on the counter (BUN_STEAMER): a steel base, glass all round, two racks.
 {const B=BUN_STEAMER,x0=B.x-B.w/2,x1=B.x+B.w/2,z0=B.z-B.d/2,z1=B.z+B.d/2,y0=B.top;
  span(x0,x1,y0,y0+.06,z0,z1,0xc9ced2);span(x0,x1,y0+B.h-.04,y0+B.h,z0,z1,0xd7263d);
  span(x1-.02,x1,y0+.06,y0+B.h-.04,z0,z1,0xc9ced2);
  for(const y of [1.02,1.215])span(x0+.02,x1-.02,y-.006,y,z0+.02,z1-.02,0xb8bec0);}
 // The copy machine by the east window, with the fax on its own little table beside it.
 {const M=COPY_MACHINE,x0=M.x-M.w/2,x1=M.x+M.w/2,z0=M.z-M.d/2,z1=M.z+M.d/2;
  span(x0,x1,0,.08,z0,z1,0x3a3e40);span(x0,x1,.08,.9,z0,z1,0xe9e6dc);span(x0+.02,x1-.02,.9,.96,z0+.02,z1-.02,0x5d6a70);
  span(x0+.08,x0+.34,.97,.99,z0+.06,z0+.2,0x2a6a3a);span(x0+.06,x1-.06,.5,.54,z0-.02,z0,0xb8bec0);
  span(x1+.05,x1+.45,0,.7,z0+.1,z1-.05,C.woodDark);span(x1+.1,x1+.4,.7,.82,z0+.15,z1-.12,0xe9e6dc);span(x1+.12,x1+.25,.82,.86,z0+.2,z0+.35,0x2b2e30);}
 // The delivery shelf by the restroom (x -6.19..-4.15, z -2.47..-1.86): bare steel.
 for(const y of [.088,.357,.670,.983,1.296])span(-6.17,-4.17,y-.02,y,-2.46,-1.87,C.steel);
 for(const x of [-6.15,-4.19])for(const z of [-2.45,-1.88])span(x-.02,x+.02,0,1.45,z-.02,z+.02,0x7d878a);
 // The medicine boards behind the till, over the cabinet, and the cupboard beside it.
 const M=MEDICINE_SHELF;
 span(M.back-.01,M.back+.03,.98,2.1,M.minZ-.08,M.maxZ+.08,C.woodDark);
 for(const y of M.levels)span(M.front-.02,M.back,y-.02,y,M.minZ-.08,M.maxZ+.08,C.wood);
 for(const z of [M.minZ-.08,M.maxZ+.08])span(M.front-.02,M.back+.03,.98,2.1,z-.02,z+.02,C.woodDark);
 span(M.front-.02,M.back+.03,2.08,2.12,M.minZ-.08,M.maxZ+.08,C.woodDark);
 span(6.24,6.73,0,.9,1.88,3.52,C.wainscot);span(6.22,6.73,.9,.94,1.88,3.52,C.woodDark);
 // The back-room rack: two steel units, four boards.
 const K=BACKROOM.rack;
 for(const [a,b] of K.units){
  for(const y of K.levels)span(a,b,y-.025,y,K.front,K.back,C.steel);
  for(const x of [a+.02,b-.02])for(const z of [K.front+.02,K.back-.02])span(x-.02,x+.02,0,2.25,z-.02,z+.02,0x6f7a7c);
 }
 // The ice-cream chest by the window (x 2.97..4.32, z 3.31..3.88): white, a sliding glass lid.
 span(2.99,4.3,0,.84,3.0,3.54,0xf4f6f2);span(2.99,4.3,.84,.88,3.0,3.54,0x3a7fc0);
 // The magazine rack's plinth so it does not float on the terrazzo.
 const R=MAGAZINE_RACK;span(R.x-R.width/2,R.x+R.width/2,0,.06,R.z-R.depth/2,R.z+R.depth/2,C.plinth);
 return mesh(material());
}

/**
 * The counter, the way a 1990s konbini till reads: a long run of warm wood-veneer bays
 * framed in dark rails, a pale laminate top with a dark edge band, and a black kick
 * plinth set back underneath. Top at 1.0 m; the customer stands at x < 4.54.
 */
export const SAKURA_COUNTER=Object.freeze({x0:4.54,x1:5.06,z0:.08,z1:3.86,top:1.0,bay:.62});
function buildCounter(){
 const {span,mesh}=parts('sakura-counter');
 const {x0,x1,z0,z1,top,bay}=SAKURA_COUNTER,rail=0x33200f,veneer=0x7e5634,laminate=0xe6dccb;
 span(x0+.06,x1,0,.12,z0,z1,0x2a2420);
 span(x0,x1,.12,top-.04,z0,z1,0x5e3e24);
 // The customer face: a rail along the foot and the head, a stile between every bay.
 span(x0-.02,x0,.12,.19,z0,z1,rail);span(x0-.02,x0,top-.13,top-.04,z0,z1,rail);
 const bays=Math.round((z1-z0)/bay),w=(z1-z0)/bays;
 for(let i=0;i<bays;i++){const a=z0+i*w;span(x0-.014,x0,.19,top-.13,a+.03,a+w-.03,veneer);}
 for(let i=0;i<=bays;i++){const a=z0+i*w;span(x0-.02,x0,.12,top-.04,a-.03,a+.03,rail);}
 // The laminate top, overhanging the customer side, with its dark edge band.
 span(x0-.06,x1+.03,top-.04,top,z0-.03,z1+.03,laminate);
 span(x0-.075,x0-.055,top-.055,top+.004,z0-.035,z1+.035,0x3a2818);
 // The flap at the north end, where Thuan comes through.
 span(x0,x1,top,top+.02,z0,z0+.06,C.woodDark);
 return mesh(material());
}

/** The tubes, on wooden battens: two runs down the shop, one in the back room and the office. */
function buildTubes(){
 const {span,mesh}=parts('sakura-light'),y=SAKURA_SHELL.ceiling-.2;
 const runs=[[-4.4,-3.2,3.2],[-1.2,-3.2,3.2],[2.4,-3.2,3.2],[5.6,.4,3.4],[-2.2,-6.4,-4.4],[2.2,-6.4,-4.4],[5.7,-3.6,-1.6]];
 for(const [x,z0,z1] of runs)for(let z=z0;z<z1-.4;z+=1.32)span(x-.03,x+.03,y-.03,y+.03,z,z+1.2,0xfffbee);
 // Two bare tubes under the till canopy, lighting the counter top.
 for(const x of [4.55,4.95])for(const z of [.3,1.8])span(x-.025,x+.025,2.12,2.17,z,z+1.6,0xfffbee);
 return mesh(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,emissive:0xfff3d6,emissiveIntensity:1}));
}
function buildBattens(){
 const {span,mesh}=parts('sakura-battens'),y=SAKURA_SHELL.ceiling-.13;
 for(const [x,z0,z1] of [[-4.4,-3.2,3.2],[-1.2,-3.2,3.2],[2.4,-3.2,3.2],[5.6,.4,3.4],[-2.2,-6.4,-4.4],[2.2,-6.4,-4.4],[5.7,-3.6,-1.6]])span(x-.07,x+.07,y-.04,y+.04,z0,z1-.4,C.wood);
 // Over the counter hangs the till canopy (sakura-cheer.js buildTillCanopy); its rods.
 for(const z of [.25,1.95,3.3])for(const x of [4.45,5.15])span(x-.012,x+.012,2.5,SAKURA_SHELL.ceiling,z-.012,z+.012,0x2b2b2b);
 return mesh(material());
}

function buildRestroomFittings(){
 const {span,cyl,mesh}=parts('sakura-toilet');
 // The toilet against the west wall, the basin and its mirror on the south wall.
 span(-6.8,-6.5,.35,.85,-3.5,-3.0,C.porcelain);span(-6.55,-6.0,.0,.38,-3.42,-3.08,C.porcelain);span(-6.55,-5.95,.38,.42,-3.47,-3.03,0xe8e4da);
 cyl(.04,.06,-6.65,.9,-3.25,0xc8ccd0,8);
 const R=RESTROOM;
 span(R.mirror.x-.22,R.mirror.x+.22,.78,.86,-3.92,-3.52,C.porcelain);span(R.mirror.x-.08,R.mirror.x+.08,0,.78,-3.9,-3.75,C.porcelain);
 return mesh(material());
}

function buildDoors(){
 const {span,mesh}=parts('sakura-door');
 // The passage to the back room: a frame and a swing door left open against the wall.
 const P=SAKURA_SHELL.partitionZ;
 for(const x of [3.25,4.39])span(x-.05,x+.05,0,2.22,P-.06,P+.06,C.woodDark);span(3.2,4.44,2.18,2.26,P-.06,P+.06,C.woodDark);
 span(4.4,4.44,0,2.12,P+.06,P+1.0,0xe9e1cf);
 // The office doorway: jambs, head and a casing on the shop side. Its door swings
 // (sakura-life.js buildOfficeDoor). The restroom door stands open into the restroom.
 for(const x of [5.12,6.30])span(x-.04,x+.04,0,2.2,-1.25,-1.09,C.woodDark);
 span(5.08,6.34,2.16,2.24,-1.25,-1.09,C.woodDark);
 for(const [x0,x1] of [[5.0,5.08],[6.34,6.42]])span(x0,x1,0,2.32,-1.13,-1.1,C.woodDark);
 span(5.0,6.42,2.24,2.32,-1.13,-1.1,C.woodDark);
 span(-4.9,-4.08,0,2.15,-2.82,-2.78,0xd8cdb4);
 return mesh(material());
}

function buildRegister(){
 const {span,mesh}=parts('sakura-register');
 const [x,y,z]=SAKURA_LAYOUT.register;
 span(x-.16,x+.16,1.0,1.12,z-.3,z+.08,0x3a3e40);span(x-.12,x+.12,1.12,1.2,z-.26,z+.04,0x2b2e30);
 span(x-.14,x-.02,1.2,1.38,z-.28,z-.04,0x3a3e40);
 return mesh(material());
}

/** Builds the whole interior as one group, ready to be cloned into the room. */
export function buildSakuraShell(){
 const page=typeof document!=='undefined'&&!!document.createElement;
 const root=new THREE.Group();root.name='Sakura shōten interior';
 root.add(buildShell(),buildFrontFrame(),...buildCeilingAndFloor(page),buildWallShelving(),buildCounter(),buildTubes(),buildBattens(),buildRestroomFittings(),buildDoors(),buildRegister(),buildEndcap(),buildFrontEndcaps());
 for(const id of ['east','middle','west'])root.add(...buildIsland(id));
 root.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});
 return root;
}
