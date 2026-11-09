#!/usr/bin/env node
/**
 * The Minato Maru's working drawings, Rev C: her built section by section, every sheet drawn from the game's own model
 * with the issues found in that section marked and listed.
 *
 * The owner, 9 November 2026: "Start a revision C the ferry has lots of issues at the moment so if you can create working
 * cads this will be helpful build her in sections start with exterior then cargo deck engine room bridge, accommodation
 * toilet galley etc".
 *
 *   C1  Exterior                      profiles, plan, bow and stern, four body sections        1:100
 *   C2  Car deck                      plan cut 1.5 m above it, centreline section, four sections 1:50
 *   C3  Engine room and machinery     plan cut 1.5 m above the floor plates, sections          1:50
 *   C4  Bridge                        wheelhouse and wings, sections, the compass deck          1:25 · 1:50
 *   C5  Passenger accommodation       lobby, carpet room, saloon, open deck                     1:50
 *   C6  Crew accommodation            the bridge deck house: cabins, corridor, stores           1:50
 *   C7  Toilets                       passengers' toilets and the crew WC                        1:25
 *   C8  Galley and mess               the crew's galley and mess room                           1:25
 *
 * How: buildFerryModel() is built in Node as the game builds it (tools/ferry-cad-core.mjs), cut by the plane of each
 * plan or section and cropped to the section, with hidden lines removed. The general arrangement (ferry-ship.js FERRY_GA,
 * the design) is drawn dashed over each plan, so a room built away from its design shows. tools/ferry-audit.mjs finds
 * the issues in her data; each is numbered F1… for the set, marked on its section's plan and listed on the sheet:
 * red for a clash (wrong), amber for a check (often wrong, sometimes meant).
 *
 * Run: node tools/ferry-cad.mjs → docs/minato-maru/rev-c/ (SVG, DXF, one PDF, PNG previews, issues.json).
 * The PDF and PNG need the pre-installed Chromium (Playwright); --no-pdf writes only SVG, DXF and JSON.
 * --only=C3 draws one sheet (its SVG, DXF and PNG; the PDF and issues.json are written only for the whole set).
 */
import {writeFileSync,mkdirSync,rmSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from '../tests/fixtures.mjs';
import {soup,topology,hiddenLine,A1,sheet,LAYERS,toSVG,toDXF,tw,wrap,place,viewTitle,level,frameAndTitle,r2} from './ferry-cad-core.mjs';
installDOM();globalThis.self=globalThis;
// Every piece remembers the line of ferry-interior.js that made it, so an issue names where to fix it.
globalThis.__KIT_TRACE__=true;
const {buildFerryModel}=await import('../src/world/ferry-model.js');
const {FERRY_SHIP,FERRY_HEIGHTS:FH,FERRY_GA}=await import('../src/world/ferry-ship.js');
const {auditFerry}=await import('./ferry-audit.mjs');
const {FERRY_INTERIOR}=await import('../src/world/ferry-interior.js');

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..'),OUT=join(ROOT,'docs','minato-maru','rev-c');
const DATE='2026-11-09',REV='C';
const HALF=FERRY_SHIP.length/2,DRAFT=FERRY_SHIP.draft;
/** Shipyard figures to her frame: yard from the transom → z; height above the keel → y. */
const Z=yd=>yd-HALF,Y=hk=>hk-DRAFT;
const META={source:'tools/ferry-cad.mjs',sheets:8,date:DATE,rev:REV,revNote:'working set by section',status:'WORKING DRAWING',
 checked:'owner review open',disclaimer:'WORKING DRAWINGS OF THE GAME MODEL · Johansson World vessel · no flag, class or construction approval · buildFerryModel() as built, cut and drawn with hidden lines removed · issues from tools/ferry-audit.mjs'};

// Rev C's own pens: the design (general arrangement) dashed, the checks in amber, the yard scale.
Object.assign(LAYERS,{
 'GA':{w:.25,c:'#3f7f86',aci:4,dash:'4 1.5'},'GA-TEXT':{w:0,c:'#3f7f86',aci:4},
 'CHECK':{w:.35,c:'#b7791f',aci:40},'CHECK-TEXT':{w:0,c:'#b7791f',aci:40},
});

// ------------------------------------------------------------------ views
/** A plan cut `h` m above the keel, looking down, cropped to yards z0–z1 (and above `floor`, so wells show no deck below). */
const planCut=({h,z,floor=null,x=[-4.6,4.6]})=>({view:'plan',kind:'plan',h,
 clip:[{axis:1,value:Y(h),keep:-1},{axis:2,value:Z(z[0]),keep:1,cut:false},{axis:2,value:Z(z[1]),keep:-1,cut:false},
  ...(floor!==null?[{axis:1,value:Y(floor),keep:1,cut:false}]:[]),{axis:0,value:x[0],keep:1,cut:false},{axis:0,value:x[1],keep:-1,cut:false}],
 range:{u:[Z(z[0]),Z(z[1])],v:[x[0],x[1]]}});
/** A longitudinal section at x (+ port), looking from starboard to port: her port side beyond. */
const longCut=({x,z,h})=>({view:'starboard',kind:'long',x,
 clip:[{axis:0,value:x,keep:1},{axis:2,value:Z(z[0]),keep:1,cut:false},{axis:2,value:Z(z[1]),keep:-1,cut:false},{axis:1,value:Y(h[0]),keep:1,cut:false},{axis:1,value:Y(h[1]),keep:-1,cut:false}],
 range:{u:[Z(z[0]),Z(z[1])],v:[Y(h[0]),Y(h[1])]}});
/** A cross-section at a yard, looking forward (port on the left) or aft (port on the right). */
const crossCut=({yard,look='fwd',h,x=[-4.6,4.6]})=>({view:look==='fwd'?'stern':'bow',kind:'cross',yard,look,
 clip:[{axis:2,value:Z(yard),keep:look==='fwd'?1:-1},{axis:1,value:Y(h[0]),keep:1,cut:false},{axis:1,value:Y(h[1]),keep:-1,cut:false},{axis:0,value:x[0],keep:1,cut:false},{axis:0,value:x[1],keep:-1,cut:false}],
 range:{u:look==='fwd'?[-x[1],-x[0]]:[x[0],x[1]],v:[Y(h[0]),Y(h[1])]}});
/** An outside view of the whole ship. */
const outside=(view,range)=>({view,kind:'outside',range,
 // Cropped to the range across (a plan to her breadth, the gangway's stowage outside it is left off).
 clip:view==='plan'?[{axis:0,value:range.v[0],keep:1,cut:false},{axis:0,value:range.v[1],keep:-1,cut:false},{axis:2,value:range.u[0],keep:1,cut:false},{axis:2,value:range.u[1],keep:-1,cut:false}]:null});
const SHIP_U=[Z(-.4),Z(35.4)],SHIP_V=[Y(-.2),Y(18.3)],BEAM=[-4.6,4.6],WING=[-4.3,4.3];
const DECK={hold:FH.carDeck,car:FH.passengerDeck,passenger:FH.bridgeDeck,bridge:FH.compassDeck};
const LEVELS=[['KEEL',0],['TANK TOP',FH.tankTop],['FLOOR PLATES',FH.floorPlates],['CAR DECK',FH.carDeck],['PASSENGER DECK',FH.passengerDeck],['BRIDGE DECK',FH.bridgeDeck],['COMPASS DECK',FH.compassDeck]];
const gaOf=id=>FERRY_GA.find(s=>s.id===id);

// ------------------------------------------------------------------ the set
/** Each sheet: its views (with their place on the sheet, top left, in mm), which issues are its, and where its table goes. */
const SHEETS=[
 {no:'C1',name:'exterior',title:'EXTERIOR · at sea, ramp raised',subtitle:'Profiles, plan, bow and stern elevations and four body sections',scales:['1:100','on A1'],
  issues:f=>!f.space||['open-deck','walkway-p','walkway-s','wing-p','wing-s','compass-deck','aft-mooring','bow-house-p','bow-house-s','ramp'].includes(f.space),
  views:[
   {at:[25,32],scale:100,title:'STARBOARD PROFILE',...outside('starboard',{u:SHIP_U,v:SHIP_V}),levels:true,ruler:true},
   {at:[25,252],scale:100,title:'PORT PROFILE',...outside('port',{u:[-SHIP_U[1],-SHIP_U[0]],v:SHIP_V}),levels:true},
   {at:[25,462],scale:100,title:'PLAN FROM ABOVE',...outside('plan',{u:SHIP_U,v:BEAM}),ruler:true,marks:true},
   {at:[420,32],scale:100,title:'BOW, LOOKING AFT',...outside('bow',{u:BEAM,v:SHIP_V})},
   {at:[528,32],scale:100,title:'STERN, LOOKING FWD',...outside('stern',{u:BEAM,v:SHIP_V})},
   {at:[420,262],scale:100,title:'BODY SECTION AT 3.0',...crossCut({yard:3,h:[-.2,14]})},
   {at:[528,262],scale:100,title:'BODY SECTION AT 11.0',...crossCut({yard:11,h:[-.2,14]})},
   {at:[420,420],scale:100,title:'BODY SECTION AT 20.5',...crossCut({yard:20.5,h:[-.2,14]})},
   {at:[528,420],scale:100,title:'BODY SECTION AT 31.0',...crossCut({yard:31,h:[-.2,14]})},
  ],table:{x:640,y:30,w:186}},
 {no:'C2',name:'car-deck',title:'CAR DECK',subtitle:'Lanes, casings, lower lobby, foyer, bow houses and mooring stations',scales:['1:50','on A1'],deck:'car',
  issues:f=>f.deck==='car',
  views:[
   {at:[25,32],scale:50,title:'CAR DECK · plan cut 1.5 m above it',...planCut({h:FH.carDeck+1.5,z:[-.4,35.4],floor:FH.carDeck-1}),ruler:true,marks:true,ga:'car'},
   {at:[25,248],scale:50,title:'SECTION ON THE CENTRELINE · looking to port',...longCut({x:.05,z:[-.4,35.4],h:[FH.carDeck-.6,FH.passengerDeck+.35]}),levels:true,ruler:true},
   {at:[25,380],scale:50,title:'AT 7.0 · LOWER LOBBY',...crossCut({yard:7,h:[FH.carDeck-.6,FH.passengerDeck+.35]})},
   {at:[211,380],scale:50,title:'AT 13.0 · FOYER AND CASINGS',...crossCut({yard:13,h:[FH.carDeck-.6,FH.passengerDeck+.35]})},
   {at:[397,380],scale:50,title:'AT 22.0 · LANES',...crossCut({yard:22,h:[FH.carDeck-.6,FH.passengerDeck+.35]})},
   {at:[583,380],scale:50,title:'AT 32.0 · BOW HOUSES',...crossCut({yard:32,h:[FH.carDeck-.6,FH.passengerDeck+.35]})},
  ],table:{x:25,y:494,w:612,h:80},legend:{x:748,y:32}},
 {no:'C3',name:'engine-room',title:'ENGINE ROOM AND MACHINERY SPACES',subtitle:'Steering gear, shaft space, engine room, auxiliary room, workshops, bow thruster',scales:['1:50','on A1'],deck:'hold',
  issues:f=>f.deck==='hold',
  views:[
   {at:[25,32],scale:50,title:'MACHINERY SPACES · plan cut 1.5 m above the floor plates',...planCut({h:FH.floorPlates+1.5,z:[-.4,35.4]}),ruler:true,marks:true,ga:'hold'},
   {at:[25,248],scale:50,title:'SECTION ON THE CENTRELINE · looking to port',...longCut({x:.05,z:[-.4,35.4],h:[-.2,FH.carDeck+.3]}),levels:true,ruler:true},
   {at:[25,378],scale:50,title:'AT 1.5 · STEERING GEAR',...crossCut({yard:1.5,h:[-.2,FH.carDeck+.3]})},
   {at:[211,378],scale:50,title:'AT 11.0 · ENGINE ROOM',...crossCut({yard:11,h:[-.2,FH.carDeck+.3]})},
   {at:[397,378],scale:50,title:'AT 16.5 · AUXILIARY ROOM',...crossCut({yard:16.5,h:[-.2,FH.carDeck+.3]})},
   {at:[583,378],scale:50,title:'AT 24.0 · ELECTRICAL WORKSHOP',...crossCut({yard:24,h:[-.2,FH.carDeck+.3]})},
  ],table:{x:25,y:494,w:612,h:80},legend:{x:748,y:32}},
 {no:'C4',name:'bridge',title:'BRIDGE · wheelhouse, wings and compass deck',subtitle:'Consoles, steering stand, chart table, crew stair well, wing consoles',scales:['1:25','1:50 compass deck'],deck:'bridge',
  issues:f=>['wheelhouse','wing-p','wing-s','compass-deck'].includes(f.space),
  views:[
   {at:[25,40],scale:25,title:'WHEELHOUSE AND WINGS · plan cut 1.5 m above the deck',...planCut({h:FH.bridgeDeck+1.5,z:[19.2,23.6],floor:FH.bridgeDeck-.8,x:WING}),marks:true,ga:'bridge',ruler:true},
   {at:[230,40],scale:25,title:'AT 21.4 · LOOKING FORWARD',...crossCut({yard:21.4,h:[FH.bridgeDeck-.3,FH.compassDeck+1.2],x:WING}),levels:true},
   {at:[230,225],scale:25,title:'AT 21.4 · LOOKING AFT',...crossCut({yard:21.4,look:'aft',h:[FH.bridgeDeck-.3,FH.compassDeck+1.2],x:WING}),levels:true},
   {at:[230,412],scale:25,title:'ON THE CENTRELINE · looking to port',...longCut({x:.05,z:[19.2,23.6],h:[FH.bridgeDeck-.3,FH.compassDeck+1.2]}),levels:true},
   {at:[475,412],scale:50,title:'COMPASS DECK FROM ABOVE',...outside('plan',{u:[Z(19.2),Z(23.6)],v:WING}),ga:'compass'},
  ],table:{x:640,y:30,w:186,h:150},rooms:['wheelhouse','wing-p','wing-s','compass-deck']},
 {no:'C5',name:'passenger-accommodation',title:'PASSENGER ACCOMMODATION',subtitle:'Open deck, lobby, toilets, carpet room, saloon, walkways, crew stair',scales:['1:50','on A1'],deck:'passenger',
  issues:f=>f.deck==='passenger',
  views:[
   {at:[25,32],scale:50,title:'PASSENGER DECK · plan cut 1.5 m above it',...planCut({h:FH.passengerDeck+1.5,z:[-.4,23.8],floor:FH.passengerDeck-1}),ruler:true,marks:true,ga:'passenger'},
   {at:[25,250],scale:50,title:'SECTION AT 1.3 TO PORT · looking to port',...longCut({x:1.3,z:[-.4,23.8],h:[FH.passengerDeck-.4,FH.bridgeDeck+.3]}),levels:true,ruler:true},
   {at:[25,346],scale:50,title:'AT 7.5 · LOBBY',...crossCut({yard:7.5,h:[FH.passengerDeck-.4,FH.bridgeDeck+.3]})},
   {at:[211,346],scale:50,title:'AT 14.0 · CARPET ROOM',...crossCut({yard:14,h:[FH.passengerDeck-.4,FH.bridgeDeck+.3]})},
   {at:[397,346],scale:50,title:'AT 20.5 · SALOON',...crossCut({yard:20.5,h:[FH.passengerDeck-.4,FH.bridgeDeck+.3]})},
   {at:[25,446],scale:50,title:'AT 4.0 · OPEN DECK',...crossCut({yard:4,h:[FH.passengerDeck-.4,FH.bridgeDeck+.3]})},
  ],table:{x:640,y:30,w:186}},
 {no:'C6',name:'crew-accommodation',title:'CREW ACCOMMODATION · the bridge deck house',subtitle:'Emergency generator and CO2 rooms, cabins, crew WC, mess, galley, corridor',scales:['1:50','on A1'],deck:'bridge',
  issues:f=>f.deck==='bridge'&&!['wheelhouse','wing-p','wing-s','compass-deck'].includes(f.space),
  views:[
   {at:[25,32],scale:50,title:'BRIDGE DECK · plan cut 1.5 m above it',...planCut({h:FH.bridgeDeck+1.5,z:[5.4,23.8],floor:FH.bridgeDeck-.8}),ruler:true,marks:true,ga:'bridge'},
   {at:[25,250],scale:50,title:'SECTION ON THE CENTRELINE · the corridor, looking to port',...longCut({x:.05,z:[5.4,23.8],h:[FH.bridgeDeck-.4,FH.compassDeck+.4]}),levels:true,ruler:true},
   {at:[25,346],scale:50,title:'AT 7.5 · EG AND CO2 ROOMS',...crossCut({yard:7.5,h:[FH.bridgeDeck-.4,FH.compassDeck+.4]})},
   {at:[211,346],scale:50,title:'AT 10.2 · CREW AND MATE’S CABINS',...crossCut({yard:10.2,h:[FH.bridgeDeck-.4,FH.compassDeck+.4]})},
   {at:[397,346],scale:50,title:'AT 12.7 · DECKHAND’S CABIN, CREW WC',...crossCut({yard:12.7,h:[FH.bridgeDeck-.4,FH.compassDeck+.4]})},
   {at:[25,446],scale:50,title:'AT 18.0 · CHIEF’S AND MASTER’S CABINS',...crossCut({yard:18,h:[FH.bridgeDeck-.4,FH.compassDeck+.4]})},
  ],table:{x:640,y:30,w:186,h:120},rooms:['eg-room','co2-room','crew-cabin','mate-cabin','deckhand-cabin','chief-cabin','master-cabin','corridor']},
 {no:'C7',name:'toilets',title:'TOILETS · passengers’ and crew',subtitle:'Men’s to port, women’s to starboard; the crew WC and shower',scales:['1:25','on A1'],deck:'passenger',
  issues:f=>['toilets','crew-wc'].includes(f.space),
  views:[
   {at:[25,40],scale:25,title:'PASSENGERS’ TOILETS · plan 1.5 m above the deck',...planCut({h:FH.passengerDeck+1.5,z:[9.2,11.8],floor:FH.passengerDeck-.6,x:WING}),marks:true,ga:'passenger',ruler:true},
   {at:[160,40],scale:25,title:'AT 10.5 · LOOKING FORWARD',...crossCut({yard:10.5,h:[FH.passengerDeck-.3,FH.bridgeDeck+.2],x:WING}),levels:true},
   {at:[160,190],scale:25,title:'AT 10.5 · LOOKING AFT',...crossCut({yard:10.5,look:'aft',h:[FH.passengerDeck-.3,FH.bridgeDeck+.2],x:WING}),levels:true},
   {at:[160,340],scale:25,title:'MEN’S · AT 2.4 TO PORT',...longCut({x:2.4,z:[9.2,11.8],h:[FH.passengerDeck-.3,FH.bridgeDeck+.2]})},
   {at:[290,340],scale:25,title:'WOMEN’S · AT 2.4 TO STBD',...longCut({x:-2.4,z:[9.2,11.8],h:[FH.passengerDeck-.3,FH.bridgeDeck+.2]})},
   {at:[25,440],scale:25,title:'CREW WC · plan',...planCut({h:FH.bridgeDeck+1.5,z:[11.3,14.2],floor:FH.bridgeDeck-.6,x:[-3.3,-.2]}),marks:true,ga:'bridge'},
   {at:[420,340],scale:25,title:'CREW WC · AT 12.7 LOOKING FWD',...crossCut({yard:12.7,h:[FH.bridgeDeck-.3,FH.compassDeck+.2],x:[-3.3,-.2]}),levels:true},
  ],table:{x:640,y:30,w:186,h:150},rooms:['toilets','crew-wc']},
 {no:'C8',name:'galley-mess',title:'GALLEY AND MESS',subtitle:'The crew’s galley to starboard and mess room to port, on the bridge deck',scales:['1:25','on A1'],deck:'bridge',
  issues:f=>['galley','mess'].includes(f.space),
  views:[
   {at:[25,40],scale:25,title:'GALLEY AND MESS · plan 1.5 m above the deck',...planCut({h:FH.bridgeDeck+1.5,z:[13.8,16.7],floor:FH.bridgeDeck-.6,x:[-3.3,3.3]}),marks:true,ga:'bridge',ruler:true},
   {at:[175,40],scale:25,title:'AT 15.25 · LOOKING FORWARD',...crossCut({yard:15.25,h:[FH.bridgeDeck-.3,FH.compassDeck+.2],x:[-3.3,3.3]}),levels:true},
   {at:[175,195],scale:25,title:'AT 15.25 · LOOKING AFT',...crossCut({yard:15.25,look:'aft',h:[FH.bridgeDeck-.3,FH.compassDeck+.2],x:[-3.3,3.3]}),levels:true},
   {at:[175,350],scale:25,title:'GALLEY · AT 1.7 TO STBD',...longCut({x:-1.7,z:[13.8,16.7],h:[FH.bridgeDeck-.3,FH.compassDeck+.2]})},
   {at:[330,350],scale:25,title:'MESS · AT 1.7 TO PORT',...longCut({x:1.7,z:[13.8,16.7],h:[FH.bridgeDeck-.3,FH.compassDeck+.2]})},
  ],table:{x:640,y:30,w:186,h:120},rooms:['galley','mess']},
];

// ------------------------------------------------------------------ drawing a sheet
const spaceLabel=id=>id.replace(/-/g,' ').toUpperCase();
const SEV={clash:'MARKUP',check:'CHECK'};
/** Where a view's range lands on the sheet: (u, v) in view metres → sheet mm, its top left at `at`. */
const frameOf=(v,P)=>{const k=1000/v.scale,[x,y]=v.at,{u,v:w}=v.range;return {k,x0:x,y0:y,x1:x+(u[1]-u[0])*k,y1:y+(w[1]-w[0])*k,X:a=>P.X(a),Y:b=>P.Y(b)};};

/** The room each view takes on the sheet, with its title above, its levels to the right and its scale and balloons below. */
function viewBox(v){
 const k=1000/v.scale,w=(v.range.u[1]-v.range.u[0])*k,h=(v.range.v[1]-v.range.v[0])*k,[x,y]=v.at;
 return {x0:x,y0:y-(v.marks?16:9),x1:x+w+(v.levels?30:0),y1:y+h+(v.ruler?10:0)+(v.marks?12:0),name:v.title};
}
/** Overlapping boxes on a sheet, said as a list of pairs (none when the layout is good). */
function layoutClashes(def){
 const boxes=def.views.map(viewBox),t=def.table;
 boxes.push({x0:t.x,y0:t.y-4,x1:t.x+t.w,y1:t.y+(t.h||440),name:'issue list'});
 boxes.push({x0:A1.w-10-180,y0:A1.h-10-56-34,x1:A1.w-10,y1:A1.h-10,name:'title block and notes'});
 if(def.legend)boxes.push({x0:def.legend.x,y0:def.legend.y-4,x1:def.legend.x+78,y1:def.legend.y+42,name:'legend'});
 const out=[];
 for(let i=0;i<boxes.length;i++){const a=boxes[i];if(a.x1>A1.w-10||a.y1>A1.h-10||a.x0<10||a.y0<10)out.push(`${a.name} runs off the sheet`);
  for(let j=i+1;j<boxes.length;j++){const b=boxes[j];if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)out.push(`${a.name} overlaps ${b.name}`);}}
 return out;
}
function drawSheet(def,model,audit){
 const sh=sheet(),shown=[];
 const mine=audit.findings.filter(def.issues);
 for(const v of def.views){
  const hl=hiddenLine(model,v.view,v.clip,{res:v.scale<=25?.005:.01});
  const P=place(sh,hl,v.scale,v.at[0],v.at[1],[v.range.u[0],v.range.v[1]]),F=frameOf(v,P);
  sh.text(F.x0,F.y0-6.5,v.title,3.3,'TEXT',{bold:true});sh.text(F.x0,F.y0-2.6,'SCALE 1:'+v.scale,2.1);
  // The design, dashed: every general-arrangement space of this deck in the view.
  if(v.ga&&v.kind!=='cross'){
   for(const s of FERRY_GA){
    if(v.ga!=='all'&&s.deck!==v.ga)continue;if(v.ga==='all'&&s.deck==='hold')continue;
    const u0=Math.max(Z(s.z[0]),v.range.u[0]),u1=Math.min(Z(s.z[1]),v.range.u[1]),w0=Math.max(s.x[0],v.range.v[0]),w1=Math.min(s.x[1],v.range.v[1]);
    if(u1-u0<.2||w1-w0<.2)continue;
    const [a,b,c,d]=[P.X(u0),P.Y(w1),P.X(u1),P.Y(w0)];sh.poly([[a,b],[c,b],[c,d],[a,d]],'GA',true);
    const lab=spaceLabel(s.id),hgt=v.scale<=25?2.4:1.9;if(tw(lab,hgt)<c-a-2)sh.text(a+1,b+hgt+.8,lab,hgt,'GA-TEXT');
   }
  }
  // Deck levels on sections and profiles.
  if(v.levels)for(const [n,hk] of LEVELS){const y=P.Y(Y(hk));if(y<F.y0+1||y>F.y1-1)continue;level(sh,F.x1+1.5,y,`${n} ${hk.toFixed(2)}`,Math.max(18,tw(`${n} ${hk.toFixed(2)}`,2.2)+5));}
  // The yard scale: metres from the transom along the view's foot (forward to the right; the port profile is reversed).
  if(v.ruler){const rev=v.view==='port',y=F.y1+3;sh.line(F.x0,y,F.x1,y,'DIM');
   for(let yd=Math.ceil(v.range.u[0]+HALF);yd<=v.range.u[1]+HALF+1e-6;yd++){const u=rev?-(yd-HALF):yd-HALF;if(u<v.range.u[0]-1e-6||u>v.range.u[1]+1e-6)continue;const x=P.X(u);
    sh.line(x,y,x,y+(yd%5===0?2:1.2),'DIM');if(yd%(v.scale<=25?1:2)===0)sh.text(x,y+4.4,String(yd),1.9,'TEXT',{anchor:'middle'});}
   sh.text(F.x0,y+8.4,'yard: metres from the transom',1.9);}
  // Section marks on plans: where this sheet's sections are taken.
  if(v.kind==='plan'||v.view==='plan'){
   for(const w of def.views){
    if(w.kind==='cross'&&w.yard!==undefined){const u=Z(w.yard);if(u<v.range.u[0]||u>v.range.u[1])continue;const x=P.X(u);sh.line(x,F.y0-2,x,F.y1+1,'CENTRE');sh.text(x,F.y0-3,w.yard.toFixed(w.yard%1?2:1),2,'TEXT',{anchor:'middle',bold:true});}
    if(w.kind==='long'){const x=w.x;if(x<v.range.v[0]||x>v.range.v[1])continue;const y=P.Y(x);sh.line(F.x0-1,y,F.x1+1,y,'CENTRE');}
   }
  }
  // The issues of this sheet that lie in this plan: a balloon each, in a row above or below the view, with a leader.
  if(v.marks){
   const here=mine.filter(f=>!shown.includes(f.n)&&inPlan(v,f));const top=[],bot=[];
   for(const f of here){shown.push(f.n);const pts=[f.model,...(f.mirrorModel?[f.mirrorModel]:[])].map(m=>v.view==='plan'||v.kind==='plan'?[P.X(m[2]),P.Y(m[0])]:null);
    (f.model[0]>=(v.range.v[0]+v.range.v[1])/2?top:bot).push({f,pts});}
   for(const [list,y] of [[top,F.y0-11],[bot,F.y1+(v.ruler?13:8)]]){
    list.sort((a,b)=>a.pts[0][0]-b.pts[0][0]);let last=-Infinity;
    for(const b of list){const x=Math.max(b.pts[0][0],last+8.2);last=x;const L=SEV[b.f.severity];
     sh.circle(x,y,3.2,L);sh.text(x,y+1.1,b.f.n.slice(1),2.9,L+'-TEXT',{anchor:'middle',bold:true});
     for(const [px,py] of b.pts){const d=Math.hypot(px-x,py-y);if(d<3.4)continue;sh.line(x+(px-x)/d*3.2,y+(py-y)/d*3.2,px,py,L);sh.circle(px,py,.7,L);}}}
  }
 }
 // The table of this sheet's issues.
 drawTable(sh,def,mine,shown);
 if(def.legend)drawLegend(sh,def.legend.x,def.legend.y);
 if(def.rooms)drawRooms(sh,def);
 frameAndTitle(sh,{no:'JS-127-'+def.no,title:def.title,subtitle:def.subtitle,sheetNo:+def.no.slice(1),scales:def.scales,meta:META,
  notes:[`Drawn from buildFerryModel() as the game builds it: plans are cut by a horizontal plane and sections by a vertical one, and what is cut is drawn heavy, what lies beyond in outline. The design (general arrangement, ferry-ship.js) is dashed over each plan: a room built away from its design shows.`,
   `Issues are found in her data by tools/ferry-audit.mjs and numbered for the whole set: red a clash, amber a check. Their source lines are in issues.json.`]});
 return {sh,mine,shown};
}
/** Is a finding in this plan view: on its deck (between the deck below the cut and the cut), inside its range? */
function inPlan(v,f){
 const [x,y,z]=f.model,{u,v:w}=v.range;if(z<u[0]||z>u[1]||x<w[0]||x>w[1])return false;
 if(v.kind!=='plan')return true;const hk=y+DRAFT,deckBelow=[0,...Object.values(DECK)].filter(d=>d<=v.h).pop();
 return hk>=deckBelow-.3&&hk<=DECK[Object.keys(DECK).find(k=>DECK[k]>v.h)]+.05;
}

/** The sheet's issues as a list: a balloon, what is wrong, then where (space, yard, x, height) and the source line. */
function drawTable(sh,def,mine,shown){
 const {x,y,w}=def.table,H=(def.table.h||440),cols=w>300?2:1,cw=(w-(cols-1)*8)/cols;
 sh.text(x,y,`ISSUES IN THIS SECTION · ${mine.filter(f=>f.severity==='clash').length} clash, ${mine.filter(f=>f.severity==='check').length} check`,3.2,'TEXT',{bold:true});
 if(!mine.length){sh.text(x,y+6,'None found by the audit. What it cannot see (a door in the wrong place, a missing',2.2);sh.text(x,y+9,'handrail, a room wrong for its use) is for the owner’s review of the drawing.',2.2);return;}
 let col=0,cy=y+6.5;const bottom=y+H;
 for(const [i,f] of mine.entries()){
  const L=SEV[f.severity],cx=x+col*(cw+8),side=f.sides==='both'?'±'+Math.abs(f.at.x).toFixed(2):Math.abs(f.at.x).toFixed(2)+(f.at.x>=0?' P':' S');
  const lines=wrap(f.what+(shown.includes(f.n)?'':' · not on this sheet’s plans'),cw-9,2.05);
  const foot=`${f.space?spaceLabel(f.space):'—'} · yard ${f.at.yard.toFixed(2)} · x ${side} · h ${f.at.h.toFixed(2)}${f.source?.length?' · '+f.source.join(', '):''}`;
  const need=(lines.length+1)*2.7+1.6;
  if(cy+need>bottom){if(col+1<cols){col++;cy=y+6.5;}else{sh.text(cx,cy+1,`… and ${mine.length-i} more: issues.json`,2.1,'TEXT',{bold:true});break;}}
  const bx=x+col*(cw+8);
  sh.circle(bx+2.6,cy-.7,2.3,L);sh.text(bx+2.6,cy+.1,f.n.slice(1),2,L+'-TEXT',{anchor:'middle',bold:true});
  lines.forEach((l,k)=>sh.text(bx+7,cy+k*2.7,l,2.05));sh.text(bx+7,cy+lines.length*2.7,foot,1.75,L+'-TEXT');
  cy+=need;
 }
}
/** The named fittings built in a general-arrangement space (boxes and cylinders of ferry-interior.js), counted. */
function builtIn(id){
 const s=gaOf(id),inS=p=>p[2]+HALF>=s.z[0]&&p[2]+HALF<=s.z[1]&&p[0]>=s.x[0]&&p[0]<=s.x[1]&&p[1]+DRAFT>=s.y[0]-.1&&p[1]+DRAFT<=s.y[1];
 const n=new Map();for(const b of FERRY_INTERIOR.boxes){if(!b.name||!b.draw)continue;const c=b.a.map((v,k)=>(v+b.b[k])/2);if(inS(c))n.set(b.name,(n.get(b.name)||0)+1);}
 for(const c of FERRY_INTERIOR.cyls)if(c.name&&inS(c.pos))n.set(c.name,(n.get(c.name)||0)+1);
 return [...n].map(([k,c])=>c>1?`${k} ×${c}`:k);
}
/** For each room: what the design says it holds, and what is built in it, so a missing fitting shows. */
function drawRooms(sh,def){
 const x=def.table.x,w=def.table.w;let y=def.table.y+def.table.h+8;
 sh.text(x,y,'DESIGN AND AS BUILT',3.2,'TEXT',{bold:true});y+=3.5;
 sh.text(x,y,'The general arrangement’s words (ferry-ship.js), then the named fittings built in the room (ferry-interior.js).',1.8);y+=4.5;
 for(const id of def.rooms){const s=gaOf(id),built=builtIn(id);
  if(y>A1.h-10-56-40)break;
  sh.text(x,y,spaceLabel(id),2.3,'TEXT',{bold:true});y+=3;
  for(const l of wrap('Design: '+s.what,w,1.9)){sh.text(x,y,l,1.9);y+=2.5;}
  for(const l of wrap('Built: '+(built.join(', ')||'no named fittings'),w,1.9)){sh.text(x,y,l,1.9,'GA-TEXT');y+=2.5;}
  y+=2.2;}
}
function drawLegend(sh,x,y){
 sh.text(x,y,'LINES AND MARKS',3,'TEXT',{bold:true});
 [['CUT','Cut by the plane'],['OUTLINE','Outline beyond'],['DETAIL','Feature edges'],['GA','The design (general arrangement)'],['CENTRE','Where a section is taken']].forEach(([L,t],i)=>{sh.line(x,y+5+i*4.6,x+12,y+5+i*4.6,L);sh.text(x+15,y+6+i*4.6,t,2.1);});
 const yb=y+30;sh.circle(x+4,yb,2.6,'MARKUP');sh.text(x+4,yb+.9,'1',2.4,'MARKUP-TEXT',{anchor:'middle',bold:true});sh.text(x+10,yb+.8,'Clash: wrong, to fix',2.1);
 sh.circle(x+4,yb+7,2.6,'CHECK');sh.text(x+4,yb+7.9,'2',2.4,'CHECK-TEXT',{anchor:'middle',bold:true});sh.text(x+10,yb+7.8,'Check: look at it',2.1);
}

// ------------------------------------------------------------------ build
async function main(){
 const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7),noPdf=process.argv.includes('--no-pdf');
 mkdirSync(OUT,{recursive:true});const t0=Date.now(),log=s=>console.log(`[${((Date.now()-t0)/1000).toFixed(1)} s] ${s}`);
 const ship=buildFerryModel();
 // Posed as the game poses her with someone aboard below deck: the engine room shown, its Blender model loaded by the
 // game's own loader (ferry-engine-room-asset.js), from this checkout's file rather than the live site.
 const live=globalThis.fetch;
 globalThis.fetch=async(input,init)=>{const url=new URL(typeof input==='string'?input:input.url),m=url.pathname.match(/\/johansson-town\/(assets\/.+)$/);
  return m?new Response(readFileSync(join(ROOT,decodeURIComponent(m[1])))):live(input,init);};
 const h1=ship.userData.engineRoomH1;
 if(h1){h1.group.visible=true;await h1.ensure();if(!h1.loaded)throw Error('The engine room’s Blender model did not load: '+h1.error);}
 if(ship.userData.belowDeck)ship.userData.belowDeck.plates.visible=true;
 globalThis.fetch=live;ship.updateMatrixWorld(true);
 const scene=new THREE.Scene();scene.add(ship);scene.updateMatrixWorld(true);
 const s=soup(ship),model={...s,...topology(s.P)};log(`model: ${s.P.length/9} triangles, ${model.edges.length} edges`);
 log(h1?`engine room: the Blender model, ${h1.bounds?'loaded':'?'}`:'engine room: no H1');
 const audit=await auditFerry({root:scene});log(`audit: ${audit.summary.total} issues (${audit.summary.clash} clash, ${audit.summary.check} check)`);
 const drawn=[];
 const crowded=SHEETS.flatMap(d=>layoutClashes(d).map(c=>`${d.no}: ${c}`));
 if(crowded.length)console.warn('LAYOUT\n  '+crowded.join('\n  '));
 for(const def of SHEETS){if(only&&def.no!==only)continue;const r=drawSheet(def,model,audit);drawn.push({def,...r});log(`${def.no} ${def.name}: ${r.mine.length} issues, ${r.shown.length} marked`);}
 const files=drawn.map(({def,sh})=>{const name=`JS-127-${def.no}-${def.name}`,svg=toSVG(sh,`Minato Maru · JS-127-${def.no} · ${def.title}`);
  writeFileSync(join(OUT,name+'.svg'),svg);writeFileSync(join(OUT,name+'.dxf'),toDXF(sh));return {name,svg};});
 if(!only)writeFileSync(join(OUT,'issues.json'),JSON.stringify({date:DATE,rev:REV,source:'tools/ferry-audit.mjs',summary:audit.summary,
  sheets:drawn.map(({def,mine,shown})=>({no:'JS-127-'+def.no,name:def.name,title:def.title,issues:mine.map(f=>f.n),marked:shown})),findings:audit.findings},null,1)+'\n');
 if(!only)writeFileSync(join(OUT,'ISSUES.md'),issuesMarkdown(audit,drawn));
 log('SVG and DXF written');
 if(noPdf)return;
 const req=createRequire(import.meta.url);let chromium;try{({chromium}=req(join(execSync('npm root -g').toString().trim(),'playwright')));}catch{({chromium}=await import('playwright'));}
 const b=await chromium.launch(),p=await b.newPage();
 if(!only){const html=`<!doctype html><meta charset="utf-8"><style>@page{size:841mm 594mm;margin:0}html,body{margin:0}svg{display:block;page-break-after:always}</style>${files.map(f=>f.svg).join('')}`;
  const tmp=join(OUT,'.print.html');writeFileSync(tmp,html);await p.goto(pathToFileURL(tmp).href);
  await p.pdf({path:join(OUT,'Minato_Maru_Working_Drawings_RevC.pdf'),width:'841mm',height:'594mm',printBackground:true,preferCSSPageSize:true});rmSync(tmp);}
 for(const f of files){await p.setViewportSize({width:3364,height:2376});await p.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0}svg{width:3364px;height:2376px;display:block}</style>${f.svg}`);await p.screenshot({path:join(OUT,f.name+'.png')});}
 await b.close();log('PDF and PNG previews written');
}
/** The issues as a readable list, generated with the sheets (ISSUES.md): by deck, with the sheet each is marked on. */
function issuesMarkdown(audit,drawn){
 const on=n=>drawn.filter(d=>d.shown.includes(n)).map(d=>'JS-127-'+d.def.no).join(', ')||'—';
 const DECKS={hold:'Below the car deck: machinery spaces',car:'Car deck',passenger:'Passenger deck',bridge:'Bridge deck',compass:'Compass deck'};
 const S=audit.summary,lines=[`# Minato Maru, Rev C: the issues found (${DATE})`,'',
  `Generated by \`node tools/ferry-cad.mjs\` from \`tools/ferry-audit.mjs\`; do not edit by hand. **${S.total} issues: ${S.clash} clash (wrong, to fix), ${S.check} check (look at it).**`,
  '',`By kind: ${Object.entries(S.byKind).filter(([,n])=>n).map(([k,n])=>`${k} ${n}`).join(' · ')}. Yard: metres from the transom; x: metres from the centreline, P to port, S to starboard (± both sides); h: metres above the keel.`];
 for(const [deck,title] of Object.entries(DECKS)){const list=audit.findings.filter(f=>f.deck===deck);if(!list.length)continue;
  lines.push('',`## ${title}`,'','| No. | | Space | Yard · x · h | What | Source | Sheet |','|---|---|---|---|---|---|---|');
  for(const f of list){const x=f.sides==='both'?'±'+Math.abs(f.at.x).toFixed(2):Math.abs(f.at.x).toFixed(2)+(f.at.x>=0?' P':' S');
   lines.push(`| ${f.n} | ${f.severity==='clash'?'**clash**':'check'} | ${f.space??'—'} | ${f.at.yard.toFixed(2)} · ${x} · ${f.at.h.toFixed(2)} | ${f.what.replace(/\|/g,'/')} | ${(f.source||[]).join(', ')||'—'} | ${on(f.n)} |`);}}
 return lines.join('\n')+'\n';
}
/** The set and its layout check, for tests (tests/ferry-cad-rev-c.test.mjs). */
export {SHEETS,layoutClashes,viewBox};
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
