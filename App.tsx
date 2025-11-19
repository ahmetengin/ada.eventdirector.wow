
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
import { SystemBootLoader } from './components/SystemBootLoader';
import { ThemeCreator } from './components/ThemeCreator';
import { RemoteCommand } from './components/RemoteCommand';
import { SocialFeed } from './components/SocialFeed';
import { 
  generateSpeech, 
  generateScript, 
  getTroubleshootingSteps, 
  startConversation, 
  generateLightingCue,
  generateVisualizerTheme,
  suggestNextStatus,
  researchWithGoogleSearch,
  generateImageFromPrompt,
  generateVideoFromImage,
  getVideosOperationStatus,
  analyzeSocialSentiment,
  generateTextStream
} from './services/geminiService';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { 
  INITIAL_SCRIPT, 
  MOCK_EQUIPMENT, 
  MOCK_DEVICES, 
  INITIAL_PRESETS, 
  INITIAL_LIGHTING_CUES, 
  INITIAL_VISUALIZER_COLOR_SCHEMES, 
  MOCK_SOCIAL_POSTS
} from './constants';
import type { 
  ScriptItem, 
  VoiceSettings, 
  Equipment, 
  EquipmentPreset, 
  LightingCue, 
  TranscriptEntry, 
  Device, 
  EventStatus as EventStatusType, 
  VisualizerSettings, 
  VisualizerColorSchemeDetails, 
  VideoGenerationStatus,
  BackdropContent,
  BackdropTarget,
  LastGeneratedAssets,
  SocialPost,
  SentimentAnalysisResult
} from './types';
import { LiveServerMessage } from '@google/genai';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  // System State
  const [isBooting, setIsBooting] = useState(true);
  
  // Event State
  const [eventName, setEventName] = useState("97th Academy Awards");
  const [eventDescription, setEventDescription] = useState("Live from the Dolby Theatre");
  const [script, setScript] = useState<ScriptItem[]>(INITIAL_SCRIPT);
  const [eventStatus, setEventStatus] = useState<EventStatusType>('Starting Soon');
  
  // Equipment & Devices
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [presets, setPresets] = useState<EquipmentPreset[]>(INITIAL_PRESETS);
  const [lightingCues, setLightingCues] = useState<LightingCue[]>(INITIAL_LIGHTING_CUES);

  // Audio & Voice
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({ voiceName: 'Zephyr', speed: 'normal', pitch: -4.0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeScriptId, setActiveScriptId] = useState<number | null>(null);

  // Visualizer
  const [visualizerSettings, setVisualizerSettings] = useState<VisualizerSettings>({ style: 'wave', colorScheme: 'gold' });
  const [colorSchemes, setColorSchemes] = useState<Record<string, VisualizerColorSchemeDetails>>(INITIAL_VISUALIZER_COLOR_SCHEMES);

  // AI Status
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isRegeneratingScript, setIsRegeneratingScript] = useState(false);
  const [improvingScriptId, setImprovingScriptId] = useState<number | null>(null);
  const [isSuggestingStatus, setIsSuggestingStatus] = useState(false);
  const [suggestedStatus, setSuggestedStatus] = useState<string | null>(null);

  // AI Modal (Troubleshooting / Research)
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalContent, setAiModalContent] = useState<React.ReactNode>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Live Conversation
  const [conversationActive, setConversationActive] = useState(false);
  const [conversationConnecting, setConversationConnecting] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<TranscriptEntry[]>([]);
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');
  const sessionRef = useRef<any>(null);

  // Theme Creator & Backdrops
  const [lastGeneratedAssets, setLastGeneratedAssets] = useState<LastGeneratedAssets>({});
  const [videoStatus, setVideoStatus] = useState<VideoGenerationStatus>('idle');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [backdropMain, setBackdropMain] = useState<BackdropContent | null>(null);
  const [backdropLeft, setBackdropLeft] = useState<BackdropContent | null>(null);
  const [backdropRight, setBackdropRight] = useState<BackdropContent | null>(null);

  // Social Feed
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
  const [socialAnalysis, setSocialAnalysis] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzingSocial, setIsAnalyzingSocial] = useState(false);

  const { analyser, isPlaying, play, stop } = useAudioPlayer(() => {
    setIsSpeaking(false);
    setActiveScriptId(null);
  });

  // --- Boot Sequence ---
  const handleBootComplete = () => {
      setIsBooting(false);
  };

  // --- Audio Playback ---
  const handleSpeak = useCallback(async (item: ScriptItem) => {
    if (isSpeaking) {
        stop();
        setIsSpeaking(false);
        setActiveScriptId(null);
        return;
    }

    setIsSpeaking(true);
    setActiveScriptId(item.id);

    // Automatic Cue Triggering
    if (item.linkedCue) {
        handleTriggerCue(item.linkedCue);
    }

    try {
      const audioBase64 = await generateSpeech(item.text, voiceSettings);
      await play(audioBase64);
    } catch (error) {
      console.error("Speech generation failed:", error);
      alert("Failed to generate speech. Check console for details.");
      setIsSpeaking(false);
      setActiveScriptId(null);
    }
  }, [voiceSettings, isSpeaking, play, stop]);

  // --- Script Management ---
  const handleGenerateScript = async (prompt: string) => {
    setIsGeneratingScript(true);
    const tempId = Date.now();
    const newItem: ScriptItem = { id: tempId, text: '' };
    setScript(prev => [...prev, newItem]);

    try {
        let fullText = '';
        await generateTextStream(prompt, (chunk) => {
            fullText += chunk;
            setScript(prev => prev.map(item => item.id === tempId ? { ...item, text: fullText } : item));
        });
    } catch (error) {
      console.error("Script generation failed:", error);
      setScript(prev => prev.filter(item => item.id !== tempId)); // Remove on error
      alert("Failed to generate script.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleImproveScript = async (item: ScriptItem) => {
      setImprovingScriptId(item.id);
      const originalText = item.text;
      
      // Clear text to stream new version
      setScript(prev => prev.map(i => i.id === item.id ? { ...i, text: '' } : i));

      try {
          const prompt = `Rewrite the following event announcement to be more cinematic, professional, and concise: "${originalText}"`;
          let fullText = '';
          await generateTextStream(prompt, (chunk) => {
              fullText += chunk;
              setScript(prev => prev.map(i => i.id === item.id ? { ...i, text: fullText } : i));
          });
      } catch (error) {
          console.error("Improvement failed", error);
          setScript(prev => prev.map(i => i.id === item.id ? { ...i, text: originalText } : i)); // Revert
      } finally {
          setImprovingScriptId(null);
      }
  }

  const handleDeleteScript = (id: number) => {
    setScript(prev => prev.filter(item => item.id !== id));
  };

  const handleRegenerateFullScript = async () => {
    if (!window.confirm("This will replace your current script. Are you sure?")) return;
    
    setIsRegeneratingScript(true);
    try {
      const newScriptTexts = await generateScript("Generate a list of 8 exciting, cinematic announcements for the 97th Academy Awards event flow. Return ONLY a JSON object with a 'script' key containing an array of strings.");
      const newScript: ScriptItem[] = newScriptTexts.map((text, index) => ({
        id: Date.now() + index,
        text: text,
        linkedCue: index === 0 ? 'House Lights Dim' : undefined // Example linking
      }));
      setScript(newScript);
    } catch (error) {
      console.error("Regeneration failed:", error);
      alert("Failed to regenerate script.");
    } finally {
      setIsRegeneratingScript(false);
    }
  };
  
  const handleLinkCue = (scriptId: number, cueName: string | null) => {
      setScript(prev => prev.map(item => item.id === scriptId ? { ...item, linkedCue: cueName || undefined } : item));
  };

  const handleInjectScriptItem = (text: string) => {
      const newItem: ScriptItem = { id: Date.now(), text: `[PRIORITY]: ${text}` };
      setScript(prev => [newItem, ...prev]);
  };

  // --- Equipment Control ---
  const handleToggleEquipment = (id: string, currentState: boolean) => {
    setEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, on: !currentState } : item
    ));
  };

  const handleLoadPreset = (name: string) => {
      const preset = presets.find(p => p.name === name);
      if (preset) {
          setEquipment(prev => prev.map(item => ({
              ...item,
              on: preset.settings[item.id] ?? item.on
          })));
      }
  };

  const handleSavePreset = (name: string) => {
      const settings = equipment.reduce((acc, item) => {
          acc[item.id] = item.on;
          return acc;
      }, {} as Record<string, boolean>);
      setPresets(prev => [...prev, { name, settings }]);
  };

  const handleDeletePreset = (name: string) => {
      setPresets(prev => prev.filter(p => p.name !== name));
  };

  const handleUpdatePreset = (name: string) => {
      const settings = equipment.reduce((acc, item) => {
          acc[item.id] = item.on;
          return acc;
      }, {} as Record<string, boolean>);
      setPresets(prev => prev.map(p => p.name === name ? { ...p, settings } : p));
  };

  const handleReorderPresets = (newPresets: EquipmentPreset[]) => {
      setPresets(newPresets);
  };

  const handleSimulateOffline = () => {
      const onlineEquipment = equipment.filter(e => e.status === 'Online');
      if (onlineEquipment.length > 0) {
          const randomItem = onlineEquipment[Math.floor(Math.random() * onlineEquipment.length)];
          setEquipment(prev => prev.map(e => e.id === randomItem.id ? { ...e, status: 'Offline', on: false } : e));
      } else {
          // Reset all if all are offline
          setEquipment(prev => prev.map(e => ({ ...e, status: 'Online' })));
      }
  };

  // --- Lighting Cues ---
  const handleTriggerCue = (name: string) => {
      const cue = lightingCues.find(c => c.name === name);
      if (cue) {
          setEquipment(prev => prev.map(item => ({
              ...item,
              on: cue.settings[item.id] ?? item.on
          })));
      }
  };

  // --- AI Services (Troubleshooting & Research) ---
  const handleGetTroubleshooting = async (item: Equipment) => {
      setAiModalTitle(`Troubleshooting: ${item.name}`);
      setAiModalContent(null);
      setAiModalOpen(true);
      setIsAiLoading(true);
      try {
          const steps = await getTroubleshootingSteps(item);
          setAiModalContent(steps);
      } catch (error) {
          setAiModalContent("Failed to retrieve troubleshooting steps.");
      } finally {
          setIsAiLoading(false);
      }
  };

  const handleResearchEquipment = async (item: Equipment) => {
      handleResearchCommand(`specs and common issues for ${item.brand} ${item.model} ${item.name}`);
  };
  
  const handleResearchCommand = async (command: string) => {
      setAiModalTitle(`Research: ${command}`);
      setAiModalContent(null);
      setAiModalOpen(true);
      setIsAiLoading(true);
      try {
          const result = await researchWithGoogleSearch(command);
          setAiModalContent(
              <div>
                  <p>{result.text}</p>
                  {result.sources.length > 0 && (
                      <div className="mt-4 border-t border-gray-700 pt-2">
                          <p className="text-sm font-bold text-gray-400 mb-1">Sources:</p>
                          <ul className="list-disc list-inside text-xs text-cyan-400">
                              {result.sources.map((src, idx) => (
                                  <li key={idx}><a href={src.uri} target="_blank" rel="noreferrer" className="hover:underline">{src.title || src.uri}</a></li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
          );
      } catch (error) {
          setAiModalContent("Failed to perform research.");
      } finally {
          setIsAiLoading(false);
      }
  };

  // --- Status Management ---
  const handleSuggestStatus = async () => {
      setIsSuggestingStatus(true);
      try {
          const suggestion = await suggestNextStatus(eventStatus, script, activeScriptId);
          setSuggestedStatus(suggestion);
      } catch (error) {
          console.error(error);
      } finally {
          setIsSuggestingStatus(false);
      }
  };

  // --- Visualizer Theme ---
  const handleGenerateVisualizerTheme = async (prompt: string) => {
    try {
        const result = await generateVisualizerTheme(prompt);
        const key = `ai_${Date.now()}`;
        const newTheme: VisualizerColorSchemeDetails = { ...result.colors, name: result.name, isAiGenerated: true };
        setColorSchemes(prev => ({ ...prev, [key]: newTheme }));
        setVisualizerSettings(prev => ({ ...prev, colorScheme: key }));
        return { key, details: newTheme };
    } catch (error) {
        console.error(error);
        throw error;
    }
  };

  // --- Live Conversation ---
  const handleStartConversation = async () => {
    setConversationConnecting(true);
    try {
        const toolsData = { cues: lightingCues, presets: presets };
        
        sessionRef.current = await startConversation(voiceSettings, {
            onopen: () => {
                setConversationConnecting(false);
                setConversationActive(true);
            },
            onmessage: async (message: LiveServerMessage) => {
                // Handle Transcription
                if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                     setModelTranscript(prev => prev + message.serverContent?.modelTurn?.parts?.[0]?.text);
                }
                
                // Check for tool calls (function calling)
                // Note: The SDK structure might vary slightly, we check standardized locations
                const toolCall = message.toolCall; 
                
                if (toolCall && toolCall.functionCalls) {
                    for (const call of toolCall.functionCalls) {
                        let result = { result: 'Success' };
                        console.log(`[App] Tool Call: ${call.name}`, call.args);

                        if (call.name === 'trigger_lighting_cue') {
                            const cueName = (call.args as any).cue_name;
                            handleTriggerCue(cueName);
                        } else if (call.name === 'load_equipment_preset') {
                            const presetName = (call.args as any).preset_name;
                            handleLoadPreset(presetName);
                        }

                        // Send response back to model
                         sessionRef.current.sendToolResponse({
                            functionResponses: [{
                                id: call.id,
                                name: call.name,
                                response: result
                            }]
                        });
                    }
                }

                // Handle Audio Output
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    await play(audioData);
                }
                 
                if (message.serverContent?.turnComplete) {
                     // Commit transcripts to history
                     setConversationHistory(prev => [
                         ...prev, 
                         { id: Date.now(), speaker: 'user', text: userTranscript },
                         { id: Date.now() + 1, speaker: 'model', text: modelTranscript }
                     ]);
                     setUserTranscript('');
                     setModelTranscript('');
                }
            },
            onerror: (err) => {
                console.error("Live API Error:", err);
                setConversationActive(false);
                setConversationConnecting(false);
            },
            onclose: () => {
                setConversationActive(false);
                setConversationConnecting(false);
            }
        }, toolsData);
    } catch (error) {
        console.error("Failed to start conversation:", error);
        setConversationConnecting(false);
    }
  };

  const handleStopConversation = () => {
      if (sessionRef.current) {
          // sessionRef.current.close(); // Method availability depends on SDK version
          sessionRef.current = null;
      }
      setConversationActive(false);
      setConversationConnecting(false);
      stop();
  };

  // --- Theme Creator & Assets ---
  const handleGenerateThemeAssets = async (prompt: string, assets: string[], aspectRatio: '16:9' | '9:16') => {
        const newAssets: LastGeneratedAssets = {};

        // 1. Visualizer Theme
        if (assets.includes('visualizerTheme')) {
            try {
                const theme = await handleGenerateVisualizerTheme(prompt);
                newAssets.theme = theme;
            } catch (e) { console.error("Theme gen failed", e); }
        }

        // 2. Lighting Cue
        if (assets.includes('lightingCue')) {
            try {
                 const cueData = await generateLightingCue(prompt, equipment);
                 const newCue: LightingCue = { ...cueData, isAiGenerated: true };
                 setLightingCues(prev => [...prev, newCue]);
                 newAssets.cue = newCue;
            } catch (e) { console.error("Cue gen failed", e); }
        }

        // 3. Background Image
        let imageUrl = '';
        if (assets.includes('image') || assets.includes('video')) {
             try {
                 imageUrl = await generateImageFromPrompt(prompt, aspectRatio);
                 const imageId = `img_${Date.now()}`;
                 newAssets.image = { id: imageId, prompt, url: imageUrl };
             } catch (e) { console.error("Image gen failed", e); }
        }

        // 4. Intro Video
        if (assets.includes('video') && imageUrl) {
             setVideoStatus('generating');
             setVideoError(null);
             try {
                 // Split base64
                 const [mimeTypePart, base64Data] = imageUrl.split(',');
                 const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || 'image/jpeg';
                 
                 const operation = await generateVideoFromImage(base64Data, mimeType, prompt, aspectRatio);
                 setVideoStatus('polling');
                 
                 // Poll for status
                 const pollInterval = setInterval(async () => {
                    try {
                        const status = await getVideosOperationStatus(operation);
                        if (status.done) {
                            clearInterval(pollInterval);
                            if (status.response?.generatedVideos?.[0]?.video?.uri) {
                                const videoUri = `${status.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}`;
                                setVideoStatus('success');
                                setLastGeneratedAssets(prev => ({ ...prev, videoUrl: videoUri }));
                            } else {
                                setVideoStatus('error');
                                setVideoError("Video generation finished but no URI returned.");
                            }
                        }
                    } catch (e) {
                        clearInterval(pollInterval);
                        setVideoStatus('error');
                        setVideoError(e instanceof Error ? e.message : "Polling failed");
                    }
                 }, 5000);

             } catch (e) {
                 setVideoStatus('error');
                 setVideoError(e instanceof Error ? e.message : "Failed to start video generation");
             }
        }

        setLastGeneratedAssets(prev => ({ ...prev, ...newAssets }));
  };

  const handleSetBackdrop = (content: BackdropContent, target: BackdropTarget) => {
      if (target === 'main' || target === 'all') setBackdropMain(content);
      if (target === 'left' || target === 'all') setBackdropLeft(content);
      if (target === 'right' || target === 'all') setBackdropRight(content);
  };

  const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsApiKeySelected(hasKey);
      }
  };

  const handleSelectApiKey = async () => {
      if (window.aistudio && window.aistudio.openSelectKey) {
          await window.aistudio.openSelectKey();
          checkApiKey();
      }
  }

  useEffect(() => { checkApiKey(); }, []);

  // --- Social Feed ---
  const handleAnalyzeSentiment = async () => {
      setIsAnalyzingSocial(true);
      try {
          const result = await analyzeSocialSentiment(socialPosts);
          setSocialAnalysis(result);
      } catch (error) {
          console.error(error);
          alert("Failed to analyze sentiment.");
      } finally {
          setIsAnalyzingSocial(false);
      }
  };


  // --- Backdrop Component ---
  const BackdropScreen = ({ content, label }: { content: BackdropContent | null, label: string }) => (
      <div className="relative w-full h-full bg-black border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
           {content ? (
               content.type === 'image' ? 
               <img src={content.url} alt="Backdrop" className="w-full h-full object-cover" /> :
               <video src={content.url} autoPlay loop muted className="w-full h-full object-cover" />
           ) : (
               <div className="text-gray-800 font-orbitron text-xs uppercase tracking-widest">{label}</div>
           )}
           {/* Grid overlay for 8-panel simulation on Main */}
           {label === 'Main Wall' && (
               <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 pointer-events-none">
                   {[...Array(8)].map((_, i) => (
                       <div key={i} className="border border-black/20"></div>
                   ))}
               </div>
           )}
      </div>
  );

  // --- Render ---

  if (isBooting) {
      return <SystemBootLoader onBootComplete={handleBootComplete} />;
  }
  
  const activeTheme = colorSchemes[visualizerSettings.colorScheme];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 transition-colors duration-500" style={{ borderColor: activeTheme.base }}>
      <AIModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} title={aiModalTitle} isLoading={isAiLoading}>
          {aiModalContent}
      </AIModal>

      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4 space-y-4 md:space-y-0">
        <div className="flex items-center">
           <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
           <h1 className="font-orbitron text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
             {eventName}
           </h1>
        </div>
        <div className="flex flex-col items-end">
            <Clock />
            <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Director Mode: <span className="text-cyan-400 font-bold">Active</span></p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - Script & Automation */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[calc(100vh-12rem)]">
           <div className="flex-grow min-h-0">
              <EventFlow 
                  script={script} 
                  status={{ isLoading: isSpeaking, isPlaying, activeScriptId, isGeneratingScript, isRegeneratingScript, improvingScriptId }}
                  actions={{ 
                      onSpeak: handleSpeak, 
                      onGenerateScript: handleGenerateScript,
                      onImproveScript: handleImproveScript,
                      onDeleteScript: handleDeleteScript,
                      onLinkCue: handleLinkCue,
                      onRegenerateFullScript: handleRegenerateFullScript
                  }}
                  lightingCues={lightingCues}
              />
           </div>
           <div className="flex-shrink-0">
               <RemoteCommand onSendCommand={handleInjectScriptItem} />
           </div>
        </div>

        {/* CENTER COLUMN - Visuals & Status */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
           {/* The Stage View (Backdrops) */}
           <div className="h-64 flex space-x-2">
               <div className="w-1/5"><BackdropScreen content={backdropLeft} label="Left Wing" /></div>
               <div className="w-3/5"><BackdropScreen content={backdropMain} label="Main Wall" /></div>
               <div className="w-1/5"><BackdropScreen content={backdropRight} label="Right Wing" /></div>
           </div>

           <div className="h-48 bg-black rounded-lg overflow-hidden border border-gray-700 relative">
             <AudioVisualizer 
               analyser={analyser} 
               isPlaying={isPlaying} 
               style={visualizerSettings.style}
               colorScheme={activeTheme}
             />
             <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-mono">AUDIO VISUALIZER METER</div>
           </div>

           <div className="grid grid-cols-1 gap-6">
             <EventStatus 
                 currentStatus={eventStatus} 
                 onStatusChange={setEventStatus} 
                 onSuggestStatus={handleSuggestStatus}
                 suggestedStatus={suggestedStatus}
                 isSuggesting={isSuggestingStatus}
             />
             <ThemeCreator 
                 onGenerate={handleGenerateThemeAssets}
                 lastGeneratedAssets={lastGeneratedAssets}
                 videoStatus={videoStatus}
                 videoError={videoError}
                 isApiKeySelected={isApiKeySelected}
                 onSelectApiKey={handleSelectApiKey}
                 onSetBackdrop={handleSetBackdrop}
                 onTriggerCue={handleTriggerCue}
                 onApplyTheme={(key) => setVisualizerSettings(prev => ({...prev, colorScheme: key}))}
             />
           </div>
        </div>

        {/* RIGHT COLUMN - Controls & Hardware */}
        <div className="lg:col-span-1 space-y-6 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
           <EventFeed script={script} activeScriptId={activeScriptId} />
           
           <Conversation 
                isConnecting={conversationConnecting}
                isActive={conversationActive}
                onStart={handleStartConversation}
                onStop={handleStopConversation}
                userTranscript={userTranscript}
                modelTranscript={modelTranscript}
                history={conversationHistory}
           />
           <SocialFeed 
               posts={socialPosts} 
               analysis={socialAnalysis} 
               onAnalyze={handleAnalyzeSentiment} 
               isAnalyzing={isAnalyzingSocial} 
           />
           <EquipmentController 
               equipment={equipment} 
               onToggle={handleToggleEquipment}
               presets={presets}
               onLoadPreset={handleLoadPreset}
               onSavePreset={handleSavePreset}
               onSimulateOffline={handleSimulateOffline}
               onDeletePreset={handleDeletePreset}
               onUpdatePreset={handleUpdatePreset}
               onReorderPresets={handleReorderPresets}
               lightingCues={lightingCues}
               onTriggerCue={handleTriggerCue}
               onGetTroubleshooting={handleGetTroubleshooting}
               onResearch={handleResearchEquipment}
           />
           <VoiceControls settings={voiceSettings} setSettings={setVoiceSettings} />
           <VisualizerControls 
                settings={visualizerSettings} 
                setSettings={setVisualizerSettings} 
                colorSchemes={colorSchemes}
                onGenerateTheme={async (p) => { await handleGenerateVisualizerTheme(p); }}
           />
           <DeviceScanner devices={devices} setDevices={setDevices} />
        </div>

      </div>
    </div>
  );
}
