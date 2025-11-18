
import React from 'react';
import type { ScriptItem } from '../types';

interface EventFeedProps {
    script: ScriptItem[];
    activeScriptId: number | null;
}

export const EventFeed: React.FC<EventFeedProps> = ({ script, activeScriptId }) => {
    const activeIndex = activeScriptId !== null ? script.findIndex(item => item.id === activeScriptId) : -1;
    const currentItem = activeIndex !== -1 ? script[activeIndex] : null;
    const nextItem = activeIndex !== -1 && activeIndex < script.length - 1 ? script[activeIndex + 1] : null;

    // If nothing is active, the "Up Next" item is the first in the script
    const upNextWhenIdle = script.length > 0 ? script[0] : null;

    const renderItem = (item: ScriptItem | null, isUpNext = false) => {
        if (!item) {
            return <span className="text-gray-500 italic">{isUpNext ? 'End of show.' : 'Standby...'}</span>;
        }
        return (
            <p className="text-gray-300 truncate">{item.text}</p>
        );
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4">Real-Time Feed</h2>
            <div className="space-y-4">
                {/* ON AIR Section */}
                <div>
                    <div className="flex items-center mb-1">
                        {currentItem && (
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                        )}
                        <h3 className={`font-orbitron text-lg font-bold ${currentItem ? 'text-red-400' : 'text-gray-500'}`}>
                            {currentItem ? 'ON AIR' : 'STANDBY'}
                        </h3>
                    </div>
                    <div className="bg-gray-900/50 rounded-md p-3 min-h-[4rem] flex items-center border border-gray-700">
                       {renderItem(currentItem)}
                    </div>
                </div>

                {/* UP NEXT Section */}
                <div>
                    <h3 className="font-orbitron text-lg font-bold text-yellow-400 mb-1">UP NEXT</h3>
                    <div className="bg-gray-900/50 rounded-md p-3 min-h-[4rem] flex items-center border border-gray-700 opacity-80">
                       {renderItem(currentItem ? nextItem : upNextWhenIdle, true)}
                    </div>
                </div>
            </div>
        </div>
    );
};
