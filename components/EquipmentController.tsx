
import React from 'react';
import type { Equipment } from '../types';

interface EquipmentControllerProps {
    equipment: Equipment[];
    setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

export const EquipmentController: React.FC<EquipmentControllerProps> = ({ equipment, setEquipment }) => {

  const handleToggle = (id: string) => {
    setEquipment(prevEquipment =>
      prevEquipment.map(item =>
        item.id === id ? { ...item, on: !item.on } : item
      )
    );
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
              onClick={() => handleToggle(item.id)}
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
