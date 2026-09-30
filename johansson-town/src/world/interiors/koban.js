import * as THREE from '../../../vendor/three.module.js';
import {sleepHours} from '../../people/home-life.js';

/**
 * Inside the police box (koban-layout.js). The door is on the room's -z wall, so you
 * walk in facing the officer's desk and, behind it, the partition to the tatami room
 * where Officer Mori sleeps through the morning after the night patrol. You may walk
 * in at any hour; he only asks not to be woken.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
export const KOBAN_ROOM=Object.freeze({
 bounds:Object.freeze({minX:-3.3,maxX:3.3,minZ:-3.0,maxZ:3.0}),
 spawn:Object.freeze([.9,0,-2.45]),exit:Object.freeze([.9,1.1,-3.0]),yaw:Math.PI,
 staff:Object.freeze({'Officer Mori':Object.freeze([-1.4,0,.25])}),
});
/** Where Officer Mori walks, eats and sleeps when he is at home (home-residents.js). */
export const KOBAN_HOME_LAYOUT=Object.freeze({...KOBAN_ROOM,hatHook:{position:[.45,1.6,3.04],yaw:Math.PI},
 door:[.9,0,-2.3],table:[1.2,0,2.42],bedside:[-1.15,0,1.95],bed:[-2.3,.31,2.88],
 cover:{position:[-2.3,.37,2.28],width:1.1,length:1.3,axis:'z'}});

const time=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

function canvasTexture(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildKobanInterior({room,reg,collider,action,exit}){
 const group=new THREE.Group();group.name='Minato Police Box interior';room.add(group);
 const palette=new Map(),mat=c=>{if(!palette.has(c))palette.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.85}));return palette.get(c);};
 const box=(name,size,pos,c,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof c==='number'?mat(c):c);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;group.add(m);if(solid)collider(pos[0],pos[2],size[0],size[2],pos[1]+size[1]/2);return m;};
 const cyl=(name,r,h,pos,c,seg=12)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat(c));m.name=name;m.position.set(...pos);group.add(m);return m;};
 const panel=(name,w,h,pos,yaw,draw,px=512)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:canvasTexture(px,Math.round(px*h/w),draw),roughness:.9}));m.name=name;m.position.set(...pos);m.rotation.y=yaw;group.add(m);return m;};
 const spot=(pos,label,kind,title,text)=>{const o=new THREE.Object3D();o.name=label;o.position.set(...pos);group.add(o);reg(o,label,()=>action(kind,title,text),true);return o;};

 // Shell: speckled office vinyl at the front, tatami behind the partition.
 box('Police box office floor',[6.8,.1,3.9],[0,-.05,-1.15],0xb7b9ad);
 box('Tatami room floor',[6.8,.1,2.4],[0,-.02,1.95],0xcbc38c);
 for(const x of [-1.7,0,1.7])box('Tatami border',[.05,.012,2.3],[x,.035,1.95],0x3f4a3a);
 box('Tatami border',[6.7,.012,.05],[0,.035,1.95],0x3f4a3a);
 const wall=0xf1ede2,wainscot=0x9fb3c4;
 for(const x of [-3.4,3.4]){box('Police box wall',[.1,2.9,6.2],[x,1.45,0],wall,true);box('Wainscot',[.04,.9,6.2],[x*.985,.45,0],wainscot);}
 box('Police box back wall',[6.8,2.9,.1],[0,1.45,3.1],wall,true);
 box('Police box front wall',[3.75,2.9,.1],[-1.525,1.45,-3.1],wall,true);
 box('Front wall beside the door',[1.95,2.9,.1],[2.425,1.45,-3.1],wall,true);
 box('Door lintel',[1.1,.7,.1],[.9,2.55,-3.1],wall);
 box('Glass door',[1.1,2.2,.04],[.9,1.1,-3.12],new THREE.MeshStandardMaterial({color:0x9fc4d6,roughness:.15,transparent:true,opacity:.45}));
 // The partition to the tatami room, with a doorway at the east end under a noren.
 box('Partition',[5.0,2.9,.1],[-.9,1.45,.8],wall,true);
 box('Partition',[.5,2.9,.1],[3.15,1.45,.8],wall,true);
 box('Partition lintel',[1.3,.7,.1],[2.25,2.55,.8],wall);
 panel('Noren',1.2,.62,[2.25,1.88,.74],Math.PI,(x,w,h)=>{x.fillStyle='#27304d';x.fillRect(0,0,w,h);x.fillStyle='#f4f1ea';x.fillRect(w/2-3,h*.35,6,h*.65);x.font=`bold ${h*.36}px ${MARU}`;x.textAlign='center';x.textBaseline='middle';x.fillText('森',w*.25,h*.42);x.fillText('家',w*.75,h*.42);},256);

 // The front office: desk facing the door, the visitor's stool, the town map.
 box('Officer desk top',[1.5,.06,.75],[-1.4,.75,-.6],0x8a6a4a);
 box('Officer desk pedestal',[.45,.72,.7],[-.85,.36,-.6],0x6f7a72,true);
 box('Officer desk modesty panel',[1.45,.5,.04],[-1.4,.47,-.96],0x6f7a72);
 collider(-1.4,-.6,1.5,.75,.78);
 box('Desk blotter',[.6,.01,.42],[-1.45,.785,-.6],0x3f5a44);
 box('Incident log',[.3,.03,.22],[-1.4,.8,-.62],0xe8e1c7);
 box('Telephone body',[.22,.1,.2],[-2.0,.83,-.55],0x1c1c20);box('Telephone handset',[.24,.05,.07],[-2.0,.9,-.55],0x1c1c20);
 cyl('Desk lamp stem',.015,.35,[-.9,.95,-.8],0x2f4f3a,6);box('Desk lamp shade',[.2,.1,.14],[-.9,1.12,-.72],0x2f4f3a);
 box('Pen pot',[.07,.1,.07],[-1.95,.83,-.8],0x3a4a6a);
 box('Officer chair seat',[.46,.06,.44],[-1.4,.45,.28],0x2f3a4a);box('Officer chair back',[.44,.45,.05],[-1.4,.72,.5],0x2f3a4a);
 cyl('Officer chair post',.03,.42,[-1.4,.22,.28],0x555a60,6);
 box('Visitor stool',[.38,.44,.38],[-1.4,.22,-1.55],0x8a6a4a,true);
 const stool=spot([-1.4,.7,-1.55],'Sit on the visitor’s stool','seat','Visitor’s stool','A plain wooden stool facing the desk. The officer keeps a tin of boiled sweets for lost children.');
 stool.userData.npcInteraction=false;stool.userData.seat={position:[-1.4,0,-1.55],stand:[-.6,0,-1.8],eyeY:1.2,yaw:Math.PI,pitch:0};
 const hours=sleepHours({name:'Officer Mori'});
 spot([-1.4,1.0,-.6],'Read the incident log','read','Minato Police Box · incident log',
  '13 Sep, 22:40 — Harbour round. Nothing to report.\n14 Sep, 01:15 — A cat in a fish crate at the quay. Cat declined to give a statement.\n14 Sep, 03:30 — Main Street quiet. Lamp outside Sakura flickering; noted for the electrician.\n14 Sep, 05:50 — End of patrol. Nothing to report.\n\n— Mori');
 spot([-2.0,1.0,-.55],'Inspect the telephone','inspect','Police box telephone','A black desk telephone with the numbers of the harbour office, the clinic over the tunnel and the station at Nago taped to the base. After hours it rings through to the room at the back.');
 panel('Town map',1.5,1.05,[-3.34,1.6,-1.3],Math.PI/2,(x,w,h)=>{
  x.fillStyle='#e9e2c8';x.fillRect(0,0,w,h);x.fillStyle='#8cc6e0';x.fillRect(0,0,w,h*.12);x.fillRect(0,0,w*.06,h);
  x.fillStyle='#cfc6a6';x.fillRect(w*.4,h*.1,w*.1,h*.9);x.fillStyle='#9fcf7c';x.fillRect(w*.56,h*.2,w*.34,h*.55);
  x.fillStyle='#3b3f55';x.font=`bold ${h*.06}px ${MARU}`;x.textAlign='left';
  x.fillText('港 HARBOUR',w*.54,h*.09);x.fillText('さくら',w*.22,h*.42);x.fillText('公園 PARK',w*.62,h*.45);x.fillText('バス BUS',w*.3,h*.95);
  x.fillStyle='#d7263d';x.beginPath();x.arc(w*.55,h*.84,h*.035,0,Math.PI*2);x.fill();x.fillStyle='#3b3f55';x.fillText('← 駐在所',w*.58,h*.86);
  x.strokeStyle='#6b4a1c';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8);});
 spot([-3.1,1.4,-1.3],'Read the town map','read','Town map','Minato on one sheet: the harbour at the top, Sakura and the shops down the west side, the park and the school on the green side, and a red dot here at the bus plaza. Pins mark the night patrol: up Main Street to the quay and back.');
 // Notices by the door, a lost-property shelf on the east wall.
 box('Notice board',[1.6,1.0,.03],[-1.9,1.55,-3.03],0xb98a55);
 const posters=[['指名手配','WANTED','Tama (cat)\nfor sleeping in fish crates','#f4e4c8'],['落とし物','LOST','One glove, left hand\nAsk at the desk','#e8f0f4'],['交通安全','SAFETY WEEK','Bicycles: lights on\nafter dark','#fff1c1']];
 posters.forEach(([jp,en,body,bg],i)=>panel('Poster '+en,.44,.6,[-2.4+i*.5,1.55,-3.01],0,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=i?'#27304d':'#d7263d';x.font=`bold ${w*.16}px ${MARU}`;x.textAlign='center';x.fillText(jp,w/2,h*.18);x.font=`bold ${w*.1}px ${MARU}`;x.fillText(en,w/2,h*.3);x.fillStyle='#3b3f55';x.font=`${w*.075}px ${MARU}`;body.split('\n').forEach((l,j)=>x.fillText(l,w/2,h*.72+j*w*.1));if(!i){x.fillStyle='#e8a050';x.beginPath();x.ellipse(w/2,h*.47,w*.2,h*.1,0,0,Math.PI*2);x.fill();}},256));
 spot([-1.9,1.3,-2.8],'Read the notices','read','Police box notices','WANTED: Tama, a ginger cat, for repeatedly sleeping in the fish crates at the quay. Approach with a sardine.\nLOST: One glove, left hand. The right one is also lost, but separately.\nTraffic Safety Week: bicycle lamps on after dark.');
 box('Lost property shelf',[.4,1.5,1.6],[3.15,.75,-1.5],0x8a6a4a,true);
 for(const y of [.5,1.0,1.45])box('Shelf board',[.42,.03,1.6],[3.13,y,-1.5],0x6d5238);
 box('Lost umbrella',[.05,.05,.9],[3.05,.55,-1.5],0x2a8fcc);box('Lost glove',[.14,.04,.2],[3.05,1.04,-1.9],0xe8cf85);
 box('Lost sandal',[.12,.05,.26],[3.05,1.04,-1.25],0x7a4a2a);cyl('Lost sunhat',.17,.05,[3.05,1.5,-1.7],0xe9d49a,14);
 box('Lost toy boat',[.2,.1,.08],[3.05,1.52,-1.1],0xd7263d);
 spot([2.8,1.1,-1.5],'Look through lost property','inspect','Lost property','An umbrella left on the bus, one glove, one sandal, a sun hat and a small red boat with “Hana” on the hull. Each has a tag in Officer Mori’s careful handwriting and the date it was found.');
 // Tea things on a cabinet against the partition, and the wall clock above the desk.
 box('Tea cabinet',[.8,.8,.4],[.3,.4,.5],0x8a6a4a,true);
 cyl('Thermos',.07,.3,[.1,.95,.5],0xd7263d);box('Tea tin',[.1,.12,.1],[.35,.86,.5],0x3f7a55);
 for(const dx of [.52,.64])cyl('Tea cup',.035,.06,[dx,.83,.45],0xf4f1ea,10);
 spot([.3,1.1,.3],'Inspect the tea things','inspect','Tea for visitors','A thermos of barley tea and two cups. The note on the tin says: For anybody who comes in upset. Also for me at four in the morning.');
 panel('Wall clock',.42,.42,[-1.4,2.2,.74],Math.PI,(x,w,h)=>{x.fillStyle='#27304d';x.beginPath();x.arc(w/2,h/2,w/2,0,Math.PI*2);x.fill();x.fillStyle='#f4f1ea';x.beginPath();x.arc(w/2,h/2,w*.44,0,Math.PI*2);x.fill();
  x.fillStyle='#27304d';for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillRect(w/2+Math.sin(a)*w*.38-3,h/2-Math.cos(a)*h*.38-3,6,6);}
  x.strokeStyle='#27304d';x.lineCap='round';x.lineWidth=8;x.beginPath();x.moveTo(w/2,h/2);x.lineTo(w/2+w*.2,h/2);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(w/2,h/2);x.lineTo(w/2,h/2-h*.32);x.stroke();},128).material.transparent=true;
 panel('Emergency poster',.5,.36,[.3,1.75,.745],Math.PI,(x,w,h)=>{x.fillStyle='#d7263d';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.textAlign='center';x.font=`bold ${h*.42}px ${MARU}`;x.fillText('110',w/2,h*.52);x.font=`bold ${h*.13}px ${MARU}`;x.fillText('EMERGENCY',w/2,h*.8);},256);
 panel('Calendar',.34,.48,[-2.6,1.7,.745],Math.PI,(x,w,h)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle='#2a8fcc';x.fillRect(0,0,w,h*.38);x.fillStyle='#fff';x.textAlign='center';x.font=`bold ${h*.14}px ${MARU}`;x.fillText('9月 1997',w/2,h*.24);
  x.fillStyle='#3b3f55';x.font=`${h*.05}px ${MARU}`;for(let d=1;d<=30;d++){const c=(d+0)%7,r=Math.floor((d+0)/7);x.fillStyle=c===0?'#d7263d':'#3b3f55';x.fillText(String(d),w*(.1+c*.13),h*(.48+r*.1));}},256);
 box('Potted plant',[.32,.32,.32],[-3.0,.16,-2.7],0xb95c3c);
 const leaves=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),mat(0x3f8f46));leaves.position.set(-3.0,.6,-2.7);leaves.scale.set(1,1.3,1);group.add(leaves);

 // The tatami room: his futon, a little table and stool, the television, the spare uniform.
 const futon=box('Officer Mori futon',[1.1,.14,2.15],[-2.3,.1,1.93],0xe9dfc8,true);futon.userData.bed=true;
 box('Futon quilt',[1.05,.05,1.5],[-2.3,.195,2.22],0x7f9fc4);box('Pillow',[.8,.12,.4],[-2.3,.23,1.4],0xf3e8d2);
 box('Alarm clock',[.14,.12,.08],[-1.6,.06,1.05],0xd7263d);
 box('Tea table',[.7,.05,.5],[1.2,.6,1.75],0x8a6a4a);for(const [dx,dz] of [[-.3,-.2],[.3,-.2],[-.3,.2],[.3,.2]])box('Table leg',[.04,.58,.04],[1.2+dx,.29,1.75+dz],0x6d5238);
 collider(1.2,1.75,.7,.5,.62);
 box('Kitchen stool',[.36,.42,.36],[1.2,.21,2.42],0x6d5238);
 box('Rice bowl',[.12,.06,.12],[1.1,.66,1.7],0xf4f1ea);box('Tea cup',[.07,.07,.07],[1.35,.66,1.8],0x3f7a55);
 box('TV cabinet',[.8,.5,.45],[2.85,.25,2.75],0x6d5238,true);box('Portable television',[.5,.4,.4],[2.85,.7,2.75],0x3b3f45);
 box('TV screen',[.36,.28,.01],[2.85,.72,2.545],0x21302c);
 box('Clothes rail',[1.2,.04,.04],[-.3,1.75,2.95],0x9aa3a0);
 box('Spare uniform shirt',[.5,.7,.08],[-.55,1.35,2.95],0x9dbfe0);box('Spare uniform trousers',[.35,.9,.06],[0,1.25,2.97],0x27304d);
 // His cap hangs on this peg when he is home (home-residents.js); on patrol it is on his head.
 box('Hat peg plate',[.1,.1,.03],[.45,1.72,3.04],0x6d5238);box('Hat peg',[.035,.035,.14],[.45,1.7,2.98],0x6d5238);
 box('Tatami room window',[1.2,.9,.03],[-3.36,1.6,2.0],new THREE.MeshStandardMaterial({color:0x9fc4d6,emissive:0xbfd8e6,emissiveIntensity:.35,roughness:.2}));
 for(const dz of [-.45,.45])box('Curtain',[.03,1.0,.3],[-3.32,1.6,2.0+dz],0xe8cf85);
 spot([-.3,1.4,2.7],'Inspect the spare uniform','inspect','Spare uniform','A pressed summer shirt, the trousers on a hanger and a peg for his cap, ready for the night patrol. A small label inside the cap says MORI in marker pen.');
 spot([1.2,1.0,1.75],'Read Officer Mori’s notebook','read','Officer Mori’s notebook','Patrol from '+time(1320)+' to '+time(360)+'. Sleep '+time(hours.sleep)+'–'+time(hours.wake)+'. Front desk from 16:00. Supper at Sakura (Thuan recommends the curry bun).\n\nReiko wants a quote for the paper. Think of something that sounds more exciting than “quiet night”.');
 spot([2.85,1.1,2.5],'Inspect the television','inspect','Portable television','A small portable set with a bent aerial. The channel knob is stuck between the late news and the baseball.');
 spot([-2.3,.7,1.9],'Inspect Officer Mori’s futon','inspect','Officer Mori’s futon','Folded away in the afternoon and laid out again at seven in the morning, after the night patrol. If he is asleep, let him be.');

 const door=new THREE.Object3D();door.position.set(...KOBAN_ROOM.exit);group.add(door);reg(door,'Exit to the bus plaza',exit,true);
 room.add(new THREE.HemisphereLight(0xfff3dc,0x8a8474,1.7));
 const lamp=new THREE.PointLight(0xfff1d0,1.4,8,2);lamp.position.set(-.5,2.6,-1);room.add(lamp);
 return {...KOBAN_ROOM,colliders:[]};
}
