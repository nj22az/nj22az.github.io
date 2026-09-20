/** Flush paving, 1.8 m wide, from the street to the bench and around the pond.
 * Rectangles meet at their edges so adjoining paving never fights for depth. */
export const PARK_WALKWAY_RECTS=Object.freeze([
 [5.95,7.75,-24.7,-11.1],
 [7.75,16.4,-24.7,-22.9],
 [7.75,24.4,-12.9,-11.1],
 [24.4,26.2,-12.9,-2],
 [26.2,32.1,-3.8,-2],
 [30.3,32.1,-11.6,-3.8],
 [26.2,30.3,-11.6,-9.8],
].map(Object.freeze));

export const PARK_LAMP_PLACEMENTS=Object.freeze([
 [5,-25.8],[12,-25],[15.5,-22.2],
 [8.3,-19],[8.3,-14.4],[13,-13.55],[18.5,-13.55],
 [23.7,-13.5],[23.75,-7],[26.8,-.9],
 [32.65,-4],[32.65,-9],[28.3,-13.05],
].map(Object.freeze));

export function onParkWalkway(x,z,margin=0){
 return PARK_WALKWAY_RECTS.some(([x0,x1,z0,z1])=>
  x>=x0-margin&&x<=x1+margin&&z>=z0-margin&&z<=z1+margin);
}
export const PARK_WALKWAY={id:'park-lantern-walk',surface:'stone'};
