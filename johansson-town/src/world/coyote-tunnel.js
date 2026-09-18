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
 archHeight:7.1,
 /**
  * Where the painting's perspective converges, as a fraction across and up the arch.
  * Anything meant to drive away down the tunnel has to shrink onto this point and not
  * onto the middle of the plane, or it slides sideways as it goes.
  */
 vanish:Object.freeze({u:.5,v:1-.52})
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
 // One-point perspective, drawn the way a painter fakes one: everything inside the
 // arch runs to a single vanishing point on the road's centre line, and the point
 // itself carries a little daylight so the tunnel reads as long rather than as a
 // cupboard. The bus is scaled down onto exactly this point when it leaves.
 const vx=w/2,vy=h*.52;
 const dark=ctx.createLinearGradient(0,floor,0,vy);
 dark.addColorStop(0,'#4a3f38');dark.addColorStop(.55,'#241f21');dark.addColorStop(1,'#14171c');
 ctx.fillStyle=dark;ctx.fillRect(0,0,w,h);

 const run=(x0,x1,fill)=>{ctx.beginPath();ctx.moveTo(x0,floor);ctx.lineTo(x1,floor);ctx.lineTo(vx,vy);ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
 run(40,472,'#2b2622');            // the far walls, a shade off the dark
 run(96,416,'#3a332c');            // the footpaths either side
 run(150,362,'#2f2b28');           // the carriageway
 // Kerbs, drawn as lines rather than shapes: at this size a painted line is the kerb.
 ctx.lineCap='butt';ctx.strokeStyle='#8e8577';ctx.lineWidth=5;
 for(const x of [150,362]){ctx.beginPath();ctx.moveTo(x,floor);ctx.lineTo(vx,vy);ctx.stroke();}
 ctx.strokeStyle='#5d564c';ctx.lineWidth=3;
 for(const x of [96,416]){ctx.beginPath();ctx.moveTo(x,floor);ctx.lineTo(vx,vy);ctx.stroke();}
 // Where the walls meet the roof, so there is a ceiling overhead and not just dark.
 ctx.strokeStyle='#4a423a';ctx.lineWidth=4;
 for(const x of [40,472]){ctx.beginPath();ctx.moveTo(x,h*.30);ctx.lineTo(vx,vy);ctx.stroke();}

 // Lights down the middle of the roof, each one smaller and nearer the point.
 for(let i=0,t=.12;i<9&&t<.92;i++,t+=(1-t)*.24){
  const y=h*.30+(vy-h*.30)*t,wide=Math.max(1.5,26*(1-t)),tall=Math.max(1,6*(1-t));
  ctx.fillStyle='rgba(255,236,186,'+(0.5*(1-t)+.08).toFixed(3)+')';
  ctx.fillRect(vx-wide/2,y-tall/2,wide,tall);
 }
 // The centre line, dashes shortening as they go.
 ctx.strokeStyle='#e6dcc2';ctx.lineCap='round';
 let y=floor-12;
 for(let i=0;i<9&&y>vy+10;i++){
  const length=Math.max(3,38*Math.pow(.74,i));
  ctx.lineWidth=Math.max(1.5,8*Math.pow(.78,i));
  ctx.beginPath();ctx.moveTo(vx,y);ctx.lineTo(vx,y-length);ctx.stroke();
  y-=length+length*.9;
 }
 // Daylight at the far end. Small, soft, and the thing the bus shrinks onto.
 const glow=ctx.createRadialGradient(vx,vy,0,vx,vy,34);
 glow.addColorStop(0,'rgba(226,230,214,.85)');glow.addColorStop(.35,'rgba(150,163,150,.35)');glow.addColorStop(1,'rgba(20,23,28,0)');
 ctx.fillStyle=glow;ctx.beginPath();ctx.arc(vx,vy,34,0,Math.PI*2);ctx.fill();
 ctx.restore();

 // A drawn line round the opening, because this is a painting of a tunnel and a
 // painting has an edge. Without it the arch dissolves into the rock at distance.
 archPath(26);ctx.strokeStyle='#2b2521';ctx.lineWidth=6;ctx.stroke();
 archPath(16);ctx.strokeStyle='#3b342c';ctx.lineWidth=4;ctx.stroke();

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
