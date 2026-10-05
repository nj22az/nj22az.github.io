import {buildAirportVehicleYard} from './airport-vehicle-yard.js';
import {buildAobaRadio} from './aoba-radio.js';
import {terrainPathPolygons} from './terrain-path.js';
import {inGardenGround} from './garden-layout.js';
import {buildShoppingLane} from './shopping-lane.js';
import {buildAirportDistrict} from './airport-district.js';
import * as THREE from '../../vendor/three.module.js';
import {ISLAND,HOSHIZAKI_STORE,TERRAIN_GRID,MOUNTAIN_VERTICES,islandTerrainHeight,ISLAND_ROUTES,ISLAND_LANDMARKS} from './island-plan.js';
import {GROUND} from '../render/ground-palette.js';
import {GROUND_LAYER} from './ground-layers.js';
import {paintedTurf} from '../render/toy-surfaces.js';
import {onIslandLand,coastalSurface} from './coastal-ground.js';
import {groundHeight} from './layout.js';
import {AIRPORT_LANDING,AIRPORT_COUNTER,AIRPORT_HEIGHT,airportWorld} from './airport-ground.js';
/** Geometry and walking heights consume the same authored plan. */
export function buildIslandLandscape({world,register,onAction,mobile=false}){
 const group=new THREE.Group();group.name='Johansson Island coast and Aoba Radio';world.group.add(group);
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.92}));return mats.get(c);};
 const box=(name,size,pos,c,solid=false,parent=group)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));mesh.name=name;mesh.position.set(...pos);parent.add(mesh);if(solid)world.colliders.push({id:name,x:pos[0],z:pos[2],w:size[0],d:size[2],height:pos[1]+size[1]/2});return mesh;};
 const anchor=(pos,label,kind,title,text)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,label,()=>onAction(kind,title,text));return a;};
 function sign(text,x,z,width=4,y=groundHeight(x,z)+2){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#e6dec2';ctx.fillRect(0,0,768,160);ctx.fillStyle='#355447';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,95,740);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,.65),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);group.add(mesh);return mesh;}
 const G=TERRAIN_GRID,n=Math.round((G.maxX-G.minX)/G.step)+1,positions=[],indices=[],colours=[],uv=[];
 MOUNTAIN_VERTICES.forEach((h,i)=>{const x=G.minX+i%n*G.step,z=G.minZ+Math.floor(i/n)*G.step;if(z<97)h=coastalSurface(x,z)?.y??h;positions.push(x,h+GROUND_LAYER.grass,z);uv.push(x/6,-z/6);const c=new THREE.Color(h>35?0x7a8470:h>15?0x557d48:GROUND.grass);colours.push(c.r,c.g,c.b);});
 for(let iz=0;iz<n-1;iz++)for(let ix=0;ix<n-1;ix++){const x=G.minX+ix*G.step,z=G.minZ+iz*G.step;if(inGardenGround(x+1.5,z+1.5,3))continue;if(![[x,z],[x+3,z],[x,z+3],[x+3,z+3]].every(p=>onIslandLand(...p)))continue;const a=iz*n+ix;indices.push(a,a+n,a+1,a+1,a+n,a+n+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mountain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:paintedTurf(),roughness:1}));mountain.name='Aoba lowland shared terrain';mountain.userData.horizon=true;mountain.receiveShadow=true;group.add(mountain);
 // Outer paths add their paving layer to the island ground once. At a Kitahama
 // join, groundHeight already includes its lane slab and must not lift the trail
 // cap a second time, which otherwise leaves the feet hovering at the raster edge.
 const pathBase=(route,x,z)=>['island-coastal-road','island-mountain-trail'].includes(route.id)?coastalSurface(x,z)?.y??groundHeight(x,z):groundHeight(x,z);
 // Short strips follow the same height triangles, including switchbacks.
 for(const route of ISLAND_ROUTES.filter(r=>!r.id.startsWith('garden-'))){const layer=route.id==='island-coastal-road'?GROUND_LAYER.apron:route.id==='island-shopping-lane'||route.id==='rainflower-residential-walk'?GROUND_LAYER.apron:route.id.startsWith('rainflower-crosswalk')?GROUND_LAYER.apron+GROUND_LAYER.grass*3:GROUND_LAYER.apron+GROUND_LAYER.grass;const p=[],idx=[];for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),steps=Math.ceil(len/.65),width=route.segmentWidths?.[i-1]??route.width,ox=-dz/len*width/2,oz=dx/len*width/2;for(let j=0;j<steps;j++){const t=j/steps,u=(j+1)/steps,x=a[0]+dx*t,z=a[1]+dz*t,xx=a[0]+dx*u,zz=a[1]+dz*u;const quad=[[x-ox,z-oz],[x+ox,z+oz],[xx+ox,zz+oz],[xx-ox,zz-oz]];for(const polygon of terrainPathPolygons(quad)){const start=p.length/3;for(const [px,pz] of polygon)p.push(px,pathBase(route,px,pz)+layer,pz);for(let k=1;k<polygon.length-1;k++)idx.push(start,start+k,start+k+1);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const road=new THREE.Mesh(g,mat(route.surface==='asphalt'?0x70756c:0xb7a98a));road.name=route.id;road.material.side=THREE.DoubleSide;group.add(road);}
 const trees=[],dummy=new THREE.Object3D();for(let i=0;i<(mobile?65:110);i++){const angle=i*2.399,r=20+(i*17%53),x=40+Math.cos(angle)*r,z=175+Math.sin(angle)*r;if(ISLAND_ROUTES.some(q=>q.points.some(p=>Math.hypot(p[0]-x,p[1]-z)<6))||x<0&&z<160||x>27&&x<43&&z>155&&z<173)continue;trees.push([x,islandTerrainHeight(x,z),z]);}
 const foliage=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat(0x355d3d),trees.length),trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.16,.25,2.4,6),mat(0x735c42),trees.length);trees.forEach(([x,y,z],i)=>{dummy.position.set(x,y+3.3,z);dummy.scale.set(2.3,2.4,2.1);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);dummy.position.y=y+1.2;dummy.scale.set(1,1,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);});group.add(foliage,trunks);world.islandTrees=trees;world.islandTrees=trees;
 world.aobaRadio=buildAobaRadio(world,{register,onAction});
 // Quiet far-coast fishing settlement. Buildings leave the coastal carriageway clear.
 for(const [i,x,z] of [[0,127,178],[1,126,202],[2,149,200]]){const y=groundHeight(x,z);box('Hoshizaki family home '+i,[7,3.2,6],[x,y+1.6,z],i===1?0xe2d2ae:0xd6d4bd,true);box('Red tiled roof',[7.8,.55,6.8],[x,y+3.35,z],0x9f5b47);box('Home window',[2,.9,.08],[x,y+1.8,z+3.05],0x46656a);sign(['FISHER FAMILY','HOSHIZAKI GENERAL STORE','FAMILY GUESTHOUSE'][i],x,z+3.12,5,y+2.6);}
 anchor([HOSHIZAKI_STORE.customer[0],.7,HOSHIZAKI_STORE.customer[1]],'Shop at Hoshizaki General Store','island-shop');anchor([127,.7,182],'Read the fishing co-operative board','read','Hoshizaki Fishing Co-operative','Dawn: launch the boats. Morning: land and sort the catch. Afternoon: mend nets, prepare ice boxes and deliver the airport cargo. Families keep their boat and weather logs at the Community Hall.');
 box('Hoshizaki net shed',[5,2.8,5],[151,1,180],0x829392,true);box('Fishing pier',[9,.2,4],[156,-.3,190],0x948978);for(let i=0;i<4;i++)box('Fish box',[.8,.4,.6],[151+i*.9,-.05,188],0x456f86);
 const guestAwning=box('Guesthouse open canopy',[7.5,.2,2],[149,2.7,204],0xb78755);guestAwning.visible=false;
 const tower=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.6,9,12),mat(0xe1d8c2));tower.position.set(-54,4.1,204);group.add(tower);box('Lighthouse lantern',[2.5,1.5,2.5],[-54,9.4,204],0x466b75);sign('WEST CAPE LIGHTHOUSE',-51,207,4,1.8);anchor([-51,.8,207],'Read the lighthouse log','read','West Cape Lighthouse','The keeper checks the lamp at dusk, cleans the salt from the glass and records visibility. The coastal road returns to Minato through the western quarter.');
 for(const [label,x,z] of [['COASTAL LOOP → HOSHIZAKI',66.5,65.5],['← MINATO · AOBA RADIO →',23.5,104],['HOSHIZAKI · COASTAL BUS',138,188]]){sign(label,x,z,5,1.8);box('Direction sign post',[.12,2,.12],[x,.6,z],0x6b775c);}
 anchor([138,.7,188],'Take the coastal village bus','island-bus');anchor([13.3,1,-37.55],'Review island development projects','island-projects');anchor([-25,1,-39.65],'Complete the airport radio service','island-repair');
 // Airport passenger walkway, check-in counter, fence and a usable local landing.
 world.shoppingLane=buildShoppingLane({world,register,onAction});
 buildAirportDistrict({world,register,onAction});
 world.airportVehicleYard=buildAirportVehicleYard(world);
 const airport=world.airportIsland.group;box('Airport passenger pavement',[88,.1,2.7],[0,1.05+GROUND_LAYER.grass,18.35],0xc4c0aa,false,airport);box('Check-in desk',[4,.9,.55],[-10,1.55,17.8],0x517282,false,airport);
 for(let x=-50;x<=38;x+=4)box('Airport perimeter post',[.09,1.3,.09],[x,1.75,16.75],0x81918a,false,airport);box('Airport perimeter rail',[88,.07,.08],[-6,2.1,16.75],0x81918a,false,airport);
 const [cx,cz]=AIRPORT_COUNTER;anchor([cx,AIRPORT_HEIGHT+1.2,cz],'Airport tickets and check-in','airport-counter');const [lx,lz]=AIRPORT_LANDING;anchor([lx,AIRPORT_HEIGHT+1.2,lz],'Airport ferry back to Minato','airport-return');const view=airportWorld(30,18.4);anchor([view[0],AIRPORT_HEIGHT+1,view[1]],'Read the airport departures board','airport-counter');
 const cargo=box('Airport cargo shelter',[6,.2,3],[-23,3.8,18.2],0x517282,false,airport);cargo.visible=false;
 (world.landmarks??=[]).push(...ISLAND_LANDMARKS,{id:'airport-island',title:'Kitano-jima Airport',sub:'COMMUTER FLIGHTS · FERRY TRANSFER',x:cx,z:cz,exitPosition:[cx,AIRPORT_HEIGHT,cz],entryFacing:0,line:'Reach the airport on the Minato local ferry. Check-in closes ten minutes before departure.'});
 return {group,mountain,cargo,guestAwning,update(state){const s=state.island;cargo.visible=!!s?.projects.includes('cargo');guestAwning.visible=!!s?.projects.includes('guesthouse');}};
}
