
import React from 'react';

export const NyxLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" {...props}>
  <defs>
    <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{stopColor:'#00d4ff', stopOpacity:1}} />
      <stop offset="50%" style={{stopColor:'#7c3aed', stopOpacity:1}} />
      <stop offset="100%" style={{stopColor:'#ff00ff', stopOpacity:1}} />
    </linearGradient>
    
    <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{stopColor:'#00d4ff', stopOpacity:0.3}} />
      <stop offset="100%" style={{stopColor:'#ff00ff', stopOpacity:0.3}} />
    </linearGradient>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="400" height="400" fill="none"/>
  
  <polygon points="200,40 320,110 320,250 200,320 80,250 80,110" 
           fill="none" 
           stroke="url(#hexGradient)" 
           strokeWidth="4" 
           filter="url(#glow)"/>
  
  <polygon points="200,80 280,130 280,230 200,280 120,230 120,130" 
           fill="url(#innerGradient)" 
           stroke="url(#hexGradient)" 
           strokeWidth="2"/>
  
  <circle cx="200" cy="180" r="8" fill="#00d4ff" filter="url(#glow)"/>
  <circle cx="160" cy="150" r="5" fill="#7c3aed"/>
  <circle cx="240" cy="150" r="5" fill="#7c3aed"/>
  <circle cx="160" cy="210" r="5" fill="#ff00ff"/>
  <circle cx="240" cy="210" r="5" fill="#ff00ff"/>
  <circle cx="200" cy="130" r="4" fill="#00d4ff"/>
  <circle cx="200" cy="230" r="4" fill="#ff00ff"/>
  
  <line x1="200" y1="180" x2="160" y2="150" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="200" y1="180" x2="240" y2="150" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="200" y1="180" x2="160" y2="210" stroke="#ff00ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="200" y1="180" x2="240" y2="210" stroke="#ff00ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="200" y1="180" x2="200" y2="130" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="200" y1="180" x2="200" y2="230" stroke="#ff00ff" strokeWidth="1.5" opacity="0.6"/>
  <line x1="160" y1="150" x2="240" y2="150" stroke="#7c3aed" strokeWidth="1" opacity="0.4"/>
  <line x1="160" y1="210" x2="240" y2="210" stroke="#7c3aed" strokeWidth="1" opacity="0.4"/>
  
  <path d="M 170 165 L 170 195 L 175 195 L 175 175 L 220 195 L 225 195 L 225 165 L 220 165 L 220 185 L 175 165 Z" 
        fill="url(#hexGradient)" 
        filter="url(#glow)"/>

  <circle cx="200" cy="180" r="8" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.6">
    <animate attributeName="r" from="8" to="20" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
);