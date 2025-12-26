

import React from 'react';

type IconType = 'frontend' | 'backend' | 'ai';

interface ArchitectureIconProps extends React.SVGProps<SVGSVGElement> {
  type: IconType;
}

export const ArchitectureIcon: React.FC<ArchitectureIconProps> = ({ type, ...props }) => {
  switch (type) {
    case 'frontend':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.5 1.591L5.25 15.25M9.75 3.104l4.5 1.5m-4.5-1.5l-4.5 1.5M5.25 15.25l3.879 1.164c.25.075.53.075.78 0L13.75 15.25m-8.5 0L1.25 12l4 3.25m0 0l4.5-1.5m-4.5 1.5l-4.5-1.5M13.75 15.25l4.5-1.5m-4.5 1.5l4.5 1.5m0 0l4.5-4.875c.25-.25.25-.655 0-.905l-4.124-4.124c-.25-.25-.655-.25-.905 0L13.75 4.875m0 0l-4.5 1.5m4.5-1.5l4.5 1.5" />
        </svg>
      );
    case 'backend':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'ai':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 0a.375.375 0 01.375-.375h1.5a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375h-1.5a.375.375 0 01-.375-.375v-1.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0a.375.375 0 01-.375.375h-1.5a.375.375 0 01-.375-.375V4.5a.375.375 0 01.375-.375h1.5a.375.375 0 01.375.375zm0 0a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375V19.5a.375.375 0 00.375.375h1.5a.375.375 0 00.375-.375zm0 0a.375.375 0 01.375.375h1.5a.375.375 0 01.375-.375V4.5a.375.375 0 01-.375-.375h-1.5a.375.375 0 01-.375.375zm0 0a.375.375 0 00.375.375h1.5a.375.375 0 00.375-.375V19.5a.375.375 0 00-.375.375h-1.5a.375.375 0 00-.375-.375z" />
        </svg>
      );
  }
};