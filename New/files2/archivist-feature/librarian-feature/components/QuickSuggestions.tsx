/**
 * Librarian Quick Suggestions
 * Pre-defined questions for quick access to common queries
 */

import React from 'react';
import { Sparkles, TrendingUp, BookOpen, Award, BarChart3 } from 'lucide-react';

interface QuickSuggestion {
  icon: React.ReactNode;
  label: string;
  query: string;
  category: 'recommend' | 'stats' | 'discover' | 'analyze';
}

interface QuickSuggestionsProps {
  onSuggestionClick: (query: string) => void;
  hasReadHistory: boolean;
  className?: string;
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({
  onSuggestionClick,
  hasReadHistory,
  className = '',
}) => {
  const suggestions: QuickSuggestion[] = hasReadHistory
    ? [
        {
          icon: <Sparkles className="w-4 h-4" />,
          label: 'What should I read next?',
          query: 'Based on what I\'ve been reading, what should I read next?',
          category: 'recommend',
        },
        {
          icon: <BarChart3 className="w-4 h-4" />,
          label: 'Show my reading stats',
          query: 'Give me a fun summary of my reading stats and patterns',
          category: 'stats',
        },
        {
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Recommend similar comics',
          query: 'Recommend comics similar to my highest-rated series',
          category: 'recommend',
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          label: 'What am I currently reading?',
          query: 'What series am I currently reading? What should I continue?',
          category: 'analyze',
        },
        {
          icon: <Award className="w-4 h-4" />,
          label: 'Discover acclaimed comics',
          query: 'Recommend some critically acclaimed comics I haven\'t read yet',
          category: 'discover',
        },
      ]
    : [
        {
          icon: <Sparkles className="w-4 h-4" />,
          label: 'Help me get started',
          query: 'I\'m new to tracking comics. How should I get started?',
          category: 'discover',
        },
        {
          icon: <Award className="w-4 h-4" />,
          label: 'Essential comics to read',
          query: 'What are some essential comics everyone should read?',
          category: 'discover',
        },
        {
          icon: <BookOpen className="w-4 h-4" />,
          label: 'Popular series right now',
          query: 'What are some popular comic series right now?',
          category: 'discover',
        },
        {
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Guide to comic publishers',
          query: 'Can you explain the major comic publishers and what they\'re known for?',
          category: 'discover',
        },
      ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recommend':
        return 'bg-green-600 hover:bg-green-700';
      case 'stats':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'discover':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'analyze':
        return 'bg-orange-600 hover:bg-orange-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
        Quick Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            className={`${getCategoryColor(
              suggestion.category
            )} text-white rounded-lg p-3 text-left transition-all hover:scale-105 active:scale-95 shadow-lg`}
          >
            <div className="flex items-center gap-2">
              {suggestion.icon}
              <span className="text-sm font-medium">{suggestion.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
