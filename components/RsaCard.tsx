import React, { useState, useEffect } from 'react';
import { generateRSAKeyPair } from '../utils/cryptoUtils';

export const RsaCard: React.FC<{ bits?: number }> = ({ bits = 2048 }) => {
  const [keys, setKeys] = useState<{ publicKey: string, privateKey: string } | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedPrivate, setCopiedPrivate] = useState(false);
  const [keySize, setKeySize] = useState(bits);

  const generate = async (size: number) => {
    setGenerating(true);
    // Tiny delay to allow UI to render 'Generating' state before heavy crypto work
    setTimeout(async () => {
        const pair = await generateRSAKeyPair(size);
        setKeys(pair);
        setGenerating(false);
    }, 100);
  };

  useEffect(() => {
    generate(keySize);
  }, []);

  const handleCopy = (text: string, isPrivate: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPrivate) {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
    } else {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
    }
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-pac-blue p-1 relative shadow-[4px_4px_0_0_rgba(30,58,138,0.5)] md:shadow-[8px_8px_0_0_rgba(30,58,138,0.5)]">
            
            {/* Header */}
            <div className="bg-pac-blue text-white p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🗝️</span>
                    <span className="text-[10px] md:text-xs tracking-widest uppercase">RSA KEY FORGE</span>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => { setKeySize(2048); generate(2048); }}
                        className={`text-[9px] px-2 py-1 border-2 ${keySize === 2048 ? 'bg-pac-yellow text-black border-white' : 'bg-black text-gray-500 border-gray-700'}`}
                     >
                         2048
                     </button>
                     <button 
                        onClick={() => { setKeySize(4096); generate(4096); }}
                        className={`text-[9px] px-2 py-1 border-2 ${keySize === 4096 ? 'bg-pac-yellow text-black border-white' : 'bg-black text-gray-500 border-gray-700'}`}
                     >
                         4096
                     </button>
                </div>
            </div>

            <div className="p-2 space-y-4">
                {generating ? (
                    <div className="h-48 flex flex-col items-center justify-center text-pac-yellow gap-4">
                        <div className="animate-spin text-4xl">⚙️</div>
                        <div className="text-xs animate-pulse">GENERATING PRIMES...</div>
                    </div>
                ) : (
                    <>
                        {/* Public Key */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] text-blue-400">PUBLIC KEY (PEM)</span>
                                <button 
                                    onClick={() => keys && handleCopy(keys.publicKey, false)}
                                    className={`text-[8px] px-2 py-0.5 border ${copiedPublic ? 'bg-green-500 text-black border-green-500' : 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black'}`}
                                >
                                    {copiedPublic ? 'COPIED' : 'COPY'}
                                </button>
                            </div>
                            <textarea 
                                readOnly 
                                value={keys?.publicKey} 
                                className="w-full h-24 bg-gray-900/50 border border-blue-900 text-blue-300 font-mono text-[9px] md:text-[10px] p-2 resize-none focus:outline-none"
                            />
                        </div>

                        {/* Private Key */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[9px] text-red-400">PRIVATE KEY (PKCS#8)</span>
                                <button 
                                    onClick={() => keys && handleCopy(keys.privateKey, true)}
                                    className={`text-[8px] px-2 py-0.5 border ${copiedPrivate ? 'bg-green-500 text-black border-green-500' : 'text-red-400 border-red-400 hover:bg-red-400 hover:text-black'}`}
                                >
                                    {copiedPrivate ? 'COPIED' : 'COPY SAFE'}
                                </button>
                            </div>
                            <textarea 
                                readOnly 
                                value={keys?.privateKey} 
                                className="w-full h-32 bg-gray-900/50 border border-red-900 text-red-300 font-mono text-[9px] md:text-[10px] p-2 resize-none focus:outline-none blur-sm hover:blur-none transition-all"
                            />
                            <div className="text-[8px] text-red-500 mt-1 text-center animate-pulse">
                                WARNING: NEVER SHARE PRIVATE KEY. GENERATED CLIENT-SIDE.
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <div className="border-t border-gray-800 p-2">
                 <button 
                    onClick={() => generate(keySize)}
                    className="w-full bg-gray-900 text-gray-400 text-[10px] py-2 border border-gray-700 hover:bg-pac-blue hover:text-white hover:border-white transition-all uppercase"
                 >
                     REGENERATE KEYPAIR
                 </button>
            </div>
        </div>
    </div>
  );
};