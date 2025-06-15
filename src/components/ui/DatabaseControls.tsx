
import React from 'react';
import { Button } from '../ui/button';
import { Database, Plus, RotateCcw } from 'lucide-react';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
}

interface DatabaseControlsProps {
  tablesData: TableData[];
  selectedTable: string | null;
  onCreateTable: () => void;
  onRefresh: () => void;
  onTableSelect: (tableName: string) => void;
}

export const DatabaseControls: React.FC<DatabaseControlsProps> = ({
  tablesData,
  selectedTable,
  onCreateTable,
  onRefresh,
  onTableSelect
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm pointer-events-auto">
        <div className="bg-black/70 border border-cyan-400 p-4 backdrop-blur-sm rounded">
          <div className="flex items-center gap-2 text-cyan-400 text-lg mb-3">
            <Database className="h-5 w-5" />
            <span>TRON DATABASE INTERFACE</span>
          </div>
          <div className="space-y-1 text-cyan-300">
            <div>STATUS: CONNECTED</div>
            <div>TABLES: {tablesData.length} LOADED</div>
            <div>ACTIVE: {selectedTable || 'SCANNING...'}</div>
            <div>TOTAL RECORDS: {tablesData.reduce((sum, table) => sum + table.recordCount, 0).toLocaleString()}</div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={onCreateTable}
              variant="outline" 
              size="sm"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            >
              <Plus className="h-4 w-4 mr-1" />
              CREATE TABLE
            </Button>
            <Button 
              onClick={onRefresh}
              variant="outline" 
              size="sm"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              REFRESH
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-xs pointer-events-auto">
        <div className="bg-black/70 border border-cyan-400 p-3 backdrop-blur-sm rounded">
          <div className="space-y-1">
            <div>WASD/ARROWS: NAVIGATE</div>
            <div>MOUSE DRAG: ROTATE VIEW</div>
            <div>SCROLL: ZOOM IN/OUT</div>
            <div>SPACE: CREATE NEW TABLE</div>
            <div className="mt-2 text-yellow-400">CLICK DATA BLOCKS TO EDIT</div>
            <div className="text-green-400">CLICK BUILDINGS TO NAVIGATE</div>
          </div>
        </div>
      </div>

      {/* Right panel - Table List */}
      <div className="absolute top-4 right-4 text-cyan-400 font-mono text-sm pointer-events-auto">
        <div className="bg-black/70 border border-cyan-400 p-4 backdrop-blur-sm rounded min-w-64 max-w-80">
          <div className="text-cyan-400 text-lg mb-3">DATABASE BUILDINGS</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tablesData.map((table) => (
              <div 
                key={table.tableName}
                onClick={() => onTableSelect(table.tableName)}
                className={`p-3 border rounded transition-all cursor-pointer transform hover:scale-105 ${
                  selectedTable === table.tableName 
                    ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/20' 
                    : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-400/10'
                }`}
              >
                <div className="text-cyan-300 font-bold">{table.tableName.toUpperCase()}</div>
                <div className="text-xs text-gray-400">
                  {table.recordCount.toLocaleString()} records
                </div>
                <div className="text-xs text-gray-500">
                  Updated: {table.lastUpdated}
                </div>
                <div className="text-xs text-green-400 mt-1">
                  → Click to navigate
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
