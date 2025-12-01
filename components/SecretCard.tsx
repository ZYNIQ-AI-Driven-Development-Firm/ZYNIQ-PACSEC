import React, { useState, useEffect, useCallback } from 'react';
import { SecretConfig } from '../types';
import { generateSecurePassword, generateSecureHex, generateSecureBase64, generateUUID } from '../utils/cryptoUtils';

interface SecretCardProps {
  config: SecretConfig;
}

// Retro Tooltip Helper
const RetroTooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="group relative flex-1">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black border border-white p-1 text-[8px] text-white font-arcade uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-[2px_2px_0_0_rgba(255,255,255,0.5)] hidden md:block">
            {text}
        </div>
    </div>
);

export const SecretCard: React.FC<SecretCardProps> = ({ config }) => {
  // State
  const [secret, setSecret] = useState('');
  const [length, setLength] = useState(config.length || 16);
  const [bits, setBits] = useState(config.bits || 256);
  const [useSymbols, setUseSymbols] = useState(config.useSymbols ?? true);
  const [useNumbers, setUseNumbers] = useState(config.useNumbers ?? true);
  const [useUppercase, setUseUppercase] = useState(config.useUppercase ?? true);
  const [format, setFormat] = useState<'hex' | 'base64'>(config.format || 'hex');
  const [copied, setCopied] = useState(false);

  // Generation Logic
  const generate = useCallback(() => {
    if (config.type === 'password') {
      setSecret(generateSecurePassword(length, { symbols: useSymbols, numbers: useNumbers, uppercase: useUppercase }));
    } else if (config.type === 'jwt' || config.type === 'apiKey') {
      if (format === 'hex') {
        setSecret(generateSecureHex(bits));
      } else {
        setSecret(generateSecureBase64(bits));
      }
    } else if (config.type === 'uuid') {
      setSecret(generateUUID());
    }
    setCopied(false);
  }, [config.type, length, bits, useSymbols, useNumbers, useUppercase, format]);

  // Generate on mount or config change
  useEffect(() => {
    generate();
  }, [generate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTitle = () => {
    switch(config.type) {
        case 'apiKey': return 'API KEY';
        case 'jwt': return 'JWT SECRET';
        case 'uuid': return 'UUID v4';
        default: return config.type.toUpperCase();
    }
  };

  // Strength Calculation
  const getStrengthPoints = useCallback(() => {
    if (config.type !== 'password') return 0;
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (length >= 24) score++;
    if (useUppercase) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;
    return score; // Max 6
  }, [length, useUppercase, useNumbers, useSymbols, config.type]);

  const points = getStrengthPoints();

  return (
    <div className="w-full max-w-1xl mt-4 animate-fade-in-up font-arcade">
      {/* Arcade Bezel Container */}
      <div className="bg-black border-2 md:border-4 border-pac-blue p-1 md:p-2 relative shadow-[4px_4px_0_0_rgba(30,41,59,0.5)] md:shadow-[8px_8px_0_0_rgba(30,41,59,0.5)]">
        
        {/* Header */}
        <div className="bg-pac-blue text-white p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-2 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="animate-chomp text-pac-yellow text-[10px] md:text-xs">C</div>
             <span className="text-white text-[10px] md:text-xs tracking-widest">{getTitle()}</span>
          </div>
          <RetroTooltip text="Generate New Secret">
            <button 
                onClick={generate} 
                className="text-[9px] md:text-[10px] bg-red-600 hover:bg-white hover:text-red-600 text-white px-2 md:px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_black] active:shadow-none active:translate-y-[2px] transition-all uppercase tracking-wide"
            >
                REGEN
            </button>
          </RetroTooltip>
        </div>

        {/* Main Display Area */}
        <div className="p-1 md:p-2 flex flex-col gap-4 md:gap-6">
            
            {/* The Secret */}
            <div className="relative group">
                <div className="bg-black border-2 md:border-4 border-pac-ghostPink p-2 md:p-4 flex items-center justify-between gap-2 md:gap-4 shadow-[2px_2px_0_0_rgba(255,184,255,0.3)] md:shadow-[4px_4px_0_0_rgba(255,184,255,0.3)]">
                  <code className="font-mono text-xs md:text-base break-all text-pac-ghostPink selection:bg-pac-yellow selection:text-black">
                      {secret}
                  </code>
                  <RetroTooltip text="Copy to Clipboard">
                    <button 
                        onClick={copyToClipboard}
                        className={`flex-shrink-0 font-arcade text-[9px] md:text-[10px] px-2 md:px-3 py-1 md:py-2 border-2 transition-all ${copied ? 'bg-green-500 text-black border-green-500' : 'bg-transparent text-pac-yellow border-pac-yellow hover:bg-pac-yellow hover:text-black'}`}
                    >
                        {copied ? 'OK!' : 'COPY'}
                    </button>
                  </RetroTooltip>
                </div>
            </div>

            {/* Password Strength - Square Pixel Meter */}
            {config.type === 'password' && (
              <div className="flex items-center gap-2 md:gap-4 border-b-2 border-dashed border-gray-800 pb-2 md:pb-4">
                 <span className="text-[9px] md:text-[10px] text-pac-blue uppercase w-16 md:w-20 hidden sm:inline">POWER</span>
                 <div className="flex gap-1 md:gap-2">
                    {[...Array(6)].map((_, i) => (
                        <div 
                            key={i}
                            className={`w-2 h-2 md:w-3 md:h-3 ${i < points ? 'bg-pac-yellow' : 'bg-gray-800'} border border-black`}
                        ></div>
                    ))}
                 </div>
                 <span className="text-[9px] md:text-[10px] text-gray-500 ml-auto">
                    {points < 3 ? 'WEAK' : points < 5 ? 'NORMAL' : 'MAX'}
                 </span>
              </div>
            )}

            {/* Controls Section */}
            <div className="pt-2 space-y-4 md:space-y-6">
                
                {/* Password Specific Controls */}
                {config.type === 'password' && (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] md:text-[10px] text-pac-ghostCyan mb-1">
                                <span>LENGTH</span>
                                <span>{length} PX</span>
                            </div>
                            <RetroTooltip text="Adjust Secret Length">
                                <input 
                                    type="range" 
                                    min="8" 
                                    max="64" 
                                    value={length} 
                                    onChange={(e) => setLength(parseInt(e.target.value))}
                                    className="w-full h-3 md:h-4 bg-gray-900 appearance-none border-2 border-white cursor-pointer accent-pac-yellow"
                                />
                            </RetroTooltip>
                        </div>
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            <RetroTooltip text="Toggle Uppercase Letters">
                                <RetroToggle label="CAPS" active={useUppercase} onClick={() => setUseUppercase(!useUppercase)} />
                            </RetroTooltip>
                            <RetroTooltip text="Toggle Numbers">
                                <RetroToggle label="NUMS" active={useNumbers} onClick={() => setUseNumbers(!useNumbers)} />
                            </RetroTooltip>
                            <RetroTooltip text="Toggle Symbols">
                                <RetroToggle label="SYMS" active={useSymbols} onClick={() => setUseSymbols(!useSymbols)} />
                            </RetroTooltip>
                        </div>
                    </>
                )}

                {/* Key/JWT Controls */}
                {(config.type === 'jwt' || config.type === 'apiKey') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div>
                             <label className="text-[9px] md:text-[10px] text-pac-ghostCyan block mb-2 md:mb-3">BIT DEPTH</label>
                             <div className="flex gap-2">
                                {[128, 256, 512].map(b => (
                                    <RetroTooltip key={b} text={`Set ${b}-bit strength`}>
                                        <button 
                                            onClick={() => setBits(b)}
                                            className={`flex-1 py-1 md:py-2 text-[9px] md:text-[10px] border-2 transition-all ${
                                                bits === b 
                                                ? 'bg-pac-yellow text-black border-pac-yellow shadow-[2px_2px_0_0_white]' 
                                                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500'
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    </RetroTooltip>
                                ))}
                             </div>
                        </div>
                        <div>
                             <label className="text-[9px] md:text-[10px] text-pac-ghostCyan block mb-2 md:mb-3">FORMAT</label>
                             <div className="flex gap-2 md:gap-4 p-1 border-2 border-gray-800 bg-black">
                                <RetroTooltip text="Hexadecimal Format">
                                    <RetroSwitchOption label="HEX" active={format === 'hex'} onClick={() => setFormat('hex')} />
                                </RetroTooltip>
                                <RetroTooltip text="Base64 Encoding">
                                    <RetroSwitchOption label="BASE64" active={format === 'base64'} onClick={() => setFormat('base64')} />
                                </RetroTooltip>
                             </div>
                        </div>
                    </div>
                )}
                 
                 {/* UUID Info */}
                 {config.type === 'uuid' && (
                     <div className="text-center text-[9px] md:text-[10px] text-gray-600 uppercase border-2 border-gray-800 p-2">
                         RFC 4122 v4 COMPLIANT
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Retro Components
const RetroToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`cursor-pointer flex items-center justify-between p-1 md:p-2 border-2 transition-all hover:bg-gray-900 ${active ? 'border-green-500 shadow-[1px_1px_0_0_rgba(34,197,94,0.5)] md:shadow-[2px_2px_0_0_rgba(34,197,94,0.5)]' : 'border-gray-800'}`}
    >
        <span className={`text-[9px] md:text-[10px] transition-colors ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
        <div className={`w-2 h-2 md:w-3 md:h-3 border-2 ${active ? 'bg-green-500 border-green-500' : 'bg-black border-gray-600'}`}></div>
    </div>
);

const RetroSwitchOption = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex-1 text-[9px] md:text-[10px] py-1 transition-all ${active ? 'bg-pac-ghostPink text-black font-bold' : 'text-gray-500 hover:text-white'}`}
    >
        {label}
    </button>
);