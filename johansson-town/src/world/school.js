import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';
import {GROUND_LAYER} from './ground-layers.js';
import {SCHOOL,SCHOOL_COLUMNS,FUKUGI,schoolColliders} from './school-layout.js';
import {createKit} from './okinawa/kit.js';
import {playSchoolChime,CHIME_TIMES} from '../audio/school-chime.js';

/**
 * 港小中学校, Minato Elementary & Junior High School, on the ground.
 *
 * The concrete block, the gateposts and their shisa, the bike shed, the taps, the iron
 * bars and the sea defences are a Blender model (tools/blender/build-school.py) that
 * streams in as you come near. What is made here is what has to be drawn sharp or has
 * to move: the coral-sand yard and the lines chalked on the field, the hana-block
 * screens with the light through them, the fukugi windbreak, the lettering, the clock's
 * hands, and the chime. Colliders and prompts are in place from the start.
 *
 * The classroom you can walk into is src/world/interiors/classroom.js.
 */
const B=SCHOOL.building;

function canvasTexture(width,height,draw,{srgb=true,repeat=null}={}){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
 const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
 if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);}
 return t;
}
const SERIF='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';

/**
 * The yard: packed coral sand, the red-clay field with its chalk track and lines, the
 * sandpit, the paths feet have worn to the entrance and the taps, and the dark patch the
 * taps keep wet.
 */
function buildYard(group){
 const W=SCHOOL.maxX-SCHOOL.minX+.8,D=SCHOOL.seawall.south-SCHOOL.minZ,PX=36;   // pixels per metre
 const map=canvasTexture(Math.round(W*PX),Math.round(D*PX),(ctx,w,h)=>{
  const X=x=>(x-SCHOOL.minX+.4)*PX,Z=z=>(z-SCHOOL.minZ)*PX;
  let seed=1997;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  ctx.fillStyle='#d6ccae';ctx.fillRect(0,0,w,h);
  const speckle=(x0,y0,x1,y1,colours,count,size)=>{for(let i=0;i<count;i++){ctx.fillStyle=colours[i%colours.length];const x=x0+rnd()*(x1-x0),y=y0+rnd()*(y1-y0),r=size*(.4+rnd());ctx.beginPath();ctx.ellipse(x,y,r,r*(.5+rnd()*.5),rnd()*3,0,Math.PI*2);ctx.fill();}};
  speckle(0,0,w,h,['#e2d9bd','#c9bf9f','#ece4cc','#bdb292'],9000,2.2);
  // The old sports ground, as the town hall uses it: a paved forecourt to the entrance,
  // the car park on the east end with its white bays, a lawn with flower beds in the
  // middle, and the power house on the west end (built in buildPowerHouse).
  const f=SCHOOL.field,pk=SCHOOL.parking,ph=SCHOOL.powerHouse;
  ctx.fillStyle='#6f9f55';ctx.fillRect(X(23.6),Z(f.minZ+.6),(pk.minX-24.4)*PX,(f.maxZ-f.minZ-1.6)*PX);
  speckle(X(23.6),Z(f.minZ+.6),X(pk.minX-.8),Z(f.maxZ-1),['#79aa5d','#649650','#86b468'],3000,2.4);
  for(const [x0,x1,z0,z1] of [[24.4,29.2,29.6,30.6],[24.4,29.2,34.4,35.4]]){ctx.fillStyle='#8a5a3a';ctx.fillRect(X(x0),Z(z0),(x1-x0)*PX,(z1-z0)*PX);
   for(let i=0;i<60;i++){ctx.fillStyle=['#d8342c','#f4d23c','#e98aa6','#f4f1ea'][i%4];ctx.beginPath();ctx.arc(X(x0+.2+((i*37)%100)/100*(x1-x0-.4)),Z(z0+.2+((i*53)%100)/100*(z1-z0-.4)),.09*PX,0,Math.PI*2);ctx.fill();}}
  // Forecourt pavers from the gate to the canopy.
  ctx.fillStyle='#c9c3b4';ctx.fillRect(X(18.2),Z(SCHOOL.gate.z),(23.6-18.2)*PX,(SCHOOL.corridor.minZ-SCHOOL.gate.z)*PX);
  ctx.strokeStyle='rgba(150,142,126,.5)';ctx.lineWidth=1;for(let z=SCHOOL.gate.z;z<SCHOOL.corridor.minZ;z+=.3){ctx.beginPath();ctx.moveTo(X(18.2),Z(z));ctx.lineTo(X(23.6),Z(z));ctx.stroke();}
  // The car park: asphalt, white bays, a 来客用 (visitors) bay by the path.
  ctx.fillStyle='#9fa4aa';ctx.fillRect(X(pk.minX),Z(pk.minZ),(pk.maxX-pk.minX)*PX,(pk.maxZ-pk.minZ)*PX);
  ctx.fillStyle='#f2efe6';for(let x=pk.minX+.4;x<=pk.maxX;x+=2.6)ctx.fillRect(X(x),Z(pk.minZ+.2),.1*PX,(pk.maxZ-pk.minZ-.6)*PX);
  ctx.font=`bold ${.5*PX}px ${GOTHIC}`;ctx.fillText('来客用',X(pk.maxX-2.2),Z(pk.maxZ-.6));
  // The power house's concrete apron and the fuel tank's bund.
  ctx.fillStyle='#b3ae9f';ctx.fillRect(X(ph.minX-.3),Z(ph.minZ-.4),(ph.maxX-ph.minX+1.6)*PX,(ph.tank[1]-ph.minZ+1.5)*PX);
  // Worn paths: gate to entrance, entrance to taps; the wet patch round the taps.
  ctx.strokeStyle='rgba(176,164,134,.5)';ctx.lineCap='round';ctx.lineWidth=1.4*PX;
  const tap=SCHOOL.wash;const wet=ctx.createRadialGradient(X(tap.x),Z(tap.z-.8),0,X(tap.x),Z(tap.z-.8),2.2*PX);
  wet.addColorStop(0,'rgba(120,112,92,.55)');wet.addColorStop(1,'rgba(120,112,92,0)');ctx.fillStyle=wet;ctx.fillRect(X(tap.x-3),Z(tap.z-3.2),6*PX,4*PX);
  // Under the bike shed, a concrete pad; behind the block, weeds in the sand.
  const b=SCHOOL.bikeShed;ctx.fillStyle='#b3ae9f';ctx.fillRect(X(b.minX),Z(b.minZ+.8),(b.maxX-b.minX)*PX,(b.maxZ-b.minZ-.8)*PX);
  speckle(X(SCHOOL.minX),Z(B.maxZ+.4),X(SCHOOL.maxX),Z(SCHOOL.seawall.south),['#8e9a62','#7d8a55','#a2a974'],1400,3.2);
  // The corridor's concrete apron.
  ctx.fillStyle='#aeab9f';ctx.fillRect(X(B.minX-.3),Z(SCHOOL.corridor.minZ-.2),(B.maxX-B.minX+.6)*PX,(B.minZ-SCHOOL.corridor.minZ+.2)*PX);
 });
 const yard=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({map,roughness:.97}));
 yard.rotation.x=-Math.PI/2;yard.position.set((SCHOOL.minX-.4+SCHOOL.maxX+.4)/2,GROUND_LAYER.grass,(SCHOOL.minZ+SCHOOL.seawall.south)/2);
 yard.name='school-yard';yard.receiveShadow=true;group.add(yard);
 return yard;
}

/**
 * Hana-block: the pierced concrete breeze block Okinawa builds screens and garden walls
 * out of, for the wind to go through and the sun not to. One block to a tile of the
 * texture; the holes are real holes, so the light through them lands on the floor as the
 * lattice it is.
 */
export function hanaBlockMaterial(){
 const tile=canvasTexture(128,128,(ctx,w,h)=>{
  ctx.fillStyle='#dcd8ca';ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='destination-out';
  // Four petals round a centre boss, and a quarter-round in each corner.
  const petal=(a)=>{ctx.save();ctx.translate(64,64);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,-30,11,21,0,0,Math.PI*2);ctx.fill();ctx.restore();};
  for(let k=0;k<4;k++)petal(k*Math.PI/2);
  for(const [x,y] of [[0,0],[128,0],[0,128],[128,128]]){ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();}
  ctx.globalCompositeOperation='source-over';
  ctx.strokeStyle='rgba(120,116,104,.55)';ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,125,125);
  ctx.fillStyle='#e8e4d7';ctx.beginPath();ctx.arc(64,64,9,0,Math.PI*2);ctx.fill();
 });
 const material=new THREE.MeshStandardMaterial({map:tile,alphaTest:.5,roughness:.95,side:THREE.DoubleSide});
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tile,alphaTest:.5,side:THREE.DoubleSide});
 return {material,depth,tile};
}
export function hanaScreen(group,{material,depth,tile},x0,x1,y0,y1,z,alongX=true,name='Hana-block screen'){
 const w=alongX?x1-x0:z[1]-z[0],h=y1-y0;
 const map=tile.clone();map.needsUpdate=true;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(w/.2,h/.2);
 const m=material.clone();m.map=map;
 const d=depth.clone();d.map=map;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);screen.customDepthMaterial=d;
 if(alongX)screen.position.set((x0+x1)/2,(y0+y1)/2,z);
 else{screen.position.set(x0,(y0+y1)/2,(z[0]+z[1])/2);screen.rotation.y=Math.PI/2;}
 screen.castShadow=true;screen.receiveShadow=true;screen.name=name;group.add(screen);
 // A frame of plain block round it, so it is a wall with a pattern in it and not a sheet.
 const frame=new THREE.MeshStandardMaterial({color:0xd6d2c4,roughness:.95});
 const bar=(sx,sy,sz,px,py,pz)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),frame);b.position.set(px,py,pz);b.castShadow=true;b.receiveShadow=true;group.add(b);};
 if(alongX){bar(w+.04,.08,.16,(x0+x1)/2,y1+.04,z);}
 else{bar(.16,.08,w+.04,x0,y1+.04,(z[0]+z[1])/2);}
 return screen;
}

/** Fukugi: tall, narrow, dense and dark, planted in lines against the wind. */
function buildFukugi(group,shadows){
 const crown=new THREE.IcosahedronGeometry(1,2);
 {const p=crown.attributes.position,n=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),l=Math.hypot(x,y,z)||1;n[i*3]=x/l;n[i*3+1]=y/l;n[i*3+2]=z/l;}crown.setAttribute('normal',new THREE.BufferAttribute(n,3));}
 const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.18,1,7),new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:1}),FUKUGI.length);
 const leaves=new THREE.InstancedMesh(crown,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7}),FUKUGI.length*3);
 const d=new THREE.Object3D(),c=new THREE.Color();
 FUKUGI.forEach(([x,z],i)=>{
  const h=5.2+((i*37)%10)/10*1.6;
  d.position.set(x,h*.22,z);d.scale.set(1,h*.44,1);d.rotation.set(0,0,0);d.updateMatrix();trunks.setMatrixAt(i,d.matrix);
  for(let k=0;k<3;k++){
   const y=h*(.45+k*.2),r=1.25-k*.25;
   d.position.set(x+Math.sin(i+k)*.12,y,z+Math.cos(i*2+k)*.12);d.scale.set(r,h*.2+(2-k)*.25,r*.92);d.rotation.set(0,i*1.3+k,0);d.updateMatrix();
   leaves.setMatrixAt(i*3+k,d.matrix);leaves.setColorAt(i*3+k,c.setHex(k===2?0x3e6b3a:0x2f5a31).multiplyScalar(.9+((i+k)%3)*.07));
  }
 });
 trunks.name='School fukugi trunks';leaves.name='School fukugi';
 for(const m of [trunks,leaves]){m.castShadow=!!shadows;m.receiveShadow=true;group.add(m);}
}

function plate(group,text,{w,h,at,rotY=0,bg='#f1ead6',fg='#1f2a26',font=SERIF,vertical=false,size=.7,sub=null,name}){
 const px=256,cw=Math.round(w*px),ch=Math.round(h*px);
 const map=canvasTexture(cw,ch,(ctx)=>{
  ctx.fillStyle=bg;ctx.fillRect(0,0,cw,ch);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
  if(vertical){const chars=[...text],s=Math.min(cw*size,(sub?ch*.8:ch*.94)/chars.length);ctx.font=`bold ${s}px ${font}`;chars.forEach((c,i)=>ctx.fillText(c,cw/2,ch*.05+s*(i+.55)));
   if(sub){ctx.font=`bold ${cw*.16}px ${GOTHIC}`;ctx.fillText(sub,cw/2,ch*.95);}}
  else{ctx.font=`bold ${ch*size}px ${font}`;ctx.fillText(text,cw/2,sub?ch*.4:ch*.54,cw*.94);if(sub){ctx.font=`bold ${ch*.2}px ${GOTHIC}`;ctx.fillText(sub,cw/2,ch*.82,cw*.94);}}
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.8}));
 mesh.position.set(...at);mesh.rotation.y=rotY;mesh.name=name||text;group.add(mesh);return mesh;
}

/** Room plates, hung out from the corridor ceiling over each door, as every school has them. */
const ROOMS=[
 ['住民課','資料室'],['昇降口','会議室'],['総務課','5・6年'],['保健室','議場'],['町長室','公民館'],['産業課','図書室'],['町長宅','倉庫'],
];

/** The noticeboard in the entrance: harbour safety, the typhoon shelter map, the co-op. */
function noticeboard(group){
 const map=canvasTexture(560,460,(ctx,w0,h0)=>{
  // Laid out on a 640 x 400 board and fitted to the narrow wall beside the entrance.
  ctx.scale(560/640,460/400);const w=640,h=400;
  ctx.fillStyle='#6b5a44';ctx.fillRect(0,0,w,h);ctx.fillStyle='#c9ae83';ctx.fillRect(12,12,w-24,h-24);
  let seed=5;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const note=(x,y,nw,nh,bg,rot,lines,head)=>{ctx.save();ctx.translate(x+nw/2,y+nh/2);ctx.rotate(rot);ctx.fillStyle=bg;ctx.fillRect(-nw/2,-nh/2,nw,nh);
   ctx.fillStyle='#b3382c';ctx.beginPath();ctx.arc(0,-nh/2+8,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a2520';ctx.textAlign='center';
   ctx.font=`bold 20px ${GOTHIC}`;ctx.fillText(head,0,-nh/2+34);ctx.font=`13px ${GOTHIC}`;lines.forEach((l,i)=>ctx.fillText(l,0,-nh/2+58+i*18));ctx.restore();};
  note(26,26,200,160,'#f4efdf',-.03,['台風のときは','港小体育館・公民館へ','非常持出袋の確認を','Typhoon shelters:','school gym, community hall'],'台風避難所');
  note(242,30,170,150,'#fff7c9',.02,['岸壁で遊ばない','Do not play on','the quay or the','tetrapods'],'港の安全');
  note(430,24,186,176,'#e3f0e6',-.015,['ハーリー大会','旧暦五月四日','漁協 青年部','Harbour boat race','co-op youth section'],'漁協より');
  note(40,206,250,168,'#f6f1e6',.01,['避難場所地図','Shelter map'],'港町 避難地図');
  // The map on that notice: the harbour, the school, the hall, drawn with a felt pen.
  ctx.strokeStyle='#3f6f9a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(60,330);ctx.quadraticCurveTo(160,300,270,340);ctx.stroke();
  ctx.fillStyle='#b3382c';ctx.fillRect(120,290,26,18);ctx.fillRect(200,300,20,14);ctx.fillStyle='#2a2520';ctx.font=`11px ${GOTHIC}`;ctx.fillText('学校',120,284);ctx.fillText('公民館',196,296);
  note(312,210,150,160,'#f4efdf',-.02,['給食だより','九月','ゴーヤーチャンプルー','ソーキ汁','あじフライ'],'給食');
  note(478,214,140,150,'#ffe1d6',.03,['落とし物','Lost: one','blue sandal','(left foot)'],'おとしもの');
 });
 // On the wall between the column and the entrance, where you wait for the doors.
 const board=new THREE.Mesh(new THREE.BoxGeometry(.95,.78,.05),[...Array(4).fill(new THREE.MeshStandardMaterial({color:0x5c4b39})),new THREE.MeshStandardMaterial({color:0x5c4b39}),new THREE.MeshStandardMaterial({map,roughness:.9})]);
 board.position.set(SCHOOL.genkan.x-1.78,1.6,B.minZ-.16);board.name='School noticeboard';group.add(board);
 return board;
}

/** The clock on the tower. Its face is in the model; the hands follow the town clock. */
function clockHands(group){
 const centre=new THREE.Vector3(SCHOOL.genkan.x,8.35,SCHOOL.tower.minZ-.24);
 const black=new THREE.MeshStandardMaterial({color:0x1d1d1d,roughness:.6});
 const hand=(length,width)=>{const g=new THREE.Group();g.position.copy(centre);const m=new THREE.Mesh(new THREE.BoxGeometry(width,length,.02),black);m.position.y=length/2-.06;g.add(m);group.add(g);return g;};
 const hour=hand(.38,.06),minute=hand(.56,.04);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.04,12),black);cap.rotation.x=Math.PI/2;cap.position.copy(centre);cap.position.z-=.02;group.add(cap);
 // Seen from the field (-z), clockwise is the hands turning about +z.
 return minutes=>{const m=((minutes%1440)+1440)%1440;minute.rotation.z=(m%60)/60*Math.PI*2;hour.rotation.z=((m/60)%12)/12*Math.PI*2;};
}

/**
 * @param {object} world
 * @param {object} options register / onAction / enter / sites / shadows, as the town gives them
 */
/**
 * The model was built as a school, with iron bars, a sandpit kerb and a line of tyres on
 * its sports ground, all merged into the same meshes as the building. Those triangles go
 * when the model arrives: anything whose centre falls in one of these boxes (world
 * metres, x0 x1 y0 y1 z0 z1).
 */
const SCHOOL_ONLY=Object.freeze([
 [36.8,39.8,-.1,1.6,32.2,32.8],
 [35.5,39.7,-.1,.3,29.3,31.9],
 [13.3,14.4,-.1,.5,29.9,34.1],
]);
function stripSchoolYard(scene){
 scene.updateMatrixWorld(true);
 const v=new THREE.Vector3(),c=new THREE.Vector3();
 scene.traverse(o=>{
  if(!o.isMesh||!o.geometry.index)return;
  const pos=o.geometry.attributes.position,idx=o.geometry.index.array,keep=[];
  for(let i=0;i<idx.length;i+=3){
   c.set(0,0,0);for(let k=0;k<3;k++)c.add(v.fromBufferAttribute(pos,idx[i+k]).applyMatrix4(o.matrixWorld));c.multiplyScalar(1/3);
   if(SCHOOL_ONLY.some(([x0,x1,y0,y1,z0,z1])=>c.x>x0&&c.x<x1&&c.y>y0&&c.y<y1&&c.z>z0&&c.z<z1))continue;
   keep.push(idx[i],idx[i+1],idx[i+2]);
  }
  if(keep.length!==idx.length)o.geometry.setIndex(keep);
 });
}

/**
 * The town hall's additions to the old school, all from the Okinawan kit: the power
 * house (two diesel sets behind louvred walls, two exhaust stacks, the fuel tank in its
 * bund, the cable going out to the poles), the concrete canopy over the entrance, the
 * town's kei truck and car in the car park, the flags on the pole, and a monument sign
 * by the gate. Returns nothing; colliders are in schoolColliders().
 */
function buildTownHallDressing(group,options){
 const kit=createKit({shadows:options.shadows});
 const ph=SCHOOL.powerHouse,wall=0xdcd6c6,trim=0x2f5f6a,steel=0x8e979a;
 const cx=(ph.minX+ph.maxX)/2,cz=(ph.minZ+ph.maxZ)/2,H=ph.height;
 kit.block(ph.minX,ph.maxX,0,H,ph.minZ,ph.maxZ,wall);
 kit.block(ph.minX-.1,ph.maxX+.1,H,H+.15,ph.minZ-.1,ph.maxZ+.1,0xc8c2b5);
 kit.block(ph.minX-.05,ph.maxX+.05,0,.3,ph.minZ-.05,ph.maxZ+.05,0xa9aa9c);
 // Louvred vents down both long walls, and the steel double doors facing the forecourt.
 for(const z of [ph.minZ-.03,ph.maxZ+.03])for(let x=ph.minX+.6;x<ph.maxX-.4;x+=1.3){kit.box(.9,.9,.04,x+.45,2.2,z,0x6f7579);for(let k=0;k<6;k++)kit.box(.86,.04,.06,x+.45,1.82+k*.15,z,0x4f5559);}
 kit.box(.06,2.4,1.9,ph.maxX+.03,1.2,ph.door[1],0x6f8a8e);kit.box(.07,2.4,.04,ph.maxX+.05,1.2,ph.door[1],0x3a3d3f);
 kit.box(.6,.4,.02,ph.maxX+.04,2.75,ph.door[1],0xe0b93a);
 kit.box(.4,.16,.02,ph.maxX+.045,2.75,ph.door[1],0x2b2b2b);
 // Two exhaust stacks with rain caps, sooty at the top, through the roof.
 for(const z of [cz-1.2,cz+1.2]){kit.cyl(.17,.19,3.2,ph.minX+1.2,H+1.5,z,0x7a7d78,{segments:8});kit.cyl(.26,.26,.08,ph.minX+1.2,H+3.15,z,0x3a3d3f,{segments:8});kit.cyl(.18,.18,.5,ph.minX+1.2,H+2.85,z,0x4a4a46,{segments:8});}
 // The day tank: a horizontal steel tank on saddles inside a low bund wall.
 const [tx,tz]=ph.tank;
 kit.block(tx-1.6,tx+1.6,0,.45,tz-.7,tz-.55,0xc8c2b5);kit.block(tx-1.6,tx+1.6,0,.45,tz+.55,tz+.7,0xc8c2b5);
 kit.block(tx-1.6,tx-1.45,0,.45,tz-.7,tz+.7,0xc8c2b5);kit.block(tx+1.45,tx+1.6,0,.45,tz-.7,tz+.7,0xc8c2b5);
 kit.cyl(.5,.5,2.6,tx,1.05,tz,0xe6e3d6,{rz:Math.PI/2,segments:14});
 for(const dx of [-.8,.8])kit.box(.15,.6,.9,tx+dx,.3,tz,steel);
 kit.box(1,.25,.02,tx,1.1,tz+.51,0xc0392b);
 kit.rod([tx-1.3,1.05,tz],[ph.minX+2,1.05,ph.maxZ+.02],.04,0x3a3d3f);
 // The cable out of the switchboard, up a riser pole to the town's lines.
 kit.rod([ph.maxX-.4,H,ph.minZ+.3],[ph.maxX-.4,H+1.5,ph.minZ-.6],.05,0x2b2a30);
 // The canopy over the entrance: a thin concrete slab on two round columns.
 const c=SCHOOL.canopy;
 kit.block(c.minX,c.maxX,c.height,c.height+.2,c.minZ,c.maxZ+.1,0xe4e1d3);
 kit.block(c.minX,c.maxX,c.height+.2,c.height+.32,c.minZ,c.minZ+.12,trim);
 for(const x of [c.minX+.2,c.maxX-.2])kit.cyl(.14,.14,c.height,x,c.height/2,c.minZ+.2,0xe4e1d3,{segments:12});
 // The town's vehicles in their bays: the works kei truck and the white town car.
 const truck=(x,z,col)=>{kit.box(1.4,1.1,1.1,x,.75,z-.9,col);kit.box(1.4,.5,1.9,x,.55,z+.6,col);kit.box(1.3,.04,1.8,x,.82,z+.6,0x5d6265);
  for(const [dx,dz] of [[-.65,-.9],[.65,-.9],[-.65,1.1],[.65,1.1]])kit.cyl(.26,.26,.18,x+dx,.26,z+dz,0x1f2124,{rz:Math.PI/2,segments:10});
  kit.box(1.32,.45,.04,x,1.0,z-1.46,0x5d7a84);};
 truck(32.4,30.7,0xf2f0ea);
 kit.box(1.6,.75,3.4,35.4,.6,30.7,0xf4f1ea);kit.box(1.4,.55,1.8,35.4,1.25,30.9,0xf4f1ea);kit.box(1.36,.42,.04,35.4,1.25,29.99,0x5d7a84);
 for(const [dx,dz] of [[-.75,-1.1],[.75,-1.1],[-.75,1.1],[.75,1.1]])kit.cyl(.3,.3,.2,35.4+dx,.3,30.7+dz,0x1f2124,{rz:Math.PI/2,segments:10});
 kit.box(.02,.3,.6,36.21,.8,30.7,0x2f6f9f);
 // A monument sign of polished stone at the gate, the way every town hall has one.
 const g=SCHOOL.gate;kit.box(2.4,1.3,.4,g.x+3.4,.65,g.z+.6,0x4a4f52,{finish:'gloss'});kit.box(2.6,.15,.55,g.x+3.4,.07,g.z+.6,0x9a958a);
 kit.finish(group,'Town hall dressing');
 plate(group,'港町役場 · 公民館',{w:2.1,h:.62,at:[g.x+3.4,.75,g.z+.39],rotY:Math.PI,bg:'#4a4f52',fg:'#efe6cc',size:.36,sub:'MINATO TOWN HALL · COMMUNITY CENTRE',name:'Town hall monument'});
 plate(group,'発電所',{w:1.4,h:.4,at:[ph.maxX+.06,3.2,ph.door[1]],rotY:Math.PI/2,bg:'#e6ecef',fg:'#2f4f5a',size:.6,name:'Power house sign'});
 // Flags on the old school's pole: Japan and the town.
 const flag=(y,draw)=>{const t=canvasTexture(140,96,draw);const f=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.95),new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:.9}));f.position.set(SCHOOL.flagpole.x-.74,y,SCHOOL.flagpole.z);f.rotation.y=Math.PI;f.name='Town hall flag';group.add(f);};
 flag(8.2,(cx2,w0,h0)=>{cx2.fillStyle='#f4f1ea';cx2.fillRect(0,0,w0,h0);cx2.fillStyle='#c8102e';cx2.beginPath();cx2.arc(w0/2,h0/2,h0*.3,0,Math.PI*2);cx2.fill();});
 flag(7.1,(cx2,w0,h0)=>{cx2.fillStyle='#2f6f9f';cx2.fillRect(0,0,w0,h0);cx2.fillStyle='#f4f1ea';cx2.font=`bold 50px ${SERIF}`;cx2.textAlign='center';cx2.textBaseline='middle';cx2.fillText('港',w0/2,h0/2);});
}

export function buildSchool(world,options){
 const group=new THREE.Group();group.name='Minato school';world.group.add(group);
 world.colliders.push(...schoolColliders());
 buildYard(group);
 const hana=hanaBlockMaterial();
 // Everything fixed to the block or the gateposts goes up with them when the model
 // arrives: before that it would be hanging in the air where the building will be.
 const onBuilding=new THREE.Group();onBuilding.name='Minato school fittings';
 // The upper corridor's balustrade, bay by bay between the columns.
 for(let i=0;i<SCHOOL_COLUMNS.length-1;i++)
  hanaScreen(onBuilding,hana,SCHOOL_COLUMNS[i]+.2,SCHOOL_COLUMNS[i+1]-.2,B.floor+B.storey+.35,B.floor+B.storey+1.15,SCHOOL.corridor.minZ+.1);
 // The boundary wall against the headland, and the wall of the bike shed's end.
 hanaScreen(group,hana,SCHOOL.westWall,0,.3,1.7,[SCHOOL.minZ,SCHOOL.seawall.south],false,'School boundary wall');
 {const base=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,SCHOOL.seawall.south-SCHOOL.minZ),new THREE.MeshStandardMaterial({color:0xbdb8a9,roughness:.95}));
  base.position.set(SCHOOL.westWall,.15,(SCHOOL.minZ+SCHOOL.seawall.south)/2);base.receiveShadow=true;group.add(base);}
 world.colliders.push({id:'school-boundary-wall',x:SCHOOL.westWall,z:(SCHOOL.minZ+SCHOOL.seawall.south)/2,w:.3,d:SCHOOL.seawall.south-SCHOOL.minZ,height:1.8});
 buildFukugi(group,options.shadows);
 buildTownHallDressing(group,options);

 // Lettering.
 plate(onBuilding,'港町役場',{w:.42,h:1.18,at:[SCHOOL.gate.x-SCHOOL.gate.half,.88,SCHOOL.gate.z-.31],rotY:Math.PI,vertical:true,bg:'#e9dfc5',fg:'#1b1b1b',size:.62,name:'School gate plate'});
 plate(onBuilding,'港 町 役 場',{w:4.6,h:.56,at:[27,7.08,SCHOOL.corridor.minZ-.29],rotY:Math.PI,bg:'#e4e1d3',fg:'#2d5a4c',size:.78,name:'School name on parapet'});
 plate(onBuilding,'玄 関',{w:1.2,h:.3,at:[SCHOOL.genkan.x,2.62,B.minZ-.13],rotY:Math.PI,bg:'#e4e1d3',fg:'#2b2b2b',font:GOTHIC,size:.72,name:'Entrance plate'});
 ROOMS.forEach(([down,up],i)=>{
  const x=SCHOOL_COLUMNS[i]+.8;
  for(const [text,y] of [[down,B.floor+B.storey-.62],[up,B.floor+2*B.storey-.62]]){
   if(text==='昇降口')continue;
   plate(onBuilding,text,{w:.62,h:.2,at:[x,y,B.minZ-.55],rotY:Math.PI/2,bg:'#f3f0e4',fg:'#23302a',font:GOTHIC,size:.66,name:'Room plate '+text});
   plate(onBuilding,text,{w:.62,h:.2,at:[x,y,B.minZ-.55],rotY:-Math.PI/2,bg:'#f3f0e4',fg:'#23302a',font:GOTHIC,size:.66,name:'Room plate '+text});
  }
 });
 const board=noticeboard(onBuilding);
 const setClock=clockHands(onBuilding);

 // Prompts.
 const anchor=(at,label,fn)=>{const o=new THREE.Object3D();o.position.set(...at);group.add(o);options.register?.(o,label,fn);return o;};
 const say=(title,text)=>()=>options.onAction?.('inspect',title,text);
 options.register?.(board,'Read the noticeboard',()=>options.onAction?.('read','School noticeboard',
  'Pinned in the entrance of the town hall, one over another: 台風避難所 -- in a typhoon, the school gym and the community hall are the shelters, check your emergency bag. 港の安全 -- do not play on the quay or the tetrapods. From the fishing co-op, the youth section is taking crews for the harbour boat race (ハーリー) on the fourth day of the fifth month. A felt-pen map of the town with the shelters in red. This month\'s kyūshoku: goya champuru, sōki-jiru, fried aji. Lost: one blue sandal, left foot.'));
 anchor([SCHOOL.gate.x-SCHOOL.gate.half,1.9,SCHOOL.gate.z-.9],'Greet the shisa',say('Shisa on the gateposts',
  'A pair of glazed shisa, one on each post: the one on the right with its mouth open to take in good fortune, the one on the left with its mouth shut to keep it. Somebody has put a hibiscus flower behind the left one\'s ear.'));
 anchor([SCHOOL.gate.x-SCHOOL.gate.half,1,SCHOOL.gate.z-.7],'Read the town hall gate plate',say('港町役場 · Minato Town Hall',
  'The town office, the assembly room, the mayor\'s office and, upstairs, the island school\'s one classroom: eight pupils, the 5th and 6th years together. Built in concrete in 1971 as the school after a typhoon took the wooden one; the town office moved in when the junior high closed in 1989. The mayor lives in the east wing.'));
 anchor([SCHOOL.wash.x,1,SCHOOL.wash.z-.8],'Rinse your feet at the taps',()=>options.onAction?.('school-taps'));
 anchor([(SCHOOL.bikeShed.minX+SCHOOL.bikeShed.maxX)/2,1,SCHOOL.bikeShed.minZ+.4],'Look at the bicycles',say('Bike shed',
  'Bicycles under a zinc roof rusted through at the ribs: the town office staff\'s, two children\'s with names in marker on the mudguards, and the postman\'s spare.'));
 anchor([SCHOOL.powerHouse.door[0]+.4,1.2,SCHOOL.powerHouse.door[1]],'Look in at the generators',say('Minato power station · 港町発電所',
  'Through the open steel doors: two diesel generator sets, green and yellow, each as long as a kei truck, one thudding, one resting. A switchboard of black dials and red lamps runs along the back wall; the needles sit on 6,600 volts and 50 cycles. Every light on the island comes out of this room. The day tank outside is filled from the oil jetty when the tanker is in. Mr Shimabukuro keeps the logbook on a clipboard by the door.'));
 anchor([SCHOOL.gate.x+3.4,1,SCHOOL.gate.z+1.2],'Read the monument',say('港町役場 · 公民館',
  'Minato Town Hall and Community Centre. Polished granite, the characters cut and filled with gold that has mostly worn away. Underneath, smaller: 昭和四十六年 小中学校として建設 · 平成元年 役場として開庁 (built as the school, 1971; opened as the town hall, 1989).'));
 anchor([SCHOOL.genkan.x+6,1,SCHOOL.seawall.south-.8],'Look over the seawall',say('South seawall',
  'Tetrapods stacked against the wall, and beyond them the reef flat going green and then blue. In a typhoon the spray comes over this wall and salts the classroom windows white.'));
 anchor([SCHOOL.flagpole.x,1.1,SCHOOL.flagpole.z-.6],'Listen to the speakers',say('Horn speakers',
  'Two grey horns on the flagpole and two on the tower: the town\'s 防災無線, the disaster radio. The chime comes out of them at 8:25, noon, 12:20, 15:30 and 17:00 -- the Westminster quarters, a little slow and a little flat, heard all over the harbour -- and typhoon warnings when there are any.'));

 // The door. The school keeps a site like any building in town, so the map, the
 // directory and the doorway carry you in and out the way they do everywhere else.
 const door=[SCHOOL.genkan.x,0,B.minZ-.7];
 const site={id:'school',title:'Town Hall Classroom',jp:'港町役場 · 教室',sub:'5・6年 · 8 PUPILS',x:SCHOOL.genkan.x,z:B.minZ-.7,color:0x587a6a,accent:'#2d5a4c',
  line:'Lessons 8:30–15:30 · kyūshoku 12:20 · visitors sign in at the staff room',door,exitPosition:[SCHOOL.genkan.x,0,B.minZ-1.4],
  approachPosition:[SCHOOL.genkan.x,0,B.minZ-1.4],entryFacing:Math.PI,opens:'07:30'};
 options.sites.push(site);
 anchor([SCHOOL.genkan.x,1.2,B.minZ-.5],'Go up to the 5・6年 classroom',()=>options.enter(site));
 // The mayor's office and the mayor's home: two more doors along the field face, each
 // its own room (interiors/town-hall.js), the way every door in town is its own site.
 for(const [id,title,jp,sub,x,label,line] of [
  ['mayor-office','Mayor’s Office','町長室','MINATO TOWN HALL',30.6,'Go into the mayor’s office','Office hours 8:30–17:15 · petitions in the tray'],
  ['mayor-home','Mayor’s House','町長宅','JOHANSSON',37.7,'Go home','Your rooms in the east wing'],
 ]){
  const at=[x,0,B.minZ-.7],s={id,title,jp,sub,x,z:B.minZ-.7,color:0x587a6a,accent:'#2d5a4c',line,door:at,exitPosition:[x,0,B.minZ-1.4],approachPosition:[x,0,B.minZ-1.4],entryFacing:Math.PI,opens:'00:00'};
  options.sites.push(s);
  plate(onBuilding,jp,{w:.9,h:.26,at:[x,2.45,B.minZ-.13],rotY:Math.PI,bg:'#e4e1d3',fg:'#2b2b2b',font:GOTHIC,size:.72,name:'Door plate '+jp});
  anchor([x,1.2,B.minZ-.5],label,()=>options.enter(s));
 }

 let model=null;
 registerDetail(world,{id:'school',x:(B.minX+B.maxX)/2,z:(SCHOOL.minZ+SCHOOL.maxZ)/2,radius:80,load:async()=>{
  const response=await fetch(assetURL('models/school/minato-school.glb'));if(!response.ok)return false;
  const scene=(await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;
  scene.name='Minato town hall buildings';scene.userData.sharedAsset=true;
  stripSchoolYard(scene);
  scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=!!options.shadows;o.receiveShadow=!!options.shadows;
   // Mould and rust are decals a few millimetres off the paint. Written into depth they
   // gave the ink pass an edge to draw, and every streak came out as a stuck-on tab.
   if(/stain/i.test(o.material.name)){Object.assign(o.material,{depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});o.renderOrder=1;o.castShadow=false;}});
  group.add(scene,onBuilding);model=scene;return true;
 }});

 let lastMinute=null;
 function tick(time,minutes,listener){
  setClock(minutes);
  const m=Math.floor(((minutes%1440)+1440)%1440);
  if(lastMinute!==null&&m!==lastMinute&&CHIME_TIMES.includes(m)){
   // Heard over the whole harbour end of town, louder the nearer you are.
   const d=listener?Math.hypot(listener.x-SCHOOL.flagpole.x,listener.z-SCHOOL.flagpole.z):0;
   if(d<110)playSchoolChime(Math.max(.15,1-d/110));
  }
  lastMinute=m;
 }
 return {group,site,tick,get model(){return model;}};
}
