import assert from "node:assert/strict";
import { buildArtworkMesh } from "../src/open-models.mjs";

const contours = [
  {
    hole: false,
    points: [[-10, -6], [10, -6], [10, 6], [-10, 6]]
  },
  {
    hole: true,
    points: [[-3, -2], [-3, 2], [3, 2], [3, -2]]
  }
];

const mesh = buildArtworkMesh(contours, { z0: 3.5, z1: 3.95 });
assert.ok(mesh.vertices.length > 0);
assert.ok(mesh.faces.length > 0);
assert.ok(mesh.faces.length < 100, "a simple SVG path should remain a compact mesh");
assert.ok(Math.abs(Math.min(...mesh.vertices.map((vertex) => vertex[2])) - 3.5) < 0.001);
assert.ok(Math.abs(Math.max(...mesh.vertices.map((vertex) => vertex[2])) - 3.95) < 0.001);

function containsPoint(triangle, point) {
  const [a, b, c] = triangle;
  const denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  const first = ((b[1] - c[1]) * (point[0] - c[0]) + (c[0] - b[0]) * (point[1] - c[1])) / denominator;
  const second = ((c[1] - a[1]) * (point[0] - c[0]) + (a[0] - c[0]) * (point[1] - c[1])) / denominator;
  const third = 1 - first - second;
  return first >= -1e-7 && second >= -1e-7 && third >= -1e-7;
}

const nestedMesh = buildArtworkMesh([
  { hole: false, points: [[0, 0], [12, 0], [12, 12], [0, 12]] },
  { hole: true, points: [[2, 2], [2, 10], [10, 10], [10, 2]] },
  { hole: false, points: [[4, 4], [8, 4], [8, 8], [4, 8]] }
], { z0: 0, z1: 0.5 });
const topTriangles = nestedMesh.faces
  .map((face) => face.map((index) => nestedMesh.vertices[index]))
  .filter((triangle) => triangle.every((vertex) => Math.abs(vertex[2] - 0.5) < 0.001));
assert.ok(topTriangles.some((triangle) => containsPoint(triangle, [6, 6])), "a nested black island must survive a white SVG cut-out");
assert.ok(!topTriangles.some((triangle) => containsPoint(triangle, [3, 3])), "the surrounding white SVG cut-out must remain empty");

const independentNestedShapes = buildArtworkMesh([
  { hole: false, points: [[0, 0], [20, 0], [20, 20], [0, 20]] },
  { hole: false, points: [[5, 5], [15, 5], [15, 15], [5, 15]] }
], { z0: 0, z1: 0.5 });
assert.ok(independentNestedShapes.faces.length > 0, "same-fill nested contours should be unioned rather than mistaken for a cut-out");

console.log("vector artwork extrusion tests passed");
