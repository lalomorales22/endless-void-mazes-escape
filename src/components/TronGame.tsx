
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatabaseBuilding } from './buildings/DatabaseBuilding';
import { DatabaseControls } from './ui/DatabaseControls';
import { RecordEditDialog } from './ui/RecordEditDialog';
import { TableCreateDialog } from './ui/TableCreateDialog';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
  schema?: any[];
  sampleData?: any[];
}

interface SelectedRecord {
  tableId: string;
  recordId: string;
  data: any;
}

const TronGame: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const buildingsRef = useRef<DatabaseBuilding[]>([]);
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [tablesData, setTablesData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real table data from Supabase
  const fetchTableData = async () => {
    try {
      setLoading(true);
      
      const tableQueries = [
        { name: 'users', query: supabase.from('users' as any).select('*', { count: 'exact', head: false }).limit(50) },
        { name: 'posts', query: supabase.from('posts' as any).select('*', { count: 'exact', head: false }).limit(50) },
        { name: 'comments', query: supabase.from('comments' as any).select('*', { count: 'exact', head: false }).limit(50) },
        { name: 'products', query: supabase.from('products' as any).select('*', { count: 'exact', head: false }).limit(50) },
        { name: 'orders', query: supabase.from('orders' as any).select('*', { count: 'exact', head: false }).limit(50) },
        { name: 'analytics', query: supabase.from('analytics' as any).select('*', { count: 'exact', head: false }).limit(50) }
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

  const handleRecordClick = (tableId: string, recordId: string, data: any) => {
    setSelectedRecord({ tableId, recordId, data });
  };

  const handleRecordUpdate = async (tableId: string, recordId: string, updatedData: any) => {
    try {
      const { error } = await supabase
        .from(tableId as any)
        .update(updatedData)
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Record Updated",
        description: "Database record has been successfully updated",
      });

      // Refresh data
      fetchTableData();
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update database record",
        variant: "destructive"
      });
    }
  };

  const handleRecordDelete = async (tableId: string, recordId: string) => {
    try {
      const { error } = await supabase
        .from(tableId as any)
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Record Deleted",
        description: "Database record has been successfully deleted",
      });

      // Refresh data
      fetchTableData();
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete database record",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  useEffect(() => {
    if (!mountRef.current || tablesData.length === 0) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    scene.fog = new THREE.Fog(0x000011, 50, 500);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000011);
    rendererRef.current = renderer;
    
    // Only append if not already appended
    if (mountRef.current && !mountRef.current.contains(renderer.domElement)) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create Tron-style grid floor
    const createGrid = () => {
      const gridGroup = new THREE.Group();
      
      // Main grid
      const gridSize = 200;
      const gridDivisions = 40;
      const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0x003366);
      gridHelper.position.y = 0;
      gridGroup.add(gridHelper);

      // Add grid lines that extend upward
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x003366, transparent: true, opacity: 0.3 });
      for (let i = -gridDivisions/2; i <= gridDivisions/2; i += 5) {
        const points = [
          new THREE.Vector3(i * (gridSize/gridDivisions), 0, -gridSize/2),
          new THREE.Vector3(i * (gridSize/gridDivisions), 100, -gridSize/2)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        gridGroup.add(line);
      }

      scene.add(gridGroup);
    };

    // Create buildings for each table
    const createBuildings = () => {
      buildingsRef.current = [];
      
      tablesData.forEach((tableData, index) => {
        const building = new DatabaseBuilding(
          tableData,
          index,
          tablesData.length,
          handleRecordClick
        );
        
        scene.add(building.getGroup());
        buildingsRef.current.push(building);
      });
    };

    // Lighting setup
    const setupLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x001122, 0.4);
      scene.add(ambientLight);

      // Main directional light
      const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
      directionalLight.position.set(50, 100, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.left = -100;
      directionalLight.shadow.camera.right = 100;
      directionalLight.shadow.camera.top = 100;
      directionalLight.shadow.camera.bottom = -100;
      scene.add(directionalLight);

      // Accent lights
      const light1 = new THREE.PointLight(0xff0066, 0.8, 100);
      light1.position.set(-50, 30, -50);
      scene.add(light1);

      const light2 = new THREE.PointLight(0x00ff66, 0.8, 100);
      light2.position.set(50, 30, 50);
      scene.add(light2);

      const light3 = new THREE.PointLight(0xffff00, 0.6, 80);
      light3.position.set(0, 60, 0);
      scene.add(light3);
    };

    // Mouse and camera controls
    let cameraAngleY = 0;
    let cameraAngleX = 0;
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let cameraRadius = 100;

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        cameraAngleY -= deltaX * 0.005;
        cameraAngleX = Math.max(-Math.PI/3, Math.min(Math.PI/3, cameraAngleX - deltaY * 0.005));
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        // Update camera position
        camera.position.x = Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
        camera.position.y = Math.sin(cameraAngleX) * cameraRadius + 30;
        camera.position.z = Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
        camera.lookAt(0, 20, 0);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraRadius = Math.max(30, Math.min(200, cameraRadius + event.deltaY * 0.2));
      
      camera.position.x = Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
      camera.position.y = Math.sin(cameraAngleX) * cameraRadius + 30;
      camera.position.z = Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
      camera.lookAt(0, 20, 0);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 5;
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          camera.position.y += speed;
          break;
        case 'KeyS':
        case 'ArrowDown':
          camera.position.y = Math.max(5, camera.position.y - speed);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          cameraAngleY += 0.1;
          break;
        case 'KeyD':
        case 'ArrowRight':
          cameraAngleY -= 0.1;
          break;
        case 'Space':
          event.preventDefault();
          setShowCreateTable(true);
          break;
      }
      
      if (event.code === 'KeyA' || event.code === 'ArrowLeft' || event.code === 'KeyD' || event.code === 'ArrowRight') {
        camera.position.x = Math.sin(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
        camera.position.z = Math.cos(cameraAngleY) * Math.cos(cameraAngleX) * cameraRadius;
        camera.lookAt(0, 20, 0);
      }
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Update buildings
      buildingsRef.current.forEach(building => {
        building.update();
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
    createBuildings();
    setupLighting();
    animate();

    // Event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      
      // Safe cleanup - only remove if element exists and is actually a child
      if (mountRef.current && rendererRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [tablesData]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-lg animate-pulse">
          INITIALIZING TRON DATABASE INTERFACE...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mountRef} className="w-full h-screen" />
      
      <DatabaseControls 
        tablesData={tablesData}
        selectedTable={selectedTable}
        onCreateTable={() => setShowCreateTable(true)}
        onRefresh={fetchTableData}
      />

      {selectedRecord && (
        <RecordEditDialog
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
          onUpdate={handleRecordUpdate}
          onDelete={handleRecordDelete}
        />
      )}

      {showCreateTable && (
        <TableCreateDialog
          isOpen={showCreateTable}
          onClose={() => setShowCreateTable(false)}
          onRefresh={fetchTableData}
        />
      )}
    </div>
  );
};

export default TronGame;
