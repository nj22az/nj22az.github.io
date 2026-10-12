import {isWeekend} from '../commerce/sakura-rota.js';
import {buildCountryside} from './countryside.js';
import {buildQuietLife} from './quiet-life.js';
import {buildTownPower} from './town-power.js';
import {beginPowerPlan} from './okinawa/props.js';
import {buildParkAccess} from './park-access.js';
import {buildDocklandsLife} from './docklands-life.js';
import {addSakuraFlyer} from './sakura-flyers.js';
import {buildIslandLandscape} from './island-landscape.js';
import {buildTraditionalGarden} from './traditional-garden.js';
import {createTownTraffic} from './town-traffic.js';
import {buildKitanoLink} from './kitano-link.js';
import {buildOilJetty} from './oil-jetty.js';
import {GROUND} from '../render/ground-palette.js';
import {buildBicycle} from './bicycle.js';
import {registerDetail} from './detail-stream.js';
import {buildPark,parkFoliage,preloadPark} from './park.js?snappy=1';
import {buildIzakaya} from './izakaya.js?snappy=1';
import {buildStaffBench} from './staff-bench.js';
import {batchStaticProps} from '../render/static-props.js';
import {WORLD_CAST} from '../people/residents.js';
import {IZAKAYA_DOOR} from './dining-layout.js';
import {izakayaOpen} from '../people/social.js';
import {OUTER_PIER,QUAY_SOUTH,groundHeight} from './layout.js?snappy=1';
import {MINATO_BERTH,CARGO_BERTH} from './minato-berth.js';
import {buildStreetFurniture} from './street-furniture.js';
import {ishiganto,stopMarking,roadSign,edgeLines} from './road-standards.js';
import {KITAHAMA} from './kitahama-layout.js';
import {COAST_ROAD} from './island-plan.js';
import {lanePatches} from './lane-surfaces.js?snappy=1';
import {buildParkOnsen} from './park-onsen.js';
import {buildSchool} from './school.js';
import {buildDistricts} from './districts.js?snappy=1';
import * as THREE from '../../vendor/three.module.js';
import {BUS_STATION} from './bus-station.js';
import {paintedTurf} from '../render/toy-surfaces.js';
import {GROUND_LAYER} from './ground-layers.js';
import { createTown as createBaseTown } from './harbour.js?snappy=1';
import { createPropFactory, createLivingProps } from '../../prop-factory.js';
import {buildStreetPlants,preloadStreetPlants} from './street-plants.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import {buildSakuraBench} from './sakura-bench.js';
import {applyShopAddresses} from './town-grid.js';
import {izakayaPlot} from './dining-layout.js';
import {buildBeachLife} from './beach-life.js';
import {buildBeachCorner} from './beach-corner.js';
import {buildPortShed} from './port-shed.js';
import {createHomeLights} from './home-lights.js';
import {buildBreakwaters} from './breakwaters.js';
import {buildAirportIsland} from './airport-island.js';
import {buildEastLawn} from './east-lawn.js';
import {buildWestYard} from './west-yard.js';
import {buildForestEdge} from './forest-edge.js';
import {buildCoyoteTunnel,CAVE_ACTIVE} from './coyote-tunnel.js';
import {buildOkinawaQuarters} from './okinawa/quarters.js';
import {createFerryRun} from './ferry.js';
import {windowGlow} from '../render/dusk.js';
import {setWindowLight} from '../render/window-interior.js';
import {isOceanMaterial,tickOcean} from './ocean.js';

// Johansson Town district composition and street interactions.
// Resource discovery is guided by Fasani/three-js-resources. Production runtime
// assets remain local and every sourced element has a deterministic procedural fallback.

function anchor(parent,pos,label,fn,register){
  const a=new THREE.Object3D();a.position.set(...pos);parent.add(a);register?.(a,label,fn);return a;
}

function replaceCableLines(group,mobile){
  const lines=[];group.traverse(o=>{if(o.isLine&&!o.userData.dynamicProp&&o.geometry?.getAttribute('position'))lines.push(o);});if(!lines.length)return 0;
  const segments=[],a=new THREE.Vector3(),b=new THREE.Vector3();
  for(const line of lines){
    const pos=line.geometry.getAttribute('position');
    for(let i=0;i<pos.count-1;i++){
      a.fromBufferAttribute(pos,i);b.fromBufferAttribute(pos,i+1);line.localToWorld(a);line.localToWorld(b);group.worldToLocal(a);group.worldToLocal(b);segments.push({a:a.clone(),b:b.clone()});
    }
  }
  const unit=new THREE.CylinderGeometry(1,1,1,6,1,false),mat=new THREE.MeshBasicMaterial({color:0x20292b}),cables=new THREE.InstancedMesh(unit,mat,segments.length);
  cables.name='stable-overhead-cables';cables.castShadow=false;cables.receiveShadow=false;cables.frustumCulled=true;
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),mid=new THREE.Vector3(),dir=new THREE.Vector3(),radius=mobile?.021:.018;
  segments.forEach((s,i)=>{dir.subVectors(s.b,s.a);const len=dir.length();mid.copy(s.a).add(s.b).multiplyScalar(.5);dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(up,dir.normalize());dummy.scale.set(radius,len,radius);dummy.updateMatrix();cables.setMatrixAt(i,dummy.matrix);});
  cables.instanceMatrix.needsUpdate=true;group.add(cables);
  for(const line of lines){line.parent?.remove(line);line.geometry?.dispose();if(Array.isArray(line.material))line.material.forEach(m=>m.dispose?.());else line.material?.dispose?.();}
  return segments.length;
}

function addWithCollider(group,colliders,entry){
  if(!entry)return null;group.add(entry.object);if(entry.collider){const bounds=new THREE.Box3().setFromObject(entry.object);entry.collider.height=bounds.max.y;entry.collider.minY=bounds.min.y;colliders.push(entry.collider);}return entry.object;
}

function addWalkablePier(world,options,factory){
  const group=world.group,colliders=world.colliders,dark=0x354144,steel=0x4a595c,concrete=0x8c918b,warning=0xb79a55;
  // The block is the pier's mass; the detailed deck is a separate plane laid on top,
  // and the two used to be three millimetres apart. Sink the block far enough that the
  // deck plainly wins, and let the deck and the two rails cover its top between them,
  // so the face underneath is never the one you see.
  factory.box(group,[OUTER_PIER.width,.38,OUTER_PIER.length],[OUTER_PIER.x,OUTER_PIER.height-.025-.19,OUTER_PIER.z],concrete,null,options.shadows);
  // The coping along both flanks and across the end, the pier's whole length (to z -88 since it was
  // lengthened). On the west flank, the ferry's berthing face, it stops either side of the ladder's recess.
  const B=MINATO_BERTH,copingY=OUTER_PIER.height+.02-.28,north=OUTER_PIER.z+OUTER_PIER.length/2+.075,south=OUTER_PIER.z-OUTER_PIER.length/2-.075;
  const recess=[B.ladder.z+B.ladder.width/2+.05,B.ladder.z-B.ladder.width/2-.05];
  for(const [a,b] of [[north,recess[0]],[recess[1],south]])factory.box(group,[.34,.56,a-b],[-4.02,copingY,(a+b)/2],dark,null,options.shadows);
  factory.box(group,[.34,.56,OUTER_PIER.length+.15],[4.02,copingY,OUTER_PIER.z],dark,null,options.shadows);
  factory.box(group,[8.2,.58,.42],[0,OUTER_PIER.height+.02-.29,B.end.z+.11],dark,null,options.shadows);
  const posts=[];
  // No side rails: both flanks are berths now, the ferry's on the west and the cargo boat's on the
  // east (batch 4b), and a berthing face carries fenders and bitts; a rail would foul the lines and
  // stand across the gangway. The end has its rail.
  // The berthing face (minato-berth.js): V-type rubber fenders on steel backing plates, bolted upright to the
  // coping face where her side lies; she lies on their faces.
  // The same on the east face for the island cargo boat (CARGO_BERTH), mirrored.
  {const F=B.fenders,profile=out=>{const shape=new THREE.Shape();shape.moveTo(0,-F.base/2);shape.lineTo(out*F.depth,-F.front/2);shape.lineTo(out*F.depth,F.front/2);shape.lineTo(0,F.base/2);shape.closePath();
    const g=new THREE.ExtrudeGeometry(shape,{depth:F.length,bevelEnabled:false});g.rotateX(Math.PI/2);return g;};
   const west=profile(-1),east=profile(1),rubber=factory.material(null,0x1d2324,.95,0);
   for(const [face,side,list] of [[B.face,1,F.z],[CARGO_BERTH.face,-1,CARGO_BERTH.fenders.z]])for(const z of list){
    const fender=new THREE.Mesh(side>0?west:east,rubber);fender.position.set(face,F.top,z);fender.name='V-type fender';fender.castShadow=options.shadows;fender.receiveShadow=options.shadows;fender.userData.staticProp=true;group.add(fender);
    factory.box(group,[.03,F.length+.06,F.base+.1],[face-side*.015,F.top-F.length/2,z],steel,null,false);
   }}
  // The bitts for the lines, on both edges: a cast post with a flared head and two horns along the face
  // that keep a line from riding up, painted black.
  for(const {x,z} of [...B.bitts,...CARGO_BERTH.bitts]){
    factory.cylinder(group,.19,.46,[x,OUTER_PIER.height+.23,z],0x262c2e,14);factory.cylinder(group,.27,.08,[x,OUTER_PIER.height+.5,z],0x262c2e,14);
    factory.box(group,[.13,.05,.62],[x,OUTER_PIER.height+.44,z],0x262c2e);colliders.push({x,z,w:.56,d:.64});
  }
  // The ladder in its recess in the face, from the deck's edge to below low water.
  {const L=B.ladder,x=OUTER_PIER.x-OUTER_PIER.width/2-.03;
   for(const dz of [-L.width/2+.04,L.width/2-.04])factory.beam(group,[x,OUTER_PIER.height,L.z+dz],[x,L.bottom,L.z+dz],.025,warning,8,null,false);
   for(let y=OUTER_PIER.height-.2;y>L.bottom;y-=.3)factory.beam(group,[x,y,L.z-L.width/2+.04],[x,y,L.z+L.width/2-.04],.018,warning,8,null,false);}
  // The end rail across the pier's new end.
  for(const x of [-3.92,-1.3,1.3,3.92])factory.cylinder(group,.065,1,[x,.62,B.end.rail],steel,10);
  for(const x of [-3.92,-1.3,1.3])factory.beam(group,[x,1.06,B.end.rail],[x+2.62,1.06,B.end.rail],.045,steel);
  // The ladder on the east face, between the cargo boat's fenders.
  factory.beam(group,[3.86,.72,-58.1],[3.86,-.75,-58.1],.035,warning,8,null,false);
  factory.beam(group,[3.86,.72,-58.7],[3.86,-.75,-58.7],.035,warning,8,null,false);
  for(let y=.55;y>-.65;y-=.23)factory.beam(group,[3.86,y,-58.1],[3.86,y,-58.7],.028,warning,8,null,false);

  // The anglers' corner at the end.
  const A=B.anglers;
  addWithCollider(group,colliders,factory.baitStation(A.bait[0],A.bait[1],.03));
  addWithCollider(group,colliders,factory.pierWinch(A.winch[0],A.winch[1],-.08));
  addWithCollider(group,colliders,factory.crateStack(A.crates[0],A.crates[1],.06));

  const ropeMat=factory.material(null,0x9b825e,.92,0);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34+i*.06,.04,6,18),ropeMat);ring.rotation.x=Math.PI/2;ring.rotation.z=i*.17;ring.position.set(A.rope[0],.16+i*.03,A.rope[1]);ring.castShadow=false;group.add(ring);
  }
  // A lifebuoy hung on the end rail's inner side, where the anglers are.
  {const buoy=new THREE.Group();buoy.position.set(A.lifebuoy[0],.78,A.lifebuoy[1]);group.add(buoy);
   for(let i=0;i<4;i++){const arc=new THREE.Mesh(new THREE.TorusGeometry(.3,.07,8,10,Math.PI/2),factory.material(null,i%2?0xf1ece0:0xd9542e,.8,0));arc.rotation.z=i*Math.PI/2;arc.castShadow=false;arc.userData.staticProp=true;buoy.add(arc);}}

  for(const z of B.lamps){
    factory.cylinder(group,.07,3.1,[0,1.65,z],steel,10);
    factory.box(group,[.68,.12,.24],[0,3.05,z],steel);
    const lampMat=factory.material(null,0xd9ad68,.78,0,0xd9ad68,.32),lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.20),lampMat);lamp.position.set(0,2.88,z);lamp.castShadow=false;group.add(lamp);
  }

  anchor(group,[A.fishing[0],1,A.fishing[1]],'Fish from the outer pier',()=>options.onAction?.('fishing'),options.register);
  anchor(group,[A.bait[0],1.1,A.bait[1]+.75],'Inspect bait station',()=>options.onAction?.('inspect','Harbour bait station','Ice, hooks, sinkers and bait tins are arranged for the evening fishermen. The counter is scarred by years of salt water.'),options.register);
  anchor(group,[A.winch[0]-.05,1,A.winch[1]+.65],'Operate pier winch',()=>options.onAction?.('machine','Pier winch','A compact electric winch at the end of the pier, for hauling a basket of catch or a skiff up from the water. The guarded drum turns slowly during a test cycle.'),options.register);
  anchor(group,[A.rope[0],.8,A.rope[1]+.6],'Inspect mooring rope',()=>options.onAction?.('inspect','Mooring rope','Heavy natural-fibre rope has been coiled neatly after the morning fishing boats departed.'),options.register);
  return {posts:posts.length,collidersAdded:B.bitts.length+CARGO_BERTH.bitts.length+3};
}

function addSiteFrontage(world,options,factory,lights){
  const group=world.group,colliders=world.colliders;let interactions=0;
  const inspect=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('inspect',title,text),options.register);interactions++;};
  (options.sites||[]).forEach((s,i)=>{
    // Only the shops that stand on the main street get a street front; the school and
    // the like have no side of the street to stand on.
    if(s.id==='market'||world.harbourShops.some(shop=>shop.id===s.id)||!Number.isFinite(s.side))return;
    const side=s.side,x=side*6.88,z=s.z+2.55,frontRot=side<0?Math.PI/2:-Math.PI/2;
    factory.box(group,[.72,.025,1.2],[x,.15,z],0x5e5549,'timber',false);
    const awn=addWithCollider(group,colliders,factory.awning(side*6.95,s.z+1.2,frontRot,i%3===0?0x65766f:i%3===1?0x7b5e54:0x596b73));
    addWithCollider(group,colliders,factory.noren(side*6.90,s.z+2.08,frontRot,i%2?0x5c6571:0x78615c));
    if(i%2===0)addWithCollider(group,colliders,factory.airConditioner(side*7.15,s.z-1.25,frontRot));
    const px=side*6.48,pz=s.z+3.78;world.plantSites.push({x:px,z:pz,height:1.1});colliders.push({x:px,z:pz,w:.52,d:.52});
    const lantern=factory.box(group,[.24,.44,.24],[side*6.88,2.58,s.z+1.68],0xd7a45f,null,false);lantern.material=factory.material(null,0xd7a45f,.8,0,0xd7a45f,.28);
    if(options.shadows&&!options.mobile){const l=new THREE.PointLight(0xffbd77,0,5.2,2);l.position.copy(lantern.position);group.add(l);lights.push(l);}
    inspect([side*6.18,1,s.z+.72],`Inspect ${s.title} window`,`${s.title} display`,`${s.line} The display includes handwritten price cards, paper notices and period shop fittings.`);
    if(awn)awn.userData.site=s.id;
  });
  return interactions;
}

function addStreetLife(world,options,factory){
  const group=world.group,colliders=world.colliders,lights=[];let interactions=addSiteFrontage(world,options,factory,lights);
  const inspect=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('inspect',title,text),options.register);interactions++;};
  const read=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('read',title,text),options.register);interactions++;};
  const seat=(pos,label,title,text)=>{const marker=anchor(group,pos,label,()=>options.onAction?.('seat',title,text),options.register);marker.userData.seat={position:[2.05,0,17.02],stand:[.85,0,16.1],surfaceY:.62,eyeY:1.26,yaw:0,pitch:0};interactions++;};
  const machine=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('machine',title,text),options.register);interactions++;};

  addWithCollider(group,colliders,factory.bench(2.05,17.1,0));
  seat([.85,.85,16.1],'Sit on neighbourhood bench','Neighbourhood bench','From here the shop signs, bicycles and overhead cables make the street feel almost domestic.');

  addWithCollider(group,colliders,factory.postbox(2.4,16.4,Math.PI/2));
  inspect([1.75,1,16.4],'Inspect post box','Post box','The collection plate lists two pickups: 10:30 and 16:30. A few handwritten postcards are visible through the slot.');
  addWithCollider(group,colliders,factory.noticeBoard(5.5,-37.3,0));
  addSakuraFlyer(group,{position:[5.87,1.55,-37.215],width:.43});
  anchor(group,[5.5,1,-36.6],'Read Thuan’s shop flyer · harbour notice board',()=>options.onAction?.('sakura-flyer','Harbour notice board'),options.register);interactions++;

  addWithCollider(group,colliders,factory.utilityCabinet(3.7,13.8,0));// The east footway leaves the freight pullout clear.
  inspect([2.9,1,13.2],'Inspect utility cabinet','Street utility cabinet','Telephone and power distribution diagrams are tucked behind the inspection glass.');

  // Thuan's bicycle stands on the west footway, a short walk from Sakura, as an interactive ride.
  // On the west footway, between Sakura's front and the kerb (the carriageway is narrower now).
  const bicycleSpot=({x:-5.8,z:-23.2});
  const bicycle=buildBicycle({...bicycleSpot,shadows:options.shadows,animated:true});
  bicycle.object.name="Thuan's commuter bicycle";
  addWithCollider(group,colliders,bicycle);
  anchor(bicycle.object,[1,.9,0],'Ride Thuan’s bicycle',()=>options.onAction?.('bicycle',bicycle),options.register);
    interactions++;

  addWithCollider(group,colliders,factory.convexMirror(-7.4,6.2,.02));
  inspect([-6.85,1,5.7],'Inspect traffic mirror','Convex traffic mirror','The mirror gives a broad view of the narrow side street and helps cyclists see around the corner.');
  // Moved along the pavement, not across it. These stood at z=-19.8, which the cedar
  // bench was later placed across: the bench runs to x=5.07 and the bins began at 4.52,
  // so half a metre of it grew out of a bin. Going east instead would have put them on
  // the middle of the walk beside the park, so they go south of the bench.
  const recycleGroup=new THREE.Group();recycleGroup.position.set(5.05,0,-21.7);group.add(recycleGroup);
  for(const [dx,c] of [[-.28,0x4c6f62],[.28,0x6a6651]]){factory.cylinder(recycleGroup,.25,.78,[dx,.49,0],c,10);factory.box(recycleGroup,[.54,.08,.54],[dx,.91,0],0x384547);}colliders.push({x:5.05,z:-21.7,w:1.1,d:.65});
  inspect([4.55,1,-21.2],'Inspect recycling bins','Neighbourhood recycling','Glass bottles are separated from steel cans. The labels are faded from sun and salt air.');

  // (The harbour hand pump that stood by the ferry's ramp head is gone: the creator, 2026-10-11, cleared the ramp's
  // approach of everything in the way.)

  return {interactions,lights,bicycle};
}

/** Paint the actual coastal paving, including its graded garden-bank triangles. */
function addCoastalRoadPaint(world){
 const road=world.group.getObjectByName('island-coastal-road'),group=world.group.getObjectByName('Road standards');
 if(!road||!group)return;
 road.updateWorldMatrix(true,false);
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),origin=new THREE.Vector3();
 const heightAt=(x,z)=>{ray.set(origin.set(x,32,z),down);const floor=ray.intersectObject(road,false)[0];return (floor?.point.y??groundHeight(x,z))-.03;};
 // edgeLines adds 35 mm itself; these marks finish 5 mm above their drawn floor.
 edgeLines(group,COAST_ROAD.slice(0,2),{width:2.6,heightAt});
 edgeLines(group,COAST_ROAD.slice(1),{width:5,heightAt});
}

function findSea(group){let sea=null;group.traverse(o=>{if(o.isMesh&&(o.name==='Island surrounding sea'||o.name==='Harbour basin')){if(!sea||o.name==='Harbour basin')sea=o;}});return sea;}

/** Whether a point lies under the paving the lane builder lays. */
function pavedAt(){
  const patches=lanePatches();
  return (x,z)=>patches.some(p=>x>=p.x0-.01&&x<=p.x1+.01&&z>=p.z0-.01&&z<=p.z1+.01);
}

export function createTown(options){
  izakayaPlot();
  beginPowerPlan();
  applyShopAddresses(options.sites);
  const world=createBaseTown(options);
  // Only the street cast lives in the playable town; nothing else may arrive as a person.
  for(const person of world.people)person.g?.removeFromParent();
  world.people.length=0;
  const forestEdge=buildForestEdge({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows,trees:!true});
  world.forestEdge=forestEdge;
  // The road out of town ends at the Minato Tunnel through the headland, which only the
  // bus goes through. See coyote-tunnel.js.
  // Without the cave there is no footpath up to it either.
  if((!CAVE_ACTIVE)){
   forestEdge.group.removeFromParent();
   // The old terminus at the top of Main Street stays at the street's height -- it is the
   // way round to the police box -- as a lawn on a low bank, over the island ground.
   const B=BUS_STATION,turf=new THREE.MeshStandardMaterial({color:GROUND.grass,roughness:1});
   try{const map=paintedTurf().clone();map.needsUpdate=true;map.repeat.set(1/6,1/6);turf.map=map;}catch{}
   const bank=new THREE.Mesh(new THREE.BoxGeometry(B.maxX-B.minX,.42,B.maxZ-B.minZ),[0,1,2,3,4,5].map(i=>i===2?turf:new THREE.MeshStandardMaterial({color:0x8e8a78,roughness:1})));
   bank.position.set((B.minX+B.maxX)/2,GROUND_LAYER.grass-.21,(B.minZ+B.maxZ)/2);bank.name='Main Street end lawn';bank.receiveShadow=true;world.group.add(bank);
  }
  if(CAVE_ACTIVE)world.tunnel=buildCoyoteTunnel({parent:world.group,colliders:world.colliders,
    register:options.register,onAction:options.onAction,shadows:options.shadows});
   // The port is north, the shops are west; the east is the green side of the town and
   // the west is the working one, with the shop and the warehouse standing on it.
   world.westYard=buildWestYard({parent:world.group,colliders:world.colliders,shadows:options.shadows});
   // Nobody drives onto an island: the ferry calls at the outer pier. See ferry.js.
   world.ferry=createFerryRun({parent:world.group,colliders:world.colliders,shadows:options.shadows,register:options.register,onAction:options.onAction});
   // Kitano Road and Kitano Bridge to the airport island, and the traffic on them: the car
   // ferry's vehicles and the island's own cars. See kitano-link.js and town-traffic.js.
   world.kitanoLink=buildKitanoLink({parent:world.group,colliders:world.colliders,shadows:options.shadows});
   world.traffic=createTownTraffic({parent:world.group,colliders:world.colliders,ferry:world.ferry,getPlayerPosition:options.getPlayerPosition,people:()=>world.people||[],register:options.register,onAction:options.onAction});
   world.eastLawn=buildEastLawn({parent:world.group,colliders:world.colliders,shadows:options.shadows,anisotropy:options.maxAnisotropy||4,
    heightAt:groundHeight,paved:pavedAt(),register:options.register,onAction:options.onAction});
   // Crabs on the wet sand below the wall and fish leaping offshore. See beach-life.js.
   world.beachLife=buildBeachLife({parent:world.group,shadows:options.shadows});
   // A quiet corner at the north end to sit and listen to the sea. See beach-corner.js.
   world.beachCorner=buildBeachCorner({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows});
   // Mr Fujita's shed on the working pier, where he watches the ballgame with a beer. See port-shed.js.
   world.portShed=buildPortShed({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows,getPlayerPosition:options.getPlayerPosition});
   // Kitahama's windows light when the people who live there are in and up. See home-lights.js.
   world.homeLights=createHomeLights({people:()=>world.people});
   // Tetrapods at the foot of the west seawall and two breakwaters off the east beach.
   world.breakwaters=buildBreakwaters({parent:world.group,shadows:options.shadows});
   // Kitano-jima, the airport island on the horizon to the east. See airport-island.js.
   world.airportIsland=buildAirportIsland({parent:world.group,shadows:options.shadows});
   world.oilJetty=buildOilJetty(world,{register:options.register,onAction:options.onAction,shadows:options.shadows});
   // The lawn wears the supplied park's own grass, so the green and the mound it runs
   // up to are one field. The park model is streamed, and the lawn reaches further
   // north than the park's own radius, so it asks for the asset on its own account.
   // Minato school, through the gate at the lawn's south end. See school.js.
   world.school=buildSchool(world,{register:options.register,onAction:options.onAction,enter:options.enter,sites:options.sites,shadows:options.shadows});
   // Umi-no-yu, on the flat of the lawn below the park. See park-onsen.js.
   world.onsen=buildParkOnsen(world,{register:options.register,onAction:options.onAction,enter:options.enter,sites:options.sites,shadows:options.shadows});
   // The streets that fill the rest of the island in: Nishi-machi behind the west
   // yard, and shop-houses along both kerbs of Main Street. See okinawa/layout.js.
   world.quarters=buildOkinawaQuarters(world,{register:options.register,onAction:options.onAction,shadows:options.shadows});
   // The standard street furniture: chain bollards along the sea wall, brick planters at
   // the crossings. Laid last, so it can step round everything already standing.
   // See street-furniture.js.
   world.streetFurniture=buildStreetFurniture({parent:world.group,colliders:world.colliders,heightAt:groundHeight,shadows:options.shadows});
   // Public roads to the 1997 standard beyond Main Street (road-standards.js): Kitahama's
   // T-junctions get their ishiganto and the approach its stop control; the coastal road
   // gets its white edge lines.
   {
    const g=new THREE.Group();g.name='Road standards';world.group.add(g);const ky=KITAHAMA.y;
    for(const [x,z,ry] of [[43.3,67.88,Math.PI],[23.5,64.12,0],[11.5,67.88,Math.PI]])ishiganto(g,{x,z,y:ky,ry});
    stopMarking(g,{x:43.3,z:63.7,y:ky,width:KITAHAMA.approach.maxX-KITAHAMA.approach.minX});
    roadSign(g,'stop',{x:KITAHAMA.approach.minX+.22,z:63.2,y:ky,ry:Math.PI,colliders:world.colliders});

   }
   if(!world.eastLawn.useParkGreenery(parkFoliage()))registerDetail(world,{id:'east-lawn-grass',x:19,z:-6,radius:64,load:async()=>
    await preloadPark()&&world.eastLawn.useParkGreenery(parkFoliage())});
  const factory=createPropFactory({shadows:options.shadows,maxAnisotropy:options.maxAnisotropy});
  const cableSegments=replaceCableLines(world.group,options.mobile),pier=addWalkablePier(world,options,factory),street=addStreetLife(world,options,factory),sea=findSea(world.group);
  // The street's lamp lights, for a renderer that sets the hour once (src/scene/scene-world.js) rather than ticking the town.
  world.streetLights=street.lights;
  world.bicycle=street.bicycle;
  world.docklandsLife=buildDocklandsLife(world,options);
  buildSakuraBench(world,{shadows:options.shadows,register:options.register,onAction:options.onAction,factory});
  // Thuan's break. Only the island has a yard behind the shop to put it in.
  world.staffBench=buildStaffBench({parent:world.group,factory,colliders:world.colliders,
   shadows:options.shadows,register:options.register,onAction:options.onAction});
  const originalSites=[...options.sites],districts=buildDistricts(world,options);
  world.islandLandscape=buildIslandLandscape({world,register:options.register,onAction:options.onAction,mobile:options.mobile});addCoastalRoadPaint(world);world.traditionalGarden=buildTraditionalGarden({world,register:options.register,onAction:options.onAction});world.parkAccess=buildParkAccess(world,{register:options.register,onAction:options.onAction});world.powerNetwork=buildTownPower(world,{register:options.register,onAction:options.onAction,shadows:options.shadows});world.quietLife=buildQuietLife(world);world.countrysideLife=buildCountryside({world,register:options.register,onAction:options.onAction,mobile:options.mobile});
  const isOpen=(site,minutes)=>{if(!site)return false;if(['office','warehouse','bus-station','ferry-terminal'].includes(site.id))return true;const h=((minutes%1440)+1440)%1440;if(site.id==='izakaya')return izakayaOpen(h);if(site.industrialWorkshop)return h>=540&&h<1140;if(site.id==='market')return true;if(site.id==='frontrow'&&isWeekend(minutes))return false;const close=site.id==='frontrow'?1110:site.id==='sento'||site.id==='ramen'?1260:1140;return h>=540&&h<close;};
  // Minato's regular comes back with them: he lives in the izakaya and keeps it
  // company when it is shut (people/izakaya-hours.js), so it is never empty.
  for(const profile of WORLD_CAST){
   const spawn=profile.name==='Barfly'?[IZAKAYA_DOOR[0],IZAKAYA_DOOR[1]]:profile.work;
   let p=world.people.find(p=>p.g.userData.name===profile.name);if(!p){const g=new THREE.Group();g.userData.name=profile.name;g.position.set(spawn[0],groundHeight(...spawn),spawn[1]);world.group.add(g);p={g,x:g.position.x,z:g.position.z,index:world.people.length,legs:[],arms:[]};world.people.push(p);options.register(g,'Talk to '+profile.name,()=>options.onAction('resident',profile.name));}p.profile=profile;p.g.position.set(spawn[0],groundHeight(...spawn),spawn[1]);
  }
  for(const s of originalSites){if(world.harbourShops.some(shop=>shop.id===s.id)||!Number.isFinite(s.side))continue;const panel=new THREE.Mesh(new THREE.BoxGeometry(.16,2.5,1.4),factory.material(null,s.color,.9));panel.position.set(s.side*7.05,4.8,s.z+2.55);world.group.add(panel);districts.shutters.push({mesh:panel,id:s.id});}
  // The island keeps the park and the port; the dining lane and the izakaya are
  // switched off with the rest of the buildings.
  // The dining lane belongs to the old street plan and would run through the west
  // yard, but the izakaya is a building on the west pavement and comes back with it:
  // it is where Thuan has a beer between closing the shop and the last bus home.
  // The dining lane belongs to the old street plan and would run through the west
  // yard, so it stays off. The izakaya is a building on the west pavement and comes
  // back on its own: it is where Thuan has a beer between closing Sakura and the last
  // bus home, and it stands at whichever plot this layout gives it.
  
  buildIzakaya(world,options);
  buildPark(world,options);
  const plants=buildStreetPlants(world.group,world.plantSites,options);
  if(!plants.count)registerDetail(world,{id:'street-plants',x:0,z:20,radius:70,load:async()=>{
    if(!await preloadStreetPlants())return false;buildStreetPlants(world.group,world.plantSites,options);return true;
  }});
  // The quay's upper surface receives the same detailed concrete as its walls.
  const surfaces=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy});
  // The deck runs from the pier head to the quay's own edge and no further: its last
  // third of a metre lies under the quay slab, which is the surface you walk on there.
  const deckFrom=OUTER_PIER.z-OUTER_PIER.length/2,deckTo=QUAY_SOUTH;
  const pierSurface=new THREE.Mesh(new THREE.PlaneGeometry(OUTER_PIER.width-.5,deckTo-deckFrom),surfaces.worldMaterial('concrete',GROUND.concrete,2));
  pierSurface.name='pier-concrete-surface';pierSurface.rotation.x=-Math.PI/2; pierSurface.position.set(OUTER_PIER.x,OUTER_PIER.height,(deckFrom+deckTo)/2);pierSurface.receiveShadow=true;world.group.add(pierSurface);
  // Every kit building's window glass and lamps follow the clock, not only the quarters':
  // the town hall, Kitahama and the island homes used to stay dark all night.
  {const glass=new Set(),lamps=new Set();
   world.group.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){const kind=m?.userData?.kitFinish;if(kind==='glow')glass.add(m.userData.celFrom||m);else if(kind==='lamp')lamps.add(m.userData.celFrom||m);}});
   (world.hourly??=[]).push(minutes=>{const glow=windowGlow(minutes);setWindowLight(glow);for(const m of glass)m.emissiveIntensity=glow*.75;for(const m of lamps)m.emissiveIntensity=.1+glow*1.6;});}
  world.isOpen=isOpen;world.updateHours=minutes=>{for(const fn of world.hourly||[])fn(minutes);for(const {mesh,id} of districts.shutters){const open=isOpen(options.sites.find(s=>s.id===id),minutes);mesh.position.y=1.3;mesh.visible=false;mesh.userData.closed=!open;}const glow=windowGlow(minutes);for(const m of districts.windows)m.material.emissiveIntensity=.02+glow*.78;};
  let normalTick=-1;
  const staticProps=batchStaticProps(world.group);
  world.beats=createLivingProps(world,factory);
  if(sea?.material&&!isOceanMaterial(sea.material)){sea.material.flatShading=false;sea.material.dithering=true;sea.material.needsUpdate=true;}
  const baseUpdate=world.update.bind(world);
  // Reused every frame rather than rebuilt: the doors only need to know where people
  // are, and this runs at frame rate.
  const doorTraffic=[];
  world.update=(dt,time,day,minutes=1002)=>{
    world.updateHours(minutes);world.updateDiningStreet?.(day);
    world.quietLife?.update(time);world.countrysideLife?.update(time);world.eastLawn?.tick?.(time,minutes);world.beachLife?.tick(dt,options.getPlayerPosition?.(),time);world.beachCorner?.tick(dt,options.getPlayerPosition?.());world.portShed?.tick(dt,minutes);world.homeLights?.update(minutes);world.airportIsland?.update(dt,minutes,day,options.getPlayerPosition?.());world.oilJetty?.update(dt,minutes,time);world.onsen?.tick(time);world.school?.tick(time,minutes,options.getPlayerPosition?.());
    world.docklandsLife?.update(time,minutes);world.shoppingLane?.update(world.weather,minutes);
    world.busStation?.update(minutes,day);world.tunnel?.update?.(day);
    // Three daily services, each with a fifteen-minute stop.
    world.ferry?.update(dt,minutes,time);world.traffic?.update(dt,minutes);world.bus?.update(dt,minutes);
    // The shop doors open for whoever walks up to them. Everybody who is outdoors
    // counts, so a customer arriving is a door opening rather than a person ending.
    if(world.shopDoors?.length){
     doorTraffic.length=0;
     const here=options.getPlayerPosition?.();if(here)doorTraffic.push(here);
     for(const p of world.people)if(p.g.visible&&!p.g.userData.indoors&&!p.g.userData.playerControlled)doorTraffic.push(p.g.position);
     for(const door of world.shopDoors)door.update(dt,doorTraffic);
    }
    for(const shop of world.harbourShops)shop.update(true,day);
    baseUpdate(dt,time,day,minutes);
    for(const l of street.lights)l.intensity=THREE.MathUtils.damp(l.intensity,(1-day)*1.55,4,dt);
    if(sea){
      if(isOceanMaterial(sea.material))tickOcean(time);
      else{const tick=Math.floor(time*10);if(tick!==normalTick){normalTick=tick;sea.geometry.computeVertexNormals();sea.geometry.attributes.normal.needsUpdate=true;}}
    }
  };
  world.resources=factory.resources;
  world.propFactory=factory;   // the builder places the same props (src/build)
  world.quality={
    ...(world.quality||{}),
    cableSegments,
    harbourBlock:{shops:world.harbourShops.map(s=>s.id),nearTriangles:world.harbourShops.reduce((n,s)=>n+s.nearTriangles,0),farTriangles:world.harbourShops.reduce((n,s)=>n+s.farTriangles,0),boardwalk:true},
    staticProps,
    streetPlants:plants,
    walkableOuterPier:true,
    seaCave:false,
    port24Hours:true,
    harbourOffice24Hours:true,
    forestWall:true,
    busForestContinuation:forestEdge.busRoute,
    pierPosts:pier.posts,
    antiShimmerCables:true,
    animatedWaterNormals:!!sea,
    resourceBackedProps:true,
    streetInteractions:street.interactions,
    localRuntimeAssets:true,
    sourceCatalogue:factory.resources.catalogue
  };
  return world;
}
