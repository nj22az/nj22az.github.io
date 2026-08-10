export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const DEFAULT_MAX_DIMENSION = 2400;

export const PRESETS = Object.freeze({
  logo: {
    label: "Logo / Icon",
    description: "Sharp edges and a restrained palette.",
    engine: "vtracer", colorMode: "color", maxColors: 6, speckle: 8,
    curveMode: "spline", cornerThreshold: 60, simplify: 1.4, pathPrecision: 2,
    layering: "cutout", clustering: "color-cluster", optimize: true,
    outputStyle: "fill", removeBackground: true, backgroundTolerance: 10
  },
  lineArt: {
    label: "Line art / Signature",
    description: "Clean black paths for drawings, signatures and engravings.",
    engine: "vtracer", colorMode: "bw", maxColors: 2, speckle: 4,
    curveMode: "spline", cornerThreshold: 60, simplify: 1.05, pathPrecision: 2,
    layering: "cutout", clustering: "bw", threshold: 168, adaptive: false,
    adaptiveWindow: 0, adaptiveSensitivity: 15, optimize: true,
    outputStyle: "fill", removeBackground: true, backgroundTolerance: 12
  },
  illustration: {
    label: "Illustration / Poster",
    description: "Balanced colour regions with smooth, economical curves.",
    engine: "vtracer", colorMode: "color", maxColors: 12, speckle: 5,
    curveMode: "spline", cornerThreshold: 60, simplify: 1.1, pathPrecision: 2,
    layering: "cutout", clustering: "color-cluster", optimize: true,
    outputStyle: "fill", removeBackground: false, backgroundTolerance: 8
  },
  photo: {
    label: "Photo",
    description: "More colour layers and detail for photographic material.",
    engine: "vtracer", colorMode: "color", maxColors: 32, speckle: 3,
    curveMode: "spline", cornerThreshold: 60, simplify: 0.65, pathPrecision: 2,
    layering: "stacked", clustering: "watershed", watershedDetail: 176,
    optimize: true, outputStyle: "fill", removeBackground: false, backgroundTolerance: 8
  },
  pixelArt: {
    label: "Pixel art / Retro",
    description: "Square pixel boundaries with no smoothing.",
    engine: "vtracer", colorMode: "color", maxColors: 16, speckle: 0,
    curveMode: "pixel", cornerThreshold: 90, simplify: 0, pathPrecision: 0,
    layering: "cutout", clustering: "color-cluster", optimize: true,
    outputStyle: "fill", removeBackground: false, backgroundTolerance: 4
  },
  keychain: {
    label: "3D keychain",
    description: "Bold monochrome contours suitable for a thin printed layer.",
    engine: "vtracer", colorMode: "bw", maxColors: 2, speckle: 10,
    curveMode: "spline", cornerThreshold: 60, simplify: 1.9, pathPrecision: 2,
    layering: "cutout", clustering: "bw", threshold: 130, adaptive: false,
    adaptiveWindow: 0, adaptiveSensitivity: 15, optimize: true,
    outputStyle: "fill", removeBackground: true, backgroundTolerance: 14,
    whiteBackground: true, maxDimension: 512
  }
});

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value)));
}

export function normaliseOptions(input = {}) {
  const base = PRESETS[input.preset] || PRESETS.illustration;
  const options = { ...base, ...input };
  return {
    ...options,
    preset: PRESETS[input.preset] ? input.preset : "illustration",
    engine: ["vtracer", "potrace", "imagetracer"].includes(options.engine) ? options.engine : "vtracer",
    colorMode: options.colorMode === "bw" ? "bw" : "color",
    maxColors: Math.round(clamp(options.maxColors || base.maxColors, 2, 64)),
    speckle: Math.round(clamp(options.speckle ?? base.speckle, 0, 128)),
    curveMode: ["pixel", "polygon", "spline"].includes(options.curveMode) ? options.curveMode : "spline",
    cornerThreshold: clamp(options.cornerThreshold ?? 60, 0, 180),
    simplify: clamp(options.simplify ?? 1, 0, 5),
    pathPrecision: Math.round(clamp(options.pathPrecision ?? 2, 0, 4)),
    layering: options.layering === "stacked" ? "stacked" : "cutout",
    clustering: ["color-cluster", "bw", "watershed"].includes(options.clustering) ? options.clustering : (options.colorMode === "bw" ? "bw" : "color-cluster"),
    threshold: Math.round(clamp(options.threshold ?? 168, 0, 255)),
    adaptive: Boolean(options.adaptive),
    adaptiveWindow: Math.round(clamp(options.adaptiveWindow || 0, 0, 255)),
    adaptiveSensitivity: clamp(options.adaptiveSensitivity ?? 15, 1, 40),
    watershedDetail: Math.round(clamp(options.watershedDetail ?? 160, 0, 255)),
    optimize: options.optimize !== false,
    outputStyle: options.outputStyle === "stroke" ? "stroke" : "fill",
    removeBackground: Boolean(options.removeBackground),
    backgroundTolerance: clamp(options.backgroundTolerance ?? 10, 0, 40),
    maxDimension: Math.round(clamp(options.maxDimension || DEFAULT_MAX_DIMENSION, 256, 4096))
  };
}

function colourDistanceSquared(first, second) {
  const red = first[0] - second[0];
  const green = first[1] - second[1];
  const blue = first[2] - second[2];
  return red * red + green * green + blue * blue;
}

function backgroundSample(data, width, height) {
  const sampleRadius = Math.max(1, Math.round(Math.min(width, height) * 0.018));
  const centres = [
    [sampleRadius, sampleRadius], [width - sampleRadius - 1, sampleRadius],
    [sampleRadius, height - sampleRadius - 1], [width - sampleRadius - 1, height - sampleRadius - 1]
  ];
  const sum = [0, 0, 0];
  let count = 0;
  centres.forEach(([centreX, centreY]) => {
    for (let y = centreY - sampleRadius; y <= centreY + sampleRadius; y += 1) {
      for (let x = centreX - sampleRadius; x <= centreX + sampleRadius; x += 1) {
        const safeX = Math.max(0, Math.min(width - 1, x));
        const safeY = Math.max(0, Math.min(height - 1, y));
        const index = (safeY * width + safeX) * 4;
        if (data[index + 3] < 96) continue;
        sum[0] += data[index]; sum[1] += data[index + 1]; sum[2] += data[index + 2];
        count += 1;
      }
    }
  });
  return count ? sum.map((value) => value / count) : [255, 255, 255];
}

export function preprocessPixels(pixels, width, height, options = {}) {
  const settings = normaliseOptions(options);
  const output = new Uint8ClampedArray(pixels);
  if (!settings.removeBackground) return output;
  const background = backgroundSample(output, width, height);
  const maximumDistance = Math.sqrt(3 * 255 * 255);
  const toleranceSquared = Math.pow(settings.backgroundTolerance / 100 * maximumDistance, 2);
  for (let index = 0; index < output.length; index += 4) {
    if (colourDistanceSquared([output[index], output[index + 1], output[index + 2]], background) <= toleranceSquared) {
      output[index] = 255; output[index + 1] = 255; output[index + 2] = 255; output[index + 3] = 0;
    }
  }
  return output;
}

export function applyOutputStyle(svg, preference) {
  if (preference !== "stroke") return svg;
  return svg.replace(/<path\b([^>]*)>/gi, (tag, attributes) => {
    const fill = /\bfill=(['"])(.*?)\1/i.exec(attributes)?.[2] || "#111111";
    const cleaned = attributes.replace(/\sfill=(['"])(.*?)\1/ig, "").replace(/\sstroke=(['"])(.*?)\1/ig, "");
    return `<path${cleaned} fill="none" stroke="${fill}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">`;
  });
}

export function svgStatistics(svg) {
  const paths = svg.match(/<path\b/gi) || [];
  const pathData = [...svg.matchAll(/\bd=(['"])(.*?)\1/gi)].map((match) => match[2]);
  const nodes = pathData.reduce((total, data) => total + (data.match(/[MLHVCSQTA]/gi) || []).length, 0);
  const colours = new Set([...svg.matchAll(/\b(?:fill|stroke)=(['"])(#[0-9a-f]{3,8}|rgb\([^)]*\))\1/gi)].map((match) => match[2].toLowerCase()));
  return {
    bytes: new TextEncoder().encode(svg).byteLength,
    paths: paths.length,
    nodes,
    colours: colours.size
  };
}

function signedArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    area += points[index][0] * points[next][1] - points[next][0] * points[index][1];
  }
  return area / 2;
}

function pointInPolygon(point, points) {
  let inside = false;
  for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
    const a = points[current], b = points[previous];
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function lineDistance(point, start, end) {
  const dx = end[0] - start[0], dy = end[1] - start[1];
  if (!dx && !dy) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / Math.hypot(dx, dy);
}

function flattenCubic(start, first, second, end, tolerance, output, depth = 0) {
  if (depth >= 10 || Math.max(lineDistance(first, start, end), lineDistance(second, start, end)) <= tolerance) {
    output.push(end); return;
  }
  const a = [(start[0] + first[0]) / 2, (start[1] + first[1]) / 2];
  const b = [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2];
  const c = [(second[0] + end[0]) / 2, (second[1] + end[1]) / 2];
  const d = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const e = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];
  const middle = [(d[0] + e[0]) / 2, (d[1] + e[1]) / 2];
  flattenCubic(start, a, d, middle, tolerance, output, depth + 1);
  flattenCubic(middle, e, c, end, tolerance, output, depth + 1);
}

function flattenQuadratic(start, control, end, tolerance, output, depth = 0) {
  if (depth >= 10 || lineDistance(control, start, end) <= tolerance) {
    output.push(end); return;
  }
  const a = [(start[0] + control[0]) / 2, (start[1] + control[1]) / 2];
  const b = [(control[0] + end[0]) / 2, (control[1] + end[1]) / 2];
  const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  flattenQuadratic(start, a, middle, tolerance, output, depth + 1);
  flattenQuadratic(middle, b, end, tolerance, output, depth + 1);
}

function flattenArc(start, radiusX, radiusY, rotation, largeArc, sweep, end, tolerance, output) {
  radiusX = Math.abs(radiusX); radiusY = Math.abs(radiusY);
  if (!radiusX || !radiusY || (start[0] === end[0] && start[1] === end[1])) { output.push(end); return; }
  const phi = rotation * Math.PI / 180;
  const cosine = Math.cos(phi), sine = Math.sin(phi);
  const dx = (start[0] - end[0]) / 2, dy = (start[1] - end[1]) / 2;
  const transformedX = cosine * dx + sine * dy;
  const transformedY = -sine * dx + cosine * dy;
  let radii = transformedX * transformedX / (radiusX * radiusX) + transformedY * transformedY / (radiusY * radiusY);
  if (radii > 1) { const scale = Math.sqrt(radii); radiusX *= scale; radiusY *= scale; }
  const numerator = Math.max(0, radiusX * radiusX * radiusY * radiusY - radiusX * radiusX * transformedY * transformedY - radiusY * radiusY * transformedX * transformedX);
  const denominator = radiusX * radiusX * transformedY * transformedY + radiusY * radiusY * transformedX * transformedX;
  const factor = (largeArc === sweep ? -1 : 1) * Math.sqrt(denominator ? numerator / denominator : 0);
  const centreXPrime = factor * radiusX * transformedY / radiusY;
  const centreYPrime = factor * -radiusY * transformedX / radiusX;
  const centreX = cosine * centreXPrime - sine * centreYPrime + (start[0] + end[0]) / 2;
  const centreY = sine * centreXPrime + cosine * centreYPrime + (start[1] + end[1]) / 2;
  const vectorAngle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const ux = (transformedX - centreXPrime) / radiusX, uy = (transformedY - centreYPrime) / radiusY;
  const vx = (-transformedX - centreXPrime) / radiusX, vy = (-transformedY - centreYPrime) / radiusY;
  let startAngle = Math.atan2(uy, ux);
  let delta = vectorAngle(ux, uy, vx, vy);
  if (!sweep && delta > 0) delta -= Math.PI * 2;
  if (sweep && delta < 0) delta += Math.PI * 2;
  const radius = Math.max(radiusX, radiusY);
  const step = Math.max(0.04, 2 * Math.acos(Math.max(-1, Math.min(1, 1 - tolerance / Math.max(1, radius)))));
  const segments = Math.max(2, Math.min(192, Math.ceil(Math.abs(delta) / step)));
  for (let index = 1; index <= segments; index += 1) {
    const angle = startAngle + delta * index / segments;
    output.push([
      centreX + cosine * radiusX * Math.cos(angle) - sine * radiusY * Math.sin(angle),
      centreY + sine * radiusX * Math.cos(angle) + cosine * radiusY * Math.sin(angle)
    ]);
  }
}

export function flattenPathData(data, tolerance = 0.7) {
  const tokens = data.match(/[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  const contours = [];
  let index = 0, command = "", x = 0, y = 0, startX = 0, startY = 0;
  let points = [], previousCubic = null, previousQuadratic = null;
  const isCommand = (token) => /^[A-Za-z]$/.test(token);
  const number = () => Number(tokens[index++]);
  const finish = () => {
    const cleaned = points.filter((point, pointIndex) => !pointIndex || Math.hypot(point[0] - points[pointIndex - 1][0], point[1] - points[pointIndex - 1][1]) > 1e-6);
    if (cleaned.length > 2 && Math.hypot(cleaned[0][0] - cleaned[cleaned.length - 1][0], cleaned[0][1] - cleaned[cleaned.length - 1][1]) < 1e-6) cleaned.pop();
    if (cleaned.length >= 3 && Math.abs(signedArea(cleaned)) > 1e-5) contours.push(cleaned);
    points = [];
  };
  while (index < tokens.length) {
    if (isCommand(tokens[index])) command = tokens[index++];
    if (!command) break;
    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();
    if (upper === "Z") {
      if (points.length) points.push([startX, startY]);
      x = startX; y = startY; finish(); command = ""; previousCubic = previousQuadratic = null; continue;
    }
    const originX = x, originY = y;
    if (upper === "M") {
      if (points.length) finish();
      x = number() + (relative ? originX : 0); y = number() + (relative ? originY : 0);
      startX = x; startY = y; points = [[x, y]]; command = relative ? "l" : "L";
    } else if (upper === "L") {
      x = number() + (relative ? originX : 0); y = number() + (relative ? originY : 0); points.push([x, y]);
    } else if (upper === "H") {
      x = number() + (relative ? originX : 0); points.push([x, y]);
    } else if (upper === "V") {
      y = number() + (relative ? originY : 0); points.push([x, y]);
    } else if (upper === "C") {
      const first = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      const second = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      const end = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      flattenCubic([x, y], first, second, end, tolerance, points); [x, y] = end; previousCubic = second; previousQuadratic = null;
    } else if (upper === "S") {
      const first = previousCubic ? [2 * x - previousCubic[0], 2 * y - previousCubic[1]] : [x, y];
      const second = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      const end = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      flattenCubic([x, y], first, second, end, tolerance, points); [x, y] = end; previousCubic = second; previousQuadratic = null;
    } else if (upper === "Q") {
      const control = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      const end = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      flattenQuadratic([x, y], control, end, tolerance, points); [x, y] = end; previousQuadratic = control; previousCubic = null;
    } else if (upper === "T") {
      const control = previousQuadratic ? [2 * x - previousQuadratic[0], 2 * y - previousQuadratic[1]] : [x, y];
      const end = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      flattenQuadratic([x, y], control, end, tolerance, points); [x, y] = end; previousQuadratic = control; previousCubic = null;
    } else if (upper === "A") {
      const radiusX = number(), radiusY = number(), rotation = number(), largeArc = Boolean(number()), sweep = Boolean(number());
      const end = [number() + (relative ? originX : 0), number() + (relative ? originY : 0)];
      flattenArc([x, y], radiusX, radiusY, rotation, largeArc, sweep, end, tolerance, points); [x, y] = end; previousCubic = previousQuadratic = null;
    } else {
      throw new Error(`Unsupported SVG path command: ${command}`);
    }
    if (upper !== "C" && upper !== "S") previousCubic = null;
    if (upper !== "Q" && upper !== "T") previousQuadratic = null;
    if (index < tokens.length && isCommand(tokens[index])) continue;
  }
  if (points.length) finish();
  return contours;
}

const identityMatrix = () => [1, 0, 0, 1, 0, 0];
function multiplyMatrix(first, second) {
  return [
    first[0] * second[0] + first[2] * second[1], first[1] * second[0] + first[3] * second[1],
    first[0] * second[2] + first[2] * second[3], first[1] * second[2] + first[3] * second[3],
    first[0] * second[4] + first[2] * second[5] + first[4], first[1] * second[4] + first[3] * second[5] + first[5]
  ];
}

function parseTransform(value = "") {
  let matrix = identityMatrix();
  for (const match of value.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/gi)) {
    const values = match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    let operation = identityMatrix();
    if (match[1] === "matrix" && values.length >= 6) operation = values.slice(0, 6);
    else if (match[1] === "translate") operation = [1, 0, 0, 1, values[0] || 0, values[1] || 0];
    else if (match[1] === "scale") operation = [values[0] ?? 1, 0, 0, values[1] ?? values[0] ?? 1, 0, 0];
    else if (match[1] === "rotate") {
      const angle = (values[0] || 0) * Math.PI / 180, cosine = Math.cos(angle), sine = Math.sin(angle);
      operation = [cosine, sine, -sine, cosine, 0, 0];
      if (values.length >= 3) operation = multiplyMatrix(multiplyMatrix([1, 0, 0, 1, values[1], values[2]], operation), [1, 0, 0, 1, -values[1], -values[2]]);
    } else if (match[1] === "skewX") operation = [1, 0, Math.tan((values[0] || 0) * Math.PI / 180), 1, 0, 0];
    else if (match[1] === "skewY") operation = [1, Math.tan((values[0] || 0) * Math.PI / 180), 0, 1, 0, 0];
    matrix = multiplyMatrix(matrix, operation);
  }
  return matrix;
}

function attribute(attributes, name) {
  return new RegExp(`\\b${name}=(['\"])(.*?)\\1`, "i").exec(attributes)?.[2];
}

function transformPoint(point, matrix) {
  return [matrix[0] * point[0] + matrix[2] * point[1] + matrix[4], matrix[1] * point[0] + matrix[3] * point[1] + matrix[5]];
}

function isWhite(fill) {
  const value = String(fill || "").replace(/\s/g, "").toLowerCase();
  return value === "white" || value === "#fff" || value === "#ffffff" || value === "rgb(255,255,255)" || value === "rgba(255,255,255,1)";
}

export function extractContoursFromSvg(svg, tolerance = 0.7) {
  const viewBoxMatch = /\bviewBox=(['"])(.*?)\1/i.exec(svg);
  const viewBox = viewBoxMatch ? viewBoxMatch[2].trim().split(/[\s,]+/).map(Number) : [0, 0, Number(/\bwidth=(['"])([\d.]+)/i.exec(svg)?.[2]) || 100, Number(/\bheight=(['"])([\d.]+)/i.exec(svg)?.[2]) || 100];
  const width = Math.max(1, viewBox[2] || 100), height = Math.max(1, viewBox[3] || 100);
  const stack = [{ matrix: identityMatrix(), fill: "#000000", fillRule: "nonzero" }];
  const contours = [];
  const tags = svg.match(/<\/?g\b[^>]*>|<path\b[^>]*>/gi) || [];
  tags.forEach((tag) => {
    if (/^<\/g/i.test(tag)) { if (stack.length > 1) stack.pop(); return; }
    const attributes = tag.replace(/^<\w+\b|\/?\s*>$/g, "");
    if (/^<g\b/i.test(tag)) {
      const parent = stack[stack.length - 1];
      stack.push({
        matrix: multiplyMatrix(parent.matrix, parseTransform(attribute(attributes, "transform"))),
        fill: attribute(attributes, "fill") || parent.fill,
        fillRule: attribute(attributes, "fill-rule") || parent.fillRule
      });
      return;
    }
    const parent = stack[stack.length - 1];
    const fill = attribute(attributes, "fill") || parent.fill;
    if (fill === "none" || fill === "transparent" || isWhite(fill)) return;
    const data = attribute(attributes, "d");
    if (!data) return;
    const matrix = multiplyMatrix(parent.matrix, parseTransform(attribute(attributes, "transform")));
    const subpaths = flattenPathData(data, tolerance).map((points) => points.map((point) => transformPoint(point, matrix)));
    subpaths.forEach((points) => {
      const area = Math.abs(signedArea(points));
      const depth = subpaths.filter((candidate) => candidate !== points && Math.abs(signedArea(candidate)) > area && pointInPolygon(points[0], candidate)).length;
      contours.push({ points, hole: depth % 2 === 1, area, fill });
    });
  });
  return { width, height, viewBox, contours };
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, unit)).toFixed(unit ? 1 : 0)} ${units[unit]}`;
}
