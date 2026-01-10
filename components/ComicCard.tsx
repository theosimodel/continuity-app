
import React, { useState, useEffect } from 'react';
import { Comic, ReadState } from '../types';
import { ImageOff, Loader2, Bookmark, Check, Heart } from 'lucide-react';
import { searchOpenLibraryCover } from '../services/geminiService';

interface ComicCardProps {
  comic: Comic;
  onClick: (comic: Comic) => void;
  onToggleReadState?: (comic: Comic, state: ReadState) => void;
  size?: 'small' | 'large';
}

const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick, onToggleReadState, size = 'large' }) => {
  const [imgUrl, setImgUrl] = useState(comic.coverUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync imgUrl when comic.coverUrl changes externally (e.g., after regeneration)
  useEffect(() => {
    if (comic.coverUrl && comic.coverUrl !== imgUrl) {
      setImgUrl(comic.coverUrl);
      setHasError(false);
    }
  }, [comic.coverUrl]);

  useEffect(() => {
    let cancelled = false;
    const handleMissingImage = async () => {
      if (!imgUrl && !isGenerating && !hasError) {
        setIsGenerating(true);
        // Try Open Library first (fast and reliable)
        const openLibraryCover = await searchOpenLibraryCover(comic.title);
        if (!cancelled) {
          if (openLibraryCover) {
            setImgUrl(openLibraryCover);
            setHasError(false);
          } else {
            setHasError(true);
          }
          setIsGenerating(false);
        }
      }
    };
    handleMissingImage();
    return () => { cancelled = true; };
  }, [comic.id, imgUrl, hasError]);

  const handleImgError = async () => {
    if (!isGenerating && !imgUrl?.startsWith('data:') && !hasError) {
      setIsGenerating(true);
      const openLibraryCover = await searchOpenLibraryCover(comic.title);
      if (openLibraryCover) {
        setImgUrl(openLibraryCover);
        setHasError(false);
      } else {
        setHasError(true);
      }
      setIsGenerating(false);
    }
  };

  return (
    <div className="group relative">
      <div 
        className={`cursor-pointer overflow-hidden rounded-md border ${comic.readStates?.includes('owned') ? 'border-[#4FD1C5] ring-1 ring-[#4FD1C5]/30' : 'border-[#1E232B]'} transition-all duration-300 comic-card-shadow group-hover:scale-[1.02] bg-[#161A21] relative`}
        onClick={() => onClick({ ...comic, coverUrl: imgUrl })}
      >
        {isGenerating ? (
          <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-[#161A21] p-4 text-center">
            <Loader2 className="text-[#4FD1C5] animate-spin mb-2" size={32} />
            <span className="text-[8px] text-[#7C828D] font-bold uppercase tracking-widest animate-pulse">Retrieving Art...</span>
          </div>
        ) : (hasError || !imgUrl) ? (
          <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-[#1E232B] p-4 text-center">
            <ImageOff className="text-[#7C828D] mb-2" size={32} />
            <span className="text-[10px] text-[#7C828D] font-bold uppercase tracking-widest line-clamp-2">{comic.title}</span>
          </div>
        ) : (
          <img 
            src={imgUrl} 
            alt={comic.title}
            className="w-full aspect-[2/3] object-cover bg-[#1E232B]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImgError}
          />
        )}
        
        {/* Owned Badge */}
        {!isGenerating && comic.readStates?.includes('owned') && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="bg-[#4FD1C5] text-black text-[7px] font-extrabold px-1.5 py-0.5 rounded-sm shadow-lg flex items-center gap-1 border border-white/20 uppercase">
              <Check size={8} strokeWidth={4} /> Owned
            </div>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-20 backdrop-blur-[2px]">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReadState?.(comic, 'owned');
              }}
              className={`p-3 rounded-full transition-all transform hover:scale-110 active:scale-90 ${comic.readStates?.includes('owned') ? 'bg-[#4FD1C5] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              title={comic.readStates?.includes('owned') ? "Remove from Long Boxes" : "Add to Long Boxes"}
            >
              <Bookmark size={20} fill={comic.readStates?.includes('owned') ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReadState?.(comic, 'want');
              }}
              className={`p-3 rounded-full transition-all transform hover:scale-110 active:scale-90 ${comic.readStates?.includes('want') ? 'bg-[#FBBF24] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              title={comic.readStates?.includes('want') ? "Remove from Want list" : "Add to Want list"}
            >
              <Heart size={20} fill={comic.readStates?.includes('want') ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
      {size === 'large' && (
        <div className="mt-2">
          <h3 className="text-white font-medium text-sm truncate group-hover:text-[#4FD1C5] transition-colors">{comic.title}</h3>
          <p className="text-[10px] font-bold text-[#7C828D] tracking-wider">{comic.year}</p>
          {comic.publisher && (
            <p className="text-[10px] text-[#7C828D]/70 truncate">{comic.publisher}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ComicCard;
