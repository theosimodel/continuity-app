
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import ComicCard from './components/ComicCard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import CreateListModal from './components/CreateListModal';
import ListView from './components/ListView';
import ListCard from './components/ListCard';
import ResetPassword from './components/ResetPassword';
import { INITIAL_COMICS, STARTER_PICKS } from './constants';
import { Comic, UserProfile, Review, ReadState, List, ListItem, ListVisibility } from './types';
import { getComicRecommendations } from './services/geminiService';
import { searchComics as searchComicVine } from './services/comicVineService';
import { onAuthStateChange, signOut, getProfile, updateProfile, Profile, getUserLists, getListItems, createList, addComicToList, updateList, deleteList, removeComicFromList, getContinuityCount, fetchComicById, upsertComic, updateUserComic, fetchUserComics } from './services/supabaseService';
import {
  Search, TrendingUp, Calendar, LayoutGrid, Heart, BookOpen, Clock,
  Loader2, Sparkles, Star, Share2, ExternalLink, X,
  Key, AlertCircle, ChevronDown, User as UserIcon, ArrowLeft, Info, Book, HelpCircle, ExternalLink as ExtIcon,
  CreditCard, ShieldAlert, Bookmark, Pencil, Check, Archive, Eye, PenTool, Plus, List as ListIcon
} from 'lucide-react';

// --- Components ---

const Home: React.FC<{
  comics: Comic[],
  sortBy: string,
  setSortBy: (s: any) => void,
  recommendations: Comic[],
  starterPicks: Comic[],
  isLoadingRecs: boolean,
  onToggleReadState: (c: Comic, state: ReadState) => void,
  continuityCount: number,
  isFirstVisit: boolean,
  onDismissWelcome: () => void,
  isSignedIn: boolean,
  onStartContinuity: () => void
}> = ({ comics, sortBy, setSortBy, recommendations, starterPicks, isLoadingRecs, onToggleReadState, continuityCount, isFirstVisit, onDismissWelcome, isSignedIn, onStartContinuity }) => {
  const navigate = useNavigate();

  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [comics, sortBy]);

  // Use starter picks until user has 3+ items in Continuity
  const picksToShow = continuityCount < 3 ? starterPicks : recommendations;
  const picksSubheader = continuityCount < 3
    ? "Hand-picked to start your Continuity"
    : "From your Continuity";

  return (
    <div className="space-y-12">
      {/* Welcome message for first-time users */}
      {isFirstVisit && (
        <section className="bg-gradient-to-r from-[#161A21] to-[#1E232B] p-8 rounded-xl border border-[#4FD1C5]/20 relative">
          <button
            onClick={onDismissWelcome}
            className="absolute top-4 right-4 text-[#7C828D] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-3xl font-space font-bold text-white mb-2">Welcome to Continuity</h2>
          <p className="text-[#B3B8C2] text-lg mb-2">Track what you read. Discover what matters. Build your personal canon.</p>
          <p className="text-[#7C828D] text-sm">Start anywhere. Your Continuity grows as you read.</p>
        </section>
      )}

      <section className="relative h-[400px] rounded-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <img
          src="https://wallpapercave.com/wp/wp13746630.jpg"
          alt="Comic book collection background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-12 max-w-2xl">
          <div className="flex items-center gap-2 text-[#4FD1C5] mb-4">
            <TrendingUp size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">Featured</span>
          </div>
          <h2 className="text-7xl font-space font-bold text-white mb-4 leading-tight">BEYOND THE PANEL</h2>
          <p className="text-[#B3B8C2] text-lg mb-8 line-clamp-2">Track what you're reading, build your collection, and discover new universes.</p>
          <div className="flex gap-4">
            <button
              onClick={onStartContinuity}
              className="bg-white text-black font-bold px-8 py-3 rounded hover:bg-[#4FD1C5] transition-colors"
            >
              Start your Continuity
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between border-b border-[#1E232B] pb-2 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold tracking-widest text-[#B3B8C2]">TRENDING</h3>
            <div className="flex items-center gap-2 border-l border-[#1E232B] pl-4">
              <span className="text-[10px] text-[#7C828D] font-bold">SORT BY</span>
              <div className="relative flex items-center group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[10px] text-white font-bold outline-none cursor-pointer pr-4 appearance-none hover:text-[#4FD1C5] transition-colors"
                >
                  <option value="title" className="bg-[#161A21]">NAME</option>
                  <option value="year" className="bg-[#161A21]">RELEASE DATE</option>
                  <option value="rating" className="bg-[#161A21]">USER RATING</option>
                </select>
                <ChevronDown size={10} className="absolute right-0 pointer-events-none text-[#7C828D]" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {sortedComics.map(comic => (
            <ComicCard
              key={comic.id}
              comic={comic}
              onClick={() => navigate(`/comic/${comic.id}`)}
              onToggleReadState={onToggleReadState}
            />
          ))}
        </div>
      </section>

      <section id="starter-picks" className="bg-[#161A21] p-8 rounded-xl border border-[#1E232B]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#4FD1C5] p-2 rounded-lg">
            <Sparkles className="text-black" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">Picks</h3>
            <p className="text-xs text-[#7C828D]">{picksSubheader}</p>
          </div>
        </div>
        {isLoadingRecs && continuityCount > 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-[#4FD1C5]" size={40} />
            <p className="text-[#7C828D] text-sm animate-pulse">Preparing your Picks…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-6">
            {picksToShow.map(comic => (
              <ComicCard
                key={comic.id}
                comic={comic}
                onClick={() => navigate(`/comic/${comic.id}`)}
                onToggleReadState={onToggleReadState}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ComicDetail: React.FC<{
  comics: Comic[],
  onLog: (comic: Comic, review: Partial<Review>) => void,
  onToggleReadState: (comic: Comic, state: ReadState) => void,
  onUpdateComic: (comic: Comic) => void,
  onSaveRating?: (comic: Comic, rating: number) => void,
  userLists?: List[],
  onAddToList?: (listId: string, comic: Comic) => void,
  isSignedIn?: boolean,
  onShowCreateList?: () => void,
  isCanonEditor?: boolean
}> = ({ comics, onLog, onToggleReadState, onUpdateComic, onSaveRating, userLists = [], onAddToList, isSignedIn, onShowCreateList, isCanonEditor = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const comic = comics.find(c => c.id === id);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [showListMenu, setShowListMenu] = useState(false);
  const [continuityCount, setContinuityCount] = useState<number>(0);
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [editWriter, setEditWriter] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Reset form state when navigating to a different comic
  useEffect(() => {
    setRating(comic?.rating || 0);
    setHoverRating(0);
    setReviewText('');
    setIsEditingCover(false);
    setNewCoverUrl('');
    setShareStatus('idle');
    setShowListMenu(false);
    setContinuityCount(0);
    setIsEditingCredits(false);
    setEditWriter('');
    setEditArtist('');
    setIsEditingDescription(false);
    setEditDescription('');
    setIsEditingTitle(false);
    setEditTitle('');

    // Fetch continuity count for this comic
    if (id) {
      getContinuityCount(id).then(count => setContinuityCount(count));
    }
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: comic?.title || 'Comic',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
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

  const handleSaveCover = () => {
    if (newCoverUrl.trim()) {
      onUpdateComic({ ...comic, coverUrl: newCoverUrl.trim() });
    }
    setIsEditingCover(false);
    setNewCoverUrl('');
  };

  const handleStartEditCredits = () => {
    setEditWriter(comic?.writer || '');
    setEditArtist(comic?.artist || '');
    setIsEditingCredits(true);
  };

  const handleSaveCredits = () => {
    if (comic) {
      onUpdateComic({
        ...comic,
        writer: editWriter.trim() || comic.writer,
        artist: editArtist.trim() || comic.artist,
      });
    }
    setIsEditingCredits(false);
    setEditWriter('');
    setEditArtist('');
  };

  const handleCancelEditCredits = () => {
    setIsEditingCredits(false);
    setEditWriter('');
    setEditArtist('');
  };

  const handleStartEditDescription = () => {
    setEditDescription(comic?.description || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    if (comic) {
      onUpdateComic({
        ...comic,
        description: editDescription.trim() || comic.description,
      });
    }
    setIsEditingDescription(false);
    setEditDescription('');
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditDescription('');
  };

  const handleStartEditTitle = () => {
    setEditTitle(comic?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (comic && editTitle.trim()) {
      onUpdateComic({
        ...comic,
        title: editTitle.trim(),
      });
    }
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const getWhereToRead = (c: Comic): string => {
    if (c.whereToRead) return c.whereToRead;  // Manual override

    const pub = c.publisher?.toLowerCase() || '';
    if (pub.includes('marvel')) return 'Available on Marvel Unlimited';
    if (pub.includes('dc')) return 'Available on DC Universe Infinite';

    return 'Availability varies by region and format.';
  };

  if (!comic) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <AlertCircle className="text-red-500" size={48} />
      <h2 className="text-2xl text-white font-bold">Comic not found</h2>
      <button onClick={() => navigate('/')} className="text-[#4FD1C5] underline">Back to safety</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative -mx-4 md:-mx-8 h-[400px] mb-[-250px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-[#0E1116]/80 to-transparent z-10" />
        <img src={comic.coverUrl} className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
      </div>

      <div className="relative z-20 flex flex-col md:flex-row gap-8">
        {/* Cover Column - Left */}
        <div className="md:w-1/5 space-y-6">
          <div className="rounded-lg overflow-hidden border border-[#1E232B] shadow-2xl bg-[#161A21] relative group">
             <img src={comic.coverUrl} alt={comic.title} className="w-full aspect-[2/3] object-cover" />
             {!isEditingCover && isCanonEditor && (
               <button
                 onClick={() => setIsEditingCover(true)}
                 className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
               >
                 <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full">
                   <Pencil size={20} className="text-white" />
                 </div>
               </button>
             )}
          </div>
          {isEditingCover && isCanonEditor && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Paste cover image URL..."
                value={newCoverUrl}
                onChange={(e) => setNewCoverUrl(e.target.value)}
                className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4FD1C5]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCover}
                  className="flex-1 bg-[#4FD1C5] text-black font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => { setIsEditingCover(false); setNewCoverUrl(''); }}
                  className="flex-1 bg-[#1E232B] text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Mark as</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleReadState(comic, 'read')}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${comic.readStates?.includes('read') ? 'bg-[#4FD1C5] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              >
                <BookOpen size={16} />
                READ
              </button>
              <button
                onClick={() => onToggleReadState(comic, 'owned')}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${comic.readStates?.includes('owned') ? 'bg-[#9CA3AF] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              >
                <Bookmark size={16} />
                OWNED
              </button>
              <button
                onClick={() => onToggleReadState(comic, 'want')}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${comic.readStates?.includes('want') ? 'bg-[#FBBF24] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              >
                <Heart size={16} />
                WANT
              </button>
              <button
                onClick={() => onToggleReadState(comic, 'reread')}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs ${comic.readStates?.includes('reread') ? 'bg-[#A78BFA] text-black' : 'bg-[#1E232B] text-white hover:bg-[#2A303C]'}`}
              >
                <Star size={16} />
                REREAD
              </button>
            </div>
            <button
              onClick={handleShare}
              className="w-full bg-[#161A21] border border-[#1E232B] hover:bg-[#1E232B] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold"
            >
              {shareStatus === 'copied' ? (
                <>
                  <Check size={16} />
                  Link Copied
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  Share
                </>
              )}
            </button>

            {/* Add to List */}
            {isSignedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowListMenu(!showListMenu)}
                  className="w-full bg-[#161A21] border border-[#1E232B] hover:bg-[#1E232B] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold"
                >
                  <Plus size={16} />
                  Add to reading list
                </button>

                {showListMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#161A21] border border-[#1E232B] rounded-xl overflow-hidden z-20 shadow-xl">
                    {userLists.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-[#7C828D] text-sm mb-3">No lists yet</p>
                        <button
                          onClick={() => {
                            setShowListMenu(false);
                            onShowCreateList?.();
                          }}
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
                            onClick={() => {
                              onAddToList?.(list.id, comic);
                              setShowListMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-[#1E232B] transition-colors border-b border-[#1E232B] last:border-0"
                          >
                            <span className="text-sm font-medium">{list.title}</span>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setShowListMenu(false);
                            onShowCreateList?.();
                          }}
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

        {/* Content Column - Center */}
        <div className="md:w-3/5 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#7C828D] text-[10px] font-bold tracking-[0.2em] uppercase">
              <Calendar size={12} /> {comic.year}
              <span className="mx-2 text-[#1E232B]">|</span>
              <Book size={12} /> {comic.publisher}
            </div>
            {isEditingTitle && isCanonEditor ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Comic title"
                  className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-3 text-4xl font-space text-white focus:outline-none focus:border-[#4FD1C5]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTitle}
                    className="bg-[#4FD1C5] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={handleCancelEditTitle}
                    className="bg-[#1E232B] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`relative ${isCanonEditor ? 'group' : ''} inline-block`}>
                <h1 className="text-6xl font-space text-white tracking-wide leading-none">{comic.title}</h1>
                {isCanonEditor && (
                  <button
                    onClick={handleStartEditTitle}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E232B] p-2 rounded-full"
                    title="Edit title"
                  >
                    <Pencil size={14} className="text-[#7C828D]" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-y border-[#1E232B] py-6">
            {!isCanonEditor && (
              <p className="text-[#4A4F57] text-[10px] mb-4">Metadata curated by Continuity.</p>
            )}
            {isEditingCredits && isCanonEditor ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Writer</label>
                    <input
                      type="text"
                      value={editWriter}
                      onChange={(e) => setEditWriter(e.target.value)}
                      placeholder="Writer name"
                      className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4FD1C5]"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Artist</label>
                    <input
                      type="text"
                      value={editArtist}
                      onChange={(e) => setEditArtist(e.target.value)}
                      placeholder="Artist name"
                      className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4FD1C5]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCredits}
                    className="bg-[#4FD1C5] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={handleCancelEditCredits}
                    className="bg-[#1E232B] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-8 relative ${isCanonEditor ? 'group' : ''}`}>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Writer</p>
                  <p className={`text-white font-bold text-lg ${comic.writer === 'Unknown' || !comic.writer ? 'text-[#7C828D] italic' : ''}`}>
                    {comic.writer === 'Unknown' || !comic.writer ? 'Credits pending' : comic.writer}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Artist</p>
                  <p className={`text-white font-bold text-lg ${comic.artist === 'Unknown' || !comic.artist ? 'text-[#7C828D] italic' : ''}`}>
                    {comic.artist === 'Unknown' || !comic.artist ? 'Credits pending' : comic.artist}
                  </p>
                </div>
                {isCanonEditor && (
                  <button
                    onClick={handleStartEditCredits}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E232B] p-2 rounded-full"
                    title="Edit credits"
                  >
                    <Pencil size={14} className="text-[#7C828D]" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">Story Brief</h3>
              {!isCanonEditor && (
                <p className="text-[#4A4F57] text-[10px]">Curated by Continuity</p>
              )}
            </div>
            {isEditingDescription && isCanonEditor ? (
              <div className="space-y-3">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={5}
                  className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4FD1C5] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDescription}
                    className="bg-[#4FD1C5] text-black font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={handleCancelEditDescription}
                    className="bg-[#1E232B] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`relative ${isCanonEditor ? 'group' : ''}`}>
                <p className={`text-white text-base leading-relaxed ${!comic.description || comic.description === 'No description available.' ? 'text-[#7C828D] italic' : ''}`}>
                  {comic.description || 'No description available.'}
                </p>
                {isCanonEditor && (
                  <button
                    onClick={handleStartEditDescription}
                    className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E232B] p-2 rounded-full"
                    title="Edit description"
                  >
                    <Pencil size={14} className="text-[#7C828D]" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">Where to Read</h3>
            <p className="text-[#B3B8C2] text-sm">{getWhereToRead(comic)}</p>
          </div>

          <div className="bg-[#161A21] p-6 rounded-xl border border-[#1E232B]">
             <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] mb-6 uppercase">Add to your Continuity</h3>
             <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Mark as</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleReadState(comic, 'read')}
                      className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${comic.readStates?.includes('read') ? 'bg-[#4FD1C5] text-black' : 'bg-[#0E1116] text-white hover:bg-[#1E232B] border border-[#1E232B]'}`}
                    >
                      <BookOpen size={14} />
                      Read
                    </button>
                    <button
                      onClick={() => onToggleReadState(comic, 'owned')}
                      className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${comic.readStates?.includes('owned') ? 'bg-[#9CA3AF] text-black' : 'bg-[#0E1116] text-white hover:bg-[#1E232B] border border-[#1E232B]'}`}
                    >
                      <Bookmark size={14} />
                      Owned
                    </button>
                    <button
                      onClick={() => onToggleReadState(comic, 'want')}
                      className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${comic.readStates?.includes('want') ? 'bg-[#FBBF24] text-black' : 'bg-[#0E1116] text-white hover:bg-[#1E232B] border border-[#1E232B]'}`}
                    >
                      <Heart size={14} />
                      Want
                    </button>
                    <button
                      onClick={() => onToggleReadState(comic, 'reread')}
                      className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${comic.readStates?.includes('reread') ? 'bg-[#A78BFA] text-black' : 'bg-[#0E1116] text-white hover:bg-[#1E232B] border border-[#1E232B]'}`}
                    >
                      <Star size={14} />
                      Reread
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Your take</p>
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
                        className="transition-all transform active:scale-90"
                      >
                        <Star
                          className={`${(hoverRating || rating) >= star ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#1E232B]'}`}
                          size={28}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#4FD1C5] transition-all resize-none h-12 focus:h-40"
                  placeholder="Add a thought (optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                {!comic.readStates?.length && (
                  <button
                    onClick={() => onToggleReadState(comic, 'read')}
                    className="w-full bg-[#1E232B] hover:bg-[#2A303C] text-white text-sm font-medium py-3 rounded-lg border border-[#2A303C] transition-all"
                  >
                    Add this to my Continuity
                  </button>
                )}
             </div>
          </div>
        </div>

        {/* Meta Column - Right */}
        <div className="md:w-1/5 space-y-6">
          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Continuity</p>
            <p className="text-white font-bold text-lg">
              {continuityCount > 0 ? `In ${continuityCount.toLocaleString()} Continuities` : 'Not yet added'}
            </p>
          </div>

          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Rating</p>
            <p className="text-white font-bold text-2xl">{comic.rating ? comic.rating.toFixed(1) : ''}</p>
            {!comic.rating && <p className="text-[#7C828D] text-sm">Not yet rated</p>}
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

// --- Main App ---

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState<Comic[]>(INITIAL_COMICS);
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Comic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<Comic[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [longBoxFilter, setLongBoxFilter] = useState<ReadState | 'all'>('all');
  const [starterPicks, setStarterPicks] = useState<Comic[]>(STARTER_PICKS);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    return localStorage.getItem('continuity-welcomed') !== 'true';
  });

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoadingUserComics, setIsLoadingUserComics] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Lists state
  const [userLists, setUserLists] = useState<List[]>([]);
  const [listItemCounts, setListItemCounts] = useState<Record<string, number>>({});
  const [listComics, setListComics] = useState<Record<string, Comic[]>>({});
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [showAddToListMenu, setShowAddToListMenu] = useState<string | null>(null); // comic id

  // Avatar sigils - marks of readership
  const avatarSigils = [
    { id: 'sigil:book', icon: Book, label: 'Book' },
    { id: 'sigil:bookmark', icon: Bookmark, label: 'Bookmark' },
    { id: 'sigil:archive', icon: Archive, label: 'Archive' },
    { id: 'sigil:page', icon: BookOpen, label: 'Open Page' },
    { id: 'sigil:eye', icon: Eye, label: 'Eye' },
    { id: 'sigil:pen', icon: PenTool, label: 'Pen' },
  ];

  // Helper to render sigil icon
  const renderSigil = (sigilId: string | undefined, size: number) => {
    const sigil = avatarSigils.find(s => s.id === sigilId);
    if (sigil) {
      const IconComponent = sigil.icon;
      return <IconComponent size={size} className="text-[#7C828D]" />;
    }
    return <UserIcon size={size} className="text-[#7C828D]" />;
  };

  const handleDismissWelcome = () => {
    setIsFirstVisit(false);
    localStorage.setItem('continuity-welcomed', 'true');
  };

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const userProfile = await getProfile(authUser.id);
        setProfile(userProfile);
        // Load user's lists
        loadUserLists(authUser.id);
        // Load user's comics with read states
        loadUserComicsData(authUser.id);
      } else {
        setProfile(null);
        setUserLists([]);
        setListItemCounts({});
        setListComics({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user's comics with read states, ratings, etc.
  const loadUserComicsData = async (userId: string) => {
    setIsLoadingUserComics(true);
    try {
      const userComicsMap = await fetchUserComics(userId);

      // Fetch actual comic data for each user_comic
      const comicsWithStates: Comic[] = [];
      for (const [comicId, userData] of userComicsMap) {
        const comic = await fetchComicById(comicId);
        if (comic) {
          comicsWithStates.push({
            ...comic,
            readStates: userData.readStates,
            rating: userData.rating,
          });
        }
      }

      // Add to comics state, avoiding duplicates
      setComics(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newComics = comicsWithStates.filter(c => !existingIds.has(c.id));
        // Update existing comics with read states
        const updated = prev.map(c => {
          const userData = userComicsMap.get(c.id);
          if (userData) {
            return { ...c, readStates: userData.readStates, rating: userData.rating };
          }
          return c;
        });
        return [...updated, ...newComics];
      });
    } finally {
      setIsLoadingUserComics(false);
    }
  };

  // Load user's lists with item counts and preview comics
  const loadUserLists = async (userId: string) => {
    const lists = await getUserLists(userId);
    setUserLists(lists);

    // Load item counts and preview comics for each list
    const counts: Record<string, number> = {};
    const comicsMap: Record<string, Comic[]> = {};

    // Build a lookup from local comics (INITIAL_COMICS + others)
    const localComicsMap = new Map<string, Comic>();
    [...INITIAL_COMICS, ...STARTER_PICKS].forEach(c => localComicsMap.set(c.id, c));

    await Promise.all(lists.map(async (list) => {
      const items = await getListItems(list.id);
      counts[list.id] = items.length;

      // Get comics for preview (first 3), fetching from Supabase if not local
      const previewComics: Comic[] = [];
      for (const item of items.slice(0, 3)) {
        // First check local cache
        let comic = localComicsMap.get(item.comic_id);
        // If not found locally, fetch from Supabase
        if (!comic) {
          comic = await fetchComicById(item.comic_id) || undefined;
        }
        if (comic) {
          previewComics.push(comic);
        }
      }
      comicsMap[list.id] = previewComics;
    }));

    setListItemCounts(counts);
    setListComics(comicsMap);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  const handleStartEditProfile = () => {
    setEditUsername(profile?.username || '');
    setEditBio(profile?.bio || '');
    setEditAvatarUrl(profile?.avatar_url || 'sigil:book');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    const success = await updateProfile(user.id, {
      username: editUsername.trim(),
      bio: editBio.trim(),
      avatar_url: editAvatarUrl.trim() || undefined,
    });
    if (success) {
      setProfile({
        id: user.id,
        username: editUsername.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatarUrl.trim() || undefined,
      });
      setIsEditingProfile(false);
    }
    setIsSavingProfile(false);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditUsername('');
    setEditBio('');
    setEditAvatarUrl('');
  };

  // List handlers
  const handleCreateList = async (title: string, description: string, visibility: ListVisibility) => {
    if (!user) return;
    const newList = await createList(user.id, title, description || undefined, visibility);
    if (newList) {
      setUserLists(prev => [newList, ...prev]);
      setListItemCounts(prev => ({ ...prev, [newList.id]: 0 }));
      setListComics(prev => ({ ...prev, [newList.id]: [] }));
    }
  };

  const handleAddToList = async (listId: string, comic: Comic) => {
    // First, ensure the comic exists in Supabase (for comics from search)
    await upsertComic(comic);

    const item = await addComicToList(listId, comic.id);
    if (item) {
      setListItemCounts(prev => ({
        ...prev,
        [listId]: (prev[listId] || 0) + 1,
      }));
      setListComics(prev => ({
        ...prev,
        [listId]: [...(prev[listId] || []).slice(0, 2), comic].slice(0, 3),
      }));
    }
    setShowAddToListMenu(null);
  };

  const handleUpdateList = async (title: string, description: string, visibility: ListVisibility) => {
    if (!editingList) return;
    const success = await updateList(editingList.id, { title, description: description || undefined, visibility });
    if (success) {
      setUserLists(prev => prev.map(list =>
        list.id === editingList.id
          ? { ...list, title, description: description || undefined, visibility, updated_at: new Date().toISOString() }
          : list
      ));
    }
    setEditingList(null);
  };

  const handleEditList = (list: List) => {
    setEditingList(list);
    setShowCreateListModal(true);
  };

  const handleRemoveFromList = async (listId: string, comicId: string) => {
    const success = await removeComicFromList(listId, comicId);
    if (success) {
      setListItemCounts(prev => ({
        ...prev,
        [listId]: Math.max((prev[listId] || 1) - 1, 0),
      }));
      setListComics(prev => ({
        ...prev,
        [listId]: (prev[listId] || []).filter(c => c.id !== comicId),
      }));
    }
    return success;
  };

  const handleDeleteList = async (listId: string) => {
    const success = await deleteList(listId);
    if (success) {
      setUserLists(prev => prev.filter(list => list.id !== listId));
      setListItemCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[listId];
        return newCounts;
      });
      setListComics(prev => {
        const newComics = { ...prev };
        delete newComics[listId];
        return newComics;
      });
      navigate('/');
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchRecs = async () => {
      setIsLoadingRecs(true);
      const recs = await getComicRecommendations(INITIAL_COMICS.slice(0, 3));
      if (!cancelled) {
        setRecommendations(recs);
        setIsLoadingRecs(false);
      }
    };
    fetchRecs();
    return () => { cancelled = true; };
  }, []);

  const handleUpdateComic = async (updatedComic: Comic) => {
    // Save to Supabase
    await upsertComic(updatedComic);

    // Update local state
    const update = (list: Comic[]) => list.map(c => c.id === updatedComic.id ? updatedComic : c);
    setComics(update(comics));
    setSearchResults(update(searchResults));
    setRecommendations(update(recommendations));
  };

  const handleToggleReadState = async (comic: Comic, state: ReadState) => {
    // Ensure comic exists in Supabase (for comics from search)
    await upsertComic(comic);

    const currentStates = comic.readStates || [];
    const hasState = currentStates.includes(state);
    const newStates = hasState
      ? currentStates.filter(s => s !== state)
      : [...currentStates, state];

    // Save to Supabase
    if (user) {
      await updateUserComic(user.id, comic.id, { readStates: newStates });
    }

    const toggleState = (c: Comic): Comic => ({
      ...c,
      readStates: newStates
    });

    const updateList = (list: Comic[]) => list.map(c =>
      c.id === comic.id ? toggleState(c) : c
    );

    setComics(updateList(comics));
    setSearchResults(updateList(searchResults));
    setRecommendations(updateList(recommendations));
    setStarterPicks(updateList(starterPicks));
  };

  const handleLogComic = async (comic: Comic, reviewData: Partial<Review>) => {
    // Ensure comic exists in Supabase
    await upsertComic(comic);

    // Save rating/review to user_comics
    if (user) {
      await updateUserComic(user.id, comic.id, {
        rating: reviewData.rating,
        review: reviewData.text,
        dateRead: new Date().toISOString().split('T')[0],
      });
    }

    // Add comic to local state if not already there
    if (!comics.find(c => c.id === comic.id)) {
      setComics(prev => [...prev, comic]);
    }
  };

  const handleSaveRating = async (comic: Comic, rating: number) => {
    // Ensure comic exists in Supabase
    await upsertComic(comic);

    // Save rating to user_comics
    if (user) {
      await updateUserComic(user.id, comic.id, { rating });
    }

    // Update local state
    const updateRating = (list: Comic[]) => list.map(c =>
      c.id === comic.id ? { ...c, rating } : c
    );
    setComics(updateRating(comics));
    setSearchResults(updateRating(searchResults));
    setRecommendations(updateRating(recommendations));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchError(null);
    setIsSearching(true);

    try {
      const results = await searchComicVine(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };


  const allComicsForDetail = useMemo(() => {
    const map = new Map();
    [...comics, ...searchResults, ...recommendations, ...starterPicks].forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [comics, searchResults, recommendations, starterPicks]);

  const collectedComics = useMemo(() => {
    const comicsWithStates = allComicsForDetail.filter(c => c.readStates?.length);
    if (longBoxFilter === 'all') return comicsWithStates;
    return comicsWithStates.filter(c => c.readStates?.includes(longBoxFilter));
  }, [allComicsForDetail, longBoxFilter]);

  // Continuity = comics marked as Read, Reread, or Owned
  const continuityComics = useMemo(() => {
    return allComicsForDetail.filter(c =>
      c.readStates?.includes('read') || c.readStates?.includes('reread') || c.readStates?.includes('owned')
    );
  }, [allComicsForDetail]);

  return (
    <div className="min-h-screen bg-[#0E1116] pb-20">
      <Navbar onNavigate={(path) => navigate(path === 'home' ? '/' : `/${path}`)} activePage={window.location.hash.split('/')[1] || 'home'} userSigil={profile?.avatar_url} />
      
      <main className="max-w-6xl mx-auto px-4 pt-8">
        <Routes>
          <Route path="/welcome" element={<LandingPage onStart={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              navigate('/');
            }
          }} />} />
          <Route path="/" element={<Home comics={comics} sortBy={sortBy} setSortBy={setSortBy} recommendations={recommendations} starterPicks={starterPicks} isLoadingRecs={isLoadingRecs} onToggleReadState={handleToggleReadState} continuityCount={continuityComics.length} isFirstVisit={isFirstVisit} onDismissWelcome={handleDismissWelcome} isSignedIn={!!user} onStartContinuity={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              // Scroll to starter picks section
              document.getElementById('starter-picks')?.scrollIntoView({ behavior: 'smooth' });
            }
          }} />} />
          <Route path="/comic/:id" element={<ComicDetail comics={allComicsForDetail} onLog={handleLogComic} onToggleReadState={handleToggleReadState} onUpdateComic={handleUpdateComic} onSaveRating={handleSaveRating} userLists={userLists} onAddToList={handleAddToList} isSignedIn={!!user} onShowCreateList={() => setShowCreateListModal(true)} isCanonEditor={profile?.is_admin === true} />} />
          <Route path="/list/:id" element={<ListView comics={allComicsForDetail} currentUserId={user?.id} isSignedIn={!!user} onToggleReadState={handleToggleReadState} onStartContinuity={() => !user ? setShowAuthModal(true) : navigate('/')} onEditList={handleEditList} onRemoveFromList={handleRemoveFromList} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/long-boxes" element={
            <div className="max-w-5xl mx-auto py-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <Bookmark className="text-[#4FD1C5]" size={40} />
                  <h2 className="text-5xl font-space text-white tracking-wider">LONG BOXES</h2>
                </div>
                <p className="text-[#7C828D] text-lg font-light italic ml-14">The comics you've committed to.</p>
              </div>

              <div className="border-t border-[#1E232B] pt-6">
                {/* Subdued Filter Tabs */}
                <div className="flex gap-3 mb-4">
                  {(['all', 'read', 'owned', 'want', 'reread'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setLongBoxFilter(filter)}
                      className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded transition-all ${
                        longBoxFilter === filter
                          ? 'text-white border-b-2 border-[#4FD1C5]'
                          : 'text-[#7C828D] hover:text-[#B3B8C2]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Meta Count */}
                <p className="text-[#7C828D] text-sm mb-8">
                  {collectedComics.length === 0
                    ? 'No works yet'
                    : collectedComics.length === 1
                    ? '1 work in your Long Boxes'
                    : `${collectedComics.length} works in your Long Boxes`}
                </p>

                {collectedComics.length === 0 ? (
                  /* Zero State */
                  <div className="py-16 space-y-4">
                    <p className="text-white text-xl">Your Long Boxes are empty.</p>
                    <p className="text-[#7C828D]">A collection forms over time.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Early State Copy */}
                    {collectedComics.length <= 3 && (
                      <p className="text-[#7C828D] text-sm italic">Every collection starts somewhere.</p>
                    )}
                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                      {collectedComics.map(comic => (
                        <ComicCard
                          key={comic.id}
                          comic={comic}
                          onClick={() => navigate(`/comic/${comic.id}`)}
                          onToggleReadState={handleToggleReadState}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Footer />
            </div>
          } />
          <Route path="/search" element={
            <div className="max-w-3xl mx-auto py-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-5xl font-space text-white mb-2 tracking-wider uppercase">Library</h2>
                <p className="text-[#7C828D] text-lg font-light italic">Search the archive of recorded comics.</p>
              </div>

              <form onSubmit={handleSearch} className="mb-8 relative">
                <input
                  type="text"
                  placeholder="Search the Library…"
                  className="w-full bg-[#161A21] border-2 border-[#1E232B] focus:border-[#4FD1C5] rounded-2xl py-6 pl-16 pr-8 text-white text-xl focus:outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7C828D]" size={28} />
              </form>

              <div className="border-t border-[#1E232B] pt-8">
                {isSearching ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-[#4FD1C5]" size={32} />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {searchResults.map(comic => (
                      <ComicCard
                        key={comic.id}
                        comic={comic}
                        onClick={() => navigate(`/comic/${comic.id}`)}
                        onToggleReadState={handleToggleReadState}
                      />
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  /* No Results */
                  <div className="py-16 space-y-4">
                    <p className="text-white text-xl">No matching works found.</p>
                    <p className="text-[#7C828D]">Try a different title or creator.</p>
                  </div>
                ) : (
                  /* Pre-search orientation */
                  <div className="py-16">
                    <p className="text-[#7C828D]">Search by title, creator, or series.</p>
                  </div>
                )}
              </div>
              <Footer />
            </div>
          } />
          <Route path="/continuity" element={
            <div className="max-w-3xl mx-auto py-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <BookOpen className="text-[#4FD1C5]" size={40} />
                  <h2 className="text-5xl font-space text-white tracking-wider">CONTINUITY</h2>
                </div>
                <p className="text-[#7C828D] text-lg font-light italic ml-14">Your personal reading canon.</p>
              </div>

              <div className="border-t border-[#1E232B] pt-8">
                {isLoadingUserComics ? (
                  /* Loading State */
                  <div className="py-16 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#4FD1C5]" size={32} />
                  </div>
                ) : continuityComics.length === 0 ? (
                  /* Zero State */
                  <div className="py-16 space-y-4">
                    <p className="text-white text-xl">Your Continuity hasn't begun yet.</p>
                    <p className="text-[#7C828D]">A personal canon forms over time.</p>
                  </div>
                ) : (
                  /* Timeline Stream */
                  <div className="space-y-6">
                    {continuityComics.length <= 3 && (
                      <p className="text-[#7C828D] text-sm italic mb-8">This is the beginning of your reading history.</p>
                    )}
                    {continuityComics.map(comic => (
                      <div
                        key={comic.id}
                        onClick={() => navigate(`/comic/${comic.id}`)}
                        className="flex gap-4 p-4 rounded-lg hover:bg-[#161A21] transition-colors cursor-pointer group"
                      >
                        <img
                          src={comic.coverUrl}
                          alt={comic.title}
                          className="w-16 h-24 object-cover rounded shadow-lg"
                        />
                        <div className="flex flex-col justify-center">
                          <h3 className="text-white font-bold text-lg group-hover:text-[#4FD1C5] transition-colors">{comic.title}</h3>
                          <p className="text-[#7C828D] text-sm">
                            {comic.readStates?.includes('reread') ? 'Reread' :
                             comic.readStates?.includes('read') ? 'Read' :
                             comic.readStates?.includes('owned') ? 'Owned' : ''} · {comic.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Footer />
            </div>
          } />
          <Route path="/identity" element={
            <div className="max-w-3xl mx-auto py-12 space-y-12">
              {user ? (
                <>
                  {/* Reader Header - Logged In */}
                  <header className="flex items-start gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full border-2 border-[#1E232B] bg-[#161A21] flex items-center justify-center">
                        {isEditingProfile
                          ? renderSigil(editAvatarUrl || 'sigil:book', 40)
                          : renderSigil(profile?.avatar_url || 'sigil:book', 40)
                        }
                      </div>
                      {isEditingProfile && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase text-center">Choose a symbol</p>
                          <div className="flex gap-2">
                            {avatarSigils.map((sigil) => {
                              const IconComponent = sigil.icon;
                              return (
                                <button
                                  key={sigil.id}
                                  onClick={() => setEditAvatarUrl(sigil.id)}
                                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                    editAvatarUrl === sigil.id
                                      ? 'border-[#4FD1C5] bg-[#4FD1C5]/10'
                                      : 'border-[#1E232B] bg-[#0E1116] hover:border-[#7C828D]'
                                  }`}
                                  title={sigil.label}
                                >
                                  <IconComponent
                                    size={18}
                                    className={editAvatarUrl === sigil.id ? 'text-[#4FD1C5]' : 'text-[#7C828D]'}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {isEditingProfile ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-2 text-white text-2xl font-space focus:outline-none focus:border-[#4FD1C5]"
                          />
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="A note about your reading."
                            rows={2}
                            className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-2 text-[#B3B8C2] text-sm focus:outline-none focus:border-[#4FD1C5] resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveProfile}
                              disabled={isSavingProfile}
                              className="bg-[#4FD1C5] text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#38B2AC] transition-colors disabled:opacity-50"
                            >
                              {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditProfile}
                              className="bg-[#1E232B] text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#2A303C] transition-colors"
                            >
                              <X size={14} />
                              Discard
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-4xl font-space text-white tracking-wider mb-2">{profile?.username || 'Reader'}</h2>
                          <p className="text-[#7C828D] text-sm font-light italic">
                            {profile?.bio || "This is your reader record — shaped by what you've read, kept, and revisited."}
                          </p>
                        </>
                      )}
                    </div>
                    {!isEditingProfile && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleStartEditProfile}
                          className="text-[#7C828D] hover:text-[#4FD1C5] text-sm transition-colors flex items-center gap-1"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="text-[#7C828D] hover:text-white text-sm transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </header>

                  <div className="border-t border-[#1E232B] pt-12 space-y-12">
                    {/* Reader Profile */}
                    <section>
                      <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase mb-6">Reader Profile</h3>
                      <div className="space-y-3">
                        <p className="text-[#B3B8C2] italic">Reads widely across genres and eras.</p>
                        <p className="text-[#B3B8C2] italic">Drawn to creator-driven work.</p>
                      </div>
                    </section>

                    {/* Defining Works */}
                    {continuityComics.filter(c => c.readStates?.includes('reread') || c.readStates?.includes('owned')).length > 0 && (
                      <section>
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase mb-6">Defining Works</h3>
                        <div className="flex gap-4">
                          {continuityComics
                            .filter(c => c.readStates?.includes('reread') || c.readStates?.includes('owned'))
                            .slice(0, 5)
                            .map(comic => (
                              <img
                                key={comic.id}
                                src={comic.coverUrl}
                                alt={comic.title}
                                onClick={() => navigate(`/comic/${comic.id}`)}
                                className="w-20 h-28 object-cover rounded shadow-lg cursor-pointer hover:scale-105 transition-transform"
                              />
                            ))}
                        </div>
                      </section>
                    )}

                    {/* Your Lists */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">Your Lists</h3>
                        <button
                          onClick={() => setShowCreateListModal(true)}
                          className="text-[#4FD1C5] text-sm font-medium hover:underline flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Create List
                        </button>
                      </div>
                      {userLists.length === 0 ? (
                        <div className="py-8 text-center">
                          <ListIcon size={32} className="text-[#4A4F57] mx-auto mb-3" />
                          <p className="text-[#7C828D]">No lists yet.</p>
                          <p className="text-[#4A4F57] text-sm mt-1">Create curated reading paths to share.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {userLists.map(list => (
                            <ListCard
                              key={list.id}
                              list={list}
                              comics={listComics[list.id] || []}
                              itemCount={listItemCounts[list.id] || 0}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                </>
              ) : (
                /* Not Logged In */
                <div className="py-16 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-[#161A21] border-2 border-[#1E232B] flex items-center justify-center mx-auto">
                    <UserIcon size={40} className="text-[#7C828D]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-space text-white">Your Identity</h2>
                    <p className="text-[#7C828D]">Sign in to build your reader record.</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-[#4FD1C5] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#38B2AC] transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
              <Footer />
            </div>
          } />

          {/* Static Pages */}
          <Route path="/privacy" element={
            <div className="max-w-[720px] mx-auto py-20">
              <h1 className="text-4xl font-space text-white mb-6">Privacy</h1>
              <div className="space-y-6 text-[#B3B8C2] text-lg leading-relaxed">
                <p>
                  Continuity respects your privacy. We collect only what is necessary to
                  provide the service: your account information, reading states, and any
                  notes you choose to add.
                </p>
                <p>
                  We do not sell your data. We do not track you across other websites.
                  Your reading history exists for you alone.
                </p>
                <p>
                  This policy may evolve as Continuity grows, but our intent remains the same:
                  to keep your personal reading canon personal.
                </p>
              </div>
              <p className="text-[#7C828D] text-sm mt-12">Last updated: 2025</p>
              <Footer />
            </div>
          } />

          <Route path="/terms" element={
            <div className="max-w-[720px] mx-auto py-20">
              <h1 className="text-4xl font-space text-white mb-6">Terms</h1>
              <div className="space-y-6 text-[#B3B8C2] text-lg leading-relaxed">
                <p>
                  Continuity is provided as-is, without warranties of any kind.
                  Features may change, evolve, or disappear as the product grows.
                </p>
                <p>
                  Any content you add remains yours. You are responsible for what you choose
                  to record or share.
                </p>
                <p>
                  By using Continuity, you agree to use it respectfully and in good faith.
                </p>
              </div>
              <p className="text-[#7C828D] text-sm mt-12">Last updated: 2025</p>
              <Footer />
            </div>
          } />

          <Route path="/about" element={
            <div className="max-w-[720px] mx-auto py-20">
              <h1 className="text-4xl font-space text-white mb-6">About Continuity</h1>
              <div className="space-y-6 text-[#B3B8C2] text-lg leading-relaxed">
                <p>
                  Reading comics is easy. Remembering them isn't.
                </p>
                <p>
                  Continuity exists to help readers track, reflect on, and preserve
                  their personal reading history—without noise, pressure, or performance.
                </p>
                <p>
                  It's not a feed. It's not a leaderboard.
                  It's a personal canon.
                </p>
              </div>
              <Footer />
            </div>
          } />
        </Routes>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />

      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => {
          setShowCreateListModal(false);
          setEditingList(null);
        }}
        onSave={editingList ? handleUpdateList : handleCreateList}
        onDelete={handleDeleteList}
        editList={editingList}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
