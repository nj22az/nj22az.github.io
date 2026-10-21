import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {createKit,paint} from './kit.js';
import {japaneseSign,signText} from './signs.js';
import {createShopGlass} from '../shop-glass.js';
import {windowGlow} from '../../render/dusk.js';
import {HIGA_RUSU_CARD,HIGA_LIQUOR_HOURS_TEXT,higaLiquorState,higaShutterDown,higaDoorsShut,higaRusuCard,YUNTAKU} from '../../commerce/higa-liquor.js';

/**
 * Higa Liquor (比嘉酒店), dressed as the 1990s island liquor shop it is (the owner, 21 October 2026: "I see the liquor
 * store looks abhorrent too … how can we bring them more life and interactivity"). It was a pink box with an open slot
 * in front: a counter a pace inside the pavement, two pots and a wall of bottles, open at midnight. A real 酒屋 of the
 * period is a shop you walk into through aluminium sliding doors under a canvas awning with the goods on its valance:
 * the beer case by the door, the 1.8-litre bottles up the wall, the awamori jars on the floor, the owner behind a
 * wooden counter at the back with the register and the delivery book, the crates of empties stacked outside for the
 * brewery's boat, and in the evening a bench out front where the regulars sit with a bottle (ゆんたく).
 *
 * The shop-house frame (houses.js shopHouse) is used throughout: x along the frontage (+x towards the police station,
 * world +z), z out to Main Street (+z, world -x), y up from the street. The shop floor is deepened to the back of the
 * building's front half: the old 2.2 m slot becomes a room 5.75 m deep, the back of the ground floor the storeroom with
 * the stock room upstairs (nobody lives over the shop; the Higas live in Nishi-machi).
 *
 * Measured, not copied: New Yokosuka's Dobuita sweets shop (docs/research/new-yokosuka-lessons.md §3.2) is the same size
 * of shop-house, 5.47 × 7.29 m, with a 1.80 × 2.10 m double slider for its door and the shopkeeper's place at the back
 * facing it; Higa Liquor's doors are 1.84 × 2.10 m under a transom, its keeper behind a counter across the back. The
 * konbini there (§3.1) puts what sells first nearest the door, as the cold case is here. Everything drawn is the town's
 * own.
 */
export const HIGA_FRAME=Object.freeze({W:2.45,D:3.85,ground:3.3,H:6.1,open:2.07,back:-1.9,floor:.08,origin:Object.freeze([9.55,8.4])});
const {W,D,ground,H,open,back}=HIGA_FRAME;
/** A point of the shop-house's frame in the world (the frame turns a quarter: local +z is world -x). */
export const higaPoint=(x,z)=>[HIGA_FRAME.origin[0]-z,HIGA_FRAME.origin[1]+x];
/** Where the keeper stands behind the counter, facing the door (world metres): the canonical day's 'higa-liquor'. */
export const HIGA_KEEPER_AT=Object.freeze(higaPoint(.1,-1.3));
/** The doorway, between the fixed panes: local x ±DOOR, the leaves 0.92 m each. */
const DOOR=.92,DOOR_H=2.18,PANE_Z=D-.4,LEAF_Z=D-.48;

const item=o=>Object.freeze({...o,at:Object.freeze(o.at)});
/**
 * Every new thing in, on and around the shop, by who it is for and why it is where it is. `at` is its middle in the
 * shop-house's frame; `build` says whether it is part of the building, the shop's fittings, a prop outside, or a thing
 * that follows the hours (commerce/higa-liquor.js).
 */
export const HIGA_DRESSING=Object.freeze([
 // The building.
 item({id:'shop-floor',side:'inside',at:[0,0,.97],build:'building',who:'Grandmother Higa and her customers',
  why:'The shop floor is a room now, 4.1 by 5.75 m: the old slot was a counter a pace in from the pavement, where nobody could choose a bottle without blocking the footway. The back of the ground floor stays the storeroom.',period:'A town 酒屋 of the seventies is a single room off the street, a concrete floor (土間) and the stock round the walls.'}),
 item({id:'sliding-doors',side:'front',at:[0,1.36,PANE_Z],build:'open-hours',who:'Grandmother Higa',
  why:'Aluminium-framed glass sliding doors across the front, two fixed panes and two leaves that slide behind them: open while she keeps the counter, shut while she is at the bath and at night.',period:'Aluminium shop sashes (アルミサッシ) replaced the timber front of every Japanese shop from the late sixties.'}),
 item({id:'rusu-card',side:'front',at:[.46,1.45,LEAF_Z+.03],build:'open-hours',who:'Grandmother Higa',
  why:HIGA_RUSU_CARD.why+' The card says 留守 · 5時に戻ります on the back of a calendar page, hung on a string from the door’s handle.',period:HIGA_RUSU_CARD.period}),
 item({id:'shutter',side:'front',at:[0,1.5,D-.15],build:'open-hours',who:'Grandmother Higa (the shop at night)',
  why:'The roller shutter comes down over the whole front once she has shut the doors at eight and goes up just before nine; it stays up through her afternoon at the bath, when the doors and the card do the work.',period:'Ribbed steel shutters closed every shop front on the island from the sixties.'}),
 item({id:'awning',side:'front',at:[0,2.95,D+.48],build:'building',who:'the customers and the bench',
  why:'A canvas awning (テント) on a steel frame in the shop’s maroon, its valance lettered with what the shop sells (酒 · 泡盛 · ビール): the shade over the door, the crates and the bench, and the sign read from the pavement opposite.',period:'Lettered canvas awnings were the shop sign of every Japanese corner shop of the period.'}),
 item({id:'sugidama',side:'front',at:[-1.15,2.3,D+.55],build:'building',who:'the shop',
  why:'A ball of cedar sprigs (杉玉) under the awning: hung green when the new season’s sake comes, browning through the year, so October’s is a dull green going brown.',period:'The sake brewer’s and sake seller’s sign since the Edo period.'}),
 item({id:'slab-band',side:'all',at:[0,3.25,0],build:'building',who:'the building',why:'The first floor’s slab edge as a cast band round the flanks and the back, as on Nakamura’s: a concrete shop-house reads as two storeys.',period:'Okinawan RC shop-houses of 1965–80.'}),
 item({id:'coping',side:'all',at:[0,H+.53,0],build:'building',who:'the building',why:'The parapet’s concrete coping, the top edge every flat roof in Minato has.',period:'Typhoon-era concrete.'}),
 item({id:'window-hoods',side:'front and flanks',at:[0,5.56,D+.16],build:'building',who:'the stock room upstairs',why:'Concrete hoods over the upper windows, front and flanks, against the sun and the rain; no air conditioner, since nobody sits in a stock room.',period:'Every Okinawan concrete house carries them.'}),
 item({id:'flank-windows',side:'Kitano Road and police side',at:[-W,4.75,1.4],build:'building',who:'the stock room',why:'One window each side upstairs, so the stock room has a through draught, and on the ground floor a frosted window with a grille to the storeroom on Kitano Road.',period:'面格子 grilles on every ground-floor window.'}),
 item({id:'back-door',side:'back',at:[.7,1,-D],build:'building',who:'Grandmother Higa, the truck',why:'The storeroom’s steel door to the back lane, where the brewery’s cases come in off the boat and Kōji loads the heavy ones; a rain hood and a concrete step.',period:'A back door for the stock is how a shop is run.'}),
 // Services and signs outside.
 item({id:'meter-box',side:'Kitano Road',at:[-W-.08,1.8,3.1],build:'prop',who:'the power company’s meter reader',why:'One meter in a grey box near the front of the Kitano Road flank, read from the road, the conduit up to the eave where the line from the pole comes in.',period:'Okinawan meters are outside, at eye height.'}),
 item({id:'enamel-tin',side:'Kitano Road',at:[-W-.02,1.85,1.0],build:'prop',who:'the awamori distillery (南風)',why:'The distillery’s enamel tin (ホーロー看板) on the Kitano Road flank, where everybody walking up to the bath passes it; the shop is its island agent.',period:'Makers nailed enamel tins to the shops that stocked them.'}),
 item({id:'empties',side:'front',at:[-1.33,.45,4.11],build:'prop',who:'the brewery’s boat, and Kōji’s round',why:'Yellow crates of empty large bottles stacked by the door on the Kitano Road side, the day’s returns waiting for the round to take them to the crate yard across the street; full crates come in by the back door.',period:'Returnable large bottles in twenty-bottle crates, ¥5 back on each, were how beer was sold.'}),
 item({id:'bicycle',side:'front',at:[-2.08,.5,4.85],build:'prop',who:'Grandmother Higa',why:'The old black delivery bicycle, nose-in to the pier at the Kitano Road corner, clear of the door and the bench.',period:'The shopkeeper’s heavy carrier bicycle.'}),
 item({id:'yuntaku-bench',side:'front',at:[1.68,.22,4.23],build:'prop',who:'the evening regulars (YUNTAKU)',why:'A timber bench (縁台) against the police-station end of the front and two upturned beer crates for stools: where men sit with a bottle from the counter in the evening opening.',period:'Benches in front of island shops, and talking on them (ゆんたく), are Okinawan evenings.'}),
 // The fittings inside.
 item({id:'counter',side:'inside',at:[-.84,.48,-.45],build:'fitting',who:'Grandmother Higa, or Yui on Saturdays',why:'A wooden counter across the back, facing the door, with the register, her abacus, the telephone and the delivery book; its end is open on the police-station side so she can come round.',period:'The owner’s counter at the back of the room, the till on it, the family behind it.'}),
 item({id:'delivery-book',side:'inside',at:[-1.0,.97,-.45],build:'fitting',who:'Grandmother Higa and Kōji',why:'The delivery book (配達帳): who orders what and when, who carried it, and Kōji’s pay for the round, in her hand (commerce/higa-liquor.js higaDeliveryBook).',period:'A ledger on the counter was the small shop’s order system.'}),
 item({id:'isshobin-shelves',side:'inside',at:[1.87,1.1,2.15],build:'fitting',who:'customers buying a bottle for a visit',why:'Shelves up the police-station wall of 1.8-litre bottles (一升瓶) and 720 ml bottles: awamori, sake, shōchū.',period:'The 一升瓶 was the unit of the drink trade.'}),
 item({id:'cold-case',side:'inside',at:[-1.74,.98,2.75],build:'fitting',who:'everybody who wants it cold now',why:'The reach-in cold case nearest the door on the Kitano Road wall, beer and the one-cup sake: the bottle for supper is in and out in a minute. 冷えてます (“it’s cold”) on its header.',period:'Glass-door cold cases came into liquor shops in the seventies.'}),
 item({id:'kame',side:'inside',at:[-1.78,.35,1.15],build:'fitting',who:'customers buying for a celebration',why:'Three awamori jars (甕) on a low stage along the Kitano Road wall, with price tags: a gift for a wedding or a sixtieth birthday.',period:'Awamori in glazed jars, for keeping and ageing at home.'}),
 item({id:'family-kusu',side:'inside',at:[-1.62,.6,-1.42],build:'fitting',who:'the Higa family',why:'The family kusu behind the counter on its stand, with a 非売品 (not for sale) card: never sold (commerce/higa-liquor.js HIGA_KUSU).',period:'Okinawan families’ kusu, kept for a wedding.'}),
 item({id:'back-shelf',side:'inside',at:[-.75,1.3,-1.78],build:'fitting',who:'Grandmother Higa',why:'The dear bottles behind the counter, out of reach of the customers: the old awamori and the gift-boxed whisky.',period:'The good stock lives behind the owner.'}),
 item({id:'lights',side:'inside',at:[0,2.93,1.4],build:'open-hours',who:'the shop',why:'Two fluorescent fittings on the ceiling and the cold case’s light, on while the shop is open and off while it is shut: across the street you can see whether she is in.',period:'Bare fluorescent tubes lit every shop of the period.'}),
]);

/** What a liquor shop of the period might have had that is not here, and why. */
export const HIGA_LEFT_OUT=Object.freeze([
 {suggestion:'A cigarette counter and the red たばこ sign',why:'Higa Liquor has no tobacco licence in the town’s data (merchandising.js SUPPLIERS: beer, awamori, sake and shōchū); a sign for goods it does not sell would be random.'},
 {suggestion:'A beer vending machine outside',why:'The island’s drinks machines are Sakura’s and the bottler’s (vending.js); a liquor shop’s beer machine was shut off at eleven by law and adds nothing the cold case does not.'},
 {suggestion:'Kōji’s kei truck parked at the door on the round',why:'The truck lives in its bay at the Kitahama monthly parking (lots.js); his round is on foot between its stops in the web edition, the truck’s drive is the Linux simulation’s to come.'},
 {suggestion:'A point light in the shop',why:'Phone budget: the fluorescent tubes glow by their own material on the clock.'},
].map(Object.freeze));

const MINCHO='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif',GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
/** The shop's lettering on one 1024×512 sheet, so every card, poster and tin is one draw call. Regions in pixels. */
const ATLAS=Object.freeze({w:1024,h:512,valance:[0,0,1024,96],tin:[0,112,320,200],hours:[336,112,160,220],beer:[512,112,200,280],awamori:[728,112,200,280],
 cold:[0,330,320,64],tag1:[0,404,96,108],tag2:[100,404,96,108],tag3:[200,404,96,108],kusu:[300,404,96,108],rusu:[420,330,110,160]});

function paintLettering(){
 return paint(ATLAS.w,ATLAS.h,ctx=>{
  ctx.textAlign='center';ctx.textBaseline='middle';
  // The awning's valance: what the shop sells, in white on the canvas's maroon.
  {const [x,y,w,h]=ATLAS.valance;ctx.fillStyle='#7d2f27';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y,w,8);
   ctx.fillStyle='#f6ecd8';signText(ctx,'酒 · 泡盛 · ビール · 比嘉酒店',x+w/2,y+h/2+3,w-60,58,MINCHO);}
  // The distillery's enamel tin: cream, a blue band, 泡盛 南風 and the maker's line.
  {const [x,y,w,h]=ATLAS.tin;ctx.fillStyle='#f1e6c8';ctx.fillRect(x,y,w,h);ctx.fillStyle='#24557d';ctx.fillRect(x,y+h-56,w,56);
   ctx.strokeStyle='#24557d';ctx.lineWidth=8;ctx.strokeRect(x+8,y+8,w-16,h-16);
   ctx.fillStyle='#24557d';signText(ctx,japaneseSign('Awamori South wind'),x+w/2,y+(h-56)/2+6,w-40,66,MINCHO);
   ctx.fillStyle='#fff6e0';signText(ctx,'琉球泡盛 · 特約店',x+w/2,y+h-28,w-40,26,GOTHIC);
   ctx.fillStyle='rgba(120,60,30,.5)';for(const [px,py] of [[16,16],[w-16,16],[16,h-16],[w-16,h-16]]){ctx.beginPath();ctx.arc(x+px,y+py,6,0,Math.PI*2);ctx.fill();}}
  // The hours card in the door's left pane, in her hand: the hours, and that the shop delivers.
  {const [x,y,w,h]=ATLAS.hours;ctx.fillStyle='#fbf7ea';ctx.fillRect(x,y,w,h);ctx.fillStyle='#b8302a';signText(ctx,'営業時間',x+w/2,y+30,w-20,30,GOTHIC);
   ctx.fillStyle='#2a2420';signText(ctx,'9:00〜12:00',x+w/2,y+78,w-16,26,GOTHIC);signText(ctx,'17:00〜20:00',x+w/2,y+112,w-16,26,GOTHIC);
   ctx.fillStyle='#24557d';signText(ctx,japaneseSign('We deliver'),x+w/2,y+160,w-16,22,GOTHIC);signText(ctx,'☎ 2-3341',x+w/2,y+194,w-16,22,GOTHIC);}
  // The brewery's poster in the right pane: Umineko lager, a gull over the sea.
  {const [x,y,w,h]=ATLAS.beer;const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#7fc4e6');g.addColorStop(.62,'#e9f4f8');g.addColorStop(.63,'#2f6f9f');g.addColorStop(1,'#204f78');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
   ctx.strokeStyle='#ffffff';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+50,y+90);ctx.quadraticCurveTo(x+80,y+62,x+100,y+92);ctx.quadraticCurveTo(x+122,y+62,x+152,y+90);ctx.stroke();
   ctx.fillStyle='#f2b53a';ctx.fillRect(x+70,y+130,60,10);ctx.fillStyle='#ffffff';signText(ctx,'うみねこビール',x+w/2,y+h-70,w-20,30,MINCHO);signText(ctx,'UMINEKO LAGER',x+w/2,y+h-34,w-30,18,GOTHIC);}
  // The distillery's poster in the left pane.
  {const [x,y,w,h]=ATLAS.awamori;ctx.fillStyle='#2b3a2e';ctx.fillRect(x,y,w,h);ctx.fillStyle='#e9dcb8';ctx.fillRect(x+12,y+12,w-24,h-24);
   ctx.fillStyle='#6a4a36';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.58,46,58,0,0,Math.PI*2);ctx.fill();ctx.fillRect(x+w/2-18,y+h*.58-80,36,26);
   ctx.fillStyle='#2b3a2e';const chars=[...'泡盛南風'];ctx.font=`bold 34px ${MINCHO}`;chars.forEach((c,i)=>ctx.fillText(c,x+30,y+44+i*40));
   ctx.fillStyle='#b8302a';signText(ctx,'三年古酒',x+w/2+18,y+h-40,w-70,26,MINCHO);}
  // The cold case's header.
  {const [x,y,w,h]=ATLAS.cold;ctx.fillStyle='#2f6f9f';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ffffff';signText(ctx,'冷えてます',x+w/2,y+h/2+2,w-30,40,GOTHIC);}
  // Price tags on the jars: the size and the price in kanji numerals, as a jar is priced.
  for(const [r,size,price] of [[ATLAS.tag1,'三升甕','一万二千円'],[ATLAS.tag2,'二升甕','八千円'],[ATLAS.tag3,'一升甕','四千五百円']]){
   const [x,y,w,h]=r;ctx.fillStyle='#fbf3dc';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#b8302a';ctx.lineWidth=4;ctx.strokeRect(x+4,y+4,w-8,h-8);
   ctx.fillStyle='#2a2420';signText(ctx,size,x+w/2,y+34,w-14,24,MINCHO);ctx.fillStyle='#b8302a';signText(ctx,price,x+w/2,y+74,w-12,20,GOTHIC);}
  // The kusu's card: 非売品, not for sale.
  {const [x,y,w,h]=ATLAS.kusu;ctx.fillStyle='#ffffff';ctx.fillRect(x,y,w,h);ctx.fillStyle='#b8302a';signText(ctx,'非売品',x+w/2,y+40,w-12,28,MINCHO);
   ctx.fillStyle='#2a2420';signText(ctx,'古酒',x+w/2,y+80,w-20,24,MINCHO);}
  // The 留守 card: the back of a calendar page, written in marker.
  {const [x,y,w,h]=ATLAS.rusu;ctx.fillStyle='#f8f4ea';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(120,120,120,.25)';for(let k=0;k<6;k++)ctx.fillRect(x+6,y+92+k*10,w-12,1);
   ctx.fillStyle='#1d1d1d';const big=[...HIGA_RUSU_CARD.jp];ctx.font=`bold 44px ${MINCHO}`;big.forEach((c,i)=>ctx.fillText(c,x+w/2,y+28+i*44));
   ctx.fillStyle='#b8302a';signText(ctx,HIGA_RUSU_CARD.jpLine,x+w/2,y+h-22,w-10,17,GOTHIC);}
 });
}
/** A quad of the lettering sheet: region `r` drawn w×h at `at`, facing +z turned by ry, in the shop-house's frame. */
function letteringQuad(r,w,h,at,ry=0){
 const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,[px,py,pw,ph]=r;
 const u0=px/ATLAS.w,u1=(px+pw)/ATLAS.w,v1=1-py/ATLAS.h,v0=1-(py+ph)/ATLAS.h;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)?u1:u0,uv.getY(i)?v1:v0);
 g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(1,1,1)));
 return g;
}
/**
 * Where the lettering sits, each face 6 mm or more in front of the board or pane it is on (tests/no-z-fighting.test.mjs).
 * The cards in the door's fixed panes are 1 cm behind the glass, taped to its inside, read from the street. The frame is
 * the street's (y 0 the pavement); what is on the fittings is 8 cm up with the shop's floor (HIGA_FRAME.floor).
 */
export const HIGA_LETTERING=Object.freeze({
 valance:Object.freeze({r:'valance',w:4.56,h:.24,at:Object.freeze([0,2.735,D+.966]),ry:0}),
 tin:Object.freeze({r:'tin',w:.8,h:.5,at:Object.freeze([-W-.028,1.85,1.0]),ry:-Math.PI/2}),
 hours:Object.freeze({r:'hours',w:.22,h:.3,at:Object.freeze([-1.45,1.96,PANE_Z-.01]),ry:0}),
 beer:Object.freeze({r:'beer',w:.42,h:.58,at:Object.freeze([1.5,1.5,PANE_Z-.01]),ry:0}),
 awamori:Object.freeze({r:'awamori',w:.42,h:.58,at:Object.freeze([-1.5,1.43,PANE_Z-.01]),ry:0}),
 cold:Object.freeze({r:'cold',w:1.1,h:.18,at:Object.freeze([-1.4,2.02,2.75]),ry:Math.PI/2}),
 tag1:Object.freeze({r:'tag1',w:.1,h:.11,at:Object.freeze([-1.454,.44,.65]),ry:Math.PI/2}),
 tag2:Object.freeze({r:'tag2',w:.1,h:.11,at:Object.freeze([-1.454,.44,1.2]),ry:Math.PI/2}),
 tag3:Object.freeze({r:'tag3',w:.1,h:.11,at:Object.freeze([-1.454,.44,1.7]),ry:Math.PI/2}),
 kusu:Object.freeze({r:'kusu',w:.13,h:.15,at:Object.freeze([-1.62,.42,-1.114]),ry:0}),
});

const ALU=0xb8bec0,TIMBER=0x8a6641,DARK=0x5d4431,CRATE=0xe8b62c,CRATE_DARK=0xc99a1e,BOTTLE=0x5a3416;

/**
 * The shop's fittings, drawn in the kit standing on the finished floor (houses.js shopInterior's fitted frame). Returns
 * their colliders.
 */
export function higaInterior(kit){
 const solids=[];
 // The counter across the back, its end open on the police-station side (+x) so the keeper comes round.
 {const x0=-open,x1=.4,z0=-.75,z1=-.15;
  kit.block(x0,x1,0,.9,z0,z1,0x6e4b30);kit.block(x0-.02,x1+.02,.9,.95,z0-.02,z1+.03,0xb98c5a);
  for(let i=0;i<8;i++)kit.box(.02,.78,.012,x0+.18+i*.3,.47,z1+.006,0x5d3f28);
  kit.box(.36,.2,.3,-.35,1.05,-.45,0xd9d2bf);kit.box(.3,.1,.1,-.35,1.2,-.52,0x3a4448,{rx:-.4});kit.box(.32,.04,.18,-.35,.97,-.33,0x9fa5a8);
  // her abacus, the telephone and the delivery book, open at this week
  kit.box(.34,.025,.11,.08,.963,-.36,0x4a2f1e);for(let k=0;k<5;k++)kit.box(.3,.012,.012,.08,.98,-.4+k*.02,0x2b1d12);
  kit.box(.22,.09,.2,-1.62,.995,-.5,0xd8cbb0);kit.box(.2,.05,.05,-1.62,1.065,-.56,0xcbbd9f);
  kit.box(.36,.02,.25,-1.0,.96,-.45,0xf2ead6);kit.box(.01,.022,.25,-1.0,.962,-.45,0x6a5240);kit.box(.02,.005,.12,-.92,.972,-.38,0xb8302a);
  solids.push(kit.rect(x0,x1+.02,z0-.02,z1+.012,1.0,'liquor-counter'));}
 // Behind the counter: the shelf of dear bottles on the back wall, and the family kusu on its stand in the corner.
 {const x0=-1.2,x1=-.3,z0=back+.06,z1=back+.3;
  kit.block(x0,x1,0,.6,z0,z1,0x6e4b30);for(const y of [1.0,1.45,1.9])kit.block(x0,x1,y-.02,y,z0,z1,0x8a6641);
  for(const x of [x0-.02,x1+.02])kit.box(.04,1.95,.24,x,.975,(z0+z1)/2,0x5d3f28);
  const tints=[0x3b4a2c,0x6a4a2a,0xd8d0b0,0x2c5a6a,0x8a3b2e,0xb88a3a];
  [1.0,1.45].forEach((y,row)=>{for(let i=0;i<6;i++){const x=x0+.12+i*.135,h=.26+(i%3)*.03;kit.cyl(.04,.045,h,x,y+h/2,(z0+z1)/2,tints[(i+row*2)%tints.length],{segments:6,finish:'glow'});}});
  for(let i=0;i<3;i++)kit.box(.22,.3,.16,x0+.16+i*.29,1.9+.15,(z0+z1)/2,[0x1f3a5a,0x6a1f22,0x2b2b2b][i]);
  solids.push(kit.rect(x0,x1,back,z1+.02,2.3,'liquor-back-shelf'));}
 {const x=-1.62,z=-1.42;
  kit.box(.62,.25,.62,x,.125,z,0x4a3324);kit.sphere(.27,x,.55,z,0x8a5a3c,{sy:1.15,detail:2});
  kit.cyl(.1,.13,.12,x,.88,z,0x8a5a3c,{segments:12});kit.cyl(.14,.14,.04,x,.96,z,0xa07a4a,{segments:12});
  for(const ry of [0,Math.PI/2])kit.box(.3,.012,.012,x,.985,z,0xcfc29a,{ry});
  kit.box(.11,.13,.006,x,.98,z+.135,0xf6f0e2);
  kit.box(.15,.17,.01,-1.62,.34,-1.125,0xe9e4d6);
  solids.push(kit.rect(x-.33,x+.33,z-.33,-1.07,1.0,'liquor-kusu'));}
 // The doorway to the storeroom, in the back wall at the counter's open end (its noren is the frontage's).
 kit.block(.8,1.5,0,1.9,back+.06,back+.08,0x2c2520);for(const x of [.78,1.52])kit.block(x-.03,x+.03,0,1.95,back+.06,back+.1,TIMBER);kit.block(.75,1.55,1.9,1.98,back+.06,back+.1,TIMBER);
 // The 一升瓶 shelves up the police-station wall.
 {const x0=open-.4,x1=open,z0=1.0,z1=3.3;
  for(let k=0;k<5;k++){const y=.1+k*.46;kit.block(x0,x1-.01,y-.025,y,z0+.04,z1-.04,0xb9b0a0);}
  for(const z of [z0+.02,z1-.02])kit.block(x0-.01,x1,0,2.3,z-.02,z+.02,0x8a7f70);
  const tints=[0x2f5a2f,0x6a4a2a,0x2c5a6a,0x8a3b2e,0xd8d0b0,0x3b4a2c];
  for(let k=0;k<5;k++){const y=.1+k*.46,tall=k<3;
   for(let i=0;i<14;i++){const z=z0+.12+i*.155,h=tall?.36:.27,r=tall?.052:.04;
    kit.cyl(r,r,h*.7,(x0+x1)/2,y+h*.35,z,tints[(i*3+k)%tints.length],{segments:6,finish:'glow'});
    kit.cyl(.016,r*.8,h*.3,(x0+x1)/2,y+h*.85,z,tints[(i*3+k)%tints.length],{segments:5,finish:'glow'});}}
  solids.push(kit.rect(x0,x1,z0,z1,2.35,'liquor-shelves'));}
 // The cold case on the Kitano Road wall by the door: its lit back and its glass are the frontage's.
 {const x0=-open,x1=-1.42,z0=2.15,z1=3.35;
  kit.block(x0,x1,0,.18,z0,z1,0xd7d8d2);kit.block(x0,x1,1.86,2.04,z0,z1,0xe8e8e2);
  kit.block(x0,x0+.06,.18,1.86,z0,z1,0xe8e8e2);kit.block(x0,x1,.18,1.86,z0,z0+.05,0xe8e8e2);kit.block(x0,x1,.18,1.86,z1-.05,z1,0xe8e8e2);
  kit.block(x1-.05,x1-.01,.18,1.86,(z0+z1)/2-.02,(z0+z1)/2+.02,ALU);
  kit.block(x1+.002,x1+.012,1.85,2.03,z0+.04,z1-.04,0x2f6f9f);
  for(const y of [.6,1.05,1.5]){kit.block(x0+.06,x1-.06,y-.015,y,z0+.05,z1-.05,0xc8ccc8,'metal');
   for(let i=0;i<7;i++){const z=z0+.16+i*.15;kit.cyl(.035,.035,.24,-1.72,y+.12,z,i%3?BOTTLE:0x6c8a3a,{segments:6,finish:'glow'});}}
  solids.push(kit.rect(x0,x1+.02,z0,z1,2.05,'liquor-fridge'));}
 // The jars for sale on their low stage along the Kitano Road wall, each with its tag on a stake.
 {const x0=-open,x1=-1.47,z0=.3,z1=2.0;
  kit.block(x0,x1,0,.16,z0,z1,0x6e4b30);
  for(const [z,r,c] of [[.65,.24,0x3a2a22],[1.2,.2,0x58646a],[1.7,.17,0x4a2e22]]){
   kit.sphere(r,-1.8,.16+r*1.05,z,c,{sy:1.1,detail:2,finish:'gloss'});kit.cyl(r*.42,r*.5,r*.4,-1.8,.16+r*2.2,z,c,{segments:10,finish:'gloss'});
   kit.cyl(r*.5,r*.5,.03,-1.8,.16+r*2.42,z,0xa07a4a,{segments:10});
   kit.box(.02,.2,.02,-1.47,.26,z,0x4a3324);kit.box(.01,.13,.12,-1.465,.36,z,0xe9e4d6);}
  solids.push(kit.rect(x0,x1+.03,z0,z1,.75,'liquor-kame'));}
 // A poster over the jars on the Kitano Road wall: none; the wall's enamel tin is outside.
 return solids;
}

/**
 * The building's own articulation and the props outside, drawn into the quarter's kit (one batch with the street).
 * Called from shopHouse inside its frame. Returns colliders.
 */
export function higaBuilding(kit,{trim=0x8a3b2e}={}){
 const solids=[],band=0xd8c4b8,hood=0xdacdc2,sill=0xc9bdb2;
 // The slab band and the coping, as on Nakamura's.
 kit.block(-W-.025,-W,3.17,3.33,-D,D,band);kit.block(W,W+.025,3.17,3.33,-D,D,band);kit.block(-W-.025,W+.025,3.17,3.33,-D-.025,-D,band);
 kit.block(-W-.03,W+.03,H+.5,H+.55,-D-.03,-D+.17,band);
 kit.block(-W-.03,-W+.17,H+.5,H+.55,-D+.17,D-.18,band);kit.block(W-.17,W+.03,H+.5,H+.55,-D+.17,D-.18,band);
 // Hoods over the two upper windows at the front (shopHouse's frames at ±W·.48).
 for(const x of [-W*.48,W*.48])kit.box(1.8,.08,.32,x,5.56,D+.16,hood);
 // The front: the aluminium sash's head, sill, mullions and kick plates (the panes and the leaves are the frontage's).
 kit.block(-open,open,DOOR_H,DOOR_H+.08,D-.53,D-.36,ALU,'metal');kit.block(-open,open,DOOR_H+.08,3.0,D-.46,D-.42,trim);
 kit.block(-open,open,.08,.1,D-.53,D-.36,ALU,'metal');
 for(const x of [-open+.025,-DOOR-.02,DOOR+.02,open-.025])kit.box(.05,DOOR_H-.1,.06,x,(DOOR_H+.1)/2,PANE_Z,ALU,{finish:'metal'});
 // The fixed panes are solid; the doorway between them is the leaves' (higaFrontage doorSolid).
 solids.push(kit.rect(-open,-DOOR,D-.45,D-.35,2.7,'higa-front-pane'),kit.rect(DOOR,open,D-.45,D-.35,2.7,'higa-front-pane'));
 for(const s of [-1,1])kit.block(s<0?-open+.05:DOOR+.045,s<0?-DOOR-.045:open-.05,.1,.45,D-.415,D-.385,ALU,'metal');
 // The canvas awning: two steel arms from the wall, the sloping canvas and its lettered valance.
 for(const x of [-2.15,2.15])kit.rod([x,3.12,D+.02],[x,2.86,D+.92],.018,0x5f6568);
 kit.box(4.6,.025,.98,0,2.995,D+.47,0x8a352c,{rx:.27});kit.box(4.6,.26,.02,0,2.735,D+.95,0x7d2f27);
 kit.box(.06,.05,.05,-2.3,2.86,D+.94,0x5f6568);kit.box(.06,.05,.05,2.3,2.86,D+.94,0x5f6568);
 // The sugidama under the awning, over the crates on the Kitano Road side.
 {const x=-1.15,z=D+.55;kit.rod([x,2.92,z],[x,2.55,z],.008,0x4a3a2a);kit.sphere(.22,x,2.33,z,0x6f7a45,{detail:1});kit.cyl(.05,.05,.06,x,2.57,z,0x4a3a2a,{segments:8});}
 // The flanks: one upstairs window each side, and on Kitano Road the storeroom's grilled window, the meter and the tin.
 const sideWindow=(z,y,wz,hy,s)=>{const x=s*W;
  kit.box(.05,hy+.12,wz+.12,x+s*.025,y,z,ALU,{finish:'metal'});kit.box(.04,hy-.02,wz-.02,x+s*.04,y,z,0x5d7a84,{finish:'window'});
  kit.box(.05,hy-.02,.04,x+s*.065,y,z,ALU,{finish:'metal'});kit.box(.16,.06,wz+.2,x+s*.08,y-hy/2-.09,z,sill);kit.box(.32,.08,wz+.3,x+s*.16,y+hy/2+.1,z,hood);};
 sideWindow(1.4,4.75,1.2,1.1,-1);sideWindow(1.4,4.75,1.2,1.1,1);
 {const z=-2.9,y=1.55,blue=0x6d7477,x=-W;
  kit.box(.05,.9,1.0,x-.025,y,z,blue);kit.box(.04,.76,.86,x-.04,y,z,0xdfe6e4,{finish:'glow'});
  kit.box(.14,.05,1.08,x-.07,y-.475,z,sill);kit.box(.36,.08,1.2,x-.18,2.08,z,hood);
  for(let i=0;i<6;i++)kit.rod([x-.115,1.1,z-.42+i*.168],[x-.115,2.0,z-.42+i*.168],.012,0x8e979a);}
 {const z=3.1;kit.box(.16,.48,.36,-W-.08,1.8,z,0x9a958a);kit.cyl(.07,.07,.02,-W-.17,1.8,z,0x3a4448,{rz:Math.PI/2,segments:12});
  kit.rod([-W-.045,2.04,z],[-W-.045,6.0,z],.025,0x8e979a);kit.rod([-W-.045,6.0,z],[-W-.15,6.07,z],.025,0x8e979a);}
 {const T=HIGA_LETTERING.tin;kit.box(.02,.54,.84,-W-.01,T.at[1],T.at[2],0xf1e6c8);}
 // The back: the storeroom's steel door, its hood and step, and the stock room's window over it.
 {const x=.7;
  kit.box(1.0,2.1,.06,x,1.05,-D-.03,ALU,{finish:'metal'});kit.box(.86,2.0,.04,x,1.02,-D-.07,0x7b6f68);
  kit.box(.03,.18,.05,x+.33,1.0,-D-.115,0xd8dcdc,{finish:'metal'});
  kit.box(1.2,.08,.55,x,2.26,-D-.275,hood);kit.box(1.0,.15,.4,x,.075,-D-.2,0xc4c0b4);
  solids.push(kit.rect(x-.52,x+.52,-D-.42,-D,.5,'higa-back-step'));
  kit.box(1.32,1.22,.05,x,4.85,-D-.025,ALU,{finish:'metal'});kit.box(1.18,1.08,.04,x,4.85,-D-.04,0x5d7a84,{finish:'window'});
  kit.box(1.4,.06,.16,x,4.21,-D-.08,sill);kit.box(1.5,.08,.32,x,5.49,-D-.16,hood);}
 // The empties by the door on the Kitano Road side: yellow crates of large bottles, three and two high.
 {const crate=(x,y,z)=>{kit.box(.32,.29,.44,x,y+.145,z,CRATE);kit.box(.33,.04,.45,x,y+.275,z,CRATE_DARK);kit.box(.2,.06,.01,x,y+.18,z+.226,0xb8302a);};
  for(const [x,n] of [[-1.5,3],[-1.16,2]]){for(let i=0;i<n;i++)crate(x,i*.3,4.11);
   for(let a=0;a<2;a++)for(let b=0;b<4;b++)kit.cyl(.028,.028,.06,x-.075+a*.15,n*.3+.03,4.11-.165+b*.11,BOTTLE,{segments:6});}
  solids.push(kit.rect(-1.68,-.98,3.87,4.35,.95,'higa-empties'));}
 // The yuntaku bench and the two crate stools (commerce/higa-liquor.js YUNTAKU: the same numbers, in the world).
 {const B=YUNTAKU.bench,[bx0,bz0]=toLocal(B.x-B.depth/2,B.z0),[bx1,bz1]=toLocal(B.x+B.depth/2,B.z1);
  const x0=Math.min(bx0,bx1),x1=Math.max(bx0,bx1),z0=Math.min(bz0,bz1),z1=Math.max(bz0,bz1);
  for(let i=0;i<4;i++)kit.block(x0,x1,B.height-.035,B.height,z0+.02+i*(z1-z0-.04)/4+.005,z0+.02+(i+1)*(z1-z0-.04)/4-.005,0xa98257);
  kit.block(x0+.04,x1-.04,B.height-.08,B.height-.035,z0+.03,z1-.03,DARK);
  for(const x of [x0+.08,x1-.08])for(const z of [z0+.06,z1-.06])kit.box(.06,B.height-.08,.06,x,(B.height-.08)/2,z,DARK);
  solids.push(kit.rect(x0,x1,z0,z1,B.height+.04,'higa-bench'));
  for(const c of YUNTAKU.crates){const [x,z]=toLocal(c.x,c.z);
   kit.box(.45,.27,.36,x,.135,z,CRATE);kit.box(.46,.04,.37,x,.29,z,CRATE_DARK);for(const dx of [-.12,.12])kit.box(.12,.005,.26,x+dx,.312,z,0xc99a1e);
   solids.push(kit.rect(x-.23,x+.23,z-.19,z+.19,.33,'higa-crate-stool'));}}
 return solids;
}
/** A world point in the shop-house's frame (the inverse of higaPoint). */
const toLocal=(x,z)=>[z-HIGA_FRAME.origin[1],HIGA_FRAME.origin[0]-x];

/** The shutter's steel: ribbed slats in the trim's paint, the bottom rail and its lock darker (as Nakamura's). */
function shutterSteel(trim){
 const c=new THREE.Color(trim),hex=k=>'#'+c.clone().multiplyScalar(k).getHexString();
 return paint(128,512,(ctx,w,h)=>{
  ctx.fillStyle=hex(1);ctx.fillRect(0,0,w,h);
  const rail=14,slats=46,pitch=(h-rail)/slats;
  for(let i=0;i<slats;i++){const y=i*pitch;ctx.fillStyle=hex(1.18);ctx.fillRect(0,y+1,w,2);ctx.fillStyle=hex(.72);ctx.fillRect(0,y+pitch-2,w,2);}
  const g=ctx.createLinearGradient(0,h*.7,0,h);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(235,230,215,.18)');ctx.fillStyle=g;ctx.fillRect(0,h*.7,w,h*.3);
  ctx.fillStyle=hex(.55);ctx.fillRect(0,h-rail,w,rail);ctx.fillStyle='#c9cdcc';ctx.fillRect(w/2-5,h-rail+3,10,7);
 });
}
/** The storeroom's noren: plain indigo with the family crest's ring, the same both sides. */
function norenCloth(){
 return paint(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#24365a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#1a2847';ctx.fillRect(0,0,w,14);
  ctx.strokeStyle='#e8e4d8';ctx.lineWidth=10;ctx.beginPath();ctx.arc(w/2,h*.45,48,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#e8e4d8';ctx.font=`bold 52px ${MINCHO}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('比',w/2,h*.46);
  ctx.fillStyle='#0e1424';ctx.fillRect(w/2-3,18,6,h-18);
 });
}

/**
 * What follows the hours, in its own group in the shop-house's frame: the glass (the fixed panes and the cold case's
 * door, one mesh), the two door leaves with the 留守 card on the right one, the roller shutter, the lit tubes and the cold
 * case's light, the storeroom's noren and the lettering sheet. update(minutes) moves them to the clock.
 */
export function higaFrontage({origin=HIGA_FRAME.origin,trim=0x8a3b2e,shadows=false}={}){
 const group=new THREE.Group();group.name='Higa Liquor frontage';group.position.set(origin[0],0,origin[1]);group.rotation.y=-Math.PI/2;
 const sheet=paintLettering(),letters=new THREE.MeshStandardMaterial({map:sheet,roughness:.8});
 const L=HIGA_LETTERING;
 const lettering=new THREE.Mesh(mergeGeometries(Object.values(L).map(q=>letteringQuad(ATLAS[q.r],q.w,q.h,q.at,q.ry))),letters);
 lettering.name='Higa Liquor lettering (valance, tin, cards, posters, tags)';lettering.receiveShadow=true;group.add(lettering);
 // The glass: the two fixed panes and the cold case's door (clear shop glass, drawn after the room it shows).
 const glass=createShopGlass(),pane=(w,h,at,ry=0)=>{const g=new THREE.PlaneGeometry(w,h);g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(1,1,1)));return g;};
 const fixed=new THREE.Mesh(mergeGeometries([pane(open-DOOR-.1,DOOR_H-.47,[-(open+DOOR)/2,(DOOR_H+.45)/2,PANE_Z]),pane(open-DOOR-.1,DOOR_H-.47,[(open+DOOR)/2,(DOOR_H+.45)/2,PANE_Z]),pane(1.1,1.64,[-1.415,1.1,2.75],Math.PI/2)]),glass);
 fixed.name='Higa Liquor glass';fixed.renderOrder=2;group.add(fixed);
 // The two leaves: frame, glass and pull; the right one carries the 留守 card on its string.
 const leaves=[];
 for(const s of [-1,1]){
  const leaf=new THREE.Group();leaf.name=`Higa Liquor door leaf (${s<0?'Kitano Road':'police station'} side)`;group.add(leaf);
  const k=createKit({shadows});
  k.box(DOOR,.06,.04,0,DOOR_H-.06,0,ALU,{finish:'metal'});k.box(DOOR,.12,.04,0,.17,0,ALU,{finish:'metal'});
  for(const x of [-DOOR/2+.025,DOOR/2-.025])k.box(.05,DOOR_H-.12,.04,x,(DOOR_H+.08)/2,0,ALU,{finish:'metal'});
  k.box(.03,.3,.05,-s*(DOOR/2-.09),1.1,0,0x8e979a,{finish:'metal'});
  k.finish(leaf,'Higa Liquor door frame');
  const g=new THREE.Mesh(new THREE.PlaneGeometry(DOOR-.1,DOOR_H-.33),glass);g.position.set(0,(DOOR_H+.2)/2,0);g.renderOrder=2;g.name='Higa Liquor door glass';leaf.add(g);
  leaves.push({leaf,s});
 }
 // The card: a thin board on the right leaf's outside, its face the lettering sheet's, hung from the pull by a string.
 const card=new THREE.Group();card.name='Higa Liquor rusu card';leaves[1].leaf.add(card);
 {const k=createKit({shadows:false});k.box(.21,.3,.004,0,1.42,.034,0xf8f4ea);k.rod([-.07,1.57,.03],[-.33,1.26,.03],.003,0x7a6a5a);k.finish(card,'Higa Liquor rusu card');
  const face=new THREE.Mesh(letteringQuad(ATLAS.rusu,.2,.29,[0,1.42,.0395]),letters);face.name='Higa Liquor rusu card face';card.add(face);}
 // The roller shutter, as Nakamura's, over the whole opening 15 cm behind the piers' faces.
 const opening={x0:-open,x1:open,foot:.08,head:ground+.02,z:D-.15},tall=opening.head-opening.foot,travel=ground-.42-opening.foot;
 const shutter=new THREE.Mesh(new THREE.BoxGeometry(opening.x1-opening.x0+.06,tall,.02),new THREE.MeshStandardMaterial({map:shutterSteel(trim),metalness:.3,roughness:.6}));
 shutter.name='Higa Liquor shutter';shutter.receiveShadow=true;shutter.position.set(0,opening.foot+tall/2,opening.z);group.add(shutter);
 // The lights: two fluorescent fittings (their white housings and the tubes) and the cold case's lit back.
 const lamps=createKit({shadows:false});
 for(const x of [-.85,.85])for(const z of [.4,2.2]){lamps.box(.14,.05,1.24,x,2.975,z,0xf2f0ea);lamps.cyl(.017,.017,1.18,x,2.935,z,0xfafaf2,{rx:Math.PI/2,segments:6,finish:'tube'});}
 lamps.box(.01,1.6,1.08,-open+.065,1.02+HIGA_FRAME.floor,2.75,0xeef4f2,{finish:'tube'});
 const lit=lamps.finish(group,'Higa Liquor lights').materials.tube;lit.emissive.setHex(0xf4f8ff);lit.emissiveIntensity=0;
 // The storeroom's noren in the back doorway: cloth, the same picture both sides.
 const noren=new THREE.Mesh(new THREE.PlaneGeometry(.7,.9),new THREE.MeshStandardMaterial({map:norenCloth(),roughness:.95,side:THREE.DoubleSide}));
 noren.name='Higa Liquor storeroom noren';noren.position.set(1.15,HIGA_FRAME.floor+1.45,back+.16);group.add(noren);
 group.updateMatrixWorld(true);
 const world=(x,z)=>new THREE.Vector3(x,0,z).applyMatrix4(group.matrixWorld);
 // Solids that follow the hours: the shutter and the shut doors (the frame is a quarter turn: the front runs along world z).
 const front=world(0,opening.z),doorway=world(0,LEAF_Z);
 // The player's only (`only`, game.js environmentBlocked): the residents' routes are searched once and kept, and a keeper
 // only walks in while the shop is open; they leave through the doors before they slide shut (HIGA_FRONT.after).
 const shutterSolid={id:'higa-shutter',x:front.x,z:front.z,w:.1,d:opening.x1-opening.x0,height:ground-.42,minY:1e3,only:'player'};
 const doorSolid={id:'higa-doors',x:doorway.x,z:doorway.z,w:.12,d:DOOR*2,height:DOOR_H,minY:1e3,only:'player'};
 let state=null,last={};
 const update=minutes=>{
  const now=higaLiquorState(minutes),down=higaShutterDown(minutes),shut=higaDoorsShut(minutes),rusu=higaRusuCard(minutes);
  if(down!==last.down){last.down=down;shutter.visible=down>0;shutter.position.y=opening.foot+tall/2+(1-down)*travel;shutterSolid.minY=down>.4?0:1e3;}
  if(shut!==last.shut){last.shut=shut;for(const {leaf,s} of leaves)leaf.position.set(s*(DOOR/2+(1-shut)*DOOR),0,LEAF_Z);doorSolid.minY=shut>.4?0:1e3;}
  if(rusu!==last.rusu){last.rusu=rusu;card.visible=rusu;}
  const glow=now==='open'?.55+windowGlow(minutes)*.6:0;if(glow!==last.glow){last.glow=glow;lit.emissiveIntensity=glow;}
  state=now;
 };
 return {group,leaves:leaves.map(l=>l.leaf),card,shutter,lights:lit,noren,shutterSolid,doorSolid,update,get state(){return state;}};
}
