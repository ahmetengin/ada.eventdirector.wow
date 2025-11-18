
import React from 'react';

export const LightingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-white" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5.5c-3.89 0-7.08 2.8-7.93 6.5H12V5.5zm1 13.5V12h7.93c-.85 3.7-4.04 6.5-7.93 6.5z" opacity=".3" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.5v-7H4.07c.85-3.7 4.04-6.5 7.93-6.5V3.5c4.97 0 9 4.03 9 9 0 3.31-1.8 6.22-4.5 7.75l-1.04-1.74c1.93-1.15 3.29-3.23 3.54-5.51H13v-7h-2v7H3.25c.25 2.28 1.61 4.36 3.54 5.51l-1.04 1.74C3.8 18.22 2 15.31 2 12c0-4.97 4.03-9 9-9v1.5c-3.89 0-7.08 2.8-7.93 6.5H11v7.5z"/>
    </svg>
);
