import React, { useState } from 'react';

interface NewsCardProps {
  onReadMore: () => void;
}

const INITIAL_NEWS = [
  { title: "BREACH ALERT", date: "TODAY", text: "81% of breaches involve weak or stolen passwords. Rotation is critical." },
  { title: "2FA INTEL", date: "YESTERDAY", text: "SMS-based 2FA is vulnerable to SIM swapping. Use hardware tokens." },
  { title: "JWT SECURITY", date: "02 OCT", text: "Never store sensitive user data in JWT payload. Always verify signatures." },
  { title: "API HYGIENE", date: "01 OCT", text: "Stale API keys allow persistent access. Automate your key rotation policy." },
  { title: "ZERO TRUST", date: "30 SEP", text: "Trust no one. Verify everything. Client-side encryption is the only safe harbor." },
  { title: "PHISHING OPS", date: "28 SEP", text: "AI-driven phishing is up 200%. Verify request sources via secondary channels." },
  { title: "SQL INJECTION", date: "ARCHIVED", text: "Sanitize all inputs. Parameterized queries are your first line of defense." },
  { title: "RANSOMWARE", date: "ALERT", text: "Maintain offline backups. Verify restoration procedures monthly." },
];

export const NewsCard: React.FC<NewsCardProps> = ({ onReadMore }) => {
  const [newsItems, setNewsItems] = useState(INITIAL_NEWS);
  const [isRefreshed, setIsRefreshed] = useState(false);

  const itemsPerPage = 2;
  const totalSlides = Math.ceil(newsItems.length / itemsPerPage);
  const [slideIndex, setSlideIndex] = useState(0);

  const handleRefresh = () => {
    setIsRefreshed(true);
    // Shuffle the array
    const shuffled = [...INITIAL_NEWS].sort(() => 0.5 - Math.random());
    setNewsItems(shuffled);
    setSlideIndex(0);
    setTimeout(() => setIsRefreshed(false), 500);
  };

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

  const currentItems = newsItems.slice(slideIndex * itemsPerPage, slideIndex * itemsPerPage + itemsPerPage);
  const isLastSlide = slideIndex === totalSlides - 1;

  return (
    <div className="w-full max-w-4xl mx-auto font-arcade z-20">
        
        {/* Header Frame */}
        <div className="flex justify-between items-end mb-2 px-1">
            
            {/* Title - Left Side */}
            <div className="flex items-center gap-2 text-pac-ghostCyan">
                <span className="animate-pulse text-base">!</span>
                <span className="text-[10px] tracking-widest">LATEST SECURITY NEWS</span>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
                {/* Refresh Button */}
                <button 
                    onClick={handleRefresh}
                    className={`flex items-center gap-2 text-[9px] font-bold text-pac-yellow border border-transparent hover:border-pac-yellow px-2 py-0.5 transition-all ${isRefreshed ? 'opacity-50 cursor-wait' : 'hover:bg-pac-yellow hover:text-black'}`}
                    title="Refresh Intel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isRefreshed ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>REFRESH</span>
                </button>

                {/* Dots */}
                <div className="flex gap-1">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 border border-pac-ghostCyan ${idx === slideIndex ? 'bg-pac-ghostCyan' : 'bg-transparent'}`}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Carousel Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {currentItems.map((item, idx) => (
                <div key={idx} className="bg-black border-2 border-pac-ghostCyan/50 p-1 shadow-[2px_2px_0_0_rgba(34,211,238,0.2)] hover:border-pac-ghostCyan hover:shadow-[0_0_10px_rgba(34,211,238,0.6)] transition-all group min-h-[110px] md:min-h-[130px]">
                    <div className="bg-pac-ghostCyan/5 p-3 md:p-4 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2 border-b border-pac-ghostCyan/30 pb-2 gap-2">
                                <span className="text-pac-ghostCyan text-xs font-bold tracking-wider group-hover:text-white transition-colors truncate flex-1">
                                    {item.title}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono bg-gray-900 px-1.5 py-0.5 whitespace-nowrap">
                                    {item.date}
                                </span>
                            </div>
                            <p className="text-gray-100 font-mono text-xs leading-relaxed line-clamp-3">
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
                    flex items-center gap-2 px-4 py-1 border-2 text-[9px] transition-all uppercase tracking-wider font-bold shadow-[2px_2px_0_0_black]
                    ${isLastSlide
                        ? 'bg-pac-yellow border-pac-yellow text-black hover:bg-white hover:border-white animate-pulse' 
                        : 'border-pac-ghostCyan text-pac-ghostCyan hover:bg-pac-ghostCyan hover:text-black'
                    }
                `}
            >
                {isLastSlide ? (
                    <>
                        <span>READ MORE</span>
                        <span className="text-[10px]">»</span>
                    </>
                ) : (
                    <>
                        <span>NEXT</span>
                        <span>{'>'}</span>
                    </>
                )}
            </button>
        </div>
    </div>
  );
};