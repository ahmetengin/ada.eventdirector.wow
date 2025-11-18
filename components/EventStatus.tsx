
import React from 'react';
import type { EventStatus as EventStatusType } from '../types';
import { STATUS_CONFIG } from '../constants';
import { SparkleIcon } from './icons/SparkleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface EventStatusProps {
    currentStatus: EventStatusType;
    onStatusChange: (status: EventStatusType) => void;
    onSuggestStatus: () => Promise<void>;
    suggestedStatus: string | null;
    isSuggesting: boolean;
}

export const EventStatus: React.FC<EventStatusProps> = ({ currentStatus, onStatusChange, onSuggestStatus, suggestedStatus, isSuggesting }) => {
    const activeStatusConfig = STATUS_CONFIG[currentStatus];
    const ActiveIcon = activeStatusConfig.icon;
    const TechDifficultiesConfig = STATUS_CONFIG['Technical Difficulties'];
    const TechDifficultiesIcon = TechDifficultiesConfig.icon;
    
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-orbitron text-2xl font-bold text-cyan-400">Event Status</h2>
                <button onClick={onSuggestStatus} disabled={isSuggesting} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg transition duration-300 text-sm">
                    {isSuggesting ? <SpinnerIcon className="w-5 h-5" /> : <SparkleIcon className="w-5 h-5" />}
                    <span>Suggest</span>
                </button>
            </div>

            {suggestedStatus && (
                <div className="bg-purple-900/50 border border-purple-700 text-purple-200 px-4 py-2 rounded-lg flex items-center justify-between text-sm mb-4">
                    <p><span className="font-bold">AI Suggestion:</span> {suggestedStatus}</p>
                    <button onClick={() => onStatusChange(suggestedStatus as EventStatusType)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 text-xs rounded transition-colors">Apply</button>
                </div>
            )}

            <div className={`flex items-center justify-center p-4 rounded-lg border-2 bg-gray-900/50 mb-4 ${activeStatusConfig.color}`}>
                <ActiveIcon className={`w-8 h-8 mr-3 ${activeStatusConfig.pulse ? 'animate-pulse' : ''}`} />
                <span className="font-orbitron text-3xl font-bold tracking-wider">{activeStatusConfig.label}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STATUS_CONFIG) as EventStatusType[]).map(status => {
                    if (status === 'Technical Difficulties') return null;
                    const config = STATUS_CONFIG[status];
                    const isActive = currentStatus === status;
                    const ButtonIcon = config.icon;
                    return (
                        <button key={status} onClick={() => onStatusChange(status)} className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${isActive ? `${config.color.replace('border-', 'bg-').split(' ')[0]} text-white shadow-lg` : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'}`}>
                           <ButtonIcon className="w-4 h-4" />
                           <span>{config.label}</span>
                        </button>
                    );
                })}
                 <button key={'Technical Difficulties'} onClick={() => onStatusChange('Technical Difficulties')} className={`col-span-3 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${currentStatus === 'Technical Difficulties' ? `${TechDifficultiesConfig.color.replace('border-', 'bg-').split(' ')[0]} text-white shadow-lg` : 'bg-yellow-800/60 hover:bg-yellow-700/60 text-yellow-200'}`}>
                   <TechDifficultiesIcon className="w-4 h-4" />
                   <span>{TechDifficultiesConfig.label}</span>
                </button>
            </div>
        </div>
    );
};
