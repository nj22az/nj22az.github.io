import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {SEA_LEVEL} from './ocean.js';

/**
 * The oil jetty (油桟橋) at the island's south-east corner, past the fish auction, and the
 * small coastal tanker that brings the island's diesel.
 *
 * A concrete-decked jetty on piles runs out east into deeper water, with a hose crane
 * and the manifold at its head and a pipeline back along it to the fuel depot on the
 * shore: one squat white tank in a bund. The power house at the town hall draws from
 * the depot by truck (Mr Shimabukuro's six trips). Every third day the tanker 第八港油丸
 * comes in from the east, lies alongside from eight until three with its hose connected,
 * and leaves again.
 */
import {OIL_JETTY,TANKER_CALL,oilJettyAt} from './oil-jetty-layout.js';
export {OIL_JETTY,TANKER_CALL,oilJettyAt};

function buildTanker(){
 const kit=createKit({}),g=new THREE.Group();g.name="Coastal tanker 8th Port Aburamaru";
 const L=24,B=5.6;
 // Hull: black below, red topsides, a raked bow and a square stern; deck at 2 m.
 kit.extrude([[-L/2,0],[L/2-3,0],[L/2,1.2],[L/2+.4,2.4],[-L/2,2.4]],B,new THREE.Matrix4().makeTranslation(0,-1,-B/2),0xb8432f);
 kit.extrude([[-L/2,0],[L/2-3,0],[L/2-1.6,.7],[-L/2,.7]],B+.04,new THREE.Matrix4().makeTranslation(0,-1,-B/2-.02),0x2b2b2b);
 kit.box(L-1,.08,B-.2,-.4,1.42,0,0x5f7f6e);
 // The cargo pipe run down the middle, the catwalk over it, the manifold amidships.
 kit.box(L-7,.18,.18,1,1.65,.4,0xd9b23a);kit.box(L-7,.18,.18,1,1.65,-.4,0xd9b23a);
 kit.box(L-7,.06,.9,1,2.25,0,0x8e979a);for(let x=-7;x<10;x+=2)kit.box(.06,.8,.9,x,1.85,0,0x8e979a);
 kit.box(.8,.9,1.2,1,1.9,1.9,0xd9b23a);
 // The white house aft with the bridge, funnel with its red band, mast forward.
 kit.box(5,2.6,B-.6,-L/2+3,2.75,0,0xf2f0ea);kit.box(4,1.4,B-.4,-L/2+3.2,4.75,0,0xf2f0ea);
 kit.box(.06,.7,B-.6,-L/2+5.25,4.8,0,0x2d4a55,{finish:'glow'});
 kit.cyl(.55,.6,2.2,-L/2+1.6,6.4,0,0x2b2b2b,{segments:10});kit.cyl(.61,.61,.5,-L/2+1.6,6.1,0,0xc8102e,{segments:10});
 kit.rod([L/2-3,1.5,0],[L/2-3,7.5,0],.08,0xd9d6cc);
 kit.finish(g,'Tanker');
 return g;
}

export function buildOilJetty(world,{register,onAction,shadows=false}={}){
 const group=new THREE.Group();group.name='Oil jetty';world.group.add(group);
 const kit=createKit({shadows}),J=OIL_JETTY,D=J.deck,H=J.head,concrete=0xb7b5ab,steel=0x8e979a;
 // Piles, the deck and its kerb, the head platform with its fenders.
 for(let x=D.minX+2;x<=H.maxX-.5;x+=3)for(const z of [D.minZ+.2,D.maxZ-.2])kit.cyl(.22,.22,2.4,x,D.y-1.2,z,0x8e8a80,{segments:8});
 kit.block(D.minX,D.maxX,D.y-.35,D.y,D.minZ,D.maxZ,concrete);
 kit.block(H.minX,H.maxX,D.y-.35,D.y,H.minZ,H.maxZ,concrete);
 for(const z of [D.minZ,D.maxZ-.15])kit.block(D.minX+1,D.maxX,D.y,D.y+.15,z,z+.15,0xe0b93a);
 for(let x=H.minX+.6;x<H.maxX;x+=1.6)kit.cyl(.3,.3,.9,x,D.y-.4,H.minZ-.2,0x1f2124,{rx:Math.PI/2,segments:10});
 for(const x of [H.minX+.6,H.maxX-.6])kit.cyl(.16,.2,.42,x,D.y+.21,H.minZ+.35,0x3a3f42,{segments:10});
 // The pipeline: two lines on stools along the north kerb, from the head to the depot.
 for(const dz of [.25,.55]){kit.rod([H.minX+1.5,D.y+.35,D.maxZ-dz],[J.depot.x+1.6,D.y+.35,D.maxZ-dz],.07,0xd9b23a);}
 for(let x=D.minX;x<H.minX+1.5;x+=2.5)kit.box(.12,.3,.5,x,D.y+.15,D.maxZ-.4,steel);
 // The manifold and the hose crane at the head.
 kit.box(1.2,.8,.8,H.minX+1.6,D.y+.4,H.maxZ-.8,0xd9b23a);
 kit.cyl(.18,.22,4,H.maxX-1.2,D.y+2,H.maxZ-1,steel,{segments:10});
 kit.rod([H.maxX-1.2,D.y+3.8,H.maxZ-1],[H.maxX-1.2,D.y+3.2,H.minZ-1.2],.08,0xd9b23a);
 kit.rod([H.maxX-1.2,D.y+3.2,H.minZ-1.2],[H.maxX-1.2,D.y+.6,H.minZ-1.4],.06,0x2b2b2b);
 // The depot: one fuel tank on the shore, its bund, the ladder, the 危険物 board.
 const T=J.depot;
 kit.cyl(T.r,T.r,T.h,T.x,T.h/2,T.z,0xeeece4,{segments:20});kit.cyl(T.r+.05,T.r-.3,.4,T.x,T.h+.2,T.z,0xd8d4c8,{segments:20});
 kit.box(.06,T.h,.4,T.x+T.r+.05,T.h/2,T.z,steel);
 for(const [x0,x1,z0,z1] of [[T.x-2.6,T.x+2.6,T.z-2.6,T.z-2.45],[T.x-2.6,T.x+2.6,T.z+2.45,T.z+2.6],[T.x-2.6,T.x-2.45,T.z-2.6,T.z+2.6],[T.x+2.45,T.x+2.6,T.z-2.6,T.z+2.6]])kit.block(x0,x1,0,.6,z0,z1,0xc8c2b5);
 kit.box(1.2,.5,.03,T.x,1.6,T.z+T.r+.02,0xc8102e);
 kit.finish(group,'Oil jetty');
 world.colliders.push({id:'fuel-depot',x:T.x,z:T.z,w:5.2,d:5.2,height:3.4},{id:'jetty-manifold',x:H.minX+1.6,z:H.maxZ-.8,w:1.3,d:.9,height:1},{id:'jetty-crane',x:H.maxX-1.2,z:H.maxZ-1,w:.5,d:.5,height:4});
 const tanker=buildTanker();tanker.visible=false;group.add(tanker);
 const anchor=(x,z,label,fn)=>{const o=new THREE.Object3D();o.position.set(x,1.2,z);o.name=label;group.add(o);register?.(o,label,fn);};
 anchor(T.x+2.8,T.z+2.8,'Read the depot board',()=>onAction?.('read',"Minato fuel depot · Port Town Fuel Base","Hazardous materials · No open flames allowed. Diesel oil (Light oil), 120 kilolitres. Filled from the tanker at the oil jetty every third day; drawn by the town truck for the power house at the town hall. In a typhoon the valves are closed and the jetty is out of bounds."));
 anchor(H.minX+1,H.minZ+.8,'Look at the tanker berth',()=>onAction?.('inspect','The tanker berth',tanker.visible?"8th Port Aburamaru is alongside, rust-streaked red with a white house aft. A hose as thick as your arm runs from her manifold up the crane and into the jetty's pipeline, and the deck smells of diesel. Her crew of four are playing cards in the shade of the bridge.":"Nobody alongside. Fender tyres, a coil of mooring rope, and a chalkboard: Next port arrival -- next call, the day after tomorrow at eight."));
 const start=new THREE.Vector3(140,SEA_LEVEL,-70),berth=new THREE.Vector3(J.berth.x,SEA_LEVEL,J.berth.z);
 return {group,tanker,update(dt,minutes,time=0){
  const day=Math.floor(minutes/1440),m=((minutes%1440)+1440)%1440,C=TANKER_CALL;
  if(day%C.every!==0||m<C.arrive-C.passage||m>C.leave+C.passage){tanker.visible=false;return;}
  tanker.visible=true;
  let u=1;if(m<C.arrive)u=1-(C.arrive-m)/C.passage;else if(m>C.leave)u=1-(m-C.leave)/C.passage;
  u=u*u*(3-2*u);
  tanker.position.lerpVectors(start,berth,u);tanker.position.y=SEA_LEVEL+.05*Math.sin(time*.8);
  tanker.rotation.y=Math.PI+(1-u)*.25;
 }};
}
