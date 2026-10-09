import * as THREE from '../../../vendor/three.module.js';

/**
 * The night over Umi-no-yu's rock bath: what you see over the low sea fence after dark.
 *
 * The far side of the harbour is a row of lights along the water: the quay's sodium street lamps (orange, evenly spaced,
 * the road lighting of every Japanese harbour of the eighties) and the white fluorescent windows of the houses and the
 * fish market above them, with the two harbour-mouth lights at the end of the breakwaters. They are painted onto the sea
 * view (onsen.js 'Umi-no-yu sea view', a backdrop 45 m out), so they cost nothing to light: small glowing discs, and a soft
 * streak of reflection on the water under the brightest. They come on as the daylight goes and stay on all night,
 * steady: never a flicker, never a flash (a harbour light's real flash code would be a clock the film cannot hold still).
 *
 * Everything is placed by rule, not rolled: the lamps every 3.6 m along the quay, the windows from a fixed hash.
 * Room frame as in onsen.js: the sea at -z, metres; the backdrop's horizon is at y 4.8 (seaTexture's 0.46).
 */
const plain=o=>Object.freeze(o);
/** A small integer hash in [0, 1): the same every time, never a dice roll. */
const hash=(i,s=0)=>{let h=(i*374761393+s*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;};

export const ONSEN_HARBOUR=(()=>{
 const z=-44.85,horizon=4.8,lights=[];
 // The quay: a sodium lamp every 3.6 m along the far shore, left and right of the harbour mouth.
 for(let x=-40;x<=40;x+=3.6){if(x>-2.6&&x<7.2)continue;lights.push(plain({kind:'sodium',x:+x.toFixed(2),y:horizon+.12,size:.26}));}
 // The houses and the market above the quay: white windows, two rows up the slope, where the hash says a window is lit.
 for(let i=0;i<46;i++){const x=-39+i*1.75;if(x>-3.2&&x<7.8)continue;if(hash(i,3)<.45)continue;
  lights.push(plain({kind:'window',x:+(x+(hash(i,5)-.5)*.8).toFixed(2),y:+(horizon+.3+hash(i,7)*.5).toFixed(2),size:.18}));}
 return plain({z,horizon,
  colours:plain({sodium:0xffa848,window:0xf2f1e4,red:0xff3426,green:0x3cff7c}),
  lights:Object.freeze(lights),
  // The harbour mouth seen from outside the harbour, the way a boat coming in sees it: Japan buoys and lights its
  // harbours in IALA region B, red to starboard going in, so the red light is on the right and the green on the left.
  mouth:plain({green:plain({x:-.6,y:horizon+.42,size:.34}),red:plain({x:5.2,y:horizon+.42,size:.34}),
   why:'The two lighthouses on the breakwater heads: the white tower’s green light on the left, the red tower’s red light on the right, as a fishing boat coming home sees them, and as the bathers do across the water.'}),
  streaks:plain({length:.9,width:.09,opacity:.4,why:'A soft column of reflection on the water under the harbour-mouth lights and the quay lamps, the way still harbour water carries a light towards you.'}),
  why:'The rock bath faces the harbour across the water (story page 12: the six in the bath, the night, the harbour lights behind them; 12c: the red and the green light between Nhung and Tetsuo).'});
})();

let dot=null;
function dotTexture(){
 if(dot)return dot;
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d=Math.min(1,Math.hypot(x-size/2+.5,y-size/2+.5)/(size/2)),core=d<.32?1:Math.max(0,1-(d-.32)/.68),i=(y*size+x)*4;
  data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(255*core*core);}
 dot=new THREE.DataTexture(data,size,size);dot.needsUpdate=true;dot.colorSpace=THREE.SRGBColorSpace;dot.magFilter=THREE.LinearFilter;dot.minFilter=THREE.LinearMipmapLinearFilter;dot.generateMipmaps=true;
 return dot;
}
let streakTex=null;
function streakTexture(){
 if(streakTex)return streakTex;
 const w=16,h=64,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const across=Math.max(0,1-Math.abs(x-w/2+.5)/(w/2)),down=y/(h-1),i=(y*w+x)*4;
  // Bright at the top (the light's foot on the water), fading down the plane.
  data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(255*across*across*down*down);}
 streakTex=new THREE.DataTexture(data,w,h);streakTex.needsUpdate=true;streakTex.colorSpace=THREE.SRGBColorSpace;streakTex.magFilter=THREE.LinearFilter;
 return streakTex;
}

/**
 * Builds the harbour lights on the sea view. `update(night)` (0 by day, 1 after dark) fades them in as the daylight goes;
 * nothing else about them ever changes.
 * @param {{room:THREE.Object3D}} o
 */
export function buildOnsenNight({room}){
 const H=ONSEN_HARBOUR,group=new THREE.Group();group.name='Umi-no-yu harbour lights';room.add(group);
 const mat=map=>new THREE.MeshBasicMaterial({map,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false});
 const lightMat=mat(dotTexture()),streakMat=mat(streakTexture());
 const all=[...H.lights.map(l=>({...l,colour:H.colours[l.kind]})),{...H.mouth.green,kind:'green',colour:H.colours.green},{...H.mouth.red,kind:'red',colour:H.colours.red}];
 const lights=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),lightMat,all.length);lights.name='Harbour light';
 const d=new THREE.Object3D(),c=new THREE.Color();
 all.forEach((l,i)=>{d.position.set(l.x,l.y,H.z);d.scale.set(l.size,l.size,1);d.updateMatrix();lights.setMatrixAt(i,d.matrix);lights.setColorAt(i,c.set(l.colour));});
 const reflected=all.filter(l=>l.kind!=='window');
 const streaks=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),streakMat,reflected.length);streaks.name='Harbour light reflection';
 // On the water below the horizon: a column from the shore line down towards the bath.
 reflected.forEach((l,i)=>{const len=H.streaks.length*(l.kind==='sodium'?.7:1);d.position.set(l.x,H.horizon-.04-len/2,H.z);d.scale.set(H.streaks.width*(l.kind==='sodium'?.8:1),len,1);d.updateMatrix();streaks.setMatrixAt(i,d.matrix);streaks.setColorAt(i,c.set(l.colour));});
 for(const m of [lights,streaks]){m.frustumCulled=false;m.renderOrder=1;m.castShadow=m.receiveShadow=false;m.raycast=()=>{};m.userData.staticProp=true;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;group.add(m);}
 let shown=-1;
 const update=night=>{const k=Math.max(0,Math.min(1,(night-.15)/.55)),v=k*k*(3-2*k);if(v===shown)return;shown=v;
  lightMat.opacity=v;streakMat.opacity=v*H.streaks.opacity;group.visible=v>0;};
 update(0);
 return {group,lights,streaks,update,get glow(){return shown;}};
}
