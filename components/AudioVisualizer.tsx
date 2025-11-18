
import React, { useRef, useEffect } from 'react';
import type { VisualizerStyle, VisualizerColorSchemeDetails } from '../types';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  style: VisualizerStyle;
  colorScheme: VisualizerColorSchemeDetails | undefined;
}

const drawWave = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dataArray: Uint8Array, 
    colors: VisualizerColorSchemeDetails
) => {
    const bufferLength = dataArray.length;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colors.base);
    gradient.addColorStop(0.5, colors.highlight);
    gradient.addColorStop(1, colors.base);

    ctx.lineWidth = 3;
    ctx.strokeStyle = gradient;
    ctx.shadowColor = colors.shadow;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.lineTo(width, height / 2);
    ctx.stroke();
};

const drawBars = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    dataArray: Uint8Array, 
    colors: VisualizerColorSchemeDetails
) => {
    const bufferLength = dataArray.length;
    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.highlight);
    gradient.addColorStop(1, colors.base);

    ctx.fillStyle = gradient;
    ctx.shadowColor = colors.shadow;
    ctx.shadowBlur = 5;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * (height / 255);
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 2; // +2 for spacing
    }
};

const drawIdle = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    colors: VisualizerColorSchemeDetails
) => {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colors.idleBase);
    gradient.addColorStop(0.5, colors.idleHighlight);
    gradient.addColorStop(1, colors.idleBase);

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.shadowColor = colors.shadow;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
};


export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isPlaying, style, colorScheme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser || !colorScheme) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    // Adjust analyser for different styles
    analyser.fftSize = style === 'bars' ? 256 : 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (style === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
        drawWave(canvasCtx, canvas.width, canvas.height, dataArray, colorScheme);
      } else if (style === 'bars') {
        analyser.getByteFrequencyData(dataArray);
        drawBars(canvasCtx, canvas.width, canvas.height, dataArray, colorScheme);
      }
    };

    if (isPlaying) {
      draw();
    } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        drawIdle(canvasCtx, canvas.width, canvas.height, colorScheme);
    }
    
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, isPlaying, style, colorScheme]);

  return (
    <canvas ref={canvasRef} width="1200" height="300" className="w-full h-full transition-all duration-500 ease-in-out" />
  );
};
