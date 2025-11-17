
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

export interface Equipment {
  id: string;
  name: string;
  type: 'Audio' | 'Lighting' | 'Video';
  on: boolean;
}

// VOG (Voice of God) Types
export type VOGPreset = 'GOD-THUNDER' | 'HALL-ANNOUNCE' | 'WHISPER-COMMAND';

export interface VOGParams {
  bloom_scale: number;
  climax_threshold: number;
  ambient_glow: number;
  color_shift: number;
  wave_speed: number;
}

export interface VOGRequest {
  cue_id?: string;
  text: string;
  preset?: VOGPreset;
  voice?: string;
  priority?: 'immediate' | 'standard' | 'background';
  target?: string;
  webhook_url?: string;
}

export interface VOGResponse {
  status: 'queued' | 'rendering' | 'ready' | 'error';
  cue_id: string;
  url?: string;
  message?: string;
  estimated_duration?: number;
}
