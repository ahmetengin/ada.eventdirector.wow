
import React from 'react';

export const IntermissionIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h2m-6 4h10c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2zM8 5h.01M12 5h.01M16 5h.01M8 19h8" />
    </svg>
);
