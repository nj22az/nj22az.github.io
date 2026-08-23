import assert from "node:assert/strict";
import modeling from "@jscad/modeling";
import { HG_MARU_JOHANSSON_CONTOURS } from "../src/hg-maru-johansson.mjs";
import { buildModel } from "../src/open-models.mjs";

const { intersect } = modeling.booleans;
const { measureVolume } = modeling.measurements;
const { polyhedron } = modeling.primitives;

assert.equal(HG_MARU_JOHANSSON_CONTOURS.length, 15,
  "the HG Maru Gothic Pro wordmark must retain every filled contour and counter");
[6, 11].forEach((contourIndex) => {
  const contour = HG_MARU_JOHANSSON_CONTOURS[contourIndex];
  assert.ok(contour.some((point, index) => {
    if (index === contour.length - 1) return false;
    const next = contour[index + 1];
    return Math.abs(next[0] - point[0]) > 0.5 && Math.abs(next[1] - point[1]) > 0.65;
  }), "both HG Maru Gothic Pro N glyphs must retain their full diagonal stroke");
});

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
  pencilCapClearance: 0.7,
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
assert.ok(bodySize[0] <= 12.21, "the fused flat-face mark should keep the body near its 12.1 mm shell diameter");
assert.ok(bodySize[1] <= 14.21, "the deep bayonet lugs should remain the body's widest feature");
assert.ok(capSize[0] <= 14.93 && capSize[1] <= 15.11,
  "the deliberately oversized capsule cap should stay near 15.1 mm wide");
assert.ok(capSize[2] > 29.4 && capSize[2] < 29.6, "the cap must retain its short pharmaceutical-capsule proportion");
const bodyRadii = assembled.solids[0].mesh.vertices.map((vertex) => Math.hypot(vertex[0], vertex[1]));
const capRadii = assembled.solids[1].mesh.vertices.map((vertex) => Math.hypot(vertex[0], vertex[1]));
assert.ok(Math.min(...bodyRadii) > 0.8 && Math.min(...bodyRadii) < 0.9, "the body dome must have a real drain hole");
assert.ok(Math.min(...capRadii) > 0.8 && Math.min(...capRadii) < 0.9, "the cap pressure vent must be a real through-hole");
const assembledZ = assembled.solids.flatMap((solid) => solid.mesh.vertices.map((vertex) => vertex[2]));
const assembledMinimumZ = assembledZ.reduce((minimum, value) => Math.min(minimum, value), Infinity);
const assembledMaximumZ = assembledZ.reduce((maximum, value) => Math.max(maximum, value), -Infinity);
assert.ok(assembledMaximumZ - assembledMinimumZ > 183.5,
  "the capsule must provide the requested seven millimetres of protection at each end");

const bodyFlatOffset = 8.9 / 2 + 0.4 + 1.2 - 0.18;
const flatFaceVertices = assembled.solids[0].mesh.vertices.filter((vertex) =>
  Math.abs(vertex[0] - bodyFlatOffset) < 1e-8 && vertex[2] > 20 && vertex[2] < 130
);
assert.ok(flatFaceVertices.length > 4000, "the Body must have a real longitudinal planar face");
assert.ok(Math.max(...flatFaceVertices.map((vertex) => vertex[1])) > 1.45 &&
  Math.min(...flatFaceVertices.map((vertex) => vertex[1])) < -1.45,
  "the Pencil-style flat must be wide enough to carry the mark");
const raisedLogoVertices = assembled.solids[0].mesh.vertices.filter((vertex) =>
  vertex[0] > bodyFlatOffset + 0.2
);
assert.ok(Math.max(...assembled.solids[0].mesh.vertices.map((vertex) => vertex[0])) > bodyFlatOffset + 0.25,
  "the JOHANSSON © strokes must be raised from and fused to the flat face");
assert.ok(Math.max(...raisedLogoVertices.map((vertex) => vertex[2])) -
  Math.min(...raisedLogoVertices.map((vertex) => vertex[2])) > 22,
  "the readable wordmark must run in one line along the Pencil's long axis");
assert.ok(Math.max(...raisedLogoVertices.map((vertex) => vertex[1])) -
  Math.min(...raisedLogoVertices.map((vertex) => vertex[1])) < 2.85,
  "the wordmark must remain inside the narrow Pencil-style flat");
const logoMinimumZ = Math.min(...raisedLogoVertices.map((vertex) => vertex[2]));
const logoMaximumZ = Math.max(...raisedLogoVertices.map((vertex) => vertex[2]));
const oppositeOuterSurface = assembled.solids[0].mesh.vertices.filter((vertex) => {
  const radius = Math.hypot(vertex[0], vertex[1]);
  return vertex[0] < 0 && vertex[2] >= logoMinimumZ && vertex[2] <= logoMaximumZ &&
    radius > 8.9 / 2 + 0.4 + 1.2 - 0.5;
});
assert.ok(Math.min(...oppositeOuterSurface.map((vertex) => Math.hypot(vertex[0], vertex[1]))) >
  8.9 / 2 + 0.4 + 1.2 - 1e-8,
  "the JOHANSSON © relief must affect only the +X flat face, never the opposite side");

const bodyWithoutLogo = buildModel("applePencilCase", {
  ...pencilParameters,
  pencilLogo: false,
  pencilPrintLayout: false
}).solids[0].mesh;
assert.ok(Math.abs(Math.max(...bodyWithoutLogo.vertices.map((vertex) => vertex[0])) - bodyFlatOffset) < 1e-8,
  "turning off the mark must leave the underlying planar face intact");

const capFlatOffset = 8.9 / 2 + 0.4 + 1.2 - 0.2 + 0.7 + 1.0 - 0.18;
assert.ok(Math.abs(Math.max(...assembled.solids[1].mesh.vertices.map((vertex) => vertex[0])) - capFlatOffset) < 1e-8,
  "the Cap flat must align with the Body flat in the locked position");
const alignedCapFlat = assembled.solids[1].mesh.vertices.filter((vertex) =>
  Math.abs(vertex[0] - capFlatOffset) < 1e-8 && vertex[2] > 150 && vertex[2] < 174
);
assert.ok(alignedCapFlat.length > 70 &&
  Math.max(...alignedCapFlat.map((vertex) => vertex[1])) > 1.6 &&
  Math.min(...alignedCapFlat.map((vertex) => vertex[1])) < -1.6,
  "the locked Cap must present a real planar face in the same direction as the Body");

const lockedCap = assembled.solids[1].mesh;
const mouthZ = Math.min(...lockedCap.vertices.map((vertex) => vertex[2]));
const neckRadius = 8.9 / 2 + 0.4 + 1.2 - 0.2;
const mouthRadii = lockedCap.vertices
  .filter((vertex) => Math.abs(vertex[2] - mouthZ) < 1e-8)
  .map((vertex) => Math.hypot(vertex[0], vertex[1]));
assert.ok(Math.abs(Math.min(...mouthRadii) - (neckRadius + 0.7)) < 1e-8,
  "the cap wall must have a deliberate 0.70 mm radial air gap around the Body neck");
assert.ok(Math.abs(Math.max(...bodyRadii) - (neckRadius + 0.7 + 0.55)) < 1e-8,
  "the lugs must retain 0.55 mm radial engagement independently of the loose cap gap");

const defaultCavityRadius = 8.9 / 2 + 0.4;
const defaultShoulder = 166 + 7 * 2 - 22 - Math.sqrt(defaultCavityRadius ** 2 - 0.85 ** 2) * 2;
const defaultTrackCenter = 7.5 - 2.2;
const defaultTrackHeight = 1.2 + 0.4 * 2;
const defaultPocketLow = defaultTrackCenter - defaultTrackHeight / 2 - 0.65;
const defaultLugCenter = defaultShoulder + defaultPocketLow + 1.2 / 2 + 0.18;
function upperLugRow(offset) {
  return bodyWithoutLogo.vertices.filter((vertex) => {
    const radius = Math.hypot(vertex[0], vertex[1]);
    return vertex[1] > 0 && Math.abs(vertex[2] - (defaultLugCenter + offset)) < 1e-7 &&
      radius > neckRadius + 0.01;
  });
}
const centralLugRow = upperLugRow(0);
const roundedLugShoulderRow = upperLugRow(0.5);
assert.ok(centralLugRow.length > 12 && roundedLugShoulderRow.length > 8,
  "the rounded lug must retain a broad central contact pad and a supported shoulder");
const centralLugSpan = Math.max(...centralLugRow.map((vertex) => vertex[0])) -
  Math.min(...centralLugRow.map((vertex) => vertex[0]));
const roundedLugShoulderSpan = Math.max(...roundedLugShoulderRow.map((vertex) => vertex[0])) -
  Math.min(...roundedLugShoulderRow.map((vertex) => vertex[0]));
assert.ok(centralLugSpan - roundedLugShoulderSpan > 0.25,
  "the lug footprint must taper through genuinely rounded corners instead of a sharp rectangle");
const upperLugDepths = bodyWithoutLogo.vertices
  .filter((vertex) => vertex[1] > 0 && Math.abs(vertex[2] - defaultLugCenter) < 0.61)
  .map((vertex) => Math.hypot(vertex[0], vertex[1]) - neckRadius)
  .filter((depth) => depth > 0.05 && depth < 1.20);
assert.ok(new Set(upperLugDepths.map((depth) => depth.toFixed(3))).size >= 5,
  "the lug edge must use a smooth multi-level radial roll rather than one hard bevel");

let roundedCutoutEdges = 0;
lockedCap.faces.forEach((face) => {
  const points = face.map((index) => lockedCap.vertices[index]);
  const radii = points.map((point) => Math.hypot(point[0], point[1]));
  if (Math.min(...radii) > neckRadius + 0.7 + 1e-5 || Math.max(...radii) < neckRadius + 1.2) return;
  for (let index = 0; index < points.length; index += 1) {
    const first = points[index];
    const second = points[(index + 1) % points.length];
    if (Math.abs(Math.hypot(first[0], first[1]) - (neckRadius + 0.7)) > 1e-5 ||
      Math.abs(Math.hypot(second[0], second[1]) - (neckRadius + 0.7)) > 1e-5) continue;
    const firstZ = first[2] - defaultShoulder;
    const secondZ = second[2] - defaultShoulder;
    if (Math.min(firstZ, secondZ) < 3.5 || Math.max(firstZ, secondZ) > 6.5) continue;
    const firstAngle = Math.atan2(first[1], first[0]) + 75 * Math.PI / 180;
    const secondAngle = Math.atan2(second[1], second[0]) + 75 * Math.PI / 180;
    const tangentChange = Math.abs(Math.atan2(
      Math.sin(secondAngle - firstAngle), Math.cos(secondAngle - firstAngle)
    ) * (neckRadius + 0.7));
    if (tangentChange > 1e-4 && Math.abs(secondZ - firstZ) > 1e-4) roundedCutoutEdges += 1;
  }
});
assert.ok(roundedCutoutEdges > 40,
  "the cap entry, track and locking pocket must contain radiused diagonal transitions");
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

function rotateVertexZ(vertex, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    vertex[0] * cosine - vertex[1] * sine,
    vertex[0] * sine + vertex[1] * cosine,
    vertex[2]
  ];
}
const lockAngle = 75 * Math.PI / 180;
const localCap = {
  vertices: lockedCap.vertices.map((vertex) =>
    rotateVertexZ([vertex[0], vertex[1], vertex[2] - defaultShoulder], lockAngle)
  )
};
const capInternalShoulder = Math.max(...localCap.vertices
  .filter((vertex) => Math.abs(Math.hypot(vertex[0], vertex[1]) - (neckRadius + 0.7)) < 1e-5)
  .map((vertex) => vertex[2]));
assert.ok(capInternalShoulder - 7.5 > 0.79,
  "the cap must provide 0.80 mm of internal overtravel for push-to-release motion");

function testRoundedRectangleDistance(x, y, x0, x1, y0, y1, radius) {
  const halfWidth = (x1 - x0) / 2;
  const halfHeight = (y1 - y0) / 2;
  const safeRadius = Math.min(radius, halfWidth, halfHeight);
  const qx = Math.abs(x - (x0 + x1) / 2) - (halfWidth - safeRadius);
  const qy = Math.abs(y - (y0 + y1) / 2) - (halfHeight - safeRadius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - safeRadius;
}
function expectedCutoutDistance(angle, z, slotCenter) {
  const innerRadius = neckRadius + 0.7;
  const slotWidth = 2.4 + 0.4 * 2;
  const trackCornerRadius = Math.min(0.36, defaultTrackHeight * 0.22, slotWidth * 0.14);
  const pocketCornerRadius = Math.min(0.30, 0.65 * 0.46, slotWidth * 0.12);
  const tangent = Math.atan2(Math.sin(angle - slotCenter), Math.cos(angle - slotCenter)) * innerRadius;
  const lockRun = lockAngle * innerRadius;
  return Math.min(
    testRoundedRectangleDistance(
      tangent, z, -slotWidth / 2, slotWidth / 2,
      -trackCornerRadius, defaultTrackCenter + defaultTrackHeight / 2, trackCornerRadius
    ),
    testRoundedRectangleDistance(
      tangent, z, -slotWidth / 2, lockRun + slotWidth / 2,
      defaultTrackCenter - defaultTrackHeight / 2,
      defaultTrackCenter + defaultTrackHeight / 2,
      trackCornerRadius
    ),
    testRoundedRectangleDistance(
      tangent, z, lockRun - slotWidth / 2, lockRun + slotWidth / 2,
      defaultPocketLow, defaultTrackCenter + defaultTrackHeight / 2,
      pocketCornerRadius
    )
  );
}
const raisedLugVertices = bodyWithoutLogo.vertices.filter((vertex) =>
  vertex[2] > defaultShoulder && Math.hypot(vertex[0], vertex[1]) > neckRadius + 0.01
);
[0, 0.5, 1].forEach((turnFraction) => {
  const maximumCutoutDistance = raisedLugVertices.reduce((maximum, vertex) => {
    const localAngle = Math.atan2(vertex[1], vertex[0]) + lockAngle * turnFraction;
    const localZ = vertex[2] - (defaultShoulder - 0.65);
    const slotCenter = vertex[1] > 0 ? Math.PI / 2 : Math.PI * 1.5;
    return Math.max(maximum, expectedCutoutDistance(localAngle, localZ, slotCenter));
  }, -Infinity);
  assert.ok(maximumCutoutDistance < -0.25,
    `the rounded lug must retain at least 0.25 mm path clearance at ${Math.round(turnFraction * 75)}°`);
});

const thickWallCapsule = buildModel("applePencilCase", {
  ...pencilParameters,
  pencilWall: 2,
  pencilCapClearance: 0.5,
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

const maximumGapCapsule = buildModel("applePencilCase", {
  ...pencilParameters,
  pencilCapClearance: 1,
  pencilLogo: false,
  pencilPrintLayout: false
});
maximumGapCapsule.solids.forEach((solid) => assertClosedPositiveMesh(solid.mesh, `maximum-gap ${solid.name}`));
const maximumGapBodyRadius = Math.max(...maximumGapCapsule.solids[0].mesh.vertices
  .map((vertex) => Math.hypot(vertex[0], vertex[1])));
const maximumGapCap = maximumGapCapsule.solids[1].mesh;
const maximumGapMouth = Math.min(...maximumGapCap.vertices.map((vertex) => vertex[2]));
const maximumGapInnerRadius = Math.min(...maximumGapCap.vertices
  .filter((vertex) => Math.abs(vertex[2] - maximumGapMouth) < 1e-8)
  .map((vertex) => Math.hypot(vertex[0], vertex[1])));
assert.ok(Math.abs(maximumGapInnerRadius - (neckRadius + 1)) < 1e-8,
  "the maximum cap gap must remain a true non-contact cylindrical clearance");
assert.ok(Math.abs(maximumGapBodyRadius - maximumGapInnerRadius - 0.55) < 1e-8,
  "increasing the loose cap gap must not reduce the bayonet lug engagement");
const maximumGapGeometry = maximumGapCapsule.solids.map((solid) => polyhedron({
  points: solid.mesh.vertices,
  faces: solid.mesh.faces,
  orientation: "outward"
}));
assert.ok(measureVolume(intersect(maximumGapGeometry[0], maximumGapGeometry[1])) < 1e-7,
  "the widest loose cap setting must remain interference-free when locked");

console.log("open model geometry tests passed");
