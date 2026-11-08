import * as THREE from 'three';
import { FruitType, SpecialType, BoardSkin } from '../types/game';

// Shared reusable materials & geometries cache for high performance
const materialsCache = new Map<string, THREE.Material>();
const geometriesCache = new Map<string, THREE.BufferGeometry>();

/**
 * Creates standard soft PBR materials with proper roughness/metalness
 */
function getMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
  if (!materialsCache.has(key)) {
    materialsCache.set(key, createFn());
  }
  return materialsCache.get(key)!;
}

// Procedural textures
let strawberryTexture: THREE.CanvasTexture | null = null;
function getStrawberryTexture(): THREE.CanvasTexture {
  if (!strawberryTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ff2e55';
    ctx.fillRect(0, 0, 128, 128);

    // Seed dots
    ctx.fillStyle = '#ffe066';
    for (let y = 16; y < 128; y += 24) {
      for (let x = (y % 48 === 0 ? 12 : 24); x < 128; x += 24) {
        ctx.beginPath();
        ctx.ellipse(x, y, 2.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    strawberryTexture = new THREE.CanvasTexture(canvas);
    strawberryTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return strawberryTexture;
}

let watermelonTexture: THREE.CanvasTexture | null = null;
function getWatermelonTexture(): THREE.CanvasTexture {
  if (!watermelonTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2d8a4e';
    ctx.fillRect(0, 0, 128, 128);

    // Dark wavy stripes
    ctx.fillStyle = '#144c29';
    for (let x = 0; x < 128; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 4, 0);
      ctx.bezierCurveTo(x + 18, 40, x - 10, 80, x + 8, 128);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#144c29';
      ctx.stroke();
    }
    watermelonTexture = new THREE.CanvasTexture(canvas);
    watermelonTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return watermelonTexture;
}

/**
 * Procedural Composite 3-12 Part 3D Fruit Models
 */
export function createFruitGroup(fruitType: FruitType, special: SpecialType = 'none'): THREE.Group {
  const group = new THREE.Group();
  group.name = `fruit_${fruitType}`;

  const fruitContainer = new THREE.Group();
  fruitContainer.name = 'fruitMesh';

  switch (fruitType) {
    case 'strawberry': {
      // 1. Primary body: cone with curved bottom
      const bodyMat = getMaterial('strawberry_body', () => new THREE.MeshStandardMaterial({
        map: getStrawberryTexture(),
        roughness: 0.35,
        metalness: 0.05,
      }));
      const bodyGeo = new THREE.ConeGeometry(0.55, 1.0, 18, 1, false);
      bodyGeo.translate(0, 0.3, 0);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = Math.PI;
      body.castShadow = true;
      body.receiveShadow = true;
      fruitContainer.add(body);

      // 2. Leaf calyx (green star)
      const leafMat = getMaterial('leaf_green', () => new THREE.MeshStandardMaterial({
        color: 0x48bb78,
        roughness: 0.65,
        metalness: 0.0,
      }));
      for (let i = 0; i < 5; i++) {
        const petalGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
        petalGeo.rotateZ(Math.PI / 2.3);
        const petal = new THREE.Mesh(petalGeo, leafMat);
        petal.rotation.y = (i * Math.PI * 2) / 5;
        petal.position.y = 0.52;
        petal.castShadow = true;
        fruitContainer.add(petal);
      }

      // 3. Stem
      const stemMat = getMaterial('stem_brown', () => new THREE.MeshStandardMaterial({
        color: 0x684828,
        roughness: 0.8,
      }));
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.28, 8);
      stemGeo.translate(0, 0.14, 0);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.52;
      stem.rotation.z = 0.15;
      stem.castShadow = true;
      fruitContainer.add(stem);
      break;
    }

    case 'orange': {
      // 1. Primary body: juicy bright orange sphere
      const orangeMat = getMaterial('orange_body', () => new THREE.MeshStandardMaterial({
        color: 0xff8c1a,
        roughness: 0.38,
        metalness: 0.05,
      }));
      const bodyGeo = new THREE.SphereGeometry(0.58, 20, 18);
      bodyGeo.scale(1, 0.92, 1);
      const body = new THREE.Mesh(bodyGeo, orangeMat);
      body.position.y = 0.0;
      body.castShadow = true;
      body.receiveShadow = true;
      fruitContainer.add(body);

      // 2. Dimple top button
      const stemMat = getMaterial('stem_dark', () => new THREE.MeshStandardMaterial({
        color: 0x4a2e12,
        roughness: 0.8,
      }));
      const buttonGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.08, 8);
      const button = new THREE.Mesh(buttonGeo, stemMat);
      button.position.y = 0.52;
      fruitContainer.add(button);

      // 3. Cute green leaf
      const leafMat = getMaterial('leaf_green', () => new THREE.MeshStandardMaterial({
        color: 0x38a169,
        roughness: 0.6,
      }));
      const leafGeo = new THREE.ConeGeometry(0.16, 0.38, 5);
      leafGeo.rotateZ(-Math.PI / 3);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.12, 0.52, 0);
      leaf.castShadow = true;
      fruitContainer.add(leaf);
      break;
    }

    case 'grapes': {
      // Clustered 7-sphere grape bunch
      const grapeMat = getMaterial('grape_body', () => new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.28,
        metalness: 0.12,
      }));

      const grapeGeo = new THREE.SphereGeometry(0.24, 14, 12);
      const grapeOffsets = [
        [0, -0.28, 0],
        [-0.18, -0.05, 0.1],
        [0.18, -0.05, 0.1],
        [0, -0.05, -0.18],
        [-0.22, 0.2, -0.08],
        [0.22, 0.2, -0.08],
        [0, 0.22, 0.18],
      ];

      grapeOffsets.forEach(([gx, gy, gz], idx) => {
        const grape = new THREE.Mesh(grapeGeo, grapeMat);
        grape.position.set(gx, gy, gz);
        grape.scale.setScalar(idx === 0 ? 0.9 : 1.0);
        grape.castShadow = true;
        fruitContainer.add(grape);
      });

      // Stem stalk
      const stemMat = getMaterial('stem_brown', () => new THREE.MeshStandardMaterial({
        color: 0x604526,
        roughness: 0.8,
      }));
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.35, 8);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.44, 0);
      stem.rotation.z = -0.15;
      fruitContainer.add(stem);
      break;
    }

    case 'watermelon': {
      // 1. Watermelon spherical segment / sphere with procedural striped texture
      const melonMat = getMaterial('watermelon_body', () => new THREE.MeshStandardMaterial({
        map: getWatermelonTexture(),
        roughness: 0.4,
        metalness: 0.04,
      }));
      const bodyGeo = new THREE.SphereGeometry(0.6, 22, 20);
      bodyGeo.scale(1.05, 0.95, 0.95);
      const body = new THREE.Mesh(bodyGeo, melonMat);
      body.castShadow = true;
      body.receiveShadow = true;
      fruitContainer.add(body);

      // Curly tendril / stem
      const stemMat = getMaterial('stem_greenish', () => new THREE.MeshStandardMaterial({
        color: 0x22543d,
        roughness: 0.7,
      }));
      const stemGeo = new THREE.TorusGeometry(0.12, 0.035, 6, 12, Math.PI * 1.3);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.54, 0);
      stem.rotation.x = Math.PI / 2;
      fruitContainer.add(stem);
      break;
    }

    case 'banana': {
      // Curved yellow banana using bent cylinder / torus arc
      const bananaMat = getMaterial('banana_body', () => new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.35,
        metalness: 0.05,
      }));
      const arcGeo = new THREE.TorusGeometry(0.65, 0.18, 10, 16, Math.PI * 0.7);
      const arc = new THREE.Mesh(arcGeo, bananaMat);
      arc.rotation.z = -Math.PI * 0.35;
      arc.position.set(0.1, -0.15, 0);
      arc.castShadow = true;
      arc.receiveShadow = true;
      fruitContainer.add(arc);

      // Brown tip and green stalk
      const tipMat = getMaterial('banana_tip', () => new THREE.MeshStandardMaterial({
        color: 0x4a3810,
        roughness: 0.8,
      }));
      const tipGeo = new THREE.ConeGeometry(0.12, 0.18, 6);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(-0.35, -0.38, 0);
      tip.rotation.z = Math.PI * 0.75;
      fruitContainer.add(tip);

      const stemGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.22, 6);
      const stem = new THREE.Mesh(stemGeo, tipMat);
      stem.position.set(0.38, 0.38, 0);
      stem.rotation.z = -Math.PI * 0.3;
      fruitContainer.add(stem);
      break;
    }

    case 'peach': {
      // Twin soft heart-shaped cheeks
      const peachMat = getMaterial('peach_body', () => new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        roughness: 0.45,
        metalness: 0.02,
      }));
      const cheekGeo = new THREE.SphereGeometry(0.42, 16, 16);
      cheekGeo.scale(1, 1.1, 0.95);

      const cheekL = new THREE.Mesh(cheekGeo, peachMat);
      cheekL.position.set(-0.16, 0.0, 0);
      cheekL.castShadow = true;
      fruitContainer.add(cheekL);

      const cheekR = new THREE.Mesh(cheekGeo, peachMat);
      cheekR.position.set(0.16, 0.0, 0);
      cheekR.castShadow = true;
      fruitContainer.add(cheekR);

      // Little pointed tip at bottom
      const tipMat = peachMat;
      const tipGeo = new THREE.ConeGeometry(0.14, 0.25, 8);
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, -0.46, 0);
      tip.rotation.x = Math.PI;
      fruitContainer.add(tip);

      // Green leaf
      const leafMat = getMaterial('leaf_green', () => new THREE.MeshStandardMaterial({
        color: 0x2f855a,
        roughness: 0.6,
      }));
      const leafGeo = new THREE.ConeGeometry(0.14, 0.4, 5);
      leafGeo.rotateZ(Math.PI / 3);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.15, 0.44, 0);
      fruitContainer.add(leaf);
      break;
    }

    case 'apple': {
      // Crisp green apple with dimples
      const appleMat = getMaterial('apple_body', () => new THREE.MeshStandardMaterial({
        color: 0x84cc16,
        roughness: 0.28,
        metalness: 0.06,
      }));
      const appleGeo = new THREE.SphereGeometry(0.56, 20, 18);
      appleGeo.scale(1.05, 0.94, 1.05);
      const body = new THREE.Mesh(appleGeo, appleMat);
      body.castShadow = true;
      body.receiveShadow = true;
      fruitContainer.add(body);

      // Wooden stem
      const stemMat = getMaterial('stem_brown', () => new THREE.MeshStandardMaterial({
        color: 0x503315,
        roughness: 0.8,
      }));
      const stemGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.35, 8);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.5, 0);
      stem.rotation.z = 0.2;
      fruitContainer.add(stem);

      // Little leaf
      const leafMat = getMaterial('leaf_green', () => new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.5,
      }));
      const leafGeo = new THREE.ConeGeometry(0.14, 0.32, 5);
      leafGeo.rotateZ(-Math.PI / 2.6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.14, 0.52, 0);
      fruitContainer.add(leaf);
      break;
    }

    case 'mango': {
      // Teardrop curved golden-orange mango
      const mangoMat = getMaterial('mango_body', () => new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.32,
        metalness: 0.08,
      }));
      const mangoGeo = new THREE.SphereGeometry(0.52, 18, 16);
      mangoGeo.scale(0.85, 1.25, 0.85);
      const body = new THREE.Mesh(mangoGeo, mangoMat);
      body.rotation.z = -0.25;
      body.castShadow = true;
      body.receiveShadow = true;
      fruitContainer.add(body);

      // Top stalk
      const stemMat = getMaterial('stem_brown', () => new THREE.MeshStandardMaterial({
        color: 0x5a3915,
        roughness: 0.8,
      }));
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.24, 6);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0.12, 0.55, 0);
      fruitContainer.add(stem);
      break;
    }
  }

  // Handle Special Fruit Visual Accents
  if (special !== 'none') {
    const specialGroup = createSpecialAccent(special);
    fruitContainer.add(specialGroup);
  }

  group.add(fruitContainer);
  return group;
}

/**
 * Creates distinct 3D visual indicators for special fruits
 */
function createSpecialAccent(special: SpecialType): THREE.Group {
  const g = new THREE.Group();
  g.name = 'specialAccent';

  if (special === 'striped_h') {
    // Horizontal energy rings
    const ringMat = getMaterial('special_striped_h', () => new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
    }));
    const ringGeo = new THREE.TorusGeometry(0.68, 0.06, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.y = 0.15;
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.y = -0.15;
    g.add(ring1, ring2);
  } else if (special === 'striped_v') {
    // Vertical energy rings
    const ringMat = getMaterial('special_striped_v', () => new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
    }));
    const ringGeo = new THREE.TorusGeometry(0.68, 0.06, 8, 24);
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 2;
    g.add(ring1, ring2);
  } else if (special === 'bomb') {
    // Sparking little bomb fuse / halo
    const bombMat = getMaterial('special_bomb', () => new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    }));
    const sphereGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const orb = new THREE.Mesh(sphereGeo, bombMat);
    orb.position.set(0, 0.72, 0);

    const haloGeo = new THREE.TorusGeometry(0.75, 0.05, 8, 24);
    const halo = new THREE.Mesh(haloGeo, bombMat);
    halo.rotation.x = Math.PI / 3;
    g.add(orb, halo);
  } else if (special === 'cross') {
    // 4-way crystal compass spikes
    const crossMat = getMaterial('special_cross', () => new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    }));
    for (let i = 0; i < 4; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.12, 0.45, 6);
      spikeGeo.rotateZ(Math.PI / 2);
      const spike = new THREE.Mesh(spikeGeo, crossMat);
      spike.rotation.y = (i * Math.PI) / 2;
      spike.position.y = 0.0;
      g.add(spike);
    }
  } else if (special === 'rainbow') {
    // Iridescent shimmering rainbow sphere with orbiting satellite prisms
    const rainbowMat = getMaterial('special_rainbow', () => new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
      emissive: 0xffe4e6,
      emissiveIntensity: 0.4,
    }));
    const coreGeo = new THREE.IcosahedronGeometry(0.68, 2);
    const core = new THREE.Mesh(coreGeo, rainbowMat);

    // Multi-color orbiting rings
    const ringMat = getMaterial('rainbow_ring', () => new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xec4899,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 32), ringMat);
    ring.rotation.x = Math.PI / 4;
    ring.name = 'rainbowRing';

    g.add(core, ring);
  }

  return g;
}

/**
 * Procedural 3D Ice Cube Shell
 */
export function createIceBlock(level: 1 | 2): THREE.Group {
  const group = new THREE.Group();
  group.name = `ice_block_${level}`;

  const iceMat = getMaterial(`ice_mat_${level}`, () => new THREE.MeshPhysicalMaterial({
    color: level === 2 ? 0xa5f3fc : 0xcffafe,
    transmission: 0.7,
    opacity: level === 2 ? 0.78 : 0.58,
    transparent: true,
    roughness: 0.15,
    metalness: 0.1,
    ior: 1.31,
  }));

  const boxGeo = new THREE.BoxGeometry(1.08, 1.08, 1.08);
  const cube = new THREE.Mesh(boxGeo, boxMatHelper(iceMat));
  cube.castShadow = true;
  cube.receiveShadow = true;
  group.add(cube);

  // If level 2 (double ice), add frosty interior crystal lattice
  if (level === 2) {
    const innerGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const innerMat = getMaterial('ice_inner', () => new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      transparent: true,
      opacity: 0.35,
    }));
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);
  }

  return group;
}

function boxMatHelper(m: THREE.Material): THREE.Material {
  return m;
}

/**
 * Procedural 3D Honey Jar / Honey Obstacle
 */
export function createHoneyJar(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'honey_jar';

  // 1. Amber glass jar body
  const jarMat = getMaterial('honey_jar_body', () => new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.25,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  }));
  const jarGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.75, 16);
  const jar = new THREE.Mesh(jarGeo, jarMat);
  jar.castShadow = true;
  jar.receiveShadow = true;
  jar.position.y = 0.0;
  group.add(jar);

  // 2. Wooden cork / lid
  const lidMat = getMaterial('honey_lid', () => new THREE.MeshStandardMaterial({
    color: 0x854d0e,
    roughness: 0.75,
  }));
  const lidGeo = new THREE.CylinderGeometry(0.52, 0.5, 0.22, 16);
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 0.45;
  lid.castShadow = true;
  group.add(lid);

  // 3. Golden dripping honey beads
  const dripMat = getMaterial('honey_drip', () => new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.3,
    roughness: 0.1,
  }));
  const drip1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), dripMat);
  drip1.position.set(0.35, 0.1, 0.35);
  const drip2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), dripMat);
  drip2.position.set(-0.35, -0.15, 0.3);
  group.add(drip1, drip2);

  return group;
}

/**
 * Procedural 3D Portal Vortex Tile
 */
export function createPortalTile(type: 'portal_in' | 'portal_out'): THREE.Group {
  const group = new THREE.Group();
  group.name = type;

  const isEntry = type === 'portal_in';
  const portalMat = getMaterial(`portal_mat_${type}`, () => new THREE.MeshStandardMaterial({
    color: isEntry ? 0x8b5cf6 : 0x06b6d4,
    emissive: isEntry ? 0x6d28d9 : 0x0891b2,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  }));

  const ringGeo = new THREE.TorusGeometry(0.48, 0.08, 10, 24);
  ringGeo.rotateX(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, portalMat);
  ring.position.y = -0.42;
  ring.name = 'portalRing';
  group.add(ring);

  return group;
}

/**
 * Procedural Voxel Board Base Tile
 */
export function createBoardTile(skin: BoardSkin = 'wood'): THREE.Group {
  const group = new THREE.Group();
  group.name = `board_tile_${skin}`;

  let baseColor = 0xe2d9cc;
  let topColor = 0xf5ede1;
  let bevelColor = 0xd5c6b3;

  if (skin === 'ice') {
    baseColor = 0xa5f3fc;
    topColor = 0xe0f2fe;
    bevelColor = 0x7dd3fc;
  } else if (skin === 'sakura') {
    baseColor = 0xfce7f3;
    topColor = 0xfdf2f8;
    bevelColor = 0xfbcfe8;
  } else if (skin === 'starlight') {
    baseColor = 0x1e293b;
    topColor = 0x334155;
    bevelColor = 0x475569;
  } else if (skin === 'coral') {
    baseColor = 0x0f766e;
    topColor = 0x14b8a6;
    bevelColor = 0x0d9488;
  }

  // Rounded Voxel Base Tile: Box with gentle beveled inset plate
  const baseMat = getMaterial(`tile_base_${skin}`, () => new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.7,
    metalness: 0.05,
  }));
  const baseGeo = new THREE.BoxGeometry(1.12, 0.28, 1.12);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -0.64;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Top recessed circular bay where fruit rests
  const plateMat = getMaterial(`tile_plate_${skin}`, () => new THREE.MeshStandardMaterial({
    color: topColor,
    roughness: 0.55,
    metalness: 0.05,
  }));
  const plateGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.05, 20);
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.position.y = -0.48;
  plateMesh.receiveShadow = true;
  group.add(plateMesh);

  return group;
}
