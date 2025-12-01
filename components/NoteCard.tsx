import React, { useState, useEffect, useRef } from 'react';

export const NoteCard: React.FC = () => {
  const [noteText, setNoteText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [ttl, setTtl] = useState(30000); // Default 30s
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isCrumbling, setIsCrumbling] = useState(false);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLocked && expiryTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = expiryTime - now;

        if (diff <= 0) {
          setTimeLeft(0);
          setIsCrumbling(true);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
             // Reset after destruction? Or stay destroyed?
             // For UI feedback, let's keep it destroyed state visually
          }, 1000);
        } else {
          setTimeLeft(diff);
        }
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLocked, expiryTime]);

  const handleLock = () => {
    if (!noteText.trim()) return;
    const now = Date.now();
    setExpiryTime(now + ttl);
    setTimeLeft(ttl);
    setIsLocked(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isCrumbling) {
     return (
        <div className="w-full mt-4 animate-fade-in-up font-arcade crumble opacity-0 transition-opacity duration-1000">
             <div className="bg-red-900/20 border-2 md:border-4 border-red-500 p-4 md:p-8 text-center text-red-500">
                 DATA PURGED
             </div>
        </div>
     );
  }

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
       <div className={`bg-black border-2 md:border-4 transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] md:shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] ${isLocked ? 'border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.3)] md:shadow-[8px_8px_0_0_rgba(239,68,68,0.3)]' : 'border-green-500 shadow-[4px_4px_0_0_rgba(34,197,94,0.3)] md:shadow-[8px_8px_0_0_rgba(34,197,94,0.3)]'}`}>
          
          {/* Header */}
          <div className={`p-2 border-b-2 md:border-b-4 flex justify-between items-center ${isLocked ? 'bg-red-500 border-black text-black' : 'bg-green-500 border-black text-black'}`}>
             <div className="flex items-center gap-2">
                 <span className="text-base md:text-lg">{isLocked ? '🔒' : '📝'}</span>
                 <span className="text-[10px] md:text-xs font-bold tracking-widest">{isLocked ? 'SECURE CONTAINER' : 'ZERO KNOWLEDGE NOTE'}</span>
             </div>
             {isLocked && (
                 <div className="font-mono text-[10px] md:text-xs font-bold animate-pulse">
                     TTL: {formatTime(timeLeft || 0)}
                 </div>
             )}
          </div>

          <div className="p-2 md:p-4">
             {!isLocked ? (
                 <>
                    <textarea 
                        className="w-full bg-gray-900 border-2 border-gray-700 text-green-400 font-mono text-xs md:text-sm p-2 md:p-3 h-20 md:h-32 focus:outline-none focus:border-green-500 focus:shadow-[inset_0_0_10px_rgba(34,197,94,0.2)] resize-none mb-3 md:mb-4"
                        placeholder="ENTER SENSITIVE DATA..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                    
                    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] md:text-[10px] text-green-500 uppercase">SELF-DESTRUCT:</span>
                            <div className="flex gap-1">
                                {[30000, 300000, 3600000].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTtl(t)}
                                        className={`text-[9px] md:text-[10px] px-2 py-1 border-2 transition-all ${ttl === t ? 'bg-green-500 text-black border-green-500 font-bold' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        {t === 30000 ? '30s' : t === 300000 ? '5m' : '1h'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleLock}
                            disabled={!noteText.trim()}
                            className={`w-full md:w-auto px-4 py-2 border-2 text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-all shadow-[2px_2px_0_0_black] md:shadow-[4px_4px_0_0_black] ${!noteText.trim() ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-600' : 'bg-green-500 text-black border-green-500 hover:bg-white hover:border-white'}`}
                        >
                            ENCRYPT & LOCK
                        </button>
                    </div>
                 </>
             ) : (
                 <div className="relative">
                     <div className="bg-gray-900 border-2 border-red-500/50 p-2 md:p-4 font-mono text-xs md:text-sm text-red-400 min-h-[100px] md:min-h-[128px] break-all mb-3 md:mb-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                         {noteText}
                     </div>
                     <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                         <span className="text-[8px] md:text-[9px] text-red-500 animate-pulse text-center md:text-left">WARNING: DATA WILL BE PURGED UPON TIMER EXPIRY.</span>
                         <button 
                             onClick={handleCopy}
                             className={`w-full md:w-auto text-[9px] md:text-[10px] px-4 py-2 border-2 transition-all font-bold ${copied ? 'bg-green-500 border-green-500 text-black' : 'bg-red-500 text-black border-red-500 hover:bg-white hover:border-white'}`}
                         >
                             {copied ? 'COPIED!' : 'COPY CONTENT'}
                         </button>
                     </div>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};