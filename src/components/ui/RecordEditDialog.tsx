
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Trash2, Edit } from 'lucide-react';

interface SelectedRecord {
  tableId: string;
  recordId: string;
  data: any;
}

interface RecordEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: SelectedRecord;
  onUpdate: (tableId: string, recordId: string, data: any) => void;
  onDelete: (tableId: string, recordId: string) => void;
}

export const RecordEditDialog: React.FC<RecordEditDialogProps> = ({
  isOpen,
  onClose,
  record,
  onUpdate,
  onDelete
}) => {
  const [editedData, setEditedData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (record) {
      setEditedData({ ...record.data });
      setIsEditing(false);
    }
  }, [record]);

  const handleFieldChange = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onUpdate(record.tableId, record.recordId, editedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this record?')) {
      onDelete(record.tableId, record.recordId);
    }
  };

  const renderFieldValue = (key: string, value: any) => {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') {
      return (
        <input
          type="text"
          value={value || ''}
          disabled
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-400"
        />
      );
    }

    if (isEditing) {
      if (typeof value === 'boolean') {
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
            className="w-full p-2 bg-gray-800 border border-cyan-400 rounded text-cyan-300"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      }

      if (typeof value === 'number') {
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
            className="w-full p-2 bg-gray-800 border border-cyan-400 rounded text-cyan-300"
          />
        );
      }

      return (
        <textarea
          value={value || ''}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          className="w-full p-2 bg-gray-800 border border-cyan-400 rounded text-cyan-300 min-h-[60px] resize-none"
        />
      );
    }

    return (
      <div className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-gray-300 min-h-[40px] break-words">
        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '')}
      </div>
    );
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-cyan-400 text-cyan-300 max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono text-lg">
            RECORD EDITOR - {record.tableId.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          {Object.entries(record.data).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-cyan-400 font-mono text-sm font-bold">
                {key.toUpperCase()}
              </label>
              {renderFieldValue(key, editedData[key])}
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditing ? 'CANCEL' : 'EDIT'}
            </Button>
            
            {isEditing && (
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                SAVE CHANGES
              </Button>
            )}
          </div>

          <Button
            onClick={handleDelete}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            DELETE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
