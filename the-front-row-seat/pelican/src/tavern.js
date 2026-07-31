/**
 * The things that make a room a taproom rather than a room with a table in it:
 * oak wainscot to chair height, a back-bar you can read across the counter,
 * settles, low posts that break the space up, and goods hanging at head
 * height so the ceiling is never just empty air.
 *
 * Structural and decorative only — nothing here is interactive.
 */

import * as THREE from '../vendor/three.module.min.js';
import { ROOM, BAR, HEARTH, PALETTE, TAVERN } from './config.js';
import { createOakTexture } from './textures.js';

const NORMAL_SCALE = new THREE.Vector2(0.9, 0.9);

/** Wainscot runs to here; plaster above. The single most tavern-ish detail. */
const WAINSCOT_HEIGHT = TAVERN.wainscotHeight;
const PANEL_WIDTH = TAVERN.panelWidth;

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(rTop, rBottom, height, material, segments = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, segments), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * A run of raised-and-fielded panels along one wall: a back board, a plinth, a
 * chair rail, and a field per panel standing proud of the board.
 */
function buildWainscotRun(parent, { length, centre, rotationY, material, railMaterial }) {
  const run = new THREE.Group();

  const backing = box(length, WAINSCOT_HEIGHT, 0.04, material);
  backing.position.set(0, WAINSCOT_HEIGHT / 2, 0);
  run.add(backing);

  const plinth = box(length, 0.15, 0.09, railMaterial);
  plinth.position.set(0, 0.075, 0.03);
  run.add(plinth);

  const rail = box(length, 0.09, 0.11, railMaterial);
  rail.position.set(0, WAINSCOT_HEIGHT - 0.045, 0.035);
  run.add(rail);

  const panelCount = Math.max(1, Math.floor(length / PANEL_WIDTH));
  const spacing = length / panelCount;
  for (let i = 0; i < panelCount; i += 1) {
    const field = box(spacing - 0.09, WAINSCOT_HEIGHT - 0.42, 0.022, material);
    field.position.set(-length / 2 + spacing * (i + 0.5), WAINSCOT_HEIGHT / 2 - 0.02, 0.031);
    run.add(field);
    const stile = box(0.05, WAINSCOT_HEIGHT - 0.24, 0.05, railMaterial);
    stile.position.set(-length / 2 + spacing * i, WAINSCOT_HEIGHT / 2, 0.035);
    run.add(stile);
  }

  run.position.set(centre.x, 0, centre.z);
  run.rotation.y = rotationY;
  parent.add(run);
}

/**
 * The back-bar: shelving above and behind the counter carrying jugs, flagons
 * and bottles, plus tankards hung from hooks over the counter itself. This is
 * what a drinker actually looks at, and its absence was why the room read as
 * a room.
 */
function buildBackBar(parent, timberMaterial, pewterMaterial, potteryMaterial, glassMaterial) {
  const wallX = -ROOM.width / 2 + 0.13;
  const length = BAR.length + 0.3;

  // A tall dresser carcass behind the keeper.
  const carcass = box(0.3, 1.95, length, timberMaterial);
  carcass.position.set(wallX + 0.15, 0.975, BAR.z);
  parent.add(carcass);

  TAVERN.backBarShelfHeights.forEach((height, tier) => {
    const shelf = box(0.34, 0.045, length - 0.12, timberMaterial);
    shelf.position.set(wallX + 0.19, height, BAR.z);
    parent.add(shelf);

    const count = TAVERN.backBarItemsPerShelf;
    for (let i = 0; i < count; i += 1) {
      const z = BAR.z - (length - 0.9) / 2 + (i / (count - 1)) * (length - 0.9);
      const jitter = (Math.random() - 0.5) * 0.06;
      if (tier === 0) {
        const flagon = cylinder(0.055, 0.068, 0.2, potteryMaterial, 12);
        flagon.position.set(wallX + 0.2, height + 0.1, z + jitter);
        parent.add(flagon);
        const neck = cylinder(0.024, 0.04, 0.07, potteryMaterial, 10);
        neck.position.set(wallX + 0.2, height + 0.235, z + jitter);
        parent.add(neck);
      } else if (tier === 1) {
        const jug = cylinder(0.05, 0.038, 0.15, potteryMaterial, 12);
        jug.position.set(wallX + 0.2, height + 0.075, z + jitter);
        parent.add(jug);
      } else if (tier === 2) {
        const bottle = cylinder(0.031, 0.036, 0.13, glassMaterial, 10);
        bottle.position.set(wallX + 0.2, height + 0.065, z + jitter);
        parent.add(bottle);
        const bottleNeck = cylinder(0.012, 0.016, 0.08, glassMaterial, 8);
        bottleNeck.position.set(wallX + 0.2, height + 0.17, z + jitter);
        parent.add(bottleNeck);
      } else {
        const plate = cylinder(0.075, 0.075, 0.012, pewterMaterial, 16);
        plate.rotation.x = Math.PI / 2.04;
        plate.position.set(wallX + 0.24, height + 0.09, z);
        parent.add(plate);
      }
    }
  });

  // A pot-board rail over the counter, hung with tankards.
  const railHeight = TAVERN.potRailHeight;
  const rail = cylinder(0.022, 0.022, length - 0.2, timberMaterial, 8);
  rail.rotation.x = Math.PI / 2;
  rail.position.set(BAR.x + 0.02, railHeight, BAR.z);
  parent.add(rail);

  [-1, 1].forEach((side) => {
    const bracket = box(0.06, 0.5, 0.06, timberMaterial);
    bracket.position.set(BAR.x + 0.02, railHeight - 0.25, BAR.z + side * (length - 0.2) / 2);
    parent.add(bracket);
  });

  const hanging = TAVERN.hangingTankards;
  for (let i = 0; i < hanging; i += 1) {
    const z = BAR.z - (length - 0.6) / 2 + (i / (hanging - 1)) * (length - 0.6);
    const hook = cylinder(0.005, 0.005, 0.075, pewterMaterial, 5);
    hook.position.set(BAR.x + 0.02, railHeight - 0.04, z);
    parent.add(hook);
    const tankard = cylinder(0.041, 0.046, 0.115, pewterMaterial, 10);
    tankard.position.set(BAR.x + 0.02, railHeight - 0.135, z);
    tankard.rotation.z = Math.PI;
    parent.add(tankard);
  }
}

/** High-backed settles: the seat a Jacobean taproom actually has. */
function buildSettles(parent, timberMaterial) {
  TAVERN.settles.forEach((settle) => {
    const group = new THREE.Group();

    const seat = box(settle.length, 0.07, 0.44, timberMaterial);
    seat.position.set(0, 0.46, 0);
    group.add(seat);

    const back = box(settle.length, 1.18, 0.06, timberMaterial);
    back.position.set(0, 0.88, -0.2);
    group.add(back);

    // Panelled back, matching the wainscot.
    const panels = Math.max(2, Math.round(settle.length / 0.62));
    for (let i = 0; i < panels; i += 1) {
      const field = box(settle.length / panels - 0.1, 0.66, 0.02, timberMaterial);
      field.position.set(-settle.length / 2 + (settle.length / panels) * (i + 0.5), 0.94, -0.17);
      group.add(field);
    }

    [-1, 1].forEach((side) => {
      const end = box(0.07, 1.5, 0.44, timberMaterial);
      end.position.set(side * (settle.length / 2 - 0.035), 0.75, 0);
      group.add(end);
    });

    const rail = box(settle.length, 0.06, 0.09, timberMaterial);
    rail.position.set(0, 0.16, 0.16);
    group.add(rail);

    group.position.set(settle.x, 0, settle.z);
    group.rotation.y = settle.rotation;
    parent.add(group);
  });
}

/** Two more small tables, so the room has somewhere else to sit. */
function buildSideTables(parent, timberMaterial) {
  TAVERN.sideTables.forEach((table) => {
    const group = new THREE.Group();
    const top = box(table.width, 0.055, table.depth, timberMaterial);
    top.position.y = 0.72;
    group.add(top);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const leg = box(0.07, 0.69, 0.07, timberMaterial);
      leg.position.set(sx * (table.width / 2 - 0.12), 0.345, sz * (table.depth / 2 - 0.12));
      group.add(leg);
    });
    group.position.set(table.x, 0, table.z);
    group.rotation.y = table.rotation;
    parent.add(group);
  });
}

/** Low posts that break the floor up and give the eye something to pass. */
function buildPosts(parent, timberMaterial) {
  TAVERN.posts.forEach((spot) => {
    const post = box(0.19, ROOM.beamHeight, 0.19, timberMaterial);
    post.position.set(spot.x, ROOM.beamHeight / 2, spot.z);
    parent.add(post);
    // A moulded head where the post meets the beam.
    const head = box(0.3, 0.1, 0.3, timberMaterial);
    head.position.set(spot.x, ROOM.beamHeight - 0.05, spot.z);
    parent.add(head);
  });
}

/** Herbs, a ham and a net of onions hung out of the way of heads. */
function buildHangingGoods(parent, herbMaterial, hamMaterial) {
  TAVERN.herbBunches.forEach((spot, index) => {
    const bunch = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 7), herbMaterial);
    bunch.position.set(spot.x, ROOM.beamHeight - 0.2, spot.z);
    bunch.rotation.z = 0.06 * (index % 2 ? 1 : -1);
    bunch.castShadow = true;
    parent.add(bunch);
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.12, 4), herbMaterial,
    );
    string.position.set(spot.x, ROOM.beamHeight - 0.02, spot.z);
    parent.add(string);
  });

  const ham = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), hamMaterial);
  ham.scale.set(0.72, 1.35, 0.72);
  ham.position.set(TAVERN.ham.x, ROOM.beamHeight - 0.3, TAVERN.ham.z);
  ham.castShadow = true;
  parent.add(ham);
}

/**
 * Rushes trodden into the flagstones. One instanced mesh rather than hundreds
 * of little ones, scattered thickest where the drinking happens and thinning
 * toward the walls, each piece turned and tilted so no two lie alike.
 */
function buildFloorStrewing(parent, rushMaterial) {
  const { rushCount, rushLengthMin, rushLengthMax, rushWidth, rushHeight } = TAVERN;
  const straws = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, rushHeight, rushWidth), rushMaterial, rushCount,
  );
  straws.receiveShadow = true;

  const placement = new THREE.Object3D();
  for (let i = 0; i < rushCount; i += 1) {
    // Biased toward the counter and the centre table, sparse at the edges.
    const acrossRoom = (Math.random() + Math.random() - 1);
    const alongRoom = (Math.random() + Math.random() - 1);
    placement.position.set(
      acrossRoom * (ROOM.width / 2 - 0.5) + 0.4,
      rushHeight / 2 + Math.random() * 0.004,
      alongRoom * (ROOM.depth / 2 - 0.5),
    );
    placement.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5);
    placement.scale.set(rushLengthMin + Math.random() * (rushLengthMax - rushLengthMin), 1, 1);
    placement.updateMatrix();
    straws.setMatrixAt(i, placement.matrix);
  }
  straws.instanceMatrix.needsUpdate = true;
  parent.add(straws);
}

export function buildTavern(scene) {
  const tavern = new THREE.Group();
  tavern.name = 'tavern';

  const panelMap = createOakTexture({ seed: 404, repeat: 1, base: '#3d2b1c' });
  const railMap = createOakTexture({ seed: 77, repeat: 1, base: '#2a1d13' });

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: panelMap, normalMap: panelMap.normalMap, normalScale: NORMAL_SCALE,
    roughnessMap: panelMap.roughnessMap, color: PALETTE.panelOak, roughness: 0.72,
  });
  const railMaterial = new THREE.MeshStandardMaterial({
    map: railMap, normalMap: railMap.normalMap, normalScale: NORMAL_SCALE,
    color: PALETTE.oakDark, roughness: 0.66,
  });
  const pewterMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.pewter, roughness: 0.3, metalness: 0.85,
  });
  const potteryMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.pottery, roughness: 0.58, metalness: 0.04,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.greenGlass, roughness: 0.18, metalness: 0.1, transparent: true, opacity: 0.86,
  });
  const herbMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.driedHerb, roughness: 0.98 });
  const hamMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.smokedHam, roughness: 0.86 });
  const rushMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.rush, roughness: 1.0 });

  const halfWidth = ROOM.width / 2 - 0.11;
  const halfDepth = ROOM.depth / 2 - 0.11;

  buildWainscotRun(tavern, {
    length: ROOM.width - 0.4, centre: { x: 0, z: -halfDepth }, rotationY: 0,
    material: panelMaterial, railMaterial,
  });
  buildWainscotRun(tavern, {
    length: ROOM.width - 0.4, centre: { x: 0, z: halfDepth }, rotationY: Math.PI,
    material: panelMaterial, railMaterial,
  });
  buildWainscotRun(tavern, {
    length: ROOM.depth - 0.4, centre: { x: halfWidth, z: 0 }, rotationY: -Math.PI / 2,
    material: panelMaterial, railMaterial,
  });

  buildBackBar(tavern, railMaterial, pewterMaterial, potteryMaterial, glassMaterial);
  buildSettles(tavern, panelMaterial);
  buildSideTables(tavern, railMaterial);
  buildPosts(tavern, railMaterial);
  buildHangingGoods(tavern, herbMaterial, hamMaterial);
  buildFloorStrewing(tavern, rushMaterial);

  scene.add(tavern);
  return tavern;
}
