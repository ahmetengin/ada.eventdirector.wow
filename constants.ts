
import type { ScriptItem, Device, VoiceName, VoiceSpeed, Equipment, EquipmentPreset, EventStatus, LightingCue, VisualizerStyle, VisualizerColorScheme, VisualizerColorSchemeDetails, SocialPost } from './types';
import React from 'react';
import { LiveIcon } from './components/icons/LiveIcon';
import { IntermissionIcon } from './components/icons/IntermissionIcon';
import { ConcludedIcon } from './components/icons/ConcludedIcon';
import { WarningIcon } from './components/icons/WarningIcon';
import { StartingSoonIcon } from './components/icons/StartingSoonIcon';

export const INITIAL_SCRIPT: ScriptItem[] = [
  { id: 1, text: "[Announcer 1]: Ladies and gentlemen, please take your seats. The 97th Academy Awards will begin in two minutes.", linkedCue: 'House Lights Dim' },
  { id: 2, text: "[Announcer 2]: Kicking off the night with a high-energy performance, please welcome our first musical guest: The Neon Hearts!", linkedCue: 'Concert Mode (Band)' },
  { id: 3, text: "[Announcer 1]: Live from the Dolby Theatre in Hollywood... hosted by Jimmy Kimmel!", linkedCue: 'Stage Blackout' },
  { id: 4, text: "[Host]: Welcome! Tonight we honor 12 categories of cinematic excellence, celebrating the films that moved us this year.", linkedCue: 'Winner Spotlight' },
  { id: 5, text: "[Announcer 2]: Presenting the award for Best Sound. Watch the nominees on the main screen.", linkedCue: 'Stage Blackout' },
  { id: 6, text: "[Announcer 1]: And the Oscar goes to... 'Dune: Prophecy'. Accepting the award, the sound design team.", linkedCue: 'Oscar Sculptures Mode' },
  { id: 7, text: "[Winner Speech]: This is incredible. Thank you to the Academy and our director for the vision.", linkedCue: 'Award Presentation' },
  { id: 8, text: "[Announcer 2]: Please welcome the world-renowned performance group, 'The Illumination Troupe', for a special gravity-defying stage show!", linkedCue: 'Laser Show Intro' },
  { id: 9, text: "[Announcer 1]: Please welcome to the stage, singing the nominated song from 'Skyward', the incredible Aria Vance!", linkedCue: 'Concert Mode (Solo)' },
  { id: 10, text: "[Announcer 2]: Moving to our next category: Best Visual Effects. Here are the nominees.", linkedCue: 'Stage Blackout' },
  { id: 11, text: "[Announcer 1]: The Oscar goes to 'Avatar: The Next Horizon'. Accepting the award, the VFX supervisors.", linkedCue: 'Oscar Sculptures Mode' },
  { id: 12, text: "[Winner Speech]: We share this with the thousands of artists who made this possible.", linkedCue: 'Award Presentation' },
  { id: 13, text: "[Announcer 2]: And now, a special moment. Please welcome a true legend of cinema to present our tribute: Harrison Ford!", linkedCue: 'Winner Spotlight' },
  { id: 14, text: "[Celebrity Guest]: It is an honor to stand here among the next generation of storytellers...", linkedCue: 'Award Presentation' },
  { id: 15, text: "[Announcer 1]: For our final performance tonight, give it up for the legendary rock band, Eclipsed!", linkedCue: 'Concert Mode (Band)' },
  { id: 16, text: "[Announcer 2]: Goodnight everyone! See you at the Governors Ball.", linkedCue: 'House Lights Dim' },
];

export const MOCK_DEVICES: Device[] = [
  { 
      id: 'ai-m4-core-01', 
      name: 'Mac Mini M4 (AI Core)', 
      brand: 'Apple', 
      model: 'Mac Mini M4', 
      type: 'AI', 
      status: 'Online',
      ip: '10.0.1.2',
      capabilities: [
          { name: 'Orchestrator', description: 'Main event loop control', schema: 'system.orchestrate' },
          { name: 'LLM Inference', description: 'Local LLM processing', schema: 'ai.generate' }
      ]
  },
  { 
      id: 'aud-mix-01', 
      name: 'Yamaha Rivage Engine', 
      brand: 'Yamaha', 
      model: 'DSP-RX', 
      type: 'Audio', 
      status: 'Online',
      ip: '10.0.2.10',
      capabilities: [
          { name: 'Fader Bank A', description: 'Channels 1-24', schema: 'audio.fader(1-24)' },
          { name: 'Fader Bank B', description: 'Channels 25-48', schema: 'audio.fader(25-48)' },
          { name: 'Dante Patch', description: 'Network Audio Patching', schema: 'audio.patch()' }
      ]
  },
  { 
      id: 'cam-ccu-01', 
      name: 'Sony CCU Rack', 
      brand: 'Sony', 
      model: 'HDCU-5500', 
      type: 'Video', 
      status: 'Online',
      ip: '10.0.4.5',
      capabilities: [
          { name: 'Iris Control', description: 'Remote Iris', schema: 'cam.iris(id, val)' },
          { name: 'Black Balance', description: 'Auto Black', schema: 'cam.blackBal(id)' }
      ]
  },
  { 
      id: 'jib-ctrl-01', 
      name: 'Stanton Jib Controller', 
      brand: 'Stanton', 
      model: 'Jimmy Jib Triangle', 
      type: 'Video', 
      status: 'Online',
      ip: '10.0.4.12',
      capabilities: [
          { name: 'Swing/Tilt', description: 'Robotic Head Control', schema: 'jib.move(x,y)' },
          { name: 'Zoom/Focus', description: 'Lens Control', schema: 'lens.set(z,f)' }
      ]
  },
  { 
      id: 'lazer-ctrl-01', 
      name: 'Laser Animation Server', 
      brand: 'Pangolin', 
      model: 'Beyond Ultimate', 
      type: 'Lighting', 
      status: 'Online',
      ip: '10.0.3.20',
      capabilities: [
          { name: 'Zone Safety', description: 'Audience Scanning Safety', schema: 'laser.safety()' },
          { name: 'Pattern Select', description: 'ILDA Pattern', schema: 'laser.pattern(id)' }
      ]
  },
  { 
      id: 'auto-winch-01', 
      name: 'Automation Controller', 
      brand: 'Stage Technologies', 
      model: 'Nomad', 
      type: 'Lighting', 
      status: 'Online',
      ip: '10.0.5.5',
      capabilities: [
          { name: 'Winch Move', description: 'Aerial Performer Lift', schema: 'winch.goto(pos)' },
          { name: 'E-Stop', description: 'Emergency Stop', schema: 'sys.estop()' }
      ]
  },
  { 
      id: 'ai-m3-client-01', 
      name: 'MacBook Air M3 (Director Client)', 
      brand: 'Apple', 
      model: 'MacBook Air M3', 
      type: 'AI', 
      status: 'Online',
      ip: '10.0.1.15',
      capabilities: [
          { name: 'Remote Shell', description: 'SSH Tunnel', schema: 'system.ssh' }
      ]
  },
];

export const MOCK_EQUIPMENT: Equipment[] = [
    // AI & Control
    { id: 'ctrl-ai-01', name: 'AI Processing Core (M4)', brand: 'Apple', model: 'Mac Mini', type: 'AI', on: true, status: 'Online' },
    
    // Audio (Yamaha 48ch, Mics, Speakers)
    { id: 'aud-mix-01', name: 'Main Console (48ch)', brand: 'Yamaha', model: 'Rivage PM7', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-mic-podium', name: 'Podium Mics (Primary/Backup)', brand: 'Schoeps', model: 'MK41', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-mic-orch', name: 'Orchestra Array (20ch)', brand: 'DPA', model: '4099', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-mic-lavs', name: 'Wireless Lav Rack (20ch)', brand: 'Shure', model: 'Axient Digital', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-mic-perf', name: 'Performance Handhelds (RF)', brand: 'Sennheiser', model: 'Digital 6000', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-backline', name: 'Band Backline & Amps', brand: 'Fender/Marshall', model: 'Custom', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-spk-main', name: 'Main Arrays L/R (20 elements)', brand: 'L-Acoustics', model: 'K2', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-spk-subs', name: 'Subwoofer Array', brand: 'L-Acoustics', model: 'KS28', type: 'Audio', on: true, status: 'Online' },
    { id: 'aud-spk-mon', name: 'Stage Monitors (Wedges)', brand: 'd&b audiotechnik', model: 'M4', type: 'Audio', on: false, status: 'Online' },

    // Video (Cameras, Jibs, Screens)
    { id: 'vid-cam-01', name: 'Camera 1 (Wide)', brand: 'Sony', model: 'Venice 2', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-cam-02', name: 'Camera 2 (Tight Center)', brand: 'Sony', model: 'Venice 2', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-cam-03', name: 'Camera 3 (Audience L)', brand: 'Sony', model: 'Venice 2', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-cam-04', name: 'Camera 4 (Audience R)', brand: 'Sony', model: 'Venice 2', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-cam-05', name: 'Camera 5 (Steadicam)', brand: 'Sony', model: 'Venice 2', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-jib-01', name: 'Jimmy Jib 1 (House Left)', brand: 'Stanton', model: 'Triangle Pro', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-jib-02', name: 'Jimmy Jib 2 (Stage Right)', brand: 'Stanton', model: 'Triangle Pro', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-srv-01', name: 'Media Server Main', brand: 'Resolume', model: 'Arena Server', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-wall-main', name: '8-Panel LED Wall (Main)', brand: 'ROE', model: 'Ruby', type: 'Video', on: true, status: 'Online' },
    { id: 'vid-wall-wings', name: 'Wing LED Screens (L/R)', brand: 'ROE', model: 'Carbon', type: 'Video', on: true, status: 'Online' },

    // Lighting & FX (Lasers, Movers, Scenic, Automation)
    { id: 'lgt-console', name: 'Lighting Console', brand: 'MA Lighting', model: 'GrandMA3', type: 'Lighting', on: true, status: 'Online' },
    { id: 'lgt-movers', name: 'Moving Head Rig (Spot/Wash)', brand: 'Robe', model: 'BMFL/Spiider', type: 'Lighting', on: false, status: 'Online' },
    { id: 'lgt-laser', name: 'Laser System (4 Units)', brand: 'Kvant', model: 'Clubmax 6000', type: 'Lighting', on: false, status: 'Online' },
    { id: 'lgt-haze', name: 'Haze Generators (x4)', brand: 'MDG', model: 'Atmosphere', type: 'Lighting', on: true, status: 'Online' },
    { id: 'scn-oscar', name: 'Scenic: Oscar Sculptures', brand: 'Custom', model: 'Gold LED', type: 'Lighting', on: true, status: 'Online' },
    { id: 'scn-winch', name: 'Aerial Winch System', brand: 'Stage Tech', model: 'High Speed', type: 'Lighting', on: false, status: 'Online' },
];

export const INITIAL_PRESETS: EquipmentPreset[] = [
  { 
      name: 'Award Presentation', 
      settings: { 
          'aud-mic-podium': true, 'aud-mic-lavs': false, 'aud-spk-main': true,
          'vid-cam-01': true, 'vid-cam-02': true, 'vid-jib-01': true, 
          'vid-wall-main': true, 'vid-wall-wings': true, 'lgt-movers': true, 'lgt-laser': false, 'scn-oscar': true 
      } 
  },
  { 
      name: 'Orchestra Performance', 
      settings: { 
          'aud-mic-podium': false, 'aud-mic-orch': true, 'aud-spk-main': true,
          'vid-cam-01': true, 'vid-jib-01': true, 'vid-jib-02': true,
          'lgt-movers': true, 'lgt-laser': false, 'vid-wall-wings': true
      } 
  },
  { 
      name: 'Concert Mode (Band)', 
      settings: { 
          'aud-mic-podium': false, 'aud-mic-perf': true, 'aud-backline': true, 'aud-spk-main': true, 'aud-spk-subs': true,
          'vid-wall-main': true, 'vid-wall-wings': true, 'lgt-movers': true, 'lgt-laser': true, 'scn-oscar': false, 'lgt-haze': true
      } 
  },
  { 
      name: 'Laser Show Intro', 
      settings: { 
          'aud-mic-podium': false, 'aud-spk-main': true, 'aud-spk-subs': true,
          'vid-wall-main': true, 'vid-wall-wings': true, 'lgt-movers': true, 'lgt-laser': true, 'scn-oscar': true, 'lgt-haze': true
      } 
  },
  { 
      name: 'Stage Show (Aerial)', 
      settings: { 
          'aud-spk-main': true, 'vid-wall-main': true, 'vid-wall-wings': true, 'lgt-movers': true, 
          'lgt-haze': true, 'scn-winch': true, 'vid-cam-05': true
      } 
  },
  { 
      name: 'Phantom of the Opera', 
      settings: { 
          'aud-mic-podium': false, 'aud-mic-lavs': true, 'aud-spk-main': true,
          'vid-jib-01': true, 'lgt-movers': true, 'lgt-laser': false, 'scn-oscar': false, 'lgt-haze': true, 'vid-wall-wings': false
      } 
  },
  { 
      name: 'Scenario 3', 
      settings: { 
          'aud-mic-podium': true, 'aud-spk-main': true, 'vid-wall-main': true, 'vid-wall-wings': true,
          'lgt-movers': true, 'lgt-laser': false, 'vid-cam-01': true
      } 
  },
  { 
      name: 'Blue Laser Atmosphere', 
      settings: { 
          'lgt-movers': false, 'scn-oscar': false, 'vid-wall-main': false, 'vid-wall-wings': false,
          'lgt-haze': true, 'lgt-laser': true, 'aud-spk-main': true, 'aud-spk-subs': true
      } 
  },
  { 
      name: 'All Systems Off', 
      settings: { 
          'aud-mix-01': false, 'vid-wall-main': false, 'vid-wall-wings': false, 'lgt-console': false, 'lgt-laser': false, 'lgt-haze': false
      } 
  }
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
    { name: 'Stage Blackout', settings: { 'ctrl-light-01': false, 'ctrl-light-02': false, 'vid-wall-main': false, 'vid-wall-wings': false } },
    { name: 'Winner Spotlight', settings: { 'ctrl-light-01': false, 'ctrl-light-02': true } },
    { name: 'Oscar Sculptures Mode', settings: { 'scn-oscar': true, 'lgt-movers': true } },
    { name: "Phantom's Lair", settings: { 'ctrl-light-01': false, 'ctrl-light-02': true } },
    { name: "Laser Show Intro", settings: { 'lgt-laser': true, 'lgt-movers': true } },
    { name: "Lasers Up", settings: { 'lgt-laser': true, 'lgt-movers': true, 'lgt-haze': true, 'vid-wall-main': false } },
    { name: "Concert Mode (Band)", settings: { 'lgt-laser': true, 'lgt-movers': true, 'scn-oscar': false } },
    { name: "Concert Mode (Solo)", settings: { 'lgt-laser': false, 'lgt-movers': true, 'scn-oscar': true } },
    { name: "Blue Laser Static", settings: { 'lgt-laser': true, 'lgt-movers': false, 'lgt-haze': true, 'vid-wall-main': false, 'vid-wall-wings': false, 'scn-oscar': false } }
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
