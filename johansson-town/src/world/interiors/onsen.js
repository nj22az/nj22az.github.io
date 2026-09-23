import * as THREE from '../../../vendor/three.module.js';
import {buildFigure,animateFigure} from '../../people/school-kids.js';
import {daylight} from '../../render/dusk.js';

/**
 * Inside Umi-no-yu: through the noren to the bandai, the changing room, the washing
 * places and the tiled indoor bath, and out through the glass to the rock bath under the
 * sky, with a bamboo fence kept low on the sea side.
 *
 * Umi-no-yu is a harbour bath that lets families and couples in together, so the sign by
 * the lockers asks for swimwear (水着着用) -- which is how you can share the water with a
 * friend. The pools are sunk below the floor: you walk round them and get in by the seats.
 *
 * Room frame: the street door is at +z, the sea at -z. Metres, floor at y = 0.
 */
export const ONSEN_ROOM=Object.freeze({
 bounds:{minX:-4.85,maxX:4.85,minZ:-8.8,maxZ:4.85},
 spawn:[0,0,4.2],yaw:0,exit:[0,1.1,4.7],
 walls:{minX:-5,maxX:5,minZ:-9,maxZ:5,height:2.8},
 hall:{front:1.6,changing:-1.2,bath:-4.4},
 tub:{minX:1.1,maxX:4.85,minZ:-4.2,maxZ:-2.1,rim:.45,water:.4,floor:-.32},
 pool:{x:0,z:-6.7,rx:2.55,rz:1.45,water:.08,floor:-.46,rim:.34}
});
const R=ONSEN_ROOM;

/** Seats: where you sit, and where your weight goes. `soak` seats put you in the water. */
export const ONSEN_SEATS=Object.freeze({
 bench:{id:'bench',label:'Sit on the changing-room bench',position:[2.1,0,.25],stand:[2.1,0,.95],eyeY:1.16,yaw:0,surfaceY:.42},
 massage:{id:'massage',label:'Sit in the massage chair',position:[4.25,0,3.55],stand:[3.4,0,3.55],eyeY:1.12,yaw:Math.PI/2,surfaceY:.46},
 ...Object.fromEntries([-1.9,-2.6,-3.3,-4.0].map((z,i)=>['wash'+i,{id:'wash'+i,label:'Wash at the tap',position:[-4.25,0,z],stand:[-3.45,0,z],eyeY:.98,yaw:Math.PI/2,surfaceY:.27,wash:true}])),
 indoor:{id:'indoor',label:'Get into the indoor bath',position:[3.1,0,-3.35],stand:[3.1,0,-1.66],eyeY:R.tub.floor+.78,yaw:Math.PI,surfaceY:R.tub.floor+.04,soak:true},
 rock:{id:'rock',label:'Get into the rock bath',position:[.75,0,-6.45],stand:[.75,0,-4.75],eyeY:R.pool.floor+.82,yaw:0,surfaceY:R.pool.floor+.04,soak:true},
 rockBeside:{id:'rockBeside',label:'Get into the rock bath beside the rocks',position:[-.85,0,-6.55],stand:[-.6,0,-4.78],eyeY:R.pool.floor+.82,yaw:0,surfaceY:R.pool.floor+.04,soak:true}
});

function dataTexture(size,paint){
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,[r,g,b,a=255]=paint(x/size,y/size);data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=a;}
 const t=new THREE.DataTexture(data,size,size);t.needsUpdate=true;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t;
}
/** Square tiles with pale grout. */
const tileTexture=(r,g,b,grout=[214,218,214])=>dataTexture(64,(u,v)=>{const edge=Math.min(u%.5,v%.5)<.035;const n=((u*97+v*53)%1)*8;return edge?grout:[r+n,g+n,b+n];});
/** Rough stone flags. */
const flagTexture=()=>dataTexture(64,(u,v)=>{const edge=(u*3.1+Math.sin(v*9)*.06)%1<.04||(v*2.3+Math.sin(u*7)*.05)%1<.04;const n=Math.sin(u*41)*Math.cos(v*37)*10;return edge?[96,92,86]:[150+n,145+n,134+n];});
/** A soft puff for steam. */
let puff=null;
const puffTexture=()=>puff??=dataTexture(64,(u,v)=>{const d=Math.min(1,Math.hypot(u-.5,v-.5)*2),a=Math.max(0,1-d);return [255,255,255,Math.round(200*a*a)];});
/** The view over the fence: sky above, the sea below the horizon. */
const seaTexture=()=>{const t=dataTexture(128,(u,v)=>{if(v>.46)return [120+60*(1-v),175+50*(1-v),215];const k=v/.46;return [40+30*k,110+40*k,150+30*k];});t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t;};

function canvasSign(lines,{w=512,h=256,bg='#efe6cf',fg='#2b2520',size=64}={}){
 if(typeof document==='undefined'||!document.createElement)return null;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext?.('2d');if(!ctx)return null;
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
 lines.forEach(([text,scale=1],i)=>{ctx.font=`bold ${Math.round(size*scale)}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif`;ctx.fillText(text,w/2,h*(i+.7)/(lines.length+.4));});
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

/**
 * @param {object} shared
 * @param {THREE.Group} shared.room
 * @param {(o:THREE.Object3D,label:string,fn:Function,near?:boolean)=>void} shared.reg
 * @param {(kind:string,...args:any[])=>void} shared.action
 * @param {()=>void} shared.exit
 */
export function buildOnsenInterior({room,reg,action,exit}){
 room.name='Umi-no-yu interior';
 const colliders=[],mats=new Map(),animated=[];
 const mat=(color,rough=.8,extra={})=>{const key=color+':'+rough+JSON.stringify(Object.keys(extra));if(!mats.has(key)||Object.keys(extra).length){const m=new THREE.MeshStandardMaterial({color,roughness:rough,...extra});if(Object.keys(extra).length)return m;mats.set(key,m);}return mats.get(key);};
 const rect=(x,z,w,d,height=1)=>{const c={x,z,w,d,height,minY:0};colliders.push(c);return c;};
 const box=(size,pos,m,name='',parent=room)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(...size),m);b.position.set(...pos);b.castShadow=b.receiveShadow=true;b.name=name;b.userData.staticProp=true;parent.add(b);return b;};
 const cyl=(r,h,pos,m,name='',seg=16)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);c.position.set(...pos);c.castShadow=true;c.name=name;room.add(c);return c;};
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);room.add(o);reg(o,label,fn,true);return o;};
 const seat=(spec,title,text)=>{const o=anchor([spec.position[0],.9,spec.position[2]],spec.label,()=>action('seat',title,text));o.userData.seat={...spec,onsen:spec.id,pitch:spec.soak?-.05:0};return o;};

 const wood=mat(0xc79f6e,.7),darkWood=mat(0x6b4a2e,.75),plaster=mat(0xeee6d3,.95),stone=mat(0x8c877c,.95),indigo=mat(0x253a5e,.9);
 const tiles=new THREE.MeshStandardMaterial({map:tileTexture(120,150,160),roughness:.35});tiles.map.repeat.set(6,4);
 const wallTiles=new THREE.MeshStandardMaterial({map:tileTexture(214,222,220,[170,176,174]),roughness:.4});wallTiles.map.repeat.set(10,3);
 const flags=new THREE.MeshStandardMaterial({map:flagTexture(),roughness:.95});flags.map.repeat.set(3,2);
 const water=new THREE.MeshStandardMaterial({color:0x7fc3c6,roughness:.06,metalness:.05,transparent:true,opacity:.72,depthWrite:false});

 // ---- Floors: wood indoors, tiles in the bath hall, flags outside; holes where the baths are.
 const floorRect=(x0,x1,z0,z1,m,y=0)=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),m);f.rotation.x=-Math.PI/2;f.position.set((x0+x1)/2,y,(z0+z1)/2);f.receiveShadow=true;f.name='Umi-no-yu floor';room.add(f);return f;};
 floorRect(-5,5,3.6,5,stone);floorRect(-5,5,R.hall.changing,3.6,wood);
 floorRect(-5,R.tub.minX,R.hall.bath,R.hall.changing,tiles);floorRect(R.tub.minX,5,R.tub.maxZ,R.hall.changing,tiles);floorRect(R.tub.minX,5,R.hall.bath,R.tub.minZ,tiles);
 {const shape=new THREE.Shape();shape.moveTo(-5,-R.hall.bath);shape.lineTo(5,-R.hall.bath);shape.lineTo(5,-R.walls.minZ);shape.lineTo(-5,-R.walls.minZ);shape.closePath();
  const hole=new THREE.Path();hole.absellipse(R.pool.x,-R.pool.z,R.pool.rx,R.pool.rz,0,Math.PI*2,false);shape.holes.push(hole);
  const paving=new THREE.Mesh(new THREE.ShapeGeometry(shape,48),flags);paving.rotation.x=-Math.PI/2;paving.receiveShadow=true;paving.name='Rock bath paving';room.add(paving);}
 box([10,.04,1.4],[0,.02,3.55],darkWood,'Genkan step');
 // ---- Walls and ceilings.
 const wall=(x0,z0,x1,z1,h=R.walls.height,m=plaster,y=0)=>box([Math.max(.12,Math.abs(x1-x0)),h,Math.max(.12,Math.abs(z1-z0))],[(x0+x1)/2,y+h/2,(z0+z1)/2],m,'Umi-no-yu wall');
 wall(-5,5,-1,5);wall(1,5,5,5);wall(-1,5,1,5,.6,plaster,2.2);
 for(const x of [-5,5]){wall(x,R.hall.changing,x,5);wall(x,R.hall.bath,x,R.hall.changing,R.walls.height,wallTiles);}
 wall(-5,R.hall.front,-.9,R.hall.front);wall(.9,R.hall.front,5,R.hall.front);wall(-.9,R.hall.front,.9,R.hall.front,.55,plaster,2.25);
 wall(-5,R.hall.changing,-.8,R.hall.changing);wall(.8,R.hall.changing,5,R.hall.changing);wall(-.8,R.hall.changing,.8,R.hall.changing,.6,plaster,2.2);
 // The bath hall's sea end is glass, so from the indoor bath you see the rocks outside.
 wall(-5,R.hall.bath,-1,R.hall.bath,.5,wallTiles);wall(1,R.hall.bath,5,R.hall.bath,.5,wallTiles);wall(-5,R.hall.bath,5,R.hall.bath,.45,plaster,2.35);
 const glass=new THREE.MeshStandardMaterial({color:0xcfe3e6,roughness:.1,transparent:true,opacity:.22,depthWrite:false});
 for(const [x0,x1] of [[-5,-1],[1,5]])box([x1-x0,1.85,.03],[(x0+x1)/2,1.425,R.hall.bath],glass,'Umi-no-yu glass');
 for(const x of [-5,-3,-1,1,3,5])box([.08,1.85,.1],[x,1.425,R.hall.bath],darkWood,'Glass mullion');
 box([.9,1.95,.04],[-.46,.98,R.hall.changing+.03],new THREE.MeshStandardMaterial({color:0xe8efee,roughness:.5,transparent:true,opacity:.55}),'Frosted sliding door');
 const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(10,5-R.hall.bath),mat(0xe9e0cc,.95));ceiling.rotation.x=Math.PI/2;ceiling.position.set(0,R.walls.height,(5+R.hall.bath)/2);room.add(ceiling);
 for(const z of [3.8,2.1,.2,-1.9,-3.4])box([10,.1,.12],[0,R.walls.height-.05,z],darkWood,'Ceiling beam');
 // A short eave over the door to the rock bath.
 box([4,.08,1.1],[0,2.6,R.hall.bath-.55],darkWood,'Outdoor eave');
 for(const x of [-1.9,1.9])cyl(.06,2.6,[x,1.3,R.hall.bath-1.05],darkWood,'Eave post',8);
 rect(-1.9,R.hall.bath-1.05,.15,.15,2.6);rect(1.9,R.hall.bath-1.05,.15,.15,2.6);
 // Room walls as colliders (the doorways are left open).
 for(const [x0,x1,z] of [[-5,-.9,R.hall.front],[.9,5,R.hall.front],[-5,-.8,R.hall.changing],[.8,5,R.hall.changing],[-5,-1,R.hall.bath],[1,5,R.hall.bath]])rect((x0+x1)/2,z,x1-x0,.2,2.8);

 // ---- Genkan and bandai.
 for(let i=0;i<3;i++){const z=4.85-i*.34;box([.34,1.4,.32],[-4.8,.7,z],darkWood,'Getabako');for(let r=0;r<4;r++)box([.02,.26,.28],[-4.62,.2+r*.33,z],mat(0x8a6a48,.7),'Getabako door');}
 rect(-4.8,4.51,.4,1.05,1.4);
 box([.62,1.05,1.7],[-3.85,.525,2.55],darkWood,'Bandai counter');box([.7,.05,1.78],[-3.85,1.075,2.55],wood,'Bandai top');rect(-3.85,2.55,.66,1.74,1.1);
 box([.2,.12,.14],[-3.75,1.16,2.2],mat(0xd9c9a0,.6),'Ticket tray');
 const attendant=buildFigure({pose:'seated',adult:true,girl:true,shirt:0x6d8a74,bottom:0x3a3a42,hair:0x8a8680,skin:0xc99a74,name:'Umi-no-yu attendant'});
 attendant.position.set(-4.5,.05,2.6);attendant.rotation.y=Math.PI/2;room.add(attendant);animated.push(attendant);
 box([.5,.45,.5],[-4.5,.225,2.6],darkWood,'Attendant stool');rect(-4.5,2.6,.6,.6,1.2);
 anchor([-3.5,1.25,2.55],'Pay at the bandai · ¥300',()=>action('onsen-pay'));
 anchor([-3.5,1.25,3.1],'Talk to the attendant',()=>action('inspect','Umi-no-yu attendant',
  'Higa-san has kept the bandai for thirty years. She takes your coins without looking up from her crossword. "Swimwear in the bath, please -- it is a family bath. The rock bath is best after dark."'));
 const fee=canvasSign([['大人 ¥300',1],['タオル ¥100 · 牛乳 ¥100',.5]],{w:384,h:192,bg:'#fbf6ea',size:60});
 if(fee){const s=new THREE.Mesh(new THREE.PlaneGeometry(.7,.35),new THREE.MeshStandardMaterial({map:fee,roughness:.8}));s.position.set(-3.53,1.55,2.55);s.rotation.y=Math.PI/2;room.add(s);}
 // Coffee milk in the glass-fronted fridge, drunk standing, hand on hip.
 box([.62,1.6,.6],[4.6,.8,2.3],mat(0xe9e4da,.4),'Milk fridge');rect(4.6,2.3,.64,.62,1.6);
 box([.02,1.2,.5],[4.28,.95,2.3],glass,'Milk fridge glass');
 for(let r=0;r<3;r++)for(let c=0;c<4;c++)cyl(.028,.12,[4.5,.55+r*.38,2.1+c*.13],mat(r===1?0x9b6a3c:0xf3efe4,.4),'Milk bottle',10);
 anchor([4.2,1.1,2.3],'Buy coffee milk · ¥100',()=>action('onsen-milk'));
 // The massage chair, ¥100 for ten minutes.
 box([.75,.5,.8],[4.35,.25,3.55],mat(0x5a2c24,.55),'Massage chair seat');box([.18,.95,.8],[4.72,.8,3.55],mat(0x5a2c24,.55),'Massage chair back');
 for(const z of [3.17,3.93])box([.7,.22,.12],[4.35,.6,z],mat(0x4a241e,.55),'Massage chair arm');
 rect(4.4,3.55,.85,.9,1);seat(ONSEN_SEATS.massage,'Massage chair','You feed it a hundred-yen coin. It grinds up your back like a slow, well-meaning truck. Ten minutes later you feel two centimetres taller.');
 const clock=new THREE.Group();clock.position.set(0,2.45,R.hall.front+.08);room.add(clock);
 clock.add(new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.04,24).rotateX(Math.PI/2),mat(0xf6f1e6,.5)));
 const hands=[new THREE.Mesh(new THREE.BoxGeometry(.012,.13,.01),mat(0x222222)),new THREE.Mesh(new THREE.BoxGeometry(.008,.17,.01),mat(0x222222))];
 for(const h of hands){h.geometry.translate(0,h.geometry.parameters.height/2,0);h.position.z=.03;clock.add(h);}
 // The noren into the changing room.
 const norenMap=canvasSign([['ゆ',2.2]],{w:256,h:192,bg:'#253a5e',fg:'#f3efe4',size:70});
 for(let k=0;k<2;k++){const p=new THREE.Mesh(new THREE.PlaneGeometry(.88,.8),norenMap?new THREE.MeshStandardMaterial({map:norenMap,roughness:.9,side:THREE.DoubleSide}):indigo);p.position.set(-.45+k*.9,1.85,R.hall.front);room.add(p);}

 // ---- Changing room.
 for(let i=0;i<6;i++)for(let r=0;r<2;r++){const z=1.25-i*.42;box([.45,.9,.4],[-4.75,.45+r*.95,z],mat(0xb9b2a0,.45),'Locker');box([.02,.12,.08],[-4.52,.55+r*.95,z+.12],mat(0xc9a13c,.3),'Locker key');}
 rect(-4.75,-.1,.5,2.6,1.9);
 anchor([-4.2,1.2,.2],'Change at the lockers',()=>action('onsen-change'));
 for(let r=0;r<3;r++){box([.5,.03,2.4],[4.72,.35+r*.55,.2],wood,'Basket shelf');for(let i=0;i<4;i++)box([.4,.22,.4],[4.68,.48+r*.55,-.7+i*.6],mat(0xc9a36a,.9),'Rattan basket');}
 rect(4.72,.2,.5,2.45,1.6);
 box([2.2,.08,.42],[2.1,.42,.25],wood,'Changing bench');for(const x of [1.15,3.05])box([.08,.38,.36],[x,.19,.25],darkWood,'Bench leg');
 rect(2.1,.25,2.25,.5,.45);seat(ONSEN_SEATS.bench,'Changing-room bench','You sit and let the heat come out of you. The fan turns its head towards you and away again.');
 box([2.9,.06,.45],[-2.95,.78,-.92],wood,'Dressing counter');box([2.9,.72,.4],[-2.95,.39,-.94],darkWood,'Dressing counter base');rect(-2.95,-.94,2.95,.5,.85);
 const mirror=new THREE.MeshStandardMaterial({color:0xcfd8da,roughness:.05,metalness:.9});
 for(const x of [-3.9,-2.95,-2])box([.7,.8,.02],[x,1.35,-1.12],mirror,'Mirror');
 cyl(.04,.2,[-2.4,.9,-.9],mat(0xd8d2c4,.4),'Hair dryer',10);
 box([.34,.06,.34],[-2.3,.03,1.1],mat(0xdedad0,.4),'Scales');
 const fan=new THREE.Group();fan.position.set(3.85,0,1.2);room.add(fan);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.1,8),mat(0xe6e2d8,.5));pole.position.y=.55;fan.add(pole);
 const fanHead=new THREE.Group();fanHead.position.y=1.12;fan.add(fanHead);
 fanHead.add(new THREE.Mesh(new THREE.TorusGeometry(.18,.01,6,24),mat(0x8fb3c6,.5)));const blades=new THREE.Mesh(new THREE.CircleGeometry(.16,5),mat(0x9fc6d8,.5,{side:THREE.DoubleSide,transparent:true,opacity:.7}));fanHead.add(blades);
 rect(3.85,1.2,.35,.35,1.3);
 const swim=canvasSign([['水着着用',1],['FAMILY BATH · SWIMWEAR PLEASE',.34]],{w:512,h:200,bg:'#fbf6ea',fg:'#8a2f22',size:84});
 const swimSign=new THREE.Mesh(new THREE.PlaneGeometry(.8,.31),swim?new THREE.MeshStandardMaterial({map:swim,roughness:.8}):plaster);swimSign.position.set(1.6,1.6,R.hall.changing+.07);room.add(swimSign);
 reg(swimSign,'Read the notice by the bath door',()=>action('inspect','水着着用 · Swimwear please',
  'Umi-no-yu is a family bath: husbands and wives, grandparents and children, friends from work. Swimwear in the water, please. Wash before you get in. No towels in the bath. Rock bath until 22:00.'),true);

 // ---- Bath hall: the washing places along the west wall, the indoor bath along the east.
 const bucket=mat(0xf2c230,.45);
 ONSEN_SEATS&&['wash0','wash1','wash2','wash3'].forEach((id,i)=>{
  const s=ONSEN_SEATS[id],z=s.position[2];
  box([.02,.62,.5],[-4.93,1.25,z],mirror,'Wash mirror');cyl(.018,.34,[-4.88,.78,z+.1],mat(0xbfc4c6,.25,{metalness:.8}),'Shower pipe',8);
  cyl(.03,.05,[-4.85,.95,z+.1],mat(0xbfc4c6,.25,{metalness:.8}),'Shower head',10);
  box([.12,.04,.5],[-4.88,.56,z],mat(0xd9d4c8,.4),'Tap shelf');
  const stool=cyl(.16,.26,[-4.25,.13,z],mat(0xf3f0e8,.5),'Wash stool',16);void stool;
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.13,.11,.12,18,1,true),bucket);b.position.set(-4.62,.06,z-.18);room.add(b);
  box([.1,.07,.05],[-4.86,.6,z-.12],mat(i%2?0xe7a0b5:0x9ec7e3,.5),'Soap');
  rect(-4.25,z,.3,.3,.3);seat(s,'Washing place','You sit on the low stool, fill the yellow bucket and pour it over your shoulders. Soap, rinse, and again. Nobody gets into the bath until they have done this.');
 });
 rect(-4.85,-2.95,.3,2.6,1.5);
 // The indoor tub: tiled walls rising from a sunk floor, the rim a little above your knee.
 const T=R.tub,tw=T.maxX-T.minX,td=T.maxZ-T.minZ,tx=(T.minX+T.maxX)/2,tz=(T.minZ+T.maxZ)/2;
 box([tw,.04,td],[tx,T.floor-.02,tz],tiles,'Indoor bath floor');
 for(const [w,d,x,z] of [[tw,.14,tx,T.maxZ-.07],[tw,.14,tx,T.minZ+.07],[.14,td,T.minX+.07,tz]])box([w,T.rim-T.floor,d],[x,(T.rim+T.floor)/2,z],wallTiles,'Indoor bath wall');
 box([tw,.05,.2],[tx,T.rim,T.maxZ-.07],mat(0x6b4a2e,.6),'Indoor bath rim');box([.2,.05,td],[T.minX+.07,T.rim,tz],mat(0x6b4a2e,.6),'Indoor bath rim');
 const tubWater=new THREE.Mesh(new THREE.PlaneGeometry(tw-.28,td-.28,12,8),water);tubWater.rotation.x=-Math.PI/2;tubWater.position.set(tx+.07,T.water,tz);tubWater.name='Indoor bath water';tubWater.renderOrder=2;room.add(tubWater);
 rect(tx,tz,tw,td,.6);
 // The spout: hot water falling from a stone lip.
 box([.35,.25,.3],[4.7,.75,-2.55],stone,'Spout stone');
 const fall=new THREE.Mesh(new THREE.PlaneGeometry(.12,.38),new THREE.MeshStandardMaterial({color:0xd9eef0,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide}));fall.position.set(4.5,.58,-2.55);fall.rotation.y=Math.PI/2;room.add(fall);
 seat(ONSEN_SEATS.indoor,'Indoor bath','You lower yourself in a little at a time. 42 degrees. The heat goes into your knees first, then everywhere. Through the glass the steam rolls off the rock bath.');
 // The mural: the reef and the open sea, not Fuji.
 const mural=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1.2),new THREE.MeshStandardMaterial({map:seaTexture(),roughness:.8}));mural.position.set(4.93,1.55,-2.95);mural.rotation.y=-Math.PI/2;room.add(mural);

 // ---- The rock bath outside.
 const P=R.pool;
 const poolFloor=new THREE.Mesh(new THREE.CircleGeometry(1,40),stone);poolFloor.scale.set(P.rx,P.rz,1);poolFloor.rotation.x=-Math.PI/2;poolFloor.position.set(P.x,P.floor,P.z);room.add(poolFloor);
 const poolWall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,P.rim-P.floor,40,1,true),mat(0x6f6a60,.95,{side:THREE.DoubleSide}));poolWall.scale.set(P.rx,1,P.rz);poolWall.position.set(P.x,(P.rim+P.floor)/2,P.z);room.add(poolWall);
 const poolWater=new THREE.Mesh(new THREE.CircleGeometry(1,40,0,Math.PI*2),water);poolWater.scale.set(P.rx-.02,P.rz-.02,1);poolWater.rotation.x=-Math.PI/2;poolWater.position.set(P.x,P.water,P.z);poolWater.name='Rock bath water';poolWater.renderOrder=2;room.add(poolWater);
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const rockMat=mat(0x77716a,.95),darkRock=mat(0x5b5750,.95);
 const rock=(x,z,s,y=0)=>{const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=.78+rnd()*.35;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*.62,p.getZ(i)*k);}g.computeVertexNormals();
  const m=new THREE.Mesh(g,rnd()>.5?rockMat:darkRock);m.scale.setScalar(s);m.position.set(x,y+s*.25,z);m.rotation.y=rnd()*6;m.castShadow=m.receiveShadow=true;m.name='Bath rock';room.add(m);return m;};
 for(let i=0;i<30;i++){const a=i/30*Math.PI*2,x=P.x+Math.cos(a)*(P.rx+.12),z=P.z+Math.sin(a)*(P.rz+.1);
  // Leave the step-in gap facing the door low.
  // Low along the sea side so the view from the water is over them, not into them.
  const sea=Math.sin(a)<-.2,door=Math.sin(a)>.6;rock(x,z,sea?.14+rnd()*.05:door?.2:.26+rnd()*.12,sea?-.04:.02);}
 rock(P.x+P.rx+.15,P.z+.2,.52,.05);rock(P.x-P.rx-.1,P.z-.3,.48,.05);
 rect(P.x,P.z,P.rx*2+.3,P.rz*2+.25,.5);
 seat(ONSEN_SEATS.rock,'Rock bath','You find the smooth step under the water and sit. The water is up to your chest and the night air is on your head. Over the low fence the harbour lights come and go in the steam.');
 seat(ONSEN_SEATS.rockBeside,'Rock bath','The other side of the rock bath, with your back to a warm boulder.');
 // Bamboo fence, tall to the sides, low on the sea side; the sea and sky beyond it.
 const bamboo=new THREE.CylinderGeometry(.035,.035,1,8),bambooMat=mat(0x9c8a52,.7);
 const posts=[];for(const x of [-4.95,4.95])for(let z=R.hall.bath-.1;z>R.walls.minZ;z-=.075)posts.push([x,z,2.2]);
 for(let x=-4.95;x<=4.95;x+=.075)posts.push([x,R.walls.minZ+.05,1.05]);
 const fence=new THREE.InstancedMesh(bamboo,bambooMat,posts.length);const d=new THREE.Object3D();
 posts.forEach(([x,z,h],i)=>{d.position.set(x,h/2,z);d.scale.set(1,h,1);d.updateMatrix();fence.setMatrixAt(i,d.matrix);});fence.name='Takegaki fence';fence.castShadow=true;room.add(fence);
 for(const h of [.4,.9])box([10,.05,.05],[0,h,R.walls.minZ+.1],darkWood,'Fence rail');
 for(const x of [-4.95,4.95])for(const h of [.6,1.5])box([.05,.05,Math.abs(R.walls.minZ-R.hall.bath)],[x,h,(R.walls.minZ+R.hall.bath)/2],darkWood,'Fence rail');
 rect(-4.95,(R.walls.minZ+R.hall.bath)/2,.2,4.8,2.2);rect(4.95,(R.walls.minZ+R.hall.bath)/2,.2,4.8,2.2);rect(0,R.walls.minZ+.05,10,.2,1.1);
 const seaMat=new THREE.MeshBasicMaterial({map:seaTexture(),fog:false});const sea=new THREE.Mesh(new THREE.PlaneGeometry(90,30),seaMat);sea.position.set(0,6,-45);sea.name='Umi-no-yu sea view';room.add(sea);
 // Stone lantern and a fukugi tree in the corner.
 box([.34,.5,.34],[-4.2,.25,-8.2],stone,'Lantern base');box([.5,.08,.5],[-4.2,.54,-8.2],stone,'Lantern ledge');
 const lanternGlow=new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc070,emissiveIntensity:0,roughness:.8});box([.3,.26,.3],[-4.2,.71,-8.2],lanternGlow,'Lantern light');
 const roof=new THREE.Mesh(new THREE.ConeGeometry(.42,.24,4),stone);roof.position.set(-4.2,.96,-8.2);roof.rotation.y=Math.PI/4;room.add(roof);rect(-4.2,-8.2,.55,.55,1.1);
 cyl(.14,2.6,[4.2,1.3,-8.2],mat(0x5d4a36,.9),'Fukugi trunk',10);
 for(const [dx,dy,dz,s] of [[0,2.8,0,1],[.4,2.4,.3,.75],[-.35,2.5,-.2,.8]]){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),mat(0x2f5a33,.85));c.position.set(4.2+dx,dy,-8.2+dz);c.scale.y=.8;c.castShadow=true;room.add(c);}
 rect(4.2,-8.2,.4,.4,2.6);
 // Steam off both baths.
 const steamMat=new THREE.SpriteMaterial({map:puffTexture(),color:0xffffff,transparent:true,opacity:.28,depthWrite:false});
 const steam=[];for(let i=0;i<22;i++){const s=new THREE.Sprite(steamMat.clone());const indoor=i<8;
  const base=indoor?[T.minX+.4+rnd()*(tw-.8),T.water,T.minZ+.3+rnd()*(td-.6)]:[P.x+(rnd()-.5)*P.rx*1.6,P.water,P.z+(rnd()-.5)*P.rz*1.4];
  s.userData={base,phase:rnd(),speed:.08+rnd()*.06};s.name='Steam';room.add(s);steam.push(s);}

 // ---- Light: warm lamps inside, the lantern outside after dark.
 room.add(new THREE.HemisphereLight(0xfff1dc,0x8a7a68,1.25));
 const lamps=[];for(const [x,y,z,p] of [[-2,2.5,3],[1.5,2.5,.3],[-1.5,2.5,-2.8],[2.8,2.5,-2.9]]){const l=new THREE.PointLight(0xffd9a8,p||5,7,2);l.position.set(x,y,z);room.add(l);lamps.push(l);}
 const outdoor=new THREE.PointLight(0xffc27a,0,9,2);outdoor.position.set(-3.2,1.4,-7.4);room.add(outdoor);
 const sun=new THREE.DirectionalLight(0xfff0dc,0);sun.position.set(3,8,-2);sun.target.position.set(0,0,-6.5);room.add(sun,sun.target);

 anchor([0,1.1,4.75],'Step outside',exit);
 let time=0;
 function tick(dt,minutes=720){
  time+=dt;
  const day=daylight(minutes),night=1-day;
  seaMat.color.setRGB(.25+.75*day,.3+.7*day,.45+.55*day);
  lanternGlow.emissiveIntensity=night*1.4;outdoor.intensity=night*5;sun.intensity=day*1.6;
  for(const s of steam){const u=(s.userData.phase+time*s.userData.speed)%1,[x,y,z]=s.userData.base;s.position.set(x+Math.sin(u*6+x)*.15,y+.1+u*1.4,z);s.scale.setScalar(.35+u*.9);s.material.opacity=.3*Math.sin(u*Math.PI)*(.55+.45*night);}
  const k=time*1.3;tubWater.position.y=T.water+Math.sin(k)*.004;poolWater.position.y=P.water+Math.sin(k*.8+1)*.005;
  fanHead.rotation.y=Math.sin(time*.4)*.9;blades.rotation.z+=dt*18;
  const m=((minutes%1440)+1440)%1440;hands[0].rotation.z=-(m%720)/720*Math.PI*2;hands[1].rotation.z=-(m%60)/60*Math.PI*2;
  animateFigure(attendant,time,3);
 }
 tick(0);
 return {...ONSEN_ROOM,colliders,tick,seats:ONSEN_SEATS,dispose(){}};
}
