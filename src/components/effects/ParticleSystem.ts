import * as THREE from 'three';

export class ParticleSystem {
  private particles: THREE.Points;
  private particleCount: number;
  private velocities: Float32Array;
  private group: THREE.Group;

  constructor(count: number = 2000, color: number = 0x00ffff) {
    this.particleCount = count;
    this.group = new THREE.Group();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random positions in a large cube
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      // Random velocities
      this.velocities[i3] = (Math.random() - 0.5) * 0.2;
      this.velocities[i3 + 1] = Math.random() * 0.3 + 0.1;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;

      // Color variation
      const c = new THREE.Color(color);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      hsl.h += (Math.random() - 0.5) * 0.1;
      hsl.l = 0.5 + Math.random() * 0.3;
      c.setHSL(hsl.h, hsl.s, hsl.l);

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      // Random sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      map: this.createParticleTexture(),
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  private createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  public update() {
    const positions = this.particles.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Update positions based on velocities
      positions[i3] += this.velocities[i3];
      positions[i3 + 1] += this.velocities[i3 + 1];
      positions[i3 + 2] += this.velocities[i3 + 2];

      // Reset particles that go too high or far
      if (positions[i3 + 1] > 100) {
        positions[i3 + 1] = 0;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 200;
      }

      // Wrap around boundaries
      if (Math.abs(positions[i3]) > 100) {
        positions[i3] = -positions[i3];
      }
      if (Math.abs(positions[i3 + 2]) > 100) {
        positions[i3 + 2] = -positions[i3 + 2];
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}

export class DataStreamEffect {
  private streams: THREE.Line[] = [];
  private group: THREE.Group;

  constructor(buildingPositions: THREE.Vector3[]) {
    this.group = new THREE.Group();
    this.createDataStreams(buildingPositions);
  }

  private createDataStreams(positions: THREE.Vector3[]) {
    // Create streams between buildings
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (Math.random() > 0.7) { // Only create some connections
          this.createStream(positions[i], positions[j]);
        }
      }
    }
  }

  private createStream(start: THREE.Vector3, end: THREE.Vector3) {
    const points: THREE.Vector3[] = [];
    const segments = 20;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = start.x + (end.x - start.x) * t;
      const z = start.z + (end.z - start.z) * t;
      const y = start.y + Math.sin(t * Math.PI) * 20; // Arc effect

      points.push(new THREE.Vector3(x, y, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const line = new THREE.Line(geometry, material);
    this.streams.push(line);
    this.group.add(line);
  }

  public update(time: number) {
    this.streams.forEach((stream, index) => {
      const material = stream.material as THREE.LineBasicMaterial;
      material.opacity = 0.1 + Math.abs(Math.sin(time + index * 0.5)) * 0.3;
    });
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}
