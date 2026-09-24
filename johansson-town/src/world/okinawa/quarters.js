import * as THREE from '../../../vendor/three.module.js';
import {createKit,rng} from './kit.js';
import {NISHI,EAST_ROW,YARD_ROW,EAST_QUAY,EAST_BACK,GATEBALL,GOYA} from './layout.js';
import {fascia,vertical,nameplate,iceFlag,poster,coralStone,roofTile,flowerBlock,coralSand} from './signs.js';
import {redTileHouse,concreteHouse,shopHouse,coralWall,hinpun,shisa,fukugi,gajumaru,hibiscus,banana,potPlant,OKINAWA_COLOURS as C} from './houses.js';
import {utilityPole,wiresBetween,serviceDrop,keiTruck,bicycle,laundry,gasBottles,fishCrates,buoys,netPile,sabani,planterBoxes,fishingBoat} from './props.js';
import {GROUND_LAYER} from '../ground-layers.js';
import {dressOldTown} from './old-town.js';
import {MAIN_ROAD} from '../main-road.js';
import {WEST_YARD} from '../west-yard.js';
import {ONSEN_DOOR} from '../onsen-layout.js';
import {createVendingMachine,vendingReady,hydrateVending} from '../vending.js';
import {windowGlow} from '../../render/dusk.js';

/**
 * Builds the streets that fill the peninsula in: Nishi-machi to the west, the shop-houses
 * on the east side of Main Street and the two on the west side by the terminus. See
 * layout.js for the plan and houses.js / props.js for what they are made of.
 *
 * @param {object} world the town being built (group, colliders, hourly, details)
 * @param {object} options register, onAction, shadows
 */
export function buildOkinawaQuarters(world,{register,onAction,shadows=false}={}){
 const group=new THREE.Group();group.name='Okinawan quarters';world.group.add(group);
 const kit=createKit({shadows});
 kit.surface('coral',{map:coralStone(),metres:1.6});
 kit.surface('tile',{map:roofTile(),metres:.9,roughness:.8,side:THREE.DoubleSide});
 kit.surface('hana',{map:flowerBlock(),metres:.42});
 kit.surface('sand',{map:coralSand(),metres:3.2,roughness:1});
 const colliders=[];
 const solid=list=>{for(const c of [].concat(list))if(c)colliders.push(c);};
 const anchor=(x,y,z,label,fn)=>{const a=new THREE.Object3D();a.position.set(x,y,z);group.add(a);register?.(a,label,fn);return a;};
 const inspect=(x,y,z,label,title,text)=>anchor(x,y,z,label,()=>onAction?.('inspect',title,text));
 const vendings=[];
 const vending=(x,z,ry)=>{
  const machine=createVendingMachine({shadows});machine.position.set(x,0,z);machine.rotation.y=ry;group.add(machine);vendings.push(machine);
  colliders.push({id:'vending',x,z,w:Math.abs(Math.sin(ry))>.5?1:1.25,d:Math.abs(Math.sin(ry))>.5?1.25:1,height:2.2});
  anchor(x+Math.sin(ry)*.95,1,z+Math.cos(ry)*.95,'Buy a drink',()=>onAction?.('vending'));
 };

 buildNishiGround(kit,solid);
 buildNishiPlots(kit,solid,{inspect,anchor,onAction});
 buildWestQuay(kit,solid,{inspect,anchor,onAction,vending});
 buildPromenade(kit,solid,{anchor,onAction});
 buildYardRow(kit,solid,{anchor,inspect,onAction});
 buildEastRow(kit,solid,{anchor,inspect,onAction,vending});
 buildEastBack(kit,solid,{anchor,inspect,onAction});
 buildGateball(kit,solid,{anchor,inspect,onAction});
 buildEastQuay(kit,solid,{anchor,inspect,onAction,vending});
 buildWires(kit,solid);
 const old=dressOldTown(kit,solid,{inspect,anchor,onAction,vending,group});

 const {meshes,materials}=kit.finish(group,'Okinawan quarter');
 world.colliders.push(...colliders);
 // Windows light up and the lamps come on at dusk, like the rest of the town.
 (world.hourly??=[]).push(minutes=>{
  const glow=windowGlow(minutes);
  if(materials.glow)materials.glow.emissiveIntensity=glow*.75;
  if(materials.lamp)materials.lamp.emissiveIntensity=.1+glow*1.6;
  old.shutter.update(minutes);
 });
 if(!vendingReady())for(const machine of vendings)(world.details??=[]).push({id:'okinawa-vending-'+machine.id,x:machine.position.x,z:machine.position.z,radius:44,load:()=>hydrateVending(machine,{shadows})});
 return {group,meshes,colliders,materials,shutter:old.shutter};
}

/* ------------------------------ Nishi-machi ------------------------------ */

function buildNishiGround(kit,solid){
 const y=GROUND_LAYER.gravel,lane=GROUND_LAYER.lane;
 // The quarter's ground: crushed coral and sand, and concrete for the walk and lanes.
 kit.block(NISHI.minX,NISHI.maxX,y-.06,y,NISHI.minZ,NISHI.maxZ,0xb9b09a,'sand');
 const P=NISHI.promenade;
 kit.block(P.minX,P.maxX,lane-.06,lane,NISHI.quay.maxZ+.6,NISHI.maxZ,0xa9a498);
 for(let z=NISHI.quay.maxZ+2;z<NISHI.maxZ;z+=2.5)kit.box(P.maxX-P.minX,.012,.04,(P.minX+P.maxX)/2,lane+.002,z,0x9d988c);
 for(const l of NISHI.lanes){
  kit.block(P.maxX,WEST_YARD.minX+.5,lane-.06,lane,l.z-l.half,l.z+l.half,0xaaa598);
  // Concrete gutters with their slotted covers along each side.
  for(const s of [-1,1])kit.block(P.maxX,WEST_YARD.minX,lane,lane+.015,l.z+s*l.half-(s>0?.28:0),l.z+s*l.half+(s<0?.28:0),0x8d887d);
 }
 const Q=NISHI.quay;
 // Laid at the apron height: the second pier's deck runs in under its seaward edge.
 kit.block(Q.minX,Q.maxX,GROUND_LAYER.apron-.06,GROUND_LAYER.apron,Q.minZ,Q.maxZ+.6,0xa6a296);
 // The seawall along the shore, and its quay edge along the harbour.
 const S=NISHI.seawall;
 kit.block(S.x-S.thickness/2,S.x+S.thickness/2,-.7,S.height,NISHI.minZ,NISHI.maxZ+.4,0xb9b4a6);
 kit.block(S.x-S.thickness/2-.04,S.x+S.thickness/2+.04,S.height,S.height+.08,NISHI.minZ,NISHI.maxZ+.4,0xa9a497);
 solid({id:'seawall',x:S.x,z:(NISHI.minZ+NISHI.maxZ)/2,w:S.thickness+.1,d:NISHI.maxZ-NISHI.minZ+.4,height:S.height});
 kit.block(Q.minX-.6,Q.maxX,-.7,GROUND_LAYER.apron,Q.minZ-.45,Q.minZ,0xa9a497);
 kit.block(Q.minX-.6,Q.maxX,GROUND_LAYER.apron,GROUND_LAYER.apron+.12,Q.minZ-.4,Q.minZ-.1,0xe0b93a);
 solid({id:'west-quay-edge',x:(Q.minX+Q.maxX)/2,z:Q.minZ-.25,w:Q.maxX-Q.minX+.6,d:.3,height:.4});
 for(let x=Q.minX+3;x<Q.maxX-1;x+=6){kit.cyl(.16,.2,.42,x,.24,Q.minZ+.35,0x3a3f42,{segments:10});kit.cyl(.24,.24,.08,x,.47,Q.minZ+.35,0x3a3f42,{segments:10});solid({id:'bollard',x,z:Q.minZ+.35,w:.45,d:.45,height:.5});}
 // At the north end the quarter meets the headland: a stone bank with pandanus on it.
 kit.block(NISHI.minX,NISHI.maxX,0,.9,NISHI.maxZ,NISHI.maxZ+.6,0xd3cab0,'coral');
 solid({id:'nishi-north-bank',x:(NISHI.minX+NISHI.maxX)/2,z:NISHI.maxZ+.3,w:NISHI.maxX-NISHI.minX,d:.6,height:.9});
}

function buildNishiPlots(kit,solid,ctx){
 for(const [i,p] of NISHI.plots.entries()){
  if(p.kind==='shed'){netShed(kit,solid,p,ctx);continue;}
  if(p.kind==='grove'){utaki(kit,solid,p,ctx);continue;}
  walledHouse(kit,solid,p,{...ctx,seed:i,sideGate:'west',windbreak:'west'});
 }
}

/** Which way a plot's gate looks, as the turn that points a local +z that way. */
const FACING=Object.freeze({north:0,south:Math.PI,west:-Math.PI/2,east:Math.PI/2});

/**
 * A walled plot with its house: coral stone round it, a gate with shisa on the posts and
 * the family's name beside it, a hinpun inside a red-tile house's gate, fukugi along
 * the windward side and the garden things people keep. Built in the plot's own frame,
 * gate at the front (+z), whichever way that is in the world.
 */
function walledHouse(kit,solid,p,{anchor,onAction,seed=0,sideGate=null,windbreak=null}){
 const ry=FACING[p.gate],quarter=Math.abs(Math.sin(ry))>.5;
 const W=quarter?p.maxZ-p.minZ:p.maxX-p.minX,D=quarter?p.maxX-p.minX:p.maxZ-p.minZ;
 const r=rng(40+seed),hw=W/2,hd=D/2;
 // Local +x points this way in the world; used to put a side gate or a windbreak on
 // the right side of the plot whichever way it is turned.
 const sideOf=dir=>{const v={north:[0,1],south:[0,-1],east:[1,0],west:[-1,0]}[dir];if(!v)return 0;const lx=Math.cos(ry),lz=-Math.sin(ry);return Math.sign(Math.round(v[0]*lx+v[1]*lz));};
 kit.at((p.minX+p.maxX)/2,(p.minZ+p.maxZ)/2,ry,()=>{
  const gate=[-.95,.95],side=sideOf(sideGate),wind=sideOf(windbreak)||-1;
  solid(coralWall(kit,-hw,hd,hw,hd,{gaps:[gate],seed:50+seed,flowers:seed%2===0}));
  solid(coralWall(kit,-hw,-hd,hw,-hd,{seed:60+seed,flowers:seed%2===1}));
  solid(coralWall(kit,-hw,-hd,-hw,hd,{gaps:side<0?[[-.6,.6]]:[],seed:70+seed}));
  solid(coralWall(kit,hw,-hd,hw,hd,{gaps:side>0?[[-.6,.6]]:[],seed:80+seed}));
  for(const gx of gate)shisa(kit,gx,1.53,hd,0,.7);
  kit.sign(nameplate(p.family,p.romaji),.42,.21,gate[1]+.45,1.05,hd+.24,{name:'nameplate'});
  const at=kit.point(gate[1]+.45,1,hd+1);
  anchor(at.x,at.y,at.z,`Read the ${p.romaji} nameplate`,()=>onAction?.('read',`${p.family} · the ${p.romaji} house`,NAMEPLATES[p.id]));
  hibiscus(kit,gate[0]-1.1,hd-.9,{seed:90+seed});
  if(p.kind==='red-tile'){
   solid(hinpun(kit,0,hd-2,Math.min(2.6,W-3)));
   // Backed onto the rear wall, as they are: the eaves hang over it, and there is no
   // strip behind the house too narrow to walk down but wide enough to get stuck in.
   // A windbreak needs its own strip beside the house and a path inside it, so a plot
   // wide enough for one gets a narrower house; a tight plot gets no trees.
   const trees=W>=10,d=6.2,w=Math.min(7.4,W-(trees?3.8:2.6)),houseZ=-hd+.3+d/2;
   kit.at(0,houseZ,0,()=>solid(redTileHouse(kit,{w,d,seed})));
   // Fukugi down the windward side, where there is room for a row of them and a path.
   if(trees)for(let z=-hd+1.2;z<hd-.8;z+=2.2)if(Math.abs(z)>1)solid(fukugi(kit,wind*(hw-.5),z,{h:5+r.next()*1.4,seed:100+seed*10+Math.round(z*3)}));
   banana(kit,-wind*(hw-.9),-hd+.9,{seed});
   // Gas bottles against the kitchen wall, leaving the side path clear.
   if(w/2+1.4<hw)solid(gasBottles(kit,-wind*(w/2+.32),houseZ-1,{ry:Math.PI/2}));
   potPlant(kit,1.6,hd-2.2,{seed});potPlant(kit,-1.8,hd-2.3,{seed:seed+3});
   solid(planterBoxes(kit,Math.min(hw-2.6,2.2),hd-.65,{count:3,seed}));
  }else{
   // The concrete house: no hinpun, a bicycle and washing in the yard instead.
   // Against the back and the side wall, with the outside stair on the open side.
   const d=6.2,w=Math.min(6.8,W-3.4),houseZ=-hd+.35+d/2,houseX=-hw+.35+w/2;
   kit.at(houseX,houseZ,0,()=>solid(concreteHouse(kit,{w,d,seed})));
   solid(laundry(kit,1.7,hd-1.7,{length:2.2}));
   potPlant(kit,1.5,hd-1,{seed:seed+5});hibiscus(kit,hw-1,hd-1,{seed:seed+9,flower:0xe8b12c});
   bicycle(kit,2.2,hd-1.2,{ry:.2,colour:0xb03a3a});
  }
 });
}

/** The net shed at the quay end: an open-fronted timber shed with a tin roof. */
function netShed(kit,solid,p,{inspect}){
 const x0=-34.8,x1=-26.4,z0=p.minZ+.6,z1=p.maxZ-.6,h=3.1,tin=0x8c9ea3;
 kit.block(x1-.2,x1,0,h,z0,z1,tin);
 kit.block(x0+2.8,x1,0,h,z0,z0+.2,tin);kit.block(x0+2.8,x1,0,h,z1-.2,z1,tin);
 // Corrugated sheet: ribs up every wall, and the rust where the sheets overlap.
 for(let x=x0+3;x<x1;x+=.3)for(const z of [z0-.02,z1+.02])kit.box(.06,h,.04,x,h/2,z,0x7b8c91);
 for(let z=z0+.2;z<z1;z+=.3)kit.box(.04,h,.06,x1+.02,h/2,z,0x7b8c91);
 for(const [x,z] of [[x0+4.6,z0-.05],[x1-1.2,z1+.05],[x0+6.4,z1+.05]])kit.box(.5,h*.7,.02,x,h*.35,z,0x9a6a48);
 kit.box(.3,1.6,.02,x0+3.6,h-.9,z0-.06,0xe8e2d0);
 for(let z=z0;z<=z1;z+=(z1-z0)/4)kit.box(.18,h,.18,x0+.1,h/2,z,0x5d4431);
 kit.gableRoof(z1-z0,x1-x0,.9,(x0+x1)/2,h,(z0+z1)/2,0x8a9496,{ry:Math.PI/2,overhang:.5});
 // Corrugations, as ribs over the roof.
 for(let x=x0-.3;x<x1+.3;x+=.5)kit.box(.04,.03,z1-z0+1,x,h+.47-Math.abs(x-(x0+x1)/2)/((x1-x0)/2)*.45,(z0+z1)/2,0x7c8587);
 netPile(kit,x0+4,z0+2.2,{size:1.1});netPile(kit,x0+5.5,z1-2,{size:.9});
 buoys(kit,x1-.6,1.6,(z0+z1)/2,{count:10});
 for(const z of [z0+1.5,z1-1.5])kit.box(.08,.08,.08,x1-.3,2.4,z,0x5d4431);
 kit.box(.12,.9,1.8,x1-.35,1.2,(z0+z1)/2,0x3a6e8f);
 solid({id:'net-shed',x:(x0+2.8+x1)/2,z:(z0+z1)/2,w:x1-x0-2.8,d:z1-z0,height:h});
 for(let z=z0;z<=z1;z+=(z1-z0)/4)solid({id:'net-shed-post',x:x0+.1,z,w:.25,d:.25,height:h});
 inspect(x0-.4,1.2,(z0+z1)/2,'Inspect the net shed','Net shed',
  'Nets for the reef, mended where the coral took them, heaped on the floor with their floats. The orange ones are new; the glass ones are older than the harbour office. A sign on the post says 網の上を歩かないで — don’t walk on the nets.');
}

/** The utaki: the neighbourhood's sacred grove, where nobody builds and nobody shouts. */
function utaki(kit,solid,p,{anchor,onAction,inspect}){
 const cx=-30.8,cz=(p.minZ+p.maxZ)/2;
 kit.block(p.minX,p.maxX,GROUND_LAYER.gravel,GROUND_LAYER.gravel+.02,p.minZ,p.maxZ,0x8f8a6e,'sand');
 solid(coralWall(kit,p.minX,p.minZ,p.maxX,p.minZ,{height:.9,gaps:[[cx-1,cx+1]],seed:120}));
 solid(coralWall(kit,p.minX,p.minZ,p.minX,p.maxZ,{height:.9,seed:121}));
 solid(coralWall(kit,p.maxX,p.minZ,p.maxX,p.maxZ,{height:.9,seed:122}));
 solid(gajumaru(kit,cx,cz+2.2,{seed:7,size:1.05}));
 for(const [x,z] of [[p.minX+1,p.minZ+2],[p.minX+1,p.maxZ-1.5],[p.maxX-1,p.minZ+2.2],[p.maxX-1,p.maxZ-1.2],[p.minX+3.5,p.maxZ-1],[p.maxX-3.4,p.maxZ-1]])solid(fukugi(kit,x,z,{h:6,seed:x*3+z}));
 // The stone path in, and the incense stone at the end of it.
 for(let z=p.minZ+.6;z<cz-1;z+=.8)kit.box(.9,.05,.55,cx+(Math.sin(z)*.15),GROUND_LAYER.lane+.01,z,0xcfc8b4);
 kit.box(1.4,.35,.9,cx,.18,cz-.6,0xcfc8b4,{finish:'coral'});
 kit.box(.5,.3,.36,cx,.5,cz-.6,0x9a958a);
 kit.cyl(.12,.1,.12,cx,.71,cz-.6,0x7b766c,{segments:8});
 for(const dx of [-.35,.35])kit.cyl(.05,.05,.25,cx+dx,.48,cz-.35,0xe8e0c4,{segments:6});
 solid({id:'utaki-stone',x:cx,z:cz-.6,w:1.5,d:1,height:.8});
 anchor(cx,1,cz-1.6,'Pray at the utaki',()=>onAction?.('shrine','Nishi-machi utaki',
  'The grove at the top of the quarter. There is no shrine building and no gate, only the old banyan, the fukugi round it and a stone where the women of the street leave rice, salt and incense. People lower their voices before they reach the wall.'));
 inspect(cx+2.4,1,p.minZ-.9,'Read the utaki notice','御嶽 · Utaki',
  'A hand-lettered board: 御嶽につき立入りはご遠慮ください. This is a sacred place; please do not go in without reason. Underneath, in a child’s writing, somebody has added: the cat is allowed.');
}

function buildWestQuay(kit,solid,{inspect,anchor,onAction,vending}){
 const Q=NISHI.quay;
 solid(sabani(kit,-31,-45.6,{ry:.08}));
 solid(sabani(kit,-24.5,-46.8,{ry:-.05,colour:0x8a3b2e}));
 solid(fishCrates(kit,-36.6,-41.6,{rows:2,cols:3,seed:3}));
 solid(fishCrates(kit,-21.6,-42.2,{rows:2,cols:2,seed:5}));
 netPile(kit,-27.5,-41.5);solid({id:'net-pile',x:-27.3,z:-41.6,w:2.4,d:1.4,height:.6});
 solid(keiTruck(kit,-33.5,-40.4,{ry:0,load:'crates'}));
 vending(-36.2,-37.3,Math.PI/2);
 inspect(-31,1,-44,'Inspect the sabani','Sabani',
  'A narrow island fishing boat, cedar planked and painted, up on blocks for its bottom to be scraped. The sail is rolled along the thwarts. Old men still race these in the summer.');
 anchor(-29,1,Q.minZ+.9,'Fish from the west quay',()=>onAction?.('fishing'));
}

function buildPromenade(kit,solid,{anchor,onAction}){
 const x=-38.4;
 // Benches along the walk, under a couple of sea almond trees, and a lamp every so often.
 for(const z of [-20,4,22]){
  // Facing the sea, with the back on the landward side.
  kit.box(.45,.08,1.6,x,.46,z,0x9a7a55);kit.box(.06,.4,1.6,x+.22,.72,z,0x9a7a55);
  for(const dz of [-.65,.65])kit.box(.45,.44,.08,x,.22,z+dz,0x5d6468);
  solid({id:'promenade-bench',x,z,w:.6,d:1.7,height:.8});
 }
 for(const z of [-8,12]){
  kit.cyl(.16,.22,2.6,-38.9,1.3,z,0x6e5a44,{segments:7});
  kit.sphere(1.9,-38.6,3.2,z,0x4d7a43,{sy:.45});kit.sphere(1.4,-38.2,3.6,z+.6,0x5b8a4b,{sy:.5});
  solid({id:'sea-almond',x:-38.9,z,w:.5,d:.5,height:4});
 }
 for(const z of [-44.5,-26,-2,18]){
  kit.cyl(.05,.07,3.6,-39.05,1.8,z,0x5d6468,{segments:6});
  kit.rod([-39.05,3.6,z],[-38.5,3.7,z],.035,0x5d6468);
  kit.box(.3,.12,.24,-38.4,3.62,z,0xfff0c8,{finish:'lamp'});
  solid({id:'promenade-lamp',x:-39.05,z,w:.2,d:.2,height:3.6});
 }
 anchor(-38.6,1,-10,'Fish from the seawall',()=>onAction?.('fishing'));
 anchor(-38.6,1,10,'Fish from the seawall',()=>onAction?.('fishing'));
}

/* ------------------------------- Shop-houses ------------------------------ */

const SHOPS=Object.freeze({
 nakamura:{interior:'zenzai',jp:'仲村ぜんざい',en:'Nakamura · shaved ice & zenzai',bg:'#f6efd9',accent:'#2f7fa8',mark:'氷',upright:'ぜんざい',uprightBg:'#2f7fa8',
  buy:{label:'Buy a zenzai',title:'Nakamura Zenzai · 仲村ぜんざい',cost:250,item:'Zenzai',text:'Okinawan zenzai: a mountain of shaved ice over sweet kintoki beans and little white mochi, in a glass bowl that sweats on the counter. Mrs Nakamura has been making it on this corner since the Americans left.'}},
 shimabukuro:{interior:'barber',jp:'島袋理容',en:'Shimabukuro barber',bg:'#eaf1f3',accent:'#2f5f8e',upright:'理容',uprightBg:'#2f5f8e',
  inspect:{label:'Look in at the barber',title:'Shimabukuro Barber · 島袋理容',text:'Two green leather chairs, a radio on the shelf and a jar of blue comb disinfectant. Mr Shimabukuro is reading the Ryūkyū Shimpō in the second chair, waiting for his next head. A cut is ¥1,800; a shave is the rest of the afternoon.'}},
 'higa-saketen':{interior:'liquor',jp:'比嘉酒店',en:'Higa liquor · awamori',bg:'#f7ead6',accent:'#8a3b2e',upright:'泡盛',uprightBg:'#8a3b2e',
  buy:{label:'Buy a bottle of awamori',title:'Higa Liquor · 比嘉酒店',cost:600,item:'Awamori miniature',text:'Awamori in every size, from the little 180 ml bottles by the till to the old clay pots at the back that Mr Higa will not sell you however you ask. He wraps a miniature in newspaper and tells you to keep it for a guest.'}},
 arakaki:{interior:'sweets',jp:'新垣菓子店',en:'Arakaki sweets · sata andagi',bg:'#fbf1d8',accent:'#2d6f63',upright:'菓子',uprightBg:'#2d6f63',
  buy:{label:'Buy sata andagi',title:'Arakaki Sweets · 新垣菓子店',cost:120,item:'Sata andagi',text:'Okinawan doughnuts, fried in the back in the morning until they crack open and smile. Three to a paper bag, still warm, sugar on your fingers.'}},
 yonamine:{interior:'fish',anchorDz:2.3,jp:'与那嶺鮮魚店',en:'Yonamine fish',bg:'#eef4f2',accent:'#9a4a2a',mark:'魚',upright:'鮮魚',uprightBg:'#9a4a2a',
  inspect:{label:'Look at the fish',title:'Yonamine Fish · 与那嶺鮮魚店',text:'Blue parrotfish, a red snapper, mackerel on ice and a tray of mozuku seaweed. Mrs Yonamine buys from the morning boats and sells out by three. Irabu-chā — the blue parrotfish — is best as sashimi, she says, with vinegared miso.'}},
 'coin-laundry':{interior:'laundry',jp:'コインランドリー',en:'Coin laundry · open 24 hours',bg:'#e9f0f6',accent:'#3a6a9a',upright:'洗濯',uprightBg:'#3a6a9a',
  inspect:{label:'Look into the coin laundry',title:'Coin laundry',text:'Four washers, two dryers and a bench, with a stack of old manga and a sign about not leaving washing overnight that everybody ignores. One dryer is going round with somebody’s towels in it. It smells of warm cotton.'}},
});

function shopFront(kit,solid,plot,frame,{anchor,inspect,onAction}){
 const spec=SHOPS[plot.id],w=plot.maxZ-plot.minZ-.1,d=frame.depth;
 const sign=fascia({jp:spec.jp,en:spec.en,bg:spec.bg,accent:spec.accent,mark:spec.mark||''});
 const upright=vertical({jp:spec.upright,bg:spec.uprightBg});
 kit.at(frame.x,(plot.minZ+plot.maxZ)/2,frame.ry,()=>solid(shopHouse(kit,{w,d,colour:plot.colour,trim:plot.trim,sign,upright,interior:spec.interior,seed:plot.minZ*7|0})));
 const front=frame.front,out=frame.out,z=(plot.minZ+plot.maxZ)/2;
 const act=spec.buy?()=>onAction?.('buy',spec.buy.title,{cost:spec.buy.cost,item:spec.buy.item,text:spec.buy.text}):()=>onAction?.('inspect',spec.inspect.title,spec.inspect.text);
 // Off to one side where somebody works the counter, so talking to them wins over the shop.
 anchor(front+out*.9,1.1,z+(spec.anchorDz||0),(spec.buy||spec.inspect).label,act);
}

function buildEastRow(kit,solid,{anchor,inspect,onAction,vending}){
 const depth=EAST_ROW.maxX-EAST_ROW.minX,x=(EAST_ROW.minX+EAST_ROW.maxX)/2;
 for(const plot of EAST_ROW.plots)shopFront(kit,solid,plot,{x,ry:-Math.PI/2,depth,front:EAST_ROW.minX,out:-1},{anchor,inspect,onAction});
 // The strip of ground between the pavement and the shop fronts, paved to match.
 kit.block(MAIN_ROAD.pavementEast-.05,EAST_ROW.minX+.05,GROUND_LAYER.apron-.05,GROUND_LAYER.apron,EAST_ROW.plots[0].minZ,EAST_ROW.plots[3].maxZ,0xb9b0a0);
 // The shaved-ice flag outside Nakamura's, and a bench for eating it on.
 const n=EAST_ROW.plots[0];
 kit.cyl(.03,.03,2.6,EAST_ROW.minX-.35,1.3,n.maxZ-.4,0x9aa0a4,{segments:6});
 kit.sign(iceFlag(),.42,1.3,EAST_ROW.minX-.35,1.85,n.maxZ-.62,{ry:0,depth:.015,name:'ice flag',both:true});
 kit.rod([EAST_ROW.minX-.35,2.52,n.maxZ-.4],[EAST_ROW.minX-.35,2.52,n.maxZ-.85],.015,0x9aa0a4);
 kit.box(1.4,.08,.4,EAST_ROW.minX-.45,.45,n.minZ+1.4,0x3a6e8f);
 for(const dz of [-.55,.55])kit.box(.06,.42,.36,EAST_ROW.minX-.45,.21,n.minZ+1.4+dz,0x5d6468);
 solid({id:'zenzai-bench',x:EAST_ROW.minX-.45,z:n.minZ+1.4,w:.5,d:1.5,height:.5});
 // The lane up to Umi-no-yu: stepping stones, lanterns and the bath's own sign.
 const L=EAST_ROW.onsenLane,lz=(L.minZ+L.maxZ)/2;
 kit.block(MAIN_ROAD.pavementEast,ONSEN_DOOR[0]-1.6,GROUND_LAYER.lane-.05,GROUND_LAYER.lane+.012,lz-1.1,lz+1.1,0xcbc3b0);
 for(let x=MAIN_ROAD.pavementEast+.6;x<ONSEN_DOOR[0]-2;x+=.9)kit.box(.6,.03,.8,x,GROUND_LAYER.lane+.027,lz+Math.sin(x*1.3)*.2,0xa9a293);
 for(const s of [-1,1]){
  const z=lz+s*2.3;
  kit.box(.28,.9,.28,EAST_ROW.minX+.2,.45,z,0xcfc8b4,{finish:'coral'});
  kit.box(.4,.35,.4,EAST_ROW.minX+.2,1.08,z,0xf3ead2,{finish:'lamp'});
  kit.box(.5,.08,.5,EAST_ROW.minX+.2,1.3,z,0x5d4431);
  solid({id:'lane-lantern',x:EAST_ROW.minX+.2,z,w:.45,d:.45,height:1.3});
 }
 kit.sign(poster({title:'♨ 海の湯',lines:['UMI-NO-YU','¥300 · 10:00–22:00','この先 →'],band:'#2f6f8a'}),.7,.98,EAST_ROW.minX+.2,1.7,L.minZ+.12,{ry:0,name:'onsen lane sign'});
 potPlant(kit,EAST_ROW.minX+.3,L.maxZ-.5,{seed:31});potPlant(kit,EAST_ROW.minX+.3,L.minZ+.5,{seed:32});
 // A vending machine against the barber's end wall, facing the lane, and bicycles parked by it.
 vending(EAST_ROW.minX+1.3,L.minZ+.62,0);
 bicycle(kit,EAST_ROW.minX+3,L.minZ+.55,{ry:0});
 solid({id:'bicycle',x:EAST_ROW.minX+3,z:L.minZ+.55,w:1.4,d:.4,height:1.1});
 bicycle(kit,EAST_ROW.minX-.5,EAST_ROW.plots[2].minZ+1.6,{ry:Math.PI/2,colour:0xd9d2c0});
 solid({id:'bicycle',x:EAST_ROW.minX-.5,z:EAST_ROW.plots[2].minZ+1.6,w:.4,d:1.4,height:1.1});
 // Behind the row: the back yards, with washing and a kei truck.
 solid(keiTruck(kit,EAST_ROW.maxX+1.85,9.2,{ry:Math.PI/2,load:'sheet'}));
 solid(gasBottles(kit,EAST_ROW.maxX+.5,15.2,{ry:Math.PI/2}));
 solid(planterBoxes(kit,EAST_ROW.maxX+.6,-4.5,{ry:Math.PI/2,count:4}));
}

function buildYardRow(kit,solid,{anchor,inspect,onAction}){
 const depth=YARD_ROW.maxX-YARD_ROW.minX,x=(YARD_ROW.minX+YARD_ROW.maxX)/2;
 for(const plot of YARD_ROW.plots)shopFront(kit,solid,plot,{x,ry:Math.PI/2,depth,front:YARD_ROW.maxX,out:1},{anchor,inspect,onAction});
 // The yard behind them: a kei truck, fish crates, a garden of greens in fish boxes.
 solid(keiTruck(kit,-20.4,11.5,{ry:Math.PI/2,colour:0xdcd6c6,load:'crates'}));
 solid(fishCrates(kit,-17.6,8,{rows:2,cols:2,seed:21}));
 solid(planterBoxes(kit,-23.4,9.5,{ry:Math.PI/2,count:5,seed:22}));
 solid(laundry(kit,-21.8,4.6,{ry:Math.PI/2,length:2.4}));
 buildYardLife(kit,solid,{anchor,inspect,onAction});
 solid(gasBottles(kit,-16.4,17.8,{ry:Math.PI/2}));
 hibiscus(kit,-23.6,18.6,{seed:23});banana(kit,-23.4,-16.6,{seed:24});
}

function buildEastBack(kit,solid,ctx){
 // The back lane behind the shops: a concrete strip with a gutter, down to the lawn.
 const L=EAST_BACK.lane;
 kit.block(L.minX,L.maxX,GROUND_LAYER.lane-.05,GROUND_LAYER.lane-.005,EAST_ROW.plots[0].minZ,EAST_ROW.plots[3].maxZ+2.4,0xaaa598);
 kit.block(L.maxX-.3,L.maxX,GROUND_LAYER.lane-.005,GROUND_LAYER.lane+.01,EAST_ROW.plots[0].minZ,EAST_ROW.plots[3].maxZ+2.4,0x8d887d);
 EAST_BACK.plots.forEach((p,i)=>walledHouse(kit,solid,p,{...ctx,seed:10+i,windbreak:'east'}));
}

function buildEastQuay(kit,solid,{anchor,inspect,onAction,vending}){
 const Q=EAST_QUAY,S=Q.shed,I=Q.ice,lane=GROUND_LAYER.lane;
 kit.block(Q.minX+.05,Q.maxX+.4,lane-.06,lane,Q.minZ,Q.maxZ+.55,0xa6a296);
 // The quay edge, its yellow kerb, bollards and the tyres hung on its face.
 kit.block(Q.minX,Q.maxX+.4,-.7,lane,Q.minZ-.45,Q.minZ,0xa9a497);
 kit.block(Q.minX,Q.maxX+.4,lane,lane+.12,Q.minZ-.4,Q.minZ-.1,0xe0b93a);
 solid({id:'east-quay-edge',x:(Q.minX+Q.maxX)/2,z:Q.minZ-.25,w:Q.maxX-Q.minX+.4,d:.3,height:.4});
 for(let x=Q.minX+2.5;x<Q.maxX;x+=4.5){
  kit.cyl(.16,.2,.42,x,.24,Q.minZ+.35,0x3a3f42,{segments:10});kit.cyl(.24,.24,.08,x,.47,Q.minZ+.35,0x3a3f42,{segments:10});
  solid({id:'bollard',x,z:Q.minZ+.35,w:.45,d:.45,height:.5});
  kit.cyl(.3,.3,.28,x+1.6,-.35,Q.minZ-.55,0x1f2124,{rx:Math.PI/2,segments:10});
 }
 // The auction shed: open sides, a painted floor, a steel roof on H-section columns.
 kit.block(S.minX,S.maxX,lane,lane+.1,S.minZ,S.maxZ,0x5f8a7a);
 const cols=[];
 for(let x=S.minX+.15;x<=S.maxX;x+=(S.maxX-S.minX-.3)/3)for(const z of [S.minZ+.15,S.maxZ-.15])cols.push([x,z]);
 for(const [x,z] of cols){kit.box(.22,S.height,.22,x,S.height/2,z,0x5e7078,{finish:'metal'});solid({id:'auction-column',x,z,w:.3,d:.3,height:S.height});}
 kit.gableRoof(S.maxX-S.minX,S.maxZ-S.minZ,.9,(S.minX+S.maxX)/2,S.height,(S.minZ+S.maxZ)/2,0x7a8f96,{overhang:.7});
 for(let x=S.minX-.6;x<S.maxX+.7;x+=.45)kit.box(.04,.04,S.maxZ-S.minZ+1.4,x,S.height+.46,(S.minZ+S.maxZ)/2,0x6c8088,{rx:0});
 kit.sign(fascia({jp:'港漁協 せり市場',en:'Minato fisheries co-op · fish auction',bg:'#eef3f1',accent:'#2f6f8a',mark:'魚'}),6,.9,(S.minX+S.maxX)/2,S.height-.3,S.maxZ+.02,{name:'auction sign'});
 // Inside: rows of crates with the morning's catch, a scale and the price board.
 const r=rng(77),catchColours=[0x9fb4c0,0xc85a4a,0x5a8fb0,0xb0b8b8,0x6fa0c8];
 for(let row=0;row<3;row++)for(let k=0;k<6;k++){
  const x=S.minX+1.2+k*1.1,z=S.minZ+2+row*1.8;
  kit.box(.72,.26,.46,x,lane+.23,z,0x2f6fb8);
  for(let f=0;f<3;f++)kit.sphere(.1,x-.2+f*.2,lane+.38,z+(r.next()-.5)*.2,r.pick(catchColours),{sx:2.2,sy:.7,finish:'gloss'});
 }
 solid({id:'auction-catch',x:S.minX+1.2+2.75,z:S.minZ+2+1.8,w:6.4,d:4.2,height:.5});
 kit.box(.6,.9,.6,S.maxX-1.2,.55,S.minZ+1.2,0xc9cdd0,{finish:'metal'});
 kit.box(1.6,1,.08,S.maxX-.3,1.7,(S.minZ+S.maxZ)/2,0x2c3a33,{ry:Math.PI/2});
 kit.sign(poster({title:'本日のせり',lines:['マグロ  ¥2,800','グルクン ¥900','イラブチャー ¥1,200','セーイカ ¥1,500'],bg:'#2c3a33',ink:'#f2efe4',band:'#8a3b2e'}),1.1,1.5,S.maxX-.36,1.75,(S.minZ+S.maxZ)/2,{ry:-Math.PI/2,name:'auction prices'});
 inspect((S.minX+S.maxX)/2,1.2,S.maxZ+1,'Inspect the auction shed','Minato fish auction · せり市場',
  'The boats are in by five and the auction is at six: a bell, a man with a clipboard shouting numbers too fast for anyone but the buyers, and a floor hosed down by seven. What is left in the crates now went unsold, and will be somebody\'s supper. Tuna, gurukun, blue parrotfish, a cuttlefish the size of a cat.');
 // The ice plant: a tall concrete block with its chute swung out over the quay.
 kit.block(I.minX,I.maxX,0,I.height,I.minZ,I.maxZ,0xd8d4ca);
 kit.block(I.minX-.05,I.maxX+.05,0,.4,I.minZ-.05,I.maxZ+.05,0xb3ad9f);
 kit.block(I.minX-.02,I.minX,0,2.8,I.minZ+1.2,I.minZ+4.2,0x8e9699,'metal');
 for(let y=.3;y<2.8;y+=.18)kit.box(.03,.04,3,I.minX-.03,y,I.minZ+2.7,0x7b8285);
 kit.sign(vertical({jp:'製氷',bg:'#2f6f8a'}),.9,3.4,I.minX-.05,4.6,I.maxZ-1.1,{ry:-Math.PI/2,depth:.06,name:'ice sign'});
 kit.rod([(I.minX+I.maxX)/2,I.height-1,I.minZ],[(I.minX+I.maxX)/2,3.2,Q.minZ+.8],.28,0x9aa3a6,{segments:8,finish:'metal'});
 kit.box(.8,.6,.8,(I.minX+I.maxX)/2,I.height-.8,I.minZ-.3,0x9aa3a6,{finish:'metal'});
 for(const x of [I.minX+1.4,I.maxX-1.4]){kit.box(1.4,.9,1.2,x,I.height+.45,(I.minZ+I.maxZ)/2,0xe6e6e0);kit.cyl(.45,.45,.06,x,I.height+.93,(I.minZ+I.maxZ)/2,0x3a3f42,{segments:12});}
 for(const x of [I.maxX-.4])kit.rod([x,.4,I.maxZ+.1],[x,I.height,I.maxZ+.1],.05,0x8e979a);
 solid(kit.rect(I.minX,I.maxX,I.minZ,I.maxZ,I.height,'ice-plant'));
 inspect(I.minX-1,1.2,I.minZ+2.7,'Inspect the ice plant','Minato ice plant · 製氷所',
  'Block ice, crushed ice, flake ice. The chute swings out over the boats and fills a hold in four minutes with a roar you can hear at the bus stop. Inside it is winter all year; the men who work it wear jumpers in August and sit out on the quay at lunch to thaw.');
 // Boats lying to the quay, a forklift, crates, the fuel pump.
 fishingBoat(kit,24.6,Q.minZ-2.1,{ry:0,colour:0x2f6fb8,name:'第三港丸'});
 fishingBoat(kit,33.6,Q.minZ-2.2,{ry:Math.PI,colour:0x8a3b2e,length:7.2});
 kit.box(1.1,1,1.8,S.maxX+1.1,.55,S.maxZ-1.2,0xe0b93a);kit.box(.9,.06,1.2,S.maxX+1.1,.2,S.minZ+5.5,0x3a3f42);
 for(const dx of [-.3,.3])kit.box(.06,2,.06,S.maxX+1.1+dx,1,S.maxZ-2.2,0x3a3f42);
 solid({id:'forklift',x:S.maxX+1.1,z:S.maxZ-1.5,w:1.2,d:2.4,height:2});
 solid(fishCrates(kit,Q.minX+.8,Q.maxZ-1.6,{rows:2,cols:3,seed:31}));
 kit.box(.5,1.4,.4,I.maxX-.4,.7,Q.maxZ-.9,0xc0392b);kit.box(.3,.3,.06,I.maxX-.4,1.1,Q.maxZ-1.12,0xf2efe4);
 solid({id:'fuel-pump',x:I.maxX-.4,z:Q.maxZ-.9,w:.6,d:.5,height:1.4});
 vending(S.minX-.9,S.maxZ-.6,Math.PI/2);
 inspect(24.6,1,Q.minZ+.9,'Look at the boats','第三港丸 · Minato Maru No. 3',
  'The Minato Maru is back from the reef with her hold iced and her deck hosed. Her skipper is asleep in the wheelhouse with the radio on. The red boat further along goes out for squid at night and has its lamps strung along a boom.');
 anchor(29.5,1,Q.minZ+.9,'Fish from the east quay',()=>onAction?.('fishing'));
}

/** The back of the west yard: the goya trellis, the bicycle shed, drums and tyres. */
function buildYardLife(kit,solid,{inspect}){
 const G=GOYA,y=GROUND_LAYER.lane;
 // Raised beds of red earth with a path between them, under a trellis the bitter melon
 // has already covered: a roof of leaves, and the gourds hanging through it.
 for(const z of [G.minZ+.9,G.minZ+3.6,G.maxZ-.9]){
  kit.block(G.minX+.4,G.maxX-.4,y-.02,.24,z-.55,z+.55,0x8a4a32);
  for(let x=G.minX+.8;x<G.maxX-.6;x+=.55)kit.sphere(.18,x,.34,z+(x*7%2?.2:-.2),0x4f7d3e,{sy:.7,detail:0});
  solid({id:'goya-bed',x:(G.minX+G.maxX)/2,z,w:G.maxX-G.minX-.8,d:1.1,height:.3});
 }
 const posts=[];for(const x of [G.minX+.2,(G.minX+G.maxX)/2,G.maxX-.2])for(const z of [G.minZ+.2,G.maxZ-.2])posts.push([x,z]);
 for(const [x,z] of posts){kit.cyl(.05,.06,2.1,x,1.05,z,0x6e5a44,{segments:6});solid({id:'trellis-post',x,z,w:.14,d:.14,height:2.1});}
 kit.box(G.maxX-G.minX,.02,G.maxZ-G.minZ,(G.minX+G.maxX)/2,2.08,(G.minZ+G.maxZ)/2,0x3f6b3a,{finish:'thin'});
 const r=rng(55);
 for(let i=0;i<34;i++)kit.sphere(.35+r.next()*.25,G.minX+.3+r.next()*(G.maxX-G.minX-.6),2.18,G.minZ+.3+r.next()*(G.maxZ-G.minZ-.6),r.pick([0x4f8a3e,0x3f7a36,0x5c9446]),{sy:.35,detail:0});
 for(let i=0;i<16;i++){const x=G.minX+.5+r.next()*(G.maxX-G.minX-1),z=G.minZ+.5+r.next()*(G.maxZ-G.minZ-1);kit.sphere(.08,x,1.78,z,0x6fa84a,{sy:2.6,detail:1});}
 inspect((G.minX+G.maxX)/2,1,G.maxZ+.8,'Look at the goya trellis','Goya trellis',
  'Bitter melon, ゴーヤー, grown up a net until it roofs the whole bed: in summer it is the coolest place in the yard. The warty green gourds hanging through are for chanpurū, fried with tofu, egg and a little spam. Whoever planted it has written 取らないで on a card — please don’t pick.');
 // The bicycle shed at the top of the yard, and what gathers round a working yard.
 const bx0=-24,bx1=-19.4,bz0=15.8,bz1=19.6;
 kit.block(bx0,bx1,2.15,2.25,bz0,bz1,0x8c9ea3);
 for(const [x,z] of [[bx0+.1,bz0+.1],[bx1-.1,bz0+.1],[bx0+.1,bz1-.1],[bx1-.1,bz1-.1]]){kit.box(.08,2.15,.08,x,1.08,z,0x9aa0a4);solid({id:'shed-post',x,z,w:.14,d:.14,height:2.2});}
 for(let i=0;i<4;i++)bicycle(kit,bx0+.8+i*1.05,(bz0+bz1)/2,{ry:Math.PI/2,colour:[0x3d6f8f,0xb03a3a,0xd9d2c0,0x3a7a5a][i]});
 solid({id:'bicycles',x:(bx0+bx1)/2,z:(bz0+bz1)/2,w:bx1-bx0-.6,d:1.3,height:1.1});
 for(const [x,z] of [[-17,-16.2],[-16.4,-15.8]]){kit.cyl(.29,.29,.88,x,.44,z,0x2f5a8a,{segments:12});kit.cyl(.3,.3,.04,x,.89,z,0x24486e,{segments:12});}
 solid({id:'oil-drums',x:-16.7,z:-16,w:1.3,d:1,height:.9});
 for(let k=0;k<4;k++)kit.cyl(.33,.33,.2,-23.6,.12+k*.21,-15.6,0x1f2124,{segments:12});
 solid({id:'tyres',x:-23.6,z:-15.6,w:.72,d:.72,height:.9});
}

/** Gateball on the lawn by the seawall: a sand court, three hoops, the goal post, a shelter. */
function buildGateball(kit,solid,{anchor,inspect}){
 const G=GATEBALL,top=GROUND_LAYER.apron,cx=(G.minX+G.maxX)/2,cz=(G.minZ+G.maxZ)/2;
 kit.block(G.minX,G.maxX,top-.05,top,G.minZ,G.maxZ,0xcdb88f,'sand');
 const line=(x0,x1,z0,z1)=>kit.block(x0,x1,top,top+.006,z0,z1,0xf4f1ea);
 line(G.minX+.3,G.maxX-.3,G.minZ+.3,G.minZ+.36);line(G.minX+.3,G.maxX-.3,G.maxZ-.36,G.maxZ-.3);
 line(G.minX+.3,G.minX+.36,G.minZ+.3,G.maxZ-.3);line(G.maxX-.36,G.maxX-.3,G.minZ+.3,G.maxZ-.3);
 for(const [x,z] of [[G.minX+2.4,G.minZ+1.4],[G.maxX-2.8,cz],[G.minX+3.2,G.maxZ-1.3]]){
  for(const dx of [-.11,.11])kit.box(.02,.2,.02,x+dx,top+.1,z,0xf4f1ea);
  kit.box(.24,.02,.02,x,top+.2,z,0xf4f1ea);
 }
 kit.cyl(.02,.02,.45,cx,top+.22,cz,0xf4f1ea,{segments:5});
 // Five coloured balls where the last game stopped.
 for(const [i,[x,z]] of [[22.5,-35],[24.1,-33.9],[26,-36.2],[27.3,-34.4],[29.4,-33.2]].entries())kit.sphere(.04,x,top+.04,z,i%2?0xd8342c:0xf4f1ea,{detail:1});
 // The shelter on the seaward end, where the elders sit between turns.
 const sx0=G.maxX-.1,sx1=G.maxX+1.5;
 kit.block(sx0,sx1,2.3,2.4,G.minZ+.6,G.maxZ-.6,0x8a3b2e);
 for(const z of [G.minZ+.8,G.maxZ-.8])for(const x of [sx0+.1,sx1-.1]){kit.box(.1,2.3,.1,x,1.15,z,0x6e5a44);solid({id:'shelter-post',x,z,w:.14,d:.14,height:2.3});}
 kit.box(.45,.08,G.maxZ-G.minZ-2,sx1-.4,.46,cz,0x9a7a55);for(const dz of [-1.5,1.5])kit.box(.4,.44,.08,sx1-.4,.22,cz+dz,0x5d6468);
 solid({id:'gateball-bench',x:sx1-.4,z:cz,w:.5,d:G.maxZ-G.minZ-2,height:.5});
 for(let i=0;i<3;i++)kit.rod([sx1-.25,.02,cz-1+i*.5],[sx1-.15,.95,cz-1.1+i*.5],.02,[0xd8342c,0x2f6fb8,0xe0b93a][i]);
 inspect(cx,1,G.maxZ+.7,'Watch the gateball','Gateball · ゲートボール',
  'Five a side, mallets and numbered balls, three hoops and a post, and a referee with a whistle and a stopwatch who is somehow also the loudest player. The Minato seniors play here at seven every morning before it gets hot. They have been losing to the team from the next village since 1985.');
}

/* ---------------------------------- Wires --------------------------------- */

function buildWires(kit,solid){
 const poles=[];
 const pole=(x,z,o={})=>{const p=utilityPole(kit,x,z,o);solid(p.collider);poles.push(p);return p;};
 // Down the east kerb of Main Street, the row's side.
 const east=[-15,-1.5,12.3,19.6].map((z,i)=>pole(MAIN_ROAD.pavementEast-.25,z,{face:-Math.PI/2,transformer:i%2===0,lamp:true,seed:i}));
 for(let i=0;i<east.length-1;i++)wiresBetween(kit,east[i],east[i+1]);
 for(const [p,z] of [[east[0],-11],[east[1],-4],[east[2],9],[east[3],15.8]])serviceDrop(kit,p,[EAST_ROW.minX+.3,6,z]);
 // Along the seawall walk, with a pole at the head of each lane feeding its houses.
 const walk=[-38,-23,-9.5,5,20].map((z,i)=>pole(-36.7,z,{face:Math.PI/2,transformer:i===2,lamp:i%2===1,seed:10+i}));
 for(let i=0;i<walk.length-1;i++)wiresBetween(kit,walk[i],walk[i+1]);
 for(const l of NISHI.lanes){
  const p=pole(-26.3,l.z+l.half-.3,{h:7.8,face:Math.PI,transformer:false,seed:20+l.z});
  const nearest=walk.reduce((a,b)=>Math.abs(b.anchors[0].z-l.z)<Math.abs(a.anchors[0].z-l.z)?b:a);
  wiresBetween(kit,nearest,p,{sag:.5});
  serviceDrop(kit,p,[-27,2.6,l.z+l.half+1.2]);serviceDrop(kit,p,[-27,2.6,l.z-l.half-1.2]);
 }
}

/** What the nameplates say when you stop to read one. */
const NAMEPLATES=Object.freeze({
 higa:'The Higas. Grandmother Higa sits on the verandah every afternoon shelling beans into a bowl and knows the time of every bus by the sound of it in the tunnel. The shisa on the left gatepost has its mouth open to let luck in; the one on the right has it shut, to keep it.',
 kinjo:'The Kinjōs built in concrete after the 1971 typhoon took their old roof. Their son is a welder in Naha and sends money for the water tank to be painted every other year. The flower-block wall was his first job.',
 nakasone:'The Nakasones keep the lawn in front of Umi-no-yu cut, because nobody else will. Mr Nakasone plays the sanshin on the verandah after supper; if the wind is right you can hear it from the bath.',
 miyagi:'Mrs Miyagi is ninety-one, walks to the utaki every morning and has outlived two husbands and a typhoon that took the roof off everything else on this side. The shisa on her ridge is older than she is.',
 tamaki:'The Tamakis run the ice plant on the east quay. Their daughter is at the school; her bicycle is the red one, and her swimming things are on the washing line most days of the year.',
 oshiro:'The Ōshiros. Old Mr Ōshiro was a sabani builder; his boat is the red one on the west quay. There is a bunch of bananas ripening by the kitchen door and, if you believe the neighbours, a habu in the fukugi that nobody has seen for years.',
});
