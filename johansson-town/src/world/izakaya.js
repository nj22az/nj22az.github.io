import {addOwnedCharacter} from '../people/owned-characters.js';
import {japaneseSign,signText} from './okinawa/signs.js';
import {SHARED_DINING_BOUNDS,SHARED_DINING_FLOOR,SHARED_DINING_COLLIDERS} from './interiors/shared-dining-layout.js';
import {createIzakayaTV} from './advertising-billboard.js';
import {hangIzakayaPosters} from './interiors/izakaya-posters.js';
import {buildIzakayaDressing} from './interiors/izakaya-dressing.js';
import {buildIzakayaInteractive} from './interiors/izakaya-interactive.js';
import {restaurantCollider,restaurantApproach,izakayaPlot,SATO_RAMEN_DOOR} from './dining-layout.js';
import {SATO_RAMEN,satoRamenOpen} from './sato-ramen-layout.js';
import {prepareIzakayaGlass} from './shop-glass.js';
import {buildMinatoFacade} from './minato-facade.js';
import {registerDetail} from './detail-stream.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {IZAKAYA_PLAYER_SEATS,DISHES,DRINKS} from '../people/izakaya-beer.js';
import {daylight, lanternGlow} from '../render/dusk.js';
const assets=new Map();
export async function preloadIzakaya(kinds=['exterior','interior']){
 const loader=new GLTFLoader();await Promise.allSettled(kinds.filter(kind=>!assets.has(kind)).map(async kind=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  const file=kind==='exterior'?'minato-benmaher-exterior.glb':'minato-interior.glb';
  try{const response=await fetch(assetURL('models/izakaya/'+file),{signal:controller.signal});if(!response.ok)throw Error(response.status);const source=(await loader.parseAsync(await response.arrayBuffer(),'')).scene;if(kind==='exterior')prepareIzakayaGlass(source);assets.set(kind,source);}catch(e){console.warn('Izakaya asset unavailable',kind,e);}finally{clearTimeout(timeout);}
 }));return {ready:assets.size,total:2};
}
export const izakayaReady=kind=>assets.has(kind);
function asset(kind,parent){
 const source=assets.get(kind);if(!source)return false;
 const model=source.clone(true);model.userData.sharedAsset=true;model.name='Minato '+kind;model.traverse(o=>{if(o.isMesh){o.castShadow=!o.userData.clearWindow;o.receiveShadow=!o.userData.clearWindow;}});parent.add(model);return true;
}
/** The shared interior -- Minato, its kitchen and Sato Ramen -- into a room. False until it has loaded. */
export const addMinatoInterior=room=>asset('interior',room);
export function buildIzakaya(world,options){
 // Where it stands depends on the layout: see IZAKAYA_PLOTS in dining-layout.js.
 const plot=izakayaPlot();
 const site={id:'izakaya',title:'Minato Izakaya',jp:"Izakaya Minato",sub:'SUPPER & STORIES',x:plot.x,z:plot.z,color:0xc98a65,accent:'#b55049',line:'Nao’s place · small plates, old friends and new stories · 16:00–03:00',door:[plot.door[0],0,plot.door[1]],opens:'16:00'};
 const facadeColliders=[];
 const approach=restaurantApproach('izakaya');site.exitPosition=[...site.door];site.approachPosition=[approach[0],0,approach[1]];site.entryFacing=plot.yaw;
 options.sites.push(site);const exterior=new THREE.Group();exterior.position.set(plot.x,0,plot.z);exterior.rotation.y=plot.yaw;world.group.add(exterior);
 // The supplied exterior was a flat glazed box with no eave, no lantern and nothing to
 // say what was behind it — an office frontage with a bar's name on it. See
 // minato-facade.js for what stands there now.
 const built=buildMinatoFacade({parent:exterior,shadows:options.shadows,anisotropy:options.maxAnisotropy,colliders:facadeColliders});
 const suppliedExterior=built?true:asset('exterior',exterior);
 // Something behind the glass, for the supplied model only: the built frontage has
 // solid walls behind its own windows and needs no backing block.
 //
 // prepareIzakayaGlass lifts the window triangles out of the wall and covers the holes
 // with near-invisible glazing so you can see in. On the old street there was always
 // another building behind Minato; on the island there is the west yard and then
 // the open sea, so from the pavement its windows read as holes you can watch the
 // horizon through. The interior is a separate room and cannot stand in for it, so
 // what goes behind the glazing is this: a dim warm box the size of the ground floor,
 // inward-facing, which is what a bar looks like from outside at any hour.
 if(!built){
  // A solid block rather than an inward-facing shell: a shell's near wall is culled,
  // so from the pavement you look straight into it and it fills the view. And darker
  // than it looks it should be — under this town's exposure 0x2c2018 came back as
  // terracotta, which is the same lift that turned the park and the east lawn cream.
  const inside=new THREE.Mesh(new THREE.BoxGeometry(5.4,3.2,5.8),
   new THREE.MeshStandardMaterial({color:0x140d09,roughness:.97}));
  inside.name='Minato window backing';inside.position.set(-1.24,1.6,.8);
  inside.castShadow=false;inside.receiveShadow=false;exterior.add(inside);
 }
 // Held by name rather than by position in the child list: the streamed model used to
 // retire this by removing the group's first child, which is only the placeholder for
 // as long as nothing is ever added before it. Add anything -- the window backing
 // above, say -- and the load quietly removed that instead, leaving the orange block
 // standing in the street with the real building around it.
 let placeholder=null;
 if(!suppliedExterior){
  placeholder=new THREE.Mesh(new THREE.BoxGeometry(5.22,4,6.82),new THREE.MeshStandardMaterial({color:0x965332}));
  placeholder.name='Minato placeholder';placeholder.position.set(-.91,2,1.11);exterior.add(placeholder);
 }
 // Warm readable bilingual sign remains a runtime canvas so it does not require font textures in GLB.
 const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#36241e';ctx.fillRect(0,0,768,192);ctx.textAlign='center';ctx.fillStyle='#ffe4af';ctx.font='bold 70px serif';signText(ctx,japaneseSign("Izakaya Minato"),384,88,700,70);ctx.font='26px sans-serif';ctx.fillText('MINATO · SUPPER & STORIES',384,146);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.68),new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.3}));sign.position.set(0,3.35,4.3);sign.visible=!suppliedExterior;exterior.add(sign);
 const entrance=new THREE.Object3D();entrance.position.set(...site.door);entrance.position.y=1.2;world.group.add(entrance);options.register(entrance,'Come into Minato Izakaya',()=>options.enter(site));
 // The new facade has a recessed closed door and an asymmetric footprint.
 // Stop at the visible step; the entrance prompt opens the existing dining room.
 world.colliders.push(...(built?facadeColliders
  :[{x:-.91,z:1.11,w:5.22,d:6.82,height:9.05},{x:-3.92,z:-1.54,w:.85,d:.85,height:1.08},{x:-3.74,z:-.90,w:.50,d:.50,height:.36}]
 ).map(c=>restaurantCollider('izakaya',c)));

 if(built){
  // Lanterns on after dark, noren out while Nao is open. world.hourly is run by the
  // town's own updateHours, so this follows the clock rather than the frame.
  (world.hourly||(world.hourly=[])).push(minutes=>{
   const h=((minutes%1440)+1440)%1440,open=h>=960||h<180;
   built.lit(open,daylight(minutes),lanternGlow(minutes));
   built.ramen.lit(satoRamenOpen(minutes),daylight(minutes));
  });
  // Sato Ramen, the lunch counter on the alley corner of the same building.
  const ramen={id:SATO_RAMEN.id,title:SATO_RAMEN.title,jp:SATO_RAMEN.jp,sub:'LUNCH · SAME KITCHEN AS MINATO',x:SATO_RAMEN_DOOR[0],z:SATO_RAMEN_DOOR[1],color:0xa3241c,accent:'#a3241c',
   line:'Mrs Sato’s shoyu, miso and shio ramen · lunch 11:00–14:00',door:[SATO_RAMEN_DOOR[0],0,SATO_RAMEN_DOOR[1]],opens:'11:00',entryFacing:plot.yaw};
  ramen.exitPosition=[...ramen.door];
  const old=options.sites.findIndex(s=>s.id===ramen.id);if(old>=0)options.sites.splice(old,1);options.sites.push(ramen);
  const ramenEntrance=new THREE.Object3D();ramenEntrance.position.set(SATO_RAMEN_DOOR[0],1.2,SATO_RAMEN_DOOR[1]);ramenEntrance.name='Sato Ramen entrance';world.group.add(ramenEntrance);
  options.register(ramenEntrance,'Come into Sato Ramen',()=>options.enter(ramen));
 }
 if(!suppliedExterior)registerDetail(world,{id:'izakaya-exterior',priority:1,x:plot.x,z:plot.z,radius:48,load:async()=>{
  await preloadIzakaya(['exterior']);if(!assets.has('exterior'))return false;
  asset('exterior',exterior);placeholder?.removeFromParent();placeholder=null;sign.visible=false;return true;
 }});
 return site;
}
export function buildIzakayaRoom({room,box,reg,collider,action,exit,signTexture}){
 if(!asset('interior',room)){
  box([13,.2,13],[0,-.1,0],0x965332,room,false);box([13,3.8,.2],[0,1.9,-6.4],0xe8c894,room,false);box([8,1,1],[-.8,.5,-2.6],0x965332,room,false);
 }
 // Complete the cutaway asset for first-person viewing. Keep the exit opening.
 box([13,.16,13],[0,3.88,0],0x574638,room,false);
 box([.2,1.02,13],[-6.4,3.3,0],0xe8c894,room,false);
 // The east wall stops at the counter: behind it the kitchen runs on into Sato Ramen.
 box([.2,3.15,9.75],[6.4,2.225,1.525],0xe8c894,room,false);
 for(const x of [-4.15,4.15])box([4.7,3.8,.2],[x,1.9,6.4],0xe8c894,room,false);
 box([3.6,1.1,.2],[0,3.25,6.4],0xe8c894,room,false);
 const anchor=(position,label,fn)=>{const o=new THREE.Object3D();o.position.set(...position);room.add(o);reg(o,label,fn,true);return o;};
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.1,.68),new THREE.MeshStandardMaterial({map:signTexture("Welcome back",'WELCOME BACK · MINATO','#b55049')}));sign.position.set(.5,3.1,-6.05);room.add(sign);
 for(const c of SHARED_DINING_COLLIDERS)collider(c.x,c.z,c.w,c.d,c.height);
 hangMenuStrips(room);lightTheRoom(room);
 anchor([0,1,5.5],'Step outside',exit);
 anchor([3.55,1.15,-2.05],'Order something delicious',()=>action('izakaya-menu'));
 anchor([0,1,0],'Listen to the table',()=>action('izakaya-gossip'));
 // Your own places: the end of the second table, and the window seat. Sitting there, Nao
 // takes your order and brings it over (people/izakaya-beer.js).
 for(const seat of Object.values(IZAKAYA_PLAYER_SEATS)){
  const title=seat.id==='window'?'Minato window seat':seat.counter?'Minato counter':'Minato table',o=anchor([seat.position[0],1,seat.position[2]],seat.label,()=>action('seat',title,'A warm table, a little conversation, and nowhere to hurry.'));
  o.userData.seat={...seat,izakaya:seat,pitch:0};
 }
 for(const z of [4.15,5.0]){const o=anchor([-5.52,.8,z],'Sit in the cosy bar corner',()=>action('seat','Minato lounge corner','A worn upholstered bench, a small wooden table and a warm globe light.'));o.userData.seat={position:[-5.52,0,z],stand:[-3.9,0,z],eyeY:1.12,yaw:Math.PI/2,pitch:0};}
 anchor([4.1,1,-3.8],'Inspect the shared kitchen',()=>action('inspect','Minato and Sato shared kitchen','The ramen stock pots, sink, prep board and range share a working aisle. Walk around the counter through the open passage. Please keep clear while Nao and Mrs Sato are carrying hot bowls.'));
 anchor([-.4,2.5,-5.6],'Choose the evening music',()=>action('radio','Minato radio','Nao turns it down when a good story begins.'));
 hangIzakayaPosters({room,reg,action});
 buildIzakayaDressing(room,{collider});
 const play=buildIzakayaInteractive(room,{anchor,action,collider});
 // Imported American beer advertising: Barfly is a countertop mascot, not another resident.
 box([.58,.08,.45],[-4.4,1.34,-2.6],0x244b46,room,false);
 const barfly=addOwnedCharacter({parent:room,kind:'barfly',position:[-4.4,1.38,-2.6],height:.48,staticDisplay:true,yaw:.15});
 const beerSign=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.55),new THREE.MeshStandardMaterial({map:signTexture('Hawaii Lager','ハワイラガー · アメリカのビール','#244b46'),roughness:.85}));
 beerSign.name='Hawaii Lager advertising';beerSign.position.set(-4.4,2.2,-2.95);room.add(beerSign);
 anchor([-4.4,1.6,-2.2],'Look at Hawaii Lager',()=>action('inspect','Hawaii Lager','An American lager advertisement sent by the harbour importer. The little Barfly mascot wears his favourite island shirt. Nao keeps the display at the quiet end of the counter.'));
 const owned=[barfly];
 return {keep:play,owned,ownedUpdate:dt=>owned.forEach(actor=>actor.update(dt)),dispose:()=>owned.forEach(actor=>actor.dispose()),name:'Minato',bounds:SHARED_DINING_BOUNDS,floorPolygon:SHARED_DINING_FLOOR,spawn:[0,0,5.4],exit:[0,1.1,6.2],cutaway:true,television:createIzakayaTV({parent:room})};
}

/**
 * The tanzaku: the day's menu on strips of paper pinned along the back wall, one dish to
 * a strip, written top to bottom with the price at the foot -- all of it orderable
 * (people/izakaya-beer.js). Drawn here rather than baked into the model so the brushwork
 * stays sharp.
 */
// The same list the order service takes: every strip on the wall is something Nao will
// bring you, at the price on the strip. Specials in red.
const MENU_STRIPS=[
 ...Object.values(DISHES).map(d=>[d.jp,d.price,['yakitori','oden','sashimi'].includes(d.id)]),
 ...['draft','bottle','awamori','sake','can','oolong'].map(id=>[DRINKS[id].jp.replace(/ .*$/,m=>id==='draft'?'':m),DRINKS[id].price]),
];
function hangMenuStrips(room){
 const cell=[64,256],canvas=document.createElement('canvas');canvas.width=cell[0]*MENU_STRIPS.length;canvas.height=cell[1];
 const ctx=canvas.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';
 MENU_STRIPS.forEach(([name,price,special],i)=>{
  const x=i*cell[0];ctx.fillStyle=special?'#e9d9b4':'#f3e8cc';ctx.fillRect(x+3,0,cell[0]-6,cell[1]);
  ctx.fillStyle=special?'#b3382c':'#2a221c';const chars=[...japaneseSign(name).replace(/ /g,'')],size=Math.min(34,196/chars.length);
  ctx.font=`bold ${size}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif`;
  chars.forEach((ch,k)=>ctx.fillText(ch,x+cell[0]/2,14+size/2+k*size*1.02));
  ctx.fillStyle='#b3382c';ctx.font='bold 19px serif';ctx.fillText('¥'+price,x+cell[0]/2,cell[1]-18);
 });
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.92});
 // Eleven to the left of the welcome board, five between it and the radio.
 const slots=[...Array.from({length:11},(_,k)=>-4.95+k*.34),...Array.from({length:5},(_,k)=>2.35+k*.34)];
 const group=new THREE.Group();group.name='Minato menu strips';
 slots.forEach((x,i)=>{
  const geometry=new THREE.PlaneGeometry(.2,.8),uv=geometry.attributes.uv;
  for(let k=0;k<uv.count;k++)uv.setX(k,(i+uv.getX(k))/MENU_STRIPS.length);
  const strip=new THREE.Mesh(geometry,material);strip.position.set(x,3.03,-6.18);strip.rotation.z=(i%3-1)*.012;group.add(strip);
 });
 room.add(group);
}
/** Warm light from the lanterns over the counter and the lamps over the tables. */
function lightTheRoom(room){
 // Under each bell pendant over the counter and the tables, the back bar's shelf lights, and
 // the koagari (tools/blender/build-minato-interior.py).
 for(const [x,y,z,power] of [[-3.8,2.25,-2.25,3.6],[-2.3,2.25,-2.25,3.6],[-.8,2.25,-2.25,3.6],[.7,2.25,-2.25,3.6],[2.2,2.25,-2.25,3.6],[-2.9,1.9,-5.5,3],[-3.5,2.15,2.2,4],[2.6,2.15,2,4],[5.3,1.95,1.8,4]]){
  const light=new THREE.PointLight(0xffb36b,power,7,2);light.position.set(x,y,z);light.name='Minato lamp';room.add(light);
 }
}
