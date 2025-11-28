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

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
       <div className="bg-black border-4 border-pac-ghostOrange p-1 relative shadow-[8px_8px_0_0_rgba(255,184,82,0.4)]">
          
          {/* Crate Header */}
          <div className="bg-pac-ghostOrange text-black p-2 border-b-4 border-black flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
                 <span className="text-lg animate-pulse">🍒</span>
                 <span className="text-xs font-bold tracking-widest">BONUS STAGE: LOOT CRATE</span>
             </div>
             <button 
                onClick={generateAll} 
                className="text-[10px] bg-black text-pac-ghostOrange hover:bg-white hover:text-black px-2 py-1 border-2 border-black uppercase"
             >
                RESHUFFLE ALL
             </button>
          </div>

          <div className="p-2 space-y-3">
             {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[10px] text-pac-ghostCyan uppercase tracking-wider pl-1">
                        {item.label} <span className="text-gray-600 text-[8px]">[{item.config.type}]</span>
                    </span>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-gray-900 border-2 border-gray-700 p-2 text-pac-yellow font-mono text-[10px] sm:text-xs break-all shadow-inner">
                            {item.value}
                        </div>
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => copyItem(item.value, idx)}
                                className={`h-full px-3 text-[10px] border-2 transition-all ${
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

          <div className="mt-4 border-t-2 border-dashed border-gray-800 pt-3 text-center">
             <button 
                onClick={copyAllJson}
                className={`w-full py-2 border-2 text-[10px] uppercase tracking-widest font-bold transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
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