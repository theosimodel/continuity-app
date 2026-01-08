/**
 * Archivist Page
 * Main page for The Archivist AI feature
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ArchivistChat } from './ArchivistChat';
import { Comic, ReadState } from '../types';

interface ArchivistPageProps {
  comics: Comic[];
  onAddToCollection?: (comic: Comic, state: ReadState) => Promise<void>;
}

export const ArchivistPage: React.FC<ArchivistPageProps> = ({ comics, onAddToCollection }) => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header - centered */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-[#8B5CF6]" />
          <h1 className="text-4xl font-space text-white/[0.92] tracking-wider">THE ARCHIVIST</h1>
        </div>
        <p className="text-white/70">
          Get personalized comic recommendations from The Archivist
        </p>
      </div>

      {/* Chat - full width, taller */}
      <div className="bg-[#0F141C] rounded-xl border border-white/[0.08] h-[calc(100vh-280px)] min-h-[500px] overflow-hidden">
        <ArchivistChat comics={comics} onAddToCollection={onAddToCollection} />
      </div>
    </div>
  );
};

export default ArchivistPage;
