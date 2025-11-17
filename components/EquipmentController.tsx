
import React, { useState } from 'react';
import type { Equipment, EquipmentPreset } from '../types';

interface EquipmentControllerProps {
    equipment: Equipment[];
    onToggle: (id: string, currentState: boolean) => void;
    presets: EquipmentPreset[];
    onLoadPreset: (name: string) => void;
    onSavePreset: (name: string) => void;
}

export const EquipmentController: React.FC<EquipmentControllerProps> = ({ 
    equipment, 
    onToggle,
    presets,
    onLoadPreset,
    onSavePreset
}) => {
  const [newPresetName, setNewPresetName] = useState('');

  const handleToggle = (id: string, currentState: boolean) => {
    onToggle(id, currentState);
  };

  const handleSaveClick = () => {
    if (newPresetName.trim()) {
        onSavePreset(newPresetName.trim());
        setNewPresetName('');
    }
  };
  
  const getTypeIcon = (type: 'Audio' | 'Lighting' | 'Video') => {
    switch(type) {
        case 'Audio': return '🔊';
        case 'Lighting': return '💡';
        case 'Video': return '📺';
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg h-full border border-gray-700">
      <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">Equipment Control</h2>
      
      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">Presets</h3>
        <div className="space-y-4">
            <div>
                <label htmlFor="preset-select" className="block text-sm font-medium text-gray-300 mb-1">Load Preset</label>
                <select
                    id="preset-select"
                    onChange={(e) => {
                      if (e.target.value) onLoadPreset(e.target.value);
                      e.target.value = ""; // Reset after selection to allow re-selection
                    }}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    defaultValue=""
                >
                    <option value="" disabled>Select to load...</option>
                    {presets.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="preset-save" className="block text-sm font-medium text-gray-300 mb-1">Save Current as New Preset</label>
                <div className="flex space-x-2">
                    <input
                        id="preset-save"
                        type="text"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveClick()}
                        placeholder="New preset name"
                        className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    />
                    <button
                        onClick={handleSaveClick}
                        disabled={!newPresetName.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {equipment.map(item => (
          <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">{getTypeIcon(item.type)}</span>
              <div>
                <p className="font-semibold text-gray-200">{item.name}</p>
                <p className="text-xs text-gray-400">{item.type}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.id, item.on)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                item.on ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                  item.on ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
