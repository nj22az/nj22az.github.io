// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Form 3D Studio contributors

import modeling from "@jscad/modeling";
import earcut from "@jscad/modeling/src/operations/extrusions/earcut/index.js";

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

function transformMesh(mesh, rotateXAngle, offset) {
  const cosine = Math.cos(rotateXAngle);
  const sine = Math.sin(rotateXAngle);
  return {
    vertices: mesh.vertices.map((vertex) => [
      vertex[0] + offset[0],
      vertex[1] * cosine - vertex[2] * sine + offset[1],
      vertex[1] * sine + vertex[2] * cosine + offset[2]
    ]),
    faces: mesh.faces.map((face) => face.slice())
  };
}

function shellRadiusProfiles(outerRadius, shellLength, beadDepth) {
  const beadWidth = 0.9;
  const beadCentres = [2.2, 5.0, shellLength - 5.0, shellLength - 2.2];
  const transitions = [{ z: 0, radius: outerRadius }];
  beadCentres.forEach((centre) => {
    transitions.push(
      { z: centre - beadWidth / 2, radius: outerRadius },
      { z: centre - beadWidth / 2, radius: outerRadius + beadDepth },
      { z: centre + beadWidth / 2, radius: outerRadius + beadDepth },
      { z: centre + beadWidth / 2, radius: outerRadius }
    );
  });
  transitions.push({ z: shellLength, radius: outerRadius });
  return transitions;
}

function triangulateSimplePolygon(points) {
  const indices = earcut(points.flat());
  const triangles = [];
  for (let index = 0; index < indices.length; index += 3) {
    triangles.push(indices.slice(index, index + 3));
  }
  return triangles;
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
    const entries = profiles.map((profile, profileIndex) => ({
      point: [profile.radius + (relief ? relief.depthAt(angles[angleIndex], profile.z) : 0), profile.z],
      vertex: outerRings[profileIndex][angleIndex]
    }));
    for (let profileIndex = profiles.length - 1; profileIndex >= 0; profileIndex -= 1) {
      const vertex = innerRings[profileIndex][angleIndex];
      if (entries.length && entries[entries.length - 1].vertex === vertex) continue;
      entries.push({ point: [innerRadius, profiles[profileIndex].z], vertex });
    }
    triangulateSimplePolygon(entries.map((entry) => entry.point)).forEach((triangle) => {
      const face = triangle.map((index) => entries[index].vertex);
      faces.push(reverse ? face.reverse() : face);
    });
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

function capInnerProfiles(baseRadius, grooveRadius, insertionDepth) {
  const grooveWidth = 1.25;
  const profiles = [{ z: 0, radius: baseRadius }];
  [2.2, 5.0].forEach((centre) => {
    profiles.push(
      { z: centre - grooveWidth / 2, radius: baseRadius },
      { z: centre - grooveWidth / 2, radius: grooveRadius },
      { z: centre + grooveWidth / 2, radius: grooveRadius },
      { z: centre + grooveWidth / 2, radius: baseRadius }
    );
  });
  profiles.push({ z: insertionDepth, radius: baseRadius });
  return profiles;
}

function snapCapMesh(capRadius, capHeight, innerProfiles, segments = 72) {
  const vertices = [];
  const faces = [];
  const outerBottom = [];
  const outerTop = [];
  const innerRings = [];
  for (let step = 0; step < segments; step += 1) {
    const angle = TAU * step / segments;
    outerBottom.push(vertices.push([Math.cos(angle) * capRadius, Math.sin(angle) * capRadius, 0]) - 1);
    outerTop.push(vertices.push([Math.cos(angle) * capRadius, Math.sin(angle) * capRadius, capHeight]) - 1);
  }
  innerProfiles.forEach((profile, profileIndex) => {
    const ring = [];
    for (let step = 0; step < segments; step += 1) {
      const angle = TAU * step / segments;
      ring.push(vertices.push([Math.cos(angle) * profile.radius, Math.sin(angle) * profile.radius, profile.z]) - 1);
    }
    innerRings.push(ring);
  });

  for (let step = 0; step < segments; step += 1) {
    const next = (step + 1) % segments;
    addQuad(faces, outerBottom[step], outerBottom[next], outerTop[next], outerTop[step]);
    addQuad(faces, outerBottom[step], innerRings[0][step], innerRings[0][next], outerBottom[next]);
  }
  for (let level = 0; level < innerProfiles.length - 1; level += 1) {
    for (let step = 0; step < segments; step += 1) {
      const next = (step + 1) % segments;
      addQuad(faces,
        innerRings[level][step], innerRings[level + 1][step],
        innerRings[level + 1][next], innerRings[level][next]);
    }
  }
  const lastInner = innerRings[innerRings.length - 1];
  const ventRadius = 0.85;
  const ventBottom = [];
  const ventTop = [];
  const roofBottom = innerProfiles[innerProfiles.length - 1].z;
  for (let step = 0; step < segments; step += 1) {
    const angle = TAU * step / segments;
    ventBottom.push(vertices.push([Math.cos(angle) * ventRadius, Math.sin(angle) * ventRadius, roofBottom]) - 1);
    ventTop.push(vertices.push([Math.cos(angle) * ventRadius, Math.sin(angle) * ventRadius, capHeight]) - 1);
  }
  for (let step = 0; step < segments; step += 1) {
    const next = (step + 1) % segments;
    addQuad(faces, lastInner[step], ventBottom[step], ventBottom[next], lastInner[next]);
    addQuad(faces, ventBottom[step], ventTop[step], ventTop[next], ventBottom[next]);
    addQuad(faces, outerTop[step], outerTop[next], ventTop[next], ventTop[step]);
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

function makeVentedSnapCap(outerRadius, wall, capClearance, insertionDepth, beadDepth) {
  const roof = 2.0;
  const capHeight = insertionDepth + roof;
  const runningGap = 0.25;
  const grooveRadius = outerRadius + beadDepth + capClearance;
  const capRadius = grooveRadius + wall;
  const innerProfiles = capInnerProfiles(outerRadius + runningGap, grooveRadius, insertionDepth);
  return {
    mesh: snapCapMesh(capRadius, capHeight, innerProfiles),
    capHeight,
    capRadius
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
  const beadDepth = 0.4;
  const insertionDepth = 7.2;
  const baseProfiles = shellRadiusProfiles(outerRadius, shellLength, beadDepth);
  let upperProfiles = baseProfiles;
  const relief = parameters.pencilLogo === false ? null : johanssonRelief(outerRadius, shellLength);
  if (relief) {
    upperProfiles = baseProfiles.concat(relief.zLevels.map((z) => ({ z, radius: outerRadius })))
      .sort((first, second) => first.z - second.z);
  }
  const upperShellMesh = halfShellMesh(upperProfiles, cavityRadius, 0, Math.PI, 48, relief);
  const lowerShellMesh = halfShellMesh(baseProfiles, cavityRadius, Math.PI, TAU);

  const capResult = makeVentedSnapCap(outerRadius, wall, capClearance, insertionDepth, beadDepth);
  let parts;
  if (parameters.pencilPrintLayout !== false) {
    const shellSpacing = outerRadius + beadDepth + 3.2;
    const shellLift = outerRadius + beadDepth + 0.55;
    const firstShell = transformMesh(upperShellMesh, -Math.PI / 2, [-shellSpacing, -shellLength / 2, shellLift]);
    const secondShell = transformMesh(lowerShellMesh, Math.PI / 2, [shellSpacing, shellLength / 2, shellLift]);
    const capSpacing = (outerRadius + beadDepth) * 3.45;
    const printableCap = transformMesh(capResult.mesh, Math.PI, [0, 0, capResult.capHeight]);
    parts = [
      { name: "Johansson upper split shell", mesh: firstShell },
      { name: "Lower split shell", mesh: secondShell },
      { name: "Tip vented snap cap", mesh: transformMesh(printableCap, 0, [-capSpacing, 0, 0]) },
      { name: "Tail vented snap cap", mesh: transformMesh(printableCap, 0, [capSpacing, 0, 0]) }
    ];
  } else {
    const capMesh = capResult.mesh;
    const bottomCap = transformMesh(capMesh, Math.PI, [0, 0, insertionDepth]);
    const topCap = transformMesh(capMesh, 0, [0, 0, shellLength - insertionDepth]);
    parts = [
      { name: "Johansson upper split shell", mesh: upperShellMesh },
      { name: "Lower split shell", mesh: lowerShellMesh },
      { name: "Tip vented snap cap", mesh: bottomCap },
      { name: "Tail vented snap cap", mesh: topCap }
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
