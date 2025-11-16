
import React from 'react';

interface PlayIconProps {
  isPlaying: boolean;
  className?: string;
}

export const PlayIcon: React.FC<PlayIconProps> = ({ isPlaying, className = "w-6 h-6 text-white" }) => {
  if (isPlaying) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6H18V18H6z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
};
