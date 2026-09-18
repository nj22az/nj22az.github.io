import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {FOREST_EDGE} from './forest-edge.js';

/**
 * The tunnel at the end of the bus road.
 *
 * It used to be a painting. The bus went through, you did not, and the dark on the
 * canvas read as a black rectangle from the road. The hill now has a hole in it: the
 * arch is a portal, the road keeps going, and anyone who is not a bus is welcome to
 * find that out for themselves. The coyote who lives in the verge has already decided
 * the joke is over and will come with you.
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
 /** The opening, in metres. Comfortably wider than the road. */
 archWidth:8.4,
 archHeight:7.1,
 /** A few metres of apron on the far side, so the hole does not dump you in the sea. */
 lookout:3.2
});

export const tunnelEndZ=()=>TUNNEL.z+TUNNEL.depth+TUNNEL.lookout;

function archPath(ctx,w,h,inset){
 const floor=h-6,left=inset,right=w-inset,top=inset*1.5+22,radius=(right-left)/2;
 ctx.beginPath();
 ctx.moveTo(left,floor);
 ctx.lineTo(left,top+radius);
 ctx.arc(left+radius,top+radius,radius,Math.PI,0);
 ctx.lineTo(right,floor);
 ctx.closePath();
}

/**
 * Only the pale rim. The opening itself is left empty so you look through the hill
 * rather than at a painted dark. Filling the arch was how the mouth became a black
 * rectangle the size of its plane.
 */
function rimTexture(){
 const w=512,h=448,canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 archPath(ctx,w,h,16);ctx.fillStyle='#cfc7b0';ctx.fill();
 ctx.globalCompositeOperation='destination-out';
 archPath(ctx,w,h,28);ctx.fill();
 ctx.globalCompositeOperation='source-over';
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}

function archHole(){
 const half=TUNNEL.archWidth/2,legs=Math.max(.8,TUNNEL.archHeight-half);
 const hole=new THREE.Path();
 hole.moveTo(-half,TUNNEL.base+.02);
 hole.lineTo(half,TUNNEL.base+.02);
 hole.lineTo(half,TUNNEL.base+legs);
 hole.absarc(0,TUNNEL.base+legs,half,0,Math.PI,false);
 hole.closePath();
 return hole;
}

function buildCoyoteMesh(shadows){
 const fur=new THREE.MeshStandardMaterial({color:0xb68a58,roughness:.92,flatShading:true});
 const dark=new THREE.MeshStandardMaterial({color:0x4a3428,roughness:.95,flatShading:true});
 const group=new THREE.Group();group.name='Coyote';
 const body=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),fur);body.scale.set(1.85,.85,.9);body.position.set(0,.32,0);group.add(body);
 const rump=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),fur);rump.scale.set(1.2,.85,1);rump.position.set(-.28,.3,0);group.add(rump);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),fur);head.position.set(.34,.46,0);group.add(head);
 const muzzle=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),fur);muzzle.scale.set(1.5,.7,.7);muzzle.position.set(.48,.4,0);group.add(muzzle);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.03,5,4),dark);nose.position.set(.56,.4,0);group.add(nose);
 for(const side of [-1,1]){
  const ear=new THREE.Mesh(new THREE.ConeGeometry(.055,.16,5),fur);ear.position.set(.3,.64,side*.09);ear.rotation.z=side*.18;ear.rotation.x=side*-.12;group.add(ear);
  const inner=new THREE.Mesh(new THREE.ConeGeometry(.03,.1,5),new THREE.MeshStandardMaterial({color:0xd9b49a,roughness:.9,flatShading:true}));inner.position.set(.31,.6,side*.09);inner.rotation.copy(ear.rotation);group.add(inner);
 }
 const tail=new THREE.Mesh(new THREE.SphereGeometry(.09,7,5),fur);tail.scale.set(2.2,.7,.7);tail.position.set(-.55,.38,0);tail.rotation.z=.4;group.add(tail);
 for(const [x,z] of [[.16,.1],[.16,-.1],[-.2,.1],[-.2,-.1]]){
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.28,5),fur);leg.position.set(x,.14,z);group.add(leg);
 }
 group.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=true;}});
 return group;
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
 group.name='Harbour Line tunnel';
 group.position.set(TUNNEL.x,0,TUNNEL.z);
 parent.add(group);

 const rock=new THREE.MeshStandardMaterial({color:0x6d6a60,roughness:.97,flatShading:true});
 const lining=new THREE.MeshStandardMaterial({color:0x8a8378,roughness:.9,flatShading:true});
 const asphalt=new THREE.MeshStandardMaterial({color:0x5c5f59,roughness:.96});
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
 profile.holes.push(archHole());
 const face=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{depth:TUNNEL.depth,bevelEnabled:false,curveSegments:12}),rock);
 face.castShadow=shadows;face.receiveShadow=true;
 group.add(face);

 const passage=TUNNEL.depth+TUNNEL.lookout;
 const road=new THREE.Mesh(new THREE.BoxGeometry(MAIN_ROAD.width,.08,passage+.8),asphalt);
 road.name='tunnel road';road.position.set(0,.02,passage/2-.2);road.receiveShadow=true;group.add(road);
 for(const side of [-1,1]){
  const verge=new THREE.Mesh(new THREE.BoxGeometry(1.15,.04,passage+.4),new THREE.MeshStandardMaterial({color:0x7a8068,roughness:1}));
  verge.position.set(side*(MAIN_ROAD.width/2+.55),.015,passage/2-.1);verge.receiveShadow=true;group.add(verge);
 }
 for(const side of [-1,1]){
  const wall=new THREE.Mesh(new THREE.BoxGeometry(.38,TUNNEL.archHeight-.2,TUNNEL.depth),lining);
  wall.position.set(side*(TUNNEL.archWidth/2-.12),TUNNEL.archHeight/2+TUNNEL.base,TUNNEL.depth/2);
  wall.castShadow=shadows;wall.receiveShadow=true;group.add(wall);
 }
 const ceiling=new THREE.Mesh(new THREE.BoxGeometry(TUNNEL.archWidth-.1,.32,TUNNEL.depth),lining);
 ceiling.position.set(0,TUNNEL.archHeight+TUNNEL.base-.08,TUNNEL.depth/2);ceiling.receiveShadow=true;group.add(ceiling);
 for(const z of [TUNNEL.depth*.28,TUNNEL.depth*.72]){
  for(const side of [-1,1]){
   const lamp=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.28),new THREE.MeshStandardMaterial({color:0xd9ad68,emissive:0xc48a3a,emissiveIntensity:.55,roughness:.7}));
   lamp.position.set(side*(TUNNEL.archWidth/2-.42),2.35,z);group.add(lamp);
  }
 }
 const rail=new THREE.Mesh(new THREE.BoxGeometry(TUNNEL.archWidth+1.2,.55,.28),rock);
 rail.position.set(0,.28,passage);rail.castShadow=shadows;group.add(rail);

 // Broken ground along the foot, spilling out onto the verge either side of the road,
 // so the hill meets the ground it stands on instead of being set down on it. Kept off
 // the carriageway so the opening stays a road, not a rockfall.
 for(const [x,y,z,s] of [[-6.6,1.5,-.6,2.6],[6.9,1.9,-.4,3.1],[-9.4,3.1,.4,3.9],[9.2,3.6,.3,3.4],
  [-12.8,2.2,-1.4,3.2],[12.4,2.4,-1.1,2.9],[-15.6,1.6,-.6,2.4],[15.1,1.5,-.4,2.2]]){
  const boulder=new THREE.Mesh(new THREE.IcosahedronGeometry(s/2,0),rock);
  boulder.position.set(x,y-s/2+.4,z);
  boulder.rotation.set(x,y,z);
  boulder.castShadow=shadows;boulder.receiveShadow=true;
  group.add(boulder);
 }

 const paint=new THREE.Mesh(
  new THREE.PlaneGeometry(TUNNEL.archWidth+.35,TUNNEL.archHeight+.25),
  new THREE.MeshBasicMaterial({map:rimTexture(),toneMapped:true,transparent:true,depthWrite:false})
 );
 paint.name='Tunnel mouth rim';
 paint.position.set(0,TUNNEL.archHeight/2+TUNNEL.base,-.03);
 // A plane faces +z, which here is into the rock. It is painted on the town side.
 paint.rotation.y=Math.PI;
 group.add(paint);

 const cheek=(TUNNEL.width-TUNNEL.archWidth)/2;
 const midZ=TUNNEL.z+TUNNEL.depth/2;
 colliders.push({id:'tunnel-left',x:TUNNEL.x-TUNNEL.archWidth/2-cheek/2,z:midZ,w:cheek,d:TUNNEL.depth,height:TUNNEL.height});
 colliders.push({id:'tunnel-right',x:TUNNEL.x+TUNNEL.archWidth/2+cheek/2,z:midZ,w:cheek,d:TUNNEL.depth,height:TUNNEL.height});
 colliders.push({id:'tunnel-lookout',x:TUNNEL.x,z:TUNNEL.z+passage,w:TUNNEL.archWidth+1.4,d:.4,height:1.2});

 const coyote=buildCoyoteMesh(shadows);
 coyote.position.set(TUNNEL.x+3.05,0,TUNNEL.z-2.2);
 coyote.rotation.y=Math.PI*.15;
 parent.add(coyote);
 let follow=false,stride=0;
 const update=(dt,player)=>{
  if(!player)return;
  const px=player.x??player.position?.x,pz=player.z??player.position?.z;
  if(!Number.isFinite(px)||!Number.isFinite(pz))return;
  const dx=px-coyote.position.x,dz=pz-coyote.position.z,dist=Math.hypot(dx,dz);
  if(dist<16)follow=true;
  if(!follow||dist<1.55){stride=0;return;}
  const speed=dist>8?4.4:2.7,step=Math.min(dist-1.5,speed*dt),nx=coyote.position.x+dx/dist*step,nz=coyote.position.z+dz/dist*step;
  coyote.position.x=nx;coyote.position.z=nz;
  coyote.lookAt(px,coyote.position.y,pz);
  stride+=dt*speed*2.4;
  coyote.position.y=Math.abs(Math.sin(stride))*.04;
 };

 if(register){
  const anchor=new THREE.Object3D();
  anchor.position.set(TUNNEL.x,1.3,TUNNEL.z-1.6);
  parent.add(anchor);
  register(anchor,'Walk the Harbour Line tunnel',()=>onAction?.('inspect','Harbour Line tunnel',
   'The arch is a hole. The road, the kerbs, the far light, all of it keeps going, and '+
   'the 17:10 bus is no longer the only thing allowed through. The coyote already knew.'));
  register(coyote,'Greet the coyote',()=>onAction?.('inspect','Hill coyote',
   'He lives in the verge by the tunnel. Once you walk far enough he decides you are '+
   'going his way, and then he does too.'));
 }

 /**
  * True where the rock actually is, with a hand's margin. The opening itself is not
  * the rock: running down the road and into the hill's cheeks is the collision this
  * still reports, so a sprint into the jamb is not silent.
  */
 const splat=(x,z)=>{
  const along=z>=TUNNEL.z-.6&&z<=TUNNEL.z+TUNNEL.depth+.6;
  if(!along)return false;
  const offset=Math.abs(x-TUNNEL.x);
  return offset>TUNNEL.archWidth/2-.2&&offset<=TUNNEL.width/2+.4;
 };

 return {group,face,paint,coyote,splat,update};
}
