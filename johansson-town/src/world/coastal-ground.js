import {COASTLINE} from './peninsula.js';
import {headlandHeight} from './coyote-tunnel.js';
import {BEACH,beachHeight,beachAccessHeight} from './beach-layout.js';
export const PENINSULA_GROUND_Y=-.4;
/** Interior of the actual rendered land polygon, including its slanted coast. */
export function onPeninsulaLand(x,z){
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
 const land=onPeninsulaLand(x,z),hill=headlandHeight(x,z);
 if(hill!==null&&hill> (land?PENINSULA_GROUND_Y:BEACH.waterY+.025))return {id:'minato-headland',surface:'grass',y:hill};
 return land?{id:'peninsula-ground',surface:'grass',y:PENINSULA_GROUND_Y}:null;
}
