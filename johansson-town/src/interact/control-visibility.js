// A single state table for contextual touch controls; keyboard shortcuts stay available.
// A control under a finger never disappears. Releasing a button that stopped existing
// mid-press strands the touch, and for the run toggle it leaves the pressed state stuck.
export function controlVisibility({playing,paused,seated,inside,moving,running,canDrink,hasTarget,hasItems=false,pressed=[]}){
 const available=playing&&!paused;
 const held=id=>available&&pressed.includes(id);
 return {mobile:available,
  act:available&&(hasTarget||seated)||held('act'),
  drink:available&&canDrink||held('drink'),
  run:available&&!seated&&(moving||running)||held('run'),
  jump:available&&!seated&&!inside&&moving||held('jump'),
  // The bag is only there when there is something in it.
  bagButton:available&&!!hasItems};
}

/** A doorway action belongs to the doorway, and cannot compete with a modal. */
export function roomExitVisible({playing,inside,paused,seated,position,exit,radius=2.2}){
 if(!playing||!inside||paused||seated||!position||!exit)return false;
 const x=Array.isArray(exit)?exit[0]:exit.x,z=Array.isArray(exit)?exit[2]:exit.z;
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(position.x-x,position.z-z)<radius;
}
