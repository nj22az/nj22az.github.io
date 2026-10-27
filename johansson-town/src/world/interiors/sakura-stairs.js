import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';

/**
 * Sakura's inside stair is a passage, not a place to walk (the owner, 20 October 2026, on his iPhone: "I don't want the
 * stairs to be traversable it's too much errors when running up the stairs, I want the stairs to lead up to a black hole
 * and we disappear into there and when it loads we come up on the upper floor").
 *
 * So the shop and its office are two rooms. In the shop (the market room) the lower flight rises from the stockroom for
 * five treads and goes into darkness: everything of the stairwell beyond them is black, solid to the walk and to the lens.
 * Stepping onto the first tread (or "Go upstairs") walks him up into the dark while the picture fades to black, and the
 * office storey opens as its own room (interiors/sakura-office-room.js), the shop not loaded at all, with him at the stair
 * head in the hall facing up it. Coming down is the same from the stair head: four treads going down into the dark, and
 * he arrives at the stair's foot in the stockroom. game.js runs the walk, the fade and the change of room
 * (takeSakuraStair); this module is what is drawn at each end and where it starts, ends and arrives.
 *
 * The frames: the shop's (x along the frontage, z from the back room's wall to the window, y up from the shop floor) and
 * the office's (the same x, z from its back wall, y up from the office floor): z_office = z_shop - officeZ.
 */
export const SAKURA_STAIR=Object.freeze({height:4.01,officeZ:-.64,
 // The stair's footprint in the shop: the lower flight rises west from x -1.8 at z -5.15..-4.05.
 lower:Object.freeze({x0:-1.8,x1:-4.5,z0:-5.15,z1:-4.05}),
 bottom:Object.freeze([-1.25,0,-4.6])});

/** The stairwell's north wall, on the stair's side of the restroom partition (z -4.03), in the shop's frame. */
export const STAIR_NORTH=Object.freeze({z0:-4.07,z1:-4.03});

const TREAD=2.7/12,RISE=SAKURA_STAIR.height/24;

/**
 * The stairwell, whole (the owner, 27 October 2026: "The black part should not be shown it should be like a loading screen
 * when you up the stairs the loading starts for the top Floor"; "No the loading screen is walking up the stairs"). Drawing
 * SK-ST-001 rev A (docs/qa/sakura-surfaces/). In the shop's frame (x along the frontage, z from the street, y up from the
 * shop floor); the office storey draws the same stairwell in its own frame, `toOffice`.
 *
 * A dog-leg of 24 risers of RISE (167 mm) on goings of TREAD (225 mm): the lower flight rises west from the stockroom to
 * the turning landing, the upper flight east from it to the top landing at the office floor. Each flight stands on a
 * closed plaster carriage to the floor (under the upper flight, the under-stair cupboard), so nothing is open beneath.
 * The well walls: west x -5.65, south z -6.70 (the office's stairwell back wall, carried down), north z -4.07.
 */
export const SAKURA_STAIRWELL=Object.freeze({
 rise:RISE,going:TREAD,risers:24,
 // Eleven treads each (the twelfth rise lands on the landing, the twenty-fourth on the top landing), as the office's
 // stair head has always drawn them: the tread i goings west of x -1.8 has its top at i rises (lower) or 24 - i (upper).
 lower:Object.freeze({x0:-1.8,x1:-1.8-11*TREAD,z0:-5.15,z1:-4.07}),
 landing:Object.freeze({x0:-5.65,x1:-1.8-11*TREAD,z0:-6.70,z1:-4.07,y:12*RISE}),
 upper:Object.freeze({x0:-1.8-11*TREAD,x1:-1.8,z0:-6.70,z1:-5.60}),
 top:Object.freeze({x0:-1.8,x1:-.6,z0:-6.70,z1:-6.14,y:SAKURA_STAIR.height}),
 walls:Object.freeze({west:-5.65,south:-6.70,north:-4.07,east:-.6,ceiling:SAKURA_STAIR.height+2.8,thick:.08}),
});
/** A point of the shop's frame in the office storey's. */
export const toOffice=([x,y,z])=>[x,y-SAKURA_STAIR.height,z-SAKURA_STAIR.officeZ];

/**
 * The climb: the walk up (or down) the whole stair is what he sees while the other storey opens (the owner, 27 October
 * 2026: "Camera should lock from below we just see him go up"). Going up, the shop's camera stands locked at the stair's
 * foot and turns only to keep him in sight as he climbs both flights out of it; going down, the office's stands locked
 * over the top landing. The whole stair is drawn in both storeys (buildSakuraStairwell), so the walk is the starting
 * storey's own; when it ends the picture cuts to him arriving at the other end. Paths in the shop's frame.
 */
// Up the lower flight on the line he arrives on at its foot (z -4.6), the upper on the office's stair-head line (office z -5.51).
// A camera at either end can see only its own flight: the walls between the flights hide the other. So the walk is the
// flight in view and the turn on the landing, and the cut comes as he turns out of sight (SK-ST-001 rev B).
const L=SAKURA_STAIRWELL,mid=(a,b)=>(a+b)/2,lz=-4.6,uz=-5.51+SAKURA_STAIR.officeZ,turnX=mid(L.landing.x0,L.landing.x1),turnZ=mid(lz,uz);
export const SAKURA_STAIR_CLIMB=Object.freeze({
 speed:1.2,cut:.18,
 up:Object.freeze([[-2.0,RISE,lz],[L.lower.x1+.1,L.landing.y,lz],[turnX,L.landing.y,lz],[turnX,L.landing.y,turnZ]].map(Object.freeze)),
 down:Object.freeze([[L.upper.x1-.1,SAKURA_STAIR.height,uz],[L.upper.x0+.1,L.landing.y,uz],[turnX,L.landing.y,uz],[turnX,L.landing.y,turnZ]].map(Object.freeze)),
 // The locked cameras (the owner: "Camera should lock from below we just see him go up"): in the shop low in the corner at
 // the stair's foot, looking up the lower flight; in the office high over the top landing, looking down the upper. Each
 // aims at its flight and turns only a little after him.
 camera:Object.freeze({
  shop:Object.freeze({at:Object.freeze([-.72,.95,-4.3]),aim:Object.freeze([-4.0,1.9,-4.75]),follow:.3}),
  office:Object.freeze({at:Object.freeze([-.72,SAKURA_STAIR.height+2.25,-6.45]),aim:Object.freeze([-4.0,L.landing.y+.6,-6.0]),follow:.3}),
 }),
});
/** A dark volume: [x0, x1, z0, z1, y0, y1]. */
const dark=(...v)=>Object.freeze(v);

export const SAKURA_STAIR_PASSAGE=Object.freeze({
 /** How long the walk into the dark takes, and how long the picture takes to go black. */
 seconds:1.1,fade:.7,
 /** The shop's end, in the shop's frame. */
 foot:Object.freeze({
  treads:5,
  // Stepping onto the first tread starts the passage; he can stand at the foot without starting it.
  trigger:Object.freeze({x:Object.freeze([-2.95,-1.92]),z:Object.freeze([-5.12,-4.08])}),
  // Up the first treads into the dark (from wherever he stepped on).
  walk:Object.freeze([Object.freeze([-2.08,RISE,-4.6]),Object.freeze([-2.9,4*RISE,-4.6])]),
  // Coming down he arrives at the foot, a step clear of the first tread, facing the stockroom.
  arrive:Object.freeze({at:Object.freeze([-1.12,0,-4.6]),yaw:-Math.PI/2}),
  prompt:Object.freeze([-1.55,1.1,-4.6]),
  // The black: the rest of the lower flight and the turning landing; the alcove south of the flight (under the upper
  // flight that was); the stairwell over the stockroom's ceiling opening. Out to the stockroom's walls (x -5.72, z -6.86), 5 mm clear of the north wall (z -4.07) so no two faces share a plane.
  dark:Object.freeze([dark(-5.71,-2.93,-6.85,-4.075,0,SAKURA_STAIR.height+2.8),dark(-2.93,-1.8,-6.85,-5.18,0,2.9),dark(-2.93,-.6,-6.85,-4.075,2.9,SAKURA_STAIR.height+2.8)]),
 }),
 /** The office's end, in the office's frame. */
 head:Object.freeze({
  treads:4,
  // The upper flight comes up from the west to the top landing's south end (x -1.8..-0.6), behind the hall.
  flight:Object.freeze({x0:-1.8,z0:-6.06,z1:-4.96}),
  trigger:Object.freeze({x:Object.freeze([-2.7,-1.9]),z:Object.freeze([-6.0,-5.0])}),
  walk:Object.freeze([Object.freeze([-1.95,0,-5.51]),Object.freeze([-2.62,-3*RISE,-5.51])]),
  // Going up he arrives at the stair head, on the top landing, facing up the hall.
  arrive:Object.freeze({at:Object.freeze([-1.2,0,-3.95]),yaw:Math.PI}),
  prompt:Object.freeze([-1.2,1.1,-5.25]),
  // The pit of the stairwell under the hall's hole, and under the four treads.
  dark:Object.freeze([dark(-5.65,-2.7,-6.06,-3.36,-4.2,-.03),dark(-2.7,-2.05,-4.96,-3.36,-4.2,-.03),dark(-2.7,-1.8,-6.06,-4.96,-4.2,-4*RISE-.1)]),
 }),
 why:'The owner’s decision of 20 October 2026 (AGENTS.md): the stair leads up into darkness and he comes up on the office floor; nobody walks it.',
});

/**
 * The whole stairwell (SAKURA_STAIRWELL, drawing SK-ST-001), the same pieces in either storey: `storey` 'shop' draws it in
 * the shop's frame with what closes it over the stockroom (the hall's floor, its walls, the stairwell ceiling), 'office'
 * in the office's frame with the stockroom floor at its foot. Treads sit on their closed carriages 30 mm down, the
 * landings on closed blocks: every piece starts where the next ends, no face in another's plane (SK-ZF rules).
 * One mesh per material. Returns the group.
 */
export function buildSakuraStairwell(parent,{storey='shop'}={}){
 const S=SAKURA_STAIRWELL,W=S.walls,H=SAKURA_STAIR.height,shop=storey==='shop',dy=shop?0:-H,dz=shop?0:-SAKURA_STAIR.officeZ;
 const group=new THREE.Group();group.name='Sakura stairwell';parent.add(group);
 const lists=new Map(),add=(key,g)=>{g.translate(0,dy,dz);(lists.get(key)??lists.set(key,[]).get(key)).push(g.index?g.toNonIndexed():g);};
 const span=(key,x0,x1,y0,y1,z0,z1)=>add(key,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2));
 const NOSE=.02,BOARD=.03;
 // A flight's carriage: its stepped side, extruded across the flight, from the floor to 30 mm under each tread.
 const carriage=(steps,z0,z1)=>{const sh=new THREE.Shape();sh.moveTo(steps[0][0],0);for(const [x0,x1,top] of steps){sh.lineTo(x0,top-BOARD);sh.lineTo(x1,top-BOARD);}sh.lineTo(steps.at(-1)[1],0);sh.closePath();
  add('plaster',new THREE.ExtrudeGeometry(sh,{depth:z1-z0,bevelEnabled:false}).translate(0,0,z0));};
 // Lower flight: tread i (1..11) i goings west of x -1.8, its top at i rises.
 const lower=[];for(let i=1;i<=11;i++){const x1=S.lower.x0-(i-1)*TREAD,x0=x1-TREAD;lower.push([x1,x0,i*RISE]);}
 carriage(lower,S.lower.z0,S.lower.z1);
 for(const [x1,x0,top] of lower)span('wood',x0,x1+NOSE,top-BOARD,top,S.lower.z0-.01,S.lower.z1);
 // Upper flight: tread i (1..11) i goings west of x -1.8, its top at 24 - i rises; its carriage is the under-stair cupboard.
 const upper=[];for(let i=11;i>=1;i--){const x1=S.upper.x1-(i-1)*TREAD,x0=x1-TREAD;upper.push([x0,x1,(24-i)*RISE]);}
 carriage(upper,S.upper.z0,S.upper.z1);
 for(const [x0,x1,top] of upper)span('wood',x0-NOSE,x1,top-BOARD,top,S.upper.z0,S.upper.z1+.01);
 // The under-stair cupboard's door, on its face to the well between the flights.
 span('door',-3.2,-2.4,.0,1.8,S.upper.z1+.01,S.upper.z1+.03);
 // The turning landing on its block; the top landing on its block over the stockroom's ceiling.
 const Lg=S.landing;span('plaster',Lg.x0,Lg.x1,0,Lg.y-BOARD,Lg.z0,Lg.z1);span('wood',Lg.x0,Lg.x1,Lg.y-BOARD,Lg.y,Lg.z0,Lg.z1);
 const Tp=S.top,CEIL=2.98;span('plaster',Tp.x0,Tp.x1,CEIL,H-.12,Tp.z0,Tp.z1);
 if(shop)span('timber',Tp.x0,Tp.x1,H-.12,H,Tp.z0,Tp.z1);
 // The well walls, full height in the shop; in the office the north wall stops at its floor (the store wall goes on).
 const t=W.thick;
 if(shop){span('plaster',W.west-t,W.west,0,W.ceiling,W.south,W.north);span('plaster',W.west,W.east,0,W.ceiling,W.north,W.north+.04);}
 else{
  // In the office storey the walls meet its own: the west wall stops under its floor where the floor and the rear wall
  // (office z -5.56, shop -6.20) run up to it, and the north wall under the hall's floor east of the hole (x -2.05).
  const rear=-6.20;
  span('plaster',W.west-t,W.west,0,H-.12,W.south,W.north);span('plaster',W.west-t,W.west,H-.12,W.ceiling,W.south,rear);
  span('plaster',W.west,-2.05,0,H,W.north,W.north+.04);span('plaster',-2.05,W.east,0,H-.12,W.north,W.north+.04);
 }
 span('plaster',W.west-t,W.east,-.19,W.ceiling,W.south-t,W.south);
 // East, over the stockroom's ceiling and under the hall's floor, between the top landing's block and the north wall.
 span('plaster',W.east-t,W.east,CEIL,H-.12,Tp.z1,W.north);
 // The top landing's end wall, from the office floor to the stairwell ceiling.
 span('plaster',W.east-t,W.east,H,W.ceiling,W.south,Tp.z1);
 if(shop){
  // What the shop cannot see but must not look into: the hall's floor over the stockroom, the hall's back wall over the
  // top landing and the hole's rail line, closed; the stairwell ceiling.
  span('timber',-2.05,W.east,H-.12,H,Tp.z1,W.north);
  span('plaster',-2.05,W.east-t,H,W.ceiling,Tp.z1,Tp.z1+.08);
  span('plaster',-2.05-t,-2.05,H,W.ceiling,Tp.z1+.08,W.north);
  span('ceiling',W.west,-2.05-t,W.ceiling,W.ceiling+.12,W.south,W.north);span('ceiling',-2.05-t,W.east,W.ceiling,W.ceiling+.12,W.south,Tp.z1);
 }else{
  // The stockroom's floor at the stair's foot, seen from the office storey looking down the flights.
  span('floor',W.west,W.east,-.12,0,W.south,W.north);
 }
 const colour={plaster:0xece1ca,wood:0x8d7458,timber:0x947354,door:0xb08a5e,ceiling:0xf1eadb,floor:0xb4b1a8};
 for(const [key,list] of lists){
  const m=new THREE.Mesh(mergeGeometries(list),new THREE.MeshStandardMaterial({color:colour[key],roughness:.88}));list.forEach(g=>g.dispose());
  m.name='Sakura stairwell '+key;m.receiveShadow=true;group.add(m);
 }
 return group;
}

const inside=(p,{x,z})=>p.x>=x[0]&&p.x<=x[1]&&p.z>=z[0]&&p.z<=z[1];
/** Whether he has stepped onto the stair at the shop's end (shop frame), or at the office's end (office frame). */
export const onSakuraStairFoot=p=>inside(p,SAKURA_STAIR_PASSAGE.foot.trigger)&&Math.abs(p.y)<.5;
export const onSakuraStairHead=p=>inside(p,SAKURA_STAIR_PASSAGE.head.trigger)&&Math.abs(p.y)<.5;

// The passage's volumes are solid to the walk and the lens, and no longer drawn: the stairwell is built whole
// (buildSakuraStairwell) and nothing of it is black (the owner, 27 October 2026).
function addDark(group,boxes,solid,name,{over=null}={}){
 for(const [x0,x1,z0,z1,y0,y1] of boxes){
  // Solid to the walk and the lens; under a floor, up to `over` so nobody walks out over the pit.
  const top=over??y1;solid((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top-y0,y0);
 }
}

/**
 * The shop's end of the stair: five treads of the lower flight rising from the stockroom into the dark, the under-stair
 * wall beside them, the stairwell's north wall against the restroom, the prompt. Returns its colliders (shop frame).
 */
export function buildSakuraStairFoot({room,reg=()=>{},go=()=>{}}){
 const group=new THREE.Group();group.name='Sakura internal stairwell';room.add(group);
 const F=SAKURA_STAIR_PASSAGE.foot,H=SAKURA_STAIR.height,colliders=[];
 const solid=(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY});
 // The stairwell, whole: both flights, the landings, its walls and ceiling (SK-ST-001). Its north wall keeps the lens out
 // of the toilet.
 buildSakuraStairwell(group,{storey:'shop'});
 solid(-3.15,-4.02,2.9,.06,3.05,0);
 for(const [x0,x1,y0] of [[-5.7,-4.6,0],[-4.6,-.6,2.9]])solid((x0+x1)/2,(STAIR_NORTH.z0+STAIR_NORTH.z1)/2,x1-x0,STAIR_NORTH.z1-STAIR_NORTH.z0,H-y0,y0);
 addDark(group,F.dark,solid,'Sakura stairwell darkness');
 const a=new THREE.Object3D();a.position.set(...F.prompt);a.name='Go upstairs';group.add(a);reg(a,'Go upstairs',()=>go('up'),true);
 return {colliders,group};
}

/**
 * The office's end of the stair (office frame): the top landing's last stretch behind the hall, its four treads going down
 * into the dark, the pit under the hall's hole, the stairwell's walls and ceiling, the rail along the hole. `box` is the
 * office builder's (its materials, its merging, its colliders).
 */
export function buildSakuraStairHead({room,box,collider=()=>{},reg=()=>{},go=()=>{}}){
 const P=SAKURA_STAIR_PASSAGE.head,f=P.flight,TIMBER=0x8a6a48,PLASTER=0xece1ca,WOOD=0x8d7458;
 // The top landing's south end, through the opening in the hall's back wall.
 box([-.6-f.x0,.12,-5.5-f.z0],[(f.x0-.6)/2,-.06,(f.z0-5.5)/2],0x947354,'Office timber floor');
 // The stairwell, whole, down to the stockroom (SK-ST-001), and its ceiling behind the hall; solid where its walls are.
 buildSakuraStairwell(room,{storey:'office'});
 box([-.6+5.65,.12,.56],[(-.6-5.65)/2,2.86,-5.78],0xf1eadb,'Stairwell ceiling');
 for(const [x,z,w,d] of [[(-.6-5.65)/2,-6.1,5.05,.08],[-.64,-5.78,.08,.56],[-5.69,-5.78,.08,.56]])collider(x,z,w,d,2.8);
 // The rail along the hole's east edge, between the hall and the pit.
 box([.06,1,1.5],[-2.05,.5,-4.16],TIMBER,'Stair rail',true);
 const solid=(x,z,w,d,height,minY)=>collider(x,z,w,d,height,minY);
 // The pit is solid to a grown-up's height, so nobody walks out over it; under the treads it is only the dark.
 addDark(room,P.dark.slice(0,2),solid,'Sakura stairwell darkness',{over:1.5});addDark(room,P.dark.slice(2),solid,'Sakura stairwell darkness');
 const a=new THREE.Object3D();a.position.set(...P.prompt);a.name='Go downstairs';a.userData.npcInteraction=false;room.add(a);reg(a,'Go downstairs',()=>go('down'),true);
 return a;
}
