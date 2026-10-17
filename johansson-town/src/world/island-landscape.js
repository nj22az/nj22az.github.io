import {buildAirportVehicleYard} from './airport-vehicle-yard.js';
import {buildAobaRadio} from './aoba-radio.js';
import {terrainPathPolygons} from './terrain-path.js';
import {inGardenGround} from './garden-layout.js';
import {buildShoppingLane} from './shopping-lane.js';
import {buildAirportDistrict,buildAirportDistrictFar} from './airport-district.js';
import {kitanoLater} from './kitano-on-demand.js';
import * as THREE from '../../vendor/three.module.js';
import {ISLAND,HOSHIZAKI_STORE,TERRAIN_GRID,MOUNTAIN_VERTICES,islandTerrainHeight,ISLAND_ROUTES,ISLAND_LANDMARKS,AOBA_SUMMIT} from './island-plan.js';
import {GROUND} from '../render/ground-palette.js';
import {GROUND_LAYER} from './ground-layers.js';
import {paintedTurf} from '../render/toy-surfaces.js';
import {onIslandLand,coastalSurface} from './coastal-ground.js';
import {groundHeight} from './layout.js';
import {inFumoto,nearFumotoLine} from './fumoto-layout.js';
import {rainforestTree,banyan,rock,part,merge} from './vegetation-kit.js';
import {islandBuildMaterial,corrugatedRoof,planks} from './island-architecture.js';
import {AIRPORT_LANDING,AIRPORT_COUNTER,AIRPORT_HEIGHT,airportWorld} from './airport-ground.js';
/** Geometry and walking heights consume the same authored plan. */
export function buildIslandLandscape({world,register,onAction,mobile=false}){
 const group=new THREE.Group();group.name='Johansson Island coast and Aoba Radio';world.group.add(group);
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.92}));return mats.get(c);};
 // Static by default: batched into a few draws. What a project shows or hides opts out below.
 const box=(name,size,pos,c,solid=false,parent=group)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));mesh.name=name;mesh.position.set(...pos);mesh.userData.staticProp=true;parent.add(mesh);if(solid)world.colliders.push({id:name,x:pos[0],z:pos[2],w:size[0],d:size[2],height:pos[1]+size[1]/2});return mesh;};
 const anchor=(pos,label,kind,title,text)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,label,()=>onAction(kind,title,text));return a;};
 function sign(text,x,z,width=4,y=groundHeight(x,z)+2){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#e6dec2';ctx.fillRect(0,0,768,160);ctx.fillStyle='#355447';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,95,740);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,.65),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);group.add(mesh);return mesh;}
 const G=TERRAIN_GRID,n=Math.round((G.maxX-G.minX)/G.step)+1,positions=[],indices=[],colours=[],uv=[];
 MOUNTAIN_VERTICES.forEach((h,i)=>{const x=G.minX+i%n*G.step,z=G.minZ+Math.floor(i/n)*G.step;if(z<97)h=coastalSurface(x,z)?.y??h;positions.push(x,h+GROUND_LAYER.grass,z);uv.push(x/6,-z/6);const c=new THREE.Color(h>12?0x4f7444:h>4?0x557d48:GROUND.grass);colours.push(c.r,c.g,c.b);});
 for(let iz=0;iz<n-1;iz++)for(let ix=0;ix<n-1;ix++){const x=G.minX+ix*G.step,z=G.minZ+iz*G.step;if(inGardenGround(x+1.5,z+1.5,3))continue;if(![[x,z],[x+3,z],[x,z+3],[x+3,z+3]].every(p=>onIslandLand(...p)))continue;const a=iz*n+ix;indices.push(a,a+n,a+1,a+1,a+n,a+n+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const mountain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:paintedTurf(),roughness:1}));mountain.name='Aoba lowland shared terrain';mountain.userData.horizon=true;mountain.receiveShadow=true;group.add(mountain);
 // Outer paths add their paving layer to the island ground once. At a Kitahama
 // join, groundHeight already includes its lane slab and must not lift the trail
 // cap a second time, which otherwise leaves the feet hovering at the raster edge.
 const pathBase=(route,x,z)=>['island-coastal-road','island-mountain-trail'].includes(route.id)?coastalSurface(x,z)?.y??groundHeight(x,z):groundHeight(x,z);
 // Short strips follow the same height triangles, including switchbacks.
 for(const route of ISLAND_ROUTES.filter(r=>!r.park&&!r.id.startsWith('neighbourhood-'))){const layer=route.id==='island-coastal-road'?GROUND_LAYER.apron:route.id==='island-shopping-lane'?GROUND_LAYER.lane:route.id==='rainflower-residential-walk'?GROUND_LAYER.apron:route.id.startsWith('rainflower-crosswalk')?GROUND_LAYER.apron:GROUND_LAYER.apron+GROUND_LAYER.grass;const p=[],idx=[];for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),steps=Math.ceil(len/.65),width=route.segmentWidths?.[i-1]??route.width,ox=-dz/len*width/2,oz=dx/len*width/2;for(let j=0;j<steps;j++){const t=j/steps,u=(j+1)/steps,x=a[0]+dx*t,z=a[1]+dz*t,xx=a[0]+dx*u,zz=a[1]+dz*u;const quad=[[x-ox,z-oz],[x+ox,z+oz],[xx+ox,zz+oz],[xx-ox,zz-oz]];for(const polygon of terrainPathPolygons(quad)){const start=p.length/3;for(const [px,pz] of polygon)p.push(px,pathBase(route,px,pz)+layer,pz);for(let k=1;k<polygon.length-1;k++)idx.push(start,start+k,start+k+1);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const road=new THREE.Mesh(g,mat(route.surface==='asphalt'?0x70756c:route.surface==='coral-sand'?0xe4ddc8:0xb7a98a));road.name=route.id;road.material.side=THREE.DoubleSide;group.add(road);}
 const trees=[],dummy=new THREE.Object3D();for(let i=0;i<(mobile?65:110);i++){const angle=i*2.399,r=20+(i*17%53),x=40+Math.cos(angle)*r,z=175+Math.sin(angle)*r;if(ISLAND_ROUTES.some(q=>q.points.some(p=>Math.hypot(p[0]-x,p[1]-z)<6))||x<0&&z<160||x>27&&x<43&&z>155&&z<173||inFumoto(x,z,4)||nearFumotoLine(x,z))continue;trees.push([x,islandTerrainHeight(x,z),z]);}
 // Aoba's woods: the evergreen broadleaf forest of the Ryukyu hills (itajii and its kin),
 // darker and rounder-crowned than Kitano-jima's rainforest. Three trees, one draw each.
 {const plantMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});
  const models=[rainforestTree({seed:21,height:7,spread:3.2,light:0x6e9f4a,dark:0x24502c,mid:0x41783a}),rainforestTree({seed:22,height:8,spread:3.6,light:0x78a852,dark:0x2a5a30,mid:0x4a823e}),rainforestTree({seed:23,height:6.5,spread:3,light:0x83ab55,dark:0x2f5a2f,mid:0x52863f})];
  models.forEach((g,v)=>{const mine=trees.filter((_,i)=>i%3===v),im=new THREE.InstancedMesh(g,plantMat,mine.length);im.name='Aoba evergreen forest';mine.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,i*2.4+v,0);dummy.scale.setScalar(.7+((i*7)%5)*.06);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});im.computeBoundingSphere();group.add(im);});
  for(const [x,y,z] of trees)world.colliders.push({id:'Aoba tree trunk',x,z,w:.5,d:.5,minY:y-.2,height:4});}world.islandTrees=trees;world.islandTrees=trees;
 world.aobaRadio=buildAobaRadio(world,{register,onAction});
 // Quiet far-coast fishing settlement. Buildings leave the coastal carriageway clear.
 for(const [i,x,z] of [[0,127,178],[1,126,202],[2,149,200]]){const y=groundHeight(x,z);box('Hoshizaki family home '+i,[7,3.2,6],[x,y+1.6,z],i===1?0xe2d2ae:0xd6d4bd,true);box('Red tiled roof',[7.8,.55,6.8],[x,y+3.35,z],0x9f5b47);box('Home window',[2,.9,.08],[x,y+1.8,z+3.05],0x46656a);sign(['FISHER FAMILY','HOSHIZAKI GENERAL STORE','FAMILY GUESTHOUSE'][i],x,z+3.12,5,y+2.6);}
 anchor([HOSHIZAKI_STORE.customer[0],.7,HOSHIZAKI_STORE.customer[1]],'Try the Hoshizaki store’s door','read','Hoshizaki General Store · closed','The shutter is down, and nobody keeps the store now. For groceries, go to Sakura Shōten in Minato.');anchor([127,.7,182],'Read the fishing co-operative board','read','Hoshizaki Fishing Co-operative','Dawn: launch the boats. Morning: land and sort the catch. Afternoon: mend nets, prepare ice boxes and deliver the airport cargo. Families keep their boat and weather logs at the Community Hall.');
 box('Hoshizaki net shed',[5,2.8,5],[151,1,180],0x829392,true);box('Fishing pier',[9,.2,4],[156,-.3,190],0x948978);for(let i=0;i<4;i++)box('Fish box',[.8,.4,.6],[151+i*.9,-.05,188],0x456f86);
 const guestAwning=box('Guesthouse open canopy',[7.5,.2,2],[149,2.7,204],0xb78755);guestAwning.visible=false;guestAwning.userData.staticProp=false;
 const tower=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.6,9,12),mat(0xe1d8c2));tower.position.set(-54,4.1,204);group.add(tower);box('Lighthouse lantern',[2.5,1.5,2.5],[-54,9.4,204],0x466b75);sign('WEST CAPE LIGHTHOUSE',-51,207,4,1.8);anchor([-51,.8,207],'Read the lighthouse log','read','West Cape Lighthouse','The keeper checks the lamp at dusk, cleans the salt from the glass and records visibility. The coastal road returns to Minato through the western quarter.');
 // The utaki on Mount Aoba's summit: an Okinawan sacred grove, not a shrine with a building.
 // A low coral-stone wall round a clearing, a stone incense burner (uchikō) on a flat altar
 // stone, and the old banyans that make it a grove. Fishermen climb up before dawn to ask
 // for a good sea, and the island comes at the old new year.
 {const {x:ux,z:uz}=AOBA_SUMMIT,top=islandTerrainHeight(ux,uz),still=m=>{m.userData.staticProp=true;return m;},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sv=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const stoneMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  // The wall: two courses of rounded coral stones laid dry, open to the path on the north-east.
  const stones=[];for(let c=0;c<2;c++)for(let i=0;i<34;i++){const a=(i+c*.5)/34*Math.PI*2;if(Math.abs(a-.9)<.38)continue;const r=5.6+Math.sin(i*2.7)*.12,x=ux+Math.cos(a)*r,z=uz+Math.sin(a)*r;stones.push([x,islandTerrainHeight(x,z)+.18+c*.36,z,.42+((i*5+c)%4)*.05,a]);}
  const wall=new THREE.InstancedMesh(rock({seed:31,size:1,flat:.62,light:0xe2dccb,dark:0xa49d8a}),stoneMat,stones.length);wall.name='Utaki coral-stone wall';
  stones.forEach(([x,y,z,s,a],i)=>{wall.setMatrixAt(i,m4.compose(sv.set(x,y,z),q.setFromAxisAngle(up,a*3.1),new THREE.Vector3(s*1.25,s,s)));});wall.computeBoundingSphere();group.add(wall);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;if(Math.abs(a-.9)<.35)continue;const x=ux+Math.cos(a)*5.6,z=uz+Math.sin(a)*5.6;world.colliders.push({id:'Utaki coral-stone wall',x,z,w:2.3,d:.6,yaw:-a+Math.PI/2,minY:islandTerrainHeight(x,z)-.2,height:1.1});}
  // The altar: a flat weathered stone, the incense bowl on it, and a cup of awamori left this morning.
  const altar=new THREE.Mesh(rock({seed:33,size:.85,flat:.32,light:0xb8b2a2,dark:0x7a756a}),stoneMat);altar.name='Utaki altar stone';altar.position.set(ux-1,top+.12,uz-1);group.add(altar);
  world.colliders.push({id:'Utaki altar stone',x:ux-1,z:uz-1,w:1.5,d:1.5,minY:top-.2,height:.6});
  const bowl=new THREE.Mesh(part(new THREE.LatheGeometry([[0,0],[.2,0],[.24,.05],[.26,.2],[.22,.22],[.2,.08],[0,.08]].map(([x,y])=>new THREE.Vector2(x,y)),12),0x6f6b62),stoneMat);bowl.name='Utaki incense burner';bowl.position.set(ux-1,top+.36,uz-1);group.add(bowl);
  const smoke=new THREE.Mesh(part(new THREE.CylinderGeometry(.004,.004,.35,4).translate(0,.4,0),0x9a958a),stoneMat);smoke.name='Utaki incense stick';smoke.position.set(ux-1,top+.36,uz-1);group.add(smoke);
  const cup=new THREE.Mesh(part(new THREE.CylinderGeometry(.04,.03,.05,8),0xe8e2d2),stoneMat);cup.name='Utaki awamori cup';cup.position.set(ux-.55,top+.32,uz-.8);group.add(cup);
  // The grove itself: four old gajumaru banyans round the clearing, their aerial roots in the wall.
  const plantMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});
  const groves=[[-5,4,1.05,41],[4.5,-4,.95,42],[-3.5,-6.5,.9,43],[6,3.5,1.1,44]];
  for(const [dx,dz,sc,seed] of groves){const x=ux+dx*1.4,z=uz+dz*1.4,y=islandTerrainHeight(x,z),tree=new THREE.Mesh(banyan({seed,height:7,spread:4.6}),plantMat);tree.name='Utaki banyan';tree.position.set(x,y,z);tree.scale.setScalar(sc);tree.rotation.y=seed;group.add(tree);world.colliders.push({id:'Utaki banyan',x,z,w:1.6*sc,d:1.6*sc,minY:y-.2,height:4});}
  {const sx=ux+2.5,sz=uz+4,sy=islandTerrainHeight(sx,sz);sign('AOBA UTAKI · PLEASE BE QUIET',sx,sz,3.2,sy+1.55);box('Utaki sign post',[.12,1.25,.08],[sx,sy+.62,sz-.06],0x6d5a46);}
  anchor([ux,top+1,uz],'Stand quietly at the utaki','read','Mount Aoba Utaki','The sacred grove at the top of the island. There is no building: the stones, the banyans and the sky are the shrine. A thread of incense is still burning: somebody came up before dawn to ask the sea for a good catch. At the old new year the whole island comes.');
 }
 // The Ōshiro family's honesty stand (mujin hanbaijo) on the coastal loop, beside their
 // vegetable plots: no one minds it. Pick up what you want and drop the coins in the tin.
 {const sx=84.7,sz=89.3,y=groundHeight(sx,sz),built=islandBuildMaterial(),piece=(name,g,px,py,pz)=>{const m=new THREE.Mesh(g,built);m.name=name;m.position.set(px,py,pz);group.add(m);return m;};
  piece('Honesty stand table',planks({w:2.4,d:1,n:6,color:0xa98458,seed:5}),sx,y+.85,sz);world.colliders.push({id:'Honesty stand table',x:sx,z:sz,w:2.4,d:1,minY:y-.2,height:1.1});
  for(const dx of [-1.1,1.1])box('Honesty stand leg',[.08,.82,.9],[sx+dx,y+.41,sz],0x7a5a3c);
  piece('Honesty stand roof',corrugatedRoof({w:2.9,d:1.5,pitch:.2,color:0x8a9a7a,rust:0xa4683e,seed:2}),sx,y+1.95,sz+.1);for(const dx of [-1.25,1.25])box('Honesty stand post',[.07,1.1,.07],[sx+dx,y+1.38,sz-.55],0x7a5a3c);
  // What is on it today: bumpy gōya, purple-skinned island sweet potatoes, bundles of shima-rakkyō.
  const veg=[];for(let i=0;i<5;i++){const g=new THREE.CapsuleGeometry(.05,.22,3,7).rotateZ(Math.PI/2).rotateY(i*.5).translate(-.85+i*.1,.07,(i%2)*.1-.05),p=g.attributes.position;for(let k=0;k<p.count;k++)p.setY(k,p.getY(k)+Math.sin(p.getX(k)*60)*.004);veg.push(part(g,0x5c8f3a));}
  for(let i=0;i<5;i++)veg.push(part(new THREE.CapsuleGeometry(.055,.1,3,7).rotateZ(Math.PI/2).rotateY(i*.9).translate(-.05+(i%3)*.13,.06,(i>2?.12:-.08)),0x8a4a6a));
  for(let i=0;i<3;i++)for(let k=0;k<6;k++)veg.push(part(new THREE.SphereGeometry(.028,6,4).scale(1,1.4,1).translate(.65+i*.17+(k%3)*.03,.04,(k>2?.03:-.03)),0xf0ece0));
  piece('Honesty stand vegetables',merge(veg),sx,y+.88,sz);
  box('Honesty money tin',[.18,.16,.14],[sx+1,y+.97,sz-.25],0x8a8f94);
  sign('ŌSHIRO FARM · HONESTY STAND',sx,sz-.55,2.6,y+2.25);
  anchor([sx,y+1,sz-1.3],'Look at the honesty stand','airport-shop','Ōshiro honesty stand',{id:'oshiro-honesty-stand',line:'Vegetables from the Ōshiro plots across the field, picked this morning. Nobody minds the stand: take what you want and drop the coins in the tin.',items:[['Gōya, two for ¥100',100],['Shima-rakkyō, a bundle',150],['Island sweet potato',120]]});
 }
 for(const [label,x,z] of [['COASTAL LOOP → HOSHIZAKI',66.5,65.5],['← MINATO · AOBA RADIO →',23.5,104],['HOSHIZAKI · COASTAL BUS',138,188]]){sign(label,x,z,5,1.8);box('Direction sign post',[.12,2,.12],[x,.6,z],0x6b775c);}
 anchor([138,.7,188],'Take the coastal village bus','island-bus');anchor([13.3,1,-37.55],'Review island development projects','island-projects');anchor([-25,1,-39.65],'Complete the airport radio service','island-repair');
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
 return {group,mountain,cargo,guestAwning,update(state){const s=state.island;cargo.visible=!!s?.projects.includes('cargo');guestAwning.visible=!!s?.projects.includes('guesthouse');}};
}
