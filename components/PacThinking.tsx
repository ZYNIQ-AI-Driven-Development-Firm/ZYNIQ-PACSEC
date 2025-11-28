import React from 'react';

export const PacThinking: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-6 px-4">
      {/* Pacman */}
      <div className="relative w-8 h-8">
        <div className="w-full h-full">
           <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '0.8s' }}>
             <path d="M50 50 L100 20 A50 50 0 1 0 100 80 Z" fill="#F2C94C" />
           </svg>
        </div>
      </div>
      
      {/* Dots being eaten */}
      <div className="flex gap-3">
        <div className="w-3 h-3 rounded-full bg-pac-ghostPink animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 rounded-full bg-pac-ghostCyan animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 rounded-full bg-pac-ghostRed animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      <span className="font-arcade text-xs text-pac-yellow ml-2 animate-pulse">PROCESSING...</span>
    </div>
  );
};
