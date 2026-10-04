import {stairFlight,stairLanding} from './stairs.js';
import {KITAHAMA} from '../kitahama-layout.js';
import {plotGate} from './layout.js';
import {poster,nameplate} from './signs.js';
import {gajumaru,potPlant,hibiscus,blockWall} from './houses.js';
import {utilityPole,wiresBetween,serviceDrop,bicycle,laundry,gasBottles} from './props.js';
import {householdAtHome} from '../../people/island-households.js';

/**
 * Kitahama's residential quarter (docs/RESIDENTIAL-PLAN.md §2), west of the cross lane:
 * the spine lane, Fukugi Lane running north to a dead end and Well Lane running south to
 * one. The walled houses on it are built with the rest of Kitahama (walledHouse); this
 * adds what makes a quarter rather than a row of plots:
 *
 * - Kitahama Heights, a small two-storey block of four flats with an open corridor and
 *   an outside stair, washing on the balconies and the mailboxes at the foot of the stair;
 * - a pocket park at the corner, with a swing, a sandpit, a bench under a gajumaru and a
 *   bank of vending machines facing the lane;
 * - the rubbish point at the end of Well Lane, bags under a green net in a wire cage, and
 *   the quarter's notice board beside it;
 * - the pole line carried along the spine and up Fukugi Lane, with a transformer and a
 *   drop to every house;
 * - and the odd sign of somebody's life: a dog house and
 *   bicycles at the flats.
 *
 * Built inside Kitahama's frame (kit.at(..., KITAHAMA.y)): local y = 0 is the ground.
 * Anchors take world coordinates, so they go through kit.point.
 */
export function buildKitahamaQuarter(kit,solid,{anchor,onAction,vending},{across=[]}={}){
 const K=KITAHAMA;
 buildFlats(kit,solid,{anchor,onAction});
 buildPark(kit,solid,{anchor,onAction,vending});
 buildCorner(kit,solid,{anchor,onAction});
 // ---- The pole line: along the spine from the cross lane, then up Fukugi Lane.
 const poles=[];
 const pole=(x,z,o={})=>{const p=utilityPole(kit,x,z,o);solid(p.collider);poles.push(p);return p;};
 const spine=[27.5,16,6].map((x,i)=>pole(x,K.spine.maxZ-.25,{face:Math.PI,transformer:i===1,lamp:true,seed:240+i}));
 if(across[0])wiresBetween(kit,across[0],spine[0]);
 for(let i=0;i<spine.length-1;i++)wiresBetween(kit,spine[i],spine[i+1]);
 const north=[76,86,89].map((z,i)=>pole(K.fukugiLane.minX+.25,z,{face:Math.PI/2,transformer:false,lamp:i!==1,seed:250+i}));
 wiresBetween(kit,spine[0],north[0],{sag:.5});wiresBetween(kit,north[0],north[1]);wiresBetween(kit,north[1],north[2]);
 const well=pole(K.wellLane.maxX-.25,57,{face:-Math.PI/2,transformer:false,lamp:true,seed:260});wiresBetween(kit,spine[1],well,{sag:.5});
 const nearest=(x,z)=>poles.reduce((a,b)=>Math.hypot(b.anchors[0].x-x,b.anchors[0].z-z)<Math.hypot(a.anchors[0].x-x,a.anchors[0].z-z)?b:a);
 for(const p of K.plots.filter(q=>Number(q.id.split('-')[1])>=6)){
  const {door}=plotGate(p,0),inX=p.gate==='west'?3.2:p.gate==='east'?-3.2:0,inZ=p.gate==='north'?-3.2:p.gate==='south'?3.2:0;
  const target=kit.point(door[0]+inX+(inX?0:1.5),2.6,door[1]+inZ);
  serviceDrop(kit,nearest(door[0],door[1]),target.toArray());
 }
 {const A=K.apartment;serviceDrop(kit,north[1],kit.point(A.maxX-1.9,5.3,(A.minZ+A.maxZ)/2).toArray());}
 // ---- Somebody's life: a dog house inside the yard.
 {const p=K.plots.find(q=>q.id==='kitahama-10'),x=p.maxX-1.3,z=p.maxZ-1.4;
  kit.box(.7,.5,.8,x,.25,z,0x9a6a3e);kit.box(.82,.06,.95,x,.56,z,0x7a4b2e,{rz:.18});kit.box(.82,.06,.95,x,.56,z,0x7a4b2e,{rz:-.18});kit.box(.32,.32,.02,x,.22,z+.41,0x2a2420);
  solid(kit.rect(x-.4,x+.4,z-.45,z+.45,.7,'dog-house'));}
 return {poles};
}

/** Kitahama Heights: four flats, an open corridor on the lane side, a stair at the south end. */
function buildFlats(kit,solid,{anchor,onAction}){
 const A=KITAHAMA.apartment,x0=A.minX+.5,x1=A.maxX-1.9,z0=A.minZ+1,z1=A.maxZ-1,H=2.8;
 const wall=0xe9e3d3,trim=0x8f9a96,steel=0x6c7476,door=0x5b4636;
 // The block itself, two storeys and a parapet, in 'plaster'.
 kit.block(x0,x1,0,H*2+.5,z0,z1,wall,'plaster');
 kit.block(x0-.05,x1+.05,H-.08,H+.08,z0-.05,z1+.05,trim);
 kit.block(x0-.08,x1+.08,H*2+.5,H*2+.62,z0-.08,z1+.08,trim);
 solid(kit.rect(x0,x1,z0,z1,6,'kitahama-flats'));
 // Two black water tanks and an aerial on the roof.
 for(const z of [z0+1.6,z0+3.4])kit.cyl(.55,.55,1.1,x0+1.4,H*2+1.1,z,0x2b2d2f,{segments:14});
 kit.rod([x0+3,H*2+.5,z1-1],[x0+3,H*2+2.4,z1-1],.02,0x9aa0a4);kit.rod([x0+2.5,H*2+2.2,z1-1],[x0+3.5,H*2+2.2,z1-1],.015,0x9aa0a4);
 // The open corridor on the east (lane) side at first-floor level, with a steel rail.
 const cx0=x1,cx1=x1+1.25;
 kit.block(cx0,cx1,H-.08,H+.08,z0,z1,0xcfc9bb);
 for(let z=z0+.2;z<=z1;z+=1.8){kit.box(.08,H,.08,cx1-.05,H/2,z,steel);solid(kit.rect(cx1-.1,cx1,z-.05,z+.05,H,'flats-post'));}
 kit.block(cx1-.04,cx1,H+.9,H+.95,z0,z1,steel);
 for(let z=z0;z<=z1;z+=.12)kit.box(.02,.9,.02,cx1-.02,H+.45,z,steel);
 // Doors and kitchen windows, two flats a floor, numbered.
 const flats=[[0,z0+2.2,'1'],[0,z1-2.2,'2'],[H,z0+2.2,'3'],[H,z1-2.2,'4']];
 for(const [y,z,n] of flats){
  kit.box(.06,2.0,.85,x1+.03,y+1.0,z,door);
  kit.box(.04,.14,.24,x1+.07,y+1.55,z-.2,0xf2efe4);
  kit.box(.05,.6,.9,x1+.03,y+1.45,z+1.25,0x6f8a92,{finish:'window'});
  kit.box(.4,.35,.3,x1+.2,y+.35,z+1.25,0xe6e4de);
  kit.sign(nameplate('Flat '+n,'Kitahama Heights'),.24,.12,x1+.08,y+1.75,z+.55,{ry:Math.PI/2,name:'flat number'});
 }
 // The lane side's lower windows and the west side's balconies with washing.
 for(const y of [0,H])for(const z of [z0+2.2,z1-2.2]){
  kit.box(.06,1.3,1.6,x0-.03,y+1.4,z,0x6f8a92,{finish:'window'});
  kit.block(x0-1.0,x0,y+.02,y+.12,z-1.2,z+1.2,0xcfc9bb);
  kit.block(x0-1.0,x0-.96,y+.12,y+1.0,z-1.2,z+1.2,0xd8d2c4);
  kit.at(x0-.55,z,Math.PI/2,()=>laundry(kit,0,0,{length:1.9,seed:Math.round(z*7+y)}),y+.1);
 }
 // A broad flight reaches the same finished level as the open corridor.
 const sz0=z0-1.6,sz1=z0-.2,sx0=x1-4.9;
 stairFlight(kit,solid,{id:'flats-stair',x:sx0,z:(sz0+sz1)/2,length:4.9,height:H+.08,axis:'x'});
 stairLanding(kit,{id:'flats-landing',x0:x1,x1:cx1,z0:sz0,z1:z0+.1,y:H+.08},solid);
 kit.level(cx0,cx1,z0,z1,H+.08,'flats-corridor');
 solid({...kit.rect(cx1-.05,cx1+.025,sz0,z1,1,'flats-corridor-rail'),minY:kit.point(0,H+.08,0).y});
 // The name on the parapet, mailboxes at the foot of the stair, bicycles by the door.
 kit.sign(poster({title:'KITAHAMA HEIGHTS',lines:['4 FLATS · ENQUIRIES AT THE TOWN HALL'],bg:'#f2ede0',band:'#3f6f8a'}),1.6,.5,x1+.04,H*2+.15,(z0+z1)/2,{ry:Math.PI/2,name:'flats sign'});
 const mx=A.maxX-.55,mz=A.minZ+1.6;
 kit.box(.1,1.05,.1,mx,.52,mz,steel);
 for(let i=0;i<4;i++)kit.box(.3,.22,.34,mx,1.0+(i%2)*.24,mz-.18+Math.floor(i/2)*.36,[0xc8432f,0x3f6f8a,0xd8b13c,0x5f8f5a][i]);
 solid(kit.rect(mx-.2,mx+.2,mz-.4,mz+.4,1.3,'flats-mailboxes'));
 bicycle(kit,A.maxX-.6,z1-.6,{ry:Math.PI/2,colour:0x3d6f8f});bicycle(kit,A.maxX-.6,z1-1.6,{ry:Math.PI/2,colour:0xd8b13c});
 gasBottles(kit,x0+.4,z1+.45,{ry:0});
 // A low block wall along the lane with an opening for the stair and the doors.
 solid(blockWall(kit,A.maxX,A.minZ,A.maxX,A.maxZ,{height:.9,gaps:[[A.minZ+1.2,A.minZ+4.2],[A.maxZ-4.2,A.maxZ-1.8]]}));
 const at=kit.point(A.maxX+.5,1,mz);
 const h=householdAtHome(A.id);
 anchor(at.x,at.y,at.z,'Read the Kitahama Heights mailboxes',()=>onAction?.('read','Kitahama Heights · the mailboxes',
  'Four flats, two up and two down, with the stair at the end and the corridor along the lane side. The names on the mailboxes:\n\n'+(h?h.members.map(m=>'· '+m.name+', '+m.purpose).join('\n'):'')+'\n· Flat 4: empty. The key is at the town hall.'));
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
  'The chains squeak on the forward stroke and not on the back one. Mr Iha oils them every spring and the squeak comes back by the summer. Somebody has written a name in felt pen on the left seat and somebody else has crossed it out.'));
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
 if(marker)marker.userData.seat={id:'kitahama-park-bench',position:[seatAt.x,seatAt.y,seatAt.z],stand:[standAt.x,standAt.y,standAt.z],eyeY:seatAt.y+1.12,yaw:-Math.PI/2,pitch:0};
 hibiscus(kit,P.maxX-.6,P.maxZ-.6,{seed:271});potPlant(kit,P.minX+.5,P.maxZ-.5,{seed:272});
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
 const nx=L.minX-.45,nz=L.minZ+3.2;
 for(const dz of [-.7,.7])kit.box(.08,1.9,.08,nx,.95,nz+dz,0x6b4a33);
 kit.box(.08,.95,1.6,nx,1.45,nz,0x8a6a45);kit.box(.12,.06,1.7,nx,1.97,nz,0x5d4431);
 const notices=[
  poster({title:'CANE CUT',lines:['Mon 12 January, 7:00','Everybody on the lane','Lunch at the Tairas'],bg:'#f4e7c4',band:'#8a6a2f'}),
  poster({title:'SANSHIN',lines:['Saturdays 9:30','Mrs Gushiken','Beginners welcome'],bg:'#eef1e4',band:'#c8432f'}),
  poster({title:'TYPHOON',lines:['Tie down tanks','Fill the bath','Shutters by Friday'],bg:'#f2ede0',band:'#3f6f8a'}),
 ];
 notices.forEach((t,i)=>kit.sign(t,.42,.6,nx+.06,1.45,nz-.5+i*.5,{ry:Math.PI/2,name:'notice'}));
 solid(kit.rect(nx-.1,nx+.1,nz-.8,nz+.8,2,'notice-board'));
 const at=kit.point(nx+.6,1,nz);
 anchor(at.x,at.y,at.z,'Read the Kitahama notice board',()=>onAction?.('read','Kitahama notice board',
  'Rubbish: burnable on Tuesdays and Fridays, cans and bottles on Wednesdays, out by eight and under the nets, because of the crows.\n\nThe cane cut is on Monday the 12th of January from seven. Everybody on the lane, lunch at the Tairas\'.\n\nSanshin with Mrs Gushiken, Saturdays at half past nine on her verandah. Beginners welcome; bring your own picks.\n\nTyphoon season: tie down your water tanks, fill the bath, shutters up by Friday. Mr Iha will check the lane lights.\n\nFound: a child\'s blue sandal, left foot. Ask at number 10.'));
 potPlant(kit,L.maxX-.4,L.minZ+.4,{seed:280});
}
