import * as THREE from '../../vendor/three.module.js';
import {celFrom} from '../render/cel.js';

/**
 * Thuận 2.0's painted face in World (the owner, 29 October 2026: "How to bring Thuan 2.0 To the game ?", "Try and show
 * me progress", "Oh this is much better", "Do all"). The studio paints her expressions in her own design, square from the
 * front (jojo `3d/cast/thuan_paint.py game-frames`), into two atlases: `over` (each frame's lash lines, brows, nose,
 * mouth, blush) and `under` (each frame's eye whites, clipped by its lids, and one slot of her irises, centred on each
 * eye); `thuan-face.json` says where. Its export lays one shallow grid over the front of her face whose UVs are that
 * front view (`game_thuan.py --painted`, the card's `facePaint`). This draws the grid: the frame's whites, over them her
 * irises moved by her gaze (inside the whites, so a lowered lid clips them), over those the rest; shaded as her skin is,
 * in place of the rigged eyes, brows and mouth. Off unless asked for: `?face=painted` (a prototype for the owner to judge;
 * the rigged face is what the live game draws).
 */

export function paintedFaceWanted(search=globalThis.location?.search||''){return new URLSearchParams(search).get('face')==='painted';}

// Every feeling World's painter knows (face.js MOOD), as the painted frame nearest it. Unlisted feelings draw neutral.
export const FRAME_OF=Object.freeze({
 neutral:'neutral',calm:'neutral',thinking:'neutral',blank:'neutral',hope:'neutral',dry:'smug',focus:'angry',
 smile:'smile',content:'smile',relieved:'smile',lovestruck:'smile',
 happy:'happy',starstruck:'excited',excited:'excited',laugh:'laugh',bleh:'laugh',bliss:'sleepy',
 sad:'sad',bawling:'sad',worried:'worried',dismay:'worried',sweatdrop:'worried',daze:'worried',dizzy:'worried',
 embarrassed:'shy',shy:'shy',angry:'angry',grumpy:'angry',scheme:'angry',pain:'angry',
 surprised:'surprised',shock:'surprised',gobsmacked:'surprised',sleep:'sleepy',drowsy:'sleepy',
 smug:'smug',pouting:'pout',
});

/** The frame a face state asks for: shut in a blink, a wink when one eye shuts, else its feeling's (FRAME_OF). */
export function frameFor(state={},frames=Object.values(FRAME_OF)){
 const L=Number.isFinite(state.blinkLeft)?state.blinkLeft:+state.blink||0,R=Number.isFinite(state.blinkRight)?state.blinkRight:+state.blink||0;
 const has=n=>frames.includes(n);
 if(L>.5&&R>.5&&has('blink'))return 'blink';
 if((L>.5)!==(R>.5)&&has('wink'))return 'wink';
 const want=FRAME_OF[state.expression]||'neutral';
 return has(want)?want:has('neutral')?'neutral':frames[0];
}

const SHADER_HEAD=`uniform sampler2D uOver,uUnder;
uniform vec4 uOverBox,uUnderBox,uWindow,uGrids,uSlots;
uniform vec2 uIrisSlot,uGaze;
// A slot of an atlas (cols, rows) at a point of the face's front view (metres), its box (x0, x1, z0, z1) the slot's
// extent; nothing outside it. Rows from the image's top (three.js turns a loaded image over: t = 1 is its top).
vec4 slotAt(sampler2D t,vec2 grid,vec2 slot,vec4 box,vec2 p){
 vec2 f=vec2((p.x-box.x)/(box.y-box.x),(p.y-box.z)/(box.w-box.z));
 if(f.x<0.||f.x>1.||f.y<0.||f.y>1.)return vec4(0.);
 return texture2D(t,vec2((slot.x+f.x)/grid.x,1.-(slot.y+1.-f.y)/grid.y));
}
`;
const SHADER_PAINT=`
 // the grid's UV (glTF: v from the window's top, over its width) as metres on the face's front view
 vec2 faceP=vec2(uWindow.x+vMapUv.x*(uWindow.y-uWindow.x),uWindow.z+(1.-vMapUv.y)*(uWindow.y-uWindow.x));
 vec4 whites=slotAt(uUnder,uGrids.zw,uSlots.zw,uUnderBox,faceP);
 vec4 irises=slotAt(uUnder,uGrids.zw,uIrisSlot,uUnderBox,faceP-uGaze);
 vec4 rest=slotAt(uOver,uGrids.xy,uSlots.xy,uOverBox,faceP);
 irises.a*=whites.a;
 vec3 paintC=whites.rgb*whites.a;float paintA=whites.a;
 paintC=paintC*(1.-irises.a)+irises.rgb*irises.a;paintA=paintA*(1.-irises.a)+irises.a;
 paintC=paintC*(1.-rest.a)+rest.rgb*rest.a;paintA=paintA*(1.-rest.a)+rest.a;
 diffuseColor.rgb*=paintA>1e-4?paintC/paintA:vec3(0.);diffuseColor.a*=paintA;
`;

/**
 * The painted face on its grid. `card`: the body card's `facePaint` (its `window`); `paint`: {manifest, over, under}, the
 * atlases (sRGB) and thuan-face.json. Returns {mesh, frames, frame, set(name), look(x, y), hold(name, look), dispose()}.
 */
export function rigPaintedFace(geometry,card,paint,{make=(g,m)=>new THREE.Mesh(g,m),gradientMap=null}={}){
 const M=paint.manifest,frames=M.frames,win=card.window||M.window;
 for(const t of [paint.over,paint.under]){t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;}
 const over=paint.over.clone(),under=paint.under.clone();
 const slotOf=(grid,i)=>new THREE.Vector2(i%grid.cols,Math.floor(i/grid.cols));
 const uniforms={uOver:{value:over},uUnder:{value:under},uWindow:{value:new THREE.Vector4(win[0],win[1],win[2],win[3])},
  uOverBox:{value:new THREE.Vector4(...M.over.box)},uUnderBox:{value:new THREE.Vector4(...M.under.box)},
  uGrids:{value:new THREE.Vector4(M.over.cols,M.over.rows,M.under.cols,M.under.rows)},uSlots:{value:new THREE.Vector4(0,0,0,0)},
  uIrisSlot:{value:slotOf(M.under,M.under.iris)},uGaze:{value:new THREE.Vector2(0,0)}};
 // (its own map is only there so three.js gives the shader the grid's UVs: the paint comes from the atlases above;
 // shaded as her skin is, the town's ramp a little self-lit, so the paint does not go brown in a shadow)
 const source=new THREE.MeshStandardMaterial({map:over,transparent:true,alphaTest:.02,depthWrite:false,roughness:.82,emissive:0xffffff,emissiveIntensity:.05});
 const material=celFrom(source,{bands:'soft3'});source.dispose();
 if(gradientMap)material.gradientMap=gradientMap;
 material.polygonOffset=true;material.polygonOffsetFactor=-2;material.polygonOffsetUnits=-2;
 const base=material.onBeforeCompile,baseKey=material.customProgramCacheKey.bind(material);
 material.onBeforeCompile=(shader,renderer)=>{base.call(material,shader,renderer);Object.assign(shader.uniforms,uniforms);
  shader.fragmentShader=SHADER_HEAD+shader.fragmentShader.replace('#include <map_fragment>',SHADER_PAINT)
   .replace('#include <emissivemap_fragment>','totalEmissiveRadiance *= diffuseColor.rgb;');};
 material.customProgramCacheKey=()=>baseKey()+':painted-face-v2';
 material.name='painted face';
 const mesh=make(geometry,material);
 mesh.name='painted face';mesh.castShadow=false;mesh.receiveShadow=true;mesh.renderOrder=2;
 let now=null,held=null,heldLook=null;
 const show=name=>{const i=frames.indexOf(name);if(i<0)return;now=name;const o=slotOf(M.over,i),u=slotOf(M.under,i);uniforms.uSlots.value.set(o.x,o.y,u.x,u.y);};
 const aim=(x,y)=>{const r=M.irisRange||[.0085,.004];uniforms.uGaze.value.set(THREE.MathUtils.clamp(+x||0,-1,1)*r[0],-THREE.MathUtils.clamp(+y||0,-1,1)*r[1]);};
 show(frames.includes('neutral')?'neutral':frames[0]);
 const api={
  mesh,frames,
  get frame(){return now;},
  /** Show a frame by name (unknown names leave the face as it is), unless one is held. */
  set(name){if(!held&&name!==now)show(name);},
  /** Her gaze, as World's (x toward her left, y down; -1..1), unless one is held; where World's is near ahead, the
   * frame's own (shy looks down and aside, sad down: the second audit found shy's eyes ahead in the game). */
  look(x,y){if(heldLook)return;const own=M.look?.[now]||[0,0];aim(Math.abs(+x||0)>.15?x:own[0],Math.abs(+y||0)>.15?y:own[1]);},
  /** Hold a frame (and a gaze) whatever her feelings say, for a photograph; hold(null) lets go. */
  hold(name,look=null){held=name||null;heldLook=look;if(held)show(held);if(look)aim(look[0],look[1]);else if(held)aim(...(M.look?.[held]||[0,0]));},
  /** The gaze uniform (metres on the face), for tests. */
  get gaze(){return uniforms.uGaze.value.clone();},
  get slots(){return uniforms.uSlots.value.clone();},
  dispose(){material.dispose();over.dispose();under.dispose();},
 };
 mesh.userData.paintedFace=api;
 return api;
}
