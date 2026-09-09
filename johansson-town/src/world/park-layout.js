import {PARK_HEIGHTS} from './park-height.js';
export const PARK={id:'harbour-park',x:35,z:-38,half:14,lift:2,surface:'stone'};
export function parkHeight(x,z){
 const gx=(x-PARK.x+14)*2,gz=(z-PARK.z+14)*2;
 if(gx<0||gz<0||gx>56||gz>56)return null;
 const ix=Math.min(55,Math.floor(gx)),iz=Math.min(55,Math.floor(gz)),u=gx-ix,v=gz-iz;
 const a=PARK_HEIGHTS[iz*57+ix]*(1-u)+PARK_HEIGHTS[iz*57+ix+1]*u,b=PARK_HEIGHTS[(iz+1)*57+ix]*(1-u)+PARK_HEIGHTS[(iz+1)*57+ix+1]*u;
 return PARK.lift+a*(1-v)+b*v;
}
export const PARK_BENCH={position:[37.06,parkHeight(37.06,-38),-38],eyeY:2+1.96+.75,yaw:1.1,pitch:0,stand:[35.7,parkHeight(35.7,-38),-38]};
