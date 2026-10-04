import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_DISTRICT as D,AIRPORT_TERMINALS,AIRPORT_SHOPS} from './airport-district-plan.js';
import {airportWorld,AIRPORT_HEIGHT} from './airport-ground.js';
import {GROUND_LAYER} from './ground-layers.js';
/** Original open-air terminal architecture: roofed edges leave the concourses visible and walkable. */
export function buildAirportDistrict({world,register,onAction}){
 const root=world.airportIsland.group,materials=new Map();
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.86}));return materials.get(c);};
 const box=(name,size,p,c,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material(c));m.name=name;m.position.set(...p);root.add(m);if(solid){const [x,z]=airportWorld(p[0],p[2]),yaw=root.rotation.y;world.colliders.push({id:name,x,z,yaw,w:size[0],d:size[2],height:p[1]+size[1]/2-.56});}return m;};
 const sign=(text,x,z,width=8,y=4,color=0x35596c,yaw=0)=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle='#'+color.toString(16).padStart(6,'0');c.fillRect(0,0,1024,160);c.fillStyle='#fff3d6';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText(text,512,98,995);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,1.2),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.name=text+' sign';m.position.set(x,y,z);m.rotation.y=yaw;root.add(m);};
 const anchor=(x,z,label,kind,title,text)=>{const p=airportWorld(x,z),a=new THREE.Object3D();a.position.set(p[0],AIRPORT_HEIGHT+1,p[1]);world.group.add(a);register(a,label,()=>onAction(kind,title,text));};
 box('Airport city reclaimed foundation',[D.maxX-D.minX,1.4,D.maxZ-D.minZ],[(D.minX+D.maxX)/2,.4,(D.minZ+D.maxZ)/2],0x77966b);
 // The boulevard, promenade and concourses overlap at their entrances. Give each
 // surface a full ground-layer clearance so distant airport paving cannot flicker.
 const pavingStep=GROUND_LAYER.grass;
 box('Terminal district promenade',[218,.06,10],[61,1.13+pavingStep,64],0xbfbba8);
 box('Terminal transfer boulevard',[8,.06,100],[0,1.13,78],0xbfbba8);
 box('Airport ferry arrival plaza',[38,.06,18],[-33,1.13+pavingStep,30],0xcac4ae);
 // Two functioning concourses, with separate gate wings and luggage benches.
 for(const t of AIRPORT_TERMINALS.filter(t=>!t.construction)){
  box(t.title+' floor',[60,.06,22],[t.x,1.13+pavingStep*2,t.z],0xd4d0ba);
  box(t.title+' back wall',[60,6,.6],[t.x,4.1,t.z-11],0xe6dfc8,true);
  box(t.title+' canopy',[60,.5,5],[t.x,7.35,t.z+9],0x456d83);
  for(const dx of [-27,27])box('Terminal canopy pillar',[.6,6,.6],[t.x+dx,4.1,t.z+9],0xc3c5b4,true);
  sign(t.title,t.x,t.z+11,22,6.1);
  for(let i=0;i<4;i++){const x=t.x-22+i*14;sign('GATE '+t.id.toUpperCase()+(i+1),x,t.z-10.55,6,4);anchor(x,t.z-8,'Read gate '+t.id.toUpperCase()+(i+1),'read','Gate '+t.id.toUpperCase()+(i+1),t.id==='a'&&i===0?'Naha commuter flights board through the original check-in counter. Buy your ticket and check in before departure.':'This gate is reserved for future routes. The airport expansion is being built in stages; no flight boards here yet.');box('Gate waiting bench',[5,.5,.8],[x,1.4,t.z-5],0x7d8b88,true);}
 }
 // Customers approach these storefronts from local -z. The textured front
 // needs to face the same pavement as its interaction anchor.
 for(const shop of AIRPORT_SHOPS){box(shop.title+' shop',[16,4.5,9],[shop.x,3.35,shop.z],0xdacfb1,true);box(shop.title+' tiled awning',[17,.35,2.7],[shop.x,5.7,shop.z-4.5],0x658d80);sign(shop.title,shop.x,shop.z-4.57,12,4.4,0x35596c,Math.PI);anchor(shop.x,shop.z-6.6,'Visit '+shop.title,'airport-shop',shop.title,shop);}
 sign('KITANO-JIMA AIRPORT · UNDER CONSTRUCTION',-31,24,30,5,0x91613b);
 anchor(-30,26,'Read the airport construction notice','read','Airport under construction','The airport is growing into its own district. Terminals A and B and the shopping promenade are open to pedestrians. Terminal C, the hotel plot and additional gates are behind barriers. Commuter flights still use the original check-in counter. Keep out of fenced works. Construction decisions and completed town projects are filed at the Community Hall.');
 // Clearly closed future terminal: collision and walking ground both exclude the works.
 box('Future Terminal C frame',[55,9,27],[135,5.6,106],0x89928e);
 sign('TERMINAL C · CONSTRUCTION SITE',135,86,29,4,0x91613b);
 for(const z of [87,127])for(let x=105;x<=173;x+=4)box('Construction barrier',[3.6,1.2,.4],[x,1.7,z],Math.floor(x/4)%2?0xf0b64f:0x595b58);
 for(const x of [104,174])box('Construction side fence',[.25,2,40],[x,2.1,107],0x768077);
 box('Construction crane mast',[1,24,1],[164,13.1,111],0xcc9b45);box('Construction crane arm',[42,.65,.65],[149,25,111],0xcc9b45);
 sign('AIRPORT HOTEL · FUTURE PHASE',48,108,24,3.5,0x91613b);
 anchor(48,111,'Read the airport district masterplan','read','Kitano-jima airport district','An island airport with a ferry plaza, two open terminal concourses, eight local shops, gate wings and a reserved third terminal. Future phases include an airport hotel, more passenger routes and cargo handling. The 1997 island commuter service continues while the larger airport is being built.');
 for(const [x,z] of [[-43,98],[-10,121],[26,96],[82,110],[158,31],[166,69]]){box('Airport garden planter',[4,.6,4],[x,1.4,z],0xb5ae94,true);const tree=new THREE.Mesh(new THREE.IcosahedronGeometry(3,1),material(0x49754a));tree.position.set(x,5.1,z);root.add(tree);}
}
