
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, Trash2, Sparkles, Brain, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [showAIInput, setShowAIInput] = useState(false);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
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
    if (index < 2) return;
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

  const generateWithAI = async () => {
    if (!anthropicKey.trim() || !aiPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both your Anthropic API key and a description of the table you want to create",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Create a database table schema for: ${aiPrompt}

Please respond with ONLY a JSON object in this exact format:
{
  "tableName": "table_name",
  "fields": [
    {"name": "field_name", "type": "postgresql_type", "nullable": true/false, "defaultValue": "default_value_or_empty_string"}
  ]
}

Use PostgreSQL data types like: text, integer, decimal, boolean, uuid, timestamp, jsonb, inet
Always include an 'id' field with type 'uuid' and 'created_at' field with type 'timestamp'.
Make the response valid JSON without any markdown formatting.`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parse the AI response
      const tableSchema = JSON.parse(content);
      
      setTableName(tableSchema.tableName);
      setFields(tableSchema.fields);
      setShowAIInput(false);
      
      toast({
        title: "AI Generated Table",
        description: `Successfully generated schema for "${tableSchema.tableName}" table`,
      });
    } catch (error) {
      console.error('Error generating table with AI:', error);
      toast({
        title: "AI Generation Failed",
        description: "Failed to generate table schema. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
      const sql = generateSQL();
      
      // Execute the SQL directly using Supabase RPC
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Table Created Successfully",
        description: `Table "${tableName}" has been created in your database.`,
      });
      
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error creating table:', error);
      
      // Fallback to manual SQL generation if RPC fails
      const sql = generateSQL();
      console.log('Generated SQL for manual execution:');
      console.log(sql);
      
      toast({
        title: "Table Schema Generated",
        description: `Table "${tableName}" schema has been generated. Check console for SQL to run manually in Supabase SQL Editor.`,
      });
      
      onClose();
      onRefresh();
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
    setShowAIInput(false);
    setAnthropicKey('');
    setAiPrompt('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-cyan-400 text-cyan-300 max-w-5xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            CREATE NEW TABLE
            <Button
              onClick={() => setShowAIInput(!showAIInput)}
              variant="outline"
              size="sm"
              className="ml-auto border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
            >
              <Brain className="h-4 w-4 mr-1" />
              AI ASSIST
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
          {/* AI Input Section */}
          {showAIInput && (
            <div className="space-y-4 p-4 border border-purple-400 rounded bg-purple-400/5">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Sparkles className="h-4 w-4" />
                AI TABLE GENERATOR
              </div>
              
              <div className="space-y-2">
                <label className="text-purple-400 font-mono text-sm font-bold">
                  ANTHROPIC API KEY
                </label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full p-3 bg-gray-800 border border-purple-400 rounded text-purple-300 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-purple-400 font-mono text-sm font-bold">
                  DESCRIBE YOUR TABLE
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'A user profiles table with email, name, avatar, and preferences'"
                  className="w-full p-3 bg-gray-800 border border-purple-400 rounded text-purple-300 font-mono h-20 resize-none"
                />
              </div>

              <Button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    GENERATE WITH AI
                  </>
                )}
              </Button>
            </div>
          )}

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
