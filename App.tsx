
import React, { useState, useCallback, useEffect } from 'react';
import { EventFlow } from './components/EventFlow';
import { DeviceScanner } from './components/DeviceScanner';
import { AudioVisualizer } from './components/AudioVisualizer';
import { VoiceControls } from './components/VoiceControls';
import { EquipmentController } from './components/EquipmentController';
import { VOGControlPanel } from './components/VOGControlPanel';
import { generateSpeech, generateText } from './services/geminiService';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { socket } from './services/socketService';
import type { ScriptItem, Device, VoiceSettings, Equipment } from './types';
import { INITIAL_SCRIPT, MOCK_EQUIPMENT } from './constants';

export default function App() {
  const [script, setScript] = useState<ScriptItem[]>(INITIAL_SCRIPT);
  const [devices, setDevices] = useState<Device[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScriptId, setActiveScriptId] = useState<number | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [improvingScriptId, setImprovingScriptId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'director' | 'vog'>('director');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceName: 'Fenrir',
    speed: 'normal',
    tone: '',
  });

  // Effect to listen for real-time equipment status updates from the socket service
  useEffect(() => {
    const handleStatusUpdate = (updatedItem: { id: string, on: boolean }) => {
      console.log('[App.tsx] Received equipment status update:', updatedItem);
      setEquipment(prevEquipment =>
        prevEquipment.map(item =>
          item.id === updatedItem.id ? { ...item, on: updatedItem.on } : item
        )
      );
    };

    socket.on('equipment-status-update', handleStatusUpdate);

    // Cleanup on component unmount
    return () => {
      socket.off('equipment-status-update', handleStatusUpdate);
    };
  }, []); // Empty dependency array means this runs once on mount


  const handlePlaybackEnd = useCallback(() => {
      setActiveScriptId(null);
  }, []);

  const { isPlaying, play, stop, analyser } = useAudioPlayer(handlePlaybackEnd);

  const handleSpeak = useCallback(async (item: ScriptItem) => {
    if (isPlaying) {
      stop();
      if (activeScriptId === item.id) {
        setActiveScriptId(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setActiveScriptId(item.id);

    try {
      const audioContent = await generateSpeech(item.text, voiceSettings);
      play(audioContent);
    } catch (err) {
      console.error("Error generating speech:", err);
      setError("Failed to generate audio. Please check your API key and network connection.");
      setActiveScriptId(null);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, play, stop, activeScriptId, voiceSettings]);

  const handleGenerateScript = useCallback(async (prompt: string) => {
    setIsGeneratingScript(true);
    setError(null);
    try {
      const fullPrompt = `You are an event director. Write a short, clear, and professional announcement for the following request: "${prompt}"`;
      const newText = await generateText(fullPrompt);
      setScript(prevScript => [
        ...prevScript,
        { id: Date.now(), text: newText.trim() }
      ]);
    } catch (err) {
      console.error("Error generating script:", err);
      setError("Failed to generate new script item. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  }, []);

  const handleImproveScript = useCallback(async (itemToImprove: ScriptItem) => {
    setImprovingScriptId(itemToImprove.id);
    setError(null);
    try {
      const fullPrompt = `You are a professional event announcer. Rephrase the following announcement to make it clearer and more engaging, while keeping it concise: "${itemToImprove.text}"`;
      const improvedText = await generateText(fullPrompt);
      setScript(prevScript =>
        prevScript.map(item =>
          item.id === itemToImprove.id ? { ...item, text: improvedText.trim() } : item
        )
      );
    } catch (err) {
      console.error("Error improving script:", err);
      setError("Failed to improve script item. Please try again.");
    } finally {
      setImprovingScriptId(null);
    }
  }, []);

  const handleDeleteScript = useCallback((id: number) => {
    setScript(prevScript => prevScript.filter(item => item.id !== id));
  }, []);

  const handleEquipmentToggle = useCallback((id: string, currentState: boolean) => {
    // Optimistic UI update for a responsive feel
    setEquipment(prevEquipment =>
      prevEquipment.map(item =>
        item.id === id ? { ...item, on: !currentState } : item
      )
    );
    // Send the command to the "server" via the socket service
    socket.emit('equipment-command', { id, state: !currentState });
  }, []);

  // Grouping props for EventFlow for better readability
  const eventFlowStatus = {
    isLoading,
    isPlaying,
    activeScriptId,
    isGeneratingScript,
    improvingScriptId,
  };

  const eventFlowActions = {
    onSpeak: handleSpeak,
    onGenerateScript: handleGenerateScript,
    onImproveScript: handleImproveScript,
    onDeleteScript: handleDeleteScript,
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <header className="text-center mb-8 border-b-2 border-cyan-500 pb-4">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-cyan-400 tracking-widest">
            EVENT DIRECTOR AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">The Voice of God</p>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab('director')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'director'
                  ? 'bg-cyan-500 text-gray-900'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Event Director
            </button>
            <button
              onClick={() => setActiveTab('vog')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'vog'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              VOG Control
            </button>
          </div>
        </header>
        
        <main>
          <div className="w-full h-48 sm:h-64 md:h-80 bg-black rounded-lg shadow-2xl shadow-cyan-500/20 mb-8 overflow-hidden relative">
            <div className="absolute inset-0 flex">
              <div className="w-1/3 border-r-2 border-dashed border-gray-700"></div>
              <div className="w-1/3 border-r-2 border-dashed border-gray-700"></div>
              <div className="w-1/3"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <AudioVisualizer analyser={analyser} isPlaying={isPlaying || isLoading} />
            </div>
             <div className="absolute top-2 left-4 font-orbitron text-xs text-red-500 opacity-70">HDMI OUT - PGM</div>
             <div className="absolute bottom-2 right-4 font-orbitron text-xs text-cyan-400 opacity-70">PI-5 CORE</div>
          </div>
          
          {error && (
            <div className="bg-red-800/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {activeTab === 'director' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <EventFlow
                  script={script}
                  status={eventFlowStatus}
                  actions={eventFlowActions}
                />
              </div>
              <div>
                <VoiceControls settings={voiceSettings} setSettings={setVoiceSettings} />
                <div className="mt-8">
                  <DeviceScanner devices={devices} setDevices={setDevices} />
                </div>
                <div className="mt-8">
                  <EquipmentController equipment={equipment} onToggle={handleEquipmentToggle} />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <VOGControlPanel
                interpreterUrl={import.meta.env.VITE_INTERPRETER_URL}
                vogServiceUrl={import.meta.env.VITE_VOG_SERVICE_URL}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
