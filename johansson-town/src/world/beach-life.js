import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {BEACH,beachHeight} from './beach-layout.js';
import {waveHeight,SEA_LEVEL,WAVE_REACH} from './ocean.js';

/**
 * Life on the east beach: small crabs working the wet sand, and fish breaking the water
 * further out.
 *
 * The crabs go sideways, as crabs do, stop to pick at the sand, and run for the sea when
 * you come near; step right up to one and it digs itself in and comes up somewhere else
 * once you have gone. The fish are a pool of three that leap now and then well off the
 * beach, sometimes twice in a row, each leaving a ring on the water.
 *
 * Everything here is one instanced draw for the crabs and a handful of small meshes for
 * the fish and their rings, so it costs next to nothing when you are not looking.
 */
const crabLine=(()=>{
 // The last sand the highest wave does not reach, less a stride: the sea is drawn on a
 // coarse grid and its swell washes further up the beach than the still-water line.
 const wet=SEA_LEVEL+WAVE_REACH+.1;let x=BEACH.profile[0][0];
 while(beachHeight(x+.1,0)!=null&&beachHeight(x+.1,0)>wet)x+=.1;
 return x;
})();
export const CRAB_ZONE=Object.freeze({
 // Clear of the access ramps at the wall and short of where the swell washes up.
 minX:35.8,maxX:crabLine,minZ:BEACH.minZ+1.2,maxZ:BEACH.maxZ-1.2,
});
/** Where the fish jump: offshore of the east beach, far enough to read as "out there". */
export const FISH_WATERS=Object.freeze({minX:56,maxX:100,minZ:-60,maxZ:35});
/** How near you can get before a crab runs, and before it digs in. */
export const CRAB_WARY=3.4,CRAB_HIDE=1.25;

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

/** The sand under a crab, or the edge of the zone if it has strayed off it. */
export function crabGround(x,z){
 return beachHeight(clamp(x,CRAB_ZONE.minX,CRAB_ZONE.maxX),clamp(z,CRAB_ZONE.minZ,CRAB_ZONE.maxZ))??-.3;
}

/**
 * One crab's mind, kept apart from the drawing so it can be tested. Its body faces
 * `yaw`, and it walks at right angles to that.
 */
export function createCrab(x,z,random=Math.random){
 const crab={x,z,yaw:random()*Math.PI*2,mode:'rest',timer:.5+random()*2,tx:x,tz:z,speed:0,sink:0,step:random()*10};
 const aim=(tx,tz)=>{
  crab.tx=clamp(tx,CRAB_ZONE.minX,CRAB_ZONE.maxX);crab.tz=clamp(tz,CRAB_ZONE.minZ,CRAB_ZONE.maxZ);
  // Face so that the way to go is out to the side.
  crab.yaw=Math.atan2(crab.tx-crab.x,crab.tz-crab.z)+(random()<.5?1:-1)*Math.PI/2;
 };
 crab.update=(dt,player)=>{
  const near=player?Math.hypot(player.x-crab.x,player.z-crab.z):Infinity;
  if(crab.mode==='hidden'){
   crab.sink=Math.min(1,crab.sink+dt*4);crab.timer-=dt;
   // Come up again only once nobody is standing over the spot, a little way off.
   if(crab.timer<=0&&near>6){
    crab.x=clamp(crab.x+(random()-.5)*5,CRAB_ZONE.minX,CRAB_ZONE.maxX);crab.z=clamp(crab.z+(random()-.5)*5,CRAB_ZONE.minZ,CRAB_ZONE.maxZ);
    crab.mode='rest';crab.timer=1+random()*2;
   }
   return crab;
  }
  crab.sink=Math.max(0,crab.sink-dt*2.5);
  if(near<CRAB_HIDE){crab.mode='hidden';crab.timer=5+random()*6;crab.speed=0;return crab;}
  if(near<CRAB_WARY&&crab.mode!=='flee'){
   // Away from you, and seaward if it can: crabs make for the water.
   const ax=(crab.x-player.x)/(near||1),az=(crab.z-player.z)/(near||1);
   aim(crab.x+ax*3+1.2,crab.z+az*3);crab.mode='flee';crab.timer=2;
  }
  if(crab.mode==='rest'){
   crab.speed=0;crab.timer-=dt;
   if(crab.timer<=0){aim(crab.x+(random()-.5)*4,crab.z+(random()-.5)*4);crab.mode='walk';crab.timer=4;}
  }else{
   const target=crab.mode==='flee'?2.4:.55;
   crab.speed+=(target-crab.speed)*(1-Math.exp(-dt*10));
   const dx=crab.tx-crab.x,dz=crab.tz-crab.z,d=Math.hypot(dx,dz);crab.timer-=dt;
   if(d<.05||crab.timer<=0){crab.timer=crab.mode==='flee'?.6:1+random()*3.5;crab.mode='rest';}
   else{const s=Math.min(d,crab.speed*dt);crab.x+=dx/d*s;crab.z+=dz/d*s;crab.step+=s*40;}
  }
  return crab;
 };
 return crab;
}

/** A crab about the size of a palm, in one geometry with its colours in the vertices. */
function crabGeometry(){
 const parts=[];
 const add=(geometry,colour,{x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0}={})=>{
  const g=geometry.index?geometry.toNonIndexed():geometry;g.deleteAttribute('uv');
  g.scale(sx,sy,sz);g.rotateX(rx);g.rotateZ(rz);g.rotateY(ry);g.translate(x,y,z);
  const c=new THREE.Color(colour),colours=new Float32Array(g.attributes.position.count*3);
  for(let i=0;i<colours.length;i+=3){colours[i]=c.r;colours[i+1]=c.g;colours[i+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(colours,3));parts.push(g);
 };
 // A red crab, darker than the sand at any hour, so it reads on it at dusk too.
 const shell=0x9c2e22,claw=0xb8402c,leg=0x7a241b,eye=0x140f0d;
 // Front is +z. The shell is wider than it is long.
 add(new THREE.SphereGeometry(1,10,6),shell,{y:.045,sx:.085,sy:.035,sz:.065});
 for(const side of [-1,1]){
  add(new THREE.SphereGeometry(1,6,4),claw,{x:side*.075,y:.04,z:.07,sx:.03,sy:.022,sz:.038});
  add(new THREE.CylinderGeometry(.006,.006,.035,4),eye,{x:side*.022,y:.085,z:.05});
  for(const [i,z] of [.03,0,-.03].entries())
   add(new THREE.BoxGeometry(.075,.01,.012),leg,{x:side*.105,y:.028-i*.002,z,rz:side*-.45});
 }
 const merged=mergeGeometries(parts,false);merged.computeVertexNormals();
 return merged;
}

/** A silvery mullet, nose along +x. */
function fishGeometry(){
 const body=new THREE.SphereGeometry(1,10,6);body.scale(.24,.06,.045);
 const tail=new THREE.ConeGeometry(.07,.1,4);tail.rotateZ(Math.PI/2);tail.scale(1,1,.25);tail.translate(-.27,0,0);
 const g=mergeGeometries([body.toNonIndexed(),tail.toNonIndexed()],false);g.computeVertexNormals();
 return g;
}

export function buildBeachLife({parent,shadows=false,crabs=11,random=Math.random}={}){
 const group=new THREE.Group();group.name='Beach life';parent.add(group);
 // Moving things: the section renderer must draw them as they are each frame, not batch
 // them where they stood when the town was first cached. It culls a moving thing by
 // where its group stands, so the crabs and the fish each get a group placed where they
 // live, and their positions are kept relative to it.
 const place=(name,x,z)=>{const g=new THREE.Group();g.name=name;g.position.set(x,0,z);g.userData.dynamicProp=true;group.add(g);return g;};
 const shore=place('Beach crabs',(CRAB_ZONE.minX+CRAB_ZONE.maxX)/2,(CRAB_ZONE.minZ+CRAB_ZONE.maxZ)/2);
 const offshore=place('Leaping fish',(FISH_WATERS.minX+FISH_WATERS.maxX)/2,(FISH_WATERS.minZ+FISH_WATERS.maxZ)/2);
 const people=[];
 // A few little colonies along the tide line rather than an even scatter.
 const colonies=[-31,-18,-4,9,19];
 for(let i=0;i<crabs;i++){
  const cz=colonies[i%colonies.length]+(random()-.5)*6;
  const x=CRAB_ZONE.maxX-.3-random()*3.5;
  people.push(createCrab(x,clamp(cz,CRAB_ZONE.minZ,CRAB_ZONE.maxZ),random));
 }
 const crabMesh=new THREE.InstancedMesh(crabGeometry(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7}),crabs);
 crabMesh.name='Beach crabs';crabMesh.castShadow=!!shadows;crabMesh.frustumCulled=false;
 crabMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);shore.add(crabMesh);

 const fishGeo=fishGeometry(),fishMat=new THREE.MeshStandardMaterial({color:0xb9c3c6,roughness:.35,metalness:.4});
 const ringGeo=new THREE.RingGeometry(.82,1,28);ringGeo.rotateX(-Math.PI/2);
 const fish=[],rings=[];
 for(let i=0;i<3;i++){
  const mesh=new THREE.Mesh(fishGeo,fishMat);mesh.name='Leaping fish';mesh.scale.setScalar(1.5);mesh.visible=false;offshore.add(mesh);
  fish.push({mesh,world:new THREE.Vector3(),active:false,t:0,duration:1,x:0,z:0,dx:1,dz:0,travel:1.5,height:.7,hops:0});
 }
 for(let i=0;i<8;i++){
  const mesh=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xeaf6f8,transparent:true,opacity:0,depthWrite:false}));
  mesh.name='Splash ring';mesh.visible=false;mesh.renderOrder=2;offshore.add(mesh);
  rings.push({mesh,age:0,life:1.6,size:1,x:0,z:0});
 }
 let clock=0,nextJump=2+random()*3;
 const splash=(x,z,size=1)=>{
  const ring=rings.find(r=>!r.mesh.visible)||rings.reduce((a,b)=>a.age>b.age?a:b);
  Object.assign(ring,{age:0,x,z,size,life:1.3+size*.5});ring.mesh.visible=true;
 };
 const leap=f=>{
  f.active=true;f.t=0;f.duration=.7+random()*.35;f.travel=1.2+random()*1.1;f.height=.55+random()*.55;
  const a=random()*Math.PI*2;f.dx=Math.cos(a);f.dz=Math.sin(a);
  f.mesh.visible=true;f.mesh.rotation.set(0,-a,0);splash(f.x,f.z,.8);
 };
 const dummy=new THREE.Object3D();
 /**
  * @param {number} dt
  * @param {{x:number,z:number}|null} player  where the player is, or null indoors.
  * @param {number} [time]  the clock the sea's waves run on, so a ring sits on the water.
  */
 const tick=(dt,player=null,time)=>{
  dt=clamp(dt||0,0,.1);clock=Number.isFinite(time)?time:clock+dt;
  people.forEach((crab,i)=>{
   crab.update(dt,player);
   const moving=crab.speed>.05,bob=moving?Math.abs(Math.sin(crab.step))*.012:0;
   dummy.position.set(crab.x-shore.position.x,crabGround(crab.x,crab.z)+bob-crab.sink*.12,crab.z-shore.position.z);
   dummy.rotation.set(0,crab.yaw,moving?Math.sin(crab.step*2)*.12:0);
   dummy.scale.setScalar(crab.sink>=1?0:1.35);dummy.updateMatrix();crabMesh.setMatrixAt(i,dummy.matrix);
  });
  crabMesh.instanceMatrix.needsUpdate=true;

  nextJump-=dt;
  if(nextJump<=0){
   const f=fish.find(f=>!f.active);
   if(f){
    const w=FISH_WATERS;f.x=w.minX+random()*(w.maxX-w.minX);f.z=w.minZ+random()*(w.maxZ-w.minZ);
    f.hops=random()<.35?1+Math.floor(random()*2):0;leap(f);
   }
   nextJump=2.5+random()*6;
  }
  for(const f of fish){
   if(!f.active)continue;
   f.t+=dt;const u=f.t/f.duration;
   if(u>=1){
    const x=f.x+f.dx*f.travel,z=f.z+f.dz*f.travel;splash(x,z,1);
    if(f.hops>0){f.hops--;f.x=x+f.dx*.3;f.z=z+f.dz*.3;leap(f);}
    else{f.active=false;f.mesh.visible=false;}
    continue;
   }
   const x=f.x+f.dx*f.travel*u,z=f.z+f.dz*f.travel*u,water=waveHeight(x,z,clock);
   f.mesh.position.set(x-offshore.position.x,water+4*f.height*u*(1-u),z-offshore.position.z);f.world.set(x,f.mesh.position.y,z);
   // Nose up on the way out, down on the way back in.
   f.mesh.rotation.z=Math.atan2(4*f.height*(1-2*u),f.travel)*.9;
  }
  for(const r of rings){
   if(!r.mesh.visible)continue;
   r.age+=dt;const u=r.age/r.life;
   if(u>=1){r.mesh.visible=false;continue;}
   const s=(.25+u*1.5)*r.size;
   r.mesh.scale.set(s,1,s);// The sea is drawn on a grid fourteen metres across, so between its vertices the
   // surface is a straight line through the swell; lift the ring clear of either.
   r.mesh.position.set(r.x-offshore.position.x,Math.max(waveHeight(r.x,r.z,clock),SEA_LEVEL)+.1,r.z-offshore.position.z);
   r.mesh.material.opacity=.85*(1-u)*(1-u);
  }
 };
 return {group,crabs:people,fish,rings,crabMesh,tick};
}
