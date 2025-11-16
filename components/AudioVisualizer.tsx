
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: The `useRef` hook requires an initial value. Changed to initialize with `null`.
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#06b6d4'); // cyan-500
      gradient.addColorStop(0.5, '#67e8f9'); // cyan-300
      gradient.addColorStop(1, '#06b6d4'); // cyan-500

      canvasCtx.lineWidth = 3;
      canvasCtx.strokeStyle = gradient;
      canvasCtx.shadowColor = '#06b6d4';
      canvasCtx.shadowBlur = 10;
      
      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // value between 0 and 2
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    if (isPlaying) {
      draw();
    } else {
        // Draw a flat line when not playing
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#0e7490'); // cyan-700
        gradient.addColorStop(0.5, '#22d3ee'); // cyan-400
        gradient.addColorStop(1, '#0e7490'); // cyan-700

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = gradient;
        canvasCtx.shadowColor = '#06b6d4';
        canvasCtx.shadowBlur = 5;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, canvas.height / 2);
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
    
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <canvas ref={canvasRef} width="1200" height="300" className="w-full h-full transition-all duration-500 ease-in-out" />
  );
};