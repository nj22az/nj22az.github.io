// Shared headland outline. No renderer imports — physics and the map both use this.
export const COASTLINE=[[-40,-50],[-40,30],[-34,35],[-22,39],[-10,39],[1,34],[13,35],[20,49],[35,51],[40,40],[45,29],[45,-43],[38,-50],[20,-50]];

export function pointInCoastline(x,z){
  let inside=false;
  for(let i=0,j=COASTLINE.length-1;i<COASTLINE.length;j=i++){
    const xi=COASTLINE[i][0],zi=COASTLINE[i][1],xj=COASTLINE[j][0],zj=COASTLINE[j][1];
    if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/((zj-zi)||1e-9)+xi))inside=!inside;
  }
  return inside;
}

export function peninsulaLandContains(x,z,r=0){
  if(r<=0)return pointInCoastline(x,z);
  const s=r*.72;
  return pointInCoastline(x,z)
    &&pointInCoastline(x+s,z)&&pointInCoastline(x-s,z)
    &&pointInCoastline(x,z+s)&&pointInCoastline(x,z-s);
}
