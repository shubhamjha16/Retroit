
"use client";

import React from 'react';

export const TapeLoadAnimation = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-[110]">
    <svg width="120" height="60" viewBox="0 0 120 60" className="drop-shadow-neon-primary">
      <defs>
        <linearGradient id="retroTapeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      {/* VHS Player Slot */}
      <rect x="40" y="10" width="70" height="40" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" rx="3"/>
      <rect x="42" y="12" width="12" height="36" fill="hsl(var(--background))"/> {/* Slot opening detail */}
      <rect x="45" y="15" width="5" height="30" fill="hsl(var(--muted))"/> {/* Inner slot shadow */}

      {/* Cassette Tape Group */}
      <g id="cassetteAnimateGroup">
        <rect x="0" y="18" width="45" height="24" fill="url(#retroTapeGrad)" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5" rx="2"/>
        {/* Cassette reel holes - simplified */}
        <circle cx="15" cy="30" r="3" fill="hsl(var(--background))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
        <circle cx="30" cy="30" r="3" fill="hsl(var(--background))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
        
        {/* Animation for the entire group */}
        <animateTransform
            href="#cassetteAnimateGroup"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="75 0" 
            dur="1s"
            begin="0s"
            fill="freeze"
            id="slideInCassette"
          />
        <animate 
            href="#cassetteAnimateGroup"
            attributeName="opacity" 
            from="1" 
            to="0" 
            dur="0.5s" 
            begin="slideInCassette.end-0.2s" 
            fill="freeze" 
          />
      </g>
    </svg>
    <p className="text-sm text-primary neon-text-primary mt-3 font-headline">Loading Tape...</p>
  </div>
);
