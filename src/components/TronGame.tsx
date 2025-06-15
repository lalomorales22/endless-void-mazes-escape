import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TronGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const raycasterRef = useRef<THREE.Raycaster>();
  const mouseRef = useRef<THREE.Vector2>();
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeData, setNodeData] = useState<any>(null);

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

    // Raycaster for mouse interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

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

    // Mock database tables data
    const tableNames = ['users', 'posts', 'comments', 'orders', 'products', 'categories', 'sessions', 'logs', 'profiles', 'messages', 'files', 'settings', 'tokens', 'analytics', 'notifications'];

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
        
        // Add table data and animation data
        cube.userData = {
          rotationSpeed: 0.005 + Math.random() * 0.01, // Reduced rotation speed
          floatSpeed: 0.001 + Math.random() * 0.002, // Reduced float speed
          originalY: cube.position.y,
          tableName: tableNames[i] || `table_${i}`,
          recordCount: Math.floor(Math.random() * 10000) + 100,
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

    // Simplified camera controls
    let cameraAngleY = 0; // Only track Y rotation (left/right)
    let isMouseDown = false;
    let lastMouseX = 0;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      lastMouseX = event.clientX;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        cameraAngleY -= deltaX * 0.01; // Only rotate left/right
        lastMouseX = event.clientX;
        
        // Update camera position based on angle
        const radius = 40;
        camera.position.x = Math.sin(cameraAngleY) * radius;
        camera.position.z = Math.cos(cameraAngleY) * radius;
        camera.lookAt(0, 0, 0);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 2;
      const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      const newRadius = Math.max(10, Math.min(100, currentRadius + event.deltaY * 0.1));
      
      // Maintain the Y rotation angle while zooming
      camera.position.x = Math.sin(cameraAngleY) * newRadius;
      camera.position.z = Math.cos(cameraAngleY) * newRadius;
      camera.lookAt(0, 0, 0);
    };

    const handleClick = (event: MouseEvent) => {
      // Don't process clicks if we were dragging
      if (isMouseDown) return;
      
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children.filter(child => child instanceof THREE.Mesh && child.userData.tableName));

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const tableData = clickedObject.userData;
        
        setSelectedNode(tableData.tableName);
        setNodeData(tableData);
        
        // Visual feedback - make the clicked cube glow brighter
        scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData.tableName) {
            if (child === clickedObject) {
              (child.material as THREE.MeshPhongMaterial).emissive.setHex(0x006666);
            } else {
              const originalColor = Math.random() > 0.5 ? 0x004444 : 0x440022;
              (child.material as THREE.MeshPhongMaterial).emissive.setHex(originalColor);
            }
          }
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 2;
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          camera.position.y += speed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          camera.position.y -= speed;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          cameraAngleY += 0.1;
          break;
        case 'KeyD':
        case 'ArrowRight':
          cameraAngleY -= 0.1;
          break;
      }
      
      // Update camera position for keyboard rotation
      if (event.code === 'KeyA' || event.code === 'ArrowLeft' || event.code === 'KeyD' || event.code === 'ArrowRight') {
        const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        camera.position.x = Math.sin(cameraAngleY) * currentRadius;
        camera.position.z = Math.cos(cameraAngleY) * currentRadius;
        camera.lookAt(0, 0, 0);
      }
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Animate data nodes with reduced movement
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed;
          child.rotation.y += child.userData.rotationSpeed * 0.5;
          child.rotation.z += child.userData.rotationSpeed * 0.3;
          
          // Reduced floating animation
          child.position.y = child.userData.originalY + 
            Math.sin(Date.now() * child.userData.floatSpeed) * 0.5; // Reduced from 2 to 0.5
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
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
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
            <div className="text-cyan-300">NODES: {selectedNode ? 'SELECTED' : 'SCANNING...'}</div>
            <div className="text-cyan-300">USER: GUEST</div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-xs pointer-events-auto">
          <div className="bg-black/50 border border-cyan-400 p-3 backdrop-blur-sm">
            <div>WASD/ARROWS: NAVIGATE</div>
            <div>MOUSE DRAG: ROTATE LEFT/RIGHT</div>
            <div>SCROLL: ZOOM IN/OUT</div>
            <div className="mt-2 text-yellow-400">CLICK NODES TO ACCESS DATA</div>
          </div>
        </div>

        {/* Right panel - Database Explorer */}
        <div className="absolute top-4 right-4 text-cyan-400 font-mono text-sm pointer-events-auto">
          <div className="bg-black/50 border border-cyan-400 p-4 backdrop-blur-sm min-w-64">
            <div className="text-cyan-400 text-lg mb-2">DATABASE EXPLORER</div>
            {nodeData ? (
              <div className="space-y-2">
                <div className="text-yellow-400 text-base font-bold">{nodeData.tableName.toUpperCase()}</div>
                <div className="text-cyan-300">Records: {nodeData.recordCount.toLocaleString()}</div>
                <div className="text-cyan-300">Updated: {nodeData.lastUpdated}</div>
                <div className="text-green-400 mt-3 text-xs">
                  TABLE ACCESSED
                </div>
                <button 
                  onClick={() => {
                    setSelectedNode(null);
                    setNodeData(null);
                  }}
                  className="mt-3 px-3 py-1 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors text-xs"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <div className="text-gray-400">Click a data node to explore...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TronGame;
