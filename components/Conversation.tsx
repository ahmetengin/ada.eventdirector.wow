import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ConversationProps {
    isConnecting: boolean;
    isActive: boolean;
    onStart: () => void;
    onStop: () => void;
    userTranscript: string;
    modelTranscript: string;
    history: TranscriptEntry[];
}

export const Conversation: React.FC<ConversationProps> = ({
    isConnecting,
    isActive,
    onStart,
    onStop,
    userTranscript,
    modelTranscript,
    history,
}) => {

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to the bottom of the transcript
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, userTranscript, modelTranscript]);

    const getStatusText = () => {
        if (isConnecting) return "Connecting...";
        if (isActive) return "Listening...";
        return "Ready";
    }

    const renderTranscriptEntry = (entry: TranscriptEntry) => (
        <div key={entry.id} className={`flex flex-col ${entry.speaker === 'user' ? 'items-start' : 'items-end'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-sm ${entry.speaker === 'user' ? 'bg-gray-700 text-gray-200' : 'bg-cyan-800 text-cyan-100'}`}>
                {entry.text}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-orbitron text-2xl font-bold text-cyan-400">Live Conversation</h2>
                <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {getStatusText()}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-grow h-64 bg-gray-900/50 rounded-lg p-4 space-y-4 overflow-y-auto mb-4 border border-gray-700">
                {history.map(renderTranscriptEntry)}

                {userTranscript && (
                    <div className="flex flex-col items-start opacity-70">
                        <div className="rounded-lg px-3 py-2 max-w-sm bg-gray-700 text-gray-200">
                            {userTranscript}...
                        </div>
                    </div>
                )}
                
                {modelTranscript && (
                    <div className="flex flex-col items-end opacity-70">
                         <div className="rounded-lg px-3 py-2 max-w-sm bg-cyan-800 text-cyan-100">
                            {modelTranscript}...
                         </div>
                    </div>
                )}
            </div>

            {!isActive ? (
                <button
                    onClick={onStart}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                    {isConnecting ? (
                        <>
                            <SpinnerIcon className="mr-2" /> Connecting...
                        </>
                    ) : (
                        <>
                            <MicIcon className="mr-2" /> Start Conversation
                        </>
                    )}
                </button>
            ) : (
                <button
                    onClick={onStop}
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                    <StopIcon className="mr-2" /> Stop Conversation
                </button>
            )}
        </div>
    );
};