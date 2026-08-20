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

function transformMesh(mesh, rotateXAngle, offset, rotateZAngle = 0) {
  const cosine = Math.cos(rotateXAngle);
  const sine = Math.sin(rotateXAngle);
  const zCosine = Math.cos(rotateZAngle);
  const zSine = Math.sin(rotateZAngle);
  return {
    vertices: mesh.vertices.map((vertex) => {
      const xRotated = vertex[0];
      const yRotated = vertex[1] * cosine - vertex[2] * sine;
      const zRotated = vertex[1] * sine + vertex[2] * cosine;
      return [
        xRotated * zCosine - yRotated * zSine + offset[0],
        xRotated * zSine + yRotated * zCosine + offset[1],
        zRotated + offset[2]
      ];
    }),
    faces: mesh.faces.map((face) => face.slice())
  };
}

function shellRadiusProfiles(outerRadius, shellLength) {
  return [{ z: 0, radius: outerRadius }, { z: shellLength, radius: outerRadius }];
}

function halfShellMesh(profiles, innerRadius, startAngle, endAngle, segments = 48, relief = null) {
  const vertices = [];
  const faces = [];
  const outerRings = [];
  const innerRings = [];
  const angles = Array.from({ length: segments + 1 }, (_, step) =>
    startAngle + (endAngle - startAngle) * step / segments
  );
  if (relief && Array.isArray(relief.angles)) {
    relief.angles.forEach((angle) => {
      if (angle > startAngle && angle < endAngle) angles.push(angle);
    });
    angles.sort((first, second) => first - second);
    for (let index = angles.length - 1; index > 0; index -= 1) {
      if (Math.abs(angles[index] - angles[index - 1]) < 1e-8) angles.splice(index, 1);
    }
  }
  profiles.forEach((profile, profileIndex) => {
    const outer = [];
    const inner = profileIndex > 0 && Math.abs(profile.z - profiles[profileIndex - 1].z) < 1e-8
      ? innerRings[profileIndex - 1]
      : [];
    angles.forEach((angle, step) => {
      const reliefDepth = relief ? relief.depthAt(angle, profile.z) : 0;
      outer.push(vertices.push([
        Math.cos(angle) * (profile.radius + reliefDepth),
        Math.sin(angle) * (profile.radius + reliefDepth),
        profile.z
      ]) - 1);
      if (inner.length <= step) {
        inner.push(vertices.push([
          Math.cos(angle) * innerRadius,
          Math.sin(angle) * innerRadius,
          profile.z
        ]) - 1);
      }
    });
    outerRings.push(outer);
    innerRings.push(inner);
  });

  for (let level = 0; level < profiles.length - 1; level += 1) {
    const sameZ = Math.abs(profiles[level + 1].z - profiles[level].z) < 1e-8;
    for (let step = 0; step < angles.length - 1; step += 1) {
      addQuad(faces,
        outerRings[level][step], outerRings[level][step + 1],
        outerRings[level + 1][step + 1], outerRings[level + 1][step]);
      if (!sameZ) {
        addQuad(faces,
          innerRings[level][step], innerRings[level + 1][step],
          innerRings[level + 1][step + 1], innerRings[level][step + 1]);
      }
    }
  }

  const lastAngle = angles.length - 1;
  function addSeam(angleIndex, reverse) {
    for (let profileIndex = 0; profileIndex < profiles.length - 1; profileIndex += 1) {
      const outerLow = outerRings[profileIndex][angleIndex];
      const outerHigh = outerRings[profileIndex + 1][angleIndex];
      const innerLow = innerRings[profileIndex][angleIndex];
      const innerHigh = innerRings[profileIndex + 1][angleIndex];
      if (reverse) addQuad(faces, outerLow, innerLow, innerHigh, outerHigh);
      else addQuad(faces, outerLow, outerHigh, innerHigh, innerLow);
    }
  }
  addSeam(0, false);
  addSeam(lastAngle, true);

  for (let step = 0; step < angles.length - 1; step += 1) {
    addQuad(faces,
      outerRings[0][step], innerRings[0][step],
      innerRings[0][step + 1], outerRings[0][step + 1]);
    const top = profiles.length - 1;
    addQuad(faces,
      outerRings[top][step], outerRings[top][step + 1],
      innerRings[top][step + 1], innerRings[top][step]);
  }
  return { vertices, faces };
}

function normalizeAngle(angle) {
  const normalized = angle % TAU;
  return normalized < 0 ? normalized + TAU : normalized;
}

function angularDistance(first, second) {
  return Math.abs(Math.atan2(Math.sin(first - second), Math.cos(first - second)));
}

function bayonetCapMesh({
  capRadius,
  capHeight,
  innerRadius,
  insertionDepth,
  trackCenter,
  trackHeight,
  slotWidth,
  lockAngle,
  pocketDrop,
  segments = 96
}) {
  const vertices = [];
  const faces = [];
  const ventRadius = 0.85;
  const slotHalfAngle = slotWidth / (2 * innerRadius);
  const trackLow = trackCenter - trackHeight / 2;
  const trackHigh = trackCenter + trackHeight / 2;
  const pocketLow = trackLow - pocketDrop;
  const slotCenters = [Math.PI / 2, Math.PI * 1.5];
  const angles = Array.from({ length: segments }, (_, index) => TAU * index / segments);
  slotCenters.forEach((center) => {
    angles.push(
      normalizeAngle(center - slotHalfAngle),
      normalizeAngle(center + slotHalfAngle),
      normalizeAngle(center + lockAngle + slotHalfAngle)
    );
  });
  angles.sort((first, second) => first - second);
  for (let index = angles.length - 1; index > 0; index -= 1) {
    if (Math.abs(angles[index] - angles[index - 1]) < 1e-8) angles.splice(index, 1);
  }
  const zLevels = [0, pocketLow, trackLow, trackHigh, insertionDepth];
  const vertexMap = new Map();
  function vertex(radius, angleIndex, zIndex, zOverride = null) {
    const key = `${radius.toFixed(6)}:${angleIndex}:${zIndex}:${zOverride ?? ""}`;
    if (vertexMap.has(key)) return vertexMap.get(key);
    const angle = angles[angleIndex];
    const z = zOverride === null ? zLevels[zIndex] : zOverride;
    const index = vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, z]) - 1;
    vertexMap.set(key, index);
    return index;
  }
  function isCutout(angle, z) {
    return slotCenters.some((center) => {
      const entry = angularDistance(angle, center) < slotHalfAngle && z < trackHigh;
      const alongTrack = normalizeAngle(angle - (center - slotHalfAngle));
      const track = alongTrack < lockAngle + slotHalfAngle * 2 && z > trackLow && z < trackHigh;
      const lockingPocket = angularDistance(angle, center + lockAngle) < slotHalfAngle &&
        z > pocketLow && z < trackHigh;
      return entry || track || lockingPocket;
    });
  }
  const angleCells = angles.length;
  const zCells = zLevels.length - 1;
  const occupied = Array.from({ length: angleCells }, (_, angleIndex) => {
    const nextAngle = angleIndex === angleCells - 1 ? TAU : angles[angleIndex + 1];
    const midpointAngle = normalizeAngle((angles[angleIndex] + nextAngle) / 2);
    return Array.from({ length: zCells }, (_, zIndex) => {
      const midpointZ = (zLevels[zIndex] + zLevels[zIndex + 1]) / 2;
      return !isCutout(midpointAngle, midpointZ);
    });
  });

  for (let angleIndex = 0; angleIndex < angleCells; angleIndex += 1) {
    const nextAngle = (angleIndex + 1) % angleCells;
    const previousAngle = (angleIndex - 1 + angleCells) % angleCells;
    for (let zIndex = 0; zIndex < zCells; zIndex += 1) {
      if (!occupied[angleIndex][zIndex]) continue;
      const outer00 = vertex(capRadius, angleIndex, zIndex);
      const outer10 = vertex(capRadius, nextAngle, zIndex);
      const outer11 = vertex(capRadius, nextAngle, zIndex + 1);
      const outer01 = vertex(capRadius, angleIndex, zIndex + 1);
      const inner00 = vertex(innerRadius, angleIndex, zIndex);
      const inner10 = vertex(innerRadius, nextAngle, zIndex);
      const inner11 = vertex(innerRadius, nextAngle, zIndex + 1);
      const inner01 = vertex(innerRadius, angleIndex, zIndex + 1);
      addQuad(faces, outer00, outer10, outer11, outer01);
      addQuad(faces, inner00, inner01, inner11, inner10);

      if (!occupied[previousAngle][zIndex]) addQuad(faces, outer00, outer01, inner01, inner00);
      if (!occupied[nextAngle][zIndex]) addQuad(faces, outer10, inner10, inner11, outer11);
      if (zIndex === 0 || !occupied[angleIndex][zIndex - 1]) {
        addQuad(faces, outer00, inner00, inner10, outer10);
      }
      if (zIndex < zCells - 1 && !occupied[angleIndex][zIndex + 1]) {
        addQuad(faces, outer01, outer11, inner11, inner01);
      }
    }
  }

  const topZIndex = zLevels.length - 1;
  for (let angleIndex = 0; angleIndex < angleCells; angleIndex += 1) {
    const nextAngle = (angleIndex + 1) % angleCells;
    const outerBottom = vertex(capRadius, angleIndex, topZIndex);
    const outerBottomNext = vertex(capRadius, nextAngle, topZIndex);
    const innerBottom = vertex(innerRadius, angleIndex, topZIndex);
    const innerBottomNext = vertex(innerRadius, nextAngle, topZIndex);
    const outerTop = vertex(capRadius, angleIndex, topZIndex, capHeight);
    const outerTopNext = vertex(capRadius, nextAngle, topZIndex, capHeight);
    const ventBottom = vertex(ventRadius, angleIndex, topZIndex);
    const ventBottomNext = vertex(ventRadius, nextAngle, topZIndex);
    const ventTop = vertex(ventRadius, angleIndex, topZIndex, capHeight);
    const ventTopNext = vertex(ventRadius, nextAngle, topZIndex, capHeight);
    addQuad(faces, outerBottom, outerBottomNext, outerTopNext, outerTop);
    addQuad(faces, innerBottom, ventBottom, ventBottomNext, innerBottomNext);
    addQuad(faces, ventBottom, ventTop, ventTopNext, ventBottomNext);
    addQuad(faces, outerTop, outerTopNext, ventTopNext, ventTop);
  }
  return { vertices, faces };
}

function buildCableRing(parameters) {
  const outerDiameter = clamp(parameters.ringOuterDiameter, 45, 180);
  const maximumInnerDiameter = Math.max(20, outerDiameter - 6);
  const innerDiameter = clamp(parameters.ringInnerDiameter, 20, maximumInnerDiameter);
  const height = clamp(parameters.ringHeight, 3, 30);
  const outerRadius = outerDiameter / 2;
  const innerRadius = innerDiameter / 2;
  const outline = Array.from({ length: 96 }, (_, index) => radialPoint(outerRadius, TAU * index / 96));
  const ringMesh = extrudeRingMesh(outline, innerRadius, 0, height);
  let printableMesh = ringMesh;
  if (parameters.ringTray) {
    const slotWidth = clamp(parameters.ringTrayWidth, 4, Math.min(24, innerDiameter * 0.7));
    const halfGap = Math.asin(Math.min(0.92, slotWidth / Math.max(innerDiameter, 1)));
    printableMesh = halfShellMesh(
      [{ z: 0, radius: outerRadius }, { z: height, radius: outerRadius }],
      innerRadius,
      halfGap,
      TAU - halfGap,
      96
    );
  }

  return {
    name: `${outerDiameter.toFixed(0)} mm Johansson cable ring`,
    solids: [{ name: "Cable ring", mesh: printableMesh }]
  };
}

const LOGO_GLYPHS = Object.freeze({
  A: ["010", "101", "111", "101", "101"],
  H: ["101", "101", "111", "101", "101"],
  J: ["111", "001", "001", "101", "010"],
  N: ["101", "111", "111", "111", "101"],
  O: ["010", "101", "101", "101", "010"],
  S: ["011", "100", "010", "001", "110"]
});

function johanssonRelief(outerRadius, shellLength) {
  const word = "JOHANSSON";
  const cell = 0.8;
  const glyphAdvance = cell * 6;
  const totalLength = (word.length - 1) * glyphAdvance + cell * 5;
  const startZ = (shellLength - totalLength) / 2;
  const pixels = [];
  const zLevels = [];
  word.split("").forEach((letter, letterIndex) => {
    const rows = LOGO_GLYPHS[letter];
    rows.forEach((row, rowIndex) => {
      const z = startZ + letterIndex * glyphAdvance + (4 - rowIndex) * cell;
      [-0.5, -0.22, 0, 0.22, 0.5].forEach((offset) => zLevels.push(z + offset * cell));
      row.split("").forEach((pixel, columnIndex) => {
        if (pixel !== "1") return;
        pixels.push({ arc: (columnIndex - 1) * cell, z });
      });
    });
  });
  const angles = [];
  [-1, 0, 1].forEach((column) => {
    [-0.5, -0.22, 0, 0.22, 0.5].forEach((offset) => {
      angles.push(Math.PI / 2 + (column + offset) * cell / outerRadius);
    });
  });
  function axisDepth(distance) {
    const absolute = Math.abs(distance);
    if (absolute >= cell * 0.5) return 0;
    if (absolute <= cell * 0.22) return 1;
    return (cell * 0.5 - absolute) / (cell * 0.28);
  }
  return {
    angles,
    zLevels: [...new Set(zLevels.map((value) => value.toFixed(6)))].map(Number),
    depthAt(angle, z) {
      const arc = (angle - Math.PI / 2) * outerRadius;
      let depth = 0;
      pixels.forEach((pixel) => {
        depth = Math.max(depth, axisDepth(arc - pixel.arc) * axisDepth(z - pixel.z) * 0.32);
      });
      return depth;
    }
  };
}

function bayonetLugRelief(outerRadius, shellLength, centerAngle, dimensions) {
  const { lugDepth, lugDistance, lugHeight, lugWidth } = dimensions;
  const angularHalfWidth = lugWidth / (outerRadius * 2);
  const angularBevel = Math.min(0.18 / outerRadius, angularHalfWidth * 0.35);
  const axialHalfHeight = lugHeight / 2;
  const axialBevel = Math.min(0.16, axialHalfHeight * 0.35);
  const lugCenters = [lugDistance, shellLength - lugDistance];
  const angles = [
    centerAngle - angularHalfWidth,
    centerAngle - angularHalfWidth + angularBevel,
    centerAngle + angularHalfWidth - angularBevel,
    centerAngle + angularHalfWidth
  ];
  const zLevels = [];
  lugCenters.forEach((center) => zLevels.push(
    center - axialHalfHeight,
    center - axialHalfHeight + axialBevel,
    center + axialHalfHeight - axialBevel,
    center + axialHalfHeight
  ));
  function taperedDepth(distance, halfExtent, bevel) {
    const absolute = Math.abs(distance);
    if (absolute >= halfExtent) return 0;
    if (absolute <= halfExtent - bevel) return 1;
    return (halfExtent - absolute) / bevel;
  }
  return {
    angles,
    zLevels,
    depthAt(angle, z) {
      const angularFactor = taperedDepth((angle - centerAngle) * outerRadius, lugWidth / 2, angularBevel * outerRadius);
      let axialFactor = 0;
      lugCenters.forEach((center) => {
        axialFactor = Math.max(axialFactor, taperedDepth(z - center, axialHalfHeight, axialBevel));
      });
      return angularFactor * axialFactor * lugDepth;
    }
  };
}

function combineReliefs(...reliefs) {
  const active = reliefs.filter(Boolean);
  if (!active.length) return null;
  const angles = active.flatMap((relief) => relief.angles || []);
  const zLevels = active.flatMap((relief) => relief.zLevels || []);
  return {
    angles: [...new Set(angles.map((value) => value.toFixed(8)))].map(Number),
    zLevels: [...new Set(zLevels.map((value) => value.toFixed(8)))].map(Number),
    depthAt(angle, z) {
      return active.reduce((depth, relief) => Math.max(depth, relief.depthAt(angle, z)), 0);
    }
  };
}

function profilesWithRelief(baseProfiles, relief, outerRadius, shellLength) {
  if (!relief) return baseProfiles;
  return baseProfiles.concat(relief.zLevels
    .filter((z) => z > 0 && z < shellLength)
    .map((z) => ({ z, radius: outerRadius })))
    .sort((first, second) => first.z - second.z)
    .filter((profile, index, profiles) => index === 0 || Math.abs(profile.z - profiles[index - 1].z) > 1e-8);
}

function makeVentedBayonetCap(outerRadius, capClearance, insertionDepth, dimensions) {
  const roof = 2.0;
  const capHeight = insertionDepth + roof;
  const capWall = 1.4;
  const innerRadius = outerRadius + capClearance;
  const capRadius = innerRadius + capWall;
  const trackCenter = insertionDepth - dimensions.lugDistance;
  const trackHeight = dimensions.lugHeight + capClearance * 2;
  const slotWidth = dimensions.lugWidth + capClearance * 2;
  const lockAngle = 75 * Math.PI / 180;
  const pocketDrop = 0.45;
  return {
    mesh: bayonetCapMesh({
      capRadius,
      capHeight,
      innerRadius,
      insertionDepth,
      trackCenter,
      trackHeight,
      slotWidth,
      lockAngle,
      pocketDrop
    }),
    capHeight,
    capRadius,
    lockAngle,
    pocketDrop
  };
}

function buildApplePencilCase(parameters) {
  const pencilLength = clamp(parameters.pencilLength, 164, 168);
  const pencilDiameter = clamp(parameters.pencilDiameter, 8.6, 9.4);
  const pencilClearance = clamp(parameters.pencilClearance, 0.25, 0.7);
  const wall = clamp(parameters.pencilWall, 1.0, 2.0);
  const capClearance = clamp(parameters.pencilCapClearance, 0.25, 0.6);
  const shellLength = pencilLength + 2.0;
  const cavityRadius = pencilDiameter / 2 + pencilClearance;
  const outerRadius = cavityRadius + wall;
  const insertionDepth = 7.5;
  const bayonet = { lugDepth: 0.8, lugDistance: 2.2, lugHeight: 1.2, lugWidth: 2.4 };
  const baseProfiles = shellRadiusProfiles(outerRadius, shellLength);
  const upperLugs = bayonetLugRelief(outerRadius, shellLength, Math.PI / 2, bayonet);
  const lowerLugs = bayonetLugRelief(outerRadius, shellLength, Math.PI * 1.5, bayonet);
  const logo = parameters.pencilLogo === false ? null : johanssonRelief(outerRadius, shellLength);
  const upperRelief = combineReliefs(logo, upperLugs);
  const lowerRelief = combineReliefs(lowerLugs);
  const upperProfiles = profilesWithRelief(baseProfiles, upperRelief, outerRadius, shellLength);
  const lowerProfiles = profilesWithRelief(baseProfiles, lowerRelief, outerRadius, shellLength);
  const upperShellMesh = halfShellMesh(upperProfiles, cavityRadius, 0, Math.PI, 48, upperRelief);
  const lowerShellMesh = halfShellMesh(lowerProfiles, cavityRadius, Math.PI, TAU, 48, lowerRelief);

  const capResult = makeVentedBayonetCap(outerRadius, capClearance, insertionDepth, bayonet);
  let parts;
  if (parameters.pencilPrintLayout !== false) {
    const shellSpacing = outerRadius + bayonet.lugDepth + 3.2;
    const shellLift = outerRadius + bayonet.lugDepth + 0.55;
    const firstShell = transformMesh(upperShellMesh, -Math.PI / 2, [-shellSpacing, -shellLength / 2, shellLift]);
    const secondShell = transformMesh(lowerShellMesh, Math.PI / 2, [shellSpacing, shellLength / 2, shellLift]);
    const capSpacing = capResult.capRadius * 2.4;
    const printableCap = transformMesh(capResult.mesh, Math.PI, [0, 0, capResult.capHeight]);
    parts = [
      { name: "Johansson upper split shell", mesh: firstShell },
      { name: "Lower split shell", mesh: secondShell },
      { name: "Tip vented bayonet cap", mesh: transformMesh(printableCap, 0, [-capSpacing, 0, 0]) },
      { name: "Tail vented bayonet cap", mesh: transformMesh(printableCap, 0, [capSpacing, 0, 0]) }
    ];
  } else {
    const capMesh = capResult.mesh;
    const bottomCap = transformMesh(capMesh, Math.PI, [0, 0, insertionDepth - capResult.pocketDrop], capResult.lockAngle);
    const topCap = transformMesh(capMesh, 0, [0, 0, shellLength - insertionDepth + capResult.pocketDrop], -capResult.lockAngle);
    parts = [
      { name: "Johansson upper split shell", mesh: upperShellMesh },
      { name: "Lower split shell", mesh: lowerShellMesh },
      { name: "Tip vented bayonet cap", mesh: bottomCap },
      { name: "Tail vented bayonet cap", mesh: topCap }
    ];
  }

  return {
    name: `Johansson Apple Pencil Pro split-shell case`,
    solids: parts
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
  if (type === "cableRing") model = buildCableRing(parameters);
  else if (type === "applePencilCase") model = buildApplePencilCase(parameters);
  else if (type === "hexBolt") model = buildHexBolt(parameters);
  else if (type === "lBracket") model = buildLBracket(parameters);
  else model = buildSpurGear(parameters);
  return {
    name: model.name,
    engine: "JSCAD 2.13.0",
    license: "MIT",
    solids: model.solids.map((solid) => ({ name: solid.name, mesh: solid.mesh || meshFromGeometry(solid.geometry) }))
  };
}
