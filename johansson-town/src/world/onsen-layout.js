/**
 * Where Umi-no-yu stands, without the building: people plan walks to its door from this,
 * and park-onsen.js builds the bathhouse on it.
 */
export const ONSEN=Object.freeze({x:24.5,z:4.5,yaw:-Math.PI/2,opens:600,closes:1320,fee:300});

/** A point in the model's own frame, in the town's. */
export function onsenPoint(x,z){
 const c=Math.cos(ONSEN.yaw),s=Math.sin(ONSEN.yaw);
 return [ONSEN.x+x*c+z*s,ONSEN.z-x*s+z*c];
}

/** The step outside the noren, where anyone walking to the bath arrives. */
export const ONSEN_DOOR=Object.freeze(onsenPoint(-1.4,5.4));

export const onsenOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=ONSEN.opens&&m<ONSEN.closes;};
