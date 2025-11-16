
import type { ScriptItem, Device, VoiceName, VoiceSpeed } from './types';

export const INITIAL_SCRIPT: ScriptItem[] = [
  { id: 1, text: "Ladies and gentlemen, welcome to the grand opening. Please take your seats." },
  { id: 2, text: "We are thrilled to have you here. The show will begin in five minutes." },
  { id: 3, text: "Now, please welcome to the stage, our keynote speaker." },
  { id: 4, text: "That was an insightful presentation. We will now have a short 15-minute break." },
  { id: 5, text: "I'd also like to introduce my co-director, Ada. She will be assisting with real-time speech interpretation." },
  { id: 6, text: "Thank you all for coming. We hope you enjoyed the event. Have a safe journey home." },
];

export const MOCK_DEVICES: Device[] = [
  { id: 'aud-01', name: 'Main Mixer', type: 'Audio', status: 'Online' },
  { id: 'aud-02', name: 'Stage Monitors', type: 'Audio', status: 'Online' },
  { id: 'vid-01', name: 'Center Video Wall', type: 'Video', status: 'Online' },
  { id: 'vid-02', name: 'Left Video Wall', type: 'Video', status: 'Online' },
  { id: 'vid-03', name: 'Right Video Wall', type: 'Video', status: 'Online' },
  { id: 'light-01', name: 'Stage Light Rig A', type: 'Lighting', status: 'Online' },
  { id: 'light-02', name: 'House Lights', type: 'Lighting', status: 'Online' },
  { id: 'ai-ada-01', name: 'ADA Interpreter Node', type: 'AI', status: 'Online' },
  { id: 'aud-03', name: 'Backup Mic', type: 'Audio', status: 'Offline' },
];

export const VOICE_OPTIONS: { value: VoiceName, label: string }[] = [
    { value: 'Fenrir', label: 'Fenrir (Deep, Cinematic)' },
    { value: 'Zephyr', label: 'Zephyr (Standard, Male)' },
    { value: 'Kore', label: 'Kore (Standard, Female)' },
    { value: 'Puck', label: 'Puck (Youthful)' },
    { value: 'Charon', label: 'Charon (Calm, Mature)' },
];

export const SPEED_OPTIONS: { value: VoiceSpeed, label: string }[] = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' },
];