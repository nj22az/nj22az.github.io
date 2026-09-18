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
 * The shop was modelled with one 6.6m gondola lying across the middle of the floor,
 * parallel to the window and two metres inside the door, so you walked in at the back
 * of a shelf and every aisle ran across your path rather than away from you.
 *
 * It is now two islands, each turned a quarter turn and stood either side of the door:
 * the aisles run from the window to the cold cabinets, which is the line a customer
 * walks anyway, and the widest of them is on the door's own centre line, so you come in
 * looking down the shop instead of at the back of a shelf. They sit clear of the
 * magazine rack under the west window, which would otherwise close the far aisle off
 * from the front of the shop.
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
/** Where each half of the run came from, and where it stands now. Measured spans. */
export const SHELF_ISLANDS={
 west:island({minX:-.465,maxX:2.20},[.832,1.3315],[-1.55,.33]),
 east:island({minX:-4.56,maxX:-.465},[-2.494,1.3315],[1.55,.05]),
};
/** The height and depth of the run, shared by both halves. */
export const SHELF_SPAN={minY:-.1,maxY:1.6,minZ:.70,maxZ:1.96};
/** The second gondola, which made the middle of the floor a corridor. */
export const REMOVED_SHELVING=[{minX:-3.25,maxX:2.25,minY:-.1,maxY:1.6,minZ:-1.85,maxZ:-.5}];
/** The run's own colliders, moved with it. A quarter turn swaps width for depth. */
const turned=(id,r)=>{const [x,z]=SHELF_ISLANDS[id].place(r.x,r.z);return {x,z,w:r.d,d:r.w,height:r.height};};
const GONDOLA=[['east',rect(-2.494,1.3315,4.046,1.223,1.5)],['west',rect(.5455,1.3315,2.021,1.223,1.5)],['west',rect(1.85,1.35,.57,1.2,1.55)]];
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
bay(['rice','curry','noodles','bread'],'east',-3.6,1.56,0,[-3.6,0,2.38]);
bay(['biscuit','chips','crackers'],'east',-1.48,1.56,0,[-1.48,0,2.38]);
bay(['chocolate','candy','peaches'],'west',.55,1.56,0,[.55,0,2.38]);
bay(['soap','detergent','toothpaste','tissues'],'east',-3.6,1.10,Math.PI,[-3.6,0,.28]);
bay(['notebook','postcard','battery'],'east',-1.48,1.10,Math.PI,[-1.48,0,.28]);
bay(['soy','tuna','soup'],'west',.55,1.10,Math.PI,[.55,0,.28]);
for(const [column,ids] of [['tea','coffee'],['water','orange'],['beer','cola'],['milk','yogurt']].entries()){
 for(const [row,id] of ids.entries()){const x=-1.60+column*1.33;SAKURA_SHELVES[id]={x,z:-3.48,levels:FRIDGE_LEVELS.slice(row*2,row*2+2),yaw:0,stand:standBack(x,-3.48,[x,0,-2.78]),spacing:.19,depth:.13,fridge:column};}
}
SAKURA_SHELVES.soda={x:-.27,z:-3.48,levels:[FRIDGE_LEVELS[4]],yaw:0,stand:standBack(-.27,-3.48,[-.27,0,-2.78]),spacing:.19,depth:.105,fridge:1};
SAKURA_SHELVES.bun={x:-6.50,z:1.515,levels:[.9573,1.3203,1.6833],columns:4,yaw:Math.PI/2,stand:standBack(-6.50,1.515,[-5.58,0,1.515]),spacing:.33,depth:.12};

SAKURA_SHELVES.noodles.depth=.15;
