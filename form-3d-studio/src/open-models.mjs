// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Form 3D Studio contributors

import modeling from "@jscad/modeling";

const { booleans, extrusions, geometries, modifiers, primitives, transforms } = modeling;

const { subtract, union } = booleans;
const { extrudeLinear } = extrusions;
const { geom2, geom3 } = geometries;
const { generalize, retessellate } = modifiers;
const { cuboid, cylinder, polyhedron } = primitives;
const { rotateX, translate } = transforms;
const TAU = Math.PI * 2;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Number(value)));

function radialPoint(radius, angle) {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function involuteAngle(baseRadius, radius) {
  if (radius <= baseRadius) return 0;
  const parameter = Math.sqrt((radius * radius) / (baseRadius * baseRadius) - 1);
  return parameter - Math.atan(parameter);
}

function involuteGearOutline(teeth, moduleSize, boreRadius) {
  const pressureAngle = 20 * Math.PI / 180;
  const pitchRadius = teeth * moduleSize / 2;
  const baseRadius = pitchRadius * Math.cos(pressureAngle);
  const outerRadius = pitchRadius + moduleSize;
  const rootRadius = Math.max(boreRadius + moduleSize * 0.72, pitchRadius - moduleSize * 1.25);
  const pitchInvolute = involuteAngle(baseRadius, pitchRadius);
  const halfToothAngle = Math.PI / (2 * teeth);
  const flankSamples = 4;
  const points = [];

  function flankOffset(radius) {
    return halfToothAngle + pitchInvolute - involuteAngle(baseRadius, Math.max(baseRadius, radius));
  }

  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const centre = TAU * tooth / teeth;
    points.push(radialPoint(rootRadius, centre - Math.PI / teeth));
    for (let sample = 0; sample <= flankSamples; sample += 1) {
      const radius = rootRadius + (outerRadius - rootRadius) * sample / flankSamples;
      points.push(radialPoint(radius, centre - flankOffset(radius)));
    }
    for (let sample = flankSamples; sample >= 0; sample -= 1) {
      const radius = rootRadius + (outerRadius - rootRadius) * sample / flankSamples;
      points.push(radialPoint(radius, centre + flankOffset(radius)));
    }
  }
  return points;
}

function addQuad(faces, a, b, c, d) {
  faces.push([a, b, c], [a, c, d]);
}

function extrudeRingMesh(outline, boreRadius, z0, z1) {
  const vertices = [];
  const faces = [];
  const count = outline.length;
  const outerBottom = [], innerBottom = [], outerTop = [], innerTop = [];
  const startAngle = Math.atan2(outline[0][1], outline[0][0]);
  outline.forEach((point, index) => {
    const angle = startAngle + TAU * index / count;
    outerBottom.push(vertices.push([point[0], point[1], z0]) - 1);
    innerBottom.push(vertices.push([Math.cos(angle) * boreRadius, Math.sin(angle) * boreRadius, z0]) - 1);
    outerTop.push(vertices.push([point[0], point[1], z1]) - 1);
    innerTop.push(vertices.push([Math.cos(angle) * boreRadius, Math.sin(angle) * boreRadius, z1]) - 1);
  });
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count;
    addQuad(faces, outerTop[index], outerTop[next], innerTop[next], innerTop[index]);
    addQuad(faces, outerBottom[index], innerBottom[index], innerBottom[next], outerBottom[next]);
    addQuad(faces, outerBottom[index], outerBottom[next], outerTop[next], outerTop[index]);
    addQuad(faces, innerBottom[index], innerTop[index], innerTop[next], innerBottom[next]);
  }
  return { vertices, faces };
}

function meshFromProfiles(profiles, segments) {
  const vertices = [];
  const faces = [];
  const rings = profiles.map((profile) => {
    const ring = [];
    for (let index = 0; index < segments; index += 1) {
      const angle = TAU * index / segments;
      const radius = profile.radius(angle);
      ring.push(vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, profile.z]) - 1);
    }
    return ring;
  });
  for (let level = 0; level < rings.length - 1; level += 1) {
    for (let index = 0; index < segments; index += 1) {
      const next = (index + 1) % segments;
      addQuad(faces, rings[level][index], rings[level][next], rings[level + 1][next], rings[level + 1][index]);
    }
  }
  const bottomCentre = vertices.push([0, 0, profiles[0].z]) - 1;
  const topCentre = vertices.push([0, 0, profiles[profiles.length - 1].z]) - 1;
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    faces.push([bottomCentre, rings[0][next], rings[0][index]]);
    faces.push([topCentre, rings[rings.length - 1][index], rings[rings.length - 1][next]]);
  }
  return { vertices, faces };
}

function buildSpurGear(parameters) {
  const teeth = Math.round(clamp(parameters.gearTeeth, 8, 40));
  const moduleSize = clamp(parameters.gearModule, 0.6, 2);
  const thickness = clamp(parameters.gearThickness, 2, 10);
  const maximumBore = Math.max(1, teeth * moduleSize * 0.28);
  const bore = clamp(parameters.gearBore, 1.5, maximumBore * 2);
  const outline = involuteGearOutline(teeth, moduleSize, bore / 2);
  return {
    name: `${teeth}-tooth involute spur gear`,
    solids: [{ name: "Open model · Involute spur gear", mesh: extrudeRingMesh(outline, bore / 2, 0, thickness) }]
  };
}

function coarsePitch(diameter) {
  if (diameter <= 3.2) return 0.5;
  if (diameter <= 4.2) return 0.7;
  if (diameter <= 5.2) return 0.8;
  if (diameter <= 6.4) return 1;
  if (diameter <= 8.4) return 1.25;
  if (diameter <= 10.5) return 1.5;
  return 1.75;
}

function buildHexBolt(parameters) {
  const diameter = clamp(parameters.boltDiameter, 3, 12);
  const length = clamp(parameters.boltLength, 8, 50);
  const pitch = coarsePitch(diameter);
  const threadDepth = Math.min(pitch * 0.43, diameter * 0.12);
  const rootRadius = diameter / 2 - threadDepth * 0.68;
  const headHeight = diameter * 0.64;
  const headRadius = diameter * 0.91;
  const shoulderHeight = Math.max(0.6, diameter * 0.12);
  const threadLength = Math.max(pitch * 1.5, length - shoulderHeight);
  const axialSlices = Math.max(12, Math.ceil(threadLength / pitch * 8));
  const profiles = [];
  for (let slice = 0; slice <= axialSlices; slice += 1) {
    const z = threadLength * slice / axialSlices;
    profiles.push({
      z,
      radius(angle) {
        const rawPhase = z / pitch - angle / TAU;
        const phase = rawPhase - Math.floor(rawPhase);
        const ridge = 1 - Math.abs(phase - 0.5) * 2;
        return rootRadius + threadDepth * Math.max(0, ridge);
      }
    });
  }
  profiles.push({ z: length, radius: () => diameter / 2 });
  const headApothem = headRadius * Math.cos(Math.PI / 6);
  function hexRadius(angle) {
    let sector = (angle + Math.PI / 6) % (Math.PI / 3);
    if (sector < 0) sector += Math.PI / 3;
    sector -= Math.PI / 6;
    return headApothem / Math.cos(sector);
  }
  profiles.push({ z: length, radius: hexRadius });
  profiles.push({ z: length + headHeight, radius: hexRadius });
  return {
    name: `M${diameter.toFixed(1)} × ${length.toFixed(0)} threaded hex bolt`,
    solids: [{ name: "Open model · Threaded hex bolt", mesh: meshFromProfiles(profiles, 48) }]
  };
}

function triangularPrism(x0, x1, contour) {
  const points = contour.map((point) => [x0, point[0], point[1]])
    .concat(contour.map((point) => [x1, point[0], point[1]]));
  return polyhedron({
    points,
    faces: [
      [0, 2, 1], [3, 4, 5],
      [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]
    ]
  });
}

function buildLBracket(parameters) {
  const width = clamp(parameters.bracketWidth, 20, 80);
  const height = clamp(parameters.bracketHeight, 20, 80);
  const leg = clamp(parameters.bracketLeg, 18, 65);
  const thickness = clamp(parameters.bracketThickness, 2.4, 8);
  const hole = clamp(parameters.bracketHole, 2.5, Math.min(12, thickness * 2.2));
  const verticalY = -leg / 2 + thickness / 2;
  const base = cuboid({ size: [width, leg, thickness], center: [0, 0, thickness / 2] });
  const upright = cuboid({ size: [width, thickness, height], center: [0, verticalY, height / 2] });
  const gussetReach = Math.min(leg * 0.42, height * 0.38);
  const gussetWidth = Math.max(thickness * 1.35, width * 0.11);
  const gussetContour = [
    [-leg / 2 + thickness, thickness],
    [-leg / 2 + thickness + gussetReach, thickness],
    [-leg / 2 + thickness, thickness + gussetReach]
  ];
  const leftGusset = triangularPrism(-width / 2 + thickness, -width / 2 + thickness + gussetWidth, gussetContour);
  const rightGusset = triangularPrism(width / 2 - thickness - gussetWidth, width / 2 - thickness, gussetContour);
  let bracket = union(base, upright, leftGusset, rightGusset);

  const baseHoleY = Math.min(leg * 0.24, leg / 2 - hole);
  const baseHoles = [-1, 1].map((side) => cylinder({
    height: thickness + 2,
    radius: hole / 2,
    segments: 40,
    center: [side * width * 0.27, baseHoleY, thickness / 2]
  }));
  const uprightHoles = [-1, 1].map((side) => translate(
    [side * width * 0.27, verticalY, height * 0.62],
    rotateX(Math.PI / 2, cylinder({ height: thickness + 2, radius: hole / 2, segments: 40 }))
  ));
  bracket = subtract(bracket, ...baseHoles, ...uprightHoles);
  return {
    name: `${width.toFixed(0)} mm reinforced L-bracket`,
    solids: [{ name: "Open model · Reinforced L-bracket", geometry: bracket }]
  };
}

function meshFromGeometry(geometry) {
  const triangulated = generalize({ snap: true, triangulate: true }, retessellate(geometry));
  const polygons = geom3.toPolygons(triangulated);
  const vertices = [];
  const faces = [];
  const vertexMap = new Map();
  function vertexIndex(point) {
    const key = point.map((value) => Math.round(value * 10000) / 10000).join(":");
    if (vertexMap.has(key)) return vertexMap.get(key);
    const index = vertices.length;
    vertices.push(point.map((value) => Number(value)));
    vertexMap.set(key, index);
    return index;
  }
  polygons.forEach((face) => {
    if (face.vertices.length < 3) return;
    const indices = face.vertices.map(vertexIndex);
    for (let index = 1; index < indices.length - 1; index += 1) {
      if (indices[0] !== indices[index] && indices[index] !== indices[index + 1] && indices[index + 1] !== indices[0]) {
        faces.push([indices[0], indices[index], indices[index + 1]]);
      }
    }
  });
  return { vertices, faces };
}

function contourArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    area += points[index][0] * points[next][1] - points[next][0] * points[index][1];
  }
  return area / 2;
}

function geometryFromContour(contour) {
  const points = contour.points.map((point) => [Number(point[0]), Number(point[1])]);
  if (contourArea(points) < 0) points.reverse();
  return geom2.fromPoints(points);
}

function pointInContour(point, contour) {
  let inside = false;
  const points = contour.points;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const currentPoint = points[index];
    const previousPoint = points[previous];
    const crosses = (currentPoint[1] > point[1]) !== (previousPoint[1] > point[1]);
    if (!crosses) continue;
    const crossingX = (previousPoint[0] - currentPoint[0]) * (point[1] - currentPoint[1]) /
      (previousPoint[1] - currentPoint[1]) + currentPoint[0];
    if (point[0] < crossingX) inside = !inside;
  }
  return inside;
}

function contourTree(contours) {
  const nodes = contours.map((contour) => ({
    contour,
    area: Math.abs(contourArea(contour.points)),
    children: [],
    parent: null
  }));
  nodes.forEach((node) => {
    const sample = node.contour.points[0];
    const parent = nodes
      .filter((candidate) => candidate !== node && candidate.contour.hole !== node.contour.hole && candidate.area > node.area && pointInContour(sample, candidate.contour))
      .sort((first, second) => first.area - second.area)[0];
    if (parent) {
      node.parent = parent;
      parent.children.push(node);
    }
  });
  return nodes.filter((node) => !node.parent && !node.contour.hole);
}

function geometryFromContourNode(node) {
  let geometry = geometryFromContour(node.contour);
  node.children.forEach((child) => {
    geometry = subtract(geometry, geometryFromContourNode(child));
  });
  return geometry;
}

export function buildArtworkMesh(contours = [], parameters = {}) {
  const valid = contours.filter((contour) => contour && Array.isArray(contour.points) && contour.points.length >= 3);
  const roots = contourTree(valid).map(geometryFromContourNode);
  if (!roots.length) return { vertices: [], faces: [] };
  const profile = roots.length === 1 ? roots[0] : union(...roots);
  const z0 = Number(parameters.z0) || 0;
  const z1 = Math.max(z0 + 0.05, Number(parameters.z1) || z0 + 0.4);
  const artwork = translate([0, 0, z0], extrudeLinear({ height: z1 - z0 }, profile));
  return meshFromGeometry(artwork);
}

export function buildModel(type, parameters = {}) {
  let model;
  if (type === "hexBolt") model = buildHexBolt(parameters);
  else if (type === "lBracket") model = buildLBracket(parameters);
  else model = buildSpurGear(parameters);
  return {
    name: model.name,
    engine: "JSCAD 2.13.0",
    license: "MIT",
    solids: model.solids.map((solid) => ({ name: solid.name, mesh: solid.mesh || meshFromGeometry(solid.geometry) }))
  };
}
