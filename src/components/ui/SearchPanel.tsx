import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface SearchPanelProps {
  tables: string[];
  onSearch: (query: string, table: string) => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ tables, onSearch, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('all');

  const handleSearch = () => {
    onSearch(searchQuery, selectedTable);
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-50">
      <div className="bg-black/90 border-2 border-cyan-400 p-6 backdrop-blur-md rounded-lg shadow-xl shadow-cyan-400/20 min-w-[500px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Search className="h-5 w-5" />
            <h2 className="text-lg font-mono font-bold">SEARCH DATABASE</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cyan-400 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-cyan-300 text-sm font-mono mb-2 block">SEARCH QUERY</label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter search term..."
              className="bg-black/50 border-cyan-400 text-cyan-100 font-mono"
            />
          </div>

          <div>
            <label className="text-cyan-300 text-sm font-mono mb-2 block">TABLE FILTER</label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-black/50 border-cyan-400 text-cyan-100 font-mono">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent className="bg-black border-cyan-400 text-cyan-100 font-mono">
                <SelectItem value="all">ALL TABLES</SelectItem>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-cyan-400 text-black hover:bg-cyan-300 font-mono"
            >
              <Search className="h-4 w-4 mr-2" />
              SEARCH
            </Button>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedTable('all');
              }}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono"
            >
              CLEAR
            </Button>
          </div>

          <div className="text-xs text-gray-400 font-mono mt-4">
            <div>TIP: Use quotation marks for exact matches</div>
            <div>Press ENTER to search</div>
          </div>
        </div>
      </div>
    </div>
  );
};
