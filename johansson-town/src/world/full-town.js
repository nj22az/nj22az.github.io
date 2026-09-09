import {buildStorefront} from './storefront.js';
import {buildRamenRestaurant} from './supplied-rooms.js';
import {applyStreetClearance} from './street-clearance.js';
import {buildPromenade} from './promenade.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {CITY_SECTIONS,FULL_TOWN,STREET_DOORS,sourceHeight,extensionHeight,fullContains} from './full-town-state.js';
import {groundHeight} from './layout.js';
import {parkHeight} from './park-layout.js';
import {buildPark} from './park.js';
import {createVendingMachine} from './vending.js';
import {ITEMS} from '../../content-data.js';
import {RESIDENTS} from '../people/residents.js';
import {IZAKAYA_DOOR,RAMEN_DOOR,izakayaOpen} from '../people/social.js';
import {circleHitsRect} from '../../physics.js';
let source=null,pending,clearance;
export function preloadFullTown(){return pending??=(async()=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const [asset,data,cleanup]=await Promise.all(['overworld.glb','navigation.json','street-clearance.json'].map(file=>fetch(assetURL('models/full-town/'+file),{signal:controller.signal})));if(!asset.ok||!data.ok||!cleanup.ok)throw Error('Town assets unavailable');const navigation=await data.json();const loaded=await new GLTFLoader().parseAsync(await asset.arrayBuffer(),'');
  if(loaded.scene.children.length!==4||navigation.grid.heights.length!==navigation.grid.nx*navigation.grid.nz)throw Error('Invalid complete town');
  clearance=applyStreetClearance(loaded.scene,navigation,await cleanup.json());source=loaded.scene;FULL_TOWN.grid=navigation.grid;FULL_TOWN.colliders=CITY_SECTIONS.flatMap(section=>clearance.colliders.map(c=>({...c,x:c.x+section.x,z:c.z+section.z})));FULL_TOWN.active=true;return true;
 }catch(error){console.warn('Complete overworld unavailable; keeping the previous town',error);return false;}finally{clearTimeout(timer);}
})();}
const LOCATIONS=[
 ['office',-9.15,3.92,0,-1],['frontrow',6.18,2.72,0,-1],['form3d',-8,-7.39,0,1],['stepwise',14.2,-3.73,0,1],
 ['journal',4.48,-6.35,-1,0],['electronics',14.88,2.61,0,-1],['market',16.68,10.78,1,0],['career',-10.65,-10.65,-1,0],
 ['ramen',-12.48,-3.69,1,0],['izakaya',-14.63,6.26,1,0],['tea-house',-15.67,2.83,0,-1],
];
const LANDMARK_IDS=new Set(['market','ramen']);
export function buildFullTown(options){
 if(!FULL_TOWN.active||!source)return null;
 const group=new THREE.Group();group.name='Complete supplied Japanese Town';options.scene.add(group);
 for(const section of CITY_SECTIONS){const model=source.clone(true);model.position.set(section.x,0,section.z);model.userData.sharedAsset=true;model.name='Original canal, bridge, buildings and streets';model.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=true;for(const map of [o.material.map,o.material.normalMap,o.material.roughnessMap])if(map)map.anisotropy=Math.min(options.maxAnisotropy||1,4);});group.add(model);}
 const promenade=buildPromenade(group,{mobile:options.mobile,shadows:options.shadows,maxAnisotropy:options.maxAnisotropy});
 const colliders=FULL_TOWN.colliders.map(c=>({...c})),world={group,colliders,people:[],homes:new Map(),harbourShops:[],plantSites:[],quality:{completeSuppliedOverworld:true,streetInteractions:18,localRuntimeAssets:true,sourceTriangles:96308,citySections:CITY_SECTIONS.length,removedStreetColliders:clearance.removedColliders,removedStreetTriangles:clearance.removedTriangles,restoredLandmarks:['market','ramen'],canalPromenade:true,streetDoors:STREET_DOORS.length},isOpen(site,minutes){const m=((minutes%1440)+1440)%1440;return site.id==='izakaya'?izakayaOpen(m):site.id==='home'||site.id==='bus-hut'||m>=540&&m<(site.id==='market'?1200:site.id==='ramen'?1260:1140);},updateHours(){},updateHomes(){},setRain(value){rain.visible=value;promenade.setRain(value);},update(dt,time){if(rain.visible){rain.rotation.y=time*.01;rain.position.y=-(time*7)%6;}}};
 const blocked=(x,z,r=.32)=>!fullContains(x,z,r,parkHeight)||colliders.some(c=>circleHitsRect(x,z,r,c));
 const nearest=(x,z,used=[],range=3)=>{for(let radius=0;radius<=range;radius+=.2)for(let i=0;i<(radius?32:1);i++){const a=i/32*Math.PI*2,p=[x+Math.cos(a)*radius,z+Math.sin(a)*radius];if(!blocked(...p)&&used.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>.65))return p;}throw Error('No safe town position near '+[x,z]);};
 const anchor=(point,label,fn)=>{const a=new THREE.Object3D();a.position.set(point[0],groundHeight(...point)+1.2,point[1]);group.add(a);options.register(a,label,fn);return a;};
 const sign=(text,x,y,z,angle)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#e8dbc0';ctx.fillRect(0,0,512,96);ctx.fillStyle='#3e463e';ctx.textAlign='center';ctx.font='bold 34px sans-serif';ctx.fillText(text,256,60,490);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.34),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=angle;group.add(m);};
 for(const [id,x,z,nx,nz] of LOCATIONS){
  let site=options.sites.find(s=>s.id===id);if(!site){site={id,title:id==='izakaya'?'Minato Izakaya':id==='ramen'?'Sato Ramen':'Corner Tea House',jp:id==='izakaya'?'湊居酒屋':id==='ramen'?'中華そば':'角の茶屋',sub:'CANAL QUARTER',color:0x897859,accent:'#68513c',line:'The canal neighbourhood · 14 September 1988'};options.sites.push(site);}
  const p=nearest(x+nx*1.1,z+nz*1.1);site.x=x;site.z=z;site.door=[p[0],groundHeight(...p),p[1]];site.exitPosition=[...site.door];site.entryFacing=Math.atan2(-nx,-nz);FULL_TOWN.sites.set(id,site);
  if(!LANDMARK_IDS.has(id)){anchor(p,'Enter '+site.title,()=>options.enter(site));sign(site.jp,x+nx*.18,2.55,z+nz*.18,Math.atan2(nx,nz));}
 }
 // Restore the recognizable Sakura storefront instead of a generic building marker.
 const market=FULL_TOWN.sites.get('market');market.side=1;market.z=10.78;market.x=16.68;market.title='Sakura Shōten';market.jp='桜商店';
 const sakura=buildStorefront({parent:group,site:market,register:options.register,enter:options.enter,label:(jp,en,pos,w,h,angle,bg,fg)=>{
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg||'#f6e8bb';ctx.fillRect(0,0,768,256);ctx.fillStyle=fg||'#a6333c';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 92px sans-serif';ctx.fillText(jp,384,102,700);ctx.font='700 28px sans-serif';ctx.fillText(en,384,202,700);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));mesh.position.set(...pos);mesh.rotation.y=angle;group.add(mesh);return mesh;
 }});sakura.name='Sakura Konbini landmark';const sakuraDoor=nearest(6.8,13.28,[],4);market.door=[sakuraDoor[0],groundHeight(...sakuraDoor),sakuraDoor[1]];market.exitPosition=[...market.door];market.entryFacing=-Math.PI/2;FULL_TOWN.sites.set('market',market);
 // Restore the actual supplied Shenmue ramen model as a street landmark.
 const oldRamen=FULL_TOWN.sites.get('ramen'),oldIndex=options.sites.indexOf(oldRamen);if(oldIndex>=0)options.sites.splice(oldIndex,1);
 const ramen=buildRamenRestaurant(world,options)||oldRamen;if(ramen){
  const p=nearest(ramen.door[0],ramen.door[2],[],4);ramen.door=[p[0],groundHeight(...p),p[1]];ramen.exitPosition=[...ramen.door];ramen.entryFacing=Math.PI;FULL_TOWN.sites.set('ramen',ramen);
 }
 const pair=id=>{const p=FULL_TOWN.sites.get(id).door;return [p[0],p[2]];};IZAKAYA_DOOR.splice(0,2,...pair('izakaya'));RAMEN_DOOR.splice(0,2,...pair('ramen'));FULL_TOWN.escort=pair('form3d');
 const workIds=['frontrow','form3d','career','ramen','market','office','tea-house','frontrow','journal','career','frontrow','frontrow','office','electronics','tea-house','stepwise','journal','market','tea-house','form3d','izakaya','market'],occupied=[];
 RESIDENTS.forEach((profile,i)=>{
  const work=nearest(...pair(workIds[i]),occupied,4);occupied.push(work);const homeSite=LOCATIONS[Math.floor(i/2)%LOCATIONS.length][0],homeBase=pair(homeSite),home=nearest(homeBase[0]+(i%2?.16:-.16),homeBase[1]);
  profile.work=work;profile.evening=nearest((i%2?-5:4)+(i%4===0?44:0),i%3===0?-1:3);profile.home=home;profile.homeAddress=(i%2?'2':'1')+'F · '+FULL_TOWN.sites.get(homeSite).title;
  const g=new THREE.Group();g.userData.name=profile.name;g.position.set(work[0],groundHeight(...work),work[1]);group.add(g);world.people.push({g,profile,x:work[0],z:work[1],index:i,legs:[],arms:[]});options.register(g,'Talk to '+profile.name,()=>options.onAction('resident',profile.name));
  const entry={owner:profile.name,address:profile.homeAddress,door:home,occupied:false};world.homes.set(profile.name,entry);anchor(home,'Read '+profile.name+'’s nameplate',()=>options.onAction('read',profile.homeAddress,profile.name+' lives upstairs. '+(entry.occupied?'The resident is home.':'The resident is out.')));
 });
 FULL_TOWN.patrol=[[-5,-1],[-5,-5],[-11,-6],[-11,1],[4,0],[10,1],[17,0],[26,0],[39,0],[48,0],[39,0],[26,0],[17,0],[4,0]].map(p=>nearest(...p));
 FULL_TOWN.catTargets=[pair('frontrow'),nearest(-11,-1),[-.1,-30]];
 const spawn=nearest(-5,-1);FULL_TOWN.spawn=[spawn[0],groundHeight(...spawn),spawn[1]];world.spawn=FULL_TOWN.spawn;
 const vertices=[],indices=[],step=.25;
 for(let z=-35;z<2;z+=step)for(let x=-10;x<30;x+=step){if(sourceHeight(x+step/2,z+step/2)!==null||parkHeight(x+step/2,z+step/2)!==null||extensionHeight(x+step/2,z+step/2,parkHeight)===null)continue;const corners=[[x,z],[x,z+step],[x+step,z],[x+step,z+step]],base=vertices.length/3;for(const p of corners)vertices.push(p[0],groundHeight(...p)-.012,p[1]);indices.push(base,base+1,base+2,base+2,base+1,base+3);}
 const paving=new THREE.BufferGeometry();paving.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));paving.setIndex(indices);paving.computeVertexNormals();
 const board=new THREE.Mesh(paving,new THREE.MeshStandardMaterial({color:0xb69a75,roughness:.92,side:THREE.DoubleSide}));board.name='harbour-boardwalk-fill';group.add(board);
 buildPark(world,options);world.park.seat={...world.park.seat,yaw:2.15,pitch:0};world.park.bench.userData.seat=world.park.seat;anchor([0,-31],'Fish from the harbour pier',()=>options.onAction('fishing'));
 // Keep actual street-side activities only where they do not impede the central lane.
 const box=(size,pos,color,parent=group)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.85}));m.position.set(...pos);parent.add(m);return m;};
 for(const [i,kind,title] of [[0,'phone','Harbour payphone'],[1,'vending','Buy a cold drink'],[2,'arcade','Star Port arcade'],[3,'radio','Neighbourhood radio']]){const x=3+i*3,z=-22.25,g=new THREE.Group();g.position.set(x,0,z);group.add(g);if(kind==='vending')g.add(createVendingMachine({shadows:options.shadows}));else{box([.8,kind==='radio'?1:1.6,.6],[0,kind==='radio'?.5:.8,0],kind==='phone'?0x536b58:0x655547,g);box([.58,.42,.04],[0,1.15,.32],0x304d4a,g);}colliders.push({x,z,w:1.1,d:.65});anchor([x,-20],title,()=>options.onAction(kind,title));}
 const bench=box([1.8,.15,.65],[15,.55,-22.25],0x795d43);box([1.8,.65,.12],[15,.9,-22.53],0x795d43);for(const x of [14.3,15.7])box([.12,.55,.5],[x,.275,-22.25],0x4d453a);colliders.push({x:15,z:-22.25,w:1.8,d:.65});const seat=anchor([15,-20],'Sit beside the harbour',()=>options.onAction('seat','Harbour bench'));seat.userData.seat={position:[15,0,-22.25],stand:[15,0,-20],eyeY:1.3,yaw:0,pitch:0};
 // Strong location markers replace the previous ambiguous generic signs.
 for(const [title,ideal,text] of [['SAKURA KONBINI',pair('market'),'桜商店 · daily goods · Yuri'],['SATO RAMEN',pair('ramen'),'中華そば 佐藤 · ramen · ¥300'],['East quarter',[39,0],'Residential east quarter'],['Canal crossing',[0,0],'Bridge to the opposite bank'],['Harbour',[ -5,-19],'Quay, park and pier']])anchor(nearest(...ideal),title,()=>options.onAction('read',title,text));
 const cat=new THREE.Group();cat.userData.name='Tama';const body=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshStandardMaterial({color:0xc88947}));body.scale.set(1.7,.8,.8);body.position.y=.25;cat.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),body.material);head.position.set(.26,.38,0);cat.add(head);const cp=FULL_TOWN.catTargets[0];cat.position.set(cp[0],groundHeight(...cp),cp[1]);group.add(cat);options.register(cat,'Greet Tama',()=>options.onAction('cat'));world.cat=cat;
 const positions=new Float32Array(180*3);for(let i=0;i<positions.length;i+=3){positions[i]=Math.sin(i*19)*20;positions[i+1]=6+(i%12);positions[i+2]=Math.cos(i*11)*14;}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(positions,3));const rain=new THREE.Points(rg,new THREE.PointsMaterial({color:0xbad2de,size:.04,transparent:true,opacity:.55}));rain.visible=false;group.add(rain);
 world.contentPositions=new Map(ITEMS.map((item,i)=>[item.id,[-7.8+(i%2)*5.6,1.1,-18.5-Math.floor(i/2)*1.05]]));world.findSafe=nearest;world.promenade=promenade;return world;
}