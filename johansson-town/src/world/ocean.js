import * as THREE from '../../vendor/three.module.js';
import {COASTLINE} from './island-coast.js';
import {AIRPORT_ISLAND} from './airport-island.js';

// Cel-shaded Gerstner water for the island. Shared by the surrounding sea and
// the harbour basin so the whole shore reads as one body of water.
//
// Looking out from the beach it should read like a holiday postcard: a lace of foam
// where the water meets the sand, clear turquoise shallows with sunlight netting on the
// bottom, then azure, then a deep cobalt that holds right out to a pale haze on the
// horizon, with white glints winking on it. How far a point is from land decides which
// of those it is (shoreDistanceTexture below), so every shore gets its own shallows.

export const SEA_LEVEL = -.56;

const WAVES = [
  {dx: .91, dz: .41, wavelength: 22, amplitude: .11, steepness: .18, speed: .82},
  {dx: -.58, dz: .81, wavelength: 12, amplitude: .055, steepness: .2, speed: 1.05},
  {dx: .2, dz: -.98, wavelength: 6.5, amplitude: .028, steepness: .18, speed: 1.35},
  {dx: -.86, dz: -.5, wavelength: 3.4, amplitude: .012, steepness: .14, speed: 1.7},
];

const VERTEX = /* glsl */ `
#include <common>
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vHeight;
varying float vCrest;
struct Wave { vec2 dir; float wavelength; float amplitude; float steepness; float speed; };
uniform float uTime;
uniform vec2 uWaveDir[4];
uniform float uWaveLen[4];
uniform float uWaveAmp[4];
uniform float uWaveSteep[4];
uniform float uWaveSpeed[4];
void applyWave(vec2 xz, inout vec3 pos, inout vec3 tangent, inout vec3 binormal, Wave w, float t) {
  vec2 d = normalize(w.dir);
  float k = 6.28318530718 / max(w.wavelength, 0.001);
  float f = k * (dot(d, xz) - w.speed * t);
  float s = sin(f);
  float c = cos(f);
  float a = w.amplitude;
  float qak = w.steepness * a * k;
  float wa = k * a;
  pos.x += w.steepness * a * d.x * c;
  pos.y += a * s;
  pos.z += w.steepness * a * d.y * c;
  tangent += vec3(-d.x * d.x * qak * s, d.x * wa * c, -d.x * d.y * qak * s);
  binormal += vec3(-d.x * d.y * qak * s, d.y * wa * c, -d.y * d.y * qak * s);
}
void main() {
  Wave waves[4];
  for (int i = 0; i < 4; i++) {
    waves[i] = Wave(uWaveDir[i], uWaveLen[i], uWaveAmp[i], uWaveSteep[i], uWaveSpeed[i]);
  }
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec3 pos = world.xyz;
  vec2 xz = pos.xz;
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);
  // The grid is coarse (fifteen metres a cell), so far off the swell is folded into
  // long creases the ink pass draws as lines. It calms with distance instead.
  float calm = 1.0 - smoothstep(14.0, 42.0, length(pos.xz - cameraPosition.xz));
  for (int i = 0; i < 4; i++) waves[i].amplitude *= calm;
  applyWave(xz, pos, tangent, binormal, waves[0], uTime);
  applyWave(xz, pos, tangent, binormal, waves[1], uTime);
  applyWave(xz, pos, tangent, binormal, waves[2], uTime);
  applyWave(xz, pos, tangent, binormal, waves[3], uTime);
  vec3 n = normalize(cross(binormal, tangent));
  vWorldPos = pos;
  vWorldNormal = n;
  vHeight = pos.y - world.y;
  vCrest = saturate((1.0 - n.y) * 1.8 + vHeight * 0.35);
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
#include <common>
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vHeight;
varying float vCrest;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uLagoon;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uHorizon;
uniform float uFogNear;
uniform float uFogFar;
uniform sampler2D uShore;
uniform vec4 uShoreRect;
uniform float uShoreRange;
uniform float uGlint;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}
float quantize(float v, float bands) {
  return floor(v * bands + 1e-4) / bands;
}
// Metres to the nearest land, from the baked field; open water past its edge.
float shoreDistance(vec2 xz) {
  vec2 uv = (xz - uShoreRect.xy) / uShoreRect.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return uShoreRange;
  return texture2D(uShore, uv).r * uShoreRange;
}
// Sunlight focused by the ripples into a moving net on the sandy bottom.
float caustic(vec2 p, float t) {
  vec2 q = mod(p * 6.28318, 6.28318) - 250.0;
  vec2 i = q;
  float c = 1.0;
  for (int n = 0; n < 3; n++) {
    float tt = t * (1.0 - 3.5 / float(n + 1));
    i = q + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + tt) / 0.005), q.y / (cos(i.y + tt) / 0.005)));
  }
  c /= 3.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}
void main() {
  vec3 n = normalize(vWorldNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 lightDir = normalize(uSunDir);
  float dist = length(vWorldPos.xz - cameraPosition.xz);
  // Far off the swell is a texture, not a shape: let it flatten out so the distance
  // reads as calm blue rather than shimmering bands.
  n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(40.0, 140.0, dist)));

  // Depth by distance from land, the edge of each band roughened a little.
  float shore = shoreDistance(vWorldPos.xz);
  float wobble = (noise2(vWorldPos.xz * 0.07) - 0.5) * 7.0 + (noise2(vWorldPos.xz * 0.23 + 9.0) - 0.5) * 2.0;
  float d = shore + wobble * smoothstep(1.5, 8.0, shore);
  vec3 col = mix(uShallow, uLagoon, smoothstep(0.6, 4.0, d));
  col = mix(col, uMid, smoothstep(5.0, 13.0, d));
  col = mix(col, uDeep, smoothstep(12.0, 32.0, d));

  // Soft toon light: two steps of sun on the swell, never black.
  float ndl = clamp(dot(n, lightDir) * 0.5 + 0.5, 0.0, 1.0);
  col *= mix(1.0, 0.9 + 0.14 * quantize(ndl, 3.0), 1.0 - smoothstep(35.0, 90.0, dist));
  // Troughs a touch deeper, crests a touch lighter. The sea's grid is coarse, so far
  // off its swell aliases into long false bands: there it is left flat.
  float near = 1.0 - smoothstep(35.0, 90.0, dist);
  col = mix(col, uDeep, saturate(-vHeight * 0.9) * 0.35 * near);
  col = mix(col, uLagoon, saturate(vHeight * 1.4) * 0.25 * (1.0 - smoothstep(30.0, 60.0, d)) * near);
  // The sky in the water at a low angle, pale toward the horizon.
  float fresnel = pow(1.0 - saturate(dot(n, viewDir)), 4.0);
  col = mix(col, uHorizon, quantize(fresnel, 3.0) * 0.3);

  // Light on the bottom of the shallows.
  float shallows = 1.0 - smoothstep(3.0, 13.0, d);
  float net = smoothstep(0.18, 0.45, caustic(vWorldPos.xz / 5.0, uTime * 0.45));
  col = mix(col, mix(uFoam, uShallow, 0.25), net * shallows * 0.6 * (1.0 - smoothstep(25.0, 60.0, dist)));

  // Foam: a lace edge that runs up and slips back, and a broken line further out.
  float along = vWorldPos.x * 0.21 + vWorldPos.z * 0.17;
  float surge = 0.5 + 0.5 * sin(uTime * 0.9 + along);
  float lace = noise2(vWorldPos.xz * 1.6 + vec2(uTime * 0.25, 0.0)) * 0.6 + noise2(vWorldPos.xz * 4.0) * 0.4;
  float edge = 0.55 + surge * 0.6;
  float foam = step(shore + (lace - 0.5) * 0.9, edge);
  float lineAt = edge + 1.1 + surge * 0.6;
  float line = step(abs(shore - lineAt), 0.18) * step(0.45, lace);
  foam = max(foam, line);
  // Whitecaps on the steepest crests, sparing, and only near enough to resolve.
  float cap = step(0.82, vCrest + lace * 0.25) * (1.0 - smoothstep(30.0, 70.0, dist));
  foam = max(foam, cap * 0.85);

  // Glints: little white dashes across the line of sight, winking in and out.
  vec2 fwd = normalize(vWorldPos.xz - cameraPosition.xz + 1e-4);
  vec2 side = vec2(-fwd.y, fwd.x);
  float cell = 2.2;
  vec2 g = vWorldPos.xz / cell;
  vec2 gi = floor(g);
  float seed = hash12(gi);
  vec2 centre = (gi + 0.2 + 0.6 * vec2(seed, hash12(gi + 4.1))) * cell;
  vec2 rel = vWorldPos.xz - centre;
  float glintShape = length(vec2(dot(rel, side) * 0.55, dot(rel, fwd) * 0.9 / max(0.15, 1.0 - fresnel)));
  float twinkle = step(0.55, sin(uTime * (1.3 + seed * 1.7) + seed * 40.0));
  float glint = step(glintShape, 0.32) * step(seed, 0.16) * twinkle * smoothstep(5.0, 14.0, d) * (1.0 - smoothstep(60.0, 150.0, dist));

  col = mix(col, uFoam, foam);
  col = mix(col, uFoam, glint * uGlint * (1.0 - foam));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = step(0.5, pow(saturate(dot(n, halfDir)), 120.0));
  col += spec * 0.6 * uGlint * vec3(1.0, 0.98, 0.92) * (1.0 - foam);

  // Holds its colour out to a thin haze where the sea meets the sky.
  float fog = smoothstep(uFogNear, uFogFar, dist);
  col = mix(col, uHorizon, fog * fog);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * How far each patch of sea is from land, baked once into a small texture: the coast
 * of the island (island-coast.js) and the airport island offshore. Zero on land, rising
 * to `range` metres out, which counts as open water.
 */
export const SHORE_FIELD=Object.freeze({minX:-150,maxX:390,minZ:-200,maxZ:410,size:384,range:80});

function segmentDistance(px,pz,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(px-ax-dx*t,pz-az-dz*t);
}
function insidePolygon(px,pz,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,zi]=poly[i],[xj,zj]=poly[j];
    if((zi>pz)!==(zj>pz)&&px<(xj-xi)*(pz-zi)/(zj-zi)+xi)inside=!inside;
  }
  return inside;
}
function airportOutline(){
  const A=AIRPORT_ISLAND,c=Math.cos(A.yaw),s=Math.sin(A.yaw);
  // Its group turns by yaw about y, so a local (x,z) lands at x·c+z·s, −x·s+z·c.
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>{const x=u*A.halfLength,z=v*A.halfWidth;return [A.x+x*c+z*s,A.z-x*s+z*c];});
}
/** Metres from (x,z) to the nearest land, capped at SHORE_FIELD.range. */
export function shoreDistance(x,z){
  let best=SHORE_FIELD.range;
  for(const poly of [COASTLINE,airportOutline()]){
    if(insidePolygon(x,z,poly))return 0;
    for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];best=Math.min(best,segmentDistance(x,z,a[0],a[1],b[0],b[1]));}
  }
  return best;
}
let shoreTexture=null;
export function shoreDistanceTexture(){
  if(shoreTexture)return shoreTexture;
  const F=SHORE_FIELD,n=F.size,data=new Uint8Array(n*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const x=F.minX+(i+.5)/n*(F.maxX-F.minX),z=F.minZ+(j+.5)/n*(F.maxZ-F.minZ);
    const v=Math.round(shoreDistance(x,z)/F.range*255),k=(j*n+i)*4;
    data[k]=data[k+1]=data[k+2]=v;data[k+3]=255;
  }
  shoreTexture=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);
  shoreTexture.magFilter=shoreTexture.minFilter=THREE.LinearFilter;shoreTexture.wrapS=shoreTexture.wrapT=THREE.ClampToEdgeWrapping;
  shoreTexture.needsUpdate=true;
  return shoreTexture;
}

let material = null;

export function oceanMaterial() {
  if (material) return material;
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      uShore: {value: shoreDistanceTexture()},
      uShoreRect: {value: new THREE.Vector4(SHORE_FIELD.minX, SHORE_FIELD.minZ, SHORE_FIELD.maxX - SHORE_FIELD.minX, SHORE_FIELD.maxZ - SHORE_FIELD.minZ)},
      uShoreRange: {value: SHORE_FIELD.range},
      uGlint: {value: 1},
      uSunDir: {value: new THREE.Vector3(.42, .74, .53).normalize()},
      uDeep: {value: new THREE.Color(SEA.day.deep)},
      uMid: {value: new THREE.Color(SEA.day.mid)},
      uLagoon: {value: new THREE.Color(SEA.day.lagoon)},
      uShallow: {value: new THREE.Color(SEA.day.shallow)},
      uFoam: {value: new THREE.Color(SEA.day.foam)},
      uHorizon: {value: new THREE.Color(SEA.day.horizon)},
      // The camera sees 220 m; the haze closes in over the last stretch of that.
      uFogNear: {value: 95},
      uFogFar: {value: 218},
      uWaveDir: {value: WAVES.map(w => new THREE.Vector2(w.dx, w.dz))},
      uWaveLen: {value: WAVES.map(w => w.wavelength)},
      uWaveAmp: {value: WAVES.map(w => w.amplitude)},
      uWaveSteep: {value: WAVES.map(w => w.steepness)},
      uWaveSpeed: {value: WAVES.map(w => w.speed)},
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    side: THREE.FrontSide,
  });
  return material;
}

export function createSurroundingOcean() {
  const geo = new THREE.PlaneGeometry(1400, 1400, 96, 96);
  geo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(geo, oceanMaterial());
  sea.name = 'Island surrounding sea';
  sea.position.set(0, SEA_LEVEL, -300);
  sea.frustumCulled = false;
  sea.receiveShadow = false;
  sea.castShadow = false;
  return sea;
}

export function createHarbourBasin() {
  const geo = new THREE.PlaneGeometry(160, 86, 48, 32);
  geo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(geo, oceanMaterial());
  sea.name = 'Harbour basin';
  sea.position.set(0, -.5, -92.5);
  sea.receiveShadow = false;
  sea.castShadow = false;
  return sea;
}

/**
 * The height of the water surface at a point, for things that float on it or break
 * it: the same four waves the shader lifts the sea with, less their small sideways
 * drift, which at a splash's size does not show.
 */
/** How far above sea level the highest crest reaches. */
export const WAVE_REACH = WAVES.reduce((sum, w) => sum + w.amplitude, 0);

export function waveHeight(x, z, time) {
  let y = SEA_LEVEL;
  for (const w of WAVES) {
    const l = Math.hypot(w.dx, w.dz) || 1, k = Math.PI * 2 / w.wavelength;
    y += w.amplitude * Math.sin(k * ((w.dx * x + w.dz * z) / l - w.speed * time));
  }
  return y;
}

export function tickOcean(time) {
  oceanMaterial().uniforms.uTime.value = time;
}

let oceanWet = false, oceanLight = {day: 1, dusk: 0};
const lightListeners = new Set();
/** Things on the horizon that should take the same light as the sea. */
export function onOceanLight(listener) {
  lightListeners.add(listener);listener(oceanLight, oceanWet);
  return () => lightListeners.delete(listener);
}

/**
 * The sea's colours for the hour, from the same clock as the sky and the sun.
 *
 * It used to stay tropical cyan through dusk and all night, the brightest thing on the
 * screen after dark (docs/AMPLIFY-AUDIT.md, A6). Day is reef turquoise over cobalt;
 * dusk warms the shallows toward gold and the horizon toward apricot; night drops to
 * navy with a moonlit horizon. Rain greys it all a little.
 */
const SEA = {
  day:   {deep: '#1876d6', mid: '#15aae4', lagoon: '#2fd0d6', shallow: '#8deedd', horizon: '#cfeaf8', foam: '#ffffff'},
  dusk:  {deep: '#24346a', mid: '#3a6c9a', lagoon: '#6f9fa8', shallow: '#d9c39a', horizon: '#f2b88f', foam: '#ffe9d4'},
  night: {deep: '#030c1c', mid: '#0a2340', lagoon: '#123a52', shallow: '#1d4b63', horizon: '#2c3a52', foam: '#9fb3c8'},
  rain:  {deep: '#1b4f7a', mid: '#2a7393', lagoon: '#4f9ea6', shallow: '#86bdb6', horizon: '#a7bcc6', foam: '#e3eef1'},
};
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
function applySea() {
  const u = oceanMaterial().uniforms, {day, dusk} = oceanLight;
  for (const [key, uniform] of [['deep', u.uDeep], ['mid', u.uMid], ['lagoon', u.uLagoon], ['shallow', u.uShallow], ['horizon', u.uHorizon], ['foam', u.uFoam]]) {
    tmpA.set(SEA.night[key]).lerp(tmpB.set(SEA.day[key]), day);
    if (dusk > 0) tmpA.lerp(tmpB.set(SEA.dusk[key]), dusk * .85);
    if (oceanWet) tmpA.lerp(tmpB.set(SEA.rain[key]), .55 * Math.max(day, .3));
    uniform.value.copy(tmpA);
  }
  // Glints are sunlight: none after dark, few in the rain.
  u.uGlint.value = Math.max(0, day - dusk * .4) * (oceanWet ? .35 : 1);
  for (const listener of lightListeners) listener(oceanLight, oceanWet);
}

export function setOceanWeather(wet) {
  oceanWet = !!wet;applySea();
}

/** @param {{day:number,dusk:number}} light 0..1 daylight and dusk, from duskClock. */
export function setOceanLight({day = 1, dusk = 0} = {}) {
  oceanLight = {day, dusk};applySea();
}

export function isOceanMaterial(mat) {
  return !!mat?.uniforms?.uTime;
}
