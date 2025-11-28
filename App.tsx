import React, { useState, useRef, useEffect } from 'react';
import { Loader } from './components/Loader';
import { PacThinking } from './components/PacThinking';
import { ChatMessage } from './components/ChatMessage';
import { processUserRequest } from './services/geminiService';
import { Message, PromptItem } from './types';

// Helper component for the 'C' replacement (Pacman Icon)
const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.1em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      {/* Center 50,50. Radius 50. Mouth approx 60 degrees open. */}
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

export const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Zero Knowledge Note settings
  const ttlOptions = [30000, 60000, 300000, 3600000]; // 30s, 1m, 5m, 1h
  const [selectedTTL, setSelectedTTL] = useState(60000);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setHasStarted(true);
    setInputValue('');
    
    const expiry = Date.now() + selectedTTL;

    // Add User Message
    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text,
        expiresAt: expiry,
        originalTTL: selectedTTL
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Call Gemini
    const response = await processUserRequest(text);

    setIsProcessing(false);
    
    // Assistant inherits the same TTL context
    const botExpiry = Date.now() + selectedTTL;
    
    const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        toolCall: response.toolCall,
        isError: response.isError,
        expiresAt: botExpiry,
        originalTTL: selectedTTL
    };
    
    setMessages(prev => [...prev, botMsg]);
  };

  const cycleTTL = () => {
    const currentIndex = ttlOptions.indexOf(selectedTTL);
    const nextIndex = (currentIndex + 1) % ttlOptions.length;
    setSelectedTTL(ttlOptions[nextIndex]);
  };

  const formatTTL = (ms: number) => {
      if (ms < 60000) return `${(ms/1000).toString().padStart(2,'0')}s`;
      if (ms < 3600000) return `${(ms/60000).toString().padStart(2,'0')}m`;
      return `${(ms/3600000).toString().padStart(2,'0')}h`;
  };

  // --- MENU DATA STRUCTURE ---
  const menuData: PromptItem[] = [
      {
          id: 'cat_access',
          label: 'ACCESS CONTROL',
          cmd: 'OPEN_ACCESS_MENU',
          desc: 'PASSWORDS, PINS, PHRASES',
          type: 'category',
          items: [
              { id: 'cmd_pass_strong', label: 'STRONG PASSWORD', cmd: 'Generate a strong secure password 24 chars', desc: 'MAX ENTROPY', type: 'command' },
              { id: 'cmd_pass_mem', label: 'MEMORABLE PASS', cmd: 'Generate a memorable but secure password', desc: 'HUMAN READABLE', type: 'command' },
              { id: 'cmd_pin', label: 'SECURE PIN', cmd: 'Generate a 6-digit secure PIN', desc: 'NUMERIC ONLY', type: 'command' }
          ]
      },
      {
          id: 'cat_dev',
          label: 'DEVELOPER TOOLS',
          cmd: 'OPEN_DEV_MENU',
          desc: 'API KEYS, JWT, TOKENS',
          type: 'category',
          items: [
              { id: 'cmd_jwt', label: 'JWT SECRET', cmd: 'Generate a 256-bit JWT signing secret', desc: 'HMAC-SHA256', type: 'command' },
              { id: 'cmd_api', label: 'API KEY', cmd: 'Generate a standard API Key 32 chars', desc: 'SERVICE AUTH', type: 'command' },
              { id: 'cmd_uuid', label: 'UUID V4', cmd: 'Generate a UUID v4', desc: 'UNIQUE ID', type: 'command' }
          ]
      },
      {
          id: 'cat_crypto',
          label: 'CRYPTO & HEX',
          cmd: 'OPEN_CRYPTO_MENU',
          desc: 'RAW BYTES, KEYS',
          type: 'category',
          items: [
              { id: 'cmd_hex_128', label: '128-BIT HEX', cmd: 'Generate 128-bit hex string', desc: 'RAW HEX', type: 'command' },
              { id: 'cmd_b64_256', label: '256-BIT BASE64', cmd: 'Generate 256-bit base64 string', desc: 'ENCODED BYTES', type: 'command' },
              { id: 'cmd_rsa_sim', label: 'ENCRYPTION KEY', cmd: 'Generate an encryption key 256 bit', desc: 'AES PRE-SHARED', type: 'command' }
          ]
      },
      {
          id: 'cat_bundles',
          label: 'LOOT CRATES',
          cmd: 'OPEN_BUNDLES_MENU',
          desc: 'FULL STACK BUNDLES',
          type: 'category',
          items: [
              { id: 'cmd_bundle_oauth', label: 'OAUTH STACK', cmd: 'Generate OAuth Stack', desc: 'CLIENT ID + SECRET', type: 'command' },
              { id: 'cmd_bundle_app', label: 'WEB APP START', cmd: 'Generate Web App Starter Keys', desc: 'DB + JWT + API', type: 'command' }
          ]
      }
  ];

  const handlePromptInteraction = (item: PromptItem) => {
      if (item.type === 'category') {
          // Drill down into category
          const promptMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              text: `CATEGORY_SELECTED: ${item.label}`,
              prompts: item.items, // Show children
              expiresAt: Date.now() + selectedTTL,
              originalTTL: selectedTTL
          };
          setMessages(prev => [...prev, promptMsg]);
      } else {
          // Execute command
          handleSendMessage(item.cmd);
      }
  };

  const handleShowMainMenu = () => {
      setHasStarted(true);
      const promptMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'SELECT_OPERATION_MODE:',
          prompts: menuData, // Show top level categories
          expiresAt: Date.now() + selectedTTL,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, promptMsg]);
  };

  if (loadingApp) {
    return <Loader onComplete={() => setLoadingApp(false)} />;
  }

  return (
    <div className="min-h-screen bg-pac-black text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Arcade Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Header (Only visible when chat starts) */}
      <header className={`fixed top-0 left-0 right-0 p-4 z-40 transition-all duration-500 bg-black/90 border-b-4 border-pac-blue ${hasStarted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="flex flex-col">
                    <span className="text-pac-ghostRed font-arcade text-[10px] animate-pulse">1UP</span>
                    <span className="text-white font-arcade text-xs">00</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-pac-yellow font-arcade text-[10px]">HIGH SCORE</span>
                    <span className="text-white font-arcade text-xs">999999</span>
                 </div>
             </div>
             <h1 className="font-arcade text-pac-yellow text-sm tracking-widest border-2 border-pac-yellow px-2 py-1 shadow-[4px_4px_0_0_rgba(242,201,76,0.5)] flex items-center gap-[0.1em]">
                PA<PacChar />-SE<PacChar />
             </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-4xl mx-auto p-2 transition-all duration-500 flex flex-col relative z-10 ${!hasStarted ? 'justify-center items-center min-h-screen' : 'pt-28 pb-40'}`}>
        
        {/* Intro State */}
        {!hasStarted && (
           <div className="text-center animate-fade-in mb-6 flex flex-col items-center z-20 -translate-y-12">
               
               <div className="mb-4 border-4 border-pac-blue p-4 bg-black shadow-[8px_8px_0_0_#1e293b]">
                   <div className="text-4xl md:text-6xl font-arcade text-pac-yellow mb-4 tracking-tighter drop-shadow-md flex items-center justify-center gap-[0.05em]">
                       <span>PA</span>
                       <PacChar className="mx-[0.02em]" />
                       <span>SE</span>
                       <PacChar className="mx-[0.02em]" />
                   </div>
                   <div className="text-pac-ghostRed text-xs font-arcade tracking-[0.2em] blink-effect mt-3">
                       Infinite Secrets. Zero Nonsense.
                   </div>
               </div>
               
               <p className="text-pac-ghostCyan font-arcade text-[10px] max-w-md mx-auto leading-loose mt-2">
                   NO SERVER STORAGE.<br/>
                   100% CLIENT-SIDE ENCRYPTION.
               </p>
           </div>
        )}

        {/* Chat History */}
        {hasStarted && (
            <div className="space-y-8 w-full">
                {messages.map((msg) => (
                   <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onExpire={removeMessage}
                        onPromptInteract={handlePromptInteraction}
                    />
                ))}
                
                {/* Loading State */}
                {isProcessing && (
                    <div className="flex justify-start w-full pl-2">
                        <PacThinking />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </main>

      {/* Input Area */}
      <div className={`
        transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full z-50
        ${!hasStarted 
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 translate-y-24 max-w-xl px-4' 
            : 'fixed bottom-0 left-0 right-0 bg-[#050505] border-t-4 border-pac-blue p-3 pb-6 md:pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'
        }
      `}>
          <div className={`mx-auto ${!hasStarted ? 'w-full' : 'max-w-4xl flex gap-3 items-stretch'}`}>
            
            {/* Command Trigger (Left side when started, Inline Row when intro) */}
            {!isProcessing && (
                <div className={`${!hasStarted ? 'flex items-center justify-center gap-4 mb-4' : 'flex-shrink-0'}`}>
                    <button
                        type="button"
                        onClick={handleShowMainMenu}
                        className={`
                            group font-arcade text-[10px] border-2 transition-all duration-100 flex items-center justify-center gap-2 uppercase tracking-wider overflow-hidden
                            ${!hasStarted 
                                ? 'px-6 py-2 bg-pac-yellow text-black border-white hover:translate-y-[2px] shadow-[4px_4px_0_0_white] hover:shadow-none active:translate-y-[4px] active:shadow-none' 
                                : 'h-full px-3 bg-gray-900 text-pac-ghostCyan border-gray-700 hover:border-pac-ghostCyan hover:bg-gray-800'
                            }
                        `}
                        title="Open Command List"
                    >
                         <span className={!hasStarted ? 'text-sm' : 'text-sm'}>{!hasStarted ? '🕹️' : '☰'}</span>
                         {(!hasStarted || window.innerWidth > 640) && <span>{!hasStarted ? 'PROMPTS_LIST' : 'CMD'}</span>}
                    </button>
                    {/* Helper text only on intro */}
                    {!hasStarted && (
                        <div className="font-arcade text-[10px] text-pac-ghostCyan animate-pulse whitespace-nowrap pt-1">
                            OR TYPE_YOURS_
                        </div>
                    )}
                </div>
            )}

            {/* Main Input Container */}
            <div className={`
                flex-1 relative flex items-center bg-black border-4 transition-colors
                ${isProcessing ? 'border-gray-800' : 'border-pac-blue focus-within:border-pac-yellow'}
                ${!hasStarted ? 'p-2 shadow-[8px_8px_0_0_#1e293b]' : 'p-1'}
            `}>
                
                {/* Timer Selector (Digital Clock Style) */}
                <button 
                    onClick={cycleTTL}
                    className={`
                        mr-2 font-arcade text-[10px] border-r-2 border-gray-800 px-3 py-2 transition-colors flex flex-col items-center justify-center leading-tight
                        ${selectedTTL < 60000 ? 'text-red-500' : 'text-pac-yellow'}
                        hover:bg-gray-900 group
                    `}
                    title="Self-Destruct Timer"
                >
                    <span className="text-[8px] text-gray-500 mb-0.5 group-hover:text-gray-300">TTL</span>
                    <span>{formatTTL(selectedTTL)}</span>
                </button>

                {/* Blinking Prompt Char */}
                <span className="font-arcade text-pac-yellow text-sm animate-pulse pl-1 md:pl-2 select-none">{'>'}</span>
                
                {/* Text Input */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder={hasStarted ? "ENTER COMMAND..." : "INITIATE SEQUENCE..."}
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-700 font-mono text-sm md:text-base p-2 tracking-wide caret-pac-yellow"
                    disabled={isProcessing}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />

                {/* Enter Button (Arcade Style) */}
                <button 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isProcessing}
                    className={`
                        ml-2 font-arcade text-[10px] px-4 py-2 border-l-2 border-gray-800 transition-all uppercase tracking-widest
                        ${!inputValue.trim() || isProcessing 
                            ? 'text-gray-600 cursor-not-allowed' 
                            : 'bg-pac-blue text-white hover:bg-pac-yellow hover:text-black hover:font-bold'
                        }
                    `}
                >
                    {isProcessing ? '...' : 'ENTER'}
                </button>
            </div>
          </div>
      </div>

      {/* Footer Credit */}
      <footer className="fixed bottom-2 w-full text-center z-[60] pointer-events-auto">
         <a 
            href="https://zyniq.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-block font-arcade text-[10px] transition-all duration-300 ease-out brightness-50 hover:brightness-125 hover:scale-110"
         >
            <span className="text-pac-yellow font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(242,201,76,0.8)] transition-all">PACSEC BY </span>
            <span className="text-[#ea2323] font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(234,35,35,0.8)] transition-all">ZYNIQ</span>
         </a>
      </footer>

      <style>{`
        .blink-effect {
          animation: blink 2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}