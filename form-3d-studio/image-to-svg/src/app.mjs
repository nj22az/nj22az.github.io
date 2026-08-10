import { strToU8, zipSync } from "fflate";
import { MAX_FILE_BYTES, PRESETS, formatBytes, normaliseOptions } from "./vector-core.mjs";

const byId = (id) => document.getElementById(id);
const elements = {
  uploadCard: byId("upload-card"), studio: byId("studio"), dropZone: byId("drop-zone"), fileInput: byId("file-input"),
  batchList: byId("batch-list"), progressCard: byId("progress-card"), progressStage: byId("progress-stage"),
  progressValue: byId("progress-value"), progressBar: byId("progress-bar"), original: byId("original-preview"),
  vector: byId("vector-preview"), vectorClip: byId("vector-clip"), compareControl: byId("compare-control"),
  compareSlider: byId("compare-slider"), previewStage: byId("preview-stage"), previewTransform: byId("preview-transform"),
  sourceSize: byId("source-size"), sourceDimensions: byId("source-dimensions"), svgSize: byId("svg-size"),
  vectorCounts: byId("vector-counts"), engineStat: byId("engine-stat"), durationStat: byId("duration-stat"),
  download: byId("download-button"), copy: byId("copy-button"), png: byId("png-button"), keychain: byId("keychain-button"),
  zip: byId("download-zip-button"), toast: byId("toast"), exportCanvas: byId("export-canvas"),
  loadPreset: byId("load-preset-button"), onboarding: byId("onboarding-dialog"), help: byId("help-dialog")
};

const acceptedExtensions = /\.(?:png|jpe?g|webp|gif|bmp|avif)$/i;
const booleanOptions = new Set(["adaptive", "removeBackground", "optimize"]);
const numericOptions = new Set(["maxColors", "speckle", "cornerThreshold", "simplify", "pathPrecision", "threshold", "backgroundTolerance", "maxDimension"]);
const engineLabels = { vtracer: "VTracer", potrace: "Potrace", imagetracer: "ImageTracer" };
const state = {
  files: [], selectedId: null, nextId: 1, processing: false, active: null,
  options: normaliseOptions({ ...PRESETS.illustration, preset: "illustration" }),
  preset: "illustration", view: "compare", zoom: 1, panX: 0, panY: 0, dragging: null,
  reprocessTimer: 0, toastTimer: 0
};

function selectedItem() {
  return state.files.find((item) => item.id === state.selectedId) || null;
}

function cleanName(name, extension = "svg") {
  const stem = String(name || "vector").replace(/\.[^.]+$/, "").replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "") || "vector";
  return `${stem}.${extension}`;
}

function toast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setProgress(value, stage) {
  elements.progressCard.classList.remove("hidden");
  elements.progressBar.value = value;
  elements.progressValue.textContent = `${Math.round(value)}%`;
  elements.progressStage.textContent = stage || "Converting";
}

function hideProgress() {
  elements.progressCard.classList.add("hidden");
}

function updateConditionalControls() {
  const blackAndWhite = state.options.colorMode === "bw";
  document.querySelectorAll(".bw-only").forEach((node) => node.classList.toggle("hidden", !blackAndWhite));
  document.querySelectorAll(".colour-only").forEach((node) => node.classList.toggle("hidden", blackAndWhite));
  document.querySelectorAll(".background-only").forEach((node) => node.classList.toggle("hidden", !state.options.removeBackground));
}

function displayValue(key, value) {
  if (key === "speckle") return `${value} px`;
  if (key === "simplify") return `${Number(value).toFixed(2)} px`;
  if (key === "backgroundTolerance") return `${value}%`;
  if (key === "cornerThreshold") return `${value}°`;
  return String(value);
}

function renderControls() {
  document.querySelectorAll("[data-option]").forEach((control) => {
    const key = control.dataset.option;
    if (!(key in state.options)) return;
    if (control.type === "checkbox") control.checked = Boolean(state.options[key]);
    else control.value = String(state.options[key]);
  });
  document.querySelectorAll("[data-output]").forEach((output) => {
    const key = output.dataset.output;
    output.textContent = displayValue(key, state.options[key]);
  });
  document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("selected", button.dataset.preset === state.preset));
  updateConditionalControls();
}

function cancelActive(requeue = false) {
  if (!state.active) return;
  const { worker, reject, item } = state.active;
  worker.terminate(); state.active = null;
  item.cancelled = !requeue;
  if (requeue && item.status === "working") item.status = "pending";
  reject(new DOMException("Vectorisation cancelled", "AbortError"));
}

function requestConversion(item, options = state.options) {
  if (!item) return Promise.reject(new Error("No image selected"));
  item.options = normaliseOptions(options); item.status = "pending"; item.error = ""; item.cancelled = false;
  if (state.active?.item === item) cancelActive(true);
  renderBatch();
  const promise = new Promise((resolve, reject) => item.waiters.push({ resolve, reject }));
  queueMicrotask(processQueue);
  return promise;
}

function settleWaiters(item, error = null) {
  const waiters = item.waiters.splice(0);
  waiters.forEach(({ resolve, reject }) => error ? reject(error) : resolve(item.result));
}

function scheduleSelectedConversion() {
  clearTimeout(state.reprocessTimer);
  const item = selectedItem();
  if (!item) return;
  state.reprocessTimer = setTimeout(() => requestConversion(item, state.options).catch(() => {}), 320);
}

function choosePreset(name, convert = true) {
  if (!PRESETS[name]) return;
  state.preset = name;
  state.options = normaliseOptions({
    ...PRESETS[name], preset: name,
    maxDimension: name === "keychain" ? PRESETS.keychain.maxDimension : state.options.maxDimension
  });
  renderControls();
  if (convert) scheduleSelectedConversion();
}

async function decodeItem(item) {
  if (item.decoded) return item.decoded;
  try {
    item.decoded = await createImageBitmap(item.file);
  } catch {
    item.decoded = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This browser could not decode the image. Try PNG or JPEG."));
      image.src = item.sourceUrl;
    });
  }
  item.sourceWidth = item.decoded.naturalWidth || item.decoded.width;
  item.sourceHeight = item.decoded.naturalHeight || item.decoded.height;
  if (!item.sourceWidth || !item.sourceHeight) throw new Error("The image has no readable dimensions.");
  return item.decoded;
}

async function pixelsFor(item, maximum) {
  const image = await decodeItem(item);
  const scale = Math.min(1, maximum / Math.max(item.sourceWidth, item.sourceHeight));
  const width = Math.max(1, Math.round(item.sourceWidth * scale));
  const height = Math.max(1, Math.round(item.sourceHeight * scale));
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas image processing is unavailable.");
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  item.processedWidth = width; item.processedHeight = height; item.wasScaled = scale < 0.999;
  if (item.wasScaled && !item.warnedScale && item.id === state.selectedId) {
    item.warnedScale = true;
    toast(`Large image scaled to ${width} × ${height} for a responsive trace`);
  }
  return context.getImageData(0, 0, width, height);
}

function runWorker(item, imageData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./vector-worker.js", location.href), { type: "module", name: "image-to-svg" });
    const id = `${item.id}-${Date.now()}`;
    state.active = { worker, reject, item, id };
    worker.onmessage = (event) => {
      const message = event.data;
      if (message?.id !== id) return;
      if (message.type === "progress") {
        if (item.id === state.selectedId) setProgress(message.value, message.stage);
        return;
      }
      worker.terminate(); state.active = null;
      if (message.type === "result") resolve(message);
      else reject(new Error(message.message || "Vectorisation failed."));
    };
    worker.onerror = (event) => {
      worker.terminate(); state.active = null;
      reject(new Error(event.message || "The vector worker could not start."));
    };
    const transferable = imageData.data.buffer.slice(imageData.data.byteOffset, imageData.data.byteOffset + imageData.data.byteLength);
    worker.postMessage({ type: "vectorize", id, width: imageData.width, height: imageData.height, pixels: transferable, options: item.options }, [transferable]);
  });
}

function setResult(item, message) {
  if (item.vectorUrl) URL.revokeObjectURL(item.vectorUrl);
  item.result = { svg: message.svg, vector: message.vector, statistics: message.statistics, options: message.options };
  item.vectorUrl = URL.createObjectURL(new Blob([message.svg], { type: "image/svg+xml" }));
  item.status = "complete"; item.error = "";
  settleWaiters(item); renderBatch();
  if (item.id === state.selectedId) renderSelected();
}

async function processQueue() {
  if (state.processing) return;
  state.processing = true;
  try {
    while (true) {
      const selected = selectedItem();
      const item = selected?.status === "pending" ? selected : state.files.find((entry) => entry.status === "pending");
      if (!item) break;
      item.status = "working"; renderBatch();
      if (item.id === state.selectedId) setProgress(2, "Decoding image");
      try {
        const imageData = await pixelsFor(item, item.options.maxDimension);
        const result = await runWorker(item, imageData);
        setResult(item, result);
      } catch (error) {
        if (error?.name === "AbortError") {
          if (item.cancelled) {
            item.cancelled = false;
            item.status = item.result ? "complete" : "idle";
            settleWaiters(item, error);
            renderBatch();
            if (item.id === state.selectedId) renderSelected();
          } else if (item.status === "working") item.status = "idle";
        } else {
          item.status = "error"; item.error = error?.message || String(error);
          settleWaiters(item, error); renderBatch();
          if (item.id === state.selectedId) { renderSelected(); toast(item.error); }
        }
      } finally {
        item.decoded?.close?.(); item.decoded = null;
        if (item.id === state.selectedId && item.status !== "working") hideProgress();
      }
    }
  } finally {
    state.processing = false; hideProgress();
    if (state.files.some((item) => item.status === "pending")) queueMicrotask(processQueue);
  }
}

function validateFile(file) {
  if (!file || (!file.type.startsWith("image/") && !acceptedExtensions.test(file.name))) return "Choose a PNG, JPG, WebP, GIF, BMP or AVIF image.";
  if (!acceptedExtensions.test(file.name) && file.type === "image/svg+xml") return "SVG is already a vector format; choose a raster image.";
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than the 20 MB limit.`;
  return "";
}

async function addFiles(files) {
  let firstAdded = null;
  for (const file of files) {
    const error = validateFile(file);
    if (error) { toast(error); continue; }
    const item = {
      id: state.nextId++, file, name: file.name, sourceUrl: URL.createObjectURL(file), status: "pending", error: "",
      options: normaliseOptions(state.options), result: null, vectorUrl: "", decoded: null, waiters: [], cancelled: false, warnedScale: false
    };
    state.files.push(item); firstAdded ||= item;
  }
  if (!firstAdded) return;
  state.selectedId = firstAdded.id;
  elements.uploadCard.classList.add("hidden"); elements.studio.classList.remove("hidden");
  renderBatch(); renderSelected(); processQueue();
  if (!localStorage.getItem("image-to-svg-onboarded")) {
    localStorage.setItem("image-to-svg-onboarded", "1");
    setTimeout(() => elements.onboarding.showModal(), 220);
  }
}

function renderBatch() {
  elements.batchList.replaceChildren(...state.files.map((item) => {
    const row = document.createElement("li");
    row.className = item.id === state.selectedId ? "selected" : "";
    row.tabIndex = 0; row.setAttribute("role", "button"); row.setAttribute("aria-label", `Select ${item.name}`);
    const image = document.createElement("img"); image.className = "batch-thumb"; image.src = item.sourceUrl; image.alt = "";
    const copy = document.createElement("span"); copy.className = "batch-copy";
    const title = document.createElement("strong"); title.textContent = item.name;
    const detail = document.createElement("small");
    detail.textContent = item.status === "complete" ? `${formatBytes(item.result.statistics.bytes)} SVG` : item.status === "error" ? item.error : item.status === "working" ? "Converting…" : "Queued";
    copy.append(title, detail);
    const status = document.createElement("i"); status.className = `batch-status ${item.status === "complete" ? "complete" : item.status === "working" ? "working" : item.status === "error" ? "error" : ""}`;
    const select = () => { state.selectedId = item.id; state.options = normaliseOptions(item.options); state.preset = item.options.preset; renderControls(); renderBatch(); renderSelected(); };
    row.addEventListener("click", select);
    row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); } });
    row.append(image, copy, status); return row;
  }));
  elements.zip.disabled = !state.files.some((item) => item.status === "complete");
}

function renderSelected() {
  const item = selectedItem();
  const ready = item?.status === "complete" && item.result;
  if (!item) return;
  elements.original.src = item.sourceUrl; elements.vector.src = ready ? item.vectorUrl : "";
  elements.sourceSize.textContent = formatBytes(item.file.size);
  elements.sourceDimensions.textContent = item.sourceWidth ? `${item.sourceWidth} × ${item.sourceHeight}${item.wasScaled ? ` · traced at ${item.processedWidth} × ${item.processedHeight}` : ""}` : "Reading dimensions…";
  elements.svgSize.textContent = ready ? formatBytes(item.result.statistics.bytes) : item.status === "error" ? "Failed" : "—";
  elements.vectorCounts.textContent = ready ? `${item.result.statistics.paths.toLocaleString()} paths · ${item.result.statistics.nodes.toLocaleString()} nodes` : item.error || "Waiting for trace";
  elements.engineStat.textContent = ready ? engineLabels[item.result.statistics.engine] : engineLabels[item.options.engine];
  elements.durationStat.textContent = ready ? `${(item.result.statistics.durationMs / 1000).toFixed(2)} seconds` : "—";
  [elements.download, elements.copy, elements.png, elements.keychain].forEach((button) => { button.disabled = !ready; });
  applyView();
}

function applyView() {
  const position = Number(elements.compareSlider.value);
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("selected", button.dataset.view === state.view));
  if (state.view === "original") elements.vectorClip.style.clipPath = "inset(0 0 0 100%)";
  else if (state.view === "vector") elements.vectorClip.style.clipPath = "inset(0 0 0 0)";
  else elements.vectorClip.style.clipPath = `inset(0 0 0 ${position}%)`;
  elements.compareControl.classList.toggle("hidden", state.view !== "compare");
  elements.previewStage.querySelector(".original-label").classList.toggle("hidden", state.view === "vector");
  elements.previewStage.querySelector(".vector-label").classList.toggle("hidden", state.view === "original");
  elements.compareControl.style.setProperty("--compare", `${position}%`);
}

function applyTransform() {
  elements.previewTransform.style.transform = `translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`;
  byId("zoom-output").textContent = `${Math.round(state.zoom * 100)}%`;
}

function setZoom(next, anchor = null) {
  const previous = state.zoom;
  state.zoom = Math.min(8, Math.max(0.25, next));
  if (anchor && previous !== state.zoom) {
    const rect = elements.previewStage.getBoundingClientRect();
    const x = anchor.clientX - rect.left - rect.width / 2;
    const y = anchor.clientY - rect.top - rect.height / 2;
    const ratio = state.zoom / previous;
    state.panX = x - (x - state.panX) * ratio; state.panY = y - (y - state.panY) * ratio;
  }
  applyTransform();
}

async function copySvg() {
  const item = selectedItem(); if (!item?.result) return;
  try {
    await navigator.clipboard.writeText(item.result.svg);
  } catch {
    const area = document.createElement("textarea"); area.value = item.result.svg; document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
  }
  toast("SVG copied to the clipboard");
}

async function exportPng() {
  const item = selectedItem(); if (!item?.result) return;
  const image = new Image();
  const url = URL.createObjectURL(new Blob([item.result.svg], { type: "image/svg+xml" }));
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const width = item.result.vector.width || item.processedWidth;
    const height = item.result.vector.height || item.processedHeight;
    elements.exportCanvas.width = width; elements.exportCanvas.height = height;
    const context = elements.exportCanvas.getContext("2d"); context.clearRect(0, 0, width, height); context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve) => elements.exportCanvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG export failed.");
    downloadBlob(blob, cleanName(item.name, "png"));
  } finally { URL.revokeObjectURL(url); }
}

async function useOnKeychain() {
  const item = selectedItem(); if (!item) return;
  let result = item.result;
  if (!result || result.options.preset !== "keychain" || result.options.colorMode !== "bw") {
    choosePreset("keychain", false);
    toast("Creating a clean monochrome keychain trace…");
    result = await requestConversion(item, state.options);
  }
  const artwork = {
    name: cleanName(item.name, "svg"), width: result.vector.width, height: result.vector.height,
    contours: result.vector.contours, svg: result.svg, palette: ["#ffffff", "#111111"],
    statistics: result.statistics, options: result.options
  };
  try {
    sessionStorage.setItem("form3d-studio-vector-artwork", JSON.stringify(artwork));
  } catch {
    throw new Error("This SVG is too large for the keychain hand-off. Increase path simplification and try again.");
  }
  location.href = "../?vector=studio";
}

async function downloadZip() {
  const files = {};
  state.files.filter((item) => item.result).forEach((item) => { files[cleanName(item.name)] = strToU8(item.result.svg); });
  const archive = zipSync(files, { level: 6 });
  downloadBlob(new Blob([archive], { type: "application/zip" }), "converted-svg-files.zip");
}

async function exampleFile(kind) {
  const examples = {
    badge: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#f6df89"/><circle cx="320" cy="210" r="155" fill="#ed5f45"/><circle cx="320" cy="210" r="120" fill="#17243e"/><path d="m190 210 72-26 58-94 58 94 72 26-72 26-58 94-58-94z" fill="#f6df89"/></svg>',
    signature: '<svg xmlns="http://www.w3.org/2000/svg" width="760" height="300"><rect width="100%" height="100%" fill="white"/><path d="M55 205c87-15 108-151 47-119-62 33 33 161 78 50 42-104-9 144 67 12 32-55-4 100 58 5 26-40 8 72 57 4 44-62 57 44 91 1 38-48 5 70 64 5 52-58 48 32 108-15" fill="none" stroke="#111" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    poster: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#f7efe3"/><path d="M0 330 195 98l116 137L423 74l217 256v90H0z" fill="#315c98"/><circle cx="500" cy="105" r="62" fill="#ef7548"/><path d="M0 355c135-68 213 45 340-17 105-52 184-6 300 35v47H0z" fill="#efb643"/></svg>'
  };
  const svg = examples[kind];
  const image = new Image(); const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return new File([blob], `${kind}-example.png`, { type: "image/png" });
  } finally { URL.revokeObjectURL(url); }
}

document.querySelectorAll("[data-option]").forEach((control) => {
  const update = () => {
    const key = control.dataset.option;
    const value = booleanOptions.has(key) ? control.checked : numericOptions.has(key) ? Number(control.value) : control.value;
    state.options = normaliseOptions({ ...state.options, [key]: value, preset: state.preset });
    document.querySelector(`[data-output="${key}"]`)?.replaceChildren(displayValue(key, state.options[key]));
    updateConditionalControls(); scheduleSelectedConversion();
  };
  control.addEventListener(control.type === "range" ? "input" : "change", update);
});
document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => choosePreset(button.dataset.preset)));
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; applyView(); }));
document.querySelectorAll("[data-example]").forEach((button) => button.addEventListener("click", async () => addFiles([await exampleFile(button.dataset.example)])));

elements.fileInput.addEventListener("change", () => { addFiles([...elements.fileInput.files]); elements.fileInput.value = ""; });
byId("add-files-button").addEventListener("click", () => elements.fileInput.click());
elements.dropZone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); elements.fileInput.click(); } });
["dragenter", "dragover"].forEach((name) => elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.add("dragging"); }));
["dragleave", "drop"].forEach((name) => elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.remove("dragging"); }));
elements.dropZone.addEventListener("drop", (event) => addFiles([...event.dataTransfer.files]));

elements.download.addEventListener("click", () => { const item = selectedItem(); if (item?.result) downloadBlob(new Blob([item.result.svg], { type: "image/svg+xml" }), cleanName(item.name)); });
elements.copy.addEventListener("click", () => copySvg().catch((error) => toast(error.message)));
elements.png.addEventListener("click", () => exportPng().catch((error) => toast(error.message)));
elements.keychain.addEventListener("click", () => useOnKeychain().catch((error) => toast(error.message)));
elements.zip.addEventListener("click", downloadZip);
byId("cancel-button").addEventListener("click", () => { cancelActive(false); hideProgress(); toast("Conversion cancelled"); });
byId("reset-preset-button").addEventListener("click", () => {
  if (PRESETS[state.preset]) choosePreset(state.preset);
  else elements.loadPreset.click();
});
byId("save-preset-button").addEventListener("click", () => { localStorage.setItem("image-to-svg-preset", JSON.stringify(state.options)); elements.loadPreset.classList.remove("hidden"); toast("Custom preset saved on this device"); });
elements.loadPreset.addEventListener("click", () => { try { state.preset = "custom"; state.options = normaliseOptions(JSON.parse(localStorage.getItem("image-to-svg-preset"))); renderControls(); scheduleSelectedConversion(); } catch { toast("The saved preset could not be read"); } });
byId("help-button").addEventListener("click", () => elements.help.showModal());

elements.compareSlider.addEventListener("input", applyView);
byId("zoom-in").addEventListener("click", () => setZoom(state.zoom * 1.25));
byId("zoom-out").addEventListener("click", () => setZoom(state.zoom / 1.25));
byId("zoom-reset").addEventListener("click", () => { state.zoom = 1; state.panX = 0; state.panY = 0; applyTransform(); });
elements.previewStage.addEventListener("wheel", (event) => { event.preventDefault(); setZoom(state.zoom * (event.deltaY < 0 ? 1.12 : 0.89), event); }, { passive: false });
elements.previewStage.addEventListener("pointerdown", (event) => { if (state.view === "compare" || event.target.closest("input")) return; state.dragging = { x: event.clientX, y: event.clientY, panX: state.panX, panY: state.panY }; elements.previewStage.setPointerCapture(event.pointerId); elements.previewStage.classList.add("dragging"); });
elements.previewStage.addEventListener("pointermove", (event) => { if (!state.dragging) return; state.panX = state.dragging.panX + event.clientX - state.dragging.x; state.panY = state.dragging.panY + event.clientY - state.dragging.y; applyTransform(); });
elements.previewStage.addEventListener("pointerup", () => { state.dragging = null; elements.previewStage.classList.remove("dragging"); });

document.addEventListener("paste", (event) => { const files = [...event.clipboardData.files].filter((file) => file.type.startsWith("image/")); if (files.length) { event.preventDefault(); addFiles(files); } });
document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && selectedItem()?.result) { event.preventDefault(); elements.download.click(); } });

const themes = ["auto", "light", "dark"];
let theme = localStorage.getItem("image-to-svg-theme") || "auto";
document.documentElement.dataset.theme = theme;
byId("theme-button").addEventListener("click", () => { theme = themes[(themes.indexOf(theme) + 1) % themes.length]; document.documentElement.dataset.theme = theme; localStorage.setItem("image-to-svg-theme", theme); toast(`${theme[0].toUpperCase()}${theme.slice(1)} theme`); });

if (localStorage.getItem("image-to-svg-preset")) elements.loadPreset.classList.remove("hidden");
renderControls(); applyView(); applyTransform();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(() => {});
window.addEventListener("pagehide", () => { cancelActive(false); state.files.forEach((item) => { URL.revokeObjectURL(item.sourceUrl); if (item.vectorUrl) URL.revokeObjectURL(item.vectorUrl); item.decoded?.close?.(); }); });
