import React, { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-pac-black z-50 flex flex-col items-center justify-center font-arcade text-pac-yellow">
      <div className="relative w-64 h-8 bg-gray-800 rounded-full mb-8 overflow-hidden border-2 border-pac-blue">
        <div 
          className="h-full bg-pac-yellow transition-all duration-75 relative"
          style={{ width: `${progress}%` }}
        >
          {/* Pac-Man eating the bar */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 z-10">
             <div className="w-full h-full bg-pac-yellow rounded-full relative animate-chomp">
                <div className="absolute top-1 right-2 w-1 h-1 bg-black rounded-full"></div>
                <div className="absolute top-1/2 right-0 w-1/2 h-full bg-pac-yellow origin-top-right transform -rotate-45"></div> 
             </div>
          </div>
        </div>
      </div>
      <div className="text-xl animate-pulse">
        INITIALIZING SECURE PROTOCOLS...
      </div>
      <div className="mt-4 text-xs text-gray-500 font-sans">
        {progress}% ENCRYPTED
      </div>
    </div>
  );
};
