import * as THREE from '../../../vendor/three.module.js';
import {rng} from './kit.js';
import {poster} from './signs.js';
import {coralWall,hibiscus,OKINAWA_COLOURS as C} from './houses.js';
import {bicycle,netPile,buoys} from './props.js';
import {CLEARED_LOTS,PLOT_PLANTING,LOT_COLOURS as L,lotGround} from './lots.js';
import {KITAHAMA} from '../kitahama-layout.js';
import {GROUND_LAYER} from '../ground-layers.js';

/**
 * What stands on the cleared lots (okinawa/lots.js CLEARED_LOTS, each lot's `dressing`): the lane garden and the monthly
 * parking behind Kitahama's cross lane, the bicycle shed and the hoop on the footpath, the youth association's store and
 * eisa ground, Mac's garden, the association's cane, Gran Higa's garden and Kōji's net ground on the seawall walk, Tetsu's
 * store in the Front-Row yard and the drinks corner on Main Street.
 *
 * Everything is drawn into the quarter's kit (one draw call per finish and cell, okinawa/kit.js), in the town's own
 * primitives, inside the rectangles the data gives, and every solid gets exactly the collider the data names
 * (`lot-<id>`, or the quarter's `vending`). No lamp is added: the drinks machines light themselves, the lanes have their
 * poles. Built at the town's ground: Kitahama's frame is level with it (KITAHAMA.y), Nishi's sand and the yard's lawn too.
 */
const P=Object.freeze({gravel:0xcfc5ab,concrete:0xb9b4a8,paint:0xf1efe6,stop:0xc9c4b8,earth:0x8a4a32,earthDry:0x9a5f40,
 leaf:0x4f7d3e,leafDark:0x3c6a35,leafLight:0x6e9a4c,steel:0x6c7476,galv:0xa9b1b3,tyre:0x1f2124,glass:0x5d7a84,black:0x26282b,
 shedWall:0xe6e0cc,shedDoor:0x6e8a6a,shedRoof:0x8c9ea3,timber:0x8a6a45,timberDark:0x5d4431,cane:0x9aa860,caneDark:0x7d8a4c,
 caneLeaf:0x6f9a4a,goya:0x6fa84a,hibiscus:0xd9303b,yellow:0xd8b13c,orange:0xd8742a});
const PAD_TOP=.045,PAINT=PAD_TOP+.016;
const mid=r=>[(r.minX+r.maxX)/2,(r.minZ+r.maxZ)/2];
const lotOf=id=>CLEARED_LOTS.find(l=>l.id===id);
const propOf=(lot,id)=>{const p=lot.dressing.props.find(q=>q.id===id);if(!p)throw new Error(lot.id+': no prop '+id);return p;};
/** The collider a prop's data names: its rectangle and height, no more. */
const colliderOf=p=>{const [x,z]=mid(p.rect);return {id:'lot-'+p.id,x,z,w:+(p.rect.maxX-p.rect.minX).toFixed(4),d:+(p.rect.maxZ-p.rect.minZ).toFixed(4),height:p.height};};

/** Builds every dressed lot on Minato into the quarter's kit. */
export function buildLotDressing(kit,solid,{anchor,onAction,vending}={}){
 const ctx={kit,solid,anchor,onAction,vending,read:(x,z,label,title,text,kind='inspect')=>anchor?.(x,1.1,z,label,()=>onAction?.(kind,title,text))};
 const put=(lot,id)=>{const p=propOf(lot,id);solid(colliderOf(p));return p;};
 northBlock(ctx,lotOf('kitahama-north-block'),put);
 lot9(ctx,lotOf('kitahama-9-lot'),put);
 lot7(ctx,lotOf('kitahama-7-lot'),put);
 lot6(ctx,lotOf('kitahama-6-lot'),put);
 for(const id of ['kitahama-10-lot','kitahama-11-lot','kitahama-12-lot'])cane(ctx,lotOf(id),put);
 plotPlanting(ctx);
 kinjo(ctx,lotOf('kinjo-lot'),put);
 oshiro(ctx,lotOf('oshiro-lot'),put);
 yard1(ctx,lotOf('front-row-yard-1'),put);
 postOffice(ctx,lotOf('post-office-lot'),put);
}

/* ------------------------------- Pieces ------------------------------- */

/** A raised bed of red earth, 25 cm, with its edging boards. */
function bed(kit,r,{top=.25,seed=1}={}){
 kit.block(r.minX,r.maxX,0,top,r.minZ,r.maxZ,P.earth);
 kit.block(r.minX+.04,r.maxX-.04,top,top+.01,r.minZ+.04,r.maxZ-.04,P.earthDry);
 for(const [x0,x1,z0,z1] of [[r.minX,r.maxX,r.minZ,r.minZ+.04],[r.minX,r.maxX,r.maxZ-.04,r.maxZ],[r.minX,r.minX+.04,r.minZ,r.maxZ],[r.maxX-.04,r.maxX,r.minZ,r.maxZ]])kit.block(x0,x1,0,top+.03,z0,z1,P.timberDark);
 return top+.01;
}
/** Plants along a bed, `fn(x,z,i)` at each spot, in rows along its long side. */
function rows(r,{rows:n=2,step=.45,inset=.25},fn){
 const alongX=r.maxX-r.minX>=r.maxZ-r.minZ,len=alongX?r.maxX-r.minX:r.maxZ-r.minZ,across=alongX?r.maxZ-r.minZ:r.maxX-r.minX;
 const count=Math.max(1,Math.floor((len-2*inset)/step)+1);let i=0;
 for(let k=0;k<n;k++)for(let j=0;j<count;j++){
  const u=(alongX?r.minX:r.minZ)+inset+j*step,v=(alongX?r.minZ:r.minX)+across*(k+1)/(n+1);
  fn(alongX?u:v,alongX?v:u,i++);
 }
}
/** A steel garden shed (物置): ivory panels, two sliding doors on the `face` side, a sloping lid. */
function steelShed(kit,r,{face='south',h=1.95,door=P.shedDoor,units=1}={}){
 const {minX,maxX,minZ,maxZ}=r,alongX=face==='north'||face==='south';
 kit.block(minX,maxX,0,.08,minZ,maxZ,0x77736a);
 kit.block(minX+.02,maxX-.02,.08,h-.08,minZ+.02,maxZ-.02,P.shedWall,'metal');
 kit.block(minX-.05,maxX+.05,h-.08,h,minZ-.05,maxZ+.05,P.shedRoof,'metal');
 // Ribs down the side panels, the doors in their tracks and a handle on each.
 const out=face==='south'?minZ-.012:face==='north'?maxZ+.012:face==='west'?minX-.012:maxX+.012;
 const len=alongX?maxX-minX:maxZ-minZ,start=alongX?minX:minZ,per=len/units;
 for(let u=0;u<units;u++){
  const a=start+u*per+.08,b=start+(u+1)*per-.08,m=(a+b)/2;
  for(const [p0,p1] of [[a,m+.03],[m-.03,b]]){
   if(alongX)kit.block(p0,p1,.12,h-.16,out-.012,out+.012,door,'metal');else kit.block(out-.012,out+.012,.12,h-.16,p0,p1,door,'metal');
  }
  const hx=alongX?[m-.15,m+.15]:null;
  for(const k of [-.15,.15]){if(alongX)kit.box(.04,.18,.03,m+k,1.0,out+(face==='south'?-.02:.02),P.galv,{finish:'metal'});else kit.box(.03,.18,.04,out+(face==='west'?-.02:.02),1.0,m+k,P.galv,{finish:'metal'});}
  void hx;
  if(alongX)kit.block(a,b,.1,.12,out-.03,out+.03,P.steel,'metal');else kit.block(out-.03,out+.03,.1,.12,a,b,P.steel,'metal');
 }
}
/** A clipped hedge: a dense block of leaf with rounded growth on it, and flowers if it is hibiscus. */
function hedge(kit,r,{h=1,seed=1,flower=P.hibiscus}={}){
 const rr=rng(seed),alongX=r.maxX-r.minX>=r.maxZ-r.minZ,len=alongX?r.maxX-r.minX:r.maxZ-r.minZ,th=alongX?r.maxZ-r.minZ:r.maxX-r.minX;
 const [cx,cz]=mid(r),greens=[P.leaf,P.leafDark,0x4b7a3f,0x5b8a45];
 // A narrower core, and the growth over its top and both faces in clumps, so it reads as a clipped shrub and not a box.
 kit.box(alongX?len-.2:th-.2,h-.3,alongX?th-.2:len-.2,cx,(h-.3)/2,cz,P.leafDark);
 const n=Math.max(2,Math.round(len/.42));
 for(let i=0;i<n;i++){
  const u=(alongX?r.minX:r.minZ)+(i+.5)*len/n,at=(v,y)=>alongX?[u,y,cz+v]:[cx+v,y,u];
  const top=at((rr.next()-.5)*.08,h-.24);kit.sphere(th*.42,...top,rr.pick(greens),{sx:alongX?1.3:1,sz:alongX?1:1.3,sy:.62,detail:0});
  for(const side of [-1,1]){const p=at(side*th*.22,.25+rr.next()*(h-.6));kit.sphere(th*.28,...p,rr.pick(greens),{sy:1.1,detail:0});}
  if(flower&&rr.next()>.3)for(let k=0;k<2;k++){const side=rr.next()>.5?1:-1,p=at(side*th*.44,h-.2-rr.next()*(h-.45));p[alongX?0:2]+=(rr.next()-.5)*.3;kit.sphere(.055,...p,flower,{detail:0});}
 }
}
/** A sign board on two posts, its face looking along `ry` (0 faces +z). */
function postSign(kit,texture,{x,z,ry=0,w=1.1,h=.75,y=1.45,name='sign',post=.05,span=null}){
 const s=span??w-.12,dx=Math.cos(ry)*s/2,dz=-Math.sin(ry)*s/2,back=-.04;
 for(const k of [-1,1])kit.box(post,y+h/2,post,x+k*dx+Math.sin(ry)*back,(y+h/2)/2,z+k*dz+Math.cos(ry)*back,P.steel,{finish:'metal'});
 kit.sign(texture,w,h,x,y,z,{ry,name});
}
/** A parked vehicle, its nose along local +z, built from boxes like the patrol car. */
function vehicle(kit,{kind,colour,length:Lg,width:W,bonnetUp=false,bed=null}){
 const Lh=Lg/2,Wh=W/2,wheelZ=Lh-.62;
 for(const [x,z] of [[-Wh+.12,wheelZ],[Wh-.12,wheelZ],[-Wh+.12,-wheelZ],[Wh-.12,-wheelZ]]){kit.cyl(.26,.26,.17,x,.26,z,P.tyre,{rz:Math.PI/2,segments:14});kit.cyl(.13,.13,.18,x,.26,z,0xb9bec0,{rz:Math.PI/2,segments:10,finish:'metal'});}
 kit.block(-Wh,Wh,.2,.32,-Lh-.03,Lh+.03,0x3a3c40);
 const lamp=(z,s)=>{for(const k of [-1,1])kit.box(.2,.1,.03,k*(Wh-.2),.62,z+s*.015,s>0?0xf0ecd6:0xc8432f);};
 if(kind==='kei truck'){
  // Cab over the front wheels, the bed behind with its drop sides.
  const cab0=Lh-1.3;
  kit.block(-Wh,Wh,.32,1.0,cab0,Lh,colour);
  kit.block(-Wh+.03,Wh-.03,1.0,1.82,cab0+.05,Lh-.25,colour);
  kit.block(-Wh+.06,Wh-.06,1.08,1.66,Lh-.27,Lh-.2,P.glass);
  for(const k of [-1,1])kit.block(k*Wh-.012,k*Wh+.012,1.08,1.6,cab0+.15,Lh-.35,P.glass);
  kit.block(-Wh,Wh,.55,.6,-Lh,cab0,colour);
  kit.block(-Wh,Wh,.32,.55,-Lh,cab0,0x8f9497);
  for(const [x0,x1,z0,z1] of [[-Wh,-Wh+.05,-Lh,cab0],[Wh-.05,Wh,-Lh,cab0],[-Wh,Wh,-Lh,-Lh+.05]])kit.block(x0,x1,.6,.92,z0,z1,colour);
  kit.block(-Wh+.08,Wh-.08,1.0,1.16,cab0-.06,cab0,0x3a3c40);
  bed?.(kit,{floor:.6,z0:-Lh+.05,z1:cab0-.05,half:Wh-.05});
  lamp(Lh,1);lamp(-Lh,-1);
  return;
 }
 // A hatchback or a kei car: the body, the glasshouse set back from the nose, the bonnet.
 const nose=kind==='kei car'?Lh-.55:Lh-.95;
 kit.block(-Wh,Wh,.32,.88,-Lh,Lh,colour);
 kit.block(-Wh+.06,Wh-.06,.88,1.42,-Lh+.12,nose,colour);
 kit.block(-Wh+.1,Wh-.1,.92,1.38,nose-.02,nose+.02,P.glass);
 kit.block(-Wh+.1,Wh-.1,.94,1.36,-Lh+.1,-Lh+.14,P.glass);
 for(const k of [-1,1])kit.block(k*(Wh-.06)-.012,k*(Wh-.06)+.012,.95,1.36,-Lh+.25,nose-.1,P.glass);
 for(const k of [-1,1])kit.block(k*(Wh-.06)-.014,k*(Wh-.06)+.014,.92,1.4,-.12+(kind==='kei car'?.1:0),-.04+(kind==='kei car'?.1:0),colour);
 lamp(Lh,1);lamp(-Lh,-1);
 if(bonnetUp){
  // Open on its stay, hinged at the windscreen: the engine bay's dark below it, the battery and the air cleaner.
  kit.block(-Wh+.08,Wh-.08,.6,.86,nose+.05,Lh-.05,0x2c2e30);
  kit.cyl(.17,.17,.08,-.15,.9,nose+.45,0x3a3c40,{segments:12});kit.box(.22,.18,.16,Wh-.35,.86,nose+.3,0x1f4f8a);
  const hinge=new THREE.Vector3(0,.9,nose+.02),len=Lh-nose-.05;
  kit.box(W-.08,.035,len,0,hinge.y+Math.sin(1.05)*len/2,hinge.z+Math.cos(1.05)*len/2,colour,{rx:-1.05});
  kit.rod([Wh-.25,.86,Lh-.2],[Wh-.25,hinge.y+Math.sin(1.05)*len*.9,hinge.z+Math.cos(1.05)*len*.9],.008,0x9aa0a4);
 }
}
/** Bicycle and tricycle aside, a few garden things. */
function papaya(kit,x,z,{seed=1,h=3}={}){
 const r=rng(seed);
 kit.cyl(.07,.11,h,x,h/2,z,0x8a8a6a,{segments:7});
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2+r.next()*.4;kit.rod([x,h-.05,z],[x+Math.cos(a)*.9,h+.25,z+Math.sin(a)*.9],.012,0x7d9a4a);
  kit.box(.7,.02,.6,x+Math.cos(a)*.95,h+.28,z+Math.sin(a)*.95,i%2?P.leaf:P.leafLight,{ry:-a,finish:'thin'});}
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;kit.sphere(.09,x+Math.cos(a)*.13,h-.35-(i%2)*.12,z+Math.sin(a)*.13,i%3?0x6f9a3a:0xd8a03a,{sy:1.4,detail:0});}
}
function goyaVines(kit,r,y0,y1,{seed=1,alongX=true}={}){
 const g=rng(seed),[cx,cz]=mid(r);
 const len=alongX?r.maxX-r.minX:r.maxZ-r.minZ,n=Math.round(len/.32);
 for(let i=0;i<n;i++){
  const u=(alongX?r.minX:r.minZ)+(i+.5)*len/n,y=y0+g.next()*(y1-y0),[x,z]=alongX?[u,cz+(g.next()-.5)*.25]:[cx+(g.next()-.5)*.25,u];
  kit.sphere(.22+g.next()*.12,x,y,z,g.pick([0x4f8a3e,0x3f7a36,0x5c9446]),{sy:.6,detail:0});
  if(g.next()>.6)kit.sphere(.06,x+(alongX?0:.18),y-.25,z+(alongX?.18:0),P.goya,{sy:2.6,detail:1});
 }
}

/* ------------------------- Kitahama: the north block ------------------------- */

function northBlock({kit,solid,read},lot,put){
 const D=lot.dressing,g=rng(611);
 // The garden: four beds, the papayas, the standpipe and hose reel, the shed and the wheelbarrow.
 const herb=put(lot,'herb-bed').rect,negi=put(lot,'negi-bed').rect,greens=put(lot,'greens-bed').rect,sun=put(lot,'sunflower-bed').rect;
 let y=bed(kit,herb,{seed:1});
 rows(herb,{rows:1,step:1.1,inset:.45},(x,z,i)=>{
  if(i%2===0){for(let k=0;k<9;k++){const a=k/9*Math.PI*2;kit.rod([x,y,z],[x+Math.cos(a)*.22,y+.75+g.next()*.25,z+Math.sin(a)*.18],.012,0x8fae6a,{segments:4});}}   // lemongrass
  else{kit.sphere(.2,x-.18,y+.14,z-.25,0x6b3f5f,{sy:.7,detail:0});kit.sphere(.18,x+.2,y+.12,z+.25,P.leafLight,{sy:.6,detail:0});}             // perilla, rau răm
 });
 y=bed(kit,negi,{seed:2});
 rows(negi,{rows:3,step:.22,inset:.2},(x,z)=>{kit.rod([x,y,z],[x+(g.next()-.5)*.06,y+.38+g.next()*.12,z+(g.next()-.5)*.06],.011,g.next()>.5?0x5f9a45:0x76a85a,{segments:4});});
 y=bed(kit,greens,{seed:3});
 rows(greens,{rows:2,step:.5,inset:.3},(x,z,i)=>kit.sphere(.17,x,y+.11,z,i%3?0x6a3a62:0x5b8a45,{sy:.6,detail:0}));
 y=bed(kit,sun,{seed:4});
 rows(sun,{rows:1,step:.7,inset:.35},(x,z)=>{const h=1.4+g.next()*.3;kit.rod([x,y,z],[x,y+h,z],.025,0x6f8a3a);kit.box(.3,.03,.12,x+.12,y+h*.55,z,P.leaf,{rz:.4,finish:'thin'});
  kit.cyl(.17,.17,.05,x,y+h,z-.05,0xe8b82a,{rx:Math.PI/2+.35,segments:12});kit.cyl(.09,.09,.06,x,y+h,z-.07,0x5a3a1a,{rx:Math.PI/2+.35,segments:10});});
 const wb=put(lot,'wheelbarrow').rect;{const [x,z]=mid(wb);
  kit.cyl(.17,.17,.08,wb.maxX-.2,.17,z,P.black,{rz:Math.PI/2,segments:10});kit.box(.75,.26,.52,x-.05,.42,z,0x3f7a5a,{finish:'metal'});
  for(const k of [-1,1]){kit.rod([wb.maxX-.2,.17,z+k*.2],[wb.minX+.05,.55,z+k*.25],.02,P.steel);kit.rod([x-.3,.3,z+k*.18],[x-.35,0,z+k*.2],.02,P.steel);}}
 for(const [id,seed] of [['papaya-1',21],['papaya-2',22]]){const [x,z]=mid(put(lot,id).rect);papaya(kit,x,z,{seed,h:2.7+seed%2*.3});}
 const sp=put(lot,'standpipe').rect;{const x=sp.minX+.2,z=(sp.minZ+sp.maxZ)/2;
  kit.block(x-.15,x+.15,0,.12,z-.15,z+.15,P.concrete);kit.cyl(.03,.03,.75,x,.48,z,0x8e979a,{segments:6,finish:'metal'});kit.rod([x,.82,z],[x+.12,.82,z],.022,0x8e979a);kit.box(.06,.05,.06,x+.12,.86,z,0xc8432f);
  const rx=sp.maxX-.4;for(const k of [-1,1])kit.cyl(.26,.26,.03,rx,.32,z+k*.2,0x3a6e4a,{rx:Math.PI/2,segments:14});kit.cyl(.17,.17,.36,rx,.32,z,0x4caa5a,{rx:Math.PI/2,segments:12});
  kit.rod([rx,.05,z-.25],[rx,.62,z-.25],.015,P.steel);kit.rod([rx,.05,z+.25],[rx,.62,z+.25],.015,P.steel);kit.rod([rx,.62,z-.25],[rx,.62,z+.25],.015,P.steel);
  kit.rod([x+.12,.84,z],[rx-.2,.4,z],.014,0x4caa5a);}
 steelShed(kit,put(lot,'garden-shed').rect,{face:'south'});
 // The gōyā curtain: a net on posts along its bed, the vines over it and the gourds hanging through.
 const gc=put(lot,'goya-curtain').rect,cz=(gc.minZ+gc.maxZ)/2;bed(kit,gc,{seed:5});
 for(let x=gc.minX+.2;x<=gc.maxX-.19;x+=(gc.maxX-gc.minX-.4)/4)kit.cyl(.04,.05,2.05,x,1.03,cz,0x6e5a44,{segments:6});
 kit.box(gc.maxX-gc.minX-.3,1.65,.02,(gc.minX+gc.maxX)/2,1.15,cz,0x3f6b3a,{finish:'thin'});
 goyaVines(kit,{...gc,minX:gc.minX+.1,maxX:gc.maxX-.1},.5,1.95,{seed:6});
 hedge(kit,put(lot,'parking-hedge').rect,{h:1,seed:7});
 // The parking: crushed coral, the lines, the wheel stops, the cars and the sign.
 const pad=D.flat.find(f=>f.id==='parking-gravel').rect;lotGround(kit,pad,P.gravel);
 const lines=[30.8,33.4,36.0,38.6,41.2],bays=[32.1,34.7,37.3,39.9],stopZ=66.75;
 for(const x of lines)kit.block(x-.05,x+.05,PAD_TOP,PAINT,62.5,67.1,P.paint);
 for(const x of bays)for(const k of [-1,1])kit.block(x+k*.55-.27,x+k*.55+.27,PAD_TOP,PAD_TOP+.12,stopZ-.07,stopZ+.07,P.stop);
 const car=(id,spec)=>{const r=put(lot,id).rect,[x]=mid(r);kit.at(x,66.65-spec.length/2,Math.PI,()=>vehicle(kit,spec),PAD_TOP);};
 car('bay-1-truck',{kind:'kei truck',colour:0xf2f0ea,length:3.4,width:1.48,bed:(k,{floor,z0,z1,half})=>{
  // An ice chest and a coil of rope in the bed.
  k.box(.75,.42,.5,-half+.5,floor+.21,z0+.45,0x2f6fb8);k.box(.77,.05,.52,-half+.5,floor+.44,z0+.45,0xe9e6dc);
  k.cyl(.25,.25,.1,half-.4,floor+.05,z1-.4,0xd8c48a,{segments:12});k.cyl(.12,.12,.11,half-.4,floor+.05,z1-.4,0x8a7a5a,{segments:10});}});
 car('bay-2-car',{kind:'kei car',colour:0xb8d0d8,length:3.3,width:1.4});
 car('bay-3-hatchback',{kind:'hatchback',colour:0xd8a83a,length:3.7,width:1.55,bonnetUp:true});
 // Mac's toolbox on the gravel by his front wheel, inside the bay.
 kit.box(.42,.2,.2,38.3,PAD_TOP+.1,62.95,0xc8432f,{finish:'metal'});kit.box(.3,.03,.03,38.3,PAD_TOP+.23,62.95,P.black);
 put(lot,'bay-4-stops');
 const sign=put(lot,'parking-sign').rect;
 postSign(kit,poster({title:'Monthly parking',lines:['空き 1台','契約車以外駐車禁止','北浜自治会'],bg:'#f4f1e6',band:'#2f5f9a'}),{x:(sign.minX+sign.maxX)/2,z:sign.minZ+.05,ry:Math.PI,w:1.2,h:.8,y:1.45,name:D.signs[0].name});
 read(24.0,61.8,'Look at the lane garden','The lane garden',
  'Four beds of red earth and a gōyā curtain, on the ground where 4 Kitahama stood. Thao’s herbs by the lane: lemongrass, rau răm and purple perilla, which nobody on the island sells. Mrs Sato’s spring onions next to them, for her own kitchen. Nhung’s handama behind, and Riku’s sunflowers, measured every Sunday against the shed. The standpipe is turned on at six.');
 read(36.0,63.2,'Read the monthly parking sign','Kitahama monthly parking',
  'Monthly parking. One bay free. Contract holders only. Kitahama residents’ association.\n\nBay 1 is Kōji’s white kei truck, for the outboard and the ice chests. Bay 2 is Dr Ken’s little car, for house calls at the far end of the island. Bay 3 is Mac’s old yellow hatchback. Bay 4 is free: ask the association.','read');
 read(37.3,62.2,'Look under Mac’s bonnet','Mac’s hatchback',
  'An old yellow hatchback with its bonnet up on the stay and a red toolbox by the wheel. Mac keeps it running for the pleasure of it, and it is opened more often than it is driven. There is a new air cleaner in it, and the old one is on the wing.');
}

/* ------------------------- Kitahama: 9, 7 and 6 ------------------------- */

function lot9({kit,read},lot,put){
 const shed=put(lot,'bicycle-shed').rect,{minX,maxX,minZ,maxZ}=shed;
 // A tin roof falling to the back, on six posts, a corrugated back panel; open to the footpath.
 for(const x of [minX+.08,maxX-.08])for(const z of [minZ+.08,(minZ+maxZ)/2,maxZ-.08])kit.box(.08,x<minX+1?2.2:2.0,.08,x,(x<minX+1?2.2:2.0)/2,z,P.galv,{finish:'metal'});
 kit.box(maxX-minX+.3,.04,maxZ-minZ+.3,(minX+maxX)/2,2.12,(minZ+maxZ)/2,P.shedRoof,{rz:-.09,finish:'metal'});
 for(let z=minZ+.15;z<maxZ;z+=.3)kit.box(.03,1.2,.06,maxX-.06,1.2,z,0x7b8c91,{finish:'metal'});
 kit.block(maxX-.07,maxX-.04,.6,1.8,minZ+.05,maxZ-.05,P.shedRoof,'metal');
 const bikes=[0xd9d2c0,0x2b2d30,0xc8432f,0x3d6f8f,0x7fb0a8];
 bikes.forEach((colour,i)=>bicycle(kit,(minX+maxX)/2,minZ+.8+i*1.05,{ry:0,colour}));
 // The hoop: its pad, the key painted on it, the post, the backboard, the rim and the net; the ball at the foot.
 const pad=lot.dressing.flat[0].rect;lotGround(kit,pad,P.concrete);
 const hp=put(lot,'hoop').rect,[px,pz]=mid(hp),board=pz+.6,rim=board+.3;
 const line=(x0,x1,z0,z1)=>kit.block(x0,x1,PAD_TOP,PAINT,z0,z1,P.paint);
 line(px-.92,px+.92,board-.05,board+.05);line(px-.92,px-.86,board,board+3.6);line(px+.86,px+.92,board,board+3.6);line(px-.92,px+.92,board+3.55,board+3.6);
 kit.cyl(.06,.07,3.3,px,1.65,pz,0x2d4f7a,{segments:8,finish:'metal'});
 kit.rod([px,3.0,pz],[px,3.15,board-.02],.04,0x2d4f7a);
 kit.box(1.2,.9,.04,px,3.25,board,0xf4f1ea);kit.box(.46,.34,.045,px,3.1,board,0xc8432f);kit.box(.4,.28,.05,px,3.1,board,0xf4f1ea);
 const ring=new THREE.TorusGeometry(.23,.012,5,18);kit.add(ring,new THREE.Matrix4().compose(new THREE.Vector3(px,3.05,rim),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),new THREE.Vector3(1,1,1)),0xd8742a,'metal');ring.dispose();
 kit.cyl(.22,.14,.36,px,2.86,rim,0xf4f1ea,{segments:10,finish:'thin'});
 kit.sphere(.12,px+.2,.12,pz,P.orange,{detail:1});
 read(6.4,52.2,'Look at the bicycle shed','The footpath bicycle shed',
  'Five bicycles under a tin roof by the footpath: Thao’s, Chin’s and Vy’s from 1 Kitahama, whose yard is all hinpun and herb pots; Riku’s blue one; and Mrs Sato’s with the big basket, which she cannot lift over her gate step. They go out at a quarter to eight.');
 read(px,pz+1.2,'Shoot a basket','The hoop',
  'A hoop on a blue post and a concrete pad with the key painted on it, between Vy’s house and Riku’s. The rule is first to ten, and the loser fetches the ball out of the garden across the lane. Mac showed them a hook shot; neither of them can do it yet.');
}

function lot7({kit,read},lot,put){
 const ground=lot.dressing.flat[0].rect;lotGround(kit,ground,P.gravel);
 const store=put(lot,'association-store').rect;
 steelShed(kit,store,{face:'south',h:2.1,door:0x7a5a3a,units:2});
 // The sign screwed to the doors' head, facing the ground.
 kit.sign(poster({title:'Kitahama youth association',lines:['青年会 倉庫','エイサー用具'],bg:'#f4ecd6',band:'#8a3b2e'}),.9,.62,(store.minX+store.maxX)/2,1.55,store.minZ-.065,{ry:Math.PI,name:lot.dressing.signs[0].name});
 const b=put(lot,'watching-bench').rect,[bx,bz]=mid(b);
 kit.box(.42,.06,b.maxZ-b.minZ,bx,.44,bz,P.timber);kit.box(.06,.3,b.maxZ-b.minZ,b.maxX-.05,.72,bz,P.timber);
 for(const k of [-1,1])kit.box(.38,.42,.06,bx,.21,bz+k*(b.maxZ-b.minZ)/2.6,P.steel);
 read(-15,47.9,'Look at the eisa practice ground','The eisa ground',
  'A square of swept coral with the youth association’s store at the back. In the weeks before Obon the drummers practise here from seven, and you can hear the big drum from the harbour. Gran Higa comes up to supervise, loudly, and sits on the bench.');
 read((store.minX+store.maxX)/2,store.minZ-1.2,'Read the store sign','The association’s store',
  'Kitahama residents’ association. Youth association store. Eisa things.\n\nInside: the drums, the festival tent that never goes up first time, and the cane knives, which come out in January.','read');
}

function lot6({kit,read},lot,put){
 for(const [id,seed] of [['hedge-south-west',61],['hedge-south-east',62],['hedge-east',63]])hedge(kit,put(lot,id).rect,{h:1.0,seed});
 const t=put(lot,'picnic-table').rect,[tx,tz]=mid(t);
 kit.box(1.8,.05,.7,tx,.72,tz,P.timber);
 for(const k of [-1,1]){kit.box(1.8,.04,.28,tx,.43,tz+k*.85,P.timber);for(const e of [-.7,.7])kit.rod([tx+e,0,tz+k*.95],[tx+e,.72,tz+k*.1],.03,P.timberDark);}
 const gr=put(lot,'kettle-grill').rect,[gx,gz]=mid(gr);
 kit.sphere(.3,gx,.72,gz,P.black,{sy:.55,detail:1,finish:'gloss'});kit.sphere(.29,gx,.78,gz,0x2c2e30,{sy:.45,detail:1,finish:'gloss'});
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2;kit.rod([gx+Math.cos(a)*.2,.6,gz+Math.sin(a)*.2],[gx+Math.cos(a)*.3,0,gz+Math.sin(a)*.3],.015,0x8e979a);}
 kit.cyl(.03,.03,.04,gx,.94,gz,0x9aa0a4,{segments:6});
 const tb=put(lot,'tomato-bed').rect,y=bed(kit,tb,{seed:64}),r=rng(65);
 rows(tb,{rows:2,step:.55,inset:.3},(x,z,i)=>{kit.rod([x,y,z],[x,y+1.1,z],.012,0x8a7a4a);kit.sphere(.18,x,y+.6+r.next()*.3,z,P.leaf,{sy:1.6,detail:0});
  if(i%2)kit.sphere(.05,x+.1,y+.5,z+.08,0xd9412b,{detail:0});else kit.sphere(.035,x-.08,y+.35,z+.1,0xc8302a,{sy:2,detail:0});});
 read(-28,47.95,'Look at Mac’s barbecue','Mac’s garden',
  'A hibiscus hedge with a gap facing the Heights, a picnic table for six at a squeeze, a kettle grill and a bed of tomatoes and island chillies. Mac grills on Sunday on his week ashore, and whoever smells it comes. Mika waters the tomatoes when he is aboard.');
}

/* ----------------------------- Kitahama: the cane ----------------------------- */

function cane({kit,read},lot,put){
 const p=lot.dressing.props.find(q=>q.id.startsWith('cane-'));put(lot,p.id);
 const r=p.rect,g=rng(700+Math.round(r.minX));
 // Red earth in ridges, a little wider than the cane; the stalks in clumps along each ridge, the leaves arching out.
 lotGround(kit,{minX:r.minX-.15,maxX:r.maxX+.15,minZ:r.minZ-.15,maxZ:r.maxZ+.15},P.earthDry);
 for(let z=r.minZ+.4;z<r.maxZ-.2;z+=.95){
  kit.block(r.minX+.1,r.maxX-.1,PAD_TOP,PAD_TOP+.025,z-.3,z+.3,0x93593b);
  for(let x=r.minX+.25;x<r.maxX-.2;x+=.4+g.next()*.1){
   const h=2.2+g.next()*.45,lean=(g.next()-.5)*.2;
   for(let k=0;k<3;k++)kit.rod([x+(k-1)*.07,PAD_TOP,z+(k===1?.06:-.04)],[x+lean+(k-1)*.07,h-(k===2?.3:0),z+lean*.5],.022,k===1?P.cane:P.caneDark,{segments:3});
   // The leaves: long blades from the top down most of the stalk, the upper ones up, the lower arching over.
   for(let k=0;k<6;k++){const a=k*2.4+g.next(),y=h-.1-k*.28,out=.3+k*.05;
    kit.box(.08,.012,1.0,x+lean*(y/h)+Math.sin(a)*out,y,z+lean*.5*(y/h)+Math.cos(a)*out,g.pick([P.caneLeaf,0x7aa652,0x5f8a3e,0x8bb35e]),{ry:a,rx:-.7+k*.24,finish:'thin'});}
  }
 }
 if(lot.id==='kitahama-11-lot')read((r.minX+r.maxX)/2,61.85,'Look at the cane','The association’s cane',
  'Sugar cane higher than a man on the three lots west of the footpath, the residents’ association’s. The notice board says when it is cut: Monday the 12th of January from seven, everybody on the lane, lunch at Sato Ramen. What it fetches pays for the eisa. Somebody saw a habu in it, or says they did.');
 const sign=lot.dressing.props.find(q=>q.id==='habu-sign');
 if(sign){put(lot,'habu-sign');const [x,z]=mid(sign.rect);
  kit.box(.06,1.2,.06,x,.6,z,0x6e5a44);
  kit.sign(poster({title:'Beware of habu',lines:['畑に入らないで','ください'],bg:'#f6e94a',ink:'#1b1b1b',band:'#1b1b1b'}),.42,.5,x,1.15,z-.05,{ry:Math.PI,name:lot.dressing.signs[0].name});
  read(x,61.75,'Read the habu sign','Habu sign','Beware of habu. Please keep out of the field.\n\nUnderneath, in a child’s writing: “it was a stick”.','read');}
}

/** The retained plots' planting over their walls (lots.js PLOT_PLANTING). */
function plotPlanting({kit}){
 for(const pl of PLOT_PLANTING){
  const p=KITAHAMA.plots.find(q=>q.id===pl.plot),z=pl.wall==='north'?p.maxZ:p.minZ,top=1.35,g=rng(801);
  for(const x of pl.at){
   kit.sphere(.3,x,top+.12,z,0x3f6b3a,{sx:1.5,sy:.55,sz:.5,detail:0});
   for(let k=0;k<6;k++)kit.sphere(.05+g.next()*.03,x+(g.next()-.5)*.8,top+.08+g.next()*.2,z+(g.next()-.5)*.14,k%3?C.bougainvillea:0xe0559a,{detail:0});
  }
 }
}

/* ------------------------------ Nishi-machi ------------------------------ */

function kinjo({kit,solid,read},lot,put){
 const P0=lot.dressing.props,wall=id=>P0.find(p=>p.id===id).rect;
 // The low coral wall round it, the gate in the south side facing the Higa gate across the lane. The walls' colliders
 // are the data's (the coral wall's own are its runs; the data's rectangles cover them).
 const w=wall('wall-west'),n=wall('wall-north'),e=wall('wall-east'),sw=wall('wall-south-west'),se=wall('wall-south-east');
 const x0=(w.minX+w.maxX)/2,x1=(e.minX+e.maxX)/2,z0=(sw.minZ+sw.maxZ)/2,z1=(n.minZ+n.maxZ)/2;
 coralWall(kit,x0,z0,x0,z1,{height:.9,seed:901,flowers:false});
 coralWall(kit,x0,z1,x1,z1,{height:.9,seed:902,flowers:true});
 coralWall(kit,x1,z0,x1,z1,{height:.9,seed:903});
 coralWall(kit,x0,z0,x1,z0,{height:.9,gaps:[[sw.maxX-.3,se.minX+.3]],seed:904});   // the end stones stand .275 into the gap
 for(const id of ['wall-west','wall-north','wall-east','wall-south-west','wall-south-east'])put(lot,id);
 const g=rng(905);
 const gf=put(lot,'goya-frame').rect;{const y=bed(kit,{minX:gf.minX+.1,maxX:gf.maxX-.1,minZ:gf.minZ+.05,maxZ:gf.maxZ-.05},{seed:906}),cx=(gf.minX+gf.maxX)/2;
  for(const z of [gf.minZ+.15,(gf.minZ+gf.maxZ)/2,gf.maxZ-.15]){kit.rod([gf.minX+.15,0,z],[cx,1.9,z],.03,0x8a7a5a);kit.rod([gf.maxX-.15,0,z],[cx,1.9,z],.03,0x8a7a5a);}
  kit.rod([cx,1.9,gf.minZ+.1],[cx,1.9,gf.maxZ-.1],.03,0x8a7a5a);
  for(const s of [-1,1]){
   // Strings along each slope for the vines to climb, and the vines thick on them.
   for(const t of [.25,.5,.75])kit.rod([cx+s*(.95-t*.9),y+t*(1.9-y),gf.minZ+.15],[cx+s*(.95-t*.9),y+t*(1.9-y),gf.maxZ-.15],.008,0xd8d0b0,{segments:3});
   for(let z=gf.minZ+.3;z<gf.maxZ-.25;z+=.24){const t=.12+g.next()*.8;kit.sphere(.2+g.next()*.08,cx+s*(.95-t*.9)+s*.06,y+t*(1.9-y),z,g.pick([0x4f8a3e,0x3f7a36,0x5c9446]),{sy:.6,detail:0});
    if(g.next()>.55)kit.sphere(.06,cx+s*(.95-t*.9)+s*.14,y+t*(1.9-y)-.22,z,P.goya,{sy:2.6,detail:1});}}}
 const hb=put(lot,'handama-bed').rect;{const y=bed(kit,hb,{seed:907});rows(hb,{rows:2,step:.42,inset:.25},(x,z,i)=>kit.sphere(.16,x,y+.1,z,i%2?0x6a3a62:0x4f7a3e,{sy:.6,detail:0}));}
 const cb=put(lot,'chrysanthemum-bed').rect;{const y=bed(kit,cb,{seed:908});rows(cb,{rows:2,step:.3,inset:.2},(x,z,i)=>{kit.sphere(.12,x,y+.18,z,P.leaf,{sy:1.3,detail:0});kit.sphere(.07,x,y+.33,z,i%3===0?0xe8d84a:i%3===1?0xf2efe6:0xd8a02a,{sy:.6,detail:0});});}
 const gb=put(lot,'greens-bed').rect;{const y=bed(kit,gb,{seed:909});rows(gb,{rows:2,step:.45,inset:.25},(x,z,i)=>{kit.sphere(.14,x,y+.12,z,i%4?0x5b8a45:0x3f6b3a,{sy:.8,detail:0});if(i%4===0)kit.sphere(.03,x+.08,y+.2,z,0xd9302b,{sy:2,detail:0});});}
 const jar=put(lot,'water-jar').rect;{const [x,z]=mid(jar);kit.sphere(.36,x,.38,z,0x8a5a3a,{sy:1.05,detail:1});kit.cyl(.25,.28,.08,x,.76,z,0x7a4a2e,{segments:12});kit.cyl(.29,.29,.04,x,.81,z,0x6e5a44,{segments:12});
  kit.rod([x+.1,.84,z],[x+.38,.95,z+.05],.012,0x8a6a45);kit.sphere(.06,x+.06,.85,z,0x8a6a45,{sy:.5,detail:0});}
 {const [x,z]=mid(put(lot,'papaya').rect);papaya(kit,x,z,{seed:910,h:2.9});}
 {const st=put(lot,'stool').rect,[x,z]=mid(st);kit.box(.36,.04,.3,x,.32,z,P.timber);for(const k of [-1,1])kit.box(.04,.3,.26,x+k*.14,.15,z,P.timber);}
 read((sw.maxX+se.minX)/2,-11.9,'Look over Gran Higa’s garden wall','Gran Higa’s garden',
  'Over a low coral wall across the lane from the Higa house: gōyā on an A-frame against the west wall, handama purple under green, island greens and chillies, a papaya in the corner and a big water jar with a ladle on the lid. The chrysanthemums along the north wall were Mrs Kinjō’s; Gran Higa keeps them for the family altar. She is out here from six until the bath opens.');
 void solid;
}

function oshiro({kit,read},lot,put){
 const g=rng(921);
 for(const id of ['net-rail-west','net-rail-east']){
  const r=put(lot,id).rect,x=(r.minX+r.maxX)/2,z0=r.minZ+.1,z1=r.maxZ-.1,posts=5,step=(z1-z0)/(posts-1);
  for(let i=0;i<posts;i++){const z=z0+i*step;kit.cyl(.05,.06,2.0,x,1.0,z,0x8a7a5a,{segments:6});}
  kit.rod([x,1.92,z0],[x,1.92,z1],.03,0x8a7a5a);
  for(let i=0;i<posts-1;i++){
   // A span of net folded over the rail and hanging down both sides in folds, each fold its own length, the cork
   // line of floats along the foot.
   const a=z0+i*step+.06,b=z0+(i+1)*step-.06,folds=5,fw=(b-a)/folds,tint=g.pick([0x3f7a62,0x4a8a70,0x3a6a55,0x3a6a8a]);
   for(let f=0;f<folds;f++)for(const side of [-1,1]){
    const drop=1.0+g.next()*.55,zc=a+(f+.5)*fw,lean=.05+drop*.07;
    kit.box(.02,drop,fw*.92,x+side*lean,1.9-drop/2,zc,f%2?tint:0x4f8f74,{rz:side*.07,finish:'thin'});
    if((f+(side>0?1:0))%2===0)kit.sphere(.045,x+side*(lean+drop*.07),1.92-drop,zc,(f+i)%3?0xe8742a:0xeeeeea,{sy:.8,detail:0});
   }
  }
 }
 const heap=put(lot,'net-heap').rect;netPile(kit,heap.minX+.7,heap.minZ+.6,{size:.75});
 {const x=heap.maxX-.35,z=heap.maxZ-.4;kit.box(.32,.04,.28,x,.3,z,P.timber);for(const k of [-1,1])kit.box(.04,.28,.24,x+k*.12,.14,z,P.timber);}
 const fb=put(lot,'fish-boxes').rect;for(let k=0;k<3;k++)kit.box(.62,.26,.42,(fb.minX+fb.maxX)/2,.13+k*.27,(fb.minZ+fb.maxZ)/2,k%2?0x2f6fb8:0x3a7cc2,{ry:Math.PI/2});
 buoys(kit,heap.minX+1.2,.05,heap.minZ+1.2,{count:3,seed:922});
 read(-35.3,8.6,'Look at Kōji’s nets drying','Kōji’s net ground',
  'Two rails of green net on the seawall walk, drying in the sea wind with their floats along the foot, a heap waiting to be mended and the mending stool beside it. Mr Ōshiro dried his nets here; Kōji took on his fishing, and Chin stops to help with the mending on his way to the workshop.');
}

/* --------------------------- The Front-Row yard --------------------------- */

function yard1({kit,read},lot,put){
 steelShed(kit,put(lot,'store-shed').rect,{face:'north',h:1.9});
 // A ladder on the shed's side, inside its footprint's shadow, and the cable drum table with its two crates.
 const d=put(lot,'cable-drum').rect,[dx,dz]=mid(d);
 kit.cyl(.48,.48,.05,dx,.03,dz,0x8a6a45,{segments:14});kit.cyl(.2,.2,.5,dx,.3,dz,0x6e5a44,{segments:10});kit.cyl(.48,.48,.05,dx,.57,dz,0x8a6a45,{segments:14});
 for(const id of ['crate-east','crate-west']){const [x,z]=mid(put(lot,id).rect);kit.box(.38,.32,.36,x,.16,z,0x9a7a4c);kit.box(.3,.02,.28,x,.33,z,0x7a5e3a);}
 read(dx,-.15,'Look at Tetsu’s store','Tetsu’s store',
  'A steel shed for the ladders, the cable drums and the spare lamps for the lane lights, where 1 Front-Row Yard stood. An empty cable drum from the workshop makes the table, with two crates for chairs. On summer evenings Tetsu and Chin sit here after dark and argue about fuses.');
}

/* ------------------------------ Main Street ------------------------------ */

function postOffice({kit,solid,anchor,onAction,vending},lot,put){
 const pad=lot.dressing.flat[0].rect,A=GROUND_LAYER.apron;
 kit.block(pad.minX,pad.maxX,A-.05,A,pad.minZ,pad.maxZ,P.concrete);
 for(const id of ['machine-1','machine-2']){const p=propOf(lot,id);if(vending)vending(p.at[0],p.at[1],-Math.PI/2,A);else solid({id:'vending',x:p.at[0]-.08,z:p.at[1],w:.9,d:1.09,height:2.2});}
 const bin=put(lot,'can-bin').rect,[bx,bz]=mid(bin);
 kit.box(.46,.84,.46,bx,A+.42,bz,0x2f6fb8);kit.box(.48,.06,.48,bx,A+.86,bz,0xf2f0ea);
 for(const k of [-1,1])kit.cyl(.07,.07,.02,bx-.24,A+.62,bz+k*.11,0x15181a,{rz:Math.PI/2,segments:10});
 const b=put(lot,'bench').rect,[x,z]=mid(b),len=b.maxZ-b.minZ;
 kit.box(.44,.08,len,x,A+.45,z,0x3a6e8f);for(const k of [-1,1])kit.box(.36,.42,.06,x,A+.21,z+k*(len/2-.12),P.steel);
 const seat=anchor?.(x-.65,1,z,'Sit at the drinks corner',()=>onAction?.('seat','The drinks corner','A bench beside the drinks machines, the park’s lawn behind you and Main Street in front. The machines hum. Somebody coming down from the bath stops for a coffee milk and drinks it standing, the way you are supposed to.'));
 if(seat)seat.userData.seat={id:'drinks-corner-bench',position:[x,A,z],stand:[x-.8,A,z],surfaceY:A+.49,eyeY:A+1.12,yaw:-Math.PI/2,pitch:-.03};
}
