import {KITAHAMA,KITAHAMA_HEIGHTS} from '../kitahama-layout.js';
import {plotGate} from './layout.js';
import {poster,nameplate} from './signs.js';
import {gajumaru,potPlant,hibiscus,blockWall} from './houses.js';
import {utilityPole,wiresBetween,serviceDrop,bicycle,laundry,gasBottles} from './props.js';
import {homeNameplate,residentsLine} from '../../people/island-households.js';

/**
 * Kitahama's residential quarter (docs/RESIDENTIAL-PLAN.md §2), west of the cross lane:
 * the spine lane, Fukugi Lane running north to a dead end and Well Lane running south to
 * one. The walled houses on it are built with the rest of Kitahama (walledHouse); this
 * adds what makes a quarter rather than a row of plots:
 *
 * - Kitahama Heights, two attached ground-floor houses with their own gates and gardens
 *   on the lane, the washing out and the mailboxes on the gate piers;
 * - a pocket park at the corner, with a swing, a sandpit, a bench under a gajumaru and a
 *   bank of vending machines facing the lane;
 * - the rubbish point at the end of Well Lane, bags under a green net in a wire cage, and
 *   the quarter's notice board beside it;
 * - the pole line carried along the spine and up Fukugi Lane, with a transformer and a
 *   drop to every house;
 * - and the odd sign of somebody's life: a dog house and
 *   bicycles at the Heights.
 *
 * Built inside Kitahama's frame (kit.at(..., KITAHAMA.y)): local y = 0 is the ground.
 * Anchors take world coordinates, so they go through kit.point.
 */
export function buildKitahamaQuarter(kit,solid,{anchor,onAction,vending},{across=[]}={}){
 const K=KITAHAMA;
 buildHeights(kit,solid,{anchor,onAction});
 buildPark(kit,solid,{anchor,onAction,vending});
 buildCorner(kit,solid,{anchor,onAction});
 // ---- The pole line: along the spine from the cross lane, then up Fukugi Lane.
 const poles=[];
 const pole=(x,z,o={})=>{const p=utilityPole(kit,x,z,o);solid(p.collider);poles.push(p);return p;};
 const spine=[18.5,-9].map((x,i)=>pole(x,K.spine.maxZ-.25,{face:Math.PI,transformer:i===1,lamp:true,seed:240+i*2}));
 if(across[0])wiresBetween(kit,across[0],spine[0]);
 for(let i=0;i<spine.length-1;i++)wiresBetween(kit,spine[i],spine[i+1]);
 const north=pole(-12,39,{face:Math.PI/2,transformer:false,lamp:true,seed:252});
 wiresBetween(kit,spine[0],north,{sag:.5});
 const nearest=(x,z)=>poles.reduce((a,b)=>Math.hypot(b.anchors[0].x-x,b.anchors[0].z-z)<Math.hypot(a.anchors[0].x-x,a.anchors[0].z-z)?b:a);
 for(const p of K.plots.filter(q=>Number(q.id.split('-')[1])>=6)){
  const {door}=plotGate(p,0),inX=p.gate==='west'?3.2:p.gate==='east'?-3.2:0,inZ=p.gate==='north'?-3.2:p.gate==='south'?3.2:0;
  const target=kit.point(door[0]+inX+(inX?0:1.5),2.6,door[1]+inZ);
  serviceDrop(kit,nearest(door[0],door[1]),target.toArray());
 }
 // A drop to each of the Heights' two houses, over its front door.
 for(const h of KITAHAMA_HEIGHTS.houses)serviceDrop(kit,north,kit.point(KITAHAMA_HEIGHTS.x1+.1,2.6,h.z).toArray());
 return {poles};
}

/** Each Heights house's bicycle: who rides it and where to (CLAUDE.md: nothing is random). */
const HEIGHTS_BICYCLES=Object.freeze({
 'kitahama-flat-3':Object.freeze({id:'heights-a-bicycle',colour:0x3d6f8f,basket:false,
  why:'Mac’s, a plain blue commuter for the ride to the gangway when the ship calls the relief engineer, and for the hardware shelf at Sakura. No basket: he carries his tools in a shoulder bag.'}),
 'kitahama-flat-4':Object.freeze({id:'heights-b-bicycle',colour:0xd8b13c,frame:'step',
  why:'Ms Ganaha’s mamachari, which takes her to the post and parcel counter at the Port Terminal by half past eight and brings the evening’s shopping home in its basket.'}),
});

/**
 * Kitahama Heights: two attached ground-floor houses, A to the north and B to the south (kitahama-layout.js
 * KITAHAMA_HEIGHTS; docs/CAST-CONSOLIDATION.md addendum 6). One single-storey concrete body in the quarter's own style
 * (the plinth, the plaster, the aluminium windows, the parapet and the tank on the roof of every concrete house here),
 * a party wall through it, and on the lane side a front door, a kitchen window and a canopy for each; in front of
 * them a strip of garden behind the low block wall, a gate and a nameplate for each house, and the mailboxes on the
 * gate piers. No corridor, no stair, no upper floor: the lane, the gate and the door are all at ground level.
 */
function buildHeights(kit,solid,{anchor,onAction}){
 const B=KITAHAMA_HEIGHTS,A=B.lot,{x0,x1,z0,z1,party}=B,H=B.height;
 const wall=0xe9e3d3,trim=0x8f9a96,steel=0x6c7476,door=0x5b4636,glass=0x6f8a92,metal=0xb8bec0;
 // The body: one storey on a dark plinth, the roof slab's lip and a parapet all round, the party wall carried through
 // the parapet so the two roofs read as two.
 kit.block(x0,x1,0,H,z0,z1,wall,'plaster');
 kit.block(x0-.02,x1+.02,0,.35,z0-.02,z1+.02,0xb9b3a6);
 kit.block(x0-.12,x1+.12,H,H+.1,z0-.12,z1+.12,trim);
 for(const [a,b,c,d] of [[x0,x1,z0,z0+.14],[x0,x1,z1-.14,z1],[x0,x0+.14,z0,z1],[x1-.14,x1,z0,z1],[x0,x1,party-.07,party+.07]])kit.block(a,b,H+.1,H+.55,c,d,wall,'plaster');
 kit.box(.05,H-.35,.06,x1+.02,.35+(H-.35)/2,party,0xd2cbbb);   // the party line on the front, a shadow between the two renders
 solid(kit.rect(x0,x1,z0,z1,H+.6,'kitahama-heights'));
 const window=(zc,wd,ht,y)=>{kit.box(.06,ht+.12,wd+.12,x1+.03,y,zc,metal,{finish:'metal'});kit.box(.05,ht,wd,x1+.05,y,zc,glass,{finish:'window'});kit.box(.06,ht,.04,x1+.08,y,zc,metal,{finish:'metal'});};
 for(const h of B.houses){
  const z=h.z,plate=homeNameplate(h.id),end=h.side==='north'?z1:z0,out=h.side==='north'?1:-1;
  // The front door under its thin canopy, a window either side of it, and the nameplate's twin on the door frame.
  kit.box(.06,2.06,1.03,x1+.03,1.03,z,metal,{finish:'metal'});kit.box(.05,2.0,.91,x1+.05,1.0,z,door);
  kit.box(.02,1.1,.22,x1+.085,1.25,z-.2,0xc9d6d8);kit.box(.05,.22,.04,x1+.1,1.0,z+.33,0xd8dcdc,{finish:'metal'});
  kit.box(.9,.1,1.46,x1+.45,2.25,z,0xc8c2b5);
  window(z-1.45,1.2,1.2,1.45);window(z+1.45,1.2,1.2,1.45);
  // On the roof, the tank on its frame and the aerial; on the end wall, the air conditioner.
  const tx=x0+1.3,tz=z+out*.4;
  for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[.4,.4],[-.4,.4]])kit.box(.07,.8,.07,tx+dx,H+.5,tz+dz,steel,{finish:'metal'});
  kit.box(.95,.08,.95,tx,H+.94,tz,steel,{finish:'metal'});kit.cyl(.5,.5,1.1,tx,H+1.53,tz,0x2b2d2f,{segments:14,finish:'gloss'});kit.cyl(.18,.18,.1,tx,H+2.13,tz,0x2b2d2f,{segments:10});
  kit.rod([x1-1,H+.1,z-out*1.2],[x1-1,H+2.2,z-out*1.2],.02,0x9aa0a4);kit.rod([x1-1.5,H+2.0,z-out*1.2],[x1-.5,H+2.0,z-out*1.2],.015,0x9aa0a4);
  kit.box(.8,.55,.3,x0+1.6,1.8,end+out*.18,0xe2e0d8);
  // The garden: stepping stones from the gate to the door, a hibiscus by the wall, pots by the step, the washing out
  // and a bicycle; the gas bottles round the end of the house.
  for(const x of [A.maxX-.55,A.maxX-1.25,A.maxX-1.95])kit.box(.48,.03,.44,x,.015,z,0xcfc8b4);
  hibiscus(kit,x1+1.9,z+out*1.9,{seed:h.side==='north'?281:282,flower:h.side==='north'?0xe8b12c:0xd95a5a});
  potPlant(kit,x1+.5,z+.9,{seed:h.side==='north'?283:284,size:.3});potPlant(kit,x1+.5,z-.9,{seed:h.side==='north'?285:286,size:.25});
  kit.at(x1+1.4,z-out*1.5,Math.PI/2,()=>laundry(kit,0,0,{length:1.5,seed:h.side==='north'?287:288}));
  // The bicycle inside the front wall, side-on, between the washing and the gate (HEIGHTS_BICYCLES).
  {const b=HEIGHTS_BICYCLES[h.id];solid(bicycle(kit,A.maxX-.48,z-out*1.55,{ry:out*-Math.PI/2,owner:plate.owners,...b}));}
  solid(gasBottles(kit,x0+.9,end+out*.35,{ry:0}));
  // The gate's nameplate and mailbox, and what they say.
  kit.sign(nameplate(plate.address,plate.owners),.55,.25,A.maxX+.11,.85,z+.95+.5,{ry:Math.PI/2,name:'nameplate'});
  kit.box(.14,.26,.34,A.maxX+.17,.95,z-.95-.3,[0xc8432f,0x3f6f8a][h.side==='north'?0:1]);
  const at=kit.point(A.maxX+.6,1,z+1.1);
  anchor(at.x,at.y,at.z,plate.address+' · '+plate.owners,()=>onAction?.('read',plate.title,residentsLine(h.id)));
 }
 // The low block wall along the lane, a gate for each house.
 solid(blockWall(kit,A.maxX,A.minZ,A.maxX,A.maxZ,{height:1.2,gaps:B.houses.map(h=>[...h.gate])}));
 const at=kit.point(A.maxX+.6,1,party);
 anchor(at.x,at.y,at.z,'Read the Kitahama Heights mailboxes',()=>onAction?.('read','Kitahama Heights · the mailboxes',
  'Two houses under one roof, A to the north and B to the south, each with its own gate, front door and strip of garden on Fukugi Lane.\n\n'+residentsLine(A.id)));
}

/** The pocket park at the corner of the spine and Well Lane. */
function buildPark(kit,solid,{anchor,onAction,vending}){
 const P=KITAHAMA.park,green=0x5f8f5a,steel=0x6c7476;
 // A low railing round it, open to the spine and to Well Lane.
 const rail=(ax,az,bx,bz)=>{kit.rod([ax,.6,az],[bx,.6,bz],.03,green);for(let t=0;t<=1.001;t+=.25)kit.box(.05,.6,.05,ax+(bx-ax)*t,.3,az+(bz-az)*t,green);};
 rail(P.minX,P.minZ,P.maxX,P.minZ);rail(P.minX,P.minZ,P.minX,P.maxZ);rail(P.maxX,P.minZ,P.maxX,P.minZ+5.5);
 solid([kit.rect(P.minX,P.maxX,P.minZ-.05,P.minZ+.05,.7,'park-rail'),kit.rect(P.minX-.05,P.minX+.05,P.minZ,P.maxZ,.7,'park-rail'),kit.rect(P.maxX-.05,P.maxX+.05,P.minZ,P.minZ+5.5,.7,'park-rail')]);
 // The swing: an A-frame with two seats on chains.
 const sx=P.minX+1.9,sz=P.minZ+2.4;
 for(const dz of [-1.2,1.2]){kit.rod([sx-.7,0,sz+dz],[sx,2.1,sz+dz],.04,0xc8432f);kit.rod([sx+.7,0,sz+dz],[sx,2.1,sz+dz],.04,0xc8432f);}
 kit.rod([sx,2.1,sz-1.25],[sx,2.1,sz+1.25],.05,0xc8432f);
 for(const dz of [-.5,.5]){for(const e of [-.18,.18])kit.rod([sx,2.08,sz+dz+e],[sx,.5,sz+dz+e],.008,steel);kit.box(.24,.04,.46,sx,.48,sz+dz,0xe6c24a);}
 solid(kit.rect(sx-.8,sx+.8,sz-1.3,sz+1.3,2.2,'park-swing'));
 const swing=kit.point(sx+1,1,sz);
 anchor(swing.x,swing.y,swing.z,'Push the swing',()=>onAction?.('read','The swing',
  'The chains squeak on the forward stroke and not on the back one. Somebody oils them every spring and the squeak comes back by the summer. Somebody has written a name in felt pen on the left seat and somebody else has crossed it out.'));
 // The sandpit with a red bucket, and the gajumaru for shade over the bench.
 const bx=P.maxX-2.2,bz=P.maxZ-2.5;
 kit.block(P.minX+.6,P.minX+2.6,0,.18,P.maxZ-3.2,P.maxZ-1.4,0xd8c9a2);kit.block(P.minX+.75,P.minX+2.45,.02,.16,P.maxZ-3.05,P.maxZ-1.55,0xe8dcb8);
 kit.cyl(.08,.06,.12,P.minX+1.4,.22,P.maxZ-2.1,0xc8432f,{segments:8});
 gajumaru(kit,P.maxX-1.3,P.minZ+1.6,{seed:270,size:.8});solid(kit.rect(P.maxX-2,P.maxX-.6,P.minZ+.9,P.minZ+2.3,3,'park-tree'));
 // The bench, facing the swing.
 kit.box(1.5,.08,.42,bx,.45,bz,0x8a6a45,{ry:Math.PI/2});kit.box(1.5,.36,.06,bx+.22,.68,bz,0x8a6a45,{ry:Math.PI/2});
 for(const dz of [-.6,.6])kit.box(.38,.42,.06,bx,.21,bz+dz,steel,{ry:Math.PI/2});
 solid(kit.rect(bx-.25,bx+.3,bz-.8,bz+.8,.9,'park-bench'));
 const seatAt=kit.point(bx,0,bz),standAt=kit.point(bx-.9,0,bz),marker=anchor(seatAt.x,seatAt.y+1,seatAt.z,'Sit on the park bench',()=>onAction?.('seat','Kitahama pocket park',
  'You sit under the gajumaru. A swing creaks somewhere behind the vending machines. Across the lane a radio is giving the weather for the outer islands, and somebody is frying onions.'));
 if(marker)marker.userData.seat={id:'kitahama-park-bench',position:[seatAt.x,seatAt.y,seatAt.z],stand:[standAt.x,standAt.y,standAt.z],surfaceY:seatAt.y+.49,eyeY:seatAt.y+1.12,yaw:Math.PI/2,pitch:0};
 // the pot in the corner behind the drinks machines, by the rail (it stood where the first machine stands)
 hibiscus(kit,P.maxX-.6,P.maxZ-.6,{seed:271});potPlant(kit,P.minX+.32,P.maxZ-1.3,{seed:272,size:.25});
 kit.sign(poster({title:'KITAHAMA POCKET PARK',lines:['Please take your rubbish home','Ball games: before 18:00'],bg:'#eef1e4',band:'#5f8f5a'}),.5,.7,P.maxX+.3,1.1,P.minZ+6.6,{ry:Math.PI/2,name:'park sign'});
 // The vending machines on the lane, lit at night: tea, coffee, juice.
 if(vending)for(const x of [P.minX+.8,P.minX+2.1,P.minX+3.4])vending(x,P.maxZ-.65,0);
}

/** The rubbish point and notice board at the end of Well Lane. */
function buildCorner(kit,solid,{anchor,onAction}){
 const L=KITAHAMA.wellLane,cx=(L.minX+L.maxX)/2,cz=L.minZ+.75,steel=0x8e979a;
 // A wire cage with a lid, the bags inside under a green net.
 const w=2.3,d=1.1,h=1.1;
 for(const [x,z] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]])kit.box(.04,h,.04,cx+x,h/2,cz+z,steel);
 for(const y of [.05,h])kit.block(cx-w/2,cx+w/2,y-.02,y+.02,cz-d/2,cz+d/2,steel);
 for(let x=-w/2;x<=w/2;x+=.15)kit.box(.01,h,.01,cx+x,h/2,cz+d/2,steel);
 for(let i=0;i<7;i++)kit.sphere(.26+(i%3)*.04,cx-w/2+.35+i*.27,.28+(i%2)*.18,cz-.1+(i%2)*.15,i%3?0xf2f2ee:0x9fc4e0,{sy:.85,detail:1});
 kit.box(w-.1,.02,d-.1,cx,.62,cz,0x2f7a4a,{finish:'thin'});
 solid(kit.rect(cx-w/2,cx+w/2,cz-d/2,cz+d/2,h,'rubbish-point'));
 const sign=poster({title:'RUBBISH',lines:['Burnable: Tue · Fri','Cans, bottles: Wed','Put out by 8:00','Nets over the bags (crows!)'],bg:'#f4ecd6',band:'#2f7a4a'});
 kit.sign(sign,.45,.62,cx,h+.5,cz-d/2-.04,{name:'rubbish sign'});kit.box(.05,1.5,.05,cx,.75,cz-d/2-.06,steel);
 // The notice board on two posts, by the lane.
 const nx=-14,nz=36.5;
 for(const dz of [-.7,.7])kit.box(.08,1.9,.08,nx,.95,nz+dz,0x6b4a33);
 kit.box(.08,.95,1.6,nx,1.45,nz,0x8a6a45);kit.box(.12,.06,1.7,nx,1.97,nz,0x5d4431);
 const notices=[
  poster({title:'CANE CUT',lines:['Mon 12 January, 7:00','Everybody on the lane','Lunch at Sato Ramen'],bg:'#f4e7c4',band:'#8a6a2f'}),
  poster({title:'FOUND',lines:['A child’s blue sandal','left foot','Ask at number 3'],bg:'#eef1e4',band:'#c8432f'}),
  poster({title:'TYPHOON',lines:['Tie down tanks','Fill the bath','Shutters by Friday'],bg:'#f2ede0',band:'#3f6f8a'}),
 ];
 notices.forEach((t,i)=>kit.sign(t,.42,.6,nx+.06,1.45,nz-.5+i*.5,{ry:Math.PI/2,name:'notice'}));
 solid(kit.rect(nx-.1,nx+.1,nz-.8,nz+.8,2,'notice-board'));
 const at=kit.point(nx+.6,1,nz);
 anchor(at.x,at.y,at.z,'Read the Kitahama notice board',()=>onAction?.('read','Kitahama notice board',
  'Rubbish: burnable on Tuesdays and Fridays, cans and bottles on Wednesdays, out by eight and under the nets, because of the crows.\n\nThe cane cut is on Monday the 12th of January from seven. Everybody on the lane, lunch at Sato Ramen.\n\nTyphoon season: tie down your water tanks, fill the bath, shutters up by Friday. Tetsuo will check the lane lights.\n\nFound: a child\'s blue sandal, left foot. Ask at number 3.'));
 potPlant(kit,L.maxX-.4,L.minZ+.4,{seed:280});
}
