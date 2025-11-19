
import React from 'react';

export const ThemeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5l1.55 3.55 3.95.58-2.86 2.79.67 3.93-3.51-1.85-3.51 1.85.67-3.93-2.86-2.79 3.95-.58L12 2.5zM17.27 7.69L15.86 6.28l1.41-1.41 1.41 1.41-1.41 1.42zM12 21.5c-3.2 0-6.1-1.3-8.1-3.4l1.4-1.4c1.7 1.7 4 2.8 6.7 2.8s5-1.1 6.7-2.8l1.4 1.4c-2 2.1-4.9 3.4-8.1 3.4z" />
    </svg>
);
