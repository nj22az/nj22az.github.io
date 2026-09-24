import {MAIN_ROAD} from '../main-road.js';
import {WEST_YARD} from '../west-yard.js';

/**
 * Where the new streets go, as plain numbers, so the walkable ground, the colliders, the
 * map and the buildings all read the same plan.
 *
 * The peninsula had one street, with buildings along one side of it, a walled gravel
 * yard behind them and a strip of bare ground between that wall and the sea that nobody
 * could reach. This fills it in the way an Okinawan harbour town is actually laid out:
 *
 *   Nishi-machi   the west quarter: lanes running down to a seawall walk, with red-tile
 *                 houses behind coral-stone walls, a concrete house with its water tank,
 *                 a net shed on the quay and the neighbourhood's sacred grove at the end.
 *   East row      the side of Main Street that was lawn becomes shop-houses, with a
 *                 lane between them up to Umi-no-yu.
 *   Yard row      two more shop-houses on the gap between the bookshop and the bus
 *                 station, so the west side runs unbroken to the terminus.
 */

export const NISHI=Object.freeze({
 id:'nishi-machi',surface:'stone',
 /** The quarter, from the seawall to the yard wall. */
 minX:-39.2,maxX:WEST_YARD.minX,minZ:-49.5,maxZ:29.3,
 /** The seawall along the shore, and the walk behind it. */
 seawall:Object.freeze({x:-39.55,thickness:.6,height:.95}),
 promenade:Object.freeze({minX:-39.2,maxX:-36.4}),
 /** The concrete apron that runs on from the quay, round to the second pier. */
 quay:Object.freeze({minX:-39.2,maxX:-19,minZ:-49.5,maxZ:-38.6}),
 /** Lanes from the seawall walk to the yard, each through a gap in the yard wall. */
 lanes:Object.freeze(WEST_YARD.lanes.map(z=>Object.freeze({z,half:WEST_YARD.laneHalf}))),
 /** The plots between the lanes, from the walk to the yard wall. */
 plots:Object.freeze([
  {id:'net-shed',kind:'shed',minZ:-37.8,maxZ:-29.3},
  {id:'higa',kind:'red-tile',family:'比嘉',romaji:'Higa',minZ:-25.7,maxZ:-14.8,gate:'south'},
  {id:'kinjo',kind:'concrete',family:'金城',romaji:'Kinjō',minZ:-11.2,maxZ:-.2,gate:'north'},
  {id:'oshiro',kind:'red-tile',family:'大城',romaji:'Ōshiro',minZ:3.3,maxZ:14.2,gate:'south'},
  {id:'utaki',kind:'grove',minZ:17.8,maxZ:28.8},
 ].map(p=>Object.freeze({...p,minX:-36.1,maxX:-25.6}))),
});

/** Shop-houses along the east kerb of Main Street, facing the road (-x). */
export const EAST_ROW=Object.freeze({
 minX:MAIN_ROAD.pavementEast+.5,maxX:MAIN_ROAD.pavementEast+8.2,
 /** The lane between them that leads up to Umi-no-yu's door. */
 onsenLane:Object.freeze({minZ:-1,maxZ:5.9}),
 plots:Object.freeze([
  {id:'nakamura',minZ:-14.2,maxZ:-7.6,colour:0xe9dfc4,trim:0x3f7f86},
  {id:'shimabukuro',minZ:-7,maxZ:-1,colour:0xd6e2dc,trim:0x2f5f8e},
  {id:'higa-saketen',minZ:5.9,maxZ:11.6,colour:0xecd2c6,trim:0x8a3b2e},
  // Stops short of the alley at z 18.4, which is the way through to the school gate.
  {id:'arakaki',minZ:12.1,maxZ:16.8,colour:0xdfe3e6,trim:0x2d6f63},
 ].map(Object.freeze)),
});

/** Two shop-houses on the west kerb, between the bookshop and the bus station, facing +x. */
export const YARD_ROW=Object.freeze({
 minX:-15.8,maxX:MAIN_ROAD.pavementWest-.45,
 plots:Object.freeze([
  {id:'yonamine',minZ:7.2,maxZ:13.3,colour:0xeee2b8,trim:0x9a4a2a},
  {id:'coin-laundry',minZ:13.9,maxZ:20,colour:0xd9e4ea,trim:0x3a6a9a},
 ].map(Object.freeze)),
});

/**
 * The quay east of the harbour office, which was bare ground: the fish auction shed and
 * the ice plant, with the boats lying to the quay edge in front of them.
 */
export const EAST_QUAY=Object.freeze({
 id:'east-quay',surface:'stone',
 minX:19,maxX:37.4,minZ:-49.6,maxZ:-38.9,
 shed:Object.freeze({minX:20.8,maxX:29.2,minZ:-48.2,maxZ:-40.6,height:4.4}),
 ice:Object.freeze({minX:30.6,maxX:36.2,minZ:-46.4,maxZ:-40.4,height:7.2}),
});
export const eastQuayAt=(x,z,r=0)=>x>=EAST_QUAY.minX-1+r&&x<=EAST_QUAY.maxX-r&&z>=EAST_QUAY.minZ+r&&z<=EAST_QUAY.maxZ-r;

/**
 * Houses on the lawn behind the east row, either side of Umi-no-yu, reached by the back
 * lane that runs behind the shops.
 */
export const EAST_BACK=Object.freeze({
 lane:Object.freeze({minX:EAST_ROW.maxX,maxX:EAST_ROW.maxX+2.6}),
 plots:Object.freeze([
  // Gates on the green in front of Umi-no-yu, with the houses backed onto the trees.
  {id:'nakasone',kind:'red-tile',family:'仲宗根',romaji:'Nakasone',minX:16.2,maxX:24.6,minZ:10.4,maxZ:21.6,gate:'south'},
  {id:'miyagi',kind:'red-tile',family:'宮城',romaji:'Miyagi',minX:25.4,maxX:32.9,minZ:10.4,maxZ:21.6,gate:'south'},
  {id:'tamaki',kind:'concrete',family:'玉城',romaji:'Tamaki',minX:16.2,maxX:24.2,minZ:-14.4,maxZ:-3.6,gate:'north'},
  // Between the park and the seawall, its gate on the garden with the pond.
  {id:'kamiya',kind:'red-tile',family:'神谷',romaji:'Kamiya',minX:24.8,maxX:32.9,minZ:-30.8,maxZ:-19.6,gate:'north'},
 ].map(Object.freeze)),
});

/**
 * Whether a circle of radius r stands in Nishi-machi: the seawall walk, the lanes, the
 * yards and the quay apron. What stands in them -- houses, walls, trees -- is solid
 * through the collider list, like everything else in the town.
 */
export function nishiAt(x,z,r=0){
 const q=NISHI.quay;
 if(x>=q.minX+r&&x<=q.maxX-r&&z>=q.minZ+r&&z<=q.maxZ+.6-r)return true;
 return x>=NISHI.minX+r&&x<=NISHI.maxX-r&&z>=NISHI.minZ+r&&z<=NISHI.maxZ-r;
}

/** Where the yard wall is broken for each lane, as [minZ,maxZ] openings. */
export function yardWallGaps(){
 return NISHI.lanes.map(l=>[l.z-l.half,l.z+l.half]);
}

/**
 * What the map draws for these streets: walks and lanes as paving, plots as yards, and
 * the buildings on them as blocks. Rectangles, [minX,maxX,minZ,maxZ].
 */
export function mapPlan(){
 const walks=[[NISHI.promenade.minX,NISHI.promenade.maxX,NISHI.minZ,NISHI.maxZ],[NISHI.quay.minX,NISHI.quay.maxX,NISHI.quay.minZ,NISHI.quay.maxZ],
  ...NISHI.lanes.map(l=>[NISHI.promenade.maxX,WEST_YARD.minX,l.z-l.half,l.z+l.half]),
  [EAST_QUAY.minX,EAST_QUAY.maxX,EAST_QUAY.minZ,EAST_QUAY.maxZ],
  [EAST_BACK.lane.minX,EAST_BACK.lane.maxX,EAST_ROW.plots[0].minZ,EAST_ROW.plots[3].maxZ+2.4],
  [MAIN_ROAD.pavementEast,EAST_ROW.maxX+.5,EAST_ROW.onsenLane.minZ,EAST_ROW.onsenLane.maxZ]];
 const yards=[...NISHI.plots,...EAST_BACK.plots].map(p=>[p.minX,p.maxX,p.minZ,p.maxZ]);
 const buildings=[...EAST_ROW.plots.map(p=>[EAST_ROW.minX,EAST_ROW.maxX,p.minZ,p.maxZ]),...YARD_ROW.plots.map(p=>[YARD_ROW.minX,YARD_ROW.maxX,p.minZ,p.maxZ]),
  [EAST_QUAY.shed.minX,EAST_QUAY.shed.maxX,EAST_QUAY.shed.minZ,EAST_QUAY.shed.maxZ],[EAST_QUAY.ice.minX,EAST_QUAY.ice.maxX,EAST_QUAY.ice.minZ,EAST_QUAY.ice.maxZ],
  [GOYA.minX,GOYA.maxX,GOYA.minZ,GOYA.maxZ],
  ...[...NISHI.plots,...EAST_BACK.plots].filter(p=>p.kind!=='grove').map(p=>{const cx=(p.minX+p.maxX)/2,cz=(p.minZ+p.maxZ)/2;return [cx-3.3,cx+3.3,cz-2.8,cz+2.8];})];
 const labels=[['NISHI-MACHI',-38.5,-8],['FISH AUCTION',20.5,-44],['UTAKI',-33,23],['GATEBALL',21,-34]];
 walks.push([GATEBALL.minX,GATEBALL.maxX,GATEBALL.minZ,GATEBALL.maxZ]);
 return {walks,yards,buildings,labels};
}

/** The gateball court on the lawn by the seawall, and the goya garden in the west yard. */
export const GATEBALL=Object.freeze({minX:20,maxX:31.4,minZ:-37.5,maxZ:-32.2});
export const GOYA=Object.freeze({minX:-23.4,maxX:-17.4,minZ:-11.4,maxZ:-4.2});
