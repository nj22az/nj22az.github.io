import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {celFrom} from '../src/render/cel.js';
import {pixarSkin,markSkin,SKIN_MARK} from '../src/avatars/pixar-skin.js';
import {eyeShape,EYE_PARAMS} from '../src/avatars/eyes3d.js';

// A Pixar body's skin (src/avatars/pixar-skin.js; the owner's rendering brief of 26 October 2026: warm subsurface skin,
// no muddy grey or violet in its shadows, a soft rim) and the ink pass's reading of it (src/render/ink-pipeline.js).

/** A material's compile hook against a stand-in for what three hands it (cel-look.test.mjs), with the chunks the hook needs. */
function compile(material){
 const shader={uniforms:{},vertexShader:'void main(){\n#include <worldpos_vertex>\n}',
  fragmentShader:'void main(){\n#include <map_fragment>\n#include <color_fragment>\n#include <normal_fragment_begin>\n#include <lights_fragment_end>\n#include <opaque_fragment>\n}\n#include <lights_toon_pars_fragment>'};
 material.onBeforeCompile?.(shader,{});
 return shader;
}
const skinned=(rim=true)=>pixarSkin(celFrom(new THREE.MeshStandardMaterial({color:0xffffff})),{rim});

test('on skin the town\'s cool shadow tint gives way to a warm one, through a coral terminator',()=>{
 const f=compile(skinned()).fragmentShader;
 assert.ok(!f.includes('vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;'),'the cel line is replaced');
 assert.match(f,/mix\( uSkinShadow, vec3\( 1\.0 \), celBand \), pixarSkinW \)/);
 assert.match(f,/uSkinTerminator/);
 // the skin found after its colour is known (a feature's decal paints its colour at color_fragment)
 assert.ok(f.indexOf('pixarSkinW = pixarRamp')>f.indexOf('#include <color_fragment>'),'the mask after the colour');
 assert.ok(f.indexOf('pixarSkinW = pixarRamp')<f.indexOf('#include <normal_fragment_begin>'));
 assert.ok(f.indexOf('uSkinAmbient * skinLit')>f.indexOf('#include <lights_fragment_end>'),'the ambient warmed after it is gathered');
});

test('a rim round the body, none on a feature\'s decal; skin marked only while the ink pass draws',()=>{
 const body=compile(skinned()),decal=compile(skinned(false));
 assert.match(body.fragmentShader,/uRimWarm/);assert.doesNotMatch(decal.fragmentShader,/uRim \*/);
 assert.match(body.fragmentShader,new RegExp('gl_FragColor\\.a = mix\\( gl_FragColor\\.a, '+SKIN_MARK.toFixed(4)));
 assert.doesNotMatch(decal.fragmentShader,/gl_FragColor\.a = mix/,'a see-through decal writes no mark');
 assert.equal(body.uniforms.uSkinMark.value,0,'no mark outside the ink pipeline (Studio\'s editor, a comic panel)');
 markSkin(true);assert.equal(body.uniforms.uSkinMark.value,1);markSkin(false);assert.equal(body.uniforms.uSkinMark.value,0);
 // the mark is where the ink pass looks, and nothing else writes it: opaque surfaces write 1
 assert.ok(SKIN_MARK<.99&&SKIN_MARK>.97);
});

test('the hook keeps the cel material\'s own compile and caches apart',()=>{
 const plain=celFrom(new THREE.MeshStandardMaterial({color:0xffffff})),m=skinned();
 assert.notEqual(m.customProgramCacheKey(),plain.customProgramCacheKey());
 assert.ok(m.customProgramCacheKey().startsWith(plain.customProgramCacheKey()));
 assert.notEqual(skinned(false).customProgramCacheKey(),m.customProgramCacheKey());
 assert.match(compile(m).fragmentShader,/uniform vec3 uShadowTint;/,'the town\'s cel patch is still in');
});

test('a modelled eye\'s warm lid shadow and iris rings; the cartoon\'s eyes unchanged',()=>{
 const own=eyeShape('pixar','open',{rx:12,ry:12,iris:7}),cartoon=eyeShape('round','open');
 assert.equal(own.lidShadow,1);assert.equal(own.warmIris,1);
 assert.equal(cartoon.lidShadow,0);assert.equal(cartoon.warmIris,0);
 for(const k of ['lidShadow','warmIris'])assert.ok(EYE_PARAMS.includes(k),k+' has a place in the shader');
});
