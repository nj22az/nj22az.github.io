// The CAD model the 3D view loads (cad/pf-82/build.py → 3d/): it must match itself and the page's parameters.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DEFAULTS } from '../dsp/polivoks-dsp.js';
import { PARAMS } from '../agent.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const layout = JSON.parse(readFileSync(path.join(HERE, '..', '3d', 'pf82-layout.json'), 'utf8'));
const glb = readFileSync(path.join(HERE, '..', '3d', 'pf82.glb'));
const gltf = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString('utf8'));
const names = new Set(gltf.nodes.map((n) => n.name));

test('the GLB is glTF 2.0 binary, in metres, about the size the CAD says', () => {
  assert.equal(glb.toString('ascii', 0, 4), 'glTF'); assert.equal(glb.readUInt32LE(4), 2);
  const root = gltf.nodes[gltf.scenes[0].nodes[0]];
  assert.deepEqual(root.rotation.map((v) => +v.toFixed(4)), [-0.7071, 0, 0, 0.7071], 'Z-up CAD turned Y-up at the root');
  assert.equal(layout.size_mm.width, 640); assert.equal(layout.keys.count, 37);
});

test('every control in the layout is a node in the GLB and drives a real parameter', () => {
  for (const c of layout.controls) {
    assert.ok(names.has(c.node), `${c.node} in the GLB`);
    if (c.kind === 'jack') { if (c.param) assert.equal(c.param, 'flt.out'); continue; }
    assert.ok(c.param in DEFAULTS, `${c.param} is a parameter`);
    if (c.kind === 'selector' && PARAMS[c.param]?.options) assert.deepEqual(c.options.map(String), PARAMS[c.param].options.map(String), c.param);
  }
  const knobsOnPage = Object.keys(DEFAULTS).filter((k) => /^(vco|mix|flt|eg|lfo|glob|vca)\./.test(k) && k !== 'flt.out');
  for (const k of knobsOnPage) assert.ok(layout.controls.some((c) => c.param === k), `${k} has a control on the 3D panel`);
  for (const k of layout.keys.nodes) assert.ok(names.has(k), k);
  assert.ok(names.has('power') && names.has('led'));
});

test('controls sit inside their modules and inside the panel', () => {
  const byId = Object.fromEntries(layout.modules.map((m) => [m.id, m]));
  for (const c of layout.controls) {
    const [u0, v0, u1, v1] = byId[c.module].rect;
    assert.ok(c.u - c.r >= u0 && c.u + c.r <= u1 && c.v - c.r >= v0 && c.v + c.r <= v1, `${c.node} inside ${c.module}`);
  }
  for (const m of layout.modules) assert.ok(m.rect[2] <= layout.panel.width_mm && m.rect[3] <= layout.panel.height_mm, m.id);
});
