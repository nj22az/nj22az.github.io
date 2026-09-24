import * as THREE from '../../../vendor/three.module.js';
import {rng} from './kit.js';

/**
 * Street furniture, after Sakura Crossing's props.js (Kenton-GMI, MIT; see
 * LICENSE-SAKURA-CROSSING.txt): the utility pole with its crossarms, insulators and
 * transformer cans, the sagging cables strung between them, and the kei truck, rebuilt
 * for the kit so that a whole street of them is a few draw calls. The rest -- bicycles,
 * laundry, gas bottles, fish crates, buoys, a sabani -- are the things an Okinawan
 * harbour street is cluttered with.
 */

/**
 * A concrete utility pole (Sakura Crossing's makePole). `face` is the direction its
 * transformer hangs toward, in radians about y. Returns where its cables attach.
 */
export function utilityPole(kit,x,z,{h=8.6,face=0,transformer=true,lamp=false,seed=1}={}){
 const r=rng(seed),arms=[h-.5,h-1.4],anchors=[];
 kit.at(x,z,face,()=>{
  kit.cyl(.1,.17,h,0,h/2,0,0xcfcbc4,{segments:8});
  kit.cyl(.22,.25,.2,0,.1,0,0xb7b2a8,{segments:8});
  arms.forEach((y,ai)=>{
   const len=ai?1.6:2;
   kit.box(len,.09,.1,0,y,0,0x2d2b30);
   kit.box(.06,.46,.06,0,y-.28,0,0x8e979a,{rx:0,rz:0});
   for(const i of [-1,0,1]){
    if(ai&&i===0)continue;
    kit.cyl(.055,.07,.15,i*len/2.4,y+.12,0,0xf2f0ea,{segments:7});
    anchors.push(kit.point(i*len/2.4,y+.1,0));
   }
  });
  if(transformer){
   const ty=h-2.8;
   kit.box(.14,.5,1.4,0,ty+.6,.34,0x8e979a);
   for(const dx of [-.4,.4]){kit.cyl(.23,.23,.7,dx,ty+.22,.36,0x9aa3a6,{segments:10,finish:'metal'});kit.cyl(.25,.25,.05,dx,ty+.59,.36,0x7d8588,{segments:10});}
  }
  // The cable bundle up the street side, and the yellow-and-black guard at the foot.
  kit.cyl(.04,.04,h-1.4,.12,(h-1.4)/2,.05,0x2d2b30,{segments:5});
  kit.cyl(.18,.18,1.6,0,.8,0,0xe0b93a,{segments:8});
  for(let y=.2;y<1.6;y+=.4)kit.cyl(.185,.185,.18,0,y,0,0x2b2b2b,{segments:8});
  // A numbered plate, as every pole has.
  kit.box(.2,.32,.03,0,2.4,.13,0xe8e3d4);
  if(lamp){
   kit.rod([0,h-3.6,0],[0,h-3.9,1.3],.04,0x8e979a);
   kit.box(.36,.12,.5,0,h-3.95,1.35,0x8e979a);
   kit.box(.3,.03,.42,0,h-4.02,1.35,0xfff0c8,{finish:'lamp'});
  }
 });
 return {anchors,top:h,collider:{id:'utility-pole',x,z,w:.4,d:.4,height:h},seed:r.next()};
}

/** Cables from each anchor of one pole to the matching anchor of the next. */
export function wiresBetween(kit,a,b,{sag=.45}={}){
 const n=Math.min(a.anchors.length,b.anchors.length);
 for(let i=0;i<n;i++)kit.wire(a.anchors[i].toArray(),b.anchors[i].toArray(),sag,.018,0x2b2a30);
}

/** A cable from a pole down to the eave of a house: the service drop. */
export function serviceDrop(kit,pole,to){kit.wire(pole.anchors[pole.anchors.length-1].toArray(),to,.25,.014,0x2b2a30);}

/**
 * A kei truck (Sakura Crossing's makeKeiTruck): cab-over, drop-sided bed, the sort
 * every farm and fish shop on the island runs. Front along local +x.
 */
export function keiTruck(kit,x,z,{ry=0,colour=0xeae8e0,load='crates'}={}){
 const L=3.3,W=1.46,deep=new THREE.Color(colour).multiplyScalar(.8).getHex();
 kit.at(x,z,ry,()=>{
  kit.box(L,.32,W,0,.66,0,deep);
  kit.box(1.26,1.06,W,L/2-.68,1.36,0,colour);
  kit.box(.06,.6,W-.16,L/2-.06,1.6,0,0x2e3c44,{finish:'gloss'});
  for(const s of [-1,1])kit.box(1,.54,.06,L/2-.7,1.58,s*(W/2-.02),0x2e3c44,{finish:'gloss'});
  kit.box(1.3,.1,W+.06,L/2-.68,1.9,0,deep);
  kit.box(1.86,.06,W,-.62,.86,0,0xbba98c);
  for(const s of [-1,1])kit.box(1.86,.4,.06,-.62,1.05,s*(W/2-.03),colour);
  kit.box(.06,.4,W,-1.55,1.05,0,colour);
  if(load==='crates')for(let i=0;i<4;i++)kit.box(.5,.28,.38,-.3-(i%2)*.6,1.03+Math.floor(i/2)*.28,i%2?.25:-.25,i%3?0x2f6fb8:0x3f86c8);
  else if(load==='sheet'){kit.box(1.5,.4,W-.18,-.62,1.1,0,0x8fa2b4);kit.box(1.62,.07,W-.06,-.62,.93,0,0x7e8fa0);}
  for(const wx of [L/2-.72,-L/2+.6])for(const s of [-1,1]){
   kit.cyl(.29,.29,.2,wx,.29,s*(W/2-.06),0x1f2124,{rx:Math.PI/2,segments:12});
   kit.cyl(.13,.13,.22,wx,.29,s*(W/2-.02),0xe6e4e0,{rx:Math.PI/2,segments:8});
  }
  for(const s of [-1,1]){
   kit.box(.06,.16,.26,L/2+.01,.98,s*.48,0xfff4d8,{finish:'lamp'});
   kit.box(.06,.13,.2,-L/2-.01,.98,s*.48,0xe05a4a);
   kit.box(.05,.16,.1,L/2-.5,1.9,s*(W/2+.15),0x2d2b30);
  }
  kit.box(.06,.18,.34,L/2+.02,.7,0,0xf4f1e6);
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-L/2-.05,L/2+.05,-W/2-.05,W/2+.05,2,'kei-truck');});
 return solid;
}

/** A parked bicycle, leant on its stand. Front along local +x. */
export function bicycle(kit,x,z,{ry=0,colour=0x3d6f8f}={}){
 kit.at(x,z,ry,()=>{
  for(const wx of [-.52,.52]){
   const g=new THREE.TorusGeometry(.33,.025,5,16);
   kit.add(g,new THREE.Matrix4().makeTranslation(wx,.35,0),0x222326,'matte');g.dispose();
  }
  kit.rod([-.52,.35,0],[-.05,.35,0],.022,colour);
  kit.rod([-.05,.35,0],[-.18,.85,0],.022,colour);
  kit.rod([-.52,.35,0],[-.2,.82,0],.02,colour);
  kit.rod([-.2,.82,0],[.4,.85,0],.022,colour);
  kit.rod([.52,.35,0],[.38,1,0],.022,colour);
  kit.rod([.38,1,-.28],[.38,1,.28],.018,0x9aa0a4);
  kit.box(.24,.06,.12,-.2,.9,0,0x2a2a2a);
  kit.box(.32,.2,.26,.62,.92,0,0x9aa0a4,{finish:'metal'});
  kit.rod([-.3,.35,.02],[-.42,0,.18],.015,0x9aa0a4);
 });
}

/** A laundry pole on two stands, with the day's washing on it. */
export function laundry(kit,x,z,{ry=0,seed=10,length=2.6}={}){
 const r=rng(seed),cloth=[0xf4f1ea,0x7fb0d8,0xe8a0a8,0xf1d27a,0x9fc79a,0xffffff];
 kit.at(x,z,ry,()=>{
  for(const s of [-1,1]){kit.rod([s*length/2,0,-.35],[s*length/2,1.7,0],.025,0x9aa0a4);kit.rod([s*length/2,0,.35],[s*length/2,1.7,0],.025,0x9aa0a4);}
  kit.rod([-length/2-.2,1.7,0],[length/2+.2,1.7,0],.02,0xd0d4d6);
  for(let i=0;i<Math.floor(length/.45);i++){
   const x0=-length/2+.25+i*.45,h=.45+r.next()*.4;
   kit.box(.38,h,.015,x0,1.68-h/2,0,r.pick(cloth),{finish:'thin'});
  }
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-length/2-.2,length/2+.2,-.4,.4,1.8,'laundry');});
 return solid;
}

/** Two propane bottles against a wall, with their regulator hose. */
export function gasBottles(kit,x,z,{ry=0}={}){
 kit.at(x,z,ry,()=>{
  for(const dx of [-.22,.22]){
   kit.cyl(.17,.17,1.05,dx,.53,0,0x9aa2a6,{segments:10,finish:'metal'});
   kit.sphere(.17,dx,1.06,0,0x9aa2a6,{sy:.5,finish:'metal'});
   kit.cyl(.05,.05,.12,dx,1.2,0,0x3c4448,{segments:6});
  }
  kit.rod([-.22,1.24,0],[0,1.5,-.12],.012,0x2b2b2b);kit.rod([.22,1.24,0],[0,1.5,-.12],.012,0x2b2b2b);
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-.42,.42,-.2,.2,1.3,'gas-bottles');});
 return solid;
}

/** The blue plastic fish crates a harbour street has everywhere, stacked. */
export function fishCrates(kit,x,z,{ry=0,rows=2,cols=2,height=3,seed=11}={}){
 const r=rng(seed);
 kit.at(x,z,ry,()=>{
  for(let c=0;c<cols;c++)for(let q=0;q<rows;q++){
   const n=1+Math.floor(r.next()*height);
   for(let k=0;k<n;k++)kit.box(.62,.26,.42,c*.66,.13+k*.27,q*.46,k%2?0x2f6fb8:0x3a7cc2);
  }
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-.35,cols*.66-.3,-.25,rows*.46-.2,1,'fish-crates');});
 return solid;
}

/** Glass and plastic fishing floats in a net, hung or heaped. */
export function buoys(kit,x,y,z,{seed=12,count=7}={}){
 const r=rng(seed);
 for(let i=0;i<count;i++)kit.sphere(.16+r.next()*.08,x+(r.next()-.5)*.7,y+(r.next())*.35,z+(r.next()-.5)*.5,r.pick([0xe8742a,0xf0a030,0x5aa0a8,0xeeeeea]),{finish:'gloss'});
}

/** A heap of green nylon net. */
export function netPile(kit,x,z,{size=1}={}){
 kit.sphere(.8*size,x,.25*size,z,0x2f5a4a,{sx:1.4,sy:.45});
 kit.sphere(.55*size,x+.4*size,.45*size,z-.2,0x3a6a55,{sx:1.2,sy:.5});
 buoys(kit,x-.3,.3,z+.3,{count:4});
}

/** A sabani: the island's narrow fishing boat, up on blocks. Bow along local +x. */
export function sabani(kit,x,z,{ry=0,y=.5,colour=0x3c6f8a}={}){
 kit.at(x,z,ry,()=>{
  const shape=[[-2.6,.1],[2.4,.1],[3,.55],[2.8,.62],[-2.6,.55]];
  for(const s of [-1,1])kit.extrude(shape,.05,new THREE.Matrix4().makeTranslation(0,y,s*.38-(s>0?.05:0)),colour);
  kit.box(5.1,.06,.72,-.1,y+.1,0,0x8a6a4a);
  kit.box(5,.08,.08,-.1,y+.6,-.4,0xf2ede0);kit.box(5,.08,.08,-.1,y+.6,.4,0xf2ede0);
  for(const bx of [-1.4,.1,1.4])kit.box(.1,.08,.8,bx,y+.45,0,0x8a6a4a);
  for(const bx of [-1.6,1.4])kit.box(.5,y,.9,bx,y/2,0,0x7a756c);
  kit.box(.8,.15,.05,-.9,y+.3,.42,0xf0d27a);
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-2.9,3.1,-.45,.45,1.2,'sabani');});
 return solid;
}

/** Styrofoam fish boxes reused as planters, with greens and a tomato or two. */
export function planterBoxes(kit,x,z,{ry=0,count=3,seed=13}={}){
 const r=rng(seed);
 kit.at(x,z,ry,()=>{
  for(let i=0;i<count;i++){
   const px=i*.72;
   kit.box(.62,.3,.4,px,.15,0,0xf1efe8);
   kit.sphere(.26,px,.42,0,r.pick([0x5b8a45,0x6e9a4c,0x4d7a3e]),{sx:1.1,sy:.6});
   if(r.next()>.5)kit.sphere(.05,px+.1,.52,.08,0xd9412b,{detail:0});
  }
 });
 let solid;kit.at(x,z,ry,()=>{solid=kit.rect(-.35,count*.72-.35,-.22,.22,.5,'planters');});
 return solid;
}

/**
 * An inshore fishing boat, white with a coloured sheer stripe, a wheelhouse aft and a
 * mast with its lamps, lying in the water. Bow along local +x.
 */
export function fishingBoat(kit,x,z,{ry=0,y=-.55,colour=0x2f6fb8,length=8,name=''}={}){
 const L=length,B=2.3;
 kit.at(x,z,ry,()=>{
  const half=L/2,shape=[[-half,-.6],[half-1.2,-.6],[half+.3,.9],[half+.1,1.1],[-half,1.0]];
  for(const s of [-1,1])kit.extrude(shape,.08,new THREE.Matrix4().makeTranslation(0,y,s*B/2-(s>0?.08:0)),0xf1efe8);
  for(const s of [-1,1])kit.box(L-.9,.16,.1,-.35,y+.85,s*(B/2+.02),colour);
  kit.box(L-1.2,.1,B-.1,-.5,y+.6,0,0x8e8b82);
  kit.box(.12,1.6,B,-half+.06,y+.2,0,0xf1efe8);
  kit.box(.2,.3,B-.3,half-.9,y+.35,0,0xf1efe8,{rz:.9});
  // Wheelhouse, its windows, the mast and the lamps.
  kit.box(1.8,1.5,1.7,-half+1.8,y+1.35,0,0xf1efe8);
  kit.box(1.95,.1,1.85,-half+1.8,y+2.12,0,colour);
  kit.box(.06,.5,1.3,-half+2.72,y+1.55,0,0x2e3c44,{finish:'gloss'});
  for(const s of [-1,1])kit.box(1.2,.45,.05,-half+1.8,y+1.55,s*.86,0x2e3c44,{finish:'gloss'});
  kit.cyl(.05,.07,3.6,-half+2,y+3.9,0,0xd8d6cf,{segments:6});
  kit.rod([-half+2,y+4.6,0],[half-.4,y+.95,0],.012,0x3a3a3a);
  kit.rod([-half+2,y+4.6,0],[-half+.2,y+1,0],.012,0x3a3a3a);
  kit.box(.12,.12,.12,-half+2,y+5.1,0,0xfff0c8,{finish:'lamp'});
  // Fenders along the side it lies to, and a heap of gear on the deck.
  for(let i=0;i<4;i++)kit.cyl(.22,.22,.45,-half+1.5+i*1.6,y+.55,B/2+.18,0x222326,{segments:8});
  kit.box(1.2,.5,.9,.8,y+.9,0,0x2f6fb8);
  kit.sphere(.25,1.8,y+.9,.4,0xe8742a,{finish:'gloss'});
 });
}
