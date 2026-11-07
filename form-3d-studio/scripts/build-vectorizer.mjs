import { build } from "esbuild";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "image-to-svg", "src");
const outputDirectory = path.join(root, "image-to-svg");
const generatedLoader = path.join(sourceDirectory, ".generated-vtracer-browser.mjs");
const nodeLoader = path.join(root, "node_modules", "@visioncortex", "vtracer", "pkg", "vtracer_wasm.js");
const wasmSource = path.join(root, "node_modules", "@visioncortex", "vtracer", "pkg", "vtracer_wasm_bg.wasm");
const wasmOutput = path.join(outputDirectory, "vtracer_wasm_bg.wasm");
const potraceLicenseSource = path.join(root, "node_modules", "esm-potrace-wasm", "LICENSE");
const potraceLicenseOutput = path.join(outputDirectory, "POTRACE-GPL-2.0.txt");

const nodeSource = await readFile(nodeLoader, "utf8");
const footer = /const wasmPath = `\$\{__dirname\}\/vtracer_wasm_bg\.wasm`;[\s\S]*?wasm\.__wbindgen_start\(\);\s*$/;
if (!footer.test(nodeSource)) {
  throw new Error("The installed VTracer wrapper has changed; the browser loader patch must be reviewed.");
}

const browserFooter = String.raw`
let wasm;
let initialization;

async function initVTracer(input = new URL("./vtracer_wasm_bg.wasm", import.meta.url)) {
    if (wasm) return exports;
    if (!initialization) initialization = (async () => {
        const imports = __wbg_get_imports();
        let instance;
        if (input instanceof WebAssembly.Module) {
            instance = new WebAssembly.Instance(input, imports);
        } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
            const bytes = input instanceof ArrayBuffer ? input : input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
            const result = await WebAssembly.instantiate(bytes, imports);
            instance = result instanceof WebAssembly.Instance ? result : result.instance;
        } else {
            const response = input instanceof Response ? input : await fetch(input);
            if (!response.ok) throw new Error("VTracer WASM could not be loaded (" + response.status + ").");
            const fallback = response.clone();
            if (WebAssembly.instantiateStreaming) {
                try {
                    const result = await WebAssembly.instantiateStreaming(response, imports);
                    instance = result.instance;
                } catch (error) {
                    const result = await WebAssembly.instantiate(await fallback.arrayBuffer(), imports);
                    instance = result instanceof WebAssembly.Instance ? result : result.instance;
                }
            } else {
                const result = await WebAssembly.instantiate(await response.arrayBuffer(), imports);
                instance = result instanceof WebAssembly.Instance ? result : result.instance;
            }
        }
        wasm = instance.exports;
        wasm.__wbindgen_start();
        return exports;
    })();
    return initialization;
}

export { initVTracer, vectorize_bytes as vectorizeBytes, vectorize_rgba as vectorizeRgba };
`;

await mkdir(sourceDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
await writeFile(generatedLoader, `const exports = {};\n${nodeSource.replace(footer, browserFooter)}`, "utf8");
await copyFile(wasmSource, wasmOutput);
await copyFile(potraceLicenseSource, potraceLicenseOutput);

const shared = {
  bundle: true,
  minify: true,
  legalComments: "eof",
  platform: "browser",
  target: ["es2020"]
};

const dormantNodeShim = {
  name: "dormant-node-shim",
  setup(context) {
    context.onResolve({ filter: /^node:fs$/ }, () => ({ path: "node:fs", namespace: "browser-empty" }));
    context.onLoad({ filter: /.*/, namespace: "browser-empty" }, () => ({
      contents: "export default {}; export function readFileSync(){ throw new Error('Filesystem access is unavailable in the browser'); }",
      loader: "js"
    }));
  }
};

try {
  await Promise.all([
    build({
      ...shared,
      entryPoints: [path.join(sourceDirectory, "vector-worker.mjs")],
      outfile: path.join(outputDirectory, "vector-worker.js"),
      format: "esm",
      plugins: [dormantNodeShim],
      define: { "globalThis.process": "undefined" },
      banner: { js: "/*! Image → SVG worker · VTracer MIT/Apache-2.0 · Potrace GPL-2.0 · ImageTracer Unlicense · SVGO MIT */" }
    }),
    build({
      ...shared,
      entryPoints: [path.join(sourceDirectory, "app.mjs")],
      outfile: path.join(outputDirectory, "app.js"),
      format: "iife",
      banner: { js: "/*! Form 3D Image → SVG Studio */" }
    }),
    build({
      ...shared,
      entryPoints: [path.join(sourceDirectory, "keychain-bridge.mjs")],
      outfile: path.join(outputDirectory, "keychain-bridge.js"),
      format: "iife",
      globalName: "Form3DVectorizer",
      banner: { js: "/*! Form 3D vectorizer bridge */" }
    })
  ]);
} finally {
  await rm(generatedLoader, { force: true });
}
