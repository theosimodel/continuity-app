# AI-Enhanced Comic Metadata System

## Overview

Combine ComicVine's structured data (titles, credits, covers) with Gemini's deep comic knowledge (story details, significance, first appearances) to create the most comprehensive comic metadata system available.

## The Problem

**ComicVine gives you:**
- ✅ Title, issue number, credits
- ✅ Cover images
- ✅ Publication dates
- ❌ Generic descriptions (often missing or vague)
- ❌ No context on significance
- ❌ No story spoilers/details
- ❌ No "why this matters" information

**What users actually want to know:**
- "What happens in this issue?"
- "Is this a key issue?"
- "Why is everyone talking about this?"
- "Do I need to read this for the story arc?"
- "What's the significance of this issue?"

## The Solution

**Two-Stage Enrichment:**

1. **ComicVine (Structural Data)** → Title, credits, cover, basic info
2. **Gemini (Knowledge Layer)** → Story details, significance, context

```
Comic Import
    ↓
Get ComicVine Data
    ↓
Pass to Gemini AI
    ↓
Gemini Adds:
  - Story summary
  - Key events
  - Significance notes
  - First appearances
  - Character developments
  - Reading recommendations
    ↓
Save Enriched Comic
```

## Architecture

### File Structure

```
src/
├── services/
│   ├── aiEnrichment.ts         # NEW - Gemini enrichment
│   ├── comicEnrichment.ts      # EXISTING - ComicVine lookup
│   └── significanceDetector.ts # NEW - Key issue detection
├── types/
│   └── enrichedComic.ts        # NEW - Enhanced comic type
└── components/
    └── SignificanceBadge.tsx   # NEW - Display key issue info
```

### Enhanced Comic Type

```typescript
// types/enrichedComic.ts

export interface EnrichedComic extends Comic {
  // AI-Enhanced Fields
  aiEnrichment?: {
    // Story Information
    storySummary?: string;           // "In this issue, Spider-Man faces..."
    spoilerFreeSummary?: string;     // Non-spoiler overview
    
    // Significance
    significance?: 'major' | 'minor' | 'filler';
    significanceNotes?: string;      // "First appearance of Miles Morales"
    keyEvents?: string[];            // ["Death of Gwen Stacy", "Uncle Ben's advice"]
    
    // First Appearances
    firstAppearances?: {
      characters?: string[];         // ["Miles Morales", "Spider-Gwen"]
      items?: string[];              // ["Iron Spider Suit"]
      locations?: string[];          // ["Spider-Verse"]
      teams?: string[];              // ["Young Avengers"]
    };
    
    // Character Development
    characterDevelopment?: string[]; // ["Peter Parker learns responsibility"]
    
    // Reading Context
    mustRead?: boolean;              // Essential to main story?
    canSkip?: boolean;               // Filler issue?
    requiredReading?: string[];      // "Read ASM #121 first"
    readingOrder?: number;           // Position in story arc
    
    // Metadata
    enrichedAt?: number;             // Timestamp
    confidence?: number;             // 0-1 confidence score
  };
}
```

## Implementation

### 1. AI Enrichment Service

```typescript
// services/aiEnrichment.ts

import { GoogleGenerativeAI } from '@google/genai';
import { Comic, EnrichedComic } from '../types';

interface EnrichmentRequest {
  comic: Comic;
  includeStory?: boolean;      // Get story summary
  includeSignificance?: boolean; // Detect key issues
  includeSpoilers?: boolean;    // Include spoiler details
}

export class AIEnrichmentService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Main enrichment function
   */
  async enrichComic(request: EnrichmentRequest): Promise<EnrichedComic> {
    const { comic } = request;

    try {
      // Build enrichment prompt
      const prompt = this.buildEnrichmentPrompt(comic, request);

      // Get AI response
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse structured response
      const enrichment = this.parseEnrichmentResponse(response);

      // Return enriched comic
      return {
        ...comic,
        aiEnrichment: {
          ...enrichment,
          enrichedAt: Date.now(),
          confidence: this.calculateConfidence(enrichment)
        }
      };

    } catch (error) {
      console.error('AI enrichment failed:', error);
      return comic; // Return original if enrichment fails
    }
  }

  /**
   * Build the enrichment prompt
   */
  private buildEnrichmentPrompt(
    comic: Comic,
    request: EnrichmentRequest
  ): string {
    const title = `${comic.series || comic.title} ${comic.issueNumber ? `#${comic.issueNumber}` : ''}`;
    const credits = [comic.writer, comic.artist].filter(Boolean).join(', ');
    const year = comic.year || 'unknown year';

    return `You are a comic book expert analyzing "${title}" by ${credits} (${year}).

Provide a structured analysis in the following JSON format:

{
  "storySummary": "2-3 sentence summary of what happens in this issue (spoiler-free unless requested)",
  "spoilerFreeSummary": "1 sentence overview safe for anyone",
  "significance": "major" | "minor" | "filler",
  "significanceNotes": "Why this issue matters (first appearances, deaths, major events)",
  "keyEvents": ["event 1", "event 2"],
  "firstAppearances": {
    "characters": ["character names"],
    "items": ["item names"],
    "locations": ["location names"],
    "teams": ["team names"]
  },
  "characterDevelopment": ["key character moments"],
  "mustRead": true/false,
  "canSkip": true/false,
  "requiredReading": ["issues to read before this"],
  "readingOrder": null
}

IMPORTANT RULES:
1. If you don't know something, leave the field empty or null
2. Be factual and concise
3. ${request.includeSpoilers ? 'Include spoilers' : 'NO SPOILERS in storySummary'}
4. Focus on significance - first appearances, deaths, major plot points
5. If this is a key issue (first appearance, major death, etc), mark significance as "major"
6. Only mark mustRead if truly essential to main story
7. Mark canSkip if it's truly filler/side story

Return ONLY the JSON, no additional text.`;
  }

  /**
   * Parse AI response into structured data
   */
  private parseEnrichmentResponse(response: string): any {
    try {
      // Remove markdown code blocks if present
      const cleaned = response
        .replace(/```json\n/g, '')
        .replace(/```\n/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse enrichment response:', error);
      return {};
    }
  }

  /**
   * Calculate confidence score based on completeness
   */
  private calculateConfidence(enrichment: any): number {
    let score = 0;
    const fields = [
      'storySummary',
      'significanceNotes',
      'keyEvents',
      'firstAppearances'
    ];

    fields.forEach(field => {
      if (enrichment[field] && 
          (typeof enrichment[field] === 'string' ? enrichment[field].length > 0 : true)) {
        score += 0.25;
      }
    });

    return score;
  }

  /**
   * Batch enrich multiple comics
   */
  async enrichBatch(
    comics: Comic[],
    request: Omit<EnrichmentRequest, 'comic'>
  ): Promise<EnrichedComic[]> {
    const BATCH_SIZE = 3;
    const results: EnrichedComic[] = [];

    for (let i = 0; i < comics.length; i += BATCH_SIZE) {
      const batch = comics.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(comic => this.enrichComic({ ...request, comic }))
      );
      
      results.push(...batchResults);

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < comics.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  /**
   * Re-enrich with updated information
   */
  async updateEnrichment(
    comic: EnrichedComic,
    options: { includeSpoilers?: boolean }
  ): Promise<EnrichedComic> {
    return this.enrichComic({
      comic,
      includeStory: true,
      includeSignificance: true,
      includeSpoilers: options.includeSpoilers
    });
  }
}

// Export singleton
export const aiEnrichment = new AIEnrichmentService();
```

### 2. Significance Detector

```typescript
// services/significanceDetector.ts

import { EnrichedComic } from '../types';

export type SignificanceLevel = 'major' | 'minor' | 'filler' | 'unknown';

export interface SignificanceBadge {
  level: SignificanceLevel;
  label: string;
  color: string;
  icon: string;
}

export class SignificanceDetector {
  
  /**
   * Get badge info for display
   */
  getBadge(comic: EnrichedComic): SignificanceBadge | null {
    const enrichment = comic.aiEnrichment;
    
    if (!enrichment) {
      return null;
    }

    // Major significance
    if (enrichment.significance === 'major' || enrichment.mustRead) {
      return {
        level: 'major',
        label: this.getMajorLabel(enrichment),
        color: 'bg-red-600',
        icon: '⭐'
      };
    }

    // First appearances
    const hasFirstAppearance = this.hasFirstAppearances(enrichment);
    if (hasFirstAppearance) {
      return {
        level: 'major',
        label: 'First Appearance',
        color: 'bg-purple-600',
        icon: '🎭'
      };
    }

    // Minor significance
    if (enrichment.significance === 'minor') {
      return {
        level: 'minor',
        label: 'Notable',
        color: 'bg-blue-600',
        icon: '📌'
      };
    }

    // Filler
    if (enrichment.canSkip || enrichment.significance === 'filler') {
      return {
        level: 'filler',
        label: 'Optional',
        color: 'bg-gray-600',
        icon: '➖'
      };
    }

    return null;
  }

  /**
   * Get specific label for major issues
   */
  private getMajorLabel(enrichment: any): string {
    // Check for specific keywords in significance notes
    const notes = enrichment.significanceNotes?.toLowerCase() || '';
    
    if (notes.includes('death')) {
      return 'Major Death';
    }
    if (notes.includes('origin')) {
      return 'Origin Story';
    }
    if (notes.includes('finale') || notes.includes('conclusion')) {
      return 'Story Finale';
    }
    if (notes.includes('crossover')) {
      return 'Crossover Event';
    }
    
    return 'Key Issue';
  }

  /**
   * Check if comic has first appearances
   */
  private hasFirstAppearances(enrichment: any): boolean {
    const fa = enrichment.firstAppearances;
    if (!fa) return false;

    return (
      (fa.characters && fa.characters.length > 0) ||
      (fa.items && fa.items.length > 0) ||
      (fa.teams && fa.teams.length > 0)
    );
  }

  /**
   * Get all first appearances as formatted string
   */
  getFirstAppearanceText(comic: EnrichedComic): string | null {
    const fa = comic.aiEnrichment?.firstAppearances;
    if (!fa) return null;

    const parts: string[] = [];

    if (fa.characters?.length) {
      parts.push(`Characters: ${fa.characters.join(', ')}`);
    }
    if (fa.items?.length) {
      parts.push(`Items: ${fa.items.join(', ')}`);
    }
    if (fa.teams?.length) {
      parts.push(`Teams: ${fa.teams.join(', ')}`);
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  }

  /**
   * Filter comics by significance
   */
  filterBySignificance(
    comics: EnrichedComic[],
    level: SignificanceLevel
  ): EnrichedComic[] {
    return comics.filter(comic => {
      const badge = this.getBadge(comic);
      return badge?.level === level;
    });
  }

  /**
   * Get key issues from collection
   */
  getKeyIssues(comics: EnrichedComic[]): EnrichedComic[] {
    return comics.filter(comic => {
      const enrichment = comic.aiEnrichment;
      return (
        enrichment?.significance === 'major' ||
        enrichment?.mustRead ||
        this.hasFirstAppearances(enrichment)
      );
    });
  }
}

// Export singleton
export const significanceDetector = new SignificanceDetector();
```

### 3. UI Components

```typescript
// components/SignificanceBadge.tsx

import React from 'react';
import { EnrichedComic } from '../types';
import { significanceDetector } from '../services/significanceDetector';

interface SignificanceBadgeProps {
  comic: EnrichedComic;
  size?: 'sm' | 'md' | 'lg';
}

export const SignificanceBadge: React.FC<SignificanceBadgeProps> = ({ 
  comic, 
  size = 'md' 
}) => {
  const badge = significanceDetector.getBadge(comic);

  if (!badge) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full ${badge.color} text-white font-semibold ${sizeClasses[size]}`}
      title={comic.aiEnrichment?.significanceNotes}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </div>
  );
};

// Enhanced Comic Card with AI enrichment
export const EnrichedComicCard: React.FC<{ comic: EnrichedComic }> = ({ comic }) => {
  const firstAppearances = significanceDetector.getFirstAppearanceText(comic);

  return (
    <div className="comic-card">
      {/* Cover Image */}
      <img src={comic.coverUrl} alt={comic.title} />

      {/* Significance Badge */}
      <div className="absolute top-2 right-2">
        <SignificanceBadge comic={comic} />
      </div>

      {/* Comic Info */}
      <div className="p-4">
        <h3>{comic.title}</h3>
        <p className="text-sm text-gray-400">{comic.writer}</p>

        {/* AI Enrichment */}
        {comic.aiEnrichment && (
          <div className="mt-3 space-y-2">
            {/* Spoiler-Free Summary */}
            {comic.aiEnrichment.spoilerFreeSummary && (
              <p className="text-sm text-gray-300">
                {comic.aiEnrichment.spoilerFreeSummary}
              </p>
            )}

            {/* First Appearances */}
            {firstAppearances && (
              <div className="text-xs text-purple-400 bg-purple-900/30 rounded p-2">
                <strong>First Appearance:</strong> {firstAppearances}
              </div>
            )}

            {/* Key Events */}
            {comic.aiEnrichment.keyEvents && comic.aiEnrichment.keyEvents.length > 0 && (
              <div className="text-xs">
                <strong>Key Events:</strong>
                <ul className="list-disc list-inside mt-1">
                  {comic.aiEnrichment.keyEvents.map((event, i) => (
                    <li key={i}>{event}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

### 4. Integration with Import Flow

```typescript
// services/comicImportFlow.ts

import { comicEnrichment } from './comicEnrichment';
import { aiEnrichment } from './aiEnrichment';
import { Comic, EnrichedComic } from '../types';

interface ImportOptions {
  enrichWithAI?: boolean;
  includeSpoilers?: boolean;
  detectSignificance?: boolean;
}

export class ComicImportFlow {
  
  /**
   * Complete import with both ComicVine and AI enrichment
   */
  async importComic(
    title: string,
    options: ImportOptions = {}
  ): Promise<EnrichedComic> {
    
    // Step 1: Get ComicVine data
    const cvResult = await comicEnrichment.enrichRecommendation({
      title,
      writer: '', // Will be fuzzy matched
    });

    let comic = cvResult.comic;

    // Step 2: AI enrichment (if enabled)
    if (options.enrichWithAI !== false) {
      comic = await aiEnrichment.enrichComic({
        comic,
        includeStory: true,
        includeSignificance: options.detectSignificance !== false,
        includeSpoilers: options.includeSpoilers || false
      });
    }

    return comic;
  }

  /**
   * Batch import with progress tracking
   */
  async importBatch(
    titles: string[],
    options: ImportOptions = {},
    onProgress?: (current: number, total: number) => void
  ): Promise<EnrichedComic[]> {
    const results: EnrichedComic[] = [];

    for (let i = 0; i < titles.length; i++) {
      const comic = await this.importComic(titles[i], options);
      results.push(comic);

      if (onProgress) {
        onProgress(i + 1, titles.length);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

export const comicImport = new ComicImportFlow();
```

## User Flows

### Flow 1: Import with Full Enrichment

```typescript
// User adds comic via The Archivist or search

// 1. Search ComicVine
const cvData = await comicVine.search("Amazing Spider-Man #121");

// 2. AI enrichment
const enriched = await aiEnrichment.enrichComic({
  comic: cvData,
  includeSignificance: true,
  includeSpoilers: false
});

// 3. Display to user
console.log(enriched.aiEnrichment);
/*
{
  storySummary: "Peter Parker faces his greatest tragedy...",
  significance: "major",
  significanceNotes: "Death of Gwen Stacy - one of the most impactful moments in Spider-Man history",
  keyEvents: ["Gwen Stacy's death", "Green Goblin revealed"],
  mustRead: true
}
*/
```

### Flow 2: User Asks "What's This Issue About?"

```tsx
// In comic detail view
<button onClick={() => fetchStorySummary(comic)}>
  📖 What's this issue about?
</button>

const fetchStorySummary = async (comic: Comic) => {
  setLoading(true);
  
  const enriched = await aiEnrichment.enrichComic({
    comic,
    includeStory: true,
    includeSpoilers: false // Start spoiler-free
  });

  setStorySummary(enriched.aiEnrichment?.spoilerFreeSummary);
  setShowSpoilerOption(true); // Allow user to request spoilers
};
```

### Flow 3: Detect Key Issues in Collection

```typescript
// Find all key issues in user's collection
const keyIssues = significanceDetector.getKeyIssues(comics);

// Display special section
<div className="key-issues-section">
  <h2>Key Issues in Your Collection ⭐</h2>
  {keyIssues.map(comic => (
    <EnrichedComicCard key={comic.id} comic={comic} />
  ))}
</div>
```

### Flow 4: The Archivist Integration

```typescript
// The Archivist can reference enrichment data

User: "What's significant about this issue?"

The Archivist: 
"Amazing Spider-Man #121 is one of the most important issues in comic history - it features the death of Gwen Stacy, which marked a turning point for superhero comics. This moment defined Spider-Man's character and showed that not every story has a happy ending.

[Mark as Must-Read] [Add to Want to Read]"
```

## Advanced Features

### 1. Progressive Enrichment

```typescript
// Start with fast enrichment, add details later

// Phase 1: Quick significance check (0.5s)
const quickEnrich = await aiEnrichment.enrichComic({
  comic,
  includeSignificance: true,
  includeStory: false // Skip story for speed
});

// Phase 2: Full enrichment when user views (2s)
if (userViewsComic) {
  const fullEnrich = await aiEnrichment.updateEnrichment(quickEnrich, {
    includeSpoilers: false
  });
}
```

### 2. Smart Caching

```typescript
// Cache AI enrichments to avoid repeated API calls

const enrichmentCache = new Map<string, any>();

const getCachedEnrichment = (comicId: string) => {
  return enrichmentCache.get(comicId);
};

const cacheEnrichment = (comicId: string, enrichment: any) => {
  enrichmentCache.set(comicId, enrichment);
  
  // Persist to localStorage
  localStorage.setItem(
    `enrichment_${comicId}`,
    JSON.stringify(enrichment)
  );
};
```

### 3. Community Contributions

```typescript
// Allow users to improve AI enrichments

interface UserContribution {
  comicId: string;
  userId: string;
  field: 'storySummary' | 'significanceNotes' | 'keyEvents';
  suggestedValue: string;
  votes: number;
}

// Future: Aggregate user contributions to improve AI training
```

### 4. Spoiler Management

```tsx
// Component for managing spoilers

<div className="story-summary">
  {showSpoilers ? (
    <div>
      <h4>Full Story Summary (Spoilers)</h4>
      <p>{comic.aiEnrichment?.storySummary}</p>
    </div>
  ) : (
    <div>
      <p>{comic.aiEnrichment?.spoilerFreeSummary}</p>
      <button onClick={() => setShowSpoilers(true)}>
        🔓 Show Spoilers
      button>
    </div>
  )}
</div>
```

## Performance Considerations

### Enrichment Timing

```typescript
// When to enrich?

// Option 1: On import (user waits 2-3s)
const comic = await importWithEnrichment(title);

// Option 2: Background (fast import, enrich later)
const comic = await quickImport(title);
enrichInBackground(comic);

// Option 3: On-demand (when user views)
useEffect(() => {
  if (isVisible && !comic.aiEnrichment) {
    enrichComic(comic);
  }
}, [isVisible]);
```

### Batch Processing

```typescript
// Process large imports efficiently

// Bad: Sequential (30 comics = 60 seconds)
for (const title of titles) {
  await enrichComic(title);
}

// Good: Parallel batches (30 comics = 20 seconds)
await aiEnrichment.enrichBatch(comics, {
  includeSignificance: true,
  includeStory: true
});
```

### Cost Optimization

```typescript
// Gemini API costs money - be strategic

// Only enrich on-demand
if (user.requestsEnrichment) {
  await aiEnrichment.enrichComic(comic);
}

// Cache aggressively
if (cached) return cached;

// Offer as premium feature
if (user.isPremium) {
  await autoEnrichAllComics();
}
```

## Testing

### Test Cases

```typescript
describe('AI Enrichment', () => {
  it('should detect first appearances', async () => {
    const comic = createTestComic('Amazing Fantasy #15');
    const enriched = await aiEnrichment.enrichComic({ comic });
    
    expect(enriched.aiEnrichment?.firstAppearances?.characters).toContain('Spider-Man');
    expect(enriched.aiEnrichment?.significance).toBe('major');
  });

  it('should mark must-read issues', async () => {
    const comic = createTestComic('Amazing Spider-Man #121');
    const enriched = await aiEnrichment.enrichComic({ comic });
    
    expect(enriched.aiEnrichment?.mustRead).toBe(true);
    expect(enriched.aiEnrichment?.significanceNotes).toContain('Gwen Stacy');
  });

  it('should identify filler issues', async () => {
    const comic = createTestComic('Amazing Spider-Man #583');
    const enriched = await aiEnrichment.enrichComic({ comic });
    
    expect(enriched.aiEnrichment?.canSkip).toBe(true);
    expect(enriched.aiEnrichment?.significance).toBe('filler');
  });
});
```

## UI Examples

### Library View with Badges

```tsx
<div className="comics-grid">
  {comics.map(comic => (
    <div key={comic.id} className="relative">
      <img src={comic.coverUrl} />
      
      {/* Significance badge */}
      <div className="absolute top-2 right-2">
        <SignificanceBadge comic={comic} />
      </div>

      {/* First appearance indicator */}
      {comic.aiEnrichment?.firstAppearances?.characters && (
        <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
          🎭 First Appearance
        </div>
      )}
    </div>
  ))}
</div>
```

### Detail View with Full Enrichment

```tsx
<div className="comic-detail">
  <h1>{comic.title}</h1>
  
  {comic.aiEnrichment && (
    <>
      {/* Significance section */}
      <div className="significance-section">
        <SignificanceBadge comic={comic} size="lg" />
        <p className="text-sm mt-2">
          {comic.aiEnrichment.significanceNotes}
        </p>
      </div>

      {/* Story summary */}
      <div className="story-section mt-6">
        <h3>Story Summary</h3>
        <p>{comic.aiEnrichment.spoilerFreeSummary}</p>
        <button onClick={() => showFullStory()}>
          Read Full Summary (Spoilers)
        </button>
      </div>

      {/* Key events */}
      {comic.aiEnrichment.keyEvents && (
        <div className="key-events mt-6">
          <h3>Key Events</h3>
          <ul>
            {comic.aiEnrichment.keyEvents.map(event => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )}
</div>
```

## Migration Strategy

### Enriching Existing Collection

```typescript
// Add "Enrich My Collection" feature

const enrichExistingCollection = async (comics: Comic[]) => {
  // Filter comics without enrichment
  const unenriched = comics.filter(c => !c.aiEnrichment);

  // Show progress UI
  setEnrichmentProgress({ current: 0, total: unenriched.length });

  // Process in batches
  for (let i = 0; i < unenriched.length; i += 5) {
    const batch = unenriched.slice(i, i + 5);
    const enriched = await aiEnrichment.enrichBatch(batch, {
      includeSignificance: true,
      includeStory: false // Faster, can add stories on-demand
    });

    // Update collection
    updateComics(enriched);
    
    setEnrichmentProgress({ current: i + batch.length, total: unenriched.length });

    // Rate limit delay
    await delay(3000);
  }

  showSuccess('Collection enriched!');
};
```

## Summary

This AI enrichment system transforms Continuity from a simple tracker into an intelligent comic companion that:

✅ **Knows every comic's story and significance**
✅ **Detects first appearances automatically**
✅ **Flags must-read vs skippable issues**
✅ **Provides context without spoilers**
✅ **Makes your collection searchable by story events**

**Key Benefits:**
- Users never wonder "is this important?"
- First appearances are automatically tagged
- Story arcs are contextualized
- Spoiler-free browsing with opt-in details
- Combines structured data + deep knowledge

**Estimated Development Time:** 8-12 hours

**This is what makes Continuity truly special** - no other comic tracker has this depth of knowledge.
