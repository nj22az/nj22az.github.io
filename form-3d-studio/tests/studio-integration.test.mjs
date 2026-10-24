import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

function validateDocument(relative) {
  const html = read(relative);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${relative} must not contain duplicate IDs`);
  for (const match of html.matchAll(/\b(?:for|aria-controls)="([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `${relative} is missing the referenced #${match[1]}`);
  }
  return html;
}

const studioHtml = validateDocument("index.html");
const vectorHtml = validateDocument("image-to-svg/index.html");
assert.match(studioHtml, /src="\.\/image-to-svg\/\?embed=1"/);
assert.match(vectorHtml, /searchParams\.set\("workspace", "vector"\)/);

const studioApp = read("app.js");
const vectorApp = read("image-to-svg/app.js");
for (const messageType of ["form3d:open-image", "form3d:vector-ready", "form3d:apply-vector", "form3d:host-ready"]) {
  assert.ok(studioApp.includes(messageType), `3D bundle is missing ${messageType}`);
  assert.ok(vectorApp.includes(messageType), `vector bundle is missing ${messageType}`);
}

for (const [worker, base] of [["sw.js", root], ["image-to-svg/sw.js", path.join(root, "image-to-svg")]]) {
  const source = read(worker);
  const entries = [...source.matchAll(/^\s*"(\.\/[^"]+)"/gm)].map((match) => match[1]);
  for (const entry of entries) {
    const local = entry.replace(/^\.\//, "").split("?")[0];
    if (!local || local.endsWith("/")) continue;
    assert.ok(existsSync(path.join(base, local)), `${worker} references missing ${local}`);
  }
}

console.log("combined Form 3D and Image to SVG workspace tests passed");
