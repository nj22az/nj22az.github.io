import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { calculate } = require(path.join(root, "cover-latch-geometry.js"));

const cases = [
  {
    name: "default box",
    width: 76,
    depth: 54,
    height: 34,
    wall: 2.4,
    clearance: 0.35,
    lidThickness: 2.6,
    gearModule: 0.8,
    bayDepth: 9.2,
    gearTurn: 0
  },
  {
    name: "smallest box at full release",
    width: 45,
    depth: 35,
    height: 20,
    wall: 1.6,
    clearance: 0.35,
    lidThickness: 2.6,
    gearModule: 1.05,
    bayDepth: 8,
    gearTurn: 110
  },
  {
    name: "thick high-clearance cover",
    width: 140,
    depth: 110,
    height: 75,
    wall: 4.5,
    clearance: 0.8,
    lidThickness: 5,
    gearModule: 1.05,
    bayDepth: 8,
    gearTurn: 96
  }
];

for (const parameters of cases) {
  const geometry = calculate(parameters);
  assert.ok(geometry.printable.housingInsideCover, `${parameters.name}: cassette must remain inside the cover`);
  assert.ok(geometry.printable.minimumMovingGap >= 0.4, `${parameters.name}: moving gap must be at least 0.40 mm`);
  assert.ok(geometry.printable.gearBottomGap >= geometry.axialClearance - 1e-6, `${parameters.name}: lower gear gap`);
  assert.ok(geometry.printable.gearTopGap >= geometry.axialClearance - 1e-6, `${parameters.name}: upper gear gap`);
  assert.ok(geometry.gearThickness >= 1.85, `${parameters.name}: gear must remain printable`);
  assert.ok(geometry.bayDepth <= 12, `${parameters.name}: mechanism must stay within the supported cover depth`);
  assert.ok(geometry.keeperWindow.left > geometry.housingLeft, `${parameters.name}: keeper window left bound`);
  assert.ok(geometry.keeperWindow.right < geometry.housingRight, `${parameters.name}: keeper window right bound`);
  assert.ok(geometry.keeperWindow.front > geometry.housingFront, `${parameters.name}: keeper window front bound`);
  assert.ok(geometry.keeperWindow.back < geometry.housingBack, `${parameters.name}: keeper window rear bound`);
}

const locked = calculate(cases[0]);
const released = calculate({ ...cases[0], gearTurn: 96 });
assert.ok(released.hookX > locked.hookX + 5, "release rotation must swing the hook clear of the keeper");
assert.ok(released.hookY > locked.hookY + 2, "release rotation must retract the hook into the cover");

const app = readFileSync(path.join(root, "app.js"), "utf8");
const html = readFileSync(path.join(root, "index.html"), "utf8");
const worker = readFileSync(path.join(root, "sw.js"), "utf8");
for (const part of [
  "Concealed mechanism cover perimeter",
  "Cover mechanism inner liner left",
  "Concealed cover drive gear",
  "Concealed cover cam gear",
  "Concealed rotary keeper hook",
  "Recessed cover control dial",
  "Body internal keeper post",
  "Print-in-place concealed cover latch box"
]) {
  assert.ok(app.includes(part), `3D builder is missing ${part}`);
}
assert.doesNotMatch(app, /External knurled control knob|Sealed outer skin left|45 degree corbel roof/);
assert.match(html, /Add concealed cover latch/);
assert.match(html, /id="prepare-box-print"/);
assert.match(html, /cover at 0° and the latch Released/);
assert.match(html, /cover-latch-geometry\.js\?v=1/);
assert.match(worker, /cover-latch-geometry\.js\?v=1/);
assert.match(app, /Cover closed and latch released/);

console.log("concealed print-in-place cover latch tests passed");
