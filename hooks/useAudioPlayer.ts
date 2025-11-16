import { useState, useRef, useCallback, useEffect } from 'react';
import { decode, decodeAudioData } from '../utils';

// Define a type for the window object to include webkitAudioContext for cross-browser compatibility.
interface WindowWithAudioContext extends Window {
  webkitAudioContext: typeof AudioContext;
}

export const useAudioPlayer = (onPlaybackEnd?: () => void) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Effect for cleaning up the AudioContext on component unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const play = useCallback(async (base64Audio: string) => {
    // Lazily initialize AudioContext on the first user interaction to comply with browser autoplay policies.
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as unknown as WindowWithAudioContext).webkitAudioContext;
        const context = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = context;

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
      } catch (e) {
        console.error("Failed to create AudioContext:", e);
        return;
      }
    }

    const context = audioContextRef.current;
    const analyser = analyserRef.current;

    if (!context || !analyser) return;

    if (context.state === 'suspended') {
      await context.resume();
    }
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }
    
    try {
        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, context, 24000, 1);
        
        const sourceNode = context.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(analyser);
        analyser.connect(context.destination);

        sourceNode.onended = () => {
            setIsPlaying(false);
            sourceNodeRef.current = null;
            if (onPlaybackEnd) {
                onPlaybackEnd();
            }
        };

        sourceNode.start(0);
        sourceNodeRef.current = sourceNode;
        setIsPlaying(true);

    } catch(e) {
        console.error("Error playing audio: ", e);
        setIsPlaying(false);
    }

  }, [onPlaybackEnd]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      // onended will fire and set state
    }
  }, []);

  return { analyser: analyserRef.current, isPlaying, play, stop };
};
