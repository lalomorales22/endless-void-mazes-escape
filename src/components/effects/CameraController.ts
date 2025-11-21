import * as THREE from 'three';

export interface CameraPreset {
  name: string;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private isAnimating: boolean = false;
  private animationProgress: number = 0;
  private animationDuration: number = 2000;
  private startPosition: THREE.Vector3;
  private startLookAt: THREE.Vector3;
  private currentLookAt: THREE.Vector3;

  public presets: CameraPreset[] = [
    {
      name: 'Overview',
      position: new THREE.Vector3(0, 80, 120),
      lookAt: new THREE.Vector3(0, 20, 0)
    },
    {
      name: 'Bird\'s Eye',
      position: new THREE.Vector3(0, 150, 0),
      lookAt: new THREE.Vector3(0, 0, 0)
    },
    {
      name: 'Cinematic',
      position: new THREE.Vector3(100, 60, 100),
      lookAt: new THREE.Vector3(0, 20, 0)
    },
    {
      name: 'Low Angle',
      position: new THREE.Vector3(80, 20, 80),
      lookAt: new THREE.Vector3(0, 40, 0)
    }
  ];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.targetPosition = camera.position.clone();
    this.targetLookAt = new THREE.Vector3(0, 20, 0);
    this.startPosition = camera.position.clone();
    this.startLookAt = this.targetLookAt.clone();
    this.currentLookAt = this.targetLookAt.clone();
  }

  public animateToPosition(position: THREE.Vector3, lookAt: THREE.Vector3, duration: number = 2000) {
    this.startPosition = this.camera.position.clone();
    this.startLookAt = this.currentLookAt.clone();
    this.targetPosition = position.clone();
    this.targetLookAt = lookAt.clone();
    this.animationDuration = duration;
    this.animationProgress = 0;
    this.isAnimating = true;
  }

  public animateToPreset(presetName: string, duration: number = 2000) {
    const preset = this.presets.find(p => p.name === presetName);
    if (preset) {
      this.animateToPosition(preset.position, preset.lookAt, duration);
    }
  }

  public animateToTarget(target: THREE.Vector3, offset: THREE.Vector3 = new THREE.Vector3(30, 20, 30), duration: number = 2000) {
    const position = new THREE.Vector3(
      target.x + offset.x,
      target.y + offset.y,
      target.z + offset.z
    );
    this.animateToPosition(position, target, duration);
  }

  public update(deltaTime: number) {
    if (!this.isAnimating) return;

    this.animationProgress += deltaTime;
    const progress = Math.min(this.animationProgress / this.animationDuration, 1);

    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate position
    this.camera.position.lerpVectors(this.startPosition, this.targetPosition, easeProgress);

    // Interpolate look-at
    this.currentLookAt.lerpVectors(this.startLookAt, this.targetLookAt, easeProgress);
    this.camera.lookAt(this.currentLookAt);

    if (progress >= 1) {
      this.isAnimating = false;
    }
  }

  public shake(intensity: number = 0.5, duration: number = 300) {
    const originalPosition = this.camera.position.clone();
    const startTime = Date.now();

    const shakeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        this.camera.position.copy(originalPosition);
        clearInterval(shakeInterval);
        return;
      }

      const currentIntensity = intensity * (1 - progress);
      this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * currentIntensity;
      this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * currentIntensity;
      this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * currentIntensity;
    }, 16); // ~60fps
  }

  public isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  public getCurrentLookAt(): THREE.Vector3 {
    return this.currentLookAt.clone();
  }
}
