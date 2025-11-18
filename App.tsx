

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { EventFlow } from './components/EventFlow';
import { DeviceScanner } from './components/DeviceScanner';
import { AudioVisualizer } from './components/AudioVisualizer';
import { VoiceControls } from './components/VoiceControls';
import { EquipmentController } from './components/EquipmentController';
import { Clock } from './components/Clock';
import { Conversation } from './components/Conversation';
import { EventStatus } from './components/EventStatus';
import { EventFeed } from './components/EventFeed';
import { VisualizerControls } from './components/VisualizerControls';
import { AIModal } from './components/AIModal';
import { generateSpeech, generateTextStream, generateScript, startConversation, createPcmBlob, getTroubleshootingSteps, generateLightingCue, generateVisualizerTheme, suggestNextStatus } from './services/geminiService';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { socket } from './services/socketService';
import type { ScriptItem, Device, VoiceSettings, Equipment, EquipmentPreset, TranscriptEntry, EventStatus as EventStatusType, VisualizerSettings, LightingCue, VisualizerColorSchemeDetails } from './types';
import { INITIAL_SCRIPT, MOCK_EQUIPMENT, INITIAL_PRESETS, INITIAL_LIGHTING_CUES, INITIAL_VISUALIZER_COLOR_SCHEMES } from './constants';
// FIX: The 'LiveConnection' type is not exported from '@google/genai'.
import type { LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData } from './utils';

// FIX: The 'LiveConnection' type is not exported from '@google/genai'.
// The session type will be inferred from the `startConversation` function's return type.
type LiveConnection = Awaited<ReturnType<typeof startConversation>>;

export default function App() {
  const [script, setScript] = useState<ScriptItem[]>(INITIAL_SCRIPT);
  const [devices, setDevices] = useState<Device[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [presets, setPresets] = useState<EquipmentPreset[]>(INITIAL_PRESETS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScriptId, setActiveScriptId] = useState<number | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRegeneratingScript, setIsRegeneratingScript] = useState(false);
  const [improvingScriptId, setImprovingScriptId] = useState<number | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceName: 'Zephyr',
    speed: 'normal',
    pitch: -4.0, // Default pitch for Zephyr voice
  });
  const [eventStatus, setEventStatus] = useState<EventStatusType>('Starting Soon');
  const [visualizerSettings, setVisualizerSettings] = useState<VisualizerSettings>({
    style: 'wave',
    colorScheme: 'gold',
  });
  
  // --- AI-Powered State ---
  const [lightingCues, setLightingCues] = useState<LightingCue[]>(INITIAL_LIGHTING_CUES);
  const [visualizerColorSchemes, setVisualizerColorSchemes] = useState<Record<string, VisualizerColorSchemeDetails>>(INITIAL_VISUALIZER_COLOR_SCHEMES);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalContent, setAiModalContent] = useState('');
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [isAiModalLoading, setIsAiModalLoading] = useState(false);
  const [suggestedStatus, setSuggestedStatus] = useState<string | null>(null);


  // --- Live Conversation State ---
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptEntry[]>([]);
  // FIX: Using the inferred 'LiveConnection' type.
  const liveSessionRef = useRef<LiveConnection | null>(null);
  const audioResourcesRef = useRef<{
    stream: MediaStream | null,
    inputAudioContext: AudioContext | null,
    outputAudioContext: AudioContext | null,
    scriptProcessor: ScriptProcessorNode | null,
    source: MediaStreamAudioSourceNode | null,
  }>({ stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, source: null });
  
  const liveAudioQueueRef = useRef<{
    nextStartTime: number,
    sources: Set<AudioBufferSourceNode>,
  }>({ nextStartTime: 0, sources: new Set() });

  useEffect(() => {
    const handleStatusUpdate = (updatedItem: { id: string, on: boolean }) => {
      setEquipment(prevEquipment =>
        prevEquipment.map(item =>
          item.id === updatedItem.id ? { ...item, on: updatedItem.on } : item
        )
      );
    };

    socket.on('equipment-status-update', handleStatusUpdate);

    return () => {
      socket.off('equipment-status-update', handleStatusUpdate);
    };
  }, []);


  const handlePlaybackEnd = useCallback(() => {
      setActiveScriptId(null);
  }, []);

  const { isPlaying, play, stop, analyser } = useAudioPlayer(handlePlaybackEnd);

  const triggerLightingCue = useCallback((cueName: string) => {
    const cue = lightingCues.find(c => c.name === cueName);
    if (!cue) {
        console.warn(`Lighting cue "${cueName}" not found.`);
        return;
    }

    const cueSettings = cue.settings;

    setEquipment(prevEquipment =>
        prevEquipment.map(item => {
            if (item.id in cueSettings) {
                return { ...item, on: cueSettings[item.id] };
            }
            return item;
        })
    );

    Object.entries(cueSettings).forEach(([id, state]) => {
        socket.emit('equipment-command', { id, state });
    });
  }, [lightingCues]);

  const handleSpeak = useCallback(async (item: ScriptItem) => {
    if (isPlaying && activeScriptId === item.id) {
      stop();
      return;
    }

    if (isPlaying) {
      stop();
    }

    if (item.linkedCue) {
        triggerLightingCue(item.linkedCue);
    }
    
    setIsLoading(true);
    setError(null);
    setActiveScriptId(item.id);

    try {
      const audioContent = await generateSpeech(item.text, voiceSettings);
      setIsLoading(false);
      play(audioContent);
    } catch (err) {
      console.error("Error generating speech:", err);
      setError("Failed to generate audio. Please check your API key and network connection.");
      setActiveScriptId(null);
      setIsLoading(false);
    }
  }, [isPlaying, play, stop, activeScriptId, voiceSettings, triggerLightingCue]);

  const handleGenerateScript = useCallback(async (prompt: string) => {
    setIsGeneratingScript(true);
    setError(null);

    const newItemId = Date.now();
    setScript(prevScript => [
      ...prevScript,
      { id: newItemId, text: '' }
    ]);

    try {
      const fullPrompt = `You are an event director for the Oscars. Write a short, clear, and professional announcement for the following request: "${prompt}"`;
      
      await generateTextStream(fullPrompt, (chunkText) => {
        setScript(prevScript =>
          prevScript.map(item =>
            item.id === newItemId ? { ...item, text: item.text + chunkText } : item
          )
        );
      });

    } catch (err) {
      console.error("Error generating script:", err);
      setError("Failed to generate new script item. Please try again.");
      setScript(prevScript => prevScript.filter(item => item.id !== newItemId));
    } finally {
      setIsGeneratingScript(false);
    }
  }, []);

  const handleImproveScript = useCallback(async (itemToImprove: ScriptItem) => {
    setImprovingScriptId(itemToImprove.id);
    setError(null);
    const originalText = itemToImprove.text;
    
    setScript(prevScript =>
      prevScript.map(item =>
        item.id === itemToImprove.id ? { ...item, text: '' } : item
      )
    );

    try {
      const fullPrompt = `You are a professional event announcer for the Oscars. Rephrase the following announcement to make it more grand and cinematic, while keeping it concise: "${originalText}"`;
      
      await generateTextStream(fullPrompt, (chunkText) => {
        setScript(prevScript =>
          prevScript.map(item =>
            item.id === itemToImprove.id ? { ...item, text: item.text + chunkText } : item
          )
        );
      });

    } catch (err) {
      console.error("Error improving script:", err);
      setError("Failed to improve script item. Please try again.");
      setScript(prevScript =>
        prevScript.map(item =>
          item.id === itemToImprove.id ? { ...item, text: originalText } : item
        )
      );
    } finally {
      setImprovingScriptId(null);
    }
  }, []);

  const handleDeleteScript = useCallback((id: number) => {
    setScript(prevScript => prevScript.filter(item => item.id !== id));
  }, []);

  const handleLinkCue = useCallback((scriptId: number, cueName: string | null) => {
    setScript(prevScript =>
        prevScript.map(item =>
            item.id === scriptId ? { ...item, linkedCue: cueName || undefined } : item
        )
    );
  }, []);

  const handleRegenerateFullScript = useCallback(async () => {
    if (!window.confirm("Are you sure you want to regenerate the entire script? This will replace the current one.")) {
        return;
    }
    setIsRegeneratingScript(true);
    setError(null);
    try {
        const fullPrompt = `You are an event director for the Oscars. Write a full 8-item event script of short, clear, and professional announcements. The theme is the Oscars award ceremony.`;
        const newScriptText = await generateScript(fullPrompt);

        const newScript: ScriptItem[] = newScriptText.map((text, index) => ({
            id: Date.now() + index,
            text: text.trim(),
        }));
        
        setScript(newScript);

    } catch (err) {
        console.error("Error regenerating script:", err);
        setError("Failed to regenerate the script. The AI might be busy. Please try again.");
    } finally {
        setIsRegeneratingScript(false);
    }
  }, []);

  const handleEquipmentToggle = useCallback((id: string, currentState: boolean) => {
    setEquipment(prevEquipment =>
      prevEquipment.map(item =>
        item.id === id ? { ...item, on: !currentState } : item
      )
    );
    socket.emit('equipment-command', { id, state: !currentState });
  }, []);

  const handleLoadPreset = useCallback((presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;
    
    const newEquipmentState = equipment.map(item => ({
      ...item,
      on: preset.settings[item.id] ?? item.on,
    }));
    setEquipment(newEquipmentState);
    
    Object.entries(preset.settings).forEach(([id, state]) => {
      socket.emit('equipment-command', { id, state });
    });
  }, [presets, equipment]);

  const handleSavePreset = useCallback((presetName: string) => {
    if (!presetName.trim()) {
      setError("Preset name cannot be empty.");
      return;
    }
    if (presets.some(p => p.name.toLowerCase() === presetName.trim().toLowerCase())) {
      setError(`A preset named "${presetName}" already exists.`);
      return;
    }
    setError(null);

    const newPresetSettings = equipment.reduce((acc, item) => {
      acc[item.id] = item.on;
      return acc;
    }, {} as Record<string, boolean>);

    const newPreset: EquipmentPreset = {
      name: presetName.trim(),
      settings: newPresetSettings,
    };
    
    setPresets(prevPresets => [...prevPresets, newPreset]);
  }, [equipment, presets]);

  const handleDeletePreset = useCallback((presetName: string) => {
    setPresets(prevPresets => prevPresets.filter(p => p.name !== presetName));
  }, []);

  const handleUpdatePreset = useCallback((presetName: string) => {
    const currentSettings = equipment.reduce((acc, item) => {
      acc[item.id] = item.on;
      return acc;
    }, {} as Record<string, boolean>);

    setPresets(prevPresets =>
      prevPresets.map(p =>
        p.name === presetName ? { ...p, settings: currentSettings } : p
      )
    );
  }, [equipment]);

  const handleReorderPresets = useCallback((newOrder: EquipmentPreset[]) => {
    setPresets(newOrder);
  }, []);

  const handleSimulateOffline = useCallback(() => {
    setEquipment(prevEquipment => {
        const onlineEquipment = prevEquipment.filter(e => e.status === 'Online');
        
        if (onlineEquipment.length === 0) {
            return prevEquipment.map(e => ({ ...e, status: 'Online' }));
        }

        const randomIndex = Math.floor(Math.random() * onlineEquipment.length);
        const itemToSetOffline = onlineEquipment[randomIndex];
        
        return prevEquipment.map(item => 
            item.id === itemToSetOffline.id 
                ? { ...item, status: 'Offline', on: false }
                : item
        );
    });
  }, []);

  const handleGetTroubleshooting = useCallback(async (item: Equipment) => {
    setAiModalTitle(`Troubleshooting: ${item.name}`);
    setAiModalContent('');
    setIsAiModalLoading(true);
    setIsAiModalOpen(true);
    setError(null);
    try {
        const steps = await getTroubleshootingSteps(item);
        setAiModalContent(steps);
    } catch (err) {
        setAiModalContent("Sorry, I couldn't get troubleshooting steps at this time. Please check the console for errors.");
    } finally {
        setIsAiModalLoading(false);
    }
  }, []);

  const handleGenerateLightingCue = useCallback(async (prompt: string) => {
      // FIX: Corrected typo from setIsAiModalTitle to setAiModalTitle.
      setAiModalTitle('Generating Lighting Cue...');
      setAiModalContent('');
      setIsAiModalLoading(true);
      setError(null);
      try {
          const newCue = await generateLightingCue(prompt, equipment);
          setLightingCues(prev => [...prev, { ...newCue, isAiGenerated: true }]);
      } catch (err) {
          setError(`Failed to generate lighting cue. ${err instanceof Error ? err.message : ''}`);
      } finally {
          setIsAiModalLoading(false);
      }
  }, [equipment]);
  
  const handleGenerateVisualizerTheme = useCallback(async (prompt: string) => {
      // FIX: Corrected typo from setIsAiModalTitle to setAiModalTitle.
      setAiModalTitle('Generating Visualizer Theme...');
      setAiModalContent('');
      setIsAiModalLoading(true);
      setError(null);
      try {
          const { name, colors } = await generateVisualizerTheme(prompt);
          const newSchemeKey = name.toLowerCase().replace(/\s+/g, '-');
          const newScheme = { ...colors, name, isAiGenerated: true };
          setVisualizerColorSchemes(prev => ({ ...prev, [newSchemeKey]: newScheme }));
          setVisualizerSettings(prev => ({ ...prev, colorScheme: newSchemeKey }));
      } catch (err) {
          setError(`Failed to generate visualizer theme. ${err instanceof Error ? err.message : ''}`);
      } finally {
          setIsAiModalLoading(false);
      }
  }, []);

  const handleSuggestStatus = useCallback(async () => {
    setIsAiModalLoading(true);
    setSuggestedStatus(null);
    setError(null);
    try {
        const suggestion = await suggestNextStatus(eventStatus, script, activeScriptId);
        setSuggestedStatus(suggestion);
    } catch (err) {
        setError("Could not get a status suggestion at this time.");
    } finally {
        setIsAiModalLoading(false);
    }
  }, [eventStatus, script, activeScriptId]);


  // --- Live Conversation Handlers ---
  const handleStopConversation = useCallback(() => {
    if (liveSessionRef.current) {
        liveSessionRef.current.close();
        liveSessionRef.current = null;
    }
    const { stream, scriptProcessor, source, inputAudioContext, outputAudioContext } = audioResourcesRef.current;
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (scriptProcessor) scriptProcessor.disconnect();
    if (source) source.disconnect();
    if (inputAudioContext) inputAudioContext.close();
    if (outputAudioContext) outputAudioContext.close();
    liveAudioQueueRef.current.sources.forEach(s => s.stop());
    audioResourcesRef.current = { stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, source: null };
    liveAudioQueueRef.current = { nextStartTime: 0, sources: new Set() };
    setIsConversationActive(false);
    setIsConnecting(false);
    setUserTranscript('');
    setModelTranscript('');
  }, []);
  
  const handleStartConversation = useCallback(async () => {
      setIsConnecting(true);
      setError(null);
      setTranscriptHistory([]);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          let currentInput = '';
          let currentOutput = '';
          // FIX: The callback keys for ai.live.connect must be lowercase (e.g., onopen, onmessage).
          const sessionPromise = startConversation(voiceSettings, {
              onopen: () => {
                  setIsConnecting(false);
                  setIsConversationActive(true);
                  const source = inputAudioContext.createMediaStreamSource(stream);
                  const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                  scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createPcmBlob(inputData);
                      sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                  };
                  source.connect(scriptProcessor);
                  scriptProcessor.connect(inputAudioContext.destination);
                  audioResourcesRef.current = { stream, inputAudioContext, outputAudioContext, scriptProcessor, source };
              },
              onmessage: async (message: LiveServerMessage) => {
                  if (message.serverContent?.outputTranscription) {
                      currentOutput += message.serverContent.outputTranscription.text;
                      setModelTranscript(currentOutput);
                  } else if (message.serverContent?.inputTranscription) {
                      currentInput += message.serverContent.inputTranscription.text;
                      setUserTranscript(currentInput);
                  }
                  if (message.serverContent?.turnComplete) {
                      setTranscriptHistory(prev => [
                          ...prev,
                          { id: Date.now(), speaker: 'user', text: currentInput },
                          { id: Date.now() + 1, speaker: 'model', text: currentOutput },
                      ]);
                      currentInput = ''; currentOutput = '';
                      setUserTranscript(''); setModelTranscript('');
                  }
                  const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                  if (base64Audio) {
                      const { nextStartTime, sources } = liveAudioQueueRef.current;
                      const newNextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                      liveAudioQueueRef.current.nextStartTime = newNextStartTime;
                      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                      const sourceNode = outputAudioContext.createBufferSource();
                      sourceNode.buffer = audioBuffer;
                      sourceNode.connect(outputAudioContext.destination);
                      sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                      sourceNode.start(newNextStartTime);
                      liveAudioQueueRef.current.nextStartTime += audioBuffer.duration;
                      sources.add(sourceNode);
                  }
                  if (message.serverContent?.interrupted) {
                      liveAudioQueueRef.current.sources.forEach(s => s.stop());
                      liveAudioQueueRef.current.sources.clear();
                      liveAudioQueueRef.current.nextStartTime = 0;
                  }
              },
              onerror: (e: ErrorEvent) => {
                  setError("Conversation error. Please try again.");
                  handleStopConversation();
              },
              onclose: (e: CloseEvent) => handleStopConversation(),
          });
          liveSessionRef.current = await sessionPromise;
      } catch (err) {
          setError("Failed to access microphone. Please check permissions and try again.");
          setIsConnecting(false);
      }
  }, [voiceSettings, handleStopConversation]);

  const eventFlowStatus = { isLoading, isPlaying, activeScriptId, isGeneratingScript, isRegeneratingScript, improvingScriptId };
  const eventFlowActions = { onSpeak: handleSpeak, onGenerateScript: handleGenerateScript, onImproveScript: handleImproveScript, onDeleteScript: handleDeleteScript, onLinkCue: handleLinkCue, onRegenerateFullScript: handleRegenerateFullScript };
  const handleStatusChange = (newStatus: EventStatusType) => { setEventStatus(newStatus); setSuggestedStatus(null); };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b-2 border-yellow-500 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-yellow-400 tracking-widest">
              OSCARS 2025: COMMAND CENTER
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Live from the Dolby Theatre</p>
          </div>
          <div className="flex-shrink-0">
            <Clock />
          </div>
        </header>
        <main>
          <div className="w-full h-48 sm:h-64 md:h-80 bg-black rounded-lg shadow-2xl shadow-yellow-500/20 mb-8 overflow-hidden relative">
            <div className="absolute inset-0 flex">
              <div className="w-1/3 border-r-2 border-dashed border-gray-700"></div>
              <div className="w-1/3 border-r-2 border-dashed border-gray-700"></div>
              <div className="w-1/3"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <AudioVisualizer
                analyser={analyser}
                isPlaying={isPlaying || isLoading}
                style={visualizerSettings.style}
                colorScheme={visualizerColorSchemes[visualizerSettings.colorScheme]}
              />
            </div>
             <div className="absolute top-2 left-4 font-orbitron text-xs text-red-500 opacity-70">LIVE BROADCAST</div>
             <div className="absolute bottom-2 right-4 font-orbitron text-xs text-yellow-400 opacity-70">OSCAR CORE</div>
          </div>
          {error && (
            <div className="bg-red-800/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 font-bold">&times;</button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EventFlow 
                script={script}
                status={eventFlowStatus}
                actions={eventFlowActions}
                lightingCues={lightingCues}
              />
            </div>
            <div className="flex flex-col gap-8">
              <EventFeed script={script} activeScriptId={activeScriptId} />
              <EventStatus currentStatus={eventStatus} onStatusChange={handleStatusChange} onSuggestStatus={handleSuggestStatus} suggestedStatus={suggestedStatus} isSuggesting={isAiModalLoading} />
              <VisualizerControls settings={visualizerSettings} setSettings={setVisualizerSettings} onGenerateTheme={handleGenerateVisualizerTheme} colorSchemes={visualizerColorSchemes} />
              <Conversation 
                  isConnecting={isConnecting} isActive={isConversationActive} onStart={handleStartConversation} onStop={handleStopConversation}
                  userTranscript={userTranscript} modelTranscript={modelTranscript} history={transcriptHistory}
              />
              <VoiceControls settings={voiceSettings} setSettings={setVoiceSettings} />
              <DeviceScanner devices={devices} setDevices={setDevices} />
              <EquipmentController 
                  equipment={equipment} onToggle={handleEquipmentToggle} presets={presets} onLoadPreset={handleLoadPreset} onSavePreset={handleSavePreset}
                  onSimulateOffline={handleSimulateOffline} onDeletePreset={handleDeletePreset} onUpdatePreset={handleUpdatePreset}
                  onReorderPresets={handleReorderPresets} lightingCues={lightingCues} onTriggerCue={triggerLightingCue}
                  onGetTroubleshooting={handleGetTroubleshooting} onGenerateCue={handleGenerateLightingCue}
              />
            </div>
          </div>
        </main>
      </div>
       <AIModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={aiModalTitle}
        isLoading={isAiModalLoading}
      >
        {aiModalContent}
      </AIModal>
    </div>
  );
}