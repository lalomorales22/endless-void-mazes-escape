import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from './button';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['W', '↑'], description: 'Move camera up' },
        { keys: ['S', '↓'], description: 'Move camera down' },
        { keys: ['A', '←'], description: 'Rotate camera left' },
        { keys: ['D', '→'], description: 'Rotate camera right' },
        { keys: ['Mouse Drag'], description: 'Free look around' },
        { keys: ['Scroll'], description: 'Zoom in/out' },
      ]
    },
    {
      category: 'Camera Presets',
      items: [
        { keys: ['1'], description: 'Overview mode' },
        { keys: ['2'], description: 'Bird\'s eye view' },
        { keys: ['3'], description: 'Cinematic angle' },
        { keys: ['4'], description: 'Low angle view' },
      ]
    },
    {
      category: 'Actions',
      items: [
        { keys: ['Space'], description: 'Create new table' },
        { keys: ['Esc'], description: 'Close dialogs' },
        { keys: ['?'], description: 'Show this help' },
      ]
    },
    {
      category: 'Interface',
      items: [
        { keys: ['Click'], description: 'Select data block or building' },
        { keys: ['Search Button'], description: 'Open search panel' },
        { keys: ['Analytics Button'], description: 'View database analytics' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/95 border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/30 max-w-3xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-400/50 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-400 font-mono">KEYBOARD SHORTCUTS</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {shortcuts.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="text-lg font-bold text-cyan-300 font-mono border-b border-cyan-400/30 pb-2">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <div className="flex gap-2">
                        {item.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-3 py-1 bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-400/50 rounded text-cyan-100 font-mono text-sm shadow-lg group-hover:border-cyan-400 group-hover:shadow-cyan-400/20 transition-all"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-gray-300 text-sm font-mono ml-4">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 border border-cyan-400/30 rounded">
            <p className="text-cyan-200 text-sm font-mono">
              💡 <strong>TIP:</strong> Press <kbd className="px-2 py-1 bg-gray-800 border border-cyan-400/50 rounded mx-1">?</kbd> at any time to open this shortcuts guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
