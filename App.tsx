import React, { useState, useRef, useEffect } from 'react';
import { Loader } from './components/Loader';
import { PacThinking } from './components/PacThinking';
import { SecretCard } from './components/SecretCard';
import { processUserRequest } from './services/geminiService';
import { Message } from './types';

export const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setHasStarted(true);
    setInputValue('');
    setShowMenu(false);
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Call Gemini
    const response = await processUserRequest(text);

    setIsProcessing(false);
    
    const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        toolCall: response.toolCall,
        isError: response.isError
    };
    
    setMessages(prev => [...prev, botMsg]);
  };

  const handleSuggestion = (text: string) => {
      handleSendMessage(text);
  };

  if (loadingApp) {
    return <Loader onComplete={() => setLoadingApp(false)} />;
  }

  const suggestions = [
      { label: 'Generate strong password', icon: '🔒', desc: 'Secure random password' },
      { label: 'Create JWT secret', icon: '🔑', desc: '256-bit or 512-bit signing keys' },
      { label: 'Generate API Key', icon: '🎟️', desc: 'Base64 or Hex API credentials' },
      { label: 'New UUID v4', icon: '🆔', desc: 'Unique identifier' }
  ];

  return (
    <div className="min-h-screen bg-pac-black text-white selection:bg-pac-ghostPink selection:text-black font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      {!hasStarted && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pac-blue/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pac-yellow/5 rounded-full blur-[80px]"></div>
          </div>
      )}

      {/* Header (Only visible when chat starts) */}
      <header className={`fixed top-0 left-0 right-0 p-6 z-40 transition-all duration-500 ${hasStarted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-pac-yellow flex items-center justify-center">
                 <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
             </div>
             <h1 className="font-arcade text-pac-yellow text-lg tracking-wider">PAC-SEC</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-4xl mx-auto p-6 transition-all duration-500 flex flex-col relative z-10 ${!hasStarted ? 'justify-center items-center min-h-screen' : 'pt-24 pb-32'}`}>
        
        {/* Intro State */}
        {!hasStarted && (
           <div className="text-center animate-fade-in mb-12 flex flex-col items-center">
               <div className="inline-block relative mb-4">
                   <div className="absolute -inset-4 bg-pac-yellow/20 rounded-full blur-xl animate-pulse"></div>
                   <div className="relative text-6xl font-arcade text-pac-yellow drop-shadow-[0_0_10px_rgba(242,201,76,0.8)] leading-tight">
                       SECURE<br/>GENERATOR
                   </div>
               </div>

               <div className="text-pac-ghostCyan text-sm font-arcade tracking-widest mb-8">
                   NO SERVER STORAGE. 100% PRIVATE.
               </div>
               
               <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                   High-entropy, client-side key generation powered by AI intent recognition.
               </p>
           </div>
        )}

        {/* Chat History */}
        {hasStarted && (
            <div className="space-y-8 w-full">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Message Bubble */}
                        {msg.text && (
                            <div className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-pac-blue text-white rounded-br-none border border-white/10' 
                                : msg.isError 
                                    ? 'bg-red-950/50 text-red-500 border border-red-500/50 font-arcade text-xs leading-relaxed tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.2)]'
                                    : 'text-gray-300 font-medium'
                            }`}>
                                {msg.role === 'assistant' && !msg.isError && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-arcade text-pac-ghostPink uppercase">
                                        <span>System</span>
                                    </div>
                                )}
                                {msg.role === 'assistant' && msg.isError && (
                                    <div className="flex items-center gap-2 mb-2 text-xs font-arcade text-red-500 uppercase animate-pulse">
                                        <span>⚠️ SYSTEM ERROR</span>
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        )}

                        {/* Interactive Tool Card */}
                        {msg.toolCall && (
                            <SecretCard config={msg.toolCall} />
                        )}
                    </div>
                ))}
                
                {/* Loading State */}
                {isProcessing && (
                    <div className="flex justify-start w-full">
                        <PacThinking />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </main>

      {/* Input Area (Centered initially, Sticky Bottom after start) */}
      <div className={`
        transition-all duration-700 ease-in-out w-full z-50
        ${!hasStarted ? 'fixed top-1/2 left-1/2 -translate-x-1/2 translate-y-32 max-w-2xl px-6' : 'fixed bottom-0 left-0 right-0 bg-pac-black/80 backdrop-blur-md border-t border-white/10 p-6'}
      `}>
          <div className={`mx-auto ${!hasStarted ? 'w-full' : 'max-w-4xl'}`}>
            
            {/* Command Trigger */}
            {!isProcessing && (
                <div className={`flex mb-4 ${!hasStarted ? 'justify-center' : 'justify-start'}`}>
                    <button
                        type="button"
                        onClick={() => setShowMenu(true)}
                        className={`
                            font-arcade text-xs px-6 py-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2
                            ${!hasStarted 
                                ? 'bg-pac-yellow text-black border-pac-yellow hover:bg-white hover:border-white animate-pulse hover:animate-none shadow-[0_0_15px_rgba(242,201,76,0.5)]' 
                                : 'bg-gray-900 text-pac-ghostCyan border-gray-700 hover:border-pac-ghostCyan'}
                        `}
                    >
                        <span>{hasStarted ? 'COMMANDS' : 'PROMPTS MENU'}</span>
                        {!hasStarted && <span className="ml-2">▶</span>}
                    </button>
                </div>
            )}

            {/* Input Box */}
            <div className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-pac-yellow via-pac-ghostRed to-pac-ghostCyan rounded-full opacity-75 blur transition duration-1000 group-hover:duration-200 ${isProcessing ? 'animate-pulse' : ''}`}></div>
                <div className="relative flex items-center bg-black rounded-full px-6 py-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder={hasStarted ? "Message..." : "Type request manually or use menu..."}
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium"
                        disabled={isProcessing}
                        autoFocus
                    />
                    <button 
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || isProcessing}
                        className="ml-4 text-pac-yellow hover:text-white transition-colors disabled:opacity-50"
                    >
                        <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </div>
          </div>
      </div>

      {/* Command Menu Popup */}
      {showMenu && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" 
            onClick={() => setShowMenu(false)}
        >
            <div 
                className="bg-gray-900 border-2 border-pac-yellow p-1 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(242,201,76,0.15)] transform transition-all scale-100" 
                onClick={e => e.stopPropagation()}
            >
                <div className="border border-pac-yellow/20 rounded-lg p-6 bg-black/50">
                    <h2 className="font-arcade text-pac-yellow text-center mb-6 text-xl tracking-widest drop-shadow-md">SELECT MODULE</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {suggestions.map(s => (
                            <button 
                                key={s.label} 
                                onClick={() => handleSuggestion(s.label)}
                                className="group flex items-center gap-4 p-4 rounded-lg bg-gray-800/50 hover:bg-pac-blue border border-transparent hover:border-pac-ghostCyan transition-all duration-200 text-left"
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                                <div>
                                    <div className="text-sm font-bold text-gray-200 group-hover:text-white font-sans">{s.label}</div>
                                    <div className="text-xs text-gray-500 group-hover:text-pac-ghostCyan font-mono">{s.desc}</div>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 text-pac-yellow">
                                    ▶
                                </div>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowMenu(false)} 
                        className="mt-6 w-full text-center text-gray-600 font-arcade text-[10px] hover:text-red-500 transition-colors tracking-widest"
                    >
                        [ CLOSE TERMINAL ]
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};