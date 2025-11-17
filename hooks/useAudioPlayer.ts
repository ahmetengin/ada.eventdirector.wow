
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
  
  // Use a ref for the callback to prevent stale closures inside other callbacks.
  const onPlaybackEndRef = useRef(onPlaybackEnd);
  useEffect(() => {
    onPlaybackEndRef.current = onPlaybackEnd;
  }, [onPlaybackEnd]);

  // Centralized cleanup function for robustness and reliability.
  // This is the core of the fix, ensuring all state is reset from one single place.
  const cleanup = useCallback(() => {
    if (sourceNodeRef.current) {
      // Detach the onended handler to prevent it from firing during manual cleanup.
      sourceNodeRef.current.onended = null;
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Can throw error if context is closed or node is already stopped. Safe to ignore.
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    // Only update state if it needs to be changed to prevent unnecessary re-renders.
    if (isPlaying) {
      setIsPlaying(false);
      if (onPlaybackEndRef.current) {
        onPlaybackEndRef.current();
      }
    }
  }, [isPlaying]);

  // Effect for cleaning up the AudioContext on component unmount
  useEffect(() => {
    // The returned function from useEffect is the cleanup function.
    return () => {
      cleanup(); // Use our robust cleanup function.
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [cleanup]);

  const play = useCallback(async (base64Audio: string) => {
    // Proactively clean up any existing audio state before playing something new.
    cleanup();

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
    
    try {
        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, context, 24000, 1);
        
        const sourceNode = context.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(analyser);
        analyser.connect(context.destination);

        // onended now only handles the case where the audio plays to completion naturally.
        sourceNode.onended = () => {
            // Check if this is still the active node before cleaning up.
            if (sourceNodeRef.current === sourceNode) {
              cleanup();
            }
        };

        sourceNode.start(0);
        sourceNodeRef.current = sourceNode;
        setIsPlaying(true);

    } catch(e) {
        console.error("Error playing audio: ", e);
        cleanup(); // Ensure cleanup happens on error too.
    }

  }, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  return { analyser: analyserRef.current, isPlaying, play, stop };
};
