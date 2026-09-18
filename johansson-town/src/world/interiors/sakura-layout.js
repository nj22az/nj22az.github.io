// Measured from the supplied convenience-store model, in metres at floor Y=0.
const rect=(x,z,w,d,height=2.9)=>({x,z,w,d,height});

/**
 * Room for the clerk.
 *
 * The stand points were authored with about 0.36m to the nearest shelf, which is under
 * half a metre of shoulder, apron and skirt: she stood inside the goods, and now that
 * the shop is visible through its own window you can watch her do it from the
 * pavement. Every stand point is pushed back off its shelf, and with the second
 * gondola gone the worst of them has 0.49m to the nearest fitting: the cold cabinets
 * and the bun warmer, which she reaches across rather than walks between. The gondola
 * itself gives her 0.55m.
 *
 * Her own width used to be stuck at 0.32 because the navigation raster was rasterised
 * at 0.32 no matter how wide the walker was, so anything broader was routed down gaps
 * it could not fit and gave up against its own collision check. The raster now takes
 * the walker's radius (see navmesh.js), so what is left to hold her back is the 0.49m
 * in front of the cold cabinets rather than the pathfinder.
 */
export const CLERK_CLEARANCE=.36;

/**
 * The shopfront that stands for this interior on the street, in metres.
 *
 * Measured off the supplied model rather than chosen: it spans x -6.86..6.87 and runs
 * back from its glazing at z 3.91 to z -6.93. A frontage smaller than that can only
 * show a shrunken copy of the shop through its own window.
 */
export const SAKURA_FRONT=Object.freeze({width:14.26,depth:11.0});

/**
 * The shop was modelled with one 6.6m gondola lying across the middle of the floor,
 * parallel to the window and two metres inside the door, so you walked in at the back
 * of a shelf and every aisle ran across your path rather than away from you.
 *
 * It is now three islands, each turned a quarter turn and stood across the floor:
 * the aisles run from the window to the cold cabinets, which is the line a customer
 * walks anyway, and the widest of them is on the door's own centre line, so you come in
 * looking down the shop instead of at the back of a shelf. They sit clear of the
 * magazine rack under the west window, which would otherwise close the far aisles off
 * from the front of the shop.
 *
 * Two of them are the halves of the run that faced the window. The third is one bay of
 * the run that lay behind it, kept back rather than dropped: the shop is twice the size
 * of a real konbini and the west end of the floor was bare without it.
 *
 * Products, stand points and colliders are all still authored in the run's own
 * coordinates and carried over by the same transform that carries its triangles, so
 * the shelving and what stands on it cannot drift apart (see rearrangeShelving in
 * sakura-interior.js).
 */
const QUARTER=Math.PI/2;
function island(from,centre,to){
 const [cx,cz]=centre,[tx,tz]=to;
 // A quarter turn about the island's own centre: (x,z) becomes (z,-x).
 return {from,yaw:QUARTER,
  place:(x,z)=>[+(tx+(z-cz)).toFixed(4),+(tz-(x-cx)).toFixed(4)],
  offset:[+(tx-cz).toFixed(4),+(tz+cx).toFixed(4)]};
}
/** The two runs as modelled, in the coordinates their triangles are still stored in. */
const FRONT_RUN={minY:-.1,maxY:1.6,minZ:.70,maxZ:1.96},BACK_RUN={minY:-.1,maxY:1.6,minZ:-1.80,maxZ:-.50};
/** Where each island came from and where it stands now, west to east. Measured spans. */
export const SHELF_ISLANDS={
 west:island({...BACK_RUN,minX:-2.55,maxX:-.485},[-1.50,-1.16],[-4.05,.6165]),
 middle:island({...FRONT_RUN,minX:-.465,maxX:2.20},[.832,1.3315],[-1.55,.33]),
 east:island({...FRONT_RUN,minX:-4.56,maxX:-.465},[-2.494,1.3315],[1.55,.05]),
};
/** The rest of the second gondola, which made the middle of the floor a corridor. */
export const REMOVED_SHELVING=[{minX:-3.25,maxX:2.25,minY:-.1,maxY:1.6,minZ:-1.85,maxZ:-.5}];
/** The run's own colliders, moved with it. A quarter turn swaps width for depth. */
const turned=(id,r)=>{const [x,z]=SHELF_ISLANDS[id].place(r.x,r.z);return {x,z,w:r.d,d:r.w,height:r.height};};
const GONDOLA=[['east',rect(-2.494,1.3315,4.046,1.223,1.5)],['middle',rect(.5455,1.3315,2.021,1.223,1.5)],['middle',rect(1.85,1.35,.57,1.2,1.55)],['west',rect(-1.50,-1.16,2.02,1.22,1.5)]];
export const SAKURA_LAYOUT={
 bounds:{minX:-6.8,maxX:6.8,minZ:-6.78,maxZ:3.88},
 floorPolygon:[[-6.8,3.88],[6.8,3.88],[6.8,-3.95],[5.7,-3.95],[5.7,-6.78],[-5.7,-6.78],[-5.7,-3.95],[-6.8,-3.95]],
 spawn:[0,0,3.2],entrance:[0,0,3.45],exit:[0,1.35,3.88],yaw:0,
 // The glazing plane, in room coordinates. Both directions of the shop window use
 // it: the street seen from inside, and the real interior seen from the street.
 frontZ:3.91,
 clearance:CLERK_CLEARANCE,
 staff:[5.5,0,.85],staffYaw:Math.PI/2,checkout:[3.9,0,.85],stockroom:[.7,0,-5.5],register:[4.78,1.1,.85],
 colliders:[
  ...GONDOLA.map(([id,r])=>turned(id,r)),
  rect(-4.65,3.40,4.12,.65,1.5),rect(-5.17,-2.16,2.04,.61,1.5),
  rect(-6.4,.43,.9,4.03,2.25),rect(.4,-3.55,5.35,.8,2.3),
  rect(4.8,1.97,.52,3.78,1.0),rect(6.74,2.08,.18,3.48,2.0),rect(3.64,3.6,1.35,.57,1.06),
  rect(-.66,-3.99,7.82,.12),rect(5.62,-3.99,2.46,.12),
  rect(-4.02,-3.2,.12,1.53),rect(-5.4,-2.48,2.82,.12),
  rect(4.60,-2.6,.12,2.7),rect(4.86,-1.17,.56,.12),rect(6.56,-1.17,.56,.12),
  rect(-2.16,-4.49,6.88,.86,2.3),rect(-6.26,-3.26,1.0,1.2,1.2),
 ]
};
// Each stocked unit has a real position. Opposite sides of an aisle use opposite
// facings; the same product geometry is used on the shelf and in the hand.
// Shelf tops measured against the imported triangles, not the nominal shelf origin.
export const AISLE_LEVELS=[.3553,.6683,.9813,1.2943];
export const FRIDGE_LEVELS=[.34,.70,1.06,1.42,1.78];
export const SAKURA_SHELVES={};

/** How far back off its shelf every stand point is pushed. */
const STAND_BACK=.12;

/** Moves a stand point further from the shelf it serves, along the way it already faces. */
function standBack(x,z,stand){
 const dx=stand[0]-x,dz=stand[2]-z,d=Math.hypot(dx,dz);
 if(!d)return stand;
 return [+(stand[0]+dx/d*STAND_BACK).toFixed(4),stand[1],+(stand[2]+dz/d*STAND_BACK).toFixed(4)];
}

/**
 * One face of the one remaining gondola: three bays, each with a side facing the shop
 * front and a side facing the back room, four shelves apiece.
 *
 * The run that was taken out held eight of the twenty aisle products, and they moved
 * here rather than out of the shop. Twenty products over twenty-four shelves, so most
 * take one shelf each and the four heaviest lines spread over the bottom two — which
 * is where a konbini puts rice and washing powder anyway.
 */
function bay(ids,site,x,z,yaw,stand){
 const on=SHELF_ISLANDS[site],[px,pz]=on.place(x,z),back=standBack(x,z,stand),[sx,sz]=on.place(back[0],back[2]);
 const spare=AISLE_LEVELS.length-ids.length,facing=yaw+on.yaw;
 let level=0;
 for(const [i,id] of ids.entries()){
  const take=1+(i<spare?1:0);
  SAKURA_SHELVES[id]={x:px,z:pz,levels:AISLE_LEVELS.slice(level,level+take),yaw:facing,stand:[sx,0,sz],spacing:.24,depth:.12};
  level+=take;
 }
}
bay(['rice','curry'],'east',-3.6,1.56,0,[-3.6,0,2.38]);
bay(['biscuit','chips'],'east',-1.48,1.56,0,[-1.48,0,2.38]);
bay(['chocolate','candy','peaches'],'middle',.55,1.56,0,[.55,0,2.38]);
bay(['soap','detergent'],'east',-3.6,1.10,Math.PI,[-3.6,0,.28]);
bay(['notebook','postcard'],'east',-1.48,1.10,Math.PI,[-1.48,0,.28]);
bay(['soy','tuna','soup'],'middle',.55,1.10,Math.PI,[.55,0,.28]);
bay(['noodles','crackers','bread'],'west',-1.48,-.93,0,[-1.48,0,-.11]);
bay(['toothpaste','tissues','battery'],'west',-1.48,-1.39,Math.PI,[-1.48,0,-2.21]);
/**
 * The cold cabinet: four columns, five levels apiece.
 *
 * The drinks only ever reached the fourth level, so the top of three of the four
 * columns held nothing — from the door, a metre-wide band of empty glass across the
 * back of the shop. It is filled with what a konbini actually sells off the morning
 * van, and each line is put at the height you can see it from: you look down on a
 * bento tray and a pudding cup, so they go on the bottom shelf, and the drinks above
 * them shift up one; you look up at a bottle, a carton or a sandwich wedge, so those
 * take the top. Ramune already had one top shelf and keeps it.
 */
const COLD_CABINET=[
 {column:0,floor:'bento',drinks:['coffee','tea']},
 {column:1,drinks:['water','orange'],top:'soda'},
 {column:2,drinks:['beer','cola'],top:'sandwich'},
 {column:3,floor:'pudding',drinks:['yogurt','milk']},
];
/** The bottom and top shelves hold one line each; the drinks take two levels apiece. */
const CHILLED={
 bento:{spacing:.22,depth:.155,columns:4},
 pudding:{spacing:.13,depth:.13,columns:6},
 sandwich:{spacing:.22,depth:.13,columns:4},
 soda:{spacing:.19,depth:.105},
};
for(const {column,floor,drinks,top} of COLD_CABINET){
 const x=-1.60+column*1.33,stand=standBack(x,-3.48,[x,0,-2.78]);
 const place=(id,levels)=>{SAKURA_SHELVES[id]={x,z:-3.48,levels,yaw:0,stand,spacing:.19,depth:.13,...CHILLED[id],fridge:column};};
 // A floored column pushes its drinks up a shelf, which is the whole point of it.
 const first=floor?1:0;
 if(floor)place(floor,[FRIDGE_LEVELS[0]]);
 drinks.forEach((id,row)=>place(id,FRIDGE_LEVELS.slice(first+row*2,first+row*2+2)));
 if(top)place(top,[FRIDGE_LEVELS[4]]);
}
SAKURA_SHELVES.bun={x:-6.50,z:1.515,levels:[.9573,1.3203,1.6833],columns:4,yaw:Math.PI/2,stand:standBack(-6.50,1.515,[-5.58,0,1.515]),spacing:.33,depth:.12};

SAKURA_SHELVES.noodles.depth=.15;

/**
 * Fittings the model came with that nothing ever stood on: the magazine rack under the
 * west window, the wall shelf by the back room, and the end cap on the middle island.
 * Empty shelving reads as an unfinished shop, and the rack across the whole window is
 * the first thing you see from the pavement.
 *
 * None of it is stock. You cannot buy a magazine — you read it standing at the rack,
 * the way you do — and the delivery cartons are the shop's own. So it is dressed here
 * rather than listed in SAKURA_SHELVES: it never depletes and never needs restocking.
 * Shelf heights and the depth each level actually has are measured off the model.
 */
function dressed(piece){
 if(!piece.island)return piece;
 const on=SHELF_ISLANDS[piece.island],[x,z]=on.place(piece.x,piece.z),[lx,lz]=on.place(piece.look[0],piece.look[2]);
 return {...piece,x,z,yaw:piece.yaw+on.yaw,look:[lx,piece.look[1],lz]};
}
const MAGAZINES=[['magazine-rod',.267],['magazine-sea',.753],['magazine-night',1.240]];
export const SAKURA_DRESSING=[
 ...MAGAZINES.map(([template,level],i)=>({id:template,template,levels:[level],x:-4.665,z:3.50,yaw:Math.PI,columns:15,rows:1,spacing:.255,depth:.12,
  look:i===1?[-4.665,1.38,3.32]:null,title:'Read the magazines',
  text:'The rack under the window. 月刊 海風, 週刊 星空 and 釣りと海, and the evening paper folded on the bottom shelf.\nNobody minds how long you stand here.'})),
 {id:'newspaper',template:'newspaper',levels:[.088],x:-4.665,z:3.42,yaw:Math.PI,columns:11,rows:1,spacing:.33,depth:.12,look:null},
 {id:'delivery',template:'stock',levels:[.088,.357,.670,.983,1.296],x:-5.165,z:-2.28,yaw:0,columns:5,rows:1,spacing:.365,depth:.25,
  look:[-5.165,1.44,-2.09],title:'Look over the delivery shelf',
  text:'Cartons off the morning van, waiting to be priced up and put out. Thuan works down them after closing.'},
 {id:'promotion',template:'curry',island:'middle',levels:[.202,.334,.805,.937],x:1.87,z:1.355,yaw:Math.PI/2,columns:5,rows:1,spacing:.18,depth:.05,
  look:[2.06,1.08,1.355],title:'Read the end-cap promotion',
  text:'日の出カレールウ — the month\u2019s offer, stacked at the end of the aisle with a hand-lettered card.'},
].map(dressed);
