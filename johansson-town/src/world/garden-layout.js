/** The garden has a level bathhouse terrace and a shallow pond; slopes grade outside. */
export const GARDEN_AUTHOR=Object.freeze({id:'aoba-garden',title:'Aoba Traditional Garden',minX:-49,maxX:-5,minZ:107,maxZ:154,y:0,entry:Object.freeze([-28,108]),pond:Object.freeze({x:-34,z:132,rx:7,rz:5,waterY:-.14}),onsen:Object.freeze({x:-14,z:131}),shrine:Object.freeze({x:-35,z:149})});
export const GARDEN_PATHS_AUTHOR=[{id:'garden-entry',width:2.5,surface:'stone',points:[[-47,110],[-28,108],[-28,118],[-23,125],[-20,129.6]]},{id:'garden-pond-loop',width:2.2,surface:'gravel',points:[[-28,118],[-42,120],[-45,132],[-41,143],[-28,145],[-23,137],[-23,125],[-28,118]]},{id:'garden-bridge',width:2.2,surface:'wood',points:[[-44,132],[-24,132]]},{id:'garden-shrine',width:2.4,surface:'stone',points:[[-35,143],[-35,146]]}];
// Keep the authored garden composition, brought into the neighbourhood at a compact scale.
export const GARDEN_SCALE=.6;
export function gardenPoint(x,z){return [-36+(x+49)*GARDEN_SCALE,34+(z-107)*GARDEN_SCALE];}
export const gardenLocal=(x,z)=>[(x+36)/GARDEN_SCALE-49,(z-34)/GARDEN_SCALE+107];
const point=p=>{const [x,z]=gardenPoint(p.x,p.z);return {...p,x,z};};
export const GARDEN=Object.freeze({...GARDEN_AUTHOR,minX:-36,maxX:-5.4,minZ:34,maxZ:62.2,entry:Object.freeze(gardenPoint(-28,108)),pond:Object.freeze({...point(GARDEN_AUTHOR.pond),rx:4.2,rz:3}),onsen:Object.freeze({x:-13.2,z:46.1}),shrine:Object.freeze(point(GARDEN_AUTHOR.shrine))});
export const PARK_ACCESS=[
 {id:'garden-residential-walk',width:1.8,surface:'stone',points:[[-23.4,40.6],[-5.4,40],[1.9,40],[1.9,46]],heights:[0,0,-.4,-.4]},
 {id:'garden-town-walk',width:2.5,surface:'stone',points:[[3,10],[0,14],[0,27],[-8,34.6],[-23.4,34.6]]},
 {id:'garden-neighbourhood-walk',width:2.5,surface:'stone',points:[[-37.6,20],[-37.6,32],[-23.4,32],[-23.4,34.6]]},
];
export const GARDEN_PATHS=[...PARK_ACCESS,...GARDEN_PATHS_AUTHOR.map(r=>({...r,width:r.width*GARDEN_SCALE,points:r.points.map(p=>gardenPoint(...p))}))];
export function inGarden(x,z,pad=0){return x>=GARDEN.minX-pad&&x<=GARDEN.maxX+pad&&z>=GARDEN.minZ-pad&&z<=GARDEN.maxZ+pad;}
export function gardenPondAt(x,z,r=0){const p=GARDEN.pond;return ((x-p.x)/(p.rx+r))**2+((z-p.z)/(p.rz+r))**2<1;}
export function gardenHeight(x,z){if(!inGarden(x,z))return null;const [lx,lz]=gardenLocal(x,z);if(Math.abs(lz-132)<=1.15&&lx>=-44&&lx<=-24)return .1;if(gardenPondAt(x,z))return -.35;return GARDEN.y;}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function gardenApronHeight(x,z){
 const dx=Math.max(GARDEN.minX-x,0,x-GARDEN.maxX),dz=Math.max(GARDEN.minZ-z,0,z-GARDEN.maxZ),d=Math.hypot(dx,dz);
 if(d>6)return null;return -.4*smooth(d/6);
}
export function gardenAccessHeight(x,z){
 let distance=Infinity,level=0;
 for(const r of PARK_ACCESS)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));const d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<distance){distance=d;level=r.heights?(r.heights[i-1]*(1-t)+r.heights[i]*t):0;}}
 if(distance>3.05)return null;const surrounding=-.4*smooth((z-12)/6);return level+(surrounding-level)*smooth((distance-1.25)/1.8);
}

/** Overlapping banks form one continuous surface; the lower bank cannot cut a path. */
export function gardenGroundHeight(x,z){const heights=[gardenApronHeight(x,z),gardenAccessHeight(x,z)].filter(h=>h!==null);return heights.length?Math.max(...heights):null;}

/** One detailed ground mesh owns the garden and all of its neighbourhood approaches. */
export const GARDEN_GROUND_BOUNDS=Object.freeze({minX:-44,maxX:7,minZ:6,maxZ:70});
export function inGardenGround(x,z,pad=0){const b=GARDEN_GROUND_BOUNDS;return x>=b.minX-pad&&x<=b.maxX+pad&&z>=b.minZ-pad&&z<=b.maxZ+pad;}
