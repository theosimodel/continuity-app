import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Link, Globe, List as ListIcon } from 'lucide-react';
import { List, Comic } from '../types';

interface ListCardProps {
  list: List;
  comics: Comic[];
  itemCount: number;
}

const ListCard: React.FC<ListCardProps> = ({ list, comics, itemCount }) => {
  const navigate = useNavigate();

  const visibilityIcon = {
    private: <Lock size={12} />,
    unlisted: <Link size={12} />,
    public: <Globe size={12} />,
  };

  // Get first 3 covers for preview
  const previewCovers = comics.slice(0, 3);

  return (
    <div
      onClick={() => navigate(`/list/${list.id}`)}
      className="bg-[#161A21] rounded-xl border border-[#1E232B] p-4 hover:border-[#2A303C] transition-all cursor-pointer group"
    >
      {/* Cover Preview Stack */}
      <div className="relative h-24 mb-4">
        {previewCovers.length > 0 ? (
          <div className="flex -space-x-8">
            {previewCovers.map((comic, i) => (
              <div
                key={comic.id}
                className="w-16 h-24 rounded-lg overflow-hidden border-2 border-[#161A21] shadow-lg transition-transform group-hover:translate-y-[-2px]"
                style={{ zIndex: 3 - i }}
              >
                <img
                  src={comic.coverUrl}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-16 h-24 rounded-lg bg-[#1E232B] flex items-center justify-center">
            <ListIcon size={24} className="text-[#4A4F57]" />
          </div>
        )}
      </div>

      {/* List Info */}
      <div className="space-y-1">
        <h3 className="text-white font-bold truncate group-hover:text-[#4FD1C5] transition-colors">
          {list.title}
        </h3>
        <div className="flex items-center gap-2 text-[#7C828D] text-xs">
          <span>{itemCount} {itemCount === 1 ? 'comic' : 'comics'}</span>
          <span className="text-[#4A4F57]">·</span>
          <span className="flex items-center gap-1">
            {visibilityIcon[list.visibility]}
            {list.visibility}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListCard;
