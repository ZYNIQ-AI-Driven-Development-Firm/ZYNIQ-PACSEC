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

  return (
    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} ${isCrumbling ? 'crumble pointer-events-none' : ''}`}>
        <div className={`
            relative max-w-[95%] md:max-w-[85%] border-2 transition-all duration-200 shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]
            ${isGlitching ? 'glitch-anim border-red-500 shadow-[6px_6px_0_0_rgba(239,68,68,0.5)]' : ''}
            ${
                message.role === 'user' 
                ? 'bg-pac-blue text-white border-white shadow-[6px_6px_0_0_rgba(255,255,255,0.2)]' 
                : message.isError 
                    ? 'bg-red-950 text-red-100 border-red-500 shadow-[6px_6px_0_0_rgba(239,68,68,0.3)]'
                    : 'bg-black text-gray-300 border-pac-yellow shadow-[6px_6px_0_0_rgba(242,201,76,0.3)]'
            }
        `}>
            {/* Countdown Timer Header */}
            {timeLeft !== null && (
                <div className={`absolute -top-3 ${message.role === 'user' ? 'left-2' : 'right-2'} bg-black px-2 border-2 ${isGlitching ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-500 text-gray-400'}`}>
                    <span className="font-arcade text-[8px] font-bold tracking-widest">
                        TTL {formatTime(timeLeft)}
                    </span>
                </div>
            )}

            {/* Padded Content Area */}
            <div className="p-5">
                {/* Role Label */}
                {message.role === 'assistant' && (
                    <div className={`mb-3 text-[10px] font-arcade uppercase tracking-widest border-b-2 border-gray-800 pb-2 border-dashed ${message.isError ? 'text-red-500' : 'text-pac-yellow'}`}>
                        {message.isError ? '! SYSTEM ERROR !' : '> SYSTEM RESPONSE'}
                    </div>
                )}

                {/* Content */}
                {message.text && (
                    <div className={`font-mono text-sm md:text-base leading-relaxed tracking-wide whitespace-pre-wrap ${isGlitching ? 'opacity-80' : ''}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Full-width Prompt List (In-Chat Menu) */}
            {message.prompts && (
                <div className="border-t-2 border-gray-800 bg-gray-900/50">
                    {message.prompts.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => onPromptInteract && onPromptInteract(p)}
                            className={`
                                w-full group flex items-center gap-4 p-4 text-left transition-all
                                ${idx !== message.prompts!.length - 1 ? 'border-b border-gray-800' : ''}
                                hover:bg-pac-blue hover:text-white
                            `}
                        >
                            {/* Icon / Indicator */}
                            <div className={`
                                w-8 h-8 flex items-center justify-center border-2 font-arcade text-xs
                                ${p.type === 'category' 
                                    ? 'border-pac-yellow text-pac-yellow bg-black' 
                                    : 'border-pac-ghostCyan text-pac-ghostCyan bg-black'
                                }
                                group-hover:border-white group-hover:text-black group-hover:bg-white
                            `}>
                                {p.type === 'category' ? '+' : '>'}
                            </div>

                            <div className="flex flex-col flex-1">
                                <span className="font-arcade text-xs tracking-wider mb-1 flex items-center gap-2">
                                    {p.label}
                                    {p.type === 'category' && <span className="text-[8px] bg-pac-yellow text-black px-1">DIR</span>}
                                </span>
                                <span className={`text-[10px] font-mono opacity-60 group-hover:opacity-100 ${p.type === 'category' ? 'uppercase tracking-widest' : ''}`}>
                                    {p.desc}
                                </span>
                            </div>

                            {/* Chevron for categories */}
                            {p.type === 'category' && (
                                <span className="font-arcade text-[10px] opacity-50 group-hover:opacity-100 animate-pulse">
                                    OPEN
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Tools Area (SecretCards, etc) */}
            {message.toolCall && (
                <div className="px-5 pb-5">
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