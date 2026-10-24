"use strict";

const assert = require("node:assert/strict");
const monochrome = require("../monochrome-svg.js");

function image(width, height, colour) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    pixels[index * 4] = colour[0];
    pixels[index * 4 + 1] = colour[1];
    pixels[index * 4 + 2] = colour[2];
    pixels[index * 4 + 3] = colour.length > 3 ? colour[3] : 255;
  }
  return pixels;
}

function paint(pixels, width, x0, y0, x1, y1, colour) {
  for (let row = y0; row < y1; row += 1) {
    for (let col = x0; col < x1; col += 1) {
      const index = (row * width + col) * 4;
      pixels[index] = colour[0];
      pixels[index + 1] = colour[1];
      pixels[index + 2] = colour[2];
      pixels[index + 3] = 255;
    }
  }
}

const bounds = { x: 0, y: 0, width: 8, height: 6 };
const options = {
  thresholdBias: 50,
  removeBackground: true,
  backgroundTolerance: 5,
  smoothing: 0,
  cornerRadius: 2,
  physicalWidth: 40,
  physicalHeight: 24
};

{
  const pixels = image(8, 6, [255, 255, 255]);
  paint(pixels, 8, 3, 2, 5, 4, [0, 0, 0]);
  const result = monochrome.trace(pixels, 8, 6, bounds, options);

  assert.equal(result.blackPixels, 4, "dark subject should become the black SVG path");
  assert.equal(result.labels[2][3], 1);
  assert.equal(result.labels[0][0], -1, "the inlay should keep rounded corners");
  assert.equal(result.contours.length, 1, "one connected mark should become one vector contour");
  assert.ok(result.contours[0].points.length <= 4, "straight pixel runs should simplify to polygon corners");
  assert.deepEqual(result.palette, ["#ffffff", "#111111"]);
  assert.match(result.svg, /<rect[^>]+fill="#ffffff"/);
  assert.match(result.svg, /<path[^>]+fill="#111111"/);
  assert.match(result.svg, /width="40\.00mm" height="24\.00mm"/);
  assert.doesNotMatch(result.svg, /<image\b|data:image/i, "the SVG must contain vectors, not an embedded raster");
  assert.doesNotMatch(result.svg, /v1h-/, "the SVG must not be assembled from one rectangle per pixel row");
}

{
  const pixels = image(10, 10, [255, 255, 255]);
  paint(pixels, 10, 2, 2, 8, 8, [0, 0, 0]);
  paint(pixels, 10, 4, 4, 6, 6, [255, 255, 255]);
  const result = monochrome.trace(pixels, 10, 10, { x: 0, y: 0, width: 10, height: 10 }, { ...options, cornerRadius: 1 });

  assert.equal(result.contours.filter((contour) => !contour.hole).length, 1);
  assert.equal(result.contours.filter((contour) => contour.hole).length, 1);
  assert.match(result.svg, /fill-rule="evenodd"/);
}

{
  const pixels = image(8, 6, [0, 0, 0]);
  paint(pixels, 8, 3, 2, 5, 4, [255, 255, 255]);
  const result = monochrome.trace(pixels, 8, 6, bounds, options);

  assert.equal(result.blackPixels, 4, "a light subject on a dark background should be polarity-corrected");
  assert.equal(result.labels[2][3], 1);
  assert.equal(result.labels[1][1], 0, "removed source background becomes the white inlay body");
}

{
  const lightBackground = image(8, 6, [255, 255, 255]);
  paint(lightBackground, 8, 3, 2, 4, 3, [80, 80, 80]);
  paint(lightBackground, 8, 4, 2, 5, 3, [150, 150, 150]);
  const darkBackground = image(8, 6, [0, 0, 0]);
  paint(darkBackground, 8, 3, 2, 4, 3, [50, 50, 50]);
  paint(darkBackground, 8, 4, 2, 5, 3, [100, 100, 100]);

  const sparseLight = monochrome.trace(lightBackground, 8, 6, bounds, { ...options, thresholdBias: 15 });
  const detailedLight = monochrome.trace(lightBackground, 8, 6, bounds, { ...options, thresholdBias: 85 });
  const sparseDark = monochrome.trace(darkBackground, 8, 6, bounds, { ...options, thresholdBias: 15 });
  const detailedDark = monochrome.trace(darkBackground, 8, 6, bounds, { ...options, thresholdBias: 85 });

  assert.ok(detailedLight.blackPixels >= sparseLight.blackPixels, "black detail must increase consistently on a light background");
  assert.ok(detailedDark.blackPixels >= sparseDark.blackPixels, "black detail must increase consistently on a dark background");
}

assert.throws(
  () => monochrome.trace(new Uint8ClampedArray(3), 1, 1, null, {}),
  /Invalid RGBA image data/
);

console.log("monochrome SVG tracing tests passed");
