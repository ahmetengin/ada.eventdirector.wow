
import React, { useState } from 'react';
import type { VisualizerSettings, VisualizerStyle, VisualizerColorScheme, VisualizerColorSchemeDetails } from '../types';
import { VISUALIZER_STYLE_OPTIONS } from '../constants';
import { SparkleIcon } from './icons/SparkleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface VisualizerControlsProps {
  settings: VisualizerSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  onGenerateTheme: (prompt: string) => Promise<void>;
  colorSchemes: Record<string, VisualizerColorSchemeDetails>;
}

export const VisualizerControls: React.FC<VisualizerControlsProps> = ({ settings, setSettings, onGenerateTheme, colorSchemes }) => {
  const [themePrompt, setThemePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStyleChange = (style: VisualizerStyle) => {
    setSettings(prev => ({ ...prev, style }));
  };

  const handleColorChange = (colorScheme: VisualizerColorScheme) => {
    setSettings(prev => ({ ...prev, colorScheme }));
  };

  const handleGenerateClick = async () => {
    if (!themePrompt.trim()) return;
    setIsGenerating(true);
    await onGenerateTheme(themePrompt);
    setThemePrompt('');
    setIsGenerating(false);
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
        <div className="pt-4 border-t border-gray-700">
          <label htmlFor="theme-generate" className="block text-sm font-medium text-gray-300 mb-1">Generate AI Theme</label>
            <div className="flex space-x-2">
                <input id="theme-generate" type="text" value={themePrompt} onChange={(e) => setThemePrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()} placeholder="e.g., Ocean sunset" className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={handleGenerateClick} disabled={!themePrompt.trim() || isGenerating} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                     {isGenerating ? <SpinnerIcon className="w-5 h-5"/> : <SparkleIcon className="w-5 h-5"/>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
