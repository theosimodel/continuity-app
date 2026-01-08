
import React, { useState } from 'react';
import { Comic, Review, ReadState } from '../types';
import { X, Star, Share2, List, Check } from 'lucide-react';

interface ComicModalV2Props {
  comic: Comic | null;
  onClose: () => void;
  onLog: (review: Partial<Review>) => void;
  onStateChange?: (state: ReadState) => void;
  initialStates?: ReadState[];
}

const ComicModalV2: React.FC<ComicModalV2Props> = ({
  comic,
  onClose,
  onLog,
  onStateChange,
  initialStates = []
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [selectedStates, setSelectedStates] = useState<ReadState[]>(initialStates);
  const [showReflection, setShowReflection] = useState(initialStates.length > 0);
  const [noteSaved, setNoteSaved] = useState(false);

  if (!comic) return null;

  const handleStateToggle = (state: ReadState) => {
    const hasState = selectedStates.includes(state);
    const newStates = hasState
      ? selectedStates.filter(s => s !== state)
      : [...selectedStates, state];

    setSelectedStates(newStates);

    // Show reflection section once any state is selected
    if (newStates.length > 0 && !showReflection) {
      setShowReflection(true);
    }

    if (onStateChange) {
      onStateChange(state);
    }
  };

  const handleSaveNote = () => {
    onLog({ rating, text: noteText });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const isInContinuity = selectedStates.length > 0;
  const primaryState = selectedStates[0];

  const stateButtons: { state: ReadState; label: string }[] = [
    { state: 'read', label: 'Read' },
    { state: 'owned', label: 'Owned' },
    { state: 'want', label: 'Want' },
    { state: 'reread', label: 'Reread' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0E1116] w-full max-w-4xl rounded-xl shadow-2xl border border-[#1E232B] flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B3B8C2] hover:text-white z-10 bg-black/20 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Left Column */}
        <div className="md:w-1/3 p-8 bg-[#161A21] flex flex-col items-center gap-6 overflow-y-auto">
          {/* Cover Image */}
          <div className="w-full max-w-[240px] rounded-lg overflow-hidden border border-[#1E232B] shadow-xl">
            <img src={comic.coverUrl} alt={comic.title} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Status Card */}
          <div className="w-full bg-[#0E1116] p-4 rounded-lg border border-[#1E232B]">
            <p className="text-xs text-[#7C828D] mb-1">
              {isInContinuity ? 'In your Continuity' : 'Not yet in your Continuity'}
            </p>
            {isInContinuity && primaryState && (
              <p className="text-sm text-[#4FD1C5] flex items-center gap-1">
                <Check size={14} />
                Marked as {primaryState.charAt(0).toUpperCase() + primaryState.slice(1)}
              </p>
            )}
          </div>

          {/* Rating Status */}
          <div className="w-full bg-[#0E1116] p-4 rounded-lg border border-[#1E232B]">
            <p className="text-xs text-[#7C828D] mb-1">
              {rating > 0 ? 'Your rating' : 'Not yet rated'}
            </p>
            {rating > 0 && (
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`${rating >= star ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#1E232B]'}`}
                    size={16}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="w-full space-y-2">
            <button className="w-full bg-[#1E232B] hover:bg-[#2A303C] text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm transition-colors">
              <Share2 size={16} />
              Share
            </button>
            <p className="text-xs text-[#7C828D] text-center">Share this issue or your note.</p>

            <button className="w-full bg-[#1E232B] hover:bg-[#2A303C] text-white py-2.5 rounded flex items-center justify-center gap-2 text-sm transition-colors mt-3">
              <List size={16} />
              Add to a list
            </button>
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-2/3 p-8 overflow-y-auto bg-[#0E1116]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bebas text-white tracking-wide mb-1">{comic.title}</h2>
            <div className="flex items-center gap-4 text-sm text-[#B3B8C2]">
              <span>{comic.year}</span>
              <span>Written by <span className="text-white hover:underline cursor-pointer">{comic.writer}</span></span>
              <span>Art by <span className="text-white hover:underline cursor-pointer">{comic.artist}</span></span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Synopsis */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#7C828D] border-b border-[#1E232B] pb-1 mb-4">SYNOPSIS</h3>
              <p className="text-[#B3B8C2] leading-relaxed italic">{comic.description}</p>
            </div>

            {/* Primary Action - State Selection */}
            <div className="bg-[#161A21] p-6 rounded-lg border border-[#1E232B]">
              {isInContinuity ? (
                <>
                  <h3 className="text-lg font-semibold text-[#4FD1C5] mb-1 flex items-center gap-2">
                    <Check size={20} />
                    Added to your Continuity
                  </h3>
                  <p className="text-sm text-[#B3B8C2] mb-4">
                    Marked as <span className="text-white">{primaryState?.charAt(0).toUpperCase()}{primaryState?.slice(1)}</span>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-1">Add to your Continuity</h3>
                  <p className="text-sm text-[#B3B8C2] mb-4">Choose how this issue fits into your reading history.</p>
                </>
              )}

              <div className="flex flex-wrap gap-2">
                {stateButtons.map(({ state, label }) => {
                  const isSelected = selectedStates.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => handleStateToggle(state)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[#4FD1C5] text-black'
                          : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'
                      }`}
                    >
                      {isSelected && <Check size={14} className="inline mr-1" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Section - Appears after state selection */}
            {showReflection && (
              <div className="bg-[#161A21] p-6 rounded-lg border border-[#1E232B] animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-white mb-1">Your take</h3>
                <p className="text-sm text-[#7C828D] mb-6">For you — not for an algorithm.</p>

                {/* Rating */}
                <div className="mb-6">
                  <p className="text-sm text-[#B3B8C2] mb-3">How did this one land?</p>
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
                          className={`${(hoverRating || rating) >= star ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#2A303C]'}`}
                          size={32}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <textarea
                  className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg p-4 text-white text-sm focus:outline-none focus:border-[#4FD1C5] transition-colors resize-none h-32 mb-4"
                  placeholder="Why did this one matter to you?"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText && !rating}
                    className="bg-[#4FD1C5] hover:bg-[#38B2AC] disabled:bg-[#2A303C] disabled:text-[#7C828D] text-black font-semibold py-2.5 px-6 rounded transition-colors"
                  >
                    Save your note
                  </button>
                  {noteSaved && (
                    <span className="text-sm text-[#4FD1C5] animate-in fade-in">
                      Saved to your Continuity
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
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

export default ComicModalV2;
