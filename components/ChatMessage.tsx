import React, { useState, useEffect } from 'react';
import { Message, PromptItem } from '../types';
import { SecretCard } from './SecretCard';
import { LootCrate } from './LootCrate';

interface ChatMessageProps {
  message: Message;
  onExpire: (id: string) => void;
  onPromptInteract?: (item: PromptItem) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onExpire, onPromptInteract }) => {
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

  if (!message.text && !message.toolCall && !message.prompts) return null;

  const isUser = message.role === 'user';
  const isSystem = !isUser;
  const isError = message.isError;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isCrumbling ? 'crumble pointer-events-none' : ''}`}>
        <div className={`
            relative max-w-[95%] md:max-w-[85%] border-2 transition-all duration-200 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
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
            <div className="p-6 md:p-8">
                {/* Role Label */}
                {isSystem && (
                    <div className={`mb-4 text-xs font-arcade uppercase tracking-widest border-b border-gray-800 pb-2 border-dashed flex items-center gap-2 ${isError ? 'text-red-500' : 'text-pac-yellow'}`}>
                        <span>{isError ? '! ERROR' : '> SYSTEM'}</span>
                        <div className={`h-[2px] flex-1 ${isError ? 'bg-red-900' : 'bg-gray-900'}`}></div>
                    </div>
                )}

                {/* Content - Enhanced Readability */}
                {message.text && (
                    <div className={`font-mono text-base md:text-lg leading-loose tracking-wide whitespace-pre-wrap antialiased ${isGlitching ? 'opacity-80' : ''}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Prompt List (Menu) */}
            {message.prompts && (
                <div className="border-t-2 border-gray-800 bg-gray-900/30">
                    {message.prompts.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => onPromptInteract && onPromptInteract(p)}
                            className={`
                                w-full group flex items-start sm:items-center gap-4 p-5 text-left transition-all duration-200
                                ${idx !== message.prompts!.length - 1 ? 'border-b border-gray-800' : ''}
                                hover:bg-pac-blue hover:text-white focus:bg-pac-blue focus:text-white outline-none
                            `}
                        >
                            {/* Icon / Indicator */}
                            <div className={`
                                flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 font-arcade text-xs mt-1 sm:mt-0 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] transition-transform group-hover:translate-x-1
                                ${p.type === 'category' 
                                    ? 'border-pac-yellow text-pac-yellow bg-black' 
                                    : 'border-pac-ghostCyan text-pac-ghostCyan bg-black'
                                }
                                group-hover:border-white group-hover:text-black group-hover:bg-white group-hover:shadow-none
                            `}>
                                {p.type === 'category' ? '+' : '>'}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-arcade text-sm tracking-wider mb-1 flex items-center gap-2 truncate text-white group-hover:text-pac-yellow">
                                    {p.label}
                                    {p.type === 'category' && <span className="hidden sm:inline-block text-[8px] bg-pac-yellow text-black px-1 py-0.5">DIR</span>}
                                </span>
                                <span className={`text-xs font-mono group-hover:text-gray-200 truncate ${p.type === 'category' ? 'text-gray-400 uppercase tracking-widest' : 'text-gray-500'}`}>
                                    {p.desc}
                                </span>
                            </div>

                             {/* Action Text for Categories */}
                             {p.type === 'category' && (
                                <span className="hidden sm:block font-arcade text-[8px] text-gray-600 group-hover:text-white ml-2">
                                    [OPEN]
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Tools Area */}
            {message.toolCall && (
                <div className="px-5 pb-6">
                     {/* Divider before tool */}
                     <div className="h-px bg-gray-800 w-full mb-6"></div>
                    {message.toolCall.type === 'recipe' 
                        ? <LootCrate config={message.toolCall} /> 
                        : <SecretCard config={message.toolCall} />
                    }
                </div>
            )}
        </div>
    </div>
  );
};