import assert from "node:assert/strict";
import { buildModel } from "../src/open-models.mjs";

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
  pencilLogo: true
};

for (const printLayout of [false, true]) {
  const pencilCase = buildModel("applePencilCase", { ...pencilParameters, pencilPrintLayout: printLayout });
  assert.equal(pencilCase.solids.length, 4, "the case must remain four separately printable parts");
  pencilCase.solids.forEach((solid) => assertClosedPositiveMesh(solid.mesh, solid.name));
  assert.match(pencilCase.solids[0].name, /Johansson/);
  assert.match(pencilCase.solids[2].name, /vented snap cap/);
}

const assembled = buildModel("applePencilCase", { ...pencilParameters, pencilPrintLayout: false });
const upperSize = bounds(assembled.solids[0].mesh);
const capSize = bounds(assembled.solids[2].mesh);
assert.ok(upperSize[0] <= 12.91, "the split shell should stay near 12.9 mm at its retention beads");
assert.ok(upperSize[2] >= 167.99, "the shell must protect the full 166 mm Pencil");
assert.ok(capSize[0] <= 16.11, "the closure cap should remain slim");
const capRadii = assembled.solids[3].mesh.vertices.map((vertex) => Math.hypot(vertex[0], vertex[1]));
assert.ok(Math.min(...capRadii) > 0.8 && Math.min(...capRadii) < 0.9, "the cap pressure vent must be a real through-hole");

console.log("open model geometry tests passed");
