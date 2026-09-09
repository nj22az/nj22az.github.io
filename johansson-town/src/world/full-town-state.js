// Runtime selection is set only after the complete asset and its navigation load.
export const FULL_TOWN={active:false,grid:null,colliders:[],bounds:{minX:-23,maxX:51,minZ:-54,maxZ:18},spawn:[-5,0,-1],sites:new Map(),patrol:[],catTargets:[],escort:null};
export function sourceHeight(x,z){
 const g=FULL_TOWN.grid;if(!g)return null;const fx=(x-g.minX)/g.step,fz=(z-g.minZ)/g.step,ix=Math.floor(fx),iz=Math.floor(fz);
 if(ix<0||iz<0||ix>=g.nx-1||iz>=g.nz-1)return null;
 const h=[g.heights[iz*g.nx+ix],g.heights[iz*g.nx+ix+1],g.heights[(iz+1)*g.nx+ix],g.heights[(iz+1)*g.nx+ix+1]];if(h.some(v=>v===null))return null;
 const u=fx-ix,v=fz-iz;return (h[0]*(1-u)+h[1]*u)*(1-v)+(h[2]*(1-u)+h[3]*u)*v;
}
export const FULL_PATHS=[{id:'port-walk',width:3,points:[[20,-20],[-5,-20],[-5,-22],[0,-22],[0,-33]]},{id:'harbour-apron',width:8,points:[[-5,-18],[-5,-29]]},{id:'park-link',width:3,points:[[17,0],[20,0],[20,-20],[27,-24]]}];
function segment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return {t,d:Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)};}
export function extensionHeight(x,z,parkHeight,r=0){
 const park=parkHeight(x,z);if(park!==null)return park;let closest=null;
 for(const path of FULL_PATHS)for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i],s=segment(x,z,a,b);if(s.d>path.width/2-r)continue;
  const ha=sourceHeight(...a)??parkHeight(...a)??0,hb=sourceHeight(...b)??parkHeight(...b)??0;if(!closest||s.d<closest.d)closest={d:s.d,h:ha*(1-s.t)+hb*s.t};
 }return closest?.h??null;
}
export function fullHeight(x,z,parkHeight){return sourceHeight(x,z)??extensionHeight(x,z,parkHeight)??0;}
export function fullContains(x,z,r,parkHeight){
 const clear=(a,b)=>sourceHeight(a,b)!==null||extensionHeight(a,b,parkHeight)!==null;
 return [[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([a,b])=>clear(x+a,z+b));
}
