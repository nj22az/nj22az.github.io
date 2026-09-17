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
 width:21,
 height:10.6,
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

 // The rock it is painted on, so the edges of the plane disappear into the cliff.
 ctx.fillStyle='#6d6a60';ctx.fillRect(0,0,w,h);

 const arch=(inset,fill)=>{
  const left=inset,right=w-inset,top=inset*1.5+22,radius=(right-left)/2;
  ctx.beginPath();
  ctx.moveTo(left,floor);
  ctx.lineTo(left,top+radius);
  ctx.arc(left+radius,top+radius,radius,Math.PI,0);
  ctx.lineTo(right,floor);
  ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();
 };

 // A pale rim first: the painter went round the opening in whitewash.
 arch(16,'#cfc7b0');
 arch(26,'#241f21');
 // The dark is not flat — it fades as it "recedes".
 const depth=ctx.createLinearGradient(0,floor,0,h*.26);
 depth.addColorStop(0,'#443a35');depth.addColorStop(.45,'#1b1719');depth.addColorStop(1,'#0d0c0e');
 ctx.save();arch(26,'#000');ctx.globalCompositeOperation='source-atop';
 ctx.fillStyle=depth;ctx.fillRect(0,0,w,h);ctx.restore();

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
 const face=new THREE.Mesh(new THREE.BoxGeometry(TUNNEL.width,TUNNEL.height,2.4),rock);
 face.position.set(0,TUNNEL.height/2-.35,1.2);
 face.castShadow=shadows;face.receiveShadow=true;
 group.add(face);

 // Broken ground either side, so the face reads as rock rather than as a wall.
 for(const [x,y,z,s] of [[-6.6,1.5,-.4,2.6],[6.9,1.9,-.2,3.1],[-8.4,3.1,.6,3.6],[8.2,3.6,.5,3.2]]){
  const boulder=new THREE.Mesh(new THREE.IcosahedronGeometry(s/2,0),rock);
  boulder.position.set(x,y-s/2+.4,z);
  boulder.rotation.set(x,y,z);
  boulder.castShadow=shadows;boulder.receiveShadow=true;
  group.add(boulder);
 }

 const paint=new THREE.Mesh(
  new THREE.PlaneGeometry(TUNNEL.archWidth,TUNNEL.archHeight),
  new THREE.MeshBasicMaterial({map:archTexture(),toneMapped:true})
 );
 paint.name='Painted tunnel mouth';
 // Proud of the rock by a few centimetres. It is paint, so it is not lit like rock —
 // an unlit material keeps the black of the "opening" black at every hour, which is
 // exactly the flatness that gives it away when you stand close.
 paint.position.set(0,TUNNEL.archHeight/2-.35,-.03);
 // A plane faces +z, which here is into the rock. It is painted on the town side.
 paint.rotation.y=Math.PI;
 group.add(paint);

 // The whole face stops you, arch and all.
 colliders.push({id:'painted-tunnel',x:TUNNEL.x,z:TUNNEL.z+1.2,w:TUNNEL.width,d:2.4,height:TUNNEL.height});

 if(register){
  const anchor=new THREE.Object3D();
  anchor.position.set(TUNNEL.x,1.3,TUNNEL.z-1.6);
  parent.add(anchor);
  register(anchor,'Inspect the tunnel',()=>onAction?.('inspect','Harbour Line tunnel',
   'Painted. The arch, the kerbs, the dashes down the middle, all of it, and the rock '+
   'goes on behind. The 17:10 bus uses it twice a day without any trouble.'));
 }

 return {group,face,paint};
}
