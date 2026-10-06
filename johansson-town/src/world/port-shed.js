import * as THREE from '../../vendor/three.module.js';
import {createAvatarActor,updateAvatarActor} from '../avatars/actors.js';

/**
 * Mr Fujita's shed on the working pier.
 *
 * A fisherman's banya: timber framed, clad in corrugated iron gone to rust at the seams,
 * open along the pier side so the breeze comes through. Mr Fujita, retired, more or less
 * lives in it. He sits in a sagging armchair with a can of beer and watches an old CRT on
 * a fish crate: the ballgame in the afternoon, the news after dark, snow when the signal
 * goes. Around him: nets and glass floats hung from the rafters, a cool box of beer, a
 * row of empties, a camp stove and kettle, rubber boots, a calendar from the co-op and a
 * folded cot for the nights he does not go home. Late at night the set is off and he dozes
 * in the chair under the bare bulb.
 *
 * Pier frame: the shed stands on the west edge of the L-pier, open to the east.
 */
export const PORT_SHED=Object.freeze({x:-36.95,z:-58,width:3.6,depth:2.4,y:0,
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

/** The picture on the set, by the hour: the ballgame, the news, or snow. */
export function tvProgramme(minutes){
 const m=((minutes%1440)+1440)%1440;
 if(m<6*60||m>=23*60+30)return 'off';
 if(m>=13*60&&m<18*60)return 'baseball';
 if(m>=19*60&&m<19*60+45)return 'news';
 if(m>=22*60+50)return 'snow';
 return 'variety';
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
 box([.03,.36,.38],[tx,.55,tz+.24],std(0x2a2826,.5),'Television bezel');
 const screenCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;let screenCtx=null,screenTex=null;
 if(screenCanvas){screenCanvas.width=160;screenCanvas.height=120;screenCtx=screenCanvas.getContext('2d');if(screenCtx){screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;}}
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.38,.29),screenTex?new THREE.MeshBasicMaterial({map:screenTex}):std(0x223,.3));
 screen.position.set(tx,.56,tz+.236);screen.name='Television screen';g.add(screen);
 const aerial=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.4,4),std(0xbfc4c6,.3));aerial.position.set(tx-.1,.92,tz);aerial.rotation.z=.5;g.add(aerial);
 const aerial2=aerial.clone();aerial2.position.x=tx+.1;aerial2.rotation.z=-.5;g.add(aerial2);
 const tvGlow=new THREE.PointLight(0x9fc0ff,0,3.2,2);tvGlow.position.set(tx,.7,tz+.6);g.add(tvGlow);
 // The armchair: low, sagging, its arms worn pale.
 const chairMat=std(0x7a4b3a,.95);
 // A shallow cushion leaves the calves clear of the upholstered front.
 box([.62,.12,.44],[cx,.34,cz+.07],chairMat,'Armchair seat');box([.62,.55,.14],[cx,.62,cz+.3],chairMat,'Armchair back');
 for(const s of [-1,1])box([.12,.3,.48],[cx+s*.31,.45,cz+.1],std(0x8f6a54,.95),'Armchair arm');
 // The short-legged cast needs a real support below this seat, not shoes dangling
 // through its upholstery. A low timber footstool belongs in his worn armchair corner.
 box([.48,.08,.30],[cx,.148,cz-.32],plank,'Armchair footrest');
 for(const side of [-1,1])box([.05,.108,.24],[cx+side*.19,.054,cz-.32],timber,'Footrest leg');
 // Beer: a cool box beside him, empties lined up on the floor.
 box([.42,.3,.3],[cx+.62,.15,cz-.05],std(0xd8d4c8,.6),'Cool box');box([.44,.05,.32],[cx+.62,.32,cz-.05],std(0x2f6fa8,.6),'Cool box lid');
 const can=new THREE.CylinderGeometry(.033,.033,.12,10),canMat=std(0xc9c9c2,.35,{metalness:.6}),band=std(0xb8322a,.5);
 for(let i=0;i<5;i++){const c=new THREE.Mesh(can,i%2?canMat:band);c.position.set(cx+.45+i*.08,.12,cz+.45);if(i===4){c.rotation.z=Math.PI/2;c.position.y=.09;}g.add(c);}
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
 fujita.position.set(cx,.02,cz-.08);g.add(fujita);
 let actor=null;try{actor=createAvatarActor(fujita,'Mr Fujita',{shadows});}catch{actor=null;}
 Object.assign(fujita.userData,{socialPose:'Drink',seatHeight:.38,heldItem:'beer',heldPortion:.6,activity:'watching the ballgame with a beer'});
 register(fujita,'Talk to Mr Fujita',()=>onAction('resident','Mr Fujita'));
 const tvAnchor=new THREE.Object3D();tvAnchor.position.set(tx,1,tz+.4);g.add(tvAnchor);
 register(tvAnchor,'Watch the shed television',()=>onAction('read','Mr Fujita’s television',
  'A portable set older than the boat, on a fish crate, the aerial bent to find the signal from across the water. Mr Fujita does not look away from it. "Sit, sit. The eighth innings is the only one worth watching. Have a can; they are cold, the box is new."'));

 let clock=0,redraw=0,programme='';
 return {
  group:g,actor,fujita,
  /** Once a frame: the picture, the light it throws, and what he is doing about it. */
  tick(dt,minutes=720){
   clock+=dt;const now=tvProgramme(minutes),m=((minutes%1440)+1440)%1440,night=m<6*60||m>=18*60+30;
   if(now!==programme||(redraw-=dt)<=0){programme=now;redraw=now==='snow'?.08:.25;if(screenCtx){drawTV(screenCtx,160,120,now,clock);screenTex.needsUpdate=true;}}
   const on=now!=='off';
   tvGlow.intensity=on?.8+Math.sin(clock*13)*.18+Math.sin(clock*5.3)*.12:0;
   bulbMat.emissiveIntensity=night?1.4:0;bulbLight.intensity=night?1.6:0;
   const u=fujita.userData;
   if(on){u.socialPose='Drink';u.heldItem='beer';u.activity=now==='baseball'?'watching the ballgame with a beer':now==='news'?'watching the evening news':'watching television with a beer';}
   else{u.socialPose='Sit';delete u.heldItem;u.activity='dozing in his armchair';}
   if(actor)updateAvatarActor(actor,dt);
  },
  dispose(){screenTex?.dispose();actor?.avatar?.dispose?.();},
 };
}
