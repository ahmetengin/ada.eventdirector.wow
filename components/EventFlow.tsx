
import React, { useState } from 'react';
import type { ScriptItem, LightingCue } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { LightingIcon } from './icons/LightingIcon';

interface EventFlowStatus {
  isLoading: boolean;
  isPlaying: boolean;
  activeScriptId: number | null;
  isGeneratingScript: boolean;
  isRegeneratingScript: boolean;
  improvingScriptId: number | null;
}

interface EventFlowActions {
  onSpeak: (item: ScriptItem) => void;
  onGenerateScript: (prompt: string) => Promise<void>;
  onImproveScript: (item: ScriptItem) => Promise<void>;
  onDeleteScript: (id: number) => void;
  onLinkCue: (scriptId: number, cueName: string | null) => void;
  onRegenerateFullScript: () => Promise<void>;
}

interface EventFlowProps {
  script: ScriptItem[];
  status: EventFlowStatus;
  actions: EventFlowActions;
  lightingCues: LightingCue[];
}

export const EventFlow: React.FC<EventFlowProps> = ({ 
  script, 
  status,
  actions,
  lightingCues,
}) => {
  const [newScriptPrompt, setNewScriptPrompt] = useState('');

  const handleAddClick = () => {
    if (newScriptPrompt.trim()) {
      actions.onGenerateScript(newScriptPrompt);
      setNewScriptPrompt('');
    }
  };
  
  const handleCueChange = (scriptId: number, e: React.ChangeEvent<HTMLSelectElement>) => {
      const cueName = e.target.value;
      actions.onLinkCue(scriptId, cueName === 'none' ? null : cueName);
  };

  const isAnyActionInProgress = status.isGeneratingScript || status.isRegeneratingScript || !!status.improvingScriptId;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-orbitron text-2xl font-bold text-cyan-400">Event Script</h2>
        <button
          onClick={actions.onRegenerateFullScript}
          disabled={isAnyActionInProgress}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm"
          title="Regenerate the entire script using AI"
        >
          {status.isRegeneratingScript ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : (
            <RefreshIcon className="w-5 h-5" />
          )}
          <span>Regenerate</span>
        </button>
      </div>
      <div className="space-y-3 flex-grow overflow-y-auto pr-2">
        {script.map((item, index) => (
          <div
            key={item.id}
            className="group flex items-center justify-between bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/80 transition-colors duration-200"
          >
            <div className="flex-grow flex items-start mr-4">
              <span className="font-orbitron text-cyan-400 mr-4 pt-1">{`0${index + 1}`}</span>
              <div className="flex-col">
                  <span className="text-gray-300">{item.text}</span>
                  {item.linkedCue && (
                      <div className="mt-2">
                           <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${lightingCues.find(c => c.name === item.linkedCue)?.isAiGenerated ? 'bg-purple-800 text-purple-300' : 'bg-yellow-800 text-yellow-300'}`}>
                               {lightingCues.find(c => c.name === item.linkedCue)?.isAiGenerated ? <SparkleIcon className="w-3 h-3 mr-1.5" /> : <LightingIcon className="w-3 h-3 mr-1.5" />}
                               {item.linkedCue}
                           </span>
                      </div>
                  )}
              </div>
            </div>
            <div className="ml-auto flex-shrink-0 flex items-center space-x-2">
               <div className="relative">
                 <select
                    value={item.linkedCue || 'none'}
                    onChange={(e) => handleCueChange(item.id, e)}
                    disabled={isAnyActionInProgress}
                    className="appearance-none w-10 h-10 rounded-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer text-transparent"
                    aria-label={`Link lighting cue for announcement ${index + 1}`}
                 >
                    <option value="none">No Cue</option>
                    {lightingCues.map(cue => (
                        <option key={cue.name} value={cue.name}>{cue.name}</option>
                    ))}
                 </select>
                 <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <LightingIcon className="w-5 h-5 text-white" />
                 </div>
               </div>
               <button
                onClick={() => actions.onImproveScript(item)}
                disabled={isAnyActionInProgress}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Improve announcement ${index + 1}`}
              >
                {status.improvingScriptId === item.id ? <SpinnerIcon className="w-5 h-5 text-white" /> : <SparkleIcon />}
              </button>
              <button
                onClick={() => actions.onDeleteScript(item.id)}
                disabled={isAnyActionInProgress}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Delete announcement ${index + 1}`}
              >
                <TrashIcon />
              </button>
              <button
                onClick={() => actions.onSpeak(item)}
                disabled={status.isLoading || (status.isPlaying && status.activeScriptId !== item.id) || isAnyActionInProgress}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                aria-label={`Play announcement ${index + 1}`}
              >
                {status.isLoading && status.activeScriptId === item.id ? (
                  <SpinnerIcon />
                ) : (
                  <PlayIcon isPlaying={status.isPlaying && status.activeScriptId === item.id} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-3">Generate New Announcement</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newScriptPrompt}
            onChange={(e) => setNewScriptPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
            placeholder="e.g., Announce a 15-minute break"
            className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            disabled={isAnyActionInProgress}
          />
          <button
            onClick={handleAddClick}
            disabled={isAnyActionInProgress || !newScriptPrompt.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center w-36"
          >
            {status.isGeneratingScript ? <SpinnerIcon /> : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};
