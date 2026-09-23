import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {FOREST_EDGE} from './forest-edge.js';

/**
 * The tunnel at the end of the bus road: the Minato Tunnel, the only way out of town.
 *
 * It used to be painted on -- a flat rock face with a tunnel drawn on it in forced
 * perspective, which read from the bus stop and went flat the moment you walked up to
 * it. It is a real one now. The bus road runs into a cut in the hillside, between two
 * concrete wing walls, to a portal with an arch ring and the tunnel's name plate; behind
 * the portal the bore goes on into the hill, concrete-lined, with a walkway either side,
 * the centre line carried on inside and the orange sodium lamps a 1960s road tunnel was
 * lit by, dimmer and dimmer until the dark closes it off. The hill is a headland over
 * it, wooded on top, running out to the sea.
 *
 * You can walk right up to the portal and look in. You cannot walk in: there is no
 * footway inside and the sign says so, as it would. The bus drives in and out of it.
 *
 * The file keeps the name it had when the tunnel was a cartoon gag.
 */

export const TUNNEL=Object.freeze({
 x:FOREST_EDGE.roadX,
 // Beyond the road end, so there is a run of road between the bus stop and it.
 z:FOREST_EDGE.roadEndZ+3.4,
 /** The hill's footprint across the road and front to back, for the map and bounds. */
 width:30,
 height:11.8,
 depth:6.2,
 /** The bore: half its width, the height its walls stand before the arch springs, its length. */
 bore:Object.freeze({half:4.2,spring:2.5,length:36}),
 /** The portal's face stands this far out in front of the line the hill is measured from. */
 portal:.8,
 /** The cut the road runs up to the portal in, and the wing walls either side of it. */
 cut:Object.freeze({half:6.6,length:6.2}),
});
const {half:R,spring:S,length:L}=TUNNEL.bore;
/** Height of the portal's headwall above the road. */
const HEADWALL=S+R+2.9;
/** How far back from the portal's face the headwall runs, over the road. */
const HOLE_DEPTH=.4;

const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/**
 * The hill, as a height above the road at a point. Along the road it rises from the verge
 * to the top of the portal, climbs to a wooded crown about twenty metres back and falls
 * away to the sea; across it, it is broad over the bore and lower to either side, with a
 * shoulder to the west. A few low waves keep it from being a perfect bell.
 */
export function hillHeight(x,z){
 const dx=x-TUNNEL.x,dz=z-TUNNEL.z;
 let along;
 if(dz<=0)along=(HEADWALL+.3)*smooth((dz+7.5)/7.8)**1.25;
 else if(dz<22)along=HEADWALL+.3+(18.5-HEADWALL-.3)*Math.sin(dz/22*Math.PI/2);
 else along=18.5-21*smooth((dz-22)/32);
 const spread=15+.25*Math.max(0,dz);
 const across=.34+.66*Math.exp(-((dx/spread)**2))+.22*Math.exp(-(((dx+15)/7)**2))*smooth(dz/6);
 const waves=.55*Math.sin(x*.37+z*.21)+.4*Math.sin(x*.19-z*.43)+.3*Math.sin(x*.71+z*.53);
 // Out to the edges of the patch it comes down under the water, so it never ends in mid-air.
 const edge=smooth((34-Math.abs(dx+2))/9)*smooth((TUNNEL.z+58-z)/12);
 let h=(along*across+waves*smooth(dz/3+1))*edge-1.6*(1-edge);
 // To the east it comes down behind the school's boundary wall and goes under the yard.
 const east=smooth((dx-8.5)/6.5);h=h*(1-east)-1.2*east;
 // Just behind the portal the ground comes down onto the headwall's coping, so there is
 // no step between the concrete and the slope above it.
 const onto=(1-smooth((dz-.35)/3.5))*(1-smooth((Math.abs(dx)-TUNNEL.cut.half)/2))*(dz>-.5?1:0);
 return h*(1-onto)+(HEADWALL+.38)*onto;
}
/** Inside the road cut, which the portal and wing walls close off rather than the hill. */
const inCut=(dx,dz)=>Math.abs(dx)<TUNNEL.cut.half&&dz<.35;

/** The bore's inner outline, from the foot of one wall over the crown to the other. */
function boreProfile(r=R,s=S,steps=18){
 const points=[[-r,0],[-r,s]];
 for(let i=1;i<steps;i++){const a=Math.PI-i/steps*Math.PI;points.push([r*Math.cos(a),s+r*Math.sin(a)]);}
 points.push([r,s],[r,0]);
 return points;
}
function arch(shape,r,s,reverse=false){
 const pts=boreProfile(r,s);if(reverse)pts.reverse();
 pts.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));
 shape.closePath();return shape;
}

/**
 * How lit the inside of the tunnel is, a metre at a time in from the portal: daylight
 * spilling in at the mouth, then only the lamps, then nothing.
 */
function boreLight(dz){
 const daylight=.72*Math.exp(-Math.max(0,dz)/5.5);
 const pool=Math.max(0,1-Math.abs(((dz%6)+6)%6-3)/1.6)*.16*Math.exp(-dz/22);
 const deep=smooth((L-4-dz)/10);
 return (daylight+.06+pool)*deep;
}

/** The lining, road and walkways of the bore as one lit-by-hand mesh. */
function buildBore(){
 const positions=[],colours=[];
 const push=(x,y,z,rgb,b)=>{positions.push(x,y,z);colours.push(rgb[0]*b,rgb[1]*b*.93,rgb[2]*b*.82);};
 // Sodium light is orange: the deeper in, the more of the colour is the lamps'.
 const lit=(rgb,dz)=>{const t=smooth(dz/8);return [rgb[0]*(1-t)+rgb[0]*1.25*t,rgb[1]*(1-t)+rgb[1]*.92*t,rgb[2]*(1-t)+rgb[2]*.55*t];};
 const quad=(a,b,c,d,rgb)=>{
  // a,b at the near slice and c,d at the far one; brightness follows each corner's depth.
  for(const p of [a,b,c,b,d,c]){const dz=p[2];push(p[0],p[1],TUNNEL.z+dz,lit(rgb,dz),boreLight(dz));}
 };
 const concrete=[.78,.76,.71],asphalt=[.2,.2,.2],kerb=[.62,.6,.56],paint=[.9,.88,.8];
 const profile=boreProfile(),WALK=.25,ROAD=MAIN_ROAD.width/2;
 const slices=[-TUNNEL.portal,HOLE_DEPTH];for(let z=1;z<=L;z++)if(z>HOLE_DEPTH)slices.push(z);
 for(let k=0;k<slices.length-1;k++){
  const z0=slices[k],z1=slices[k+1],dz=z0;
  // The lining starts behind the headwall: through the wall itself, the hole's own faces
  // are the lining, and two surfaces in the same place flicker along the arch.
  if(z0>=HOLE_DEPTH)for(let i=0;i<profile.length-1;i++){
   const [x0,y0]=profile[i],[x1,y1]=profile[i+1];
   quad([x0,y0,z0],[x1,y1,z0],[x0,y0,z1],[x1,y1,z1],concrete);
  }
  quad([-ROAD,.005,z0],[ROAD,.005,z0],[-ROAD,.005,z1],[ROAD,.005,z1],asphalt);
  for(const side of [-1,1]){
   const inner=side*ROAD,outer=side*R;
   quad([inner,WALK,z0],[outer,WALK,z0],[inner,WALK,z1],[outer,WALK,z1],kerb);        // walkway top
   quad([inner,0,z0],[inner,WALK,z0],[inner,0,z1],[inner,WALK,z1],concrete);          // its kerb face
   quad([side*(ROAD-.22),.012,z0],[side*(ROAD-.08),.012,z0],[side*(ROAD-.22),.012,z1],[side*(ROAD-.08),.012,z1],paint);
  }
  // The centre line: two metres of paint, two of road.
  if(((Math.floor(dz)%4)+4)%4<2)quad([-.07,.013,z0],[.07,.013,z0],[-.07,.013,z1],[.07,.013,z1],paint);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 geometry.translate(TUNNEL.x,0,0);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));
 mesh.name='Minato Tunnel bore';
 return mesh;
}

/** Sodium lamps high on each wall, staggered, receding into the dark. */
function buildLamps(){
 const lamps=[];
 for(let dz=3;dz<L-5;dz+=6)for(const side of [-1,1]){
  const a=Math.PI*(side<0?.8:.2),z=dz+(side>0?3:0);
  lamps.push([TUNNEL.x+(R-.12)*Math.cos(a),S+(R-.12)*Math.sin(a),TUNNEL.z+z,side*(Math.PI/2-a)]);
 }
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.52,.14,.22),new THREE.MeshBasicMaterial({color:0xffb456}),lamps.length);
 const dummy=new THREE.Object3D(),colour=new THREE.Color();
 lamps.forEach(([x,y,z,tilt],i)=>{
  dummy.position.set(x,y,z);dummy.rotation.set(0,0,tilt);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  mesh.setColorAt(i,colour.setRGB(1,.7,.34).multiplyScalar(.55+.45*Math.exp(-(z-TUNNEL.z)/18)));
 });
 mesh.name='Minato Tunnel sodium lamps';
 return mesh;
}

/** The end of what is built, somewhere in the dark around the bend. */
function buildDark(){
 const shape=arch(new THREE.Shape(),R+.05,S);
 const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0x030304}));
 mesh.position.set(TUNNEL.x,0,TUNNEL.z+L-.02);mesh.rotation.y=Math.PI;mesh.name='Minato Tunnel, further in';
 return mesh;
}

function canvasTexture(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

/** The portal: headwall, arch ring, coping, name plate. */
function buildPortal(group,shadows){
 const concrete=new THREE.MeshStandardMaterial({color:0xaaa69b,roughness:.92});
 const ring=new THREE.MeshStandardMaterial({color:0xbdb9ad,roughness:.88});
 const W=TUNNEL.cut.half;
 // The opening is cut up from below rather than as a hole, so the wall has no floor of
 // its own under the arch lying a few millimetres beneath the tunnel road.
 const wall=new THREE.Shape();wall.moveTo(-W,-.3);wall.lineTo(-R,-.3);
 for(const [x,y] of boreProfile(R,S).slice(1,-1))wall.lineTo(x,y);
 wall.lineTo(R,-.3);wall.lineTo(W,-.3);wall.lineTo(W,HEADWALL);wall.lineTo(-W,HEADWALL);wall.closePath();
 const headwall=new THREE.Mesh(new THREE.ExtrudeGeometry(wall,{depth:TUNNEL.portal+HOLE_DEPTH,bevelEnabled:false,curveSegments:1}),concrete);
 headwall.position.set(0,0,-TUNNEL.portal);headwall.name='Minato Tunnel headwall';
 headwall.castShadow=shadows;headwall.receiveShadow=true;group.add(headwall);
 const band=arch(new THREE.Shape(),R+.55,S);band.holes.push(arch(new THREE.Path(),R,S,true));
 const archRing=new THREE.Mesh(new THREE.ExtrudeGeometry(band,{depth:.22,bevelEnabled:false,curveSegments:1}),ring);
 archRing.position.set(0,0,-TUNNEL.portal-.2);archRing.name='Minato Tunnel arch ring';archRing.castShadow=shadows;group.add(archRing);
 const coping=new THREE.Mesh(new THREE.BoxGeometry(2*W+.5,.38,1.3),ring);
 coping.position.set(0,HEADWALL+.19,-TUNNEL.portal+.45);coping.castShadow=shadows;group.add(coping);
 // Weathering: the dark streaks rain leaves down a concrete face from the coping.
 const streak=new THREE.MeshStandardMaterial({color:0x7d7a72,roughness:1});
 for(const [x,h] of [[-5.6,2.6],[-4.9,1.4],[-2.2,1.1],[1.3,1.6],[4.8,2.2],[5.7,1.2]]){
  const s=new THREE.Mesh(new THREE.BoxGeometry(.22+.1*Math.abs(Math.sin(x*3)),h,.02),streak);
  s.position.set(x,HEADWALL-h/2,-TUNNEL.portal-.01);group.add(s);
 }
 const plate=canvasTexture(512,128,(ctx,w,h)=>{
  ctx.fillStyle='#3b3a33';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#8f8a73';ctx.lineWidth=6;ctx.strokeRect(6,6,w-12,h-12);
  ctx.fillStyle='#d8d0b4';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='bold 62px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';ctx.fillText('港 ト ン ネ ル',w/2,h*.42);
  ctx.font='bold 17px sans-serif';ctx.fillText('MINATO TUNNEL · L = 412 m · 1962',w/2,h*.84);
 });
 // Lettered on the box's -Z face, which is the one that looks down the road at the town.
 const name=new THREE.Mesh(new THREE.BoxGeometry(3.1,.78,.08),[...Array(5).fill(concrete),new THREE.MeshStandardMaterial({map:plate,roughness:.6,metalness:.2})]);
 name.position.set(0,S+R+1.35,-TUNNEL.portal-.05);name.name='Minato Tunnel name plate';group.add(name);
 return {headwall,archRing,name};
}

/** Retaining walls along each side of the cut, their tops following the hill. */
function buildWingWalls(group,shadows){
 const material=new THREE.MeshStandardMaterial({color:0xa19d92,roughness:.94});
 const walls=[];
 for(const side of [-1,1]){
  const shape=new THREE.Shape(),x=side*(TUNNEL.cut.half+.05),from=-TUNNEL.cut.length,to=.4;
  shape.moveTo(from,-.3);shape.lineTo(to,-.3);
  for(let k=0;k<=10;k++){const u=to-(to-from)*k/10;shape.lineTo(u,Math.max(.7,hillHeight(TUNNEL.x+x+side*.6,TUNNEL.z+u)+.25));}
  shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false,curveSegments:1}),material);
  mesh.rotation.y=-Math.PI/2;mesh.position.set(x+(side>0?.5:0),0,0);mesh.name='Tunnel wing wall';
  mesh.castShadow=shadows;mesh.receiveShadow=true;group.add(mesh);walls.push(mesh);
 }
 return walls;
}

/** The headland over the bore, grassed and wooded, with rock where it is steep. */
function buildHill(parent,shadows){
 const lines=(from,to,step,...keep)=>{const set=new Set(keep.filter(v=>v>from&&v<to));for(let v=from;v<=to+1e-6;v+=step)set.add(+v.toFixed(3));return [...set].sort((a,b)=>a-b);};
 const X0=TUNNEL.x-33,X1=TUNNEL.x+30,Z0=TUNNEL.z-8,Z1=TUNNEL.z+60;
 const xs=lines(X0,X1,1.5,TUNNEL.x-TUNNEL.cut.half,TUNNEL.x+TUNNEL.cut.half);
 const zs=lines(Z0,Z1,1.5,TUNNEL.z+.35);
 const positions=[],colours=[],index=[];
 const grass=new THREE.Color(0x4f6a3c),forest=new THREE.Color(0x3a5433),rock=new THREE.Color(0x6e6a5f),c=new THREE.Color();
 for(const z of zs)for(const x of xs){
  const h=hillHeight(x,z);positions.push(x,h,z);
  // Steep ground is bare rock; the rest is grass going over to woodland near the top.
  const e=.8,slope=Math.hypot(hillHeight(x+e,z)-hillHeight(x-e,z),hillHeight(x,z+e)-hillHeight(x,z-e))/(2*e);
  const tree=smooth((h-4)/7),bare=smooth((slope-.75)/.6);
  c.copy(grass).lerp(forest,tree).lerp(rock,bare);
  const n=.93+.07*Math.sin(x*1.7+z*2.3);colours.push(c.r*n,c.g*n,c.b*n);
 }
 for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const mx=(xs[i]+xs[i+1])/2-TUNNEL.x,mz=(zs[j]+zs[j+1])/2-TUNNEL.z;
  if(inCut(mx,mz))continue;
  const a=j*xs.length+i,b=a+1,cc=a+xs.length,d=cc+1;
  index.push(a,cc,b,b,cc,d);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 geometry.setIndex(index);geometry.computeVertexNormals();
 const hill=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));
 hill.name='Minato headland';hill.receiveShadow=true;hill.castShadow=shadows;parent.add(hill);

 // Pines and cedars on the upper slopes, kept off the face over the portal.
 const spots=[];let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let tries=0;tries<900&&spots.length<110;tries++){
  const x=X0+6+rnd()*(X1-X0-12),z=TUNNEL.z+2+rnd()*44,dx=x-TUNNEL.x,dz=z-TUNNEL.z;
  if(dz<5&&Math.abs(dx)<10)continue;
  const h=hillHeight(x,z);if(h<2.5)continue;
  spots.push([x,h,z,.75+rnd()*.7,rnd()]);
 }
 const cone=new THREE.ConeGeometry(1,1,7);cone.translate(0,.5,0);
 const trees=new THREE.InstancedMesh(cone,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,flatShading:true}),spots.length);
 const dummy=new THREE.Object3D(),tint=new THREE.Color();
 spots.forEach(([x,y,z,s,r],i)=>{
  dummy.position.set(x,y-.3,z);dummy.scale.set(1.3*s,3.8*s,1.3*s);dummy.rotation.set(0,r*6,0);dummy.updateMatrix();
  trees.setMatrixAt(i,dummy.matrix);trees.setColorAt(i,tint.setHex(0x2f4a2e).multiplyScalar(.85+r*.3));
 });
 trees.name='Minato headland trees';trees.castShadow=shadows;parent.add(trees);
 return {hill,trees};
}

/** The regulatory sign at the portal: no pedestrians, with its plate. */
function buildNoPedestrians(group){
 const disc=canvasTexture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(w/2,h/2,120,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c9302c';ctx.lineWidth=26;ctx.beginPath();ctx.arc(w/2,h/2,106,0,Math.PI*2);ctx.stroke();
  // A walking figure, then the slash across it.
  ctx.fillStyle='#1f2d4a';ctx.strokeStyle='#1f2d4a';ctx.lineCap='round';ctx.lineWidth=15;
  ctx.beginPath();ctx.arc(136,70,15,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(130,92);ctx.lineTo(118,146);ctx.lineTo(96,190);ctx.moveTo(118,146);ctx.lineTo(146,188);
  ctx.moveTo(128,104);ctx.lineTo(100,128);ctx.moveTo(128,104);ctx.lineTo(156,126);ctx.stroke();
  ctx.strokeStyle='#c9302c';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(56,56);ctx.lineTo(200,200);ctx.stroke();
 });
 const plate=canvasTexture(256,96,(ctx,w,h)=>{
  ctx.fillStyle='#f4f1ea';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#1f2d4a';ctx.lineWidth=4;ctx.strokeRect(4,4,w-8,h-8);
  ctx.fillStyle='#1f2d4a';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='bold 34px sans-serif';ctx.fillText('歩行者通行止め',w/2,h*.4);ctx.font='bold 16px sans-serif';ctx.fillText('NO PEDESTRIANS',w/2,h*.8);
 });
 const x=-TUNNEL.cut.half+.9,z=-2.6;
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.7,8),new THREE.MeshStandardMaterial({color:0x8d9396,roughness:.5,metalness:.4}));
 pole.position.set(x,1.35,z);group.add(pole);
 const sign=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshStandardMaterial({map:disc,roughness:.6}));
 sign.position.set(x,2.45,z-.05);sign.rotation.y=Math.PI;sign.name='No pedestrians sign';group.add(sign);
 const sub=new THREE.Mesh(new THREE.PlaneGeometry(.6,.22),new THREE.MeshStandardMaterial({map:plate,roughness:.6}));
 sub.position.set(x,2.0,z-.05);sub.rotation.y=Math.PI;sub.name='No pedestrians plate';group.add(sub);
 return {pole,sign,sub};
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} options.colliders
 * @param {(object:THREE.Object3D,label:string,fn:Function)=>void} [options.register]
 * @param {(kind:string,title:string,text:string)=>void} [options.onAction]
 */
export function buildCoyoteTunnel({parent,colliders,register,onAction,shadows=false}={}){
 const group=new THREE.Group();group.name='Minato Tunnel';group.position.set(TUNNEL.x,0,TUNNEL.z);parent.add(group);
 const portal=buildPortal(group,shadows);
 const wings=buildWingWalls(group,shadows);
 buildNoPedestrians(group);
 const {hill,trees}=buildHill(parent,shadows);
 const bore=buildBore(),lamps=buildLamps(),dark=buildDark();
 parent.add(bore,lamps,dark);

 // The cut floor: the carriageway runs on from where the public road gives up, with a
 // verge either side to the foot of the wing walls.
 // From the end of the forest road to the portal's face, where the tunnel's own road
 // takes over; neither overlaps the other.
 const apron=TUNNEL.z-FOREST_EDGE.roadEndZ,span=apron-TUNNEL.portal,mid=-(apron+TUNNEL.portal)/2;
 const run=new THREE.Mesh(new THREE.BoxGeometry(MAIN_ROAD.width,.09,span),
  new THREE.MeshStandardMaterial({color:0x60645d,roughness:.94}));
 run.name='tunnel approach';run.position.set(0,.005,mid);run.receiveShadow=true;group.add(run);
 const verge=TUNNEL.cut.half-MAIN_ROAD.width/2;
 for(const side of [-1,1]){
  const strip=new THREE.Mesh(new THREE.BoxGeometry(verge,.055,span),new THREE.MeshStandardMaterial({color:0x7a7c6a,roughness:1}));
  strip.position.set(side*(MAIN_ROAD.width/2+verge/2),.002,mid);strip.receiveShadow=true;group.add(strip);
 }

 // The portal stops you, arch and all: the hill and the headwall, from the portal's face back.
 const front=TUNNEL.z-TUNNEL.portal-.22;
 colliders.push({id:'tunnel-portal',x:TUNNEL.x,z:(front+TUNNEL.z+TUNNEL.depth)/2,w:TUNNEL.width,d:TUNNEL.z+TUNNEL.depth-front,height:TUNNEL.height});
 for(const side of [-1,1])colliders.push({id:'tunnel-wing-wall',x:TUNNEL.x+side*(TUNNEL.cut.half+.3),z:TUNNEL.z-TUNNEL.cut.length/2,w:.6,d:TUNNEL.cut.length+.4,height:3});

 if(register){
  const anchor=new THREE.Object3D();anchor.position.set(TUNNEL.x,1.3,front-1.4);parent.add(anchor);
  register(anchor,'Inspect the tunnel',()=>onAction?.('inspect','Minato Tunnel',
   'Four hundred and twelve metres through the headland, built in 1962 and lit the way they were then, by orange lamps down the walls. Two lanes and a walkway nobody is allowed on. The Harbour Line is the only thing that goes through; everything else in town came in on it.'));
 }

 /**
  * True at the mouth of the tunnel, with a hand's margin. The road runs straight at
  * it, so anyone running up the road arrives at speed; game.js uses this to tell the
  * portal from any other wall they might have walked into.
  */
 const splat=(x,z)=>Math.abs(x-TUNNEL.x)<=TUNNEL.width/2+.4&&z>=front-.9&&z<=TUNNEL.z+TUNNEL.depth+.6;

 return {group,portal,wings,hill,trees,bore,lamps,dark,splat,face:hill};
}
