
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    isLoading: boolean;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, title, children, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-800 border border-purple-500 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="font-orbitron text-xl font-bold text-purple-400">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white font-bold text-2xl"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <SpinnerIcon className="w-12 h-12 text-purple-400" />
                            <p className="mt-4">AI is thinking...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm sm:prose-base text-gray-300 whitespace-pre-wrap">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
