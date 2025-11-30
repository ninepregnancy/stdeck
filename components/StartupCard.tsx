
import React, { useState, useEffect } from 'react';
import { Startup } from '../types';
import { Button } from './Button';
import { ExternalLink, Heart, X, Info, Lock } from 'lucide-react';

interface StartupCardProps {
  startup: Startup;
  onLike: () => void;
  onSkip: () => void;
  onVisit: () => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup, onLike, onSkip, onVisit }) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [locked, setLocked] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    setLocked(true);
    setTimeLeft(3);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startup.id]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (locked) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || locked) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    if (locked) return;
    setIsDragging(false);
    if (offsetX > 100) onLike();
    else if (offsetX < -100) onSkip();
    setOffsetX(0);
  };

  const rotation = offsetX * 0.05;
  const opacity = 1 - Math.min(Math.abs(offsetX) / 500, 0.5);

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000 h-[70vh]">
      <div
        className="absolute inset-0 w-full h-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-100 ease-out"
        style={{
          transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
          opacity: opacity,
          cursor: locked ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab')
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cover Image */}
        <div className="relative h-1/2 w-full bg-slate-900 overflow-hidden group">
          <img 
            src={startup.image_url || `https://picsum.photos/800/600?seed=${startup.id}`} 
            alt={startup.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
             <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-lg">
                <img 
                  src={startup.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${startup.id}`} 
                  alt="Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white shadow-black drop-shadow-md">{startup.title}</h2>
               <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30 backdrop-blur-md">
                 {startup.category}
               </span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-slate-800">
          <div>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              {startup.description}
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
               {locked ? (
                 <span className="flex items-center gap-2 text-indigo-400">
                    <Lock className="w-4 h-4" /> 
                    Wait {timeLeft}s to swipe
                 </span>
               ) : (
                 <>
                   <Info className="w-4 h-4" />
                   <span>Swipe right to like, left to skip</span>
                 </>
               )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={locked}
              onClick={onSkip}
              className="col-span-1 rounded-full aspect-square border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:border-slate-700 disabled:text-slate-700"
            >
              <X className="w-8 h-8" />
            </Button>
            
            <Button 
              variant="primary" 
              className="col-span-2 rounded-full gap-2"
              onClick={onVisit}
            >
              <ExternalLink className="w-5 h-5" />
              Visit Site
            </Button>

            <Button 
              variant="outline" 
              size="icon"
              disabled={locked}
              onClick={onLike} 
              className="col-span-1 rounded-full aspect-square border-green-500/30 text-green-500 hover:bg-green-500/10 disabled:opacity-30 disabled:border-slate-700 disabled:text-slate-700"
            >
              <Heart className="w-8 h-8" />
            </Button>
          </div>
        </div>
        
        {/* Swipe Indicators Overlay */}
        {offsetX > 50 && (
          <div className="absolute top-10 left-10 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-lg transform -rotate-12 opacity-80 bg-slate-900/50 backdrop-blur">
            LIKE
          </div>
        )}
        {offsetX < -50 && (
          <div className="absolute top-10 right-10 border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-lg transform rotate-12 opacity-80 bg-slate-900/50 backdrop-blur">
            SKIP
          </div>
        )}
      </div>
    </div>
  );
};
