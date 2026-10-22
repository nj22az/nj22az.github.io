import * as THREE from '../../../vendor/three.module.js';

/**
 * Sakura's inside stair is a passage, not a place to walk (the owner, 20 October 2026, on his iPhone: "I don't want the
 * stairs to be traversable it's too much errors when running up the stairs, I want the stairs to lead up to a black hole
 * and we disappear into there and when it loads we come up on the upper floor").
 *
 * So the shop and its office are two rooms. In the shop (the market room) the lower flight rises from the stockroom for
 * a complete two-flight stair inside an enclosed well. The bend hides the return flight from the shop.
 * Stepping onto the first tread (or "Go upstairs") walks him up into the dark while the picture fades to black, and the
 * office storey opens as its own room (interiors/sakura-office-room.js), the shop not loaded at all, with him at the stair
 * head in the hall facing up it. Coming down uses the same complete stair behind the fade, and
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
  treads:12,
  // Stepping onto the first tread starts the passage; he can stand at the foot without starting it.
  trigger:Object.freeze({x:Object.freeze([-2.95,-1.92]),z:Object.freeze([-5.12,-4.08])}),
  // Up the first treads into the dark (from wherever he stepped on).
  walk:Object.freeze([Object.freeze([-2.08,RISE,-4.6]),Object.freeze([-2.9,4*RISE,-4.6])]),
  // Coming down he arrives at the foot, a step clear of the first tread, facing the stockroom.
  arrive:Object.freeze({at:Object.freeze([-1.12,0,-4.6]),yaw:-Math.PI/2}),
  prompt:Object.freeze([-1.55,1.1,-4.6]),
  // No black plug: the complete flight ends at a real turning landing and plaster wall.
  dark:Object.freeze([]),
 }),
 /** The office's end, in the office's frame. */
 head:Object.freeze({
  treads:12,
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
function addDark(group,boxes,solid,name,{over=null,visible=true}={}){
 const black=voidMaterial();
 for(const [x0,x1,z0,z1,y0,y1] of boxes){
  const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),black);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=name;m.visible=visible;group.add(m);
  // Solid to the walk and the lens; under a floor, up to `over` so nobody walks out over the pit.
  const top=over??y1;solid((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top-y0,y0);
 }
}

/** Complete stair geometry; passage control remains independent of its visible architecture. */
export function buildSakuraCompleteStair(room,{office=false}={}){
 const group=new THREE.Group();group.name='Sakura complete staircase';room.add(group);
 const timber=new THREE.MeshStandardMaterial({color:0x8d7458,roughness:.88});
 const riser=new THREE.MeshStandardMaterial({color:0x735c46,roughness:.9});
 const stepMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});
 const paintStep=m=>{const g=m.geometry,normal=g.getAttribute('normal'),colors=[];
  for(let j=0;j<normal.count;j++)(normal.getY(j)>.5?timber.color:riser.color).toArray(colors,j*3);
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));m.material=stepMaterial;
 };
 const box=(w,h,d,x,y,z,name,material=timber)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.name=name;group.add(m);return m;};
 // Closed risers fill each step: no floating boards and no black panel terminating the flight.
 for(let i=0;i<12;i++){
  const top=(i+1)*RISE;
  const m=box(TREAD,top,1.1,-1.8-(i+.5)*TREAD,top/2,-4.6,'Sakura lower stair tread',riser);
  paintStep(m);
 }
 const mid=12*RISE;
 box(1.15,.12,2.65,-5.075,mid-.06,-5.375,'Sakura turning landing');
 for(let i=0;i<12;i++){
  const h=(i+1)*RISE;
  const m=box(TREAD,h,1.1,-4.5+(i+.5)*TREAD,mid+h/2,-6.15,'Sakura return stair tread',riser);
  paintStep(m);
 }
 const landingEnd=office?-6.14:-5.6;
 box(1.2,.12,landingEnd+6.7,-1.2,SAKURA_STAIR.height-.06,(-6.7+landingEnd)/2,'Sakura top landing');
 // Wall-mounted rails follow both runs, ending at the landings rather than floating in the doorway.
 const rail=(a,b)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,v.length(),10),timber);
  m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());m.name='Sakura stair handrail';group.add(m);};
 rail([-1.83,.94,-4.12],[-4.47,mid+.88,-4.12]);
 rail([-4.47,mid+1.06,-6.63],[-1.83,SAKURA_STAIR.height+.88,-6.63]);
 return group;
}

/** The shop's framed entrance opens onto the whole stair. Its return is hidden by the central wall. */
export function buildSakuraStairFoot({room,reg=()=>{},go=()=>{}}){
 const group=new THREE.Group();group.name='Sakura internal stairwell';room.add(group);
 const F=SAKURA_STAIR_PASSAGE.foot,colliders=[],H=SAKURA_STAIR.height+2.8;
 const solid=(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY});
 const wood=new THREE.MeshStandardMaterial({color:0x8d7458,roughness:.88}),plaster=new THREE.MeshStandardMaterial({color:0xece1ca,roughness:.9});
 const wall=(x0,x1,y0,y1,z0,z1,name,m=plaster)=>{
  const o=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m);o.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);o.name=name;group.add(o);
  solid((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,y1-y0,y0);
 };
 buildSakuraCompleteStair(group);
 // Full-height enclosure, with a gap round the west end of the central wall for the turning landing.
 wall(-5.7,-1.8,0,H,-4.07,-4.035,'Sakura stair north enclosure');
 wall(-4.5,-1.8,0,H,-5.6,-5.15,'Sakura stair central wall');
 wall(-5.7,-5.65,0,H,-6.83,-4.07,'Sakura stair west enclosure');
 wall(-5.65,-1.8,0,H,-6.83,-6.75,'Sakura stair back enclosure');
 wall(-1.88,-1.72,0,H,-6.75,-5.59,'Sakura stair alcove wall');
 wall(-1.88,-1.8,2.35,H,-5.15,-4.07,'Sakura stair lintel');
 // Close only the approach ceiling. The real stairwell above the flights remains open to its own roof.
 wall(-1.8,-.6,2.98,3.02,-6.86,-4.035,'Sakura stockroom stair soffit');
 wall(-5.7,-1.8,H,H+.04,-6.83,-4.035,'Sakura stairwell roof');
 wall(-1.8,-1.72,0,2.35,-5.23,-5.15,'Sakura stair south jamb',wood);
 wall(-1.8,-1.72,0,2.35,-4.07,-4.035,'Sakura stair north jamb',wood);
 wall(-1.8,-1.72,2.35,2.43,-5.23,-4.035,'Sakura stair head trim',wood);
 // This is still a fade passage, not a traversable stair. The barrier is invisible, beyond the trigger and scripted walk.
 solid(-4.29,-4.6,2.72,1.1,H);
 const a=new THREE.Object3D();a.position.set(...F.prompt);a.name='Go upstairs';group.add(a);reg(a,'Go upstairs',()=>go('up'),true);
 return {colliders,group};
}

/**
 * The office's end (office frame): the complete staircase below its landing, its enclosed well and safety barriers,
 * the stairwell walls and ceiling, and the rail along the hall's opening. `box` is the
 * office builder's (its materials, its merging, its colliders).
 */
export function buildSakuraStairHead({room,box,collider=()=>{},reg=()=>{},go=()=>{}}){
 const P=SAKURA_STAIR_PASSAGE.head,TIMBER=0x8a6a48,PLASTER=0xece1ca;
 // The identical complete staircase, expressed in the office's local frame. Its landing meets the hall floor edge.
 const complete=buildSakuraCompleteStair(room,{office:true});complete.position.set(0,-SAKURA_STAIR.height,-SAKURA_STAIR.officeZ);
 // Close the bottom and the same well's west/north sides; looking down never reveals empty space outside the room.
 box([5.05,.12,2.65],[-3.125,-SAKURA_STAIR.height-.06,-4.735],PLASTER,'Stairwell floor');
 box([.05,SAKURA_STAIR.height+2.8,2.79],[-5.665,(2.8-SAKURA_STAIR.height)/2,-4.8],PLASTER,'Stairwell west wall',true);
 box([3.91,SAKURA_STAIR.height+2.8,.035],[-3.745,(2.8-SAKURA_STAIR.height)/2,-3.4125],PLASTER,'Stairwell north wall',true);
 box([2.7,SAKURA_STAIR.height+2.8,.45],[-3.15,(2.8-SAKURA_STAIR.height)/2,-4.735],PLASTER,'Stairwell central wall',true);
 // The stairwell behind the hall: its back wall (down into the pit), its ends, its ceiling, and a lintel over the opening.
 box([-.6+5.65,7,.08],[(-.6-5.65)/2,-.7,-6.1],PLASTER,'Stairwell wall',true);
 box([.08,2.8,.64],[-.64,1.4,-5.82],PLASTER,'Stairwell wall',true);
 box([.08,2.8,.64],[-5.61,1.4,-5.82],PLASTER,'Stairwell wall',true);
 box([-.6+5.65,.12,.64],[(-.6-5.65)/2,2.86,-5.82],0xf1eadb,'Stairwell ceiling');
 // The rail along the hole's east edge, between the hall and the pit.
 box([.06,1,1.5],[-2.05,.5,-4.16],TIMBER,'Stair rail',true);
 const solid=(x,z,w,d,height,minY)=>collider(x,z,w,d,height,minY);
 // The pit is solid to a grown-up's height, so nobody walks out over it; under the treads it is only the dark.
 addDark(room,P.dark.slice(0,2),solid,'Sakura stairwell safety barrier',{over:1.5,visible:false});addDark(room,P.dark.slice(2),solid,'Sakura stairwell safety barrier',{visible:false});
 const a=new THREE.Object3D();a.position.set(...P.prompt);a.name='Go downstairs';a.userData.npcInteraction=false;room.add(a);reg(a,'Go downstairs',()=>go('down'),true);
 return a;
}
