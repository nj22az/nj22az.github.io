import * as THREE from '../../../vendor/three.module.js';

export const SAKURA_OFFICE=Object.freeze({width:12.8,depth:11,floor:4.01,front:4.55,harbourX:6.4,
 desk:[4.8,0,3.2],deskStand:[3.85,0,3.2],townWindow:[0,0,3.6],harbourWindow:[5.9,0,4.05]});
/** Clear glazing uses the existing street renderer: both outlooks show the live town, with no backdrop texture. */
export function buildSakuraOfficeRoom({room,reg,action,collider=()=>{},exit}){
 const O=SAKURA_OFFICE,hw=O.width/2,back=-O.depth/2,front=O.front,H=2.8,mats=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.83}));return mats.get(c);};
 const box=(size,pos,c,name,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));m.position.set(...pos);m.name=name||'';room.add(m);if(solid)collider(pos[0],pos[2],size[0],size[2],pos[1]+size[1]/2);return m;};
 const anchor=(at,label,fn)=>{const a=new THREE.Object3D();a.position.set(...at);a.userData.npcInteraction=false;room.add(a);reg(a,label,fn,true);return a;};
 box([O.width,.12,front-back],[0,-.06,(front+back)/2],0x947354,'Office timber floor');
 for(const x of [-3.5,3.5])box([5.8,H,.12],[x,H/2,back],0xece1ca,'Office rear wall');
 box([1.2,.7,.12],[0,2.45,back],0xece1ca,'Rear door lintel');
 box([.12,H,front-back],[-hw,H/2,(front+back)/2],0xece1ca,'Office north wall');
 box([O.width,.12,front-back],[0,H+.06,(front+back)/2],0xf1eadb,'Office ceiling');
 // Town-facing east window across the front. Harbour-facing south window beside the desk.
 for(const [size,pos,name] of [[[O.width,.9,.12],[0,.45,front],'Town window sill wall'],[[O.width,.45,.12],[0,2.575,front],'Town window head'],[[.12,.9,5.7],[hw,.45,1.5],'Harbour window sill wall'],[[.12,.45,5.7],[hw,2.575,1.5],'Harbour window head']])box(size,pos,0xece1ca,name);
 for(const x of [-hw,-3.2,0,3.2,hw])box([.055,1.45,.11],[x,1.625,front],0x8f9894,'Town window mullion');
 for(const z of [-1.35,1.5,front])box([.11,1.45,.055],[hw,1.625,z],0x8f9894,'Harbour window mullion');
 // Restrained raised blinds leave the sightlines open at seated eye height.
 box([O.width,.12,.14],[0,2.3,front-.08],0xc2b69a,'Town blind');box([.14,.12,5.7],[hw-.08,2.3,1.5],0xc2b69a,'Harbour blind');
 box([.12,H,4.15],[hw,H/2,back+2.075],0xece1ca,'Office south rear wall');
 box([1.4,.08,.8],[5.05,.74,3.2],0x775638,'Main accounts desk',true);
 box([.55,.44,.55],[4.1,.22,3.2],0x58665a,'Desk chair');
 const chair=anchor([4.1,1,3.2],'Sit at the harbour desk',()=>action('seat','Sakura main office','The harbour and Minato Maru lie beyond the south window.'));
 chair.userData.seat={position:[4.1,0,3.2],stand:[3.4,0,3.2],surfaceY:.44,eyeY:1.12,yaw:-2.63,pitch:0};
 box([.25,.09,.2],[5.05,.825,3.38],0x2d3834,'1997 desk telephone');
 box([.35,.04,.27],[5.05,.8,3.02],0xd7ceb4,'Supplier ledger');
 anchor([3.45,1,2.2],'Read Sakura’s supplier ledger',()=>action('read','Sakura main office','Orders, deliveries and the monthly accounts. The downstairs office keeps the till float and daily shop paperwork.'));
 box([.38,1.45,2.5],[-hw+.28,.725,back+1.4],0x775638,'Timber ledger shelves',true);
 for(let i=0;i<8;i++)box([.12,.28,.24],[-hw+.35,.95,back+.5+i*.25],[0x5d7164,0xb29a73,0x88564b][i%3],'Account book');
 box([1.4,.4,.6],[-2,.2,1.1],0x7e8b72,'Visitor bench',true);
 box([.85,.07,.65],[-2,.48,2.2],0x775638,'Visitor tea table',true);
 // Kitchenette at the rear, never across either window: sink, kettle, cupboards and a small fridge.
 box([2.4,.88,.6],[-2.7,.44,back+.38],0xd3c8ae,'Kitchenette cupboards',true);
 box([2.45,.04,.64],[-2.7,.9,back+.38],0xb2bab5,'Kitchenette worktop');
 box([.6,.025,.4],[-3.25,.93,back+.38],0x737f7c,'Kitchenette sink');
 box([.04,.25,.04],[-3.25,1.04,back+.13],0xb4beb8,'Kitchenette tap');
 box([.23,.28,.23],[-2,1.06,back+.38],0xd5d6cb,'Electric kettle');
 box([.62,1.15,.62],[-4.35,.575,back+.4],0xe1dfd0,'Office fridge',true);
 anchor([-2,1,back+1.05],'Make office tea',()=>action('read','Sakura kitchenette','Fill the kettle at the sink. Cups, tea and the staff lunch boxes stay in the cupboards and small fridge.'));
 anchor([0,1.2,3.55],'Look over the town',()=>action('inspect','Town outlook','Main Street and the town are visible through the east glazing.'));
 anchor([5.9,1.2,4.05],'Look over the harbour',()=>action('inspect','Harbour outlook','The south window looks towards the port, with no tall storage across the view.'));
 anchor([0,1.1,back+.35],'Return to Sakura’s outside stair',exit);
 room.add(new THREE.HemisphereLight(0xffefd7,0x7e8071,1.2));
 return {bounds:{minX:-hw+.1,maxX:hw-.1,minZ:back+.1,maxZ:front-.1},spawn:[0,0,back+.8],exit:[0,1.1,back+.35],office:true};
}
