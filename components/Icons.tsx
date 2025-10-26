import React from 'react';

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 14l11 -11" />
    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
  </svg>
);


export const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 13.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0 -5 0" />
    <path d="M12 11v-2" /><path d="M12 9v-2" />
    <path d="M12 16v2" /><path d="M12 20v2" />
    <path d="M14.5 12.5l2.5 -1.5" />
    <path d="M18.8 10.2l2.2 -.2" />
    <path d="M9.5 12.5l-2.5 -1.5" />
    <path d="M5.2 10.2l-2.2 -.2" />
    <path d="M14.5 14.5l2.5 1.5" />
    <path d="M18.8 17.8l2.2 .2" />
    <path d="M9.5 14.5l-2.5 1.5" />
    <path d="M5.2 17.8l-2.2 .2" />
    <path d="M12 4a8 8 0 0 1 8 8" />
    <path d="M4 12a8 8 0 0 1 4 -7.5" />
  </svg>
);