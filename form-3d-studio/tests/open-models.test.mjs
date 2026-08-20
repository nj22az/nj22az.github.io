import assert from "node:assert/strict";
import modeling from "@jscad/modeling";
import { buildModel } from "../src/open-models.mjs";

const { intersect } = modeling.booleans;
const { measureVolume } = modeling.measurements;
const { polyhedron } = modeling.primitives;

function bounds(mesh) {
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  mesh.vertices.forEach((vertex) => {
    vertex.forEach((value, axis) => {
      minimum[axis] = Math.min(minimum[axis], value);
      maximum[axis] = Math.max(maximum[axis], value);
    });
  });
  return maximum.map((value, axis) => value - minimum[axis]);
}

function assertClosedPositiveMesh(mesh, name) {
  assert.ok(mesh.vertices.length > 3, `${name} needs vertices`);
  assert.ok(mesh.faces.length > 3, `${name} needs triangles`);
  const edges = new Map();
  let signedVolume = 0;
  mesh.faces.forEach((face) => {
    assert.equal(face.length, 3, `${name} must be triangulated`);
    assert.equal(new Set(face).size, 3, `${name} contains a repeated triangle index`);
    const [first, second, third] = face.map((index) => mesh.vertices[index]);
    assert.ok(first && second && third, `${name} references a missing vertex`);
    const firstEdge = second.map((value, axis) => value - first[axis]);
    const secondEdge = third.map((value, axis) => value - first[axis]);
    const cross = [
      firstEdge[1] * secondEdge[2] - firstEdge[2] * secondEdge[1],
      firstEdge[2] * secondEdge[0] - firstEdge[0] * secondEdge[2],
      firstEdge[0] * secondEdge[1] - firstEdge[1] * secondEdge[0]
    ];
    assert.ok(Math.hypot(...cross) > 1e-8, `${name} contains a zero-area triangle`);
    signedVolume += first[0] * (second[1] * third[2] - second[2] * third[1]) +
      first[1] * (second[2] * third[0] - second[0] * third[2]) +
      first[2] * (second[0] * third[1] - second[1] * third[0]);
    [[face[0], face[1]], [face[1], face[2]], [face[2], face[0]]].forEach(([a, b]) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const edge = edges.get(key) || { count: 0, direction: 0 };
      edge.count += 1;
      edge.direction += a < b ? 1 : -1;
      edges.set(key, edge);
    });
  });
  edges.forEach((edge) => {
    assert.equal(edge.count, 2, `${name} contains an open or non-manifold edge`);
    assert.equal(edge.direction, 0, `${name} contains inconsistent face winding`);
  });
  assert.ok(signedVolume / 6 > 0.1, `${name} must have outward winding and positive volume`);
}

for (const loadingSlot of [false, true]) {
  const ring = buildModel("cableRing", {
    ringOuterDiameter: 115,
    ringInnerDiameter: 40,
    ringHeight: 18,
    ringTray: loadingSlot,
    ringTrayWidth: 10
  });
  assert.equal(ring.solids.length, 1);
  assertClosedPositiveMesh(ring.solids[0].mesh, `cable ring${loadingSlot ? " with slot" : ""}`);
  const size = bounds(ring.solids[0].mesh);
  assert.ok(Math.abs(size[2] - 18) < 1e-6);
}

const pencilParameters = {
  pencilLength: 166,
  pencilDiameter: 8.9,
  pencilClearance: 0.4,
  pencilWall: 1.2,
  pencilCapClearance: 0.4,
  pencilEndProtection: 7,
  pencilLogo: true
};

for (const printLayout of [false, true]) {
  const pencilCase = buildModel("applePencilCase", { ...pencilParameters, pencilPrintLayout: printLayout });
  assert.equal(pencilCase.solids.length, 2, "the pill capsule must remain two separately printable parts");
  pencilCase.solids.forEach((solid) => assertClosedPositiveMesh(solid.mesh, solid.name));
  assert.match(pencilCase.solids[0].name, /Johansson vented capsule body/);
  assert.match(pencilCase.solids[1].name, /bayonet capsule cap/);
}

const assembled = buildModel("applePencilCase", { ...pencilParameters, pencilPrintLayout: false });
const bodySize = bounds(assembled.solids[0].mesh);
const capSize = bounds(assembled.solids[1].mesh);
assert.ok(bodySize[0] <= 12.11, "the main capsule body should stay near 12.1 mm wide");
assert.ok(capSize[0] <= 14.51, "the capsule cap should stay near 14.5 mm wide");
assert.ok(capSize[2] > 29 && capSize[2] < 29.3, "the cap must retain its short pharmaceutical-capsule proportion");
const bodyRadii = assembled.solids[0].mesh.vertices.map((vertex) => Math.hypot(vertex[0], vertex[1]));
const capRadii = assembled.solids[1].mesh.vertices.map((vertex) => Math.hypot(vertex[0], vertex[1]));
assert.ok(Math.min(...bodyRadii) > 0.8 && Math.min(...bodyRadii) < 0.9, "the body dome must have a real drain hole");
assert.ok(Math.min(...capRadii) > 0.8 && Math.min(...capRadii) < 0.9, "the cap pressure vent must be a real through-hole");
const assembledZ = assembled.solids.flatMap((solid) => solid.mesh.vertices.map((vertex) => vertex[2]));
assert.ok(Math.max(...assembledZ) - Math.min(...assembledZ) > 183.5,
  "the capsule must provide the requested seven millimetres of protection at each end");

const lockedCap = assembled.solids[1].mesh;
const mouthZ = Math.min(...lockedCap.vertices.map((vertex) => vertex[2]));
const lockedEntryAngle = Math.PI / 2 - 75 * Math.PI / 180;
const positiveEntryDistance = Math.min(...lockedCap.vertices
  .filter((vertex) => Math.abs(vertex[2] - mouthZ) < 1e-8 && Math.hypot(vertex[0], vertex[1]) > 7.2)
  .map((vertex) => Math.abs(Math.atan2(Math.sin(Math.atan2(vertex[1], vertex[0]) - lockedEntryAngle), Math.cos(Math.atan2(vertex[1], vertex[0]) - lockedEntryAngle)))));
assert.ok(positiveEntryDistance > 0.2, "the cap mouth must contain an open axial bayonet entry slot");

const assembledGeometries = assembled.solids.map((solid) => polyhedron({
  points: solid.mesh.vertices,
  faces: solid.mesh.faces,
  orientation: "outward"
}));
assert.ok(measureVolume(intersect(assembledGeometries[0], assembledGeometries[1])) < 1e-7,
  "the locked capsule body and cap must not intersect");

const thickWallCapsule = buildModel("applePencilCase", {
  ...pencilParameters,
  pencilWall: 2,
  pencilCapClearance: 0.25,
  pencilEndProtection: 10,
  pencilLogo: false,
  pencilPrintLayout: false
});
thickWallCapsule.solids.forEach((solid) => assertClosedPositiveMesh(solid.mesh, `thick-wall ${solid.name}`));
const thickWallGeometry = thickWallCapsule.solids.map((solid) => polyhedron({
  points: solid.mesh.vertices,
  faces: solid.mesh.faces,
  orientation: "outward"
}));
assert.ok(measureVolume(intersect(thickWallGeometry[0], thickWallGeometry[1])) < 1e-7,
  "the bayonet must remain interference-free at the thick-wall parameter limit");

console.log("open model geometry tests passed");
