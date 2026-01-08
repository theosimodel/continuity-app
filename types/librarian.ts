/**
 * Librarian/Archivist Feature Types
 */

import { Comic } from '../types';

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

/**
 * Structured recommendation from The Archivist
 */
export interface ArchivistRecommendation {
  title: string;
  series?: string;
  writer?: string;
  artist?: string;
  publisher?: string;
  year?: number;
  coverUrl?: string;
  comicVineId?: string;
}

/**
 * Parsed Archivist response with extracted recommendations
 */
export interface ParsedArchivistResponse {
  message: string;
  recommendations: ArchivistRecommendation[];
}

/**
 * State for a recommendation card action
 */
export type RecommendationActionState = 'idle' | 'loading' | 'success' | 'error' | 'already-added';
