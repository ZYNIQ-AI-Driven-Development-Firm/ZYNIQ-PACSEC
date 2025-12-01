import React, { useState, useEffect, useCallback } from 'react';
import { SecretConfig } from '../types';
import { generateSecurePassword, generateSecureHex, generateSecureBase64, generateUUID } from '../utils/cryptoUtils';

interface LootCrateProps {
  config: SecretConfig;
}

interface GeneratedItem {
  label: string;
  value: string;
  config: SecretConfig;
}

export const LootCrate: React.FC<LootCrateProps> = ({ config }) => {
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
  // Unlock Logic
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const generateValue = (itemConfig: SecretConfig): string => {
    if (itemConfig.type === 'password') {
        const len = itemConfig.length || 24;
        return generateSecurePassword(len, { 
            symbols: itemConfig.useSymbols ?? true, 
            numbers: itemConfig.useNumbers ?? true, 
            uppercase: itemConfig.useUppercase ?? true 
        });
    } else if (itemConfig.type === 'uuid') {
        return generateUUID();
    } else {
        const bits = itemConfig.bits || 256;
        if (itemConfig.format === 'base64') return generateSecureBase64(bits);
        return generateSecureHex(bits);
    }
  };

  const generateAll = useCallback(() => {
    if (!config.recipeItems) return;
    const newItems = config.recipeItems.map(item => ({
        label: item.label,
        config: item.config,
        value: generateValue(item.config)
    }));
    setItems(newItems);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [config.recipeItems]);

  useEffect(() => {
    generateAll();
  }, [generateAll]);

  const handleUnlock = () => {
      setIsUnlocking(true);
      setTimeout(() => {
          setIsUnlocking(false);
          setIsUnlocked(true);
      }, 1500);
  };

  const copyItem = (val: string, index: number) => {
    navigator.clipboard.writeText(val);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllJson = () => {
    const obj = items.reduce((acc, curr) => ({ ...acc, [curr.label]: curr.value }), {});
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const regenItem = (index: number) => {
    setItems(prev => prev.map((item, i) => {
        if (i === index) {
            return { ...item, value: generateValue(item.config) };
        }
        return item;
    }));
  };

  if (!items.length) return null;

  if (!isUnlocked) {
      return (
        <div className="w-full mt-4 animate-fade-in-up font-arcade">
            <button 
                onClick={handleUnlock}
                disabled={isUnlocking}
                className={`w-full bg-black border-2 md:border-4 border-pac-ghostOrange p-4 md:p-6 relative shadow-[4px_4px_0_0_rgba(255,184,82,0.4)] md:shadow-[8px_8px_0_0_rgba(255,184,82,0.4)] group overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]`}
            >
                {/* Diagonal stripes background */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #FFB852 25%, transparent 25%, transparent 50%, #FFB852 50%, #FFB852 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}></div>
                
                <div className="flex flex-col items-center justify-center gap-2 md:gap-3 relative z-10">
                    <span className={`text-2xl md:text-4xl transition-transform duration-500 ${isUnlocking ? 'animate-bounce' : 'group-hover:rotate-12'}`}>
                        🎁
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-pac-ghostOrange text-sm md:text-lg tracking-widest font-bold">
                            {isUnlocking ? 'DECRYPTING...' : 'LOCKED LOOT CRATE'}
                        </span>
                        {!isUnlocking && (
                            <span className="text-gray-500 text-[8px] md:text-[10px] animate-pulse">
                                CLICK TO UNLOCK BUNDLE
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar for unlocking */}
                {isUnlocking && (
                    <div className="absolute bottom-0 left-0 h-1 bg-pac-ghostOrange transition-all duration-[1500ms] ease-out w-full" style={{ width: '100%' }}></div>
                )}
            </button>
        </div>
      );
  }

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
       <div className="bg-black border-2 md:border-4 border-pac-ghostOrange p-1 relative shadow-[4px_4px_0_0_rgba(255,184,82,0.4)] md:shadow-[8px_8px_0_0_rgba(255,184,82,0.4)]">
          
          {/* Crate Header */}
          <div className="bg-pac-ghostOrange text-black p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
                 <span className="text-sm md:text-lg animate-pulse">🍒</span>
                 <span className="text-[10px] md:text-xs font-bold tracking-widest">BONUS STAGE: LOOT CRATE</span>
             </div>
             <button 
                onClick={generateAll} 
                className="text-[9px] md:text-[10px] bg-black text-pac-ghostOrange hover:bg-white hover:text-black px-2 py-1 border-2 border-black uppercase"
             >
                RESHUFFLE ALL
             </button>
          </div>

          <div className="p-1 md:p-2 space-y-2 md:space-y-3">
             {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <span className="text-[9px] md:text-[10px] text-pac-ghostCyan uppercase tracking-wider pl-1">
                        {item.label} <span className="text-gray-600 text-[8px]">[{item.config.type}]</span>
                    </span>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-900 border-2 border-gray-700 p-2 text-pac-yellow font-mono text-[9px] md:text-xs break-all shadow-inner leading-relaxed">
                            {item.value}
                        </div>
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => copyItem(item.value, idx)}
                                className={`h-full px-2 md:px-3 text-[9px] md:text-[10px] border-2 transition-all ${
                                    copiedIndex === idx 
                                    ? 'bg-green-500 border-green-500 text-black' 
                                    : 'bg-black border-pac-blue text-pac-blue hover:bg-pac-blue hover:text-white'
                                }`}
                            >
                                {copiedIndex === idx ? 'OK' : 'CPY'}
                            </button>
                            <button 
                                onClick={() => regenItem(idx)}
                                className="text-[8px] bg-gray-800 text-gray-400 hover:text-white border-2 border-gray-700 px-1"
                                title="Regenerate this item"
                            >
                                ↻
                            </button>
                        </div>
                    </div>
                </div>
             ))}
          </div>

          <div className="mt-3 md:mt-4 border-t-2 border-dashed border-gray-800 pt-2 md:pt-3 text-center">
             <button 
                onClick={copyAllJson}
                className={`w-full py-2 border-2 text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
                    copiedAll 
                    ? 'bg-green-500 border-green-500 text-black' 
                    : 'bg-pac-ghostPink text-black border-pac-ghostPink hover:bg-white hover:border-white'
                }`}
             >
                {copiedAll ? 'JSON EXPORTED!' : 'COPY ALL AS JSON'}
             </button>
          </div>

       </div>
    </div>
  );
};