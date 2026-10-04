import {inShoppingLane} from './shopping-lane-plan.js';
import {inGarden,gardenHeight,gardenPondAt,gardenGroundHeight,GARDEN} from './garden-layout.js';
import {islandTerrainHeight,islandRouteAt} from './island-plan.js';
import {COASTLINE} from './island-coast.js';
import {headlandHeight} from './coyote-tunnel.js';
import {BEACH,beachHeight,beachAccessHeight} from './beach-layout.js';
export const ISLAND_GROUND_Y=-.4;
/** Interior of the actual rendered land polygon, including its slanted coast. */
export function onIslandLand(x,z){
 let inside=false;
 for(let i=0,j=COASTLINE.length-1;i<COASTLINE.length;j=i++){
  const [ax,az]=COASTLINE[i],[bx,bz]=COASTLINE[j];
  if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
 }
 return inside;
}
/** Surface beyond the authored streets. Water remains outside the playable union. */
export function coastalSurface(x,z){
 const ramp=beachAccessHeight(x,z);
 if(ramp!==null)return {id:'beach-access',surface:'stone',y:ramp};
 const sand=beachHeight(x,z);
 if(sand!==null&&sand>=BEACH.waterY+.025)return {id:BEACH.id,surface:BEACH.surface,y:sand};
 if(inGarden(x,z)){const y=gardenHeight(x,z);if(gardenPondAt(x,z)&&y<0)return null;return {id:'aoba-garden',surface:Math.abs(z-GARDEN.pond.z)<=.69?'wood':'grass',y};}
 if(inShoppingLane(x,z))return {id:'rainflower-lane',surface:'asphalt',y:0};
 const park= gardenGroundHeight(x,z);
 if(park!=null)return {id:'garden-approach',surface:islandRouteAt(x,z)?.surface||'grass',y:park};
 const land=onIslandLand(x,z),hill=headlandHeight(x,z);
 if(hill!==null&&hill> (land?ISLAND_GROUND_Y:BEACH.waterY+.025))return {id:'minato-headland',surface:'grass',y:hill};

 if(land&&z>=97){const route=islandRouteAt(x,z);return {id:route?.id||'island-uplands',surface:route?.surface||'grass',y:islandTerrainHeight(x,z)??ISLAND_GROUND_Y};}
 return land?{id:'island-ground',surface:'grass',y:ISLAND_GROUND_Y}:null;
}
