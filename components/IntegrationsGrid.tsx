import React, { useState } from 'react';
import { IntegrationItem } from '../types';

interface IntegrationsGridProps {
  items: IntegrationItem[];
}

export const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({ items }) => {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const handleConnect = (item: IntegrationItem) => {
    // For external tools, we just open the link
    if (item.url) {
        window.open(item.url, '_blank');
    }
    
    // Toggle visual state
    setConnectedIds(prev => {
        const next = new Set(prev);
        if (next.has(item.id)) {
            next.delete(item.id);
        } else {
            next.add(item.id);
        }
        return next;
    });
  };

  return (
    <div className="w-full mt-4 font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-indigo-500 p-1 relative shadow-[4px_4px_0_0_rgba(99,102,241,0.5)]">
        
        {/* Header */}
        <div className="bg-indigo-500 text-white p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <span className="text-xl animate-spin-slow">⚙️</span>
                <span className="text-[10px] md:text-xs tracking-widest font-bold">SECURITY MODULES MARKET</span>
            </div>
            <span className="text-[8px] md:text-[9px] bg-black px-2 py-0.5 border border-white">FREE TIER</span>
        </div>

        {/* Grid */}
        <div className="p-1 md:p-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => {
                const isConnected = connectedIds.has(item.id);
                return (
                    <div key={item.id} className="bg-gray-900/50 border border-indigo-500/30 p-3 hover:border-indigo-400 hover:bg-gray-900 transition-all group flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                                    <span className="text-xs text-indigo-300 font-bold tracking-wider group-hover:text-white">{item.name}</span>
                                </div>
                                <span className="text-[8px] px-1 border border-gray-700 text-gray-500">
                                    {item.type === 'api' ? 'API' : 'LINK'}
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-mono mb-3 leading-relaxed min-h-[2.5em]">
                                {item.desc}
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => handleConnect(item)}
                            className={`w-full text-[9px] py-1.5 border-2 transition-all uppercase tracking-widest font-bold flex items-center justify-center gap-2
                            ${isConnected 
                                ? 'bg-green-500 text-black border-green-500 hover:bg-red-500 hover:border-red-500 hover:text-white' 
                                : 'bg-transparent text-indigo-400 border-indigo-500 hover:bg-indigo-500 hover:text-white'
                            }`}
                        >
                            {isConnected ? (
                                <>
                                    <span className="group-hover:hidden">CONNECTED</span>
                                    <span className="hidden group-hover:inline">DISCONNECT</span>
                                </>
                            ) : (
                                <>
                                    <span>CONNECT</span>
                                    <span>↗</span>
                                </>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
        
        <div className="bg-indigo-900/20 p-2 mt-2 border-t border-indigo-500/30 text-[9px] font-mono text-center text-indigo-300">
            WARNING: EXTERNAL MODULES RUN OUTSIDE PACSEC SANDBOX.
        </div>

      </div>
    </div>
  );
};