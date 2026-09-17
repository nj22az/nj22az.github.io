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

// The sticks are always needed, so they dim rather than leave, and only once nothing
// else is asking for attention: no contextual button on screen, no movement, and no
// touch for a while. Any touch resets sinceTouchMs, so they come straight back.
export function stickIdle({controls,moving,sinceTouchMs,idleAfterMs=2600}){
 const busy=controls.act||controls.drink||controls.run||controls.jump;
 return !!controls.mobile&&!busy&&!moving&&sinceTouchMs>idleAfterMs;
}
