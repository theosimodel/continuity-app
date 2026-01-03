import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Comic, Review, ReadState, List } from '../types';
import { getContinuityCount, fetchComicById } from '../services/supabaseService';
import Footer from './Footer';
import {
  Star, Share2, Calendar, Book, Check, X, Pencil, Plus, List as ListIcon,
  Loader2, AlertCircle, BookOpen, Bookmark, Heart
} from 'lucide-react';

interface ComicDetailV2Props {
  comics: Comic[];
  onLog: (comic: Comic, review: Partial<Review>) => void;
  onToggleReadState: (comic: Comic, state: ReadState) => void;
  onUpdateComic: (comic: Comic) => void;
  onSaveRating?: (comic: Comic, rating: number) => void;
  userLists?: List[];
  onAddToList?: (listId: string, comic: Comic) => void;
  isSignedIn?: boolean;
  onShowCreateList?: () => void;
}

const ComicDetailV2: React.FC<ComicDetailV2Props> = ({
  comics,
  onLog,
  onToggleReadState,
  onUpdateComic,
  onSaveRating,
  userLists = [],
  onAddToList,
  isSignedIn,
  onShowCreateList,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const localComic = comics.find(c => c.id === id);

  const [fetchedComic, setFetchedComic] = useState<Comic | null>(null);
  const [isLoadingComic, setIsLoadingComic] = useState(false);

  const comic = localComic || fetchedComic;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [showListMenu, setShowListMenu] = useState(false);
  const [continuityCount, setContinuityCount] = useState<number>(0);
  const [noteSaved, setNoteSaved] = useState(false);

  // Fetch comic from Supabase if not found locally
  useEffect(() => {
    if (localComic) {
      setFetchedComic(null);
      setIsLoadingComic(false);
      return;
    }

    if (id) {
      setIsLoadingComic(true);
      fetchComicById(id).then(result => {
        setFetchedComic(result);
        setIsLoadingComic(false);
      });
    }
  }, [id, localComic]);

  // Reset form state when navigating to a different comic
  useEffect(() => {
    setRating(comic?.rating || 0);
    setHoverRating(0);
    setNoteText('');
    setShareStatus('idle');
    setShowListMenu(false);
    setContinuityCount(0);
    setNoteSaved(false);

    if (id) {
      getContinuityCount(id).then(count => setContinuityCount(count));
    }
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = { title: comic?.title || 'Comic', url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          setShareStatus('copied');
          setTimeout(() => setShareStatus('idle'), 2000);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const handleSaveNote = () => {
    if (comic) {
      onLog(comic, { rating, text: noteText });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  };

  const isInContinuity = (comic?.readStates?.length || 0) > 0;
  const primaryState = comic?.readStates?.[0];

  const stateButtons: { state: ReadState; label: string; icon: React.ReactNode; activeColor: string }[] = [
    { state: 'read', label: 'Read', icon: <BookOpen size={16} />, activeColor: 'bg-[#4FD1C5]' },
    { state: 'owned', label: 'Owned', icon: <Bookmark size={16} />, activeColor: 'bg-[#9CA3AF]' },
    { state: 'want', label: 'Want', icon: <Heart size={16} />, activeColor: 'bg-[#FBBF24]' },
    { state: 'reread', label: 'Reread', icon: <Star size={16} />, activeColor: 'bg-[#A78BFA]' },
  ];

  if (isLoadingComic) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-[#4FD1C5]" size={32} />
    </div>
  );

  if (!comic) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <AlertCircle className="text-red-500" size={48} />
      <h2 className="text-2xl text-white font-bold">Comic not found</h2>
      <button onClick={() => navigate('/')} className="text-[#4FD1C5] underline">Back to safety</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Backdrop */}
      <div className="relative -mx-4 md:-mx-8 h-[400px] mb-[-250px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/80 to-transparent z-10" />
        <img src={comic.coverUrl} className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
      </div>

      <div className="relative z-20 flex flex-col md:flex-row gap-8">
        {/* Left Column - Cover & Status */}
        <div className="md:w-1/5 space-y-6">
          <div className="rounded-lg overflow-hidden border border-[#1E232B] shadow-2xl bg-[#161A21]">
            <img src={comic.coverUrl} alt={comic.title} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Continuity Status Card */}
          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">
              {isInContinuity ? 'In your Continuity' : 'Not yet in your Continuity'}
            </p>
            {isInContinuity && primaryState && (
              <p className="text-sm text-[#4FD1C5] flex items-center gap-1">
                <Check size={14} />
                Marked as {primaryState.charAt(0).toUpperCase() + primaryState.slice(1)}
              </p>
            )}
          </div>

          {/* Rating Status Card */}
          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">
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
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-[#161A21] border border-[#1E232B] hover:bg-[#1E232B] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold"
            >
              {shareStatus === 'copied' ? (
                <><Check size={16} /> Link Copied</>
              ) : (
                <><Share2 size={16} /> Share</>
              )}
            </button>
            <p className="text-[10px] text-[#7C828D] text-center">Share this issue or your note.</p>

            {isSignedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowListMenu(!showListMenu)}
                  className="w-full bg-[#161A21] border border-[#1E232B] hover:bg-[#1E232B] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold"
                >
                  <ListIcon size={16} />
                  Add to a list
                </button>

                {showListMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#161A21] border border-[#1E232B] rounded-xl overflow-hidden z-20 shadow-xl">
                    {userLists.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-[#7C828D] text-sm mb-3">No lists yet</p>
                        <button
                          onClick={() => { setShowListMenu(false); onShowCreateList?.(); }}
                          className="text-[#4FD1C5] text-sm font-medium hover:underline"
                        >
                          Create your first list
                        </button>
                      </div>
                    ) : (
                      <>
                        {userLists.map((list) => (
                          <button
                            key={list.id}
                            onClick={() => { onAddToList?.(list.id, comic); setShowListMenu(false); }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-[#1E232B] transition-colors border-b border-[#1E232B] last:border-0"
                          >
                            <span className="text-sm font-medium">{list.title}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => { setShowListMenu(false); onShowCreateList?.(); }}
                          className="w-full px-4 py-3 text-left text-[#4FD1C5] hover:bg-[#1E232B] transition-colors flex items-center gap-2"
                        >
                          <Plus size={14} />
                          <span className="text-sm font-medium">New List</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Column - Main Content */}
        <div className="md:w-3/5 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#7C828D] text-[10px] font-bold tracking-[0.2em] uppercase">
              <Calendar size={12} /> {comic.year}
              <span className="mx-2 text-[#1E232B]">|</span>
              <Book size={12} /> {comic.publisher}
            </div>
            <h1 className="text-6xl font-space text-white tracking-wide leading-none">{comic.title}</h1>
          </div>

          {/* Credits */}
          <div className="border-y border-[#1E232B] py-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Writer</p>
                <p className="text-white font-bold text-lg">{comic.writer || 'Credits pending'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Artist</p>
                <p className="text-white font-bold text-lg">{comic.artist || 'Credits pending'}</p>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">Story Brief</h3>
            <p className="text-white text-base leading-relaxed">{comic.description || 'No description available.'}</p>
          </div>

          {/* Primary Action - Add to Continuity */}
          <div className="bg-[#161A21] p-6 rounded-xl border border-[#1E232B]">
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
              {stateButtons.map(({ state, label, icon, activeColor }) => {
                const isSelected = comic.readStates?.includes(state);
                return (
                  <button
                    key={state}
                    onClick={() => onToggleReadState(comic, state)}
                    className={`px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${activeColor} text-black`
                        : 'bg-[#0E1116] text-white hover:bg-[#1E232B] border border-[#1E232B]'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Section - Always visible but highlighted after state selection */}
          <div className={`bg-[#161A21] p-6 rounded-xl border ${isInContinuity ? 'border-[#4FD1C5]/30' : 'border-[#1E232B]'}`}>
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
                    onClick={() => {
                      setRating(star);
                      if (comic && onSaveRating) onSaveRating(comic, star);
                    }}
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
                <span className="text-sm text-[#4FD1C5]">
                  Saved to your Continuity
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Meta */}
        <div className="md:w-1/5 space-y-6">
          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Continuity</p>
            <p className="text-white font-bold text-lg">
              {continuityCount > 0 ? `In ${continuityCount.toLocaleString()} Continuities` : 'Not yet added'}
            </p>
          </div>

          {comic.readStates?.length ? (
            <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
              <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Your reading status</p>
              <div className="flex flex-wrap gap-1">
                {comic.readStates.map(state => (
                  <span key={state} className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                    state === 'read' ? 'bg-[#4FD1C5]/20 text-[#4FD1C5]' :
                    state === 'owned' ? 'bg-[#9CA3AF]/20 text-[#9CA3AF]' :
                    state === 'want' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                    'bg-[#A78BFA]/20 text-[#A78BFA]'
                  }`}>{state}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ComicDetailV2;
