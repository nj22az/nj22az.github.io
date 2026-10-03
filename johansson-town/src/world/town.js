import {buildQuietLife} from './quiet-life.js';
import {buildTownPower} from './town-power.js';
import {buildParkAccess} from './park-access.js';
import {buildDocklandsLife} from './docklands-life.js';
import {addSakuraFlyer} from './sakura-flyers.js';
import {buildIslandLandscape} from './island-landscape.js';
import {buildTraditionalGarden} from './traditional-garden.js';
import {buildDiningStreet} from './dining-street.js';
import {createTownTraffic} from './town-traffic.js';
import {buildKitanoLink} from './kitano-link.js';
import {buildOilJetty} from './oil-jetty.js';
import {GROUND} from '../render/ground-palette.js';
import {buildBicycle,BOOKSHOP_BICYCLE} from './bicycle.js';
import {registerDetail} from './detail-stream.js';
import {buildPark,parkFoliage,preloadPark} from './park.js?snappy=1';
import {buildIzakaya} from './izakaya.js?snappy=1';
import {buildStaffBench} from './staff-bench.js';
import {batchStaticProps} from '../render/static-props.js';
import {STREET_CAST} from '../people/residents.js';
import {izakayaOpen} from '../people/social.js';
import {OUTER_PIER,QUAY_SOUTH,groundHeight} from './layout.js?snappy=1';
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
import {FULL_TOWN} from './full-town-state.js';
import {buildSakuraBench} from './sakura-bench.js';
import {applyShopAddresses,TOWN_DESTINATIONS} from './town-grid.js';
import {configureTownMode,peninsulaActive} from './town-mode.js';
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
  factory.box(group,[.34,.56,15.45],[-4.02,OUTER_PIER.height+.02-.28,-57.3],dark,null,options.shadows);
  factory.box(group,[.34,.56,15.45],[4.02,OUTER_PIER.height+.02-.28,-57.3],dark,null,options.shadows);
  factory.box(group,[8.2,.58,.42],[0,OUTER_PIER.height+.02-.29,-64.84],dark,null,options.shadows);
  const posts=[];
  for(const side of [-1,1]){
    for(const z of [-51.1,-53.7,-62.2,-64.1])posts.push(factory.cylinder(group,.065,1,[side*3.92,.62,z],steel,10));
    factory.beam(group,[side*3.92,1.06,-51.1],[side*3.92,1.06,-53.7],.045,steel);
    factory.beam(group,[side*3.92,1.06,-62.2],[side*3.92,1.06,-64.1],.045,steel);
  }
  for(const x of [-3.92,-1.3,1.3,3.92])factory.cylinder(group,.065,1,[x,.62,-64.18],steel,10);
  for(const x of [-3.92,-1.3,1.3])factory.beam(group,[x,1.06,-64.18],[x+2.62,1.06,-64.18],.045,steel);
  for(const [x,z] of [[-2.75,-55],[2.75,-55],[-2.75,-61],[2.75,-61]]){
    factory.cylinder(group,.20,.43,[x,.32,z],dark,12);factory.cylinder(group,.29,.11,[x,.57,z],dark,12);colliders.push({x,z,w:.46,d:.46});
  }
  factory.beam(group,[3.86,.72,-58.1],[3.86,-.75,-58.1],.035,warning,8,null,false);
  factory.beam(group,[3.86,.72,-58.7],[3.86,-.75,-58.7],.035,warning,8,null,false);
  for(let y=.55;y>-.65;y-=.23)factory.beam(group,[3.86,y,-58.1],[3.86,y,-58.7],.028,warning,8,null,false);

  addWithCollider(group,colliders,factory.baitStation(-2.45,-62.55,.03));
  addWithCollider(group,colliders,factory.pierWinch(2.35,-61.25,-.08));
  addWithCollider(group,colliders,factory.crateStack(-2.35,-58.8,.06));

  const ropeMat=factory.material(null,0x9b825e,.92,0);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34+i*.06,.04,6,18),ropeMat);ring.rotation.x=Math.PI/2;ring.rotation.z=i*.17;ring.position.set(2.45,.16+i*.03,-62.6);ring.castShadow=false;group.add(ring);
  }

  factory.cylinder(group,.07,3.1,[0,1.65,-63.25],steel,10);
  factory.box(group,[.68,.12,.24],[0,3.05,-63.25],steel);
  const lampMat=factory.material(null,0xd9ad68,.78,0,0xd9ad68,.32),lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.20),lampMat);lamp.position.set(0,2.88,-63.25);lamp.castShadow=false;group.add(lamp);
  factory.beam(group,[3.55,.43,-55.1],[7.45,.12,-54.7],.022,0x6f6049,6,null,false);
  factory.beam(group,[3.55,.43,-60.8],[7.45,.12,-59.5],.022,0x6f6049,6,null,false);

  anchor(group,[0,1,-62.4],'Fish from the outer pier',()=>options.onAction?.('fishing'),options.register);
  anchor(group,[-2.45,1.1,-61.8],'Inspect bait station',()=>options.onAction?.('inspect','Harbour bait station','Ice, hooks, sinkers and bait tins are arranged for the evening fishermen. The counter is scarred by years of salt water.'),options.register);
  anchor(group,[2.3,1,-60.6],'Operate pier winch',()=>options.onAction?.('machine','Pier winch','A compact electric winch used to haul baskets and light gear from the quay. The guarded drum turns slowly during a test cycle.'),options.register);
  anchor(group,[2.45,.8,-62],'Inspect mooring rope',()=>options.onAction?.('inspect','Mooring rope','Heavy natural-fibre rope has been coiled neatly after the morning fishing boats departed.'),options.register);
  return {posts:posts.length,collidersAdded:7};
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
  const seat=(pos,label,title,text)=>{const marker=anchor(group,pos,label,()=>options.onAction?.('seat',title,text),options.register);marker.userData.seat={position:[2.05,0,17.02],stand:[2.05,0,16.15],eyeY:1.26,yaw:0,pitch:0};interactions++;};
  const machine=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('machine',title,text),options.register);interactions++;};

  addWithCollider(group,colliders,factory.bench(2.05,17.1,0));
  seat([2.05,1,16.65],'Sit on neighbourhood bench','Neighbourhood bench','From here the shop signs, bicycles and overhead cables make the street feel almost domestic.');

  addWithCollider(group,colliders,factory.postbox(2.4,16.4,Math.PI/2));
  inspect([1.75,1,16.4],'Inspect post box','Post box','The collection plate lists two pickups: 10:30 and 16:30. A few handwritten postcards are visible through the slot.');
  addWithCollider(group,colliders,factory.noticeBoard(3.2,-37.3,0));
  addSakuraFlyer(group,{position:[3.57,1.55,-37.215],width:.43});
  anchor(group,[3.2,1,-36.6],'Read Thuan’s shop flyer · harbour notice board',()=>options.onAction?.('sakura-flyer','Harbour notice board'),options.register);interactions++;

  addWithCollider(group,colliders,factory.utilityCabinet(-7,13.8,0));// On the footway, clear of the six-metre carriageway.
  inspect([-5.55,1,13.2],'Inspect utility cabinet','Street utility cabinet','Telephone and power distribution diagrams are tucked behind the inspection glass.');

  // Thuan's bicycle stands on the west footway, a short walk from Sakura. The
  // peninsula keeps it as an interactive ride; archived layouts keep the bookshop
  // inspection spot and its original placement.
  // On the west footway, between Sakura's front and the kerb (the carriageway is narrower now).
  const bicycleSpot=peninsulaActive()?{x:-5.8,z:-23.2}:BOOKSHOP_BICYCLE;
  const bicycle=buildBicycle({...bicycleSpot,shadows:options.shadows,animated:true});
  bicycle.object.name="Thuan's commuter bicycle";
  addWithCollider(group,colliders,bicycle);
  if(peninsulaActive()){
    anchor(bicycle.object,[1,.9,0],'Ride Thuan’s bicycle',()=>options.onAction?.('bicycle',bicycle),options.register);
    interactions++;
  }else{
    addWithCollider(group,colliders,factory.bicycleRack(BOOKSHOP_BICYCLE.x+.22,BOOKSHOP_BICYCLE.z+.54,0));
    inspect([BOOKSHOP_BICYCLE.x-.8,.9,BOOKSHOP_BICYCLE.z],'Inspect parked bicycle','Bookshop bicycle','A well-kept commuter bicycle with a wire basket, mudguards and a rear carrier. It is parked at the entrance to the bookshop alley, clear of the junction.');
  }

  addWithCollider(group,colliders,factory.convexMirror(-7.4,6.2,.02));
  inspect([-6.85,1,5.7],'Inspect traffic mirror','Convex traffic mirror','The mirror gives a broad view of the narrow side street and helps cyclists see around the corner.');
  // Moved along the pavement, not across it. These stood at z=-19.8, which the cedar
  // bench was later placed across: the bench runs to x=5.07 and the bins began at 4.52,
  // so half a metre of it grew out of a bin. Going east instead would have put them on
  // the middle of the walk beside the park, so they go south of the bench.
  const recycleGroup=new THREE.Group();recycleGroup.position.set(5.05,0,-21.7);group.add(recycleGroup);
  for(const [dx,c] of [[-.28,0x4c6f62],[.28,0x6a6651]]){factory.cylinder(recycleGroup,.25,.78,[dx,.49,0],c,10);factory.box(recycleGroup,[.54,.08,.54],[dx,.91,0],0x384547);}colliders.push({x:5.05,z:-21.7,w:1.1,d:.65});
  inspect([4.55,1,-21.2],'Inspect recycling bins','Neighbourhood recycling','Glass bottles are separated from steel cans. The labels are faded from sun and salt air.');

  // The hand pump (手押しポンプ) for rinsing fish boxes stands on the quay by the
  // warehouse. It used to be a box and a drum at (-7.4,-31.2), which Sakura's frontage
  // has since been built over, so it stood half inside the shop window.
  {
   const P=[-6.6,-42.4],iron=new THREE.MeshStandardMaterial({color:0x2f6b55,roughness:.55,metalness:.25}),concrete=new THREE.MeshStandardMaterial({color:0xb9b5aa,roughness:.95}),zinc=new THREE.MeshStandardMaterial({color:0xa8b0b2,roughness:.4,metalness:.6});
   const pump=new THREE.Group();pump.name='Harbour hand pump';pump.position.set(P[0],0,P[1]);group.add(pump);
   const add=(geometry,material,x,y,z)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;pump.add(m);return m;};
   add(new THREE.BoxGeometry(.7,.22,.7),concrete,0,.11,0);
   add(new THREE.CylinderGeometry(.1,.12,.6,16),iron,0,.52,0);
   add(new THREE.CylinderGeometry(.13,.11,.08,16),iron,0,.86,0);
   add(new THREE.SphereGeometry(.06,10,8),iron,0,.93,0);
   const spout=add(new THREE.CylinderGeometry(.035,.03,.26,10),iron,.17,.64,0);spout.rotation.z=Math.PI/2+.25;
   // The lever: a pivot lug on top and a long handle raised at rest.
   const lever=add(new THREE.CylinderGeometry(.018,.018,.62,8),iron,-.22,1.02,0);lever.rotation.z=-1.05;
   add(new THREE.SphereGeometry(.03,8,6),iron,-.48,1.17,0);
   // A galvanised bucket under the spout.
   add(new THREE.CylinderGeometry(.15,.12,.26,16,1,true),zinc,.38,.35,0).material.side=THREE.DoubleSide;
   add(new THREE.TorusGeometry(.15,.008,6,18),zinc,.38,.48,0).rotation.x=Math.PI/2;
   colliders.push({x:P[0]+.1,z:P[1],w:.95,d:.75});
  }
  machine([-5.9,1,-42.4],'Work the hand pump','Harbour hand pump','A cast-iron hand pump on a concrete plinth, for rinsing fish boxes and sluicing the quay. Two strokes of the handle and the water comes, cold, from the well under the harbour.');

  return {interactions,lights,bicycle};
}

function findSea(group){let sea=null;group.traverse(o=>{if(o.isMesh&&(o.name==='Peninsula surrounding sea'||o.name==='Harbour basin')){if(!sea||o.name==='Harbour basin')sea=o;}});return sea;}

/** Whether a point lies under the paving the lane builder lays. */
function pavedAt(){
  const patches=lanePatches();
  return (x,z)=>patches.some(p=>x>=p.x0-.01&&x<=p.x1+.01&&z>=p.z0-.01&&z<=p.z1+.01);
}

export function createTown(options){
  const mode=configureTownMode(options.townMode);izakayaPlot();
  applyShopAddresses(options.sites);
  const world=createBaseTown(options);
  world.townMode=mode;
  // Only the street cast lives in the playable town; nothing else may arrive as a person.
  for(const person of world.people)person.g?.removeFromParent();
  world.people.length=0;
  const forestEdge=buildForestEdge({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows,trees:!peninsulaActive()});
  world.forestEdge=forestEdge;
  // The road out of town ends at the Minato Tunnel through the headland, which only the
  // bus goes through. See coyote-tunnel.js.
  // Without the cave there is no footpath up to it either.
  if(peninsulaActive()&&!CAVE_ACTIVE){
   forestEdge.group.removeFromParent();
   // The old terminus at the top of Main Street stays at the street's height -- it is the
   // way round to the police box -- as a lawn on a low bank, over the island ground.
   const B=BUS_STATION,turf=new THREE.MeshStandardMaterial({color:GROUND.grass,roughness:1});
   try{const map=paintedTurf().clone();map.needsUpdate=true;map.repeat.set(1/6,1/6);turf.map=map;}catch{}
   const bank=new THREE.Mesh(new THREE.BoxGeometry(B.maxX-B.minX,.42,B.maxZ-B.minZ),[0,1,2,3,4,5].map(i=>i===2?turf:new THREE.MeshStandardMaterial({color:0x8e8a78,roughness:1})));
   bank.position.set((B.minX+B.maxX)/2,GROUND_LAYER.grass-.21,(B.minZ+B.maxZ)/2);bank.name='Main Street end lawn';bank.receiveShadow=true;world.group.add(bank);
  }
  if(peninsulaActive()){
   if(CAVE_ACTIVE)world.tunnel=buildCoyoteTunnel({parent:world.group,colliders:world.colliders,
    register:options.register,onAction:options.onAction,shadows:options.shadows});
   // The port is north, the shops are west; the east is the green side of the town and
   // the west is the working one, with the shop and the warehouse standing on it.
   world.westYard=buildWestYard({parent:world.group,colliders:world.colliders,shadows:options.shadows});
   // Nobody drives onto an island: the ferry calls at the outer pier. See ferry.js.
   world.ferry=createFerryRun({parent:world.group,colliders:world.colliders,shadows:options.shadows});
   // Kitano Road and Kitano Bridge to the airport island, and the traffic on them: the car
   // ferry's vehicles and the island's own cars. See kitano-link.js and town-traffic.js.
   world.kitanoLink=buildKitanoLink({parent:world.group,colliders:world.colliders,shadows:options.shadows});
   world.traffic=createTownTraffic({parent:world.group,colliders:world.colliders,ferry:world.ferry,getPlayerPosition:options.getPlayerPosition,people:()=>world.people||[]});
   world.eastLawn=buildEastLawn({parent:world.group,colliders:world.colliders,shadows:options.shadows,anisotropy:options.maxAnisotropy||4,
    heightAt:groundHeight,paved:pavedAt(),register:options.register,onAction:options.onAction});
   // Crabs on the wet sand below the wall and fish leaping offshore. See beach-life.js.
   world.beachLife=buildBeachLife({parent:world.group,shadows:options.shadows});
   // A quiet corner at the north end to sit and listen to the sea. See beach-corner.js.
   world.beachCorner=buildBeachCorner({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows});
   // Mr Fujita's shed on the working pier, where he watches the ballgame with a beer. See port-shed.js.
   world.portShed=buildPortShed({parent:world.group,colliders:world.colliders,register:options.register,onAction:options.onAction,shadows:options.shadows});
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
   // The streets that fill the rest of the peninsula in: Nishi-machi behind the west
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
    edgeLines(g,COAST_ROAD,{width:5,heightAt:groundHeight});
   }
   if(!world.eastLawn.useParkGreenery(parkFoliage()))registerDetail(world,{id:'east-lawn-grass',x:19,z:-6,radius:64,load:async()=>
    await preloadPark()&&world.eastLawn.useParkGreenery(parkFoliage())});
  }
  const factory=createPropFactory({shadows:options.shadows,maxAnisotropy:options.maxAnisotropy});
  const cableSegments=replaceCableLines(world.group,options.mobile),pier=addWalkablePier(world,options,factory),street=addStreetLife(world,options,factory),sea=findSea(world.group);
  world.bicycle=street.bicycle;
  if(peninsulaActive())world.docklandsLife=buildDocklandsLife(world,options);
  if(!FULL_TOWN.active)buildSakuraBench(world,{shadows:options.shadows,register:options.register,onAction:options.onAction,factory});
  // Thuan's break. Only the peninsula has a yard behind the shop to put it in.
  if(peninsulaActive())world.staffBench=buildStaffBench({parent:world.group,factory,colliders:world.colliders,
   shadows:options.shadows,register:options.register,onAction:options.onAction});
  const originalSites=[...options.sites],districts=buildDistricts(world,options);
  if(peninsulaActive()){world.islandLandscape=buildIslandLandscape({world,register:options.register,onAction:options.onAction,mobile:options.mobile});world.traditionalGarden=buildTraditionalGarden({world,register:options.register,onAction:options.onAction});world.parkAccess=buildParkAccess(world,{register:options.register,onAction:options.onAction});world.powerNetwork=buildTownPower(world,{register:options.register,onAction:options.onAction,shadows:options.shadows});world.quietLife=buildQuietLife(world);}
  const isOpen=(site,minutes)=>{if(!site)return false;if(['office','warehouse','bus-station','ferry-terminal'].includes(site.id))return true;const h=((minutes%1440)+1440)%1440;if(site.id==='izakaya')return izakayaOpen(h);if(site.industrialWorkshop)return h>=540&&h<1140;const close=site.id==='market'?1200:site.id==='frontrow'?1110:site.id==='sento'||site.id==='ramen'?1260:1140;return h>=540&&h<close;};
  for(const profile of STREET_CAST){
   const spawn=profile.work;
   let p=world.people.find(p=>p.g.userData.name===profile.name);if(!p){const g=new THREE.Group();g.userData.name=profile.name;g.position.set(spawn[0],groundHeight(...spawn),spawn[1]);world.group.add(g);p={g,x:g.position.x,z:g.position.z,index:world.people.length,legs:[],arms:[]};world.people.push(p);options.register(g,'Talk to '+profile.name,()=>options.onAction('resident',profile.name));}p.profile=profile;p.g.position.set(spawn[0],groundHeight(...spawn),spawn[1]);
  }
  for(const s of originalSites){if(world.harbourShops.some(shop=>shop.id===s.id)||!Number.isFinite(s.side))continue;const panel=new THREE.Mesh(new THREE.BoxGeometry(.16,2.5,1.4),factory.material(null,s.color,.9));panel.position.set(s.side*7.05,4.8,s.z+2.55);world.group.add(panel);districts.shutters.push({mesh:panel,id:s.id});}
  // The peninsula keeps the park and the port; the dining lane and the izakaya are
  // switched off with the rest of the buildings.
  // The dining lane belongs to the old street plan and would run through the west
  // yard, but the izakaya is a building on the west pavement and comes back with it:
  // it is where Thuan has a beer between closing the shop and the last bus home.
  // The dining lane belongs to the old street plan and would run through the west
  // yard, so it stays off. The izakaya is a building on the west pavement and comes
  // back on its own: it is where Thuan has a beer between closing Sakura and the last
  // bus home, and it stands at whichever plot this layout gives it.
  if(!peninsulaActive())buildDiningStreet(world,options);
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
    world.quietLife?.update(time);world.eastLawn?.tick?.(time,minutes);world.beachLife?.tick(dt,options.getPlayerPosition?.(),time);world.beachCorner?.tick(dt,options.getPlayerPosition?.());world.portShed?.tick(dt,minutes);world.homeLights?.update(minutes);world.airportIsland?.update(dt,minutes,day);world.oilJetty?.update(dt,minutes,time);world.onsen?.tick(time);world.school?.tick(time,minutes,options.getPlayerPosition?.());
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
  world.quality={
    ...(world.quality||{}),
    cableSegments,
    harbourBlock:{shops:world.harbourShops.map(s=>s.id),nearTriangles:world.harbourShops.reduce((n,s)=>n+s.nearTriangles,0),farTriangles:world.harbourShops.reduce((n,s)=>n+s.farTriangles,0),boardwalk:true},
    staticProps,
    streetPlants:plants,
    walkableOuterPier:true,
    shoppingDistrict:mode==='shopping-district',
    residentialArea:mode!=='shopping-district',
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
