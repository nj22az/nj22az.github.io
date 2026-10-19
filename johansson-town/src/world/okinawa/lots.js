import {rng} from './kit.js';
import {blockWall,coralWall} from './houses.js';
import {poster} from './signs.js';

/**
 * What stands where houses stood (docs/MINATO-HOMES-PLAN.md: "where empty houses were removed, the street plan
 * closes up around them: no vacant lawn or paving lots left where buildings stood").
 *
 * On an Okinawan street nobody leaves ground idle. Each cleared lot is given to somebody who already lives here and
 * has a use for it, and the reason is written beside it, so a story can send someone there and a test can check the
 * lot is what it says. `rect` is the lot; `walls` names what stands on each side ('block', 'coral' or null where it
 * is open); `gates` are the openings, in world coordinates along that side. The old house's centre is kept clear of
 * anything solid (tests/housing-consolidation.test.mjs: no house stands there).
 *
 * The Yonamine shop-house on Main Street is the lot here. The lots that wait for their dressing are CLEARED_LOTS below.
 */
export const lotRect=(minX,maxX,minZ,maxZ)=>Object.freeze({minX,maxX,minZ,maxZ});
const rect=lotRect;
export const STREET_LOTS=Object.freeze([
 Object.freeze({
  id:'higa-crate-yard',formerly:'yonamine',use:'crate-yard',name:'Higa Liquor’s crate yard',
  rect:rect(-15.9,-8.25,9.35,15.25),walls:Object.freeze({north:'block',south:'block',east:'block',west:'block'}),gates:Object.freeze({east:Object.freeze([[10.8,13.2]])}),
  owner:'Grandmother Higa (Higa Liquor, across Main Street)',users:'Higa Liquor',
  why:'Higa Liquor supplies the whole island’s drink and has no yard of its own behind the shop. Empties come back in crates and wait here, stacked, for the brewery’s boat.',
  hours:'Crates sorted at 07:30; the hand truck goes back and forth across Main Street all morning.',
  stories:['children counting bottles','the clink at half past seven','a crate tower after a festival'],
 }),
]);
export const streetLot=id=>STREET_LOTS.find(l=>l.id===id);

/**
 * The lots that are clear and wait for their dressing: where a house stood and nothing stands now. Phase 4 of
 * docs/CAST-CONSOLIDATION.md cleared the retired residents' houses (brief §8, addendum 3 and 5), and the housing project
 * of 18 October 2026 cleared five Kitahama plots before it. The owner deferred their dressing (addendum 2: gardens,
 * 月極 parking, bike sheds and hedges follow on the final layout, after the police station and the docks), so each lot is
 * recorded here with what its ground is now and why it is clear, for that pass and for the tests
 * (tests/housing-consolidation.test.mjs: nothing solid stands on one, no door, no circuit). Nothing is built on them
 * here: no fence, no placeholder, no speculative attraction. `ground` is what the lot is today: Kitahama's level grass
 * (neighbourhood-ground.js), the quarter's coral sand (quarters.js buildNishiGround), the Front-Row yard's lawn
 * (west-yard.js), the lawn east of Main Street, or Kitano-jima's own ground and plantings (tropical-island.js).
 */
const cleared=(id,formerly,district,r,ground,cleared,why)=>Object.freeze({id,formerly,district,rect:r,ground,cleared,why,dressing:'deferred (docs/CAST-CONSOLIDATION.md addendum 2)'});
const PHASE_4='2026-10-19, phase 4 of docs/CAST-CONSOLIDATION.md',HOUSING='2026-10-18, the housing project (docs/MINATO-HOMES-IMPLEMENTATION.md)';
export const CLEARED_LOTS=Object.freeze([
 cleared('kitahama-4-lot','kitahama-4','Kitahama',rect(20,28,62,71),'grass',PHASE_4,'the postman’s house: the post is Ms Ganaha’s counter at the terminal, and the round went with him'),
 cleared('kitahama-5-lot','kitahama-5','Kitahama',rect(33,41,62,71),'grass',PHASE_4,'Grandmother Chinen’s house: she retired with only her family history kept, as Tetsuo’s mother'),
 cleared('kitahama-6-lot','kitahama-6','Kitahama',rect(-32,-24,48,57),'grass',PHASE_4,'the former master’s house: Fuji is the master and keeps Shiosai, not this house too'),
 cleared('kitahama-north-block','kitahama-4 and kitahama-5 with the ends of the middle and field lanes','Kitahama',rect(16,42,62,72),'grass',PHASE_4,'with 4 and 5 gone nothing stood on either side of the two side lanes north of the cross lane, so they end at it (kitahama-layout.js) and the ground from 3 Kitahama’s east wall to the approach is one block behind the cross lane'),
 cleared('kitahama-7-lot','kitahama-7','Kitahama',rect(-19,-11,48,57),'grass',HOUSING,'an empty house the housing project removed'),
 cleared('kitahama-9-lot','kitahama-9','Kitahama',rect(7,15,48,57),'grass',HOUSING,'an empty house the housing project removed'),
 cleared('kitahama-10-lot','kitahama-10','Kitahama',rect(-32,-24,62,71),'grass',HOUSING,'an empty house the housing project removed'),
 cleared('kitahama-11-lot','kitahama-11','Kitahama',rect(-19,-11,62,71),'grass',HOUSING,'an empty house the housing project removed'),
 cleared('kitahama-12-lot','kitahama-12','Kitahama',rect(-6,2,62,71),'grass',HOUSING,'an empty house the housing project removed'),
 cleared('kinjo-lot','kinjo','Nishi-machi',rect(-34.7,-27,-11.2,-.2),'coral sand',PHASE_4,'Mrs Kinjō’s house: the flowers are Sakura’s; the lane at z −13 stays as the Higa house’s side'),
 cleared('oshiro-lot','oshiro','Nishi-machi',rect(-34.7,-27,3.3,14.2),'coral sand',PHASE_4,'Mr Ōshiro’s house: Kōji fishes on his own and Chin mends the boats; the lanes at z 1.5 (to 2 Front-Row Yard) and 16 (the utaki) stay'),
 cleared('front-row-yard-1','resident-home-aya','Front-Row Yard',rect(-24.15,-18.45,-2.85,.45),'lawn',PHASE_4,'1 Front-Row Yard: Nhung had moved home to 3 Kitahama and Reiko retired; the path from the lane gap to Tetsuo’s door runs past it'),
 cleared('post-office-lot','shimabukuro','Main Street, the East Row',rect(5.7,13.4,-6.6,-1.6),'lawn',PHASE_4,'the post-office shop-house: its counter is the terminal’s and its tenant retired; the park’s lawn meets Main Street between Nakamura’s and Kitano Road'),
 cleared('rainflower-lot','rainflower-florist','the lawn east of Main Street',rect(19,23,15.4,18.6),'lawn',PHASE_4,'the Rainflower pavilion: the flowers are sold at Sakura’s door (addendum 3)'),
 cleared('kitano-3-lot','kitano-3','Kitano hamlet',rect(-33,-23,38,48),'the island’s ground and plantings (island frame)',PHASE_4,'the Chinen house on Kitano-jima (addendum 5): Grandmother Chinen retired; the island takes the plot back'),
]);
export const clearedLot=id=>CLEARED_LOTS.find(l=>l.id===id||l.formerly===id);
/** The Kitahama lots the deferred dressing pass will plan (addendum 2). */
export const KITAHAMA_CLEARED=Object.freeze(CLEARED_LOTS.filter(l=>l.district==='Kitahama'));

export const LOT_COLOURS=Object.freeze({earth:0x9a5f40,earthDry:0xb07a52,coral:0xd9cdb0,concrete:0xb9b4a8,steel:0x9aa0a4,galv:0xa9b1b3,
 timber:0x8a6a45,timberDark:0x5d4431,leaf:0x4f7d3e,leafDark:0x3c6a35,net:0x2f5a4a,roof:0x8c9ea3});
/** A level patch of ground: crushed coral, earth or concrete, 3 cm thick, its top 45 mm up (25 mm over the grass). */
export function lotGround(kit,r,hex,finish='matte'){kit.block(r.minX,r.maxX,.015,.045,r.minZ,r.maxZ,hex,finish);}
/** The walls a lot names, with their gates. Open sides are left to the gutter. */
export function lotWalls(kit,solid,lot,{height=.9}={}){
 const {minX,maxX,minZ,maxZ}=lot.rect,g=side=>lot.gates?.[side]||[];
 const make=(type,x0,z0,x1,z1,gaps,seed)=>type==='coral'?coralWall(kit,x0,z0,x1,z1,{height,gaps,seed}):blockWall(kit,x0,z0,x1,z1,{height,gaps});
 const w=lot.walls;
 if(w.north)solid(make(w.north,minX,maxZ,maxX,maxZ,g('north'),301));
 if(w.south)solid(make(w.south,minX,minZ,maxX,minZ,g('south'),302));
 if(w.west)solid(make(w.west,minX,minZ,minX,maxZ,g('west'),303));
 if(w.east)solid(make(w.east,maxX,minZ,maxX,maxZ,g('east'),304));
}
export const lotRead=(anchor,onAction,x,z,label,lot,extra='')=>anchor(x,1.1,z,label,()=>onAction?.('read',lot.name,[lot.why,lot.hours,extra].filter(Boolean).join('\n\n')));

/** Builds the lots into the quarter's kit (one draw call per finish and cell). */
export function buildStreetLots(kit,solid,{anchor,onAction}){
 crateYard(kit,solid,streetLot('higa-crate-yard'),{anchor,onAction});
}

/* Higa Liquor's yard: crates of empties on pallets under a roof, the hand truck, the painted name on the wall. */
function crateYard(kit,solid,lot,{anchor,onAction}){
 const R=lot.rect;
 lotGround(kit,{...R,maxX:-8.1},0xb6b2a5);lotWalls(kit,solid,lot);
 const rx0=R.minX+.3,rx1=R.minX+5,rz0=R.maxZ-2.1,rz1=R.maxZ-.25;
 for(const x of [rx0+.1,(rx0+rx1)/2,rx1-.1]){kit.box(.08,2.2,.08,x,1.1,rz0+.05,LOT_COLOURS.steel);solid(kit.rect(x-.07,x+.07,rz0,rz0+.12,2.2,'crate-roof-post'));}
 kit.box(rx1-rx0+.3,.04,rz1-rz0+.4,(rx0+rx1)/2,2.28,(rz0+rz1)/2,LOT_COLOURS.roof,{rx:.1,finish:'metal'});
 const r=rng(371),crate=[0xd8b13c,0xc8432f,0x7a4a2a,0xd8b13c];
 for(let i=0;i<6;i++){
  const x=rx0+.45+i*.75,n=2+Math.floor(r.next()*4);
  kit.box(.7,.1,1.3,x,.1,(rz0+rz1)/2,LOT_COLOURS.timber);
  for(let k=0;k<n;k++)for(const dz of [-.3,.3]){const c=r.pick(crate),y=.15+k*.3;kit.box(.44,.28,.58,x,y+.14,(rz0+rz1)/2+dz,c);for(let b=0;b<3;b++)kit.cyl(.035,.035,.1,x-.13+b*.13,y+.3,(rz0+rz1)/2+dz,0x6a4a24,{segments:5});}
 }
 solid(kit.rect(rx0,rx1,rz0+.15,rz1,1.6,'crate-stacks'));
 // The hand truck by the gate, and a crate set out for children to sit on.
 const hx=R.maxX-1.1,hz=lot.gates.east[0][1]+.5;
 kit.rod([hx,.05,hz],[hx-.15,1.2,hz],.02,0xc8432f);kit.rod([hx+.4,.05,hz],[hx+.25,1.2,hz],.02,0xc8432f);kit.box(.5,.03,.3,hx+.2,.05,hz+.15,0x9aa0a4,{finish:'metal'});
 for(const dx of [0,.4])kit.cyl(.1,.1,.06,hx+dx,.1,hz-.08,0x222326,{segments:10,rz:Math.PI/2});
 kit.box(.44,.28,.58,hx+.2,.33,hz+.15,0xd8b13c);
 solid(kit.rect(hx-.2,hx+.6,hz-.25,hz+.5,1.2,'hand-truck'));
 kit.sign(poster({title:'Higa empty-bottle yard',lines:['HIGA LIQUOR','EMPTIES','STAFF ONLY'],bg:'#f2ede0',band:'#8a3b2e'}),.6,.8,R.maxX+.14,1.25,lot.gates.east[0][0]-.9,{ry:Math.PI/2,name:'crate yard sign'});
 const at=kit.point(R.maxX+.9,0,(lot.gates.east[0][0]+lot.gates.east[0][1])/2);lotRead(anchor,onAction,at.x,at.z,'Look into Higa Liquor’s crate yard',lot);
}

