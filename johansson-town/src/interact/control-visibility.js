// A single state table for contextual touch controls; keyboard shortcuts stay available.
// A control under a finger never disappears. Releasing a button that stopped existing
// mid-press strands the touch, and for the run toggle it leaves the pressed state stuck.
export function controlVisibility({playing,paused,seated,inside,moving,running,canDrink,hasTarget,pressed=[]}){
 const available=playing&&!paused;
 const held=id=>available&&pressed.includes(id);
 return {mobile:available,
  act:available&&(hasTarget||seated)||held('act'),
  drink:available&&canDrink||held('drink'),
  run:available&&!seated&&(moving||running)||held('run'),
  jump:available&&!seated&&!inside&&moving||held('jump')};
}
