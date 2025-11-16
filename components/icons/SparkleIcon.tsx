
import React from 'react';

export const SparkleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l1.55 3.55 3.95.58-2.86 2.79.67 3.93-3.51-1.85-3.51 1.85.67-3.93-2.86-2.79 3.95-.58L12 2.5zm0 15l-1.03-2.37-2.63-.38 1.9-1.86-.45-2.62 2.35 1.24 2.35-1.24-.45 2.62 1.9 1.86-2.63.38L12 17.5zM3.5 10.5l-2-4.5 4.5 2 2-4.5 2 4.5-4.5-2-2 4.5zm15 0l-2-4.5 4.5 2 2-4.5 2 4.5-4.5-2-2 4.5z"/>
  </svg>
);
