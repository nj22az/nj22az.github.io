import * as THREE from '../../../vendor/three.module.js';
import {HARBOUR_LINE} from '../../people/commuter-schedule.js';
import {createVendingMachine} from '../vending.js';
import {japaneseSign} from '../okinawa/signs.js';

/**
 * The waiting hall of the Minato Port Building (port-building.js, docs/PORT-BUILDING-PLAN.md).
 *
 * One counter sells every way off the island: the mainland ferry, the airport ferry to
 * Kitano-jima and the evening boat to Naha. Benches face the big windows onto the pier,
 * a departures board hangs over the counter, and the stairs go up to the Harbour
 * Office. Room contract: the door is on the +z wall, you enter facing -z (yaw 0).
 */
export const PORT_HALL=Object.freeze({w:9,d:7,h:3.2});
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",system-ui,sans-serif';
const hhmm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

function canvasTexture(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(ctx)draw(ctx,w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildPortHall({room,reg,collider=()=>{},action,naha=()=>{},upstairs=()=>{}}){
 const group=new THREE.Group();group.name='Minato Port Terminal waiting hall';room.add(group);
 const {w,d,h}=PORT_HALL,hw=w/2,hd=d/2;
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82}));return mats.get(c);};
 const box=(name,size,pos,c,{ry=0}={})=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof c==='number'?mat(c):c);m.name=name;m.position.set(...pos);m.rotation.y=ry;m.receiveShadow=true;group.add(m);return m;};
 const panel=(name,pw,ph,pos,ry,draw,px=512,basic=false)=>{const tex=canvasTexture(px,Math.round(px*ph/pw),draw);const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),basic?new THREE.MeshBasicMaterial({map:tex}):new THREE.MeshStandardMaterial({map:tex,roughness:.9}));m.name=name;m.position.set(...pos);m.rotation.y=ry;group.add(m);return m;};
 const spot=(pos,label,fn)=>{const o=new THREE.Object3D();o.name=label;o.position.set(...pos);group.add(o);reg(o,label,fn,true);return o;};

 // Shell: terrazzo floor, cream walls over a teal dado, a pale ceiling with battens.
 panel('Terrazzo floor',w,d,[0,.002,0],0,(x,cw,ch)=>{x.fillStyle='#d9d3c3';x.fillRect(0,0,cw,ch);for(let i=0;i<2600;i++){x.fillStyle=['#a49b88','#7d8a86','#efe9db','#b97b5c'][i%4];x.fillRect(Math.random()*cw,Math.random()*ch,2,2);}x.strokeStyle='#b9b1a0';x.lineWidth=2;for(let g=0;g<cw;g+=cw/9){x.beginPath();x.moveTo(g,0);x.lineTo(g,ch);x.stroke();}for(let g=0;g<ch;g+=ch/7){x.beginPath();x.moveTo(0,g);x.lineTo(cw,g);x.stroke();}},1024).rotation.x=-Math.PI/2;
 box('Ceiling',[w,.04,d],[0,h+.02,0],0xf3efe4);
 const wall=0xf1ead8,dado=0x2f6a70;
 box('Hall wall',[w,h,.08],[0,h/2,-hd-.04],wall);box('Hall dado',[w,1,.02],[0,.5,-hd+.005],dado);
 box('Hall wall',[.08,h,d],[hw+.04,h/2,0],wall);box('Hall dado',[.02,1,d],[hw-.005,.5,0],dado);
 // The pier wall (-x): three big windows onto the quay and the ferry.
 box('Pier wall',[.08,.9,d],[-hw-.04,.45,0],dado);
 box('Pier wall head',[.08,.55,d],[-hw-.04,h-.27,0],wall);
 const view=panel('View of the pier',d-.4,h-1.55,[-hw-.02,.9+(h-1.45)/2,0],Math.PI/2,(x,cw,ch)=>{
  const sky=x.createLinearGradient(0,0,0,ch*.55);sky.addColorStop(0,'#7fc0e6');sky.addColorStop(1,'#d8eef3');x.fillStyle=sky;x.fillRect(0,0,cw,ch*.55);
  x.fillStyle='#e9f3f1';for(const [cx,cy,r] of [[.2,.18,.06],[.26,.16,.05],[.7,.12,.07],[.77,.14,.05]]){x.beginPath();x.arc(cx*cw,cy*ch,r*cw,0,7);x.fill();}
  x.fillStyle='#7d8fa0';x.beginPath();x.moveTo(cw*.55,ch*.55);x.quadraticCurveTo(cw*.72,ch*.38,cw*.92,ch*.55);x.fill();
  const sea=x.createLinearGradient(0,ch*.55,0,ch);sea.addColorStop(0,'#2fb5b8');sea.addColorStop(1,'#46d1c4');x.fillStyle=sea;x.fillRect(0,ch*.55,cw,ch*.45);
  x.fillStyle='#d9d4c6';x.fillRect(0,ch*.78,cw,ch*.22);x.fillStyle='#2b3436';for(let b=.08;b<1;b+=.18)x.fillRect(b*cw,ch*.74,cw*.025,ch*.06);
  x.fillStyle='#f4f1ea';x.fillRect(cw*.18,ch*.5,cw*.42,ch*.12);x.fillStyle='#2f5f6a';x.fillRect(cw*.18,ch*.6,cw*.42,ch*.04);x.fillStyle='#f4f1ea';x.fillRect(cw*.32,ch*.42,cw*.16,ch*.09);x.fillStyle='#c8392e';x.fillRect(cw*.41,ch*.36,cw*.03,ch*.07);
 },1024,true);
 view.name='View of the pier';
 for(let z=-hd+.2;z<=hd-.19;z+=(d-.4)/3)box('Window mullion',[.07,h-1.45,.07],[-hw+.02,.9+(h-1.45)/2,z],0xb8bec0);
 for(const y of [.9,h-.55])box('Window rail',[.09,.07,d-.3],[-hw+.02,y,0],0xb8bec0);
 // The door wall (+z): glass doors in the middle.
 for(const [x,len] of [[-(hw+.95)/2,hw-.95],[(hw+.95)/2,hw-.95]]){box('Door wall',[len,h,.08],[x,h/2,hd+.04],wall);box('Door wall dado',[len,1,.02],[x,.5,hd-.005],dado);}
 box('Door head',[1.9,h-2.3,.08],[0,2.3+(h-2.3)/2,hd+.04],wall);
 box('Glass doors',[1.86,2.26,.04],[0,1.13,hd+.05],new THREE.MeshStandardMaterial({color:0xa9cfd8,roughness:.12,transparent:true,opacity:.5}));
 for(const x of [-.95,0,.95])box('Door frame',[.06,2.3,.1],[x,1.15,hd+.02],0xb8bec0);
 group.add(new THREE.HemisphereLight(0xf6f2e6,0x8a8478,1.05));
 const lamp=new THREE.PointLight(0xfff2dc,.9,13,2);lamp.position.set(0,h-.4,0);group.add(lamp);
 const tube=new THREE.MeshBasicMaterial({color:0xf6fbf4});
 for(const x of [-2.5,0,2.5])for(const z of [-1.6,1.6]){box('Light batten',[1.3,.05,.18],[x,h-.03,z],0xdedfd6);const t=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.2,6),tube);t.rotation.z=Math.PI/2;t.position.set(x,h-.07,z);group.add(t);}

 // The ticket counter along the back wall: three windows, one for each way off the island.
 const cz=-hd+.75;
 box('Ticket counter',[6.6,1.05,.7],[-.4,.52,cz],0x7a5b40);
 box('Ticket counter top',[6.7,.05,.8],[-.4,1.07,cz],0xd9d0bd);
 box('Ticket counter kick',[6.6,.12,.05],[-.4,.06,cz+.36],0x2b3436);
 for(const x of [-3.7,-1.5,.7,2.9])box('Counter screen post',[.05,1.2,.05],[x,1.7,cz-.05],0xb8bec0);
 box('Counter screen',[6.6,1.15,.02],[-.4,1.68,cz-.05],new THREE.MeshStandardMaterial({color:0xcfe6ea,roughness:.1,transparent:true,opacity:.28}));
 box('Back office wall',[6.6,.4,.06],[-.4,2.45,cz-.05],dado);
 collider(-.4,cz,6.8,.85,1.1);
 const windows=[
  {x:-2.6,title:'Mainland ferry',sub:'MINATO ⇄ MAINLAND · CARS & FOOT',go:()=>action('bus')},
  {x:-.4,title:'Airport ferry',sub:'KITANO-JIMA AIRPORT · ¥400',go:()=>action('airport-ferry')},
  {x:1.8,title:'Evening boat to Naha',sub:'17:00–21:30 · WITH THUAN',go:()=>naha()},
 ];
 for(const win of windows){
  panel('Counter window sign',1.9,.36,[win.x,2.86,cz-.02],0,(x,cw,ch)=>{x.fillStyle='#2b5a78';x.fillRect(0,0,cw,ch);x.fillStyle='#f3ecd8';x.textAlign='center';x.textBaseline='middle';x.font=`700 ${ch*.42}px ${GOTHIC}`;x.fillText(japaneseSign(win.title)===win.title?win.title.toUpperCase():japaneseSign(win.title),cw/2,ch*.36);x.font=`600 ${ch*.2}px system-ui`;x.fillText(win.sub,cw/2,ch*.78);},512);
  box('Ticket tray',[.5,.04,.3],[win.x,1.11,cz+.25],0x8e979a);
  spot([win.x,1.25,cz+.6],win.title==='Evening boat to Naha'?'Take the evening boat to Naha with Thuan':'Buy a ticket: '+win.title,win.go);
 }
 // Departures board over the counter: amber on black, the sailings of the day.
 panel('Departures board',3.6,.95,[-.4,3.02-.95/2+.53,-hd+.03],0,(x,cw,ch)=>{
  x.fillStyle='#16191a';x.fillRect(0,0,cw,ch);x.fillStyle='#f2b33d';x.textBaseline='middle';
  x.font=`700 ${ch*.15}px ${GOTHIC}`;x.textAlign='left';x.fillText(japaneseSign('Departures'),cw*.04,ch*.15);x.font=`600 ${ch*.1}px system-ui`;x.fillText('DEPARTURES',cw*.26,ch*.15);
  const rows=[...HARBOUR_LINE.map(m=>[hhmm(m),'MAINLAND','Outer pier']),['17:00','NAHA (evening)','Outer pier'],['—','AIRPORT FERRY','Ask at window 2']];
  x.font=`600 ${ch*.1}px ui-monospace,monospace`;rows.forEach(([t,dest,where],i)=>{const y=ch*(.36+i*.13);x.fillText(t,cw*.04,y);x.fillText(dest,cw*.22,y);x.fillText(where,cw*.68,y);});
 },1024,true);
 spot([-.4,1.4,cz+.9],'Read the departures board',()=>action('bus'));

 // Benches: two rows of moulded seats facing the pier windows.
 const seatColours=[0x2f6a70,0xd27a3a];
 for(const [row,z] of [[0,-.6],[1,1.2]])for(let i=0;i<5;i++){
  const zz=z+(i-2)*.55,x=-.6+row*1.9;
  box('Hall seat',[.46,.06,.46],[x,.44,zz],seatColours[(i+row)%2]);
  box('Hall seat back',[.06,.42,.46],[x+.24,.68,zz],seatColours[(i+row)%2]);
 }
 for(const [x,z] of [[-.4,.3],[1.5,.3]]){box('Bench rail',[.08,.08,3],[x,.36,z],0x8e979a);collider(x-.2,z,.7,2.8,.7);}
 // The east wall: a map of the strait, the stairs to the Harbour Office, a vending machine.
 panel('Map of the strait',2.1,1.3,[hw-.01,1.75,-1.3],-Math.PI/2,(x,cw,ch)=>{
  x.fillStyle='#bfe0e4';x.fillRect(0,0,cw,ch);x.fillStyle='#e8dcb4';x.strokeStyle='#6b6450';x.lineWidth=3;
  x.beginPath();x.ellipse(cw*.3,ch*.55,cw*.14,ch*.2,-.3,0,7);x.fill();x.stroke();
  x.beginPath();x.ellipse(cw*.62,ch*.62,cw*.07,ch*.08,0,0,7);x.fill();x.stroke();
  x.fillRect(cw*.84,0,cw*.16,ch);x.strokeRect(cw*.84,0,cw*.16,ch);
  x.setLineDash([10,8]);x.strokeStyle='#c8392e';x.lineWidth=4;x.beginPath();x.moveTo(cw*.36,ch*.7);x.quadraticCurveTo(cw*.6,ch*.85,cw*.84,ch*.5);x.stroke();
  x.strokeStyle='#2b5a78';x.beginPath();x.moveTo(cw*.38,ch*.62);x.lineTo(cw*.56,ch*.62);x.stroke();x.setLineDash([]);
  x.fillStyle='#2b3436';x.font=`700 ${ch*.07}px system-ui`;x.textAlign='center';x.fillText('MINATO',cw*.3,ch*.56);x.fillText('KITANO-JIMA',cw*.62,ch*.78);x.fillText('MAINLAND',cw*.92,ch*.1);x.fillText('THE STRAIT',cw*.5,ch*.12);
 },768);
 spot([hw-.8,1.4,-1.3],'Read the map of the strait',()=>action('read','Map of the strait','Three ways off the island, all from the outer pier: the car ferry to the mainland (three sailings a day), the airport ferry across to Kitano-jima, and in the evening the boat to Naha. When the bridge is open you can drive to the airport instead.'));
 // Stairs up the east wall to the Harbour Office door.
 for(let i=0;i<8;i++)box('Stair tread',[.95,.06,.3],[hw-.55,.18+i*.19,2.9-i*.3],0x8a6a4a);
 box('Stair string',[.06,1.6,2.5],[hw-1.05,.95,1.85],0x7a5b40);
 box('Landing',[.95,.1,1],[hw-.55,1.66,.45],0x8a6a4a);
 box('Office door',[.05,2,.95],[hw-.02,2.66,.45],0x74563b);
 panel('Harbour Office sign',.9,.24,[hw-.04,3.0-.05,.45],-Math.PI/2,(x,cw,ch)=>{x.fillStyle='#3e463f';x.fillRect(0,0,cw,ch);x.fillStyle='#f3ecd8';x.font=`700 ${ch*.5}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.fillText('HARBOUR OFFICE ↑',cw/2,ch/2);},384);
 collider(hw-.55,1.75,1,2.6,1.7);
 spot([hw-1.3,1.2,2.4],'Go up to the Harbour Office',upstairs);
 const vending=createVendingMachine({});vending.position.set(hw-.55,0,-2.9);vending.rotation.y=-Math.PI/2;group.add(vending);collider(hw-.55,-2.9,.9,.9,1.9);
 spot([hw-1.2,1.1,-2.9],'Buy a drink from the vending machine',()=>action('vending'));
 // Sakura's ferry punch cards, on an honour shelf by the door: Thuan restocks it.
 box('Punch card shelf',[.6,.9,.3],[-hw+.5,.45,hd-.4],0x8a6a4a);
 panel('Punch card notice',.55,.4,[-hw+.5,1.15,hd-.56],0,(x,cw,ch)=>{x.fillStyle='#f6e7c4';x.fillRect(0,0,cw,ch);x.fillStyle='#c8392e';x.fillRect(0,0,cw,ch*.28);x.fillStyle='#fff';x.font=`700 ${ch*.18}px system-ui`;x.textAlign='center';x.fillText('SAKURA',cw/2,ch*.18);x.fillStyle='#2b2b2b';x.font=`600 ${ch*.12}px system-ui`;x.fillText('FERRY PUNCH CARDS',cw/2,ch*.48);x.fillText('sold at Sakura',cw/2,ch*.68);x.fillText('honour box',cw/2,ch*.86);},256);
 spot([-hw+.9,1,hd-.7],'Look at the punch card shelf',()=>action('read','Ferry punch cards','Ten crossings to the mainland on one card. Thuan keeps this shelf stocked with leaflets; the cards themselves are sold at Sakura, over the counter.'));
 // A wall clock over the doors.
 panel('Wall clock',.5,.5,[0,2.85,hd-.01],Math.PI,(x,cw,ch)=>{x.fillStyle='#f6f1e2';x.beginPath();x.arc(cw/2,ch/2,cw*.46,0,7);x.fill();x.strokeStyle='#2b3436';x.lineWidth=cw*.05;x.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillStyle='#2b3436';x.fillRect(cw/2+Math.sin(a)*cw*.36-2,ch/2-Math.cos(a)*ch*.36-2,4,4);}x.lineWidth=cw*.035;x.beginPath();x.moveTo(cw/2,ch/2);x.lineTo(cw*.62,ch*.3);x.moveTo(cw/2,ch/2);x.lineTo(cw*.32,ch*.44);x.stroke();},256);

 return {bounds:{minX:-hw+.2,maxX:hw-.2,minZ:-hd+.2,maxZ:hd-.2},spawn:[0,0,hd-.7],exit:[0,1.1,hd-.04],yaw:0,portHall:true};
}
