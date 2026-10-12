import * as THREE from '../../vendor/three.module.js';
import {createKit,paint} from './okinawa/kit.js';
import {redTileHouse,concreteHouse,coralWall,blockWall,shisa,hinpun,fukugi,hibiscus,potPlant,banana,gajumaru} from './okinawa/houses.js';
import {bicycle,laundry,planterBoxes} from './okinawa/props.js';
import {AIRPORT_ISLAND} from './airport-island.js';
import {airportWorld,airportSurface} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';
import {KITANO_HAMLET,hamletGate} from './kitano-hamlet-layout.js';
import {householdAtHome,residentsLine} from '../people/island-households.js';

/**
 * Kitano hamlet, built on the island's group in its own frame (batch 7a; docs/KITANO-JIMA.md): the lane's crushed coral,
 * each plot's slab and walls, its gate with the shisa and the nameplate, and the house at the back: Johansson's red-tile
 * house (his rooms inside are the mayor's home, interiors/town-hall.js, so his futon, post and television come with him),
 * Jun's concrete house, and the red-tile house to let. The walls' and houses' colliders are turned into the world with
 * the island. Each gate is a site, entered the way Kitahama's are (island-homes.js).
 */
const SAND=0xe6dcc3,CORAL_SAND=0xefe6d2;
export function buildKitanoHamlet(world,options){
 const island=world.airportIsland?.group;if(!island)return null;
 const H=KITANO_HAMLET,kit=createKit({shadows:options.shadows}),A=AIRPORT_ISLAND;
 const colliders=[];
 /** A collider from the kit (island frame) into the world: turned with the island, lifted to the sea's level. */
 const solid=list=>{for(const c of [].concat(list)){if(!c)continue;const [x,z]=airportWorld(c.x,c.z);colliders.push({...c,x,z,yaw:(c.yaw??0)+A.yaw,minY:SEA_LEVEL+(c.minY??0)});}};
 // The lane: crushed coral between the row and Johansson's plot.
 kit.block(H.lane.minX,H.lane.maxX,.6,H.laneTop,H.lane.minZ,H.lane.maxZ,CORAL_SAND);
 const nameplate=(family,romaji)=>paint(256,128,(c,w,h)=>{c.fillStyle='#f3efe4';c.fillRect(0,0,w,h);c.strokeStyle='#5a4a3a';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12);
  c.fillStyle='#2b2b2b';c.textAlign='center';c.textBaseline='middle';c.font='bold 54px "Hiragino Mincho ProN","Noto Serif JP",serif';c.fillText(family,w/2,h*.4);
  c.font='26px sans-serif';c.fillText(romaji,w/2,h*.78);});
 for(const [i,p] of H.plots.entries()){
  const W=p.maxX-p.minX,D=p.maxZ-p.minZ,hw=W/2,hd=D/2,ry=p.gate==='north'?0:Math.PI,seed=30+i;
  const household=householdAtHome(p.id),toLet=!household;
  // The yard's slab, then everything else in the plot's frame on top of it, the gate at local +z.
  kit.block(p.minX,p.maxX,.6,H.yardTop,p.minZ,p.maxZ,SAND);
  kit.at((p.minX+p.maxX)/2,(p.minZ+p.maxZ)/2,ry,()=>{
   const gate=[-.95,.95],wall=p.wall==='block'?(x0,z0,x1,z1,o)=>blockWall(kit,x0,z0,x1,z1,o):(x0,z0,x1,z1,o)=>coralWall(kit,x0,z0,x1,z1,o);
   solid(wall(-hw,hd,hw,hd,{gaps:[gate],seed:50+seed,flowers:i%2===0}));
   solid(wall(-hw,-hd,hw,-hd,{seed:60+seed}));
   solid(wall(-hw,-hd,-hw,hd,{seed:70+seed}));
   solid(wall(hw,-hd,hw,hd,{seed:80+seed}));
   for(const gx of gate)shisa(kit,gx,1.53,hd,0,.7);
   kit.sign(nameplate(p.family,p.romaji),.42,.21,gate[1]+.45,1.05,hd+.24,{name:'nameplate '+p.id});
   hibiscus(kit,gate[0]-1.1,hd-.9,{seed:90+seed});
   if(p.kind==='red-tile'){
    solid(hinpun(kit,0,hd-2,2.6));
    const d=6.2,w=7.4,houseZ=-hd+.3+d/2;
    kit.at(0,houseZ,0,()=>solid(redTileHouse(kit,{w,d,seed})));
    for(let z=-hd+1.2;z<hd-.8;z+=2.2)if(Math.abs(z)>1)solid(fukugi(kit,-(hw-.5),z,{h:5.2+(i%3)*.5,seed:100+seed*10+Math.round(z*3)}));
    banana(kit,hw-.9,-hd+.9,{seed});
    potPlant(kit,1.6,hd-2.2,{seed});potPlant(kit,-1.8,hd-2.3,{seed:seed+3});
    solid(planterBoxes(kit,2.2,hd-.65,{count:3,seed}));
    if(p.id==='kitano-1'){gajumaru(kit,hw-1.6,hd-2.6,{seed:seed+7,size:.8});bicycle(kit,-2.6,hd-1.3,{ry:.3,colour:0x2f6f74});}
   }else{
    const d=6.2,w=6.8,houseZ=-hd+.35+d/2,houseX=-hw+.35+w/2;
    kit.at(houseX,houseZ,0,()=>solid(concreteHouse(kit,{w,d,seed})));
    solid(laundry(kit,1.7,hd-1.7,{length:2.2}));
    potPlant(kit,1.5,hd-1,{seed:seed+5});hibiscus(kit,hw-1,hd-1,{seed:seed+9,flower:0xe8b12c});
    bicycle(kit,2.2,hd-1.2,{ry:.2,colour:0xb03a3a});
   }
  },H.yardTop);
  // The gate as a site: Johansson's is the mayor's home (its rooms come with him); the others are family homes.
  const {door,inward}=hamletGate(p),[wx,wz]=airportWorld(door[0],door[1]),y=airportSurface(wx,wz)?.y??SEA_LEVEL+H.laneTop,facing=inward+A.yaw;
  const title=p.id==='kitano-1'?'Johansson & Thuan’s House':toLet?'House to let':household.members.map(m=>m.name).join(' & ')+'’s home';
  const site={id:p.id==='kitano-1'?'mayor-home':'home-'+p.id,title,jp:p.family,sub:'KITANO-JIMA',color:0xd4c6ad,accent:'#776953',
   line:household?.address||'Kitano hamlet, by the pier',door:[wx,y,wz],exitPosition:[wx,y,wz],approachPosition:[wx,y,wz],entryFacing:facing,x:wx,z:wz,opens:'00:00',plot:p.id};
  if(p.id!=='kitano-1')Object.assign(site,{familyHome:household||{members:[],toLet:true},houseKind:p.kind,ownRoom:true});
  options.sites.push(site);
  const anchor=new THREE.Object3D();anchor.name='kitano gate:'+p.id;anchor.position.set(wx,y+1.3,wz);world.group.add(anchor);
  options.register?.(anchor,p.id==='kitano-1'?'Go home':(toLet?'Look round the ':'Visit ')+title,()=>options.enter(site));
  const plate=new THREE.Object3D();plate.name='kitano nameplate:'+p.id;const [px,pz]=airportWorld(door[0]+(p.gate==='north'?1.3:-1.3),door[1]-(p.gate==='north'?.4:-.4));plate.position.set(px,y+1,pz);world.group.add(plate);
  options.register?.(plate,`Read the ${p.romaji} nameplate`,()=>options.onAction?.('read',`${p.family} · the ${p.romaji} house`,[KITANO_PLATES[p.id],residentsLine(p.id)].filter(Boolean).join('\n\n')));
 }
 // Its own group under the island's: the kit's finish writes walk levels and a power network on the group it is
 // given, and the island's group must not carry those (the town's power lines and the walk surface read them).
 const hamlet=new THREE.Group();hamlet.name='Kitano hamlet';island.add(hamlet);
 kit.finish(hamlet,'Kitano hamlet');
 // The houses' service drops are in the island's frame, and Minato's power station does not reach across the strait:
 // the hamlet has no town power network (Kitano-jima's own supply is an open item, docs/KITANO-JIMA.md).
 delete hamlet.userData.powerNetwork;delete hamlet.userData.walkLevels;
 world.colliders.push(...colliders);
 return {colliders};
}
const KITANO_PLATES=Object.freeze({
 'kitano-1':'Johansson and Thuan’s house: the red-tile house at the end of the lane, its back to the sea and its front to the pier, so he hears the Minato Maru’s whistle before he sees her. He moved out here from his rooms in the town hall’s east wing; the office is still in Minato, a crossing away, and the futon, the television and the letter box came with him. Thuan, his wife, keeps Sakura Shōten in town on weekdays from her room at 1 Kitahama and comes home on the Friday boat; her futon lies beside his.',
 'kitano-2':'The Shiroma house: Jun, who checks the commuter tickets at the terminal and takes the ferry’s lines at the pier. Concrete, after the typhoon of 1987 took the roof off the old one; the bicycle is his way to work, ninety seconds along the lane.',
 'kitano-3':'The Chinen house: Tetsuo, the radio repairer, who took it when the Nakamas moved to their daughter’s in Naha. Two rooms and a verandah, the hinpun in the yard, and a short-wave aerial on the ridge he put up the first week; his radio test is at the airport, and the morning boat takes him to the workshop in Minato.',
});
