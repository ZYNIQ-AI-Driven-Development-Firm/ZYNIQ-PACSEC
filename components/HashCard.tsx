import React, { useState, useEffect } from 'react';
import { generateHash } from '../utils/cryptoUtils';

export const HashCard: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({ sha256: '', sha512: '' });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const updateHashes = async () => {
        if (!input) {
            setHashes({ sha256: '', sha512: '' });
            return;
        }
        const s256 = await generateHash(input, 'SHA-256');
        const s512 = await generateHash(input, 'SHA-512');
        setHashes({ sha256: s256, sha512: s512 });
    };
    updateHashes();
  }, [input]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-pac-ghostPink p-1 relative shadow-[4px_4px_0_0_rgba(255,184,255,0.4)] md:shadow-[8px_8px_0_0_rgba(255,184,255,0.4)]">
            
            {/* Header */}
            <div className="bg-pac-ghostPink text-black p-2 border-b-2 md:border-b-4 border-black flex items-center gap-2 mb-2">
                <span className="text-xl">👻</span>
                <span className="text-[10px] md:text-xs tracking-widest font-bold">GHOST HASHER (SHA)</span>
            </div>

            <div className="p-2 space-y-4">
                {/* Input */}
                <div>
                    <label className="text-[9px] text-pac-ghostPink block mb-1">SOURCE TEXT</label>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="TYPE TO HASH..."
                        className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-sm p-2 focus:border-pac-ghostPink focus:outline-none"
                    />
                </div>

                {/* Outputs */}
                {input && (
                    <>
                        <HashRow 
                            label="SHA-256" 
                            value={hashes.sha256} 
                            color="text-pac-ghostCyan" 
                            onCopy={() => copyToClipboard(hashes.sha256, '256')}
                            isCopied={copied === '256'}
                        />
                        <HashRow 
                            label="SHA-512" 
                            value={hashes.sha512} 
                            color="text-pac-ghostRed" 
                            onCopy={() => copyToClipboard(hashes.sha512, '512')}
                            isCopied={copied === '512'}
                        />
                    </>
                )}
                {!input && (
                    <div className="text-center py-4 text-[10px] text-gray-600 font-mono">
                        WAITING FOR INPUT STREAM...
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const HashRow = ({ label, value, color, onCopy, isCopied }: any) => (
    <div className="bg-black border border-gray-800 p-2 relative group">
        <div className="flex justify-between items-center mb-1">
             <span className={`text-[9px] ${color}`}>{label}</span>
             <button 
                onClick={onCopy}
                className={`text-[8px] uppercase px-2 py-0.5 border transition-colors ${isCopied ? 'bg-green-500 text-black border-green-500' : 'border-gray-700 text-gray-500 hover:border-white hover:text-white'}`}
             >
                 {isCopied ? 'COPIED' : 'COPY'}
             </button>
        </div>
        <div className="font-mono text-[10px] break-all text-gray-300 leading-tight">
            {value}
        </div>
    </div>
);