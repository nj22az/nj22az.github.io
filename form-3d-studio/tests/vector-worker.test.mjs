import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

let messageHandler;
let resolveMessage;
const messages = [];
globalThis.self = {
  addEventListener(type, handler) { if (type === "message") messageHandler = handler; },
  postMessage(message) {
    messages.push(message);
    if ((message.type === "result" || message.type === "error") && resolveMessage) {
      const resolve = resolveMessage; resolveMessage = null; resolve(message);
    }
  }
};
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = input instanceof URL ? input : new URL(input.url || input);
  if (url.protocol === "file:") {
    return new Response(await readFile(url), { status: 200, headers: { "content-type": "application/wasm" } });
  }
  return nativeFetch(input, options);
};

await import("../image-to-svg/vector-worker.js");
assert.equal(typeof messageHandler, "function", "the bundled worker should register its message handler");

const width = 40, height = 28;
const source = new Uint8ClampedArray(width * height * 4).fill(255);
for (let y = 4; y < 24; y += 1) {
  for (let x = 7; x < 33; x += 1) {
    const index = (y * width + x) * 4;
    source[index] = source[index + 1] = source[index + 2] = 0;
  }
}

async function runEngine(engine) {
  const id = `test-${engine}`;
  const result = new Promise((resolve) => { resolveMessage = resolve; });
  const pixels = source.buffer.slice(0);
  messageHandler({ data: {
    type: "vectorize", id, width, height, pixels,
    options: { preset: "lineArt", engine, colorMode: "bw", threshold: 150, speckle: 2, simplify: 1, optimize: true }
  } });
  const message = await result;
  assert.equal(message.type, "result", `${engine} should complete: ${message.message || ""}`);
  assert.match(message.svg, /<svg\b/);
  assert.ok(message.statistics.paths > 0);
  assert.ok(message.vector.contours.length > 0);
}

await runEngine("vtracer");
await runEngine("potrace");
await runEngine("imagetracer");
assert.ok(messages.some((message) => message.type === "progress" && message.value === 100));
console.log("bundled VTracer, Potrace and ImageTracer worker tests passed");
