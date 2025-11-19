import React, { useState, useRef } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MovieIcon } from './icons/MovieIcon';
import type { EditableImage, VideoGenerationStatus } from '../types';

interface VideoGeneratorProps {
    onGenerateVideo: (image: EditableImage, prompt: string, aspectRatio: '16:9' | '9:16') => void;
    status: VideoGenerationStatus;
    generatedVideoUrl: string | null;
    error: string | null;
    apiKeySelected: boolean;
    onSelectApiKey: () => void;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeString, base64] = result.split(',');
            const mimeType = mimeString.match(/:(.*?);/)?.[1];
            if (base64 && mimeType) {
                resolve({ base64, mimeType });
            } else {
                reject(new Error("Failed to parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};


export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onGenerateVideo, status, generatedVideoUrl, error, apiKeySelected, onSelectApiKey }) => {
    const [image, setImage] = useState<EditableImage | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isGenerating = status === 'generating' || status === 'polling';

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                setImage({ base64, mimeType });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleGenerateClick = () => {
        if (image) {
            onGenerateVideo(image, prompt, aspectRatio);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const getStatusMessage = () => {
        switch (status) {
            case 'generating': return "Sending request to Veo...";
            case 'polling': return "Generating video... This may take a few minutes.";
            case 'success': return "Video generation complete!";
            case 'error': return "An error occurred.";
            default: return "Upload an image and add a prompt to generate a video.";
        }
    }

    if (!apiKeySelected) {
        return (
             <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
                <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center"><MovieIcon className="w-7 h-7 mr-3" /> Animate Image with Veo</h2>
                 <div className="text-center bg-yellow-900/50 p-4 rounded-lg border border-yellow-700">
                    <p className="text-yellow-300 mb-3">Video generation requires a user-provided API key with access to the Veo model.</p>
                    <p className="text-sm text-yellow-400 mb-4">Please note that charges may apply. For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">billing documentation</a>.</p>
                    <button onClick={onSelectApiKey} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Select API Key</button>
                 </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center"><MovieIcon className="w-7 h-7 mr-3" /> Animate Image with Veo</h2>
            <div className="space-y-4">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                <div onClick={triggerFileSelect} className="cursor-pointer w-full h-48 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                    {image ? <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded" /> : <span>Click to upload a starting image</span>}
                </div>

                <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Optional prompt (e.g., make the car drive)" disabled={!image || isGenerating} className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors disabled:opacity-50" />
                
                <div className="flex items-center space-x-4">
                    <label className="text-gray-300">Aspect Ratio:</label>
                     <div className="flex space-x-2">
                        <button onClick={() => setAspectRatio('16:9')} disabled={isGenerating} className={`px-4 py-1 rounded ${aspectRatio === '16:9' ? 'bg-cyan-600' : 'bg-gray-700'} disabled:opacity-50`}>16:9</button>
                        <button onClick={() => setAspectRatio('9:16')} disabled={isGenerating} className={`px-4 py-1 rounded ${aspectRatio === '9:16' ? 'bg-cyan-600' : 'bg-gray-700'} disabled:opacity-50`}>9:16</button>
                    </div>
                </div>

                <button onClick={handleGenerateClick} disabled={!image || isGenerating} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                    {isGenerating ? <><SpinnerIcon className="mr-2" /><span>Generating...</span></> : <><MovieIcon className="w-5 h-5 mr-2" /><span>Generate Video</span></>}
                </button>

                 { (status !== 'idle' || error || generatedVideoUrl) &&
                    <div className="mt-4">
                        <h3 className="font-orbitron text-lg font-bold text-cyan-300 mb-2">Result</h3>
                        <p className="text-sm text-gray-400 mb-2">{getStatusMessage()}</p>
                        <div className="w-full aspect-video bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center">
                            {isGenerating && <SpinnerIcon className="w-10 h-10 text-cyan-400" />}
                            {error && <p className="text-red-400 text-center p-4">{error}</p>}
                            {generatedVideoUrl && <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain rounded"></video>}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};
