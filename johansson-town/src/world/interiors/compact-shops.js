import {FURNITURE_HEIGHTS} from '../furniture-standards.js';
import {addOwnedCharacter} from '../../people/owned-characters.js';
import {addBookshopDetail} from './bookshop-detail.js';
import {DOCK_WORKSHOP_ROOM} from '../dock-workshop-layout.js';
import {buildWorkshopMachine} from '../../workshop/machine.js';
import {buildMotorBench,MOTOR_BENCH,MOTOR_NOTE} from '../../workshop/motor-bench.js';
import * as THREE from '../../../vendor/three.module.js';
import {createMaterials} from '../../render/materials.js';
import {buildShopDoor} from '../shop-door.js';
import {BOOKSHOP_WORKSHOP_ROOM} from '../bookshop-workshop-layout.js';


// Each business owns its room layout and furniture.
// Furniture and approaches are authored together; there is no generic room shell.
export function buildCompactShop({site,room,reg,collider,action,exit}){
 let workshop=null;const owned=[];
 const layout=site.bookshop?BOOKSHOP_WORKSHOP_ROOM:site.industrialWorkshop?DOCK_WORKSHOP_ROOM:null;if(!layout)return null;
 const {width:w,depth:d,doorX}=layout,hw=w/2,hd=d/2;
 room.name=site.title+' interior';
 const surfaces=createMaterials(),wood=surfaces.material('timber',0x92734f),dark=surfaces.material('timber',0x574837),plaster=surfaces.material('plaster',0xd8cbb1),floor=surfaces.material(site.industrialWorkshop?'concrete':'timber',site.industrialWorkshop?0x92958c:0x9b8464);
 const palette=new Map();const colour=c=>{if(!palette.has(c))palette.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82}));return palette.get(c);};
 function box(name,size,pos,mat,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof mat==='number'?colour(mat):mat);m.name=name;m.position.set(...pos);m.receiveShadow=true;room.add(m);if(solid)collider(pos[0],pos[2],size[0]+.03,size[2]+.03,pos[1]+size[1]/2);return m;}
 function anchor(pos,label,kind,title,text,worker){const o=new THREE.Object3D();o.name=label;o.position.set(...pos);room.add(o);if(worker)o.userData.workers=[worker];reg(o,label,kind==='exit'?exit:()=>action(kind,title,text),true);return o;}
 function board(title,sub,pos,width=1.5){const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#e6d7b7';ctx.fillRect(0,0,512,160);ctx.fillStyle='#3d4942';ctx.textAlign='center';ctx.font='bold 36px serif';ctx.fillText(title,256,65,480);ctx.font='21px sans-serif';ctx.fillText(sub,256,120,480);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,.44),new THREE.MeshBasicMaterial({map:t}));m.position.set(...pos);room.add(m);}
 function bench(name,x,z,width,depth=.48,top=.9){box(name,[width,.10,depth],[x,top-.05,z],wood,true);for(const dx of [-width/2+.08,width/2-.08])box(name+' leg',[.07,top-.10,depth-.10],[x+dx,(top-.10)/2,z],dark);}
 function chair(x,z,yaw=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;room.add(g);const part=(size,pos)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),wood);m.position.set(...pos);g.add(m);};part([.43,.08,.43],[0,FURNITURE_HEIGHTS.seat-.04,0]);part([.43,.45,.06],[0,FURNITURE_HEIGHTS.seat+.22,.19]);for(const dx of [-.16,.16])for(const dz of [-.16,.16])part([.045,FURNITURE_HEIGHTS.seat-.08,.045],[dx,(FURNITURE_HEIGHTS.seat-.08)/2,dz]);collider(x,z,.48,.48,.96);return g;}
 box(site.industrialWorkshop?'Workshop concrete floor':'Fitted timber floor',[w+.16,.12,d+.16],[0,-.06,0],floor);
 box('Plaster rear wall',[w+.16,2.75,.12],[0,1.375,-hd-.06],plaster);
 for(const x of [-hw-.06,hw+.06])box('Side wall',[.12,2.75,d+.24],[x,1.375,0],plaster);
 for(const [a,b] of [[-hw,doorX-.52],[doorX+.52,hw]])if(b>a)box('Street wall',[b-a,2.75,.12],[(a+b)/2,1.375,hd+.06],plaster);
 box('Door lintel',[1.04,.22,.12],[doorX,2.64,hd+.06],dark);
 box('Timber ceiling',[w+.16,.12,d+.16],[0,2.81,0],plaster);
 for(const z of [-hd,hd])box('Wall skirting',[w,.14,.08],[0,.1,z],dark);
 for(const x of [-hw,hw])box('Wall skirting',[.08,.14,d],[x,.1,0],dark);
 const door=buildShopDoor(room,{name:site.id+'-inside-door',width:1.0});door.group.position.set(doorX,0,hd-.02);door.group.rotation.y=Math.PI;
 anchor(layout.exit,'Exit to '+(site.bookshop?'Main Street':'the street'),'exit');
 // A small illuminated shop window gives the front wall a clear street orientation.
 const windowX=doorX<0?Math.min(hw-.65,doorX+2):Math.max(-hw+.65,doorX-1.8);
 box('Window surround',[1.08,1.22,.06],[windowX,1.75,hd-.02],dark);
 const glass=new THREE.MeshStandardMaterial({color:0x73887e,emissive:0xc7ae76,emissiveIntensity:.2,roughness:.5});
 box('Street window',[.96,1.1,.025],[windowX,1.75,hd-.065],glass);
 for(const dx of [-.46,0,.46])box('Window joinery',[.04,1.1,.04],[windowX+dx,1.75,hd-.09],dark);
 const lamp=new THREE.MeshStandardMaterial({color:0xf3e4bd,emissive:0xffd69b,emissiveIntensity:.8});
 for(const x of [-w*.25,w*.25])box('Ceiling strip',[.14,.055,Math.min(1.1,d*.5)],[x,2.7,0],lamp);
 room.add(new THREE.HemisphereLight(0xffead0,0x777465,1.35));const light=new THREE.PointLight(0xffdba4,1.35,8,2);light.position.set(0,2.35,0);room.add(light);

 if(site.bookshop){
  addBookshopDetail({room,collider,reg,action});
  // The walls are books to the ceiling (bookshop-detail.js); the floor keeps the
  // entrance and central aisle open between the counter, the desks and the reading table.
  bench('Bookselling counter',-2.55,2.12,1.65,.55,FURNITURE_HEIGHTS.serviceCounter);
  box('Brass till',[.25,.19,.22],[-3.05,FURNITURE_HEIGHTS.serviceCounter+.095,2.12],0x53685d);
  anchor([-2.55,1,2.12],'Browse the bookshop ledger','read','Books & evening papers','Nhung keeps the reading copies and Reiko’s evening paper at the front counter.','Nhung');
  const newspaper=anchor([-1.85,1,2.12],'Buy newspaper · ¥80','buy','Evening newspaper',{cost:80,item:'Evening newspaper',text:'Reiko’s evening edition, collected at Nhung’s counter.'});newspaper.userData.npcInteraction=false;
  bench('Newspaper and book wrapping desk',-2.55,-2.84,2.45,.5,FURNITURE_HEIGHTS.table);
  box('Wrapping paper roll',[.65,.11,.22],[-2.7,FURNITURE_HEIGHTS.table+.055,-2.84],0xc8b493);
  box('Evening newspaper proofs',[.48,.025,.36],[-2.0,FURNITURE_HEIGHTS.table+.0125,-2.84],0xf1ead8);
  anchor([-1.65,1,-2.55],'Read the editor’s proofs','read','Editor’s desk','Corrections and harbour reports for the next edition.','Reiko');
  bench('New arrivals display',1.62,-2.84,4.0,.5,FURNITURE_HEIGHTS.table);
  for(let i=0;i<12;i++)box('New and second-hand books',[.22,.11,.32],[.1+(i%6)*.53,FURNITURE_HEIGHTS.table+.055+Math.floor(i/6)*.13,-2.84],[0x814c3e,0x4d6668,0xa49267][i%3]);
  const usedBook=anchor([-1.4,1,2.12],'Buy a second-hand paperback · ¥300','buy','Second-hand paperback',{cost:300,item:'Second-hand paperback',text:'Nhung wraps a well-loved paperback in brown paper.'});usedBook.userData.npcInteraction=false;
  bench('Reading table',2.15,.4,1.45,.8,FURNITURE_HEIGHTS.table);
  anchor([1.4,1,-2.45],'Ask about the new arrivals','read','Nhung’s book recommendations','A sea adventure, an island history, and a well-loved poetry collection. Nhung will help you find a book without hurrying you.','Nhung');
  anchor([2.15,1,.4],'Browse the local history books','read','Local history reading table','Reading copies stay in the shop. Please return each book to its marked place.');
  const seat=chair(-3.7,2.85,Math.PI/2);seat.userData.seat={position:[-3.7,0,2.85],stand:[-3.02,0,2.95],surfaceY:FURNITURE_HEIGHTS.seat,eyeY:1.12,yaw:Math.PI/2,pitch:0};seat.userData.npcInteraction=false;reg(seat,'Sit in the reading chair',()=>action('seat','Reading chair','A quiet chair beside the window. Read for a while, with the harbour outside.'),true);
  // The name board hangs from the ceiling over the aisle, facing the door: the back wall is books.
  board('FRONT-ROW BOOKS','BOOKS · NEWSPAPERS · LOCAL STORIES',[0,2.42,-1.4],2.6);
 }else if(site.industrialWorkshop){
  bench('Shared repair bench',0,-hd+.32,w-.3,.54);
  // The airport radio is mended at this bench (island/services.js), not on the doorstep.
  anchor([.9,1.15,-hd+.6],'Complete the airport radio service','island-repair');
  if(site.industrialWorkshop){bench('Pattern and calculation table',3.2,.3,.7,2.6);box('Electrical distribution board',[.55,.85,.13],[-hw+.09,1.8,-1],0x78847e);anchor([-hw+.3,1.3,-1],'Read the electrical safety checklist','read','Workshop safety checklist','Isolate the supply, check the meter and record the test before returning equipment to service.');}
  box('Tool board',[1.8,.38,.06],[-1.02,2.05,-hd+.08],dark);
  for(let i=0;i<5;i++){box('Hanging hand tool',[.04,.31,.07],[-1.65+i*.29,2.02,-hd+.13],0x8b9994);box('Tool grip',[.07,.11,.07],[-1.65+i*.29,2.14,-hd+.13],0x7b4e38);}
  workshop=buildWorkshopMachine({room,x:-1.24,z:-hd+.32});
  if(site.industrialWorkshop){
   const jonsson=addOwnedCharacter({parent:room,kind:'Jonsson',position:[-2.7,0,.25],yaw:.35});owned.push(jonsson);
   collider(-2.7,.25,1.45,1.35,1.35);
   anchor([-2.7,1,.95],'Talk to Jonsson','read','Jonsson · engine repairs','Jonsson can recognise a harbour engine by its idle. He rebuilds small boat motors here, keeps every useful washer, and tests a repair twice before calling the owner. “A patient hand and a clean bench. That is most of the job.”');
  }
  box('Oscilloscope',[.58,.36,.35],[.45,1.08,-hd+.24],0x596c63);box('Oscilloscope screen',[.32,.22,.025],[.34,1.10,-hd+.045],0x324f45);box('Signal trace',[.25,.012,.018],[.34,1.10,-hd+.025],0xb3c491);
  for(const x of [.66,.77])box('Instrument control',[.035,.035,.03],[x,1.13,-hd+.04],0xd2c9ab);
  box('Repair radio',[.36,.25,.26],[1.50,1,-hd+.25],0x6f503d);
  for(let i=0;i<5;i++)box('Radio grille',[.016,.16,.025],[1.36+i*.045,1,-hd+.1],0xd0b992);
  anchor([-1.24,1.25,-hd+.58],'Use Form 3D printer','workshop','Form 3D printer',null,'Chin');
  anchor([.55,1.18,-hd+.22],'Test the bench calibrator','machine','Bench calibrator','Zero, span and reference checks share Tetsuo’s instrument bench.','Tetsuo');
  anchor([1.50,1.05,-hd+.18],'Tune workshop radio','radio','Workshop radio','Tetsuo has restored the tuner. Harbour weather and late-night music come through clearly.','Tetsuo');
  // The site's IEC 90L pump motor (/motor-90l/) on Tetsuo's test bench, rating plate to the door.
  buildMotorBench({room,collider});
  anchor([MOTOR_BENCH.x,1.05,MOTOR_BENCH.z+.18],'Look at the pump motor','motor-bench','Pump motor on the test bench',MOTOR_NOTE,'Tetsuo');
  box('Star Port cabinet',[.60,1.48,.47],[-1.65,.74,hd-.29],0x4b414d,true);box('Star Port screen',[.46,.43,.028],[-1.65,1.09,hd-.545],0x344f57);
  const arcade=anchor([-1.65,1,hd-.57],'Play Star Port','arcade','Star Port');arcade.userData.npcInteraction=false;
  board('KENJI & TETSUO REPAIRS','FORM 3D · STEPWISE · REPAIRS',[0,2.52,-hd+.08],3.65);
 }
 return {...layout,compact:true,workshop,owned,ownedUpdate:dt=>owned.forEach(actor=>actor.update(dt)),dispose:()=>owned.forEach(actor=>actor.dispose())};
}
