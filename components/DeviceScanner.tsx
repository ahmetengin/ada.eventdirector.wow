
import React, { useState } from 'react';
import type { Device } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MOCK_DEVICES } from '../constants';

interface DeviceScannerProps {
    devices: Device[];
    setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export const DeviceScanner: React.FC<DeviceScannerProps> = ({ devices, setDevices }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setDevices([]);
    setTimeout(() => {
      setDevices(MOCK_DEVICES);
      setIsScanning(false);
    }, 3000);
  };
  
  const getStatusColor = (status: 'Online' | 'Offline') => {
      return status === 'Online' ? 'text-green-400' : 'text-red-500';
  }

  const getTypeIcon = (type: 'Audio' | 'Lighting' | 'Video' | 'AI') => {
    switch(type) {
        case 'Audio': return '🔊';
        case 'Lighting': return '💡';
        case 'Video': return '📺';
        case 'AI': return '🤖';
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg h-full border border-gray-700">
      <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">Network Devices</h2>
      <button
        onClick={handleScan}
        disabled={isScanning}
        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
      >
        {isScanning && <SpinnerIcon className="mr-2" />}
        {isScanning ? 'Scanning...' : 'Scan Network'}
      </button>

      <div className="mt-6 space-y-3 max-h-96 overflow-y-auto pr-2">
        {isScanning && (
            <div className="text-center text-gray-400 p-4">
                <p>Discovering devices on network...</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className="bg-cyan-500 h-2.5 rounded-full animate-pulse"></div>
                </div>
            </div>
        )}
        {devices.map(device => (
          <div key={device.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl mr-3">{getTypeIcon(device.type)}</span>
              <div>
                <p className="font-semibold text-gray-200">{device.name}</p>
                <p className="text-xs text-gray-400">{device.type}</p>
              </div>
            </div>
            <span className={`font-bold text-sm ${getStatusColor(device.status)}`}>
              {device.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};