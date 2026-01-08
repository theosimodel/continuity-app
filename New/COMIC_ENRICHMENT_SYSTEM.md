# Comic Metadata Enrichment System

## Overview

When The Archivist recommends comics, automatically enrich them with full metadata from ComicVine API before adding to the user's collection. This ensures professional-quality data with cover images, complete details, and consistent formatting.

## Architecture

### Data Flow

```
Archivist Recommendation
    ↓
Search ComicVine API
    ↓
┌─────────────────┬─────────────────┐
│   Found         │   Not Found     │
│   (90% of time) │   (10% of time) │
└─────────────────┴─────────────────┘
    ↓                   ↓
Fetch Full Metadata   Use AI Data
    ↓                   ↓
Add to Collection ←─────┘
    ↓
Show Success Message
```

## File Structure

```
src/
├── services/
│   ├── comicEnrichment.ts      # NEW - Main enrichment logic
│   ├── comicVineAPI.ts         # NEW - ComicVine API wrapper
│   └── librarianService.ts     # EXISTING - Archivist AI
├── utils/
│   ├── comicMatcher.ts         # NEW - Fuzzy matching logic
│   └── cache.ts                # NEW - Search result caching
├── types/
│   └── comicVine.ts            # NEW - ComicVine API types
```

## Implementation

### 1. ComicVine API Service

```typescript
// services/comicVineAPI.ts

const COMICVINE_API_KEY = import.meta.env.VITE_COMICVINE_API_KEY;
const BASE_URL = 'https://comicvine.gamespot.com/api';

interface ComicVineSearchParams {
  query: string;
  resources?: 'issue' | 'volume';
  limit?: number;
}

interface ComicVineIssue {
  id: number;
  name: string;
  volume: {
    id: number;
    name: string;
  };
  issue_number: string;
  cover_date: string;
  image: {
    original_url: string;
    medium_url: string;
    small_url: string;
  };
  person_credits: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  character_credits: Array<{
    id: number;
    name: string;
  }>;
  description: string;
  site_detail_url: string;
}

export class ComicVineAPI {
  private baseUrl = BASE_URL;
  private apiKey = COMICVINE_API_KEY;

  /**
   * Search for comics by title and creator
   */
  async searchComics(params: ComicVineSearchParams): Promise<ComicVineIssue[]> {
    if (!this.apiKey) {
      throw new Error('ComicVine API key not configured');
    }

    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('query', params.query);
    url.searchParams.set('resources', params.resources || 'issue');
    url.searchParams.set('limit', String(params.limit || 10));
    url.searchParams.set('field_list', 'id,name,volume,issue_number,cover_date,image,person_credits,character_credits,description,site_detail_url');

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`ComicVine API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status_code !== 1) {
        throw new Error(`ComicVine API error: ${data.error}`);
      }

      return data.results;
    } catch (error) {
      console.error('ComicVine search failed:', error);
      throw error;
    }
  }

  /**
   * Get full details for a specific issue
   */
  async getIssue(issueId: number): Promise<ComicVineIssue> {
    if (!this.apiKey) {
      throw new Error('ComicVine API key not configured');
    }

    const url = new URL(`${this.baseUrl}/issue/4000-${issueId}`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status_code !== 1) {
        throw new Error(`ComicVine API error: ${data.error}`);
      }

      return data.results;
    } catch (error) {
      console.error('Failed to fetch issue details:', error);
      throw error;
    }
  }

  /**
   * Search for a specific volume (series)
   */
  async searchVolumes(title: string): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('query', title);
    url.searchParams.set('resources', 'volume');
    url.searchParams.set('limit', '10');

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status_code !== 1) {
        throw new Error(`ComicVine API error: ${data.error}`);
      }

      return data.results;
    } catch (error) {
      console.error('Failed to search volumes:', error);
      throw error;
    }
  }
}

// Export singleton
export const comicVineAPI = new ComicVineAPI();
```

### 2. Comic Matcher Utility

```typescript
// utils/comicMatcher.ts

import { ArchivistRecommendation } from '../types/librarian';

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance for fuzzy matching
 */
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Normalize comic title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Score a ComicVine result against the recommendation
 */
export function scoreMatch(
  cvResult: any,
  recommendation: ArchivistRecommendation
): number {
  let score = 0;

  // Title similarity (most important - 50% weight)
  const cvTitle = normalizeTitle(cvResult.volume?.name || cvResult.name || '');
  const recTitle = normalizeTitle(recommendation.title);
  const titleSimilarity = stringSimilarity(cvTitle, recTitle);
  score += titleSimilarity * 50;

  // Writer match (30% weight)
  if (recommendation.writer && cvResult.person_credits) {
    const writers = cvResult.person_credits
      .filter((p: any) => p.role?.toLowerCase().includes('writer'))
      .map((p: any) => p.name.toLowerCase());

    const recWriters = recommendation.writer.toLowerCase().split(',').map(w => w.trim());
    
    const writerMatch = recWriters.some(rw => 
      writers.some((cvw: string) => cvw.includes(rw) || rw.includes(cvw))
    );

    if (writerMatch) {
      score += 30;
    }
  }

  // Publisher match (10% weight)
  if (recommendation.publisher && cvResult.volume?.publisher) {
    const cvPub = cvResult.volume.publisher.name.toLowerCase();
    const recPub = recommendation.publisher.toLowerCase();
    
    if (cvPub.includes(recPub) || recPub.includes(cvPub)) {
      score += 10;
    }
  }

  // Year proximity (10% weight)
  if (recommendation.year && cvResult.cover_date) {
    const cvYear = new Date(cvResult.cover_date).getFullYear();
    const yearDiff = Math.abs(cvYear - recommendation.year);
    
    if (yearDiff === 0) {
      score += 10;
    } else if (yearDiff <= 2) {
      score += 5;
    }
  }

  return score;
}

/**
 * Find best matching comic from search results
 */
export function findBestMatch(
  results: any[],
  recommendation: ArchivistRecommendation
): any | null {
  if (results.length === 0) {
    return null;
  }

  // Score all results
  const scored = results.map(result => ({
    result,
    score: scoreMatch(result, recommendation)
  }));

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  // Return best match if score is above threshold (70%)
  return scored[0].score >= 70 ? scored[0].result : null;
}
```

### 3. Search Cache

```typescript
// utils/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class SearchCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL = 1000 * 60 * 60; // 1 hour

  /**
   * Generate cache key from search params
   */
  private generateKey(params: any): string {
    return JSON.stringify(params);
  }

  /**
   * Get cached result if still valid
   */
  get(params: any): T | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store result in cache
   */
  set(params: any, data: T, ttl?: number): void {
    const key = this.generateKey(params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl || this.defaultTTL)
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton for ComicVine searches
export const comicVineCache = new SearchCache<any[]>();

// Auto-cleanup every 10 minutes
setInterval(() => {
  comicVineCache.cleanup();
}, 1000 * 60 * 10);
```

### 4. Main Enrichment Service

```typescript
// services/comicEnrichment.ts

import { ArchivistRecommendation } from '../types/librarian';
import { Comic } from '../types';
import { comicVineAPI } from './comicVineAPI';
import { comicVineCache } from '../utils/cache';
import { findBestMatch } from '../utils/comicMatcher';

interface EnrichmentResult {
  comic: Comic;
  source: 'comicvine' | 'ai';
  confidence: number;
}

export class ComicEnrichmentService {
  
  /**
   * Main enrichment function - tries ComicVine first, falls back to AI data
   */
  async enrichRecommendation(
    recommendation: ArchivistRecommendation
  ): Promise<EnrichmentResult> {
    
    // Step 1: Try cache first
    const cacheKey = {
      title: recommendation.title,
      writer: recommendation.writer
    };
    
    const cached = comicVineCache.get(cacheKey);
    if (cached && cached.length > 0) {
      const match = findBestMatch(cached, recommendation);
      if (match) {
        const comic = await this.comicVineToComic(match);
        return {
          comic,
          source: 'comicvine',
          confidence: 0.95
        };
      }
    }

    // Step 2: Search ComicVine
    try {
      const searchQuery = this.buildSearchQuery(recommendation);
      const results = await comicVineAPI.searchComics({
        query: searchQuery,
        resources: 'issue',
        limit: 10
      });

      // Cache the results
      comicVineCache.set(cacheKey, results);

      // Find best match
      const bestMatch = findBestMatch(results, recommendation);

      if (bestMatch) {
        // Fetch full details
        const fullComic = await comicVineAPI.getIssue(bestMatch.id);
        const comic = await this.comicVineToComic(fullComic);
        
        return {
          comic,
          source: 'comicvine',
          confidence: 0.9
        };
      }
    } catch (error) {
      console.warn('ComicVine enrichment failed:', error);
    }

    // Step 3: Fallback to AI data
    const comic = this.createBasicComic(recommendation);
    return {
      comic,
      source: 'ai',
      confidence: 0.5
    };
  }

  /**
   * Build optimal search query for ComicVine
   */
  private buildSearchQuery(rec: ArchivistRecommendation): string {
    const parts: string[] = [rec.title];
    
    if (rec.writer) {
      parts.push(rec.writer.split(',')[0].trim()); // First writer only
    }
    
    if (rec.year) {
      parts.push(String(rec.year));
    }

    return parts.join(' ');
  }

  /**
   * Convert ComicVine issue to our Comic format
   */
  private async comicVineToComic(cvIssue: any): Promise<Comic> {
    // Extract writers
    const writers = cvIssue.person_credits
      ?.filter((p: any) => p.role?.toLowerCase().includes('writer'))
      .map((p: any) => p.name)
      .join(', ') || '';

    // Extract artists
    const artists = cvIssue.person_credits
      ?.filter((p: any) => 
        p.role?.toLowerCase().includes('artist') ||
        p.role?.toLowerCase().includes('penciler')
      )
      .map((p: any) => p.name)
      .join(', ') || '';

    // Extract characters
    const characters = cvIssue.character_credits
      ?.map((c: any) => c.name)
      .join(', ') || '';

    return {
      id: `cv_${cvIssue.id}`,
      title: cvIssue.name || cvIssue.volume?.name || 'Unknown',
      series: cvIssue.volume?.name || cvIssue.name,
      volume: cvIssue.volume?.name,
      issueNumber: cvIssue.issue_number,
      writer: writers,
      artist: artists,
      publisher: cvIssue.volume?.publisher?.name || '',
      year: cvIssue.cover_date ? new Date(cvIssue.cover_date).getFullYear() : undefined,
      coverUrl: cvIssue.image?.medium_url || cvIssue.image?.original_url,
      description: this.stripHTML(cvIssue.description || ''),
      comicVineId: cvIssue.id,
      comicVineUrl: cvIssue.site_detail_url,
      characters,
      // User fields - initialized as empty
      rating: undefined,
      review: undefined,
      dateRead: undefined,
      isOwned: false,
      isFavorite: false,
      tags: []
    };
  }

  /**
   * Create basic comic from AI recommendation data
   */
  private createBasicComic(rec: ArchivistRecommendation): Comic {
    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: rec.title,
      series: rec.series || rec.title,
      volume: rec.series,
      issueNumber: rec.issueNumber,
      writer: rec.writer,
      artist: rec.artist,
      publisher: rec.publisher,
      year: rec.year,
      coverUrl: rec.coverUrl, // Usually undefined from AI
      description: '',
      // User fields
      rating: undefined,
      review: undefined,
      dateRead: undefined,
      isOwned: false,
      isFavorite: false,
      tags: ['from-archivist'] // Tag AI-sourced comics
    };
  }

  /**
   * Strip HTML tags from description
   */
  private stripHTML(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Batch enrich multiple recommendations
   */
  async enrichBatch(
    recommendations: ArchivistRecommendation[]
  ): Promise<EnrichmentResult[]> {
    // Process in parallel with limit to avoid rate limiting
    const BATCH_SIZE = 3;
    const results: EnrichmentResult[] = [];

    for (let i = 0; i < recommendations.length; i += BATCH_SIZE) {
      const batch = recommendations.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(rec => this.enrichRecommendation(rec))
      );
      results.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < recommendations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }
}

// Export singleton
export const comicEnrichment = new ComicEnrichmentService();
```

### 5. Updated LibrarianChat Component

```typescript
// components/LibrarianChat.tsx - Add to existing component

import { comicEnrichment } from '../services/comicEnrichment';

// Inside your handleAddToList function:
const handleAddToList = async (
  recommendation: ArchivistRecommendation,
  listType: 'want-to-read' | 'reading' | 'owned'
) => {
  try {
    // Show loading state
    setEnrichingComic(recommendation.title);

    // Enrich the recommendation
    const result = await comicEnrichment.enrichRecommendation(recommendation);

    // Set appropriate flags based on list type
    const comic = {
      ...result.comic,
      isOwned: listType === 'owned',
      // Add to appropriate list tracking
    };

    // Add to collection
    addComicToCollection(comic);

    // Show success message
    const sourceMessage = result.source === 'comicvine' 
      ? '📚 Added with full details from ComicVine!'
      : '📝 Added with basic info (not found in ComicVine)';

    addArchivistMessage(`${sourceMessage}\n\n"${comic.title}" is now in your ${listType} list.`);

  } catch (error) {
    console.error('Failed to add comic:', error);
    addArchivistMessage(`Sorry, I couldn't add "${recommendation.title}". Please try again.`);
  } finally {
    setEnrichingComic(null);
  }
};
```

### 6. UI Feedback Component

```typescript
// components/EnrichmentStatus.tsx

interface EnrichmentStatusProps {
  isEnriching: boolean;
  comicTitle: string;
  source?: 'comicvine' | 'ai';
}

export const EnrichmentStatus: React.FC<EnrichmentStatusProps> = ({
  isEnriching,
  comicTitle,
  source
}) => {
  if (!isEnriching) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg">
      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">
          Searching for "{comicTitle}"...
        </p>
        <p className="text-xs text-gray-400">
          Looking up full details from ComicVine
        </p>
      </div>
    </div>
  );
};

// Success state
export const EnrichmentSuccess: React.FC<{ source: 'comicvine' | 'ai' }> = ({ source }) => {
  return (
    <div className={`flex items-center gap-2 text-sm ${
      source === 'comicvine' ? 'text-green-400' : 'text-yellow-400'
    }`}>
      {source === 'comicvine' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span>Full details from ComicVine</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Basic info only (not in ComicVine)</span>
        </>
      )}
    </div>
  );
};
```

## Environment Setup

### Required Environment Variables

```bash
# .env.local

# ComicVine API Key (get from https://comicvine.gamespot.com/api/)
VITE_COMICVINE_API_KEY=your_api_key_here

# Gemini API Key (existing)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### Getting a ComicVine API Key

1. Go to https://comicvine.gamespot.com/api/
2. Sign up for a free account
3. Navigate to API section
4. Generate API key
5. Add to `.env.local`

**Note**: ComicVine has rate limits (200 requests per hour for free accounts). Our caching system helps stay within limits.

## Performance Optimizations

### 1. Aggressive Caching

```typescript
// Cache search results for 1 hour
comicVineCache.set(searchParams, results, 1000 * 60 * 60);

// Cache hit rate should be ~60-70% for common searches
```

### 2. Batch Processing

```typescript
// Instead of 5 sequential requests (5-10 seconds)
for (const rec of recommendations) {
  await enrich(rec);
}

// Process 3 at a time (2-3 seconds total)
await comicEnrichment.enrichBatch(recommendations);
```

### 3. Optimistic UI

```typescript
// Show comic immediately with loading state
addComicToUI({ ...recommendation, isEnriching: true });

// Enrich in background
enrichInBackground(recommendation).then(updateComic);
```

### 4. Lazy Loading

```typescript
// For bulk imports, enrich on-demand when user views
useEffect(() => {
  if (comic.source === 'ai' && isVisible) {
    tryEnrichComic(comic);
  }
}, [isVisible]);
```

## Error Handling

### ComicVine API Failures

```typescript
try {
  const results = await comicVineAPI.search(query);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Show user-friendly message
    return createBasicComic(recommendation);
  }
  
  if (error.message.includes('timeout')) {
    // Retry once
    await delay(1000);
    return await comicVineAPI.search(query);
  }
  
  // Fallback to AI data
  return createBasicComic(recommendation);
}
```

### Network Issues

```typescript
// Add retry logic
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}
```

### User Feedback

```typescript
// Clear error messages
if (error.includes('rate limit')) {
  showMessage('ComicVine temporarily unavailable. Added with basic info.');
} else if (error.includes('not found')) {
  showMessage('Comic not in ComicVine database. Added with AI details.');
} else {
  showMessage('Having trouble connecting. Added with basic info.');
}
```

## Testing Strategy

### Unit Tests

```typescript
// utils/comicMatcher.test.ts

describe('Comic Matcher', () => {
  it('should match exact titles', () => {
    const result = { name: 'Saga', volume: { name: 'Saga' } };
    const rec = { title: 'Saga', writer: 'Brian K. Vaughan' };
    expect(scoreMatch(result, rec)).toBeGreaterThan(80);
  });

  it('should handle punctuation differences', () => {
    const result = { name: 'Y: The Last Man', volume: {} };
    const rec = { title: 'Y The Last Man', writer: '' };
    expect(scoreMatch(result, rec)).toBeGreaterThan(70);
  });

  it('should match by writer', () => {
    const result = {
      name: 'Saga',
      person_credits: [{ name: 'Brian K. Vaughan', role: 'writer' }]
    };
    const rec = { title: 'Saga', writer: 'Brian K. Vaughan' };
    expect(scoreMatch(result, rec)).toBeGreaterThan(80);
  });
});
```

### Integration Tests

```typescript
// services/comicEnrichment.test.ts

describe('Comic Enrichment', () => {
  it('should enrich from ComicVine when found', async () => {
    const rec = {
      title: 'Saga',
      writer: 'Brian K. Vaughan'
    };

    const result = await comicEnrichment.enrichRecommendation(rec);
    
    expect(result.source).toBe('comicvine');
    expect(result.comic.coverUrl).toBeDefined();
    expect(result.comic.comicVineId).toBeDefined();
  });

  it('should fall back to AI data when not found', async () => {
    const rec = {
      title: 'Super Obscure Indie Comic #1',
      writer: 'Unknown Writer'
    };

    const result = await comicEnrichment.enrichRecommendation(rec);
    
    expect(result.source).toBe('ai');
    expect(result.comic.title).toBe(rec.title);
  });
});
```

### Manual Testing Checklist

- [ ] Search for popular comic (e.g., "Saga") - should find in ComicVine
- [ ] Search for obscure comic - should fall back to AI data
- [ ] Test with rate limit (make 200+ requests) - should handle gracefully
- [ ] Test with network offline - should fall back to AI data
- [ ] Check cache hit rate - should be >60% after 10 searches
- [ ] Verify cover images load correctly
- [ ] Test batch enrichment (5+ recommendations)
- [ ] Verify loading states show properly
- [ ] Test with typos in title - fuzzy matching should work

## Monitoring

### Metrics to Track

```typescript
// Track enrichment success rate
const metrics = {
  totalEnrichments: 0,
  comicVineSuccesses: 0,
  aiFallbacks: 0,
  cacheHits: 0,
  errors: 0
};

// Log after each enrichment
console.log(`Enrichment success rate: ${
  (metrics.comicVineSuccesses / metrics.totalEnrichments) * 100
}%`);

console.log(`Cache hit rate: ${
  (metrics.cacheHits / metrics.totalEnrichments) * 100
}%`);
```

### User-Facing Stats

```tsx
// Settings page
<div className="stats">
  <h3>Enrichment Statistics</h3>
  <p>Comics with full metadata: {comicVineCount} ({percentage}%)</p>
  <p>Basic metadata only: {aiCount}</p>
  <button onClick={reEnrichAll}>
    Re-check ComicVine for missing data
  </button>
</div>
```

## Future Enhancements

### Phase 2 Features

1. **Manual Re-enrichment**
   ```tsx
   <button onClick={() => reEnrich(comic)}>
     🔄 Update from ComicVine
   </button>
   ```

2. **Bulk Re-enrichment**
   ```typescript
   // Re-check all AI-sourced comics
   const aiComics = comics.filter(c => c.source === 'ai');
   await comicEnrichment.enrichBatch(aiComics);
   ```

3. **Alternative Sources**
   ```typescript
   // If ComicVine fails, try Marvel API, DC API, etc.
   if (!comicVineResult) {
     result = await marvelAPI.search(query);
   }
   ```

4. **Smart Suggestions**
   ```
   Archivist: "I found 3 possible matches. Which one did you mean?"
   [Option 1: Saga Vol 1 (2012)]
   [Option 2: Saga Vol 2 (2022)]
   [Option 3: None of these]
   ```

## Summary

This enrichment system ensures that 90% of comics added via The Archivist have complete, professional-quality metadata with cover images. The 10% fallback to AI data handles edge cases gracefully, and the caching system keeps performance fast while respecting API rate limits.

**Key Benefits:**
- ✅ Professional data quality
- ✅ Beautiful cover images
- ✅ Fast user experience (1-2 second enrichment)
- ✅ Graceful fallbacks
- ✅ Efficient API usage via caching
- ✅ Clear user feedback

**Estimated Development Time:** 6-8 hours

**Dependencies:**
- ComicVine API key (free)
- Existing comic management system
- localStorage or database for caching
