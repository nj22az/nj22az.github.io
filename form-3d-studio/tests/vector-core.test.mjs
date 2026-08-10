import assert from "node:assert/strict";
import vtracer from "@visioncortex/vtracer";
import {
  PRESETS,
  extractContoursFromSvg,
  flattenPathData,
  formatBytes,
  normaliseOptions,
  preprocessPixels,
  svgStatistics
} from "../image-to-svg/src/vector-core.mjs";

const keychain = normaliseOptions({ preset: "keychain", threshold: 999, maxDimension: 12 });
assert.equal(keychain.engine, "vtracer");
assert.equal(keychain.colorMode, "bw");
assert.equal(keychain.threshold, 255);
assert.equal(keychain.maxDimension, 256);
assert.equal(PRESETS.photo.clustering, "watershed");

const backgroundPixels = new Uint8ClampedArray(10 * 10 * 4).fill(250);
for (let index = 3; index < backgroundPixels.length; index += 4) backgroundPixels[index] = 255;
const foregroundIndex = (5 * 10 + 5) * 4;
backgroundPixels.set([10, 20, 30, 255], foregroundIndex);
const transparent = preprocessPixels(backgroundPixels, 10, 10, { preset: "logo", removeBackground: true, backgroundTolerance: 8 });
assert.equal(transparent[3], 0, "corner-matched background should become transparent");
assert.equal(transparent[foregroundIndex + 3], 255, "distant foreground should remain opaque");

const flattened = flattenPathData("M0 0 C20 0 20 20 40 20 S60 40 80 20 L80 60 A20 20 0 0 1 60 80 H0 Z", 0.5);
assert.equal(flattened.length, 1);
assert.ok(flattened[0].length > 12, "curves and arcs should be flattened into useful points");

const parsed = extractContoursFromSvg(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
    <g transform="translate(10 5) scale(2)">
      <path fill="#111" fill-rule="evenodd" d="M0 0h40v30H0z M10 8v14h20V8z"/>
    </g>
    <path fill="#fff" d="M0 0h120v80H0z"/>
  </svg>
`);
assert.equal(parsed.width, 120);
assert.equal(parsed.height, 80);
assert.equal(parsed.contours.length, 2);
assert.equal(parsed.contours.filter((contour) => contour.hole).length, 1);
assert.deepEqual(parsed.contours[0].points[0].map(Math.round), [10, 5]);

const statistics = svgStatistics('<svg><path fill="#000" d="M0 0L4 0L4 4Z"/><path fill="#fff" d="M1 1L2 1L2 2Z"/></svg>');
assert.equal(statistics.paths, 2);
assert.equal(statistics.nodes, 6);
assert.equal(statistics.colours, 2);
assert.match(formatBytes(1536), /^1\.5 KB$/);

const width = 48, height = 32;
const rgba = new Uint8Array(width * height * 4).fill(255);
for (let y = 5; y < 27; y += 1) {
  for (let x = 8; x < 40; x += 1) {
    const index = (y * width + x) * 4;
    rgba[index] = rgba[index + 1] = rgba[index + 2] = 0; rgba[index + 3] = 255;
  }
}
for (let index = 3; index < rgba.length; index += 4) rgba[index] = 255;
const tracedSvg = vtracer.convertPixels(rgba, width, height, {
  preset: "bw", clustering: "bw", hierarchical: "cutout", mode: "spline",
  binaryThreshold: 168, filterSpeckle: 2, simplify: 1, pathPrecision: 2, optimize: 2
});
assert.match(tracedSvg, /<svg\b/);
const traced = extractContoursFromSvg(tracedSvg);
assert.ok(traced.contours.some((contour) => !contour.hole), "VTracer output should be usable by the 3D contour bridge");

console.log("vector core and VTracer integration tests passed");
