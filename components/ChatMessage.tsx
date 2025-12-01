import React, { useState, useEffect } from 'react';
import { Message, PromptItem } from '../types';
import { SecretCard } from './SecretCard';
import { LootCrate } from './LootCrate';
import { NoteCard } from './NoteCard';
import { RsaCard } from './RsaCard';
import { HashCard } from './HashCard';
import { IntegrationsGrid } from './IntegrationsGrid';

interface ChatMessageProps {
  message: Message;
  onExpire: (id: string) => void;
  onPromptInteract?: (item: PromptItem) => void;
  onIntegrationConnect?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onExpire, onPromptInteract, onIntegrationConnect }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isCrumbling, setIsCrumbling] = useState(false);

  useEffect(() => {
    if (!message.expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = message.expiresAt! - now;

      if (diff <= 0) {
        setIsCrumbling(true);
        setTimeout(() => {
            onExpire(message.id);
        }, 800); // Allow crumble animation to play
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
        // Glitch effect in last 10 seconds
        if (diff < 10000 && diff > 0) {
            setIsGlitching(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [message.expiresAt, message.id, onExpire]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!message.text && !message.toolCall && !message.prompts && !message.integrations) return null;

  const isUser = message.role === 'user';
  const isSystem = !isUser;
  const isError = message.isError;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isCrumbling ? 'crumble pointer-events-none' : ''}`}>
        <div className={`
            relative max-w-[95%] md:max-w-[90%] border-2 transition-all duration-200 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] md:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
            ${isGlitching ? 'glitch-anim border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]' : ''}
            ${
                isUser
                ? 'bg-pac-blue text-white border-white' 
                : isError 
                    ? 'bg-red-950 text-red-100 border-red-500'
                    : 'bg-black text-gray-50 border-pac-yellow'
            }
        `}>
            {/* Countdown Timer Header - Integrated into border */}
            {timeLeft !== null && (
                <div className={`absolute -top-3 ${isUser ? 'left-2' : 'right-2'} bg-black px-2 border-2 z-10 ${isGlitching ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-600 text-gray-500'}`}>
                    <span className="font-arcade text-[8px] font-bold tracking-widest">
                        TTL {formatTime(timeLeft)}
                    </span>
                </div>
            )}

            {/* Padded Content Area */}
            <div className="p-3 md:p-8">
                {/* Role Label */}
                {isSystem && (
                    <div className={`mb-3 md:mb-4 text-[10px] md:text-xs font-arcade uppercase tracking-widest border-b border-gray-800 pb-2 border-dashed flex items-center gap-2 ${isError ? 'text-red-500' : 'text-pac-yellow'}`}>
                        <span>{isError ? '! ERROR' : '> SYSTEM'}</span>
                        <div className={`h-[2px] flex-1 ${isError ? 'bg-red-900' : 'bg-gray-900'}`}></div>
                    </div>
                )}

                {/* Content - Enhanced Readability */}
                {message.text && (
                    <div className={`font-mono text-sm md:text-lg leading-relaxed md:leading-loose tracking-wide whitespace-pre-wrap antialiased ${isGlitching ? 'opacity-80' : ''}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Prompt List (Menu) - GRID LAYOUT */}
            {message.prompts && (
                <div className="border-t-2 border-gray-800 bg-gray-900/30 p-2 md:p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {message.prompts.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => onPromptInteract && onPromptInteract(p)}
                                className={`
                                    group flex flex-col items-start gap-2 p-2 md:p-3 text-left transition-all duration-200
                                    border border-gray-800 hover:border-pac-blue bg-black relative
                                    hover:bg-pac-blue hover:text-white focus:bg-pac-blue focus:text-white outline-none
                                    h-full shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]
                                `}
                            >
                                {/* Header: Icon + Label */}
                                <div className="flex items-center gap-2 w-full border-b border-gray-800/50 pb-2 mb-1 group-hover:border-white/20">
                                    <div className={`
                                        flex-shrink-0 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border font-arcade text-[8px] md:text-[9px]
                                        ${p.type === 'category' 
                                            ? 'border-pac-yellow text-pac-yellow' 
                                            : 'border-pac-ghostCyan text-pac-ghostCyan'
                                        }
                                        group-hover:border-white group-hover:text-black group-hover:bg-white
                                    `}>
                                        {p.type === 'category' ? '+' : '>'}
                                    </div>
                                    <span className="font-arcade text-[9px] md:text-[10px] tracking-wider truncate flex-1 text-white group-hover:text-pac-yellow">
                                        {p.label}
                                    </span>
                                </div>

                                {/* Description */}
                                <span className={`text-[9px] md:text-[10px] font-mono leading-tight line-clamp-2 group-hover:text-gray-100 ${p.type === 'category' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {p.desc}
                                </span>

                                 {/* Type Indicator */}
                                 {p.type === 'category' && (
                                    <span className="absolute top-2 right-2 font-arcade text-[8px] text-gray-700 group-hover:text-white/50">
                                        DIR
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Integrations Grid */}
            {message.integrations && (
                <div className="px-2 pb-4 md:px-5 md:pb-6">
                     <div className="h-px bg-indigo-900/50 w-full mb-4"></div>
                     <IntegrationsGrid items={message.integrations} />
                </div>
            )}

            {/* Tools Area */}
            {message.toolCall && (
                <div className="px-2 pb-4 md:px-5 md:pb-6">
                     {/* Divider before tool */}
                     <div className="h-px bg-gray-800 w-full mb-4 md:mb-6"></div>
                    {(() => {
                        switch(message.toolCall.type) {
                            case 'recipe': return <LootCrate config={message.toolCall} />;
                            case 'note': return <NoteCard />;
                            case 'rsa': return <RsaCard bits={message.toolCall.bits} />;
                            case 'hash': return <HashCard />;
                            default: return <SecretCard config={message.toolCall} />;
                        }
                    })()}
                </div>
            )}
        </div>
    </div>
  );
};