import React from 'react';
import type { VoiceSettings, VoiceName, VoiceSpeed } from '../types';
import { VOICE_OPTIONS, SPEED_OPTIONS } from '../constants';

interface VoiceControlsProps {
  settings: VoiceSettings;
  setSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ settings, setSettings }) => {
  const handleSettingChange = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = e.target.value as VoiceName;
    const selectedVoiceOption = VOICE_OPTIONS.find(option => option.value === selectedVoiceName);
    if (selectedVoiceOption) {
        setSettings(prev => ({
            ...prev,
            voiceName: selectedVoiceOption.value,
            pitch: selectedVoiceOption.pitch,
        }));
    }
  };

  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const controlClass = "w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors";

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
      <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">Voice Controls</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="voice-name" className={labelClass}>Voice (Pitch & Tone)</label>
          <select
            id="voice-name"
            value={settings.voiceName}
            onChange={handleVoiceChange}
            className={controlClass}
          >
            {VOICE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="voice-speed" className={labelClass}>Speaking Speed</label>
          <select
            id="voice-speed"
            value={settings.speed}
            onChange={(e) => handleSettingChange('speed', e.target.value as VoiceSpeed)}
            className={controlClass}
          >
            {SPEED_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
