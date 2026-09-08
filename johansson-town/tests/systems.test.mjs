import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {createTown} from '../src/world/town.js';
import {createActivities} from '../activities.js';
import {createCharacters} from '../src/people/characters.js';
import {createCastAI,DIALOGUE} from '../src/people/schedules.js';
import {ROUTES,routeAt,groundHeight} from '../src/world/layout.js';
import {createNavigation} from '../src/people/navmesh.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {createContentItems} from '../content-items.js';
import {createHands} from '../src/interact/hands.js';
import {readSave} from '../src/save.js';
import {installDOM} from './fixtures.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sites=()=>['office','frontrow','form3d','stepwise','journal','electronics','market','career'].map((id,i)=>({id,title:id,jp:id,side:i%2?1:-1,z:[38,30,18,8,-4,-16,-28,-39][i],color:0x777766,accent:'#49675d',line:id}));
const build=()=>{installDOM();const anchors=[],all=sites(),world=createTown({scene:new THREE.Scene(),sites:all,mobile:true,shadows:false,register:(o,label,fn)=>anchors.push({o,label,fn}),onAction(){},enter(){},getPlayerPosition:()=>new THREE.Vector3()});createContentItems({group:world.group,colliders:world.colliders,register:(o,label,fn)=>anchors.push({o,label,fn}),onInspect(){},onRead(){}});return {world,anchors,all};};

test('ground, pier edges and A/D coordinate convention',()=>{
 assert.equal(townBoundsBlocked(0,-76,.28),false);assert.equal(townBoundsBlocked(4.1,-76,.28),true);assert.equal(townBoundsBlocked(0,-79.2,.28),true);
 for(const route of ROUTES)for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];for(let t=0;t<=1;t+=.02)assert.ok(routeAt(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.28),route.id+' lacks ground');}
 for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const f={x:-Math.sin(yaw),z:-Math.cos(yaw)},right={x:Math.cos(yaw),z:-Math.sin(yaw)};assert.ok(Math.abs(f.x*right.x+f.z*right.z)<1e-10);assert.ok(f.x*right.z-f.z*right.x>.99);}
 assert.equal(groundHeight(0,0),0);assert.ok(groundHeight(72,116)>5.9);
});
test('world construction, original route and new door reachability',()=>{
 const {world,all}=build();assert.equal(world.people.length,21);assert.ok(world.quality.streetInteractions>=8);
 const blocked=(x,z,r=.28)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));
 for(let z=57.5;z>=-76;z-=.2)assert.equal(blocked(0,z),false,'spine blocked at '+z);
 for(const s of all){const pos=s.door||[s.side*4,0,s.z+2.5];assert.equal(blocked(pos[0],pos[2],.28),false,'door blocked: '+s.id);}
 world.update(.016,1,1,1002);world.update(.016,2,0,1230);
 const book=all.find(s=>s.id==='frontrow');assert.equal(world.isOpen(book,1002),true);assert.equal(world.isOpen(book,1230),false);
 world.group.updateMatrixWorld(true);world.group.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name+' has invalid transforms'));
});
test('navigation finds a collision-free route and cannot cut a wall corner',()=>{
 const blocked=(x,z,r=0)=>x<-1||x>8||z<-1||z>8||circleHitsRect(x,z,r,{x:3,z:3,w:2,d:5});
 const nav=createNavigation(blocked,{bounds:{minX:-1,maxX:8,minZ:-1,maxZ:8}});const path=nav.path({x:0,z:0},{x:7,z:5});assert.ok(path.length>0);
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let t=0;t<1;t+=.1)assert.equal(blocked(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.28),false);}
 const safe=sweepFraction({x:0,y:1,z:0},{x:5,y:1,z:0},x=>x>=2,.1);assert.ok(safe>.35&&safe<.4);
});
test('v4 save import preserves money, inventory and quest; transactions and Tama remain one-time',()=>{
 const initial=JSON.stringify({yen:888,quest:2,inventory:['Sea bream'],visited:['office'],kenjiEscort:'walking'}),dom=installDOM({'johansson-town-1988-v4':initial});let minutes=1002;
 const acts=createActivities({say(){},onWeather(){},onTime:value=>{if(value?.restore)minutes=value.restore;},onCamera(){},getMinutes:()=>minutes});
 assert.equal(acts.state.yen,888);assert.equal(dom.storage.get('johansson-town-1988-v4'),initial);assert.equal(acts.state.kenjiEscort,'walking');
 acts.action('resident','Aiko');dom.button('About Tama');assert.equal(acts.state.yen,1388);assert.equal(acts.state.quest,3);acts.action('resident','Aiko');dom.button('About Tama');assert.equal(acts.state.yen,1388);
 acts.action('vending');dom.button('Dockside Coffee · ¥120');assert.equal(acts.state.yen,1268);assert.ok(acts.state.inventory.includes('Canned coffee'));
 const restored=JSON.parse(dom.storage.get('johansson-town-1988-v5'));assert.equal(restored.quest,3);assert.equal(restored.yen,1268);assert.ok(restored.visited.includes('office'));
 acts.state.yen=0;acts.action('vending');dom.button('Harbour Tea · Green tea · ¥120');assert.equal(acts.state.yen,0);assert.ok(!acts.state.inventory.includes('Green tea'));
});
test('every resident has several authored subjects and schedules stream at most eight',()=>{
 const {world}=build(),player=new THREE.Group();player.position.set(0,0,30);const state={inventory:[],quest:0};const ai=createCastAI({world,player,state:()=>state,paused:()=>false,collides:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c))});
 for(const p of world.people){assert.ok(DIALOGUE[p.g.userData.name].length>=3,p.g.userData.name);assert.ok(p.profile.age>0);}
 ai.update(1/60,1230,false);assert.ok(world.people.filter(p=>p.g.visible).length<=8);const aiko=world.people.find(p=>p.g.userData.name==='Aiko');assert.equal(aiko.g.visible,false);
});
test('runtime assets, PBR maps and sound files exist locally',async()=>{
 for(const name of ['asphalt','timber','plaster','roof'])for(const suffix of ['nor_gl','arm'])assert.ok((await readFile(resolve(root,'assets/materials/'+name+'-'+suffix+'.jpg'))).length>1000);
 for(const name of ['water','cicadas','crickets','engine','train','steps-asphalt','steps-wood','steps-stone','clunk','click','radio-0','radio-1','radio-2'])assert.equal((await readFile(resolve(root,'assets/audio/'+name+'.wav'))).toString('ascii',0,4),'RIFF');
 const walk=async dir=>{for(const e of await readdir(dir,{withFileTypes:true})){if(['node_modules','dist','tests','tools'].includes(e.name))continue;const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.js')){const s=(await readFile(p,'utf8')).replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');for(const m of s.matchAll(/(?:from\s+|import\()['"]([^'"]+)/g)){const ref=m[1];assert.ok(!ref.startsWith('http'),'remote import '+p);if(ref.startsWith('.'))await access(resolve(dirname(p),ref.split(/[?#]/)[0]));}}}};await walk(root);
});


test('held cans animate, consume once and honour the selected drink',()=>{
 installDOM();const inventory=['Canned coffee','Green tea'];const hands=createHands({scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),say(){},consume:name=>{const i=inventory.indexOf(name);if(i<0)return false;inventory.splice(i,1);return true;}});
 hands.offer('Canned coffee',new THREE.Vector3(0,6,0));assert.equal(hands.drink(),false,'Cannot drink while can drops');hands.update(.7);assert.equal(hands.drink(),true);assert.equal(hands.drink(),false,'No double consumption');hands.update(1);assert.equal(hands.held,null);assert.deepEqual(inventory,['Green tea']);
 hands.offer('Green tea',new THREE.Vector3(),true);hands.update(.7);hands.update(1);assert.deepEqual(inventory,[]);assert.equal(hands.held,null);
});
test('malformed current save falls back to valid legacy data without deleting it',()=>{
 const legacy=JSON.stringify({yen:456,inventory:['Mackerel'],quest:1});const dom=installDOM({'johansson-town-1988-v5':'{broken','johansson-town-1988-v3':legacy});assert.equal(readSave(localStorage).yen,456);assert.equal(dom.storage.get('johansson-town-1988-v3'),legacy);
});


test('resident paths clear detailed props; evening destinations and Kenji escort do not deadlock',()=>{
 const {world}=build(),player=new THREE.Group();player.position.set(-2,0,20);const state={inventory:[],quest:0,kenjiEscort:'walking'};
 const blocked=(x,z,r=.3)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c));const nav=createNavigation(blocked);
 for(const target of [[-34,39],[67,46],[72,117]]){
  const path=nav.path({x:0,z:46},{x:target[0],z:target[1]});assert.ok(path.length,'Destination is reachable: '+target);
  for(let i=1;i<path.length;i++)for(let t=0;t<=1;t+=.05)assert.equal(blocked(path[i-1][0]*(1-t)+path[i][0]*t,path[i-1][1]*(1-t)+path[i][1]*t),false,'Path edge is clear');
 }
 const ai=createCastAI({world,player,state:()=>state,paused:()=>false,collides:blocked});
 for(let i=0;i<1800&&state.kenjiEscort!=='done';i++)ai.update(1/60,1002,false);assert.equal(state.kenjiEscort,'done','Kenji reaches his workshop without stopping against Kenta');
 player.position.set(0,0,46);for(let i=0;i<120;i++)ai.update(1/60,1115,false);player.position.set(24,0,18);for(let i=0;i<120;i++)ai.update(1/60,1115,false);
 const visible=world.people.filter(p=>p.g.visible);for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)assert.ok(visible[i].g.position.distanceTo(visible[j].g.position)>.55,'Evening residents do not occupy one point');
});
