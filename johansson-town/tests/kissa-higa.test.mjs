import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {townCalendarAt} from '../src/town-clock.js';
import {rotaWeek} from '../src/people/ferry-crew.js';
import {KISSA,KISSA_MENU,KISSA_NOTICE,KISSA_SEATS,KISSA_KEEPER,KISSA_REGULARS,KISSA_SUPPLY,kissaOpen,kissaOnDuty,kissaShutterDown,
 kissaPassable,kissaVisitAt,kissaPeopleAt} from '../src/commerce/kissa-higa.js';
import {canonicalDay} from '../src/people/canonical-day.js';
import {castMember} from '../src/people/cast.js';
import {ACCOUNTS} from '../src/commerce/merchandising.js';
import {sakuraTillOpen} from '../src/commerce/sakura-rota.js';
import {feedPlace} from '../src/feed/places.js';
import {createKit,trs} from '../src/world/okinawa/kit.js';
import {shopHouse} from '../src/world/okinawa/houses.js';
import {HIGA_FRAME,KISSA_MODELS,KISSA_CHAIRS,higaPoint} from '../src/world/okinawa/higa-liquor-dressing.js';

/**
 * Kissa Higa, Grandmother Higa's morning coffee shop in the old Higa Liquor (the owner, 30 October 2026;
 * commerce/kissa-higa.js, briefs/higa-kissaten/progress.md): its hours and its shutter, her morning round it, the
 * regulars from their own days, the seats they sit on and the room they are drawn in, the menu, where its bread comes
 * from, its Meshy models and its place in the storyteller. Every number is the data's, so the world, the residents and
 * the stories read the same.
 */
installDOM();
const DAY=1440,minute=m=>((m%DAY)+DAY)%DAY;
/** The first town day from day 10000 with this weekday (and, if asked, this ferry rota week). */
function dayWith(weekday,rota=null){
 for(let d=10000;d<10100;d++){const m=d*DAY+720;if(townCalendarAt(m).weekday===weekday&&(rota===null||rotaWeek(m)===rota))return d*DAY;}
 throw new Error('no such day');
}
const at=(day,h,m=0)=>day+Math.round(h*60)+m;

test('open Monday to Friday, 07:00 to 09:30, and never at the weekend',()=>{
 for(let w=0;w<7;w++){const day=dayWith(w),weekday=w>=1&&w<=5;
  assert.equal(kissaOpen(at(day,7,0)),weekday,`7:00 on weekday ${w}`);assert.equal(kissaOpen(at(day,9,29)),weekday);
  assert.equal(kissaOpen(at(day,6,59)),false);assert.equal(kissaOpen(at(day,9,30)),false);assert.equal(kissaOpen(at(day,12,0)),false);
  if(!weekday)assert.equal(kissaShutterDown(at(day,8,0)),1,'the shutter stays down at the weekend');}
});

test('the shutter goes up while she is at the front, and comes down only once she is out on the pavement',()=>{
 const tue=dayWith(2);
 assert.equal(kissaShutterDown(at(tue,6,49)),1);assert.equal(kissaShutterDown(at(tue,6,54)),0);assert.equal(kissaShutterDown(at(tue,9,43)),0);
 assert.equal(kissaShutterDown(at(tue,9,48)),1);
 for(let m=KISSA.shutterUp;m<KISSA.shutterUp+KISSA.roll;m++)assert.ok(kissaShutterDown(at(tue,0,m+1))<=kissaShutterDown(at(tue,0,m)),'rolls up steadily');
 assert.ok(KISSA.arrive<KISSA.shutterUp,'she is at the front before it goes up');
 assert.ok(KISSA.out+3<=KISSA.shutterDown,'she is out three minutes before it starts down');
 assert.ok(kissaPassable(at(tue,0,KISSA.out))&&kissaPassable(at(tue,0,KISSA.shutterDown+1)),'and the way out is open while she goes');
 assert.ok(!kissaPassable(at(tue,0,KISSA.leave)),'shut by the time she goes up to the bath');
 assert.ok(kissaPassable(at(tue,0,KISSA.open))&&kissaPassable(at(tue,0,KISSA.close-1)),'open the whole time it serves');
});

test('Grandmother Higa’s weekday: the garden, the front, the counter, the front again, the bath; at the weekend no kissaten',()=>{
 const mon=dayWith(1),sun=dayWith(0),sat=dayWith(6);
 const plan=(day,h,m=0)=>canonicalDay('Grandmother Higa',at(day,h,m));
 assert.equal(plan(mon,6,30).place,'higa','the garden round after breakfast');assert.ok(plan(mon,6,30).stand,'on her garden stand round');
 const front=plan(mon,6,47);assert.equal(front.place,'kissa-higa');assert.deepEqual(front.target,[...KISSA_KEEPER.front],'at the shutter');
 const counter=plan(mon,7,30);assert.deepEqual(counter.target,[...KISSA_KEEPER.at],'behind the counter');assert.equal(counter.stand.pose,'CounterIdle');
 assert.deepEqual(plan(mon,9,42).target,[...KISSA_KEEPER.front],'out on the pavement while the shutter comes down');
 assert.equal(plan(mon,9,55).place,'onsen','up Kitano Road to the bath');assert.equal(plan(mon,10,30).place,'onsen');
 for(const day of [sat,sun])for(const h of [6.75,7.5,9])assert.notEqual(plan(day,h).place,'kissa-higa');
 assert.equal(castMember('Grandmother Higa').work,'onsen','the bath is still her work');
});

test('the regulars come from their own days: free and near at the hour, and on to what they were doing next',()=>{
 const mon=dayWith(1,1),wed=dayWith(3,0),tue=dayWith(2,0);
 // [name, a day they come, a minute they are there, where they are just before, where they are just after]
 for(const [name,day,there,beforeAt,before,afterAt,after] of [
  ['Miss Higa',mon,450,420,'home',480,'school'],
  ['Ms Ganaha',mon,460,435,'home',480,'coin-laundry'],
  ['Tetsuo',mon,480,450,'home',540,'workshop'],
  ['Officer Mori',mon,525,495,'home',545,'home'],
  ['Ms Uezu',mon,500,470,'home',545,'home'],
 ]){
  assert.equal(canonicalDay(name,day+there).place,'kissa-higa',name+' is at Kissa Higa');
  assert.equal(canonicalDay(name,day+beforeAt).place,before,name+' before');assert.equal(canonicalDay(name,day+afterAt).place,after,name+' after');
 }
 assert.notEqual(canonicalDay('Tetsuo',tue+480).place,'kissa-higa','Tetsuo comes Monday, Wednesday and Friday');
 assert.equal(canonicalDay('Tetsuo',wed+480).place,'kissa-higa');
 assert.notEqual(canonicalDay('Ms Uezu',wed+500).place,'kissa-higa','Ms Uezu only on her weeks off watch');
 for(const r of KISSA_REGULARS){assert.ok(castMember(r.name),r.name+' lives here');assert.ok(KISSA_SEATS[r.seat],r.name+' has a seat');assert.ok(KISSA_MENU.some(i=>i.id===r.order));assert.ok(r.why.length>40,r.name+' says why');}
});

test('nobody shares a seat, and everybody seated is there while it is open',()=>{
 for(const day of [dayWith(1,0),dayWith(1,1),dayWith(3,0),dayWith(5,1)])for(let m=0;m<DAY;m++){
  const taken=new Map();
  for(const r of KISSA_REGULARS){const v=kissaVisitAt(r.name,day+m);if(!v)continue;
   assert.ok(kissaOpen(day+m),r.name+' only while it is open');
   assert.ok(!taken.has(v.id),`${r.name} and ${taken.get(v.id)} on ${v.id} at ${m}`);taken.set(v.id,r.name);}
  if(kissaOpen(day+m))assert.ok(kissaPeopleAt(day+m).includes(KISSA.keeper),'she is behind the counter whenever it is open');
 }
});

test('the seats are where the room draws them, at the heights the room has',async()=>{
 const near=(a,b,what)=>assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-9,what+': '+a+' versus '+b);
 [-1.66,-1.12,-.58].forEach((x,i)=>near(KISSA_SEATS['stool-'+i].at,higaPoint(x,.44),'stool '+i));
 KISSA_CHAIRS.forEach(c=>near(KISSA_SEATS[c.id].at,higaPoint(c.at[0],c.at[2]),c.id));
 near(KISSA_KEEPER.at,higaPoint(-.55,-1.15),'the keeper');
 // The stools' tops, as drawn: a ray down onto the built room at each seat.
 const kit=createKit(),group=new THREE.Group(),frame={x:HIGA_FRAME.origin[0],z:HIGA_FRAME.origin[1],yaw:-Math.PI/2};
 kit.at(frame.x,frame.z,frame.yaw,()=>shopHouse(kit,{w:HIGA_FRAME.W*2,d:HIGA_FRAME.D*2,interior:'kissaten',seed:41,awning:false}),0);
 kit.finish(group);group.updateMatrixWorld(true);
 for(const k of ['stool-0','stool-1','stool-2']){const s=KISSA_SEATS[k];
  const hit=new THREE.Raycaster(new THREE.Vector3(s.at[0],1.5,s.at[1]),new THREE.Vector3(0,-1,0)).intersectObject(group,true)[0];
  assert.ok(hit,k+' is drawn');assert.ok(Math.abs(hit.point.y-(HIGA_FRAME.floor+s.height))<.005,`${k}: seat at ${hit.point.y.toFixed(3)}`);}
 // The chair is a Meshy model: its seat height measured on the model itself, fitted to its 0.86 m (kissa-higa-props.js).
 const glb=await readFile(new URL('../assets/models/kissaten/'+KISSA_MODELS['bentwood-chair'].file,import.meta.url));
 const jl=glb.readUInt32LE(12),g=JSON.parse(glb.toString('utf8',20,20+jl)),bin=20+jl+8;
 const acc=g.accessors[g.meshes[0].primitives[0].attributes.POSITION],view=g.bufferViews[acc.bufferView];
 const pos=new Float32Array(glb.buffer.slice(glb.byteOffset+bin+(view.byteOffset||0)+(acc.byteOffset||0),glb.byteOffset+bin+(view.byteOffset||0)+(acc.byteOffset||0)+acc.count*12));
 let y0=Infinity,y1=-Infinity,x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
 for(let i=0;i<pos.length;i+=3){y0=Math.min(y0,pos[i+1]);y1=Math.max(y1,pos[i+1]);x0=Math.min(x0,pos[i]);x1=Math.max(x1,pos[i]);z0=Math.min(z0,pos[i+2]);z1=Math.max(z1,pos[i+2]);}
 const s=KISSA_MODELS['bentwood-chair'].size.h/(y1-y0),cx=(x0+x1)/2,cz=(z0+z1)/2;let seat=0;
 for(let i=0;i<pos.length;i+=3){const x=(pos[i]-cx)*s,y=(pos[i+1]-y0)*s,z=(pos[i+2]-cz)*s;if(Math.abs(x)<.1&&z>-.05&&z<.1&&y<.7)seat=Math.max(seat,y);}
 assert.ok(Math.abs(seat-KISSA_SEATS['chair-0'].height)<.015,`the chair's seat is ${seat.toFixed(3)} m up`);
});

test('the menu: the coffee at one price, the morning set at the coffee’s; English for the player, Japanese on the paper',()=>{
 assert.deepEqual(KISSA_MENU.map(i=>i.id),['morning-set','blend','iced']);
 for(const i of KISSA_MENU){assert.equal(i.cost,300,i.name);assert.ok(!/[぀-ヿ一-龯]/.test(i.name+i.text+i.label),i.name+' reads English');assert.ok(/[ァ-ヿ]/.test(i.jp));}
 assert.ok(!/[぀-ヿ一-龯]/.test(KISSA_NOTICE.en));assert.match(KISSA_NOTICE.en,/7:00 to 9:30, Monday to Friday/);
});

test('its bread and milk are on Sakura’s account, taken at the till the afternoon before; Sakura is shut before nine',()=>{
 const a=ACCOUNTS.sakura['kissa-higa'];assert.ok(a,'Kissa Higa has an account');assert.equal(a.owner,KISSA.keeper);
 assert.deepEqual(a.lines,['bread','milk']);assert.ok(a.goods.some(g=>/beans/.test(g))&&a.goods.some(g=>/eggs/.test(g)));
 for(let w=1;w<=5;w++){const day=dayWith(w);
  assert.equal(sakuraTillOpen(at(day,6,45)),false,'nobody to buy from on the way down at a quarter to seven');
  // The afternoon before: Sunday for Monday (Sakura is shut on Saturdays, open on Sundays), the day before otherwise.
  assert.equal(sakuraTillOpen(at(day-DAY,17,0)),true,`the till is open at five the day before weekday ${w}`);}
 assert.ok(KISSA_SUPPLY.every(s=>s.what&&s.from&&s.why));
});

test('three Meshy models, light enough for a phone, each with its provenance; the storyteller has a morning place',async()=>{
 const provenance=JSON.parse(await readFile(new URL('../art/kissaten/meshy/provenance.json',import.meta.url),'utf8'));
 for(const [id,spec] of Object.entries(KISSA_MODELS)){
  const glb=await readFile(new URL('../assets/models/kissaten/'+spec.file,import.meta.url));
  const jl=glb.readUInt32LE(12),g=JSON.parse(glb.toString('utf8',20,20+jl));
  const tris=g.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+(p.indices!==undefined?g.accessors[p.indices].count:g.accessors[p.attributes.POSITION].count)/3,0);
  assert.ok(tris<=3200,`${id}: ${tris} triangles`);assert.ok(glb.length<256*1024,`${id}: ${glb.length} bytes`);
  assert.equal(provenance.models.find(m=>m.id===id)?.verdict,'use',id+' won its audit');
 }
 const place=feedPlace('kissa-higa');assert.ok(place,'a story place');
 for(const name of place.regulars)assert.ok(name===KISSA.keeper||KISSA_REGULARS.some(r=>r.name===name),name+' is there by the data');
 assert.ok(kissaOpen(place.shot.time),'its shot is in its hours (town day 0 is a Thursday)');
 assert.ok(!place.things.join(' ').match(/[぀-ヿ一-龯]/),'its things read English');
});
