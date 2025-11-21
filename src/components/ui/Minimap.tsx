import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
}

interface MinimapProps {
  tablesData: TableData[];
  cameraPosition: THREE.Vector3;
  selectedTable: string | null;
  onTableClick: (tableName: string) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  tablesData,
  cameraPosition,
  selectedTable,
  onTableClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 17, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw center crosshair
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX, centerY + 5);
    ctx.stroke();

    // Draw buildings
    const scale = 1.5;
    const radius = 60;

    tablesData.forEach((table, index) => {
      const angle = (index / tablesData.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * scale;
      const y = centerY + Math.sin(angle) * radius * scale;

      // Building color
      const colors: { [key: string]: string } = {
        users: '#00ffff',
        posts: '#ff0066',
        comments: '#66ff00',
        products: '#ffff00',
        orders: '#ff6600',
        analytics: '#6600ff'
      };
      const color = colors[table.tableName] || '#00ffff';

      // Draw building
      ctx.fillStyle = selectedTable === table.tableName ? color : `${color}80`;
      ctx.strokeStyle = color;
      ctx.lineWidth = selectedTable === table.tableName ? 2 : 1;

      const size = Math.max(4, Math.min(8, table.recordCount * 0.05));
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw label for selected table
      if (selectedTable === table.tableName) {
        ctx.fillStyle = color;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(table.tableName.toUpperCase(), x, y - size - 5);
      }

      // Draw connection line to center
      ctx.strokeStyle = `${color}30`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw camera indicator
    const cameraAngle = Math.atan2(cameraPosition.x, cameraPosition.z);
    const cameraDistance = Math.min(30, Math.sqrt(cameraPosition.x ** 2 + cameraPosition.z ** 2) * 0.5);
    const cameraX = centerX + Math.sin(cameraAngle) * cameraDistance;
    const cameraY = centerY + Math.cos(cameraAngle) * cameraDistance;

    ctx.fillStyle = '#ff00ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cameraX, cameraY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw camera direction
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cameraX, cameraY);
    ctx.lineTo(
      cameraX + Math.sin(cameraAngle) * 10,
      cameraY + Math.cos(cameraAngle) * 10
    );
    ctx.stroke();

  }, [tablesData, cameraPosition, selectedTable]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 1.5;
    const radius = 60;

    // Check if click is near any building
    tablesData.forEach((table, index) => {
      const angle = (index / tablesData.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * scale;
      const y = centerY + Math.sin(angle) * radius * scale;

      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      if (distance < 10) {
        onTableClick(table.tableName);
      }
    });
  };

  return (
    <div className="absolute bottom-4 right-4 pointer-events-auto">
      <div className="bg-black/70 border border-cyan-400 p-2 backdrop-blur-sm rounded">
        <div className="text-cyan-400 font-mono text-xs mb-1 text-center">MINIMAP</div>
        <canvas
          ref={canvasRef}
          width={180}
          height={180}
          onClick={handleClick}
          className="cursor-pointer"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
    </div>
  );
};
