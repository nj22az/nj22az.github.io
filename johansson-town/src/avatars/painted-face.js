import * as THREE from '../../vendor/three.module.js';
import {celFrom} from '../render/cel.js';

/**
 * Thuận 2.0's painted face in World (the owner, 29 October 2026: "How to bring Thuan 2.0 To the game ?", "Try and show
 * me progress"). The studio paints her face's expressions in her own design, square from the front (jojo
 * `3d/cast/thuan_paint.py frames`: her brows, her own eyes with her bold lash line, her nose's marks and her mouth), side by
 * side in one strip; its export lays one shallow grid over the front of her face whose UVs are that front view
 * (`game_thuan.py --painted`, the card's `facePaint`). This draws the grid with the frame her face is in, shaded as her
 * skin is, in place of the rigged eyes, brows and mouth. Off unless asked for: `?face=painted` (a prototype for the owner
 * to judge; the rigged face is what the live game draws).
 */

export function paintedFaceWanted(search=globalThis.location?.search||''){return new URLSearchParams(search).get('face')==='painted';}

/** The frame a face state asks for: shut in a blink (both eyes), happy when the feeling smiles, else neutral. */
export function frameFor(state={},target=null,frames=['neutral','happy','blink']){
 const blink=Math.max(+state.blink||0,Math.min(+state.blinkLeft||0,+state.blinkRight||0));
 if(blink>.5&&frames.includes('blink'))return 'blink';
 const smile=target?.mouth?.smile??0;
 if((smile>.45||HAPPY.has(state.expression))&&frames.includes('happy'))return 'happy';
 return frames.includes('neutral')?'neutral':frames[0];
}
const HAPPY=new Set(['happy','laugh','joy','delighted','excited','proud','smile']);

/**
 * The painted face on its grid. `texture`: the frame strip (sRGB, its frames side by side, in the card's order);
 * `card`: the body card's `facePaint` (`aspect`: the front view's height over its width, `frames`). The grid's UVs as glTF
 * gives them: u across the window, v from its top over its width; a frame's texel is
 * ((slot + u) / n, (1 - v) / aspect), from the image's bottom (three.js turns a loaded image over).
 */
export function rigPaintedFace(geometry,card,texture,{make=(g,m)=>new THREE.Mesh(g,m),gradientMap=null}={}){
 const frames=card.frames||['neutral','happy','blink'],n=frames.length,aspect=card.aspect||1;
 const map=texture.clone();
 map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.ClampToEdgeWrapping;
 map.repeat.set(1/n,-1/aspect);map.offset.set(0,1/aspect);map.needsUpdate=true;
 // (shaded as her skin is: the town's ramp, a little self-lit, so the paint does not go brown in a shadow)
 const source=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.02,depthWrite:false,roughness:.82,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.05});
 const material=celFrom(source,{bands:'soft3'});source.dispose();
 if(gradientMap)material.gradientMap=gradientMap;
 material.polygonOffset=true;material.polygonOffsetFactor=-2;material.polygonOffsetUnits=-2;
 material.name='painted face';
 const mesh=make(geometry,material);
 mesh.name='painted face';mesh.castShadow=false;mesh.receiveShadow=true;mesh.renderOrder=2;
 let now=frames[0];
 return {
  mesh,frames,
  get frame(){return now;},
  /** Show a frame by name (unknown names leave the face as it is). */
  set(name){const i=frames.indexOf(name);if(i<0||name===now)return;now=name;map.offset.x=i/n;},
  dispose(){material.dispose();map.dispose();},
 };
}
