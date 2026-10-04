import {createKit} from './okinawa/kit.js';
import {utilityPole,wiresBetween} from './okinawa/props.js';
import {japaneseSign,signText} from './okinawa/signs.js';
import {buildFlowerShop} from './flower-shop.js';
import {buildBlueCoralShop} from './blue-coral-shop.js';
import {paintedAsphalt,paintedPaving,paintedConcrete} from '../render/toy-surfaces.js';
import {GROUND_LAYER} from './ground-layers.js';
import {SHOPPING_LANE,SHOPPING_LANE_SCALE,SHOPPING_LANE_ROWS,shoppingLanePoint,placeShoppingLaneGroup,placeShoppingLaneColliders} from './shopping-lane-plan.js';
import * as THREE from '../../vendor/three.module.js';
/** A freely walkable street composition inspired by the user's rainy shopping-lane reference. */
export function buildShoppingLane({world,register,onAction}){
 const group=new THREE.Group();group.name='Rainflower shopping lane';world.group.add(group);const colliderStart=world.colliders.length;
 const mats=new Map(),mat=(c,roughness=.9)=>{const key=c+':'+roughness;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color:c,roughness}));return mats.get(key);};
 const box=(name,size,pos,c,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));m.name=name;m.position.set(...pos);group.add(m);if(solid)world.colliders.push({id:name,x:pos[0],z:pos[2],w:size[0],d:size[2],height:pos[1]+size[1]/2});return m;};
 const sign=(title,x,y,z,w=5)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e1d5b8';ctx.fillRect(0,0,512,128);ctx.fillStyle='#355947';ctx.font='bold 36px sans-serif';ctx.textAlign='center';signText(ctx,japaneseSign(title),256,53,476,42);ctx.font='bold 17px sans-serif';signText(ctx,title,256,101,476,17);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,1),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=x<90?Math.PI/2:-Math.PI/2;group.add(m);};
 const anchor=(x,z,label,kind,title,data)=>{const a=new THREE.Object3D();a.position.set(x,1,z);group.add(a);register(a,label,()=>onAction(kind,title,data));};
 const roadwayY=GROUND_LAYER.apron+GROUND_LAYER.grass,sidewalkY=roadwayY+GROUND_LAYER.grass;
 const laneEnd=113+(SHOPPING_LANE.maxZ-SHOPPING_LANE.z)/SHOPPING_LANE_SCALE,laneDepth=laneEnd-94,laneMiddle=(94+laneEnd)/2;
 const pavement=box('Rainflower worn stone roadway',[12,.08,laneDepth],[90,roadwayY-.04,laneMiddle],0x777d79);pavement.material=mat(0x777d79,.87);const asphalt=paintedAsphalt().clone();asphalt.repeat.set(3,10);asphalt.needsUpdate=true;pavement.material.map=asphalt;
 for(const x of [84.6,95.4]){const walk=box('Lane stone pavement',[1.2,.08,laneDepth],[x,sidewalkY-.04,laneMiddle],0xc1bdad);walk.material=mat(0xc1bdad);const paving=paintedPaving().clone();paving.repeat.set(1,13);paving.needsUpdate=true;walk.material.map=paving;}
 // Open both kerbs at the two cross streets, and the shop side at each entrance.
 const crossings=[105.5,118.5];
 for(const x of [84.7,95.3]){
  const openings=[...crossings.map(z=>[z-1.9,z+1.9]),...(x>90?SHOPPING_LANE_ROWS.map(z=>[z-2,z+2]):[])].sort((a,b)=>a[0]-b[0]);
  // These low kerbs are steps, resolved by the drawn walking height. A wall
  // collider blocks the body before its feet can reach the four-centimetre rise.
  let from=94;for(const [a,b] of [...openings,[laneEnd,laneEnd]]){if(a>from)box('Shopping lane curb',[.3,.12,a-from],[x,.06,(from+a)/2],0xaaa89a);from=Math.max(from,b);}
  for(let z=95;z<laneEnd;z+=1.3)if(!openings.some(([a,b])=>z>=a&&z<=b))box('Individual stone curb joints',[.32,.015,.04],[x,.128,z],0x686e68);
 }
 // Four shops and two houses. The lane had a travel agent and a grocer too, but the Port
 // Terminal sells the tickets and Sakura the groceries; their buildings are homes now.
 const lots=[{title:'Lane house',home:true},{title:'Rainflower Florist',own:true},{title:'Lane house',home:true},{title:'Town Tailor'},{title:'Secondhand Records'},{title:'Blue Coral Ice Cream',own:true}];
 lots.forEach((lot,i)=>{const left=i%2===0,x=left?80.7:99.3,z=SHOPPING_LANE_ROWS[Math.floor(i/2)],h=6.2+(i%3)*.7,edge=left?84.25:95.75,side=left?1:-1;
  if(!lot.own){box(lot.title+' weathered shop-house',[7,h,8.5],[x,h/2,z],[0x9b9481,0xb4b19e,0x8d9996][i%3],true).material.map=paintedConcrete();
   for(const dz of [-2.2,2.2]){box('Upper floor window',[.08,1.4,1.7],[x+side*3.54,h-1.7,z+dz],0x536c71);box('Weathered window railing',[.35,.6,1.9],[x+side*3.7,h-2,z+dz],0x64685f);}}
  box('Shop-house flat roof',[7.6,.3,9],[x,lot.own?3.15:h+.15,z],0x56665e);
  if(lot.home){
   // A house front: a timber door, a window with its grille, a potted plant and a post box.
   box('Lane house door',[.08,2.05,1],[edge,1.03,z-1.6],0x6b4f37);box('Lane house window',[.06,1.2,2],[edge,1.6,z+1.2],0x536c71);
   for(let k=0;k<5;k++)box('Window grille',[.05,1.2,.04],[edge-side*.03,1.6,z+.3+k*.45],0x8e979a);
   box('Post box',[.12,.3,.36],[edge-side*.08,1.2,z-.6],0xc8392e);box('Plant pot',[.4,.4,.4],[edge-side*.4,.2,z-2.6],0xb95c3c);
   anchor(left?86:93.8,z,'Read the house nameplate','read','A Rainflower Lane house','The front room was a shop once; the family took the counter out and put the sofa where it stood. The name on the post box has rubbed off in the rain.');
   return;
  }
  box('Shop canopy',[2,.18,7.5],[left?84.8:95.2,2.75,z],i===1?0x3d8463:0x636f6c);
  if(!lot.own)box('Shopfront shutter',[.08,2,5.8],[edge,1.05,z],0x687b72);
  if(i!==1)sign(lot.title,edge+(left?.05:-.05),3.5,z,6);
  anchor(left?87:92.8,z,'Visit '+lot.title,i===1?'rainflower-shop':'read',lot.title,i===1?{item:'Rainflower bouquet',price:250}:lot.title+' is a family shop on Rainflower Lane. The local noticeboard keeps opening times and neighbourhood news.');
 });
 for(const [x,z] of [[94.2,96.5],[94.2,101.5],[94.2,102.5]]){box('Flower display bucket',[.6,.6,.6],[x,.3,z],0x726c52,true);for(let i=0;i<5;i++){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.65,5),mat(0x477052));stem.position.set(x+(i%3-1)*.12,.8,z+(Math.floor(i/3)-.5)*.18);group.add(stem);const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.14,0),mat([0xe8c55a,0xd98fa3,0xf2e5c1][i%3]));f.position.copy(stem.position);f.position.y=1.12;group.add(f);}}
 box('Red drinks vending machine',[.8,1.9,1.1],[85.8,.95,112.8],0x963c39,true);box('Vending machine selection panel',[.04,1,.85],[86.23,1.25,112.8],0xd4d6c7);anchor(87,112.8,'Buy a cold drink on Rainflower Lane','rainflower-shop','Lane drinks machine',{item:'Cold island soda',price:100});
 sign('RAINFLOWER LANE',84.35,2,95,5);
 anchor(88,96,'Read the Rainflower Lane guide','read','Rainflower Lane','A neighbourhood shopping street between Main Street, Aoba Garden and Kitahama. The two cross streets lead toward the garden; the north walk joins the residential lane. Browse the flower stand, walk into Blue Coral for an island ice cream and buy a cold drink. Rain darkens the paving; overhead wires lead toward the old upper floor windows.');
 anchor(94,110,'Choose Thuan’s alternative outfit','thuan-wardrobe');
 const florist=buildFlowerShop({world,group,register,onAction,authored:true});
 const blueCoral=buildBlueCoralShop({world,group,register,onAction,authored:true});
 placeShoppingLaneGroup(group);placeShoppingLaneColliders(world.colliders,colliderStart);
 // Deferred pole planning consumes world coordinates. Draw this feeder in the town
 // frame, after the shop group is placed, so its nodes and cables move with the lane.
 {const kit=createKit(),poles=[];for(const authored of [[85.25,95],[94.75,128]]){const [x,z]=shoppingLanePoint(...authored),p=utilityPole(kit,x,z,{h:10,transformer:true});world.colliders.push(p.collider);poles.push(p);}wiresBetween(kit,poles[0],poles[1],{sag:.55});kit.finish(world.group,'Rainflower electrical feeder');}
 let wet=false;
 return {group,update(rain,minutes=720){if(typeof rain==='boolean')wet=rain;florist.update(minutes);blueCoral.update();pavement.material.roughness=wet?.22:.87;pavement.material.color.set(wet?0x626d70:0x777d79);}};
}
