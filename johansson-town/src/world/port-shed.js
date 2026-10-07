import * as THREE from '../../vendor/three.module.js';
import {createAvatarActor,updateAvatarActor} from '../avatars/actors.js';
import {reach} from '../avatars/consume.js';
import {buildBeerBottle} from '../people/izakaya-serving-visuals.js';
import {fujitaBeer,laughingAt,seeded,tvProgramme} from './fujita-day.js';
export {tvProgramme} from './fujita-day.js';

/**
 * Mr Fujita's shed on the working pier.
 *
 * A fisherman's banya: timber framed, clad in corrugated iron gone to rust at the seams,
 * open along the pier side so the breeze comes through. Mr Fujita, retired, more or less
 * lives in it. He sits in a sagging armchair with a small glass of beer and flips channels on
 * an old CRT on a fish crate (fujita-day.js: what is on, when he laughs, how the beer goes):
 * the ballgame in the afternoon, the news, the variety shows, snow when the signal goes. His
 * Umineko comes in large bottles from Higa Liquor's morning van: the crates stand at his
 * right hand, the bottle he is on at his left foot, and the empties pile up in front of him
 * all day, standing at first and lying down when the floor fills. Around him: nets and glass
 * floats hung from the rafters, a camp stove and kettle, rubber boots, a calendar from the
 * co-op and a folded cot for the nights he does not go home. After the set goes off he dozes
 * among the empties under the bare bulb until the van comes.
 *
 * Pier frame: the shed stands on the west edge of the L-pier, open to the east.
 */
export const PORT_SHED=Object.freeze({id:'fujita-shed',x:-36.95,z:-58,width:3.6,depth:2.4,y:0,
 chair:[-36.6,-57.2],tv:[-36.8,-59.35]});
/** The pier's timber deck the shed stands on (measured from the harbour's own deck). */
export const SHED_PIER=Object.freeze({minX:-38.25,maxX:-33.75,minZ:-64.3,maxZ:-48});
const S=PORT_SHED;

function corrugated(){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');if(!x)return null;
 for(let i=0;i<128;i++){const v=Math.sin(i/128*Math.PI*16);const l=120+v*28;x.fillStyle=`rgb(${l},${l+6},${l+4})`;x.fillRect(i,0,1,128);}
 // Rust at the seams and running down from the nails.
 for(let k=0;k<26;k++){const px=(k*37)%128,py=(k*53)%128;const g=x.createLinearGradient(px,py,px,py+40);g.addColorStop(0,'rgba(150,72,30,.75)');g.addColorStop(1,'rgba(150,72,30,0)');x.fillStyle=g;x.fillRect(px,py,3+(k%3),40);}
 x.fillStyle='rgba(140,66,28,.55)';x.fillRect(0,118,128,10);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

function drawTV(ctx,w,h,programme,t){
 if(programme==='off'){ctx.fillStyle='#1d2422';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(w*.1,h*.1,w*.3,h*.15);return;}
 if(programme==='snow'){const img=ctx.createImageData(w,h);for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;}ctx.putImageData(img,0,0);return;}
 if(programme==='baseball'){
  ctx.fillStyle='#3f8a3c';ctx.fillRect(0,0,w,h);ctx.fillStyle='#c8955a';ctx.beginPath();ctx.moveTo(w*.5,h*.92);ctx.lineTo(w*.15,h*.55);ctx.lineTo(w*.5,h*.25);ctx.lineTo(w*.85,h*.55);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3f8a3c';ctx.beginPath();ctx.moveTo(w*.5,h*.8);ctx.lineTo(w*.27,h*.56);ctx.lineTo(w*.5,h*.36);ctx.lineTo(w*.73,h*.56);ctx.closePath();ctx.fill();
  // The pitcher winds up, the batter waits.
  const wind=Math.sin(t*1.7);ctx.fillStyle='#f2f2f2';ctx.fillRect(w*.49,h*.5-wind*3,6,12);ctx.fillStyle='#d23a2a';ctx.fillRect(w*.47,h*.82,7,14);
  ctx.fillStyle='rgba(10,20,40,.8)';ctx.fillRect(4,4,92,30);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.fillText('HARBOUR  3',10,17);ctx.fillText('NORTH    2',10,30);
  ctx.fillStyle='#f4c430';ctx.fillText('8th',70,24);return;
 }
 if(programme==='news'){ctx.fillStyle='#24467a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e8d9c0';ctx.beginPath();ctx.arc(w*.5,h*.45,h*.16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b2b2b';ctx.fillRect(w*.36,h*.6,w*.28,h*.4);
  ctx.fillStyle='#c0392b';ctx.fillRect(0,h*.78,w,h*.14);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText('EVENING NEWS · TYPHOON 21 TURNS NORTH',(w-((t*30)%(w*2.4))),h*.88);return;}
 if(programme==='drama'){
  // A period drama: two swordsmen against a sunset, one drawing.
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#f08a3c');g.addColorStop(1,'#5a2a3a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#1d1416';ctx.fillRect(0,h*.82,w,h*.18);
  for(const [x,s] of [[.3,1],[.68,-1]]){ctx.fillRect(w*x-6,h*.5,12,h*.32);ctx.beginPath();ctx.arc(w*x,h*.46,7,0,Math.PI*2);ctx.fill();
   ctx.save();ctx.translate(w*x+s*6,h*.58);ctx.rotate(s*(-.9+Math.sin(t*1.3)*.25));ctx.fillStyle='#d9d9d9';ctx.fillRect(0,-1,s*30,2);ctx.restore();}
  return;}
 if(programme==='cooking'){
  // A cooking show: the chef, the pan, the steam.
  ctx.fillStyle='#e9e2d0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#b9b2a0';ctx.fillRect(0,h*.68,w,h*.32);
  ctx.fillStyle='#fff';ctx.fillRect(w*.42,h*.3,w*.16,h*.38);ctx.fillRect(w*.43,h*.12,w*.14,h*.12);ctx.fillStyle='#e8c4a0';ctx.beginPath();ctx.arc(w*.5,h*.3,h*.08,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.fillRect(w*.2,h*.66,w*.22,h*.04);ctx.fillRect(w*.08,h*.675,w*.12,h*.015);
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();const x=w*(.25+i*.06);ctx.moveTo(x,h*.64);ctx.quadraticCurveTo(x+6*Math.sin(t*2+i),h*.55,x,h*.44-((t*12+i*9)%12));ctx.stroke();}
  return;}
 if(programme==='sumo'){
  // Sumo: the ring, two wrestlers pushing, the referee's fan.
  ctx.fillStyle='#7a5b3a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#d6b98a';ctx.beginPath();ctx.ellipse(w*.5,h*.72,w*.42,h*.2,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#f4ecd8';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(w*.5,h*.72,w*.32,h*.14,0,0,Math.PI*2);ctx.stroke();
  const push=Math.sin(t*.8)*6;ctx.fillStyle='#e0b48a';for(const x of [.42,.58]){ctx.beginPath();ctx.ellipse(w*x+push,h*.55,14,20,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#3a3a6a';ctx.fillRect(w*.38+push,h*.6,w*.24,5);ctx.fillStyle='#c0392b';ctx.fillRect(w*.82,h*.3,6,22);return;}
 if(programme==='weather'){
  // The weather: the islands on a blue sea, a sun, a cloud moving in.
  ctx.fillStyle='#2f6fb5';ctx.fillRect(0,0,w,h);ctx.fillStyle='#8cc56a';
  for(const [x,y,r] of [[.35,.6,.1],[.55,.45,.06],[.7,.35,.04]]){ctx.beginPath();ctx.ellipse(w*x,h*y,w*r,h*r*.6,.6,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#f6c945';ctx.beginPath();ctx.arc(w*.3,h*.3,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f2f2f2';const cx=w*(.55+.15*Math.sin(t*.3));for(const [dx,r] of [[0,10],[10,8],[-10,7]]){ctx.beginPath();ctx.arc(cx+dx,h*.25,r,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.fillText('31°',w*.24,h*.5);return;}
 if(programme==='cartoon'){
  // The morning cartoon: a round hero bouncing across a hill.
  ctx.fillStyle='#8fd0f0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#6bbf5a';ctx.beginPath();ctx.ellipse(w*.5,h*1.05,w*.8,h*.4,0,0,Math.PI*2);ctx.fill();
  const x=w*(((t*.25)%1.2)-.1),y=h*.62-Math.abs(Math.sin(t*4))*h*.25;ctx.fillStyle='#f25c54';ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+4,y-3,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x+5,y-3,2,0,Math.PI*2);ctx.fill();return;}
 // Variety: bright studio, two hosts, a laugh caption.
 ctx.fillStyle='#f2b84a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e0603a';for(let i=0;i<6;i++)ctx.fillRect(i*w/6,0,w/12,h*.5);
 for(const [hx,c] of [[.35,'#3a6ea5'],[.65,'#c0392b']]){ctx.fillStyle='#e8c4a0';ctx.beginPath();ctx.arc(w*hx,h*.5+Math.sin(t*3+hx*9)*2,h*.1,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.fillRect(w*hx-12,h*.6,24,h*.4);}
 if(Math.sin(t*.9)>.4){ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.fillText('HA HA HA!',w*.32,h*.25);}
}

export function buildPortShed({parent,colliders,register,onAction,shadows=false}){
 const g=new THREE.Group();g.name='Mr Fujita’s shed';g.position.set(S.x,S.y,S.z);parent.add(g);
 const std=(color,rough=.85,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,...extra});
 const box=(s,p,m,name)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(...s),m);b.position.set(...p);b.castShadow=shadows;b.receiveShadow=true;b.name=name;g.add(b);return b;};
 const W=S.width,D=S.depth,hx=D/2,hz=W/2;
 const iron=corrugated(),ironMat=iron?new THREE.MeshStandardMaterial({map:iron,roughness:.7,metalness:.25}):std(0x8a908c,.7);
 const roofTex=iron?iron.clone():null;if(roofTex){roofTex.needsUpdate=true;roofTex.repeat.set(3,1);}
 const timber=std(0x6b5440,.9),plank=std(0x8c7356,.9);
 // Floor of old pallets' boards, a little proud of the pier.
 box([D,.06,W],[0,.03,0],plank,'Shed floor');
 // Back (west) wall and the two ends in corrugated iron; the east side is open.
 box([.04,2.05,W],[-hx,1.03,0],ironMat,'Shed back wall');
 // The far end is iron; the end towards the quay is open, so you walk up to him and the set.
 box([D,2.05,.04],[0,1.03,-hz],ironMat,'Shed end wall');
 // Posts and a lintel along the open front.
 for(const z of [-hz,0,hz])box([.09,2.25,.09],[hx,1.12,z],timber,'Shed post');
 box([.1,.12,W+.1],[hx,2.2,0],timber,'Shed lintel');
 // A lean-to roof, falling towards the pier and overhanging it to shed the rain there.
 const roof=new THREE.Mesh(new THREE.BoxGeometry(D+.6,.04,W+.3),roofTex?new THREE.MeshStandardMaterial({map:roofTex,roughness:.65,metalness:.3}):ironMat);
 roof.position.set(.2,2.18,0);roof.rotation.z=-.12;roof.castShadow=shadows;roof.name='Shed roof';g.add(roof);
 // A half-raised shutter roll under the lintel.
 const roll=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,W-.1,12),std(0x7f8a86,.6,{metalness:.4}));roll.rotation.x=Math.PI/2;roll.position.set(hx-.05,2.05,0);g.add(roll);

 // ---- Inside. The TV on a fish crate, the armchair facing it.
 const [tx,tz]=[S.tv[0]-S.x,S.tv[1]-S.z],[cx,cz]=[S.chair[0]-S.x,S.chair[1]-S.z];
 box([.6,.32,.42],[tx,.16,tz],std(0x2f6fa8,.6),'Fish crate');
 box([.52,.42,.46],[tx,.53,tz],std(0x9c8f78,.6),'CRT television');
 // The dark bezel round the picture tube, flat on the set's face (the screen sits just proud of it).
 box([.46,.36,.012],[tx,.55,tz+.231],std(0x2a2826,.5),'Television bezel');
 const screenCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;let screenCtx=null,screenTex=null;
 if(screenCanvas){screenCanvas.width=160;screenCanvas.height=120;screenCtx=screenCanvas.getContext('2d');if(screenCtx){screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;}}
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.38,.29),screenTex?new THREE.MeshBasicMaterial({map:screenTex}):std(0x223,.3));
 screen.position.set(tx,.56,tz+.236);screen.name='Television screen';g.add(screen);
 const aerial=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.4,4),std(0xbfc4c6,.3));aerial.position.set(tx-.1,.92,tz);aerial.rotation.z=.5;g.add(aerial);
 const aerial2=aerial.clone();aerial2.position.x=tx+.1;aerial2.rotation.z=-.5;g.add(aerial2);
 const tvGlow=new THREE.PointLight(0x9fc0ff,0,3.2,2);tvGlow.position.set(tx,.7,tz+.6);g.add(tvGlow);
 // The armchair: low, sagging, its arms worn pale.
 const chairMat=std(0x7a4b3a,.95);
 // Small enough that he sits in it rather than through it: the seat ends behind his knees, so his shins hang clear.
 box([.54,.4,.4],[cx,.2,cz+.1],chairMat,'Armchair seat');box([.54,.55,.12],[cx,.62,cz+.31],chairMat,'Armchair back');
 for(const s of [-1,1])box([.1,.28,.46],[cx+s*.27,.54,cz+.08],std(0x8f6a54,.95),'Armchair arm');
 // ---- Beer. One Umineko large bottle, built once; the crates, the bottle he is on and the empties are copies of it.
 // All of it moves or changes through the day, so none of it may be baked into the town's static batches (dynamicProp).
 const proto=buildBeerBottle(),parts=[];proto.updateMatrixWorld(true);
 proto.traverse(o=>{if(o.isMesh)parts.push(o);});
 const pile=(count,name)=>parts.map(o=>{const m=new THREE.InstancedMesh(o.geometry.clone().applyMatrix4(o.matrix),o.material,count);m.name=name;m.count=0;m.userData.dynamicProp=true;m.castShadow=shadows;m.receiveShadow=true;m.frustumCulled=false;g.add(m);return m;});
 const place=(meshes,i,x,y,z,rx,ry,rz)=>{const d=new THREE.Object3D();d.position.set(x,y,z);d.rotation.set(rx,ry,rz);d.updateMatrix();
  for(const m of meshes){m.setMatrixAt(i,d.matrix);m.instanceMatrix.needsUpdate=true;}};
 // Higa Liquor's crates at his right hand, where the cool box was: yellow plastic, twenty large bottles each, two
 // side by side and the third on top on a big day.
 const crateMat=std(0xe7b52c,.6),CRATES=[[cx+.62,0,cz-.12],[cx+.62,0,cz+.3],[cx+.62,.3,cz-.12]];
 const crates=CRATES.map(([x,y,z])=>{
  const c=new THREE.Group();c.position.set(x,y,z);c.name='Higa Liquor beer crate';c.userData.dynamicProp=true;g.add(c);
  for(const [w,h,d,px,py,pz] of [[.42,.02,.32,0,.01,0],[.42,.18,.02,0,.1,.15],[.42,.18,.02,0,.1,-.15],[.02,.18,.32,.2,.1,0],[.02,.18,.32,-.2,.1,0]]){
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),crateMat);b.position.set(px,py,pz);b.castShadow=shadows;c.add(b);}
  c.userData.crate=true;return c;
 });
 const crateMeshes=CRATES.map(()=>null),fullSlots=[];
 CRATES.forEach(([x,y,z])=>{for(let r=0;r<4;r++)for(let k=0;k<5;k++)fullSlots.push([x-.15+r*.1,y+.02,z-.12+k*.06]);});
 const full=pile(fullSlots.length,'Full Umineko bottles');void crateMeshes;
 fullSlots.forEach(([x,y,z],i)=>place(full,i,x,y,z,0,0,0));
 // The bottle he is on stands at his left foot between pours.
 const openBottle=proto.clone();openBottle.name='Mr Fujita’s open bottle';openBottle.userData.dynamicProp=true;openBottle.position.set(cx-.42,0,cz-.18);g.add(openBottle);
 // The empties: in front of him and to his left-front, clear of the way in at his left and of the set. They
 // go down one by one, nearest his left hand first; standing while there is floor, lying down after thirty.
 const emptySlots=[];{
  const keep=[[cx,cz,.36,.36],[tx,tz,.36,.28],[cx+.62,cz+.09,.26,.42]];   // the chair, the set and its crate, the beer crates
  const free=(x,z,r)=>x>-.22&&x<D/2-.12&&z>-W/2+.12&&z<W/2-.12&&!keep.some(([kx,kz,w,d])=>Math.abs(x-kx)<w+r&&Math.abs(z-kz)<d+r)&&emptySlots.every(([px,pz,,,,pr])=>Math.hypot(px-x,pz-z)>r+pr);
  for(let i=0,tries=0;emptySlots.length<49&&tries<6000;tries++){
   const a=seeded(i,tries,11)*Math.PI*2,rad=.3+seeded(i,tries,12)*(.25+emptySlots.length*.018),x=cx-.25+Math.cos(a)*rad,z=cz-.45+Math.sin(a)*rad*1.3;
   const lying=emptySlots.length>=30,r=lying?.15:.042;
   if(!free(x,z,r))continue;
   emptySlots.push(lying?[x,.038,z,Math.PI/2,seeded(i,5)*Math.PI*2,r]:[x,0,z,0,seeded(i,6)*Math.PI*2,r]);i++;
  }
 }
 const empties=pile(emptySlots.length,'Empty Umineko bottles');
 emptySlots.forEach(([x,y,z,rx,ry],i)=>place(empties,i,x,y,z,rx,ry,0));
 // The bottle in his left hand while he pours, and the beer running into the glass.
 const pourBottle=proto.clone();pourBottle.name='Bottle he is pouring';pourBottle.userData.dynamicProp=true;pourBottle.visible=false;g.add(pourBottle);
 pourBottle.traverse(o=>{if(o.isMesh&&/cap/i.test(o.name))o.visible=false;});   // it is open
 const stream=new THREE.Mesh(new THREE.CylinderGeometry(.004,.006,1,6),new THREE.MeshStandardMaterial({color:0xd59a3a,roughness:.3,transparent:true,opacity:.85}));
 stream.name='Beer pouring';stream.userData.dynamicProp=true;stream.visible=false;g.add(stream);
 // A camp stove and kettle, boots, a folded cot against the back wall.
 box([.3,.1,.25],[-hx+.35,.45,hz-.4],std(0x3a3a3a,.5),'Camp stove');box([.6,.4,.3],[-hx+.35,.2,hz-.4],plank,'Stove crate');
 const kettle=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),std(0xb8bcc0,.3,{metalness:.6}));kettle.scale.y=.8;kettle.position.set(-hx+.35,.58,hz-.4);g.add(kettle);
 for(const dz of [-.08,.08])box([.12,.32,.22],[hx-.35,.16,hz-.25+dz],std(0x2a3a2c,.6),'Rubber boot');
 box([.08,1.6,.75],[-hx+.08,.8,-.2],std(0x4f6a55,.9),'Folded cot');
 // The co-op calendar and a bare bulb.
 const cal=new THREE.Mesh(new THREE.PlaneGeometry(.3,.42),std(0xf2eee2,.9));cal.position.set(-hx+.03,1.45,.7);cal.rotation.y=Math.PI/2;g.add(cal);
 const calBand=new THREE.Mesh(new THREE.PlaneGeometry(.3,.12),std(0x2f6fa8,.9));calBand.position.set(-hx+.035,1.6,.7);calBand.rotation.y=Math.PI/2;g.add(calBand);
 const bulbMat=std(0xfff2cf,.4,{emissive:0xffd890,emissiveIntensity:0});const bulb=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),bulbMat);bulb.position.set(0,1.8,0);g.add(bulb);
 const bulbLight=new THREE.PointLight(0xffd29a,0,5,2);bulbLight.position.set(0,1.75,0);g.add(bulbLight);
 // Nets and glass floats hung from the rafters.
 const net=std(0x3f6a5a,.95,{transparent:true,opacity:.8,side:THREE.DoubleSide});
 const netMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.9,6,4),net);netMesh.position.set(-hx+.06,1.55,-.9);netMesh.rotation.y=Math.PI/2;g.add(netMesh);
 for(const [fx,fy,fz,c] of [[-hx+.15,1.75,-1.2,0x6fae9a],[-hx+.15,1.45,-.75,0x7fb7d8],[-hx+.15,1.25,-1.05,0x9ecf8a],[0,1.95,1.1,0x7fb7d8]]){const f=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),std(c,.15,{transparent:true,opacity:.75}));f.position.set(fx,fy,fz);g.add(f);}
 // Outside: buoys, a stack of crates round the corner and a plastic chair for visitors.
 for(const [ox,oz,c] of [[hx+.35,-hz+.3,0xe2542e],[hx+.5,-hz+.65,0xf2c230]]){const b=new THREE.Mesh(new THREE.SphereGeometry(.17,12,8),std(c,.5));b.position.set(ox,.17,oz);g.add(b);}
 for(let i=0;i<3;i++)box([.5,.28,.36],[hx-.35,.14+i*.28,-hz-.3],std(i%2?0x2f6fa8:0x3d8a5a,.6),'Fish crate');
 const stool=new THREE.Group();stool.position.set(-hx+.45,0,hz+.55);stool.rotation.y=-Math.PI/2;g.add(stool);
 const plastic=std(0xd8d2c4,.6);{const seat=new THREE.Mesh(new THREE.BoxGeometry(.42,.04,.42),plastic);seat.position.y=.44;stool.add(seat);const back=new THREE.Mesh(new THREE.BoxGeometry(.04,.4,.42),plastic);back.position.set(.2,.66,0);stool.add(back);for(const [lx,lz] of [[-.18,-.18],[-.18,.18],[.18,-.18],[.18,.18]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.44,6),plastic);l.position.set(lx,.22,lz);stool.add(l);}}

 // Walls and furniture are solid; the open front lets you step up and look in.
 const wx=S.x,wz=S.z;
 colliders.push({x:wx-hx,z:wz,w:.12,d:W,height:2.1,portShed:true});
 colliders.push({x:wx,z:wz-hz,w:D,d:.12,height:2.1,portShed:true});
 colliders.push({x:S.tv[0],z:S.tv[1],w:.62,d:.48,height:.95,portShed:true},{x:S.chair[0],z:S.chair[1],w:.7,d:.7,height:.9,portShed:true});
 colliders.push({x:wx+hx-.35,z:wz-hz-.3,w:.55,d:.4,height:.9,portShed:true});

 // ---- The pier under it: timber piles along both edges into the water, and a fender
 // beam, so the deck reads as a pier standing in the harbour rather than a slab on it.
 {const P=SHED_PIER,pier=new THREE.Group();pier.name='Pier piles';parent.add(pier);
  const pile=new THREE.CylinderGeometry(.13,.15,1.7,8),pileMat=std(0x4a3b2c,.95),beam=std(0x5a4632,.9);
  for(let z=P.maxZ-1.5;z>=P.minZ;z-=2.4)for(const x of [P.minX+.05,P.maxX-.05]){const m=new THREE.Mesh(pile,pileMat);m.position.set(x,-.82,z);m.castShadow=shadows;pier.add(m);}
  for(const x of [P.minX-.04,P.maxX+.04]){const b=new THREE.Mesh(new THREE.BoxGeometry(.12,.22,P.maxZ-P.minZ-1),beam);b.position.set(x,-.1,(P.minZ+P.maxZ)/2-.5);pier.add(b);}
 }
 // ---- Mr Fujita, in his chair.
 const fujita=new THREE.Group();fujita.name='Mr Fujita';fujita.userData.name='Mr Fujita';fujita.userData.walkSurface=false;
 fujita.position.set(cx,.02,cz);g.add(fujita);
 let actor=null;try{actor=createAvatarActor(fujita,'Mr Fujita',{shadows});}catch{actor=null;}
 Object.assign(fujita.userData,{socialPose:'Drink',seatHeight:.42,heldItem:'beer',heldPortion:.6,activity:'watching the ballgame with a beer'});
 register(fujita,'Talk to Mr Fujita',()=>onAction('resident','Mr Fujita'));
 const tvAnchor=new THREE.Object3D();tvAnchor.position.set(tx,1,tz+.4);g.add(tvAnchor);
 register(tvAnchor,'Watch the shed television',()=>onAction('read','Mr Fujita’s television',
  'A portable set older than the boat, on a fish crate, the aerial bent to find the signal from across the water. Mr Fujita does not look away from it. "Sit, sit. The eighth innings is the only one worth watching. Have a can; they are cold, the box is new."'));

 let clock=0,redraw=0,programme='',laughing=false,sips=-1;
 /**
  * Pouring, the way a man does it without getting up: the glass held still in his right hand over his lap, the
  * hand round its outside so his forearm stays clear of it; the bottle in his left, gripped round the body and
  * tipped so its mouth sits just over the rim, tipping further as it empties; the beer running from the mouth
  * into the glass. Both hands reach their grips (consume.js reach), so the props are in the hands, not near them.
  */
 const Y=new THREE.Vector3(0,1,0),BOTTLE_LENGTH=.278,BOTTLE_RADIUS=.038,GRIP_UP=.12;
 function pour(b){
  const av=actor.avatar,glass=actor.heldProp,m=av.measure,bones=av.bones;
  av.root.updateWorldMatrix(true,true);
  const rq=av.root.getWorldQuaternion(new THREE.Quaternion()),dir=(x,y,z)=>new THREE.Vector3(x,y,z).applyQuaternion(rq);
  const level=hand=>{hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rq));hand.updateWorldMatrix(false,true);};
  // The glass: in front of his belly, a hand's width right of centre, at the height of his elbows.
  const sR=bones.shoulderR.getWorldPosition(new THREE.Vector3()),sL=bones.shoulderL.getWorldPosition(new THREE.Vector3());
  const base=sR.clone().add(sL).multiplyScalar(.5).add(dir(-.05*m.k,-m.upper*1.05,m.fore*.9));
  const gr=glass?.userData.grip?.radius??.03,gh=glass?.userData.grip?.height??.04,rim=glass?.userData.rimHeight??.11;
  // The right palm round the glass's outside (his right), level; the wrist above the palm (build.js, the mitten hand).
  const palmR=base.clone().add(dir(-(gr+m.hand*.85),gh,0));
  reach(av,palmR.clone().addScaledVector(Y,m.hand*.55),'R');level(bones.handR);
  if(glass){const world=new THREE.Matrix4().compose(base,rq,new THREE.Vector3(1,1,1));glass.matrixAutoUpdate=false;glass.matrix.copy(bones.handR.matrixWorld).invert().multiply(world);glass.matrixWorldNeedsUpdate=true;}
  // The bottle: from his left, tipped past the horizontal (more as it empties), its mouth just over the rim.
  const tip=THREE.MathUtils.degToRad(100+35*(1-(b.bottle??.5))),axis=dir(-Math.sin(tip),Math.cos(tip),0);
  const mouth=base.clone().addScaledVector(Y,rim+.03).add(dir(gr*.4,0,0)),bottleBase=mouth.clone().addScaledVector(axis,-BOTTLE_LENGTH);
  // The left palm on top of the bottle's body, the mitten closing round it.
  const n=Y.clone().addScaledVector(axis,-Y.dot(axis)).normalize();
  const palmL=bottleBase.clone().addScaledVector(axis,GRIP_UP).addScaledVector(n,BOTTLE_RADIUS+m.hand*.6);
  reach(av,palmL.clone().addScaledVector(n,m.hand*.55),'L');
  const hq=new THREE.Quaternion().setFromUnitVectors(Y,n).multiply(rq);
  bones.handL.quaternion.copy(bones.handL.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(hq));bones.handL.updateWorldMatrix(false,true);
  // Into the shed's frame for the bottle and the stream.
  g.updateWorldMatrix(true,false);
  const gq=g.getWorldQuaternion(new THREE.Quaternion()).invert();
  pourBottle.quaternion.copy(gq.clone().multiply(new THREE.Quaternion().setFromUnitVectors(Y,axis)));
  pourBottle.position.copy(g.worldToLocal(bottleBase.clone()));pourBottle.visible=true;
  if(b.pouring>.1&&b.pouring<.95){
   const from=g.worldToLocal(mouth.clone()),to=g.worldToLocal(base.clone().addScaledVector(Y,rim*Math.max(.15,b.glass)*.9));
   stream.position.copy(from).add(to).multiplyScalar(.5);stream.scale.set(1,Math.max(.01,from.y-to.y),1);stream.visible=true;
  }
 }
 return {
  group:g,actor,fujita,
  /** Once a frame: the picture, the light it throws, the beer, and what he is doing about all of it. */
  tick(dt,minutes=720){
   clock+=dt;const now=tvProgramme(minutes),m=((minutes%1440)+1440)%1440,night=m<6*60||m>=18*60+30;
   if(now!==programme||(redraw-=dt)<=0){programme=now;redraw=now==='snow'?.08:.25;if(screenCtx){drawTV(screenCtx,160,120,now,clock);screenTex.needsUpdate=true;}}
   const on=now!=='off';
   tvGlow.intensity=on?.8+Math.sin(clock*13)*.18+Math.sin(clock*5.3)*.12:0;
   bulbMat.emissiveIntensity=night?1.4:0;bulbLight.intensity=night?1.6:0;
   // The beer: the crates, the floor, the bottle he is on, the glass.
   const b=fujitaBeer(minutes),u=fujita.userData;
   for(const mesh of full)mesh.count=b.full;
   // The third crate, on top, only on a day of more than forty: he drinks from the top crate down.
   crates[2].visible=b.bottles>40;
   for(const mesh of empties)mesh.count=Math.min(b.empties,emptySlots.length);
   openBottle.visible=b.bottle!==null&&b.phase==='drink';
   if(b.phase==='doze'||b.phase==='waiting'){
    u.socialPose='Sit';delete u.heldItem;delete u.heldPortion;u.sleeping=b.phase==='doze';u.tipsy=b.tipsy;
    u.activity=b.phase==='doze'?'asleep in his armchair among the empties':'waiting for the Higas’ van';
    delete u.thuanExpression;pourBottle.visible=stream.visible=false;
   }else{
    u.sleeping=false;u.heldItem='bottle';u.tipsy=b.tipsy;
    // A sip at a time: the level goes down in eight steps, each one a lift of the glass.
    const step=Math.ceil(b.glass*8-1e-6);u.heldPortion=b.phase==='pour'?b.glass:step/8;
    if(b.phase==='drink'&&step!==sips&&sips>=0&&step<sips)actor?.animator.play('SitDrink');
    sips=b.phase==='drink'?step:-1;
    u.socialPose=b.phase==='pour'?'SitPour':'SitHold';
    // He laughs at the set, more easily the more he has had.
    const l=laughingAt(minutes,b.tipsy);
    if(l&&!laughing)actor?.animator.play('Laugh');laughing=l;
    if(l)u.thuanExpression='laugh';else delete u.thuanExpression;
    u.activity=b.phase==='pour'?'pouring himself another':now==='baseball'?'watching the ballgame with a beer':now==='news'?'watching the news with a beer':'flipping channels with a beer';
    pourBottle.visible=stream.visible=false;
   }
   if(actor)updateAvatarActor(actor,dt);
   if(actor&&b.phase==='pour')pour(b);
  },
  dispose(){screenTex?.dispose();actor?.avatar?.dispose?.();},
 };
}
