import React, { useState, useEffect, useRef } from 'react';
import { SparkleIcon } from './icons/SparkleIcon';
import { PlayIcon } from './icons/PlayIcon';

interface VOGParams {
  bloom_scale: number;
  climax_threshold: number;
  ambient_glow: number;
  color_shift: number;
  wave_speed: number;
}

interface VOGPreset {
  name: string;
  description: string;
  value: string;
}

const PRESETS: VOGPreset[] = [
  {
    name: 'God Thunder',
    description: 'Deep, reverberant command voice',
    value: 'GOD-THUNDER'
  },
  {
    name: 'Hall Announce',
    description: 'Clear broadcast announcement',
    value: 'HALL-ANNOUNCE'
  },
  {
    name: 'Whisper Command',
    description: 'Mystical, low whisper',
    value: 'WHISPER-COMMAND'
  }
];

interface VOGControlPanelProps {
  interpreterUrl?: string;
  vogServiceUrl?: string;
  authToken?: string;
}

export function VOGControlPanel({
  interpreterUrl = 'http://localhost:8001',
  vogServiceUrl = 'http://localhost:8000',
  authToken
}: VOGControlPanelProps) {
  const [params, setParams] = useState<VOGParams>({
    bloom_scale: 1.0,
    climax_threshold: 0.8,
    ambient_glow: 0.08,
    color_shift: 0.5,
    wave_speed: 1.0
  });

  const [text, setText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('GOD-THUNDER');
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [mode, setMode] = useState<'wave' | 'bloom'>('bloom');
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time params
  useEffect(() => {
    const ws = new WebSocket(interpreterUrl.replace('http', 'ws') + '/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'params') {
          setParams(data.data);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setStatus('Disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [interpreterUrl]);

  // Load initial params
  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const response = await fetch(`${interpreterUrl}/params`);
      const data = await response.json();
      if (data.params) {
        setParams(data.params);
      }
      if (data.mode) {
        setMode(data.mode);
      }
    } catch (error) {
      console.error('Failed to fetch params:', error);
    }
  };

  const updateParam = async (key: keyof VOGParams, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);

    try {
      // Update via REST API
      await fetch(`${interpreterUrl}/params`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });

      // Also send via WebSocket for instant update
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update_params',
          params: { [key]: value }
        }));
      }
    } catch (error) {
      console.error('Failed to update param:', error);
    }
  };

  const triggerVOG = async () => {
    if (!text.trim()) {
      setStatus('Please enter text');
      return;
    }

    if (!authToken) {
      setStatus('Auth token required');
      return;
    }

    setIsPlaying(true);
    setStatus('Generating VOG...');

    try {
      const response = await fetch(`${interpreterUrl}/play/vog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          preset: selectedPreset,
          token: authToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setStatus(`Playing: ${data.text}`);

      // Reset after estimated duration
      setTimeout(() => {
        setIsPlaying(false);
        setStatus('Ready');
      }, 5000);

    } catch (error) {
      console.error('VOG trigger failed:', error);
      setStatus(`Error: ${error}`);
      setIsPlaying(false);
    }
  };

  const getAuthToken = async () => {
    try {
      const response = await fetch(`${vogServiceUrl}/v1/auth/token?subject=director&roles=director`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  const handleQuickTest = async () => {
    const token = authToken || await getAuthToken();
    if (!token) {
      setStatus('Failed to get auth token');
      return;
    }

    setText('Welcome to the event');
    setTimeout(() => triggerVOG(), 100);
  };

  return (
    <div className="vog-control-panel">
      <div className="panel-header">
        <SparkleIcon />
        <h2>Voice of God Control</h2>
      </div>

      {/* Status */}
      <div className="status-bar">
        <span className={`status-indicator ${status.includes('error') ? 'error' : 'ok'}`}>
          {status || 'Ready'}
        </span>
        <span className="mode-badge">{mode.toUpperCase()}</span>
      </div>

      {/* Text Input */}
      <div className="input-section">
        <label>VOG Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text for Voice of God..."
          rows={3}
          disabled={isPlaying}
        />
      </div>

      {/* Preset Selection */}
      <div className="preset-section">
        <label>Preset</label>
        <div className="preset-grid">
          {PRESETS.map(preset => (
            <button
              key={preset.value}
              className={`preset-button ${selectedPreset === preset.value ? 'active' : ''}`}
              onClick={() => setSelectedPreset(preset.value)}
              disabled={isPlaying}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-desc">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Parameters */}
      <div className="params-section">
        <h3>Visual Effects</h3>

        <div className="param-control">
          <label>
            Bloom Scale: {params.bloom_scale.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={params.bloom_scale}
            onChange={(e) => updateParam('bloom_scale', parseFloat(e.target.value))}
            disabled={isPlaying}
          />
        </div>

        <div className="param-control">
          <label>
            Climax Threshold: {params.climax_threshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={params.climax_threshold}
            onChange={(e) => updateParam('climax_threshold', parseFloat(e.target.value))}
            disabled={isPlaying}
          />
        </div>

        <div className="param-control">
          <label>
            Ambient Glow: {params.ambient_glow.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.0"
            max="0.3"
            step="0.01"
            value={params.ambient_glow}
            onChange={(e) => updateParam('ambient_glow', parseFloat(e.target.value))}
            disabled={isPlaying}
          />
        </div>

        <div className="param-control">
          <label>
            Color Shift: {params.color_shift.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={params.color_shift}
            onChange={(e) => updateParam('color_shift', parseFloat(e.target.value))}
            disabled={isPlaying}
          />
        </div>

        {mode === 'wave' && (
          <div className="param-control">
            <label>
              Wave Speed: {params.wave_speed.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={params.wave_speed}
              onChange={(e) => updateParam('wave_speed', parseFloat(e.target.value))}
              disabled={isPlaying}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="trigger-button primary"
          onClick={triggerVOG}
          disabled={isPlaying || !text.trim()}
        >
          <PlayIcon />
          {isPlaying ? 'Playing...' : 'Trigger VOG'}
        </button>

        <button
          className="trigger-button secondary"
          onClick={handleQuickTest}
          disabled={isPlaying}
        >
          Quick Test
        </button>
      </div>

      <style jsx>{`
        .vog-control-panel {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          padding: 24px;
          color: #e0e0e0;
          max-width: 600px;
          margin: 0 auto;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .status-indicator {
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status-indicator.error {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .mode-badge {
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(103, 126, 234, 0.2);
          color: #667eea;
          font-weight: 600;
          font-size: 12px;
        }

        .input-section {
          margin-bottom: 20px;
        }

        .input-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #b0b0b0;
        }

        .input-section textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .input-section textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(103, 126, 234, 0.2);
        }

        .preset-section {
          margin-bottom: 20px;
        }

        .preset-section label {
          display: block;
          margin-bottom: 12px;
          font-weight: 500;
          color: #b0b0b0;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .preset-button {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .preset-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(103, 126, 234, 0.5);
        }

        .preset-button.active {
          background: rgba(103, 126, 234, 0.2);
          border-color: #667eea;
        }

        .preset-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .preset-name {
          font-weight: 600;
          color: #e0e0e0;
          margin-bottom: 4px;
        }

        .preset-desc {
          font-size: 12px;
          color: #888;
        }

        .params-section {
          margin-bottom: 20px;
        }

        .params-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 500;
          color: #b0b0b0;
        }

        .param-control {
          margin-bottom: 16px;
        }

        .param-control label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #b0b0b0;
        }

        .param-control input[type="range"] {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .param-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #667eea;
          border-radius: 50%;
          cursor: pointer;
        }

        .param-control input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #667eea;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .trigger-button {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .trigger-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .trigger-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(103, 126, 234, 0.4);
        }

        .trigger-button.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .trigger-button.secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
        }

        .trigger-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
