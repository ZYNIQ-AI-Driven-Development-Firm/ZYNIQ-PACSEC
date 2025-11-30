import React, { useState } from 'react';

interface NewsCardProps {
  onReadMore: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ onReadMore }) => {
  const newsData = [
    { title: "BREACH ALERT", date: "TODAY", text: "81% of breaches involve weak or stolen passwords. Rotation is critical." },
    { title: "2FA INTEL", date: "YESTERDAY", text: "SMS-based 2FA is vulnerable to SIM swapping. Use hardware tokens." },
    { title: "JWT SECURITY", date: "02 OCT", text: "Never store sensitive user data in JWT payload. Always verify signatures." },
    { title: "API HYGIENE", date: "01 OCT", text: "Stale API keys allow persistent access. Automate your key rotation policy." },
    { title: "ZERO TRUST", date: "30 SEP", text: "Trust no one. Verify everything. Client-side encryption is the only safe harbor." },
    { title: "PHISHING OPS", date: "28 SEP", text: "AI-driven phishing is up 200%. Verify request sources via secondary channels." }
  ];

  const itemsPerPage = 2;
  const totalSlides = Math.ceil(newsData.length / itemsPerPage);
  const [slideIndex, setSlideIndex] = useState(0);

  const nextSlide = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      onReadMore();
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
    }
  };

  const currentItems = newsData.slice(slideIndex * itemsPerPage, slideIndex * itemsPerPage + itemsPerPage);
  const isLastSlide = slideIndex === totalSlides - 1;

  return (
    <div className="w-full max-w-4xl mx-auto font-arcade z-20">
        
        {/* Header Frame */}
        <div className="flex justify-between items-end mb-2 px-1">
            <div className="flex items-center gap-2 text-pac-ghostCyan">
                <span className="animate-pulse text-base">!</span>
                <span className="text-[10px] tracking-widest">LATEST INTEL</span>
            </div>
            <div className="flex gap-1">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 border border-pac-ghostCyan ${idx === slideIndex ? 'bg-pac-ghostCyan' : 'bg-transparent'}`}
                    />
                ))}
            </div>
        </div>

        {/* Carousel Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentItems.map((item, idx) => (
                <div key={idx} className="bg-black border-2 border-pac-ghostCyan/50 p-1 shadow-[2px_2px_0_0_rgba(34,211,238,0.2)] hover:border-pac-ghostCyan hover:shadow-[4px_4px_0_0_rgba(34,211,238,0.5)] transition-all group">
                    <div className="bg-pac-ghostCyan/5 p-3 h-full flex flex-col justify-between min-h-[110px]">
                        <div>
                            <div className="flex justify-between items-start mb-2 border-b border-pac-ghostCyan/30 pb-2">
                                <span className="text-pac-ghostCyan text-[10px] font-bold tracking-wider group-hover:text-white transition-colors truncate pr-2">
                                    {item.title}
                                </span>
                                <span className="text-[8px] text-gray-500 font-mono bg-gray-900 px-1 whitespace-nowrap">
                                    {item.date}
                                </span>
                            </div>
                            <p className="text-gray-300 font-mono text-[11px] leading-relaxed line-clamp-3">
                                {item.text}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-3">
            <button 
                onClick={prevSlide}
                disabled={slideIndex === 0}
                className={`
                    flex items-center gap-1 px-3 py-1 border-2 text-[9px] transition-all uppercase tracking-wider
                    ${slideIndex === 0 
                        ? 'border-gray-800 text-gray-700 cursor-not-allowed opacity-50' 
                        : 'border-pac-ghostCyan text-pac-ghostCyan hover:bg-pac-ghostCyan hover:text-black'
                    }
                `}
            >
                <span>{'<'}</span> PREV
            </button>

            <button 
                onClick={nextSlide}
                className={`
                    flex items-center gap-1 px-4 py-1 border-2 text-[9px] transition-all uppercase tracking-wider font-bold shadow-[2px_2px_0_0_black]
                    ${isLastSlide
                        ? 'bg-pac-yellow border-pac-yellow text-black hover:bg-white hover:border-white animate-pulse' 
                        : 'border-pac-ghostCyan text-pac-ghostCyan hover:bg-pac-ghostCyan hover:text-black'
                    }
                `}
            >
                {isLastSlide ? 'READ MORE >' : 'NEXT >'}
            </button>
        </div>
    </div>
  );
};