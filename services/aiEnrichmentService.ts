/**
 * AI Enrichment Service
 * Uses Google Gemini to analyze comics and provide rich metadata
 */

import { GoogleGenAI } from '@google/genai';
import { Comic, AIEnrichment } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class AIEnrichmentService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. AI enrichment will be unavailable.');
    } else {
      this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
  }

  /**
   * Build the enrichment prompt for a comic
   */
  private buildEnrichmentPrompt(comic: Comic): string {
    const title = comic.title;
    const credits = [comic.writer, comic.artist].filter(Boolean).join(', ');
    const year = comic.year || 'unknown year';
    const publisher = comic.publisher || 'unknown publisher';

    return `You are a comic book expert analyzing "${title}" by ${credits} (${publisher}, ${year}).

Provide a structured analysis in the following JSON format. Be factual and use your knowledge of comic book history:

{
  "storySummary": "2-3 sentence summary of what happens in this comic (may include spoilers)",
  "spoilerFreeSummary": "1 sentence overview safe for anyone who hasn't read it",
  "significance": "major" | "minor" | "filler",
  "significanceNotes": "Why this comic matters (first appearances, deaths, major events, cultural impact)",
  "keyEvents": ["event 1", "event 2"],
  "firstAppearances": {
    "characters": ["character names if any first appear here"],
    "items": ["item names if any first appear here"],
    "teams": ["team names if any first appear here"]
  },
  "mustRead": true/false,
  "canSkip": true/false
}

IMPORTANT RULES:
1. If you don't know specific details about this comic, make reasonable inferences based on the title, creator, and era
2. Be factual and concise - no marketing language
3. Mark significance as "major" only for truly important comics (first appearances of major characters, landmark storylines, deaths of major characters, award winners)
4. Mark significance as "filler" for tie-ins, fill-in issues, or inconsequential stories
5. Only mark mustRead if truly essential to the character/series canon
6. Only mark canSkip if it's clearly filler or skippable
7. If this is a collected edition/trade paperback, analyze the overall story arc
8. Leave firstAppearances arrays empty if no notable firsts occur
9. For keyEvents, be SPECIFIC and EVOCATIVE - include character names, locations, and vivid details that capture what makes the scene memorable. Avoid bland descriptions. Write like a fan describing their favorite moment, not a plot summary. Example: "Hulk tears through a gas station at night, horrifically dispatching armed robbers in a scene that establishes the run's horror tone" not "Hulk emerges and kills robbers"

Return ONLY the JSON, no additional text or markdown formatting.`;
  }

  /**
   * Parse the AI response into structured enrichment data
   */
  private parseEnrichmentResponse(response: string): AIEnrichment | null {
    try {
      // Remove markdown code blocks if present
      const cleaned = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const data = JSON.parse(cleaned);

      // Validate and structure the response
      const enrichment: AIEnrichment = {
        storySummary: data.storySummary || undefined,
        spoilerFreeSummary: data.spoilerFreeSummary || undefined,
        significance: ['major', 'minor', 'filler'].includes(data.significance)
          ? data.significance
          : 'minor',
        significanceNotes: data.significanceNotes || undefined,
        keyEvents: Array.isArray(data.keyEvents) ? data.keyEvents.filter(Boolean) : undefined,
        firstAppearances: data.firstAppearances ? {
          characters: Array.isArray(data.firstAppearances.characters)
            ? data.firstAppearances.characters.filter(Boolean)
            : undefined,
          items: Array.isArray(data.firstAppearances.items)
            ? data.firstAppearances.items.filter(Boolean)
            : undefined,
          teams: Array.isArray(data.firstAppearances.teams)
            ? data.firstAppearances.teams.filter(Boolean)
            : undefined,
        } : undefined,
        mustRead: Boolean(data.mustRead),
        canSkip: Boolean(data.canSkip),
        enrichedAt: Date.now(),
        confidence: this.calculateConfidence(data),
      };

      // Clean up empty arrays in firstAppearances
      if (enrichment.firstAppearances) {
        if (!enrichment.firstAppearances.characters?.length) delete enrichment.firstAppearances.characters;
        if (!enrichment.firstAppearances.items?.length) delete enrichment.firstAppearances.items;
        if (!enrichment.firstAppearances.teams?.length) delete enrichment.firstAppearances.teams;

        // Remove firstAppearances entirely if empty
        if (Object.keys(enrichment.firstAppearances).length === 0) {
          delete enrichment.firstAppearances;
        }
      }

      // Clean up empty keyEvents
      if (!enrichment.keyEvents?.length) {
        delete enrichment.keyEvents;
      }

      return enrichment;
    } catch (error) {
      console.error('Failed to parse enrichment response:', error);
      return null;
    }
  }

  /**
   * Calculate confidence score based on completeness
   */
  private calculateConfidence(data: any): number {
    let score = 0;
    const fields = ['storySummary', 'spoilerFreeSummary', 'significanceNotes'];

    fields.forEach(field => {
      if (data[field] && typeof data[field] === 'string' && data[field].length > 10) {
        score += 0.25;
      }
    });

    // Bonus for having first appearances or key events
    if (data.keyEvents?.length > 0) score += 0.15;
    if (data.firstAppearances?.characters?.length > 0) score += 0.1;

    return Math.min(score, 1);
  }

  /**
   * Enrich a comic with AI-generated metadata
   */
  async enrichComic(comic: Comic): Promise<AIEnrichment | null> {
    try {
      if (!this.ai) {
        console.warn('AI enrichment unavailable - no API key');
        return null;
      }

      const prompt = this.buildEnrichmentPrompt(comic);

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          temperature: 0.3, // Lower temperature for more factual responses
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      const text = response.text;
      if (!text) {
        console.error('Empty response from AI');
        return null;
      }

      return this.parseEnrichmentResponse(text);
    } catch (error) {
      console.error('AI enrichment error:', error);
      return null;
    }
  }

  /**
   * Check if AI enrichment is available
   */
  isAvailable(): boolean {
    return this.ai !== null;
  }
}

// Export singleton instance
export const aiEnrichmentService = new AIEnrichmentService();
