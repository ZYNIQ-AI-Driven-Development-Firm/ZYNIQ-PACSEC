import React, { useState, useRef, useEffect } from 'react';
import { Loader } from './components/Loader';
import { PacThinking } from './components/PacThinking';
import { ChatMessage } from './components/ChatMessage';
import { NewsCard } from './components/NewsCard';
import { processUserRequest } from './services/geminiService';
import { Message, PromptItem, IntegrationItem } from './types';

// Helper component for the 'C' replacement (Pacman Icon)
export const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.05em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

const INTEGRATION_TOOLS: IntegrationItem[] = [
    { id: 'tool_vt', name: 'VIRUS TOTAL', desc: 'Analyze suspicious files, domains, IPs and URLs to detect malware.', icon: '🦠', url: 'https://www.virustotal.com/gui/home/upload', type: 'external' },
    { id: 'tool_hibp', name: 'HAVE I BEEN PWNED', desc: 'Check if your email or phone is in a data breach.', icon: '🕵️', url: 'https://haveibeenpwned.com/', type: 'external' },
    { id: 'tool_cyberchef', name: 'CYBER CHEF', desc: 'The Cyber Swiss Army Knife. Encrypt, Encode, Compress, Analyze.', icon: '🍳', url: 'https://gchq.github.io/CyberChef/', type: 'external' },
    { id: 'tool_shodan', name: 'SHODAN', desc: 'Search engine for Internet-connected devices.', icon: '🌐', url: 'https://www.shodan.io/', type: 'external' },
    { id: 'tool_cve', name: 'CVE MITRE', desc: 'Identify, define, and catalog publicly disclosed vulnerabilities.', icon: '🛡️', url: 'https://cve.mitre.org/', type: 'external' },
    { id: 'tool_jwt', name: 'JWT.IO', desc: 'Debug and decode JSON Web Tokens.', icon: '🔑', url: 'https://jwt.io/', type: 'external' }
];

export const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Menu Button Animation State
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [isInitialPhase, setIsInitialPhase] = useState(true);

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

  // Initial Menu Button Animation
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsMenuExpanded(false);
        setIsInitialPhase(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
      if (ms < 60000) return `${(ms/1000).toString().padStart(2,'0')}S`;
      if (ms < 3600000) return `${(ms/60000).toString().padStart(2,'0')}M`;
      return `${(ms/3600000).toString().padStart(2,'0')}H`;
  };

  const handleOpenIntegrations = () => {
      setHasStarted(true);
      const msg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'INITIALIZING EXTERNAL SECURITY MODULES.\nSELECT A TOOL TO ESTABLISH UPLINK.',
          integrations: INTEGRATION_TOOLS,
          expiresAt: Date.now() + selectedTTL,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, msg]);
  };

  const handleIntegrationConnect = (toolId: string) => {
      // Logic to unlock new commands based on tool connection
      // For now, we simulate a system message acknowledging the connection
      const toolName = INTEGRATION_TOOLS.find(t => t.id === toolId)?.name || 'MODULE';
      
      const confirmMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: `UPLINK ESTABLISHED: ${toolName}\nNEW PROTOCOLS AVAILABLE IN MENU.`,
          expiresAt: Date.now() + selectedTTL,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, confirmMsg]);
  };

  // --- MENU DATA STRUCTURE ---
  const menuData: PromptItem[] = [
      {
          id: 'cat_quick_note',
          label: 'QUICK NOTE',
          cmd: 'I need to create a secure note now',
          desc: 'CREATE & LOCK',
          type: 'command'
      },
      {
          id: 'cat_access',
          label: 'ACCESS CONTROL',
          cmd: 'OPEN_ACCESS_MENU',
          desc: 'PASSWORDS, PINS, PHRASES',
          type: 'category',
          items: [
              { id: 'cmd_pass_strong', label: 'STRONG PASSWORD', cmd: 'Generate a strong secure password 24 chars', desc: 'MAX ENTROPY', type: 'command' },
              { id: 'cmd_pass_mem', label: 'MEMORABLE PASS', cmd: 'Generate a memorable but secure password', desc: 'HUMAN READABLE', type: 'command' },
              { id: 'cmd_pass_wifi', label: 'WIFI PASSWORD', cmd: 'Generate a 16 char alphanumeric password for WiFi', desc: 'NO SYMBOLS', type: 'command' },
              { id: 'cmd_pin', label: 'SECURE PIN', cmd: 'Generate a 6-digit secure PIN', desc: 'NUMERIC ONLY', type: 'command' }
          ]
      },
      {
          id: 'cat_dev',
          label: 'DEVELOPER KEYS',
          cmd: 'OPEN_DEV_MENU',
          desc: 'API, JWT, FRAMEWORKS',
          type: 'category',
          items: [
              { id: 'cmd_jwt', label: 'JWT SECRET', cmd: 'Generate a 256-bit JWT signing secret', desc: 'HMAC-SHA256', type: 'command' },
              { id: 'cmd_api', label: 'API KEY', cmd: 'Generate a standard API Key 32 chars', desc: 'SERVICE AUTH', type: 'command' },
              { id: 'cmd_laravel', label: 'LARAVEL KEY', cmd: 'Generate a base64 32-byte encryption key', desc: 'APP_KEY', type: 'command' },
              { id: 'cmd_django', label: 'DJANGO SECRET', cmd: 'Generate a 50 char random string with symbols', desc: 'SECRET_KEY', type: 'command' },
              { id: 'cmd_uuid', label: 'UUID V4', cmd: 'Generate a UUID v4', desc: 'UNIQUE ID', type: 'command' }
          ]
      },
      {
          id: 'cat_cyber',
          label: 'CYBER TOOLS',
          cmd: 'OPEN_CYBER_MENU',
          desc: 'RSA, HASHING, ENCODING',
          type: 'category',
          items: [
              { id: 'cmd_rsa', label: 'RSA KEY FORGE', cmd: 'Generate RSA Key Pair', desc: 'PUBLIC/PRIVATE KEY', type: 'command' },
              { id: 'cmd_hash', label: 'GHOST HASHER', cmd: 'Open Ghost Hash Tool', desc: 'SHA-256 / SHA-512', type: 'command' },
              { id: 'cmd_hex_128', label: '128-BIT HEX', cmd: 'Generate 128-bit hex string', desc: 'RAW HEX', type: 'command' },
              { id: 'cmd_b64_256', label: '256-BIT BASE64', cmd: 'Generate 256-bit base64 string', desc: 'ENCODED BYTES', type: 'command' }
          ]
      },
      {
          id: 'cat_bundles',
          label: 'LOOT CRATES',
          cmd: 'OPEN_BUNDLES_MENU',
          desc: 'MULTI-KEY RECIPES',
          type: 'category',
          items: [
              { id: 'cmd_bundle_oauth', label: 'OAUTH STACK', cmd: 'Generate OAuth Stack', desc: 'CLIENT ID + SECRET', type: 'command' },
              { id: 'cmd_bundle_aws', label: 'CLOUD CREDENTIALS', cmd: 'Generate Cloud Access Key and Secret Key pair', desc: 'ACCESS + SECRET KEY', type: 'command' },
              { id: 'cmd_bundle_app', label: 'WEB APP START', cmd: 'Generate Web App Starter Keys', desc: 'DB + JWT + API', type: 'command' },
              { id: 'cmd_bundle_webhook', label: 'WEBHOOK SEC', cmd: 'Generate Webhook Signing Secret and Validation Token', desc: 'SIGN + VERIFY', type: 'command' }
          ]
      },
      {
          id: 'cat_notes',
          label: 'SECURE NOTES',
          cmd: 'OPEN_NOTES_MENU',
          desc: 'SELF-DESTRUCT MSGS',
          type: 'category',
          items: [
              { id: 'cmd_note_create', label: 'CREATE NOTE', cmd: 'Create a new secure note container', desc: 'NEW SECURE NOTE', type: 'command' },
              { id: 'cmd_note_howto', label: 'HOW IT WORKS', cmd: 'Explain how Zero Knowledge Notes work.', desc: 'TTL & ENCRYPTION', type: 'command' },
              { id: 'cmd_note_server', label: 'SERVER CONFIG', cmd: 'Template for sharing server credentials.', desc: 'CREDENTIAL TEMPLATE', type: 'command' }
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

  const handleReadMoreNews = () => {
      setHasStarted(true);
      const newsGuideMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'SECURE ARCHIVES ACCESSED.\n\nEXPLORE INTELLIGENCE CATEGORIES BELOW OR SEARCH SPECIFIC THREATS (E.G. "PHISHING", "JWT").',
          prompts: menuData,
          expiresAt: Date.now() + selectedTTL,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, newsGuideMsg]);
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
      <header className={`fixed top-0 left-0 right-0 p-2 md:p-4 z-40 transition-all duration-500 bg-black/90 border-b-2 md:border-b-4 border-pac-blue ${hasStarted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center md:justify-between">
             {/* Hidden on mobile to clean up view */}
             <div className="hidden md:flex items-center gap-4">
                 <div className="flex flex-col">
                    <span className="text-pac-ghostRed font-arcade text-[10px] animate-pulse">1UP</span>
                    <span className="text-white font-arcade text-xs">00</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-pac-yellow font-arcade text-[10px]">HIGH SCORE</span>
                    <span className="text-white font-arcade text-xs">999999</span>
                 </div>
             </div>
             
             {/* Centered Logo on Mobile */}
             <h1 className="font-arcade text-pac-yellow text-xs md:text-sm tracking-widest border-2 border-pac-yellow px-2 py-1 shadow-[2px_2px_0_0_rgba(242,201,76,0.5)] md:shadow-[4px_4px_0_0_rgba(242,201,76,0.5)] flex items-center gap-[0.1em]">
                PA<PacChar />-SE<PacChar />
             </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-4xl mx-auto p-1 transition-all duration-500 flex flex-col relative z-10 ${!hasStarted ? 'h-screen overflow-hidden pb-32' : 'pt-20 md:pt-24 pb-36 md:pb-40'}`}>
        
        {/* Intro State Layout */}
        {!hasStarted && (
           <div className="flex flex-col h-full w-full justify-between px-4 pt-8 md:pt-16 animate-fade-in relative z-20">
               
               {/* TOP: Logo & Subtext */}
               <div className="flex flex-col items-center">
                    <div className="mb-4 border-4 border-pac-blue p-3 md:p-4 bg-black shadow-[4px_4px_0_0_#1e293b] md:shadow-[8px_8px_0_0_#1e293b] w-full max-w-xl scale-95 md:scale-100 origin-top">
                        <div className="text-4xl md:text-6xl font-arcade text-pac-yellow mb-2 md:mb-4 tracking-tighter drop-shadow-md flex items-center justify-center gap-[0.05em]">
                            <span>PA</span>
                            <PacChar className="mx-[0.02em]" />
                            <span>SE</span>
                            <PacChar className="mx-[0.02em]" />
                        </div>
                        <div className="text-pac-ghostRed text-[9px] md:text-xs font-arcade tracking-[0.2em] blink-effect mt-2 md:mt-3 text-center">
                            Infinite Secrets. Zero Nonsense.
                        </div>
                    </div>
                    
                    <p className="text-pac-ghostCyan font-arcade text-[9px] md:text-[10px] max-w-md mx-auto leading-relaxed md:leading-loose mt-2 text-center">
                        NO SERVER STORAGE.<br/>
                        100% CLIENT-SIDE ENCRYPTION.
                    </p>
               </div>

               {/* BOTTOM: News Card */}
               <div className="w-full mb-28 md:mb-28">
                  <NewsCard onReadMore={handleReadMoreNews} />
               </div>
           </div>
        )}

        {/* Chat History */}
        {hasStarted && (
            <div className="space-y-6 md:space-y-8 w-full px-2 md:px-0">
                {messages.map((msg) => (
                   <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onExpire={removeMessage}
                        onPromptInteract={handlePromptInteraction}
                        onIntegrationConnect={handleIntegrationConnect}
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
            ? 'fixed bottom-8 left-1/2 -translate-x-1/2 max-w-xl w-full px-4' 
            : 'fixed bottom-6 left-0 right-0 bg-[#080808] border-t-2 md:border-t-4 border-pac-blue p-2 md:p-4 pb-6 md:pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'
        }
      `}>
          <div className={`mx-auto w-full max-w-4xl flex gap-2 md:gap-3 items-stretch h-12 md:h-14`}>
            
            {/* Start / Menu Button (Collapsible) */}
            {!isProcessing && (
                <button
                    type="button"
                    onClick={handleShowMainMenu}
                    onMouseEnter={() => setIsMenuExpanded(true)}
                    onMouseLeave={() => setIsMenuExpanded(false)}
                    className={`
                        group flex-shrink-0 font-arcade text-[10px] border-2 transition-all duration-500 ease-in-out flex items-center gap-2 uppercase tracking-wider overflow-hidden relative
                        bg-pac-yellow text-black border-pac-yellow shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0_0_white] hover:translate-x-[1px] hover:translate-y-[1px]
                        ${isMenuExpanded ? 'w-14 md:w-52 px-0 md:px-4 justify-center' : 'w-14 px-0 justify-center'}
                        ${isInitialPhase ? 'animate-pulse' : ''}
                    `}
                    title="Open Prompts Menu"
                >
                     {/* List Icon */}
                     <span className="text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 100 100" className="w-5 h-5 stroke-current stroke-[8] fill-none" strokeLinecap="round">
                            <path d="M20 25 L80 25 M20 50 L80 50 M20 75 L80 75" />
                        </svg>
                     </span>
                     
                     {/* Text Label - Hidden on mobile, expanded on desktop */}
                     <span className={`transition-opacity duration-300 font-bold whitespace-nowrap hidden md:block ${isMenuExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        PROMPTS MENU
                     </span>
                </button>
            )}

            {/* Main Input Container - Styled as CRT Terminal */}
            <div className={`
                flex-1 relative flex items-center bg-black border-2 transition-all duration-300 group
                ${isProcessing 
                    ? 'border-gray-800 opacity-50' 
                    : 'border-pac-blue shadow-[0_0_10px_rgba(30,58,138,0.2)] md:shadow-[0_0_15px_rgba(30,58,138,0.3)] focus-within:border-pac-ghostCyan focus-within:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                }
            `}>
                
                {/* Timer Selector - Digital Readout Style */}
                <button 
                    onClick={cycleTTL}
                    className="h-full px-2 md:px-3 border-r-2 border-gray-800 bg-gray-900/40 hover:bg-gray-800/80 transition-colors flex flex-col justify-center items-center group/ttl min-w-[44px] md:min-w-[64px]"
                    title="Cycle Self-Destruct Timer"
                >
                    <span className="font-arcade text-[6px] md:text-[7px] text-gray-500 mb-0.5 md:mb-1 tracking-widest group-hover/ttl:text-pac-ghostCyan transition-colors hidden md:block">TTL</span>
                    <span className={`font-mono text-[10px] md:text-xs font-bold tracking-wider ${selectedTTL < 60000 ? 'text-red-500 animate-pulse' : 'text-pac-yellow'}`}>
                        {formatTTL(selectedTTL)}
                    </span>
                </button>

                 {/* New (+) Button for Integrations */}
                 <button 
                    onClick={handleOpenIntegrations}
                    className="h-full px-2 md:px-3 border-r-2 border-gray-800 bg-gray-900/40 hover:bg-indigo-900/40 text-gray-500 hover:text-indigo-400 transition-colors flex items-center justify-center font-bold text-lg md:text-xl"
                    title="Connect Security Tools"
                >
                    +
                </button>

                {/* Prompt Char */}
                <span className={`font-arcade text-sm pl-2 md:pl-3 select-none transition-colors hidden md:inline ${isProcessing ? 'text-gray-600' : 'text-pac-ghostCyan animate-pulse'}`}>
                    {'>'}
                </span>
                
                {/* Text Input */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder={hasStarted ? "ENTER COMMAND..." : "INITIATE SEQUENCE..."}
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 font-mono text-sm md:text-base p-2 md:p-3 tracking-wider caret-pac-ghostCyan"
                    disabled={isProcessing}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />

                {/* Enter Button - Integrated Action */}
                <button 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isProcessing}
                    className={`
                        h-full px-3 md:px-5 font-arcade text-[10px] uppercase tracking-widest transition-all border-l-2 border-gray-800 flex items-center justify-center
                        ${!inputValue.trim() || isProcessing 
                            ? 'text-gray-700 bg-black cursor-not-allowed' 
                            : 'bg-pac-blue text-white hover:bg-pac-yellow hover:text-black hover:font-bold hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]'
                        }
                    `}
                    title="Execute"
                >
                    {isProcessing ? (
                        <span className="animate-spin">⟳</span>
                    ) : (
                        <>
                            <span className="hidden md:inline">ENTER</span>
                            <span className="md:hidden text-sm">↵</span>
                        </>
                    )}
                </button>
            </div>
          </div>
      </div>

      {/* Footer Credit */}
      <footer className="fixed bottom-0 w-full text-center z-[60] pointer-events-auto bg-black/90 backdrop-blur-sm border-t border-gray-900/50 py-1 md:py-1">
         <a 
            href="https://zyniq.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-block font-arcade text-[9px] md:text-[10px] transition-all duration-300 ease-out brightness-50 hover:brightness-125 hover:scale-110"
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