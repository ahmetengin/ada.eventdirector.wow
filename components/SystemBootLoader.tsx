
import React, { useEffect, useState, useRef } from 'react';
import { MOCK_DEVICES } from '../constants';
import { TerminalIcon } from './icons/TerminalIcon';

interface SystemBootLoaderProps {
  onBootComplete: () => void;
}

export const SystemBootLoader: React.FC<SystemBootLoaderProps> = ({ onBootComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const bootSequence = async () => {
      const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
      
      addLog("Initializing AI Core (Mac Mini M4)...");
      await new Promise(r => setTimeout(r, 600));
      addLog("Mounting file system... [OK]");
      setProgress(10);
      await new Promise(r => setTimeout(r, 400));
      addLog("Starting Network Discovery Service...");
      await new Promise(r => setTimeout(r, 500));
      addLog("Scanning subnet 10.0.1.x/24 for MCP-enabled devices...");
      setProgress(25);

      for (let i = 0; i < MOCK_DEVICES.length; i++) {
        const device = MOCK_DEVICES[i];
        await new Promise(r => setTimeout(r, 400));
        addLog(`Found Device: ${device.ip} - ${device.brand} ${device.model}`);
        
        if (device.status === 'Offline') {
           addLog(`[WARNING] Device ${device.name} is OFFLINE. Handshake failed.`);
        } else {
           addLog(`[MCP] Handshake successful with ${device.id}.`);
           if (device.capabilities) {
             for (const cap of device.capabilities) {
               await new Promise(r => setTimeout(r, 100));
               addLog(`  -> Importing Tool: ${cap.name} (${cap.schema})... [OK]`);
             }
           }
        }
        setProgress(25 + ((i + 1) / MOCK_DEVICES.length) * 60);
      }

      await new Promise(r => setTimeout(r, 500));
      addLog("Verifying Tool Registry...");
      await new Promise(r => setTimeout(r, 300));
      addLog("System Integrity Check... [PASSED]");
      setProgress(100);
      addLog("All Systems GO. Launching Command Center UI.");
      await new Promise(r => setTimeout(r, 1000));
      onBootComplete();
    };

    bootSequence();
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4 font-mono text-green-500">
      <div className="w-full max-w-3xl border border-green-800 bg-gray-900/90 rounded-lg shadow-2xl p-6 relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-10 pointer-events-none animate-scan"></div>
        
        <header className="flex items-center justify-between mb-6 border-b border-green-800 pb-4">
            <div className="flex items-center">
                <TerminalIcon className="w-6 h-6 mr-3 animate-pulse" />
                <h1 className="text-xl font-bold tracking-wider">AI CORE SYSTEM BOOT</h1>
            </div>
            <span className="text-xs opacity-70">v3.5.0-release</span>
        </header>

        <div ref={scrollRef} className="h-96 overflow-y-auto space-y-1 text-sm font-mono mb-6 pr-2 scrollbar-thin scrollbar-thumb-green-900">
          {logs.map((log, idx) => (
            <p key={idx} className={`${log.includes('[WARNING]') ? 'text-yellow-500' : log.includes('[OK]') || log.includes('[PASSED]') ? 'text-green-400' : 'text-green-600'}`}>
              <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </p>
          ))}
          <div className="animate-pulse">_</div>
        </div>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                System Load
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-900">
            <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"></div>
          </div>
        </div>
        
        <footer className="text-center text-xs text-green-800 mt-2">
            PROPRIETARY SYSTEM - UNAUTHORIZED ACCESS PROHIBITED
        </footer>
      </div>
    </div>
  );
};
