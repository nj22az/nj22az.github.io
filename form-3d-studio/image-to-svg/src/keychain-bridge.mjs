import { PRESETS, layoutStickerContours, normaliseOptions } from "./vector-core.mjs";

const scriptUrl = document.currentScript?.src || new URL("./keychain-bridge.js", window.location.href).href;
const workerUrl = new URL("./vector-worker.js", scriptUrl).href;
let activeWorker = null;
let activeReject = null;
let sequence = 0;

function cancel() {
  if (activeWorker) activeWorker.terminate();
  activeWorker = null;
  if (activeReject) activeReject(new DOMException("Vectorisation cancelled", "AbortError"));
  activeReject = null;
}

function vectorizePixels(pixels, width, height, options, onProgress) {
  cancel();
  const id = ++sequence;
  const worker = new Worker(workerUrl, { type: "module", name: "form3d-vectorizer" });
  activeWorker = worker;
  return new Promise((resolve, reject) => {
    activeReject = reject;
    worker.addEventListener("message", (event) => {
      const message = event.data;
      if (message?.id !== id) return;
      if (message.type === "progress") {
        onProgress?.(message.value, message.stage);
      } else if (message.type === "result") {
        worker.terminate(); activeWorker = null; activeReject = null;
        resolve({
          width: message.vector.width,
          height: message.vector.height,
          contours: message.vector.contours,
          svg: message.svg,
          palette: ["#ffffff", "#111111"],
          statistics: message.statistics,
          options: message.options
        });
      } else if (message.type === "error") {
        worker.terminate(); activeWorker = null; activeReject = null;
        reject(new Error(message.message || "Vectorisation failed"));
      }
    });
    worker.addEventListener("error", (event) => {
      worker.terminate(); activeWorker = null; activeReject = null;
      reject(new Error(event.message || "The vector worker could not start"));
    }, { once: true });
    const transfer = pixels.buffer.slice(pixels.byteOffset, pixels.byteOffset + pixels.byteLength);
    worker.postMessage({ type: "vectorize", id, width, height, pixels: transfer, options }, [transfer]);
  });
}

function imagePixels(image, settings = {}) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error("The image has no readable dimensions");
  const targetAspect = Number(settings.targetAspect) || sourceWidth / sourceHeight;
  const maximum = Math.max(128, Math.min(1024, Number(settings.maxDimension) || 512));
  let width, height;
  if (targetAspect >= 1) { width = maximum; height = Math.max(64, Math.round(width / targetAspect)); }
  else { height = maximum; width = Math.max(64, Math.round(height * targetAspect)); }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas image decoding is unavailable");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const sourceAspect = sourceWidth / sourceHeight;
  let drawWidth, drawHeight, x, y;
  if (sourceAspect > targetAspect) {
    drawWidth = width; drawHeight = width / sourceAspect; x = 0; y = (height - drawHeight) / 2;
  } else {
    drawHeight = height; drawWidth = height * sourceAspect; x = (width - drawWidth) / 2; y = 0;
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, x, y, drawWidth, drawHeight);
  return context.getImageData(0, 0, width, height);
}

async function vectorizeImage(image, options = {}, onProgress) {
  const settings = normaliseOptions({ ...PRESETS.keychain, ...options, preset: "keychain", colorMode: "bw", whiteBackground: true });
  const imageData = imagePixels(image, settings);
  return vectorizePixels(imageData.data, imageData.width, imageData.height, settings, onProgress);
}

function takeStudioArtwork() {
  try {
    const raw = sessionStorage.getItem("form3d-studio-vector-artwork");
    if (!raw) return null;
    sessionStorage.removeItem("form3d-studio-vector-artwork");
    const artwork = JSON.parse(raw);
    if (!artwork?.svg || !Array.isArray(artwork?.contours) || !artwork.width || !artwork.height) return null;
    return artwork;
  } catch {
    return null;
  }
}

export { PRESETS, cancel, layoutStickerContours, takeStudioArtwork, vectorizeImage, vectorizePixels, workerUrl };
