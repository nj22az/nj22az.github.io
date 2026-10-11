import {FERRY_SHIP,FERRY_HEIGHTS} from './ferry-ship.js';

/**
 * The Minato Maru's houses and casings as she is walked (ferry batch 6b; docs/FERRY-AUDIT.md): one list of what is
 * built, read by the model (ferry-model.js draws it) and by the walk (ferry-walk.js stands people on its floors and
 * stops them at its walls), so what you see and where you can go never disagree.
 *
 * The way up from the car deck: the walkway beside casing P to stair P's door (casing P, shipyard z 11.3–12.3), the
 * stair rising aft at 48° in the casing to the lobby (z 6–9.5, full breadth), whose stair heads P and S are its wings.
 * From the lobby: aft through its door to the open deck and up its two ladders to the bridge deck's aft platform;
 * forward along the corridor between the toilets, up two steps into the carpet room, down two into the saloon. From the
 * saloon's cross passage (z 16.5–17.6) the side doors give onto the walkways, and at the walkways' forward ends a
 * ladder rises to each bridge wing, whose door opens into the wheelhouse.
 *
 * Model frame (ferry-model.js): +z forward, +x to port, y up from her laden waterline. Every box is [x0,y0,z0]–[x1,y1,z1].
 */
const SH=FERRY_SHIP,H=FERRY_HEIGHTS,HALF=SH.length/2,HB=SH.beam/2;
const Z=zy=>zy-HALF,Y=yk=>yk-SH.draft;
const CAR=Y(H.carDeck),PASS=Y(H.passengerDeck),BRIDGE=Y(H.bridgeDeck),COMPASS=Y(H.compassDeck);
const WHITE=0xeeeae0,CREAM=0xece4d2,TEAL=0x2f6f74,DOOR=0x5d6b6a,DARK=0x2a2f31,STEEL=0x7d8586,DECKGREEN=0x6f7d6c,
 VINYL=0xc8c0aa,CARPET=0x6f8a63,SALOON=0x5d7189,MOQUETTE=0x3e5d85,TEAK=0x8d6f4c,ORANGE=0xe0702a,YELLOW=0xe0b93a,RED=0xc2412f;

/** Wall thickness, and the heights inside the passenger deckhouse. */
const T=.08,CEIL=BRIDGE-.25;
/**
 * The plan. The lobby (z 6–9.5) is the deckhouse's full breadth, out to her sides (x ±4.1), its wings the stair heads;
 * forward of it the house is 6.8 m wide (x ±3.4) with a 0.7 m walkway each side to the rail.
 */
export const FERRY_HOUSE=Object.freeze({
 aft:Z(6),lobbyFore:Z(9.5),toiletsFore:Z(11.5),carpetFore:Z(16.5),fore:Z(23),
 lobbyHalf:HB-.1,half:3.4,ceiling:CEIL,
 /** The saloon's cross passage at its aft end, where its side doors open onto the walkways. */
 crossFore:Z(17.6),sideDoor:Z(17.05),
 /** The corridor between the toilets, and the carpet room's steps (two of 0.15 m). */
 corridor:.6,carpet:.3,
 /** The bridge house (crew's rooms aft of the wheelhouse), and the wheelhouse. */
 bridgeHalf:3,wheelhouseAft:Z(19.5),houseTop:COMPASS-.2,
 /** The open deck's platform under the bridge deck's aft end, and its two ladders. */
 platformAft:Z(6)-1.2,ladderX:1.15,
});
const F=FERRY_HOUSE,LW=F.lobbyHalf,DW=F.half,DH0=F.aft,DH1=F.fore,LB1=F.lobbyFore,TB1=F.toiletsFore,CR1=F.carpetFore;
const BH=F.bridgeHalf,WH0=F.wheelhouseAft,PF0=F.platformAft;
/** The casings (car deck to the passenger deck), and stair P's and S's place in them. */
const CAS0=Z(3),CAS1=Z(20),CAS_IN=3.1,CAS_OUT=HB-.03,CAS_TOP=PASS-.25;
export const FERRY_STAIRS=Object.freeze({
 /** The flight: its foot on the car deck at z 11.3, its head at the lobby floor at z 7.4; 22 risers of 0.2 m. */
 foot:Z(11.3),head:Z(7.4),x:Object.freeze([3.16,HB-.09]),risers:22,
 /** The door in the casing's inboard face, and the casing's end forward of the stair. */
 door:Object.freeze([Z(11.35),Z(12.25)]),wellFore:Z(12.3),
 /** The well's opening in the passenger deck: the flight's head to where the stair passes under the deck with headroom. */
 opening:Object.freeze([Z(7.4),Z(9.4)]),
});
const S=FERRY_STAIRS;
/** The gangway passage through casing P (ferry-model.js GATE). */
const GATE_FROM=Z(13.5),GATE_TO=Z(14.5);
/** The ladder from each walkway up to its bridge wing: its foot on the walkway, its head on the wing's aft edge. */
export const FERRY_WING_LADDER=Object.freeze({x:3.75,foot:F.crossFore,head:WH0});

const sorted=(a,b)=>a<b?[a,b]:[b,a];
/**
 * Everything, built once: `boxes` ({a, b, hex, cls, solid, camera}), `bars` ({a, b, r, hex}), `glass` ({size, pos, rot})
 * and `floors` ({id, x, z, y | [y at z0, y at z1], inside(x, z, r)}). `solid` boxes stop people; `camera` boxes stop the lens.
 * A floor holds a person whose centre is over it and `inside` agrees; where one floor's `inside` keeps a person's
 * radius off a wall, the next floor (a doorway's sill) reaches back that far, so a doorway is never a gap.
 */
export const FERRY_INTERIOR=(()=>{
 const boxes=[],bars=[],glass=[],floors=[];
 const box=(a,b,hex,o={})=>{boxes.push(Object.freeze({a:Object.freeze(a),b:Object.freeze(b),hex,cls:o.cls||'paint',solid:o.solid!==false,camera:o.camera??o.solid!==false,draw:o.draw!==false,name:o.name||null}));};
 const deco=(a,b,hex,o={})=>box(a,b,hex,{...o,solid:false,camera:false});
 const bar=(a,b,r,hex,cls='metal')=>bars.push(Object.freeze({a:Object.freeze(a),b:Object.freeze(b),r,hex,cls}));
 const pane=(size,pos,rot=[0,0,0])=>glass.push(Object.freeze({size:Object.freeze(size),pos:Object.freeze(pos),rot:Object.freeze(rot)}));
 const floor=(id,x,z,y,inside=null)=>floors.push(Object.freeze({id,x:Object.freeze(x),z:Object.freeze(z),y,inside}));
 /**
  * A wall along x (at z between t0 and t1) or along z (at x between t0 and t1), from s0 to s1 and y0 to y1, with
  * openings {s0, s1, y0, y1, glass}: doors and windows are holes in it, glazed where they are windows.
  */
 function wall(along,s0,s1,t0,t1,y0,y1,openings=[],hex=WHITE){
  const cuts=[...new Set([s0,s1,...openings.flatMap(o=>[o.s0,o.s1])])].filter(c=>c>=s0&&c<=s1).sort((a,b)=>a-b);
  const put=(a0,a1,b0,b1)=>{if(a1-a0<1e-4||b1-b0<1e-4)return;along==='x'?box([a0,b0,t0],[a1,b1,t1],hex):box([t0,b0,a0],[t1,b1,a1],hex);};
  for(let i=0;i<cuts.length-1;i++){
   const c0=cuts[i],c1=cuts[i+1],o=openings.find(o=>o.s0<=c0+1e-6&&o.s1>=c1-1e-6);
   if(!o){put(c0,c1,y0,y1);continue;}
   put(c0,c1,y0,o.y0);put(c0,c1,o.y1,y1);
   if(o.glass){const m=(c0+c1)/2,t=(t0+t1)/2,h=o.y1-o.y0;pane(along==='x'?[c1-c0,h,.03]:[.03,h,c1-c0],along==='x'?[m,o.y0+h/2,t]:[t,o.y0+h/2,m]);}
  }
 }
 const win=(c,w=.92,y=PASS+1.55,h=.75)=>({s0:c-w/2,s1:c+w/2,y0:y-h/2,y1:y+h/2,glass:true});
 /** A doorway `w` wide centred at `c`, from below the floor at `y` to `h` over it. */
 const doorAt=(c,w,y,h=2)=>({s0:c-w/2,s1:c+w/2,y0:y-1,y1:y+h});

 // ---- The casings, car deck to the passenger deck's underside: stair P and S hollow in them, the gangway passage
 // through P. The rest is solid (uptakes, the engine-room entrances, stores, the changing room).
 for(const s of [1,-1]){
  const X=sorted(s*CAS_IN,s*CAS_OUT),pieces=s>0?[[CAS0,S.head],[S.wellFore,GATE_FROM],[GATE_TO,CAS1]]:[[CAS0,S.head],[S.wellFore,CAS1]];
  for(const [z0,z1] of pieces)box([X[0],CAR,z0],[X[1],CAS_TOP,z1],WHITE,{name:'casing'});
  // The stairwell's walls: inboard, with the stair's door; outboard against her side.
  wall('z',S.head,S.wellFore,...sorted(s*CAS_IN,s*(CAS_IN+.06)),CAR,CAS_TOP,[doorAt((S.door[0]+S.door[1])/2,S.door[1]-S.door[0],CAR)]);
  box([Math.min(s*(CAS_OUT-.06),s*CAS_OUT),CAR,S.head],[Math.max(s*(CAS_OUT-.06),s*CAS_OUT),CAS_TOP,S.wellFore],WHITE);
  // The door's frame in teal, and its leaf hooked back against the casing's face, aft of it.
  const fx=sorted(s*(CAS_IN-.04),s*(CAS_IN+.02));
  for(const z of S.door)deco([fx[0],CAR,z-.04],[fx[1],CAR+2,z+.04],TEAL);
  deco([fx[0],CAR+1.96,S.door[0]],[fx[1],CAR+2.04,S.door[1]],TEAL);
  box([Math.min(s*(CAS_IN-.06),s*(CAS_IN-.02)),CAR+.02,S.door[0]-.9],[Math.max(s*(CAS_IN-.06),s*(CAS_IN-.02)),CAR+1.98,S.door[0]-.05],DOOR,{name:'stair door leaf'});
  // A sign over the door: 客室 / Passenger saloon, up.
  deco([Math.min(s*(CAS_IN-.03),s*(CAS_IN-.01)),CAR+2.12,S.door[0]+.05],[Math.max(s*(CAS_IN-.03),s*(CAS_IN-.01)),CAR+2.42,S.door[1]-.05],0x24585c);
  // The flight: treads and risers, its stringers, and a hand rail on each side.
  const dz=(S.foot-S.head)/S.risers,dy=(PASS-CAR)/S.risers,[x0,x1]=sorted(s*S.x[0],s*S.x[1]);
  for(let i=0;i<S.risers;i++){const y=CAR+(i+1)*dy,z=S.foot-(i+1)*dz;deco([x0+.02,y-.04,z],[x1-.02,y,z+dz+.02],0x9aa3a2,{cls:'metal'});deco([x0+.02,y-dy,z+dz-.02],[x1-.02,y-.04,z+dz],0x7d8586,{cls:'metal'});}
  for(const x of [x0+.03,x1-.03]){bar([x,CAR,S.foot],[x,PASS,S.head],.05,DARK);bar([x,CAR+.9,S.foot+.1],[x,PASS+.9,S.head],.022,YELLOW,'paint');}
  // The walking line runs half a riser over the line of the nosings, so the feet are never more than half a riser
  // off a tread.
  floor('stair-'+(s>0?'p':'s'),[x0,x1],[S.head,S.foot],[PASS+dy/2,CAR+dy/2],(x,z,r)=>Math.abs(x-(x0+x1)/2)<=(x1-x0)/2-r+.06);
 }
 // The gangway passage's deckhead and its walls (casing P's two blocks either side are its walls: above).
 box([CAS_IN,CAR+2,GATE_FROM],[CAS_OUT,CAS_TOP,GATE_TO],WHITE,{name:'passage deckhead'});

 // ---- The passenger deck: its slab over the car deck, cut open over the two stairs.
 {const y0=PASS-.25,PD0=-HALF,PD1=DH1,O=S.opening,xin=CAS_IN,xo=HB-.02;
  const slab=(x0,x1,z0,z1)=>{box([x0,y0,z0],[x1,PASS,z1],WHITE,{solid:false,camera:true,name:'passenger deck'});deco([x0+.04,y0-.005,z0+.03],[x1-.04,y0,z1-.03],0xc9c7bd);};
  slab(-xin,xin,PD0,PD1);
  for(const s of [1,-1]){const X=sorted(s*xin,s*xo);slab(X[0],X[1],PD0,O[0]);slab(X[0],X[1],O[1],PD1);}
  // The open deck's planking colour, and the walkways'.
  deco([-(HB-.1),PASS,PD0+.05],[HB-.1,PASS+.005,DH0],DECKGREEN);
  for(const s of [1,-1]){const X=sorted(s*DW,s*(HB-.1));deco([X[0],PASS,LB1],[X[1],PASS+.005,PD1-.05],DECKGREEN);}
 }

 // ---- The passenger deckhouse: lobby (full breadth), toilets, carpet room, saloon.
 const top=CEIL;
 // Aft wall: the lobby's double door onto the open deck in the middle, a window either side.
 wall('x',-LW,LW,DH0-T/2,DH0+T/2,PASS,top,[{s0:-.6,s1:.6,y0:PASS-1,y1:PASS+2},win(-2.4,.85),win(2.4,.85)]);
 for(const s of [1,-1]){
  const X=sorted(s*(LW-T),s*LW),XH=sorted(s*(DW-T),s*DW);
  // The lobby's sides at her sides, a window over each stair; the step in to the house's sides at z 9.5.
  wall('z',DH0,LB1,...X,PASS,top,[win(Z(6.85)),win(Z(8.7))]);
  wall('x',...sorted(s*DW,s*LW),LB1-T/2,LB1+T/2,PASS,top);
  // The house's sides, windows all along, the saloon's side door onto the walkway.
  const wins=[];for(let z=LB1+.7;z<DH1-.5;z+=1.15){if(Math.abs(z-F.sideDoor)<.95||(z>TB1-.1&&z<TB1+.1))continue;wins.push(win(z));}
  wall('z',LB1,DH1,...XH,PASS,top,[{s0:F.sideDoor-.42,s1:F.sideDoor+.42,y0:PASS-1,y1:PASS+2},...wins]);
  // The side door's leaf, hooked back against the house aft of it, outside.
  box([Math.min(s*DW,s*(DW+.04)),PASS+.02,F.sideDoor-.42-.86],[Math.max(s*DW,s*(DW+.04)),PASS+1.96,F.sideDoor-.44],DOOR,{name:'saloon side door'});
 }
 // The forward wall over the car deck: six windows looking over the bow.
 wall('x',-DW,DW,DH1-T,DH1,PASS,top,[...[0,1,2,3,4,5].map(i=>win(-2.85+i*1.14,.95,PASS+1.5,.85))]);
 // The deckhead: the bridge deck's underside over the house, and its lights.
 box([-(LW+.05),top,DH0-.05],[LW+.05,BRIDGE,LB1],WHITE,{solid:false,camera:true,name:'deckhouse top'});
 box([-(DW+.05),top,LB1],[DW+.05,BRIDGE,DH1+.05],WHITE,{solid:false,camera:true,name:'deckhouse top'});
 for(const [x,z] of [[0,Z(7.7)],[-2.2,Z(7.7)],[2.2,Z(7.7)],[0,Z(10.5)],[-1.8,Z(13.2)],[1.8,Z(13.2)],[-1.8,Z(15.2)],[1.8,Z(15.2)],[-1.8,Z(18.6)],[1.8,Z(18.6)],[-1.8,Z(21.2)],[1.8,Z(21.2)]])deco([x-.5,top-.04,z-.12],[x+.5,top,z+.12],0xf6f1e2);

 // The lobby: vinyl floor; the stair wells' rails; the purser's window (starboard) and the vending corner (port)
 // against the toilets' aft faces; a bench either side of the aft door; the timetable and fares on the aft wall.
 deco([-(LW-T),PASS+.003,DH0+T/2],[LW-T,PASS+.008,LB1-T/2],VINYL);
 for(const s of [1,-1]){
  const xr=s*(CAS_IN-.02);bar([xr,PASS,S.opening[0]],[xr,PASS+1.05,S.opening[0]],.025,WHITE,'paint');
  for(const h of [.5,1.05])bar([xr,PASS+h,S.opening[0]],[xr,PASS+h,LB1-T/2],.025,WHITE,'paint');
  box([Math.min(xr-.03,xr+.03),PASS,S.opening[0]],[Math.max(xr-.03,xr+.03),PASS+1.08,LB1-T/2],WHITE,{camera:false,name:'stair well rail'});
  deco([Math.min(xr-.03,xr+.03),PASS+.02,S.opening[0]],[Math.max(xr-.03,xr+.03),PASS+.06,LB1-T/2],WHITE);
  // A bench along the aft wall.
  const bx=sorted(s*.95,s*2.75);box([bx[0],PASS,DH0+T/2],[bx[1],PASS+.45,DH0+.5],TEAK,{name:'lobby bench'});deco([bx[0],PASS+.45,DH0+T/2],[bx[1],PASS+.95,DH0+.12],TEAK);
 }
 // Purser's window: a counter with a glazed hatch and its sign.
 box([-3.0,PASS,LB1-.55],[-1.95,PASS+1.05,LB1-T/2],0x8a7356,{name:'purser counter'});deco([-3.02,PASS+1.05,LB1-.6],[-1.93,PASS+1.09,LB1-T/2],0xb89a6e);
 pane([1.0,.8,.02],[-2.475,PASS+1.55,LB1-T/2-.02]);deco([-3.0,PASS+2.0,LB1-T/2-.03],[-1.95,PASS+2.25,LB1-T/2],0x24585c);
 // Vending corner: two drink machines and the hot-water dispenser for cup noodles.
 box([1.95,PASS,LB1-.75],[2.45,PASS+1.8,LB1-T/2],RED,{name:'drink machine'});box([2.5,PASS,LB1-.75],[3.0,PASS+1.8,LB1-T/2],0x2f5e9a,{name:'drink machine'});
 for(const x of [2.2,2.75]){deco([x-.18,PASS+.9,LB1-.77],[x+.18,PASS+1.5,LB1-.75],0xdfe8ee);deco([x-.15,PASS+.25,LB1-.77],[x+.15,PASS+.4,LB1-.75],DARK);}
 deco([-1.5,PASS+1.3,DH0+T/2],[1.5,PASS+1.95,DH0+T/2+.03],0xf4f0e2);deco([-1.45,PASS+1.88,DH0+T/2+.03],[1.45,PASS+1.95,DH0+T/2+.04],TEAL);
 floor('lobby',[-(LW-T/2),LW-T/2],[DH0,LB1],PASS,(x,z,r)=>{
  if(Math.abs(x)>LW-T-r||z<DH0+T/2+r||z>LB1-T/2-r)return false;
  // The stair wells, behind their rails; the flight's head joins the lobby at z 7.4.
  if(Math.abs(x)>CAS_IN-.05-r&&z>S.opening[0]+.03)return false;
  return true;
 });

 // The toilets either side of the corridor: men's to port, women's to starboard, closed. Their doors on the lobby.
 for(const s of [1,-1]){
  const X=sorted(s*F.corridor,s*(DW-T));
  box([X[0],PASS,LB1-T/2],[X[1],top,TB1+T/2],CREAM,{name:s>0?'men’s toilet':'women’s toilet'});
  const dx=sorted(s*1.05,s*1.8);deco([dx[0],PASS+.02,LB1-T/2-.02],[dx[1],PASS+1.95,LB1-T/2],DOOR);
  deco([s*1.425-.12,PASS+2.05,LB1-T/2-.03],[s*1.425+.12,PASS+2.29,LB1-T/2],s>0?0x2f5e9a:RED);
 }
 deco([-F.corridor,PASS+.003,LB1-T/2],[F.corridor,PASS+.008,TB1+T/2],VINYL);
 floor('corridor',[-F.corridor,F.corridor],[LB1-.5,TB1+.16],PASS,(x,z,r)=>Math.abs(x)<=F.corridor-r+.08);

 // The carpet room: a platform 0.3 m up, carpeted, two steps at each end of the middle; the shoe shelves at the aft
 // step; life-jacket lockers and the blanket rack along the sides; a television on its bracket over the forward door.
 {const P=F.carpet,c0=TB1+T/2,c1=CR1-T/2,st=.15;
  box([-(DW-T),PASS,c0+2*st],[DW-T,PASS+P,c1-2*st],CARPET,{solid:false,camera:false,name:'carpet platform'});
  for(const [z0,z1] of [[c0+st,c0+2*st],[c1-2*st,c1-st]])deco([-F.corridor,PASS,z0],[F.corridor,PASS+P/2,z1],0x8a7356);
  for(const s of [1,-1]){
   const X=sorted(s*(F.corridor+.05),s*(DW-T));
   box([X[0],PASS,c0],[X[1],PASS+P,c0+2*st],0x8a7356,{name:'shoe shelf'});box([X[0],PASS+P,c0],[X[1],PASS+P+.15,c0+.3],0x8a7356,{name:'shoe shelf'});
   const L=sorted(s*(DW-T-.45),s*(DW-T));box([L[0],PASS+P,Z(12.6)],[L[1],PASS+P+1.0,Z(14.4)],ORANGE,{name:'life-jacket locker'});
   box([L[0],PASS+P,Z(14.8)],[L[1],PASS+P+1.2,Z(15.9)],0xd8cdb6,{name:'blanket rack'});
   for(let i=0;i<4;i++)deco([s*(1.2+i*.45)-.18,PASS+P,Z(13.0)+(i%2)*.2],[s*(1.2+i*.45)+.18,PASS+P+.1,Z(13.0)+(i%2)*.2+.45],[0xd9c27a,0x8fb3c9,0xc98f7a,0xa7c08a][i]);
  }
  box([-.45,top-.55,c1-.4],[.45,top-.05,c1],DARK,{solid:false,camera:true,name:'television'});
  floor('carpet-step-aft',[-F.corridor,F.corridor],[c0+st,c0+2*st],PASS+P/2,(x,z,r)=>Math.abs(x)<=F.corridor-r+.08);
  floor('carpet-step-fore',[-F.corridor,F.corridor],[c1-2*st,c1-st],PASS+P/2,(x,z,r)=>Math.abs(x)<=F.corridor-r+.08);
  floor('carpet-room',[-(DW-T),DW-T],[c0+2*st,c1-2*st],PASS+P,(x,z,r)=>Math.abs(x)<=DW-T-r&&(Math.abs(x)<=F.corridor+.05||z>c0+2*st+r-.05)&&(Math.abs(x)<=F.corridor+.05||z<c1-2*st-r+.05));
  // The floor at the deck's level in the doorways, between the toilets' faces and the first step, and the last step and the saloon.
  floor('carpet-door-aft',[-F.corridor,F.corridor],[TB1-.1,c0+st+.02],PASS,(x,z,r)=>Math.abs(x)<=F.corridor-r+.08);
  floor('carpet-door-fore',[-F.corridor,F.corridor],[c1-st-.02,CR1+.1],PASS,(x,z,r)=>Math.abs(x)<=F.corridor-r+.08);
 }
 // The partition between the carpet room and the saloon, its doorway in the middle.
 wall('x',-DW+T,DW-T,CR1-T/2,CR1+T/2,PASS,top,[{s0:-F.corridor,s1:F.corridor,y0:PASS-1,y1:PASS+2}],CREAM);

 // The saloon: seven rows of three moquette seats each side at 0.85 m, facing forward, an aisle down the middle; the
 // cross passage at its aft end to the side doors; muster station A's sign on the forward wall.
 deco([-(DW-T),PASS+.003,CR1+T/2],[DW-T,PASS+.008,DH1-T],SALOON);
 for(let k=0;k<7;k++){const z0=F.crossFore+k*.85;
  for(const s of [1,-1]){const X=sorted(s*.7,s*(DW-T-.06));
   box([X[0],PASS,z0],[X[1],PASS+.45,z0+.55],MOQUETTE,{name:'saloon seats'});
   deco([X[0],PASS+.45,z0],[X[1],PASS+1.05,z0+.12],MOQUETTE);
   for(let i=0;i<4;i++){const x=X[0]+(X[1]-X[0])*i/3;deco([x-.03,PASS+.45,z0+.12],[x+.03,PASS+.62,z0+.5],0x2c3e57);}
  }}
 deco([-.9,PASS+1.95,DH1-T-.02],[.9,PASS+2.25,DH1-T],0x2a7a4a);
 floor('saloon',[-(DW-T),DW-T],[CR1-.1,DH1-T],PASS,(x,z,r)=>{
  if(Math.abs(x)>DW-T-r||z>DH1-T-r)return false;
  // The seats: the aisle between them and the cross passage aft of them are the floor.
  if(Math.abs(x)>.7-r&&z>F.crossFore-r)return false;
  // The partition's doorway.
  if(z<CR1+T/2+r&&Math.abs(x)>F.corridor-r+.08)return false;
  return true;
 });
 // The side doors' sills, from the saloon's cross passage out to the walkways.
 for(const s of [1,-1])floor('side-door-'+(s>0?'p':'s'),sorted(s*(DW-T-.5),s*(DW+.45)),[F.sideDoor-.42,F.sideDoor+.42],PASS,(x,z,r)=>Math.abs(z-F.sideDoor)<=.42-r+.06);

 // ---- The walkways either side of the house, the rail at her side; the ladder up to the bridge wing at their
 // forward ends; the liferafts in their cradles outboard of the rail.
 for(const s of [1,-1]){
  const X=sorted(s*DW,s*(HB-.08)),L=FERRY_WING_LADDER;
  floor('walkway-'+(s>0?'p':'s'),X,[LB1,L.foot+.02],PASS,(x,z,r)=>Math.abs(x)>=DW+r-.02&&Math.abs(x)<=HB-.1-r+.04&&z>=LB1+T/2+r);
  // The ladder: steep (53°), its stringers and treads, hand rails to the wing.
  const lx=s*L.x,rise=BRIDGE-PASS,run=L.head-L.foot,n=13;
  for(const k of [-.29,.29])bar([lx+k,PASS,L.foot],[lx+k,BRIDGE,L.head],.03,STEEL);
  for(let i=1;i<n;i++){const f=i/n;deco([lx-.28,PASS+rise*f-.03,L.foot+run*f-.08],[lx+.28,PASS+rise*f,L.foot+run*f+.08],STEEL,{cls:'metal'});}
  for(const k of [-.29,.29])bar([lx+k,PASS+.9,L.foot],[lx+k,BRIDGE+.9,L.head],.02,YELLOW,'paint');
  floor('wing-ladder-'+(s>0?'p':'s'),[lx-.29,lx+.29],[L.foot,L.head],[PASS,BRIDGE],(x,z,r)=>Math.abs(x-lx)<=.12);
  for(const zy of [12,14.5]){const lz=Z(zy);bar([s*(HB+.12),PASS+.55,lz-.55],[s*(HB+.12),PASS+.55,lz+.55],.28,WHITE,'paint');
   const X=sorted(s*(HB-.1),s*(HB+.38));for(const dz of [-.4,.4])deco([X[0],PASS+.24,lz+dz-.04],[X[1],PASS+.32,lz+dz+.04],STEEL,{cls:'metal'});}
 }

 // ---- The open deck aft: benches under the awning, the funnels, the liferaft (port), the rescue boat and its davit
 // (starboard), the platform under the bridge deck's aft end and its two ladders.
 {const top=PASS+2.35;
  for(const zy of [1,2.6])for(const x of [-1.45,1.45])box([x-1.2,PASS,Z(zy)-.23],[x+1.2,PASS+.9,Z(zy)+.23],TEAK,{camera:false,solid:true,name:'open-deck bench',draw:false});
  box([3.22,PASS,Z(2.7)-.6],[3.68,PASS+.5,Z(2.7)+.6],TEAK,{camera:false,name:'side bench',draw:false});
  for(const x of [-2.35,2.35])for(const z of [Z(.4),Z(3.4)])box([x-.05,PASS,z-.05],[x+.05,top,z+.05],STEEL,{camera:false,name:'awning post',draw:false});
  box([-2.5,top,Z(.4)-.1],[2.5,top+.04,Z(3.4)+.1],0xe9e4d4,{solid:false,camera:true,name:'awning',draw:false});
  // The funnels are drawn by the model (round); here, the space they take.
  const FZ=Z(4.9);for(const s of [1,-1])box([Math.min(s*2.85,s*3.85),PASS,FZ-1],[Math.max(s*2.85,s*3.85),Y(H.funnelTop),FZ+1],TEAL,{name:'funnel',draw:false});
  box([3.25,PASS,Z(.55)],[3.85,PASS+.85,Z(1.65)],WHITE,{name:'liferaft',draw:false});
  box([-3.8,PASS,Z(.6)],[-2.55,PASS+1.05,Z(4.2)],ORANGE,{name:'rescue boat',draw:false});
  box([-4.0,PASS,Z(.45)-.1],[-3.8,PASS+3.3,Z(.45)+.1],STEEL,{name:'davit',draw:false});
  box([-.05,PASS,-HALF+.1],[.05,PASS+3.4,-HALF+.2],WHITE,{camera:false,name:'flagstaff',draw:false});
  for(const x of [-2.5,2.5])box([x-.07,PASS,PF0+.03],[x+.07,BRIDGE,PF0+.17],WHITE,{camera:false,name:'platform pillar',draw:false});
  box([-2.6,BRIDGE-.12,PF0],[2.6,BRIDGE,DH0],WHITE,{solid:false,camera:true,name:'bridge deck aft platform',draw:false});
  const LX=F.ladderX;
  floor('open-deck',[-(HB-.1),HB-.1],[-HALF+.1,DH0],PASS,(x,z,r)=>{
   if(Math.abs(x)>HB-.12-r||z<-HALF+.16+r||z>DH0-T/2-r&&Math.abs(x)>.6-r+.08)return false;
   // Under the ladders: their feet are where you step on.
   if(Math.abs(Math.abs(x)-LX)<.3+r&&z>PF0-1.4&&z<PF0+.25)return false;
   return true;
  });
  floor('lobby-door',[-.6,.6],[DH0-.5,DH0+.5],PASS,(x,z,r)=>Math.abs(x)<=.6-r+.08);
  for(const s of [1,-1]){const lx=s*LX;floor('platform-ladder-'+(s>0?'p':'s'),[lx-.28,lx+.28],[PF0-1.5,PF0+.02],[PASS,BRIDGE],(x,z,r)=>Math.abs(x-lx)<=.12);}
  floor('bridge-deck-aft',[-2.55,2.55],[PF0,DH0],BRIDGE,(x,z,r)=>{
   if(Math.abs(x)>2.55-r||z>DH0-.05-r)return false;
   if(z<PF0+.08+r&&Math.abs(Math.abs(x)-LX)>.3)return false;
   return true;
  });
 }

 // ---- The bridge deck: the crew's rooms (closed this batch) aft, the wheelhouse forward, the wings.
 box([-BH,BRIDGE,DH0],[BH,F.houseTop,WH0],WHITE,{name:'crew house'});
 for(const s of [1,-1]){
  const X=sorted(s*(BH-T),s*BH);
  for(const zy of [10.2,12.7,15.2,17.9])pane([.04,.5,.5],[s*(BH+.01),BRIDGE+1.45,Z(zy)]);
  // The wheelhouse's sides: the wing door (open, hooked back forward of it, inside) and two windows.
  wall('z',WH0,DH1,...X,BRIDGE,F.houseTop,[{s0:Z(19.6),s1:Z(20.4),y0:BRIDGE-1,y1:BRIDGE+1.95},win(Z(21.1),1.0,BRIDGE+1.4,.85),win(Z(22.2),.9,BRIDGE+1.4,.85)]);
  box([Math.min(s*(BH-T-.04),s*(BH-T)),BRIDGE+.02,Z(20.45)],[Math.max(s*(BH-T-.04),s*(BH-T)),BRIDGE+1.92,Z(21.2)],DOOR,{name:'wing door'});
  // The wing: dodger at her side, its console, the sidelight's screen.
  {const X=sorted(s*(HB-.1),s*(HB-.04));box([X[0],BRIDGE,WH0],[X[1],BRIDGE+1.1,DH1],WHITE,{name:'dodger',draw:false});}
  box([Math.min(s*(HB-.62),s*(HB-.28)),BRIDGE,DH1-.65],[Math.max(s*(HB-.62),s*(HB-.28)),BRIDGE+1.18,DH1-.35],STEEL,{name:'wing console',draw:false});
  floor('wing-'+(s>0?'p':'s'),sorted(s*(BH-.1),s*(HB-.1)),[WH0-.05,DH1-.04],BRIDGE,(x,z,r)=>{
   const a=Math.abs(x);if(a>HB-.1-r||z>DH1-.06-r)return false;
   // Aft, the wing ends at the ledge and the ladder's head.
   if(z<WH0+r&&Math.abs(a-FERRY_WING_LADDER.x)>.15)return false;
   // Into the wheelhouse only through the door.
   if(a<BH+r&&(z<Z(19.6)+r-.06||z>Z(20.4)-r+.06))return false;
   return true;
  });
 }
 // The wheelhouse's aft wall (the crew house's face) and forward wall with five raked windows.
 wall('x',-BH,BH,DH1-T,DH1,BRIDGE,F.houseTop,[...[0,1,2,3,4].map(i=>win(-2.36+i*1.18,1.05,BRIDGE+1.45,.95))]);
 deco([-(BH-T),BRIDGE+.003,WH0],[BH-T,BRIDGE+.008,DH1-T],0x8a6f55);
 // Inside: the console under the windows (radar, the engine and thruster levers, VHF, the telephone), the steering
 // stand, the master's chair, the chart table aft to starboard, the door to the crew's corridor (closed).
 box([-2.75,BRIDGE,DH1-.7],[2.75,BRIDGE+1.0,DH1-T],0x5c6466,{name:'wheelhouse console'});
 deco([-1.25,BRIDGE+1.0,DH1-.6],[-.55,BRIDGE+1.45,DH1-.2],DARK);deco([-1.15,BRIDGE+1.05,DH1-.62],[-.65,BRIDGE+1.4,DH1-.6],0x1f4a3a);
 for(const x of [.2,.4,.9])bar([x,BRIDGE+1.0,DH1-.45],[x,BRIDGE+1.22,DH1-.5],.018,x>.5?ORANGE:RED);
 deco([1.4,BRIDGE+1.0,DH1-.55],[1.9,BRIDGE+1.18,DH1-.25],DARK);
 box([-.25,BRIDGE,DH1-1.5],[.25,BRIDGE+.95,DH1-1.0],0x5c6466,{name:'steering stand'});
 bar([0,BRIDGE+1.05,DH1-1.5],[0,BRIDGE+1.05,DH1-1.62],.32,TEAK);
 box([.75,BRIDGE,DH1-1.75],[1.25,BRIDGE+1.15,DH1-1.25],0x4a3f36,{name:'master’s chair'});
 box([-2.9,BRIDGE,WH0+T/2],[-1.7,BRIDGE+.95,WH0+.85],TEAK,{name:'chart table'});deco([-2.85,BRIDGE+.95,WH0+.1],[-1.75,BRIDGE+.96,WH0+.8],0xe8e2cc);
 deco([-.45,BRIDGE+.02,WH0],[.45,BRIDGE+1.92,WH0+.02],DOOR);
 floor('wheelhouse',[-(BH-T),BH-T],[WH0,DH1-T],BRIDGE,(x,z,r)=>Math.abs(x)<=BH-T-r&&z>=WH0+T/2+r&&z<=DH1-T-r);
 floor('wing-door-p',[BH-T-.5,BH+.3],[Z(19.6),Z(20.4)],BRIDGE,(x,z,r)=>z>=Z(19.6)+r-.06&&z<=Z(20.4)-r+.06);
 floor('wing-door-s',[-(BH+.3),-(BH-T-.5)],[Z(19.6),Z(20.4)],BRIDGE,(x,z,r)=>z>=Z(19.6)+r-.06&&z<=Z(20.4)-r+.06);

 return Object.freeze({boxes:Object.freeze(boxes),bars:Object.freeze(bars),glass:Object.freeze(glass),floors:Object.freeze(floors)});
})();

/** Where the car deck is no floor: under the flights of stair P and S, inside the casings (up to the foot, where the stair takes over). */
export function underStair(x,z,r=0){return Math.abs(x)>CAS_IN-r&&z>S.head-r&&z<S.foot;}
export const FERRY_CASING_LIMITS=Object.freeze({aft:CAS0,fore:CAS1,inner:CAS_IN,outer:CAS_OUT,top:CAS_TOP});
