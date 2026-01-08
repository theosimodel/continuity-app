/**
 * Librarian Page
 * Main page for the Librarian feature with chat and suggestions
 */

import React, { useState } from 'react';
import { LibrarianChat } from '../components/LibrarianChat';
import { QuickSuggestions } from '../components/QuickSuggestions';
import { Comic } from '../types/librarian';

interface LibrarianPageProps {
  comics: Comic[];
}

export const LibrarianPage: React.FC<LibrarianPageProps> = ({ comics }) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const hasReadHistory = comics.some(c => c.dateRead);

  const handleSuggestionClick = (query: string) => {
    // This will be handled by passing the query to the chat component
    setShowSuggestions(false);
    // You can implement a way to inject this query into the chat
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">The Archivist</h1>
          <p className="text-gray-400">
            {hasReadHistory
              ? `Consult your personal comic expert about your ${comics.length} comics`
              : 'Get personalized comic recommendations from The Archivist'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-xl h-[700px] overflow-hidden">
              <LibrarianChat comics={comics} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <QuickSuggestions
                onSuggestionClick={handleSuggestionClick}
                hasReadHistory={hasReadHistory}
              />
            </div>

            {/* Stats Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Collection Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Comics</span>
                  <span className="text-2xl font-bold text-purple-400">{comics.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Read</span>
                  <span className="text-xl font-semibold text-blue-400">
                    {comics.filter(c => c.dateRead).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Rated</span>
                  <span className="text-xl font-semibold text-purple-400">
                    {comics.filter(c => c.rating).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Favorites</span>
                  <span className="text-xl font-semibold text-yellow-400">
                    {comics.filter(c => c.isFavorite).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">💡 Pro Tips</h3>
              <ul className="text-sm space-y-2 text-purple-100">
                <li>• Ask about specific series or creators</li>
                <li>• Request reading orders for events</li>
                <li>• Get gap analysis for your collection</li>
                <li>• Discover hidden gems based on your taste</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianPage;
