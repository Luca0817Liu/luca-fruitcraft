import * as THREE from 'three';
import {
  CellData,
  FruitType,
  SpecialType,
  ThemeType,
  BoardSkin,
  TileType,
} from '../types/game';
import {
  createFruitGroup,
  createIceBlock,
  createHoneyJar,
  createPortalTile,
  createBoardTile,
} from './fruitModels';
import { ParticleManager } from './particles';

export interface SceneCallbacks {
  onSwapAttempt: (r1: number, c1: number, r2: number, c2: number) => void;
  onSelectCell?: (r: number, c: number) => void;
  onCellClick?: (r: number, c: number) => boolean | void;
}

interface FruitMeshItem {
  id: string;
  r: number;
  c: number;
  targetR: number;
  targetC: number;
  group: THREE.Group;
  fruit: FruitType;
  special: SpecialType;
  animState: 'idle' | 'swapping' | 'falling' | 'bouncing';
  animProgress: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
}

export class GameScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private particleManager: ParticleManager;
  private callbacks: SceneCallbacks;

  // Board dimensions
  private rows: number = 7;
  private cols: number = 7;
  private theme: ThemeType = 'spring';
  private skin: BoardSkin = 'wood';

  // Mesh tracking
  private fruitMeshes: Map<string, FruitMeshItem> = new Map();
  private tileMeshes: THREE.Group[] = [];
  private obstacleMeshes: Map<string, THREE.Group> = new Map();
  private boardGroup: THREE.Group;
  private backgroundGroup: THREE.Group;
  private ambientParticles: THREE.Points | null = null;

  // Interaction
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private selectedCell: { r: number; c: number } | null = null;
  private dragStartPos: { x: number; y: number } | null = null;
  private dragStartCell: { r: number; c: number } | null = null;
  private isPointerDown: boolean = false;
  public isTeleportSwapAllowed: boolean = false;

  // Animation & Rendering loop
  private frameId: number = 0;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean = false;
  private animationSpeedMultiplier: number = 1.0;
  private quality: 'high' | 'medium' | 'low' = 'high';
  private hintCell: { r: number; c: number } | null = null;
  private hintTime: number = 0;

  // Lighting
  private dirLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);

    // Board container
    this.boardGroup = new THREE.Group();
    this.boardGroup.name = 'boardGroup';
    this.scene.add(this.boardGroup);

    this.backgroundGroup = new THREE.Group();
    this.backgroundGroup.name = 'backgroundGroup';
    this.scene.add(this.backgroundGroup);

    // Particles
    this.particleManager = new ParticleManager(this.scene);

    // Setup Lighting & Theme
    this.setupLighting();
    this.applyTheme(this.theme);

    // Bind event listeners
    this.bindEvents();

    // Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xb0c4de, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.dirLight.position.set(6, 14, 8);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 30;
      const d = 8;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.dirLight);

    // Subtle ambient fill
    const amb = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(amb);
  }

  /**
   * Applies the background environment, fog, and floating particle ambiance
   */
  public applyTheme(theme: ThemeType, skin: BoardSkin = 'wood') {
    this.theme = theme;
    this.skin = skin;

    // Clear old background decoration
    while (this.backgroundGroup.children.length > 0) {
      const obj = this.backgroundGroup.children[0];
      this.backgroundGroup.remove(obj);
    }

    let fogColor = 0xdbeafe;
    let groundColor = 0xc7d2fe;

    if (theme === 'spring') {
      fogColor = 0xe8f5e9;
      groundColor = 0xc8e6c9;
      this.createSpringBackdrop();
    } else if (theme === 'ice') {
      fogColor = 0xe0f2fe;
      groundColor = 0xbae6fd;
      this.createIceBackdrop();
    } else if (theme === 'honey') {
      fogColor = 0xfef3c7;
      groundColor = 0xfde68a;
      this.createHoneyBackdrop();
    } else if (theme === 'portal') {
      fogColor = 0xede9fe;
      groundColor = 0xddd6fe;
      this.createPortalBackdrop();
    } else if (theme === 'rainbow') {
      fogColor = 0xfae8ff;
      groundColor = 0xf5d0fe;
      this.createRainbowBackdrop();
    } else if (theme === 'starlight') {
      fogColor = 0x0f172a;
      groundColor = 0x1e293b;
      this.createStarlightBackdrop();
    } else if (theme === 'cloud') {
      fogColor = 0xf0fdf4;
      groundColor = 0xdcfce7;
      this.createCloudBackdrop();
    } else if (theme === 'sakura') {
      fogColor = 0xfdf2f8;
      groundColor = 0xfce7f3;
      this.createSakuraBackdrop();
    } else if (theme === 'night') {
      fogColor = 0x090d16;
      groundColor = 0x111827;
      this.createNightBackdrop();
    } else if (theme === 'coral') {
      fogColor = 0x042f2e;
      groundColor = 0x115e59;
      this.createCoralBackdrop();
    }

    this.scene.fog = new THREE.Fog(fogColor, 12, 38);
    this.scene.background = new THREE.Color(fogColor);

    if (this.hemiLight) {
      this.hemiLight.color.setHex(fogColor);
      this.hemiLight.groundColor.setHex(groundColor);
    }
  }

  // ================= SCENE BACKGROUND CRAFTS =================
  private createSpringBackdrop() {
    // Gentle rolling hill plane
    const groundGeo = new THREE.PlaneGeometry(60, 60, 16, 16);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.5;
    ground.receiveShadow = true;
    this.backgroundGroup.add(ground);

    // Floating dandelion seed particles
    this.setupAmbientDust(120, 0xffffff, 0.4);
  }

  private createIceBackdrop() {
    // Frosted lake plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.15,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.5;
    this.backgroundGroup.add(ground);

    // Gentle snowflakes
    this.setupAmbientDust(150, 0xe0f2fe, 0.6);
  }

  private createHoneyBackdrop() {
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xfcd34d,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.5;
    this.backgroundGroup.add(ground);

    // Golden pollen motes
    this.setupAmbientDust(140, 0xf59e0b, 0.7);
  }

  private createPortalBackdrop() {
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xc4b5fd,
      roughness: 0.6,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.5;
    this.backgroundGroup.add(ground);

    this.setupAmbientDust(130, 0xa78bfa, 0.5);
  }

  private createRainbowBackdrop() {
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.5,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.5;
    this.backgroundGroup.add(ground);

    this.setupAmbientDust(180, 0xffd1dc, 0.8);
  }

  private createStarlightBackdrop() {
    // Serene night ocean plane
    const groundGeo = new THREE.PlaneGeometry(70, 70, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.3,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -3.6;
    ground.name = 'oceanPlane';
    this.backgroundGroup.add(ground);

    this.setupAmbientDust(220, 0x38bdf8, 0.9);
  }

  private createCloudBackdrop() {
    this.setupAmbientDust(160, 0xffffff, 0.7);
  }

  private createSakuraBackdrop() {
    this.setupAmbientDust(160, 0xf472b6, 0.8);
  }

  private createNightBackdrop() {
    this.setupAmbientDust(160, 0xa3e635, 0.9);
  }

  private createCoralBackdrop() {
    this.setupAmbientDust(140, 0x2dd4bf, 0.7);
  }

  private setupAmbientDust(count: number, color: number, opacity: number) {
    if (this.ambientParticles) {
      this.backgroundGroup.remove(this.ambientParticles);
      this.ambientParticles.geometry.dispose();
      this.ambientParticles = null;
    }

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.15,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
    });

    this.ambientParticles = new THREE.Points(geo, mat);
    this.backgroundGroup.add(this.ambientParticles);
  }

  // ================= BOARD SETUP & REFRESH =================
  public syncGrid(grid: CellData[][], theme: ThemeType, skin: BoardSkin) {
    this.rows = grid.length;
    this.cols = grid[0].length;
    this.applyTheme(theme, skin);

    // 1. Rebuild Board Tiles and Obstacles
    this.clearBoardTiles();
    this.setupBoardTiles(grid, skin);

    // 2. Sync Fruits
    const currentIds = new Set<string>();

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = grid[r][c];
        if (cell.fruit && cell.tile !== 'empty' && cell.tile !== 'honey') {
          currentIds.add(cell.id);
          const targetWorldPos = this.cellToWorldPos(r, c);

          if (!this.fruitMeshes.has(cell.id)) {
            // New fruit to spawn
            const fruitGroup = createFruitGroup(cell.fruit, cell.special);
            fruitGroup.position.copy(targetWorldPos);
            this.boardGroup.add(fruitGroup);

            this.fruitMeshes.set(cell.id, {
              id: cell.id,
              r,
              c,
              targetR: r,
              targetC: c,
              group: fruitGroup,
              fruit: cell.fruit,
              special: cell.special,
              animState: 'idle',
              animProgress: 1,
              startPos: targetWorldPos.clone(),
              targetPos: targetWorldPos.clone(),
            });
          } else {
            // Existing fruit
            const item = this.fruitMeshes.get(cell.id)!;
            item.targetR = r;
            item.targetC = c;
            item.targetPos.copy(targetWorldPos);

            // If special changed
            if (item.special !== cell.special) {
              this.boardGroup.remove(item.group);
              const newFruitGroup = createFruitGroup(cell.fruit, cell.special);
              newFruitGroup.position.copy(item.group.position);
              this.boardGroup.add(newFruitGroup);
              item.group = newFruitGroup;
              item.special = cell.special;
            }
          }
        }
      }
    }

    // Remove fruits that are no longer on board
    for (const [id, item] of this.fruitMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.boardGroup.remove(item.group);
        this.fruitMeshes.delete(id);
      }
    }

    // 3. Update Camera Fit
    this.fitCameraToBoard();
  }

  private setupBoardTiles(grid: CellData[][], skin: BoardSkin) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = grid[r][c];
        if (cell.tile === 'empty') continue;

        const pos = this.cellToWorldPos(r, c);

        // 1. Base Tile
        const tileMesh = createBoardTile(skin);
        tileMesh.position.copy(pos);
        this.boardGroup.add(tileMesh);
        this.tileMeshes.push(tileMesh);

        // 2. Obstacle / Special Tile Overlay
        const key = `${r}_${c}`;
        if (cell.tile === 'ice1' || cell.tile === 'ice2') {
          const iceLevel = cell.tile === 'ice2' ? 2 : 1;
          const ice = createIceBlock(iceLevel);
          ice.position.copy(pos);
          this.boardGroup.add(ice);
          this.obstacleMeshes.set(key, ice);
        } else if (cell.tile === 'honey') {
          const honey = createHoneyJar();
          honey.position.copy(pos);
          this.boardGroup.add(honey);
          this.obstacleMeshes.set(key, honey);
        } else if (cell.tile === 'portal_in' || cell.tile === 'portal_out') {
          const portal = createPortalTile(cell.tile);
          portal.position.copy(pos);
          this.boardGroup.add(portal);
          this.obstacleMeshes.set(key, portal);
        }
      }
    }
  }

  private clearBoardTiles() {
    for (const tile of this.tileMeshes) {
      this.boardGroup.remove(tile);
    }
    this.tileMeshes = [];

    for (const [, obs] of this.obstacleMeshes) {
      this.boardGroup.remove(obs);
    }
    this.obstacleMeshes.clear();
  }

  /**
   * Converts grid (row, col) to 3D world coordinates centered on board
   */
  public cellToWorldPos(r: number, c: number): THREE.Vector3 {
    const spacing = 1.22;
    const x = (c - (this.cols - 1) / 2) * spacing;
    // Lower rows at bottom, higher rows at top
    const y = ((this.rows - 1) / 2 - r) * spacing;
    return new THREE.Vector3(x, y, 0);
  }

  /**
   * Automatically calculates camera positioning so the 3D board fills ~88-92%
   * of the viewport with zero stretching and optimal perspective tilt.
   */
  public fitCameraToBoard() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    const spacing = 1.22;
    const boardWidth = this.cols * spacing + 1.2;
    const boardHeight = this.rows * spacing + 1.2;

    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * this.camera.aspect);

    // Distance needed to fit height and width
    const distForHeight = (boardHeight / 2) / Math.tan(vFovRad / 2);
    const distForWidth = (boardWidth / 2) / Math.tan(hFovRad / 2);

    // Maximize viewport occupancy to 90% (scale by ~1.12 factor)
    const fitDistance = Math.max(distForHeight, distForWidth) * 1.1;

    // Gentle 3D perspective angle: tilted slightly from above
    const pitch = 0.22; // ~12 degrees tilt
    this.camera.position.set(
      0,
      Math.sin(pitch) * fitDistance * 0.22,
      Math.cos(pitch) * fitDistance
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  // ================= ANIMATION API =================
  /**
   * Animate swap between two cells
   */
  public animateSwap(r1: number, c1: number, r2: number, c2: number, callback?: () => void) {
    let f1: FruitMeshItem | undefined;
    let f2: FruitMeshItem | undefined;

    for (const item of this.fruitMeshes.values()) {
      if (item.r === r1 && item.c === c1) f1 = item;
      if (item.r === r2 && item.c === c2) f2 = item;
    }

    if (!f1 || !f2) {
      if (callback) callback();
      return;
    }

    const pos1 = this.cellToWorldPos(r1, c1);
    const pos2 = this.cellToWorldPos(r2, c2);

    f1.animState = 'swapping';
    f1.animProgress = 0;
    f1.startPos.copy(pos1);
    f1.targetPos.copy(pos2);
    f1.targetR = r2;
    f1.targetC = c2;

    f2.animState = 'swapping';
    f2.animProgress = 0;
    f2.startPos.copy(pos2);
    f2.targetPos.copy(pos1);
    f2.targetR = r1;
    f2.targetC = c1;

    // Timeout fallback for completion
    const dur = 240 / this.animationSpeedMultiplier;
    setTimeout(() => {
      if (f1) {
        f1.r = r2;
        f1.c = c2;
        f1.group.position.copy(pos2);
        f1.animState = 'idle';
      }
      if (f2) {
        f2.r = r1;
        f2.c = c1;
        f2.group.position.copy(pos1);
        f2.animState = 'idle';
      }
      if (callback) callback();
    }, dur);
  }

  /**
   * Animate invalid swap with a gentle spring bounce without mutating logical cell coordinates!
   */
  public animateInvalidSwap(r1: number, c1: number, r2: number, c2: number, callback?: () => void) {
    let f1: FruitMeshItem | undefined;
    let f2: FruitMeshItem | undefined;

    for (const item of this.fruitMeshes.values()) {
      if (item.r === r1 && item.c === c1) f1 = item;
      if (item.r === r2 && item.c === c2) f2 = item;
    }

    if (!f1 || !f2) {
      if (callback) callback();
      return;
    }

    const pos1 = this.cellToWorldPos(r1, c1);
    const pos2 = this.cellToWorldPos(r2, c2);
    const mid = pos1.clone().add(pos2).multiplyScalar(0.5);

    // Bump toward each other
    f1.animState = 'swapping';
    f1.animProgress = 0;
    f1.startPos.copy(pos1);
    f1.targetPos.copy(pos1.clone().lerp(mid, 0.45));

    f2.animState = 'swapping';
    f2.animProgress = 0;
    f2.startPos.copy(pos2);
    f2.targetPos.copy(pos2.clone().lerp(mid, 0.45));

    const dur = 130 / this.animationSpeedMultiplier;
    setTimeout(() => {
      // Spring back to original position
      if (f1) {
        f1.targetPos.copy(pos1);
        f1.animProgress = 0;
      }
      if (f2) {
        f2.targetPos.copy(pos2);
        f2.animProgress = 0;
      }
      setTimeout(() => {
        if (f1) {
          f1.group.position.copy(pos1);
          f1.animState = 'idle';
        }
        if (f2) {
          f2.group.position.copy(pos2);
          f2.animState = 'idle';
        }
        if (callback) callback();
      }, dur);
    }, dur);
  }

  /**
   * Resyncs all fruit mesh coordinates with grid data to ensure 100% alignment
   */
  public syncPositionsFromGrid(grid: CellData[][]) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell.fruit) {
          const item = this.fruitMeshes.get(cell.id);
          if (item) {
            item.r = r;
            item.c = c;
            item.targetR = r;
            item.targetC = c;
            const targetPos = this.cellToWorldPos(r, c);
            item.targetPos.copy(targetPos);
            item.group.position.copy(targetPos);
            item.animState = 'idle';
          }
        }
      }
    }
  }

  /**
   * Animate fruit elimination with juice bursts and particles
   */
  public animateClear(
    cleared: { r: number; c: number; fruit: FruitType }[],
    specialCreated?: { r: number; c: number; type: SpecialType },
    callback?: () => void
  ) {
    for (const { r, c, fruit } of cleared) {
      const worldPos = this.cellToWorldPos(r, c);
      this.particleManager.spawnJuiceBurst(worldPos, fruit, 16, this.animationSpeedMultiplier);

      // Find mesh and remove with shrink effect
      for (const [id, item] of this.fruitMeshes.entries()) {
        if (item.r === r && item.c === c) {
          this.boardGroup.remove(item.group);
          this.fruitMeshes.delete(id);
          break;
        }
      }
    }

    if (specialCreated && specialCreated.type === 'rainbow') {
      const pos = this.cellToWorldPos(specialCreated.r, specialCreated.c);
      this.particleManager.spawnRainbowGlitter(pos, 32);
    }

    const dur = 180 / this.animationSpeedMultiplier;
    setTimeout(() => {
      if (callback) callback();
    }, dur);
  }

  /**
   * Animate ice breaking
   */
  public triggerIceBreak(r: number, c: number, newLevel: 0 | 1) {
    const key = `${r}_${c}`;
    const pos = this.cellToWorldPos(r, c);
    this.particleManager.spawnIceBreak(pos, 16);

    const oldMesh = this.obstacleMeshes.get(key);
    if (oldMesh) {
      this.boardGroup.remove(oldMesh);
      this.obstacleMeshes.delete(key);
    }

    if (newLevel === 1) {
      const ice1 = createIceBlock(1);
      ice1.position.copy(pos);
      this.boardGroup.add(ice1);
      this.obstacleMeshes.set(key, ice1);
    }
  }

  /**
   * Animate honey breaking
   */
  public triggerHoneyBreak(r: number, c: number, destroyed: boolean) {
    const key = `${r}_${c}`;
    const pos = this.cellToWorldPos(r, c);
    this.particleManager.spawnHoneySplash(pos, 14);

    if (destroyed) {
      const oldMesh = this.obstacleMeshes.get(key);
      if (oldMesh) {
        this.boardGroup.remove(oldMesh);
        this.obstacleMeshes.delete(key);
      }
    }
  }

  /**
   * Animate fruits dropping and cascading
   */
  public animateDrops(
    drops: {
      id: string;
      fromR: number;
      fromC: number;
      toR: number;
      toC: number;
      isNew: boolean;
      fruit: FruitType;
      special: SpecialType;
    }[],
    callback?: () => void
  ) {
    for (const drop of drops) {
      const startPos = this.cellToWorldPos(drop.fromR, drop.fromC);
      const targetPos = this.cellToWorldPos(drop.toR, drop.toC);

      if (drop.isNew) {
        const group = createFruitGroup(drop.fruit, drop.special);
        group.position.copy(startPos);
        this.boardGroup.add(group);

        this.fruitMeshes.set(drop.id, {
          id: drop.id,
          r: drop.toR,
          c: drop.toC,
          targetR: drop.toR,
          targetC: drop.toC,
          group,
          fruit: drop.fruit,
          special: drop.special,
          animState: 'falling',
          animProgress: 0,
          startPos,
          targetPos,
        });
      } else {
        const item = this.fruitMeshes.get(drop.id);
        if (item) {
          item.animState = 'falling';
          item.animProgress = 0;
          item.startPos.copy(item.group.position);
          item.targetPos.copy(targetPos);
          item.targetR = drop.toR;
          item.targetC = drop.toC;
        }
      }
    }

    const dur = 280 / this.animationSpeedMultiplier;
    setTimeout(() => {
      // Settle all to target positions
      for (const drop of drops) {
        const item = this.fruitMeshes.get(drop.id);
        if (item) {
          item.r = drop.toR;
          item.c = drop.toC;
          item.group.position.copy(item.targetPos);
          item.animState = 'idle';
        }
      }
      if (callback) callback();
    }, dur);
  }

  public setHint(cell: { r: number; c: number } | null) {
    this.hintCell = cell;
    this.hintTime = 0;
  }

  public clearSelection() {
    this.selectedCell = null;
  }

  public setAnimationSpeed(speed: number) {
    this.animationSpeedMultiplier = Math.max(0.4, Math.min(2.5, speed));
  }

  public setQuality(quality: 'high' | 'medium' | 'low') {
    this.quality = quality;
    if (this.renderer) {
      if (quality === 'low') {
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
      } else if (quality === 'medium') {
        this.renderer.setPixelRatio(1.2);
        this.renderer.shadowMap.enabled = true;
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
      }
    }
  }

  // ================= INTERACTION =================
  private bindEvents() {
    const el = this.renderer.domElement;

    // Resize
    window.addEventListener('resize', () => {
      this.fitCameraToBoard();
    });

    // Mouse events
    el.addEventListener('mousedown', (e) => {
      this.handlePointerDown(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerDown && e.buttons === 0) {
        this.handlePointerUp();
        return;
      }
      this.handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.handlePointerUp();
    });

    // Touch events for mobile/tablet with scrolling prevention on the canvas
    el.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 0) {
          this.handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (this.isPointerDown && e.touches.length > 0) {
          this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      },
      { passive: false }
    );

    window.addEventListener('touchend', () => {
      this.handlePointerUp();
    });
    window.addEventListener('touchcancel', () => {
      this.handlePointerUp();
    });
  }

  private screenToCell(clientX: number, clientY: number): { r: number; c: number } | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Plane at board z = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(plane, intersectPoint);

    if (hit) {
      const spacing = 1.22;
      const rawC = intersectPoint.x / spacing + (this.cols - 1) / 2;
      const rawR = (this.rows - 1) / 2 - intersectPoint.y / spacing;

      // Allow a half-tile padding around outer board cells so edge clicks are 100% reliable
      if (rawC >= -0.55 && rawC <= this.cols - 0.45 && rawR >= -0.55 && rawR <= this.rows - 0.45) {
        const c = Math.max(0, Math.min(this.cols - 1, Math.round(rawC)));
        const r = Math.max(0, Math.min(this.rows - 1, Math.round(rawR)));
        return { r, c };
      }
    }
    return null;
  }

  private handlePointerDown(clientX: number, clientY: number) {
    this.isPointerDown = true;
    this.dragStartPos = { x: clientX, y: clientY };

    const cell = this.screenToCell(clientX, clientY);
    this.dragStartCell = cell;

    if (!cell) {
      this.selectedCell = null;
      return;
    }

    // Direct cell click intercept (e.g. Tap-to-Pop or Hammer click)
    if (this.callbacks.onCellClick) {
      const handled = this.callbacks.onCellClick(cell.r, cell.c);
      if (handled) {
        this.selectedCell = null;
        return;
      }
    }

    // If there is already a selected cell
    if (this.selectedCell) {
      // Clicking same cell unselects it
      if (this.selectedCell.r === cell.r && this.selectedCell.c === cell.c) {
        this.selectedCell = null;
        return;
      }

      const dr = Math.abs(this.selectedCell.r - cell.r);
      const dc = Math.abs(this.selectedCell.c - cell.c);
      
      // Adjacent swap OR global teleport swap privilege
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1) || this.isTeleportSwapAllowed) {
        this.callbacks.onSwapAttempt(this.selectedCell.r, this.selectedCell.c, cell.r, cell.c);
        this.selectedCell = null;
        return;
      } else {
        // Switch selection to new cell
        this.selectedCell = cell;
        if (this.callbacks.onSelectCell) {
          this.callbacks.onSelectCell(cell.r, cell.c);
        }
        return;
      }
    }

    // Otherwise, select this cell
    this.selectedCell = cell;
    if (this.callbacks.onSelectCell) {
      this.callbacks.onSelectCell(cell.r, cell.c);
    }
  }

  private handlePointerMove(clientX: number, clientY: number) {
    if (!this.isPointerDown || !this.dragStartPos || !this.dragStartCell) return;

    const dx = clientX - this.dragStartPos.x;
    const dy = clientY - this.dragStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Responsive swipe threshold: 12 pixels
    if (dist > 12) {
      const { r, c } = this.dragStartCell;
      let targetR = r;
      let targetC = c;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetC += dx > 0 ? 1 : -1;
      } else {
        targetR += dy > 0 ? 1 : -1;
      }

      if (targetR >= 0 && targetR < this.rows && targetC >= 0 && targetC < this.cols) {
        this.callbacks.onSwapAttempt(r, c, targetR, targetC);
      }

      this.isPointerDown = false;
      this.dragStartPos = null;
      this.dragStartCell = null;
      this.selectedCell = null;
    }
  }

  private handlePointerUp() {
    this.isPointerDown = false;
    this.dragStartPos = null;
    this.dragStartCell = null;
  }

  // ================= MAIN TICK LOOP =================
  private animate() {
    this.frameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Particles
    this.particleManager.update(this.animationSpeedMultiplier);

    // 2. Ambient Particles & Background drift
    if (this.ambientParticles) {
      const posAttr = this.ambientParticles.geometry.attributes.position as THREE.BufferAttribute;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) - 0.02 * this.animationSpeedMultiplier;
        if (y < -8) y = 14;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 3. Starlight ocean wave pulsation
    const ocean = this.backgroundGroup.getObjectByName('oceanPlane') as THREE.Mesh;
    if (ocean) {
      ocean.position.y = -3.6 + Math.sin(elapsedTime * 1.2) * 0.12;
    }

    // 4. Update Fruits Animations
    const swapSpeed = 5.2 * this.animationSpeedMultiplier;
    const fallSpeed = 4.8 * this.animationSpeedMultiplier;

    for (const item of this.fruitMeshes.values()) {
      const isSelected = this.selectedCell && this.selectedCell.r === item.r && this.selectedCell.c === item.c;
      const isHinted = this.hintCell && this.hintCell.r === item.r && this.hintCell.c === item.c;

      if (item.animState === 'swapping') {
        item.animProgress = Math.min(1, item.animProgress + swapSpeed * delta);
        // Smooth sine interpolation
        const t = Math.sin((item.animProgress * Math.PI) / 2);
        item.group.position.lerpVectors(item.startPos, item.targetPos, t);
        // Arch trajectory slightly forward
        item.group.position.z = Math.sin(item.animProgress * Math.PI) * 0.45;
      } else if (item.animState === 'falling') {
        item.animProgress = Math.min(1, item.animProgress + fallSpeed * delta);
        const t = item.animProgress * item.animProgress; // gravity acceleration
        item.group.position.lerpVectors(item.startPos, item.targetPos, t);
        item.group.position.z = 0;
      } else {
        // IDLE STATE: Gentle floating bobbing
        const idleBob = Math.sin(elapsedTime * 2.2 + item.r * 0.8 + item.c * 0.5) * 0.04;
        item.group.position.x = item.targetPos.x;
        item.group.position.y = item.targetPos.y + idleBob;
        item.group.position.z = isSelected ? 0.25 : 0;

        // Selected fruit glow/scale up
        let targetScale = 1.0;
        if (isSelected) {
          targetScale = 1.22 + Math.sin(elapsedTime * 8) * 0.05;
        } else if (isHinted) {
          targetScale = 1.15 + Math.sin(elapsedTime * 6) * 0.08;
        }
        item.group.scale.set(targetScale, targetScale, targetScale);

        // Slow rotation on special fruits
        const specialRing = item.group.getObjectByName('rainbowRing');
        if (specialRing) {
          specialRing.rotation.z += 0.02;
        }
      }
    }

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    this.particleManager.clearAll();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
