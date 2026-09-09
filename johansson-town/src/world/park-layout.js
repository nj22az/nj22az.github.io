import {PARK_HEIGHTS} from './park-height.js';
import {FULL_TOWN} from './full-town-state.js';
export const PARK={id:'harbour-park',x:35,z:-38,half:14,lift:2,scale:1,surface:'stone'};
export const COMPACT_PARK={id:'harbour-park',x:14.2,z:-16.4,half:4.2,halfX:5.2,halfZ:4,lift:0,plaza:true,surface:'stone'};
export function activePark(){return FULL_TOWN.active?COMPACT_PARK:PARK;}
export function parkHeight(x,z){
 const p=activePark();
 if(p.plaza){
  if(Math.abs(x-p.x)<=(p.halfX||p.half)&&Math.abs(z-p.z)<=(p.halfZ||p.half))return 0;
  return null;
 }
 const s=p.scale||1,lx=(x-p.x)/s,lz=(z-p.z)/s;
 if(Math.abs(lx)>14||Math.abs(lz)>14)return null;
 const gx=(lx+14)*2,gz=(lz+14)*2;
 if(gx<0||gz<0||gx>56||gz>56)return null;
 const ix=Math.min(55,Math.floor(gx)),iz=Math.min(55,Math.floor(gz)),u=gx-ix,v=gz-iz;
 const a=PARK_HEIGHTS[iz*57+ix]*(1-u)+PARK_HEIGHTS[iz*57+ix+1]*u,b=PARK_HEIGHTS[(iz+1)*57+ix]*(1-u)+PARK_HEIGHTS[(iz+1)*57+ix+1]*u;
 return p.lift+a*(1-v)+b*v;
}
export function parkBench(p=activePark()){
 if(p.plaza)return {position:[p.x,0,p.z+.35],eyeY:1.3,yaw:0,pitch:0,stand:[p.x,0,p.z+1.45]};
 const s=p.scale||1,bx=p.x+2.06*s,bz=p.z,h=parkHeight(bx,bz)??p.lift;
 if(s===1)return PARK_BENCH;
 return {position:[bx,h,bz],eyeY:h+.75,yaw:0,pitch:0,stand:[p.x+.85*s,h,p.z]};
}
export const PARK_BENCH={position:[37.06,parkHeight(37.06,-38),-38],eyeY:2+1.96+.75,yaw:1.1,pitch:0,stand:[35.7,parkHeight(35.7,-38),-38]};
