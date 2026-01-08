/**
 * Comic Enrichment Service
 * Enriches Archivist recommendations with full metadata from ComicVine
 */

import { ArchivistRecommendation } from '../types/librarian';
import { Comic } from '../types';
import { searchComics } from './comicVineService';
import { findBestMatch, buildSearchQuery } from '../utils/comicMatcher';

export interface EnrichmentResult {
  comic: Comic;
  source: 'comicvine' | 'ai';
  confidence: number;
}

// Simple in-memory cache for search results (avoids repeated API calls)
const searchCache = new Map<string, { results: Comic[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Get cached results or return null if expired/missing
 */
function getCachedResults(key: string): Comic[] | null {
  const cached = searchCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }

  return cached.results;
}

/**
 * Cache search results
 */
function cacheResults(key: string, results: Comic[]): void {
  searchCache.set(key, { results, timestamp: Date.now() });
}

/**
 * Create a basic Comic from AI recommendation data (fallback)
 */
function createBasicComic(rec: ArchivistRecommendation): Comic {
  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    title: rec.title,
    writer: rec.writer || 'Unknown',
    artist: rec.artist || 'Unknown',
    publisher: rec.publisher || '',
    year: rec.year || new Date().getFullYear(),
    description: `Recommended by The Archivist: ${rec.title}${rec.writer ? ` by ${rec.writer}` : ''}`,
    coverUrl: rec.coverUrl || '',
    readStates: []
  };
}

/**
 * Enrich a single recommendation with ComicVine data
 */
export async function enrichRecommendation(
  recommendation: ArchivistRecommendation
): Promise<EnrichmentResult> {
  const searchQuery = buildSearchQuery(recommendation);
  const cacheKey = searchQuery.toLowerCase();

  // Step 1: Check cache
  let results = getCachedResults(cacheKey);

  // Step 2: Search ComicVine if not cached
  if (!results) {
    try {
      console.log(`Searching ComicVine for: "${searchQuery}"`);
      results = await searchComics(searchQuery);
      cacheResults(cacheKey, results);
    } catch (error) {
      console.warn('ComicVine search failed:', error);
      // Return basic comic on search failure
      return {
        comic: createBasicComic(recommendation),
        source: 'ai',
        confidence: 0.3
      };
    }
  }

  // Step 3: Find best match
  const bestMatch = findBestMatch(results, recommendation);

  if (bestMatch) {
    console.log(`Found ComicVine match: "${bestMatch.title}"`);
    return {
      comic: bestMatch,
      source: 'comicvine',
      confidence: 0.9
    };
  }

  // Step 4: Fallback to AI data
  console.log(`No ComicVine match for "${recommendation.title}", using AI data`);
  return {
    comic: createBasicComic(recommendation),
    source: 'ai',
    confidence: 0.5
  };
}

/**
 * Enrich multiple recommendations (with rate limiting)
 */
export async function enrichBatch(
  recommendations: ArchivistRecommendation[]
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  const BATCH_SIZE = 3;
  const DELAY_MS = 300;

  for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
    const batch = recommendations.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(rec => enrichRecommendation(rec))
    );
    results.push(...batchResults);

    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < recommendations.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return results;
}

/**
 * Clear the search cache (useful for testing)
 */
export function clearEnrichmentCache(): void {
  searchCache.clear();
}
