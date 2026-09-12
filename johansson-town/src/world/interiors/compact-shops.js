import * as THREE from '../../../vendor/three.module.js';
import {createMaterials} from '../../render/materials.js';
import {alleyBusinessLayout} from '../business-layout.js';
import {buildShopDoor} from '../shop-door.js';

export const TEA_ROOM={width:6.6,depth:5.8,bounds:{minX:-3.3,maxX:3.3,minZ:-2.9,maxZ:2.9},doorX:0,spawn:[0,0,2.25],exit:[0,1.1,2.78],yaw:0};
export function compactRoomLayout(id){return id==='tea-house'?TEA_ROOM:alleyBusinessLayout(id)?.room;}

// The combined shops use the floor area of two adjoining supplied alley units.
// Furniture and approaches are authored together; there is no generic room shell.
export function buildCompactShop({site,room,reg,collider,action,exit}){
 const layout=compactRoomLayout(site.id);if(!layout)return null;
 const {width:w,depth:d,doorX}=layout,hw=w/2,hd=d/2;
 room.name=site.title+' interior';
 const surfaces=createMaterials(),wood=surfaces.material('timber',0x92734f),dark=surfaces.material('timber',0x574837),plaster=surfaces.material('plaster',0xd8cbb1),floor=surfaces.material('timber',0x9b8464);
 const palette=new Map();const colour=c=>{if(!palette.has(c))palette.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82}));return palette.get(c);};
 function box(name,size,pos,mat,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof mat==='number'?colour(mat):mat);m.name=name;m.position.set(...pos);m.receiveShadow=true;room.add(m);if(solid)collider(pos[0],pos[2],size[0]+.03,size[2]+.03,pos[1]+size[1]/2);return m;}
 function anchor(pos,label,kind,title,text,worker){const o=new THREE.Object3D();o.name=label;o.position.set(...pos);room.add(o);if(worker)o.userData.workers=[worker];reg(o,label,kind==='exit'?exit:()=>action(kind,title,text),true);return o;}
 function board(title,sub,pos,width=1.5){const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#e6d7b7';ctx.fillRect(0,0,512,160);ctx.fillStyle='#3d4942';ctx.textAlign='center';ctx.font='bold 36px serif';ctx.fillText(title,256,65,480);ctx.font='21px sans-serif';ctx.fillText(sub,256,120,480);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,.44),new THREE.MeshBasicMaterial({map:t}));m.position.set(...pos);room.add(m);}
 function bench(name,x,z,width,depth=.48){box(name,[width,.10,depth],[x,.85,z],wood,true);for(const dx of [-width/2+.08,width/2-.08])box(name+' leg',[.07,.80,depth-.10],[x+dx,.4,z],dark);}
 function chair(x,z,yaw=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;room.add(g);const part=(size,pos)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),wood);m.position.set(...pos);g.add(m);};part([.43,.08,.43],[0,.46,0]);part([.43,.45,.06],[0,.72,.19]);for(const dx of [-.16,.16])for(const dz of [-.16,.16])part([.045,.44,.045],[dx,.22,dz]);collider(x,z,.48,.48,.96);return g;}
 box('Fitted timber floor',[w+.16,.12,d+.16],[0,-.06,0],floor);
 box('Plaster rear wall',[w+.16,2.75,.12],[0,1.375,-hd-.06],plaster);
 for(const x of [-hw-.06,hw+.06])box('Side wall',[.12,2.75,d+.24],[x,1.375,0],plaster);
 for(const [a,b] of [[-hw,doorX-.52],[doorX+.52,hw]])if(b>a)box('Street wall',[b-a,2.75,.12],[(a+b)/2,1.375,hd+.06],plaster);
 box('Door lintel',[1.04,.22,.12],[doorX,2.64,hd+.06],dark);
 box('Timber ceiling',[w+.16,.12,d+.16],[0,2.81,0],plaster);
 for(const z of [-hd,hd])box('Wall skirting',[w,.14,.08],[0,.1,z],dark);
 for(const x of [-hw,hw])box('Wall skirting',[.08,.14,d],[x,.1,0],dark);
 const door=buildShopDoor(room,{name:site.id+'-inside-door',width:1.0});door.group.position.set(doorX,0,hd-.02);door.group.rotation.y=Math.PI;
 anchor(layout.exit,'Exit to '+(site.id==='tea-house'?'North Street':'the shopping alley'),'exit');
 // A small illuminated shop window gives the front wall a clear street orientation.
 const windowX=doorX<0?Math.min(hw-.65,doorX+2):Math.max(-hw+.65,doorX-1.8);
 box('Window surround',[1.08,1.22,.06],[windowX,1.75,hd-.02],dark);
 const glass=new THREE.MeshStandardMaterial({color:0x73887e,emissive:0xc7ae76,emissiveIntensity:.2,roughness:.5});
 box('Street window',[.96,1.1,.025],[windowX,1.75,hd-.065],glass);
 for(const dx of [-.46,0,.46])box('Window joinery',[.04,1.1,.04],[windowX+dx,1.75,hd-.09],dark);
 const lamp=new THREE.MeshStandardMaterial({color:0xf3e4bd,emissive:0xffd69b,emissiveIntensity:.8});
 for(const x of [-w*.25,w*.25])box('Ceiling strip',[.14,.055,Math.min(1.1,d*.5)],[x,2.7,0],lamp);
 room.add(new THREE.HemisphereLight(0xffead0,0x777465,1.35));const light=new THREE.PointLight(0xffdba4,1.35,8,2);light.position.set(0,2.35,0);room.add(light);

 if(site.id==='frontrow'){
  box('Bookcase back',[2.1,2.05,.18],[-1.45,1.025,-hd+.1],dark);
  for(const y of [.32,.86,1.4,1.92]){box('Book shelf',[2.1,.055,.3],[-1.45,y,-hd+.18],wood);for(let i=0;i<11;i++)box('Bound volume',[.11,.3+(i%3)*.03,.19],[-2.35+i*.18,y+.2,-hd+.20],[0x814c3e,0x4d6668,0xa49267,0x626f4f][i%4]);}
  collider(-1.45,-hd+.14,2.15,.33,2.12);
  bench('Bookselling counter',-2.08,.71,.84,.38);
  box('Brass till',[.25,.19,.22],[-2.28,1,.70],0x53685d);
  anchor([-2,.95,.68],'Browse the bookshop ledger','read','Books & evening papers','Aya keeps the reading copies here. Reiko prepares the next edition at the print bench.','Aya');
  bench('Editor and printing bench',1.20,-hd+.30,2.6,.5);
  box('Press bed',[.66,.07,.4],[2.04,.96,-hd+.31],0x53615b);
  for(const x of [1.77,2.31])box('Press cheek',[.065,.43,.42],[x,1.15,-hd+.31],0x53615b);
  const roller=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.56,12),colour(0x303832));roller.rotation.z=Math.PI/2;roller.position.set(2.04,1.32,-hd+.31);room.add(roller);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.18,.024,6,20),colour(0x404c47));wheel.rotation.y=Math.PI/2;wheel.position.set(2.40,1.3,-hd+.31);room.add(wheel);
  anchor([1.8,1.05,-hd+.44],'Operate the printing press','machine','Printing press','A compact proof press. Fresh proofs and the evening newspaper share the bookshop’s rear bench.','Reiko');
  anchor([.55,1,-hd+.35],'Read the editor’s proofs','read','Editor’s desk','Reiko’s corrections, delivery slips and clipped harbour reports.','Reiko');
  const seat=chair(2.12,.68);seat.userData.seat={position:[2.12,0,.68],stand:[1.35,0,.5],eyeY:1.12,yaw:Math.PI/2,pitch:0};reg(seat,'Sit in the reading chair',()=>action('seat','Reading chair','A quiet seat by the bookshop window.'),true);
  anchor([-1.9,1,.8],'Buy newspaper · ¥80','buy','Evening newspaper',{cost:80,item:'Evening newspaper',text:'Reiko’s evening edition, collected at Aya’s counter.'});
  board('FRONT-ROW BOOKS & PRESS','READING COPIES · LOCAL NEWS',[0,2.38,-hd+.08],3.7);
 }else if(site.id==='form3d'){
  bench('Shared repair bench',0,-hd+.32,w-.3,.54);
  box('Tool board',[1.8,.66,.06],[-1.02,1.55,-hd+.08],dark);
  for(let i=0;i<5;i++){box('Hanging hand tool',[.04,.31,.07],[-1.65+i*.29,1.56,-hd+.13],0x8b9994);box('Tool grip',[.07,.11,.07],[-1.65+i*.29,1.72,-hd+.13],0x7b4e38);}
  box('Bench vice',[.24,.18,.24],[-1.55,1,-hd+.28],0x485a58);box('Vice jaws',[.32,.05,.20],[-1.55,1.13,-hd+.28],0x9baba1);
  box('Oscilloscope',[.58,.36,.35],[.45,1.08,-hd+.24],0x596c63);box('Oscilloscope screen',[.32,.22,.025],[.34,1.10,-hd+.045],0x324f45);box('Signal trace',[.25,.012,.018],[.34,1.10,-hd+.025],0xb3c491);
  for(const x of [.66,.77])box('Instrument control',[.035,.035,.03],[x,1.13,-hd+.04],0xd2c9ab);
  box('Repair radio',[.36,.25,.26],[1.50,1,-hd+.25],0x6f503d);
  for(let i=0;i<5;i++)box('Radio grille',[.016,.16,.025],[1.36+i*.045,1,-hd+.1],0xd0b992);
  anchor([-1.32,1,-hd+.22],'Use pattern workbench','machine','Pattern workbench','Kenji checks the drawings, clamps the brass blank and files it to size.','Kenji');
  anchor([.55,1.18,-hd+.22],'Test the bench calibrator','machine','Bench calibrator','Zero, span and reference checks share Tetsuo’s instrument bench.','Tetsuo');
  anchor([1.50,1.05,-hd+.18],'Tune workshop radio','radio','Workshop radio','Tetsuo has restored the tuner. Harbour weather and late-night music come through clearly.','Tetsuo');
  box('Star Port cabinet',[.60,1.48,.47],[-1.65,.74,hd-.29],0x4b414d,true);box('Star Port screen',[.46,.43,.028],[-1.65,1.09,hd-.545],0x344f57);
  const arcade=anchor([-1.65,1,hd-.57],'Play Star Port','arcade','Star Port');arcade.userData.npcInteraction=false;
  board('KENJI & TETSUO REPAIRS','PATTERNS · RADIOS · INSTRUMENTS',[0,2.35,-hd+.08],3.65);
 }else{
  bench('Tea counter',-1.35,-2.15,3.2,.65);
  for(let i=0;i<6;i++){const tin=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.25,12),colour(i%2?0x6b7955:0x9d8854));tin.position.set(-2.55+i*.4,1.01,-2.2);room.add(tin);}
  anchor([-1.3,1,-1.78],'Inspect tea counter','inspect','Tea counter','Roasted hojicha, sencha and a handwritten recipe for dorayaki.');
  for(const [x,z] of [[-1.75,.1],[1.55,-.5]]){bench('Tea table',x,z,1.05,.9);for(const dx of [-.84,.84]){const s=chair(x+dx,z,dx<0?-Math.PI/2:Math.PI/2);s.userData.seat={position:[x+dx,0,z],stand:[x+dx,0,z+.8],eyeY:1.12,yaw:dx<0?-Math.PI/2:Math.PI/2,pitch:0};reg(s,'Sit for tea',()=>action('seat','Tea house chair','A warm cup and a little time to linger.'),true);}for(const dx of [-.3,.3]){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.085,.065,.13,12),colour(0xd7dfc4));cup.position.set(x+dx,.965,z);room.add(cup);}}
  board('一服どうぞ','CORNER TEA HOUSE',[.2,2.25,-2.81],2.6);
 }
 return {...layout,compact:true};
}
