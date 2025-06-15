
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
  schema?: any[];
  sampleData?: any[];
}

const TronGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const raycasterRef = useRef<THREE.Raycaster>();
  const mouseRef = useRef<THREE.Vector2>();
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeData, setNodeData] = useState<TableData | null>(null);
  const [tablesData, setTablesData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real table data from Supabase
  const fetchTableData = async () => {
    try {
      setLoading(true);
      
      // Define table names as constants to ensure type safety
      const tableQueries = [
        { name: 'users', query: supabase.from('users').select('*', { count: 'exact', head: false }).limit(5) },
        { name: 'posts', query: supabase.from('posts').select('*', { count: 'exact', head: false }).limit(5) },
        { name: 'comments', query: supabase.from('comments').select('*', { count: 'exact', head: false }).limit(5) },
        { name: 'products', query: supabase.from('products').select('*', { count: 'exact', head: false }).limit(5) },
        { name: 'orders', query: supabase.from('orders').select('*', { count: 'exact', head: false }).limit(5) },
        { name: 'analytics', query: supabase.from('analytics').select('*', { count: 'exact', head: false }).limit(5) }
      ];

      const tableDataPromises = tableQueries.map(async ({ name, query }) => {
        const { data, error, count } = await query;

        if (error) {
          console.error(`Error fetching ${name}:`, error);
          return null;
        }

        return {
          tableName: name,
          recordCount: count || 0,
          lastUpdated: new Date().toISOString().split('T')[0],
          sampleData: data || []
        };
      });

      const results = await Promise.all(tableDataPromises);
      const validResults = results.filter(Boolean) as TableData[];
      setTablesData(validResults);
      
      toast({
        title: "Database Connected",
        description: `Successfully loaded ${validResults.length} tables from Supabase`,
      });
    } catch (error) {
      console.error('Error fetching database data:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  useEffect(() => {
    if (!mountRef.current || tablesData.length === 0) return;

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

      scene.add(gridGroup);
    };

    // Create Tron-style cubes/data nodes using real table data
    const createDataNodes = () => {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      
      tablesData.forEach((tableData, i) => {
        // Create different colors based on table type
        let color, emissive;
        if (tableData.tableName.includes('user')) {
          color = 0x00ffff; // Cyan for user data
          emissive = 0x004444;
        } else if (tableData.tableName.includes('analytics')) {
          color = 0xff6600; // Orange for analytics
          emissive = 0x442200;
        } else if (tableData.tableName.includes('order') || tableData.tableName.includes('product')) {
          color = 0x00ff66; // Green for commerce
          emissive = 0x004422;
        } else {
          color = 0xff0066; // Pink for content
          emissive = 0x440022;
        }

        const material = new THREE.MeshPhongMaterial({
          color,
          emissive,
          transparent: true,
          opacity: 0.8
        });

        const cube = new THREE.Mesh(geometry, material);
        
        // Position based on record count and table index
        const angle = (i / tablesData.length) * Math.PI * 2;
        const radius = 20 + (tableData.recordCount / 100) * 10;
        
        cube.position.x = Math.cos(angle) * radius;
        cube.position.y = 2 + (tableData.recordCount / 50);
        cube.position.z = Math.sin(angle) * radius;
        
        // Add table data and animation data
        cube.userData = {
          rotationSpeed: 0.005 + (tableData.recordCount / 10000),
          floatSpeed: 0.001 + (tableData.recordCount / 50000),
          originalY: cube.position.y,
          tableData: tableData
        };

        scene.add(cube);
      });
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
    let cameraAngleY = 0;
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
        cameraAngleY -= deltaX * 0.005;
        lastMouseX = event.clientX;
        
        // Update camera position based on angle
        const radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        camera.position.x = Math.sin(cameraAngleY) * radius;
        camera.position.z = Math.cos(cameraAngleY) * radius;
        camera.lookAt(0, 0, 0);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      const newRadius = Math.max(10, Math.min(100, currentRadius + event.deltaY * 0.1));
      
      camera.position.x = Math.sin(cameraAngleY) * newRadius;
      camera.position.z = Math.cos(cameraAngleY) * newRadius;
      camera.lookAt(0, 0, 0);
    };

    const handleClick = (event: MouseEvent) => {
      if (isMouseDown) return;
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children.filter(child => child instanceof THREE.Mesh && child.userData.tableData));

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const tableData = clickedObject.userData.tableData;
        
        setSelectedNode(tableData.tableName);
        setNodeData(tableData);
        
        // Visual feedback
        scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData.tableData) {
            if (child === clickedObject) {
              (child.material as THREE.MeshPhongMaterial).emissive.setHex(0x006666);
            } else {
              // Reset to original emissive color based on table type
              const originalEmissive = child.userData.tableData.tableName.includes('user') ? 0x004444 :
                                     child.userData.tableData.tableName.includes('analytics') ? 0x442200 :
                                     child.userData.tableData.tableName.includes('order') || child.userData.tableData.tableName.includes('product') ? 0x004422 :
                                     0x440022;
              (child.material as THREE.MeshPhongMaterial).emissive.setHex(originalEmissive);
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

      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed;
          child.rotation.y += child.userData.rotationSpeed * 0.5;
          child.rotation.z += child.userData.rotationSpeed * 0.3;
          
          child.position.y = child.userData.originalY + 
            Math.sin(Date.now() * child.userData.floatSpeed) * 0.5;
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
  }, [tablesData]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-lg">
          INITIALIZING TRON DATABASE INTERFACE...
        </div>
      </div>
    );
  }

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
            <div className="text-cyan-300">TABLES: {tablesData.length} LOADED</div>
            <div className="text-cyan-300">NODE: {selectedNode || 'SCANNING...'}</div>
            <div className="text-cyan-300">TOTAL RECORDS: {tablesData.reduce((sum, table) => sum + table.recordCount, 0)}</div>
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
          <div className="bg-black/50 border border-cyan-400 p-4 backdrop-blur-sm min-w-64 max-w-96">
            <div className="text-cyan-400 text-lg mb-2">DATABASE EXPLORER</div>
            {nodeData ? (
              <div className="space-y-2">
                <div className="text-yellow-400 text-base font-bold">{nodeData.tableName.toUpperCase()}</div>
                <div className="text-cyan-300">Records: {nodeData.recordCount.toLocaleString()}</div>
                <div className="text-cyan-300">Updated: {nodeData.lastUpdated}</div>
                
                {nodeData.sampleData && nodeData.sampleData.length > 0 && (
                  <div className="mt-3">
                    <div className="text-green-400 text-xs mb-2">SAMPLE DATA:</div>
                    <div className="max-h-32 overflow-y-auto text-xs">
                      {nodeData.sampleData.slice(0, 3).map((record, index) => (
                        <div key={index} className="mb-2 p-2 bg-black/30 border border-gray-600">
                          {Object.entries(record).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="text-gray-300">
                              <span className="text-cyan-400">{key}:</span> {String(value).substring(0, 30)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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
