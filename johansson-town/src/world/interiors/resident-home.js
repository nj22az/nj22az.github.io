import {householdFor} from '../../people/households.js';
import {RESIDENTS} from '../../people/residents.js';
import * as THREE from '../../../vendor/three.module.js';
import {HOME_LAYOUT,SHARED_HOME_LAYOUT,homeLayoutFor,sleepHours} from '../../people/home-life.js';
import {residentPersonality} from '../../people/resident-personalities.js';
const time=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
export function buildResidentHome({profile,room,box,reg,collider,action,exit}){
 if(householdFor(profile.name)?.residents.length>1)return buildSharedHome({profile,room,box,reg,collider,action,exit});
 const style=residentPersonality(profile.name),colour=new THREE.Color(style.top),hours=sleepHours(profile);
 const part=(size,pos,c,solid=false)=>{const m=box(size,pos,c,room,false);if(solid)collider(pos[0],pos[2],size[0],size[2],pos[1]+size[1]/2);return m;};
 part([6,.12,6],[0,-.06,0],0xc1b18a);
 for(const x of [-3,3])part([.12,2.8,6],[x,1.4,0],0xe2d7bd);
 part([6,2.8,.12],[0,1.4,-3],0xe2d7bd);part([3.8,2.8,.12],[-1.1,1.4,3],0xe2d7bd);part([.8,2.8,.12],[2.6,1.4,3],0xe2d7bd);
 for(const x of [-2,-1,0,1,2])part([.025,.012,6],[x,.006,0],0x8d9270);
 const bed=part([1.2,.18,2.15],[-1.75,.36,-.3],0xe9dfc8,true);bed.name=profile.name+' futon';
 part([1.1,.055,1.62],[-1.75,.48,-.02],colour);part([.92,.16,.48],[-1.75,.57,-.82],0xf3e8d2);
 part([1.1,.16,.65],[1.1,.66,-1.9],0x94714f,true);part([.65,.1,.6],[1.1,.36,-1.2],colour);
 part([.9,1.7,.5],[2.4,.85,-2.45],0x846749,true);
 for(let i=0;i<5;i++)part([.1,.3,.24],[2.1+i*.13,1.3,-2.15],i%2?colour:0xc7b77a);
 const radio=part([.45,.25,.23],[1.1,.86,-1.9],0x485c58);reg(radio,'Inspect '+profile.name+'’s belongings',()=>action('inspect',profile.name+' at home',profile.role+'. '+(profile.personality||'A familiar room with a place for everything.')+' A radio, favourite books and tomorrow’s notes sit beside the table.'),true);
 const note=new THREE.Object3D();note.position.set(2,1,1.9);room.add(note);reg(note,'Read daily routine',()=>action('read',profile.name+'’s routine','Usually sleeps at '+time(hours.sleep)+' and wakes at '+time(hours.wake)+'. Work, meals and walks continue outside. You may stay here while the day passes.'),true);
 const door=new THREE.Object3D();door.position.set(...HOME_LAYOUT.exit);room.add(door);reg(door,'Exit to Main Street',exit,true);
 room.add(new THREE.HemisphereLight(0xffe4b4,0x887867,1.6));
 return {...HOME_LAYOUT,home:true};
}

function buildSharedHome({profile,room,box,reg,collider,action,exit}){
 const household=householdFor(profile.name),layout=SHARED_HOME_LAYOUT;
 const part=(size,pos,color,solid=false)=>{const mesh=box(size,pos,color,room,false);if(solid)collider(pos[0],pos[2],size[0],size[2],pos[1]+size[1]/2);return mesh;};
 part([7,.12,6.8],[0,-.06,0],0xbbaa87);
 for(const side of [-1,1]){part([.12,2.8,6.8],[side*3.5,1.4,0],0xe3d8bd);part([2.85,2.8,.12],[side*2.075,1.4,3.4],0xe3d8bd);}
 part([7,2.8,.12],[0,1.4,-3.4],0xe3d8bd);
 part([1.9,.12,.7],[0,.68,1.35],0x98724e,true);
 household.residents.forEach((name,i)=>{
  const side=i?-1:1,style=residentPersonality(name),p=RESIDENTS.find(p=>p.name===name),routine=homeLayoutFor(name),x=routine.bed[0],hours=sleepHours(p);
  const bed=part([1.2,.18,2.15],[x,.36,-1.05],0xe9dfc8,true);bed.name=name+' futon';
  part([1.1,.055,1.62],[x,.48,-.77],style.top);part([.92,.16,.48],[x,.57,-1.57],0xf3e8d2);
  part([.6,.1,.6],[routine.table[0],.36,routine.table[2]],style.top);
  part([.9,1.7,.5],[-side*2.85,.85,-2.95],0x876b50,true);
  for(let b=0;b<4;b++)part([.11,.26,.22],[-side*2.85-.2+b*.13,1.14,-2.64],b%2?style.top:0xc6b78d);
  const notes=part([.28,.018,.2],[routine.table[0],.754,1.35],0xe8ddbb);notes.name=name+' personal notes';
  reg(notes,'Inspect '+name+'’s belongings',()=>action('inspect',name+' at home',p.role+'. '+name+' keeps a separate futon, wardrobe and place at the table. Usually sleeps at '+time(hours.sleep)+' and wakes at '+time(hours.wake)+'.'),true);
 });
 const door=new THREE.Object3D();door.position.set(...layout.exit);room.add(door);reg(door,'Exit to Main Street',exit,true);
 room.add(new THREE.HemisphereLight(0xffe4b4,0x887867,1.6));return {...layout,home:true};
}
