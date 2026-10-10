/** Long plaits travel from below the ears to the front of the waist. Shared by
 * the mesh and its two spring chains, so every body size uses the same anchors. */
export function longBraidPoints(m,side){
 const R=m.Rh;
 return [
  [side*R*.8,m.headCentre-R*.38,-R*.22],
  [side*Math.max(m.hips*.58,R*.73),m.headCentre-R*1.25,m.depth*.65],
  [side*m.hips*.56,m.hipY+m.torso*.12,m.depth*.7],
 ];
}
