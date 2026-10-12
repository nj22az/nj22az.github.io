import {FERRY_SHIP,FERRY_HEIGHTS} from './ferry-ship.js';
import {JOHANSSON_MARINE,makerPlate,WORDMARK} from './johansson-marine.js';

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
const CAS0=Z(3),CAS1=Z(20),CAS_IN=2.75,CAS_OUT=HB-.03,CAS_TOP=PASS-.25;
export const FERRY_STAIRS=Object.freeze({
 /** The flight: its foot on the car deck at z 11.3, its head at the lobby floor at z 7.4; 22 risers of 0.2 m; 1.2 m clear (batch 6f). */
 foot:Z(11.3),head:Z(7.4),x:Object.freeze([CAS_IN+.06,HB-.09]),risers:22,
 /** The door in the casing's inboard face (1.2 m), and the casing's end forward of the stair's foot (starboard; to port the
  * foyer runs on to the gangway passage). */
 door:Object.freeze([Z(11.35),Z(12.55)]),wellFore:Z(12.6),
 /** The well's opening in the passenger deck: the flight's head to where the stair passes under the deck with headroom. */
 opening:Object.freeze([Z(7.4),Z(9.4)]),
});
const S=FERRY_STAIRS;
/**
 * The engine room (ferry batch 6c): shipyard z 8.5–14, floor plates 0.9 m over the keel, 1.9 m clear under the car deck.
 * (The general arrangement gave it z 5–14; the hull's counter rises aft of z 10.5, and at z 8 the bottom is already
 * above the floor plates' level, so its after end is at 8.5, the shafts running aft from there under the fresh-water
 * tanks.) Its way in is the casing P door at z 6.6–7.4 and a ladder down through a hatch in the car deck.
 */
export const FERRY_ENGINE_ROOM=Object.freeze({aft:Z(8.5),fore:Z(14),floor:Y(.9),deckhead:CAR-.2,side:3.98,
 entrance:Object.freeze([Z(6.25),Z(7.4)]),door:Object.freeze([Z(6.3),Z(7.4)]),
 /** The ladder: its head on the car deck at z 7.0, its foot on the floor plates at z 8.6; the hatch it goes down. */
 ladder:Object.freeze({x:Object.freeze([3.2,3.95]),head:Z(7),foot:Z(8.6)}),hatch:Object.freeze({x:Object.freeze([3.15,HB-.07]),z:Object.freeze([Z(7),Z(9)])}),
});
const ER=FERRY_ENGINE_ROOM;
/** The floors below the car deck, where the engines are heard: whoever stands on one wears ear defenders (game.js). */
export const BELOW_DECK_FLOORS=Object.freeze(['er-ladder','er-ladder-foot','engine-room','control-booth']);

/** The gangway passage through casing P (ferry-model.js GATE): 1.4 m wide, and the foyer from it aft to the foot of stair P. */
const GATE_FROM=Z(13.3),GATE_TO=Z(14.7);
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
 const boxes=[],bars=[],glass=[],floors=[],cyls=[],plates=[];
 const box=(a,b,hex,o={})=>{boxes.push(Object.freeze({a:Object.freeze(a),b:Object.freeze(b),hex,cls:o.cls||'paint',solid:o.solid!==false,camera:o.camera??o.solid!==false,draw:o.draw!==false,name:o.name||null}));};
 const deco=(a,b,hex,o={})=>box(a,b,hex,{...o,solid:false,camera:false});
 const bar=(a,b,r,hex,cls='metal')=>bars.push(Object.freeze({a:Object.freeze(a),b:Object.freeze(b),r,hex,cls}));
 const pane=(size,pos,rot=[0,0,0])=>glass.push(Object.freeze({size:Object.freeze(size),pos:Object.freeze(pos),rot:Object.freeze(rot)}));
 const floor=(id,x,z,y,inside=null)=>floors.push(Object.freeze({id,x:Object.freeze(x),z:Object.freeze(z),y,inside}));
 /** A cylinder (radius top, radius bottom, height) at pos, turned by rot (Euler YXZ): scenery only, never a solid. */
 const cyl=(rt,rb,h,pos,hex,o={})=>cyls.push(Object.freeze({rt,rb,h,pos:Object.freeze(pos),rot:Object.freeze(o.rot||[0,0,0]),hex,cls:o.cls||'metal',seg:o.seg||14,name:o.name||null}));
 /** A maker's plate or a label: lines of text on a plate w × h metres at pos, facing +z turned by rotY. */
 const plate=(lines,w,h,pos,rotY,o={})=>plates.push(Object.freeze({lines:Object.freeze(lines),w,h,pos:Object.freeze(pos),rotY,bg:o.bg||'#dcd8c8',fg:o.fg||'#1d2326',name:o.name||'maker’s plate'}));
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
 /** x0 to x1 from the centreline on side `s` (+1 port, −1 starboard), smaller first. */
 const S2=(s,x0,x1)=>sorted(s*x0,s*x1);

 // ---- The casings, car deck to the passenger deck's underside: stair P and S hollow in them, the gangway passage
 // through P. The rest is solid (uptakes, the engine-room entrances, stores, the changing room).
 for(const s of [1,-1]){
  const X=sorted(s*CAS_IN,s*CAS_OUT),pieces=s>0?[[CAS0,ER.entrance[0]],[GATE_TO,CAS1]]:[[CAS0,S.head],[S.wellFore,CAS1]];
  for(const [z0,z1] of pieces)box([X[0],CAR,z0],[X[1],CAS_TOP,z1],WHITE,{name:'casing'});
  // The stairwell's walls: inboard, with the stair's door; outboard against her side.
  wall('z',S.head,s>0?GATE_TO:S.wellFore,...sorted(s*CAS_IN,s*(CAS_IN+.06)),CAR,CAS_TOP,[doorAt((S.door[0]+S.door[1])/2,S.door[1]-S.door[0],CAR)]);
  box([Math.min(s*(CAS_OUT-.06),s*CAS_OUT),CAR,S.head],[Math.max(s*(CAS_OUT-.06),s*CAS_OUT),CAS_TOP,s>0?GATE_FROM:S.wellFore],WHITE);
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
  floor('stair-'+(s>0?'p':'s'),[x0,x1],[S.head,S.foot],[PASS+dy/2,CAR+dy/2],(x,z,r)=>Math.abs(x-(x0+x1)/2)<=(x1-x0)/2-r+.02);
 }
 // The gangway passage's and the foyer's deckhead, 2.2 m up, from forward of the stair's door to the passage's forward
 // wall (casing P's block forward of it is that wall; the stairwell's walls are the foyer's; over the stair's foot the
 // well is open to the casing's top).
 box([CAS_IN,CAR+2.2,S.wellFore],[CAS_OUT,CAS_TOP,GATE_TO],WHITE,{name:'passage deckhead'});

 // ---- The lower lobby (batch 6f): the car deck's level aft of the lanes, z 2.5–12.6 between the casings, under a
 // 2.5 m deckhead hung from the passenger deck. Its aft bulkhead (full breadth, a crew door to the mooring station),
 // its forward bulkhead (between the casings, two sliding fire doors onto the lanes, their leaves parked outboard),
 // the drivers' benches along the casings between the doors, the bicycle rack and the baggage shelf aft, the drink
 // machine and the safety plan forward, lifejacket lockers. The stairs' doors and the engine room's door open into it.
 {const LL0=Z(2.5),LL1=Z(12.6),TOP=CAR+2.5;
  wall('x',-(HB-.1),HB-.1,LL0-.04,LL0+.04,CAR,PASS-.02,[doorAt(0,1.0,CAR)]);
  for(const x of [-.54,.54])deco([x-.04,CAR,LL0-.06],[x+.04,CAR+2.02,LL0+.06],TEAL);
  box([.56,CAR+.02,LL0+.04],[1.5,CAR+1.98,LL0+.08],DOOR,{name:'mooring door leaf'});
  wall('x',-CAS_IN,CAS_IN,LL1-.04,LL1+.04,CAR,PASS-.02,[doorAt(1.0,1.1,CAR),doorAt(-1.0,1.1,CAR)]);
  for(const s of [1,-1]){
   for(const x of [s*.41,s*1.59])deco([x-.04,CAR,LL1-.06],[x+.04,CAR+2.06,LL1+.06],TEAL);
   deco([Math.min(s*.41,s*1.59),CAR+2.02,LL1-.06],[Math.max(s*.41,s*1.59),CAR+2.08,LL1+.06],TEAL);
   // The sliding leaf, parked outboard of its opening on the lobby side, on its track.
   box([Math.min(s*1.56,s*2.74),CAR+.03,LL1-.14],[Math.max(s*1.56,s*2.74),CAR+2.0,LL1-.08],DOOR,{name:'fire door leaf'});
   deco([Math.min(s*.4,s*2.74),CAR+2.1,LL1-.16],[Math.max(s*.4,s*2.74),CAR+2.16,LL1-.06],STEEL);
   // A bench along each casing between its doors (port: aft of the engine room's door and forward of it; starboard:
   // aft of the escape door and forward of the store's).
   for(const [z0,z1] of s>0?[[Z(3.2),Z(6.0)],[Z(7.7),Z(11.0)]]:[[Z(3.2),Z(6.0)],[Z(9.2),Z(11.0)]]){
    box([Math.min(s*(CAS_IN-.5),s*(CAS_IN-.06)),CAR,z0],[Math.max(s*(CAS_IN-.5),s*(CAS_IN-.06)),CAR+.45,z1],TEAK,{name:'drivers’ bench'});
    deco([Math.min(s*(CAS_IN-.14),s*(CAS_IN-.06)),CAR+.45,z0],[Math.max(s*(CAS_IN-.14),s*(CAS_IN-.06)),CAR+.95,z1],TEAK);
    for(const z of [z0+.1,z1-.1])deco([Math.min(s*(CAS_IN-.46),s*(CAS_IN-.1)),CAR,z-.03],[Math.max(s*(CAS_IN-.46),s*(CAS_IN-.1)),CAR+.42,z+.03],STEEL);}
  }
  // The deckhead, hung 2.5 m up, its light panels; the floor's vinyl.
  box([-CAS_IN,TOP,LL0],[CAS_IN,TOP+.2,LL1],0xd8d6cc,{solid:false,camera:true,name:'lower lobby deckhead'});
  for(const z of [Z(4),Z(7),Z(10)])for(const x of [-1.3,1.3])deco([x-.35,TOP-.03,z-.2],[x+.35,TOP,z+.2],0xf6f1e2);
  deco([-CAS_IN,CAR+.003,LL0+.06],[CAS_IN,CAR+.008,LL1-.06],VINYL);
  // The bicycle rack at the aft bulkhead, port of the crew door: two islanders' bicycles ride free.
  box([1.6,CAR,LL0+.1],[2.55,CAR+.05,LL0+.4],STEEL,{camera:false,name:'bicycle rack'});
  for(const x of [1.85,2.3]){deco([x-.03,CAR+.05,LL0+.12],[x+.03,CAR+.95,LL0+.18],STEEL);deco([x-.2,CAR+.3,LL0+.1],[x+.2,CAR+.34,LL0+1.7],0x3a4a6a);
   for(const z of [LL0+.4,LL0+1.4])bar([x,CAR+.3,z],[x,CAR+.3,z+.02],.3,DARK);}
  // The baggage shelf at the aft bulkhead, starboard, and the lifejacket lockers over it.
  box([-2.5,CAR,LL0+.1],[-.7,CAR+.9,LL0+.5],0x8a7356,{name:'baggage shelf'});deco([-2.5,CAR+1.4,LL0+.1],[-.7,CAR+2.0,LL0+.4],ORANGE);
  deco([-2.4,CAR+1.6,LL0+.4],[-.8,CAR+1.8,LL0+.41],0xf6f1e2);
  // The drink machine and the safety plan on the forward bulkhead, between the fire doors.
  box([-.25,CAR,LL1-.75],[.3,CAR+1.8,LL1-.08],RED,{name:'drink machine'});deco([-.2,CAR+.9,LL1-.77],[.25,CAR+1.5,LL1-.75],0xdfe8ee);
  deco([-.3,CAR+1.9,LL1-.1],[.3,CAR+2.3,LL1-.08],0xf4f0e2);deco([-.26,CAR+2.22,LL1-.11],[.26,CAR+2.28,LL1-.1],TEAL);
  // Lights in the way down: the engine room's sign is lit from the lobby's deckhead too.
  deco([CAS_IN-.5,TOP-.03,Z(6.85)-.2],[CAS_IN-.1,TOP,Z(6.85)+.2],0xf6f1e2);
 }
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

 // The toilets either side of the corridor: men's to port (a WC, two urinals, a basin), women's to starboard (two
 // WCs, a basin), tiled, sea-water flushing; their doors from the lobby, hooked open.
 for(const s of [1,-1]){
  const sd=s>0?'p':'s',X=sorted(s*F.corridor,s*(DW-T)),D=sorted(s*1.05,s*1.8);
  // Walls: on the lobby (with the door), on the corridor, on the carpet room.
  wall('x',X[0],X[1],LB1-T/2,LB1+T/2,PASS,top,[{s0:D[0],s1:D[1],y0:PASS-1,y1:PASS+1.95}],CREAM);
  wall('z',LB1,TB1,...sorted(s*F.corridor,s*(F.corridor+T)),PASS,top,[],CREAM);
  wall('x',X[0],X[1],TB1-T/2,TB1+T/2,PASS,top,[],CREAM);
  deco([s*1.425-.12,PASS+2.05,LB1-T/2-.03],[s*1.425+.12,PASS+2.29,LB1-T/2],s>0?0x2f5e9a:RED);
  // The door, hooked back flat against the wall inside, outboard of its jamb.
  deco([Math.min(s*1.8,s*2.55),PASS+.02,LB1+T/2],[Math.max(s*1.8,s*2.55),PASS+1.93,LB1+T/2+.04],DOOR);
  deco([X[0],PASS+.003,LB1+T/2],[X[1],PASS+.008,TB1-T/2],0xd9dfe0);
  deco([Math.min(s*(DW-T-.01),s*(DW-T)),PASS,LB1+T/2],[Math.max(s*(DW-T-.01),s*(DW-T)),PASS+1.4,TB1-T/2],0xe6eef0);
  // The basin on the corridor's wall, its mirror over it.
  box([Math.min(s*(F.corridor+T),s*(F.corridor+T+.45)),PASS+.7,Z(10.6)-.25],[Math.max(s*(F.corridor+T),s*(F.corridor+T+.45)),PASS+.85,Z(10.6)+.25],0xf4f4f0,{name:'basin'});
  deco([Math.min(s*(F.corridor+T),s*(F.corridor+T+.02)),PASS+1.2,Z(10.6)-.25],[Math.max(s*(F.corridor+T),s*(F.corridor+T+.02)),PASS+1.75,Z(10.6)+.25],0xbfd6dc);
  // WC cubicles against her side: one (men's), two (women's); their partitions and doors.
  const cub=s>0?[[Z(10.2),TB1-T/2]]:[[LB1+T/2+.05,Z(10.5)],[Z(10.5),TB1-T/2]];
  for(const [z0,z1] of cub){
   const P=sorted(s*2.2,s*(DW-T));
   box([P[0],PASS,z0],[P[1],PASS+2.0,z0+.04],0x9fb5b8,{name:'cubicle partition'});
   box([Math.min(s*2.2,s*2.24),PASS,z0],[Math.max(s*2.2,s*2.24),PASS+2.0,z0+.25],0x9fb5b8,{name:'cubicle partition'});
   box([Math.min(s*2.2,s*2.24),PASS+.15,z0+.3],[Math.max(s*2.2,s*2.24),PASS+1.95,z1-.05],0x7e9fa4,{name:'cubicle door'});
   const w=(z0+z1)/2;box([Math.min(s*(DW-T-.6),s*(DW-T-.15)),PASS,w-.2],[Math.max(s*(DW-T-.6),s*(DW-T-.15)),PASS+.42,w+.2],0xf4f4f0,{name:'WC'});
   box([Math.min(s*(DW-T-.2),s*(DW-T)),PASS+.4,w-.22],[Math.max(s*(DW-T-.2),s*(DW-T)),PASS+.85,w+.22],0xf4f4f0,{name:'cistern'});
  }
  if(s>0)for(const x of [1.2,1.75])box([x-.18,PASS+.45,TB1-T/2-.3],[x+.18,PASS+1.1,TB1-T/2],0xf4f4f0,{name:'urinal'});
  // The floor inside, from the doorway: round the basin and up to the cubicles' doors.
  floor('toilet-'+sd,sorted(s*(F.corridor+T),s*(DW-T)),[LB1-.4,TB1-T/2],PASS,(x,z,r)=>{
   const a=Math.abs(x);if(a<F.corridor+T+r||a>2.2-r)return false;
   if(z<LB1+T/2+r)return Math.abs(a-1.425)<=.375-r+.06;
   if(z>TB1-T/2-r)return false;
   return true;
  });
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

 // Grab rails along the house's sides and the lobby's, at 1.0 m, as every ship's deckhouse carries; the fire-hose boxes on
 // the casings' faces by the car deck's hydrants; the muster-station A sign by the saloon's forward door.
 for(const s of [1,-1]){
  bar([s*(DW+.07),PASS+1.0,LB1+.3],[s*(DW+.07),PASS+1.0,DH1-.3],.018,STEEL);for(let z=LB1+.4;z<DH1-.3;z+=1.5)bar([s*(DW),PASS+1.0,z],[s*(DW+.07),PASS+1.0,z],.016,STEEL);
  bar([s*(LW+.07),PASS+1.0,DH0+.3],[s*(LW+.07),PASS+1.0,LB1-.2],.018,STEEL);for(const z of [DH0+.4,LB1-.3])bar([s*LW,PASS+1.0,z],[s*(LW+.07),PASS+1.0,z],.016,STEEL);
  for(const zy of [5,16.5]){const X=sorted(s*(CAS_IN-.22),s*(CAS_IN-.02));box([X[0],CAR+.9,Z(zy)-.3],[X[1],CAR+1.6,Z(zy)+.3],RED,{camera:false,name:'fire-hose box'});deco([Math.min(s*(CAS_IN-.23),s*(CAS_IN-.22)),CAR+1.0,Z(zy)-.22],[Math.max(s*(CAS_IN-.23),s*(CAS_IN-.22)),CAR+1.5,Z(zy)+.22],0xf4f1e8);}
 }
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
  for(const zy of [1,2.6])for(const x of [-1.6,1.6])box([x-1.05,PASS,Z(zy)-.23],[x+1.05,PASS+.9,Z(zy)+.23],TEAK,{camera:false,solid:true,name:'open-deck bench',draw:false});
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

 // ---- The bridge deck: the crew's rooms aft (ferry batch 6c, below), the wheelhouse forward, the wings.
 // The house's deckhead (the compass deck's underside), for the lens: it stays in the rooms.
 box([-F.bridgeHalf,F.houseTop,DH0],[F.bridgeHalf,F.houseTop+.2,DH1],WHITE,{solid:false,camera:true,draw:false,name:'bridge house top'});
 for(const s of [1,-1]){
  const X=sorted(s*(BH-T),s*BH);
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
 deco([-(BH-T),BRIDGE+.007,WH0+T/2],[BH-T,BRIDGE+.012,DH1-T],0x8a6f55);
 // Inside: the console under the windows (radar, the engine and thruster levers, VHF, the telephone), the steering
 // stand, the master's chair, the chart table aft to starboard, the door to the crew's corridor (open, aft).
 // Batch 6e: the magnetic compass periscope, the telegraph's lever box, the VHF handset, the radar hood, the window
 // wipers, the clock, barometer and fire-detection panel on the aft bulkhead, the navigation-lights panel, the PA
 // microphone, the binoculars and the log on the sill, the chart-table lamp, the deckhead lights.
 box([-2.75,BRIDGE,DH1-.7],[2.75,BRIDGE+1.0,DH1-T],0x5c6466,{name:'wheelhouse console'});
 deco([-1.25,BRIDGE+1.0,DH1-.6],[-.55,BRIDGE+1.45,DH1-.2],DARK);deco([-1.15,BRIDGE+1.05,DH1-.62],[-.65,BRIDGE+1.4,DH1-.6],0x1f4a3a);
 for(const x of [.2,.4,.9])bar([x,BRIDGE+1.0,DH1-.45],[x,BRIDGE+1.22,DH1-.5],.018,x>.5?ORANGE:RED);
 deco([1.4,BRIDGE+1.0,DH1-.55],[1.9,BRIDGE+1.18,DH1-.25],DARK);
 box([-.25,BRIDGE,DH1-1.5],[.25,BRIDGE+.95,DH1-1.0],0x5c6466,{name:'steering stand'});
 bar([0,BRIDGE+.95,DH1-1.25],[0,F.houseTop-.05,DH1-1.25],.04,0xb08a4a);deco([-.08,BRIDGE+1.5,DH1-1.4],[.08,BRIDGE+1.62,DH1-1.25],0xb08a4a);
 deco([-.12,BRIDGE+.75,DH1-1.52],[.12,BRIDGE+.9,DH1-1.5],0xf0ece0);
 deco([-1.3,BRIDGE+1.45,DH1-.62],[-.5,BRIDGE+1.52,DH1-.18],DARK);
 deco([-.3,BRIDGE+1.0,DH1-.55],[.55,BRIDGE+1.12,DH1-.25],0x3a4244);
 deco([1.3,BRIDGE+1.0,DH1-.5],[1.75,BRIDGE+1.25,DH1-.28],DARK);bar([1.52,BRIDGE+1.25,DH1-.4],[1.52,BRIDGE+1.33,DH1-.4],.045,DARK);bar([1.52,BRIDGE+1.1,DH1-.27],[1.52,BRIDGE+1.2,DH1-.22],.02,DARK);
 bar([2.1,BRIDGE+1.0,DH1-.4],[2.1,BRIDGE+1.28,DH1-.45],.012,STEEL);bar([2.1,BRIDGE+1.28,DH1-.45],[2.1,BRIDGE+1.32,DH1-.45],.035,DARK);
 deco([2.25,BRIDGE+1.0,DH1-.6],[2.65,BRIDGE+1.22,DH1-.3],DARK);deco([2.3,BRIDGE+1.22,DH1-.55],[2.6,BRIDGE+1.24,DH1-.38],0x8fb3c9);
 deco([-2.6,BRIDGE+1.0,DH1-.6],[-1.5,BRIDGE+1.2,DH1-.3],0xd8d2c0);for(let i=0;i<6;i++){const kx=-2.5+i*.18;deco([kx,BRIDGE+1.2,DH1-.5],[kx+.08,BRIDGE+1.23,DH1-.42],[RED,0x2aff70,0xf6f1e2,0xf6f1e2,RED,0x2aff70][i]);}
 for(const kx of [-2.5,-2.1,-1.7])bar([kx,BRIDGE+1.0,DH1-.2],[kx,BRIDGE+1.0,DH1-.18],.06,0xf0ece0);
 deco([-2.9,BRIDGE+1.0,DH1-T-.12],[2.9,BRIDGE+1.03,DH1-T],0xd8d2c0);
 bar([-2.1,BRIDGE+1.03,DH1-.24],[-1.75,BRIDGE+1.03,DH1-.24],.045,DARK);bar([-2.1,BRIDGE+1.03,DH1-.17],[-1.75,BRIDGE+1.03,DH1-.17],.045,DARK);
 for(const kx of [-1.18,0,1.18])bar([kx,BRIDGE+1.05,DH1-.04],[kx+.3,BRIDGE+1.75,DH1-.04],.012,DARK);
 bar([1.4,BRIDGE+1.9,WH0+T/2],[1.4,BRIDGE+1.9,WH0+T/2+.05],.17,0xf4f1e8);bar([1.4,BRIDGE+1.9,WH0+T/2+.05],[1.4,BRIDGE+1.9,WH0+T/2+.06],.14,DARK);
 bar([1.95,BRIDGE+1.9,WH0+T/2],[1.95,BRIDGE+1.9,WH0+T/2+.05],.12,0xb08a4a);
 deco([-1.7,BRIDGE+1.55,WH0+T/2],[-.9,BRIDGE+2.05,WH0+T/2+.06],RED);for(let i=0;i<6;i++)deco([-1.62+i*.12,BRIDGE+1.9,WH0+T/2+.06],[-1.55+i*.12,BRIDGE+1.95,WH0+T/2+.07],0x2aff70);
 deco([2.3,BRIDGE+1.4,WH0+T/2],[2.85,BRIDGE+1.95,WH0+T/2+.02],0xf4f1e8);
 for(const kx of [-1.5,1.5])deco([kx-.35,F.houseTop-.06,WH0+1.6],[kx+.35,F.houseTop,WH0+1.9],0xf6f1e2);
 deco([-.3,F.houseTop-.2,DH1-.4],[.3,F.houseTop,DH1-.1],DARK);
 bar([0,F.houseTop,DH1-.9],[0,BRIDGE+1.9,DH1-.9],.006,0xd9cfa8,'paint');deco([-.03,BRIDGE+1.82,DH1-.93],[.03,BRIDGE+1.9,DH1-.87],TEAK);
 bar([0,BRIDGE+1.05,DH1-1.5],[0,BRIDGE+1.05,DH1-1.62],.32,TEAK);
 box([.75,BRIDGE,DH1-1.75],[1.25,BRIDGE+1.15,DH1-1.25],0x4a3f36,{name:'master’s chair'});
 box([-2.9,BRIDGE,WH0+T/2],[-1.7,BRIDGE+.95,WH0+.85],TEAK,{name:'chart table'});
 deco([-2.5,BRIDGE+.96,WH0+.2],[-2.1,BRIDGE+.99,WH0+.5],0x2f4f8f);deco([-2.85,BRIDGE+.96,WH0+.55],[-2.4,BRIDGE+.97,WH0+.8],0xd8d2c0);
 bar([-2.0,BRIDGE+.97,WH0+.3],[-2.0,BRIDGE+1.0,WH0+.3],.03,DARK);
 bar([-1.75,BRIDGE+.95,WH0+.15],[-1.75,BRIDGE+1.45,WH0+.15],.012,STEEL);deco([-1.95,BRIDGE+1.42,WH0+.05],[-1.55,BRIDGE+1.5,WH0+.35],0x3a4244);
 for(let i=0;i<3;i++)deco([-2.85,BRIDGE+.15+i*.25,WH0+T/2-.005],[-1.75,BRIDGE+.35+i*.25,WH0+T/2],0x6f5a40);deco([-2.85,BRIDGE+.95,WH0+.1],[-1.75,BRIDGE+.96,WH0+.8],0xe8e2cc);
 // (The door aft to the crew's corridor stands open: the crew house, below.)
 floor('wheelhouse',[-(BH-T),BH-T],[WH0,DH1-T],BRIDGE,(x,z,r)=>Math.abs(x)<=BH-T-r&&z>=WH0+T/2+r&&z<=DH1-T-r);
 floor('wing-door-p',[BH-T-.5,BH+.3],[Z(19.6),Z(20.4)],BRIDGE,(x,z,r)=>z>=Z(19.6)+r-.06&&z<=Z(20.4)-r+.06);
 floor('wing-door-s',[-(BH+.3),-(BH-T-.5)],[Z(19.6),Z(20.4)],BRIDGE,(x,z,r)=>z>=Z(19.6)+r-.06&&z<=Z(20.4)-r+.06);


 // ---- The crew house on the bridge deck (shipyard z 6–19.5, 6 m wide): aft, the emergency-generator room (port)
 // and the CO₂ room (starboard), each opening only aft onto the bridge deck's platform; between them the crew's own
 // door from the platform (they come up the open deck's ladders) into the corridor down the middle to the wheelhouse,
 // the crew's rooms either side of it. (The general arrangement had a crew stair down to the lobby; there is no room
 // for one there that a passenger would not walk into, so the crew's way is outside, as on many small ferries.)
 {const HT=F.houseTop,ceil=HT-.08,CW=.45;
  const rooms=[
   // [side, from, to, id, name]
   [1,Z(9),Z(11.5),'crew-cabin','Crew cabin'],[-1,Z(9),Z(11.5),'mate-cabin','Chief officer’s cabin'],
   [1,Z(11.5),Z(14),'deckhand-cabin','Deckhand’s cabin'],[-1,Z(11.5),Z(14),'crew-wc','Crew WC and shower'],
   [1,Z(14),Z(16.5),'mess','Mess room'],[-1,Z(14),Z(16.5),'galley','Galley'],
   [1,Z(16.5),WH0,'chief-cabin','Chief engineer’s cabin'],[-1,Z(16.5),WH0,'master-cabin','Master’s cabin'],
  ];
  const doorZ=(a,b)=>a+.55;
  // The house's outer walls: aft (the two rooms' doors), the sides with a square port in each room.
  wall('x',-BH,BH,DH0,DH0+T,BRIDGE,HT,[doorAt(1.6,.8,BRIDGE,1.92),doorAt(-1.6,.8,BRIDGE,1.92),doorAt(0,.8,BRIDGE,1.92)]);
  deco([-.4,BRIDGE+1.95,DH0-.02],[.4,BRIDGE+2.1,DH0],0xb03a2a);
  for(const s of [1,-1])wall('z',DH0,WH0,...sorted(s*(BH-T),s*BH),BRIDGE,HT,[10.2,12.7,15.2,17.9].map(zy=>win(Z(zy),.5,BRIDGE+1.45,.5)));
  // The wheelhouse's aft wall, with the door to the corridor (open, hooked back against it in the wheelhouse).
  wall('x',-BH,BH,WH0-T/2,WH0+T/2,BRIDGE,HT,[doorAt(0,.8,BRIDGE,1.92)]);
  deco([.42,BRIDGE+.02,WH0+T/2],[1.2,BRIDGE+1.92,WH0+T/2+.04],DOOR);
  // The EG and CO₂ rooms' forward walls and inner walls; the corridor's walls with a door into each room.
  wall('x',-BH,-CW,Z(9)-T/2,Z(9)+T/2,BRIDGE,HT);wall('x',CW,BH,Z(9)-T/2,Z(9)+T/2,BRIDGE,HT);
  for(const s of [1,-1]){
   wall('z',DH0+T,Z(9),...sorted(s*CW,s*(CW+T)),BRIDGE,HT);
   const doors=rooms.filter(r=>r[0]===s).map(r=>doorAt(doorZ(r[1],r[2]),.7,BRIDGE,1.92));
   wall('z',Z(9),WH0,...sorted(s*CW,s*(CW+T)),BRIDGE,HT,doors,CREAM);
   for(const r of rooms.filter(r=>r[0]===s).slice(1))wall('x',...sorted(s*(CW+T),s*(BH-T)),r[1]-T/2,r[1]+T/2,BRIDGE,HT,[],CREAM);
  }
  // Floors: the corridor, linoleum; the rooms.
  deco([-CW,BRIDGE+.003,DH0+T],[CW,BRIDGE+.008,WH0],0x8a6f55);
  floor('crew-corridor',[-CW,CW],[DH0-.45,WH0+.4],BRIDGE,(x,z,r)=>Math.abs(x)<=CW-r+.1&&(z<WH0-T/2-r||Math.abs(x)<=.4-r+.08));
  const room=(s,z0,z1,id,doorAt0)=>{
   const X=sorted(s*(CW+T),s*(BH-T));deco([X[0],BRIDGE+.003,z0+T/2],[X[1],BRIDGE+.008,z1-T/2],id==='crew-wc'?0xd9dfe0:id==='galley'?0xc9c2ae:0x9a8466);
   floor(id,sorted(s*(CW-.35),s*(BH-T)),[z0,z1],BRIDGE,(x,z,r)=>{const a=Math.abs(x);
    if(a<CW+T+r)return a>CW-.35&&Math.abs(z-doorAt0)<=.35-r+.06;
    return a<=BH-T-r&&z>=z0+T/2+r&&z<=z1-T/2-r;});
  };
  for(const [s,z0,z1,id] of rooms)room(s,z0,z1,id,doorZ(z0,z1));
  // The emergency-generator and CO₂ rooms, from the platform aft.
  for(const s of [1,-1]){const id=s>0?'eg-room':'co2-room',X=sorted(s*(CW+T),s*(BH-T));
   deco([X[0],BRIDGE+.003,DH0+T],[X[1],BRIDGE+.008,Z(9)-T/2],0x8c9193);
   floor(id,X,[DH0-.45,Z(9)],BRIDGE,(x,z,r)=>{const a=Math.abs(x);if(z<DH0+T+r)return Math.abs(a-1.6)<=.4-r+.06;return a>=CW+T+r&&a<=BH-T-r&&z<=Z(9)-T/2-r;});}

  // Emergency-generator room: the 40 kVA set on its bed (engine, radiator forward, alternator aft), the emergency
  // switchboard on the forward wall, the 24 V batteries in their box, the 60 L day tank, louvres in the aft wall.
  {box([1.25,BRIDGE,Z(6.9)],[2.55,BRIDGE+.95,Z(8.3)],0x5f7f6a,{name:'emergency generator'});
   deco([1.4,BRIDGE+.95,Z(7.2)],[2.4,BRIDGE+1.05,Z(8.0)],0x3f5a4a);bar([1.9,BRIDGE+.6,Z(8.3)],[1.9,BRIDGE+.6,Z(8.6)],.28,0x2f4f8f);
   box([.6,BRIDGE,Z(8.6)],[2.9,BRIDGE+1.9,Z(9)-T/2],0x9aa3a2,{name:'emergency switchboard'});for(let i=0;i<5;i++)deco([.7+i*.45,BRIDGE+1.0,Z(8.6)-.02],[1.0+i*.45,BRIDGE+1.6,Z(8.6)],0x3a4244);
   box([2.4,BRIDGE,Z(6.15)],[2.9,BRIDGE+.6,Z(6.8)],0x3a4244,{name:'battery box'});box([.6,BRIDGE+1.3,Z(6.15)],[1.0,BRIDGE+1.9,Z(6.6)],0x8a6a3a,{name:'day tank'});
   for(let i=0;i<4;i++)deco([2.1,BRIDGE+1.2+i*.12,DH0-.01],[2.8,BRIDGE+1.25+i*.12,DH0],DARK);}
  // CO₂ room and fire-control station: four 45 kg bottles in their rack, the release cabinet, the remote fan stops and
  // quick-closing valves, two firemen's outfits in their locker.
  {for(let i=0;i<4;i++)bar([-2.6+i*.3,BRIDGE,Z(8.6)],[-2.6+i*.3,BRIDGE+1.45,Z(8.6)],.12,RED);
   box([-2.8,BRIDGE,Z(8.4)],[-1.55,BRIDGE+1.5,Z(9)-T/2],RED,{draw:false,name:'CO₂ bottles'});deco([-2.8,BRIDGE+1.1,Z(8.85)],[-1.55,BRIDGE+1.15,Z(8.9)],DARK);
   box([-1.2,BRIDGE+.9,Z(9)-T/2-.2],[-.6,BRIDGE+1.7,Z(9)-T/2],RED,{name:'CO₂ release cabinet'});
   box([-2.95,BRIDGE,Z(6.2)],[-2.35,BRIDGE+1.9,Z(7.2)],0x9aa3a2,{name:'firemen’s outfit locker'});
   box([-1.1,BRIDGE+1.0,DH0+T],[-.6,BRIDGE+1.6,DH0+T+.15],0xd8d2c0,{name:'fan stops'});}

  // The cabins: a bunk (two in the crew cabin), a locker, a fold-down desk or a desk; the master's safe and papers.
  const bunk=(s,z0,z1,y=BRIDGE,two=false)=>{const X=S2(s,BH-T-.85,BH-T);box([X[0],y,z0],[X[1],y+(two?1.7:.5),z1],TEAK,{name:'bunk'});
   deco([X[0]+.04,y+.45,z0+.05],[X[1]-.04,y+.55,z1-.05],0xe8e4d8);if(two)deco([X[0]+.04,y+1.3,z0+.05],[X[1]-.04,y+1.4,z1-.05],0xe8e4d8);};
  const locker=(s,z0,x0=CW+T,w=.55)=>box([S2(s,x0,x0+w)[0],BRIDGE,z0],[S2(s,x0,x0+w)[1],BRIDGE+1.9,z0+.5],0xb9b3a0,{name:'locker'});
  const desk=(s,z0,z1)=>{const X=S2(s,BH-T-.55,BH-T);box([X[0],BRIDGE+.72,z0],[X[1],BRIDGE+.77,z1],TEAK,{name:'desk'});box([X[0],BRIDGE,z0],[X[1],BRIDGE+.72,z0+.4],TEAK,{name:'desk'});};
  bunk(1,Z(9)+T/2+.05,Z(9)+2.0,BRIDGE,true);locker(1,Z(11.5)-T/2-.55);
  bunk(-1,Z(9)+T/2+.05,Z(9)+2.0);desk(-1,Z(11.5)-.75,Z(11.5)-T/2-.05);locker(-1,Z(11.5)-T/2-.52,CW+T,.5);
  bunk(1,Z(11.5)+T/2+.05,Z(11.5)+2.0);locker(1,Z(14)-T/2-.52);
  // Crew WC and shower: the WC, the basin, the shower tray and its curtain.
  deco([-(BH-T),BRIDGE+.009,Z(11.5)+.1],[-(BH-T-.9),BRIDGE+.02,Z(11.5)+1.0],0xe6eef0);deco([-(BH-T-.9),BRIDGE+1.95,Z(11.5)+.1],[-(BH-T-.92),BRIDGE+1.97,Z(11.5)+1.0],STEEL);
  box([-(BH-T),BRIDGE,Z(13.4)-.2],[-(BH-T-.55),BRIDGE+.42,Z(13.4)+.2],0xf4f4f0,{name:'WC'});box([-(CW+T+.45),BRIDGE+.7,Z(12.9)-.25],[-(CW+T),BRIDGE+.85,Z(12.9)+.25],0xf4f4f0,{name:'basin'});
  // Mess room: a table for six with benches, the television, the kettle, the duty board and the muster list.
  box([1.35,BRIDGE,Z(15.0)],[2.35,BRIDGE+.72,Z(16.2)],TEAK,{name:'mess table'});
  for(const x of [[1.08,1.28],[2.42,2.62]])box([x[0],BRIDGE,Z(15.0)],[x[1],BRIDGE+.42,Z(16.2)],0x8a7356,{name:'mess bench'});
  box([BH-T-.45,BRIDGE+1.3,Z(16.5)-.6],[BH-T,BRIDGE+1.7,Z(16.5)-T/2-.05],DARK,{camera:false,name:'mess television'});
  box([BH-T-.5,BRIDGE,Z(14)+T/2+.05],[BH-T,BRIDGE+.9,Z(14)+.7],0xd8d2c0,{name:'sideboard'});bar([2.55,BRIDGE+.9,Z(14.35)],[2.55,BRIDGE+1.1,Z(14.35)],.07,STEEL);
  deco([.6,BRIDGE+1.2,Z(16.5)-T/2-.02],[1.6,BRIDGE+1.8,Z(16.5)-T/2],0xf4f0e2);
  // Galley: the three-plate range and its hood, the rice cooker, the fridge-freezer, the sink, the provision locker.
  box([-(BH-T),BRIDGE,Z(14.2)],[-(BH-T-.6),BRIDGE+.9,Z(15.0)],0x9aa3a2,{name:'range'});box([-(BH-T),BRIDGE+1.55,Z(14.2)],[-(BH-T-.6),BRIDGE+1.9,Z(15.0)],STEEL,{camera:false,name:'hood'});
  box([-(BH-T),BRIDGE,Z(15.0)],[-(BH-T-.6),BRIDGE+.9,Z(15.9)],0xc8c8c0,{name:'sink'});bar([-(BH-T-.3),BRIDGE+.9,Z(15.45)],[-(BH-T-.3),BRIDGE+1.1,Z(15.45)],.09,0xf0ece0);
  box([-(BH-T),BRIDGE,Z(15.9)],[-(BH-T-.65),BRIDGE+1.75,Z(16.5)-T/2],0xe8e6dc,{name:'fridge-freezer'});
  box([-(CW+T+.6),BRIDGE,Z(14)+T/2+.05],[-(CW+T),BRIDGE+1.9,Z(14)+.55],0xb9b3a0,{name:'provision locker'});
  // Chief engineer's and master's cabins.
  bunk(1,WH0-T/2-2.0,WH0-T/2-.05);desk(1,Z(16.5)+.1,Z(16.5)+.9);locker(1,Z(16.5)+T/2+.02);
  bunk(-1,WH0-T/2-2.0,WH0-T/2-.05);desk(-1,Z(16.5)+.1,Z(16.5)+1.1);locker(-1,Z(16.5)+T/2+.02);
  box([-(CW+T+.5),BRIDGE,Z(18.4)],[-(CW+T),BRIDGE+.6,Z(18.9)],DARK,{name:'safe'});
  for(const [s,z0,z1] of rooms)deco([Math.min(s*(CW+T),s*(CW+T+.01)),BRIDGE+2.0,doorZ(z0,z1)-.15],[Math.max(s*(CW+T),s*(CW+T+.01)),BRIDGE+2.12,doorZ(z0,z1)+.15],0xf4f0e2);
  // A grab rail down each side of the corridor, at 0.95 m: a ship's corridor in a seaway.
  for(const s of [1,-1])bar([s*(CW-.03),BRIDGE+.95,Z(9.3)],[s*(CW-.03),BRIDGE+.95,WH0-.3],.016,STEEL);
  // Ceiling lights down the corridor.
  for(let z=Z(10);z<WH0-.5;z+=2)deco([-.2,ceil-.04,z-.15],[.2,ceil,z+.15],0xf6f1e2);
 }

 // ---- The engine room (FERRY_ENGINE_ROOM): in by the casing P door and down the ladder through the car deck; the
 // two main engines with their reverse-reduction gearboxes aft and turbochargers forward, the shafts aft through the
 // bulkhead; the two generators forward, athwartships; the control booth aft to starboard with the main switchboard;
 // pumps, the air compressor and its bottles, the purifier, the service tank, the workbench, the escape ladder.
 {const y0=ER.floor,y1=ER.deckhead,a=ER.aft,f=ER.fore,W=ER.side,G=0x8fa39a,GD=0x5f7f6a;
  // The entrance in casing P: its walls, the door frame and the door hooked back aft along the casing's face.
  box([CAS_OUT-.06,CAR,ER.entrance[0]],[CAS_OUT,CAS_TOP,S.head],WHITE,{name:'casing'});
  wall('z',ER.entrance[0],S.head,CAS_IN,CAS_IN+.06,CAR,CAS_TOP,[doorAt((ER.door[0]+ER.door[1])/2,ER.door[1]-ER.door[0],CAR)]);
  for(const z of ER.door)deco([CAS_IN-.04,CAR,z-.04],[CAS_IN+.02,CAR+2,z+.04],TEAL);
  box([CAS_IN-.06,CAR+.02,ER.door[0]-.85],[CAS_IN-.02,CAR+1.98,ER.door[0]-.05],DOOR,{name:'engine room door'});
  // The way down is marked as on any ship: yellow-and-black hazard stripes on the walkway at the door, a lit sign over
  // the door (the 機関室 ENGINE ROOM decal: ferry-model.js), ear defenders on their hook and the escape sign inside.
  for(let i=0;i<5;i++)deco([CAS_IN-.5+i*.1,CAR+.004,ER.door[0]-.02],[CAS_IN-.42+i*.1,CAR+.008,ER.door[1]+.02],i%2?DARK:YELLOW);
  deco([CAS_IN-.16,CAR+2.46,ER.door[0]-.04],[CAS_IN+.06,CAR+2.52,ER.door[1]+.04],0x3a4244);
  deco([CAS_IN-.15,CAR+2.44,ER.door[0]-.02],[CAS_IN-.02,CAR+2.46,ER.door[1]+.02],0xf6f1e2);
  deco([CAS_IN+.03,CAR+1.5,ER.entrance[0]+.1],[CAS_IN+.2,CAR+1.75,ER.entrance[0]+.3],0xe0b93a);
  deco([CAS_OUT-.08,CAR+1.6,ER.entrance[0]+.2],[CAS_OUT-.06,CAR+1.9,ER.entrance[0]+.6],0x1f7a4a);
  // The hatch's coaming round the opening in the car deck, and the ladder's rails over it.
  const L=ER.ladder;
  for(const x of [L.x[0]-.05,L.x[1]+.03])deco([x,CAR,ER.hatch.z[0]+.4],[x+.02,CAR+.15,ER.hatch.z[1]],0x3a4244);
  bar([L.x[0]-.03,CAR,ER.hatch.z[0]+.35],[L.x[0]-.03,CAR+1.0,ER.hatch.z[0]+.35],.025,YELLOW,'paint');
  bar([L.x[0]-.03,CAR+1.0,ER.hatch.z[0]+.35],[L.x[0]-.03,CAR+1.0,ER.hatch.z[1]-.1],.025,YELLOW,'paint');
  // The ladder trunk under the car deck, from the hatch to the engine room's aft bulkhead.
  for(const x of [L.x[0]-.06,L.x[1]+.03])box([x,y0,L.head],[x+.04,y1,a],WHITE,{name:'ladder trunk'});
  box([L.x[0]-.06,y1,L.head],[L.x[1]+.07,CAR-.02,L.head+.04],WHITE,{solid:false,camera:true,name:'ladder trunk'});
  {const n=10,rise=CAR-y0,run=L.foot-L.head;for(let i=1;i<n;i++){const fr=i/n;deco([L.x[0]+.03,CAR-rise*fr-.03,L.head+run*fr-.07],[L.x[1]-.03,CAR-rise*fr,L.head+run*fr+.07],STEEL,{cls:'metal'});}
   for(const x of [L.x[0]+.02,L.x[1]-.02]){bar([x,CAR,L.head],[x,y0,L.foot],.03,STEEL);bar([x,CAR+.9,L.head],[x,y0+.9,L.foot],.02,YELLOW,'paint');}}
  // The ladder's own volume keeps the lens out (batch 6f): at its foot the camera stood under the rungs looking up through them.
  box([L.x[0]-.06,y0,L.head-.1],[L.x[1]+.07,CAR,L.foot+.1],STEEL,{solid:false,camera:true,draw:false,name:'ladder volume'});
  // The ladder is walked anywhere across its width (the creator, 2026-10-12, could not get down on a phone).
  floor('er-ladder',[L.x[0],L.x[1]],[L.head,L.foot],[CAR,y0],(x,z,r)=>Math.abs(x-(L.x[0]+L.x[1])/2)<=.34);
  floor('er-ladder-foot',[L.x[0],L.x[1]],[L.foot-.05,L.foot+.4],y0,(x,z,r)=>Math.abs(x-(L.x[0]+L.x[1])/2)<=.34);
  floor('er-entrance',[CAS_IN-.4,L.x[1]],[ER.entrance[0],L.head+.05],CAR,(x,z,r)=>x>=CAS_IN-.4&&x<=CAS_OUT-.06-r&&z>=ER.entrance[0]+r&&(x>=CAS_IN+.06+r||(z>=ER.door[0]+r-.06&&z<=ER.door[1]-r+.06)||x<CAS_IN-.05));
  // The space: lining along her sides, the bulkheads fore and aft (the ladder comes through the aft one), the deckhead
  // under the car deck, the chequered floor plates.
  for(const s of [1,-1])box([Math.min(s*W,s*(W+.06)),y0-.1,a],[Math.max(s*W,s*(W+.06)),y1,f],0xe8e6dc,{name:'engine room side'});
  wall('x',-W,W,a-.06,a,y0-.1,y1,[{s0:L.x[0]-.06,s1:L.x[1]+.07,y0:y0-1,y1:y1+1}],0xe8e6dc);
  box([-W,y0-.1,f],[W,y1,f+.06],0xe8e6dc,{name:'engine room forward bulkhead'});
  box([-W,y1,a],[W,CAR-.02,f],0xd8d6cc,{solid:false,camera:true,name:'engine room deckhead'});
  box([-W,y0-.06,a],[W,y0,f],0x8c9193,{solid:false,camera:false,name:'floor plates'});
  for(let z=a+.6;z<f;z+=.6)deco([-W,y0,z-.01],[W,y0+.003,z+.01],0x6f7476);
  // Lights in their guards, and the fire main's hydrant.
  for(const [x,z] of [[0,Z(9.5)],[0,Z(12.5)],[2.9,Z(11)],[-2.9,Z(12.6)]])deco([x-.15,y1-.08,z-.15],[x+.15,y1,z+.15],0xf6f1e2);
  box([W-.25,y0,Z(13.6)],[W,y0+.9,Z(13.8)],RED,{name:'hydrant'});

  // Inside, the engine room's own sign, the fire alarm bell and the CO₂ alarm (red and yellow), the first-aid box,
  // the escape-route sign over the escape ladder.
  deco([-W+.02,y0+1.5,Z(9.1)],[-W+.04,y0+1.8,Z(9.9)],0xb03a2a);
  bar([-W+.3,y1-.35,Z(9.1)],[-W+.3,y1-.2,Z(9.1)],.1,RED,'paint');bar([-W+.6,y1-.35,Z(9.1)],[-W+.6,y1-.2,Z(9.1)],.1,YELLOW,'paint');
  deco([W-.02,y0+1.4,Z(9.9)],[W,y0+1.7,Z(10.3)],0xf4f1e8);deco([W-.025,y0+1.5,Z(10.03)],[W-.02,y0+1.6,Z(10.17)],RED);deco([W-.025,y0+1.52,Z(9.95)],[W-.02,y0+1.58,Z(10.25)],RED);
  deco([-W+.1,y1-.3,a+.2],[-W+.6,y1-.15,a+.22],0x1f7a4a);
  // The main engines: Johansson Marine JM6-160 (johansson-marine.js), built like the marine diesels of their day
  // (the creator, 2026-10-12: "real machines similar to Volvo", branded Johansson). Each: the bedplate; the block in
  // the house green with the sump below and the crankcase doors along the inboard side; six cylinder heads under
  // six black rocker covers with the oil filler on No.1; the fuel rail and injection pumps inboard with a line to
  // each head; the exhaust manifold outboard in silver lagging with a branch from each head to the turbocharger
  // forward (turbine and compressor housings, the air filter drum, the charge-air cooler), and the exhaust up to
  // the casing; the flywheel housing aft, the coupling guard and the JR-30 gearbox with its output flange; the
  // lube-oil filters and the cooling-water pumps on the forward end; the gauge board and local control stand aft;
  // the maker's plate on the block. Numbers from FERRY_MACHINERY through the catalogue.
  {const L=JOHANSSON_MARINE.livery,GRN=L.green,GRND=L.greenDark,COV=L.cover,LAG=L.lagging,CAST=L.cast;
   const E0=Z(9.7),E1=Z(11.95),heads=6,pitch=(E1-E0-.5)/heads;
   for(const s of [1,-1]){const cx=s*1.55,X=S2(s,1.1,2.0),out=s*.45,inb=-s*.45;
    const name=s>0?'main engine, port':'main engine, starboard';
    box([X[0]-.08,y0,Z(9.0)],[X[1]+.08,y0+.22,E1+.05],0x3a3f41,{name:'main engine bedplate'});
    box([X[0]+.08,y0+.22,E0],[X[1]-.08,y0+.55,E1],GRND,{name:'main engine sump'});
    box([X[0],y0+.55,E0],[X[1],y0+1.12,E1],GRN,{name:'main engine'});
    for(let i=0;i<heads;i++)cyl(.09,.09,.015,[cx+inb*1.0,y0+.82,E0+.25+i*pitch+pitch/2],GRND,{rot:[0,0,Math.PI/2],seg:12,name:'crankcase door'});
    for(let i=0;i<heads;i++){const z0=E0+.25+i*pitch+.03,z1=z0+pitch-.06;
     deco([cx-.3,y0+1.12,z0],[cx+.3,y0+1.3,z1],GRN);
     deco([cx-.24,y0+1.3,z0+.02],[cx+.24,y0+1.44,z1-.02],COV);cyl(.1,.1,z1-z0-.06,[cx,y0+1.44,(z0+z1)/2],COV,{rot:[Math.PI/2,0,0],seg:10});
     bar([cx+inb*.6,y0+1.2,(z0+z1)/2],[cx+inb*.1,y0+1.36,(z0+z1)/2],.012,0xd8d4c4);
     bar([cx+out*.5,y0+1.22,(z0+z1)/2],[cx+out*.95,y0+1.3,(z0+z1)/2],.045,LAG);}
    cyl(.045,.045,.05,[cx+.1,y0+1.49,E0+.3],0xe0b93a,{seg:10,name:'oil filler'});
    bar([cx+inb*.62,y0+1.2,E0+.2],[cx+inb*.62,y0+1.2,E1-.2],.02,0xd8d4c4);
    deco([cx+inb*.75-.08,y0+.85,E0+.3],[cx+inb*.75+.08,y0+1.15,E1-.3],COV);
    for(const k of [0,.2])cyl(.07,.07,.26,[cx+inb*.72,y0+.72,E0+.1+k],0xf0ece0,{seg:12,name:'fuel filter'});
    bar([cx+out*.95,y0+1.3,E0+.2],[cx+out*.95,y0+1.3,E1+.1],.085,LAG,'paint');
    bar([cx+out*.95,y0+1.3,E1+.1],[cx+out*.6,y0+1.45,E1+.35],.085,LAG,'paint');
    cyl(.17,.17,.26,[cx+out*.6,y0+1.45,E1+.42],CAST,{rot:[Math.PI/2,0,0],seg:16,name:'turbocharger turbine'});
    cyl(.2,.2,.2,[cx+out*.6,y0+1.45,E1+.64],CAST,{rot:[Math.PI/2,0,0],seg:16,name:'turbocharger compressor'});
    cyl(.16,.16,.3,[cx+out*.6,y0+1.45,E1+.9],COV,{rot:[Math.PI/2,0,0],seg:16,name:'air filter'});cyl(.165,.165,.04,[cx+out*.6,y0+1.45,E1+.78],LAG,{rot:[Math.PI/2,0,0],seg:16});
    deco([cx-.3,y0+.9,E1+.02],[cx+.3,y0+1.3,E1+.32],GRN);bar([cx+out*.6,y0+1.45,E1+.5],[cx+out*.2,y0+1.3,E1+.2],.06,CAST);
    bar([cx+out*.6,y0+1.62,E1+.42],[cx+out*.6,y1-.15,E1+.42],.14,LAG,'paint');bar([cx+out*.6,y1-.15,E1+.42],[cx+out*.6,y1-.15,a+.05],.14,LAG,'paint');
    cyl(.1,.1,.18,[cx-.25,y0+.75,E1+.12],CAST,{rot:[Math.PI/2,0,0],seg:12,name:'cooling-water pump'});cyl(.09,.09,.16,[cx+.25,y0+.7,E1+.12],CAST,{rot:[Math.PI/2,0,0],seg:12,name:'sea-water pump'});
    for(const k of [-.14,.14])cyl(.075,.075,.3,[cx+k,y0+.45,E1+.1],0xf0ece0,{seg:12,name:'lube-oil filter'});
    deco([cx-.32,y0+.3,E1+.2],[cx+.32,y0+.6,E1+.26],COV);
    cyl(.42,.42,.22,[cx,y0+.6,E0-.11],COV,{rot:[Math.PI/2,0,0],seg:20,name:'flywheel housing'});
    cyl(.2,.2,.14,[cx,y0+.6,E0-.29],0xe0b93a,{rot:[Math.PI/2,0,0],seg:14,name:'coupling guard'});
    box([X[0]+.12,y0+.22,Z(9.0)],[X[1]-.12,y0+.98,E0-.36],GRN,{name:'gearbox'});cyl(.3,.3,.06,[cx,y0+.6,Z(9.0)-.03],GRND,{rot:[Math.PI/2,0,0],seg:20,name:'gearbox cover'});
    deco([cx-.14,y0+.98,Z(9.15)],[cx+.14,y0+1.08,Z(9.45)],COV);cyl(.12,.12,.1,[cx,y0+.6,Z(9.0)-.1],CAST,{rot:[Math.PI/2,0,0],seg:12,name:'output flange'});
    bar([cx,y0+.6,a],[cx,y0+.6,Z(9.0)-.14],.055,0xb0b4b4);
    deco([cx+inb*1.1-.22,y0+.95,E0+.05],[cx+inb*1.1+.22,y0+1.3,E0+.08],0xf0ece0);for(const k of [-.14,0,.14])cyl(.05,.05,.02,[cx+inb*1.1+k,y0+1.13,E0+.045],DARK,{rot:[Math.PI/2,0,0],seg:12,name:'gauge'});
    bar([cx+inb*1.1,y0+.22,E0+.06],[cx+inb*1.1,y0+.95,E0+.06],.02,DARK);
    deco([cx+inb*1.2-.16,y0+.9,Z(9.1)],[cx+inb*1.2+.16,y0+1.05,Z(9.4)],COV);bar([cx+inb*1.2,y0+.22,Z(9.25)],[cx+inb*1.2,y0+.9,Z(9.25)],.04,COV);
    cyl(.07,.07,.02,[cx+inb*1.2,y0+1.06,Z(9.25)],0xf0ece0,{seg:14,name:'tachometer'});cyl(.025,.025,.03,[cx+inb*1.2+.1,y0+1.07,Z(9.15)],L.red,{seg:10,name:'stop button'});bar([cx+inb*1.2-.1,y0+1.05,Z(9.35)],[cx+inb*1.2-.1,y0+1.25,Z(9.45)],.012,DARK);
    plate(makerPlate('main',s>0?1:2),.36,.16,[cx+inb*.46,y0+.9,E0+.9],s>0?-Math.PI/2:Math.PI/2,{name:'maker’s plate: '+name});
    plate([WORDMARK],.9,.08,[cx+out*.25,y0+1.38,(E0+E1)/2],s>0?Math.PI/2:-Math.PI/2,{bg:'#1f2224',fg:'#dcd8c8',name:'wordmark'});
   }
   // The generator sets: Johansson Marine JG-125, athwartships forward of the mains; a four-cylinder engine inboard
   // (heads, covers, manifold and a small turbo), the alternator outboard in the works' blue with its cooling ribs
   // and terminal box, on a common bed, and the maker's plate on the bed.
   for(const s of [1,-1]){const X=S2(s,.55,2.4),zc=Z(12.975),ex=S2(s,.6,1.75);
    box([X[0],y0,Z(12.55)],[X[1],y0+.2,Z(13.4)],0x3a3f41,{name:'generator bed'});
    box([ex[0],y0+.2,Z(12.7)],[ex[1],y0+.52,Z(13.25)],GRND,{name:'generator sump'});box([ex[0],y0+.52,Z(12.65)],[ex[1],y0+.95,Z(13.3)],GRN,{name:'generator engine'});
    for(let i=0;i<4;i++){const x0=Math.min(ex[0],ex[1])+.12+i*.26;deco([x0,y0+.95,zc-.2],[x0+.2,y0+1.08,zc+.2],GRN);deco([x0+.02,y0+1.08,zc-.16],[x0+.18,y0+1.18,zc+.16],COV);}
    bar([ex[0],y0+1.05,zc+.28],[ex[1],y0+1.05,zc+.28],.05,LAG,'paint');cyl(.11,.11,.16,[s*1.7,y0+1.05,zc+.28],CAST,{rot:[0,0,Math.PI/2],seg:14,name:'generator turbocharger'});
    bar([s*1.75,y0+1.1,zc+.28],[s*1.75,y1-.15,zc+.28],.09,LAG,'paint');
    cyl(.32,.32,.6,[s*2.05,y0+.6,zc],L.alternator,{rot:[0,0,Math.PI/2],seg:18,name:'alternator'});for(const k of [-.2,-.1,0,.1,.2])cyl(.335,.335,.02,[s*(2.05+k),y0+.6,zc],0x1f2f52,{rot:[0,0,Math.PI/2],seg:18});
    deco([s*2.05-.1,y0+.92,zc-.12],[s*2.05+.1,y0+1.08,zc+.12],COV);
    plate(makerPlate('genset',s>0?1:2),.3,.14,[s*1.2,y0+.42,Z(12.55)-.005],Math.PI,{name:'maker’s plate: generator No.'+(s>0?1:2)});
   }
  }
  // Port, along her side: the air compressor and the two 150 L starting-air bottles by the ladder's foot, the
  // workbench with its vice, the fuel purifier, the oily-water separator.
  // (The bottles stand against the aft bulkhead, side by side, so the way forward from the ladder's foot is clear.)
  bar([2.3,y0,Z(8.75)],[2.3,y0+1.3,Z(8.75)],.2,0x4f8fb0);bar([2.75,y0,Z(8.75)],[2.75,y0+1.3,Z(8.75)],.2,0x4f8fb0);
  box([2.08,y0,a],[2.97,y0+1.3,Z(8.97)],0x4f8fb0,{draw:false,name:'air bottles'});
  box([2.1,y0,Z(8.97)],[2.5,y0+.6,Z(9.3)],0x5f6a6c,{name:'air compressor'});
  box([W-.35,y0,Z(10.0)],[W,y0+.9,Z(11.5)],0x8a7356,{name:'workbench'});deco([W-.32,y0+.9,Z(10.2)],[W-.2,y0+1.05,Z(10.45)],STEEL);
  box([W-.5,y0,Z(11.7)],[W,y0+1.1,Z(12.3)],0x9aa3a2,{name:'fuel purifier'});
  box([W-.55,y0,Z(12.6)],[W,y0+1.0,Z(13.5)],0x6f8a7f,{name:'oily-water separator'});
  // Starboard: the control booth aft (2.4 × 2.0 m, glazed towards the engines), the pumps along her side (two fire
  // pumps, the general-service pump, the bilge pump, the sanitary pump, the hydrophore set), the fuel service tank
  // in the forward corner.
  {const B0=Z(8.6),B1=Z(10.9),BI=-2.35;
   wall('x',-W,BI,B1-T/2,B1+T/2,y0,y1,[doorAt(-2.95,.7,y0,1.85)],0xd8d2c0);
   wall('z',a,B1,BI-T/2,BI+T/2,y0,y1,[{s0:Z(9.2),s1:Z(10.5),y0:y0+1.0,y1:y0+1.7,glass:true}],0xd8d2c0);
   deco([-W,y0+.003,a],[BI,y0+.008,B1],0x7d7a6c);
   box([-W+.02,y0,a+.02],[BI-.1,y0+1.85,a+.4],0x9aa3a2,{name:'main switchboard'});
   for(let i=0;i<5;i++){deco([-W+.1+i*.3,y0+1.1,a+.39],[-W+.35+i*.3,y0+1.6,a+.41],0x3a4244);deco([-W+.15+i*.3,y0+1.35,a+.41],[-W+.3+i*.3,y0+1.5,a+.42],0xf0ece0);}
   box([-W+.02,y0,Z(9.6)],[-W+.5,y0+.8,Z(10.6)],0x9aa3a2,{name:'engine panel and log desk'});deco([-W+.05,y0+.8,Z(9.65)],[-W+.45,y0+.82,Z(10.55)],0xe8e2cc);
   bar([-3.1,y0,Z(10.0)],[-3.1,y0+.45,Z(10.0)],.2,0x3a4244);box([-3.3,y0,Z(10.0)-.2],[-2.9,y0+.45,Z(10.0)+.2],0x3a4244,{draw:false,name:'booth chair'});
   floor('control-booth',[-W,BI],[a,B1+.4],y0,(x,z,r)=>{if(z>B1-T/2-r)return Math.abs(x+2.95)<=.35-r+.06;return x>=-W+.5+r&&x<=BI-T/2-r&&z>=a+.4+r;});
  }
  for(let i=0;i<6;i++){const z=Z(11.0)+i*.27;box([-W,y0,z],[-W+.5,y0+.55,z+.25],i<2?RED:i===3?0x3f8a5a:0x4f7fb0,{name:'pump'});bar([-W+.25,y0+.55,z+.125],[-W+.25,y0+.85,z+.125],.1,0x5f6a6c);}
  // The fuel service tank (1.6 m³) in the forward starboard corner, its gauge glass and quick-closing valve.
  box([-W,y0,Z(12.62)],[-(W-.65),y0+1.8,f],0x8a6a3a,{name:'fuel service tank'});deco([-(W-.66),y0+.2,Z(13.0)],[-(W-.67),y0+1.6,Z(13.05)],0xdfe8ee);
  // Pipes along her sides overhead: fuel (brown), sea water (green), fresh water (blue), fire main (red).
  for(const s of [1,-1])for(const [k,hex] of [[0,0x8a6a3a],[1,0x3f8a5a],[2,0x4f7fb0],[3,RED]])bar([s*(W-.12-k*.12),y1-.1,a+.1],[s*(W-.12-k*.12),y1-.1,f-.1],.035,hex,'paint');
  // The escape ladder in the aft starboard corner, up the trunk into casing S (its hatch closed above).
  for(const x of [-W+.15,-W+.55])bar([x,y0,a+.12],[x,y1,a+.12],.025,STEEL);for(let yy=y0+.3;yy<y1;yy+=.3)bar([-W+.15,yy,a+.12],[-W+.55,yy,a+.12],.018,STEEL);
  // Hand rails round each main engine on stanchions, 0.4 m off its block (yellow: a thing you hold in a seaway and never
  // step over), and the cable trays along the deckhead from the switchboard to the generators and the pumps.
  for(const s of [1,-1]){const X=S2(s,.65,2.45),z0=Z(9.3),z1=Z(12.4);
   const posts=[[X[0],z0],[X[1],z0],[X[0],z1],[X[1],z1],[X[0],(z0+z1)/2],[X[1],(z0+z1)/2]];
   for(const [px,pz] of posts)bar([px,y0,pz],[px,y0+.95,pz],.02,YELLOW,'paint');
   for(const h of [.5,.95]){bar([X[0],y0+h,z0],[X[0],y0+h,z1],.018,YELLOW,'paint');bar([X[1],y0+h,z0],[X[1],y0+h,z1],.018,YELLOW,'paint');bar([X[0],y0+h,z0],[X[1],y0+h,z0],.018,YELLOW,'paint');bar([X[0],y0+h,z1],[X[1],y0+h,z1],.018,YELLOW,'paint');}
   box([X[0]-.02,y0,z0-.02],[X[0]+.02,y0+.95,z1+.02],YELLOW,{draw:false,camera:false,name:'engine rail'});box([X[1]-.02,y0,z0-.02],[X[1]+.02,y0+.95,z1+.02],YELLOW,{draw:false,camera:false,name:'engine rail'});
   box([X[0],y0,z0-.02],[X[1],y0+.95,z0+.02],YELLOW,{draw:false,camera:false,name:'engine rail'});box([X[0],y0,z1-.02],[X[1],y0+.95,z1+.02],YELLOW,{draw:false,camera:false,name:'engine rail'});
   deco([s*2.6-.15,y1-.3,a+.2],[s*2.6+.15,y1-.22,f-.2],0x8c9193,{cls:'metal'});for(let z=a+.6;z<f;z+=.5)deco([s*2.6-.16,y1-.32,z-.01],[s*2.6+.16,y1-.2,z+.01],0x6f7476,{cls:'metal'});
  }
  // What a watchkeeper works with. The sea chests, low against her sides forward, their suction valves and strainers
  // (the cooling and fire pumps draw through them); each main engine's local control stand at its gearbox, for
  // when the bridge control fails; the fuel lines from the service tank to the engines; the shaft seals where the
  // shafts leave through the aft bulkhead; two 200 L lubricating-oil drums; the tool board; the extinguishers; the
  // CO₂ nozzles overhead; the sounding pipes to the double bottom's tanks; the telephone to the bridge in the booth.
  for(const s of [1,-1]){
   const x=s*(W-.35);box([Math.min(x-.25,x+.25),y0,Z(13.0)],[Math.max(x-.25,x+.25),y0+.35,Z(13.3)],0x3f8a5a,{draw:s>0?false:true,name:'sea chest'});
   bar([x,y0+.35,Z(13.15)],[x,y0+.7,Z(13.15)],.09,0x3f8a5a,'paint');bar([x-.12,y0+.72,Z(13.15)],[x+.12,y0+.72,Z(13.15)],.012,RED);
   const cx=s*1.55;box([cx+s*.55-.15,y0,Z(9.15)],[cx+s*.55+.15,y0+1.05,Z(9.45)],0x9aa3a2,{name:'local control stand'});
   bar([cx+s*.55,y0+1.05,Z(9.3)],[cx+s*.55,y0+1.3,Z(9.4)],.015,RED);
   bar([cx,y0+.45,a+.02],[cx,y0+.45,a+.12],.11,0x6f7476);
   bar([s*-.4,y1-.25,Z(13.6)],[cx,y1-.25,Z(13.6)],.015,0x8a6a3a,'paint');bar([cx,y1-.25,Z(13.6)],[cx,y0+.9,Z(12.4)],.015,0x8a6a3a,'paint');
   for(const z of [Z(9.5),Z(12.4)])bar([s*.9,y1-.02,z],[s*.9,y1-.15,z],.03,0xb03a2a);
   bar([s*(W-.08),y0,Z(10.8)],[s*(W-.08),y1,Z(10.8)],.025,0x7d8586);bar([s*(W-.08),y0,Z(12.0)],[s*(W-.08),y1,Z(12.0)],.025,0x7d8586);
  }
  bar([-(W-.8),y1-.25,Z(13.6)],[.4,y1-.25,Z(13.6)],.02,0x8a6a3a,'paint');
  for(const z of [Z(13.55),Z(13.85)])bar([3.55,y0,z],[3.55,y0+.88,z],.29,0x2f5e9a,'paint');
  box([3.25,y0,Z(13.35)],[3.85,y0+.88,f],0x2f5e9a,{draw:false,name:'lubricating-oil drums'});
  deco([1.0,y0+.9,f-.02],[2.2,y0+1.6,f],0xd8d2c0);for(let i=0;i<6;i++)deco([1.1+i*.18,y0+1.1,f-.04],[1.14+i*.18,y0+1.45,f-.02],STEEL);
  for(const [x,z] of [[3.0,Z(9.6)],[-2.2,Z(11.2)],[.75,Z(13.8)]]){bar([x,y0,z],[x,y0+.55,z],.08,RED,'paint');}
  for(let z=a+.8;z<f-.4;z+=1.1)for(const x of [-.9,.9])bar([x,y1,z],[x,y1-.1,z],.02,0xb8b8b8);
  for(const x of [-1.0,1.0])bar([x,y0,Z(8.75)],[x,y0+.5,Z(8.75)],.025,0x6f7476);
  deco([-2.75,y0+1.2,a+.4],[-2.6,y0+1.45,a+.48],DARK);
  // The floor: the plates, round the engines, the generators and what stands on them.
  floor('engine-room',[-W,W],[a,f],y0,(x,z,r)=>Math.abs(x)<=W-r&&z>=a+r&&z<=f-r&&!(x<-2.35+r&&z<Z(10.9)+r));
 }
 return Object.freeze({boxes:Object.freeze(boxes),bars:Object.freeze(bars),glass:Object.freeze(glass),floors:Object.freeze(floors),cyls:Object.freeze(cyls),plates:Object.freeze(plates)});
})();

/** Where the car deck is no floor: under the flights of stair P and S, inside the casings (up to the foot, where the stair takes over). */
export function underStair(x,z,r=0){
 if(Math.abs(x)>CAS_IN-r&&z>S.head-r&&z<S.foot)return true;
 // The engine room's hatch in casing P, where its ladder goes down.
 return x>ER.hatch.x[0]-r&&z>ER.hatch.z[0]-r+.05&&z<ER.hatch.z[1];
}
export const FERRY_CASING_LIMITS=Object.freeze({aft:CAS0,fore:CAS1,inner:CAS_IN,outer:CAS_OUT,top:CAS_TOP});
