/**
 * RecommendationCard Component
 * Displays a comic recommendation from The Archivist with action buttons
 */

import React, { useState } from 'react';
import { Heart, BookOpen, Bookmark, Loader2, Check, AlertCircle } from 'lucide-react';
import { ArchivistRecommendation, RecommendationActionState } from '../types/librarian';
import { Comic, ReadState } from '../types';
import { enrichRecommendation } from '../services/comicEnrichment';

interface RecommendationCardProps {
  recommendation: ArchivistRecommendation;
  onAddToCollection: (comic: Comic, state: ReadState) => Promise<void>;
  existingComics?: Comic[];
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAddToCollection,
  existingComics = []
}) => {
  const [actionStates, setActionStates] = useState<Record<ReadState, RecommendationActionState>>({
    want: 'idle',
    read: 'idle',
    owned: 'idle',
    reread: 'idle'
  });
  const [enrichedComic, setEnrichedComic] = useState<Comic | null>(null);
  const [enrichmentSource, setEnrichmentSource] = useState<'comicvine' | 'ai' | null>(null);

  // Check if this comic already exists in user's collection
  const existingComic = existingComics.find(c =>
    c.title.toLowerCase().includes(recommendation.title.toLowerCase()) ||
    recommendation.title.toLowerCase().includes(c.title.toLowerCase())
  );

  const handleAddAction = async (state: ReadState) => {
    // Don't do anything if already processing
    if (actionStates[state] === 'loading') return;

    setActionStates(prev => ({ ...prev, [state]: 'loading' }));

    try {
      let comic: Comic;

      // Use existing comic if found, otherwise enrich
      if (existingComic) {
        comic = existingComic;
      } else if (enrichedComic) {
        comic = enrichedComic;
      } else {
        // Enrich the recommendation
        const result = await enrichRecommendation(recommendation);
        comic = result.comic;
        setEnrichedComic(comic);
        setEnrichmentSource(result.source);
      }

      // Add to collection
      await onAddToCollection(comic, state);

      setActionStates(prev => ({ ...prev, [state]: 'success' }));

      // Reset to idle after showing success
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [state]: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Failed to add comic:', error);
      setActionStates(prev => ({ ...prev, [state]: 'error' }));

      // Reset to idle after showing error
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [state]: 'idle' }));
      }, 3000);
    }
  };

  const renderButton = (state: ReadState, label: string, Icon: React.ElementType, color: string) => {
    const actionState = actionStates[state];
    const isAlreadyAdded = existingComic?.readStates?.includes(state);

    if (isAlreadyAdded) {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/[0.28] cursor-not-allowed"
        >
          <Check size={14} />
          Added
        </button>
      );
    }

    if (actionState === 'loading') {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/[0.45]"
        >
          <Loader2 size={14} className="animate-spin" />
          Adding...
        </button>
      );
    }

    if (actionState === 'success') {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400"
        >
          <Check size={14} />
          Added!
        </button>
      );
    }

    if (actionState === 'error') {
      return (
        <button
          onClick={() => handleAddAction(state)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
        >
          <AlertCircle size={14} />
          Retry
        </button>
      );
    }

    return (
      <button
        onClick={() => handleAddAction(state)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${color}`}
      >
        <Icon size={14} />
        {label}
      </button>
    );
  };

  return (
    <div className="bg-[#121A24] border border-white/[0.08] rounded-lg p-4 mt-3">
      {/* Comic Info */}
      <div className="mb-3">
        <h4 className="text-white/[0.92] font-medium text-sm">{recommendation.title}</h4>
        {(recommendation.writer || recommendation.artist) && (
          <p className="text-white/70 text-xs mt-0.5">
            {recommendation.writer && `by ${recommendation.writer}`}
            {recommendation.writer && recommendation.artist && ' / '}
            {recommendation.artist && `art by ${recommendation.artist}`}
          </p>
        )}
        {recommendation.publisher && recommendation.year && (
          <p className="text-white/[0.45] text-xs mt-0.5">
            {recommendation.publisher} ({recommendation.year})
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {renderButton(
          'want',
          'Want to Read',
          Heart,
          'bg-[rgba(103,216,198,0.16)] text-[#67D8C6] hover:bg-[rgba(103,216,198,0.24)]'
        )}
        {renderButton(
          'read',
          'Mark Read',
          BookOpen,
          'bg-[rgba(103,216,198,0.16)] text-[#67D8C6] hover:bg-[rgba(103,216,198,0.24)]'
        )}
        {renderButton(
          'owned',
          'Owned',
          Bookmark,
          'bg-white/[0.06] text-white/70 hover:bg-white/[0.09]'
        )}
      </div>

      {/* Enrichment Source Indicator */}
      {enrichmentSource && (
        <p className="text-white/[0.45] text-[10px] mt-2">
          {enrichmentSource === 'comicvine'
            ? 'Full details from ComicVine'
            : 'Basic info (not found in ComicVine)'}
        </p>
      )}
    </div>
  );
};

export default RecommendationCard;
