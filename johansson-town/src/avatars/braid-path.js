/** Compact plaits travel from below the ears to the upper chest. Shared by
 * the mesh and its two spring chains, so every body size uses the same anchors. */
export function longBraidPoints(m,side){
 const R=m.Rh;
 return [
  [side*R*.8,m.headCentre-R*.38,-R*.22],
  [side*R*.79,m.headCentre-R*1.05,m.depth*.45],
  [side*R*.77,m.chestY+m.torso*.15,m.depth*.62],
 ];
}
