import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createVendingMachine} from '../src/world/vending.js';
import {buildJCoffeeCan,J_COFFEE_CAN} from '../src/world/halloween-props.js';
import {VENDING_PRODUCTS} from '../src/commerce/vending-catalogue.js';
import {buildHalloween,HALLOWEEN,HALLOWEEN_ELECTRICS as E,cordResistance,lanternCurrent,reelVolts,lanternBrightness,cordHeat,buildObake,buildDog,buildPumpkinLantern} from '../src/world/halloween.js';
import {SAKURA_BOX} from '../src/world/okinawa/old-town.js';

installDOM();

// "The Haunted Vending Machine": Halloween on Sakura Street, and the electrics the story's Why it works explains.
const town=()=>{const world={group:new THREE.Group(),colliders:[],hourly:[]};
 const m=createVendingMachine({});m.position.set(HALLOWEEN.machine.x,0,HALLOWEEN.machine.z);m.rotation.y=Math.PI/2;world.group.add(m);
 const h=buildHalloween(world,{});world.group.updateMatrixWorld(true);return {world,h,machine:m};};
// the meshes' box (a lantern's glow halo is light, not a thing: it may spread past the lantern)
const box=o=>{o.updateWorldMatrix(true,true);const b=new THREE.Box3();o.traverse(x=>{if(x.isMesh)b.expandByObject(x);});return b;};

test('the electrics: the start surge through the thin, half-coiled reel dims every lantern and drops the coin relay',()=>{
 assert.ok(Math.abs(cordResistance()-1.376)<.001,'30 m of 0.75 mm², there and back: 1.38 Ω');
 assert.equal(lanternCurrent(),3.25,'thirteen 25 W bulbs at 100 V');
 const run=reelVolts(false),start=reelVolts(true);
 assert.ok(run>89&&run<91,'running: about 90 V at the reel ('+run.toFixed(1)+')');
 assert.ok(start>62&&start<63.5,'starting (6 × 4 A): about 62 V ('+start.toFixed(1)+')');
 assert.ok(start<E.supply*E.relayDropout,'below the coin relay’s hold-in: it lets go (a free can)');
 assert.ok(lanternBrightness(run)>.65&&lanternBrightness(start)<.25,'the street breathes: the lanterns fall to a fifth of their light');
 assert.ok(E.compressorRun+lanternCurrent()>E.coiledRating&&cordHeat()>60,'more than the reel’s coiled rating: about 70 W warming the coil');
 // the fix: the machine on its own socket, the lanterns on their own: no shared thin cord, nothing dips
 const own={...E,compressorRun:0};assert.ok(lanternBrightness(reelVolts(true,own))>.85,'on their own cable the lanterns hold');
});

test('the string, the lanterns, the ghosts and the reel are on Sakura’s frontage, clear of the people walking under them',()=>{
 const {h,machine}=town();h.stage({glow:1});
 assert.equal(h.lanterns.length,E.lanterns);
 const mb=box(machine);
 for(const l of h.lanterns){const b=box(l);
  assert.ok(b.min.y>1.82,'a lantern hangs above a head: '+l.name+' '+b.min.y.toFixed(2));
  assert.ok(b.max.y<2.62,'under the awning’s tie points');
  assert.ok(b.min.x>SAKURA_BOX.maxX+.85&&b.max.x<-5.5,'over the pavement, in front of the awning');
  assert.ok(b.min.z>-33.45,'clear of the cold-drinks banner');
  assert.ok(!b.intersectsBox(mb),'not in the machine');}
 const reel=h.group.getObjectByName('Cord reel'),rb=box(reel);
 assert.ok(!rb.intersectsBox(mb),'the reel stands clear of the machine');
 assert.ok(rb.min.y>-.001&&rb.min.y<.02,'the reel on the pavement');
 const sock=h.group.getObjectByName('Drinks machine outdoor socket'),sb=box(sock);
 assert.ok(Math.abs(sb.min.x-(SAKURA_BOX.maxX+.01))<.02,'the socket on the wall');
 assert.ok(sb.min.z<SAKURA_BOX.minZ+.3&&sb.max.z>SAKURA_BOX.minZ,'on the corner pier, south of the shutter');
 const ghosts=[];h.group.traverse(o=>{if(o.name==='Cardboard ghost')ghosts.push(o);});assert.equal(ghosts.length,4);
 for(const g of ghosts){const b=box(g);assert.ok(b.min.y>.75&&b.max.y<1.7,'at a child’s eye height');assert.ok(b.min.x>SAKURA_BOX.maxX+.15,'on the shutter, in front of it');}
});

test('stage: the moments the story photographs, each switching what it should',()=>{
 const {h,machine}=town();
 assert.equal(h.group.visible,false,'hidden out of season');
 h.stage({glow:lanternBrightness(reelVolts(false)),cable:'reel'});assert.equal(h.group.visible,true);
 const lit=[];machine.traverse(m=>{if(m.isMesh&&m.material?.isMeshBasicMaterial&&m.material.map)lit.push(m.material);});assert.ok(lit.length>=2,'the machine’s lit window and brand');
 const before=lit[0].color.r;h.stage({machine:.35});assert.ok(lit[0].color.r<before*.4,'the machine dims as its compressor starts');h.stage({machine:1});
 const lantern=h.lanterns[0].userData.lantern;h.stage({glow:1});const full=lantern.paper.color.r;h.stage({glow:.2});assert.ok(lantern.paper.color.r<full*.6,'the lanterns dim');
 assert.equal(h.group.getObjectByName('Kōji’s way: the reel').visible,true);assert.equal(h.group.getObjectByName('The fix: the lanterns’ own socket').visible,false);
 h.stage({cable:'fixed'});assert.equal(h.group.getObjectByName('Cord reel').visible,false,'the reel is gone after the fix');
 assert.equal(h.group.getObjectByName('Lantern socket with RCD').visible,true,'the lanterns’ own socket with an RCD');
 for(const [key,name] of [['mist','Mist from the can chute'],['candles','Séance candles'],['salt','Morijio (salt cones)'],['bucket','Fujita’s bucket'],['can','A can in the take-out pocket'],['pumpkins','Jack-o’-lanterns round the machine'],['peek','Plush ghost peeking']]){
  h.stage({[key]:key==='mist'?.8:true});assert.equal(h.group.getObjectByName(name).visible,true,name);h.stage({[key]:key==='mist'?0:false});assert.equal(h.group.getObjectByName(name).visible,false,name);}
 h.stage({riceBall:'plate',dog:{pose:'eat',at:[HALLOWEEN.machine.front+.6,HALLOWEEN.machine.z+.42],yaw:-Math.PI/2}});
 const dog=h.group.getObjectByName('Kuro (dog)');assert.ok(dog,'Kuro');assert.ok(Math.abs(box(dog).min.y)<.01,'on the ground');
 h.stage({dog:false});assert.equal(h.group.getObjectByName('Kuro (dog)'),undefined);
 // the clock leaves a staged moment alone
 h.update(1440*10000+1250);assert.equal(h.group.visible,true);
});

test('the season: up from 24 October, the lanterns lit from six in the evening',()=>{
 const {h}=town(),day=(m,d,hh)=>{const t=new Date(1997,m-1,d,hh,0);return (t.getTime()-t.getTimezoneOffset()*60000)/60000;};
 h.update(day(9,20,20));assert.equal(h.group.visible,false,'not in September');
 h.update(day(10,31,15));assert.equal(h.group.visible,true);assert.equal(h.state.glow,0,'unlit in the afternoon');
 h.update(day(10,31,20));assert.ok(h.state.glow>.6,'lit in the evening');
});

test('the figures: a cute obake, Kuro the dog and a pumpkin lantern, each whole',()=>{
 const o=buildObake({h:.4,can:true}),b=box(o);assert.ok(Math.abs(b.max.y-.4)<.05&&b.min.y>-.04,'the plush ghost stands '+b.max.y.toFixed(2)+' tall');assert.ok(o.getObjectByName('J-Coffee can'),'holding its J-Coffee can');
 for(const pose of ['sit','eat','stand']){const d=box(buildDog({pose}));assert.ok(d.min.y>-.01&&d.max.y<.62,'Kuro '+pose);}
 const l=buildPumpkinLantern(),lb=box(l);assert.ok(lb.max.y<=.02&&lb.min.y>-.45,'a lantern hangs below its hook');
});

test('the costumes fit the body that wears them: the pumpkin suit, the ghost sheet (over Mori’s cap) and the witch hat',async()=>{
 const {buildAvatar}=await import('../src/avatars/build.js'),{recipeFor}=await import('../src/avatars/cast.js'),{normalizeRecipe}=await import('../src/avatars/recipe.js'),{storyProps,STORY_PROPS}=await import('../src/avatars/story-props.js');
 for(const kind of ['pumpkinSuit','ghostSheet','witchHat'])assert.ok(STORY_PROPS[kind]?.why.length>40,kind+' has its reason');
 for(const [who,recipe] of [['Tetsuo',recipeFor('Tetsuo')],['Officer Mori',recipeFor('Officer Mori')],['a child',normalizeRecipe({name:'Walk child',age:'child'})]]){
  const a=buildAvatar(recipe,{shadows:false}),m=a.measure;a.root.updateMatrixWorld(true);
  for(const kind of ['pumpkinSuit','ghostSheet','witchHat']){
   const o=storyProps(a).give(kind);a.root.updateMatrixWorld(true);
   const parts=o.userData.parts;assert.ok(parts.length>=1,who+' '+kind);
   const b=new THREE.Box3();for(const [,p] of parts)b.expandByObject(p);
   if(kind==='pumpkinSuit'){assert.ok(b.min.y>m.hipY*.7&&b.max.y<m.headCentre+m.Rh*m.headSY+.2,who+': the pumpkin round the torso');assert.ok(b.max.x-b.min.x>m.shoulderX*2&&b.max.x-b.min.x<(m.shoulderX+m.armR)*2.1,'as wide as the shoulders, so the arms hang outside it');
    const face=parts[0][1].children.find(c=>c.isGroup),fp=face.getWorldPosition(new THREE.Vector3());assert.ok(fp.z<0,'its face on the front (the body faces -z)');}
   if(kind==='ghostSheet'){const sheet=parts[0][1];const sb=new THREE.Box3().setFromObject(sheet);assert.ok(sb.max.x>m.shoulderX+m.armR,who+': over the shoulders and arms');assert.ok(sb.min.y<m.hipY*.75,'down to the knees');
    const hood=parts[1][1],hb=new THREE.Box3().setFromObject(hood),crown=new THREE.Box3().setFromObject(a.face.head);assert.ok(hb.max.y>crown.max.y,'the hood over the crown');
    // its opening at the face: a ray from in front of the face (the body faces -z) meets the face before any sheet
    const front=new THREE.Vector3(0,(crown.min.y+crown.max.y)/2,-2),ray=new THREE.Raycaster(front,new THREE.Vector3(0,0,1));
    const hit=ray.intersectObject(hood,true)[0],face=ray.intersectObject(a.face.head,true)[0];assert.ok(face&&(!hit||hit.distance>face.distance),who+': the face shows through the hood’s opening');}
   if(kind==='witchHat')assert.ok(b.min.y>m.headCentre-.05&&b.max.y>m.headCentre+m.Rh,who+': the hat on the crown');
   storyProps(a).take(kind);for(const [,p] of parts)assert.equal(p.parent,null,'taken off whole');
  }
  a.dispose();
 }
});

test('the lanterns read as lit at night: bright paper brightest at the middle, a lit face, a halo, and warm pools that dim together',()=>{
 const {h}=town();
 const L=h.lanterns[0].userData.lantern,pools=h.group.getObjectByName('Lantern light').children;
 assert.ok(pools.length>0&&pools.length<=4,'a few shared lights, not one a lantern: '+pools.length);
 const look=g=>{h.stage({glow:g});const c=L.paper.color,f=L.face.color;return {paper:c.r,face:f.r+f.g+f.b,shaded:L.paper.vertexColors,halo:L.halo.visible?L.halo.material.opacity:0,pool:pools[0].visible?pools[0].intensity:0};};
 const off=look(0),groan=look(.12),run=look(.7),fixed=look(1);
 assert.equal(off.halo,0,'unlit: no halo');assert.equal(off.pool,0,'unlit: no pool of light');
 assert.ok(!off.shaded&&run.shaded,'unlit: plain orange paper; lit: shaded by its bulb');
 assert.ok(run.halo>.4&&run.pool>2,'lit at 90 V: a halo and a warm pool ('+run.halo.toFixed(2)+', '+run.pool.toFixed(1)+')');
 assert.ok(run.face>2.2,'the carved face glows pale yellow from inside');
 assert.ok(groan.paper<run.paper*.7&&groan.halo<run.halo*.4&&groan.pool<run.pool*.2,'the groan dims the paper, the halo and the pools together');
 assert.ok(fixed.paper>=run.paper&&fixed.halo>run.halo&&fixed.pool>run.pool,'after the fix: steady and brightest');
 h.stage({glow:.7});
 const lobe=h.lanterns[0].children.find(x=>x.isMesh&&x.geometry.attributes.color),col=lobe.geometry.attributes.color,pos=lobe.geometry.attributes.position;
 let mid=0,top=0;for(let i=0;i<pos.count;i++){const g=col.getY(i);if(Math.abs(pos.getY(i))<.01)mid=Math.max(mid,g);if(pos.getY(i)>lobe.geometry.parameters.radius*.95)top=Math.max(top,g);}
 assert.ok(mid>top*1.4,'brightest at the middle, where the bulb is');
 assert.ok(L.paper.toneMapped===false&&L.halo.material.blending===THREE.AdditiveBlending,'the glow is not toned down, and the halo adds light');
 h.stage({show:false});assert.ok(pools.every(p=>!p.visible),'put away: no light left on');
});

test('J-Coffee: a black 350 ml can sold at ¥120, the free can in the pocket and the bucket’s, clear of the machine',()=>{
 const p=VENDING_PRODUCTS.find(x=>x.id==='j-coffee');
 assert.ok(p&&p.price===120&&p.size===350&&p.who&&p.why,'a real product: who buys it, why, ¥120');
 const c=buildJCoffeeCan(),b=box(c),s=b.getSize(new THREE.Vector3());
 assert.ok(Math.abs(s.y-.122)<.005&&Math.abs(s.x-.066)<.003,'a cola can’s shape: 66 × 122 mm, not the short coffee can');
 const {h,machine}=town();h.stage({can:true,bucket:true});h.group.updateMatrixWorld(true);
 const free=new THREE.Box3().setFromObject(h.group.getObjectByName('A can in the take-out pocket'),true),floor=machine.userData.takeOut;
 assert.ok(free.min.y>.2&&free.min.y<.22,'lying on the pocket’s floor, not in it nor floating: '+free.min.y.toFixed(3));
 assert.ok(free.max.x<HALLOWEEN.machine.front+.085,'behind the flap');assert.ok(floor,'the machine says where its pocket is');
 const cans=h.group.getObjectByName('Free cans in the bucket');assert.equal(cans.children.length,9);assert.ok(box(cans).max.y>.25,'the cans show over the bucket’s rim (.22)');
 for(const k of cans.children){const kb=box(k);assert.ok(kb.min.y>-.001,'on the bucket floor, not through it');}
 h.stage({bucket:'empty'});assert.ok(!cans.visible,'the empty bucket of the last night');
});

test('Fujita’s dream: built only when the story asks, closed in by its own sky, and it bursts',()=>{
 const {world,h}=town();
 const find=()=>world.group.getObjectByName('Fujita’s dream');
 h.stage({});assert.ok(!find(),'not built for the street');
 h.stage({dream:'dream'});const d=find();assert.ok(d&&d.visible,'the dream');
 const sky=d.getObjectByName('Dream sky'),cans=d.getObjectByName('A million J-Coffee cans');
 assert.ok(sky.geometry.parameters.radius>=20&&cans.count>=2000,'its own sky round a mountain of cans');
 assert.ok(d.position.y>100,'high over the town, out of sight of the street');
 const m=new THREE.Matrix4(),p=new THREE.Vector3(),top=()=>{let y=0;for(let i=0;i<cans.count;i++){cans.getMatrixAt(i,m);p.setFromMatrixPosition(m);y=Math.max(y,p.y);}return y;};
 const whole=top();h.stage({dream:'pop'});assert.ok(top()<whole,'bursting: the tower comes down');
 assert.ok(Math.abs(d.getObjectByName('Dream house (a J-Coffee can)').rotation.z)>.2,'the house tips');
 h.stage({dream:false});assert.ok(!d.visible,'gone when the story moves on');
});
