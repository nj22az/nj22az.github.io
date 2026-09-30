import * as THREE from '../../vendor/three.module.js';
import {windowGlow} from '../render/dusk.js';
import {KOBAN} from './koban-layout.js';
import {KOBAN_HOME_LAYOUT} from './interiors/koban.js';

/**
 * The police box on the bus plaza corner (koban-layout.js): white walls, the red lamp
 * over the door, the notice board and the white bicycle, and a lit window at the back
 * where Officer Mori lives. Its door is a home site, so it works at any hour.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';

function signTexture(lines,{w=512,h=160,bg='#f4f1ea',ink='#27304d'}={}){
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=ink;x.textAlign='center';x.textBaseline='middle';
 lines.forEach(([text,size,y])=>{x.font=`bold ${size}px ${MARU}`;x.fillText(text,w/2,y);});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildKoban(world,options){
 const group=new THREE.Group();group.name='Minato Police Box';world.group.add(group);
 const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=!!options.shadows;o.receiveShadow=true;group.add(o);return o;};
 const {x,z,w,d,height:h,face}=KOBAN,doorZ=KOBAN.door[1],west=face-.01;
 // Forecourt paving from the pavement edge, then the building on a low plinth.
 mesh(new THREE.BoxGeometry(face-5.2+.2,.06,d+.4),std(0xc9c2b0),(face+5.2)/2,.03,z,'Police box forecourt');
 mesh(new THREE.BoxGeometry(w+.12,.16,d+.12),std(0x9a968c),x,.08,z,'Police box plinth');
 mesh(new THREE.BoxGeometry(w,h,d),std(0xf1ede2),x,h/2+.16,z,'Police box walls');
 mesh(new THREE.BoxGeometry(w+.02,.5,d+.02),std(0x27304d),x,.41,z,'Police box skirting');
 mesh(new THREE.BoxGeometry(w+.35,.18,d+.35),std(0xd9d3c4),x,h+.25,z,'Police box roof');
 mesh(new THREE.BoxGeometry(w+.1,.3,.14),std(0x27304d),x,h-.05,z-d/2-.02,'Police box fascia');
 // The street face: a glass door and a window, a canopy, the sign and the red lamp.
 mesh(new THREE.BoxGeometry(.06,2.15,1.1),std(0x9fc4d6,{roughness:.15,metalness:.1}),west,1.24,doorZ,'Police box glass door');
 mesh(new THREE.BoxGeometry(.08,2.25,.08),std(0x9aa3a0),west,1.28,doorZ-.58,'Door frame');mesh(new THREE.BoxGeometry(.08,2.25,.08),std(0x9aa3a0),west,1.28,doorZ+.58,'Door frame');
 mesh(new THREE.BoxGeometry(.8,.08,1.6),std(0x27304d),face-.4,2.55,doorZ,'Police box canopy');
 const glass=[],pane=()=>{const m=new THREE.MeshStandardMaterial({color:0x9fc4d6,emissive:0xffe2a8,emissiveIntensity:0,roughness:.2});glass.push(m);return m;};
 mesh(new THREE.BoxGeometry(.06,1.0,1.4),std(0x9aa3a0),west,1.65,z-1.1,'Police box window frame');
 mesh(new THREE.PlaneGeometry(1.3,.9),pane(),west-.02,1.65,z-1.1,'Police box window').rotation.y=-Math.PI/2;
 for(let i=0;i<5;i++)mesh(new THREE.BoxGeometry(.02,.03,1.28),std(0xe8e4d8),west-.04,1.3+i*.17,z-1.1,'Window blind slat');
 const sign=mesh(new THREE.PlaneGeometry(2.6,.46),new THREE.MeshStandardMaterial({map:signTexture([['駐在所',70,62],['MINATO POLICE BOX',30,128]]),roughness:.8}),west-.02,2.95,z,'Police box sign');sign.rotation.y=-Math.PI/2;
 // The plaza side is what you see stepping off the bus: the sign again, and the red
 // lamp on the corner, where it shows up Main Street and across the plaza both.
 const south=z+d/2+.01;
 const plaza=mesh(new THREE.PlaneGeometry(2.6,.46),new THREE.MeshStandardMaterial({map:signTexture([['駐在所',70,62],['MINATO POLICE BOX',30,128]]),roughness:.8}),x-.9,2.95,south,'Police box plaza sign');void plaza;
 mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshStandardMaterial({color:0xff3b30,emissive:0xff2a1a,emissiveIntensity:1.2,roughness:.3}),face-.2,3.25,south+.2,'Red police lamp');
 mesh(new THREE.BoxGeometry(.3,.06,.3),std(0x9aa3a0),face-.1,3.0,south+.1,'Lamp bracket');
 // The notice board and the police bicycle on the forecourt.
 mesh(new THREE.BoxGeometry(.06,.9,1.2),std(0xb98a55),west-.03,1.45,z+.25,'Police notice board');
 const notice=mesh(new THREE.PlaneGeometry(1.1,.8),new THREE.MeshStandardMaterial({map:signTexture([['お知らせ',52,40],['WANTED: TAMA (CAT)',26,92],['LOST: ONE GLOVE',26,130]],{w:420,h:300,bg:'#fff8e6',ink:'#3b3f55'}),roughness:.9}),west-.07,1.45,z+.25,'Police notices');notice.rotation.y=-Math.PI/2;
 const bike=new THREE.Group();bike.name='Police bicycle';bike.position.set(face-.55,0,z-1.9);bike.rotation.y=Math.PI/2;group.add(bike);
 const frame=std(0xf4f1ea),tyre=std(0x1c1c20);
 for(const bx of [-.52,.52]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,6,20),tyre);wheel.position.set(bx,.34,0);bike.add(wheel);}
 const tube=(len,px,py,rz)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,len,6),frame);m.position.set(px,py,0);m.rotation.z=rz;bike.add(m);};
 tube(.9,0,.55,Math.PI/2);tube(.5,-.3,.55,.6);tube(.55,.35,.55,-.5);tube(.35,.5,.8,0);
 const basket=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.3),std(0x9aa3a0));basket.position.set(.62,.95,0);bike.add(basket);
 const box=new THREE.Mesh(new THREE.BoxGeometry(.32,.26,.26),std(0xf4f1ea));box.position.set(-.5,.82,0);bike.add(box);
 // The back of the house: Officer Mori's window, an air conditioner, a potted plant.
 mesh(new THREE.PlaneGeometry(1.2,.9),pane(),x+1.2,1.7,z+d/2+.01,'Officer Mori window');
 mesh(new THREE.BoxGeometry(.7,.45,.28),std(0xe8e4d8),x+w/2+.16,.5,z+.9,'Air conditioner');
 mesh(new THREE.CylinderGeometry(.2,.16,.32,10),std(0xb95c3c),face-.35,.16,z+1.55,'Plant pot');
 mesh(new THREE.SphereGeometry(.3,8,6),std(0x3f8f46),face-.35,.55,z+1.55,'Plant');
 world.colliders.push({x,z,w:w+.12,d:d+.12,height:h+.5,id:'koban'},{x:face-.55,z:z-1.9,w:.5,d:1.4,height:1.1,id:'koban-bicycle'});
 const inspect=(pos,label,title,text)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);options.register?.(a,label,()=>options.onAction?.('read',title,text));};
 inspect([face-.3,1.4,z+.25],'Read the police notices','Police box notices','WANTED: Tama, a ginger cat, for sleeping in the fish crates at the quay. LOST: one glove, left hand. The officer is on patrol from 22:00; in an emergency, use the telephone by the door.');
 inspect([face-1.1,1,z-1.9],'Inspect the police bicycle','Police bicycle','A white bicycle with a lamp, a basket and a lockable box on the carrier. Officer Mori rides it to the quay and back on the night patrol, when the streets are too quiet for the siren he does not have.');

 // The home site: its door, who lives there, and the heading you walk in with.
 let site=options.sites.find(s=>s.id===KOBAN.id);
 if(!site){site={id:KOBAN.id,jp:KOBAN.jp,sub:'MINATO POLICE',color:0xf1ede2,accent:'#27304d'};options.sites.push(site);}
 Object.assign(site,{title:KOBAN.title,line:KOBAN.address,homeOwner:KOBAN.resident,homeOwners:[KOBAN.resident],ownRoom:true,
  homeLayouts:{[KOBAN.resident]:KOBAN_HOME_LAYOUT},door:[KOBAN.door[0],.02,KOBAN.door[1]],entryFacing:KOBAN.inward,x:KOBAN.door[0],z:KOBAN.door[1]});
 site.exitPosition=[...site.door];
 const homes=world.homes instanceof Map?world.homes:new Map();
 homes.set(KOBAN.resident,{owner:KOBAN.resident,household:KOBAN.id,address:KOBAN.address,door:[...KOBAN.door],building:'koban',occupied:false});
 world.homes=homes;
 const anchor=new THREE.Object3D();anchor.name='police box entrance';anchor.position.set(face-.3,1.3,doorZ);group.add(anchor);
 options.register?.(anchor,'Enter '+KOBAN.title,()=>options.enter(site));
 const previous=world.updateHomes;
 world.updateHomes=minutes=>{previous?.(minutes);const glow=windowGlow(minutes);for(const m of glass)m.emissiveIntensity=glow*.7;};
 return group;
}
