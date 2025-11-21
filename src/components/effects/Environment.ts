import * as THREE from 'three';

export class DynamicSkybox {
  private group: THREE.Group;
  private stars: THREE.Points;
  private nebulaClouds: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.createStarField();
    this.createNebulaClouds();
  }

  private createStarField() {
    const starCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Create stars in a sphere around the scene
      const radius = 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Color variation (white to light blue)
      const colorValue = 0.8 + Math.random() * 0.2;
      colors[i3] = colorValue;
      colors[i3 + 1] = colorValue;
      colors[i3 + 2] = Math.min(1, colorValue + Math.random() * 0.2);

      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geometry, material);
    this.group.add(this.stars);
  }

  private createNebulaClouds() {
    const cloudCount = 8;
    for (let i = 0; i < cloudCount; i++) {
      const geometry = new THREE.SphereGeometry(50, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: this.getNebulaColor(i),
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });

      const cloud = new THREE.Mesh(geometry, material);

      // Position clouds randomly in the sky
      const angle = (i / cloudCount) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      cloud.position.x = Math.cos(angle) * radius;
      cloud.position.y = 50 + Math.random() * 50;
      cloud.position.z = Math.sin(angle) * radius;

      cloud.scale.set(
        1 + Math.random() * 2,
        0.5 + Math.random() * 0.5,
        1 + Math.random() * 2
      );

      this.nebulaClouds.push(cloud);
      this.group.add(cloud);
    }
  }

  private getNebulaColor(index: number): number {
    const colors = [
      0x0066ff, // Blue
      0xff0066, // Pink
      0x00ff66, // Green
      0xff6600, // Orange
      0x6600ff, // Purple
      0xffff00, // Yellow
      0x00ffff, // Cyan
      0xff00ff, // Magenta
    ];
    return colors[index % colors.length];
  }

  public update(time: number) {
    // Slowly rotate the star field
    this.stars.rotation.y = time * 0.01;

    // Animate nebula clouds
    this.nebulaClouds.forEach((cloud, index) => {
      cloud.rotation.y = time * 0.05 + index;
      cloud.rotation.z = time * 0.03 + index * 0.5;

      // Pulse opacity
      const material = cloud.material as THREE.MeshBasicMaterial;
      material.opacity = 0.03 + Math.sin(time + index) * 0.02;
    });
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}

export class LightBeams {
  private group: THREE.Group;
  private beams: THREE.Mesh[] = [];

  constructor(buildingPositions: THREE.Vector3[]) {
    this.group = new THREE.Group();
    this.createBeams(buildingPositions);
  }

  private createBeams(positions: THREE.Vector3[]) {
    positions.forEach((position, index) => {
      const height = 80 + Math.random() * 40;
      const geometry = new THREE.CylinderGeometry(0.5, 3, height, 8, 1, true);
      const material = new THREE.MeshBasicMaterial({
        color: this.getBeamColor(index),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const beam = new THREE.Mesh(geometry, material);
      beam.position.set(position.x, height / 2, position.z);

      this.beams.push(beam);
      this.group.add(beam);
    });
  }

  private getBeamColor(index: number): number {
    const colors = [0x00ffff, 0xff0066, 0x66ff00, 0xffff00, 0xff6600, 0x6600ff];
    return colors[index % colors.length];
  }

  public update(time: number) {
    this.beams.forEach((beam, index) => {
      const material = beam.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.abs(Math.sin(time * 0.5 + index)) * 0.15;
      beam.rotation.y = time * 0.2 + index;
    });
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}
