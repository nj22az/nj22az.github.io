import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {utilityPole,wiresBetween,serviceDrop} from './okinawa/props.js';
import {poster} from './okinawa/signs.js';
import {groundHeight} from './layout.js';
import {SCHOOL} from './school-layout.js';
/** One 6.6 kV radial network, with the diesel station as its source. */
export function buildTownPower(world,{register,onAction,shadows=false}={}){
 const nodes=[],spans=[];world.group.traverse(o=>{const n=o.userData.powerNetwork;if(n){nodes.push(...n.nodes);spans.push(...n.spans);}});
 const group=new THREE.Group();group.name='Minato power station outgoing feeders';world.group.add(group);const kit=createKit({shadows});
 const solid=c=>world.colliders.push(c);
 const pole=(x,z,o={})=>{let p;kit.at(0,0,0,()=>{p=utilityPole(kit,x,z,{...o,h:10});solid(p.collider);},groundHeight(x,z));nodes.push(p);return p;};
 const link=(a,b)=>{wiresBetween(kit,a,b,{sag:.38});spans.push({from:a.id,to:b.id});};
 const root=pole(23.5,32.1,{transformer:false});root.source=true;
 const nearest=(x,z)=>nodes.reduce((a,b)=>Math.hypot(b.x-x,b.z-z)<Math.hypot(a.x-x,a.z-z)?b:a);
 // Follow the terminal's northern verge; never put a feeder pole through a house.
 const west=nearest(-36.7,20),main=nearest(6.9,19.6);
 const connector=[west,...[[-36.7,28],[-22,28],[-7.2,28],[6.9,28]].map(p=>pole(...p)),main];
 for(let i=1;i<connector.length;i++)link(connector[i-1],connector[i]);link(root,connector.at(-2));
 // Upland radio spur and the coastal shopping street feeder use normal pole spans.
 const radio=nearest(22.25,93),radioLine=[radio,...[[22.25,113],[22.25,133],[25.5,153],[38,158]].map(p=>pole(...p,{transformer:p[1]===158}))];
 for(let i=1;i<radioLine.length;i++)link(radioLine[i-1],radioLine[i]);serviceDrop(kit,radioLine.at(-1),[38.5,2.6,161]);
 const coastal=[nearest(42.25,50),pole(61.8,48),pole(68,60),pole(73.8,74),nearest(84.25,95)];for(let i=1;i<coastal.length;i++)link(coastal[i-1],coastal[i]);
 // Join the remaining existing street circuits at their nearest poles, subdividing long spans.
 const connected=()=>{const set=new Set([root.id]);let changed=true;while(changed){changed=false;for(const s of spans)if(set.has(s.from)!==set.has(s.to)){set.add(s.from);set.add(s.to);changed=true;}}return set;};
 while(connected().size<nodes.length){const reached=connected();let pair=null,d=Infinity;for(const a of nodes.filter(n=>reached.has(n.id)))for(const b of nodes.filter(n=>!reached.has(n.id))){const m=Math.hypot(a.x-b.x,a.z-b.z);if(m<d){d=m;pair=[a,b];}}
  const [a,b]=pair,count=Math.ceil(d/24);let prior=a;for(let i=1;i<count;i++){const p=pole(a.x+(b.x-a.x)*i/count,a.z+(b.z-a.z)*i/count);link(prior,p);prior=p;}link(prior,b);
 }
 // Protected outgoing cable and switching gear at the plant, rather than wires with loose ends.
 const ph=SCHOOL.powerHouse;
 kit.box(.13,.85,.65,ph.maxX+.09,2.15,33.9,0x71807d);
 kit.rod([ph.maxX+.15,1.75,33.9],[ph.maxX+.15,.1,33.9],.05,0x586965);
 kit.rod([23.34,.1,32.1],[23.34,8.9,32.1],.045,0x2b2a30);
 kit.rod([ph.maxX+.15,-.45,33.9],[23.34,-.45,32.1],.065,0x2b2a30);
 kit.wire(new THREE.Vector3(23.34,8.9,32.1).toArray(),root.anchors[0].toArray(),.02,.025,0x2b2a30);
 kit.sign(poster({title:'港町発電所',lines:['MINATO POWER STATION','6.6 kV · 島内配電','Island distribution · 1997'],band:'#315c60',bg:'#e9e7d5'}),1.4,.85,ph.maxX+.08,2.35,31,{ry:Math.PI/2,name:'Power distribution board'});
 kit.finish(group,'Island distribution equipment');
 const a=new THREE.Object3D();a.position.set(21,1.3,31);group.add(a);register?.(a,'Read the island power network',()=>onAction?.('read','Minato power station','The two diesel generators feed the island at 6,600 volts through a buried cable to the outgoing pole. The northern feeder serves the terminal and homes; the eastern feeder serves Kitahama, Rainflower Lane and Aoba Radio. Pole transformers reduce the voltage for shops and houses. The station keeps a standby generator for storms.'));
 return {group,source:root.id,nodes,spans,connected:connected().size};
}
