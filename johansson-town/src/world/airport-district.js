import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_PLAZA as P,AIRPORT_SHOPS,AIRPORT_GATES} from './airport-district-plan.js';
import {airportWorld,AIRPORT_HEIGHT,AIRPORT_PUBLIC_FLOORS} from './airport-ground.js';
import {TROPIC_PLACES,tropicHeight,tropicalPlantings} from './tropical-island.js';
import {SEA_LEVEL} from './ocean.js';

/**
 * The airport's public side and the island's stopping places, in Kitano-jima's frame.
 *
 * A small airport, as an island this size has: travellers step off the ferry onto the quay,
 * walk past check-in into a paved plaza with three kiosks (coffee for the early flight,
 * noodles for the wait, island crafts to take home) and sit in a thatched lounge that looks
 * straight down the runway. From the plaza a sand trail leads to Coral Bay and up through
 * the jungle to the Hinata lookout, then down to Turtle Cove. Every seat, sign and kiosk
 * here has someone it is for; the readable notes say who.
 */
const KIOSK_COLOURS=[0x5fb7b0,0xf08a6c,0xf2c84b];
export function buildAirportDistrict({world,register,onAction}){
 const root=world.airportIsland.group,materials=new Map(),yaw=root.rotation.y;
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.86}));return materials.get(c);};
 const ground=(u,v)=>Math.max(1.1,tropicHeight(u,v));
 const box=(name,size,p,c,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material(c));m.name=name;m.position.set(...p);root.add(m);if(solid){const [x,z]=airportWorld(p[0],p[2]);world.colliders.push({id:name,x,z,yaw,w:size[0],d:size[2],minY:SEA_LEVEL+p[1]-size[1]/2-.2,height:size[1]+.2});}return m;};
 const sign=(text,x,z,width=8,y=4,color=0x2f6f7a,turn=0)=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle='#'+color.toString(16).padStart(6,'0');c.fillRect(0,0,1024,160);c.fillStyle='#fff6e0';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText(text,512,98,995);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,1.2),new THREE.MeshBasicMaterial({map:t}));m.name=text+' sign';m.position.set(x,y,z);m.rotation.y=turn;root.add(m);
  // Read the right way round from behind as well: a second face, not the mirror of the first.
  const back=new THREE.Mesh(m.geometry,m.material);back.name=text+' sign back';back.rotation.y=Math.PI;back.position.z=-.01;m.add(back);return m;};
 const anchor=(x,z,label,kind,title,text,y=ground(x,z)+1)=>{const p=airportWorld(x,z),a=new THREE.Object3D();a.position.set(p[0],SEA_LEVEL+y,p[1]);world.group.add(a);register(a,label,()=>onAction(kind,title,text));return a;};
 /** A bench and its seat. `facing` 1 looks toward -v (the runway), -1 toward +v (the sea). */
 const bench=(id,x,z,facing,title,text,floor=ground(x,z))=>{
  box('Island bench seat',[2.2,.12,.6],[x,floor+.46,z],0x9a6b45);box('Island bench back',[2.2,.5,.1],[x,floor+.75,z+.3*facing],0x9a6b45);
  for(const dx of [-.9,.9])box('Island bench leg',[.12,.42,.5],[x+dx,floor+.2,z],0x6a4a32);
  const p=airportWorld(x,z),s=airportWorld(x,z+1.1*facing),seat=anchor(x,z+1.1*facing,'Sit on the bench','seat',title,text,floor+1);
  const surfaceY=SEA_LEVEL+floor+.52;
  seat.userData.seat={id,position:[p[0],SEA_LEVEL+floor,p[1]],stand:[s[0],SEA_LEVEL+floor,s[1]],surfaceY,eyeY:surfaceY+.72,yaw:yaw+(facing>0?0:Math.PI),pitch:0};
  world.colliders.push({id:'Island bench',x:p[0],z:p[1],yaw,w:2.2,d:.6,minY:SEA_LEVEL+floor,height:.55});
 };
 // The plaza: one paved floor from check-in to the kiosks, at the height its walk record gives.
 const plazaY=AIRPORT_PUBLIC_FLOORS[0].y-SEA_LEVEL;
 box('Airport terminal plaza',[P.maxX-P.minX,.12,P.maxZ-P.minZ],[(P.minX+P.maxX)/2,plazaY-.06,(P.minZ+P.maxZ)/2],0xe7dcc2);
 // Three kiosks along the plaza's south edge, their counters open to the passing travellers.
 AIRPORT_SHOPS.forEach((shop,i)=>{
  const c=KIOSK_COLOURS[i];
  box(shop.title+' kiosk',[6,2.8,2.8],[shop.x,plazaY+1.4,shop.z+.4],c,true);
  box(shop.title+' counter',[5.2,.9,.5],[shop.x,plazaY+.45,shop.z-1.3],0xf4ecd8);
  box(shop.title+' roof',[6.8,.25,4],[shop.x,plazaY+3,shop.z-.1],0xb5533c);
  sign(shop.title,shop.x,shop.z-1.25,5.4,plazaY+2.25,0x2f6f7a,Math.PI);
  anchor(shop.x,shop.z-3.6,'Visit '+shop.title,'airport-shop',shop.title,shop,plazaY+1);
 });
 // The departure lounge: a thatched shelter on the plaza's east end, facing the runway.
 const [lx,lz]=TROPIC_PLACES.lounge;
 for(const [dx,dz] of [[-4,-3],[4,-3],[-4,3],[4,3]])box('Lounge post',[.25,3.2,.25],[lx+dx,plazaY+1.6,lz+dz],0x7a5a3c,true);
 const thatch=new THREE.Mesh(new THREE.ConeGeometry(6.6,2.4,4,1),material(0xc9a868));thatch.name='Departure lounge thatch';thatch.rotation.y=Math.PI/4;thatch.scale.set(1.25,1,1);thatch.position.set(lx,plazaY+4.3,lz);root.add(thatch);
 for(let i=0;i<4;i++)bench('airport-gate-a'+i,lx+(i%2?2.3:-2.3),lz+(i<2?-1.2:1.6),1,'Departure lounge','You sit in the shade of the thatch and watch the windsock over the runway. The commuter to Naha boards from Gate 1.',plazaY);
 AIRPORT_GATES.forEach((gate,i)=>{const x=lx+(i?2.6:-2.6);sign(gate.title,x,lz-3.4,4.2,plazaY+2.7,0x2f6f7a);anchor(x,lz-1.4,'Read gate '+gate.id,'read','Gate '+gate.id,gate.id===1?'Naha commuter flights board here. Buy your ticket and check in at the counter before departure.':'Gate 2 opens for the extra summer flight. Otherwise the commuter boards at Gate 1.',plazaY+1);});
 sign('KITANO-JIMA AIRPORT',(P.minX+P.maxX)/2-6,P.minZ+.3,14,plazaY+3.2,0x2f6f7a,Math.PI);
 box('Airport sign posts',[.2,3.2,.2],[(P.minX+P.maxX)/2-12.6,plazaY+1.6,P.minZ+.3],0x7a5a3c);box('Airport sign posts',[.2,3.2,.2],[(P.minX+P.maxX)/2+.6,plazaY+1.6,P.minZ+.3],0x7a5a3c);
 // The trail head: a timber gateway over the path, its board read from the plaza.
 {const gy=ground(-4.5,P.maxZ+1.2);sign('CORAL BAY ↓  ·  HINATA LOOKOUT ↗',-4.5,P.maxZ+1.2,6.4,gy+2.9,0x6a5a3a,Math.PI);for(const dx of [-3.4,3.4])box('Trail gateway post',[.22,3.6,.22],[-4.5+dx,gy+1.8,P.maxZ+1.2],0x7a5a3c,true);box('Trail gateway beam',[7.2,.22,.26],[-4.5,gy+3.62,P.maxZ+1.2],0x7a5a3c);}
 anchor(-4.5,P.maxZ-.6,'Read the island trail map','read','Kitano-jima trails','A sand trail leaves the plaza for Coral Bay, five minutes down through the palms. At the fork it climbs through the jungle to the Hinata lookout, where you can see the whole strait and Minato on the far shore, and comes down to Turtle Cove on the east side. Keep to the trail on the hill; the airport side of the fence is closed.',plazaY+1);
 // The airport fence, all the way across the island, so the runway is never somewhere you walk.
 const F=TROPIC_PLACES.fence;let east=38;while(east<118&&tropicHeight(east+1,F)>.3)east++;
 for(let u=-52;u<=east;u+=4){const y=ground(u,F);box('Airport perimeter post',[.09,1.3,.09],[u,y+.65,F],0x81918a);if(u+4<=east){const y2=ground(u+4,F),rail=box('Airport perimeter rail',[4.05,.07,.08],[u+2,(y+y2)/2+1,F],0x81918a);rail.rotation.z=Math.atan2(y2-y,4);}}
 // The Hinata lookout: a timber deck on the hilltop, one bench looking out to sea.
 const [ox,oz]=TROPIC_PLACES.lookout,look=AIRPORT_PUBLIC_FLOORS.find(f=>f.id==='kitano-lookout'),deckY=look.y-SEA_LEVEL;
 box('Hinata lookout deck',[look.maxX-look.minX,1.2,look.maxZ-look.minZ],[ox,deckY-.6,oz],0x9c7650);
 for(const [dx,dz,w,d] of [[0,2.85,6,.1],[-2.95,0,.1,6],[2.95,0,.1,6]])box('Lookout rail',[w,.08,d],[ox+dx,deckY+1,oz+dz],0x7a5a3c);
 for(const [dx,dz] of [[-2.9,2.8],[2.9,2.8],[-2.9,-2.8],[2.9,-2.8]])box('Lookout rail post',[.12,1,.12],[ox+dx,deckY+.5,oz+dz],0x7a5a3c,true);
 bench('kitano-lookout',ox,oz+1,-1,'Hinata lookout','The jungle drops away below you. Beyond the palms of Coral Bay the strait is every shade of blue, and across it Minato lies along its quay.',deckY);
 anchor(ox,oz-1.5,'Look out from Hinata','read','Hinata lookout','From up here you can count the town: the harbour office, the red roofs of the shopping street and the green dome of Mount Aoba behind them. A frigatebird hangs over the runway. The ferry is a white dot halfway across.',deckY+1);
 // Coral Bay: two benches on the sand for people waiting for the evening flight.
 const [bx,bz]=TROPIC_PLACES.coralBay;
 bench('kitano-coral-bay-0',bx-2,bz,-1,'Coral Bay','Warm sand, palm shade and water so clear you can see the ripples on the bottom. Plenty of people come over on the morning ferry just for this.');
 bench('kitano-coral-bay-1',bx+2.6,bz+.4,-1,'Coral Bay','Warm sand, palm shade and water so clear you can see the ripples on the bottom. Plenty of people come over on the morning ferry just for this.');
 anchor(bx,bz-1.8,'Read the Coral Bay notice','read','Coral Bay','Swimming between the palms only. The reef beyond the turquoise is for looking at, not standing on. Last ferry to Minato leaves after the evening flight.');
 const [tx,tz]=TROPIC_PLACES.turtleCove;
 bench('kitano-turtle-cove',tx-3,tz+1.5,-1,'Turtle Cove','You sit still and wait. After a while a dark shape surfaces in the green water, breathes, and slips under again.');
 anchor(tx,tz,'Look into Turtle Cove','read','Turtle Cove','A sheltered inlet under the hill. Green turtles come in on the rising tide to graze; the fishermen from Minato leave this cove alone for them.');
 // Tree trunks are solid where people walk.
 const {palms,trees}=tropicalPlantings();
 for(const [list,w,h] of [[palms,.5,4],[trees,.7,4.5]])for(const t of list){const [x,z]=airportWorld(t.u,t.v);world.colliders.push({id:'Island tree trunk',x,z,yaw:0,w:w*t.scale,d:w*t.scale,minY:SEA_LEVEL+t.y-.2,height:h});}
}
