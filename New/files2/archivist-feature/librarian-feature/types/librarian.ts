/**
 * Librarian Feature Types
 * Extends the existing Continuity types with librarian-specific structures
 */

export interface LibrarianMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: LibrarianContext;
}

export interface LibrarianContext {
  recentReads?: Comic[];
  favoriteCreators?: string[];
  currentlyReading?: Comic[];
  topRatedSeries?: string[];
  collectionSize?: number;
  readingStats?: ReadingStats;
}

export interface ReadingStats {
  totalIssuesRead: number;
  averageRating: number;
  favoritePublishers: string[];
  favoriteGenres: string[];
  readingStreak?: number;
  mostReadCreators: { name: string; count: number }[];
}

export interface LibrarianConversation {
  id: string;
  messages: LibrarianMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

export interface LibrarianSuggestion {
  type: 'read-next' | 'complete-series' | 'similar-to' | 'creator-spotlight';
  title: string;
  description: string;
  comics?: Comic[];
  metadata?: Record<string, any>;
}

// Extend existing Comic type (assuming you have this in your types.ts)
export interface Comic {
  id: string;
  title: string;
  issueNumber?: string;
  volume?: string;
  series?: string;
  writer?: string;
  artist?: string;
  publisher?: string;
  year?: number;
  coverUrl?: string;
  description?: string;
  rating?: number;
  review?: string;
  dateRead?: number;
  isOwned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}
