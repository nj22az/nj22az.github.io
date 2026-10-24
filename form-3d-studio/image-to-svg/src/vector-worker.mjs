import ImageTracer from "imagetracerjs";
import { init as initPotrace, potrace } from "esm-potrace-wasm";
import { optimize as optimizeSvg } from "svgo/browser";
import { initVTracer, vectorizeRgba } from "./.generated-vtracer-browser.mjs";
import {
  applyOutputStyle,
  extractContoursFromSvg,
  normaliseOptions,
  preprocessPixels,
  svgStatistics
} from "./vector-core.mjs";

let vtracerReady;
let potraceReady;

function progress(id, value, stage) {
  self.postMessage({ type: "progress", id, value, stage });
}

function vtracerOptions(settings) {
  return {
    preset: settings.colorMode === "bw" ? "bw" : settings.preset === "photo" ? "photo" : "poster",
    clustering: settings.colorMode === "bw" ? "bw" : settings.clustering,
    hierarchical: settings.layering,
    mode: settings.curveMode,
    filterSpeckle: settings.speckle,
    colorPrecision: 6,
    layerDifference: settings.preset === "photo" ? 8 : 16,
    cornerThreshold: settings.cornerThreshold,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    simplify: settings.simplify || undefined,
    pathPrecision: settings.pathPrecision,
    maxColors: settings.colorMode === "color" ? settings.maxColors : undefined,
    optimize: settings.optimize ? 2 : 0,
    binaryThreshold: settings.colorMode === "bw" && !settings.adaptive ? settings.threshold : undefined,
    adaptive: settings.colorMode === "bw" ? settings.adaptive : undefined,
    adaptiveWindow: settings.adaptive ? settings.adaptiveWindow : undefined,
    adaptiveT: settings.adaptive ? settings.adaptiveSensitivity : undefined,
    watershedDetail: settings.clustering === "watershed" ? settings.watershedDetail : undefined
  };
}

function potraceOptions(settings) {
  return {
    turdsize: settings.speckle,
    turnpolicy: 4,
    alphamax: settings.curveMode === "pixel" ? 0 : Math.max(0, Math.min(1.34, settings.cornerThreshold / 60)),
    opticurve: settings.curveMode === "pixel" ? 0 : 1,
    opttolerance: Math.max(0.02, settings.simplify * 0.18),
    pathonly: false,
    extractcolors: settings.colorMode === "color",
    posterizelevel: settings.colorMode === "color" ? settings.maxColors : 2,
    posterizationalgorithm: settings.layering === "stacked" ? 1 : 0
  };
}

function imageTracerOptions(settings) {
  return {
    ltres: Math.max(0.01, settings.simplify),
    qtres: Math.max(0.01, settings.simplify),
    pathomit: settings.speckle,
    rightangleenhance: settings.curveMode !== "spline",
    colorsampling: 2,
    numberofcolors: settings.colorMode === "bw" ? 2 : settings.maxColors,
    mincolorratio: 0,
    colorquantcycles: settings.preset === "photo" ? 5 : 3,
    layering: settings.layering === "stacked" ? 0 : 1,
    strokewidth: 0,
    linefilter: true,
    scale: 1,
    roundcoords: settings.pathPrecision,
    viewbox: true,
    desc: false,
    blurradius: settings.preset === "photo" ? 1 : 0,
    blurdelta: 20
  };
}

function addWhiteBackground(svg) {
  if (/<rect\b[^>]*\bdata-keychain-background=/i.test(svg)) return svg;
  return svg.replace(/(<svg\b[^>]*>)/i, '$1<rect data-keychain-background="true" width="100%" height="100%" fill="#fff"/>');
}

function optimise(svg, settings) {
  if (!settings.optimize) return svg;
  const result = optimizeSvg(svg, {
    multipass: false,
    plugins: [{
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false
        }
      }
    }]
  });
  return result.data || svg;
}

async function runVectorizer(message) {
  const { id, width, height } = message;
  const settings = normaliseOptions(message.options);
  const startedAt = performance.now();
  progress(id, 8, "Preparing pixels");
  const input = new Uint8ClampedArray(message.pixels);
  const pixels = preprocessPixels(input, width, height, settings);
  progress(id, 22, "Loading vector engine");
  let svg;

  if (settings.engine === "potrace") {
    potraceReady ||= initPotrace();
    await potraceReady;
    progress(id, 38, "Tracing with Potrace");
    svg = await potrace({ data: pixels, width, height }, potraceOptions(settings));
  } else if (settings.engine === "imagetracer") {
    progress(id, 38, "Tracing with ImageTracer");
    svg = ImageTracer.imagedataToSVG({ data: pixels, width, height }, imageTracerOptions(settings));
  } else {
    vtracerReady ||= initVTracer();
    await vtracerReady;
    progress(id, 38, "Tracing with VTracer");
    svg = vectorizeRgba(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength), width, height, vtracerOptions(settings));
  }

  progress(id, 82, "Optimising SVG");
  const unoptimisedBytes = new TextEncoder().encode(svg).byteLength;
  svg = optimise(svg, settings);
  svg = applyOutputStyle(svg, settings.outputStyle);
  if (settings.whiteBackground) svg = addWhiteBackground(svg);
  const vector = extractContoursFromSvg(svg, Math.max(0.28, settings.simplify * 0.42));
  const statistics = svgStatistics(svg);
  progress(id, 100, "Complete");
  self.postMessage({
    type: "result",
    id,
    svg,
    vector,
    statistics: {
      ...statistics,
      unoptimisedBytes,
      durationMs: Math.round(performance.now() - startedAt),
      engine: settings.engine
    },
    options: settings
  });
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "vectorize") return;
  runVectorizer(event.data).catch((error) => {
    self.postMessage({ type: "error", id: event.data.id, message: error?.message || String(error) });
  });
});
