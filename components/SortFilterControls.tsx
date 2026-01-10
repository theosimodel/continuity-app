import React from 'react';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'title' | 'year' | 'publisher';

interface SortFilterControlsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  publisherFilter: string | null;
  onPublisherFilterChange: (publisher: string | null) => void;
  availablePublishers: string[];
  showPublisherFilter?: boolean;
}

const SortFilterControls: React.FC<SortFilterControlsProps> = ({
  sortBy,
  onSortChange,
  publisherFilter,
  onPublisherFilterChange,
  availablePublishers,
  showPublisherFilter = true,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/50 uppercase tracking-wider">Sort</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-[#1E232B] text-white text-sm pl-3 pr-8 py-1.5 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#4FD1C5] cursor-pointer"
          >
            <option value="title">Title A-Z</option>
            <option value="year">Year (Newest)</option>
            <option value="publisher">Publisher</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Publisher Filter */}
      {showPublisherFilter && availablePublishers.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/50 uppercase tracking-wider">Publisher</span>
          <div className="relative">
            <select
              value={publisherFilter || ''}
              onChange={(e) => onPublisherFilterChange(e.target.value || null)}
              className="appearance-none bg-[#1E232B] text-white text-sm pl-3 pr-8 py-1.5 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:border-[#4FD1C5] cursor-pointer"
            >
              <option value="">All Publishers</option>
              {availablePublishers.map((publisher) => (
                <option key={publisher} value={publisher}>
                  {publisher}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={14} />
          </div>
        </div>
      )}

      {/* Active Filter Indicator */}
      {publisherFilter && (
        <button
          onClick={() => onPublisherFilterChange(null)}
          className="text-xs bg-[#4FD1C5]/20 text-[#4FD1C5] px-2 py-1 rounded-full hover:bg-[#4FD1C5]/30 transition-colors"
        >
          {publisherFilter} ✕
        </button>
      )}
    </div>
  );
};

// Helper functions for sorting and filtering
export const sortComics = <T extends { title: string; year?: number; publisher?: string }>(
  comics: T[],
  sortBy: SortOption
): T[] => {
  return [...comics].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'year':
        return (b.year || 0) - (a.year || 0); // Newest first
      case 'publisher':
        return (a.publisher || 'ZZZ').localeCompare(b.publisher || 'ZZZ');
      default:
        return 0;
    }
  });
};

export const filterByPublisher = <T extends { publisher?: string }>(
  comics: T[],
  publisher: string | null
): T[] => {
  if (!publisher) return comics;
  return comics.filter((c) =>
    c.publisher?.toLowerCase().includes(publisher.toLowerCase())
  );
};

export const getUniquePublishers = <T extends { publisher?: string }>(comics: T[]): string[] => {
  const publishers = comics
    .map((c) => c.publisher)
    .filter((p): p is string => Boolean(p) && p.trim() !== '')
    .filter((p, i, arr) => arr.indexOf(p) === i);
  return publishers.sort();
};

export default SortFilterControls;
