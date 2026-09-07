// Deterministic 2D collision helpers used by Johansson Town.
// Kept independent of Three.js so the core movement rules can be regression-tested.
export function circleHitsRect(x,z,r,c){
  return Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r;
}

export function circleHitsCircle(ax,az,ar,bx,bz,br){
  const dx=ax-bx,dz=az-bz,rr=ar+br;
  return dx*dx+dz*dz<rr*rr;
}

export function roomBoundsBlocked(x,z,r=0){
  return x<-5.6+r||x>5.6-r||z<-5.5+r||z>5.7-r;
}

// Town envelope follows the actual playable ground instead of a single rectangle:
// narrow shopping street -> broad harbour apron -> central working pier.
export function townBoundsBlocked(x,z,r=0){
  if(z>58.2-r||z<-79+r)return true;
  let limit=7;
  if(z<-52)limit=17.2;
  if(z<-63.7)limit=4.15;
  return Math.abs(x)>limit-r;
}

// Sweep from start to end and return the last safe interpolation fraction.
// This prevents a third-person camera from tunnelling through thin props/walls.
export function sweepFraction(start,end,isBlocked,step=.14){
  const dx=end.x-start.x,dz=end.z-start.z,dist=Math.hypot(dx,dz);
  const count=Math.max(1,Math.ceil(dist/Math.max(.04,step)));
  let safe=0;
  for(let i=1;i<=count;i++){
    const t=i/count,x=start.x+dx*t,z=start.z+dz*t;
    if(isBlocked(x,z))break;
    safe=t;
  }
  return safe;
}
