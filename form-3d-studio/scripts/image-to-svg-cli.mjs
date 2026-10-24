#!/usr/bin/env node
import { stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vtracer from "@visioncortex/vtracer";

const argumentsList = process.argv.slice(2);
const positional = argumentsList.filter((value, index) => !value.startsWith("--") && !argumentsList[index - 1]?.startsWith("--"));
const option = (name, fallback) => {
  const index = argumentsList.indexOf(`--${name}`);
  return index >= 0 && argumentsList[index + 1] ? argumentsList[index + 1] : fallback;
};

const helpRequested = argumentsList.includes("--help");
if (helpRequested || positional.length < 1) {
  console.log(`Image → SVG CLI (VTracer)

Usage:
  npm run vectorize -- input.png [output.svg] [options]

Options:
  --preset logo|line-art|illustration|photo|pixel-art|keychain
  --colors 2..64       Colour count for colour presets
  --threshold 0..255   Fixed threshold for monochrome presets
  --simplify 0..5      Path simplification tolerance in pixels

PNG, JPEG, GIF and BMP are decoded by VTracer's WASM build. WebP and AVIF are
supported by the browser studio instead.`);
  process.exit(helpRequested ? 0 : 1);
}

const input = path.resolve(positional[0]);
const output = path.resolve(positional[1] || `${input.replace(/\.[^.]+$/, "")}.svg`);
const presetName = option("preset", "illustration");
const presets = {
  logo: { preset: "poster", clustering: "color-cluster", hierarchical: "cutout", mode: "spline", filterSpeckle: 8, maxColors: 6, simplify: 1.4 },
  "line-art": { preset: "bw", clustering: "bw", hierarchical: "cutout", mode: "spline", filterSpeckle: 4, binaryThreshold: 168, simplify: 1.05 },
  illustration: { preset: "poster", clustering: "color-cluster", hierarchical: "cutout", mode: "spline", filterSpeckle: 5, maxColors: 12, simplify: 1.1 },
  photo: { preset: "photo", clustering: "watershed", hierarchical: "stacked", mode: "spline", filterSpeckle: 3, maxColors: 32, simplify: 0.65, watershedDetail: 176 },
  "pixel-art": { preset: "poster", clustering: "color-cluster", hierarchical: "cutout", mode: "pixel", filterSpeckle: 0, maxColors: 16 },
  keychain: { preset: "bw", clustering: "bw", hierarchical: "cutout", mode: "spline", filterSpeckle: 10, binaryThreshold: 130, simplify: 1.9 }
};
if (!presets[presetName]) throw new Error(`Unknown preset: ${presetName}`);
await stat(input);
const settings = { ...presets[presetName], pathPrecision: 2, optimize: 2 };
if (option("colors")) settings.maxColors = Math.max(2, Math.min(64, Number(option("colors"))));
if (option("threshold")) settings.binaryThreshold = Math.max(0, Math.min(255, Number(option("threshold"))));
if (option("simplify")) settings.simplify = Math.max(0, Math.min(5, Number(option("simplify"))));
await vtracer.convertFile(input, output, settings);
console.log(`Created ${output}`);
