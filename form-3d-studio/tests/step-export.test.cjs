const assert = require("node:assert/strict");
const { makeAP242STEP } = require("../step-export.js");

const cubeVertices = [
  [-5, -4, -3], [5, -4, -3], [5, 4, -3], [-5, 4, -3],
  [-5, -4, 3], [5, -4, 3], [5, 4, 3], [-5, 4, 3]
];
const cubeFaces = [
  [0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7],
  [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
  [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]
];
const model = {
  name: "Two-part capsule",
  solids: [
    { name: "Body", vertices: cubeVertices, faces: cubeFaces },
    { name: "Cap", vertices: cubeVertices.map(([x, y, z]) => [x + 16, y, z]), faces: cubeFaces }
  ]
};

const step = makeAP242STEP(model, {
  fileName: "capsule.step",
  timestamp: "2026-08-20T12:00:00.000Z"
});

assert.match(step, /^ISO-10303-21;/);
assert.match(step, /AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF/);
assert.equal((step.match(/TESSELLATED_SOLID\(/g) || []).length, 2);
assert.equal((step.match(/TRIANGULATED_FACE\(/g) || []).length, 2);
assert.equal((step.match(/COORDINATES_LIST\(/g) || []).length, 2);
assert.match(step, /ADVANCED_BREP_SHAPE_REPRESENTATION\('',\(#\d+,#\d+,#\d+\),#\d+\)/);
assert.match(step, /TESSELLATED_SHAPE_REPRESENTATION\('',\(#\d+,#\d+\),#\d+\)/);
assert.doesNotMatch(step, /POLY_LOOP|FACETED_BREP|CLOSED_SHELL/);
assert.match(step, /FILE_NAME\('capsule\.step'/);
assert.match(step, /END-ISO-10303-21;\s*$/);

console.log("AP242 tessellated STEP export tests passed");
