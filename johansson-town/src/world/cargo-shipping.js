import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
export const CARGO_CALLS=Object.freeze([{arrival:420,alongside:450,departure:520,gone:550},{arrival:870,alongside:900,departure:990,gone:1020}]);
export function cargoVisit(minutes){
 const m=((minutes%1440)+1440)%1440,day=Math.floor(minutes/1440),call=CARGO_CALLS.find(c=>m>=c.arrival&&m<c.gone);
 if(!call)return {phase:'at sea',visible:false,progress:0,day,name:day%2?'Island Trader':'Kitano Supply'};
 const phase=m<call.alongside?'arriving':m<call.departure?'alongside':'departing',progress=phase==='arriving'?(m-call.arrival)/(call.alongside-call.arrival):phase==='departing'?(m-call.departure)/(call.gone-call.departure):1;
 return {phase,visible:true,progress,day,name:day%2?'Island Trader':'Kitano Supply',call:CARGO_CALLS.indexOf(call)};
}
/** Small island cargo ship; it stays in sea space and never blocks ferry/pier walking. */
export function buildCargoShipping(world,{register,onAction}={}){
 const ship=new THREE.Group();ship.name='Scheduled island cargo ship';ship.userData.dynamicProp=true;world.group.add(ship);const batches=new Map();
 const piece=(g,c)=>{if(!batches.has(c))batches.set(c,[]);batches.get(c).push(g);};
 const box=(s,p,c)=>{const g=new THREE.BoxGeometry(...s);g.translate(...p);piece(g,c);};
 const hullShape=new THREE.Shape();hullShape.moveTo(-13,-2.8);hullShape.lineTo(10,-2.8);hullShape.lineTo(13,-1.3);hullShape.lineTo(13,1.3);hullShape.lineTo(10,2.8);hullShape.lineTo(-13,2.8);hullShape.closePath();
 const hull=new THREE.ExtrudeGeometry(hullShape,{depth:1.6,bevelEnabled:false});hull.rotateX(-Math.PI/2);hull.translate(0,-.7,0);piece(hull,0x344b53);
 box([23,.12,5.4],[-1,1.0,0],0x89816a);box([5,1.7,4.8],[-8,1.91,0],0xdfd8bc);box([4.1,1.3,3.8],[-8.35,3.35,0],0xe3dcc5);box([3.3,.14,4.1],[-8.35,4.05,0],0x606f6d);
 for(const x of [-9.5,-8.8,-8.1,-7.4])for(const z of [-1.95,1.95])box([.42,.47,.045],[x,3.4,z],0x405d63);
 box([.7,2.4,.8],[-10.4,4.3,0],0x75473b);box([.03,4.5,.03],[-7.0,4.8,0],0x5b6460);
 for(let i=0;i<3;i++)for(const z of [-1.25,1.25]){const x=-2+i*3.3;box([3.1,1.65,2.15],[x,1.9,z],[0x59706e,0x6e7e87,0x937653][i]);for(let k=0;k<12;k++)box([.04,1.52,.035],[x-1.45+k*.25,1.92,z+Math.sign(z)*1.095],0x697a76);}
 for(const z of [-2.6,2.6]){box([23,.04,.04],[-1,1.8,z],0xb2b1a0);for(let x=-12;x<10;x+=1)box([.025,.75,.025],[x,1.43,z],0xa4a79a);}
 for(const [c,list] of batches){const m=new THREE.Mesh(mergeGeometries(list,false),new THREE.MeshStandardMaterial({color:c,roughness:.82,metalness:.18}));m.castShadow=true;m.receiveShadow=true;ship.add(m);list.forEach(g=>g.dispose());}
 const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,.4,-49.8),new THREE.Vector3(-20,.9,-53.2)]),new THREE.LineBasicMaterial({color:0x78694d}));rope.name='Cargo mooring line';world.group.add(rope);
 let visit=cargoVisit(0);
 const a=new THREE.Object3D();a.position.set(-20,1,-49.3);world.group.add(a);register?.(a,'Read the cargo arrival board',()=>onAction?.('read','Western quay cargo calls','ISLAND SUPPLY SERVICE\nMorning: approach 07:00 · alongside 07:30–08:40 · clear 09:10.\nAfternoon: approach 14:30 · alongside 15:00–16:30 · clear 17:00.\n'+visit.name+' is '+visit.phase+'. Rice, shop goods, post and repair parts come in; chilled catch and outgoing mail leave. Keep the working berth clear.'));
 return {ship,update(time,minutes){visit=cargoVisit(minutes);ship.visible=visit.visible;rope.visible=visit.phase==='alongside';const distance=visit.phase==='arriving'?(1-visit.progress)*90:visit.phase==='departing'?visit.progress*90:0;ship.position.set(-20.5,Math.sin(time*.8)*.025,-56-distance);ship.rotation.z=Math.sin(time*.45)*.003;},snapshot:()=>({...visit,position:ship.position.toArray()})};
}
