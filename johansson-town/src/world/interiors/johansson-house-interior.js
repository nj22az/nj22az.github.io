import * as THREE from '../../../vendor/three.module.js';
import {createKit,paint} from '../okinawa/kit.js';
import {HOUSE_FLOORS,HOUSE_LEVELS,HOUSE_ROOMS,HOUSE_WALLS,HOUSE_DOOR_HEADS,HOUSE_DOORS,HOUSE_OPENINGS,HOUSE_SLABS,HOUSE_STAIR,HOUSE_SITE} from '../johansson-house.js';
import {createHouseWalk} from '../house-walk.js';

/**
 * Inside Johansson's house (johansson-house.js, from the creator's drawings): the basement, the ground floor and the
 * upper floor, every room the drawings name furnished for what it is for, the stair between them, and the mayor's
 * home life where it belongs in a house: the post through the front door, the low table and the television in the
 * living room, the futons upstairs, the bath, the bookshelf in the study.
 *
 * The room's frame: centred on the plan, the front door's face at +z (the door you came in by, as every room in the
 * town has it), y up from the ground floor. A drawn point (x, y, z) is (x − 6, z − 0.10, 5 − y). Each storey is its own
 * group, so the storeys over the one you stand on are put away and the camera never looks through a floor. The floors
 * are walked with house-walk.js; walls and furniture are the room's colliders at their storey's height.
 */
const G=HOUSE_FLOORS.G0.floor;
/** A drawn point in the room's frame. */
export const roomPoint=(x,y,z)=>[x-6,z-G,5-y];
/** Each storey's floor in the room's frame: B1 −2.8, G0 0, L1 2.8. */
export const HOUSE_STOREY_FLOOR=Object.freeze(Object.fromEntries(HOUSE_LEVELS.map(l=>[l,+(HOUSE_FLOORS[l].floor-G).toFixed(3)])));
/** The storey a pair of feet at height y is on. */
export const storeyAt=y=>y>=HOUSE_STOREY_FLOOR.L1-1?'L1':y>=HOUSE_STOREY_FLOOR.G0-1?'G0':'B1';

const C=Object.freeze({
 wall:0xf3eee2,ceiling:0xf6f3ea,slab:0xb9b4aa,timber:0xb8865a,timberDark:0x6b4a32,timberLight:0xd6b98e,tatami:0xcbc38c,tatamiEdge:0x3f4a3a,
 doma:0x8f8a80,tile:0xd5dfe0,tileDark:0x9fb0b4,concrete:0xb4b0a6,steel:0x8e979a,white:0xf4f5f2,frame:0x8a6a4a,sash:0xc3c8c9,
 fabric:[0xb2453b,0x2f4f6f,0xc9a64a,0x3f6a4a,0xe6c9b8,0x6f2f6f],book:[0x2f4f6f,0xc9a64a,0x6f2f2f,0x3f6a4a,0x8a6a4a,0x40505f],
});
const mats=new Map();
const mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.85,...o}));return mats.get(k);};
function canvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const room=id=>HOUSE_ROOMS.find(r=>r.id===id).bounds;

/**
 * Builds the house into `room` (game.js roomShell). `reg(object, label, fn, inside)` offers a prompt; `collider(x, z, w,
 * d, height, minY)` blocks; `sleep`, `television` and `post` are the mayor's home life (game.js).
 */
export function buildJohanssonHouse({room:parent,reg,action,collider=()=>{},sleep=null,television=null,post=null}){
 const home=new THREE.Group();home.name='Mayor’s home';parent.add(home);
 const storeys={};
 for(const level of HOUSE_LEVELS){const g=new THREE.Group();g.name='House '+level;home.add(g);storeys[level]=makeStorey(level,g,{reg,collider});}
 for(const level of HOUSE_LEVELS)shell(storeys[level]);
 stair(storeys);
 views(storeys);
 const life={reg,action,sleep,television,post};
 furnishGround(storeys.G0,life);furnishUpper(storeys.L1,life);furnishBasement(storeys.B1,life);
 for(const s of Object.values(storeys)){s.kit.finish(s.group,'Johansson house '+s.level);delete s.group.userData.walkLevels;delete s.group.userData.powerNetwork;}
 home.add(new THREE.HemisphereLight(0xf4f2ea,0x8a8478,.95));
 const walk=createHouseWalk(houseFloors());
 const refreshPost=storeys.G0.refreshPost||(()=>{});
 const [sx,,sz]=roomPoint(6.05,.75,0),[ex,,ez]=roomPoint(6.05,.24,0),doma=HOUSE_SITE.doma-G;
 let showing=null;
 /**
  * Put away what is more than one storey over him: the storey he stands on, those under it, and the one over it (seen
  * up the stair well) are drawn; on the basement the upper floor is not.
  */
 function show(y){
  const level=storeyAt(y),i=HOUSE_LEVELS.indexOf(level);if(level===showing)return;showing=level;
  HOUSE_LEVELS.forEach((l,k)=>{storeys[l].group.visible=k<=i+1;});
 }
 show(doma);
 return {
  bounds:{minX:-5.8,maxX:5.8,minZ:-4.8,maxZ:4.8},spawn:[sx,doma,sz],exit:[ex,doma+1.1,ez],exitFloor:doma,yaw:0,
  home:true,storeys:true,walk,refreshPost,
  /** Overhead surfaces start from the basement's ceiling, not the town's 1.9 m (render/indoor-camera.js). */
  ceilingsFrom:HOUSE_STOREY_FLOOR.B1+1.9,
  /** Which storeys to show for feet at (x, y, z) (game.js calls it as he moves). */
  follow(p){show(p.y);},
  showStorey(level){showing=null;const i=HOUSE_LEVELS.indexOf(level);HOUSE_LEVELS.forEach((l,k)=>{storeys[l].group.visible=k<=i;});showing=level+'#';},
  storeyGroups:Object.fromEntries(HOUSE_LEVELS.map(l=>[l,storeys[l].group])),
 };
}

/**
 * Where furniture may go in his home (build/home-decorate.js, Johansson Studio): the open floor of the living room and of
 * the kitchen and dining room on the ground floor, the room frame's y = 0. The house's own furniture is in the colliders;
 * these squares are kept free besides: the doorways, the four cushions and the television, the kitchen's working front,
 * the dining chairs and the china cupboard.
 */
export const JOHANSSON_HOUSE_FLOOR=(()=>{
 const rect=id=>{const [x0,y0,x1,y1]=room(id),[ax,,az]=roomPoint(x0,y1,0),[bx,,bz]=roomPoint(x1,y0,0);return [ax+.02,bx-.02,az+.02,bz-.02];};
 const open=[rect('g0-living'),rect('g0-kitchen')];
 const at=(x,y,size)=>{const [px,,pz]=roomPoint(x,y,0);return Object.freeze([+px.toFixed(3),+pz.toFixed(3),size]);};
 return Object.freeze({
  walkable:(x,z)=>open.some(([x0,x1,z0,z1])=>x>x0&&x<x1&&z>z0&&z<z1),
  keepClear:Object.freeze([
   at(4.45,4.5,.9),at(1.3,4.6,.9),at(1.3,5.45,.9),at(4.45,6.1,.9),                      // the doorways
   at(2.6,1.65,.55),at(2.6,3.35,.55),at(1.75,2.5,.55),at(3.45,2.5,.55),at(3.2,4.05,.8),  // the cushions, the television
   at(1.25,6.4,.8),at(1.25,7.7,.8),at(1.25,8.6,.8),at(1.3,9.45,.8),                      // the kitchen's front, the fridge
   at(2.1,8.05,.55),at(2.9,8.05,.55),at(1.55,8.75,.55),at(3.45,8.75,.55),at(4.0,7.85,.8),  // the chairs, the china cupboard
   at(.75,1.2,.7),                                                                       // the keepsake shelf
  ]),
 });
})();

// ---------------------------------------------------------------- a storey's tools

/** The kit, the group and the helpers one storey is built with, in drawn metres over its floor. */
function makeStorey(level,group,{reg,collider}){
 const kit=createKit(),F=HOUSE_FLOORS[level].floor,y0=F-G;
 /** A drawn point `h` over this floor, in the room's frame. */
 const at=(x,y,h=0)=>roomPoint(x,y,F+h);
 const s={level,group,kit,F,y0,at};
 /** A block between drawn corners, heights over this floor. */
 s.blk=(x0,y0_,h0,x1,y1,h1,hex,finish='matte')=>{const [ax,ay,az]=at(x0,y1,h0),[bx,by,bz]=at(x1,y0_,h1);kit.block(ax,bx,ay,by,az,bz,hex,finish);};
 /** A box centred at drawn (x, y), its centre `h` over the floor: w along x, d along y. */
 s.box=(w,d,hh,x,y,h,hex,o={})=>{const [px,py,pz]=at(x,y,h);kit.box(w,hh,d,px,py,pz,hex,o);};
 s.cyl=(r0,r1,hh,x,y,h,hex,o={})=>{const [px,py,pz]=at(x,y,h);kit.cyl(r0,r1,hh,px,py,pz,hex,o);};
 s.rod=(a,b,r,hex,o={})=>kit.rod(at(...a),at(...b),r,hex,o);
 s.sphere=(r,x,y,h,hex,o={})=>{const [px,py,pz]=at(x,y,h);kit.sphere(r,px,py,pz,hex,o);};
 /** A collider over drawn x0..x1, y0..y1, from h0 to h1 over this floor. */
 s.solid=(x0,y0_,x1,y1,h0=0,h1=2.4)=>{const [ax,,az]=at(x0,y1,0),[bx,,bz]=at(x1,y0_,0);collider((ax+bx)/2,(az+bz)/2,Math.abs(bx-ax),Math.abs(bz-az),h1-h0,y0+h0);};
 /** A mesh of its own (one the game finds by name: the quilt, a cushion, the letter box), in this storey's group. */
 s.mesh=(w,d,hh,x,y,h,hex,name,o={})=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),o.material||mat(hex,o.mat));m.position.set(...at(x,y,h));if(o.ry)m.rotation.y=o.ry;m.name=name;m.receiveShadow=true;group.add(m);return m;};
 /** A prompt at drawn (x, y), `h` over this floor: only offered on this storey. */
 s.anchor=(x,y,h,label,fn)=>{const o=new THREE.Object3D();o.position.set(...at(x,y,h));o.userData.npcInteraction=false;o.userData.sameLevel=true;group.add(o);reg(o,label,fn,true);return o;};
 /** A lamp at the ceiling: a fitting that glows and the light from it. */
 s.lamp=(x,y,{h=null,power=.7,range=7,kind='round'}={})=>{
  const top=(h??HOUSE_FLOORS[level].soffit-F);
  if(kind==='tube'){s.box(1.2,.2,.05,x,y,top-.03,0xdedfd6);const t=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.1,6),new THREE.MeshBasicMaterial({color:0xf6fbf4}));t.rotation.z=Math.PI/2;t.position.set(...at(x,y,top-.08));t.name='Ceiling tube';group.add(t);}
  else{const m=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,.08,16),new THREE.MeshBasicMaterial({color:0xfff6e2}));m.position.set(...at(x,y,top-.05));m.name='Ceiling lamp';group.add(m);}
  if(power>0){const l=new THREE.PointLight(0xfff2dc,power,range,2);l.position.set(...at(x,y,top-.3));group.add(l);}
 };
 return s;
}
/**
 * Open shelving against a wall, running along x: a back, two ends and a board at each height, so what stands on it
 * shows. `x0..x1` its length, `y0..y1` its depth, `back` the side it backs onto ('y0' or 'y1').
 */
function shelves(s,x0,x1,y0,y1,boards,hex,back){
 const top=boards.at(-1)+.03,b=back==='y1'?[y1-.02,y1]:[y0,y0+.02];
 s.blk(x0,b[0],0,x1,b[1],top,hex);
 for(const x of [x0,x1-.03])s.blk(x,y0,0,x+.03,y1,top,hex);
 for(const h of boards)s.blk(x0,y0,h,x1,y1,h+.03,hex);
}
/** Is drawn (x, y) inside a room's bounds (with a margin)? */
const inRoom=(id,x,y,m=0)=>{const b=room(id);return x>b[0]+m&&x<b[2]-m&&y>b[1]+m&&y<b[3]-m;};

// ---------------------------------------------------------------- the shell: floors, walls, ceilings

/**
 * The rooms whose lamp throws a light (the others' fittings glow, and the house's sky light does the rest): no more
 * than five are ever shown at once, inside the town's light budget (render/light-budget.js, eight).
 */
const LIT_ROOMS=Object.freeze(['b1-workshop','b1-club','g0-living','g0-kitchen','g0-sewing','l1-bedroom']);
/** What each room's floor is finished in. */
const FLOOR_FINISH={
 'b1-workshop':C.concrete,'b1-club':0x8a5a3c,'b1-cellar':C.concrete,'b1-hall':C.timber,'b1-boiler':C.concrete,'b1-sauna':C.tileDark,'b1-storage':C.concrete,
 'g0-living':'tatami','g0-kitchen':C.timberLight,'g0-genkan':C.timber,'g0-hall':C.timber,'g0-sewing':C.timberLight,'g0-wc':C.tile,'g0-terrace':0xc9c0ae,
 'l1-bedroom':'tatami','l1-guest':'tatami','l1-boxroom':C.timber,'l1-hall':C.timber,'l1-bathroom':C.tile,'l1-study':C.timber,'l1-linen':C.timber,
};
function shell(s){
 const L=s.level,k=s.kit;
 // The slab under this floor, and the finish laid on it room by room (the genkan's doma a step down).
 for(const sl of HOUSE_SLABS.filter(q=>q.level===L))s.blk(sl.min[0],sl.min[1],sl.min[2]-s.F,sl.max[0],sl.max[1],sl.max[2]-s.F-.012,C.slab);
 for(const r of HOUSE_ROOMS.filter(q=>q.level===L&&!q.id.endsWith('-stair'))){
  const [x0,y0,x1,y1]=r.bounds,f=FLOOR_FINISH[r.id];
  if(r.id==='g0-genkan'){
   const D=HOUSE_SITE.domaTo,dh=HOUSE_SITE.doma-s.F;
   s.blk(x0,y0,dh-.012,x1,D,dh,C.doma);
   // The step up from the doma (agari-kamachi): a dark timber edge the width of the genkan.
   s.blk(x0,D,dh,x1,D+.09,0,C.timberDark);
   s.blk(x0,D+.09,-.012,x1,y1,0,C.timber);
   continue;
  }
  if(f==='tatami'){
   s.blk(x0,y0,-.012,x1,y1,0,C.tatami);
   // Mats of about 1.82 × 0.91 with their cloth borders.
   for(let x=x0+1.82;x<x1-.3;x+=1.82)s.blk(x-.02,y0,0,x+.02,y1,.004,C.tatamiEdge);
   for(let y=y0+.91;y<y1-.3;y+=.91)s.blk(x0,y-.02,0,x1,y+.02,.004,C.tatamiEdge);
  }else s.blk(x0,y0,-.012,x1,y1,0,f);
 }
 // The floor through each doorway, over the partition's foot.
 for(const d of HOUSE_DOORS.filter(q=>q.level===L&&!q.open)){
  const t=.07;if(d.along==='x')s.blk(d.from,d.at-t,-.012,d.to,d.at+t,0,C.timber);else s.blk(d.at-t,d.from,-.012,d.at+t,d.to,0,C.timber);
 }
 // The walls as drawn (F7: each runs to the slab over it), the heads over the doorways (F8), and a frame round each
 // doorway: two jambs and the head's lining.
 for(const w of [...HOUSE_WALLS.filter(q=>q.level===L),...HOUSE_DOOR_HEADS.filter(q=>q.level===L)]){
  s.blk(w.min[0],w.min[1],w.min[2]-s.F,w.max[0],w.max[1],w.max[2]-s.F,C.wall);
  if(w.max[2]-s.F>.05&&w.min[2]-s.F<2.2)s.solid(w.min[0],w.min[1],w.max[0],w.max[1],Math.max(0,w.min[2]-s.F),w.max[2]-s.F);
 }
 // Where the stair well cuts the slab over this storey, the walls round it carry on through the slab's depth to the
 // floor over it: the outside wall along the well's north side and the partitions along its sides.
 {const over=L==='B1'?'G0':L==='G0'?'L1':null;
  if(over){const [x0,y0,x1,y1]=HOUSE_STAIR.shaft,z0=HOUSE_FLOORS[L].soffit-s.F,z1=HOUSE_FLOORS[over].floor-s.F;
   for(const [a,b,c,d] of [[x0,y1,x1,10],[x0-.12,y0,x0,y1],[x1,y0,x1+.12,y1]])s.blk(a,b,z0-.01,c,d,z1,C.wall);}}
 for(const d of HOUSE_DOORS.filter(q=>q.level===L&&!q.open)){
  const t=.075;
  for(const e of [d.from,d.to]){if(d.along==='x')s.blk(e-.035,d.at-t,0,e+.035,d.at+t,2,C.frame);else s.blk(d.at-t,e-.035,0,d.at+t,e+.035,2,C.frame);}
  if(d.along==='x')s.blk(d.from,d.at-t,1.96,d.to,d.at+t,2.03,C.frame);else s.blk(d.at-t,d.from,1.96,d.at+t,d.to,2.03,C.frame);
 }
 // The skirting along every outside wall's foot, inside.
 const top=HOUSE_FLOORS[L].soffit-s.F;
 // The ceiling: the soffit of the slab over this storey (the stair well open in it where there is one).
 // It is a group of its own, standing at the ceiling's height, so a view from above (Johansson Studio's furniture tool,
 // build/home-decorate.js) can lift it off as it lifts off every room's ceiling.
 const over=L==='B1'?'G0':L==='G0'?'L1':null,ceiling=createKit(),[,cy]=s.at(0,0,top);
 const cblk=(x0,y0,x1,y1)=>{const [ax,,az]=s.at(x0,y1,0),[bx,,bz]=s.at(x1,y0,0);ceiling.block(ax,bx,-.002,.01,az,bz,C.ceiling);};
 if(over)for(const sl of HOUSE_SLABS.filter(q=>q.level===over))cblk(sl.min[0],sl.min[1],sl.max[0],sl.max[1]);
 else cblk(.2,.2,11.8,9.8);
 const lid=new THREE.Group();lid.name='Ceiling '+L;lid.position.y=cy;s.group.add(lid);ceiling.finish(lid,'Johansson house ceiling '+L);delete lid.userData.walkLevels;delete lid.userData.powerNetwork;
 // The threshold of each outside door, across the wall's thickness: the doma's stone at the front door.
 for(const o of HOUSE_OPENINGS.filter(q=>q.level===L&&q.type==='door')){
  const at=(o.id==='D-ENTRY'?HOUSE_SITE.doma:o.sill)-s.F,[y0,y1]=o.side==='south'?[0,.2]:[9.8,10];
  s.blk(o.from,y0,at-.1,o.to,y1,at,o.id==='D-ENTRY'?C.doma:C.concrete);
 }
 // Each opening's inside: the sill board under a window, the sash's inside frame and the glass.
 for(const o of HOUSE_OPENINGS.filter(q=>q.level===L))openingInside(s,o);
 // The lamps: one in each room (a tube in the working rooms), and the light from the larger ones.
 for(const r of HOUSE_ROOMS.filter(q=>q.level===L&&!q.id.endsWith('-stair'))){
  const [x0,y0,x1,y1]=r.bounds,lit=LIT_ROOMS.includes(r.id),working=/workshop|boiler|storage|cellar|sewing|wc|linen|boxroom/.test(r.id);
  s.lamp((x0+x1)/2,(y0+y1)/2,{kind:working?'tube':'round',power:lit?.75:0,range:7.5});
 }
}

/** The window's sill board and inside frame, the glass, and the front, terrace and basement doors from inside. */
function openingInside(s,o){
 const k=s.kit,face=o.side==='south'?.2:o.side==='north'?9.8:o.side==='west'?.2:11.8,inward=o.side==='south'||o.side==='west'?1:-1;
 const alongX=o.side==='south'||o.side==='north',sill=o.sill-s.F,head=o.head-s.F,mid=(o.from+o.to)/2,w=o.to-o.from;
 const put=(along,across,h,ww,dd,hh,hex,finish)=>{const x=alongX?along:across,y=alongX?across:along;s.box(alongX?ww:dd,alongX?dd:ww,hh,x,y,h,hex,{finish});};
 if(o.type==='window'){
  put(mid,face+inward*.06,sill-.02,w+.1,.14,.04,C.timberLight);
  for(const e of [o.from+.02,o.to-.02])put(e,face-inward*.05,(sill+head)/2,.04,.06,head-sill,C.sash);
  for(const h of [sill+.02,head-.02])put(mid,face-inward*.05,h,w,.06,.04,C.sash);
  put(mid,face-inward*.05,(sill+head)/2,.04,.07,head-sill,C.sash);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(w-.06,head-sill-.06),new THREE.MeshStandardMaterial({color:0xd8eef3,transparent:true,opacity:.16,roughness:.05,depthWrite:false,side:THREE.DoubleSide}));
  glass.position.set(...s.at(alongX?mid:face-inward*.07,alongX?face-inward*.07:mid,(sill+head)/2));glass.rotation.y=alongX?0:Math.PI/2;glass.name='Window glass';glass.userData.clearWindow=true;s.group.add(glass);
  return;
 }
 if(o.id==='D-ENTRY'){
  // The front door from inside: the leaf, the lever and the latch, and the letter box under its slot (the post).
  const sillD=HOUSE_SITE.doma-s.F,y=.12;
  s.box(w-.02,.05,o.head-HOUSE_SITE.doma-.02,mid,y-.02,(sillD+head)/2,0x6a4c36,{finish:'gloss'});
  for(const e of [o.from,o.to])s.box(.06,.12,head-sillD,e,face-.02,(sillD+head)/2,C.frame);
  s.box(o.to-o.from,.12,.06,mid,face-.02,head,C.frame);
  s.box(.12,.03,.03,o.to-.16,y+.02,sillD+1,0xc9cdd0,{finish:'metal'});s.box(.04,.04,.1,o.to-.16,y+.02,sillD+1.25,0xc9cdd0,{finish:'metal'});
  s.box(.3,.03,.05,mid,y+.01,sillD+1.05,0xb8913f,{finish:'metal'});
  return;
 }
 if(o.id==='D-TERRACE'){
  for(const e of [o.from+.03,o.to-.03])put(e,face-inward*.05,(sill+head)/2,.06,.07,head-sill,C.sash);
  put(mid,face-inward*.05,head-.03,w,.07,.06,C.sash);put(mid,face-inward*.05,sill+.25,w-.12,.05,.5,C.sash);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(w-.12,head-sill-.6),new THREE.MeshStandardMaterial({color:0xd8eef3,transparent:true,opacity:.16,roughness:.05,depthWrite:false,side:THREE.DoubleSide}));
  glass.position.set(...s.at(mid,face-inward*.05,(sill+.5+head)/2));glass.name='Terrace door glass';glass.userData.clearWindow=true;s.group.add(glass);
  return;
 }
 // D-BEXT: the steel door to the stair house's steps up to the garden (F9), shut, in its frame.
 put(mid,face-.08,(sill+head)/2,w,.05,head-sill,C.steel,'metal');
 for(const e of [o.from+.02,o.to-.02])put(e,face-.02,(sill+head)/2,.06,.12,head-sill,C.frame);put(mid,face-.02,head-.02,w,.12,.06,C.frame);
 put(o.to-.15,face+.08,1,.12,.04,.03,0xc9cdd0,'metal');
}

// ---------------------------------------------------------------- what the windows look out on

/**
 * The town is put away while you are indoors, so each window looks out on a painting of what is outside it: the yard
 * and the hinpun to the front, the terrace and the fukugi behind, the sea past the windbreak on the sea side, the
 * jungle hill on the other, and the window well's concrete under its cover from the basement.
 */
function views(storeys){
 const sky=(g,w,h,horizon)=>{const s=g.createLinearGradient(0,0,0,h*horizon);s.addColorStop(0,'#5d9fd8');s.addColorStop(1,'#cfe6f2');g.fillStyle=s;g.fillRect(0,0,w,h*horizon);};
 const clouds=(g,w,h)=>{g.fillStyle='rgba(255,255,255,.85)';for(const [x,y,r] of [[.2,.12,.07],[.26,.1,.05],[.7,.18,.08],[.78,.16,.05]]){g.beginPath();g.ellipse(x*w,y*h,r*w,r*h*.45,0,0,7);g.fill();}};
 const fukugi=(g,x,base,hgt,w)=>{g.fillStyle='#5a4130';g.fillRect(x-w*.04,base-hgt*.35,w*.08,hgt*.35);g.fillStyle='#2f5d35';g.beginPath();g.ellipse(x,base-hgt*.62,w*.42,hgt*.42,0,0,7);g.fill();g.fillStyle='#3f7440';g.beginPath();g.ellipse(x-w*.1,base-hgt*.7,w*.22,hgt*.22,0,0,7);g.fill();};
 const wall=(g,w,h,top,colour='#e9e0cc')=>{g.fillStyle=colour;g.fillRect(0,h*top,w,h*.07);g.fillStyle='rgba(0,0,0,.08)';for(let x=0;x<w;x+=w/9)g.fillRect(x,h*top,2,h*.07);};
 const PAINT={
  south:(g,w,h)=>{sky(g,w,h,.62);clouds(g,w,h);g.fillStyle='#e6dcc3';g.fillRect(0,h*.62,w,h*.38);g.fillStyle='#d9cdb0';g.fillRect(w*.08,h*.5,w*.22,h*.12);g.fillStyle='#b8574a';g.beginPath();g.moveTo(w*.05,h*.5);g.lineTo(w*.19,h*.42);g.lineTo(w*.33,h*.5);g.fill();wall(g,w,h,.58);g.fillStyle='#d8cfb3';g.fillRect(w*.42,h*.52,w*.16,h*.14);g.fillStyle='#2f5d35';g.beginPath();g.ellipse(w*.5,h*.5,w*.08,h*.05,0,0,7);g.fill();fukugi(g,w*.85,h*.62,h*.45,w*.16);},
  north:(g,w,h)=>{sky(g,w,h,.6);clouds(g,w,h);g.fillStyle='#2f9fc0';g.fillRect(0,h*.52,w,h*.08);g.fillStyle='#e6dcc3';g.fillRect(0,h*.6,w,h*.4);g.fillStyle='#d9d1bf';g.fillRect(0,h*.78,w,h*.22);wall(g,w,h,.6);for(const x of [.12,.34,.56,.78])fukugi(g,w*x,h*.62,h*.5,w*.2);},
  east:(g,w,h)=>{sky(g,w,h,.5);clouds(g,w,h);g.fillStyle='#1f7fb4';g.fillRect(0,h*.5,w,h*.08);g.fillStyle='#3fc1c9';g.fillRect(0,h*.58,w,h*.08);g.fillStyle='#efe6d2';g.fillRect(0,h*.66,w,h*.34);wall(g,w,h,.68);for(const x of [.08,.44,.9])fukugi(g,w*x,h*.7,h*.5,w*.14);},
  west:(g,w,h)=>{sky(g,w,h,.55);clouds(g,w,h);g.fillStyle='#4f8a4c';g.beginPath();g.moveTo(0,h*.55);g.quadraticCurveTo(w*.5,h*.18,w,h*.5);g.lineTo(w,h);g.lineTo(0,h);g.fill();g.fillStyle='#3f7440';for(let i=0;i<14;i++){g.beginPath();g.ellipse(w*(i/13),h*(.42+.08*Math.sin(i*1.7)),w*.07,h*.07,0,0,7);g.fill();}g.fillStyle='#e6dcc3';g.fillRect(0,h*.7,w,h*.3);wall(g,w,h,.66);},
  well:(g,w,h)=>{g.fillStyle='#a7a398';g.fillRect(0,0,w,h);g.fillStyle='#c9d6d6';g.fillRect(0,0,w,h*.12);g.fillStyle='rgba(0,0,0,.08)';for(let y=h*.2;y<h;y+=h*.18)g.fillRect(0,y,w,3);g.fillStyle='#8a8578';g.fillRect(0,h*.9,w,h*.1);},
 };
 const tex={};
 for(const o of HOUSE_OPENINGS.filter(q=>q.type==='window'||q.id==='D-TERRACE')){
  const s=storeys[o.level],kind=o.id==='W-B1'?'well':o.side,map=tex[kind]??=canvas(512,384,PAINT[kind]);
  const alongX=o.side==='south'||o.side==='north',out=o.side==='south'||o.side==='west'?-1:1,face=o.side==='south'?0:o.side==='north'?10:o.side==='west'?0:12;
  const dist=kind==='well'?.85:2.2,w=(o.to-o.from)+dist*1.6,h=(o.head-o.sill)+dist*1.2,mid=(o.from+o.to)/2,hc=(o.sill+o.head)/2-s.F+(kind==='well'?0:.15);
  const card=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,fog:false,side:THREE.DoubleSide}));
  card.position.set(...s.at(alongX?mid:face+out*dist,alongX?face+out*dist:mid,hc));
  // The painting faces back in at the window.
  card.rotation.y=o.side==='south'?Math.PI:o.side==='north'?0:o.side==='west'?Math.PI/2:-Math.PI/2;
  card.name='View from '+o.id;card.userData.clearWindow=true;s.group.add(card);
 }
}

// ---------------------------------------------------------------- the stair (finding F1)

function stair(storeys){
 const S=HOUSE_STAIR,[sx0,sy0,sx1,sy1]=S.shaft,[spineA,spineB]=S.spine;
 for(const f of S.flights){
  const s=storeys[f.from],F=f.base,h=z=>z-F;
  // The treads with their nosings, the risers under them, and the soffit under the flight.
  const risers=[];
  for(const t of f.treads){
   s.blk(t.x[0],t.y[0],h(t.z)-.035,t.x[1],t.y[1],h(t.z),C.timber);
   const front=t.x[0]<spineA?t.y[0]:t.y[1];
   s.blk(t.x[0],Math.min(front,front+(t.x[0]<spineA?.02:-.02)),h(t.z)-S.riser,t.x[1],Math.max(front,front+(t.x[0]<spineA?.02:-.02)),h(t.z)-.035,C.white);
   risers.push(t);
  }
  const L=f.landing;s.blk(L.x[0],L.y[0],h(L.z)-.2,L.x[1],L.y[1],h(L.z),C.timber);
  // The last riser of the west flight up onto the landing, and of the east flight up onto the next floor.
  s.blk(sx0,L.y[0]-.02,h(L.z)-S.riser,spineA,L.y[0],h(L.z)-.035,C.white);
  s.blk(spineB,sy0,S.rise-S.riser,sx1,sy0+.02,S.rise-.035,C.white);
  // Soffits: a sloping board under each flight (seen from the flight below and down the well).
  for(const [x0,x1,yLow,yHigh,zLow,zHigh] of [[sx0,spineA,sy0,L.y[0],0,L.z-F],[spineB,sx1,L.y[0],sy0,L.z-F,S.rise]]){
   const [a,b]=[s.at((x0+x1)/2,yLow,zLow-.2),s.at((x0+x1)/2,yHigh,zHigh-.2)],len=Math.hypot(b[1]-a[1],b[2]-a[2]);
   // A board along its slope: turned about x so its length runs from a to b.
   s.kit.box(x1-x0,.04,len,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,C.ceiling,{rx:Math.atan2(-(b[1]-a[1]),b[2]-a[2])});
  }
  // The handrails on the walls, 0.85 m over the nosings, on brackets.
  for(const [x,yA,yB,zA,zB] of [[sx0+.06,sy0,L.y[0],0,L.z-F],[sx1-.06,L.y[0],sy0,L.z-F,S.rise]]){
   s.rod([x,yA,zA+.85],[x,yB,zB+.85],.025,C.timberDark);
   for(const t of [.15,.5,.85]){const y=yA+(yB-yA)*t,z=zA+(zB-zA)*t;s.rod([x+(x<6?-.05:.05),y,z+.85],[x,y,z+.85],.012,C.steel);}
  }
 }
 // The spine wall between the flights, from the basement floor to the upper floor's ceiling, the length of the flights.
 for(const L of HOUSE_LEVELS){const s=storeys[L],top=HOUSE_FLOORS[L].soffit-s.F+(L==='L1'?0:.28);s.blk(spineA,sy0,0,spineB,S.flights[0].landing.y[0],top,C.wall);s.solid(spineA,sy0,spineB,S.flights[0].landing.y[0],0,top);}
 // In the basement the space under the flight down is the cupboard under the stair, shut by a panel with its door.
 {const s=storeys.B1;s.blk(spineB,sy0,0,sx1,sy0+.04,2.55,C.wall);s.solid(spineB,sy0-.02,sx1,sy0+.06,0,2.55);
  s.blk(spineB+.25,sy0-.01,.05,sx1-.25,sy0,1.25,C.timberLight);s.box(.04,.02,.04,sx1-.35,sy0-.02,.7,C.timberDark);
  s.cupboard=[(spineB+sx1)/2,sy0-.3];}
 // On the upper floor the well is guarded where the flight from below rises under it: a balustrade along the west half.
 {const s=storeys.L1,y=sy0+.03;s.blk(sx0,y-.03,1.04,spineA,y+.03,1.1,C.timberDark);for(let x=sx0+.1;x<spineA;x+=.12)s.blk(x-.012,y-.012,0,x+.012,y+.012,1.04,C.timberDark);s.solid(sx0,y-.05,spineA,y+.05,0,1.1);}
 // A pendant down the well.
 storeys.L1.lamp((sx0+sx1)/2,(sy0+sy1)/2+.6,{power:.6,range:7});
}

/** The floors the house is walked on, in the room's frame (house-walk.js): rooms, doorways, the doma, the stair. */
export function houseFloors(){
 const out=[],rect=(id,x0,y0,x1,y1,z)=>{const [ax,,az]=roomPoint(x0,y1,0),[bx,,bz]=roomPoint(x1,y0,0);out.push({id,x:[ax,bx],z:[az,bz],y:+(z-G).toFixed(4)});};
 for(const r of HOUSE_ROOMS){
  if(r.id.endsWith('-stair'))continue;
  const [x0,y0,x1,y1]=r.bounds,F=HOUSE_FLOORS[r.level].floor;
  if(r.id==='g0-genkan'){rect('g0-doma',x0,y0,x1,HOUSE_SITE.domaTo,HOUSE_SITE.doma);rect('g0-genkan',x0,HOUSE_SITE.domaTo,x1,y1,F);continue;}
  rect(r.id,x0,y0,x1,y1,F);
 }
 for(const d of HOUSE_DOORS.filter(q=>!q.open)){const F=HOUSE_FLOORS[d.level].floor,t=.07;if(d.along==='x')rect(d.id,d.from,d.at-t,d.to,d.at+t,F);else rect(d.id,d.at-t,d.from,d.at+t,d.to,F);}
 // The front door's threshold, at the doma's level.
 const fd=HOUSE_OPENINGS.find(o=>o.id==='D-ENTRY');rect('front-door',fd.from,0,fd.to,.2,HOUSE_SITE.doma);
 const S=HOUSE_STAIR,[sx0,sy0,sx1]=S.shaft;
 for(const f of S.flights){
  const L=f.landing,F=f.base;
  // Up the west half from the hall to the landing, up the east half from the landing to the next floor's hall:
  // slopes through the nosings, so feet go up evenly.
  const [ax,,az]=roomPoint(sx0,L.y[0],0),[bx,,bz]=roomPoint(S.spine[0],sy0,0);
  out.push({id:f.from+'-flight-up',x:[ax,bx],z:[az,bz],y:[+(L.z-G).toFixed(4),+(F-G).toFixed(4)]});
  rect(f.from+'-landing',L.x[0],L.y[0],L.x[1],L.y[1],L.z);
  const [cx,,cz]=roomPoint(S.spine[1],L.y[0],0),[dx,,dz]=roomPoint(sx1,sy0,0);
  out.push({id:f.from+'-flight-on',x:[cx,dx],z:[cz,dz],y:[+(L.z-G).toFixed(4),+(F+S.rise-G).toFixed(4)]});
 }
 return out;
}

// ---------------------------------------------------------------- the ground floor

function furnishGround(s,{reg,action,television,post}){
 const say=(title,text)=>()=>action('inspect',title,text);
 // The genkan: the shoe cupboard along the doma, the umbrella stand, slippers on the step, the coat hooks.
 {const [x0,y0,x1]=room('g0-genkan'),D=HOUSE_SITE.domaTo,dh=HOUSE_SITE.doma-s.F;
  s.blk(x1-.4,y0+.05,dh,x1,D-.05,dh+.95,C.timberLight);s.blk(x1-.42,y0+.05,dh+.95,x1,D-.05,dh+.98,C.timberDark);s.solid(x1-.42,y0,x1,D,dh,dh+1);
  s.cyl(.06,.06,.3,x1-.2,.6,dh+1.13,0x3f6a4a);s.sphere(.09,x1-.2,.6,dh+1.32,0xd9303b);
  s.cyl(.12,.11,.5,x0+.2,y0+.25,dh+.25,0x5d6b70,{segments:10});s.rod([x0+.18,y0+.25,dh+.1],[x0+.22,y0+.27,dh+.85],.015,0x2b2b2b);
  for(const [x,c] of [[5.6,0x2f4f6f],[5.85,0x2f4f6f],[6.3,0xb2453b],[6.55,0xb2453b]])s.box(.1,.26,.04,x,D+.25,.02,c);
  for(const y of [2.2,2.55,2.9])s.box(.06,.06,.06,x0+.03,y,1.7,C.timberDark);
  s.box(.03,.4,.3,x0+.03,2.55,1.35,0xc9a64a);
  s.anchor(x1-.3,.8,1.1,'Look in the shoe cupboard',say('Shoe cupboard','His black shoes for assembly days, Thuan’s sandals, two pairs of gumboots for the typhoon, and the shoehorn from the Stockholm ferry.'));
  // The letter box on the inside of the front door, under the slot (src/mail/post.js): when something unread is in it,
  // the tops of the envelopes show over its lip, and that is the only signal.
  const fd=HOUSE_OPENINGS.find(o=>o.id==='D-ENTRY'),lx=(fd.from+fd.to)/2,ly=.2,lh=dh+.85;
  s.mesh(.34,.012,.26,lx,ly-.054,lh,0xd9d4c3,'Letter box back');
  for(const sx of [-1,1])s.mesh(.012,.12,.26,lx+sx*.164,ly,lh,0xd9d4c3,'Letter box side');
  s.mesh(.34,.12,.012,lx,ly,lh-.124,0xd9d4c3,'Letter box floor');
  s.mesh(.34,.012,.2,lx,ly+.054,lh-.03,0xd9d4c3,'Letter box front');
  s.mesh(.35,.022,.02,lx,ly+.056,lh+.075,0xbfb9a8,'Letter box lip');
  const envelopes=[[-.06,.02,0xf6f2e6],[.05,-.01,0xe9dcc3]].map(([dx,tilt,c])=>{const e=s.mesh(.17,.008,.12,lx+dx,ly-.01,lh+.06,c,'Envelope in the letter box');e.rotation.z=tilt;e.visible=false;return e;});
  s.refreshPost=()=>{const n=post?.unread?.()||0;envelopes.forEach((e,i)=>{e.visible=n>i;});};s.refreshPost();
  s.anchor(lx,.75,1.05,'Check the post',()=>{post?.open?.();s.refreshPost();});}
 // The hall: the distribution board between the living room's and the kitchen's doors, the telephone opposite.
 {const [x0,,x1]=room('g0-hall');
  s.box(.1,.42,.5,x0+.05,5.3,1.75,0xe9e7df);s.box(.11,.36,.06,x0+.06,5.3,1.98,0x8e979a);
  s.anchor(x0+.4,5.3,1.6,'Look at the distribution board',say('Distribution board','The house’s board, labelled in his hand: the supply breaker, 40 A, then the earth-leakage breaker, then twelve circuits, from the kitchen’s to the sauna’s heater. A spare fuse is taped inside the door. He keeps the board as he kept the ship’s: every circuit named, nothing added without a line in the book.'));
  s.box(.32,.45,.03,x1-.16,5.3,.8,C.timberDark);s.box(.22,.18,.08,x1-.16,5.3,.86,0x1f1f1f);
  s.anchor(x1-.5,5.3,1.1,'Look at the telephone',say('Telephone','The black telephone. Taped to the shelf: the town hall, the ferry office, Sakura Shōten, and the clinic.'));}
 // The living room: the low table and its four cushions, the television, the photograph, the keepsake shelf (Studio).
 {const [x0,y0,x1,y1]=room('g0-living'),tx=2.6,ty=2.5;
  s.box(1.1,.75,.05,tx,ty,.335,C.timberDark);for(const [dx,dy] of [[-.5,-.32],[.5,-.32],[-.5,.32],[.5,.32]])s.box(.05,.05,.32,tx+dx,ty+dy,.16,0x5a3f2a);
  s.solid(tx-.55,ty-.38,tx+.55,ty+.38,0,.42);
  s.box(.35,.35,.08,tx-.15,ty+.05,.4,0xf2efe6);s.cyl(.04,.035,.1,tx+.05,ty-.1,.41,0x3f7a55);
  const seats=[[tx,ty-.85,0],[tx,ty+.85,Math.PI],[tx-.85,ty,-Math.PI/2],[tx+.85,ty,Math.PI/2]];
  for(const [x,y] of seats)s.mesh(.5,.5,.08,x,y,.04,0xb2453b,'Zabuton');
  const [cx,,cz]=s.at(tx,ty,0);
  for(const [x,y] of seats){
   // The cushion's seat, facing the table: in the room's frame he looks along (−sin yaw, −cos yaw), and stands up
   // behind the cushion, away from the table.
   const [px,,pz]=s.at(x,y,0),yaw=Math.atan2(px-cx,pz-cz);
   const o=s.anchor(x,y,.8,'Sit at the low table',()=>action('seat','Low table','Tea from the thermos, still warm. Through the window, the hinpun and the lane, and somebody’s bicycle going down to the pier.'));
   o.userData.seat={position:[px,0,pz],stand:[px+Math.sin(yaw)*.75,0,pz+Math.cos(yaw)*.75],surfaceY:.09,eyeY:.82,yaw,pitch:0};
  }
  // The television on its cabinet against the north wall, facing the table.
  s.box(.9,.4,.45,tx+.6,y1-.22,.23,C.timberDark);s.solid(tx+.13,y1-.45,tx+1.07,y1,0,1);
  s.box(.62,.45,.48,tx+.6,y1-.25,.7,0x2b2b2b);s.mesh(.52,.02,.36,tx+.6,y1-.48,.72,0x3a5260,'Television screen');
  s.anchor(tx+.6,y1-.8,1,'Watch the television',()=>{const news=television?.();if(news)action('watch',news.title,news.text);else action('inspect','Television','NHK Okinawa: the weather map with a typhoon symbol far to the south, then sumo highlights. You leave it on low for company.');});
  // The photograph on the west wall: a harbour in Sweden, and this one the year he came.
  s.box(.03,.5,.38,x0+.02,ty,1.75,0x3a3a3a);s.box(.01,.44,.32,x0+.04,ty,1.75,0xe9dcc3);
  for(const [dy,sea,roof] of [[-.11,0x7498aa,0xac5149],[.11,0x78aaa2,0xae8063]]){s.box(.01,.19,.09,x0+.045,ty+dy,1.69,sea);s.box(.01,.08,.07,x0+.05,ty+dy,1.78,roof);}
  s.anchor(x0+.5,ty,1.7,'Look at the photograph',say('Photograph','Two pictures in one frame: a red wooden boathouse on a grey Swedish shore, and this harbour in 1979, the year you stepped off the ferry and did not get back on.'));
  // The walls over the dado, in the colour chosen in Johansson Studio (interiors/home-customization.js recolours every
  // 'Upper wall'): the four walls of the living room between their openings, and the dado rail under them.
  const lining=(x0,y0,x1,y1,h0=.9,h1=2.5)=>{const w=Math.max(.01,x1-x0),d=Math.max(.01,y1-y0);s.mesh(w,d,h1-h0,(x0+x1)/2,(y0+y1)/2,(h0+h1)/2,0xefe6d2,'Upper wall');if(h0<1)s.box(w+(d>w?.02:0),d+(w>d?.02:0),.04,(x0+x1)/2,(y0+y1)/2,h0,C.timberDark);};
  lining(x0,y0,x0+.01,y1);lining(x0,y1-.01,.9,y1);lining(1.7,y1-.01,x1,y1);lining(x1-.01,y0,x1,4.1);
  lining(x0,y0,1.4,y0+.01);lining(3.4,y0,x1,y0+.01);lining(1.4,y0,3.4,y0+.01,2.02,2.5);
  // The air conditioner over the window, and the fan in the corner for the days it is not worth switching on.
  s.box(.85,.24,.28,2.4,y0+.14,2.28,C.white);s.box(.8,.02,.02,2.4,y0+.27,2.18,0xc9cdd0);
  s.cyl(.03,.03,1,x1-.35,y0+.4,.5,0xd8dcdc);s.cyl(.2,.2,.1,x1-.35,y0+.4,1.05,0xa8c8d8,{rx:Math.PI/2});
}
 // The kitchen along the west wall, under its window, and the dining table under the north window.
 {const [x0,y0,x1,y1]=room('g0-kitchen');
  s.blk(x0,5.9,0,x0+.65,9.0,.85,0xe8e3d6);s.blk(x0,5.9,.85,x0+.67,9.0,.89,0x9aa3a6);s.solid(x0,5.9,x0+.67,9.0,0,.9);
  s.blk(x0+.12,7.4,.79,x0+.52,8.0,.89,0x8e979a,'metal');s.rod([x0+.06,7.7,.89],[x0+.2,7.7,1.15],.012,0xc9cdd0);
  s.box(.5,.55,.04,x0+.33,6.4,.91,0x2b2b2b);for(const y of [6.27,6.53])s.cyl(.09,.09,.02,x0+.33,y,.94,0x555555);
  s.box(.28,.3,.26,x0+.3,8.55,1.02,C.white);s.cyl(.09,.1,.2,x0+.35,6.9,.99,0xc0543e,{finish:'gloss'});
  s.blk(x0,9.1,0,x0+.7,y1,1.75,0xe8ebe6);s.solid(x0,9.1,x0+.72,y1,0,1.75);
  s.blk(x0,5.9,1.55,x0+.35,6.9,2.25,0xe8e3d6);s.blk(x0,8.5,1.55,x0+.35,9.0,2.25,0xe8e3d6);
  s.anchor(x0+.8,6.9,1.1,'Make tea',say('Kettle','You put the kettle on. Jasmine tea, the way Thuan makes it, in the pot her mother sent from Hội An.'));
  s.anchor(x0+.8,9.45,1.2,'Look in the fridge',say('Fridge','Orion beer from Higa Liquor, goya for tomorrow, a jar of Thuan’s nước chấm, and the herring Mr Higa ordered in for midsummer.'));
  // The dining table for four, under the north window.
  const dx=2.5,dy=8.75;s.box(1.4,.8,.04,dx,dy,.72,C.timberDark);for(const [a,b] of [[-.62,-.33],[.62,-.33],[-.62,.33],[.62,.33]])s.box(.05,.05,.7,dx+a,dy+b,.35,0x5a3f2a);
  s.solid(dx-.7,dy-.4,dx+.7,dy+.4,0,.76);
  for(const [cx,cy,bx,by] of [[dx-.4,dy-.7,0,-1],[dx+.4,dy-.7,0,-1],[dx-.95,dy,-1,0],[dx+.95,dy,1,0]]){
   s.box(.42,.42,.04,cx,cy,.45,C.timber);s.box(bx?.04:.4,bx?.4:.04,.45,cx+bx*.19,cy+by*.19,.7,C.timber);
   for(const [a,b] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])s.box(.03,.03,.43,cx+a,cy+b,.215,C.timberDark);
   s.solid(cx-.21,cy-.21,cx+.21,cy+.21,0,.48);}
  // The china cupboard on the hall wall.
  s.blk(x1-.42,7.1,0,x1,8.6,1.8,C.timberDark);s.blk(x1-.43,7.15,.9,x1-.41,8.55,1.75,0xbfe0e8,'gloss');s.solid(x1-.43,7.1,x1,8.6,0,1.8);}
 // Thuan's sewing studio: her machine at the east window, the cutting table, the fabric, the dress form.
 {const [x0,y0,x1,y1]=room('g0-sewing');
  s.blk(x1-.7,1.3,0,x1,2.9,.72,C.timberLight);s.solid(x1-.72,1.3,x1,2.9,0,.75);
  s.box(.45,.22,.3,x1-.38,2.1,.87,0xe9e2d0);s.box(.1,.2,.18,x1-.55,2.1,.94,0xe9e2d0);s.box(.3,.03,.05,x1-.3,2.1,1.03,0xb2453b);
  s.box(.45,.45,.04,x1-1.05,2.1,.45,C.timber);s.solid(x1-1.28,1.88,x1-.82,2.32,0,.48);
  s.anchor(x1-1,2.1,1.1,'Look at Thuan’s sewing machine',say('Sewing machine','A Johansson Model 7 sewing machine, its plate polished. Under the foot, a half-made kariyushi shirt for you, the pattern pinned to it, hibiscus on navy.'));
  s.blk(8.4,1.6,0,10.2,2.5,.86,C.timberLight);s.solid(8.4,1.6,10.2,2.5,0,.9);
  for(const [i,c] of C.fabric.entries())s.box(.3,.25,.04,8.7+i*.25,2.05,.88+i*.005,c);
  shelves(s,7.7,10.6,y0,y0+.4,[.02,.6,1.2,1.78],C.timberDark,'y0');s.solid(7.7,y0,10.6,y0+.42,0,1.8);
  for(let i=0;i<18;i++)s.cyl(.07,.07,.36,7.95+(i%6)*.47,y0+.22,.11+Math.floor(i/6)*.58,C.fabric[(i*5)%6],{rz:Math.PI/2,segments:8});
  // The dress form: a padded torso on a turned stand with three feet.
  for(const a of [0,2.1,4.2])s.rod([10.9,4.3,.35],[10.9+Math.cos(a)*.22,4.3+Math.sin(a)*.22,.02],.015,0x5a3f2a);
  s.cyl(.02,.02,.6,10.9,4.3,.55,0x5a3f2a);s.cyl(.17,.13,.32,10.9,4.3,1.0,0xe6dccb,{segments:12});s.cyl(.14,.17,.3,10.9,4.3,1.3,0xe6dccb,{segments:12});
  s.cyl(.05,.12,.08,10.9,4.3,1.49,0xe6dccb,{segments:12});s.cyl(.02,.02,.08,10.9,4.3,1.57,0x5a3f2a);s.solid(10.7,4.1,11.1,4.5,0,1.6);
  s.blk(8.5,y1-.4,.85,9.9,y1-.05,.88,0xc9d6d6);for(const x of [8.7,9.7])s.rod([x,y1-.22,0],[x,y1-.22,.85],.015,C.steel);s.solid(8.5,y1-.4,9.9,y1,0,.9);}
 // The WC and utility room: the toilet behind its own door at the east end, the washing machine and the sink.
 {const [x0,y0,x1,y1]=room('g0-wc'),px=10.6;
  for(const [a,b] of [[y0,5.3],[6.05,y1]]){s.blk(px-.04,a,0,px+.04,b,2.4,C.wall);s.solid(px-.04,a,px+.04,b,0,2.4);}
  s.blk(px-.04,5.3,2,px+.04,6.05,2.4,C.wall);
  s.mesh(.55,.4,.4,x1-.35,6.3,.2,0xf4f6f6,'Toilet');s.mesh(.16,.42,.5,x1-.1,6.3,.65,0xeef2f2,'Toilet cistern');s.solid(x1-.62,6.08,x1,6.52,0,.6);
  s.box(.3,.35,.2,px+.3,y1-.22,.85,0xf4f6f6);
  s.anchor(x1-.7,6.3,1,'Use the toilet',say('WC','A Johansson Washlet, the seat warm. On the shelf, a wooden Dala horse Thuan finds funny.'));
  // The washing machine and the utility sink against the south wall, clear of the ways through to the terrace and the WC.
  s.box(.6,.6,.85,8.7,y0+.32,.43,C.white);s.cyl(.17,.17,.02,8.7,y0+.63,.55,0x8e979a,{rx:Math.PI/2});s.solid(8.38,y0,9.02,y0+.64,0,.9);
  s.blk(9.15,y0,0,9.75,y0+.5,.8,0xe8e3d6);s.blk(9.25,y0+.08,.7,9.65,y0+.42,.81,0x8e979a,'metal');s.solid(9.13,y0,9.77,y0+.52,0,.82);}
 // The covered terrace's lobby: boots, the garden tools on the wall, the potting bench.
 {const [x0,y0,x1,y1]=room('g0-terrace');
  s.blk(x0,8.1,0,x0+.35,9.5,.4,C.timberDark);s.solid(x0,8.1,x0+.37,9.5,0,.4);
  for(const [y,c] of [[8.3,0x2b2b2b],[8.55,0x2b2b2b],[8.95,0x3f6a4a],[9.2,0x3f6a4a]])s.box(.12,.25,.35,x0+.17,y,.57,c);
  for(const [y,h] of [[8.2,1.5],[8.5,1.6],[8.8,1.4]]){s.rod([x1-.04,y,.15],[x1-.04,y,h],.02,0x8a6641);s.box(.05,.25,.12,x1-.06,y,.12,C.steel);}
  s.blk(x1-.6,9.2,0,x1,y1,.85,C.timberLight);s.solid(x1-.6,9.2,x1,y1,0,.9);for(const y of [9.35,9.6])s.cyl(.09,.07,.14,x1-.3,y,.92,0xb8643c);
  s.anchor(x1-.6,8.5,1.2,'Look at the garden tools',say('Garden tools','The rake, the spade and Thuan’s hoe for the goya bed, each on its own hook, the hooks labelled.'));}
}

// ---------------------------------------------------------------- the upper floor

function furnishUpper(s,{action,sleep}){
 const say=(title,text)=>()=>action('inspect',title,text);
 // Their bedroom: his futon laid out, Thuan's folded in the corner by day, the wardrobe and its mirror, her dresser.
 {const [x0,y0,x1,y1]=room('l1-bedroom'),fx=3.3,fy=2.5;
  const futon=s.mesh(1,2,.1,fx,fy,.05,0xe9dfc8,'Futon');futon.userData.bed=true;
  s.mesh(.95,1.3,.06,fx,fy-.3,.12,0x2c3e5c,'Quilt');s.mesh(.7,.35,.1,fx,fy+.8,.15,0xf3e8d2,'Pillow');
  const hers=s.mesh(.9,.5,.42,x1-.6,y0+.4,.21,0xf1e6e0,'Futon Thuan');hers.userData.bed=true;
  s.mesh(.86,.46,.08,x1-.6,y0+.4,.46,0xb2453b,'Thuan’s quilt');s.mesh(.5,.3,.1,x1-.6,y0+.4,.55,0xf3e8d2,'Thuan’s pillow');
  s.solid(x1-1.06,y0,x1-.14,y0+.66,0,.6);
  s.anchor(fx,fy,.6,'Lie down on the futon',()=>sleep?sleep():action('inspect','Futon','Folded square every morning, the way the harbour master taught you.'));
  s.blk(x0,3.3,0,x0+.6,4.4,1.9,0x7a5a3e);s.solid(x0,3.3,x0+.62,4.4,0,1.9);
  const mirror=new THREE.Mesh(new THREE.PlaneGeometry(.38,1.3),new THREE.MeshStandardMaterial({color:0xcfe0e6,roughness:.08,metalness:.6}));mirror.position.set(...s.at(x0+.61,3.85,1.05));mirror.rotation.y=Math.PI/2;mirror.name='Wardrobe mirror';s.group.add(mirror);
  s.anchor(x0+.9,3.85,1.3,'Look in the wardrobe mirror',say('Wardrobe','Three kariyushi shirts, a suit for assembly days and a straw hat. Thuan’s áo dài in its bag at the end.'));
  s.blk(x1-.45,y0+1,0,x1,y0+1.8,.75,C.timberDark);s.box(.04,.6,.7,x1-.43,y0+1.4,1.15,0xcfe0e6,{finish:'gloss'});s.solid(x1-.47,y0+1,x1,y0+1.8,0,.8);
  s.box(.22,.22,.4,x0+.35,y0+.35,.2,0xf3e7c4,{finish:'glow'});
  s.box(.85,.24,.28,2.25,y0+.14,2.28,C.white);}
 // The guest room: tatami, the closet of guests' futons behind its sliding doors, a low table.
 {const [x0,y0,x1,y1]=room('l1-guest');
  s.blk(1.9,y1-.75,0,x1,y1,2.3,0xf6efdc);for(let x=1.9;x<=x1;x+=.73)s.blk(x-.02,y1-.77,0,x+.02,y1-.74,1.9,C.timberDark);s.blk(1.9,y1-.77,1.88,x1,y1-.74,1.92,C.timberDark);s.solid(1.9,y1-.77,x1,y1,0,2.3);
  s.box(.9,.6,.04,2.6,7.3,.33,C.timberDark);for(const [a,b] of [[-.4,-.25],[.4,-.25],[-.4,.25],[.4,.25]])s.box(.04,.04,.3,2.6+a,7.3+b,.15,0x5a3f2a);s.solid(2.15,7,3.05,7.6,0,.38);
  for(const y of [6.75,7.85])s.box(.45,.45,.07,2.6,y,.035,0x3f6a4a);
  s.anchor(2.6,8.6,1,'Open the guest closet',say('Guest closet','Two futons for guests, aired last Sunday, and the cushions. Thuan’s sisters sleep here when the last boat has gone.'));}
 // The box room over the genkan.
 {const [x0,y0,x1,y1]=room('l1-boxroom');
  for(const sh of [.5,1.2,1.9])s.blk(x0,y0,sh,x0+.5,2.9,sh+.03,C.timberLight);for(const y of [y0+.02,2.88])s.blk(x0,y-.02,0,x0+.5,y+.02,1.93,C.timberLight);s.solid(x0,y0,x0+.52,2.9,0,2.1);
  for(const [y,h,c] of [[.5,.53,0x3f5f7a],[1.1,.53,0x6f2f2f],[1.9,1.23,0xc9b48a],[2.5,1.23,0xc9b48a],[1.2,1.93,0xe6dccb]])s.box(.45,.5,.38,x0+.25,y,h+.19,c);
  s.box(.5,.8,.25,x1-.4,1.2,.13,0x2f4f6f);s.solid(x1-.65,.8,x1-.15,1.6,0,.3);
  s.anchor(x0+.8,1.8,1.2,'Look in the box room',say('Box room','The suitcases, the box of Christmas things marked JUL in his hand, Thuan’s winter coat from Hà Nội, and the town’s spare flags.'));}
 // The landing: a plant by the window-less wall.
 {s.cyl(.18,.14,.35,7.02,3.78,.18,0xb8643c);s.sphere(.3,7.02,3.78,.7,0x3f7440);s.solid(6.82,3.58,7.22,3.98,0,.8);}
 // The bathroom: the changing room by the door with the basin and the washing machine, the wet room past the glass
 // screen with the ofuro under the window and the washing place.
 {const [x0,y0,x1,y1]=room('l1-bathroom'),scr=2.9;
  for(const [a,b] of [[x0,8.9],[9.7,x1]]){s.blk(a,scr-.03,0,b,scr+.03,2.1,0xd8eef3,'gloss');s.solid(a,scr-.03,b,scr+.03,0,2.1);}
  s.blk(8.9,scr-.03,2.0,9.7,scr+.03,2.1,C.sash);
  s.blk(10,y1-.55,0,10.8,y1,.85,C.white);s.box(.7,.03,.7,10.4,y1-.02,1.4,0xcfe0e6,{finish:'gloss'});s.solid(10,y1-.57,10.8,y1,0,.9);
  s.box(.6,.6,.85,x1-.35,y1-.35,.43,C.white);s.solid(x1-.66,y1-.66,x1,y1,0,.9);
  s.blk(8.6,y1-.35,0,9.6,y1,1.6,C.timberLight);s.solid(8.6,y1-.37,9.6,y1,0,1.6);
  s.blk(x1-.85,y0,0,x1,y0+1.75,.55,0x7fb8c8);s.mesh(.65,1.55,.04,x1-.43,y0+.88,.5,0xbfe0e8,'Bath (ofuro)');s.solid(x1-.87,y0,x1,y0+1.77,0,.6);
  s.box(.32,.32,.25,9.6,1.2,.13,0xe9e2d0);s.box(.05,.4,.6,x0+.03,1.3,1.2,0xcfe0e6,{finish:'gloss'});s.rod([x0+.05,1.6,.9],[x0+.05,1.6,1.9],.015,0xc9cdd0);
  s.anchor(x1-1,1,1,'Run a bath',say('Ofuro','You run the bath deep and hot, wash first at the stool, then sit in it to the chin with the window open on the sea.'));}
 // The study: his desk at the east window, the bookshelf, the ship's clock.
 {const [x0,y0,x1,y1]=room('l1-study');
  s.blk(x1-.7,5.3,0,x1,6.8,.73,C.timberDark);s.solid(x1-.72,5.3,x1,6.8,0,.76);
  s.box(.3,.4,.02,x1-.4,5.8,.75,0xf2efe6);s.box(.25,.15,.14,x1-.4,6.45,.8,0x638574);s.cyl(.02,.06,.4,x1-.25,5.45,.93,0x2b2b2b);
  s.box(.45,.45,.04,x1-1.05,6.05,.45,C.timber);s.solid(x1-1.28,5.82,x1-.82,6.28,0,.48);
  shelves(s,7.6,9,y0,y0+.32,[.02,.57,1.12,1.68],0x8a6a4a,'y0');s.solid(7.6,y0,9,y0+.34,0,1.7);
  for(let i=0;i<27;i++)s.box(.06,.22,.26-(i%3)*.03,7.72+(i%9)*.14,y0+.15,.17+Math.floor(i/9)*.55-(i%3)*.015,C.book[(i*5)%6]);
  s.anchor(8.3,y0+.7,1.2,'Look at the bookshelf',()=>action('read','Bookshelf','Sea charts of the Ryūkyū arc. A Swedish–Japanese dictionary with a cracked spine. Three Wallander paperbacks. The town budget for 1997, with coffee rings.'));
  s.cyl(.14,.14,.05,8.3,y1-.03,1.9,0xb8913f,{rx:Math.PI/2,segments:16});
  s.anchor(x1-1,6.05,1.2,'Sit at the desk',say('Desk','The town’s papers in two piles, the radio on low, the ship’s clock striking the watch. He answers every letter the day it comes.'));}
 // The linen room: shelves of sheets and towels, the airing rail under the window.
 {const [x0,y0,x1,y1]=room('l1-linen');
  for(const sh of [.4,1.0,1.6])s.blk(x1-.5,y0+.1,sh,x1,y1-.1,sh+.03,C.timberLight);s.solid(x1-.52,y0,x1,y1,0,2);
  for(let i=0;i<9;i++)s.box(.4,.35,.12,x1-.25,y0+.4+(i%3)*.75,.47+Math.floor(i/3)*.6,[0xf4f5f2,0xe6dccb,0xc9d6d6][i%3]);
  s.rod([8.7,y1-.25,1.5],[10.3,y1-.25,1.5],.015,C.steel);for(const x of [8.9,9.4,9.9])s.box(.4,.02,.6,x,y1-.25,1.2,[0xf4f5f2,0x2f4f6f,0xb2453b][Math.round((x-8.9)*2)]);
  s.cyl(.25,.2,.45,8,8,.23,0xc9b48a,{segments:10});
  s.anchor(9,8.2,1.2,'Look at the linen',say('Linen room','Sheets folded in thirds, the towels by colour, his sauna towel apart from the rest.'));}
}

// ---------------------------------------------------------------- the basement

function furnishBasement(s,{action}){
 const say=(title,text)=>()=>action('inspect',title,text);
 if(s.cupboard)s.anchor(s.cupboard[0],s.cupboard[1],1,'Look in the cupboard under the stair',say('Cupboard under the stair','The vacuum cleaner, the ironing basket, and his toolbox for the house, every spanner back in its outline.'));
 // The electrical workshop: the bench, the meters, the parts drawers and the teaching board.
 {const [x0,y0,x1,y1]=room('b1-workshop');
  s.blk(x0,.6,0,x0+.75,3.6,.9,C.timberLight);s.solid(x0,.6,x0+.77,3.6,0,.92);
  s.blk(x0,.6,1.1,x0+.03,3.6,2.1,0xc9b48a);for(let i=0;i<8;i++)s.box(.04,.08,.3,x0+.05,.9+i*.35,1.5+(i%2)*.2,0x5d6b70);
  s.box(.25,.2,.12,x0+.3,1.2,.96,0xc9a64a);s.box(.15,.22,.08,x0+.3,1.7,.94,0xd9b04a);s.box(.16,.1,.1,x0+.35,2.6,.95,0x5d6b70);
  s.blk(x0,3.8,0,x0+.45,4.6,1.2,0x8e979a,'metal');for(let i=0;i<10;i++)s.box(.02,.3,.08,x0+.46,3.95+(i%2)*.4,.15+Math.floor(i/2)*.22,0xe9e7df);s.solid(x0,3.8,x0+.47,4.6,0,1.2);
  // The teaching board on the south wall: a supply breaker, an earth-leakage breaker, three circuits, sockets and lamps.
  s.blk(1.2,y0,1,3.6,y0+.04,2,0xe9e7df);s.box(.16,.04,.24,1.5,y0+.06,1.7,0x2b2b2b);s.box(.16,.04,.24,1.8,y0+.06,1.7,0x3a5260);
  for(let i=0;i<3;i++)s.box(.06,.04,.16,2.2+i*.12,y0+.06,1.72,0x2b2b2b);
  for(let i=0;i<3;i++){s.box(.12,.04,.16,2.4+i*.35,y0+.06,1.25,C.white);s.sphere(.05,2.4+i*.35,y0+.08,1.45,0xf3e7c4);}
  s.anchor(2.4,y0+.8,1.4,'Look at the teaching board',say('Teaching board','The board he wired to teach the island’s apprentices: a supply breaker, an earth-leakage breaker, three circuits. Before any work on a circuit: switch it off, lock it off and tag it, then prove it dead with a tester you have just tried on a live socket, and try the tester again after.'));
  s.box(.4,.4,.04,1.5,2,.6,C.timber);s.cyl(.03,.03,.58,1.5,2,.29,C.steel);
  s.anchor(x0+1.1,2,1.2,'Look at the workbench',say('Workbench','The soldering iron in its stand, an insulation tester, the meter he bought in Gothenburg in 1975, and a radio from the Higa house waiting for a valve.'));}
 // The club's reading room: the bookcases, four armchairs round the rug, the little bar, the window under the garden.
 {const [x0,y0,x1,y1]=room('b1-club');
  shelves(s,x0,x1,y1-.35,y1,[.02,.52,1.02,1.52,2.02],0x6b4a32,'y1');s.solid(x0,y1-.37,x1,y1,0,2.2);
  for(let i=0;i<60;i++){const shelf=Math.floor(i/15),k=i%15;s.box(.06,.24,.3-(k%3)*.04,x0+.3+k*.29+(k%2)*.02,y1-.18,.19+shelf*.5-(k%3)*.02,C.book[(i*7)%6]);}
  s.blk(1.3,6.6,0,3.5,8.4,.012,0x7a2f2f);
  for(const [x,y] of [[1.6,7.0],[3.2,7.0],[1.6,8.0],[3.2,8.0]]){s.box(.7,.7,.4,x,y,.22,0x6f4a3a);s.box(.7,.15,.5,x,y+(y<7.5?-.3:.3),.65,0x6f4a3a);s.solid(x-.36,y-.36,x+.36,y+.36,0,.9);}
  s.box(.6,.6,.04,2.4,7.5,.45,C.timberDark);s.solid(2.1,7.2,2.7,7.8,0,.47);
  s.blk(x0+.3,y0,0,3.4,y0+.5,1.05,C.timberDark);s.solid(x0+.3,y0,3.4,y0+.52,0,1.1);
  for(let i=0;i<6;i++)s.cyl(.04,.04,.28,x0+.6+i*.4,y0+.2,1.19,[0x3f6a4a,0x8a5a2b,0xe9e2d0][i%3],{segments:8});
  s.anchor(1.8,y0+.9,1.2,'Look at the bar',say('The club’s bar','Awamori from Higa Liquor in its jars, a bottle of aquavit from the Christmas parcel, and the club’s book of who owes what.'));
  s.anchor(2.4,y1-.8,1.2,'Look at the club’s books',say('Reading club','The reading club’s shelves: this month Tanizaki, next month Lagerlöf in a translation nobody has finished. The minutes are kept by Reiko.'));
  for(const [x,y] of [[x0+.3,6.3],[x1-.3,y1-.6]]){s.cyl(.02,.02,1.5,x,y,.75,0x3a3632);s.cyl(.14,.2,.2,x,y,1.55,0xf3e7c4,{finish:'glow'});}}
 // The cellar store under the genkan: shelves of preserves, the typhoon kit, the water.
 {const [x0,y0,x1,y1]=room('b1-cellar');
  for(const sh of [.4,1,1.6])s.blk(x0,y0,sh,x0+.45,2.9,sh+.03,C.timberLight);s.solid(x0,y0,x0+.47,2.9,0,2);
  for(let i=0;i<12;i++)s.cyl(.06,.06,.16,x0+.2,y0+.35+(i%6)*.4,.5+Math.floor(i/6)*.6,[0xc0543e,0xd9b04a,0x6ea05a][i%3],{segments:8});
  for(let i=0;i<3;i++)s.box(.3,.3,.4,x1-.25,.6+i*.4,.2,0x3f6a9a);s.solid(x1-.42,.4,x1,1.6,0,.4);
  s.cyl(.22,.18,.55,x1-.4,2.6,.28,0x6a4a36,{finish:'gloss'});
  s.anchor(x0+.9,1.5,1.2,'Look at the typhoon kit',say('Typhoon kit','Water for three days, candles, the battery radio, tinned saba, a first-aid box, and the shutter key on its red tag.'));}
 // The hall: the dehumidifier the basement needs.
 {s.box(.35,.25,.6,5.2,3.75,.3,C.white);s.solid(5.02,3.6,5.38,3.9,0,.62);s.anchor(5.4,4.1,.9,'Look at the dehumidifier',say('Dehumidifier','A Johansson D-20 dehumidifier, emptied every morning: a basement under the garden by the sea is always damp.'));}
 // The boiler and pump room: the water heater, the pressure set, the sump with its two pumps (F11), the garden door.
 {const [x0,y0,x1,y1]=room('b1-boiler');
  const hx=x1-.45,hy=y0+.45;s.cyl(.32,.32,1.8,hx,hy,.9,C.white,{segments:16});s.solid(hx-.35,hy-.35,hx+.35,hy+.35,0,1.8);
  for(const y of [1.6,2.4]){s.cyl(.14,.14,.4,x0+.4,y,.32,0x2f6f4a,{rz:Math.PI/2,segments:10});s.box(.2,.2,.25,x0+.65,y,.32,0x2f6f4a);}
  s.blk(x0,1.3,0,x0+.9,2.7,.1,C.concrete);s.cyl(.22,.22,.6,x0+.35,2.95,.3,0x3a5260,{segments:12});s.solid(x0,1.3,x0+.92,3.2,0,.7);
  s.blk(10.4,1.2,-.01,11.2,2,.01,0x5d6b70,'metal');for(let i=0;i<7;i++)s.blk(10.42,1.22+i*.11,.01,11.18,1.25+i*.11,.02,0x3a3a3a);
  s.box(.3,.4,.12,x1-.06,1.6,1.5,0xe9e7df);for(const y of [1.5,1.7])s.sphere(.025,x1-.12,y,1.58,0x6ea05a);
  for(const [a,b] of [[[hx,hy,1.8],[hx,hy,2.35]],[[hx,hy,2.35],[x0+.65,hy,2.35]],[[x0+.65,hy,2.35],[x0+.65,1.6,2.35]],[[x0+.65,1.6,.5],[x0+.65,1.6,2.35]]])s.rod(a,b,.03,0xb8913f);
  s.anchor(hx-.6,hy+.5,1.2,'Look at the water heater',say('Water heater','A Johansson 370-litre electric water heater: it heats on the cheap night tariff, and its maker’s plate says so in three languages.'));
  s.anchor(10.8,2.6,1,'Look at the sump pumps',say('Sump','The sump under the grating, and two pumps in it, one to run and one to stand by: the basement is below the sea, and the ground water would be in by morning without them.'));
  const bext=HOUSE_OPENINGS.find(o=>o.id==='D-BEXT');
  s.anchor((bext.from+bext.to)/2,y0+.8,1.2,'Try the garden door',say('Garden door','The steel door to the steps up to the garden. Bolted for the typhoon season: you go out by the front.'));}
 // The sauna and shower: the cedar cabin at the east end with its stove, the shower at the west, the bench and pegs.
 {const [x0,y0,x1,y1]=room('b1-sauna'),cx=10.4;
  for(const [a,b] of [[y0,5.6],[6.4,y1]]){s.blk(cx-.05,a,0,cx+.05,b,2.3,0xc9a37a);s.solid(cx-.05,a,cx+.05,b,0,2.3);}
  s.blk(cx-.05,5.6,2,cx+.05,6.4,2.3,0xc9a37a);s.blk(cx-.03,5.62,0,cx-.01,6.38,2,0xd8eef3,'gloss');s.solid(cx-.06,5.6,cx+.06,6.4,0,2);
  s.blk(cx+.05,y0,0,x1,y1,.01,0xc9a37a);s.blk(cx+.05,y0,2.3,x1,y1,2.36,0xc9a37a);
  for(const [y,h] of [[y1-.5,.45],[y1-.25,.9]])s.blk(cx+.6,y0+.05,h-.05,x1,y0+1.9,h,0xd8b48a);
  s.box(.45,.45,.6,cx+.35,y1-.35,.3,0x3a3a3a);for(let i=0;i<6;i++)s.sphere(.06,cx+.25+(i%3)*.1,y1-.4+Math.floor(i/3)*.1,.63,0x8a8a8a);
  s.anchor(cx-.5,6,1.3,'Take a sauna',say('Bastu','The cedar cabin he built himself, the stove a Johansson Bastu 6. Eighty degrees, a ladle of water on the stones, then the cold shower: a Swede’s evening.'));
  // The shower in the south-west corner, clear of the hall's doorway.
  s.blk(x0,y0,0,8.3,5.75,.03,C.tile);s.rod([7.8,y0+.05,.9],[7.8,y0+.05,2.05],.015,0xc9cdd0);s.cyl(.07,.04,.05,7.8,y0+.15,2.05,0xc9cdd0);s.rod([8.3,y0,2.05],[8.3,5.75,2.05],.012,C.steel);
  s.blk(8.5,y1-.4,0,9.1,y1,.45,C.timberLight);s.solid(8.5,y1-.42,9.1,y1,0,.48);for(const x of [8.6,8.85,9.1])s.box(.04,.08,.04,x,y1-.03,1.7,C.timberDark);}
 // The storage: shelves, the fishing rods, the spare roof tiles for after a typhoon.
 {const [x0,y0,x1,y1]=room('b1-storage');
  for(const sh of [.3,.9,1.5])s.blk(x1-.5,y0+.1,sh,x1,y1-.1,sh+.03,0x8e979a,'metal');s.solid(x1-.52,y0,x1,y1,0,1.9);
  for(let i=0;i<9;i++)s.box(.4,.45,.3,x1-.25,y0+.45+(i%3)*.75,.47+Math.floor(i/3)*.6,[0xc9b48a,0x5d6b70,0x3f5f7a][i%3]);
  for(let i=0;i<4;i++)s.rod([8,y1-.1,.1+i*.05],[8.1+i*.05,y1-.1,2.2],.012,[0x2b2b2b,0x5a3f2a][i%2]);
  for(let i=0;i<5;i++)s.box(.3,.4,.04,8.9,8.0,.02+i*.04,0xc4553a);s.solid(8.7,7.75,9.1,8.25,0,.25);
  s.anchor(9.6,8.4,1.2,'Look at the storage',say('Storage','The fishing rods, the spare red tiles from the roof for after a typhoon, the deck chairs, and a box marked JUL with the Christmas star in it.'));}
}
