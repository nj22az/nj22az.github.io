import {rng} from './kit.js';

/**
 * The buildings and gardens of an Okinawan harbour town, made with the kit.
 *
 * Every maker works in the kit's current local frame: the building stands centred on
 * the origin with its front looking along +z, and the caller turns it to face the street
 * with kit.at(). Each returns the collider rectangles it wants, already in world space.
 *
 * What makes them read as Okinawa rather than Japan in general, from the reference
 * photographs of Taketomi, Tonaki and the older streets of Naha:
 *   - red tile roofs, low and hipped, with the joints and ridges pointed in white lime;
 *   - a shisa on the ridge, looking down the path to the gate;
 *   - pale coral stone walls round the plot and a hinpun screen inside the gate, so the
 *     house is never seen straight on from the street;
 *   - fukugi trees along the boundary as a windbreak, hibiscus by the gate;
 *   - and, beside them, the flat-roofed concrete house of the seventies with a black
 *     water tank on the roof and an outside stair up to it.
 */
export const OKINAWA_COLOURS=Object.freeze({
 roof:0xc4553a,roofDeep:0xa8452f,lime:0xf3eee2,plaster:0xece3cf,timber:0x5d4431,timberLight:0x8a6641,
 stone:0xd8cfb3,concrete:0xdcd7cb,tank:0x2b2d2f,steel:0x8e979a,glass:0x5d7a84,leaf:0x2f5d35,leafLight:0x3f7440,
 hibiscus:0xd9303b,bougainvillea:0xc4307c,terracotta:0xb8643c,
});
const C=OKINAWA_COLOURS;

/** A shisa: the lion-dog that guards the house, sitting on the ridge or a gatepost. */
export function shisa(kit,x,y,z,ry=0,scale=1){
 kit.at(x,z,ry,()=>{
  const s=scale,col=C.terracotta,deep=0x9a4f2e;
  kit.box(.34*s,.06*s,.4*s,0,y+.03*s,0,0xcfc5ae);                      // its little plinth
  kit.box(.26*s,.3*s,.28*s,0,y+.2*s,-.02*s,col,{rx:-.25});             // haunches and chest
  for(const side of [-1,1])kit.box(.06*s,.2*s,.07*s,side*.08*s,y+.14*s,.13*s,col); // forelegs
  kit.sphere(.15*s,0,y+.42*s,.08*s,col,{sy:.92,detail:2});            // head
  kit.sphere(.17*s,0,y+.43*s,.02*s,deep,{sz:.7,detail:2});             // the curled mane behind it
  for(const side of [-1,1])kit.sphere(.05*s,side*.1*s,y+.53*s,.06*s,deep,{detail:1}); // ears
  kit.box(.12*s,.06*s,.06*s,0,y+.42*s,.22*s,deep);                     // the broad nose
  kit.box(.16*s,.05*s,.06*s,0,y+.36*s,.21*s,0x6d3620);                 // the open mouth
  for(const side of [-1,1])kit.sphere(.035*s,side*.06*s,y+.47*s,.2*s,0x2b1e16); // eyes
  kit.sphere(.07*s,0,y+.3*s,-.17*s,deep,{sx:.8,sy:1.6});               // tail, flame-shaped
 });
}

/**
 * A red-tile house: raised floor, timber front of sliding doors behind a deep verandah
 * (the amahaji), plaster sides, and a hipped roof in pointed tile.
 */
export function redTileHouse(kit,{w=8.4,d=6.8,seed=1,wall=C.plaster}={}){
 const r=rng(seed),W=w/2,D=d/2,floor=.45,eaves=2.85,front=D-1.1;
 kit.block(-W,W,0,floor,-D,D,C.stone,'coral');                       // stone footing
 kit.block(-W+.05,W-.05,floor,eaves,-D+.05,front,wall);               // the house body
 // The verandah deck in front of the doors, and the posts that carry the eave.
 kit.block(-W,W,floor-.04,floor+.02,front,D,C.timberLight);   // clear of the footing's top
 for(let i=0;i<=4;i++){const x=-W+.12+i*(w-.24)/4;kit.box(.14,eaves-floor,.14,x,(floor+eaves)/2,D-.12,C.timber);}
 kit.box(w,.18,.16,0,eaves-.09,D-.12,C.timber);                        // the beam over them
 // The front: sliding doors, a timber rail at knee height and paper-and-glass above it.
 kit.block(-W+.05,W-.05,floor,floor+.55,front,front+.04,C.timberLight);
 kit.block(-W+.05,W-.05,floor+.55,eaves-.25,front+.005,front+.03,0xefe8d6);
 for(let i=0;i<=6;i++){const x=-W+.1+i*(w-.2)/6;kit.box(.07,eaves-floor-.25,.05,x,(floor+eaves-.25)/2,front+.04,C.timber);}
 kit.box(w-.1,.06,.05,0,floor+1.5,front+.04,C.timber);
 kit.box(w-.1,.22,.06,0,eaves-.14,front+.04,C.timber);
 // A small window high on each side, and the back.
 for(const side of [-1,1])kit.box(.05,.7,1.1,side*(W-.03),1.95,-D*.3,C.glass,{finish:'glow'});
 kit.box(1.4,.7,.05,W*.3,1.95,-D+.03,C.glass,{finish:'glow'});
 // The roof, and the white lime along its ridge and down its four hips.
 const roofH=1.55,over=.55,Wr=W+over,Dr=D+over,ridge=Math.max(Wr,Dr)*.35,long=Wr>=Dr;
 kit.hipRoof(w,d,roofH,0,eaves,0,C.roof,{overhang:over,ridgeFrac:.35,finish:'tile'});
 const top=long?[[-ridge,eaves+roofH+.03,0],[ridge,eaves+roofH+.03,0]]:[[0,eaves+roofH+.03,-ridge],[0,eaves+roofH+.03,ridge]];
 kit.rod(top[0],top[1],.085,C.lime,{segments:6});
 for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
  const end=long?top[cx<0?0:1]:top[cz<0?0:1];
  kit.rod([cx*Wr,eaves+.04,cz*Dr],end,.06,C.lime,{segments:5});
 }
 kit.box(w+over*2+.04,.07,.07,0,eaves+.02,D+over,C.lime);             // the eave line in front
 shisa(kit,0,eaves+roofH+.06,long?0:ridge*.6,0,1.1);
 // The water jar at the corner, and something drying on the verandah.
 kit.cyl(.26,.2,.55,W+.35,.28,-D+.6,0x6a4a36,{finish:'gloss',segments:10});
 kit.sphere(.27,W+.35,.5,-D+.6,0x6a4a36,{sy:.5,finish:'gloss'});
 if(r.next()>.4)kit.box(.5,.12,.35,-W*.5,floor+.06,D-.5,0x3a6e8f);
 return [kit.rect(-W-.1,W+.1,-D-.1,D-.05,eaves+roofH,'okinawa-house')];
}

/**
 * The concrete house of the seventies: two storeys, flat roof, an outside stair up the
 * side to the roof, a black water tank on it and flower-block screens on the balcony.
 */
export function concreteHouse(kit,{w=7.6,d=7,colour=C.concrete,seed=2}={}){
 const r=rng(seed),W=w/2,D=d/2,storey=2.8,H=storey*2;
 kit.block(-W,W,0,H,-D,D,colour);
 kit.block(-W-.02,W+.02,0,.35,-D-.02,D+.02,0xb9b3a6);                // a darker plinth
 kit.block(-W-.12,W+.12,H,H+.1,-D-.12,D+.12,0xc8c2b5);               // roof slab lip
 for(const [x0,x1,z0,z1] of [[-W,W,-D,-D+.14],[-W,W,D-.14,D],[-W,-W+.14,-D,D],[W-.14,W,-D,D]])kit.block(x0,x1,H+.1,H+.55,z0,z1,colour);
 // Ground floor: aluminium sliding windows and a door under a thin concrete canopy.
 const window=(x,y,wd,ht)=>{
  kit.box(wd+.12,ht+.12,.06,x,y,D+.03,0xb8bec0,{finish:'metal'});
  kit.box(wd,ht,.05,x,y,D+.05,C.glass,{finish:'glow'});
  kit.box(.04,ht,.06,x,y,D+.07,0xb8bec0,{finish:'metal'});
 };
 window(-W*.45,1.45,2.2,1.2);window(W*.55,1.2,.9,1.5);
 kit.box(.95,2.05,.06,W*.08,1.03,D+.03,0x7b8a8e);
 kit.box(1.5,.1,.9,W*.08,2.3,D+.45,0xc8c2b5);
 // Upper floor: a balcony with a flower-block screen, the Okinawan answer to sun and typhoons.
 kit.block(-W,W*.2,storey,storey+.12,D,D+1.1,0xc8c2b5);
 kit.block(-W,W*.2,storey+.12,storey+1.05,D+.95,D+1.1,colour,'hana');
 kit.block(-W,-W+.12,storey+.12,storey+1.05,D,D+1.1,colour,'hana');
 window(-W*.4,storey+1.35,2.4,1.3);window(W*.62,storey+1.4,1.1,1.1);
 // The outside stair up the east side to the roof, with its railing.
 kit.at(W+.55,0,0,()=>{
  const steps=16,rise=(H+.1)/steps,run=(d-.6)/steps;
  for(let i=0;i<steps;i++)kit.box(1,rise*.9+.12,run+.02,0,rise*(i+.5),D-.3-run*(i+.5),0xcdc7ba);
  kit.rod([.48,1.05,D-.3],[.48,H+1.05,-D+.3],.03,C.steel);
  for(let i=0;i<=4;i++){const t=i/4;kit.rod([.48,t*H,D-.3-t*(d-.6)],[.48,t*H+1.05,D-.3-t*(d-.6)],.02,C.steel);}
 });
 // On the roof: the tank on its frame, a TV aerial, washing.
 kit.at(-W*.35,-D*.3,0,()=>{
  for(const [x,z] of [[-.45,-.45],[.45,-.45],[.45,.45],[-.45,.45]])kit.box(.07,.9,.07,x,H+.55,z,C.steel,{finish:'metal'});
  kit.box(1.1,.08,1.1,0,H+1.02,0,C.steel,{finish:'metal'});
  kit.cyl(.62,.62,1.3,0,H+1.71,0,C.tank,{segments:14,finish:'gloss'});
  kit.cyl(.2,.2,.1,0,H+2.41,0,C.tank,{segments:10});
 });
 kit.rod([W*.5,H+.1,-D*.4],[W*.5,H+2.6,-D*.4],.025,C.steel);
 for(const y of [H+2.1,H+2.4])kit.rod([W*.5-.6,y,-D*.4],[W*.5+.6,y,-D*.4],.015,C.steel);
 // An air conditioner hung on the wall, and its drip stain.
 kit.box(.8,.55,.3,-W-.18,1.8,-D*.2,0xe2e0d8,{ry:Math.PI/2});
 kit.box(.04,1.2,.2,-W-.01,1.0,-D*.2,0xa9a397);
 if(r.next()>.5)kit.box(.03,1.6,.18,W-.6,H-1,D+.01,0xaaa496);
 return [kit.rect(-W-.1,W+1.1,-D-.1,D+.1,H+.6,'okinawa-house')];
}

/**
 * A two-storey shop-house facing the street: an open shopfront under a painted fascia
 * and an awning, a tall board on the corner, windows above and a tank on the roof.
 * `stock` fills the shop with shelves of colour; `sign` and `upright` are textures.
 */
export function shopHouse(kit,{w=6.4,d=7.4,colour=0xe9dfc4,trim=0x3f7f86,sign,upright,awning=true,seed=3,stock=[0xd9b04a,0x5f8fb8,0xc0543e,0x6ea05a,0xe8e2d0]}={}){
 const r=rng(seed),W=w/2,D=d/2,ground=3.3,H=6.1,open=W-.38,back=D-2.2;
 // The body, stopping short of the front so the shop floor is a real room.
 kit.block(-W,W,0,H,-D,back,colour);
 kit.block(-W,-open,0,ground,back,D,colour);kit.block(open,W,0,ground,back,D,colour);
 kit.block(-W,W,ground,H,back,D,colour);
 kit.block(-W-.02,W+.02,0,.3,-D-.02,D+.02,0xb3ad9f);
 // Inside: floor, back wall, shelves of goods, a counter; lit, so it glows at night.
 kit.block(-open,open,.02,.08,back,D-.05,0x9d9486);
 kit.block(-open,open,.08,ground-.3,back,back+.06,0xefe6d2,'glow');
 kit.block(-open,open,ground-.3,ground,back,D-.3,0xd8d2c4,'glow');
 for(let level=0;level<4;level++){
  const y=.4+level*.62;
  kit.box(open*2-.3,.04,.42,0,y,back+.28,0xb9b0a0);
  for(let i=0;i<Math.floor(open*2/.32);i++){const x=-open+.3+i*.32;kit.box(.24,.26+r.next()*.14,.28,x,y+.17,back+.28,r.pick(stock),{finish:'glow'});}
 }
 kit.box(open*1.1,.95,.6,-open*.3,.48,back+1.2,0x7d6a55);
 kit.box(open*1.1+.06,.05,.66,-open*.3,.98,back+1.2,0xcfc5b3);
 // The rolled-up shutter's box over the opening, and the fascia board above it.
 kit.block(-open,open,ground-.42,ground-.08,D-.35,D-.05,0x8e9699,'metal');
 kit.block(-W,W,ground,ground+.1,D,D+.08,trim);
 if(sign)kit.sign(sign,w-.2,.72,0,ground+.5,D+.1,{name:'shop fascia'});
 if(awning){
  kit.box(w-.3,.07,1.35,0,ground-.35,D+.62,trim,{rx:.16});
  for(let i=0;i<Math.floor(w/.5);i++)kit.box(.24,.075,1.36,-W+.35+i*.5,ground-.34,D+.62,0xf2ede0,{rx:.16});
 }
 // Upstairs: two windows with their frames, a sill each, and a wall-hung air conditioner.
 for(const x of [-W*.48,W*.48]){
  kit.box(1.7,1.25,.06,x,ground+1.55,D+.03,0xb8bec0,{finish:'metal'});
  kit.box(1.56,1.12,.05,x,ground+1.55,D+.05,C.glass,{finish:'glow'});
  kit.box(.04,1.12,.06,x,ground+1.55,D+.07,0xb8bec0,{finish:'metal'});
  kit.box(1.8,.07,.18,x,ground+.9,D+.08,0xc9c2b4);
 }
 kit.box(.72,.5,.26,W-.7,ground+.55,D+.14,0xe2e0d8);
 // The tall board stands off the front corner, square to it, so it reads from up and
 // down the street.
 if(upright){
  kit.sign(upright,.6,2.2,W-.32,ground+1.55,D+.48,{ry:Math.PI/2,depth:.08,name:'shop upright',both:true});
  for(const y of [ground+.55,ground+2.55])kit.box(.05,.05,.5,W-.32,y,D+.22,C.steel);
 }
 // Roof: parapet, tank, aerial; rust runs down the front from the parapet's fixings.
 for(const [x0,x1,z0,z1] of [[-W,W,-D,-D+.14],[-W,W,D-.14,D],[-W,-W+.14,-D,D],[W-.14,W,-D,D]])kit.block(x0,x1,H,H+.5,z0,z1,colour);
 kit.block(-W-.04,W+.04,H+.5,H+.58,D-.18,D+.04,trim);
 kit.cyl(.5,.5,1.1,-W*.4,H+1.2,-D*.4,C.tank,{segments:12,finish:'gloss'});
 kit.box(1,.65,1,-W*.4,H+.33,-D*.4,C.steel,{finish:'metal'});
 kit.rod([W*.5,H,-D*.5],[W*.5,H+2.3,-D*.5],.022,C.steel);
 kit.rod([W*.5-.5,H+2.0,-D*.5],[W*.5+.5,H+2.0,-D*.5],.014,C.steel);
 for(const x of [-W+.5,W-.9])if(r.next()>.3)kit.box(.05,1.2+r.next(),.02,x,H-.8,D+.01,0x9d8f78);
 return [kit.rect(-W-.05,W+.05,-D-.05,back+.02,H+.6,'shop-house'),kit.rect(-W-.05,-open,back,D,ground,'shop-house'),kit.rect(open,W+.05,back,D,ground,'shop-house')];
}

/**
 * A run of coral stone wall from (x0,z0) to (x1,z1), along x or along z, in stones of
 * slightly different heights, with openings. Returns the solid runs as colliders.
 */
export function coralWall(kit,x0,z0,x1,z1,{height=1.35,thickness=.45,gaps=[],seed=4,flowers=false}={}){
 const r=rng(seed),alongX=Math.abs(x1-x0)>=Math.abs(z1-z0);
 const a=alongX?Math.min(x0,x1):Math.min(z0,z1),b=alongX?Math.max(x0,x1):Math.max(z0,z1),fixed=alongX?z0:x0;
 const runs=[];let start=a;
 const cuts=[...gaps].sort((p,q)=>p[0]-q[0]);
 for(const [g0,g1] of cuts){if(g0>start)runs.push([start,Math.min(g0,b)]);start=Math.max(start,g1);}
 if(start<b)runs.push([start,b]);
 const tints=[0xffffff,0xf4efe2,0xe8e2d2,0xfbf6ea];
 const out=[];
 for(const [s0,s1] of runs){
  const len=s1-s0,n=Math.max(1,Math.round(len/.62));
  for(let i=0;i<n;i++){
   const u0=s0+i*len/n,u1=s0+(i+1)*len/n,h=height+(r.next()-.5)*.14,mid=(u0+u1)/2;
   const [x,z]=alongX?[mid,fixed]:[fixed,mid],[w,d]=alongX?[u1-u0+.02,thickness]:[thickness,u1-u0+.02];
   kit.box(w,h,d,x,h/2,z,r.pick(tints),{finish:'coral'});
   // The rounded capping stones.
   kit.box(alongX?w*.9:thickness*.8,.12,alongX?thickness*.8:d*.9,x,h+.03,z,r.pick(tints),{finish:'coral',ry:(r.next()-.5)*.1});
   // Bougainvillea spilling over the top: leaves, then small bracts of colour on them.
   if(flowers&&r.next()>.7){
    kit.sphere(.26,x,h+.14,z,0x3f6b3a,{sx:1.4,sy:.55,sz:1.2,detail:0});
    for(let k=0;k<5;k++)kit.sphere(.09+r.next()*.05,x+(r.next()-.5)*.6,h+.2+r.next()*.12,z+(r.next()-.5)*.5,k%3?C.bougainvillea:0xe0559a,{detail:0});
   }
  }
  // The end stones of an opening stand a little proud, like gateposts.
  for(const u of [s0,s1]){const [x,z]=alongX?[u,fixed]:[fixed,u];kit.box(thickness+.1,height+.18,thickness+.1,x,(height+.18)/2,z,0xf4efe2,{finish:'coral'});}
  const [cx,cz]=alongX?[(s0+s1)/2,fixed]:[fixed,(s0+s1)/2],[cw,cd]=alongX?[len+.1,thickness+.1]:[thickness+.1,len+.1];
  out.push(kit.rect(cx-cw/2,cx+cw/2,cz-cd/2,cz+cd/2,height+.2,'coral-wall'));
 }
 return out;
}

/** The hinpun: a free-standing screen of stone inside the gate. */
export function hinpun(kit,x,z,w=2.4,{alongX=true}={}){
 const [bw,bd]=alongX?[w,.42]:[.42,w];
 kit.box(bw,1.55,bd,x,.78,z,0xf2ecde,{finish:'coral'});
 kit.box(bw+.1,.1,bd+.1,x,1.6,z,0xe6dfcd,{finish:'coral'});
 kit.sphere(.3,x,1.85,z,C.leafLight,{sx:alongX?2.5:1,sz:alongX?1:2.5,sy:.7});
 return [kit.rect(x-bw/2-.05,x+bw/2+.05,z-bd/2-.05,z+bd/2+.05,1.7,'hinpun')];
}

/** A fukugi: tall, narrow, dense and glossy, planted in rows as a windbreak. */
export function fukugi(kit,x,z,{h=5.5,seed=5}={}){
 const r=rng(seed);
 kit.cyl(.11,.17,h*.55,x,h*.275,z,0x4a3a2c,{segments:7});
 const greens=[C.leaf,0x2a5330,0x376a3d];
 for(let i=0;i<4;i++){
  const y=h*(.42+i*.17),rad=(1.05-i*.14)*(.9+r.next()*.2);
  kit.sphere(rad,x+(r.next()-.5)*.25,y,z+(r.next()-.5)*.25,r.pick(greens),{sy:1.25,finish:'gloss'});
 }
 return kit.rect(x-.22,x+.22,z-.22,z+.22,h,'fukugi');
}

/** A gajumaru (banyan): a knot of trunks, hanging roots and a broad, low canopy. */
export function gajumaru(kit,x,z,{seed=6,size=1}={}){
 const r=rng(seed),s=size;
 for(let i=0;i<5;i++){
  const a=i/5*Math.PI*2+r.next(),rad=(.35+r.next()*.3)*s;
  kit.rod([x+Math.cos(a)*rad,0,z+Math.sin(a)*rad],[x+Math.cos(a)*.15,3.2*s,z+Math.sin(a)*.15],.16*s,0x6e5f4c,{segments:6});
 }
 for(let i=0;i<9;i++){
  const a=r.next()*Math.PI*2,rad=(1+r.next()*1.6)*s;
  kit.rod([x+Math.cos(a)*rad,3.4*s,z+Math.sin(a)*rad],[x+Math.cos(a)*rad*1.05,0,z+Math.sin(a)*rad*1.05],.035,0x7a6a56,{segments:4});
 }
 for(let i=0;i<5;i++){
  const a=i/5*Math.PI*2,rad=(1.4+r.next()*.6)*s;
  kit.sphere((1.7+r.next()*.7)*s,x+Math.cos(a)*rad,(4+r.next()*.8)*s,z+Math.sin(a)*rad,r.pick([0x3f6b3a,0x4d7a43,0x355f33]),{sy:.62});
 }
 kit.sphere(2.2*s,x,5*s,z,0x45733e,{sy:.6});
 return kit.rect(x-.8*s,x+.8*s,z-.8*s,z+.8*s,5,'gajumaru');
}

/** A hibiscus bush with its red flowers out. */
export function hibiscus(kit,x,z,{size=.6,seed=7,flower=C.hibiscus}={}){
 const r=rng(seed);
 kit.sphere(size,x,size*.85,z,0x4b7a3f,{sy:.95});
 kit.sphere(size*.7,x+size*.45,size*.6,z-size*.2,0x55864a,{sy:.9});
 for(let i=0;i<9;i++){
  const a=r.next()*Math.PI*2,b=r.next()*1.2;
  kit.sphere(.075,x+Math.cos(a)*Math.cos(b)*size*1.02,size*.85+Math.sin(b)*size*.95,z+Math.sin(a)*Math.cos(b)*size*1.02,flower,{detail:0});
 }
}

/** A banana plant: a green trunk and its long, torn leaves. */
export function banana(kit,x,z,{seed=8}={}){
 const r=rng(seed);
 kit.cyl(.09,.13,2.1,x,1.05,z,0x6f7d3e,{segments:7});
 for(let i=0;i<6;i++){
  const a=i/6*Math.PI*2+r.next()*.4;
  kit.box(.42,.02,1.7,x+Math.cos(a)*.75,2.15+r.next()*.25,z+Math.sin(a)*.75,i%2?0x5f9a3c:0x6ea846,{ry:-a+Math.PI/2,rx:.45,finish:'thin'});
 }
}

/** A pot plant by a door. */
export function potPlant(kit,x,z,{seed=9,size=.35}={}){
 const r=rng(seed);
 kit.cyl(size*.8,size*.6,size*1.2,x,size*.6,z,C.terracotta,{segments:9});
 kit.sphere(size,x,size*1.55,z,r.pick([0x4f7d3e,0x3f6b3a,0x5b8a45]));
 if(r.next()>.5)kit.sphere(.06,x+size*.5,size*1.8,z,C.hibiscus,{detail:0});
}
