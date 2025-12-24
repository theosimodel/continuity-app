
import React, { useState } from 'react';
import { Comic, Review } from '../types';
import { X, Star, Calendar, Heart, Share2, BookOpen } from 'lucide-react';

interface ComicModalProps {
  comic: Comic | null;
  onClose: () => void;
  onLog: (review: Partial<Review>) => void;
}

const ComicModal: React.FC<ComicModalProps> = ({ comic, onClose, onLog }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (!comic) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0E1116] w-full max-w-4xl rounded-xl shadow-2xl border border-[#1E232B] flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B3B8C2] hover:text-white z-10 bg-black/20 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Backdrop for mobile or left side */}
        <div className="md:w-1/3 p-8 bg-[#161A21] flex flex-col items-center gap-6 overflow-y-auto">
          <div className="w-full max-w-[240px] rounded-lg overflow-hidden border border-[#1E232B] shadow-xl">
            <img src={comic.coverUrl} alt={comic.title} className="w-full aspect-[2/3] object-cover" />
          </div>
          
          <div className="w-full space-y-4">
            <button
              className="w-full bg-[#4FD1C5] hover:bg-[#38B2AC] text-black font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors"
              onClick={() => onLog({ rating, text: reviewText })}
            >
              <BookOpen size={18} />
              ADD TO CONTINUITY
            </button>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#1E232B] hover:bg-[#2A303C] text-white py-2 rounded flex items-center justify-center gap-2">
                <Heart size={16} />
                LIKE
              </button>
              <button className="flex-1 bg-[#1E232B] hover:bg-[#2A303C] text-white py-2 rounded flex items-center justify-center gap-2">
                <Share2 size={16} />
                SHARE
              </button>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-2/3 p-8 overflow-y-auto bg-[#0E1116]">
          <div className="mb-8">
            <h2 className="text-4xl font-bebas text-white tracking-wide mb-1">{comic.title}</h2>
            <div className="flex items-center gap-4 text-sm text-[#B3B8C2]">
              <span>{comic.year}</span>
              <span>Directed by <span className="text-white hover:underline cursor-pointer">{comic.writer}</span></span>
              <span>Art by <span className="text-white hover:underline cursor-pointer">{comic.artist}</span></span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#7C828D] border-b border-[#1E232B] pb-1 mb-4">SYNOPSIS</h3>
              <p className="text-[#B3B8C2] leading-relaxed italic">{comic.description}</p>
            </div>

            <div className="bg-[#161A21] p-6 rounded-lg border border-[#1E232B]">
              <h3 className="text-xs font-bold tracking-widest text-[#7C828D] mb-4">YOUR LOG</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star 
                        className={`${(hoverRating || rating) >= star ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#1E232B]'}`} 
                        size={28} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[#7C828D] text-sm">Rate this comic</span>
              </div>

              <textarea 
                className="w-full bg-[#0E1116] border border-[#1E232B] rounded p-4 text-white text-sm focus:outline-none focus:border-[#4FD1C5] transition-colors resize-none h-32"
                placeholder="Write a review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#161A21] p-4 rounded border border-[#1E232B]">
                <p className="text-xs text-[#7C828D] mb-1">PUBLISHER</p>
                <p className="text-sm text-white">{comic.publisher}</p>
              </div>
              <div className="bg-[#161A21] p-4 rounded border border-[#1E232B]">
                <p className="text-xs text-[#7C828D] mb-1">FIRST RELEASED</p>
                <p className="text-sm text-white">{comic.year}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicModal;
