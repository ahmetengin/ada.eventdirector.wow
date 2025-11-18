
import React, { useState, useEffect, useRef } from 'react';
import type { Equipment, EquipmentPreset } from '../types';

interface EquipmentControllerProps {
    equipment: Equipment[];
    onToggle: (id: string, currentState: boolean) => void;
    presets: EquipmentPreset[];
    onLoadPreset: (name: string) => void;
    onSavePreset: (name: string) => void;
    onSimulateOffline: () => void;
}

export const EquipmentController: React.FC<EquipmentControllerProps> = ({ 
    equipment, 
    onToggle,
    presets,
    onLoadPreset,
    onSavePreset,
    onSimulateOffline
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);
  const prevEquipmentRef = useRef<Equipment[]>(equipment);

  useEffect(() => {
    // Find items that just went offline
    const newlyOffline = equipment.filter(currentItem => {
        const prevItem = prevEquipmentRef.current.find(p => p.id === currentItem.id);
        return prevItem && prevItem.status === 'Online' && currentItem.status === 'Offline';
    });

    // Find items that just came back online
    const newlyOnline = equipment.filter(currentItem => {
        const prevItem = prevEquipmentRef.current.find(p => p.id === currentItem.id);
        return prevItem && prevItem.status === 'Offline' && currentItem.status === 'Online';
    });

    if (newlyOffline.length > 0) {
        const newNotifications = newlyOffline.map(item => ({
            id: `${item.id}-${Date.now()}`,
            message: `${item.name} has gone offline!`
        }));
        setNotifications(prev => [...newNotifications, ...prev.filter(p => !newlyOffline.some(n => p.message.includes(n.name)))]);
    }

    if (newlyOnline.length > 0) {
        const onlineNames = newlyOnline.map(item => item.name);
        setNotifications(prev => prev.filter(n => !onlineNames.some(name => n.message.includes(name))));
    }

    prevEquipmentRef.current = equipment;
  }, [equipment]);


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
      
      {notifications.length > 0 && (
        <div className="space-y-2 mb-4">
            {notifications.map((note) => (
            <div key={note.id} className="bg-yellow-800/60 border border-yellow-600 text-yellow-200 px-4 py-2 rounded-lg flex items-center justify-between text-sm animate-pulse">
                <p>
                    <span className="font-bold mr-2">⚠️</span> {note.message}
                </p>
                <button 
                    onClick={() => setNotifications(prev => prev.filter((n) => n.id !== note.id))}
                    className="text-yellow-200 hover:text-white font-bold text-lg ml-2 leading-none"
                    aria-label="Dismiss notification"
                >
                    &times;
                </button>
            </div>
            ))}
        </div>
      )}

      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">Presets & Simulation</h3>
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
             <div className="pt-4">
                <button
                    onClick={onSimulateOffline}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                   <span className="mr-2 text-lg">⚡</span> Simulate Failure / Reset
                </button>
            </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {equipment.map(item => (
          <div key={item.id} className={`p-3 rounded-lg flex justify-between items-center transition-all duration-300 ${item.status === 'Offline' ? 'bg-red-900/50 border border-red-700' : 'bg-gray-700/50'}`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">{getTypeIcon(item.type)}</span>
              <div>
                <p className={`font-semibold transition-colors ${item.status === 'Offline' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{item.name}</p>
                <p className={`text-xs transition-colors font-bold ${item.status === 'Offline' ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.status === 'Offline' ? 'OFFLINE' : item.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.id, item.on)}
              disabled={item.status === 'Offline'}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                item.on ? 'bg-green-500' : 'bg-gray-600'
              } ${item.status === 'Offline' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
