
import React, { useState, useEffect, useRef } from 'react';
import type { Equipment, EquipmentPreset, LightingCue } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { SaveIcon } from './icons/SaveIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { BotIcon } from './icons/BotIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface EquipmentControllerProps {
    equipment: Equipment[];
    onToggle: (id: string, currentState: boolean) => void;
    presets: EquipmentPreset[];
    onLoadPreset: (name: string) => void;
    onSavePreset: (name: string) => void;
    onSimulateOffline: () => void;
    onDeletePreset: (name: string) => void;
    onUpdatePreset: (name: string) => void;
    onReorderPresets: (presets: EquipmentPreset[]) => void;
    lightingCues: LightingCue[];
    onTriggerCue: (name: string) => void;
    onGetTroubleshooting: (equipment: Equipment) => void;
    onGenerateCue: (prompt: string) => Promise<void>;
}

export const EquipmentController: React.FC<EquipmentControllerProps> = ({ 
    equipment, 
    onToggle,
    presets,
    onLoadPreset,
    onSavePreset,
    onSimulateOffline,
    onDeletePreset,
    onUpdatePreset,
    onReorderPresets,
    lightingCues,
    onTriggerCue,
    onGetTroubleshooting,
    onGenerateCue,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);
  const prevEquipmentRef = useRef<Equipment[]>(equipment);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [lightingCuePrompt, setLightingCuePrompt] = useState('');
  const [isGeneratingCue, setIsGeneratingCue] = useState(false);

  useEffect(() => {
    const newlyOffline = equipment.filter(currentItem => {
        const prevItem = prevEquipmentRef.current.find(p => p.id === currentItem.id);
        return prevItem && prevItem.status === 'Online' && currentItem.status === 'Offline';
    });

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


  const handleSaveClick = () => {
    if (newPresetName.trim()) {
        onSavePreset(newPresetName.trim());
        setNewPresetName('');
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm(`Are you sure you want to delete the preset "${name}"? This cannot be undone.`)) {
        onDeletePreset(name);
    }
  };

  const handleUpdate = (name: string) => {
      if (window.confirm(`Are you sure you want to overwrite the preset "${name}" with the current equipment settings?`)) {
          onUpdatePreset(name);
      }
  };
  
  const handleGenerateCueClick = async () => {
    if (!lightingCuePrompt.trim()) return;
    setIsGeneratingCue(true);
    await onGenerateCue(lightingCuePrompt);
    setLightingCuePrompt('');
    setIsGeneratingCue(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { setDraggedItemIndex(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); };
  const handleDragEnd = () => { setDraggedItemIndex(null); };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
          setDraggedItemIndex(null);
          return;
      }
      const reorderedPresets = [...presets];
      const [draggedItem] = reorderedPresets.splice(draggedItemIndex, 1);
      reorderedPresets.splice(targetIndex, 0, draggedItem);
      onReorderPresets(reorderedPresets);
      setDraggedItemIndex(null);
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
                <p><span className="font-bold mr-2">⚠️</span> {note.message}</p>
                <button onClick={() => setNotifications(prev => prev.filter((n) => n.id !== note.id))} className="text-yellow-200 hover:text-white font-bold text-lg ml-2 leading-none" aria-label="Dismiss notification">&times;</button>
            </div>
            ))}
        </div>
      )}

      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">Lighting Cues</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
            {lightingCues.map(cue => (
                <button key={cue.name} onClick={() => onTriggerCue(cue.name)} className={`font-semibold py-2 px-3 rounded-md text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${cue.isAiGenerated ? 'bg-purple-700 hover:bg-purple-600 text-purple-100' : 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'}`} >
                    {cue.isAiGenerated && <SparkleIcon className="w-4 h-4" />}
                    {cue.name}
                </button>
            ))}
        </div>
        <div>
            <label htmlFor="cue-generate" className="block text-sm font-medium text-gray-300 mb-1">Generate with AI</label>
            <div className="flex space-x-2">
                <input id="cue-generate" type="text" value={lightingCuePrompt} onChange={(e) => setLightingCuePrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateCueClick()} placeholder="e.g., Dramatic winner spotlight" className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={handleGenerateCueClick} disabled={!lightingCuePrompt.trim() || isGeneratingCue} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    {isGeneratingCue ? <SpinnerIcon className="w-5 h-5"/> : <SparkleIcon className="w-5 h-5"/>}
                </button>
            </div>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-700 pb-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">Presets Management</h3>
         <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
            {presets.map((preset, index) => (
                <div key={preset.name} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className={`group flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${draggedItemIndex === index ? 'opacity-50 bg-cyan-900/50' : 'bg-gray-700/60'} ${draggedItemIndex !== null ? 'cursor-grabbing' : 'cursor-grab'}`}>
                    <div className="flex items-center"><DragHandleIcon className="mr-3 text-gray-500 group-hover:text-gray-300" /><span className="font-semibold text-gray-200">{preset.name}</span></div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => onLoadPreset(preset.name)} className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold px-3 py-1 text-xs rounded transition-colors" aria-label={`Load preset ${preset.name}`}>Load</button>
                        <button onClick={() => handleUpdate(preset.name)} className="p-2 rounded-full hover:bg-gray-600 transition-colors opacity-50 group-hover:opacity-100" aria-label={`Update preset ${preset.name} with current settings`} title="Update Preset"><SaveIcon className="w-4 h-4 text-yellow-400" /></button>
                        <button onClick={() => handleDelete(preset.name)} className="p-2 rounded-full hover:bg-gray-600 transition-colors opacity-50 group-hover:opacity-100" aria-label={`Delete preset ${preset.name}`} title="Delete Preset"><TrashIcon className="w-4 h-4 text-red-400" /></button>
                    </div>
                </div>
            ))}
            {presets.length === 0 && <div className="text-center text-gray-500 py-4">No presets saved.</div>}
        </div>
        <div>
            <label htmlFor="preset-save" className="block text-sm font-medium text-gray-300 mb-1">Save Current as New Preset</label>
            <div className="flex space-x-2">
                <input id="preset-save" type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveClick()} placeholder="New preset name" className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <button onClick={handleSaveClick} disabled={!newPresetName.trim()} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Save</button>
            </div>
        </div>
         <div className="pt-6 mt-6 border-t border-gray-700">
             <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">System Simulation</h3>
            <button onClick={onSimulateOffline} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"><span className="mr-2 text-lg">⚡</span> Simulate Failure / Reset</button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {equipment.map(item => (
          <div key={item.id} className={`p-3 rounded-lg flex justify-between items-center transition-all duration-300 ${item.status === 'Offline' ? 'bg-red-900/50 border border-red-700' : 'bg-gray-700/50'}`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">{getTypeIcon(item.type)}</span>
              <div>
                <p className={`font-semibold transition-colors ${item.status === 'Offline' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{item.name}</p>
                <p className={`text-xs transition-colors font-bold ${item.status === 'Offline' ? 'text-red-400' : 'text-gray-400'}`}>{item.status === 'Offline' ? 'OFFLINE' : item.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                {item.status === 'Offline' && (
                    <button onClick={() => onGetTroubleshooting(item)} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors" title="Troubleshoot with AI"><BotIcon className="w-4 h-4 text-white"/></button>
                )}
                <button
                  onClick={() => onToggle(item.id, item.on)}
                  disabled={item.status === 'Offline'}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${item.on ? 'bg-green-500' : 'bg-gray-600'} ${item.status === 'Offline' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${item.on ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
