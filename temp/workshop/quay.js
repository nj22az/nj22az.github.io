import * as THREE from 'three';

const EDGE = -35;
const TOP = -0.045;
const SEA = -0.97;

function randomSource(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function concreteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const random = randomSource(8472);
  const image = ctx.createImageData(512, 512);
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const a = x * Math.PI / 256;
      const b = y * Math.PI / 256;
      const grain = (random() - .5) * 34;
      const aggregate = 12 * Math.sin(a + 2 * b) + 9 * Math.cos(3 * a - b)
        + 5 * Math.cos(6 * a + 7 * b) + 4 * Math.sin(12 * a - 5 * b);
      const index = (y * 512 + x) * 4;
      image.data[index] = 183 + aggregate + grain;
      image.data[index + 1] = 177 + aggregate + grain;
      image.data[index + 2] = 163 + aggregate + grain;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 7);
  texture.anisotropy = 4;
  return texture;
}

function dockNumber() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d9d3a7';
  ctx.font = 'bold 105px monospace';
  ctx.fillText('03', 128, 68);
  ctx.globalCompositeOperation = 'destination-out';
  const random = randomSource(713);
  for (let i = 0; i < 600; i++) {
    ctx.globalAlpha = random() * .7;
    ctx.fillRect(random() * 256, random() * 128, 1 + 3 * random(), 1 + random());
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function waterSurface() {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
    fog: true,
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec3 worldPoint;
      void main() {
        worldPoint = (modelMatrix * vec4(position, 1.)).xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      #include <fog_pars_fragment>
      uniform float uTime;
      varying vec3 worldPoint;
      void main() {
        vec2 p = worldPoint.xz;
        float t = uTime * .28;
        float waves = sin(p.y * 4.8 + p.x * .55 + sin(p.x * 1.5 - t) * .6 + t);
        waves += .5 * sin(p.y * 8.1 - p.x * 2.25 - t * 1.2);
        waves += .22 * sin(p.y * 23. - p.x * 3.2 + t * 2.);
        float flecks = smoothstep(1.14, 1.52, waves);
        float distanceFade = 1. - smoothstep(13., 61., distance(cameraPosition, worldPoint));
        float quayShadow = smoothstep(-38., -34.95, p.x) * .53;
        vec3 sea = mix(vec3(.105,.229,.243), vec3(.025,.083,.096), quayShadow);
        sea += vec3(.086,.123,.121) * (.42 + waves * .13);
        sea += vec3(.18,.22,.195) * flecks * distanceFade;
        gl_FragColor = vec4(sea, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
}

// The quay uses Minato's working details: chained tyre fenders, a painted
// loading bay and scuppers. Their placements belong to this smaller preview.
export function buildQuay(scene) {
  const group = new THREE.Group();
  group.name = 'Western Quay';
  scene.add(group);

  const materials = new Map();
  const batches = new Map();
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const ring = new THREE.TorusGeometry(1, .21, 6, 16);
  const copy = new THREE.Object3D();
  const yAxis = new THREE.Vector3(0, 1, 0);

  function material(colour) {
    if (!materials.has(colour)) {
      materials.set(colour, new THREE.MeshStandardMaterial({ color: colour, roughness: .86 }));
    }
    return materials.get(colour);
  }

  function queue(geometry, colour, position, scale, rotation = [0, 0, 0], shadow = false) {
    const key = `${geometry.id}/${colour}/${shadow}`;
    if (!batches.has(key)) batches.set(key, { geometry, colour, shadow, transforms: [] });
    copy.position.set(...position);
    copy.scale.set(...scale);
    copy.rotation.set(...rotation);
    copy.updateMatrix();
    batches.get(key).transforms.push(copy.matrix.clone());
  }

  const box = (position, scale, colour, shadow = false, rotation) =>
    queue(cube, colour, position, scale, rotation, shadow);
  const post = (position, radius, height, colour, shadow = true) =>
    queue(cylinder, colour, position, [radius, height, radius], undefined, shadow);

  function rod(start, end, radius, colour, shadow = false) {
    const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
    const orientation = new THREE.Quaternion().setFromUnitVectors(yAxis, direction.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(orientation);
    queue(cylinder, colour, start.map((value, index) => (value + end[index]) / 2),
      [radius, direction.length(), radius], [euler.x, euler.y, euler.z], shadow);
  }

  const concrete = new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: .95 });
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(27, 55), concrete);
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(EDGE + 13.5, TOP, -41);
  deck.receiveShadow = true;
  group.add(deck);
  box([EDGE + .25, -.51, -41], [.5, .91, 55], 0x716f60);
  box([EDGE + .22, -.115, -41], [.51, .14, 54.95], 0x928977);

  const waterMaterial = waterSurface();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(166, 176), waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.set(-60, SEA, -54);
  group.add(water);

  const paint = new THREE.MeshStandardMaterial({
    color: 0xc2a35d, roughness: .93, polygonOffset: true,
    polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
  function paintedLine(x, z, width, length, mat = paint) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, TOP + .012, z);
    group.add(mesh);
  }
  for (const z of [-58.5, -49, -39, -29, -20]) {
    box([-21.25, TOP + .006, z], [26.85, .012, .023], 0x7d7a6e);
  }
  box([-19.5, TOP + .007, -41], [.026, .014, 54.8], 0x777367);
  paintedLine(EDGE + .68, -41, .105, 49.3);
  for (const z of [-35.8, -32.2]) paintedLine(-30.95, z, 4.2, .08);
  paintedLine(-33.02, -34, .08, 3.54);
  const stencil = new THREE.MeshStandardMaterial({
    map: dockNumber(), transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
  });
  paintedLine(-31.9, -33.2, 1.13, .565, stencil);

  for (const z of [-59, -51.4, -43.8, -36.2, -28.6, -21]) {
    post([EDGE + .32, .02, z], .29, .14, 0x4d5047);
    post([EDGE + .32, .225, z], .135, .39, 0x383d39);
    post([EDGE + .32, .451, z], .23, .073, 0x5f583d);
    post([EDGE + .32, .356, z], .144, .08, 0xb99a55);
    const rubberX = EDGE - .15;
    queue(ring, 0x252a27, [rubberX, -.53, z + 1.45], [.33, .33, .33],
      [0, Math.PI / 2, 0]);
    rod([EDGE + .11, -.08, z + 1.28], [rubberX, -.29, z + 1.31], .016, 0x4a5046);
    rod([EDGE + .11, -.08, z + 1.62], [rubberX, -.29, z + 1.59], .016, 0x4a5046);
    box([EDGE - .012, -.47, z - 1.8], [.024, .16, .22], 0x4e5248);
  }

  const iron = 0x5e665b;
  for (const z of [-48.4, -53.6]) {
    post([EDGE + 1.17, .54, z], .046, 1.15, iron);
    post([EDGE + 1.17, .045, z], .13, .16, 0x77776a);
  }
  for (const y of [.54, .98]) rod([EDGE + 1.17, y, -53.6], [EDGE + 1.17, y, -48.4], .033, iron);

  function warehouse(x, z, width, depth, height, colour, roofColour) {
    box([x, height / 2 + TOP, z], [width, height, depth], colour, true);
    const span = width + .5;
    const rise = span * .16;
    const pitch = Math.atan2(rise, span / 2);
    const slope = Math.hypot(rise, span / 2);
    const eave = height + TOP + .045;
    for (const side of [-1, 1]) {
      box([x + side * span / 4, eave + rise / 2, z], [slope, .16, depth + .5],
        roofColour, true, [0, 0, -side * pitch]);
    }
    const gable = new THREE.Shape();
    gable.moveTo(-width / 2, 0);
    gable.lineTo(width / 2, 0);
    gable.lineTo(0, rise);
    gable.closePath();
    const ends = new THREE.ShapeGeometry(gable);
    for (const side of [-1, 1]) {
      const mesh = new THREE.Mesh(ends, material(colour));
      mesh.rotation.y = side === 1 ? 0 : Math.PI;
      mesh.position.set(x, eave, z + side * depth / 2);
      group.add(mesh);
    }
    const front = z + depth / 2;
    for (let dx = -.38 * width; dx <= .4 * width; dx += 2.05) {
      box([x + dx, height * .56, front + .036], [1.05, .56, .074], 0x676e5e);
      box([x + dx, height * .56, front + .087], [.83, .39, .024], 0x4c5a56);
      box([x + dx, height * .56, front + .111], [.034, .41, .025], 0x898a73);
    }
    box([x, height * .19, front + .02], [width, .13, .04], 0x898372);
  }

  warehouse(-30, -56.5, 8.4, 6.4, 3.7, 0x9a9a81, 0x69786f);
  warehouse(-16.4, -56, 11.6, 8.8, 4.6, 0x9c9a81, 0x646e65);
  warehouse(-12.7, -46.9, 5.6, 7, 2.9, 0x8b9380, 0x555f57);
  box([-54.5, -.55, -46], [17, 1.05, 50], 0x83816f);
  box([-46.1, -.105, -46], [.42, .17, 50], 0xa39a82);
  warehouse(-52, -49.5, 7.6, 8.1, 3.15, 0x9a9a83, 0x667069);
  warehouse(-58.1, -58.3, 7.8, 8.5, 4.1, 0x9a9c86, 0x777f72);
  warehouse(-51.3, -67, 8.9, 6.3, 3.2, 0x92947c, 0x5e6e66);

  for (const [x, z] of [[-32.8, -54.7], [-13.5, -39.4], [-48.1, -51.4]]) {
    const base = [x, 0, z];
    const elbow = [x, 4.4, z];
    const end = [x + .75, 4.45, z];
    rod(base, elbow, .046, 0x565d53);
    rod(elbow, end, .032, 0x565d53);
    box([end[0], 4.41, z], [.36, .11, .22], 0x525b54);
    box([end[0], 4.343, z], [.27, .022, .14], 0xd9cc94);
  }

  function crate(x, z, size, colour) {
    const [width, height, depth] = size;
    box([x, TOP + height / 2, z], size, colour, true);
    for (const dx of [-width * .33, width * .33]) {
      box([x + dx, TOP + height / 2, z + depth / 2 + .022],
        [.065, height - .022, .043], 0x9c845d);
    }
    for (const y of [.12, .74]) {
      box([x, TOP + height * y, z + depth / 2 + .048],
        [width - .02, .072, .032], 0x8b7656);
    }
  }
  crate(-29.9, -51.1, [1.02, .71, .73], 0x7c6a4c);
  crate(-31.1, -50.9, [.77, .49, .69], 0x807254);
  crate(-15.1, -42.8, [.85, .59, .7], 0x7c7054);
  crate(-14.4, -42.5, [.62, .44, .61], 0x877550);
  for (const z of [-44.8, -45.41]) {
    post([-13.9, TOP + .42, z], .26, .83, 0x607164);
    post([-13.9, TOP + .59, z], .272, .038, 0x465e53);
    post([-13.9, TOP + .23, z], .272, .038, 0x465e53);
  }

  // The moored skiff sits below the quay and gives scale to the fenders.
  const hull = new THREE.Shape();
  hull.moveTo(-.77, -2.25);
  hull.lineTo(.77, -2.25);
  hull.lineTo(.94, .9);
  hull.quadraticCurveTo(.78, 2.19, 0, 2.77);
  hull.quadraticCurveTo(-.78, 2.19, -.94, .9);
  hull.closePath();
  const hullGeometry = new THREE.ExtrudeGeometry(hull, {
    depth: .41, bevelEnabled: true, bevelSize: .13, bevelThickness: .12,
    bevelSegments: 1, curveSegments: 6, steps: 1,
  });
  const boat = new THREE.Mesh(hullGeometry, material(0xccc0a0));
  boat.position.set(-38, -.58, -44.5);
  boat.rotation.x = Math.PI / 2;
  group.add(boat);
  box([-38, -.46, -45.15], [1.28, .18, 1.61], 0x66756a);
  box([-38, -.2, -43.85], [1.09, .56, 1.11], 0xcdc4a7);
  box([-38, .125, -43.86], [1.27, .13, 1.28], 0x54726b);
  box([-38, -.116, -43.28], [.72, .23, .055], 0x52625b);
  rod([-38, .18, -44.1], [-38, 1.13, -44.1], .031, 0x666e61);
  rod([-37.94, -.5, -47.13], [EDGE + .32, .34, -51.4], .023, 0x9f9476);
  rod([-37.92, -.5, -42.32], [EDGE + .32, .34, -43.8], .023, 0x9f9476);

  // Flattened coastal ridges sit behind the warehouse roofs.
  const rock = new THREE.IcosahedronGeometry(1, 2);
  for (const [x, y, z, width, height, depth, colour] of [
    [-64, -.82, -77, 19, 8, 9, 0x708279],
    [-49, -1.4, -84, 15, 9, 9, 0x75867a],
    [-29, -1.3, -89, 19, 8, 11, 0x7b8a7b],
    [-12, -1.2, -91, 17, 6, 9, 0x829185],
  ]) queue(rock, colour, [x, y, z], [width, height, depth]);

  for (const { geometry, colour, shadow, transforms } of batches.values()) {
    const mesh = new THREE.InstancedMesh(geometry, material(colour), transforms.length);
    transforms.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.castShadow = shadow;
    mesh.receiveShadow = shadow;
    group.add(mesh);
  }

  return { setTime(seconds) { waterMaterial.uniforms.uTime.value = seconds; } };
}
