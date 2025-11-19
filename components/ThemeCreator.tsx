import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ThemeIcon } from './icons/ThemeIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { SendToScreenIcon } from './icons/SendToScreenIcon';
import type { LastGeneratedAssets, VideoGenerationStatus, BackdropContent, BackdropTarget } from '../types';

interface ThemeCreatorProps {
    onGenerate: (prompt: string, assets: string[], aspectRatio: '16:9' | '9:16') => void;
    lastGeneratedAssets: LastGeneratedAssets;
    videoStatus: VideoGenerationStatus;
    videoError: string | null;
    isApiKeySelected: boolean;
    onSelectApiKey: () => void;
    onSetBackdrop: (content: BackdropContent, target: BackdropTarget) => void;
    onTriggerCue: (name: string) => void;
    onApplyTheme: (key: string) => void;
}

const ASSET_TYPES = [
    { id: 'visualizerTheme', label: 'Visualizer Theme' },
    { id: 'lightingCue', label: 'Lighting Cue' },
    { id: 'image', label: 'Background Image' },
    { id: 'video', label: 'Intro Video' },
];

export const ThemeCreator: React.FC<ThemeCreatorProps> = ({
    onGenerate,
    lastGeneratedAssets,
    videoStatus,
    videoError,
    isApiKeySelected,
    onSelectApiKey,
    onSetBackdrop,
    onTriggerCue,
    onApplyTheme,
}) => {
    const [prompt, setPrompt] = useState('');
    const [selectedAssets, setSelectedAssets] = useState<string[]>(['visualizerTheme', 'lightingCue', 'image']);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    const isGeneratingAnyAsset = videoStatus === 'generating' || videoStatus === 'polling'; // Add other asset loading states here if they become async

    const handleAssetToggle = (assetId: string) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    const handleGenerateClick = () => {
        if (prompt.trim() && selectedAssets.length > 0) {
            onGenerate(prompt, selectedAssets, aspectRatio);
        }
    };
    
    const getStatusMessage = () => {
        switch (videoStatus) {
            case 'generating': return "Sending request to Veo...";
            case 'polling': return "Generating video... This may take a few minutes.";
            case 'success': return "Video generation complete!";
            case 'error': return "An error occurred during video generation.";
            default: return "";
        }
    }
    
    const showVeoKeyPrompt = selectedAssets.includes('video') && !isApiKeySelected;
    
    const BackdropActions = ({ content }: { content: BackdropContent }) => (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
            <button onClick={() => onSetBackdrop(content, 'main')} className="flex items-center text-xs bg-gray-600 hover:bg-cyan-600 p-2 rounded-md"><SendToScreenIcon className="w-4 h-4 mr-1"/>Main</button>
            <button onClick={() => onSetBackdrop(content, 'left')} className="flex items-center text-xs bg-gray-600 hover:bg-cyan-600 p-2 rounded-md">Left</button>
            <button onClick={() => onSetBackdrop(content, 'right')} className="flex items-center text-xs bg-gray-600 hover:bg-cyan-600 p-2 rounded-md">Right</button>
            <button onClick={() => onSetBackdrop(content, 'all')} className="flex items-center text-xs bg-cyan-700 hover:bg-cyan-500 p-2 rounded-md">All</button>
        </div>
    );

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                <ThemeIcon className="w-7 h-7 mr-3" /> AI Theme Creator
            </h2>
            <div className="space-y-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe a theme (e.g., Underwater Oscars)"
                    disabled={isGeneratingAnyAsset}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Assets to Generate:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {ASSET_TYPES.map(asset => (
                            <button
                                key={asset.id}
                                onClick={() => handleAssetToggle(asset.id)}
                                disabled={isGeneratingAnyAsset}
                                className={`text-sm font-semibold p-2 rounded-md transition-colors ${selectedAssets.includes(asset.id) ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {asset.label}
                            </button>
                        ))}
                    </div>
                </div>

                 {(selectedAssets.includes('image') || selectedAssets.includes('video')) && (
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-300 text-sm">Aspect Ratio:</label>
                        <div className="flex space-x-2">
                            <button onClick={() => setAspectRatio('16:9')} disabled={isGeneratingAnyAsset} className={`px-3 py-1 text-xs rounded ${aspectRatio === '16:9' ? 'bg-cyan-600' : 'bg-gray-700'} disabled:opacity-50`}>16:9</button>
                            <button onClick={() => setAspectRatio('9:16')} disabled={isGeneratingAnyAsset} className={`px-3 py-1 text-xs rounded ${aspectRatio === '9:16' ? 'bg-cyan-600' : 'bg-gray-700'} disabled:opacity-50`}>9:16</button>
                        </div>
                    </div>
                 )}
                
                {showVeoKeyPrompt ? (
                     <div className="text-center bg-yellow-900/50 p-4 rounded-lg border border-yellow-700">
                        <p className="text-yellow-300 mb-3">Video generation requires a user-provided API key with access to the Veo model.</p>
                        <p className="text-sm text-yellow-400 mb-4">Please note that charges may apply. For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">billing documentation</a>.</p>
                        <button onClick={onSelectApiKey} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Select API Key</button>
                     </div>
                ) : (
                    <button onClick={handleGenerateClick} disabled={!prompt.trim() || selectedAssets.length === 0 || isGeneratingAnyAsset} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                        {isGeneratingAnyAsset ? <SpinnerIcon className="mr-2" /> : <SparkleIcon className="mr-2" />}
                        {isGeneratingAnyAsset ? 'Generating Assets...' : 'Generate Assets'}
                    </button>
                )}

                {(Object.keys(lastGeneratedAssets).length > 0 || videoStatus !== 'idle') && (
                     <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                         <h3 className="font-orbitron text-lg font-bold text-cyan-300">Last Generated Assets</h3>
                         
                         {lastGeneratedAssets.theme && (
                            <div className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-200">{lastGeneratedAssets.theme.details.name}</p>
                                    <p className="text-xs text-gray-400">Visualizer Theme</p>
                                </div>
                                <span className="text-purple-300 text-xs font-bold">APPLIED</span>
                            </div>
                         )}

                         {lastGeneratedAssets.cue && (
                            <div className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-200">{lastGeneratedAssets.cue.name}</p>
                                    <p className="text-xs text-gray-400">Lighting Cue</p>
                                </div>
                                <button onClick={() => onTriggerCue(lastGeneratedAssets.cue!.name)} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-3 py-1 text-xs rounded transition-colors">Trigger Cue</button>
                            </div>
                         )}

                         {lastGeneratedAssets.image && (
                            <div className="space-y-2">
                                <div className="w-full aspect-video bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center relative group">
                                    <img src={lastGeneratedAssets.image.url} alt={lastGeneratedAssets.image.prompt} className="max-w-full max-h-full object-contain rounded" />
                                    <BackdropActions content={{ type: 'image', url: lastGeneratedAssets.image.url }} />
                                </div>
                            </div>
                         )}

                         {(videoStatus !== 'idle' || lastGeneratedAssets.videoUrl) && (
                             <div>
                                <p className="text-sm text-gray-400 mb-2">{getStatusMessage()}</p>
                                <div className="w-full aspect-video bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center relative group">
                                    {isGeneratingAnyAsset && <SpinnerIcon className="w-10 h-10 text-cyan-400" />}
                                    {videoError && <p className="text-red-400 text-center p-4">{videoError}</p>}
                                    {lastGeneratedAssets.videoUrl && (
                                        <>
                                            <video src={lastGeneratedAssets.videoUrl} autoPlay loop muted className="w-full h-full object-contain rounded"></video>
                                            <BackdropActions content={{ type: 'video', url: lastGeneratedAssets.videoUrl }} />
                                        </>
                                    )}
                                </div>
                             </div>
                         )}
                     </div>
                )}
            </div>
        </div>
    );
};