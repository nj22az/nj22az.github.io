// Two compact, adjoining copies of the supplied city. Gameplay addresses remain
// in the original quarter; geometry, ground sampling and colliders use the same offsets.
export const CITY_SECTIONS=Object.freeze([{id:'canal-quarter',x:0,z:0},{id:'east-quarter',x:44,z:0}].map(Object.freeze));
// Runtime selection is set only after the complete asset and its navigation load.
export const FULL_TOWN={active:false,grid:null,colliders:[],bounds:{minX:-23,maxX:66,minZ:-54,maxZ:18},spawn:[-5,0,-1],sites:new Map(),patrol:[],catTargets:[],escort:null};
function gridHeight(x,z){
 const g=FULL_TOWN.grid;if(!g)return null;const fx=(x-g.minX)/g.step,fz=(z-g.minZ)/g.step,ix=Math.floor(fx),iz=Math.floor(fz);
 if(ix<0||iz<0||ix>=g.nx-1||iz>=g.nz-1)return null;
 const h=[g.heights[iz*g.nx+ix],g.heights[iz*g.nx+ix+1],g.heights[(iz+1)*g.nx+ix],g.heights[(iz+1)*g.nx+ix+1]];if(h.some(v=>v===null))return null;
 const u=fx-ix,v=fz-iz;return (h[0]*(1-u)+h[1]*u)*(1-v)+(h[2]*(1-u)+h[3]*u)*v;
}
export function sourceHeight(x,z){
 for(const section of CITY_SECTIONS){const h=gridHeight(x-section.x,z-section.z);if(h!==null)return h;}return null;
}
// Canal-bank quays are authored in source space and repeated with each city copy so
// every original doorway that faces the water has a walkable timber approach.
const CANAL_QUAYS=Object.freeze([
 {id:'canal-east-n',width:2.3,points:[[2.35,2.05],[2.35,15.1]]},
 {id:'canal-east-s',width:2.3,points:[[1.95,-2.15],[1.95,-11.1]]},
 {id:'canal-west-s',width:2.3,points:[[-2.5,-2.15],[-2.5,-11.1]]},
 {id:'canal-west-n',width:2.0,points:[[-4.55,2.05],[-4.55,7.5],[-3.7,8.2],[-4.5,9.2],[-4.5,15.1]]},
]);
export const FULL_PATHS=Object.freeze([
 {id:'city-link',width:4.5,surface:'wood',points:[[17,0],[26,0]]},
 {id:'port-walk',width:4.5,surface:'wood',points:[[20,-20],[-5,-20],[-5,-22],[0,-22],[0,-33]]},
 {id:'harbour-apron',width:8,surface:'wood',points:[[-5,-18],[-5,-29]]},
 {id:'park-link',width:3,points:[[17,0],[20,0],[20,-20],[27,-24]]},
 {id:'ramen-quay',width:3.2,surface:'wood',points:[[20.5,0],[20.5,15.5],[24.65,15.5],[24.65,14.95]]},
 ...CITY_SECTIONS.flatMap(section=>CANAL_QUAYS.map(path=>({id:path.id+'-'+section.id,width:path.width,surface:'wood',points:path.points.map(([x,z])=>[x+section.x,z+section.z])}))),
].map(path=>Object.freeze({...path,points:path.points.map(p=>Object.freeze(p))})));
export const STREET_DOORS=Object.freeze([
 {id:'office',x:-9.15,z:3.92,nx:0,nz:-1},
 {id:'frontrow',x:6.18,z:2.72,nx:0,nz:-1},
 {id:'form3d',x:-8,z:-7.39,nx:0,nz:1},
 {id:'stepwise',x:14.2,z:-3.73,nx:0,nz:1},
 {id:'journal',x:4.48,z:-6.35,nx:-1,nz:0},
 {id:'electronics',x:14.88,z:2.61,nx:0,nz:-1},
 {id:'market-source',x:16.68,z:10.78,nx:1,nz:0},
 {id:'career',x:-10.65,z:-10.65,nx:-1,nz:0},
 {id:'ramen-source',x:-12.48,z:-3.69,nx:1,nz:0},
 {id:'izakaya',x:-14.63,z:6.26,nx:1,nz:0},
 {id:'tea-house',x:-15.67,z:2.83,nx:0,nz:-1},
 {id:'house-east-south',x:11.55,z:-6.99,nx:-1,nz:0},
 {id:'house-east-north',x:13.25,z:8.88,nx:0,nz:-1},
 {id:'house-west-mid',x:-6.5,z:7.18,nx:1,nz:0},
 {id:'house-west-canal',x:-5.11,z:11.53,nx:1,nz:0},
].map(Object.freeze));
function segment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return {t,d:Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)};}
export function extensionHeight(x,z,parkHeight,r=0){
 const park=parkHeight(x,z);if(park!==null)return park;let closest=null;
 for(const path of FULL_PATHS)for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i],s=segment(x,z,a,b);if(s.d>path.width/2-r)continue;
  const deck=path.surface==='wood'?0:null;
  const ha=deck??sourceHeight(...a)??parkHeight(...a)??0,hb=deck??sourceHeight(...b)??parkHeight(...b)??0;if(!closest||s.d<closest.d)closest={d:s.d,h:ha*(1-s.t)+hb*s.t};
 }return closest?.h??null;
}
export function fullHeight(x,z,parkHeight){
 const src=sourceHeight(x,z),ext=extensionHeight(x,z,parkHeight);
 if(ext!==null&&(src===null||src<ext-.12))return ext;
 return src??ext??0;
}
export function fullContains(x,z,r,parkHeight){
 const clear=(a,b)=>sourceHeight(a,b)!==null||extensionHeight(a,b,parkHeight)!==null;
 return [[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([a,b])=>clear(x+a,z+b));
}
export function doorApproach(door,distance=1.1){return [door.x+door.nx*distance,door.z+door.nz*distance];}
