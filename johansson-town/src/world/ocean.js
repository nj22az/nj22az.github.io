import * as THREE from '../../vendor/three.module.js';

// Cel-shaded Gerstner water for the peninsula. Shared by the surrounding sea and
// the harbour basin so the whole shore reads as one body of water.

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
uniform vec3 uSunDir;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uShallow;
uniform vec3 uFoam;
uniform vec3 uHorizon;
uniform vec3 uInk;
uniform float uFogNear;
uniform float uFogFar;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float quantize(float v, float bands) {
  return floor(v * bands + 1e-4) / bands;
}
void main() {
  vec3 n = normalize(vWorldNormal);
  if (!gl_FrontFacing) n = -n;
  float ripple = sin(vWorldPos.x * 4.4 + vWorldPos.z * 1.1) * cos(vWorldPos.z * 3.7 - vWorldPos.x * 0.6);
  n = normalize(n + vec3(ripple * 0.07, 0.0, ripple * 0.05));
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 lightDir = normalize(uSunDir);
  float ndl = clamp(dot(n, lightDir) * 0.65 + 0.35, 0.0, 1.0);
  float wrap = quantize(ndl, 4.0);
  float slope = quantize(clamp(n.y, 0.0, 1.0), 5.0);
  vec3 col = mix(uDeep, uMid, slope);
  col = mix(col, uShallow, wrap * 0.45);
  col = mix(col, uDeep, saturate(-vHeight * 0.28));
  float fresnel = pow(1.0 - saturate(dot(n, viewDir)), 2.6);
  fresnel = quantize(fresnel, 3.0);
  col = mix(col, uShallow, fresnel * 0.55);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = step(0.42, pow(saturate(dot(n, halfDir)), 90.0));
  float foamNoise = hash12(vWorldPos.xz * 5.4) * 0.55 + hash12(vWorldPos.xz * 12.0 + 17.0) * 0.45;
  float foam = step(0.7, vCrest * 0.92 + foamNoise * 0.16 + max(vHeight - 0.08, 0.0));
  float ink = step(0.46, vCrest) * (1.0 - foam);
  col = mix(col, uInk, ink * 0.55);
  col = mix(col, uFoam, foam);
  col += spec * vec3(1.0, 0.98, 0.92) * (1.0 - foam);
  float sparkle = step(0.93, hash12(vWorldPos.xz * 8.2)) * step(0.62, saturate(dot(n, halfDir)));
  col += sparkle * 0.18 * uFoam;
  float dist = length(vWorldPos.xz - cameraPosition.xz);
  float fog = quantize(saturate((dist - uFogNear) / max(uFogFar - uFogNear, 0.001)), 6.0);
  col = mix(col, uHorizon, fog);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

let material = null;

export function oceanMaterial() {
  if (material) return material;
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0},
      uSunDir: {value: new THREE.Vector3(.42, .74, .53).normalize()},
      uDeep: {value: new THREE.Color('#034056')},
      uMid: {value: new THREE.Color('#0b86a8')},
      uShallow: {value: new THREE.Color('#4fd4e2')},
      uFoam: {value: new THREE.Color('#f4fcff')},
      uHorizon: {value: new THREE.Color('#c5e7f7')},
      uInk: {value: new THREE.Color('#062433')},
      uFogNear: {value: 70},
      uFogFar: {value: 420},
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
  sea.name = 'Peninsula surrounding sea';
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

export function tickOcean(time) {
  oceanMaterial().uniforms.uTime.value = time;
}

export function setOceanWeather(wet) {
  const u = oceanMaterial().uniforms;
  u.uDeep.value.set(wet ? '#023848' : '#034056');
  u.uMid.value.set(wet ? '#0a6a86' : '#0b86a8');
}

export function isOceanMaterial(mat) {
  return !!mat?.uniforms?.uTime;
}
