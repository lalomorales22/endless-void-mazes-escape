
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TronGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Create Tron-style grid floor
    const createGrid = () => {
      const gridGroup = new THREE.Group();
      
      // Main grid lines
      const gridSize = 100;
      const gridDivisions = 20;
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0x003366);
      gridHelper.position.y = 0;
      gridGroup.add(gridHelper);

      // Add glowing effect to grid
      const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.6 
      });
      
      scene.add(gridGroup);
    };

    // Create Tron-style cubes/data nodes
    const createDataNodes = () => {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      
      for (let i = 0; i < 15; i++) {
        // Create glowing material for each cube
        const material = new THREE.MeshPhongMaterial({
          color: Math.random() > 0.5 ? 0x00ffff : 0xff0066,
          emissive: Math.random() > 0.5 ? 0x004444 : 0x440022,
          transparent: true,
          opacity: 0.8
        });

        const cube = new THREE.Mesh(geometry, material);
        
        // Random positioning
        cube.position.x = (Math.random() - 0.5) * 80;
        cube.position.y = 1 + Math.random() * 8;
        cube.position.z = (Math.random() - 0.5) * 80;
        
        // Add rotation animation data
        cube.userData = {
          rotationSpeed: 0.01 + Math.random() * 0.02,
          floatSpeed: 0.02 + Math.random() * 0.03,
          originalY: cube.position.y
        };

        scene.add(cube);
      }
    };

    // Lighting setup
    const setupLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x001122, 0.3);
      scene.add(ambientLight);

      // Main directional light
      const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Accent lights
      const light1 = new THREE.PointLight(0xff0066, 0.5, 50);
      light1.position.set(-20, 10, -20);
      scene.add(light1);

      const light2 = new THREE.PointLight(0x00ffff, 0.5, 50);
      light2.position.set(20, 10, 20);
      scene.add(light2);
    };

    // Camera controls
    let mouseX = 0;
    let mouseY = 0;
    const mouseSensitivity = 0.0005;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * mouseSensitivity;
      mouseY = (event.clientY - window.innerHeight / 2) * mouseSensitivity;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 2;
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          camera.position.z -= speed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          camera.position.z += speed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          camera.position.x -= speed;
          break;
        case 'KeyD':
        case 'ArrowRight':
          camera.position.x += speed;
          break;
        case 'Space':
          event.preventDefault();
          camera.position.y += speed;
          break;
        case 'ShiftLeft':
          camera.position.y -= speed;
          break;
      }
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Update camera rotation based on mouse
      camera.rotation.y += mouseX;
      camera.rotation.x += mouseY;
      
      // Damping
      mouseX *= 0.95;
      mouseY *= 0.95;

      // Animate data nodes
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed;
          child.rotation.y += child.userData.rotationSpeed * 0.5;
          child.rotation.z += child.userData.rotationSpeed * 0.3;
          
          // Floating animation
          child.position.y = child.userData.originalY + 
            Math.sin(Date.now() * child.userData.floatSpeed) * 2;
        }
      });

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Initialize scene
    createGrid();
    createDataNodes();
    setupLighting();
    animate();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mountRef} className="w-full h-screen" />
      
      {/* Tron-style UI overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm pointer-events-auto">
          <div className="bg-black/50 border border-cyan-400 p-4 backdrop-blur-sm">
            <div className="text-cyan-400 text-lg mb-2">TRON DATABASE INTERFACE</div>
            <div className="text-cyan-300">STATUS: CONNECTED</div>
            <div className="text-cyan-300">NODES: SCANNING...</div>
            <div className="text-cyan-300">USER: GUEST</div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-xs pointer-events-auto">
          <div className="bg-black/50 border border-cyan-400 p-3 backdrop-blur-sm">
            <div>WASD/ARROWS: NAVIGATE</div>
            <div>SPACE: UP | SHIFT: DOWN</div>
            <div>MOUSE: LOOK AROUND</div>
            <div className="mt-2 text-yellow-400">CLICK NODES TO ACCESS DATA</div>
          </div>
        </div>

        {/* Right panel placeholder */}
        <div className="absolute top-4 right-4 text-cyan-400 font-mono text-sm pointer-events-auto">
          <div className="bg-black/50 border border-cyan-400 p-4 backdrop-blur-sm">
            <div className="text-cyan-400 text-lg mb-2">DATABASE EXPLORER</div>
            <div className="text-gray-400">Connect to view tables...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TronGame;
