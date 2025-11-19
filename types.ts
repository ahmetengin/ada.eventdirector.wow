export interface ScriptItem {
  id: number;
  text: string;
  linkedCue?: string; // Name of the linked lighting cue
}

export interface Device {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  type: 'Audio' | 'Lighting' | 'Video' | 'AI';
  status: 'Online' | 'Offline';
}

export type VoiceName = 'Zephyr' | 'Charon' | 'Kore' | 'Puck' | 'Fenrir';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface VoiceSettings {
  voiceName: VoiceName;
  speed: VoiceSpeed;
  pitch: number;
}

export interface Equipment {
  id:string;
  name: string;
  brand?: string;
  model?: string;
  type: 'Audio' | 'Lighting' | 'Video' | 'AI';
  on: boolean;
  status: 'Online' | 'Offline';
}

export interface EquipmentPreset {
  name: string;
  settings: Record<string, boolean>; // { [equipmentId]: onState }
}

export interface LightingCue {
    name: string;
    settings: Record<string, boolean>; // { [equipmentId]: onState }
    isAiGenerated?: boolean;
}

export interface TranscriptEntry {
  id: number;
  speaker: 'user' | 'model';
  text: string;
}

export type EventStatus = 'Starting Soon' | 'Live' | 'Intermission' | 'Concluded' | 'Technical Difficulties';

export type VisualizerStyle = 'wave' | 'bars';
export type VisualizerColorScheme = string;

export interface VisualizerSettings {
  style: VisualizerStyle;
  colorScheme: VisualizerColorScheme;
}

export interface VisualizerColorSchemeDetails {
    name: string;
    base: string;
    highlight: string;
    shadow: string;
    idleBase: string;
    idleHighlight: string;
    isAiGenerated?: boolean;
}

export interface GeneratedImage {
    id: string;
    prompt: string;
    url: string; // data URL
}

// FIX: Add EditableImage type for image editing and video generation features.
export interface EditableImage {
    base64: string;
    mimeType: string;
}

export type VideoGenerationStatus = 'idle' | 'generating' | 'polling' | 'success' | 'error';

export interface BackdropContent {
    type: 'image' | 'video';
    url: string;
}

export interface LastGeneratedAssets {
    cue?: LightingCue;
    theme?: { key: string, details: VisualizerColorSchemeDetails };
    image?: GeneratedImage;
    videoUrl?: string;
}

export type BackdropTarget = 'main' | 'left' | 'right' | 'all';

export interface GroundingSource {
    uri: string;
    title?: string;
}

export interface SearchResult {
    text: string;
    sources: GroundingSource[];
}
