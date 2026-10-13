import {HOUSE_FLOORS,HOUSE_SITE,HOUSE_WALLS,HOUSE_OPENINGS} from './johansson-house.js';
import {OKINAWA_COLOURS,shisa} from './okinawa/houses.js';

/**
 * Johansson's house built with the Okinawan kit (okinawa/kit.js), from the house's data (johansson-house.js): the outside,
 * as it stands in Kitano hamlet. The kit's current frame is the house's: centred on its plan, the front (the drawings'
 * south face, with the genkan's door) looking along +z, y up from the yard. The drawings' frame is x east and y north
 * from the south-west corner, z up from the ground floor's datum, so a drawn point (x, y, z) is local (x − 6, z − grade,
 * 5 − y).
 *
 * The concrete walls are the drawn walls, cut where the drawings cut them; the windows are aluminium sliding sashes
 * (引き違い) with glass that shows a room behind it, as every window in the town does; the roof is finding F10's.
 */
const C=OKINAWA_COLOURS;
export const HOUSE_COLOURS=Object.freeze({
 wall:0xf0e8d6,band:0xdcd4c3,plinth:0xa9a397,sash:0xc3c8c9,glass:C.glass,door:0x5a3f2c,steel:0x6f777a,
 stone:0xcfc6b0,roofSlab:0xe6ddc9,tile:C.roof,lime:C.lime,cover:0xd8e4e3,
});
const K=HOUSE_COLOURS;
/** A drawn point to the kit's frame. */
export const houseLocal=(x,y,z)=>[x-6,z-HOUSE_SITE.grade,5-y];
const Y=z=>z-HOUSE_SITE.grade;

/** A box between two drawn corners. */
function drawnBlock(kit,min,max,hex,finish='matte'){
 const [x0,y0,z0]=houseLocal(min[0],max[1],min[2]),[x1,y1,z1]=houseLocal(max[0],min[1],max[2]);
 kit.block(x0,x1,y0,y1,z0,z1,hex,finish);
}

/** The stair house over the basement's outside door (finding F9): its walls, flat roof and door, in drawn metres. */
export const HOUSE_STAIR_HOUSE=Object.freeze({x:Object.freeze([8.6,12.6]),y:Object.freeze([-2.4,0]),top:2.3,wall:.2,
 /** Its door at the top landing, in the south wall, a step above the yard. */
 door:Object.freeze([8.95,9.85]),landing:HOUSE_SITE.porch});
/** The window well outside W-B1 (finding F9), and its cover. */
export const HOUSE_WINDOW_WELL=Object.freeze({x:Object.freeze([-.9,0]),y:Object.freeze([5.7,7.1]),bottom:-1.85});
/** The front step and the hood over the front door (F9). */
export const HOUSE_PORCH=Object.freeze({x:Object.freeze([5.05,7.05]),y:Object.freeze([-1.05,0]),hood:Object.freeze({x:[4.95,7.15],y:[-.7,0],z:2.3})});

/**
 * The outside of the house. `solid(rect)` takes the kit's colliders; returns nothing else. Built inside the house's
 * frame (see above).
 */
export function buildHouseExterior(kit,solid){
 const G0=HOUSE_FLOORS.G0,L1=HOUSE_FLOORS.L1;
 // The plinth: the basement walls' tops and the ground floor slab's edge, from the yard to the floor, darker; under
 // the front door it stops at the doma, a step under the hall.
 const door=HOUSE_OPENINGS.find(o=>o.id==='D-ENTRY');
 drawnBlock(kit,[0,0,HOUSE_SITE.grade],[door.from,10,G0.floor],K.plinth);
 drawnBlock(kit,[door.to,0,HOUSE_SITE.grade],[12,10,G0.floor],K.plinth);
 drawnBlock(kit,[door.from,.2,HOUSE_SITE.grade],[door.to,10,G0.floor],K.plinth);
 drawnBlock(kit,[door.from,0,HOUSE_SITE.grade],[door.to,.2,HOUSE_SITE.doma],K.stone);
 // The walls above the ground: every exterior wall, sill and lintel of the ground and upper floors, as drawn (F7).
 for(const w of HOUSE_WALLS.filter(w=>w.level!=='B1'&&w.kind!=='partition'))drawnBlock(kit,w.min,w.max,K.wall);
 // The upper floor's slab edge, a band round the house between the storeys, and the roof slab's (manifest geometry).
 for(const [z0,z1] of [[G0.soffit,L1.floor]])for(const [a,b] of [[[0,0],[12,.2]],[[0,9.8],[12,10]],[[0,.2],[.2,9.8]],[[11.8,.2],[12,9.8]]])drawnBlock(kit,[a[0],a[1],z0],[b[0],b[1],z1],K.band);
 for(const o of HOUSE_OPENINGS.filter(o=>o.level!=='B1'))opening(kit,o);
 roof(kit);
 frontDoor(kit);
 stairHouse(kit,solid);
 windowWell(kit,solid);
 // The house is one solid to walk round: its walls, the plinth, the stair house beside the front.
 const [x0,,z0]=houseLocal(0,10,0),[x1,,z1]=houseLocal(12,0,0);
 solid(kit.rect(x0,x1,z0,z1,Y(HOUSE_SITE.ridge),'johansson-house'));
}

/** A window's sashes and glass, or a door's leaf, set in a drawn opening. */
function opening(kit,o){
 const out=o.side==='south'?[0,-1]:o.side==='north'?[0,1]:o.side==='west'?[-1,0]:[1,0];
 const alongX=o.side==='south'||o.side==='north',face=o.side==='south'?0:o.side==='north'?10:o.side==='west'?0:12;
 // The frame stands 70 mm in from the outside face.
 const inset=.07*(o.side==='south'||o.side==='west'?1:-1),plane=face+inset;
 const at=(s,z,depth,w,h,hex,finish)=>{
  const mid=[alongX?s:plane,alongX?plane:s];
  const [lx,ly,lz]=houseLocal(mid[0],mid[1],z);
  kit.box(alongX?w:depth,h,alongX?depth:w,lx,ly,lz,hex,{finish});
 };
 const w=o.to-o.from,h=o.head-o.sill,mid=(o.from+o.to)/2,zm=(o.sill+o.head)/2;
 if(o.type==='window'){
  // Outer frame, two sliding sashes meeting at the middle, the glass behind their rails, and a sill flashing.
  for(const s of [o.from+.025,o.to-.025])at(s,zm,.07,.05,h,K.sash);
  for(const z of [o.sill+.025,o.head-.025])at(mid,z,.07,w,.05,K.sash);
  at(mid,zm,.02,w-.08,h-.08,K.glass,'window');
  at(mid,zm,.08,.05,h-.08,K.sash);
  for(const z of [o.sill+.06,o.head-.06])at(mid,z,.08,w-.08,.035,K.sash);
  const [lx,ly,lz]=houseLocal(alongX?mid:face+out[0]*.03,alongX?face+out[1]*.03:mid,o.sill-.015);
  kit.box(alongX?w+.06:.1,.03,alongX?.1:w+.06,lx,ly,lz,K.sash);
  return;
 }
 if(o.id==='D-TERRACE'){
  // The terrace door: an aluminium-framed glazed door, a kick panel at its foot.
  for(const s of [o.from+.03,o.to-.03])at(s,zm,.07,.06,h,K.sash);
  at(mid,o.head-.03,.07,w,.06,K.sash);
  at(mid,o.sill+.25,.05,w-.12,.5,K.sash);
  at(mid,(o.sill+.5+o.head-.06)/2,.02,w-.12,o.head-.06-(o.sill+.5),K.glass,'window');
  return;
 }
 // D-ENTRY's leaf is frontDoor's; D-BEXT is inside the stair house.
}

/** The front door: a timber leaf in a frame, with the letter slot that feeds the box inside and a lever handle. */
function frontDoor(kit){
 const o=HOUSE_OPENINGS.find(o=>o.id==='D-ENTRY'),sill=HOUSE_SITE.doma,mid=(o.from+o.to)/2,w=o.to-o.from,h=o.head-sill,face=.07;
 const at=(x,z,wd,ht,d,hex,finish)=>{const [lx,ly,lz]=houseLocal(x,face,z);kit.box(wd,ht,d,lx,ly,lz,hex,{finish});};
 for(const x of [o.from+.03,o.to-.03])at(x,sill+h/2,.06,h,.09,K.door);
 at(mid,o.head-.03,w,.06,.09,K.door);
 at(mid,sill+(h-.06)/2,w-.1,h-.06,.05,K.door,'gloss');
 // Two raised panels, the letter slot between them (its flap brass), the lever and the lock.
 for(const z of [sill+.55,sill+1.55])at(mid,z,w-.32,.62,.065,0x6a4c36);
 at(mid,sill+1.05,.3,.05,.07,0xb8913f,'metal');
 const hx=o.to-.16;at(hx,sill+1.0,.04,.04,.12,0xc9cdd0,'metal');at(hx-.06,sill+1.0,.14,.025,.03,0xc9cdd0,'metal');at(hx,sill+1.12,.035,.06,.08,0xc9cdd0,'metal');
 // The porch's stone step, and the concrete hood over it.
 const P=HOUSE_PORCH;
 drawnBlock(kit,[P.x[0],P.y[0],HOUSE_SITE.grade],[P.x[1],P.y[1],HOUSE_SITE.porch],K.stone);
 drawnBlock(kit,[P.hood.x[0],P.hood.y[0],P.hood.z],[P.hood.x[1],P.hood.y[1],P.hood.z+.12],K.roofSlab);
 drawnBlock(kit,[P.hood.x[0],P.hood.y[0]-.02,P.hood.z-.03],[P.hood.x[1],P.hood.y[0],P.hood.z+.12],K.band);
 // A porch light beside the door.
 const [lx,ly,lz]=houseLocal(o.from-.35,-.08,1.95);
 kit.box(.14,.2,.12,lx,ly,lz,0xf3e7c4,{finish:'lamp'});kit.box(.17,.04,.15,lx,ly+.12,lz,0x3a3632);
}

/**
 * The roof (finding F10): the drawn slab, 200 mm, 400 mm over the walls on every side, and on it a hipped roof of red
 * tile, equal pitches rising from the slab's edge to a ridge at HOUSE_SITE.ridge, the ridge and hips pointed in lime,
 * and a shisa on the ridge looking down the path to the gate.
 */
function roof(kit){
 const S=HOUSE_SITE.roofSlab,o=S.overhang;
 drawnBlock(kit,[-o,-o,S.z0],[12+o,10+o,S.z1],K.roofSlab);
 const w=12+2*o,d=10+2*o,rise=HOUSE_SITE.ridge-S.z1,ridgeHalf=(w-d)/2;
 const [cx,cy,cz]=houseLocal(6,5,S.z1);
 kit.hipRoof(w,d,rise,cx,cy,cz,K.tile,{overhang:0,ridgeFrac:ridgeHalf/(w/2),finish:'tile'});
 const top=[[cx-ridgeHalf,cy+rise+.03,cz],[cx+ridgeHalf,cy+rise+.03,cz]];
 kit.rod(top[0],top[1],.1,K.lime,{segments:6});
 for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])kit.rod([cx+sx*w/2,cy+.04,cz+sz*d/2],top[sx<0?0:1],.07,K.lime,{segments:5});
 // The eave line pointed in lime along the front and back.
 for(const sz of [-1,1])kit.box(w+.04,.07,.07,cx,cy+.02,cz+sz*d/2,K.lime);
 shisa(kit,cx,cy+rise+.08,cz+.2,0,1.3);
}

/** The stair house over D-BEXT: concrete walls, a flat roof with a drip, its door to the yard (F9). */
function stairHouse(kit,solid){
 const S=HOUSE_STAIR_HOUSE,t=S.wall,g=HOUSE_SITE.grade,top=S.top;
 const [x0,x1]=S.x,[y0,y1]=S.y;
 // Its walls from the yard up: east, west and south (the house's south face is its back).
 drawnBlock(kit,[x0,y0,g],[x0+t,y1,top],K.wall);drawnBlock(kit,[x1-t,y0,g],[x1,y1,top],K.wall);
 drawnBlock(kit,[x0+t,y0,g],[S.door[0],y0+t,top],K.wall);drawnBlock(kit,[S.door[1],y0,g],[x1-t,y0+t,top],K.wall);
 drawnBlock(kit,[S.door[0],y0,S.landing+2],[S.door[1],y0+t,top],K.wall);
 // The roof slab, oversailing 150 mm, and the door: a steel leaf with a raised threshold against the rain.
 drawnBlock(kit,[x0-.15,y0-.15,top],[x1+.15,y1,top+.15],K.roofSlab);
 drawnBlock(kit,[S.door[0],y0+.05,S.landing],[S.door[1],y0+.12,S.landing+2],K.steel,'metal');
 drawnBlock(kit,[S.door[0],y0-.1,g],[S.door[1],y0+.2,S.landing],K.stone);
 const [hx,hy,hz]=houseLocal(S.door[1]-.12,y0-.01,S.landing+1);kit.box(.12,.03,.04,hx,hy,hz,0xc9cdd0,{finish:'metal'});
 // A sign on the door: 地下 (basement).
 const [sx,sy,sz]=houseLocal((S.door[0]+S.door[1])/2,y0-.005,S.landing+1.55);kit.box(.3,.12,.01,sx,sy,sz,0xf3efe4);
 const [a0,,c0]=houseLocal(x0,y1,0),[a1,,c1]=houseLocal(x1,y0,0);
 solid(kit.rect(a0,a1,c0,c1,Y(top)+.2,'johansson-house-stair-house'));
}

/** The window well outside W-B1: a concrete well under a polycarbonate cover on a steel frame, a kerb round it (F9). */
function windowWell(kit,solid){
 const W=HOUSE_WINDOW_WELL,g=HOUSE_SITE.grade;
 drawnBlock(kit,[W.x[0]-.1,W.y[0]-.1,g],[W.x[1],W.y[1]+.1,g+.1],K.plinth);
 drawnBlock(kit,[W.x[0]-.05,W.y[0]-.05,g+.1],[W.x[1],W.y[1]+.05,g+.13],K.steel,'metal');
 drawnBlock(kit,[W.x[0],W.y[0],g+.11],[W.x[1],W.y[1],g+.135],K.cover,'gloss');
 const [a0,,c0]=houseLocal(W.x[0]-.1,W.y[1]+.1,0),[a1,,c1]=houseLocal(W.x[1],W.y[0]-.1,0);
 solid(kit.rect(a0,a1,c0,c1,.3,'johansson-house-window-well'));
}
