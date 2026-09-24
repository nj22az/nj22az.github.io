import {PARK_HEIGHTS} from './park-height.js';
import {FULL_TOWN} from './full-town-state.js';
/**
 * What the supplied park's ground textures are multiplied by.
 *
 * They are bright spring greens and near-white paving, and the town's sun, its 1.75
 * fill and the grade's exposure together push them past white: the mound came out as
 * a cream dome with the paths lost in it. Bringing the materials' own colour down puts
 * the textures back inside the range the ramp can band. The lawn outside the park uses
 * the same green, so the two are one field.
 */
export const TURF_TINT=0x93a878,PARK_PATH_TINT=0xa19c8b;
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
/**
 * How far the mound's foot is graded out into the ground around it.
 *
 * The park was modelled as a plinth: a heightfield with a vertical face all round, so
 * from the lawn it was a 0.65m step on one side and a 1.4m wall on another, and the
 * only way up was the one authored ramp. The skirt grades the edge height down to the
 * surrounding ground over this distance, so the mound can be walked up from anywhere.
 */
export const PARK_SKIRT=4.5;
/**
 * Except toward the town, where the pavement's east kerb is only 2.76m from the
 * square: run the skirt under an authored paved route and it lifts the player off
 * the paving. The mound's low side faces that way, so the short skirt is the gentle
 * one anyway.
 */
export const PARK_SKIRT_WEST=2.7;
/**
 * The graded ground just outside the park square. It meets parkHeight exactly at the
 * square's edge, so the two together are one continuous surface.
 */
export function parkSkirtHeight(x,z){
 const p=activePark();if(p.plaza)return null;
 const ex=Math.min(Math.max(x,p.x-p.half),p.x+p.half),ez=Math.min(Math.max(z,p.z-p.half),p.z+p.half);
 const d=Math.hypot(x-ex,z-ez);
 if(d<=0)return null;
 // The reach turns with the outward direction rather than switching at the face, or
 // the skirt would step by its own width along the corner where the rule flipped.
 const west=d?Math.max(0,(ex-x)/d):0;
 const reach=PARK_SKIRT+(PARK_SKIRT_WEST-PARK_SKIRT)*west;
 if(d>=reach)return null;
 const edge=parkHeight(ex,ez);
 return edge===null?null:edge*(1-d/reach);
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
 if(target==null)return 0;
 // Fade out into the skirt rather than to nothing. Fading to zero was right while the
 // ground around the mound was flat; now that the skirt grades the whole foot, fading
 // to zero put a step back beside the ramp it was added to remove.
 const base=parkSkirtHeight(x,z)??0;
 return base+(((x-start)/(edge-start))*target-base)*lateral;
}
/**
 * The park model is laid out at 0.56 scale, which left its bench with a seat 21 cm off the
 * ground: anyone sitting on it had their feet through the path. The bench alone is scaled
 * back up about its own foot (model units) so the seat stands at a real 42 cm.
 */
export const PARK_BENCH_FIT=Object.freeze({x:2.12,y:1.58,z:0,scale:2,seat:1.96,top:2.51,width:.94,length:1.86});
/** A park-model point on the bench, after the bench has been scaled up. */
export const benchPoint=(x,y,z)=>{const f=PARK_BENCH_FIT;return [f.x+(x-f.x)*f.scale,f.y+(y-f.y)*f.scale,f.z+(z-f.z)*f.scale];};
export function parkBench(p=activePark()){
 if(p.plaza)return {position:[p.x,0,p.z+.35],eyeY:1.3,yaw:0,pitch:0,stand:[p.x,0,p.z+1.45]};
 // The seat point is on the same slat as before the scaling; the stand is clear of the bigger frame.
 const s=p.scale||1,bx=p.x+benchPoint(2.06,0,0)[0]*s,bz=p.z,h=parkHeight(bx,bz)??p.lift,seat=benchPoint(0,PARK_BENCH_FIT.seat,0)[1];
 return {position:[bx,h,bz],eyeY:p.lift+seat*s+.75,yaw:1.1,pitch:0,stand:[p.x+.5*s,h,p.z]};
}
export const PARK_BENCH=parkBench(PARK);
