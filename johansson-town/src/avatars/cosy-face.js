/**
 * The cosy face (avatar remake, after the rigged eyes): the rest of the creator's cosy-anime critique of 25 October 2026
 * (Ghibli, Animal Crossing, Breath of the Wild), for the face painter (face.js) and the head (build.js):
 * - brows: clean tapered arcs, thickest toward the nose, in a warmer taupe than the hair;
 * - mouth line: warm dark brown, not black;
 * - stubble: a soft tint over the jaw and upper lip, no scattered dots or bristles;
 * - blush: on the cheeks, the nose tip and the ears;
 * - nose: no inked crease all round, only a small soft shadow under it (the ball nose becomes a smooth rise of the face);
 * - ears: flared out from the head.
 *
 * Behind a switch until the creator has judged it: `?cosy=1` on any page that builds avatars, or
 * buildAvatar(recipe,{cosy:true}); drawFace takes `state.cosy`. The numbers are here, in one place, to tune.
 */
export const COSY=Object.freeze({
 browTaupe:'#7a5c4a',browMix:.35,browDarken:.8,  // brow ink: the brow colour darkened, then this far toward the taupe
 browTip:.3,browInner:.3,                        // the brow's thickness at its ends (of the middle's), and how much more at the inner end
 mouthLine:'#5a3025',mouthInside:'#3b1f1a',      // natural lips only: a lipstick keeps its own colour
 stubbleAlpha:.2,                                // the stubble tint over the jaw
 blushFloor:.22,noseBlush:.45,                   // cheeks are never quite without blush; the nose tip's share of it
 noseShadow:.5,                                  // the shadow under the nose (alpha at its middle)
 noseFoot:1.45,noseProfile:1.6,                 // the 3D nose: its foot's width (of the ball's), and how steeply it rises (>1: no edge)
 earFlare:27,earBlush:.18,                       // degrees the back of each ear stands out; how far its colour goes toward pink
 blushPink:'#e8828a',
});

/** Whether the page asks for the cosy face: `?cosy=1`. Off otherwise, and where there is no page (node tests). */
export function cosyFaceOn(){
 try{return new URLSearchParams(globalThis.location?.search||'').get('cosy')==='1';}catch{return false;}
}

const rgb=hex=>{const n=parseInt(hex.slice(1),16);return [n>>16,n>>8&255,n&255];};
const hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
/** a toward b by t, in sRGB (as the painter mixes everything else). */
export function mix(a,b,t){const A=rgb(a),B=rgb(b);return hex(A.map((v,i)=>v+(B[i]-v)*t));}
/** The brow's ink from its colour: darker, then warmed toward taupe. */
export const cosyBrowInk=colour=>mix(hex(rgb(colour).map(v=>v*COSY.browDarken)),COSY.browTaupe,COSY.browMix);
/** The ear's colour from the skin: a little toward the blush. */
export const cosyEarColour=skin=>mix(skin,COSY.blushPink,COSY.earBlush);

/**
 * A brow as a filled tapered ribbon along a quadratic centre line (p0, control, p1, in brow units), `w` thick at its
 * fullest; `inner` is the sign of x toward the nose. Thin round ends, fullest a little inside the middle.
 */
export function browRibbon(p0,c,p1,w,inner,steps=18){
 const top=[],bottom=[];
 for(let i=0;i<=steps;i++){
  const t=i/steps,u=1-t;
  const x=u*u*p0[0]+2*u*t*c[0]+t*t*p1[0],y=u*u*p0[1]+2*u*t*c[1]+t*t*p1[1];
  const dx=2*u*(c[0]-p0[0])+2*t*(p1[0]-c[0]),dy=2*u*(c[1]-p0[1])+2*t*(p1[1]-c[1]),l=Math.hypot(dx,dy)||1;
  const near=Math.max(0,Math.min(1,.5+x*inner/((Math.abs(p0[0])+Math.abs(p1[0]))||1)));   // 1 at the inner end, 0 at the outer
  const hw=w/2*(COSY.browTip+(1-COSY.browTip)*Math.pow(Math.sin(Math.PI*t),.6))*(1-COSY.browInner/2+COSY.browInner*near);
  top.push([x-dy/l*hw,y+dx/l*hw]);bottom.push([x+dy/l*hw,y-dx/l*hw]);
 }
 return [...top,...bottom.reverse()];
}
