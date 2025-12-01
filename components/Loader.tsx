import React, { useEffect, useState } from 'react';

// Helper component for the 'C' replacement (Pacman Icon)
const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.05em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

interface LoaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
    "INITIALIZING KERNEL 4.0...",
    "MOUNTING VIRTUAL DRIVES...",
    "BYPASSING SECURITY LAYER 1...",
    "OPTIMIZING ENTROPY POOL...",
    "ALLOCATING MEMORY BLOCKS...",
    "LOADING ASSETS...",
    "CHECKING INTEGRITY...",
    "ESTABLISHING SECURE UPLINK...",
    "DECRYPTING PAYLOAD...",
    "SYSTEM READY."
];

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + 1;
      });
    }, 40); // 4 seconds total

    // Log scrolling effect
    const logInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            const randomLog = BOOT_LOGS[Math.floor(Math.random() * BOOT_LOGS.length)];
            const hex = `0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`;
            setVisibleLogs(prev => [...prev.slice(-15), `[${hex}] ${randomLog}`]);
        }
    }, 150);

    return () => {
        clearInterval(interval);
        clearInterval(logInterval);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 h-[100dvh] w-screen z-[99999] flex flex-col items-center justify-start pt-0 font-arcade text-pac-yellow relative overflow-hidden bg-black"
      style={{ backgroundColor: '#000000' }}
    >
      <style>{`
          @keyframes chompTop {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-35deg); }
          }
          @keyframes chompBottom {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(35deg); }
          }
      `}</style>

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>

      {/* CRT Vignette */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{
               background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)'
           }}>
      </div>

      {/* Faint Boot Logs Background */}
      <div className="absolute inset-0 p-4 font-mono text-[10px] text-green-900/40 overflow-hidden flex flex-col justify-end pointer-events-none z-0 select-none">
          {visibleLogs.map((log, i) => (
              <div key={i} className="whitespace-nowrap">{log}</div>
          ))}
      </div>

      {/* Header */}
      <div className="mb-16 scale-75 md:scale-100 z-10 relative mt-0 w-full bg-gradient-to-b from-black via-black/90 to-transparent">
          <div className="border-b-4 border-pac-blue p-4 w-full flex flex-col items-center shadow-[0_0_30px_rgba(30,58,138,0.6)]">
            <div className="text-4xl md:text-6xl font-arcade text-pac-yellow mb-2 tracking-tighter drop-shadow-md flex items-center justify-center gap-[0.05em]">
                <span>PA</span>
                <PacChar className="mx-[0.02em]" />
                <span>SE</span>
                <PacChar className="mx-[0.02em]" />
            </div>
            <div className="text-pac-ghostRed text-[10px] font-arcade tracking-[0.2em] text-center uppercase animate-pulse">
                Infinite Secrets. Zero Nonsense.
            </div>
          </div>
      </div>

      {/* Main Loader Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-8 -mt-20 z-10">
        
        {/* Retro Progress Bar Container */}
        <div className="relative w-full h-10 bg-black rounded-none mb-8 border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] p-1">
            
            {/* Segmented Bar Fill */}
            <div 
                className="h-full bg-pac-yellow relative transition-all duration-75 ease-linear"
                style={{ 
                    width: `${progress}%`,
                    // Segmented look using gradients
                    backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)',
                    backgroundSize: '10px 100%',
                    boxShadow: '0 0 15px #F2C94C'
                }}
            >
                {/* Leading Edge Spark */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>

                {/* Pac-Man eating the bar - Clean Semicircle Geometry */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 z-20 drop-shadow-md">
                    <div className="relative w-full h-full">
                        {/* Top Half */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-pac-yellow rounded-t-full origin-bottom"
                             style={{ animation: 'chompTop 0.15s infinite alternate ease-in-out' }}></div>
                        {/* Bottom Half */}
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-pac-yellow rounded-b-full origin-top"
                             style={{ animation: 'chompBottom 0.15s infinite alternate ease-in-out' }}></div>
                        {/* Eye */}
                        <div className="absolute top-1.5 right-3 w-1.5 h-1.5 bg-black rounded-full z-10"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Text Status */}
        <div className="text-xl md:text-2xl font-arcade text-pac-ghostCyan tracking-widest mb-2 h-8 flex items-center gap-2">
            <span>
                {progress < 30 ? "BOOTING KERNEL" : 
                 progress < 60 ? "LOADING ASSETS" : 
                 progress < 90 ? "DECRYPTING" : 
                 "SYSTEM READY"}
            </span>
            <span className="animate-pulse">_</span>
        </div>
        
        {/* Dynamic Footer: Integrity % or Start Button */}
        {!isReady ? (
            <div className="text-xs text-gray-500 font-mono font-bold tracking-widest">
                INTEGRITY CHECK: {progress}%
            </div>
        ) : (
            <button 
                onClick={onComplete}
                className="animate-fade-in-up mt-4 px-10 py-4 bg-pac-yellow text-black font-arcade text-xl md:text-2xl border-4 border-white shadow-[0_0_30px_rgba(242,201,76,0.8)] hover:scale-105 hover:bg-white hover:text-pac-blue transition-all uppercase tracking-widest font-bold z-50 cursor-pointer animate-pulse"
            >
                START
            </button>
        )}
      </div>
    </div>
  );
};