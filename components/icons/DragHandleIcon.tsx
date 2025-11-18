
import React from 'react';

export const DragHandleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-gray-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="4" r="2"></circle>
        <circle cx="15" cy="4" r="2"></circle>
        <circle cx="9" cy="12" r="2"></circle>
        <circle cx="15" cy="12" r="2"></circle>
        <circle cx="9" cy="20" r="2"></circle>
        <circle cx="15" cy="20" r="2"></circle>
    </svg>
);
