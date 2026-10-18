// Idle controllers and sub-dead-zone drift must not steal the pointer back.
export function createInputMode(onChange){
 let mode='pointer',last=null;
 const set=value=>{if(mode!==value){mode=value;onChange(value);}};
 return {get mode(){return mode;},pad(frame,pressed){if(pressed.some(Boolean)||Math.hypot(frame.move.x,frame.move.y)>.25||Math.hypot(frame.look.x,frame.look.y)>.25)set('controller');},pointer(event){if(event.pointerType&&event.pointerType!=='mouse')return;const pos=[event.clientX,event.clientY];if(last&&Math.hypot(pos[0]-last[0],pos[1]-last[1])>=3)set('pointer');last=pos;},click(){set('pointer');},keyboard(){set('keyboard');}};
}
