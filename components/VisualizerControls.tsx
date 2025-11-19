

import React from 'react';
import type { VisualizerSettings, VisualizerStyle, VisualizerColorScheme, VisualizerColorSchemeDetails } from '../types';
import { VISUALIZER_STYLE_OPTIONS } from '../constants';
import { SparkleIcon } from './icons/SparkleIcon';

interface VisualizerControlsProps {
  settings: VisualizerSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  colorSchemes: Record<string, VisualizerColorSchemeDetails>;
}

export const VisualizerControls: React.FC<VisualizerControlsProps> = ({ settings, setSettings, colorSchemes }) => {

  const handleStyleChange = (style: VisualizerStyle) => {
    setSettings(prev => ({ ...prev, style }));
  };

  const handleColorChange = (colorScheme: VisualizerColorScheme) => {
    setSettings(prev => ({ ...prev, colorScheme }));
  };

  const buttonBaseClass = "flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const activeButtonClass = "bg-cyan-600 text-white shadow-lg";
  const inactiveButtonClass = "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300";

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">Visualizer Controls</h2>
      <div className="space-y-4">
        <div>
          <h3 className="block text-sm font-medium text-gray-300 mb-2">Style</h3>
          <div className="flex space-x-2">
            {VISUALIZER_STYLE_OPTIONS.map(option => (
              <button key={option.value} onClick={() => handleStyleChange(option.value)} className={`${buttonBaseClass} ${settings.style === option.value ? activeButtonClass : inactiveButtonClass}`}>
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="block text-sm font-medium text-gray-300 mb-2">Color Scheme</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(colorSchemes).map(([key, scheme]) => (
              <button key={key} onClick={() => handleColorChange(key)} className={`${buttonBaseClass} ${settings.colorScheme === key ? activeButtonClass : inactiveButtonClass} flex items-center justify-center gap-2`}>
                {scheme.isAiGenerated && <SparkleIcon className="w-4 h-4 opacity-70" />}
                {scheme.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};