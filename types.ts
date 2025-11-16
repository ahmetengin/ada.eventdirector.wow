
export interface ScriptItem {
  id: number;
  text: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'Audio' | 'Lighting' | 'Video' | 'AI';
  status: 'Online' | 'Offline';
}

export type VoiceName = 'Fenrir' | 'Zephyr' | 'Kore' | 'Puck' | 'Charon';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface VoiceSettings {
  voiceName: VoiceName;
  speed: VoiceSpeed;
  tone: string;
}