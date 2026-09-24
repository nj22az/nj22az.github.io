import {fascia,iceMural,enamel,catchFlag,poster} from './signs.js';
import {potPlant,OKINAWA_COLOURS as C} from './houses.js';
import {fishCrates,buoys} from './props.js';

/**
 * The buildings that were here before the quarters went up, brought up to the street
 * they now stand in. Nothing here moves a wall, a door or a room: each one is dressed
 * from outside, against the footprints the town already keeps, so the interiors and
 * everything that walks in and out of them are exactly as they were.
 *
 *   Sakura      the flat above the shop, its outside stair up the back, the rooftop sign,
 *               an ice-cream mural on the side wall and enamel tins on the other.
 *   Warehouse   its name painted big on the street wall, floats and crates at its foot.
 *   Office      big-catch flags on a pole by the door, a life ring and the tide board.
 *   Bookshop    a cart of cheap paperbacks out on the pavement.
 */
export function dressOldTown(kit,solid,{inspect}){
 dressSakura(kit,solid,{inspect});
 dressWarehouse(kit,solid,{inspect});
 dressOffice(kit,solid,{inspect});
 dressBookshop(kit,solid,{inspect});
}

/** Sakura's footprint and the height of its roof slab, as the storefront builds them. */
export const SAKURA_BOX=Object.freeze({minX:-18.45,maxX:-7.45,minZ:-34.43,maxZ:-20.17,roof:4.01});

function dressSakura(kit,solid,{inspect}){
 const S=SAKURA_BOX,roof=S.roof;
 // The flat upstairs, set back from the frontage so the shop's sign keeps the street.
 const x0=S.minX+.15,x1=S.maxX-1.05,z0=S.minZ+.5,z1=S.maxZ-.5,top=roof+2.7,wall=0xe7dcc2;
 kit.block(x0,x1,roof,top,z0,z1,wall);
 kit.block(x0-.04,x1+.04,roof,roof+.25,z0-.04,z1+.04,0xc9bfa6);
 for(const [a,b,c,d] of [[x0,x1,z0,z0+.14],[x0,x1,z1-.14,z1],[x0,x0+.14,z0,z1],[x1-.14,x1,z0,z1]])kit.block(a,b,top,top+.45,c,d,wall);
 kit.block(x1-.02,x1+.06,top+.4,top+.5,z0,z1,0xb84e45);
 // Windows on the street, one of them a door out onto the terrace over the shop.
 const window=(z,y,w,h)=>{
  kit.box(.06,h+.12,w+.12,x1+.03,y,z,0xb8bec0,{finish:'metal'});
  kit.box(.05,h,w,x1+.05,y,z,C.glass,{finish:'glow'});
  kit.box(.06,h,.04,x1+.07,y,z,0xb8bec0,{finish:'metal'});
 };
 window(-31.4,roof+1.4,1.9,1.2);window(-27.3,roof+1.15,1.5,2);window(-23.2,roof+1.4,1.9,1.2);
 for(const z of [-29.4,-25.2])kit.box(.28,.5,.78,x1+.18,roof+2.1,z,0xe2e0d8);
 // The back and the north end have their windows too: a kitchen, a bathroom, a bedroom.
 for(const [z,w] of [[-26,1.6],[-22.6,1.2]]){
  kit.box(.06,1.12,w+.12,x0-.03,roof+1.45,z,0xb8bec0,{finish:'metal'});
  kit.box(.05,1,w,x0-.05,roof+1.45,z,C.glass,{finish:'glow'});
 }
 kit.box(.8,.5,.3,x0-.2,roof+.7,-24.3,0xe2e0d8);
 for(const x of [-15.6,-11.6]){
  kit.box(1.5,1.12,.06,x,roof+1.45,z1+.03,0xb8bec0,{finish:'metal'});
  kit.box(1.38,1,.05,x,roof+1.45,z1+.05,C.glass,{finish:'glow'});
 }
 // The terrace: the strip of shop roof in front of the flat, railed, with washing and pots.
 for(let z=S.minZ+.5;z<=S.maxZ-.5;z+=1.1)kit.rod([S.maxX-.2,roof,z],[S.maxX-.2,roof+1,z],.02,0x9aa0a4);
 kit.rod([S.maxX-.2,roof+1,S.minZ+.5],[S.maxX-.2,roof+1,S.maxZ-.5],.025,0x9aa0a4);
 kit.rod([S.maxX-.2,roof+.5,S.minZ+.5],[S.maxX-.2,roof+.5,S.maxZ-.5],.018,0x9aa0a4);
 for(const z of [-32.6,-30.4,-24.4,-21.4])potPlant(kit,S.maxX-.62,z,{seed:Math.round(-z),size:.25});
 kit.rod([x1+.3,roof+1.75,-26.2],[S.maxX-.5,roof+1.75,-26.2],.015,0xd0d4d6);
 kit.rod([x1+.3,roof+1.75,-22.4],[S.maxX-.5,roof+1.75,-22.4],.015,0xd0d4d6);
 for(let k=0;k<5;k++)kit.box(.015,.55+(k%2)*.2,.4,(x1+S.maxX)/2,roof+1.45-(k%2)*.1,-26+k*.85,[0xf4f1ea,0xe8a0a8,0x7fb0d8,0xf1d27a,0xffffff][k],{finish:'thin'});
 // On the roof: two tanks, the aerial and the shop's name on a steel frame.
 for(const z of [-32,-30.4]){
  kit.box(1,.8,1,x0+1.6,top+.4,z,0x8e979a,{finish:'metal'});
  kit.cyl(.52,.52,1.1,x0+1.6,top+1.35,z,C.tank,{segments:12,finish:'gloss'});
 }
 kit.rod([x0+3,top,-22],[x0+3,top+2.6,-22],.025,0x8e979a);
 for(const y of [top+2,top+2.35])kit.rod([x0+3,y,-22.6],[x0+3,y,-21.4],.015,0x8e979a);
 for(const z of [-29,-25.6]){kit.rod([x1-.9,top+.45,z],[x1-.9,top+2.4,z],.05,0x6d7478);}
 kit.box(.08,.08,4,x1-.9,top+2.4,-27.3,0x6d7478);
 kit.sign(fascia({jp:'桜商店',en:'Sakura · food & daily goods',bg:'#fbf3dc',accent:'#b84e45',ink:'#a6333c',mark:'桜'}),4.2,1.2,x1-.84,top+1.55,-27.3,{ry:Math.PI/2,depth:.08,name:'Sakura rooftop sign'});
 // The outside stair up the back from the yard to the flat's door.
 // It climbs the south end of the back wall, steep as these steel stairs are, so the
 // shop's back door, its crates and Thuan's bench further along are left as they were;
 // the landing runs on over the door at first-floor height.
 const sx=S.minX-.52,from=S.minZ+.3,to=-30.4,steps=16,rise=roof/steps,run=(to-from)/steps;
 for(let i=0;i<steps;i++)kit.box(1,.1,run+.03,sx,rise*(i+1)-.05,from+run*(i+.5),0xcdc7ba);
 kit.block(sx-.5,S.minX,roof-.14,roof,to,to+1.5,0xcdc7ba);
 for(const z of [from+1.2,to-.1])kit.box(.12,roof,.12,sx-.42,roof/2,z,0x9aa0a4);
 kit.rod([sx-.48,1,from],[sx-.48,roof+1,to],.025,0x9aa0a4);kit.rod([sx-.48,roof+1,to],[sx-.48,roof+1,to+1.5],.025,0x9aa0a4);
 for(let i=1;i<steps;i+=3)kit.rod([sx-.48,rise*i,from+run*i],[sx-.48,rise*i+1,from+run*i],.015,0x9aa0a4);
 kit.box(.06,2,.9,S.minX-.02,roof+1,to+.75,0x7b8a8e);
 solid({id:'sakura-stair',x:sx,z:(from+to)/2,w:1.05,d:to-from,height:roof+1});
 // The back wall: condensers up out of reach, the pipes and the meters.
 for(const z of [-31.2,-29.6])kit.box(.32,.6,.85,S.minX-.2,2.7,z,0xe2e0d8);
 for(const z of [-30.8,-29.2])kit.rod([S.minX-.08,.1,z],[S.minX-.08,2.4,z],.03,0x9aa0a4);
 kit.box(.2,.45,.35,S.minX-.12,1.6,-22.8,0x8a8578);kit.box(.18,.35,.3,S.minX-.12,1.6,-21.9,0x9a958a);
 // Side walls: the ice-cream mural facing up the street, enamel tins facing the quay.
 kit.sign(iceMural(),7.4,2.15,(S.minX+S.maxX)/2-.6,2.05,S.maxZ+.04,{name:'Blue Coral mural'});
 kit.sign(enamel({jp:'琉球サイダー',en:'Ryukyu cider'}),.7,1.05,S.maxX-2,1.7,S.minZ-.04,{ry:Math.PI,depth:.02,name:'enamel sign'});
 kit.sign(enamel({jp:'蚊取線香',en:'mosquito coils',bg:'#2a6a4a',ink:'#f4e6b0'}),.7,1.05,S.maxX-3,1.7,S.minZ-.04,{ry:Math.PI,depth:.02,name:'enamel sign'});
 inspect(S.maxX-2.2,1.2,S.maxZ+1.2,'Look at the ice-cream mural','Blue Coral mural',
  'Painted straight onto the wall in 1981 and touched up every summer since by whoever has the paint. The pink scoop is guava. Thuan says the man who painted it still comes in for his cigarettes and complains that nobody has got the blue right.');
}

function dressWarehouse(kit,solid,{inspect}){
 // Its name on the street wall, big enough to read from the top of Main Street.
 const x=-10.52;
 kit.sign(fascia({jp:'港倉庫',en:'Minato harbour warehouse · stores & ice',bg:'#e9e4d6',accent:'#314d51',ink:'#1f3336'}),4.6,1,x+.04,3.9,-44.1,{ry:Math.PI/2,depth:.06,name:'warehouse sign'});
 kit.sign(enamel({jp:'漁協',en:'fisheries co-op',bg:'#1f5f94',ink:'#f4f0e4'}),.6,.9,x+.04,2,-40.2,{ry:Math.PI/2,depth:.02,name:'enamel sign'});
 // Floats in a net hung from the wall, and crates at its foot on the quay side.
 buoys(kit,x+.25,2.3,-45.9,{count:9,seed:4});
 kit.box(.05,1.2,1.2,x+.06,2.5,-45.9,0x2f5a4a,{finish:'thin'});
 solid(fishCrates(kit,-14.8,-49,{rows:1,cols:3,seed:12}));
}

function dressOffice(kit,solid,{inspect}){
 const x=9.1,z=-38.9;
 kit.cyl(.06,.09,7,x,3.5,z,0xf2f0ea,{segments:8});
 kit.box(.3,.2,.3,x,.1,z,0x8e979a);
 const flags=[[6.6,0],[5.2,1],[3.8,2]];
 for(const [y,seed] of flags){
  kit.rod([x,y,z],[x+1.9,y,z],.02,0xd0d4d6);
  kit.sign(catchFlag(seed),1.8,1.2,x+.98,y-.62,z,{depth:.015,both:true,name:'big-catch flag'});
 }
 solid({id:'office-flagpole',x,z,w:.4,d:.4,height:7});
 // A life ring by the door and the tide board beside it.
 kit.sign(poster({title:'潮汐表',lines:['TIDES · 潮','満潮 06:12  18:40','干潮 00:05  12:28','波 1.0m'],band:'#1f5f94'}),.8,1.1,11.2,1.6,-38.33,{depth:.03,name:'tide board'});
 inspect(11.2,1.2,-37.6,'Read the tide board','Tide board · 潮汐表',
  'Chalked up by the harbour master at six every morning: high water, low water, the swell, and underneath, in smaller writing, whether it is a good day for the reef. Today it says 良 — good.');
 inspect(x+1,1.4,z+.8,'Look at the big-catch flags','大漁旗 · Big-catch flags',
  'Tairyō-bata: the flags a boat flies coming home with a full hold, in colours you can see from the reef. The harbour office keeps three on its pole all year, which the skippers say is either optimism or tempting fate.');
}

function dressBookshop(kit,solid,{inspect}){
 // A cart of ¥100 paperbacks out on the pavement, under the eave.
 const x=-7.63,z=4.6;
 kit.box(.3,.08,1.3,x,.7,z,0x6b4a33);kit.box(.3,.5,.06,x,.95,z-.62,0x6b4a33);kit.box(.3,.5,.06,x,.95,z+.62,0x6b4a33);
 for(let i=0;i<9;i++)kit.box(.26,.2+(i%3)*.03,.1,x,.84,z-.52+i*.13,[0xb8432f,0x2f6fa8,0xe0c060,0x3f7f5a,0xd8cfb8][i%5]);
 for(const dz of [-.55,.55])kit.box(.06,.66,.06,x,.33,z+dz,0x4a3a2a);
 solid({id:'book-cart',x,z,w:.32,d:1.4,height:1});
 kit.sign(poster({title:'¥100',lines:['文庫本','PAPERBACKS'],band:'#8a3b2e'}),.34,.46,x+.17,1.35,z,{ry:Math.PI/2,depth:.02,name:'book cart card'});
 inspect(x+.9,1,z,'Browse the ¥100 cart','Front-Row ¥100 cart',
  'Paperbacks with their covers curled by the sea air: detective stories, a Ryūkyū cookery book, three copies of the same romance and a tide table from 1989. Aya puts it out at nine and brings it in when it rains, which is most afternoons in June.');
}
