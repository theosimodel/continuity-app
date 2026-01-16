import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Comic, Review, ReadState, List, AIEnrichment } from '../types';
import { getContinuityCount, fetchComicById, saveEnrichment } from '../services/supabaseService';
import { aiEnrichmentService } from '../services/aiEnrichmentService';
import SignificanceBadge, { getFirstAppearancesText } from './SignificanceBadge';
import {
  Star, Share2, Calendar, Book, Check, X, Pencil, Plus, List as ListIcon,
  Loader2, AlertCircle, BookOpen, Bookmark, Heart, Sparkles, Eye, EyeOff, RefreshCw
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
  const [isEditingNote, setIsEditingNote] = useState(false);

  // AI Enrichment state
  const [isEnriching, setIsEnriching] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);

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

  // Reset form state when navigating to a different comic or when comic data loads
  useEffect(() => {
    setRating(comic?.rating || 0);
    setHoverRating(0);
    setNoteText(comic?.review || '');
    setShareStatus('idle');
    setShowListMenu(false);
    setNoteSaved(false);
    setShowSpoilers(false);
    setIsEditingNote(false);
  }, [id, comic?.rating, comic?.review]);

  // Fetch continuity count separately (only on id change)
  useEffect(() => {
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
      setIsEditingNote(false);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  };

  // Handle AI enrichment
  const handleEnrich = async () => {
    if (!comic || isEnriching) return;

    setIsEnriching(true);
    setEnrichmentError(null);

    try {
      const enrichment = await aiEnrichmentService.enrichComic(comic);

      if (enrichment) {
        // Save to database
        await saveEnrichment(comic.id, enrichment);

        // Update local state
        const updatedComic = { ...comic, aiEnrichment: enrichment };
        onUpdateComic(updatedComic);

        // Also update fetchedComic if that's what we're viewing
        if (fetchedComic) {
          setFetchedComic(updatedComic);
        }
      } else {
        setEnrichmentError('Could not analyze this comic. Please try again.');
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      setEnrichmentError('An error occurred. Please try again.');
    } finally {
      setIsEnriching(false);
    }
  };

  // Only 'read' and 'reread' count as being in your Continuity
  // 'want' and 'owned' are tracking states that don't add to Continuity
  const continuityStates: ReadState[] = ['read', 'reread'];
  const isInContinuity = comic?.readStates?.some(state => continuityStates.includes(state)) || false;
  const primaryState = comic?.readStates?.find(state => continuityStates.includes(state)) || comic?.readStates?.[0];

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
      <div className="relative -mx-4 md:-mx-8 h-[240px] md:h-[260px] mb-[-200px] md:mb-[-210px] overflow-hidden">
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

          {/* AI Enrichment Section */}
          {comic.aiEnrichment ? (
            <div className="bg-[#161A21] p-6 rounded-xl border border-[#1E232B] space-y-4">
              {/* Header with badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-[#4FD1C5]" size={20} />
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">AI Insights</h3>
                  <button
                    onClick={handleEnrich}
                    disabled={isEnriching}
                    className="text-[#7C828D] hover:text-[#4FD1C5] transition-colors disabled:opacity-50"
                    title="Regenerate insights"
                  >
                    <RefreshCw size={14} className={isEnriching ? 'animate-spin' : ''} />
                  </button>
                </div>
                <SignificanceBadge enrichment={comic.aiEnrichment} />
              </div>

              {/* Spoiler-free summary */}
              {comic.aiEnrichment.spoilerFreeSummary && (
                <p className="text-white text-base leading-relaxed">
                  {comic.aiEnrichment.spoilerFreeSummary}
                </p>
              )}

              {/* First Appearances */}
              {comic.aiEnrichment.firstAppearances && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-[10px] text-purple-400 font-bold tracking-widest uppercase mb-2">
                    First Appearance
                  </p>
                  <p className="text-white text-sm">
                    {getFirstAppearancesText(comic.aiEnrichment)}
                  </p>
                </div>
              )}

              {/* Key Events */}
              {comic.aiEnrichment.keyEvents && comic.aiEnrichment.keyEvents.length > 0 && (
                <div>
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Key Events</p>
                  <ul className="space-y-1">
                    {comic.aiEnrichment.keyEvents.map((event, i) => (
                      <li key={i} className="text-sm text-[#B3B8C2] flex items-start gap-2">
                        <span className="text-[#4FD1C5] mt-1">•</span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Significance Notes */}
              {comic.aiEnrichment.significanceNotes && (
                <div>
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Why It Matters</p>
                  <p className="text-sm text-[#B3B8C2]">{comic.aiEnrichment.significanceNotes}</p>
                </div>
              )}

              {/* Spoiler Toggle & Full Summary */}
              {comic.aiEnrichment.storySummary && (
                <div className="border-t border-[#1E232B] pt-4">
                  <button
                    onClick={() => setShowSpoilers(!showSpoilers)}
                    className="flex items-center gap-2 text-sm text-[#7C828D] hover:text-white transition-colors"
                  >
                    {showSpoilers ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSpoilers ? 'Hide Spoilers' : 'Show Full Summary (Spoilers)'}
                  </button>
                  {showSpoilers && (
                    <p className="text-white text-sm leading-relaxed mt-3 p-3 bg-[#0E1116] rounded-lg border border-[#1E232B]">
                      {comic.aiEnrichment.storySummary}
                    </p>
                  )}
                </div>
              )}

              {/* Must Read / Can Skip indicators */}
              <div className="flex gap-3 text-xs">
                {comic.aiEnrichment.mustRead && (
                  <span className="text-[#4FD1C5] flex items-center gap-1">
                    <Check size={12} /> Must Read
                  </span>
                )}
                {comic.aiEnrichment.canSkip && (
                  <span className="text-[#7C828D] flex items-center gap-1">
                    <X size={12} /> Optional
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161A21] p-6 rounded-xl border border-[#1E232B]">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-[#4FD1C5]" size={20} />
                <h3 className="text-lg font-semibold text-white">Consult the Archivist</h3>
              </div>
              <p className="text-sm text-[#B3B8C2] mb-4">
                What happens in this issue — and why it matters. Key moments, first appearances, and context.
              </p>
              {enrichmentError && (
                <p className="text-red-400 text-sm mb-3">{enrichmentError}</p>
              )}
              <button
                onClick={handleEnrich}
                disabled={isEnriching || !aiEnrichmentService.isAvailable()}
                className="bg-[#4FD1C5] hover:bg-[#38B2AC] disabled:bg-[#2A303C] disabled:text-[#7C828D] text-black font-semibold py-2.5 px-6 rounded transition-colors flex items-center gap-2"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Consulting...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Consult the Archivist
                  </>
                )}
              </button>
              {!aiEnrichmentService.isAvailable() && (
                <p className="text-[#7C828D] text-xs mt-2">AI features require a Gemini API key.</p>
              )}
            </div>
          )}

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
            <p className="text-sm text-[#7C828D] mb-4">For you — not for an algorithm.</p>

            {/* Display saved note OR show edit form */}
            {(comic?.review || comic?.rating) && !isEditingNote ? (
              // Saved note display
              <div className="space-y-4">
                {/* Rating display */}
                {comic.rating && comic.rating > 0 && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`${comic.rating && comic.rating >= star ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#2A303C]'}`}
                        size={24}
                      />
                    ))}
                  </div>
                )}

                {/* Note text */}
                {comic.review && (
                  <p className="text-white text-base leading-relaxed">{comic.review}</p>
                )}

                {/* Edit button */}
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-sm text-[#7C828D] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            ) : (
              // Edit form
              <>
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
                    Save
                  </button>
                  {isEditingNote && (
                    <button
                      onClick={() => {
                        setIsEditingNote(false);
                        setNoteText(comic?.review || '');
                        setRating(comic?.rating || 0);
                      }}
                      className="text-[#7C828D] hover:text-white py-2.5 px-4 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {noteSaved && (
                    <span className="text-sm text-[#4FD1C5]">
                      Saved
                    </span>
                  )}
                </div>
              </>
            )}
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
    </div>
  );
};

export default ComicDetailV2;
