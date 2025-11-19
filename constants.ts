import type { ScriptItem, Device, VoiceName, VoiceSpeed, Equipment, EquipmentPreset, EventStatus, LightingCue, VisualizerStyle, VisualizerColorScheme, VisualizerColorSchemeDetails, SocialPost } from './types';
import React from 'react';
import { LiveIcon } from './components/icons/LiveIcon';
import { IntermissionIcon } from './components/icons/IntermissionIcon';
import { ConcludedIcon } from './components/icons/ConcludedIcon';
import { WarningIcon } from './components/icons/WarningIcon';
import { StartingSoonIcon } from './components/icons/StartingSoonIcon';

export const INITIAL_SCRIPT: ScriptItem[] = [
  { id: 1, text: "Good evening from Hollywood, and welcome to the 97th Academy Awards. Please silence your mobile devices.", linkedCue: 'House Lights Dim' },
  { id: 2, text: "The show will begin momentarily. Please take your seats." },
  { id: 3, text: "And now, to present the award for Best Cinematography, please welcome our esteemed presenters." },
  { id: 4, text: "We will now pause for a commercial break. We'll be right back." },
  { id: 5, text: "Please welcome to the stage, a live performance of the Oscar-nominated song..." },
  { id: 6, text: "In Memoriam: Let's take a moment to honor the incredible artists and filmmakers we lost this year." },
  { id: 7, text: "The tension is palpable. The award for Best Picture is up next." },
  { id: 8, text: "Congratulations to all our winners and nominees. This concludes the 97th Academy Awards. Goodnight!" },
];

export const MOCK_DEVICES: Device[] = [
  { id: 'aud-01', name: 'Dolby Theatre PA Mixer', brand: 'Dolby', model: 'IMS3000', type: 'Audio', status: 'Online' },
  { id: 'aud-02', name: 'Orchestra Pit Mics', brand: 'Neumann', model: 'U87', type: 'Audio', status: 'Online' },
  { id: 'vid-01', name: 'Main Stage LED Screen', brand: 'ROE Visual', model: 'Ruby R2.3', type: 'Video', status: 'Online' },
  { id: 'vid-02', name: 'Broadcast Truck Uplink 1', brand: 'NEP', model: 'EN1', type: 'Video', status: 'Online' },
  { id: 'light-01', name: 'Robe Followspot Array', brand: 'Robe', model: 'RoboSpot', type: 'Lighting', status: 'Online' },
  { id: 'ai-m4-core-01', name: 'Mac Mini M4 (AI Core)', brand: 'Apple', model: 'Mac Mini M4', type: 'AI', status: 'Online' },
  { id: 'ai-m3-client-01', name: 'MacBook Air M3 (Director Client)', brand: 'Apple', model: 'MacBook Air M3', type: 'AI', status: 'Online' },
  { id: 'aud-03', name: 'Presenter Lavalier Mic 5', brand: 'Shure', model: 'Axient Digital', type: 'Audio', status: 'Offline' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
    { id: 'ctrl-light-01', name: 'ETC Source Four Pars (House)', brand: 'ETC', model: 'Source Four', type: 'Lighting', on: true, status: 'Online' },
    { id: 'ctrl-light-02', name: 'Robe BMFL Spots (Movers)', brand: 'Robe', model: 'BMFL Spot', type: 'Lighting', on: false, status: 'Online' },
    { id: 'ctrl-aud-01', name: 'Yamaha CL5 Digital Mixer (Playback)', brand: 'Yamaha', model: 'CL5', type: 'Audio', on: true, status: 'Online' },
    { id: 'ctrl-vid-01', name: "Teleprompter Feed (Main)", brand: 'Autoscript', model: 'EPIC-IP19', type: 'Video', on: true, status: 'Online' },
    { id: 'ctrl-stage-01', name: 'Revolving Stage Control', brand: 'Gala Systems', model: 'Spiralift', type: 'Video', on: false, status: 'Online' },
    { id: 'ctrl-ai-01', name: 'AI Processing Core (M4)', brand: 'Apple', model: 'Mac Mini', type: 'AI', on: true, status: 'Online' },
    { id: 'ctrl-ai-02', name: 'AI Theme Engine (Gemini)', brand: 'Google', model: 'Gemini Pro', type: 'AI', on: true, status: 'Online' },
    { id: 'ctrl-vid-02', name: 'Resolume Arena Media Server', brand: 'Resolume', model: 'Arena 7', type: 'Video', on: true, status: 'Online' },
    { id: 'ctrl-vid-03', name: 'Video Wall Panels (Main)', brand: 'ROE Visual', model: 'Ruby R2.3', type: 'Video', on: true, status: 'Online' },
    { id: 'ctrl-vid-04', name: 'Side Wing Screens (Left)', brand: 'ROE Visual', model: 'CB5', type: 'Video', on: true, status: 'Online' },
    { id: 'ctrl-vid-05', name: 'Side Wing Screens (Right)', brand: 'ROE Visual', model: 'CB5', type: 'Video', on: true, status: 'Online' },
];

export const INITIAL_PRESETS: EquipmentPreset[] = [
  { name: 'Award Ceremony Start', settings: { 'ctrl-light-01': true, 'ctrl-light-02': true, 'ctrl-aud-01': true, 'ctrl-vid-01': true, 'ctrl-stage-01': false, 'ctrl-ai-01': true, 'ctrl-ai-02': true, 'ctrl-vid-02': true, 'ctrl-vid-03': true, 'ctrl-vid-04': true, 'ctrl-vid-05': true } },
  { name: 'Panel Discussion', settings: { 'ctrl-light-01': true, 'ctrl-light-02': false, 'ctrl-aud-01': true, 'ctrl-vid-01': true, 'ctrl-stage-01': false, 'ctrl-ai-01': true, 'ctrl-ai-02': true, 'ctrl-vid-02': true, 'ctrl-vid-03': true, 'ctrl-vid-04': false, 'ctrl-vid-05': false } },
  { name: 'Intermission', settings: { 'ctrl-light-01': true, 'ctrl-light-02': false, 'ctrl-aud-01': true, 'ctrl-vid-01': false, 'ctrl-stage-01': false, 'ctrl-ai-01': true, 'ctrl-ai-02': true, 'ctrl-vid-02': true, 'ctrl-vid-03': true, 'ctrl-vid-04': true, 'ctrl-vid-05': true } },
  { name: 'Phantom of the Opera', settings: { 'ctrl-light-01': false, 'ctrl-light-02': true, 'ctrl-aud-01': true, 'ctrl-vid-01': false, 'ctrl-stage-01': true, 'ctrl-ai-01': true, 'ctrl-ai-02': true, 'ctrl-vid-02': true, 'ctrl-vid-03': false, 'ctrl-vid-04': false, 'ctrl-vid-05': false } },
  { name: 'All Systems Off', settings: { 'ctrl-light-01': false, 'ctrl-light-02': false, 'ctrl-aud-01': false, 'ctrl-vid-01': false, 'ctrl-stage-01': false, 'ctrl-ai-01': false, 'ctrl-ai-02': false, 'ctrl-vid-02': false, 'ctrl-vid-03': false, 'ctrl-vid-04': false, 'ctrl-vid-05': false } }
];

export const VOICE_OPTIONS: { value: VoiceName, label: string, pitch: number }[] = [
    { value: 'Zephyr', label: 'Narrator (Deep, Cinematic)', pitch: -4.0 },
    { value: 'Charon', label: 'Presenter (Rich, Male)', pitch: -2.0 },
    { value: 'Kore', label: 'Announcer (Clear, Female)', pitch: 0.0 },
    { value: 'Puck', label: 'Host (Youthful, Energetic)', pitch: 4.0 },
    { value: 'Fenrir', label: 'Guide (Powerful, Male)', pitch: -6.0 },
];

export const SPEED_OPTIONS: { value: VoiceSpeed, label: string }[] = [
    { value: 'slow', label: 'Slow' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Fast' },
];

export const STATUS_CONFIG: Record<EventStatus, { label: string; icon: React.FC<{className?: string}>; color: string; pulse?: boolean }> = {
  'Starting Soon': { label: 'Starting Soon', icon: StartingSoonIcon, color: 'border-yellow-500 text-yellow-400', pulse: false },
  'Live': { label: 'Live', icon: LiveIcon, color: 'border-red-500 text-red-400', pulse: true },
  'Intermission': { label: 'Intermission', icon: IntermissionIcon, color: 'border-cyan-500 text-cyan-400', pulse: false },
  'Concluded': { label: 'Concluded', icon: ConcludedIcon, color: 'border-gray-500 text-gray-400', pulse: false },
  'Technical Difficulties': { label: 'Tech Issues', icon: WarningIcon, color: 'border-orange-500 text-orange-400', pulse: true },
};

export const INITIAL_LIGHTING_CUES: LightingCue[] = [
    { name: 'House Lights Dim', settings: { 'ctrl-light-01': true, 'ctrl-light-02': false } },
    { name: 'Stage Blackout', settings: { 'ctrl-light-01': false, 'ctrl-light-02': false } },
    { name: 'Winner Spotlight', settings: { 'ctrl-light-01': false, 'ctrl-light-02': true } },
    { name: 'Audience Blinders', settings: { 'ctrl-light-01': true, 'ctrl-light-02': true } },
    { name: "Phantom's Lair", settings: { 'ctrl-light-01': false, 'ctrl-light-02': true } }
];

export const INITIAL_VISUALIZER_COLOR_SCHEMES: Record<string, VisualizerColorSchemeDetails> = {
  gold: { name: 'Gold', base: '#facc15', highlight: '#fde047', shadow: '#facc15', idleBase: '#ca8a04', idleHighlight: '#eab308' },
  cyan: { name: 'Cyan', base: '#06b6d4', highlight: '#67e8f9', shadow: '#06b6d4', idleBase: '#0e7490', idleHighlight: '#22d3ee' },
  ember: { name: 'Ember', base: '#f97316', highlight: '#fb923c', shadow: '#ef4444', idleBase: '#dc2626', idleHighlight: '#f97316' },
  toxic: { name: 'Toxic', base: '#84cc16', highlight: '#a3e635', shadow: '#4ade80', idleBase: '#16a34a', idleHighlight: '#84cc16' },
};

export const VISUALIZER_STYLE_OPTIONS: { value: VisualizerStyle; label: string }[] = [
    { value: 'wave', label: 'Waveform' },
    { value: 'bars', label: 'Frequency Bars' },
];

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  { id: 1, author: 'CinephileMax', handle: 'MaxMovies', text: 'The opening monologue was hilarious! This is already better than last year. #Oscars2025', avatar: 'https://i.pravatar.cc/48?u=MaxMovies' },
  { id: 2, author: 'AwardsWatch', handle: 'AwardsGuru', text: 'Cinematography award going to "Dune: Prophecy" was a total shocker. I thought "Starlight" had it for sure.', avatar: 'https://i.pravatar.cc/48?u=AwardsGuru' },
  { id: 3, author: 'Jenny L.', handle: 'jennylovesfilms', text: "The fashion on the red carpet is absolutely stunning tonight. So many bold choices! ✨ #Oscars", avatar: 'https://i.pravatar.cc/48?u=jennylovesfilms' },
  { id: 4, author: 'Tom Critic', handle: 'CriticalTom', text: 'Is it just me or is the pacing a bit slow tonight? Hopefully it picks up soon.', avatar: 'https://i.pravatar.cc/48?u=CriticalTom' },
  { id: 5, author: 'Stacy', handle: 'stacyreacts', text: "OMG that musical performance was incredible! Gave me goosebumps. Best part of the show so far! #Oscars2025", avatar: 'https://i.pravatar.cc/48?u=stacyreacts' },
  { id: 6, author: 'FilmBuffBrian', handle: 'brianwatches', text: "The 'In Memoriam' segment was beautifully done. A touching tribute to some true legends we lost. 💔", avatar: 'https://i.pravatar.cc/48?u=brianwatches' }
];