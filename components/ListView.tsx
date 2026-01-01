import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check, Lock, Link, Globe, BookOpen, Bookmark, Pencil, X, User as UserIcon, Book, Archive, Eye, PenTool } from 'lucide-react';
import { List, ListItem, Comic, ReadState } from '../types';
import { getListById, getListItems, getProfile, Profile, fetchComicById } from '../services/supabaseService';
import Footer from './Footer';
import ShareModal from './ShareModal';

interface ListViewProps {
  comics: Comic[];
  currentUserId?: string;
  isSignedIn: boolean;
  onToggleReadState: (comic: Comic, state: ReadState) => void;
  onStartContinuity: () => void;
  onEditList?: (list: List) => void;
  onRemoveFromList?: (listId: string, comicId: string) => Promise<boolean>;
}

// Avatar sigils - marks of readership
const avatarSigils = [
  { id: 'sigil:book', icon: Book, label: 'Book' },
  { id: 'sigil:bookmark', icon: Bookmark, label: 'Bookmark' },
  { id: 'sigil:archive', icon: Archive, label: 'Archive' },
  { id: 'sigil:page', icon: BookOpen, label: 'Open Page' },
  { id: 'sigil:eye', icon: Eye, label: 'Eye' },
  { id: 'sigil:pen', icon: PenTool, label: 'Pen' },
];

const renderSigil = (sigilId: string | undefined, size: number) => {
  const sigil = avatarSigils.find(s => s.id === sigilId);
  if (sigil) {
    const IconComponent = sigil.icon;
    return <IconComponent size={size} className="text-[#7C828D]" />;
  }
  return <UserIcon size={size} className="text-[#7C828D]" />;
};

const ListView: React.FC<ListViewProps> = ({
  comics,
  currentUserId,
  isSignedIn,
  onToggleReadState,
  onStartContinuity,
  onEditList,
  onRemoveFromList,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [resolvedComics, setResolvedComics] = useState<Comic[]>([]);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      if (!id) return;
      setIsLoading(true);

      const [listData, itemsData] = await Promise.all([
        getListById(id),
        getListItems(id),
      ]);

      setList(listData);
      setListItems(itemsData);

      // Resolve comics - check local first, then fetch from Supabase
      const resolvedComicsList: Comic[] = [];
      for (const item of itemsData) {
        let comic = comics.find(c => c.id === item.comic_id);
        if (!comic) {
          comic = await fetchComicById(item.comic_id) || undefined;
        }
        if (comic) {
          resolvedComicsList.push(comic);
        }
      }
      setResolvedComics(resolvedComicsList);

      // Fetch author profile
      if (listData?.user_id) {
        const authorProfile = await getProfile(listData.user_id);
        setAuthor(authorProfile);
      }

      setIsLoading(false);
    };

    loadList();
  }, [id, comics]);

  // Use resolved comics for display
  const listComics = resolvedComics;

  const isOwner = currentUserId && list?.user_id === currentUserId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4FD1C5]" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <h2 className="text-2xl text-white font-bold">List not found</h2>
        <button onClick={() => navigate('/')} className="text-[#4FD1C5] underline">
          Back to home
        </button>
      </div>
    );
  }

  const visibilityIcon = {
    private: <Lock size={14} />,
    unlisted: <Link size={14} />,
    public: <Globe size={14} />,
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#7C828D] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      {/* List Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-space text-white tracking-wide mb-2">
              {list.title}
            </h1>
            <p className="text-[#7C828D] text-sm italic">A curated reading path</p>

            {/* Author Block */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-[#161A21] border border-[#1E232B] flex items-center justify-center">
                {renderSigil(author?.avatar_url, 18)}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{author?.username || 'A reader'}</p>
                <p className="text-[#7C828D] text-xs">Creator</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <span className="flex items-center gap-1 text-[#7C828D] text-xs">
                  {visibilityIcon[list.visibility]}
                  {list.visibility}
                </span>
                <button
                  onClick={() => onEditList?.(list)}
                  className="flex items-center gap-2 px-3 py-2 text-[#7C828D] hover:text-white text-sm transition-colors"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </>
            )}
            {(list.visibility !== 'private' || isOwner) && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E232B] hover:bg-[#2A303C] rounded-lg text-white text-sm transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
            )}
          </div>
        </div>

        {list.description && (
          <p className="text-[#B3B8C2] mt-4 leading-relaxed max-w-xl">
            {list.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#1E232B] mb-8" />

      {/* Comic List */}
      {listComics.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#7C828D]">This list is empty.</p>
          {isOwner && (
            <p className="text-[#4A4F57] text-sm mt-2">
              Add comics from their detail pages.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {listComics.map((comic, index) => (
            <div
              key={comic.id}
              className="flex gap-4 p-4 bg-[#161A21] rounded-xl border border-[#1E232B] hover:border-[#2A303C] transition-colors group"
            >
              {/* Cover */}
              <div
                onClick={() => navigate(`/comic/${comic.id}`)}
                className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <img
                  src={comic.coverUrl}
                  alt={comic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => navigate(`/comic/${comic.id}`)}
                      className="text-white font-bold cursor-pointer hover:text-[#4FD1C5] transition-colors"
                    >
                      {comic.title}
                    </h3>
                    <p className="text-[#7C828D] text-sm">
                      {comic.year} · {comic.publisher}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#4A4F57] text-xs font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isOwner && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Delete clicked for comic:', comic.id, 'from list:', list?.id);
                          console.log('onRemoveFromList exists:', !!onRemoveFromList);
                          if (list && onRemoveFromList) {
                            const success = await onRemoveFromList(list.id, comic.id);
                            console.log('Remove result:', success);
                            if (success) {
                              console.log('Updating local state...');
                              setListItems(prev => prev.filter(item => item.comic_id !== comic.id));
                              setResolvedComics(prev => prev.filter(c => c.id !== comic.id));
                            }
                          }
                        }}
                        className="p-1 text-[#7C828D] hover:text-red-400 transition-all"
                        title="Remove from list"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onToggleReadState(comic, 'read')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      comic.readStates?.includes('read')
                        ? 'bg-[#4FD1C5] text-black'
                        : 'bg-[#1E232B] text-[#7C828D] hover:text-white'
                    }`}
                  >
                    <BookOpen size={14} />
                    {comic.readStates?.includes('read') ? 'Read' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => onToggleReadState(comic, 'owned')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      comic.readStates?.includes('owned')
                        ? 'bg-[#9CA3AF] text-black'
                        : 'bg-[#1E232B] text-[#7C828D] hover:text-white'
                    }`}
                  >
                    <Bookmark size={14} />
                    {comic.readStates?.includes('owned') ? 'Owned' : 'Add to Long Box'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Footer for visitors */}
      {!isSignedIn && (
        <div className="mt-12 py-12 border-t border-[#1E232B]">
          <div className="text-center space-y-6">
            <p className="text-[#7C828D] text-sm font-medium">
              Created with Continuity
            </p>
            <div className="space-y-3">
              <button
                onClick={onStartContinuity}
                className="bg-[#4FD1C5] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#3DBCB0] transition-colors"
              >
                Start your own Continuity
              </button>
              <p className="text-[#7C828D] text-sm">
                Track what you read. Build your personal canon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        list={list}
        listAuthorName={author?.username}
        listCoverUrls={listComics.slice(0, 3).map(c => c.coverUrl)}
      />
    </div>
  );
};

export default ListView;
