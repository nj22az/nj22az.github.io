// Pure helpers behind Build scene's direct controls (no DOM, no Three.js), so Node tests can check them.
// Angles are degrees. A character's turn is its root's rotation about the vertical axis: at 0 it faces +z, and a larger
// turn turns it to its own left (anticlockwise seen from above).

/** An angle in (-180, 180]. */
export function wrapTurn(degrees){const d=((Number(degrees)%360)+540)%360-180;return d===-180?180:Math.round(d*10)/10;}

/** The turn that makes a character at `from` look at `to` (both {x,z} on the ground). */
export function turnToward(from,to){return wrapTurn(Math.atan2(to.x-from.x,to.z-from.z)*180/Math.PI);}

/** The screen angle of the line between two touches (y down, so a clockwise twist makes it grow). */
export function touchAngle(a,b){return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;}

/** Twisting two fingers clockwise turns the character clockwise seen from above (to its right). */
export function twistTurn(startTurn,startAngle,angle){return wrapTurn(startTurn-wrapTurn(angle-startAngle));}

/**
 * A step on the ground for an arrow key, relative to the picture: left and right across it, up into it, down out of it.
 * `forward` is the camera's viewing direction on the ground ({x,z}, any length).
 */
export function nudgeStep(key,forward,step=.15){
 const length=Math.hypot(forward.x,forward.z)||1,fx=forward.x/length,fz=forward.z/length,rx=-fz,rz=fx;
 const move={ArrowUp:[fx,fz],ArrowDown:[-fx,-fz],ArrowRight:[rx,rz],ArrowLeft:[-rx,-rz]}[key];
 return move?{dx:move[0]*step,dz:move[1]*step}:null;
}

const overlaps=(r,c,margin)=>{const x=Math.max(r.x,Math.min(c.x,r.x+r.w)),y=Math.max(r.y,Math.min(c.y,r.y+r.h));return Math.hypot(c.x-x,c.y-y)<c.r+margin;};
/**
 * Where the selected character's toolbar goes, in pixels inside a frame of `frame` {w,h}: below the feet, else above the
 * head, else beside the body, else over the legs, else along the frame's bottom or top edge. Never over the face
 * (`face` {x,y,r}) and always inside the frame. `box` is the character's {left,top,right,bottom}; `bar` the toolbar's {w,h}.
 * Returns {x,y,where} (the toolbar's top-left corner), or null when the frame is too small to hold it anywhere.
 */
export function placeToolbar({frame,box,face,bar,gap=8,edge=4}){
 const clampX=x=>Math.max(edge,Math.min(frame.w-bar.w-edge,x)),clampY=y=>Math.max(edge,Math.min(frame.h-bar.h-edge,y));
 const cx=(box.left+box.right)/2,bodyY=Math.max(face.y+face.r+gap,(box.top+box.bottom)/2);
 const candidates=[
  ['below',clampX(cx-bar.w/2),box.bottom+gap],
  ['above',clampX(cx-bar.w/2),box.top-gap-bar.h],
  ['right',box.right+gap,clampY(bodyY)],
  ['left',box.left-gap-bar.w,clampY(bodyY)],
  ['legs',clampX(cx-bar.w/2),clampY(box.bottom-bar.h-gap)],
  ['bottom',clampX(cx-bar.w/2),frame.h-bar.h-edge],
  ['top',clampX(cx-bar.w/2),edge],
 ];
 for(const [where,x,y] of candidates){
  const rect={x,y,w:bar.w,h:bar.h};
  if(x<edge-.5||y<edge-.5||x+bar.w>frame.w-edge+.5||y+bar.h>frame.h-edge+.5)continue;
  if(overlaps(rect,face,6))continue;
  return {x,y,where};
 }
 return null;
}

/**
 * The character under a tap, from each character's box on the screen ({id,left,top,right,bottom,visible}): a box that
 * holds the point (grown by `slop` pixels for a fingertip), the smallest when several do. Hidden characters are skipped.
 */
export function pickBox(point,boxes,slop=14){
 let best=null,area=Infinity;
 for(const b of boxes){
  if(b.visible===false)continue;
  if(point.x<b.left-slop||point.x>b.right+slop||point.y<b.top-slop||point.y>b.bottom+slop)continue;
  const a=(b.right-b.left)*(b.bottom-b.top);if(a<area){area=a;best=b.id;}
 }
 return best;
}

/** The nearest free seat within `reach` metres of `at` ({x,z}), or null. `taken` holds seat ids already in use. */
export function nearestSeat(seats,at,taken=new Set(),reach=2.5){
 let best=null,distance=reach;
 for(const s of seats){if(taken.has(s.id))continue;const d=Math.hypot(s.position[0]-at.x,s.position[2]-at.z);if(d<=distance){distance=d;best=s;}}
 return best;
}
