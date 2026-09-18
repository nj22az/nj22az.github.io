import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {FOREST_EDGE} from './forest-edge.js';

/**
 * The tunnel at the end of the bus road.
 *
 * It is painted on. A flat rock face closes the road off, and someone has painted a
 * tunnel mouth on it in careful perspective — the arch, the dark inside, the kerbs,
 * and the road's own centre line carried on into the dark so it looks like it keeps
 * going. It does not keep going. There is rock behind the paint.
 *
 * The bus goes through anyway, which is the joke and is nobody's business but the
 * bus's. The geometry here only has to sell the painting: the arch is a texture on a
 * plane a few centimetres proud of the rock, and the collider spans the whole face so
 * that anyone who is not a bus walks into a cliff.
 */

export const TUNNEL=Object.freeze({
 x:FOREST_EDGE.roadX,
 // Beyond the road end, so there is a run of road between the bus stop and it. Close
 // enough to read from the platform, far enough that the shelter is not in the way.
 z:FOREST_EDGE.roadEndZ+3.4,
 width:30,
 height:11.8,
 /** Where the rock's sides stop being vertical and the crown starts. */
 shoulder:4.3,
 /** The face sits at the road's level, a little below it so no gap shows. */
 base:-.35,
 /** How thick the rock is, front to back. It is a hillside, not a hoarding. */
 depth:6.2,
 /** The painted opening, in metres. Comfortably wider than the road. */
 archWidth:8.4,
 archHeight:7.1
});

/**
 * The painting itself. Drawn rather than modelled so the perspective can be faked the
 * way a painter would fake it, which is the whole point of it.
 */
function archTexture(){
 const w=512,h=448,canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 const floor=h-6;

 // Nothing outside the painting. Filling the canvas with rock left the plane's own
 // rectangle showing against the cliff: the paint is unlit and the rock is not, so the
 // two greys never matched at any hour.

 // The opening's outline: straight jambs and a half-round head, as a path on its own
 // so it can be filled or clipped to. It used to be fill-only, and the dark inside was
 // laid in with a source-atop gradient over the whole canvas — which is every pixel,
 // the rock included, so the arch never appeared and the painting was one dark
 // rectangle the size of its plane.
 const archPath=inset=>{
  const left=inset,right=w-inset,top=inset*1.5+22,radius=(right-left)/2;
  ctx.beginPath();
  ctx.moveTo(left,floor);
  ctx.lineTo(left,top+radius);
  ctx.arc(left+radius,top+radius,radius,Math.PI,0);
  ctx.lineTo(right,floor);
  ctx.closePath();
 };
 const arch=(inset,fill)=>{archPath(inset);ctx.fillStyle=fill;ctx.fill();};

 // A pale rim first: the painter went round the opening in whitewash.
 arch(16,'#cfc7b0');
 arch(26,'#241f21');

 ctx.save();
 archPath(26);ctx.clip();
 // The dark is not flat — it fades as it "recedes".
 const depth=ctx.createLinearGradient(0,floor,0,h*.26);
 depth.addColorStop(0,'#443a35');depth.addColorStop(.45,'#1b1719');depth.addColorStop(1,'#0d0c0e');
 ctx.fillStyle=depth;ctx.fillRect(0,0,w,h);

 // The road carried on into the dark. Two kerbs converging, and a dashed centre line
 // whose dashes shorten as they go, which is the detail that sells it from the road.
 ctx.strokeStyle='#8e8577';ctx.lineWidth=5;
 for(const side of [-1,1]){
  ctx.beginPath();
  ctx.moveTo(w/2+side*172,floor);
  ctx.lineTo(w/2+side*34,h*.44);
  ctx.stroke();
 }
 ctx.strokeStyle='#e6dcc2';ctx.lineWidth=7;ctx.lineCap='round';
 let y=floor-10;
 for(let i=0;i<7&&y>h*.46;i++){
  const length=34*Math.pow(.72,i);
  ctx.lineWidth=7*Math.pow(.78,i);
  ctx.beginPath();ctx.moveTo(w/2,y);ctx.lineTo(w/2,y-length);ctx.stroke();
  y-=length+length*.85;
 }
 ctx.restore();

 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} options.colliders
 * @param {(object:THREE.Object3D,label:string,fn:Function)=>void} [options.register]
 * @param {(kind:string,title:string,text:string)=>void} [options.onAction]
 */
export function buildCoyoteTunnel({parent,colliders,register,onAction,shadows=false}={}){
 const group=new THREE.Group();
 group.name='Painted tunnel';
 group.position.set(TUNNEL.x,0,TUNNEL.z);
 parent.add(group);

 const rock=new THREE.MeshStandardMaterial({color:0x6d6a60,roughness:.97,flatShading:true});
 // A hillside rather than a slab. Square across the top it read as a wall with a hole
 // painted on it, and one clean dome read as a tent: the skyline is a big hump over
 // the road with a smaller one to either side, which is how a hill is drawn rather
 // than how one is measured. The arch ends up under the middle hump's brow.
 const hump=(t,centre,width,height)=>
  height*Math.max(0,Math.cos(Math.PI*Math.min(1,Math.abs(t-centre)/width))*.5+.5);
 const half=TUNNEL.width/2,crown=TUNNEL.height+TUNNEL.base-TUNNEL.shoulder;
 const skyline=t=>TUNNEL.shoulder+hump(t,.5,.46,crown)+hump(t,.17,.2,crown*.44)+hump(t,.86,.17,crown*.31);
 const profile=new THREE.Shape();
 profile.moveTo(-half,TUNNEL.base);
 profile.lineTo(-half,TUNNEL.shoulder*.55);
 for(let i=0;i<=40;i++){const t=i/40;profile.lineTo(-half+TUNNEL.width*t,skyline(t));}
 profile.lineTo(half,TUNNEL.shoulder*.55);
 profile.lineTo(half,TUNNEL.base);
 profile.closePath();
 const face=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{depth:TUNNEL.depth,bevelEnabled:false,curveSegments:1}),rock);
 face.castShadow=shadows;face.receiveShadow=true;
 group.add(face);

 // Broken ground along the foot, spilling out onto the verge either side of the road,
 // so the hill meets the ground it stands on instead of being set down on it.
 for(const [x,y,z,s] of [[-6.6,1.5,-.6,2.6],[6.9,1.9,-.4,3.1],[-9.4,3.1,.4,3.9],[9.2,3.6,.3,3.4],
  [-12.8,2.2,-1.4,3.2],[12.4,2.4,-1.1,2.9],[-4.9,.9,-2.1,1.5],[5.3,1.0,-2.3,1.7],[-15.6,1.6,-.6,2.4],[15.1,1.5,-.4,2.2]]){
  const boulder=new THREE.Mesh(new THREE.IcosahedronGeometry(s/2,0),rock);
  boulder.position.set(x,y-s/2+.4,z);
  boulder.rotation.set(x,y,z);
  boulder.castShadow=shadows;boulder.receiveShadow=true;
  group.add(boulder);
 }

 const paint=new THREE.Mesh(
  new THREE.PlaneGeometry(TUNNEL.archWidth,TUNNEL.archHeight),
  new THREE.MeshBasicMaterial({map:archTexture(),toneMapped:true,transparent:true})
 );
 paint.name='Painted tunnel mouth';
 // Proud of the rock by a few centimetres. It is paint, so it is not lit like rock —
 // an unlit material keeps the black of the "opening" black at every hour, which is
 // exactly the flatness that gives it away when you stand close.
 paint.position.set(0,TUNNEL.archHeight/2+TUNNEL.base,-.03);
 // A plane faces +z, which here is into the rock. It is painted on the town side.
 paint.rotation.y=Math.PI;
 group.add(paint);

 // The whole face stops you, arch and all.
 colliders.push({id:'painted-tunnel',x:TUNNEL.x,z:TUNNEL.z+TUNNEL.depth/2,w:TUNNEL.width,d:TUNNEL.depth,height:TUNNEL.height});

 if(register){
  const anchor=new THREE.Object3D();
  anchor.position.set(TUNNEL.x,1.3,TUNNEL.z-1.6);
  parent.add(anchor);
  register(anchor,'Inspect the tunnel',()=>onAction?.('inspect','Harbour Line tunnel',
   'Painted. The arch, the kerbs, the dashes down the middle, all of it, and the rock '+
   'goes on behind. The 17:10 bus uses it twice a day without any trouble.'));
 }

 /**
  * True where the rock actually is, with a hand's margin. The bus road runs straight at
  * it, so anyone running down the road arrives at speed; game.js uses this to tell a
  * collision with the painting from any other wall it might have walked into.
  */
 const splat=(x,z)=>Math.abs(x-TUNNEL.x)<=TUNNEL.width/2+.4
  &&Math.abs(z-(TUNNEL.z+TUNNEL.depth/2))<=TUNNEL.depth/2+.6;

 return {group,face,paint,splat};
}
