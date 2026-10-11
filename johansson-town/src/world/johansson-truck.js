import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

/** JT-25: a compact 1990s diesel counterbalance truck. Front is local -Z. */
export function buildJohanssonTruck({shadows=false}={}){
 const group=new THREE.Group();group.name='Johansson JT-25 · 1994';
 const carriage=new THREE.Group();carriage.name='JT-25 lifting carriage';carriage.userData.dynamicProp=true;group.add(carriage);
 const buckets=new Map();
 const add=(geo,color,parent=group)=>{const key=parent.uuid+':'+color;if(!buckets.has(key))buckets.set(key,{parent,color,geos:[]});buckets.get(key).geos.push(geo);};
 const box=(s,p,c,parent=group,rot=[0,0,0])=>{const geo=new THREE.BoxGeometry(...s);geo.rotateX(rot[0]);geo.rotateY(rot[1]);geo.rotateZ(rot[2]);geo.translate(...p);add(geo,c,parent);};
 const cylinder=(r,h,p,c,rot=[0,0,0],parent=group)=>{const geo=new THREE.CylinderGeometry(r,r,h,16);geo.rotateX(rot[0]);geo.rotateY(rot[1]);geo.rotateZ(rot[2]);geo.translate(...p);add(geo,c,parent);};
 const ochre=0xc5913f,frame=0x334548,rubber=0x292d2c,steel=0x73817e,cream=0xe9debe;
 // Low chassis, raised rear engine cover, and a rounded cast counterweight.
 box([1.16,.22,1.75],[0,.38,.03],frame);
 box([1.13,.43,.68],[0,.68,.62],ochre);
 const counter=new THREE.CylinderGeometry(.61,.56,.57,12,1,false,-Math.PI/2,Math.PI);counter.rotateY(Math.PI);counter.translate(0,.60,.78);add(counter,ochre);
 box([1.02,.10,.72],[0,.93,.61],ochre,group,[-.06,0,0]);
 box([.90,.08,.08],[0,.36,1.24],frame);
 // Drive axle carries the load; the smaller rear axle steers.
 for(const [z,r,x,w] of [[-.61,.34,.58,.24],[.76,.25,.54,.19]])for(const side of [-1,1]){
  cylinder(r,w,[side*x,r,z],rubber,[0,0,Math.PI/2]);
  cylinder(r*.54,w+.018,[side*x,r,z],ochre,[0,0,Math.PI/2]);
  cylinder(r*.22,w+.028,[side*x,r,z],steel,[0,0,Math.PI/2]);
  for(let n=0;n<6;n++){const a=n*Math.PI/3;cylinder(.018,w+.032,[side*x,r+Math.sin(a)*r*.36,z+Math.cos(a)*r*.36],cream,[0,0,Math.PI/2]);}
 }
 for(const side of [-1,1]){
  box([.24,.10,.68],[side*.55,.73,-.61],ochre);
  box([.18,.055,.44],[side*.56,.45,.05],steel); // Open low step.
  box([.07,1.48,.07],[side*.51,1.38,-.39],frame,group,[-.06,0,0]);
  box([.07,1.19,.07],[side*.51,1.53,.68],frame);
 }
 box([1.15,.08,1.25],[0,2.15,.15],frame);
 for(let z=-.35;z<=.7;z+=.21)box([1.02,.045,.065],[0,2.20,z],steel);
 box([.50,.14,.49],[0,.88,.12],rubber);box([.50,.43,.10],[0,1.12,.39],rubber,group,[-.12,0,0]);
 box([.57,.10,.10],[0,1.02,-.38],frame);
 cylinder(.034,.38,[0,.94,-.38],steel,[-.4,0,0]);
 const steering=new THREE.TorusGeometry(.16,.023,6,16);steering.rotateX(Math.PI/2-.4);steering.translate(0,1.13,-.45);add(steering,rubber);
 for(const x of [.29,.37,.45]){box([.018,.26,.018],[x,.96,-.18],steel);cylinder(.035,.05,[x,1.10,-.18],rubber);}
 // Duplex rails, tilt rams, lift cylinder and chains behind the load backrest.
 for(const x of [-.43,.43]){
  box([.12,2.04,.16],[x,1.22,-.91],frame);
  box([.046,1.77,.065],[x,1.21,-1.005],steel);
  box([.055,.43,.055],[x,.65,-.72],steel,group,[-.45,0,0]);
 }
 box([.91,.12,.16],[0,2.22,-.91],frame);
 cylinder(.055,1.63,[0,1.17,-.88],steel);
 for(const x of [-.14,.14])box([.028,1.76,.027],[x,1.22,-1.02],rubber);
 box([1.03,.14,.14],[0,.30,-1.12],frame,carriage);
 box([1.03,.055,.07],[0,1.15,-1.12],frame,carriage);
 for(const x of [-.49,-.25,0,.25,.49])box([.035,.80,.055],[x,.74,-1.12],frame,carriage);
 for(const x of [-.32,.32]){box([.10,.41,.065],[x,.28,-1.20],steel,carriage);box([.10,.06,.94],[x,.09,-1.64],steel,carriage);box([.10,.025,.15],[x,.065,-2.17],steel,carriage);}
 // Period work lamps, indicators, radiator slots and a vertical exhaust.
 for(const side of [-1,1]){box([.17,.12,.08],[side*.47,1.96,-.49],cream);box([.13,.08,.045],[side*.46,.83,1.17],0xb75a3f);}
 for(let x=-.32;x<=.33;x+=.10)box([.055,.22,.018],[x,.68,1.19],frame);
 cylinder(.045,.87,[.36,1.23,.75],frame);cylinder(.068,.05,[.36,1.68,.75],frame);
 cylinder(.085,.10,[-.39,2.28,.48],0xd9933c);
 for(const {parent,color,geos} of buckets.values()){const m=new THREE.Mesh(mergeGeometries(geos,false),new THREE.MeshStandardMaterial({color,roughness:color===rubber?.94:.72,metalness:color===steel?.3:0}));m.name=parent===carriage?'JT-25 carriage finish':'JT-25 chassis finish';m.castShadow=shadows;m.receiveShadow=true;parent.add(m);geos.forEach(g=>g.dispose());}
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
  if(ctx){ctx.fillStyle='#c5913f';ctx.fillRect(0,0,512,128);ctx.fillStyle='#263b3d';ctx.font='bold 51px sans-serif';ctx.textAlign='center';ctx.fillText('JOHANSSON',256,58);ctx.font='24px monospace';ctx.fillText('JT-25   •   DIESEL',256,102);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshStandardMaterial({map:t,roughness:.82});for(const side of [-1,1]){const badge=new THREE.Mesh(new THREE.PlaneGeometry(.67,.168),m);badge.name='Johansson Truck badge';badge.rotation.y=side*Math.PI/2;badge.position.set(side*.572,.73,.60);group.add(badge);}}
 }
 return {group,carriage,collider:{w:1.48,d:3.56,height:2.35,offsetZ:-.48}};
}
