import * as THREE from '../../../vendor/three.module.js';
import {addMinatoInterior} from '../izakaya.js?snappy=1';
import {SATO_ROOM,SATO_COUNTER,SATO_LEDGE,SATO_CORNER,SATO_COLLIDERS,SATO_MENU,SATO_RAMEN} from '../sato-ramen-layout.js';

/**
 * Inside Sato Ramen. The room is the shared interior model, so the kitchen behind the
 * counter is Minato's own line carried on round the corner; this adds what only the
 * ramen shop has: white lunch light, the wooden menu plaques, the steam off the pots,
 * and its counter and window seats, each served by Mrs Sato across the counter or at the ledge.
 */
const MINCHO='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';

function steamTexture(){
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');
 x.fillStyle=g;x.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function plaqueTexture(item){
 const c=document.createElement('canvas');c.width=96;c.height=320;const x=c.getContext('2d');
 x.fillStyle='#8a5a36';x.fillRect(0,0,96,320);x.strokeStyle='#5a3a22';x.lineWidth=6;x.strokeRect(3,3,90,314);
 x.fillStyle='#f4ead2';x.textAlign='center';x.textBaseline='middle';
 const chars=[...item.jp],size=Math.min(33,205/chars.length);x.font=`bold ${size}px ${MINCHO}`;chars.forEach((ch,i)=>x.fillText(ch,36,23+(i+.5)*size));
 x.save();x.translate(78,140);x.rotate(-Math.PI/2);x.font='bold 12px serif';x.fillText(item.name,0,0,240);x.restore();
 x.fillStyle='#ffd27a';x.font=`bold 24px ${MINCHO}`;x.fillText('¥'+item.cost,48,296);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildSatoRamenRoom({room,reg,collider,action,exit}){
 const group=new THREE.Group();group.name='Sato Ramen';room.add(group);
 if(!addMinatoInterior(room)){
  const floor=new THREE.Mesh(new THREE.BoxGeometry(5,.1,6),new THREE.MeshStandardMaterial({color:0x9c5436}));floor.position.set(8.95,-.05,.8);group.add(floor);
 }
 for(const c of SATO_COLLIDERS)collider(c.x,c.z,c.w,c.d,c.height);
 // Minato's ceiling, which its own room adds at runtime: seen through the kitchen from here.
 const ceiling=new THREE.Mesh(new THREE.BoxGeometry(13,.16,13),new THREE.MeshStandardMaterial({color:0x574638,roughness:.9}));ceiling.position.set(0,3.88,0);group.add(ceiling);
 // A lunch counter under fluorescent tubes, not a bar under lanterns.
 room.add(new THREE.HemisphereLight(0xfff6e8,0x8a7a66,1.55));
 for(const z of [-2.6,.3,2.6]){const light=new THREE.PointLight(0xfff1dc,3.2,8,2);light.position.set(8.95,3.3,z);light.name='Sato Ramen tube light';group.add(light);}
 // The menu on wooden plaques along the back wall, above the canopy.
 SATO_MENU.forEach((item,i)=>{
  const plaque=new THREE.Mesh(new THREE.PlaneGeometry(.26,.86),new THREE.MeshStandardMaterial({map:plaqueTexture(item),roughness:.8}));
  plaque.position.set(6.85+i*.44,3.02,-6.16);plaque.rotation.z=(i%3-1)*.01;plaque.name='Menu plaque · '+item.name;group.add(plaque);
 });
 // Steam off the two stock pots and the noodle boiler, rising and thinning out.
 const puffMaterial=new THREE.SpriteMaterial({map:steamTexture(),transparent:true,depthWrite:false,opacity:.5});
 const sources=[[8.28,1.15,-5.95],[8.92,1.15,-5.95],[7.25,.95,-5.95]],puffs=[];
 for(let i=0;i<12;i++){const s=new THREE.Sprite(puffMaterial.clone());s.userData.source=sources[i%3];s.userData.t=i/12;s.name='Steam';group.add(s);puffs.push(s);}
 // The drinks corner on the back counter, where Mrs Sato pours (people/ramen-kitchen.js):
 // a steel coffee urn, a jug of cold barley tea and a stack of cups.
 {
  const drinks=new THREE.Group();drinks.name='Sato Ramen drinks corner';drinks.position.set(10.72,.92,-3.2);group.add(drinks);
  const steel=new THREE.MeshStandardMaterial({color:0xb9bcb8,roughness:.25,metalness:.75}),black=new THREE.MeshStandardMaterial({color:0x1d1d1d,roughness:.5});
  const urn=new THREE.Mesh(new THREE.CylinderGeometry(.11,.12,.38,20),steel);urn.position.set(-.12,.19,0);drinks.add(urn);
  const lid=new THREE.Mesh(new THREE.SphereGeometry(.11,16,8,0,Math.PI*2,0,Math.PI/2),steel);lid.position.set(-.12,.38,0);drinks.add(lid);
  const tap=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.06),black);tap.position.set(-.12,.07,.13);drinks.add(tap);
  const jug=new THREE.Mesh(new THREE.CylinderGeometry(.065,.07,.24,16),new THREE.MeshStandardMaterial({color:0xdfe8e4,roughness:.08,transparent:true,opacity:.42,depthWrite:false}));jug.position.set(.14,.12,.02);drinks.add(jug);
  const tea=new THREE.Mesh(new THREE.CylinderGeometry(.06,.065,.18,16),new THREE.MeshStandardMaterial({color:0xa8682a,roughness:.25,transparent:true,opacity:.8}));tea.position.set(.14,.095,.02);drinks.add(tea);
  for(let k=0;k<4;k++){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.036,.028,.07,16),new THREE.MeshStandardMaterial({color:0xf4f1ea,roughness:.35}));cup.position.set(.32,.035+k*.05,-.02);drinks.add(cup);}
 }
 const anchor=(position,label,fn)=>{const o=new THREE.Object3D();o.position.set(...position);o.name=label;group.add(o);reg(o,label,fn,true);return o;};
 anchor([10.8,1,-3.9],'Inspect the ramen kitchen',()=>action('inspect','Sato Ramen kitchen','Steel stock pots simmer under the extractor. A clear passage at the counter’s right end leads to the shared Minato kitchen; the range, sink and counters remain solid.'));
 [...SATO_COUNTER,...SATO_LEDGE,...SATO_CORNER].forEach((seat,i)=>{
  const corner=i>=SATO_COUNTER.length+SATO_LEDGE.length,ledge=!corner&&i>=SATO_COUNTER.length,label=corner?'Sit at the window table':ledge?'Sit at the wall ledge':'Sit at the ramen counter';
  const o=anchor([seat.position[0],1,seat.position[2]],label,()=>action('seat',corner?'Sato Ramen window table':ledge?'Sato Ramen ledge':'Sato Ramen counter','A red stool and a glass of cold water. Mrs Sato nods at you over the steam.'));
  o.userData.seat={ramenSeatId:i,position:[...seat.position],stand:[...seat.stand],eyeY:seat.height+.6,yaw:seat.yaw,pitch:0,table:[...seat.table],surfaceY:seat.height};
 });
 anchor([6.95,1.3,3.0],'Read the ticket machine',()=>action('read',SATO_RAMEN.title+' · ticket machine',SATO_MENU.map(item=>item.jp+' · '+item.name+' · ¥'+item.cost).join('\n')+'\n\nTake a seat and order: when the machine is being temperamental, which is usually, Mrs Sato takes the money over the counter.'));
 anchor([10.9,2.9,3.1],'Watch the lunchtime news',()=>action('inspect','Lunchtime news','NHK Okinawa: a typhoon well to the south, turning away; the ferry timetable as usual; a man in Nago has grown a very large goya.'));
 anchor([9.0,2.9,-5.9],'Read the menu plaques',()=>action('read',SATO_RAMEN.jp+' · menu',SATO_MENU.map(item=>item.jp+' ¥'+item.cost).join(' · ')));
 anchor([...SATO_ROOM.exit],'Exit to the street',exit);
 let clock=0;
 function tick(dt){
  clock+=dt;
  for(const s of puffs){
   const t=(s.userData.t+clock*.18)%1,[x,y,z]=s.userData.source;
   s.position.set(x+Math.sin(t*6+z)*.05,y+t*1.2,z+Math.cos(t*5)*.04);s.scale.setScalar(.18+t*.45);s.material.opacity=.45*(1-t)*Math.min(1,t*6);
  }
 }
 tick(0);
 return {...SATO_ROOM,name:SATO_RAMEN.title,colliders:[],tick};
}
