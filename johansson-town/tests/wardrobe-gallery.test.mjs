import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {surface} from './body-contact.mjs';
import {PARTS,PATTERNS,DRESS_BOTTOMS,DICE,normalizeRecipe,randomRecipe} from '../src/avatars/recipe.js';
import {buildAvatar,measure} from '../src/avatars/build.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {ISLAND_OUTFITS} from '../src/avatars/outfits.js';
import {entryFor,ISLAND_HEX,SETS as CATALOGUE_SETS,searchWardrobe,wornSet} from '../src/avatars/wardrobe-catalogue.js';
import {skirtSpec} from '../src/avatars/skirt-shape.js';
import {hemSpec} from '../src/avatars/springs.js';
import {tieredSkirtGeometry,tieredProfile,tieredReachAt,TIERS,GATHERS} from '../src/avatars/tiered-skirt.js';
import {LOOK_FIELDS} from '../src/avatars/looks.js';
import {TABS} from '../src/avatars/creator.js';
import {ROSTER} from '../src/people/roster.js';
import {bicycleRiderFit} from '../src/world/bicycle-fit.js';
installDOM();

/**
 * The costume gallery's batch (the owner, 29 October 2026: "https://ai-costume-gallery.pages.dev/ Bring the suitable outfits
 * to Johansson world"; docs/research/costume-gallery.md): the tiered skirt, gingham, and thirteen sets studied from the
 * gallery's looks, checked by the wardrobe plan's standard check S.
 */
const SETS=ISLAND_OUTFITS.filter(s=>s.reference);
const NOTE=fs.readFileSync(new URL('../docs/research/costume-gallery.md',import.meta.url),'utf8');
const BODIES={
 Thuan:CAST_RECIPES.Thuan,
 child:normalizeRecipe({...CAST_RECIPES.Johansson,name:'Higa Kenta',age:'child',body:{...CAST_RECIPES.Johansson.body,build:.35}}),
};
const dressed=(body,outfit)=>normalizeRecipe({...body,outfit:{...body.outfit,...outfit}});
const baseLayer=body=>normalizeRecipe({...body,outfit:{...body.outfit,top:'tank',bottom:'underwear',footwear:'barefoot',hat:'none'},accessories:{...body.accessories,earrings:'none',neckwear:'none',pin:false}});
const marksOf=a=>a.body.material.userData.garment.marks;
function draws(a){let meshes=0,ink=0;const face=o=>{for(let p=o;p;p=p.parent)if(p.name==='Face objects')return true;return false;};
 // The rigged eyes (eyes3d.js) are a draw of their own (tests/eyes3d.test.mjs); the body and the head are the two counted here.
 a.root.traverse(o=>{if(o.isMesh&&o.visible&&!face(o)&&o!==a.eyes3d?.mesh)(o.userData.outline?ink++:meshes++);});return [meshes,ink];}

test('the tiered skirt and gingham are appended, offered by the maker, never dealt by the dice, and nobody is wearing them',()=>{
 assert.equal(PARTS.bottom.at(-1),'tieredskirt');assert.equal(PATTERNS.at(-1),'gingham');assert.equal(DRESS_BOTTOMS.at(-1),'tieredskirt');
 // The dice deal the prints and skirts they always dealt, so a look made from a seed is the same as before the batch.
 assert.deepEqual([...DICE.patterns],['flowers','stripes','dots']);assert.ok(!DICE.skirtsAndWide.includes('tieredskirt'));
 for(let i=0;i<200;i++){const r=randomRecipe('gallery-'+i);assert.notEqual(r.outfit.pattern,'gingham');assert.notEqual(r.outfit.bottom,'tieredskirt');}
 for(const [name,r] of Object.entries(CAST_RECIPES))assert.ok(r.outfit.pattern!=='gingham'&&r.outfit.bottom!=='tieredskirt',name+' is dressed as before');
 assert.ok(LOOK_FIELDS['outfit.pattern'].words.includes('gingham')&&LOOK_FIELDS['outfit.bottom'].words.includes('tieredskirt'),'Studio and the share code know them');
 const bottoms=TABS.find(t=>t.id==='bottom').controls.find(c=>c.at==='outfit.bottom');assert.equal(bottoms.list,PARTS.bottom,'the maker’s Bottoms tab offers the tiered skirt');
 for(const [given,kept] of [['tieredskirt','tieredskirt'],['tiered','underwear']])assert.equal(normalizeRecipe({outfit:{bottom:given}}).outfit.bottom,kept,given);
 assert.equal(normalizeRecipe({outfit:{pattern:'gingham'}}).outfit.pattern,'gingham');
 const e=entryFor('bottom','tieredskirt');assert.ok(e&&e.who&&e.why&&e.label==='Tiered skirt'&&e.category==='Skirts');
 for(const way of e.colourways)for(const v of Object.values(way.colours))assert.ok(ISLAND_HEX.has(v),`tiered skirt ${way.name} ${v}`);
});

test('the tiered skirt: a watertight shell with outward normals, a yoke and two tiers that step out, soft gathers, the long skirt’s length',()=>{
 for(const age of ['child','teen','adult','elder'])for(const silhouette of ['feminine','masculine'])for(const build of [0,1]){
  const what=`${age} ${silhouette} build ${build}`,m=measure(normalizeRecipe({age,body:{silhouette,build},outfit:{bottom:'tieredskirt'}}));
  const s=skirtSpec(m,'tieredskirt'),long=skirtSpec(m,'longskirt');
  assert.equal(s.length,long.length,what+': as long as the long skirt');assert.equal(s.waist,long.waist,what);
  assert.ok(Math.abs(s.hemR-s.step-long.hemR)<1e-9,what+': on the long skirt’s line, a step out');
  const g=tieredSkirtGeometry(m),P=g.attributes.position,N=g.attributes.normal,I=g.index,edges=new Map(),ids=new Map();
  const weld=i=>{const key=[P.getX(i),P.getY(i),P.getZ(i)].map(x=>Math.round(x*1e6)).join(',');if(!ids.has(key))ids.set(key,ids.size);return ids.get(key);};
  let volume=0,out=0,inside=0,reach=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<I.count;i+=3){const tri=[I.getX(i),I.getX(i+1),I.getX(i+2)];
   for(let j=0;j<3;j++){const x=weld(tri[j]),y=weld(tri[(j+1)%3]);if(x===y)continue;const key=x<y?x+':'+y:y+':'+x;edges.set(key,(edges.get(key)||0)+1);}
   a.fromBufferAttribute(P,tri[0]);b.fromBufferAttribute(P,tri[1]);c.fromBufferAttribute(P,tri[2]);volume+=a.dot(b.cross(c))/6;
  }
  assert.ok([...edges.values()].every(n=>n===2),what+': no open, overlapping or non-manifold seams');assert.ok(volume>0,what+': outward winding');
  for(let i=0;i<P.count;i++){const r=Math.hypot(P.getX(i),P.getZ(i)),d=P.getX(i)*N.getX(i)+P.getZ(i)*N.getZ(i);reach=Math.max(reach,r);
   assert.ok(r>m.hips*.45,what+': no disk over the leg opening');if(d>.05)out++;if(d<-.05)inside++;}
  assert.ok(out>100&&inside>100,what+': cloth and lining face apart');
  // The hem's springs and the bath's cloth fit clear the fullest of it: the last tier's hem and its folds.
  assert.ok(reach<=s.hemR*(1+GATHERS.depth)+1e-6&&reach>s.hemR*.99,`${what}: reaches ${reach.toFixed(4)} for a hem of ${s.hemR.toFixed(4)}`);
  assert.equal(hemSpec({outfit:{bottom:'tieredskirt'}},m).hemR,s.hemR);
  // Under each tier's hem the next tier hangs from a seam a hem's step further in, then fills out past it.
  const profile=tieredProfile(s);
  for(const seam of TIERS.slice(0,-1)){
   const hem=profile.filter(p=>Math.abs(p.f-seam)<1e-9).map(p=>p.r),[above,below]=[Math.max(...hem),Math.min(...hem)];
   assert.ok(Math.abs(above-below-s.step)<1e-9,`${what}: a step of ${((above-below)*1000).toFixed(1)} mm at ${seam}`);
  }
  // The yoke is smooth; the tiers are gathered.
  assert.ok(profile.filter(p=>p.f<=TIERS[0]).every(p=>p.gather===0)&&profile.some(p=>p.gather>.9));
  // What lies over it (an apron) is never inside it: the reach holds every row at and above it, folds included.
  let last=0;for(const p of profile){const r=tieredReachAt(s,p.f);assert.ok(r+1e-9>=p.r*(1+GATHERS.depth*p.gather),what);assert.ok(r+1e-9>=last,what+': the reach never narrows');last=r;}
  g.dispose();
 }
});

test('the tiered skirt is fitted cloth on every body: it follows the legs walking and seated, with its own length for the fit',()=>{
 for(const age of ['child','adult','elder']){
  const a=buildAvatar(normalizeRecipe({age,outfit:{top:'tee',bottom:'tieredskirt'}}),{faceSize:64,shadows:false}),F=a.body.geometry.attributes.towelFit;
  let cloth=0;for(let i=0;i<F.count;i++)if(F.getX(i)===2)cloth++;
  assert.ok(cloth>3000,age+': the skirt is fitted cloth ('+cloth+')');
  assert.equal(a.body.towelFit.refresh().uSkirt.value.y,skirtSpec(a.measure,'tieredskirt').length);
  const motion=createAvatarAnimator(a);
  for(const state of [{speed:1.4},{seated:true,seatHeight:.45},{seated:true,seatHeight:0}])for(let f=0;f<40;f++){motion.update(1/30,state);a.root.updateMatrixWorld(true);}
  assert.ok(surface(a,{stride:23}).every(({p})=>Number.isFinite(p.x+p.y+p.z)));
  a.dispose();
 }
});

test('gingham: on the cloth of a top and its sleeves, never on a tank top or overalls, and never above a sundress’s bodice',()=>{
 const built=(top,body=BODIES.Thuan)=>{const a=buildAvatar(dressed(body,{top,topColour:'#2f4f7f',accent:'#f4f1ea',pattern:'gingham'}),{shadows:false,faceSize:64}),marks=marksOf(a);a.dispose();return marks;};
 for(const top of ['blouse','shirt','tee','sundress','kariyushi','cardigan','polo'])assert.ok(built(top).includes('gingham'),top);
 for(const top of ['tank','overalls'])assert.ok(!built(top).includes('gingham'),top);
 // Paint only: a gingham top has as many vertices as a plain one.
 const plain=buildAvatar(dressed(BODIES.Thuan,{top:'blouse',pattern:'none'}),{shadows:false,faceSize:64}),checked=buildAvatar(dressed(BODIES.Thuan,{top:'blouse',pattern:'gingham'}),{shadows:false,faceSize:64});
 assert.equal(checked.body.geometry.attributes.position.count,plain.body.geometry.attributes.position.count);plain.dispose();checked.dispose();
 // The sundress's cloth ends at its bodice's edge (t 0.795): the checks are drawn from there down, the skin above left as it is.
 const src=fs.readFileSync(new URL('../src/avatars/garment.js',import.meta.url),'utf8');
 assert.match(src,/from=Y\(o\.top==='sundress'\?\.795:1\.0\)/);
});

test('each gallery set: a label, who and why, island colours, at most three cloth colours, its first colourway on, and the looks it was studied from',()=>{
 assert.equal(SETS.length,13);
 const children=ROSTER.filter(p=>Number.isFinite(p.age)&&p.age<18).flatMap(p=>[p.name,p.avatar,p.fullName].filter(Boolean));
 assert.ok(children.includes('Vy')&&children.includes('Mai')&&children.includes('Riku'));
 const residents=ROSTER.flatMap(p=>[p.name,p.avatar,p.fullName].filter(Boolean));
 for(const set of SETS){
  const id=set.id,entry=CATALOGUE_SETS.find(e=>e.id===id);assert.ok(entry,id+' is in the maker’s Outfits tab');
  assert.ok(set.label.length<=20&&set.who&&set.why,id);
  // The gallery's terms ask that it not be used to depict minors: its sets are for the island's grown-ups.
  for(const child of children)assert.ok(!new RegExp(`\\b${child}\\b`).test(set.who),`${id} is not written for ${child}`);
  assert.ok(residents.some(n=>set.who.includes(n))||/visitors|guests|crowd/.test(set.who),id+' names who wears it');
  // From the suitable categories only, each look in the research note's table.
  for(const ref of set.reference){assert.match(ref,/^(SPR|SUM|AUT|WIN|PTY)-\d{4}$/,id);assert.ok(NOTE.includes(ref+':'),`${id}: ${ref} is in docs/research/costume-gallery.md`);}
  assert.ok(NOTE.includes('`'+id+'`'),id+' has its row in the note');
  assert.ok(set.colourways.length>=2,id+' comes in the colours of its looks');
  for(const [k,v] of Object.entries(set.colourways[0].colours))assert.equal(set.outfit[k],v,`${id} is put on in its first colourway (${k})`);
  for(const way of set.colourways){
   const o={...set.outfit,...way.colours};
   for(const [k,v] of Object.entries(o))if(/^#/.test(v))assert.ok(ISLAND_HEX.has(v),`${id} ${way.name} ${k} ${v} is from the island palette`);
   const cloth=new Set([o.topColour,o.bottomColour,o.footwear==='barefoot'?null:o.shoes,!o.hat||o.hat==='none'?null:o.hatColour].filter(Boolean));
   assert.ok(cloth.size<=3,`${id} ${way.name}: ${[...cloth].join(' ')}`);
   assert.equal(wornSet(o)?.set.id,id,`${id} ${way.name} reads as itself in the maker`);
  }
 }
 const refs=SETS.flatMap(s=>s.reference);assert.equal(new Set(refs).size,refs.length,'each look studied once');
 const found=q=>searchWardrobe(q).flatMap(g=>g.entries.map(e=>e.slot+':'+e.id));
 assert.ok(found('Ganaha').includes('set:cherry-bench')&&found('Ganaha').includes('set:laundry-round'));
 assert.ok(found('Kai').includes('set:pier-watch')&&found('Ren').includes('set:late-bowl')&&found('Koji').includes('set:trading-round'));
 assert.ok(found('tiered').includes('bottom:tieredskirt')&&found('gingham').includes('set:haarii-day')&&found('cherry').includes('set:cherry-bench'));
 const by=id=>SETS.find(s=>s.id===id).outfit;
 assert.deepEqual([by('haarii-day').top,by('haarii-day').pattern,by('haarii-day').bottom,by('haarii-day').hat],['sundress','gingham','tieredskirt','straw']);
 assert.deepEqual([by('shirt-dress').top,by('shirt-dress').bottom],['shirt','longskirt']);assert.equal(by('shirt-dress').topColour,by('shirt-dress').bottomColour,'one cloth');
});

test('standard check S: two draws and two ink shells, the tiered skirt at most 6k vertices over the base layer and a set 10k, on Thuan and a child',()=>{
 const vertices=r=>{const a=buildAvatar(r,{shadows:false,faceSize:64}),n=a.body.geometry.attributes.position.count;assert.deepEqual(draws(a),[2,2],r.outfit.top+' '+r.outfit.bottom+' '+r.outfit.hat);a.dispose();return n;};
 for(const body of Object.values(BODIES)){
  const base=vertices(baseLayer(body));
  const skirt=vertices(dressed(baseLayer(body),{bottom:'tieredskirt'}))-base;assert.ok(skirt<=6000,`the tiered skirt adds ${skirt}`);
  for(const set of SETS){const extra=vertices(dressed(baseLayer(body),set.outfit))-base;assert.ok(extra<=10000,`${set.id} adds ${extra}`);}
 }
});

/** Every move: walk, run, chair, stool, floor, bow, wave, cheer, kachāshī and the bicycle; finite, above the floor, no popping. */
const MOVES=[['walk',{speed:1.2}],['run',{speed:3.4}],['chair',{seated:true,seatHeight:.45}],['stool',{seated:true,seatHeight:.3}],['floor',{seated:true,seatHeight:0}],
 ['Bow',{}],['Wave',{}],['Cheer',{}],['Kachashi',{}],['bicycle',{riding:true}]];
function rehearse(recipe,label){
 const a=buildAvatar(recipe,{shadows:false,faceSize:64}),motion=createAvatarAnimator(a),fit=bicycleRiderFit(a.measure),out={};
 for(const [move,state] of MOVES){
  motion.stop();if(/^[A-Z]/.test(move))motion.play(move);
  let before=null,jump=0,low=Infinity;
  for(let frame=0;frame<36;frame++){
   motion.update(1/30,{...state,bicycleFit:fit,ridePhase:frame/24});a.root.updateMatrixWorld(true);
   const points=surface(a,{stride:41}).map(x=>x.p);
   for(const p of points){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z),`${label}: ${move} at ${frame}`);low=Math.min(low,p.y);}
   if(before&&frame>2)for(let i=0;i<points.length;i++)jump=Math.max(jump,points[i].distanceTo(before[i]));
   before=points;
  }
  out[move]={jump,low};
 }
 a.dispose();return out;
}
test('standard check S: the tiered skirt and every gallery set walk, run, sit, bow, wave, raise both arms and ride a bicycle without popping',()=>{
 // Every set on Thuan; on a child the pieces that are new (the tiered skirt, gingham) and the sets that wear them.
 const NEW=new Set(SETS.filter(s=>s.outfit.bottom==='tieredskirt'||s.outfit.pattern==='gingham').map(s=>s.id));
 for(const who of ['Thuan','child']){
  const body=BODIES[who],bare=rehearse(baseLayer(body),who+' in the base layer');
  // Getting down to the floor, the long skirt itself jumps 5–6 cm further in a frame than the bare body does, on every
  // grown-up (measured 29 October 2026): as the body lands, towel-fit.js pushes cloth lying on a thigh's axis out of that
  // thigh on the other side from the frame before. The fit is shared, so a long skirt in tiers (and the gallery's sets in
  // long skirts) is held to the long skirt in that move until the fit is mended (briefs/HANDOFF-COSTUME-GALLERY-2026-10-29.md).
  const long=rehearse(dressed(body,{top:'tee',bottom:'longskirt'}),who+' in the long skirt');
  const looks=[['tiered skirt',dressed(body,{top:'tee',bottom:'tieredskirt'})],['gingham blouse',dressed(body,{top:'blouse',pattern:'gingham'})],
   ...SETS.filter(s=>who==='Thuan'||NEW.has(s.id)).map(s=>[s.id,dressed(body,s.outfit)])];
  for(const [what,recipe] of looks){
   const worn=rehearse(recipe,`${what} on ${who}`),longSkirt=['longskirt','tieredskirt'].includes(recipe.outfit.bottom);
   for(const [move] of MOVES){
    const allowed=Math.max(bare[move].jump+.03,longSkirt&&move==='floor'?long.floor.jump+.02:0);
    assert.ok(worn[move].low>-.01,`${what} on ${who}: ${move} goes below the floor`);
    assert.ok(worn[move].jump<=allowed,`${what} on ${who}: ${move} pops ${worn[move].jump.toFixed(3)} m (bare ${bare[move].jump.toFixed(3)}, long skirt ${long[move].jump.toFixed(3)})`);
   }
  }
 }
});
