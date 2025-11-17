
import type { ScriptItem, Device, VoiceName, VoiceSpeed, Equipment, EquipmentPreset } from './types';

export const INITIAL_SCRIPT: ScriptItem[] = [
  { id: 1, text: "Good evening from Hollywood, and welcome to the 97th Academy Awards. Please silence your mobile devices." },
  { id: 2, text: "The show will begin momentarily. Please take your seats." },
  { id: 3, text: "And now, to present the award for Best Cinematography, please welcome our esteemed presenters." },
  { id: 4, text: "We will now pause for a commercial break. We'll be right back." },
  { id: 5, text: "Please welcome to the stage, a live performance of the Oscar-nominated song..." },
  { id: 6, text: "In Memoriam: Let's take a moment to honor the incredible artists and filmmakers we lost this year." },
  { id: 7, text: "The tension is palpable. The award for Best Picture is up next." },
  { id: 8, text: "Congratulations to all our winners and nominees. This concludes the 97th Academy Awards. Goodnight!" },
];

export const MOCK_DEVICES: Device[] = [
  { id: 'aud-01', name: 'Dolby Theatre PA Mixer', type: 'Audio', status: 'Online' },
  { id: 'aud-02', name: 'Orchestra Pit Mics', type: 'Audio', status: 'Online' },
  { id: 'vid-01', name: 'Main Stage LED Screen', type: 'Video', status: 'Online' },
  { id: 'vid-02', name: 'Broadcast Truck Uplink 1', type: 'Video', status: 'Online' },
  { id: 'vid-03', name: 'Red Carpet Cam 3', type: 'Video', status: 'Online' },
  { id: 'light-01', name: 'Robe Followspot Array', type: 'Lighting', status: 'Online' },
  { id: 'light-02', name: 'Grand Chandelier Lights', type: 'Lighting', status: 'Online' },
  { id: 'ai-ada-01', name: 'AI Subtitle & Translation Node', type: 'AI', status: 'Online' },
  { id: 'aud-03', name: 'Presenter Lavalier Mic 5', type: 'Audio', status: 'Offline' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
    { id: 'ctrl-light-01', name: 'House Lights (Dim for Show)', type: 'Lighting', on: false },
    { id: 'ctrl-light-02', name: 'Audience Blinders', type: 'Lighting', on: false },
    { id: 'ctrl-aud-01', name: 'Orchestra Play-off Music', type: 'Audio', on: false },
    { id: 'ctrl-vid-01', name: "Winner's Teleprompter", type: 'Video', on: true },
    { id: 'ctrl-stage-01', name: 'Revolving Stage Control', type: 'Video', on: true },
];

export const INITIAL_PRESETS: EquipmentPreset[] = [
  {
    name: 'Award Ceremony Start',
    settings: {
      'ctrl-light-01': true,
      'ctrl-light-02': false,
      'ctrl-aud-01': true,
      'ctrl-vid-01': true,
      'ctrl-stage-01': true,
    }
  },
  {
    name: 'Panel Discussion',
    settings: {
      'ctrl-light-01': false,
      'ctrl-light-02': false,
      'ctrl-aud-01': false,
      'ctrl-vid-01': false,
      'ctrl-stage-01': false,
    }
  },
    {
    name: 'Intermission',
    settings: {
      'ctrl-light-01': false,
      'ctrl-light-02': false,
      'ctrl-aud-01': true,
      'ctrl-vid-01': false,
      'ctrl-stage-01': false,
    }
  },
  {
    name: 'All Systems Off',
    settings: {
      'ctrl-light-01': false,
      'ctrl-light-02': false,
      'ctrl-aud-01': false,
      'ctrl-vid-01': false,
      'ctrl-stage-01': false,
    }
  }
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
