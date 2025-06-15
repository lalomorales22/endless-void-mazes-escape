
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Field {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string;
}

interface TableCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const TableCreateDialog: React.FC<TableCreateDialogProps> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()' },
    { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'now()' }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fieldTypes = [
    'text',
    'integer',
    'decimal',
    'boolean',
    'uuid',
    'timestamp',
    'jsonb',
    'inet'
  ];

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', nullable: true, defaultValue: '' }]);
  };

  const removeField = (index: number) => {
    if (index < 2) return; // Don't allow removing id and created_at
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const generateSQL = () => {
    const fieldDefinitions = fields.map(field => {
      let definition = `${field.name} ${field.type}`;
      
      if (field.name === 'id') {
        definition += ' PRIMARY KEY DEFAULT gen_random_uuid()';
      } else {
        if (!field.nullable) definition += ' NOT NULL';
        if (field.defaultValue) {
          definition += ` DEFAULT ${field.defaultValue === 'now()' ? 'now()' : `'${field.defaultValue}'`}`;
        }
      }
      
      return definition;
    }).join(',\n  ');

    return `CREATE TABLE public.${tableName} (\n  ${fieldDefinitions}\n);`;
  };

  const handleCreate = async () => {
    if (!tableName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a table name",
        variant: "destructive"
      });
      return;
    }

    if (fields.some(f => !f.name.trim())) {
      toast({
        title: "Error", 
        description: "Please fill in all field names",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Note: In a real implementation, you'd want to use a proper SQL execution method
      // For now, we'll show the SQL and let the user know they need to run it manually
      const sql = generateSQL();
      
      toast({
        title: "SQL Generated",
        description: "Copy the SQL from the console and run it in your Supabase SQL editor",
      });
      
      console.log("Please run this SQL in your Supabase SQL editor:");
      console.log(sql);
      
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error creating table:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create table",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setTableName('');
    setFields([
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()' },
      { name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'now()' }
    ]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-cyan-400 text-cyan-300 max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-lg">
            CREATE NEW TABLE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          {/* Table Name */}
          <div className="space-y-2">
            <label className="text-cyan-400 font-mono text-sm font-bold">
              TABLE NAME
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="my_table"
              className="w-full p-3 bg-gray-800 border border-cyan-400 rounded text-cyan-300 font-mono"
            />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-cyan-400 font-mono text-sm font-bold">
                FIELDS
              </label>
              <Button
                onClick={addField}
                variant="outline"
                size="sm"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                ADD FIELD
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-900 rounded border border-gray-700">
                  {/* Field Name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder="field_name"
                      disabled={index < 2}
                      className={`w-full p-2 border rounded text-sm font-mono ${
                        index < 2 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-800 border-cyan-400 text-cyan-300'
                      }`}
                    />
                  </div>

                  {/* Field Type */}
                  <div className="col-span-2">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                      disabled={index < 2}
                      className={`w-full p-2 border rounded text-sm ${
                        index < 2 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-800 border-cyan-400 text-cyan-300'
                      }`}
                    >
                      {fieldTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nullable */}
                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={field.nullable}
                      onChange={(e) => updateField(index, { nullable: e.target.checked })}
                      disabled={index < 2}
                      className="mr-2"
                    />
                    <span className="text-xs">Nullable</span>
                  </div>

                  {/* Default Value */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                      placeholder="default value"
                      disabled={index < 2}
                      className={`w-full p-2 border rounded text-sm font-mono ${
                        index < 2 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-800 border-cyan-400 text-cyan-300'
                      }`}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    {index >= 2 && (
                      <Button
                        onClick={() => removeField(index)}
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Preview */}
          {tableName && (
            <div className="space-y-2">
              <label className="text-cyan-400 font-mono text-sm font-bold">
                SQL PREVIEW
              </label>
              <pre className="p-3 bg-gray-900 border border-gray-700 rounded text-xs text-green-400 overflow-x-auto font-mono">
                {generateSQL()}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !tableName.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
          >
            {isCreating ? 'CREATING...' : 'CREATE TABLE'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
