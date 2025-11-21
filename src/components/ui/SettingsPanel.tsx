import React, { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';
import { Button } from './button';
import { Switch } from './switch';
import { Slider } from './slider';

interface SettingsPanelProps {
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  currentSettings: UserSettings;
}

export interface UserSettings {
  showMinimap: boolean;
  showFPS: boolean;
  particleDensity: number;
  cameraSpeed: number;
  soundEnabled: boolean;
  autoRotate: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<UserSettings>(currentSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-black/95 border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/30 max-w-2xl w-full mx-4">
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-400/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-400 font-mono">SETTINGS</h2>
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

        <div className="p-6 space-y-6">
          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-bold text-cyan-300 font-mono mb-4 border-b border-cyan-400/30 pb-2">
              DISPLAY
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-100 font-mono">Show Minimap</div>
                  <div className="text-xs text-gray-400 font-mono">Display navigation minimap</div>
                </div>
                <Switch
                  checked={settings.showMinimap}
                  onCheckedChange={(checked) => setSettings({ ...settings, showMinimap: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-100 font-mono">Show FPS Counter</div>
                  <div className="text-xs text-gray-400 font-mono">Display performance metrics</div>
                </div>
                <Switch
                  checked={settings.showFPS}
                  onCheckedChange={(checked) => setSettings({ ...settings, showFPS: checked })}
                />
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div>
            <h3 className="text-lg font-bold text-cyan-300 font-mono mb-4 border-b border-cyan-400/30 pb-2">
              PERFORMANCE
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-cyan-100 font-mono">Particle Density</div>
                    <div className="text-xs text-gray-400 font-mono">Adjust visual effects</div>
                  </div>
                  <div className="text-cyan-400 font-mono">{Math.round(settings.particleDensity * 100)}%</div>
                </div>
                <Slider
                  value={[settings.particleDensity]}
                  onValueChange={([value]) => setSettings({ ...settings, particleDensity: value })}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Camera Settings */}
          <div>
            <h3 className="text-lg font-bold text-cyan-300 font-mono mb-4 border-b border-cyan-400/30 pb-2">
              CAMERA
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-cyan-100 font-mono">Camera Speed</div>
                    <div className="text-xs text-gray-400 font-mono">Navigation sensitivity</div>
                  </div>
                  <div className="text-cyan-400 font-mono">{Math.round(settings.cameraSpeed * 100)}%</div>
                </div>
                <Slider
                  value={[settings.cameraSpeed]}
                  onValueChange={([value]) => setSettings({ ...settings, cameraSpeed: value })}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-100 font-mono">Auto Rotate</div>
                  <div className="text-xs text-gray-400 font-mono">Slowly rotate camera automatically</div>
                </div>
                <Switch
                  checked={settings.autoRotate}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoRotate: checked })}
                />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <h3 className="text-lg font-bold text-cyan-300 font-mono mb-4 border-b border-cyan-400/30 pb-2">
              AUDIO
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-cyan-100 font-mono">Sound Effects</div>
                  <div className="text-xs text-gray-400 font-mono">Enable interaction sounds</div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border-t border-cyan-400/50 p-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSave}
              className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono"
            >
              <Save className="h-4 w-4 mr-2" />
              SAVE SETTINGS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
