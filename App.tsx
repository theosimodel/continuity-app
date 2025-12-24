
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ComicCard from './components/ComicCard';
import { INITIAL_COMICS } from './constants';
import { Comic, JournalEntry, UserProfile, Review, ReadState } from './types';
import { getComicRecommendations, searchComicsWithGrounding } from './services/geminiService';
import {
  Search, TrendingUp, Calendar, LayoutGrid, Heart, BookOpen, Clock,
  Loader2, Sparkles, Star, Share2, ExternalLink, Globe, X,
  Key, AlertCircle, ChevronDown, User as UserIcon, ArrowLeft, Info, Book, HelpCircle, ExternalLink as ExtIcon,
  CreditCard, ShieldAlert, Bookmark
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Components ---

const Home: React.FC<{
  comics: Comic[],
  sortBy: string,
  setSortBy: (s: any) => void,
  recommendations: Comic[],
  isLoadingRecs: boolean,
  onToggleReadState: (c: Comic, state: ReadState) => void
}> = ({ comics, sortBy, setSortBy, recommendations, isLoadingRecs, onToggleReadState }) => {
  const navigate = useNavigate();
  
  const sortedComics = useMemo(() => {
    return [...comics].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [comics, sortBy]);

  return (
    <div className="space-y-12">
      <section className="relative h-[400px] rounded-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1588497859490-85d1c17db96d?auto=format&fit=crop&q=80&w=1200"
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
              onClick={() => navigate('/search')}
              className="bg-white text-black font-bold px-8 py-3 rounded hover:bg-[#4FD1C5] transition-colors"
            >
              BEGIN YOUR CONTINUITY
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

      <section className="bg-[#161A21] p-8 rounded-xl border border-[#1E232B]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#4FD1C5] p-2 rounded-lg">
            <Sparkles className="text-black" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">Picks</h3>
            <p className="text-xs text-[#7C828D]">From your Continuity</p>
          </div>
        </div>
        {isLoadingRecs ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="animate-spin text-[#4FD1C5]" size={40} />
            <p className="text-[#7C828D] text-sm animate-pulse">Preparing your Picks…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-6">
            {recommendations.map(comic => (
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
  onUpdateComic: (comic: Comic) => void
}> = ({ comics, onLog, onToggleReadState, onUpdateComic }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const comic = comics.find(c => c.id === id);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Reset form state when navigating to a different comic
  useEffect(() => {
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  }, [id]);

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
          <div className="rounded-lg overflow-hidden border border-[#1E232B] shadow-2xl bg-[#161A21]">
             <img src={comic.coverUrl} alt={comic.title} className="w-full aspect-[2/3] object-cover" />
          </div>

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
            <button className="w-full bg-[#161A21] border border-[#1E232B] hover:bg-[#1E232B] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold">
              <Share2 size={16} />
              Share
            </button>
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
            <h1 className="text-6xl font-space text-white tracking-wide leading-none">{comic.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-8 border-y border-[#1E232B] py-6">
            <div className="space-y-1">
              <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Writer</p>
              <p className="text-white font-bold text-lg">{comic.writer}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">Artist</p>
              <p className="text-white font-bold text-lg">{comic.artist}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] uppercase">Story Brief</h3>
            <p className="text-[#B3B8C2] text-lg leading-relaxed italic font-light">{comic.description}</p>
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
                        onClick={() => setRating(star)}
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
            <p className="text-white font-bold text-2xl">12,483</p>
            <p className="text-[#7C828D] text-xs">in Continuity</p>
          </div>

          <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
            <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Rating</p>
            <p className="text-white font-bold text-2xl">{comic.rating?.toFixed(1) || '—'}</p>
          </div>

          {comic.readStates?.length ? (
            <div className="bg-[#161A21] p-4 rounded-xl border border-[#1E232B]">
              <p className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase mb-2">Your Status</p>
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

// --- Main App ---

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [comics, setComics] = useState<Comic[]>(INITIAL_COMICS);
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Comic[]>([]);
  const [searchSources, setSearchSources] = useState<{ uri: string; title: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Comic[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [longBoxFilter, setLongBoxFilter] = useState<ReadState | 'all'>('all');


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

  const handleUpdateComic = (updatedComic: Comic) => {
    const update = (list: Comic[]) => list.map(c => c.id === updatedComic.id ? updatedComic : c);
    setComics(update(comics));
    setSearchResults(update(searchResults));
    setRecommendations(update(recommendations));
    setJournal(prev => prev.map(entry => 
      entry.comic.id === updatedComic.id ? { ...entry, comic: updatedComic } : entry
    ));
  };

  const handleToggleReadState = (comic: Comic, state: ReadState) => {
    const toggleState = (c: Comic): Comic => {
      const currentStates = c.readStates || [];
      const hasState = currentStates.includes(state);
      return {
        ...c,
        readStates: hasState
          ? currentStates.filter(s => s !== state)
          : [...currentStates, state]
      };
    };

    const updateList = (list: Comic[]) => list.map(c =>
      c.id === comic.id ? toggleState(c) : c
    );

    setComics(updateList(comics));
    setSearchResults(updateList(searchResults));
    setRecommendations(updateList(recommendations));
    setJournal(prev => prev.map(entry =>
      entry.comic.id === comic.id ? { ...entry, comic: toggleState(entry.comic) } : entry
    ));
  };

  const handleLogComic = (comic: Comic, reviewData: Partial<Review>) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      comicId: comic.id,
      userId: 'user-1',
      rating: reviewData.rating || 0,
      text: reviewData.text || '',
      dateRead: new Date().toISOString().split('T')[0],
      likes: 0,
      containsSpoilers: false,
      comic: comic
    };
    setJournal([newEntry, ...journal]);
    if (!comics.find(c => c.id === comic.id)) {
      setComics(prev => [...prev, comic]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchError(null);
    setIsSearching(true);

    try {
      const { comics: results, sources } = await searchComicsWithGrounding(searchQuery);
      setSearchResults(results);
      setSearchSources(sources);
    } catch (err: any) {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };


  const allComicsForDetail = useMemo(() => {
    const map = new Map();
    [...comics, ...searchResults, ...recommendations].forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [comics, searchResults, recommendations]);

  const collectedComics = useMemo(() => {
    const comicsWithStates = allComicsForDetail.filter(c => c.readStates?.length);
    if (longBoxFilter === 'all') return comicsWithStates;
    return comicsWithStates.filter(c => c.readStates?.includes(longBoxFilter));
  }, [allComicsForDetail, longBoxFilter]);

  return (
    <div className="min-h-screen bg-[#0E1116] pb-20">
      <Navbar onNavigate={(path) => navigate(path === 'home' ? '/' : `/${path}`)} activePage={window.location.hash.split('/')[1] || 'home'} />
      
      <main className="max-w-6xl mx-auto px-4 pt-8">
        <Routes>
          <Route path="/" element={<Home comics={comics} sortBy={sortBy} setSortBy={setSortBy} recommendations={recommendations} isLoadingRecs={isLoadingRecs} onToggleReadState={handleToggleReadState} />} />
          <Route path="/comic/:id" element={<ComicDetail comics={allComicsForDetail} onLog={handleLogComic} onToggleReadState={handleToggleReadState} onUpdateComic={handleUpdateComic} />} />
          <Route path="/long-boxes" element={
            <div className="max-w-6xl mx-auto py-8">
              <div className="flex items-center gap-4 mb-8">
                 <Bookmark className="text-[#4FD1C5]" size={40} />
                 <h2 className="text-5xl font-space text-white tracking-wider">LONG BOXES</h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-8 border-b border-[#1E232B] pb-4">
                {(['all', 'read', 'owned', 'want', 'reread'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setLongBoxFilter(filter)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                      longBoxFilter === filter
                        ? filter === 'all' ? 'bg-white text-black' :
                          filter === 'read' ? 'bg-[#4FD1C5] text-black' :
                          filter === 'owned' ? 'bg-[#9CA3AF] text-black' :
                          filter === 'want' ? 'bg-[#FBBF24] text-black' :
                          'bg-[#A78BFA] text-black'
                        : 'bg-[#1E232B] text-[#B3B8C2] hover:bg-[#2A303C] hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {collectedComics.length === 0 ? (
                <div className="bg-[#161A21] p-24 rounded-3xl border border-[#1E232B] text-center space-y-6">
                  <Bookmark className="mx-auto text-[#1E232B]" size={80} />
                  <h3 className="text-2xl text-white font-bold">Your Long Boxes are empty.</h3>
                  <p className="text-[#B3B8C2] text-lg font-light">Add issues you own or want to collect.</p>
                  <button onClick={() => navigate('/search')} className="bg-[#4FD1C5] text-black font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#38B2AC] transition-all">BROWSE ISSUES</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
                  {collectedComics.map(comic => (
                    <ComicCard
                      key={comic.id}
                      comic={comic}
                      onClick={() => navigate(`/comic/${comic.id}`)}
                      onToggleReadState={handleToggleReadState}
                    />
                  ))}
                </div>
              )}
            </div>
          } />
          <Route path="/search" element={
            <div className="max-w-4xl mx-auto py-8">
              <h2 className="text-5xl font-space text-white mb-8 tracking-wider uppercase">Library</h2>
              <form onSubmit={handleSearch} className="mb-12 relative">
                <input 
                  type="text"
                  placeholder="Search the Library..."
                  className="w-full bg-[#161A21] border-2 border-[#1E232B] focus:border-[#4FD1C5] rounded-2xl py-6 pl-16 pr-8 text-white text-2xl focus:outline-none transition-all shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#B3B8C2]" size={32} />
              </form>

              {searchError === "API_KEY_REQUIRED" && (
                <div className="mb-8">
                  <div className="bg-blue-900/20 border border-blue-500/30 p-8 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Key className="text-blue-400" size={40} />
                      <div>
                        <p className="text-lg font-bold text-white mb-1 tracking-tight">Access Restricted</p>
                        <p className="text-sm text-[#B3B8C2]">Grounded search requires a Gemini Pro API Key.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.aistudio?.openSelectKey()} 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all"
                    >
                      SELECT KEY
                    </button>
                  </div>
                </div>
              )}

              {isSearching ? (
                <div className="flex flex-col items-center py-24 gap-6">
                  <Loader2 className="animate-spin text-[#4FD1C5]" size={56} />
                  <p className="text-[#7C828D] font-bold tracking-[0.3em] animate-pulse uppercase">Searching...</p>
                </div>
              ) : (
                <div className="space-y-16">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {searchResults.map(comic => (
                      <ComicCard
                        key={comic.id}
                        comic={comic}
                        onClick={() => navigate(`/comic/${comic.id}`)}
                        onToggleReadState={handleToggleReadState}
                      />
                    ))}
                  </div>
                  {searchSources.length > 0 && (
                    <div className="bg-[#161A21] p-8 rounded-2xl border border-[#1E232B]">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#7C828D] mb-6 flex items-center gap-2 uppercase">
                        <Globe size={14} /> Source Verification
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {searchSources.map((source, idx) => (
                          <a key={idx} href={source.uri} target="_blank" className="text-[10px] bg-[#1E232B] text-[#B3B8C2] px-4 py-2 rounded-full hover:text-white flex items-center gap-2 border border-transparent hover:border-[#4FD1C5] transition-all">
                            {source.title.substring(0, 30)}... <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          } />
          <Route path="/continuity" element={
            <div className="max-w-4xl mx-auto py-8">
              <h2 className="text-5xl font-space text-white mb-12 tracking-wider">CONTINUITY</h2>
              {journal.length === 0 ? (
                <div className="bg-[#161A21] p-24 rounded-3xl border border-[#1E232B] text-center space-y-6">
                  <BookOpen className="mx-auto text-[#1E232B]" size={80} />
                  <h3 className="text-2xl text-white font-bold">Your Continuity hasn't begun yet.</h3>
                  <p className="text-[#B3B8C2] text-lg font-light">Add issues you've read to start building your personal canon.</p>
                  <button onClick={() => navigate('/search')} className="bg-[#4FD1C5] text-black font-bold px-10 py-4 rounded-xl text-lg transition-all">ADD YOUR FIRST ISSUE</button>
                </div>
              ) : (
                <div className="space-y-8">
                  {journal.map(entry => (
                    <div key={entry.id} className="bg-[#161A21] border border-[#1E232B] rounded-2xl p-8 flex gap-8 group">
                      <div className="w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg" onClick={() => navigate(`/comic/${entry.comic.id}`)}>
                        <img src={entry.comic.coverUrl} className="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-2xl text-white font-bold group-hover:text-[#4FD1C5] transition-colors">{entry.comic.title}</h3>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={s <= entry.rating ? 'text-[#4FD1C5] fill-[#4FD1C5]' : 'text-[#1E232B]'} />)}
                            </div>
                          </div>
                          <span className="text-[#7C828D] text-xs font-bold tracking-widest uppercase flex items-center gap-2 bg-[#0E1116] px-3 py-1 rounded-full"><Calendar size={12}/> {entry.dateRead}</span>
                        </div>
                        <p className="text-[#B3B8C2] text-lg italic leading-relaxed font-light">"{entry.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          } />
          <Route path="/identity" element={
             <div className="max-w-5xl mx-auto py-12 space-y-12">
                <header className="flex items-center gap-12 border-b border-[#1E232B] pb-16">
                   <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#4FD1C5]/30 p-1">
                      <img src="https://picsum.photos/seed/ink/400/400" className="w-full h-full object-cover rounded-full" />
                   </div>
                   <div className="space-y-6">
                      <div>
                        <h2 className="text-6xl font-space text-white tracking-widest mb-2">InkAddict</h2>
                        <p className="text-[#B3B8C2] max-w-xl text-lg font-light leading-relaxed">This is your Identity. Your reading history, collection, and presence on Continuity.</p>
                      </div>
                      <div className="flex gap-12">
                         <div className="text-center cursor-pointer group" onClick={() => navigate('/continuity')}>
                            <p className="text-4xl font-bold text-white group-hover:text-[#4FD1C5] transition-colors">{journal.length + 248}</p>
                            <p className="text-[10px] text-[#7C828D] font-bold tracking-[0.2em] uppercase">Read</p>
                         </div>
                         <div className="text-center cursor-pointer group" onClick={() => navigate('/long-boxes')}>
                            <p className="text-4xl font-bold text-white group-hover:text-[#4FD1C5] transition-colors">{collectedComics.length}</p>
                            <p className="text-[10px] text-[#7C828D] font-bold tracking-[0.2em] uppercase">Owned</p>
                         </div>
                      </div>
                   </div>
                </header>
                <div>
                   <h3 className="text-xs font-bold tracking-[0.3em] text-[#B3B8C2] border-b border-[#1E232B] pb-2 mb-10 uppercase">Activity Pulse</h3>
                   <div className="h-80 bg-[#161A21] rounded-3xl p-8 border border-[#1E232B] shadow-2xl">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[
                            { name: 'MON', count: 2 }, { name: 'TUE', count: 5 }, { name: 'WED', count: 3 }, 
                            { name: 'THU', count: 8 }, { name: 'FRI', count: 4 }, { name: 'SAT', count: 12 }, 
                            { name: 'SUN', count: journal.length + 5 }
                         ]}>
                            <defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4FD1C5" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E232B" vertical={false} />
                            <XAxis dataKey="name" stroke="#7C828D" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#161A21', borderRadius: '12px', border: '1px solid #1E232B', color: '#fff' }} />
                            <Area type="monotone" dataKey="count" stroke="#4FD1C5" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          } />
        </Routes>
      </main>

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
