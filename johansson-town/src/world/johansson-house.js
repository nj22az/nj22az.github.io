import {JOHANSSON_HOUSE_CAD as CAD} from './johansson-house-cad.js';

/**
 * Johansson's house on Kitano-jima, as built: the creator's coordinated drawings (Rev C, johansson-house-cad.js, generated
 * from docs/johansson-house/cad-rev-c), with what they leave open closed the way an architect would close it. Every such
 * departure is a finding below (HOUSE_FINDINGS), with what the drawing says, why it cannot stand, and what is built; the
 * design book (docs/johansson-house/README.md) lists them for the next revision. Nothing else moves: the walls, their
 * openings, the levels, the rooms' names and the stair's numbers are the drawings'.
 *
 * Frame, as drawn: x east and y north from the south-west outside corner, z up from the ground floor's datum; metres.
 * The front (the genkan's door) is the south face; johansson-house-build.js turns the house to face the lane.
 */
const r3=v=>Math.round(v*1000)/1000;

/** Finished floors and the soffits of the slabs over them, from the slabs drawn (manifest geometry). */
export const HOUSE_FLOORS=Object.freeze({
 B1:Object.freeze({floor:-2.7,soffit:-.18,name:'Basement'}),
 G0:Object.freeze({floor:.1,soffit:2.62,name:'Ground floor'}),
 L1:Object.freeze({floor:2.9,soffit:5.6,name:'Upper floor'}),
});
export const HOUSE_LEVELS=Object.freeze(['B1','G0','L1']);
/** The site and the roof, in the house's datum (findings F9–F11). */
export const HOUSE_SITE=Object.freeze({
 /** The yard round the house, 450 mm under the ground floor (a raised floor's usual height in Japan). */
 grade:-.35,
 /** The stone step at the front door, and the genkan's earth floor (doma), one step under the hall. */
 porch:-.2,doma:-.05,domaTo:1.4,
 /** The roof slab as drawn (manifest "roof eaves slab"), and the hipped red-tile roof on it. */
 roofSlab:Object.freeze({z0:5.6,z1:5.8,overhang:.4}),ridge:7.9,
});

// ---------------------------------------------------------------- the walls

/** A wall box from the drawings, with its kind and level. */
const box=(id,kind,level,min,max)=>({id,kind,level,min:min.map(r3),max:max.map(r3)});
const KIND={'A-EXT-WALL':'exterior','A-PARTITION':'partition'};
const drawn=CAD.boxes.filter(b=>KIND[b.layer]).map((b,i)=>{
 const kind=/ lintel$/.test(b.name)?'lintel':/ sill$/.test(b.name)?'sill':KIND[b.layer];
 return box(`${b.level}-${kind}-${i}`,kind,b.level,b.min,b.max);
});
/** A partition of the drawings: on a line of constant y ('x': it runs along x) or constant x ('y'). */
const runsAlong=b=>b.max[0]-b.min[0]>b.max[1]-b.min[1]?'x':'y';
const lineOf=b=>runsAlong(b)==='x'?r3((b.min[1]+b.max[1])/2):r3((b.min[0]+b.max[0])/2);
/** Replace a level's partitions on one line with these spans (from..to along it), keeping their section. */
function respan(walls,level,along,at,spans){
 const on=walls.filter(w=>w.level===level&&w.kind==='partition'&&runsAlong(w)===along&&Math.abs(lineOf(w)-at)<1e-6);
 if(!on.length)throw new Error(`no ${level} partition on ${along}=${at}`);
 const t=on[0],keep=walls.filter(w=>!on.includes(w));
 for(const [from,to] of spans)keep.push(box(`${level}-partition-${along}${at}-${from}`,'partition',level,along==='x'?[from,t.min[1],t.min[2]]:[t.min[0],from,t.min[2]],along==='x'?[to,t.max[1],t.max[2]]:[t.max[0],to,t.max[2]]));
 return keep;
}
/** The exterior wall of a level on one face, re-cut for an opening moved along it (finding F6). */
function recut(walls,level,face,from,to,newFrom,newTo){
 const isFace=w=>w.level===level&&(face==='east'?w.min[0]>=11.8-1e-6:false);
 const out=[];
 for(const w of walls){
  if(!isFace(w)){out.push(w);continue;}
  const [y0,y1]=[w.min[1],w.max[1]];
  if(w.kind==='exterior'){
   // The two runs either side of the old opening become the runs either side of the new one.
   if(Math.abs(y1-from)<1e-6)out.push(box(w.id,w.kind,level,w.min,[w.max[0],newFrom,w.max[2]]));
   else if(Math.abs(y0-to)<1e-6)out.push(box(w.id,w.kind,level,[w.min[0],newTo,w.min[2]],w.max));
   else out.push(w);
  }else if(Math.abs(y0-from)<1e-6&&Math.abs(y1-to)<1e-6)out.push(box(w.id,w.kind,level,[w.min[0],newFrom,w.min[2]],[w.max[0],newTo,w.max[2]]));
  else out.push(w);
 }
 return out;
}

function coordinatedWalls(){
 let w=drawn.map(b=>({...b}));
 // F1: the stair goes to the bay north of the hall, so the hall's north wall goes on every level; in the basement the
 // hall's east wall takes the doorway the floors above have (5.8–6.6, to the sauna), and its doorway into the stair
 // bay (7.6–8.4, under the flights now) is closed.
 for(const lv of HOUSE_LEVELS)w=w.filter(b=>!(b.level===lv&&b.kind==='partition'&&runsAlong(b)==='x'&&Math.abs(lineOf(b)-6.5)<1e-6));
 w=respan(w,'B1','y',7.3,[[.2,4],[4.8,5.8],[6.6,9.8]]);
 // F2, F3: the rooms over and under the genkan get the genkan's doorway onto the hall.
 w=respan(w,'B1','x',3.5,[[4.9,5.4],[6.2,7.3]]);
 w=respan(w,'L1','x',3.5,[[4.9,5.4],[6.2,7.3]]);
 // F4, F5: the north-east rooms of the basement and the upper floor get the doorway the ground floor has there.
 w=respan(w,'B1','x',7.1,[[7.3,9.2],[10,11.8]]);
 w=respan(w,'L1','x',7.1,[[7.3,9.2],[10,11.8]]);
 // F6: the study's window is moved off the bathroom's partition, into the study.
 w=recut(w,'L1','east',4.4,6.1,STUDY_WINDOW[0],STUDY_WINDOW[1]);
 // F7: every wall stands on its slab and runs up to the soffit of the slab over it (the drawn shell stops 20–200 mm short).
 for(const b of w)if(b.kind!=='sill'&&Math.abs(b.max[2]-HOUSE_FLOORS[b.level].soffit)<.3)b.max[2]=HOUSE_FLOORS[b.level].soffit;
 return w;
}
/** F6: W-STUDY, 1.7 m as drawn, centred in the study between its partitions. */
const STUDY_WINDOW=Object.freeze([5.2,6.9]);

// ---------------------------------------------------------------- the rooms

/** Each room as built: the space between its walls' faces, its name from the drawings, what it is for. */
const room=(id,level,name,[x0,y0,x1,y1],purpose)=>Object.freeze({id,level,name,bounds:Object.freeze([x0,y0,x1,y1]),purpose});
const W=[.2,4.84],M=[4.96,7.24],E=[7.36,11.8];
export const HOUSE_ROOMS=Object.freeze([
 room('b1-workshop','B1','Electrical workshop',[W[0],.2,W[1],4.94],'Johansson’s bench, his meters and the parts drawers: the ship’s electrician’s workshop he kept when he came ashore.'),
 room('b1-club','B1','Club reading room',[W[0],5.06,W[1],9.8],'The reading club meets here: armchairs, the books, a bar; the high window under the garden lets in the day.'),
 room('b1-cellar','B1','Cellar store',[M[0],.2,M[1],3.44],'Under the genkan: preserves, the club’s bottles and the typhoon kit (finding F2).'),
 room('b1-hall','B1','Stair hall',[M[0],3.56,M[1],6.56],'The foot of the stair, and the way to every room in the basement.'),
 room('b1-stair','B1','Stair',[M[0],6.56,M[1],9.8],'The first flight up, and the cupboard under the flight down (finding F1).'),
 room('b1-boiler','B1','Boiler and pumps',[E[0],.2,E[1],4.94],'The water heater, the pressure pumps and the sump pumps, with its own door to the garden (D-BEXT).'),
 room('b1-sauna','B1','Sauna and shower',[E[0],5.06,E[1],7.04],'A Swede’s sauna: the bench room, the shower and the changing bench.'),
 room('b1-storage','B1','Storage',[E[0],7.16,E[1],9.8],'Shelves, the fishing gear and the spare tiles, through the sauna’s changing room (finding F4).'),
 room('g0-living','G0','Living room',[W[0],.2,W[1],4.94],'The low table, the television and the window to the garden.'),
 room('g0-kitchen','G0','Kitchen and dining',[W[0],5.06,W[1],9.8],'The kitchen along the west wall, the dining table under the north window.'),
 room('g0-genkan','G0','Entry and genkan',[M[0],.2,M[1],3.44],'The front door, the doma where shoes come off, the step up and the letter box (finding F8).'),
 room('g0-hall','G0','Stair hall',[M[0],3.56,M[1],6.56],'The middle of the house: every room on the floor opens off it.'),
 room('g0-stair','G0','Stair',[M[0],6.56,M[1],9.8],'The stair, up and down (finding F1).'),
 room('g0-sewing','G0','Thuan sewing studio',[E[0],.2,E[1],4.94],'Thuan’s machine at the east window, her cutting table and her fabric.'),
 room('g0-wc','G0','WC and utility',[E[0],5.06,E[1],7.04],'The toilet, the washbasin and the utility sink.'),
 room('g0-terrace','G0','Covered terrace access',[E[0],7.16,E[1],9.8],'Boots, the garden tools and the door out to the terrace (D-TERRACE).'),
 room('l1-bedroom','L1','Primary bedroom',[W[0],.2,W[1],4.94],'Johansson and Thuan’s room: the futons and the wardrobe.'),
 room('l1-guest','L1','Guest bedroom',[W[0],5.06,W[1],9.8],'For visitors and for Thuan’s sisters when the last boat has gone.'),
 room('l1-boxroom','L1','Box room',[M[0],.2,M[1],3.44],'The nando over the genkan: the winter quilts and the suitcases (finding F3).'),
 room('l1-hall','L1','Stair hall',[M[0],3.56,M[1],6.56],'The landing at the top of the stair.'),
 room('l1-stair','L1','Stair',[M[0],6.56,M[1],9.8],'The well of the stair, with its balustrade (finding F1).'),
 room('l1-bathroom','L1','Bathroom',[E[0],.2,E[1],4.94],'The ofuro, the washing place and the basin.'),
 room('l1-study','L1','Study',[E[0],5.06,E[1],7.04],'The desk at the east window, the town’s papers (finding F6).'),
 room('l1-linen','L1','Linen room',[E[0],7.16,E[1],9.8],'The linen and the airing rail under the north window (finding F5).'),
]);
/** The room at (x, y) on a level, or null (inside a wall). */
export function roomAt(level,x,y){return HOUSE_ROOMS.find(r=>r.level===level&&x>=r.bounds[0]-1e-6&&x<=r.bounds[2]+1e-6&&y>=r.bounds[1]-1e-6&&y<=r.bounds[3]+1e-6)??null;}

// ---------------------------------------------------------------- the stair (finding F1)

/**
 * The drawings' stair, 16 risers of 175 mm and treads of 250 mm in two flights with a landing between, in the bay north
 * of the hall: up north along the west half to the landing across the bay's north end, up south along the east half
 * to the next floor's hall. The flights stack, so the stair from the ground floor up stands over the stair from the
 * basement, 2.8 m above it.
 */
export const HOUSE_STAIR=(()=>{
 const S=CAD.stair,shaft=Object.freeze([M[0],6.56,M[1],9.8]),spine=Object.freeze([6.06,6.14]);
 const west=Object.freeze([M[0],spine[0]]),east=Object.freeze([spine[1],M[1]]),half=S.risers/2;
 const landingFrom=r3(shaft[1]+(half-1)*S.tread);
 const flights=['B1','G0'].map(level=>{
  const F=HOUSE_FLOORS[level].floor,to=level==='B1'?'G0':'L1',treads=[];
  // Up the west half: risers at 6.56, 6.81 … 8.06; the eighth onto the landing at 8.31.
  for(let k=1;k<half;k++)treads.push(Object.freeze({x:west,y:Object.freeze([r3(shaft[1]+(k-1)*S.tread),r3(shaft[1]+k*S.tread)]),z:r3(F+k*S.riser)}));
  const landing=Object.freeze({x:Object.freeze([M[0],M[1]]),y:Object.freeze([landingFrom,shaft[3]]),z:r3(F+half*S.riser)});
  // Up the east half, southwards, to the hall above.
  for(let k=half+1;k<S.risers;k++)treads.push(Object.freeze({x:east,y:Object.freeze([r3(landingFrom-(k-half)*S.tread),r3(landingFrom-(k-half-1)*S.tread)]),z:r3(F+k*S.riser)}));
  return Object.freeze({from:level,to,base:F,treads:Object.freeze(treads),landing});
 });
 return Object.freeze({shaft,spine,west,east,rise:S.rise,risers:S.risers,riser:S.riser,tread:S.tread,width:r3(west[1]-west[0]),flights:Object.freeze(flights)});
})();

// ---------------------------------------------------------------- the walls, doors and openings as built

export const HOUSE_WALLS=Object.freeze(coordinatedWalls().map(Object.freeze));

/** The doorways between rooms: the gaps along each partition line of a level, with the rooms either side. */
export const HOUSE_DOORS=Object.freeze((()=>{
 const out=[];
 for(const level of HOUSE_LEVELS){
  const parts=HOUSE_WALLS.filter(w=>w.level===level&&w.kind==='partition'),lines=new Map();
  for(const p of parts){const k=runsAlong(p)+lineOf(p);if(!lines.has(k))lines.set(k,[]);lines.get(k).push(p);}
  for(const [k,list] of lines){
   const along=k[0],at=Number(k.slice(1)),i=along==='x'?0:1;
   list.sort((a,b)=>a.min[i]-b.min[i]);
   for(let n=0;n+1<list.length;n++){
    const from=list[n].max[i],to=list[n+1].min[i];if(to-from<.3)continue;
    const mid=(from+to)/2,off=.2,[a,b]=along==='x'?[[mid,at-off],[mid,at+off]]:[[at-off,mid],[at+off,mid]];
    const ra=roomAt(level,...a),rb=roomAt(level,...b);
    // Two partitions on one line with a room between them (the hall between the west and east rooms) is no doorway.
    if(!ra||!rb||ra===rb)continue;
    out.push(Object.freeze({id:`${level}-door-${along}${at}-${r3(from)}`,level,along,at,from:r3(from),to:r3(to),rooms:Object.freeze([ra.id,rb.id])}));
   }
  }
  // Where the hall meets the stair bay there is no wall (F1): the bay opens off the hall across its width.
  out.push(Object.freeze({id:`${level}-stair-opening`,level,along:'x',at:6.56,from:M[0],to:M[1],rooms:Object.freeze([`${level.toLowerCase()}-hall`,`${level.toLowerCase()}-stair`]),open:true}));
 }
 return out;
})());

/** The door heads (F8): an interior doorway is 2.0 m high, its head walled up to the soffit like the drawn openings'. */
export const HOUSE_DOOR_HEADS=Object.freeze(HOUSE_DOORS.filter(d=>!d.open).map(d=>{
 const F=HOUSE_FLOORS[d.level],t=CAD.wallThickness.partition/2,z0=r3(F.floor+2),z1=F.soffit;
 return Object.freeze(box(d.id+'-head','head',d.level,d.along==='x'?[d.from,d.at-t,z0]:[d.at-t,d.from,z0],d.along==='x'?[d.to,d.at+t,z1]:[d.at+t,d.to,z1]));
}));

/** The openings in the outside walls (W- windows, D- doors), as drawn, W-STUDY moved (F6); `room` is the room inside. */
export const HOUSE_OPENINGS=Object.freeze(CAD.openings.map(o=>{
 const [from,to]=o.id==='W-STUDY'?STUDY_WINDOW:[o.from,o.to],F=HOUSE_FLOORS[o.level].floor;
 // The manifest's sills and heads are above the ground floor's datum for G0, and above B1's and L1's for theirs.
 const base=o.level==='G0'?0:o.level==='B1'?-2.8:2.8,sill=r3(base+o.sill),head=r3(base+o.head);
 const mid=(from+to)/2,inner=o.side==='south'?[mid,.4]:o.side==='north'?[mid,9.6]:o.side==='west'?[.4,mid]:[11.6,mid];
 return Object.freeze({...o,from,to,sill:Math.max(sill,F),head,room:roomAt(o.level,...inner)?.id??null});
}));

/** The slabs, with the stair's well in the ground and upper floors (F1) and the genkan's doma dropped a step (F8). */
export const HOUSE_SLABS=Object.freeze((()=>{
 const out=[],[sx0,sy0,sx1,sy1]=HOUSE_STAIR.shaft;
 for(const level of HOUSE_LEVELS){
  const F=HOUSE_FLOORS[level].floor,z0=r3(F-.28);
  const rects=level==='B1'?[[0,0,12,10]]:[[0,0,12,sy0],[0,sy0,sx0,10],[sx1,sy0,12,10]];
  for(const [x0,y0,x1,y1] of rects){
   if(level==='G0'&&y0===0){
    // The genkan's doma, 150 mm under the hall, from the front door to the step (HOUSE_SITE.domaTo).
    const g=HOUSE_ROOMS.find(r=>r.id==='g0-genkan').bounds,D=HOUSE_SITE.domaTo;
    out.push({level,min:[0,0,z0],max:[g[0],y1,F]},{level,min:[g[2],0,z0],max:[12,y1,F]},{level,min:[g[0],D,z0],max:[g[2],y1,F]},{level,min:[g[0],0,z0],max:[g[2],D,HOUSE_SITE.doma],doma:true});
    continue;
   }
   out.push({level,min:[x0,y0,z0],max:[x1,y1,F]});
  }
 }
 return out.map(s=>Object.freeze({...s,min:Object.freeze(s.min.map(r3)),max:Object.freeze(s.max.map(r3))}));
})());

// ---------------------------------------------------------------- the findings

/** Where the house as built departs from Rev C, and why: the list for the next revision (docs/johansson-house/README.md). */
export const HOUSE_FINDINGS=Object.freeze([
 {id:'F1',title:'The stair cannot stand in the stair hall as drawn',
  drawn:'Two flights of 8 risers × 175 mm, treads 250 mm, with an intermediate landing, in the 2.0 × 2.6 m footprint 5.1–7.1 × 3.7–6.3, and every floor slab cut away over that footprint. The second flight is drawn from y 6.3 down to 4.55, over the landing.',
  problem:'Two flights of seven treads and a landing take 1.75 + 0.85 m, the whole hall, so a floor has no landing to step off at: the hall’s doorways (two to the west rooms, two to the east rooms, the genkan’s, the linen’s) open over the stair well at every level. In the basement the slab is cut away under the stair too. And the bay north of the hall (4.96–7.24 × 6.56–9.8) has no doorway on any floor.',
  built:'The same stair, 16 × 175 mm risers and 250 mm treads, flights 1.10 m wide either side of an 80 mm spine wall, in the bay north of the hall: up north along the west half (7 treads, 1.75 m) to a landing 1.49 m deep across the bay, up south along the east half to the next floor. It fits the bay to the millimetre (1.75 + 1.49 = 3.24 m), the flights stack 2.8 m apart (2.6 m headroom), and the hall is a floor on every level. The hall’s north partition goes; the well is in the ground and upper floor slabs over the bay; the basement slab is whole. In the basement the hall’s east doorway at 7.6–8.4 (now under the flights) moves to 5.8–6.6, as on the floors above.'},
 {id:'F2',title:'The basement room under the genkan has no door',drawn:'Enclosed by partitions on all four sides (4.96–7.24 × 0.2–3.44).',problem:'Unreachable.',built:'A doorway onto the hall at 5.4–6.2, as the genkan has on the floor above: the cellar store.'},
 {id:'F3',title:'The upper-floor room over the genkan has no door',drawn:'Enclosed on all four sides (4.96–7.24 × 0.2–3.44).',problem:'Unreachable.',built:'A doorway onto the landing at 5.4–6.2: the box room (nando).'},
 {id:'F4',title:'The basement storage has no door',drawn:'Storage, 5.0–11.8 × 6.6–9.8, reached only through the stair bay’s doorway at 7.6–8.4.',problem:'The stair bay is closed, and in F1 it is the stair.',built:'The north-east room (7.36–11.8 × 7.16–9.8) is the storage, with the doorway the ground floor has there (9.2–10.0) from the sauna’s changing room. A doorway off the hall would be better: Rev D.'},
 {id:'F5',title:'The upper-floor linen room has no door',drawn:'Linen and landing, 5.0–11.8 × 6.6–9.8, with W-LANDING in its north wall; its east part is enclosed.',problem:'Unreachable, and its west part is the stair well in F1.',built:'The north-east room is the linen room, with W-LANDING, and the doorway the ground floor has there (9.2–10.0), from the study.'},
 {id:'F6',title:'The study window is cut by the bathroom’s partition',drawn:'W-STUDY, east wall, y 4.4–6.1, sill 850, head 2100.',problem:'The partition between the bathroom and the study is at y 4.94–5.06, across the window.',built:'W-STUDY, 1.7 m as drawn, at y 5.2–6.9, centred in the study.'},
 {id:'F7',title:'The walls stop short of the slabs',drawn:'Ground floor walls end at 2.60 under a slab from 2.62; upper floor walls at 5.40 under the roof slab at 5.60; basement walls at −0.20 under a slab from −0.18; partitions 50 mm lower still.',problem:'Gaps of 20–200 mm between wall and slab: no wall stands like that.',built:'Every wall runs to the soffit over it.'},
 {id:'F8',title:'Interior doorways and the genkan',drawn:'Interior doors are full-height gaps in the partitions; the ground floor slab is level throughout.',problem:'A doorway has a head; a Japanese genkan has a doma a step below the floor, where shoes come off.',built:'Each interior doorway is 2.0 m high with its head walled up to the soffit (as the drawn outside openings are). The genkan’s doma, from the front door to 1.4 m in, is 150 mm under the hall, with the step (agari-kamachi) at its edge. Door leaves are not drawn, so none are hung.'},
 {id:'F9',title:'The ground round the house',drawn:'Not drawn. The basement walls stop at −0.20 and the ground floor slab is at −0.18–0.10.',problem:'The house needs a grade, a step to its front door and a way down to D-BEXT, 2.35 m under the garden.',built:'The yard 450 mm under the ground floor (−0.35), a stone step at the front door (−0.20); outside D-BEXT a walled areaway with 14 steps of 168 mm up to the garden along the south face, rails round it; outside W-B1 a window well with a steel grating at grade.'},
 {id:'F10',title:'The roof is a placeholder',drawn:'A flat slab 5.60–5.80 over −0.4–12.4 × −0.4–10.4, a placeholder pending a typhoon-resistant roof (Rev B: a tiled hipped roof, ridge at 7.90).',problem:'A placeholder is not a roof for the hamlet; the design is the creator’s to make.',built:'The slab as drawn, and on it Rev B’s intent: a hipped roof of red tile pointed in lime, the Okinawan way, equal pitches (about 21°), ridge at 7.90, a shisa on the ridge. To be replaced by the creator’s design.'},
 {id:'F11',title:'The basement is under the sea’s level',drawn:'Basement floor at −2.70.',problem:'The yard is 1.3 m above the sea, so the basement floor is about 1 m below it, in coral sand: the drawings say basement waterproofing is not engineered.',built:'Nothing more than drawn: a tanked concrete box with a sump and two pumps (in the boiler room) is what a builder would need, and a check against flotation. Open.'},
 {id:'F12',title:'The kitchen window is lower than the counter under it',drawn:'W-KITCHEN, west wall of the kitchen and dining room, sill 850 over the datum: 750 mm over the ground floor.',problem:'A kitchen counter is 850 mm high, so the counter runs across the foot of the window, 100 mm of glass behind the worktop.',built:'The counter at 850 along the west wall as a kitchen has it, across the window’s foot. Rev D: a sill of 1 000 mm or more over the floor at a counter.'},
].map(Object.freeze));
