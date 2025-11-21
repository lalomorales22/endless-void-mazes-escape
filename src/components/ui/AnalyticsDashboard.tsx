import React from 'react';
import { BarChart3, TrendingUp, Database, Activity, X } from 'lucide-react';
import { Button } from './button';

interface TableData {
  tableName: string;
  recordCount: number;
  lastUpdated: string;
}

interface AnalyticsDashboardProps {
  tablesData: TableData[];
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tablesData, onClose }) => {
  const totalRecords = tablesData.reduce((sum, table) => sum + table.recordCount, 0);
  const averageRecords = Math.round(totalRecords / tablesData.length);
  const maxTable = tablesData.reduce((max, table) =>
    table.recordCount > max.recordCount ? table : max, tablesData[0]);
  const minTable = tablesData.reduce((min, table) =>
    table.recordCount < min.recordCount ? table : min, tablesData[0]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-50">
      <div className="bg-black/90 border-2 border-cyan-400 p-6 backdrop-blur-md rounded-lg shadow-xl shadow-cyan-400/20 min-w-[700px] max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <BarChart3 className="h-6 w-6" />
            <h2 className="text-xl font-mono font-bold">DATABASE ANALYTICS</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyan-400 hover:text-red-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border border-cyan-400/50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-cyan-400" />
              <div className="text-cyan-300 text-sm font-mono">TOTAL TABLES</div>
            </div>
            <div className="text-3xl font-bold text-cyan-100 font-mono">{tablesData.length}</div>
          </div>

          <div className="bg-gradient-to-br from-green-400/10 to-green-600/10 border border-green-400/50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-400" />
              <div className="text-green-300 text-sm font-mono">TOTAL RECORDS</div>
            </div>
            <div className="text-3xl font-bold text-green-100 font-mono">{totalRecords.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border border-yellow-400/50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <div className="text-yellow-300 text-sm font-mono">AVERAGE RECORDS</div>
            </div>
            <div className="text-3xl font-bold text-yellow-100 font-mono">{averageRecords.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-400/10 to-purple-600/10 border border-purple-400/50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-purple-400" />
              <div className="text-purple-300 text-sm font-mono">LARGEST TABLE</div>
            </div>
            <div className="text-lg font-bold text-purple-100 font-mono">{maxTable?.tableName.toUpperCase()}</div>
            <div className="text-sm text-purple-300 font-mono">{maxTable?.recordCount.toLocaleString()} records</div>
          </div>
        </div>

        {/* Table Breakdown */}
        <div className="mt-6">
          <div className="text-cyan-400 font-mono font-bold mb-3">TABLE BREAKDOWN</div>
          <div className="space-y-2">
            {tablesData.sort((a, b) => b.recordCount - a.recordCount).map((table) => {
              const percentage = (table.recordCount / totalRecords) * 100;
              return (
                <div key={table.tableName} className="bg-black/50 border border-cyan-400/30 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-cyan-100 font-mono font-bold">{table.tableName.toUpperCase()}</div>
                    <div className="text-cyan-300 font-mono text-sm">{table.recordCount.toLocaleString()} records</div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1">{percentage.toFixed(1)}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 border border-cyan-400/30 p-4 rounded">
          <div className="text-cyan-400 font-mono font-bold mb-2">INSIGHTS</div>
          <div className="space-y-1 text-sm font-mono text-cyan-200">
            <div>• Database contains {totalRecords.toLocaleString()} total records across {tablesData.length} tables</div>
            <div>• Largest table: {maxTable?.tableName} with {maxTable?.recordCount.toLocaleString()} records</div>
            <div>• Smallest table: {minTable?.tableName} with {minTable?.recordCount.toLocaleString()} records</div>
            <div>• Average table size: {averageRecords.toLocaleString()} records</div>
          </div>
        </div>
      </div>
    </div>
  );
};
