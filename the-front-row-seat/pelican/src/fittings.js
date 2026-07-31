/**
 * What the room is furnished with: the bar and its fault, the hearth, the
 * centre table, twelve stools, barrels, and the small objects the book keeps
 * coming back to.
 */

import * as THREE from '../vendor/three.module.min.js';

/** How strongly the derived normal maps bite. */
const NORMAL_SCALE = new THREE.Vector2(0.85, 0.85);
import {
  BAR, HEARTH, CENTRE_TABLE, STOOL, STOOL_PLACEMENTS, ROOM, PALETTE, BARREL_PLACEMENTS,
} from './config.js';
import { createOakTexture, createSootTexture, createPageTexture } from './textures.js';

function box(width, height, depth, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(radiusTop, radiusBottom, height, material, segments = 14) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material,
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildBar(parent, oakMaterial, darkOakMaterial) {
  const bar = new THREE.Group();
  bar.name = 'bar';

  const carcass = box(BAR.depth, BAR.height - BAR.topThickness, BAR.length, darkOakMaterial);
  carcass.position.set(0, (BAR.height - BAR.topThickness) / 2, 0);
  bar.add(carcass);

  // The counter top, worn paler than the carcass by thirty years of forearms.
  const top = box(BAR.depth + 0.09, BAR.topThickness, BAR.length + 0.06, oakMaterial);
  top.position.set(0.012, BAR.height - BAR.topThickness / 2, 0);
  bar.add(top);

  // The fault: a narrow slot in the underside of the old oak, on the keeper's
  // side, where spilled ale never reaches. Modelled as a recess, not a hole.
  const faultMaterial = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 1.0 });
  const fault = box(BAR.faultDepth, BAR.faultWidth * 3.2, BAR.faultLength, faultMaterial);
  fault.position.set(
    -BAR.depth / 2 + BAR.faultDepth / 2 + 0.02,
    BAR.height - BAR.topThickness - 0.035,
    BAR.faultOffsetZ,
  );
  fault.name = 'fault-recess';
  bar.add(fault);

  const footRail = cylinder(0.028, 0.028, BAR.length - 0.2, darkOakMaterial, 10);
  footRail.rotation.x = Math.PI / 2;
  footRail.position.set(BAR.depth / 2 + 0.12, BAR.footRailHeight, 0);
  bar.add(footRail);

  bar.position.set(BAR.x, 0, BAR.z);
  parent.add(bar);
  return bar;
}

function buildHearth(parent, sootMaterial, stoneMaterial) {
  const hearth = new THREE.Group();
  hearth.name = 'hearth';
  const { openingWidth, openingHeight, depth } = HEARTH;

  // Breast: two piers and a lintel, set proud of the wall.
  const pierWidth = 0.42;
  [-1, 1].forEach((side) => {
    const pier = box(depth, HEARTH.mantelHeight, pierWidth, stoneMaterial);
    pier.position.set(-depth / 2, HEARTH.mantelHeight / 2, side * (openingWidth / 2 + pierWidth / 2));
    hearth.add(pier);
  });
  const lintel = box(depth, HEARTH.mantelHeight - openingHeight, openingWidth, stoneMaterial);
  lintel.position.set(-depth / 2, openingHeight + (HEARTH.mantelHeight - openingHeight) / 2, 0);
  hearth.add(lintel);

  const mantel = box(depth + 0.1, 0.09, openingWidth + pierWidth * 2 + 0.1, stoneMaterial);
  mantel.position.set(-depth / 2 - 0.03, HEARTH.mantelHeight + 0.045, 0);
  hearth.add(mantel);

  // The firebox behind, sooted.
  const backPlate = box(0.06, openingHeight, openingWidth, sootMaterial);
  backPlate.position.set(-depth + 0.03, openingHeight / 2, 0);
  hearth.add(backPlate);
  [-1, 1].forEach((side) => {
    const cheek = box(depth, openingHeight, 0.06, sootMaterial);
    cheek.position.set(-depth / 2, openingHeight / 2, side * openingWidth / 2);
    hearth.add(cheek);
  });

  hearth.position.set(HEARTH.x, 0, HEARTH.z);
  parent.add(hearth);
  return hearth;
}

/** Burning logs and a bed of embers, positioned inside the firebox. */
function buildFire(parent) {
  const fire = new THREE.Group();
  fire.name = 'fire';

  const charMaterial = new THREE.MeshStandardMaterial({ color: 0x1d1613, roughness: 1.0 });
  const emberMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.emberCore,
    emissive: PALETTE.emberCore,
    emissiveIntensity: 2.4,
    roughness: 1.0,
  });

  const logAngles = [0.25, -0.4, 1.2];
  logAngles.forEach((angle, index) => {
    const log = cylinder(0.055 - index * 0.006, 0.06 - index * 0.006, 0.62, charMaterial, 8);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = angle;
    log.position.set(-0.3, 0.09 + index * 0.045, (index - 1) * 0.1);
    fire.add(log);
  });

  const emberBed = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), emberMaterial);
  emberBed.scale.set(1.5, 0.32, 1.1);
  emberBed.position.set(-0.3, 0.05, 0);
  emberBed.name = 'ember-bed';
  fire.add(emberBed);

  fire.position.set(HEARTH.x, 0, HEARTH.z);
  parent.add(fire);
  return { fire, emberBed };
}

function buildCentreTable(parent, oakMaterial, darkOakMaterial) {
  const table = new THREE.Group();
  table.name = 'centre-table';
  const { width, depth, height, topThickness } = CENTRE_TABLE;

  const top = box(width, topThickness, depth, oakMaterial);
  top.position.y = height - topThickness / 2;
  table.add(top);

  const legInset = 0.17;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const leg = box(0.085, height - topThickness, 0.085, darkOakMaterial);
    leg.position.set(
      sx * (width / 2 - legInset),
      (height - topThickness) / 2,
      sz * (depth / 2 - legInset),
    );
    table.add(leg);
  });

  const stretcher = box(width - legInset * 2, 0.05, 0.06, darkOakMaterial);
  stretcher.position.y = 0.19;
  table.add(stretcher);

  table.position.set(CENTRE_TABLE.x, 0, CENTRE_TABLE.z);
  parent.add(table);
  return table;
}

function buildStools(parent, oakMaterial) {
  const stools = [];
  STOOL_PLACEMENTS.forEach((placement) => {
    const stool = new THREE.Group();
    const seat = cylinder(STOOL.seatRadius, STOOL.seatRadius * 0.96, STOOL.seatThickness, oakMaterial, 16);
    seat.position.y = STOOL.height - STOOL.seatThickness / 2;
    stool.add(seat);

    for (let i = 0; i < 3; i += 1) {
      const angle = (i / 3) * Math.PI * 2 + 0.4;
      const leg = cylinder(STOOL.legRadius, STOOL.legRadius * 1.25, STOOL.height - STOOL.seatThickness, oakMaterial, 8);
      const spread = STOOL.seatRadius - STOOL.legInset;
      leg.position.set(
        Math.cos(angle) * spread,
        (STOOL.height - STOOL.seatThickness) / 2,
        Math.sin(angle) * spread,
      );
      leg.rotation.z = -Math.cos(angle) * 0.14;
      leg.rotation.x = Math.sin(angle) * 0.14;
      stool.add(leg);
    }

    stool.position.set(placement.x, 0, placement.z);
    stool.rotation.y = placement.rotation;
    if (placement.barnaby) stool.name = 'barnaby-stool';
    parent.add(stool);
    stools.push(stool);
  });
  return stools;
}

function buildBarrels(parent, oakMaterial, ironMaterial) {
  BARREL_PLACEMENTS.forEach((spot) => {
    const barrel = new THREE.Group();
    const body = cylinder(0.24, 0.28, 0.78, oakMaterial, 18);
    body.position.y = 0.39;
    barrel.add(body);
    [0.14, 0.64].forEach((height) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.014, 6, 20), ironMaterial);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = height;
      barrel.add(hoop);
    });
    barrel.position.set(spot.x, 0, spot.z);
    barrel.rotation.y = spot.rotation;
    parent.add(barrel);
  });
}

/** The small findable things: thimble, mallet, stone bottle, lamp, Bell's page. */
function buildSmallObjects(parent, oakMaterial) {
  const objects = {};

  const brassMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.brass, roughness: 0.34, metalness: 0.85,
  });
  const thimble = cylinder(0.0092, 0.0108, 0.019, brassMaterial, 14);
  thimble.position.set(BAR.x + 0.16, BAR.height + 0.0095, BAR.z - 1.5);
  thimble.name = 'thimble';
  parent.add(thimble);
  objects.thimble = thimble;

  // Bung mallet: head and handle, lying on the counter.
  const mallet = new THREE.Group();
  const head = cylinder(0.042, 0.042, 0.13, oakMaterial, 12);
  head.rotation.z = Math.PI / 2;
  mallet.add(head);
  const handle = cylinder(0.017, 0.02, 0.24, oakMaterial, 10);
  handle.rotation.z = Math.PI / 2;
  handle.position.x = 0.18;
  mallet.add(handle);
  mallet.position.set(BAR.x + 0.14, BAR.height + 0.042, BAR.z + 0.75);
  mallet.rotation.y = 0.4;
  mallet.name = 'mallet';
  parent.add(mallet);
  objects.mallet = mallet;

  // Hendricks's stone bottle.
  const stonewareMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a7a5e, roughness: 0.66, metalness: 0.05,
  });
  const bottle = new THREE.Group();
  const belly = cylinder(0.045, 0.052, 0.15, stonewareMaterial, 14);
  belly.position.y = 0.075;
  bottle.add(belly);
  const neck = cylinder(0.017, 0.03, 0.07, stonewareMaterial, 10);
  neck.position.y = 0.185;
  bottle.add(neck);
  bottle.position.set(BAR.x + 0.2, BAR.height, BAR.z + 1.5);
  bottle.name = 'genever';
  parent.add(bottle);
  objects.genever = bottle;

  // The one lamp on the bar.
  const lamp = new THREE.Group();
  const lampBase = cylinder(0.06, 0.072, 0.03, new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.6, metalness: 0.5,
  }), 12);
  lamp.add(lampBase);
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 10, 8),
    new THREE.MeshStandardMaterial({
      color: PALETTE.lampFlame, emissive: PALETTE.lampFlame, emissiveIntensity: 3.2, roughness: 1,
    }),
  );
  flame.scale.set(0.75, 1.6, 0.75);
  flame.position.y = 0.075;
  flame.name = 'lamp-flame';
  lamp.add(flame);
  lamp.position.set(BAR.x + 0.05, BAR.height + 0.015, BAR.z - 0.4);
  parent.add(lamp);
  objects.lampFlame = flame;

  // Bell's page, face down on the centre table where Maggie takes it.
  const pageMaterial = new THREE.MeshStandardMaterial({
    map: createPageTexture(), color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide,
  });
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), pageMaterial);
  page.rotation.x = -Math.PI / 2;
  page.rotation.z = 0.22;
  page.position.set(CENTRE_TABLE.x - 0.42, CENTRE_TABLE.height + 0.004, CENTRE_TABLE.z + 0.12);
  page.name = 'bells-page';
  parent.add(page);
  objects.page = page;

  return objects;
}

export function buildFittings(scene) {
  const fittings = new THREE.Group();
  fittings.name = 'fittings';

  const oakMap = createOakTexture({ repeat: 1, seed: 12 });
  const wornOakMap = createOakTexture({ repeat: 1, seed: 91, base: '#6b4c30' });
  const sootMap = createSootTexture({ repeat: 1 });

  const oakMaterial = new THREE.MeshStandardMaterial({
    map: wornOakMap, normalMap: wornOakMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: wornOakMap.roughnessMap, color: PALETTE.oakWorn, roughness: 0.78,
  });
  const darkOakMaterial = new THREE.MeshStandardMaterial({
    map: oakMap, normalMap: oakMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: oakMap.roughnessMap, color: PALETTE.oakDark, roughness: 0.88,
  });
  const sootMaterial = new THREE.MeshStandardMaterial({
    map: sootMap, normalMap: sootMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: sootMap.roughnessMap, color: PALETTE.soot, roughness: 1.0,
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a443d, roughness: 0.95,
  });
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.6, metalness: 0.5,
  });

  buildBar(fittings, oakMaterial, darkOakMaterial);
  buildHearth(fittings, sootMaterial, stoneMaterial);
  const { emberBed } = buildFire(fittings);
  buildCentreTable(fittings, oakMaterial, darkOakMaterial);
  buildStools(fittings, oakMaterial);
  buildBarrels(fittings, darkOakMaterial, ironMaterial);
  const smallObjects = buildSmallObjects(fittings, oakMaterial);

  scene.add(fittings);
  return { fittings, emberBed, smallObjects };
}
