// Sakura's storeys (the owner, 20 October 2026: "I don't think the whole shop needs to load after we go up the stairs to
// the top floor office"): upstairs the sales floor is not drawn and not run, on the sales floor the upstairs rooms are
// not drawn, and the switch is made where neither can be seen (sakura-stairs.js SAKURA_STOREY, sakura-storey-view.js,
// people/sakura-shop.js). The turning landing's lens frames him and the next flight instead of a wall a step away.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {SAKURA_STAIR,SAKURA_STOREY,SAKURA_LANDING,sakuraStoreyAt,sakuraFlightAt,onSakuraLanding,sakuraLandingLens,sakuraStoreys,sakuraStairLens,sakuraStairFloor,STAIR_LENS_EASE} from '../src/world/interiors/sakura-stairs.js';
import {SAKURA_LAYOUT} from '../src/world/interiors/sakura-layout.js';
import {circleHitsRect} from '../physics.js';

const H=SAKURA_STAIR.height;
/** Feet on the upper flight at a height (it rises east from the landing's H/2 to H over x -4.5..-1.8). */
const upperAt=y=>({x:-4.5+(y-H/2)/(H/2)*2.7,y,z:-6.15});

test('the storey follows his feet: the sales floor, the stair and stockroom, the office; never flickering on the line',()=>{
 assert.equal(sakuraStoreyAt({x:0,y:0,z:2}),'shop');
 assert.equal(sakuraStoreyAt({x:3.8,y:0,z:-3.9}),'shop','in the passage, on the shop side');
 assert.equal(sakuraStoreyAt({x:3.8,y:0,z:-4.2}),'stair','the stockroom');
 assert.equal(sakuraStoreyAt({x:-3,y:1.1,z:-4.6}),'stair','the lower flight');
 assert.equal(sakuraStoreyAt(upperAt(3.5),'stair'),'stair');
 assert.equal(sakuraStoreyAt(upperAt(3.8),'stair'),'office');
 // Between down and up he stays on the storey he was on.
 assert.equal(sakuraStoreyAt(upperAt(3.6),'office'),'office');assert.equal(sakuraStoreyAt(upperAt(3.6),'stair'),'stair');
 assert.equal(sakuraStoreyAt({x:4.45,y:H,z:1.56}),'office','the desk');
 assert.ok(SAKURA_STOREY.up===H-.3,'the same line the window views change on (game.js streetFrontageOf)');
 // Which flight he is on decides the landing's next flight.
 assert.equal(sakuraFlightAt({x:-3,y:1,z:-4.6}),'lower');assert.equal(sakuraFlightAt(upperAt(3)),'upper');
 assert.equal(sakuraFlightAt({x:-5,y:H/2,z:-5}),null);
});

async function shopRoom(){
 installDOM();
 const {buildSakuraInterior}=await import('../src/world/interiors/sakura-interior.js');
 const room=new THREE.Group(),display=buildSakuraInterior({room,reg(){},action(){},exit(){}});
 await display.ready();room.updateMatrixWorld(true);
 return {room,display};
}
const drawn=o=>{for(let a=o;a;a=a.parent)if(!a.visible)return false;return true;};
function cost(room){let draws=0,triangles=0;room.traverse(o=>{if(!o.isMesh||!drawn(o))return;const g=o.geometry;draws++;triangles+=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});return {draws,triangles:Math.round(triangles)};}

test('upstairs the sales floor is put away, on the sales floor the upstairs; the stockroom and the stair stay; all comes back',async()=>{
 const {room,display}=await shopRoom(),view=display.storeys,office=room.getObjectByName('Sakura upstairs main office');
 const all=cost(room);
 const parts=view.salesFloor(),names=new Set(parts.map(p=>p.name));
 for(const name of ['Sakura small office','Sakura restroom','Jaga-bo mascot','Sakura refrigerated drinks and dairy','Sakura window decorations','Sakura specials board','Sakura cap tree'])assert.ok(names.has(name),name+' is part of the sales floor');
 const goods=parts.filter(p=>/ goods$/.test(p.name));assert.ok(goods.length>=15,'the goods on the shelves: '+goods.length);
 for(const name of ['Sakura internal stairwell','Sakura back room stock','Sakura storage life'])assert.ok(!names.has(name),name+' stays: the stair looks down into it');
 const wall=room.getObjectByName('sakura-building');assert.ok(wall&&!parts.includes(wall),'the building’s walls stay');
 // A fridge's contents shut away stay shut away after the storey comes back.
 const contents=room.getObjectByName('Sakura office fridge contents');assert.equal(contents.visible,false);
 assert.equal(view.show('office'),true);
 for(const p of parts)assert.equal(drawn(p),false,p.name+' is not drawn upstairs');
 assert.ok(drawn(office)&&drawn(room.getObjectByName('Sakura back room stock')),'upstairs, the office and the stockroom are drawn');
 const up=cost(room);
 view.show('shop');
 assert.equal(drawn(office),false,'on the sales floor the upstairs rooms are not drawn');
 for(const p of parts)assert.equal(p.visible,true,p.name+' is back');
 const down=cost(room);
 view.show('stair');assert.ok(drawn(office));assert.deepEqual(cost(room),all,'on the stair, everything');
 assert.equal(contents.visible,false,'and what was hidden is still hidden');
 // What it saves, by the scene's own count (the browser's per-frame numbers are in the report).
 assert.ok(up.draws<all.draws*.5&&up.triangles<all.triangles*.5,'upstairs draws '+JSON.stringify(up)+' of '+JSON.stringify(all));
 assert.ok(down.draws<all.draws,'the sales floor draws '+JSON.stringify(down)+' of '+JSON.stringify(all));
 view.reset();display.dispose();
});

/**
 * The switch made out of sight. From every lens near the line (his eye and the boom behind him either way on the upper
 * flight at the two thresholds, the head of the stair, the hall over the hole) no ray in any direction reaches a part of
 * the sales floor before it meets something drawn on the office storey; and from the shop side of the passage, and from
 * the lens in the stockroom behind him as he steps through it, none reaches the upstairs rooms.
 */
test('the storeys change where neither hidden part can be seen: no pop',async()=>{
 const {room,display}=await shopRoom(),view=display.storeys,parts=view.salesFloor(),office=room.getObjectByName('Sakura upstairs main office');
 const ray=new THREE.Raycaster(),inside=(o,root)=>{for(let a=o;a;a=a.parent)if(a===root)return true;return false;};
 const directions=[];for(let i=0;i<20;i++)for(let j=0;j<40;j++){const el=-Math.PI/2+(i+.5)/20*Math.PI,az=j/40*Math.PI*2;directions.push(new THREE.Vector3(Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az)));}
 const meshes=[],goods=[];room.traverse(o=>{if(!o.isMesh||!drawn(o))return;if(o.isInstancedMesh)goods.push({o,box:new THREE.Box3().setFromObject(o)});else meshes.push(o);});
 /** The first thing drawn along each ray from the eye; any of `hidden` first (or an instanced box of it nearer) is a pop. */
 const sees=(eye,hidden)=>{
  for(const d of directions){
   ray.set(eye,d);ray.far=40;const hit=ray.intersectObjects(meshes,false)[0],far=hit?hit.distance:Infinity,p=new THREE.Vector3();
   if(hit&&hidden(hit.object))return hit.object.name+' along '+d.toArray().map(v=>v.toFixed(2));
   for(const g of goods)if(hidden(g.o)&&ray.ray.intersectBox(g.box,p)&&p.distanceTo(eye)<far-.02&&!g.box.containsPoint(eye))return g.o.name+' along '+d.toArray().map(v=>v.toFixed(2));
  }
  return null;
 };
 const salesFloor=o=>parts.some(p=>inside(o,p));
 const upstairsLenses=[];
 for(const y of [SAKURA_STOREY.down,SAKURA_STOREY.up]){const f=upperAt(y);
  upstairsLenses.push([f.x,y+1.6,f.z],[f.x-1.9,y+1.85,f.z],[Math.min(-1.9,f.x+1.9),y+1.85,f.z],[f.x,y+1.6,f.z+.34],[f.x,y+1.6,f.z-.34]);}
 upstairsLenses.push([-1.2,H+1.6,-5.0],[-1.2,H+1.8,-3.6],[-3.6,H+1.6,-3.7],[-6.0,H+1.6,-5.0],[-1.0,H+1.9,-2.0]);
 for(const p of upstairsLenses){const where=sees(new THREE.Vector3(...p),salesFloor);assert.equal(where,null,'from '+p+' the sales floor shows: '+where);}
 // From the sales floor by the passage, and from the lens behind him in the stockroom as he steps through it.
 const upstairs=o=>inside(o,office);
 for(const p of [[3.8,1.6,-3.9],[3.3,1.6,-3.93],[4.35,1.6,-3.93],[3.8,2.4,-3.0],[3.8,1.9,-5.0],[3.8,1.9,-6.1],[2.9,1.9,-5.5],[0,1.6,0]]){
  const where=sees(new THREE.Vector3(...p),upstairs);assert.equal(where,null,'from '+p+' the upstairs shows: '+where);
 }
 display.dispose();
});

test('the shop runs and draws its sales floor below, and neither upstairs; it all comes back on the way down',async()=>{
 installDOM();
 const {RESIDENTS}=await import('../src/people/residents.js'),{createResidentLedger}=await import('../src/people/resident-personalities.js');
 const {restoreSakura}=await import('../src/commerce/sakura-economy.js'),{createSakuraShop}=await import('../src/people/sakura-shop.js');
 const scene=new THREE.Scene(),profile=RESIDENTS.find(p=>p.name==='Thuan'),g=new THREE.Group();
 g.userData={name:'Thuan',hit:{inside:false},indoors:'market',visualReady:false};scene.add(g);
 const world={people:[{profile,g}]},state={yen:1200,inventory:[],sakura:restoreSakura(),residentLife:{}};
 let inside=true;const player=new THREE.Vector3(0,0,2);
 const shop=createSakuraShop({world,scene,state,ledger:createResidentLedger(()=>state),register(o,label,fn,within){o.userData.hit={inside:within,fn,label};},action(){},exit(){},getMinutes:()=>600,getPlayerPosition:()=>player,isInside:()=>inside});
 try{
  await shop.ready();shop.enter(scene);
  const calls={retail:0,fridge:0,stock:0,tick:0};
  const spy=(o,k,n)=>{const f=o[k].bind(o);o[k]=(...a)=>{calls[n]++;return f(...a);};};
  spy(shop.retail,'update','retail');spy(shop.display.refrigerator,'update','fridge');spy(shop.display,'updateStock','stock');
  const customer=new THREE.Group();customer.userData.name='a customer';customer.position.set(0,0,1);shop.group.add(customer);
  const counter=shop.group.getObjectByName('Sakura small office'),office=shop.group.getObjectByName('Sakura upstairs main office');
  shop.layout.follow(player);shop.update(1/60);
  assert.equal(shop.storey,'shop');assert.ok(calls.retail&&calls.fridge&&calls.stock,'on the sales floor the shop runs');assert.equal(office.visible,false,'and the upstairs is not drawn');
  // Up the stair: on the lower flight both are drawn; past the line upstairs, the sales floor goes.
  player.set(-3,1,-4.6);shop.layout.follow(player);assert.equal(shop.storey,'stair');assert.equal(office.visible,true);
  const f=upperAt(3.9);player.set(f.x,f.y,f.z);shop.layout.follow(player);assert.equal(shop.storey,'office');
  for(const k of Object.keys(calls))calls[k]=0;
  for(let i=0;i<30;i++)shop.update(1/60);
  assert.deepEqual(calls,{retail:0,fridge:0,stock:0,tick:0},'upstairs nothing on the sales floor is run');
  assert.equal(counter.visible,false,'nor drawn');assert.equal(customer.visible,false,'and the customers on it are not drawn');
  // Somebody in the stockroom (which the stair's hole shows) keeps the shop's people running, and is drawn.
  const porter=new THREE.Group();porter.userData.name='in the stockroom';porter.position.set(.7,0,-5.5);shop.group.add(porter);
  shop.update(1/60);assert.ok(calls.retail>0,'the people run while one is in sight');assert.equal(porter.visible,true);assert.equal(customer.visible,false);
  porter.removeFromParent();
  // Down again: everything back, and run.
  player.set(-3,1,-4.6);shop.layout.follow(player);assert.equal(shop.storey,'stair');
  assert.equal(counter.visible,true);assert.equal(customer.visible,true);
  for(const k of Object.keys(calls))calls[k]=0;shop.update(1/60);assert.ok(calls.retail&&calls.fridge&&calls.stock,'and the shop runs again');
  // From the street the shop is whole behind its window, whatever storey he left it on.
  player.set(f.x,f.y,f.z);shop.layout.follow(player);inside=false;shop.street(scene,{position:[-11,0,-28],yaw:0});
  assert.equal(counter.parent.visible,true);assert.ok(shop.group.getObjectByName('Sakura refrigerated drinks and dairy').visible,'the shop floor shows through the window');
 }finally{shop.display.dispose();}
});

test('the turning landing: the lens frames him and the next flight, in sight of him, never in a wall',async()=>{
 const {room,display}=await shopRoom(),colliders=sakuraStoreys(SAKURA_LAYOUT)&&display.layout.colliders;
 const solid=(x,z,y,r)=>colliders.some(c=>!c.only&&(c.minY||0)<y+.06&&(!Number.isFinite(c.height)||(c.minY||0)+c.height>y-.06)&&circleHitsRect(x,z,r,c));
 // The slabs too: the treads, the landings, the office floor (the walk's floors), as the eye sees them.
 const walk=display.layout.walk,slab=(x,z,y)=>walk.floors.some(f=>{if(x<f.x[0]||x>f.x[1]||z<f.z[0]||z>f.z[1])return false;const h=walk.heightOn(f,x,z);return y<h&&y>h-(f.thick||.12);});
 const clear=(a,b)=>{const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);for(let t=.2;t<len-.35;t+=.08){const p=a.map((v,i)=>v+d[i]*t/len);if(solid(p[0],p[2],p[1],.06)||slab(p[0],p[2],p[1]))return false;}return true;};
 const ray=new THREE.Raycaster(),blockers=[];room.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&drawn(o))blockers.push(o);});
 for(const going of ['up','down']){
  for(let z=SAKURA_LANDING.z[0]+.3;z<=SAKURA_LANDING.z[1]-.25;z+=.3)for(const x of [-5.3,-4.8]){
   const p={x,y:H/2,z};assert.ok(onSakuraLanding(p));
   const shots=sakuraLandingLens(p,going),shot=shots.find(s=>clear(s.pos,s.chest));
   assert.ok(shot,going+': a lens sees him at '+[x,z]);
   assert.equal(solid(shot.pos[0],shot.pos[2],shot.pos[1],.16),false,'the lens stands in no wall');
   // Room to see: nothing drawn within half a metre straight ahead of the lens, and he is in front of it.
   const pos=new THREE.Vector3(...shot.pos),look=new THREE.Vector3(...shot.at).sub(pos).normalize();ray.set(pos,look);ray.far=40;
   const hit=ray.intersectObjects(blockers,false)[0];assert.ok(!hit||hit.distance>.5,going+' at '+[x,z]+': the lens looks into '+hit?.object.name+' at '+hit?.distance?.toFixed(2));
   const toChest=new THREE.Vector3(...shot.chest).sub(pos);assert.ok(toChest.normalize().dot(look)>Math.cos(.25),'he is near the middle of the frame');
   // And the next flight's middle, in sight from there.
   const flight=SAKURA_LANDING.lens[going].find(c=>c.pos===shot.pos).flight;
   assert.ok(clear(shot.pos,flight),going+': the next flight is in sight from '+shot.pos);
   assert.ok(new THREE.Vector3(...flight).sub(pos).normalize().dot(look)>Math.cos(.6),'and in the frame');
  }
 }
 assert.equal(onSakuraLanding({x:-3,y:1,z:-4.6}),false,'on a flight the boom is his own again');
 display.dispose();
});

/**
 * The whole stair, both ways, as the game's lens takes it (game.js placeLandingLens): walked at 1.4 m/s, sixty frames a
 * second, the lens easing after the stair's own lenses (the first with a clear sight of him, as the game picks). Every
 * frame: the lens at least 1.4 m from him, in no wall, guard or slab and under the stairwell's roof; all of him in sight
 * (head, chest, knees) and inside an upright phone's frame (65° high, 390 × 844); and on a flight the steps two metres
 * ahead of him in the frame too.
 */
test('on the stair, both ways, the lens keeps all of him and where he is going in the frame, never in a wall',async()=>{
 const {display}=await shopRoom(),colliders=display.layout.colliders,walk=display.layout.walk;
 const solid=(x,z,y,r)=>colliders.some(c=>!c.only&&(c.minY||0)<y+.06&&(!Number.isFinite(c.height)||(c.minY||0)+c.height>y-.06)&&circleHitsRect(x,z,r,c));
 const slab=(x,z,y)=>walk.floors.some(f=>{if(x<f.x[0]||x>f.x[1]||z<f.z[0]||z>f.z[1])return false;const h=walk.heightOn(f,x,z);return y<h+.02&&y>h-(f.thick||.12)-.02;});
 const clear=(a,b)=>{const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);for(let t=.2;t<len-.3;t+=.06){const p=a.map((v,i)=>v+d[i]*t/len);if(solid(p[0],p[2],p[1],.06)||slab(p[0],p[2],p[1]))return false;}return true;};
 const pick=shots=>shots.find(s=>{const [x,y,z]=s.pos,dx=s.chest[0]-x,dy=s.chest[1]-y,dz=s.chest[2]-z,len=Math.hypot(dx,dy,dz);if(solid(x,z,y,.16))return false;for(let t=.2;t<len-.35;t+=.12){const k=t/len;if(solid(x+dx*k,z+dz*k,y+dy*k,.06))return false;}return true;})||shots[0];
 const fov=65*Math.PI/180,aspect=390/844,halfV=fov/2,halfH=Math.atan(Math.tan(halfV)*aspect);
 const inFrame=(pos,look,p,margin=.03,wide=aspect)=>{const halfH=Math.atan(Math.tan(halfV)*wide);const f=new THREE.Vector3(...look).sub(new THREE.Vector3(...pos)).normalize(),right=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(right,f);
  const d=new THREE.Vector3(...p).sub(new THREE.Vector3(...pos)),z=d.dot(f);return z>0&&Math.abs(Math.atan2(d.dot(right),z))<halfH-margin&&Math.abs(Math.atan2(d.dot(up),z))<halfV-margin;};
 // The feet along the stair's line: the lower flight, round the landing, the upper flight.
 const line=[];const step=.05;
 for(let x=-1.9;x>=-4.5;x-=step)line.push([x,sakuraStairFloor('lower',x),-4.6]);
 for(let z=-4.6;z>=-6.15;z-=step)line.push([-5.05,H/2,z]);
 for(let x=-4.5;x<=-1.9;x+=step)line.push([x,sakuraStairFloor('upper',x),-6.15]);
 for(const going of ['up','down']){
  const feet=going==='up'?line:[...line].reverse(),dt=1/60,speed=1.4;
  let pos=null,at=null,frames=0,nearest=Infinity,kneesHidden=0,aheadFrames=0,aheadOut=0,aheadOffWide=0;
  for(let i=0;i<feet.length;i++){
   const p={x:feet[i][0],y:feet[i][1],z:feet[i][2]};
   const shots=sakuraStairLens(p,going);assert.ok(shots?.length,going+': a lens at '+feet[i]);
   const shot=pick(shots);
   // Between two points of the line, the frames he takes to walk it.
   const n=Math.max(1,Math.round(step/(speed*dt)));
   for(let k=0;k<n;k++){
    if(!pos){pos=[...shot.pos];at=[...shot.at];}
    else{const a=1-Math.exp(-STAIR_LENS_EASE.pos*dt),b=1-Math.exp(-STAIR_LENS_EASE.look*dt);pos=pos.map((v,j)=>v+(shot.pos[j]-v)*a);at=at.map((v,j)=>v+(shot.at[j]-v)*b);}
    frames++;
    const head=[p.x,p.y+1.6,p.z],chest=[p.x,p.y+1.2,p.z],knees=[p.x,p.y+.45,p.z],d=Math.hypot(...chest.map((v,j)=>v-pos[j]));nearest=Math.min(nearest,d);
    const where=going+' at '+feet[i].map(v=>v.toFixed(2))+' lens '+pos.map(v=>v.toFixed(2));
    assert.ok(d>=1.4,where+': the lens is '+d.toFixed(2)+' m from him');
    assert.equal(solid(pos[0],pos[2],pos[1],.12),false,where+': the lens is in a wall or a guard');
    assert.equal(slab(pos[0],pos[2],pos[1]),false,where+': the lens is in a floor');
    assert.ok(pos[1]<H+2.8-.2,where+': under the stairwell’s roof');
    for(const q of [head,chest,knees])assert.ok(inFrame(pos,at,q),where+': he is out of the phone’s frame at '+q.map(v=>v.toFixed(2)));
    for(const q of [head,chest])assert.ok(clear(pos,q),where+': he is hidden at '+q.map(v=>v.toFixed(2)));
    // His knees may pass behind the guard between the flights (a rail's height) for a moment on the landing, not more.
    if(!clear(pos,knees))kneesHidden++;
    // Where he is going: always in a landscape frame; on an upright phone too, but for the moments the lens is still
    // coming round from the landing behind him.
    if(shot.ahead){aheadFrames++;if(!inFrame(pos,at,shot.ahead,0,16/10)){aheadOffWide++;if(process.env.DEBUG_LENS)console.log('wide off',where);}if(!inFrame(pos,at,shot.ahead,0))aheadOut++;}
   }
  }
  assert.ok(frames>200&&nearest>=1.4,going+': '+frames+' frames, nearest '+nearest.toFixed(2)+' m');
  if(process.env.DEBUG_LENS)console.log(going,{frames,aheadFrames,aheadOut,aheadOffWide,kneesHidden,nearest});
  assert.ok(aheadOffWide<=aheadFrames*.02,going+': where he is going is off a landscape frame in '+aheadOffWide+' of '+aheadFrames+' frames');
  assert.ok(aheadOut<=aheadFrames*.15,going+': where he is going is off an upright phone in '+aheadOut+' of '+aheadFrames+' frames');
  assert.ok(kneesHidden<=frames*.05,going+': his knees hidden in '+kneesHidden+' of '+frames+' frames');
 }
 display.dispose();
});
