import React, { useState, useEffect, useCallback } from 'react';
import { SecretConfig } from '../types';
import { generateSecurePassword, generateSecureHex, generateSecureBase64, generateUUID } from '../utils/cryptoUtils';

interface SecretCardProps {
  config: SecretConfig;
}

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
  const getStrength = useCallback(() => {
    if (config.type !== 'password') return null;

    let score = 0;
    // Length points (Base is 8)
    if (length >= 12) score++; // Good length
    if (length >= 16) score++; // Secure length
    if (length >= 24) score++; // Paranoid length

    // Complexity points
    if (useUppercase) score++;
    if (useNumbers) score++;
    if (useSymbols) score++;

    // Normalize to 4 levels
    // Max score possible: 6
    if (score < 3) return { label: 'WEAK', color: 'bg-pac-ghostRed', textColor: 'text-pac-ghostRed', width: '25%' };
    if (score < 5) return { label: 'MODERATE', color: 'bg-pac-ghostOrange', textColor: 'text-pac-ghostOrange', width: '50%' };
    if (score < 6) return { label: 'STRONG', color: 'bg-pac-ghostCyan', textColor: 'text-pac-ghostCyan', width: '75%' };
    return { label: 'MAXIMUM', color: 'bg-pac-yellow', textColor: 'text-pac-yellow', width: '100%' };
  }, [length, useUppercase, useNumbers, useSymbols, config.type]);

  const strength = getStrength();

  return (
    <div className="w-full max-w-2xl bg-pac-blue/50 border border-pac-yellow/20 rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(242,201,76,0.1)] mt-4 animate-fade-in-up">
      {/* Header */}
      <div className="bg-black/40 p-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pac-ghostRed"></div>
          <span className="font-arcade text-xs text-pac-ghostCyan uppercase tracking-widest">{getTitle()} GENERATOR</span>
        </div>
        <button onClick={generate} className="text-xs text-pac-yellow hover:text-white transition-colors font-sans flex items-center gap-1 group">
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          REGENERATE
        </button>
      </div>

      {/* Main Display */}
      <div className="p-6">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pac-ghostPink to-pac-ghostCyan rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black rounded-lg p-6 flex flex-col gap-4 border border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <code className="font-mono text-lg break-all text-white selection:bg-pac-yellow selection:text-black">
                      {secret}
                  </code>
                  <button 
                      onClick={copyToClipboard}
                      className={`flex-shrink-0 p-3 rounded-md transition-all duration-200 ${copied ? 'bg-green-500 text-black' : 'bg-pac-yellow text-black hover:bg-white'}`}
                  >
                      {copied ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {config.type === 'password' && strength && (
                  <div className="w-full">
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-[10px] text-gray-500 font-arcade">STRENGTH</span>
                       <span className={`text-[10px] font-arcade ${strength.textColor}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${strength.color} transition-all duration-500 ease-out`}
                         style={{ width: strength.width }}
                       ></div>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/20 p-6 border-t border-white/5 space-y-6">
        
        {/* Password Controls */}
        {config.type === 'password' && (
          <>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400 font-medium">Length</label>
                <span className="text-pac-yellow font-mono">{length}</span>
              </div>
              <input 
                type="range" 
                min="8" 
                max="64" 
                value={length} 
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pac-yellow"
              />
            </div>
            <div className="flex flex-wrap gap-4">
               <Toggle label="A-Z" checked={useUppercase} onChange={setUseUppercase} />
               <Toggle label="0-9" checked={useNumbers} onChange={setUseNumbers} />
               <Toggle label="#$%" checked={useSymbols} onChange={setUseSymbols} />
            </div>
          </>
        )}

        {/* JWT/Key Controls */}
        {(config.type === 'jwt' || config.type === 'apiKey') && (
           <div className="flex flex-col gap-6">
             {/* Bits Selector */}
             <div>
                <label className="text-xs text-gray-400 block mb-3 font-arcade">STRENGTH (BITS)</label>
                <div className="flex gap-2">
                  {[128, 256, 512].map(b => (
                      <button 
                          key={b}
                          onClick={() => setBits(b)}
                          className={`flex-1 relative overflow-hidden text-xs py-3 rounded-lg transition-all duration-300 font-mono border ${
                              bits === b 
                              ? 'bg-pac-blue/50 border-pac-ghostCyan text-pac-ghostCyan shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                              : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                          }`}
                      >
                          {bits === b && <div className="absolute inset-0 bg-pac-ghostCyan/10"></div>}
                          {b}
                      </button>
                  ))}
                </div>
             </div>

             {/* Format Toggle Switch */}
             <div>
                <label className="text-xs text-gray-400 block mb-3 font-arcade">OUTPUT FORMAT</label>
                <div className="flex items-center gap-4 bg-gray-900 p-1.5 rounded-xl border border-gray-800 w-fit">
                    <button
                        onClick={() => setFormat('hex')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono transition-all duration-300 flex items-center gap-2 ${
                            format === 'hex' 
                            ? 'bg-pac-yellow text-black shadow-lg' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <span className="opacity-50">0x</span> HEX
                    </button>
                    <button
                        onClick={() => setFormat('base64')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono transition-all duration-300 flex items-center gap-2 ${
                            format === 'base64' 
                            ? 'bg-pac-ghostPink text-black shadow-lg' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <span className="opacity-50">Aa</span> BASE64
                    </button>
                </div>
             </div>
           </div>
        )}

        {/* UUID Controls */}
        {config.type === 'uuid' && (
             <div className="flex flex-col items-center justify-center py-4 text-gray-500 gap-2">
                 <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                     <span className="text-2xl">🆔</span>
                 </div>
                 <p className="text-sm">Standard UUID v4 (Cryptographically Random)</p>
             </div>
        )}

      </div>
    </div>
  );
};

// Helper Toggle Component for Password
const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <label className="flex items-center cursor-pointer group select-none">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out border ${checked ? 'bg-pac-blue border-pac-yellow' : 'bg-gray-800 border-gray-700'}`}></div>
            <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-4 bg-pac-yellow' : 'bg-gray-500'}`}></div>
        </div>
        <div className="ml-3 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
            {label}
        </div>
    </label>
);
