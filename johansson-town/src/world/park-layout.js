import {PARK_HEIGHTS} from './park-height.js';
import {FULL_TOWN} from './full-town-state.js';
export const PARK={id:'harbour-park',x:15.8,z:-23.8,half:7.84,lift:1,scale:.56,surface:'stone'};
export const COMPACT_PARK={id:'harbour-park',x:14.2,z:-16.4,half:4.2,halfX:5.2,halfZ:4,lift:0,plaza:true,surface:'stone'};
export function activePark(){return FULL_TOWN.active?COMPACT_PARK:PARK;}
export function parkHeight(x,z){
 const p=activePark();
 if(p.plaza){
  if(Math.abs(x-p.x)<=(p.halfX||p.half)&&Math.abs(z-p.z)<=(p.halfZ||p.half))return 0;
  return null;
 }
 const s=p.scale||1,lx=(x-p.x)/s,lz=(z-p.z)/s;
 if(Math.abs(lx)>14+1e-7||Math.abs(lz)>14+1e-7)return null;
 const gx=Math.max(0,Math.min(56,(lx+14)*2)),gz=Math.max(0,Math.min(56,(lz+14)*2));
 if(gx<0||gz<0||gx>56||gz>56)return null;
 const ix=Math.min(55,Math.floor(gx)),iz=Math.min(55,Math.floor(gz)),u=gx-ix,v=gz-iz;
 const a=PARK_HEIGHTS[iz*57+ix]*(1-u)+PARK_HEIGHTS[iz*57+ix+1]*u,b=PARK_HEIGHTS[(iz+1)*57+ix]*(1-u)+PARK_HEIGHTS[(iz+1)*57+ix+1]*u;
 return p.lift+(a*(1-v)+b*v)*s;
}
export function parkApproachHeight(x,z){
 const p=activePark();if(p.plaza)return null;
 const edge=p.x-p.half,start=edge-2.8;
 const across=Math.abs(z-p.z);
 // Full height across the approach route itself, then faded out over the next metre
 // and a half. Ending the ramp at a hard edge left a 0.68m cliff where the apron ran
 // alongside it: one step sideways off the ramp and the ground dropped away.
 if(x<start||x>=edge||across>3)return null;
 const lateral=Math.min(1,Math.max(0,(3-across)/1.5));
 const target=parkHeight(edge,z);
 return target==null?0:((x-start)/(edge-start))*target*lateral;
}
export function parkBench(p=activePark()){
 if(p.plaza)return {position:[p.x,0,p.z+.35],eyeY:1.3,yaw:0,pitch:0,stand:[p.x,0,p.z+1.45]};
 const s=p.scale||1,bx=p.x+2.06*s,bz=p.z,h=parkHeight(bx,bz)??p.lift;
 return {position:[bx,h,bz],eyeY:p.lift+1.96*s+.75,yaw:1.1,pitch:0,stand:[p.x+.85*s,h,p.z]};
}
export const PARK_BENCH=parkBench(PARK);
