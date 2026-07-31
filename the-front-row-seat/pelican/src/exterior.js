/**
 * Outside the door: the alley, Pelican Stairs, the foreshore at low water,
 * the river, moored craft, and — well downriver, at the edge of sight — the
 * gibbet.
 *
 * On Execution Dock: it was real, it was in use in 1603, and its exact site is
 * disputed. Rocque's 1746 map puts Execution Dock Stairs several hundred yards
 * west of here. So it stands where it stands: distant, and never claimed to be
 * this house's own ground.
 */

import * as THREE from '../vendor/three.module.min.js';

/** How strongly the derived normal maps bite. */
const NORMAL_SCALE = new THREE.Vector2(0.85, 0.85);
import { ROOM, DOOR, EXTERIOR, PALETTE, LIGHTING } from './config.js';
import { createOakTexture, createFlagstoneTexture, createSootTexture } from './textures.js';
import { groundHeightAt } from './terrain.js';

function box(width, height, depth, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** The mud, dropping away from the foot of the stairs into the water. */
function buildForeshore(parent, mudMaterial) {
  const width = 42;
  const depth = 40;
  const segments = 48;
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const centreX = EXTERIOR.stairRunEnd - width / 2 + 2;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i) + centreX;
    const z = positions.getZ(i) + DOOR.z;
    // The profile comes from the same function the camera walks on, plus a
    // little ripple so the mud is not a sheet of glass.
    const ripple = Math.sin(x * 0.7 + z * 0.4) * 0.035 + Math.sin(z * 1.3) * 0.02;
    positions.setY(i, groundHeightAt(x) + ripple);
    positions.setX(i, x - centreX);
  }
  geometry.computeVertexNormals();

  const mud = new THREE.Mesh(geometry, mudMaterial);
  mud.position.set(centreX, 0, DOOR.z);
  mud.receiveShadow = true;
  parent.add(mud);
}

/** Pelican Stairs, worn, wet, and narrower than anybody would build today. */
function buildStairs(parent, stoneMaterial, timberMaterial) {
  const run = EXTERIOR.stairRunEnd - EXTERIOR.stairRunStart;
  const treadDepth = run / EXTERIOR.stairCount;
  const riserHeight = (EXTERIOR.stairBottom - EXTERIOR.stairTop) / EXTERIOR.stairCount;

  for (let i = 0; i < EXTERIOR.stairCount; i += 1) {
    const tread = box(Math.abs(treadDepth) + 0.06, 0.1, EXTERIOR.stairWidth, stoneMaterial);
    tread.position.set(
      EXTERIOR.stairRunStart + treadDepth * (i + 0.5),
      riserHeight * i - 0.05,
      DOOR.z,
    );
    parent.add(tread);
  }

  // A handrail post at the head, the sort a waterman grabs coming up wet.
  [-1, 1].forEach((side) => {
    const post = box(0.11, 1.05, 0.11, timberMaterial);
    post.position.set(EXTERIOR.stairRunStart + 0.15, 0.52, DOOR.z + side * (EXTERIOR.stairWidth / 2 + 0.1));
    parent.add(post);
  });
}

/** The tavern's river wall and the alley it forms with the neighbouring range. */
function buildAlley(parent, brickMaterial, timberMaterial) {
  const alleyStart = -ROOM.width / 2;
  const alleyEnd = EXTERIOR.stairRunStart;
  const length = alleyStart - alleyEnd;

  // The paving of the alley itself.
  const paving = box(length, 0.08, EXTERIOR.alleyWidth, brickMaterial);
  paving.position.set(alleyEnd + length / 2, -0.04, DOOR.z);
  parent.add(paving);

  // The neighbouring range, blank and close, which is what makes it an alley.
  const range = box(length, 6.5, 0.4, brickMaterial);
  range.position.set(alleyEnd + length / 2, 3.25, DOOR.z - EXTERIOR.alleyWidth / 2 - 0.2);
  parent.add(range);

  // The tavern's own outside wall and the jetty of its upper storey.
  const tavernWall = box(length, 6.0, 0.4, brickMaterial);
  tavernWall.position.set(alleyEnd + length / 2, 3.0, DOOR.z + EXTERIOR.alleyWidth / 2 + 0.2);
  parent.add(tavernWall);

  const jetty = box(length, 0.5, 0.75, timberMaterial);
  jetty.position.set(alleyEnd + length / 2, 2.5, DOOR.z + EXTERIOR.alleyWidth / 2 - 0.1);
  parent.add(jetty);
}

/** Lighters and a wherry, drawn up and left by the tide. */
function buildMoorings(parent, timberMaterial) {
  EXTERIOR.moorings.forEach((mooring) => {
    const hull = new THREE.Group();
    const beam = mooring.length * 0.28;

    const bottom = box(mooring.length, 0.16, beam, timberMaterial);
    bottom.position.y = 0.08;
    hull.add(bottom);

    [-1, 1].forEach((side) => {
      const side_ = box(mooring.length, 0.52, 0.1, timberMaterial);
      side_.position.set(0, 0.3, side * beam / 2);
      side_.rotation.x = side * 0.14;
      hull.add(side_);
    });
    [-1, 1].forEach((end) => {
      const transom = box(0.1, 0.5, beam, timberMaterial);
      transom.position.set(end * mooring.length / 2, 0.29, 0);
      hull.add(transom);
    });

    hull.position.set(mooring.x, groundHeightAt(mooring.x) + 0.02, mooring.z);
    hull.rotation.y = mooring.rotation;
    hull.rotation.z = 0.06;
    parent.add(hull);
  });
}

/**
 * The gibbet, downriver. A post, a crosstree, a chain and an empty cage —
 * empty because the scene will not put a body on the page for decoration.
 */
function buildGibbet(parent, timberMaterial, ironMaterial) {
  const gibbet = new THREE.Group();
  const height = EXTERIOR.gibbetHeight;

  const post = box(0.24, height, 0.24, timberMaterial);
  post.position.y = height / 2;
  gibbet.add(post);

  const arm = box(1.5, 0.18, 0.18, timberMaterial);
  arm.position.set(0.62, height - 0.16, 0);
  gibbet.add(arm);

  const brace = box(0.7, 0.14, 0.14, timberMaterial);
  brace.position.set(0.34, height - 0.62, 0);
  brace.rotation.z = Math.PI / 4;
  gibbet.add(brace);

  const chain = box(0.045, 0.75, 0.045, ironMaterial);
  chain.position.set(1.24, height - 0.6, 0);
  gibbet.add(chain);

  // The cage: four uprights and two hoops, and nothing inside it.
  const cage = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const bar = box(0.035, 0.8, 0.035, ironMaterial);
    bar.position.set(Math.cos(angle) * 0.17, 0, Math.sin(angle) * 0.17);
    cage.add(bar);
  }
  [-0.34, 0.34].forEach((y) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 5, 12), ironMaterial);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = y;
    cage.add(hoop);
  });
  cage.position.set(1.24, height - 1.38, 0);
  gibbet.add(cage);

  gibbet.position.set(EXTERIOR.gibbetX, groundHeightAt(EXTERIOR.gibbetX), EXTERIOR.gibbetZ);
  gibbet.rotation.y = 0.4;
  parent.add(gibbet);
  return gibbet;
}

/** The river: a broad dark plane with a slow swell worked into it. */
function buildRiver(parent) {
  const geometry = new THREE.PlaneGeometry(150, 150, 60, 60);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: PALETTE.river,
    emissive: LIGHTING.riverEmissive,
    emissiveIntensity: LIGHTING.riverEmissiveIntensity,
    roughness: 0.16,
    metalness: 0.55,
    transparent: true,
    opacity: 0.94,
  });
  const river = new THREE.Mesh(geometry, material);
  river.position.set(EXTERIOR.stairRunEnd - 60, EXTERIOR.waterLevel, DOOR.z);
  river.receiveShadow = false;
  parent.add(river);
  return river;
}

/** The far bank: a low band of roofs, too distant to be anything but shape. */
function buildFarBank(parent) {
  const bank = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x0e1216, roughness: 1.0 });
  let cursor = -60;
  for (let i = 0; i < 26; i += 1) {
    const width = 3 + Math.random() * 7;
    const height = 2.5 + Math.random() * 5.5;
    const roof = box(width, height, 5, material);
    roof.position.set(EXTERIOR.farBankDistance, height / 2 - 3.4, cursor + width / 2);
    roof.castShadow = false;
    roof.receiveShadow = false;
    bank.add(roof);
    cursor += width + Math.random() * 1.4;
  }
  parent.add(bank);
  return bank;
}

/**
 * The breaking shed: four posts, a pitched roof, stacked baulks and a trestle,
 * and a floor of pale sawdust. Open on the river side, because that is how a
 * hull is brought in.
 */
function buildShed(parent, timberMaterial, pineMaterial, sawdustMaterial) {
  const shed = new THREE.Group();
  const { shedWidth: width, shedDepth: depth, shedHeight: height } = EXTERIOR;

  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const post = box(0.22, height, 0.22, timberMaterial);
    post.position.set(sx * (width / 2 - 0.2), height / 2, sz * (depth / 2 - 0.2));
    shed.add(post);
  });

  [-1, 1].forEach((sz) => {
    const plate = box(width, 0.2, 0.2, timberMaterial);
    plate.position.set(0, height - 0.1, sz * (depth / 2 - 0.2));
    shed.add(plate);
  });

  // A shallow pitched roof in two slopes.
  [-1, 1].forEach((sz) => {
    const slope = box(width + 0.5, 0.12, depth / 2 + 0.45, timberMaterial);
    slope.position.set(0, height + 0.34, sz * depth / 4);
    slope.rotation.x = sz * 0.24;
    shed.add(slope);
  });
  const ridge = box(width + 0.6, 0.16, 0.16, timberMaterial);
  ridge.position.set(0, height + 0.66, 0);
  shed.add(ridge);

  // The back wall; the river side stays open.
  const back = box(width, height - 0.3, 0.1, timberMaterial);
  back.position.set(0, (height - 0.3) / 2, -depth / 2 + 0.16);
  shed.add(back);

  // Stacked pine, pale and freshly sawn.
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 4 - row; i += 1) {
      const baulk = box(0.3, 0.28, depth - 1.2, pineMaterial);
      baulk.position.set(
        -width / 2 + 0.8 + i * 0.34 + row * 0.17,
        0.16 + row * 0.29,
        0.3,
      );
      baulk.rotation.y = (Math.random() - 0.5) * 0.05;
      shed.add(baulk);
    }
  }

  // A trestle and a saw's worth of mess.
  const trestle = box(1.9, 0.16, 0.42, timberMaterial);
  trestle.position.set(1.5, 0.72, -1.1);
  shed.add(trestle);
  [-0.75, 0.75].forEach((offset) => {
    const leg = box(0.12, 0.72, 0.12, timberMaterial);
    leg.position.set(1.5 + offset, 0.36, -1.1);
    shed.add(leg);
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.6, depth - 0.6), sawdustMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.012;
  floor.receiveShadow = true;
  shed.add(floor);

  shed.position.set(EXTERIOR.shedX, groundHeightAt(EXTERIOR.shedX), EXTERIOR.shedZ);
  shed.rotation.y = -Math.PI / 2 - 0.15;
  parent.add(shed);
  return shed;
}

export function buildExterior(scene) {
  const exterior = new THREE.Group();
  exterior.name = 'exterior';

  const mudMap = createFlagstoneTexture({ seed: 88, repeat: 9 });
  const stoneMap = createFlagstoneTexture({ seed: 5, repeat: 2 });
  const timberMap = createOakTexture({ seed: 202, repeat: 2, base: '#241c15' });
  const brickMap = createSootTexture({ seed: 17, repeat: 4 });

  const mudMaterial = new THREE.MeshStandardMaterial({
    map: mudMap, normalMap: mudMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: mudMap.roughnessMap,
    color: PALETTE.mud, emissive: LIGHTING.mudEmissive,
    emissiveIntensity: LIGHTING.mudEmissiveIntensity, roughness: 0.52, metalness: 0.12,
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    map: stoneMap, normalMap: stoneMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: stoneMap.roughnessMap,
    color: 0x4d463e, roughness: 0.38, metalness: 0.14,
  });
  const timberMaterial = new THREE.MeshStandardMaterial({
    map: timberMap, normalMap: timberMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: timberMap.roughnessMap,
    color: PALETTE.wetTimber, roughness: 0.46, metalness: 0.08,
  });
  const brickMaterial = new THREE.MeshStandardMaterial({
    map: brickMap, normalMap: brickMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: brickMap.roughnessMap,
    color: 0x2a2420, roughness: 0.96,
  });
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.55, metalness: 0.6,
  });

  buildForeshore(exterior, mudMaterial);
  buildAlley(exterior, brickMaterial, timberMaterial);
  buildStairs(exterior, stoneMaterial, timberMaterial);
  const pineMaterial = new THREE.MeshStandardMaterial({
    map: timberMap, normalMap: timberMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: timberMap.roughnessMap,
    color: 0xb9a279, roughness: 0.92,
  });
  const sawdustMaterial = new THREE.MeshStandardMaterial({ color: 0x6f6248, roughness: 1.0 });

  buildMoorings(exterior, timberMaterial);
  buildShed(exterior, timberMaterial, pineMaterial, sawdustMaterial);
  buildGibbet(exterior, timberMaterial, ironMaterial);
  const river = buildRiver(exterior);
  buildFarBank(exterior);

  scene.add(exterior);
  return { exterior, river };
}
