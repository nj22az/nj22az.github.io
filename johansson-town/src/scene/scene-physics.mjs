// Scene coordinates are metres on the town's X/Z ground plane.
export function hitsSolid(x,z,r,solids,floor=0){
 return solids.some(c=>{
  if(c.height!=null&&c.height<=floor+.12)return false;
  if(c.minY!=null&&c.minY>floor+1.8)return false;
  if(c.r!=null)return Math.hypot(x-c.x,z-c.z)<r+c.r;
  const dx=Math.max(Math.abs(x-c.x)-(c.w||0)/2,0),dz=Math.max(Math.abs(z-c.z)-(c.d||0)/2,0);
  return dx*dx+dz*dz<r*r;
 });
}
export function walkTo(start,target,blocked){
 const distance=Math.hypot(target.x-start.x,target.z-start.z),steps=Math.max(1,Math.ceil(distance/.08));
 let result={...start};
 for(let i=1;i<=steps;i++){
  const next={x:start.x+(target.x-start.x)*i/steps,z:start.z+(target.z-start.z)*i/steps};
  if(blocked(next.x,next.z))break;result=next;
 }
 return result;
}
