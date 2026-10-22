import * as THREE from '../../../vendor/three.module.js';

/**
 * Sakura's inside stair is a passage, not a place to walk (the owner, 20 October 2026, on his iPhone: "I don't want the
 * stairs to be traversable it's too much errors when running up the stairs, I want the stairs to lead up to a black hole
 * and we disappear into there and when it loads we come up on the upper floor").
 *
 * So the shop and its office are two rooms. In the shop (the market room) the lower flight rises from the stockroom for
 * five treads inside a framed entrance and goes into recessed darkness, solid to the walk and to the lens.
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
  // Darkness is only the recessed end of the first run, inside the enclosure. No black wall or ceiling in the room.
  dark:Object.freeze([dark(-5.65,-2.93,-5.14,-4.08,0,2.84)]),
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

const inside=(p,{x,z})=>p.x>=x[0]&&p.x<=x[1]&&p.z>=z[0]&&p.z<=z[1];
/** Whether he has stepped onto the stair at the shop's end (shop frame), or at the office's end (office frame). */
export const onSakuraStairFoot=p=>inside(p,SAKURA_STAIR_PASSAGE.foot.trigger)&&Math.abs(p.y)<.5;
export const onSakuraStairHead=p=>inside(p,SAKURA_STAIR_PASSAGE.head.trigger)&&Math.abs(p.y)<.5;

/** A black that reads as nothing: unlit, unshaded, never part of the cel pass or the ink. */
function voidMaterial(){const m=new THREE.MeshBasicMaterial({color:0x000000});m.name='Sakura stairwell darkness';m.userData.darkness=true;return m;}
function addDark(group,boxes,solid,name,{over=null}={}){
 const black=voidMaterial();
 for(const [x0,x1,z0,z1,y0,y1] of boxes){
  const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),black);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=name;group.add(m);
  // Solid to the walk and the lens; under a floor, up to `over` so nobody walks out over the pit.
  const top=over??y1;solid((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top-y0,y0);
 }
}

/**
 * The shop's end: five treads into recessed darkness, an enclosed alcove, timber doorway and stockroom soffit.
 * Returns its colliders (shop frame); the floor transition and office end are unchanged.
 */
export function buildSakuraStairFoot({room,reg=()=>{},go=()=>{}}){
 const group=new THREE.Group();group.name='Sakura internal stairwell';room.add(group);
 const F=SAKURA_STAIR_PASSAGE.foot,colliders=[];
 const solid=(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY});
 const wood=new THREE.MeshStandardMaterial({color:0x8d7458,roughness:.88}),plaster=new THREE.MeshStandardMaterial({color:0xece1ca,roughness:.9});
 const box=(w,h,d,x,y,z,name,m=wood)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;group.add(o);return o;};
 const wall=(x0,x1,y0,y1,z0,z1,name,m=plaster)=>{
  box(x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,name,m);
  solid((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,y1-y0,y0);
 };
 for(let i=0;i<F.treads;i++)box(TREAD,.1,1.1,-1.8-(i+.5)*TREAD,(i+1)*RISE-.05,-4.6,'Sakura lower stair tread');
 // A small shop's enclosed stair, entered from the east: 1.1 m wide, a 2.35 m head, with the first five treads visible.
 // The southern dead alcove is closed by a real wall. The ceiling closes the former two-storey hole, meeting the
 // shell at x -.6 / y 2.98, and stays above the scripted walk's head. Nothing changes the office room or its access.
 wall(-5.7,-1.8,0,2.98,-4.07,-4.035,'Sakura stair north enclosure');
 wall(-5.7,-1.8,0,2.98,-5.23,-5.15,'Sakura stair south enclosure');
 wall(-1.88,-1.8,0,2.98,-6.83,-5.23,'Sakura stair alcove wall');
 wall(-5.7,-1.88,0,2.98,-6.83,-5.23,'Sakura enclosed under-stair space');
 wall(-1.88,-1.8,2.35,2.98,-5.15,-4.07,'Sakura stair lintel');
 wall(-5.7,-.6,2.98,3.02,-6.86,-4.035,'Sakura stockroom stair soffit');
 // Timber linings sit proud of the plaster by centimetres; their ends meet rather than sharing exposed faces.
 wall(-1.8,-1.72,0,2.35,-5.23,-5.15,'Sakura stair south jamb',wood);
 wall(-1.8,-1.72,0,2.35,-4.07,-4.035,'Sakura stair north jamb',wood);
 wall(-1.8,-1.72,2.35,2.43,-5.23,-4.035,'Sakura stair head trim',wood);
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
 for(let i=0;i<P.treads;i++)box([TREAD,.1,f.z1-f.z0],[f.x0-(i+.5)*TREAD,-(i+1)*RISE-.05,(f.z0+f.z1)/2],WOOD,'Sakura upper stair tread');
 // The stairwell behind the hall: its back wall (down into the pit), its ends, its ceiling, and a lintel over the opening.
 box([-.6+5.65,7,.08],[(-.6-5.65)/2,-.7,-6.1],PLASTER,'Stairwell wall',true);
 box([.08,2.8,.64],[-.64,1.4,-5.82],PLASTER,'Stairwell wall',true);
 box([.08,2.8,.64],[-5.61,1.4,-5.82],PLASTER,'Stairwell wall',true);
 box([-.6+5.65,.12,.64],[(-.6-5.65)/2,2.86,-5.82],0xf1eadb,'Stairwell ceiling');
 // The rail along the hole's east edge, between the hall and the pit.
 box([.06,1,1.5],[-2.05,.5,-4.16],TIMBER,'Stair rail',true);
 const solid=(x,z,w,d,height,minY)=>collider(x,z,w,d,height,minY);
 // The pit is solid to a grown-up's height, so nobody walks out over it; under the treads it is only the dark.
 addDark(room,P.dark.slice(0,2),solid,'Sakura stairwell darkness',{over:1.5});addDark(room,P.dark.slice(2),solid,'Sakura stairwell darkness');
 const a=new THREE.Object3D();a.position.set(...P.prompt);a.name='Go downstairs';a.userData.npcInteraction=false;room.add(a);reg(a,'Go downstairs',()=>go('down'),true);
 return a;
}
