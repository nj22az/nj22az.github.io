import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {FOREST_EDGE} from './forest-edge.js';

export const BUS_STATION=Object.freeze({
 id:'bus-station',x:MAIN_ROAD.x,z:24.9,
 minX:-10.6,maxX:5.4,minZ:MAIN_ROAD.maxZ,maxZ:29.3,
 queue:Object.freeze([MAIN_ROAD.x,23.05]),
 arrival:Object.freeze([-6.1,22.45]),
 driver:Object.freeze([4.1,23.35]),
 exit:Object.freeze([MAIN_ROAD.x,FOREST_EDGE.roadEndZ]),
});
export const BUS_STATION_ROUTES=Object.freeze([
 {id:'bus-approach',width:6,surface:'asphalt',points:[[BUS_STATION.x,MAIN_ROAD.maxZ],[BUS_STATION.x,BUS_STATION.maxZ]]},
 {id:'bus-platform',width:3.8,surface:'stone',points:[[-9.7,BUS_STATION.queue[1]],[2.2,BUS_STATION.queue[1]]]},
]);

// A modest terminus closes the shopping street. The bus itself remains an
// implied off-screen service: residents walk to the queue, board, and disappear
// through the northern exit rather than being teleported to a house.
export function buildBusStation({parent,colliders,register=()=>{},onAction=()=>{},label=()=>{},shadows=false}={}){
 const group=new THREE.Group();group.name='Harbour Line bus station';parent.add(group);
 const concrete=new THREE.MeshStandardMaterial({color:0x9b9c91,roughness:.9});
 const paving=new THREE.MeshStandardMaterial({color:0xb6ad99,roughness:.94});
 const timber=new THREE.MeshStandardMaterial({color:0x625a4d,roughness:.88});
 const steel=new THREE.MeshStandardMaterial({color:0x405457,roughness:.7,metalness:.12});
 const glass=new THREE.MeshStandardMaterial({color:0x4c7074,roughness:.24,metalness:.04,transparent:true,opacity:.72,emissive:0x1a3031,emissiveIntensity:.16});
 const lampMat=new THREE.MeshStandardMaterial({color:0xe6b46b,roughness:.55,emissive:0xe6b46b,emissiveIntensity:.08});
 const lamps=[];
 const box=(size,pos,material,cast=true)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=!!(shadows&&cast);m.receiveShadow=!!shadows;group.add(m);return m;};
 const cyl=(radius,height,pos,material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,10),material);m.position.set(...pos);m.castShadow=!!shadows;m.receiveShadow=!!shadows;group.add(m);return m;};
 const anchor=(pos,text,fn)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,text,fn);return a;};

 box([BUS_STATION.maxX-BUS_STATION.minX,.06,BUS_STATION.maxZ-BUS_STATION.minZ],[(BUS_STATION.minX+BUS_STATION.maxX)/2,.03,(BUS_STATION.minZ+BUS_STATION.maxZ)/2],paving,false);
 box([BUS_STATION.maxX-BUS_STATION.minX,.13,.18],[(BUS_STATION.minX+BUS_STATION.maxX)/2,.07,BUS_STATION.minZ+.15],concrete);
 box([BUS_STATION.maxX-BUS_STATION.minX,.08,.12],[(BUS_STATION.minX+BUS_STATION.maxX)/2,.08,BUS_STATION.maxZ-.18],concrete);
 // Shelter on the east side leaves the approach and boarding line open.
 const centreZ=(BUS_STATION.minZ+BUS_STATION.maxZ)/2,shelterZ=centreZ+.45,rearZ=shelterZ+1.18;
 box([5.7,.18,2.45],[1.35,2.72,shelterZ],timber);
 box([5.55,2.45,.12],[1.35,1.38,rearZ],glass,false);
 for(const x of [-1.2,3.9]){cyl(.075,2.65,[x,1.34,BUS_STATION.queue[1]+.2],steel);cyl(.075,2.65,[x,1.34,rearZ-.08],steel);}
 box([3.15,.18,.62],[1.35,.86,centreZ+.02],timber);
 for(const x of [.15,2.55])box([.12,.72,.42],[x,.43,centreZ+.02],steel);
 colliders.push({id:'bus-station-shelter',x:1.35,z:rearZ,w:5.55,d:.24,height:2.45});
 colliders.push({id:'bus-station-bench',x:1.35,z:centreZ+.02,w:3.25,d:.7,height:.9});
 const pole=cyl(.07,2.75,[-7.9,1.38,centreZ-.35],steel);box([.95,.12,.12],[-7.9,2.75,centreZ-.35],steel);
 label('バス乗場','HARBOUR LINE TERMINAL · DEPARTURES',[-7.9,3.18,centreZ-.24],3.8,.62,0,'#e5dcc0','#3d514e',true);
 for(const x of [-7.4,4.2]){const bulb=cyl(.11,.18,[x,2.63,centreZ+.99],lampMat);lamps.push(bulb);}
 box([.08,.05,4.2],[MAIN_ROAD.x,.075,BUS_STATION.queue[1]],steel,false);
 label('港町線','SHOPPING DISTRICT → HARBOUR',[MAIN_ROAD.x,2.28,BUS_STATION.z+3.6],3.2,.46,0,'#d9d0b3','#405653');
 anchor([-7.2,1,BUS_STATION.queue[1]-.05],'Read Harbour Line timetable',()=>onAction('bus'));
 anchor([-2.7,1,BUS_STATION.queue[1]-.2],'Wait for the Harbour Line',()=>onAction('bus'));
 anchor([4.2,1,centreZ+.7],'Inspect bus station shelter',()=>onAction('inspect','Harbour Line bus station','The shelter timetable lists the shopping district, quay, and the last northern departure. The glass is marked by salt and rain.'));
 const place={id:BUS_STATION.id,title:'Harbour Line Bus Station',jp:'バス乗場',sub:'ARRIVALS · DEPARTURES',x:BUS_STATION.x,z:BUS_STATION.z,line:'The northern terminus for the shopping district and harbour service.',door:[BUS_STATION.queue[0],0,BUS_STATION.queue[1]],exitPosition:[BUS_STATION.queue[0],0,BUS_STATION.queue[1]],entryFacing:Math.PI};
 const departures=[];
 return {group,place,queue:[...BUS_STATION.queue],arrival:[...BUS_STATION.arrival],driver:[...BUS_STATION.driver],exit:[...BUS_STATION.exit],departures,
  board(name,minutes){departures.push({name,minutes});if(departures.length>24)departures.shift();},
  update(minutes=0,day=1){const night=day<.35;lamps.forEach(m=>{m.material.emissiveIntensity=night?.75:.08;});glass.emissiveIntensity=night?.3:.16;},
  pole};
}
