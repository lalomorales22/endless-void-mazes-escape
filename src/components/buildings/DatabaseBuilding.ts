
import * as THREE from 'three';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
  sampleData?: any[];
}

export class DatabaseBuilding {
  private group: THREE.Group;
  private tableData: TableData;
  private recordBlocks: THREE.Mesh[] = [];
  private buildingHeight: number;
  private onRecordClick: (tableId: string, recordId: string, data: any) => void;

  constructor(
    tableData: TableData,
    index: number,
    totalTables: number,
    onRecordClick: (tableId: string, recordId: string, data: any) => void
  ) {
    this.tableData = tableData;
    this.onRecordClick = onRecordClick;
    this.group = new THREE.Group();
    this.buildingHeight = Math.max(20, Math.min(80, tableData.recordCount * 0.5));
    
    this.createBuilding(index, totalTables);
    this.createDataBlocks();
  }

  private createBuilding(index: number, totalTables: number) {
    // Position buildings in a circle
    const angle = (index / totalTables) * Math.PI * 2;
    const radius = 60;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    this.group.position.set(x, 0, z);

    // Building structure - transparent glass with framework
    const buildingGeometry = new THREE.BoxGeometry(15, this.buildingHeight, 15);
    
    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: this.getBuildingColor(),
      transparent: true,
      opacity: 0.15,
      transmission: 0.9,
      thickness: 0.5,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const building = new THREE.Mesh(buildingGeometry, glassMaterial);
    building.position.y = this.buildingHeight / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    this.group.add(building);

    // Building framework
    const frameGeometry = new THREE.EdgesGeometry(buildingGeometry);
    const frameMaterial = new THREE.LineBasicMaterial({ 
      color: this.getBuildingColor(),
      transparent: true,
      opacity: 0.8 
    });
    const frame = new THREE.LineSegments(frameGeometry, frameMaterial);
    frame.position.y = this.buildingHeight / 2;
    this.group.add(frame);

    // Base platform
    const baseGeometry = new THREE.CylinderGeometry(10, 12, 2, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: this.getBuildingColor(),
      emissive: this.getBuildingColor(),
      emissiveIntensity: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1;
    this.group.add(base);

    // Table name label
    this.createLabel();
  }

  private createDataBlocks() {
    if (!this.tableData.sampleData) return;

    const recordsPerFloor = 6;
    const floorHeight = 4;
    const blockSize = 1.5;
    
    this.tableData.sampleData.forEach((record, index) => {
      const floor = Math.floor(index / recordsPerFloor);
      const positionOnFloor = index % recordsPerFloor;
      
      // Position blocks in a 3x2 grid per floor
      const gridX = (positionOnFloor % 3) - 1;
      const gridZ = Math.floor(positionOnFloor / 3) - 0.5;
      
      const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
      const blockMaterial = new THREE.MeshPhongMaterial({
        color: this.getBlockColor(record),
        emissive: this.getBlockColor(record),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
      });

      const block = new THREE.Mesh(blockGeometry, blockMaterial);
      block.position.set(
        gridX * 3,
        floorHeight + (floor * floorHeight) + blockSize/2,
        gridZ * 3
      );
      
      // Add hover effect
      block.userData = {
        originalColor: this.getBlockColor(record),
        record: record,
        tableId: this.tableData.tableName,
        recordId: record.id
      };

      block.castShadow = true;
      this.recordBlocks.push(block);
      this.group.add(block);

      // Add connection lines between floors
      if (floor > 0) {
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x00ffff, 
          transparent: true, 
          opacity: 0.3 
        });
        const points = [
          new THREE.Vector3(gridX * 3, block.position.y - floorHeight, gridZ * 3),
          new THREE.Vector3(gridX * 3, block.position.y, gridZ * 3)
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.group.add(line);
      }
    });
  }

  private createLabel() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = '#00ffff';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText(this.tableData.tableName.toUpperCase(), canvas.width / 2, 45);
    
    context.fillStyle = '#ffffff';
    context.font = '20px Arial';
    context.fillText(`${this.tableData.recordCount} records`, canvas.width / 2, 75);
    context.fillText(`Updated: ${this.tableData.lastUpdated}`, canvas.width / 2, 100);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    const labelGeometry = new THREE.PlaneGeometry(15, 4);
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    
    label.position.set(0, this.buildingHeight + 5, 0);
    label.lookAt(0, this.buildingHeight + 5, -50);
    this.group.add(label);
  }

  private getBuildingColor(): number {
    const colors = {
      users: 0x00ffff,      // Cyan
      posts: 0xff0066,      // Pink
      comments: 0x66ff00,   // Green
      products: 0xffff00,   // Yellow
      orders: 0xff6600,     // Orange
      analytics: 0x6600ff   // Purple
    };
    return colors[this.tableData.tableName as keyof typeof colors] || 0x00ffff;
  }

  private getBlockColor(record: any): number {
    // Color blocks based on record properties
    const hash = this.hashCode(JSON.stringify(record));
    const hue = Math.abs(hash) % 360;
    return new THREE.Color().setHSL(hue / 360, 0.7, 0.6).getHex();
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  public handleClick(intersectedObject: THREE.Object3D) {
    const block = this.recordBlocks.find(b => b === intersectedObject);
    if (block && block.userData.record) {
      // Add visual feedback for click
      const originalScale = block.scale.clone();
      block.scale.multiplyScalar(1.2);
      
      setTimeout(() => {
        block.scale.copy(originalScale);
      }, 200);
      
      this.onRecordClick(
        block.userData.tableId,
        block.userData.recordId,
        block.userData.record
      );
    }
  }

  public update() {
    // Animate building elements
    const time = Date.now() * 0.001;
    
    // Gentle building sway
    this.group.rotation.y = Math.sin(time * 0.5) * 0.01;
    
    // Animate record blocks
    this.recordBlocks.forEach((block, index) => {
      block.rotation.y = time * 0.5 + index * 0.1;
      
      // Gentle floating animation
      const baseY = block.userData.baseY || block.position.y;
      block.userData.baseY = baseY;
      block.position.y = baseY + Math.sin(time * 2 + index) * 0.3;
    });
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getIntersectableObjects(): THREE.Object3D[] {
    return this.recordBlocks;
  }

  public getTableName(): string {
    return this.tableData.tableName;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }
}
