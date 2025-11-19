import React, { useState, useEffect, useRef } from 'react';
import { TerminalIcon } from './icons/TerminalIcon';

interface RemoteCommandProps {
    onSendCommand: (command: string) => void;
}

export const RemoteCommand: React.FC<RemoteCommandProps> = ({ onSendCommand }) => {
    const [command, setCommand] = useState('');
    const [log, setLog] = useState<string[]>(['Connecting to core@10.0.1.4...', 'Connection established.']);
    const logRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    const handleSendCommand = () => {
        if (!command.trim()) return;
        const newLog = [...log, `> ${command}`];
        setLog(newLog);
        
        onSendCommand(command);

        setTimeout(() => {
            setLog(prev => [...prev, `[CORE ACK] Script item injected: "${command}"`]);
        }, 500);

        setCommand('');
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                <TerminalIcon className="w-6 h-6 mr-3" /> Remote Command
            </h2>
            <div ref={logRef} className="bg-black/50 font-mono text-sm text-green-400 p-3 h-48 rounded-md overflow-y-auto mb-3 border border-gray-700">
                {log.map((line, index) => (
                    <p key={index} className={line.startsWith('>') ? 'text-white' : ''}>{line}</p>
                ))}
            </div>
            <div className="flex items-center font-mono">
                <span className="text-green-400 mr-2">~ada/inject$</span>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                    placeholder="Enter high-priority announcement..."
                    className="flex-grow bg-transparent text-white focus:outline-none"
                />
            </div>
        </div>
    );
};