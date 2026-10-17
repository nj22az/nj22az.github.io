import {buildAirportVehicleYard} from './airport-vehicle-yard.js';
import {terrainPathPolygons} from './terrain-path.js';
import {buildShoppingLane} from './shopping-lane.js';
import {buildAirportDistrict,buildAirportDistrictFar} from './airport-district.js';
import {kitanoLater} from './kitano-on-demand.js';
import * as THREE from '../../vendor/three.module.js';
import {ISLAND_ROUTES,ISLAND_LANDMARKS} from './island-plan.js';
import {GROUND_LAYER} from './ground-layers.js';
import {coastalSurface} from './coastal-ground.js';
import {groundHeight} from './layout.js';
import {AIRPORT_LANDING,AIRPORT_COUNTER,AIRPORT_HEIGHT,airportWorld} from './airport-ground.js';
/** Geometry and walking heights consume the same authored plan. */
export function buildIslandLandscape({world,register,onAction,mobile=false}){
 const group=new THREE.Group();group.name='Minato urban coast';world.group.add(group);
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.92}));return mats.get(c);};
 // Static by default: batched into a few draws. What a project shows or hides opts out below.
 const box=(name,size,pos,c,solid=false,parent=group)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));mesh.name=name;mesh.position.set(...pos);mesh.userData.staticProp=true;parent.add(mesh);if(solid)world.colliders.push({id:name,x:pos[0],z:pos[2],w:size[0],d:size[2],height:pos[1]+size[1]/2});return mesh;};
 const anchor=(pos,label,kind,title,text)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,label,()=>onAction(kind,title,text));return a;};

 // Outer paths add their paving layer to the island ground once. At a Kitahama
 // join, groundHeight already includes its lane slab and must not lift the trail
 // cap a second time, which otherwise leaves the feet hovering at the raster edge.
 const pathBase=(route,x,z)=>['island-coastal-road','island-mountain-trail'].includes(route.id)?coastalSurface(x,z)?.y??groundHeight(x,z):groundHeight(x,z);
 // Short strips follow the same height triangles, including switchbacks.
 for(const route of ISLAND_ROUTES.filter(r=>!r.park&&!r.id.startsWith('neighbourhood-')&&r.id!=='island-shopping-lane')){const layer=route.id==='island-coast-walk'?.12:route.id==='kitahama-west-link'?.10:route.id==='island-coastal-road'?GROUND_LAYER.apron:route.id==='island-shopping-lane'?GROUND_LAYER.lane:route.id==='rainflower-residential-walk'?GROUND_LAYER.apron:route.id.startsWith('rainflower-crosswalk')?GROUND_LAYER.apron:GROUND_LAYER.apron+GROUND_LAYER.grass;const p=[],idx=[];for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),steps=Math.ceil(len/.65),width=route.segmentWidths?.[i-1]??route.width,ox=-dz/len*width/2,oz=dx/len*width/2;for(let j=0;j<steps;j++){const t=j/steps,u=(j+1)/steps,x=a[0]+dx*t,z=a[1]+dz*t,xx=a[0]+dx*u,zz=a[1]+dz*u;const quad=[[x-ox,z-oz],[x+ox,z+oz],[xx+ox,zz+oz],[xx-ox,zz-oz]];for(const polygon of terrainPathPolygons(quad)){const start=p.length/3;for(const [px,pz] of polygon)p.push(px,pathBase(route,px,pz)+layer,pz);for(let k=1;k<polygon.length-1;k++)idx.push(start,start+k,start+k+1);}}}
 // Close each bend with a terrain-following round joint; separate rectangles left
 // wedges of bare grass at the turns in the island circuit.
 if(['island-coast-walk','kitahama-west-link','island-shopping-lane','rainflower-residential-walk'].includes(route.id))for(const [x,z] of (route.id==='kitahama-west-link'?route.points.slice(0,-1):route.points)){
  const ring=Array.from({length:12},(_,i)=>[x+Math.cos(i*Math.PI/6)*route.width/2,z+Math.sin(i*Math.PI/6)*route.width/2]);
  for(let i=0;i<12;i++)for(const polygon of terrainPathPolygons([[x,z],ring[i],ring[(i+1)%12]])){
   const start=p.length/3;for(const [px,pz] of polygon)p.push(px,pathBase(route,px,pz)+layer,pz);for(let k=1;k<polygon.length-1;k++)idx.push(start,start+k,start+k+1);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const road=new THREE.Mesh(g,mat(route.surface==='asphalt'?0x70756c:route.surface==='coral-sand'?0xe4ddc8:0xb7a98a));road.name=route.id;road.material.side=THREE.DoubleSide;group.add(road);}
 // The urban boundary excludes rural scenery, remote buildings and their interactions.
 anchor([-25,1,-39.65],'Complete the airport radio service','island-repair');
 // Airport passenger walkway, check-in counter and a usable local landing (the fence is in airport-district.js).
 world.shoppingLane=buildShoppingLane({world,register,onAction});
 // Kitano-jima's district when he heads there; until then as it is seen from Minato (kitano-on-demand.js).
 kitanoLater(world,'airport district',()=>buildAirportDistrict({world,register,onAction}));
 if(world.kitano?.distant)world.kitano.far(buildAirportDistrictFar(world));
 world.airportVehicleYard=buildAirportVehicleYard(world);
 const airport=world.airportIsland.group;box('Airport passenger pavement',[88,.1,2.7],[0,1.05+GROUND_LAYER.grass,18.35],0xc4c0aa,false,airport);box('Check-in desk',[4,.9,.55],[-10,1.55,17.8],0x517282,false,airport);
 const [cx,cz]=AIRPORT_COUNTER;anchor([cx,AIRPORT_HEIGHT+1.2,cz],'Airport tickets and check-in','airport-counter');const [lx,lz]=AIRPORT_LANDING;anchor([lx,AIRPORT_HEIGHT+1.2,lz],'Airport ferry back to Minato','airport-return');const view=airportWorld(30,18.4);anchor([view[0],AIRPORT_HEIGHT+1,view[1]],'Read the airport departures board','airport-counter');
 const cargo=box('Airport cargo shelter',[6,.2,3],[-23,3.8,18.2],0x517282,false,airport);cargo.visible=false;cargo.userData.staticProp=false;
 (world.landmarks??=[]).push(...ISLAND_LANDMARKS,{id:'airport-island',title:'Kitano-jima Airport',sub:'COMMUTER FLIGHTS · FERRY TRANSFER',x:cx,z:cz,exitPosition:[cx,AIRPORT_HEIGHT,cz],entryFacing:0,line:'A tropical island across the strait: Coral Bay, the jungle trail and the commuter airport. Take the Minato ferry; check-in closes ten minutes before departure.'});
 return {group,cargo,update(state){cargo.visible=!!state.island?.projects.includes('cargo');}};
}
