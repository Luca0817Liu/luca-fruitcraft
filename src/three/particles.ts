import * as THREE from 'three';
import { FruitType } from '../types/game';

interface Particle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  scaleInit: number;
}

const FRUIT_COLORS: Record<FruitType, number[]> = {
  strawberry: [0xff2e55, 0xff6b81, 0x48bb78],
  orange: [0xff8c1a, 0xffa94d, 0x38a169],
  grapes: [0x8b5cf6, 0xa78bfa, 0xc4b5fd],
  watermelon: [0xef4444, 0x22c55e, 0x15803d],
  banana: [0xfacc15, 0xfde047, 0xca8a04],
  peach: [0xfb7185, 0xfda4af, 0xffedd5],
  apple: [0x84cc16, 0xa3e635, 0x65a30d],
  mango: [0xf59e0b, 0xfbbf24, 0xf97316],
};

export class ParticleManager {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private pool: THREE.Mesh[] = [];
  private sharedGeo: THREE.DodecahedronGeometry;
  private ringGeo: THREE.RingGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.sharedGeo = new THREE.DodecahedronGeometry(0.12, 0);
    this.ringGeo = new THREE.RingGeometry(0.2, 0.45, 24);
    this.ringGeo.rotateX(-Math.PI / 2);
  }

  private getPooledMesh(color: number, opacity: number = 0.9): THREE.Mesh {
    let mesh = this.pool.pop();
    if (!mesh) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity,
      });
      mesh = new THREE.Mesh(this.sharedGeo, mat);
    } else {
      (mesh.material as THREE.MeshStandardMaterial).color.setHex(color);
      (mesh.material as THREE.MeshStandardMaterial).opacity = opacity;
      mesh.scale.set(1, 1, 1);
      mesh.visible = true;
    }
    this.scene.add(mesh);
    return mesh;
  }

  private recycleMesh(mesh: THREE.Mesh) {
    mesh.visible = false;
    this.scene.remove(mesh);
    this.pool.push(mesh);
  }

  /**
   * Explodes juice particles when a fruit is cleared
   */
  public spawnJuiceBurst(
    pos: THREE.Vector3,
    fruitType: FruitType,
    count: number = 16,
    speedMultiplier: number = 1.0
  ) {
    const colors = FRUIT_COLORS[fruitType] || [0xffffff];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mesh = this.getPooledMesh(color, 0.95);
      mesh.position.copy(pos);

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (0.06 + Math.random() * 0.12) * speedMultiplier;

      const p: Particle = {
        mesh,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: (Math.cos(phi) * 0.6 + 0.6) * speed, // slight upward bounce
        vz: Math.sin(phi) * Math.sin(theta) * speed,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: 28 + Math.random() * 16,
        scaleInit: 0.8 + Math.random() * 0.6,
      };

      this.particles.push(p);
    }
  }

  /**
   * Ice shards explosion
   */
  public spawnIceBreak(pos: THREE.Vector3, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const mesh = this.getPooledMesh(0xa5f3fc, 0.85);
      mesh.position.copy(pos);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.12;

      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 0.06 + Math.random() * 0.1,
        vz: Math.sin(angle) * speed,
        rotSpeed: 0.15,
        life: 0,
        maxLife: 26,
        scaleInit: 0.9,
      });
    }
  }

  /**
   * Honey splash droplets
   */
  public spawnHoneySplash(pos: THREE.Vector3, count: number = 12) {
    for (let i = 0; i < count; i++) {
      const mesh = this.getPooledMesh(0xf59e0b, 0.9);
      mesh.position.copy(pos);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.08;

      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 0.08 + Math.random() * 0.06,
        vz: Math.sin(angle) * speed,
        rotSpeed: 0.05,
        life: 0,
        maxLife: 32,
        scaleInit: 0.7,
      });
    }
  }

  /**
   * Rainbow starry glitter burst
   */
  public spawnRainbowGlitter(pos: THREE.Vector3, count: number = 32) {
    const rainbowColors = [0xff007f, 0xff7f00, 0xffff00, 0x00ff7f, 0x007fff, 0x7f00ff];
    for (let i = 0; i < count; i++) {
      const color = rainbowColors[i % rainbowColors.length];
      const mesh = this.getPooledMesh(color, 1.0);
      mesh.position.copy(pos);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.12 + Math.random() * 0.16;

      this.particles.push({
        mesh,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.cos(phi) * speed + 0.08,
        vz: Math.sin(phi) * Math.sin(theta) * speed,
        rotSpeed: 0.25,
        life: 0,
        maxLife: 45,
        scaleInit: 1.1,
      });
    }
  }

  /**
   * Update all live particles each frame
   */
  public update(dtSpeed: number = 1.0) {
    const gravity = -0.005 * dtSpeed;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dtSpeed;

      p.mesh.position.x += p.vx * dtSpeed;
      p.mesh.position.y += p.vy * dtSpeed;
      p.mesh.position.z += p.vz * dtSpeed;
      p.vy += gravity;

      p.mesh.rotation.x += p.rotSpeed * dtSpeed;
      p.mesh.rotation.y += p.rotSpeed * dtSpeed;

      // Scale fade
      const progress = p.life / p.maxLife;
      const currentScale = Math.max(0.001, (1 - progress) * p.scaleInit);
      p.mesh.scale.set(currentScale, currentScale, currentScale);

      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 1 - progress);

      if (p.life >= p.maxLife) {
        this.recycleMesh(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  public clearAll() {
    for (const p of this.particles) {
      this.recycleMesh(p.mesh);
    }
    this.particles = [];
  }
}
