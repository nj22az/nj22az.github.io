/**
 * Thuan commute yield — schedule layer only (not WalkFix gait/facing).
 * Other walkers step aside while she travels to Sakura / morning platform.
 */

/** @param {{visible?:boolean,userData:Record<string,unknown>}|null|undefined} g */
export function thuanHasCommutePriority(g,phase){
 if(!g||g.visible===false||g.userData.inMarket||g.userData.indoors==='market')return false;
 if(g.userData.indoors||g.userData.inIzakaya||g.userData.inRamen||g.userData.inHome)return false;
 const place=g.userData.place;
 if(place==='market')return true;
 if(place==='bus'||place==='station')return phase==='arriving'||phase==='town';
 return false;
}

/**
 * Side-step target clear of Thuan's forward path, or null if no yield needed.
 * @returns {[number,number]|null}
 */
export function yieldAsideTarget(personPos,thuanPos,thuanYaw,collides=()=>false,groundOk=()=>true){
 const dist=Math.hypot(personPos[0]-thuanPos[0],personPos[1]-thuanPos[1]);
 if(dist>2.6||dist<.05)return null;
 const fx=-Math.sin(thuanYaw),fz=-Math.cos(thuanYaw);
 const toX=personPos[0]-thuanPos[0],toZ=personPos[1]-thuanPos[1];
 if(toX*fx+toZ*fz<-.35)return null;
 const sideX=-fz,sideZ=fx;
 const sign=(toX*sideX+toZ*sideZ)>=0?1:-1;
 for(const extra of [1.15,1.55,1.95]){
  const x=personPos[0]+sideX*sign*extra,z=personPos[1]+sideZ*sign*extra;
  if(!collides(x,z)&&groundOk(x,z))return [x,z];
 }
 return null;
}

/** Personal space radii while Thuan has commute priority. */
export function commuteCrowdRadii(walkerIsThuan,otherIsThuan){
 if(otherIsThuan&&!walkerIsThuan)return .95;
 if(walkerIsThuan&&!otherIsThuan)return .42;
 return .61;
}
