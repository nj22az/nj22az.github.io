// A single state table for contextual touch controls; keyboard shortcuts stay available.
export function controlVisibility({playing,paused,seated,inside,moving,running,canDrink,hasTarget}){
 const available=playing&&!paused;
 return {mobile:available,act:available&&(hasTarget||seated),drink:available&&canDrink,
  run:available&&!seated&&(moving||running),jump:available&&!seated&&!inside&&moving};
}
