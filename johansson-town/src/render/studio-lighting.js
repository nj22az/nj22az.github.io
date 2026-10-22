// Explicit photographic choices, shared by Studio preview and its reproducible review harness.
// Exposure and colour management are intentionally unchanged between the two material modes.
export const MATERIAL_LIGHTING=Object.freeze({
 neutral:Object.freeze({label:'Neutral portrait',sky:0xffffff,ground:0x8896aa,fill:1.8,key:0xffffff,power:2.2,position:[-3,4,5]}),
 daylight:Object.freeze({label:'Daylight',sky:0xeaf3ff,ground:0x879581,fill:1.6,key:0xfff9ee,power:2.5,position:[3,5,4]}),
 interior:Object.freeze({label:'Warm interior',sky:0xfff5e8,ground:0x8d7969,fill:1.6,key:0xffdfb5,power:2.0,position:[-3,3,4]})
});
export function applyMaterialLighting(id,fillLight,sun){
 const r=MATERIAL_LIGHTING[id];if(!r)return false;
 fillLight.color.setHex(r.sky);fillLight.groundColor.setHex(r.ground);fillLight.intensity=r.fill;
 sun.color.setHex(r.key);sun.intensity=r.power;sun.position.set(...r.position);return true;
}
