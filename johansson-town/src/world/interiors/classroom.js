import * as THREE from '../../../vendor/three.module.js';
import {batchStaticProps} from '../../render/static-props.js';
import {daylight} from '../../render/dusk.js';
import {hanaBlockMaterial,hanaScreen} from '../school.js';
import {buildFigure,setPose,animateFigure} from '../../people/school-kids.js';
import {CHIME_TIMES,playSchoolChime} from '../../audio/school-chime.js';
import {townCalendarAt} from '../../town-clock.js';

/**
 * The 5・6年 classroom at Minato school, upstairs on the sea side.
 *
 * Twelve pupils in a combined fifth-and-sixth-grade class, which is what a school of
 * thirty-one children has. The room follows the school day: lessons in rows facing the
 * board; at 12:20 the chime, the desks pushed into han of four, the lunch squad in white
 * smocks ladling out of aluminium cauldrons at the front, いただきます, and the teacher
 * eating what they eat; then the desks shoved to the back for sōji; afternoon lessons;
 * the sata andagi club at the pantry after school; chairs up on the desks at the end of
 * the day.
 *
 * The pantry along the back wall is the class's own: a sink, two gas rings, the rice
 * cooker, the kettle, the tray shelves, and the lunch trolley parked beside it.
 *
 * Room frame: the blackboard is at +x, the sea windows at -z, the corridor and its two
 * sliding doors at +z. You come in by the back door, facing the windows.
 */
export const CLASSROOM=Object.freeze({
 bounds:{minX:-4.28,maxX:4.3,minZ:-3.42,maxZ:3.42},
 spawn:[-3.35,0,2.95],yaw:0,exit:[-3.35,1.1,3.35],
 walls:{minX:-4.5,maxX:4.5,minZ:-3.6,maxZ:3.6,height:3},
});
const W=CLASSROOM.walls;
const TEACHER='与那嶺先生',TEACHER_EN='Yonamine-sensei';

/** Where the day is, by the clock and the day of the week. */
export function schoolPhase(minutes,weekday=1){
 const m=((minutes%1440)+1440)%1440;
 if(weekday===0||weekday===6)return m>=450&&m<1080?'weekend':'closed';
 if(m<450)return 'closed';
 if(m<505)return 'morning';
 if(m<740)return 'lesson';
 if(m<750)return 'serving';
 if(m<775)return 'lunch';
 if(m<795)return 'cleaning';
 if(m<930)return 'lesson-pm';
 if(m<1000)return 'club';
 if(m<1080)return 'after';
 return 'closed';
}

/**
 * A week of kyūshoku, Okinawan style: champuru and sōki-jiru, fried aji off the co-op's
 * boats, Okinawa soba on Fridays, and a bottle of milk every day.
 */
export const KYUSHOKU_MENUS=Object.freeze([
 {day:'月',staple:'rice',main:'goya',soup:'soki',jp:['ごはん','ゴーヤーチャンプルー','ソーキ汁','牛乳'],en:'rice, goya champuru, sōki-jiru pork-rib soup and milk'},
 {day:'火',staple:'bread',main:'aji',soup:'veg',jp:['コッペパン','あじフライ','野菜スープ','牛乳'],en:'a koppepan roll, fried horse mackerel from the co-op, vegetable soup and milk'},
 {day:'水',staple:'juushii',main:'imo',soup:'miso',jp:['ジューシー','紅いもてんぷら','イナムドゥチ','牛乳'],en:'jūshī rice, purple sweet-potato tempura, inamuduchi miso soup and milk'},
 {day:'木',staple:'rice',main:'fish',soup:'mozuku',jp:['ごはん','魚の煮付け','もずくスープ','牛乳'],en:'rice, simmered reef fish, mozuku seaweed soup and milk'},
 {day:'金',staple:'soba',main:'salad',soup:null,jp:['沖縄そば','紅いもサラダ','牛乳'],en:'Okinawa soba, purple sweet-potato salad and milk'},
]);
export const menuForWeekday=weekday=>KYUSHOKU_MENUS[Math.min(4,Math.max(0,weekday-1))];

const mats=new Map();
const mat=(hex,rough=.8,extra={})=>{const key=hex+':'+rough+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color:hex,roughness:rough,...extra}));return mats.get(key);};
function canvasTexture(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');draw(ctx,width,height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.userData.canvas=c;return t;
}
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
const SERIF='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const HAND='"Klee","Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';

const PUPILS=[
 ['金城 ゆい',true,0xe98c9a,0x2d3a52,0x3f6fb0],['比嘉 けんた',false,0x3f7fc0,0x2c2f36,0x3f6fb0],['大城 さくら',true,0xf2d57e,0x4a5f8a,0xc2453b],
 ['宮城 だいき',false,0x4f9a6a,0x2d3a52,0xc2453b],['玉城 みゆ',true,0xb99ad8,0x2c2f36,0x3f6fb0],['新垣 りょう',false,0xe0e0dc,0x3b4a62,0xc2453b],
 ['島袋 あや',true,0x7fc6c9,0x2d3a52,0x3f6fb0],['仲宗根 たく',false,0xd9723c,0x2c2f36,0xc2453b],['上原 ななみ',true,0xf4f1ea,0x8a3a45,0x3f6fb0],
 ['知念 しょう',false,0x2f4f8a,0x55504a,0xc2453b],['平良 まい',true,0xf3a65a,0x2d3a52,0x3f6fb0],['当山 ゆうと',false,0x8a2f3a,0x2c2f36,0xc2453b],
];
const HAIRS=[0x1b1512,0x231a14,0x16110e,0x2a1e16];
const SKINS=[0xd9a57c,0xcf9870,0xe0b089,0xc98f66];
/** The lunch squad this week. */
const DUTY=[0,5,10];

/** Desk positions: [x, z, facing(+1 = toward the board, -1 = away, 'n'/'s' sideways)]. */
const ROWS=[];for(const x of [2.0,.85,-.3])for(const z of [-2.4,-.8,.8,2.4])ROWS.push([x,z,1]);
const HAN_CENTRES=[[1.55,-1.95],[1.55,1.75],[-1.15,-.1]];
const HAN=[];for(const [hx,hz] of HAN_CENTRES)for(const [dx,dz,f] of [[.225,-.33,-1],[.225,.33,-1],[-.225,-.33,1],[-.225,.33,1]])HAN.push([hx+dx,hz+dz,f]);
const STACK=[];for(const x of [-1.2,-1.72,-2.24])for(const z of [-2.1,-1.35,-.6,.15])STACK.push([x,z,1]);

export function buildClassroom({room,reg,action,exit,calendar=minutes=>townCalendarAt(minutes)}){
 room.name='Minato school 5・6年 classroom';
 const colliders=[];
 const rect=(x,z,w,d,height=1)=>{const c={x,z,w,d,height,minY:0};colliders.push(c);return c;};
 const box=(size,pos,m,parent=room,name='',still=true)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(...size),m);b.position.set(...pos);b.receiveShadow=true;b.castShadow=true;if(still)b.userData.staticProp=true;if(name)b.name=name;parent.add(b);return b;};
 const cyl=(r,h,pos,m,parent=room,seg=16,still=true)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);c.position.set(...pos);c.castShadow=true;if(still)c.userData.staticProp=true;parent.add(c);return c;};
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);room.add(o);reg(o,label,fn,true);return o;};

 // ------------------------------------------------------------------ shell
 const floorTex=canvasTexture(512,512,(ctx,w,h)=>{
  for(let i=0;i<16;i++){const tone=150+((i*53)%24)-12;ctx.fillStyle=`rgb(${tone},${tone*.72|0},${tone*.48|0})`;ctx.fillRect(0,i*32,w,32);ctx.fillStyle='rgba(40,26,14,.5)';ctx.fillRect(0,i*32,w,1.5);
   for(let k=0;k<40;k++){ctx.fillStyle=`rgba(60,38,20,${.05+Math.random()*.08})`;ctx.fillRect(Math.random()*w,i*32+Math.random()*30,20+Math.random()*80,1);}
   const joint=(i*97)%w;ctx.fillStyle='rgba(40,26,14,.5)';ctx.fillRect(joint,i*32,1.5,32);}
 });
 floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(2.2,2.2);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(W.maxX-W.minX,W.maxZ-W.minZ),new THREE.MeshStandardMaterial({map:floorTex,roughness:.55}));
 floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.name='Classroom floor';room.add(floor);
 const paint=mat(0xe6e2d4,.92),wainscot=mat(0x9fb8a6,.85),ceilingM=mat(0xf0eee6,.95),alu=mat(0xb9bcb8,.35,{metalness:.5}),wood=mat(0x8a6541,.7),darkWood=mat(0x5a4029,.75);
 const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(W.maxX-W.minX,W.maxZ-W.minZ),ceilingM);ceiling.rotation.x=Math.PI/2;ceiling.position.y=W.height;room.add(ceiling);
 // Ceiling tile grid.
 for(let x=W.minX+.9;x<W.maxX;x+=.9)box([.02,.01,W.maxZ-W.minZ],[x,W.height-.006,0],mat(0xd9d6cb,.95));
 // Front and back walls.
 for(const x of [W.maxX,W.minX]){
  const s=Math.sign(x);
  box([.2,W.height,W.maxZ-W.minZ+.4],[x+s*.1,W.height/2,0],paint);
  box([.02,.9,W.maxZ-W.minZ],[x-s*.01,.45,0],wainscot);
  box([.03,.06,W.maxZ-W.minZ],[x-s*.02,.92,0],darkWood);
 }
 // The sea wall: solid below the sill and above the head, four bays of window between.
 const sill=.85,head=2.62;
 box([W.maxX-W.minX+.4,sill,.2],[0,sill/2,W.minZ-.1],paint);
 box([W.maxX-W.minX,.02,.02],[0,.9,W.minZ+.012],darkWood);
 box([W.maxX-W.minX,.9-.02,.015],[0,.45,W.minZ+.008],wainscot);
 box([W.maxX-W.minX+.4,W.height-head,.2],[0,(W.height+head)/2,W.minZ-.1],paint);
 box([W.maxX-W.minX,.05,.28],[0,sill+.025,W.minZ+.04],mat(0xd8d3c2,.6),room,'Window sill');
 const bayXs=[-4.5,-2.25,0,2.25,4.5];
 for(const x of bayXs)box([.14,head-sill,.22],[x,(sill+head)/2,W.minZ-.1],alu);
 box([W.maxX-W.minX,.06,.12],[0,head,W.minZ-.05],alu);box([W.maxX-W.minX,.06,.12],[0,sill+.03,W.minZ-.05],alu);
 const glass=new THREE.MeshStandardMaterial({color:0xcfe6ea,roughness:.05,metalness:.1,transparent:true,opacity:.14,depthWrite:false});
 // Half of each bay slid open to the breeze, the other half glazed in its sash.
 bayXs.slice(0,-1).forEach((x0,i)=>{
  const open=i%2?'left':'right',w=2.25,paneW=w/2-.04,px=open==='left'?x0+w*.75:x0+w*.25;
  for(const [dz,px2] of [[-.02,px],[-.08,open==='left'?px-.06:px+.06]]){
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(paneW,head-sill-.08),glass);pane.position.set(px2,(sill+head)/2,W.minZ+dz);room.add(pane);
   for(const ex of [-paneW/2,paneW/2])box([.04,head-sill-.04,.04],[px2+ex,(sill+head)/2,W.minZ+dz],alu);
   box([paneW,.04,.04],[px2,sill+.06,W.minZ+dz],alu);box([paneW,.04,.04],[px2,head-.06,W.minZ+dz],alu);
   box([.018,.1,.03],[px2+(open==='left'?-paneW/2+.06:paneW/2-.06),1.55,W.minZ+dz+.03],alu);
  }
 });
 // The corridor wall: two sliding doors, windows between, a transom over all of it.
 const doors=[[-3.35,true],[3.35,false]];   // [x, open]
 const corridorZ=W.maxZ;
 const segs=[[W.minX,-3.95],[-2.75,2.75],[3.95,W.maxX]];
 for(const [a,b] of segs){
  box([b-a,.9,.18],[(a+b)/2,.45,corridorZ+.09],paint);
  box([b-a,.9,.015],[(a+b)/2,.45,corridorZ-.008],wainscot);
  if(b-a>1){
   box([b-a,.05,.2],[(a+b)/2,.925,corridorZ+.09],alu);box([b-a,.05,.2],[(a+b)/2,2.0,corridorZ+.09],alu);
   for(let x=a;x<=b+.01;x+=(b-a)/Math.max(1,Math.round((b-a)/1.35)))box([.05,1.1,.2],[x,1.46,corridorZ+.09],alu);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(b-a,1.05),glass);pane.position.set((a+b)/2,1.46,corridorZ+.06);room.add(pane);
  }else box([b-a,1.1,.18],[(a+b)/2,1.45,corridorZ+.09],paint);
 }
 box([W.maxX-W.minX,.2,.18],[0,2.1,corridorZ+.09],paint);
 box([W.maxX-W.minX,.05,.2],[0,2.2,corridorZ+.09],alu);box([W.maxX-W.minX,.05,.2],[0,2.72,corridorZ+.09],alu);
 const transom=new THREE.Mesh(new THREE.PlaneGeometry(W.maxX-W.minX,.47),glass);transom.position.set(0,2.46,corridorZ+.06);room.add(transom);
 box([W.maxX-W.minX,W.height-2.74,.18],[0,(W.height+2.74)/2,corridorZ+.09],paint);
 for(const [dx,open] of doors){
  box([1.2,.04,.2],[dx,2.08,corridorZ+.09],alu);
  // The door leaf: grey-green steel, a window at eye height. The back one is open.
  const leaf=new THREE.Group();leaf.position.set(dx+(open?-.95:0),0,corridorZ+(open?.16:.06));room.add(leaf);
  box([1.1,2.06,.04],[0,1.03,0],mat(0x6f8a7c,.6),leaf);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(.7,.55),glass);pane.position.set(0,1.55,-.025);leaf.add(pane);
  box([.03,.2,.05],[.46,1.0,-.03],alu,leaf);
  if(!open)rect(dx,corridorZ-.02,1.2,.12,2.1);
 }
 // Room plate over the back door, inside as well as out.
 const plateTex=canvasTexture(256,80,(ctx,w,h)=>{ctx.fillStyle='#f3f0e4';ctx.fillRect(0,0,w,h);ctx.fillStyle='#23302a';ctx.font=`bold 44px ${GOTHIC}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('5・6年',w/2,h/2+2);});
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(.6,.19),new THREE.MeshStandardMaterial({map:plateTex}));plate.position.set(-3.35,2.4,corridorZ-.01);plate.rotation.y=Math.PI;room.add(plate);

 // ------------------------------------------------------------------ outside
 // The corridor beyond the doors, the hana-block balustrade, the field and the town.
 const corridor=new THREE.Group();corridor.name='Classroom corridor';room.add(corridor);
 box([12,.02,2.4],[0,-.01,corridorZ+1.4],mat(0xa8a69a,.9),corridor);
 box([12,.1,2.6],[0,W.height+.05,corridorZ+1.3],mat(0xcac7b9,.95),corridor);
 box([12,.35,.2],[0,.175,corridorZ+2.5],mat(0xefece2,.9),corridor);
 const hana=hanaBlockMaterial();
 for(const [a,b] of [[-6,-2.9],[-2.5,.7],[1.1,4.3],[4.7,6]])hanaScreen(corridor,hana,a,b,.35,1.15,corridorZ+2.5);
 for(const x of [-2.7,.9,4.5])box([.4,W.height,.4],[x,W.height/2,corridorZ+2.5],mat(0xe4e1d3,.92),corridor);
 box([12,.45,.22],[0,W.height-.2,corridorZ+2.5],mat(0xe4e1d3,.92),corridor);
 const fieldView=canvasTexture(1400,600,(ctx,w,h)=>{
  const sky=ctx.createLinearGradient(0,0,0,h*.55);sky.addColorStop(0,'#8fc4e6');sky.addColorStop(1,'#d8ecf2');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(let i=0;i<7;i++){ctx.fillStyle='rgba(255,255,255,.85)';const x=i*230+40,y=70+(i%3)*30;for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(x+k*28,y-(k%2)*16,34-(k%3)*6,0,Math.PI*2);ctx.fill();}}
  // Headland, town roofs, the park mound, fukugi, the field.
  ctx.fillStyle='#5f7a4c';ctx.beginPath();ctx.moveTo(0,h*.52);ctx.quadraticCurveTo(w*.2,h*.26,w*.38,h*.5);ctx.lineTo(0,h*.6);ctx.fill();
  for(let i=0;i<22;i++){ctx.fillStyle=['#9c8e7a','#b3a48a','#7b6f62','#c9b79a'][i%4];const x=w*.35+i*38,y=h*.5-((i*17)%25);ctx.fillRect(x,y,34,h*.58-y);}
  ctx.fillStyle='#6f9a5a';ctx.beginPath();ctx.ellipse(w*.72,h*.56,w*.14,h*.1,0,Math.PI,0);ctx.fill();
  for(let i=0;i<30;i++){ctx.fillStyle=i%2?'#2f5a31':'#3b6a3a';ctx.beginPath();ctx.ellipse(i*50+10,h*.62,26,50+(i%3)*10,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#b98a63';ctx.fillRect(0,h*.68,w,h*.32);ctx.fillStyle='#d6ccae';ctx.fillRect(0,h*.88,w,h*.12);
  ctx.strokeStyle='rgba(247,244,232,.8)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(w*.5,h*.8,w*.4,h*.06,0,0,Math.PI*2);ctx.stroke();
 });
 const fieldPlane=new THREE.Mesh(new THREE.PlaneGeometry(40,17),new THREE.MeshBasicMaterial({map:fieldView}));
 fieldPlane.position.set(0,-2.6,corridorZ+16);fieldPlane.rotation.y=Math.PI;corridor.add(fieldPlane);

 // The sea side: the sunshade just outside, then the reef, the tetrapods and the sky.
 box([W.maxX-W.minX+2,.13,.75],[0,2.86,W.minZ-.58],mat(0xcac7b9,.95));
 const seaView=canvasTexture(1600,900,(ctx,w,h)=>{
  const horizon=h*.46;
  const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#6fb2e0');sky.addColorStop(1,'#cfe7f1');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon);
  for(let i=0;i<9;i++){const x=(i*211)%w,y=90+(i%4)*55,s=.7+(i%3)*.3;ctx.fillStyle='rgba(255,255,255,.9)';for(let k=0;k<6;k++){ctx.beginPath();ctx.arc(x+k*30*s,y-(k%2)*18*s,(38-(k%3)*8)*s,0,Math.PI*2);ctx.fill();}ctx.fillStyle='rgba(200,214,226,.7)';ctx.fillRect(x-20*s,y+10*s,200*s,16*s);}
  ctx.fillStyle='#4f7d86';ctx.beginPath();ctx.moveTo(w*.62,horizon);ctx.quadraticCurveTo(w*.7,horizon-26,w*.8,horizon-8);ctx.lineTo(w*.86,horizon);ctx.fill();
  const sea=ctx.createLinearGradient(0,horizon,0,h*.8);sea.addColorStop(0,'#1d5f8c');sea.addColorStop(.45,'#2a86a6');sea.addColorStop(.8,'#5cc4c0');sea.addColorStop(1,'#8fd8c6');
  ctx.fillStyle=sea;ctx.fillRect(0,horizon,w,h*.8-horizon);
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=3;for(let i=0;i<40;i++){const y=horizon+30+Math.random()*120,x=Math.random()*w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30+Math.random()*40,y);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<60;i++)ctx.fillRect(Math.random()*w,h*.6+Math.random()*10,12+Math.random()*30,3);
  // A fishing boat heading in.
  ctx.fillStyle='#f2efe6';ctx.fillRect(w*.3,horizon+48,70,14);ctx.fillStyle='#3a6ea5';ctx.fillRect(w*.3+40,horizon+34,22,16);
  // The seawall and the tetrapods piled against it.
  ctx.fillStyle='#9d9a8f';for(let i=0;i<46;i++){const x=i*36+Math.random()*10,y=h*.8+Math.random()*20;ctx.save();ctx.translate(x,y);ctx.rotate(Math.random()*3);ctx.fillRect(-26,-8,52,16);ctx.fillRect(-8,-26,16,52);ctx.restore();}
  ctx.fillStyle='#bdb8aa';ctx.fillRect(0,h*.86,w,h*.14);ctx.fillStyle='#8b877c';ctx.fillRect(0,h*.86,w,6);
 });
 const seaPlane=new THREE.Mesh(new THREE.PlaneGeometry(34,19),new THREE.MeshBasicMaterial({map:seaView}));
 seaPlane.position.set(0,-.2,W.minZ-11);room.add(seaPlane);

 // ------------------------------------------------------------------ front of the room
 const boardTex=canvasTexture(1400,380,()=>{});
 const board=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.25),new THREE.MeshStandardMaterial({map:boardTex,roughness:.9}));
 board.position.set(W.maxX-.06,1.5,-.2);board.rotation.y=-Math.PI/2;board.name='Blackboard';room.add(board);
 box([.05,1.37,4.72],[W.maxX-.03,1.5,-.2],darkWood);
 box([.14,.04,4.6],[W.maxX-.09,.86,-.2],darkWood,room,'Chalk tray');
 for(let i=0;i<5;i++)box([.012,.012,.08],[W.maxX-.1,.885,-1.8+i*.12],mat([0xf6f4ec,0xf6f4ec,0xf0d65a,0xe79aa5,0xf6f4ec][i],.9));
 box([.06,.05,.14],[W.maxX-.1,.9,1.2],mat(0x3c5a86,.8),room,'Board eraser');
 // The motto, the clock, and the class goal over the board.
 const motto=canvasTexture(900,160,(ctx,w,h)=>{ctx.fillStyle='#f4efe0';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#6d5335';ctx.lineWidth=10;ctx.strokeRect(5,5,w-10,h-10);ctx.fillStyle='#1b1b1b';ctx.font=`bold 76px ${SERIF}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('明るく　正しく　たくましく',w/2,h/2+4,w-60);});
 const mottoMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.34),new THREE.MeshStandardMaterial({map:motto}));mottoMesh.position.set(W.maxX-.02,2.62,-1.25);mottoMesh.rotation.y=-Math.PI/2;room.add(mottoMesh);
 const clockTex=canvasTexture(256,256,(ctx,w,h)=>{ctx.fillStyle='#f7f5ee';ctx.beginPath();ctx.arc(128,128,122,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.font=`bold 30px ${GOTHIC}`;ctx.textAlign='center';ctx.textBaseline='middle';for(let i=1;i<=12;i++){const a=i/12*Math.PI*2;ctx.fillText(String(i),128+Math.sin(a)*96,128-Math.cos(a)*96);}});
 const clockFace=new THREE.Mesh(new THREE.CircleGeometry(.2,32),new THREE.MeshStandardMaterial({map:clockTex}));clockFace.position.set(W.maxX-.03,2.62,1.05);clockFace.rotation.y=-Math.PI/2;room.add(clockFace);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.205,.018,8,32),mat(0x3a3a3a,.4));rim.position.copy(clockFace.position);rim.rotation.y=-Math.PI/2;room.add(rim);
 const handM=mat(0x1a1a1a,.5),hourHand=new THREE.Group(),minuteHand=new THREE.Group();
 for(const [g,len,wd] of [[hourHand,.11,.016],[minuteHand,.16,.01]]){g.position.set(W.maxX-.05,2.62,1.05);g.rotation.y=-Math.PI/2;const b=new THREE.Mesh(new THREE.BoxGeometry(wd,len,.006),handM);b.position.y=len/2-.02;g.add(b);room.add(g);}
 // The kyōdan the teacher stands on, and the teacher's desk in the window corner.
 box([1.25,.14,4.4],[W.maxX-.62,.07,-.2],mat(0x7a5a3a,.7),room,'Kyōdan');
 box([.6,.05,1.2],[3.3,.74,-2.8],mat(0x8f938b,.5,{metalness:.3}),room,'Teacher desk');
 box([.56,.7,.4],[3.3,.37,-3.2],mat(0x7b8079,.55,{metalness:.3}));box([.56,.7,.04],[3.3,.37,-2.22],mat(0x7b8079,.55,{metalness:.3}));
 box([.32,.04,.42],[3.3,.78,-2.9],mat(0x2d5a8c,.8),room,'Attendance book');
 box([.22,.1,.22],[3.3,.81,-2.45],mat(0x5a6e5a,.6),room,'Pen pot');
 rect(3.3,-2.8,.65,1.3,.8);
 // The class TV, high in the window corner on its ceiling bracket, and the VHS deck.
 const tv=new THREE.Group();tv.position.set(3.95,2.32,-2.95);tv.rotation.y=-Math.PI*.78;room.add(tv);
 box([.03,.6,.03],[0,.42,0],alu,tv);box([.6,.03,.5],[0,.12,0],alu,tv);
 box([.62,.48,.5],[0,-.14,0],mat(0x3a3b3c,.5),tv,'Classroom TV');
 box([.42,.08,.34],[0,.17,.02],mat(0x2a2b2c,.5),tv,'VHS deck');
 const screenTex=canvasTexture(320,240,(ctx,w,h)=>{ctx.fillStyle='#1b2226';ctx.fillRect(0,0,w,h);});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.48,.36),new THREE.MeshBasicMaterial({map:screenTex}));screen.position.set(0,-.14,.252);tv.add(screen);
 // Ceiling lights: fluorescent tubes in pairs.
 const tubeM=new THREE.MeshStandardMaterial({color:0xf7f7f2,emissive:0xf4f6ee,emissiveIntensity:1});
 for(const x of [-2.6,0,2.6])for(const z of [-1.6,1.6]){box([1.25,.06,.18],[x,W.height-.05,z],mat(0xe8e6de,.6));for(const dz of [-.04,.04]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.2,8),tubeM);t.rotation.z=Math.PI/2;t.position.set(x,W.height-.1,z+dz);room.add(t);}}
 // Ceiling fans: white, three-bladed, a slow wobble in them.
 const fans=[];
 for(const [x,z] of [[-1.35,0],[1.65,0]]){
  const fan=new THREE.Group();fan.position.set(x,W.height,z);room.add(fan);
  cyl(.03,.42,[0,-.21,0],mat(0xf2f1ea,.5),fan,8,false);
  const rotor=new THREE.Group();rotor.position.y=-.45;fan.add(rotor);
  cyl(.1,.1,[0,0,0],mat(0xf2f1ea,.5),rotor,16,false);
  for(let k=0;k<3;k++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.62,.012,.13),mat(0xefeee6,.55));blade.position.set(Math.cos(k*Math.PI*2/3)*.38,0,Math.sin(k*Math.PI*2/3)*.38);blade.rotation.y=-k*Math.PI*2/3;blade.rotation.x=.12;rotor.add(blade);}
  fans.push(rotor);
 }
 // Canvas curtains bunched at the window posts, stirring in the breeze.
 const curtainM=new THREE.MeshStandardMaterial({color:0xe2d7b9,roughness:.95,side:THREE.DoubleSide,transparent:true,opacity:.92});
 const curtains=[];
 for(const x of [-4.2,-2.5,-2.0,.25,2.0,2.5,4.2]){
  const geo=new THREE.PlaneGeometry(.42,head-sill+.1,3,8);const c=new THREE.Mesh(geo,curtainM);c.position.set(x,(sill+head)/2+.05,W.minZ+.14);room.add(c);
  curtains.push({mesh:c,base:Float32Array.from(geo.attributes.position.array),seed:x});
 }
 box([W.maxX-W.minX,.03,.03],[0,head+.08,W.minZ+.14],alu,room,'Curtain rail');

 // ------------------------------------------------------------------ back of the room
 // Cubbies with randoseru and satchels; the class board over them.
 const cubbyX=W.minX+.2;
 box([.4,1.08,3.9],[cubbyX,.54,1.45],mat(0x9a7852,.7),room,'Cubbies');
 const bagColours=[0x8a1f24,0x1c1c1c,0x8a1f24,0x1c1c1c,0xb3542f,0x1c1c1c,0x8a1f24,0x3a4f7a,0x8a1f24,0x1c1c1c,0x6b4a2b,0x1c1c1c,0x8a1f24,0x1c1c1c];
 for(let r=0;r<2;r++)for(let c=0;c<7;c++){
  const z=1.45-1.95+.28+c*.556,y=.3+r*.5;
  box([.36,.44,.5],[cubbyX+.02,y,z],mat(0x6e5234,.75));
  box([.02,.4,.48],[cubbyX+.21,y,z],mat(0x3a2a1a,.9));
  if((r*7+c)%9!==4){box([.26,.3,.3],[cubbyX+.1,y-.02,z],mat(bagColours[(r*7+c)%bagColours.length],.45));box([.27,.12,.31],[cubbyX+.1,y+.1,z],mat(bagColours[(r*7+c)%bagColours.length],.4));}
 }
 rect(cubbyX,1.45,.45,3.95,1.1);
 const classBoard=canvasTexture(1400,520,(ctx,w,h)=>{
  ctx.fillStyle='#b99b72';ctx.fillRect(0,0,w,h);ctx.fillStyle='#caa97c';ctx.fillRect(10,10,w-20,h-20);
  ctx.fillStyle='#fff7e6';ctx.fillRect(40,24,w-80,70);ctx.fillStyle='#b3382c';ctx.font=`bold 50px ${HAND}`;ctx.textAlign='center';ctx.fillText('みんな なかよく　げんきに あいさつ',w/2,76);
  const shuji=['海','夢','友','空','風','心','光','波'];
  shuji.forEach((k,i)=>{const x=40+i*108,y=120;ctx.fillStyle='#f6f3ea';ctx.fillRect(x,y,96,170);ctx.fillStyle='#111';ctx.font=`bold 84px ${SERIF}`;ctx.fillText(k,x+48,y+100);ctx.font=`16px ${GOTHIC}`;ctx.fillText(PUPILS[i][0].split(' ')[1],x+48,y+158);ctx.strokeStyle='#d33';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+72,y+26,14,0,Math.PI*2);ctx.stroke();});
  ctx.fillStyle='#f4efdf';ctx.fillRect(920,120,420,170);ctx.fillStyle='#2a2520';ctx.font=`bold 28px ${HAND}`;ctx.fillText('ハーリーのおもいで',1130,160);ctx.font=`18px ${HAND}`;['ぼくは　おじいと　ふねに　のった。','うみが　きらきら　ひかって','みんなで　こいで　かった。　比嘉けんた'].forEach((l,i)=>ctx.fillText(l,1130,200+i*28));
  // The cleaning rota: a paper wheel with the groups round it.
  ctx.save();ctx.translate(200,410);ctx.fillStyle='#fdfbf4';ctx.beginPath();ctx.arc(0,0,92,0,Math.PI*2);ctx.fill();
  ['きょうしつ','ろうか','まど','トイレ','こくばん','くつばこ'].forEach((t,i)=>{ctx.save();ctx.rotate(i/6*Math.PI*2);ctx.strokeStyle='#999';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-92);ctx.stroke();ctx.rotate(Math.PI/6);ctx.fillStyle='#223';ctx.font=`14px ${GOTHIC}`;ctx.fillText(t,0,-62);ctx.restore();});
  ctx.restore();ctx.fillStyle='#2a2520';ctx.font=`bold 22px ${HAND}`;ctx.fillText('そうじ当番',200,300);
  ctx.fillStyle='#e8f3ff';ctx.fillRect(360,320,520,170);ctx.fillStyle='#223';ctx.font=`bold 26px ${HAND}`;ctx.fillText('夏休み　自由研究',620,356);ctx.font=`18px ${HAND}`;['・リーフの　生きもの しらべ（宮城）','・サーターアンダギーの つくりかた（大城）','・台風の　記録（仲宗根）'].forEach((l,i)=>ctx.fillText(l,620,392+i*30));
  ctx.fillStyle='#fff3c8';ctx.fillRect(920,320,420,170);ctx.fillStyle='#223';ctx.font=`bold 26px ${HAND}`;ctx.fillText('きゅうしょく当番',1130,356);ctx.font=`18px ${HAND}`;ctx.fillText('金城・新垣・平良',1130,398);ctx.fillText('白衣・ぼうし・マスク　わすれずに',1130,432);
 });
 const classBoardMesh=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.56),new THREE.MeshStandardMaterial({map:classBoard,roughness:.9}));
 classBoardMesh.position.set(W.minX+.06,1.95,.6);classBoardMesh.rotation.y=Math.PI/2;classBoardMesh.name='Class board';room.add(classBoardMesh);
 box([.04,1.64,4.28],[W.minX+.02,1.95,.6],darkWood);

 // The pantry: counter, sink, gas rings, rice cooker, kettle, shelves, the trolley.
 const steel=mat(0xc4c8c5,.3,{metalness:.7}),white=mat(0xf2f0ea,.5),cream=mat(0xeee3c8,.6);
 const P={x:W.minX+.33,z0:-3.45,z1:-1.2};const pz=(P.z0+P.z1)/2,pl=P.z1-P.z0;
 box([.6,.84,pl],[P.x,.42,pz],mat(0xd9d4c4,.7),room,'Pantry cupboards');
 for(let z=P.z0+.02;z<P.z1;z+=.56)box([.01,.7,.52],[P.x+.305,.42,z+.27],mat(0xc8c2b0,.7));
 box([.64,.04,pl+.02],[P.x,.86,pz],steel,room,'Pantry worktop');
 box([.4,.02,.5],[P.x+.02,.87,-3.0],mat(0x9aa09c,.3,{metalness:.7}),room,'Sink');
 cyl(.015,.28,[P.x-.2,1.0,-3.0],steel);box([.18,.02,.02],[P.x-.12,1.13,-3.0],steel);
 // The two-ring gas table and the andagi pot and the kettle on it.
 box([.42,.1,.62],[P.x+.02,.93,-2.2],mat(0x4a4d4f,.5),room,'Gas rings');
 for(const dz of [-.15,.15])box([.16,.012,.16],[P.x+.02,.985,-2.2+dz],mat(0x1c1c1c,.6));
 const pot=cyl(.14,.16,[P.x+.02,1.07,-2.35],steel);pot.name='Andagi pot';
 cyl(.11,.02,[P.x+.02,1.155,-2.35],mat(0xd6a44a,.3));
 const kettle=cyl(.1,.16,[P.x+.02,1.07,-2.05],mat(0xd7d9d6,.35,{metalness:.6}));kettle.name='Kettle';
 box([.03,.12,.03],[P.x+.02,1.2,-2.05],mat(0x1c1c1c,.6));
 // Rice cooker, brown-sugar jar, flour, a basket of goya and beni-imo.
 cyl(.14,.22,[P.x+.02,.99,-1.55],white).name='Rice cooker';cyl(.13,.04,[P.x+.02,1.12,-1.55],white);
 cyl(.08,.18,[P.x+.1,.97,-3.35],mat(0xd9e8e8,.2,{transparent:true,opacity:.7}));
 for(let i=0;i<5;i++)box([.04,.04,.04],[P.x+.08+(i%2)*.03,.92+i*.025,-3.35+(i%3-1)*.02],mat(0x5a3316,.8));
 box([.16,.22,.12],[P.x-.12,.98,-3.3],mat(0xf1eee4,.9),room,'Flour');
 box([.3,.1,.26],[P.x+.05,.93,-1.78],mat(0x9c7a44,.9),room,'Vegetable basket');
 for(let i=0;i<3;i++){const g=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.14,4,8),mat(0x5e8a3a,.7));g.rotation.z=Math.PI/2;g.rotation.y=i*.4;g.position.set(P.x+.04,.99,-1.85+i*.05);g.userData.staticProp=true;room.add(g);}
 for(let i=0;i<2;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),mat(0x6b2e5a,.7));s.scale.set(1.5,1,1);s.position.set(P.x+.08,.99,-1.7+i*.06);s.userData.staticProp=true;room.add(s);}
 // Open shelves over it: trays, bowls, cups, the milk crate's spare bottles.
 for(const y of [1.45,1.85,2.25]){box([.34,.03,pl],[W.minX+.18,y,pz],wood);}
 for(let i=0;i<8;i++)box([.3,.012,.24],[W.minX+.18,1.475+i*.014,-3.1],mat(0xd9bf6a,.35,{metalness:.5}));
 for(let i=0;i<10;i++)cyl(.06,.07,[W.minX+.18,1.51+(i%2)*.07,-2.6+Math.floor(i/2)*.16],mat(0xf3e6b8,.4),room,12);
 for(let i=0;i<8;i++)cyl(.04,.09,[W.minX+.18,1.91,-3.2+i*.13],mat([0xe25d5d,0x4f8fd0,0xf0c64a,0x5cb86b][i%4],.45),room,10);
 for(let i=0;i<4;i++)cyl(.1,.09,[W.minX+.18,2.31,-3.1+i*.28],mat(0xcfd2cf,.3,{metalness:.6}),room,14);
 const recipe=canvasTexture(300,420,(ctx,w,h)=>{ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#b3382c';ctx.font=`bold 30px ${HAND}`;ctx.textAlign='center';ctx.fillText('サーターアンダギー',w/2,50);ctx.fillStyle='#222';ctx.font=`20px ${HAND}`;ctx.textAlign='left';['たまご 3こ','さとう 150g','こむぎこ 300g','ベーキングパウダー 小さじ1','','170度の油で','ころころ　10分'].forEach((l,i)=>ctx.fillText(l,24,110+i*40));});
 const recipeMesh=new THREE.Mesh(new THREE.PlaneGeometry(.3,.42),new THREE.MeshStandardMaterial({map:recipe}));recipeMesh.position.set(W.minX+.02,1.2,-2.7);recipeMesh.rotation.y=Math.PI/2;room.add(recipeMesh);
 rect(P.x,pz,.66,pl+.05,1);

 // The kyūshoku trolley: two stainless tiers, cauldrons, bread basket, milk crate.
 const trolley=new THREE.Group();trolley.name='Kyūshoku trolley';trolley.userData.dynamicProp=true;room.add(trolley);
 for(const y of [.28,.78])box([.95,.03,.55],[0,y,0],steel,trolley,'',false);
 for(const [x,z] of [[-.45,-.25],[.45,-.25],[-.45,.25],[.45,.25]]){box([.025,.8,.025],[x,.42,z],steel,trolley,'',false);cyl(.04,.03,[x,.04,z],mat(0x222222,.7),trolley,10,false).rotation.x=Math.PI/2;}
 for(const x of [-.25,.22]){cyl(.17,.28,[x,.94,0],mat(0xd9dcd8,.3,{metalness:.7}),trolley,18,false);cyl(.18,.03,[x,1.09,0],mat(0xd9dcd8,.3,{metalness:.7}),trolley,18,false);}
 box([.4,.2,.3],[-.1,.4,0],mat(0x3d6fb2,.6),trolley,'Milk crate',false);
 for(let i=0;i<6;i++)cyl(.025,.1,[-.25+(i%3)*.1,.55,-.08+Math.floor(i/3)*.16],mat(0xf7f7f3,.3),trolley,8,false);
 const trolleySolid=rect(0,0,.95,.55,1.1);
 const TROLLEY_HOME=[W.minX+.9,-.8,0],TROLLEY_LUNCH=[2.9,1.35,0];

 // The serving table at the front, set out at lunch: two desks under a white cloth.
 const serving=new THREE.Group();serving.name='Serving table';serving.userData.dynamicProp=true;serving.position.set(2.85,0,-.3);room.add(serving);
 box([.5,.03,1.3],[0,.68,0],mat(0xfbfaf6,.9),serving,'',false);
 for(const [x,z] of [[-.2,-.58],[.2,-.58],[-.2,.58],[.2,.58]])box([.02,.66,.02],[x,.33,z],mat(0x55664f,.5),serving,'',false);
 const ladleM=mat(0xd9dcd8,.3,{metalness:.7});
 cyl(.17,.26,[0,.83,-.35],ladleM,serving,18,false);cyl(.15,.22,[0,.81,.3],ladleM,serving,18,false);
 box([.3,.14,.24],[0,.76,.02],mat(0xd9bf6a,.4,{metalness:.5}),serving,'',false);
 const servingSolid=rect(2.85,-.3,.55,1.35,.9);

 // ------------------------------------------------------------------ desks, trays, pupils
 const deskTop=mat(0x8a6a48,.6),olive=mat(0x5e6b3e,.5,{metalness:.3}),seatM=mat(0x7a5c3c,.65);
 const units=[];
 function buildUnit(i){
  const unit=new THREE.Group();unit.userData.dynamicProp=true;room.add(unit);
  box([.45,.025,.62],[0,.66,0],deskTop,unit,'',false);
  box([.41,.02,.56],[-.02,.56,0],mat(0x6d5238,.7),unit,'',false);
  for(const [x,z] of [[-.19,-.28],[.19,-.28],[-.19,.28],[.19,.28]])box([.025,.64,.025],[x,.32,z],olive,unit,'',false);
  box([.025,.025,.58],[.19,.12,0],olive,unit,'',false);box([.025,.025,.58],[-.19,.12,0],olive,unit,'',false);
  // A gym bag on the side hook, in the class's colour.
  box([.05,.22,.18],[-.05,.46,.33],mat(i%2?0x2f5f9a:0xc2453b,.8),unit,'',false);
  const chair=new THREE.Group();unit.add(chair);
  box([.36,.02,.36],[0,.4,0],seatM,chair,'',false);box([.02,.3,.34],[-.18,.62,0],seatM,chair,'',false);
  for(const [x,z] of [[-.16,-.16],[.16,-.16],[-.16,.16],[.16,.16]])box([.022,.4,.022],[x,.2,z],olive,chair,'',false);
  box([.022,.25,.022],[-.17,.52,-.15],olive,chair,'',false);box([.022,.25,.022],[-.17,.52,.15],olive,chair,'',false);
  // The lunch on the desk: placemat, tray, bowls, milk.
  const tray=new THREE.Group();tray.visible=false;unit.add(tray);
  const unitData={unit,chair,tray,pos:new THREE.Vector3(),rot:0,target:null,solid:rect(0,0,.9,.66,.8)};
  units.push(unitData);return unitData;
 }
 for(let i=0;i<12;i++)buildUnit(i);
 function setTray(u,menu,i){
  u.tray.clear();
  const add=(m,geo,pos)=>{const mesh=new THREE.Mesh(geo,m);mesh.position.set(...pos);u.tray.add(mesh);return mesh;};
  add(mat([0xd9534f,0x5b8fd9,0x5cb86b,0xf0c64a][i%4],.9),new THREE.BoxGeometry(.4,.004,.5),[0,.675,0]);
  const alumite=mat(0xd9bf6a,.35,{metalness:.5});
  add(alumite,new THREE.BoxGeometry(.3,.012,.4),[.02,.683,0]);
  const bowl=(r,x,z,fill)=>{add(alumite,new THREE.CylinderGeometry(r,r*.7,.05,14),[x,.715,z]);add(mat(fill,.5),new THREE.CylinderGeometry(r*.92,r*.92,.01,14),[x,.735,z]);};
  const staple={rice:0xf6f3ea,juushii:0xc9a56b,bread:null,soba:null}[menu.staple];
  if(staple)bowl(.055,.06,-.1,staple);
  if(menu.staple==='bread'){const b=add(mat(0xd49a55,.7),new THREE.CapsuleGeometry(.03,.1,4,8),[.06,.72,-.1]);b.rotation.z=Math.PI/2;}
  if(menu.staple==='soba'){bowl(.075,.05,-.05,0xe8d9a8);add(mat(0x8a4a2a,.6),new THREE.BoxGeometry(.05,.01,.03),[.05,.742,-.05]);}
  if(menu.soup)bowl(.05,.06,.1,{soki:0x9a6a3e,veg:0xc9a060,miso:0xa8844e,mozuku:0x6a6a3a}[menu.soup]);
  const mainCol={goya:0x6f9a3e,aji:0xc98a3e,imo:0x7a3a6e,fish:0x9a6a4a,salad:0x9a5a8a}[menu.main];
  add(mat(0xf0ede4,.4),new THREE.CylinderGeometry(.07,.07,.012,16),[-.07,.692,0]);
  for(let k=0;k<4;k++)add(mat(k%2?mainCol:(menu.main==='goya'?0xf0d060:mainCol),.6),new THREE.BoxGeometry(.03,.02,.025),[-.07+(k%2)*.03-.015,.705,-.02+Math.floor(k/2)*.03]);
  add(mat(0xf7f7f2,.2),new THREE.CylinderGeometry(.022,.024,.11,10),[-.1,.745,.14]);
  add(mat(0xe8dcc0,.8),new THREE.CylinderGeometry(.023,.023,.004,10),[-.1,.802,.14]);
  add(mat(0x8a5a3a,.6),new THREE.BoxGeometry(.2,.012,.02),[-.13,.69,-.17]);
 }

 const kids=PUPILS.map(([name,girl,shirt,bottom,toe],i)=>{
  const common={shirt,bottom,girl,toe,hair:HAIRS[i%4],skin:SKINS[i%4],name};
  const seated=buildFigure({...common,pose:'seated'}),standing=buildFigure({...common,pose:'standing'});
  const duty=DUTY.includes(i),smockSeated=duty?buildFigure({...common,pose:'seated',smock:true}):null,smockStanding=duty?buildFigure({...common,pose:'standing',smock:true}):null;
  for(const f of [seated,standing,smockSeated,smockStanding].filter(Boolean)){f.visible=false;f.userData.dynamicProp=true;room.add(f);}
  return {name,girl,seated,standing,smockSeated,smockStanding,duty,seed:i*1.7};
 });
 const teacherSeated=buildFigure({pose:'seated',adult:true,girl:true,shirt:0xe9e4d6,bottom:0x3a4a5e,hair:0x241a14,skin:0xd6a07a,name:TEACHER});
 const teacherStanding=buildFigure({pose:'standing',adult:true,girl:true,shirt:0xe9e4d6,bottom:0x3a4a5e,hair:0x241a14,skin:0xd6a07a,name:TEACHER});
 for(const f of [teacherSeated,teacherStanding]){f.visible=false;f.userData.dynamicProp=true;room.add(f);}
 const teacherSolid=rect(0,0,.5,.5,1.7);
 // The teacher's chair at lunch, pulled up to the end of a han.
 const teacherChair=new THREE.Group();teacherChair.userData.dynamicProp=true;teacherChair.position.set(-1.15,0,-.95);teacherChair.visible=false;room.add(teacherChair);
 box([.38,.02,.38],[0,.4,0],mat(0x7a5c3c,.65),teacherChair,'',false);box([.34,.3,.02],[0,.62,-.18],mat(0x7a5c3c,.65),teacherChair,'',false);
 for(const [x,z] of [[-.16,-.16],[.16,-.16],[-.16,.16],[.16,.16]])box([.022,.4,.022],[x,.2,z],mat(0x5e6b3e,.5,{metalness:.3}),teacherChair,'',false);
 // Brooms for sōji.
 const broom=new THREE.Group();broom.userData.dynamicProp=true;room.add(broom);
 {const h=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1.1,6),mat(0x9a7a4a,.7));h.position.y=.55;broom.add(h);const b=new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.06),mat(0xb9a15a,.9));b.position.y=.06;broom.add(b);}
 broom.visible=false;

 // A spare desk by the window, for a visitor: Kinjō's brother moved to Naha in July.
 const spare=buildUnit(12);spare.target={x:-1.9,z:-2.85,rot:0,up:false};spare.pos.set(-1.9,0,-2.85);
 const spareSeat=anchor([-2.3,.9,-2.85],'Sit at the spare desk',()=>action('seat','Spare desk','The empty desk by the window. Somebody has left a pencil in the groove and a folded paper crane in the drawer.'));
 spareSeat.userData.seat={position:[-2.35,0,-2.85],stand:[-2.9,0,-2.3],eyeY:1.05,yaw:-Math.PI/2,pitch:-.1};

 // ------------------------------------------------------------------ light
 const hemi=new THREE.HemisphereLight(0xeef5ff,0x9a8a70,1.2);room.add(hemi);
 const sun=new THREE.DirectionalLight(0xfff1d8,1.1);sun.position.set(-1.5,5,-8);sun.target.position.set(0,0,0);room.add(sun,sun.target);
 const tubes=[new THREE.PointLight(0xf6f8f2,0,9,2),new THREE.PointLight(0xf6f8f2,0,9,2)];tubes[0].position.set(-1.5,2.7,0);tubes[1].position.set(1.8,2.7,0);room.add(...tubes);

 batchStaticProps(room);

 // ------------------------------------------------------------------ the blackboard
 let boardKey='';
 function drawBoard(phase,cal){
  const key=phase+cal.date.toDateString();if(key===boardKey)return;boardKey=key;
  const c=boardTex.userData.canvas,ctx=c.getContext('2d'),w=c.width,h=c.height;
  ctx.fillStyle='#2f4a3c';ctx.fillRect(0,0,w,h);
  for(let i=0;i<260;i++){ctx.fillStyle=`rgba(240,240,230,${Math.random()*.05})`;ctx.fillRect(Math.random()*w,Math.random()*h,40+Math.random()*120,6+Math.random()*14);}
  const chalk=(t,x,y,size,col='rgba(244,242,232,.92)',align='left')=>{ctx.fillStyle=col;ctx.font=`bold ${size}px ${HAND}`;ctx.textAlign=align;ctx.fillText(t,x,y);};
  const d=cal.date,wd='日月火水木金土'[d.getDay()];
  chalk(`${d.getMonth()+1}月${d.getDate()}日（${wd}）`,w-40,60,40,undefined,'right');
  chalk('日直',w-120,130,32,'rgba(240,214,90,.95)','right');chalk('知念・玉城',w-40,172,32,undefined,'right');
  const menu=menuForWeekday(d.getDay());
  if(phase==='lesson'||phase==='morning'){
   chalk('算数　分数のわり算',60,70,48,'rgba(240,214,90,.95)');
   chalk('3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8',80,160,56);chalk('わる数を ひっくり返して かける',80,236,40,'rgba(231,154,165,.95)');
   ctx.strokeStyle='rgba(244,242,232,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(900,210,70,0,Math.PI*2);ctx.stroke();
   for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(900,210);ctx.lineTo(900+Math.cos(k*Math.PI/2)*70,210+Math.sin(k*Math.PI/2)*70);ctx.stroke();}
   ctx.fillStyle='rgba(240,214,90,.35)';ctx.beginPath();ctx.moveTo(900,210);ctx.arc(900,210,70,0,Math.PI*1.5);ctx.fill();
  }else if(phase==='serving'||phase==='lunch'){
   chalk('きょうの きゅうしょく',60,70,48,'rgba(240,214,90,.95)');
   (menu?.jp||[]).forEach((t,i)=>chalk('・'+t,90,140+i*52,44));
   chalk('のこさず たべよう！',700,300,44,'rgba(231,154,165,.95)');
  }else if(phase==='cleaning'){
   chalk('そうじの時間',60,70,48,'rgba(240,214,90,.95)');chalk('つくえを うしろへ　ほうき・ぞうきん',80,160,44);
  }else if(phase==='lesson-pm'){
   chalk('社会　沖縄の漁業',60,70,48,'rgba(240,214,90,.95)');
   ['・もずく　（養殖）','・マグロ　はえなわ','・セーイカ（ソデイカ）','・漁協 ＝ みんなで売る'].forEach((t,i)=>chalk(t,80,140+i*52,42));
   ctx.strokeStyle='rgba(244,242,232,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(880,240,90,34,0,0,Math.PI*2);ctx.moveTo(970,240);ctx.lineTo(1010,212);ctx.lineTo(1010,268);ctx.closePath();ctx.stroke();
  }else if(phase==='club'||phase==='after'){
   chalk('あしたの もちもの',60,70,44,'rgba(240,214,90,.95)');chalk('・水着（プール）　・絵の具',80,140,40);
   chalk('家庭科クラブ 3:40〜　サーターアンダギー',80,230,40,'rgba(231,154,165,.95)');
  }else if(phase==='weekend'){
   chalk('月曜日　朝の会 8:25',60,90,46);chalk('台風の日は　連絡網で',80,180,40,'rgba(231,154,165,.95)');
  }else{chalk('さようなら',60,120,56,'rgba(244,242,232,.6)');}
  boardTex.needsUpdate=true;
 }

 // ------------------------------------------------------------------ the day
 let phase=null,menu=null,tvUntil=0;
 const placeUnit=(u,[x,z,f],up)=>{
  u.target={x,z,rot:f===1?0:Math.PI,up};
 };
 function arrange(p){
  const lunch=p==='serving'||p==='lunch',clean=p==='cleaning';
  const spots=lunch?HAN:clean?STACK:ROWS;
  const chairsUp=clean||p==='after'||p==='closed'||p==='weekend';
  units.slice(0,12).forEach((u,i)=>placeUnit(u,spots[i],chairsUp));
 }
 function showPupils(p,cal){
  for(const k of kids)for(const f of [k.seated,k.standing,k.smockSeated,k.smockStanding])if(f)f.visible=false;
  teacherSeated.visible=teacherStanding.visible=false;broom.visible=false;
  teacherSolid.x=1e6;teacherChair.visible=false;
  const seatKid=(k,i,smock)=>{const f=smock&&k.smockSeated?k.smockSeated:k.seated;f.visible=true;f.userData.unit=units[i];setPose(f,'desk');return f;};
  if(p==='lesson'||p==='lesson-pm'){
   kids.forEach((k,i)=>seatKid(k,i,false));
   teacherStanding.visible=true;teacherStanding.position.set(3.75,.14,-.9);teacherStanding.rotation.y=-Math.PI/2;setPose(teacherStanding,'point');
   teacherSolid.x=3.75;teacherSolid.z=-.9;
  }else if(p==='morning'){
   kids.forEach((k,i)=>{if(i%2===0)seatKid(k,i,false);});
  }else if(p==='serving'){
   kids.forEach((k,i)=>{if(!k.duty)seatKid(k,i,false);});
   DUTY.forEach((i,n)=>{const f=kids[i].smockStanding;f.visible=true;f.position.set(3.4,.14,-.9+n*.6);f.rotation.y=-Math.PI/2;setPose(f,'serve');});
   teacherStanding.visible=true;teacherStanding.position.set(2.2,0,-2.95);teacherStanding.rotation.y=0;setPose(teacherStanding,'stand');
   teacherSolid.x=2.2;teacherSolid.z=-2.95;
  }else if(p==='lunch'){
   kids.forEach((k,i)=>{const f=seatKid(k,i,k.duty);setPose(f,'eat');});
   teacherSeated.visible=true;teacherSeated.position.set(-1.15,0,-.95);teacherSeated.rotation.y=0;setPose(teacherSeated,'eat');
   teacherChair.visible=true;
  }else if(p==='cleaning'){
   [0,3,6,9].forEach((i,n)=>{const f=kids[i].standing;f.visible=true;f.position.set(-.4+n*1.2,0,-1.4+(n%2)*1.8);f.rotation.y=n*1.3;setPose(f,'sweep');});
   broom.visible=true;broom.position.set(-.2,0,-1.2);broom.rotation.z=.35;
   teacherStanding.visible=true;teacherStanding.position.set(3.2,0,1.6);teacherStanding.rotation.y=-Math.PI*.7;setPose(teacherStanding,'stand');
   teacherSolid.x=3.2;teacherSolid.z=1.6;
  }else if(p==='club'){
   [2,6,10].forEach((i,n)=>{const f=kids[i].standing;f.visible=true;f.position.set(W.minX+1.1,0,-2.9+n*.62);f.rotation.y=-Math.PI/2;setPose(f,n===1?'serve':'stand');});
   teacherStanding.visible=true;teacherStanding.position.set(W.minX+1.5,0,-1.1);teacherStanding.rotation.y=-Math.PI*.8;setPose(teacherStanding,'stand');
   teacherSolid.x=W.minX+1.5;teacherSolid.z=-1.1;
  }
 }
 function setPhase(p,cal,instant){
  phase=p;menu=menuForWeekday(cal.date.getDay());
  arrange(p);showPupils(p,cal);
  const lunch=p==='serving'||p==='lunch';
  serving.visible=lunch;servingSolid.x=lunch?2.85:1e6;
  const [tx,tz]=lunch?TROLLEY_LUNCH:TROLLEY_HOME;trolley.position.set(tx,0,tz);trolley.rotation.y=lunch?0:Math.PI/2;
  trolleySolid.x=tx;trolleySolid.z=tz;trolleySolid.w=lunch?.95:.55;trolleySolid.d=lunch?.55:.95;
  units.slice(0,12).forEach((u,i)=>{u.tray.visible=false;if(lunch&&menu){setTray(u,menu,i);u.tray.visible=p==='lunch'||i%3!==0;}});
  if(instant)units.slice(0,12).forEach(u=>{const t=u.target;u.pos.set(t.x,0,t.z);u.rot=t.rot;apply(u,1);});
  drawBoard(p,cal);
 }
 function apply(u,chairUpAmount){
  u.unit.position.copy(u.pos);u.unit.rotation.y=u.rot;
  const up=u.target?.up;
  if(up){u.chair.position.set(.02,.66+.02,0);u.chair.rotation.set(Math.PI,0,0);u.chair.position.y=.66+.43;}
  else{u.chair.position.set(-.45,0,0);u.chair.rotation.set(0,0,0);}
  const c=Math.abs(Math.cos(u.rot))>.5;u.solid.x=u.pos.x-(up?0:Math.cos(u.rot)*.2);u.solid.z=u.pos.z;u.solid.w=c?(up?.5:.95):.66;u.solid.d=c?.66:(up?.5:.95);
 }

 // Actions.
 const kyushokuAnchor=anchor([2.4,1.1,-.3],'Kyūshoku',()=>action('kyushoku',phase,menu));
 anchor([3.9,1.3,-.2],'Read the blackboard',()=>action('read','Blackboard',boardText()));
 anchor([W.minX+.4,1.6,.6],'Read the class board',()=>action('read','Class board',
  'Over the cubbies: the class goal, "Everyone friendly, cheerful, and say hello," eight sheets of calligraphy -- 海 sea, 夢 dream, 友 friend, 空 sky -- each with a red circle from the teacher. Kenta\'s essay about rowing in the Hāri boat race with his grandfather. The paper wheel of cleaning duties. Summer projects: reef creatures, how to make sata andagi, a typhoon diary. This week\'s lunch squad: Kinjō, Arakaki, Taira -- "don\'t forget your smock, cap and mask."'));
 anchor([W.minX+.9,1.1,-2.3],'Cook in the class pantry',()=>action('school-pantry',phase));
 anchor([3.3,1.1,-2.4],'Talk to '+TEACHER_EN,()=>action('school-teacher',phase));
 anchor([3.3,1.9,-2.6],'Watch the class TV',()=>{tvUntil=performance.now()+45000;drawTV(true);action('inspect','Classroom TV','教育テレビ at ten past two: "ふしぎの海", a programme about the coral reef, taped on the VHS deck last week. Everybody knows the part with the octopus.');});
 anchor([0,1.3,-3.1],'Look out to sea',()=>action('inspect','Classroom window','Over the sill, the sunshade, then the seawall and the tetrapods and the reef going from green to deep blue. The breeze comes in off it and moves the curtains. In June the whole class watched a waterspout from here.'));
 anchor([-3.35,1.1,3.3],'Go back down to the yard',exit);

 function boardText(){
  const m=menu;
  if(phase==='serving'||phase==='lunch')return 'In chalk: today\'s kyūshoku -- '+(m?.jp.join('、')||'')+'. Underneath, in pink: のこさず たべよう! -- eat every bit.';
  if(phase==='lesson'||phase==='morning')return 'Maths: dividing fractions. 3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8, "turn the divisor over and multiply", and a pie with three quarters shaded in yellow. Duty monitors: Chinen and Tamaki.';
  if(phase==='lesson-pm')return 'Social studies: fishing in Okinawa. Mozuku farming, tuna long-lines, diamond squid, and "the co-op sells together". A chalk fish with a fierce eye.';
  if(phase==='cleaning')return 'Cleaning time: desks to the back, brooms and rags.';
  if(phase==='club'||phase==='after')return 'For tomorrow: swimsuit for the pool, paints. Home-ec club from 3:40 -- sata andagi.';
  return 'さようなら, in the corner, half rubbed out.';
 }
 function drawTV(on){
  const c=screenTex.userData.canvas,ctx=c.getContext('2d');
  if(!on){ctx.fillStyle='#1b2226';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(20,14,120,60);screenTex.needsUpdate=true;return;}
  const g=ctx.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'#1b7fa8');g.addColorStop(1,'#0c3b5a');ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
  for(let i=0;i<14;i++){ctx.fillStyle=['#f2c14e','#f07b3f','#5bd0c3','#f7f3e8'][i%4];ctx.beginPath();ctx.ellipse(30+i*22,70+(i*37)%130,12,6,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#e07aa0';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(20+i*40,c.height-10,24,Math.PI,0);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.92)';ctx.font=`bold 26px ${GOTHIC}`;ctx.fillText('ふしぎの海',14,32);
  screenTex.needsUpdate=true;
 }
 drawTV(false);

 let lastMinute=null,last=performance.now();
 function tick(dt,minutes,time){
  const cal=calendar(minutes),p=schoolPhase(minutes,cal.date.getDay());
  if(p!==phase)setPhase(p,cal,phase===null);
  if(kyushokuAnchor.userData.hit)kyushokuAnchor.userData.hit.label=p==='serving'?'Line up for kyūshoku':p==='lunch'?'Join the class for kyūshoku':'Kyūshoku trolley';
  // Desks slide to where the phase wants them.
  for(const u of units.slice(0,12)){
   const t=u.target;if(!t)continue;
   const k=1-Math.exp(-dt*2.2);u.pos.x+=(t.x-u.pos.x)*k;u.pos.z+=(t.z-u.pos.z)*k;
   let dr=Math.atan2(Math.sin(t.rot-u.rot),Math.cos(t.rot-u.rot));u.rot+=dr*k;apply(u);
  }
  // Seated pupils sit at their desk's chair, facing its way.
  for(const k of kids)for(const f of [k.seated,k.smockSeated])if(f?.visible&&f.userData.unit){
   const u=f.userData.unit;const c=Math.cos(u.rot),s=Math.sin(u.rot);
   f.position.set(u.pos.x-c*.45,0,u.pos.z+s*.45);f.rotation.y=u.rot+Math.PI/2;
  }
  if(teacherSeated.visible){}
  for(const k of kids)for(const f of [k.seated,k.standing,k.smockSeated,k.smockStanding])if(f?.visible)animateFigure(f,time,k.seed);
  for(const f of [teacherSeated,teacherStanding])if(f.visible)animateFigure(f,time,3);
  // Fans on through the school day, off at night.
  const fansOn=p!=='closed'&&p!=='weekend';
  for(const f of fans)f.rotation.y+=dt*(fansOn?7.5:0);
  for(const c of curtains){
   const pos=c.mesh.geometry.attributes.position,b=c.base;
   for(let i=0;i<pos.count;i++){const y=b[i*3+1],sway=(.5-y/(head-sill+.1))*.5;pos.setZ(i,b[i*3+2]+Math.sin(time*1.3+c.seed+y*2)*.05*(sway+.5)+Math.sin(time*.7+c.seed)*.03*(sway+.5));}
   pos.needsUpdate=true;
  }
  const m=((minutes%1440)+1440)%1440;
  // The clock faces into the room along -x; seen from the desks, +z is to the right.
  minuteHand.rotation.x=(m%60)/60*Math.PI*2;hourHand.rotation.x=((m/60)%12)/12*Math.PI*2;
  // Light: the windows carry the day; the tubes are on while school is in.
  const day=daylight(minutes);
  hemi.intensity=.25+day*1.1;sun.intensity=day*1.2;
  // The views out go with the day too: dusk, then the sea and the field in the dark.
  const view=.12+.88*day;seaPlane.material.color.setRGB(view*(.85+.15*day),view*(.9+.1*day),view);fieldPlane.material.color.setRGB(view,view,view*(1.05-.05*day));
  const lit=p!=='closed'&&p!=='weekend';for(const t of tubes)t.intensity=lit?6:0;tubeM.emissiveIntensity=lit?1:.05;
  if(tvUntil&&performance.now()>tvUntil){tvUntil=0;drawTV(false);}
  // The chime, heard from in here too.
  const mi=Math.floor(m);if(lastMinute!==null&&mi!==lastMinute&&CHIME_TIMES.includes(mi))playSchoolChime(1);lastMinute=mi;
 }
 apply(spare);
 return {...CLASSROOM,colliders,tick,get phase(){return phase;},units,kids,dispose(){}};
}
