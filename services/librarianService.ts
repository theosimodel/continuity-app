/**
 * Librarian AI Service
 * Handles conversations with The Archivist using Google Gemini
 */

import { GoogleGenAI } from '@google/genai';
import { LibrarianContext, LibrarianMessage, ArchivistRecommendation, ParsedArchivistResponse } from '../types/librarian';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class LibrarianService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Archivist features will be limited.');
    } else {
      this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
  }

  /**
   * Generate a system prompt based on user context
   */
  private generateSystemPrompt(context: LibrarianContext): string {
    const recentReadsInfo = context.recentReads && context.recentReads.length > 0
      ? `Recent reads: ${context.recentReads.map(c => `"${c.title}" by ${c.writer || 'Unknown'}`).join(', ')}`
      : '';

    const favoriteCreatorsInfo = context.favoriteCreators && context.favoriteCreators.length > 0
      ? `Favorite creators: ${context.favoriteCreators.join(', ')}`
      : '';

    const currentlyReadingInfo = context.currentlyReading && context.currentlyReading.length > 0
      ? `Currently reading: ${context.currentlyReading.map(c => c.title).join(', ')}`
      : '';

    const topRatedInfo = context.topRatedSeries && context.topRatedSeries.length > 0
      ? `Top-rated series: ${context.topRatedSeries.join(', ')}`
      : '';

    const statsInfo = context.readingStats
      ? `Stats: ${context.readingStats.totalIssuesRead} issues read, ${context.readingStats.averageRating} avg rating`
      : '';

    return `You are The Archivist, the keeper of all comic book knowledge and this user's personal guide through the world of comics.

Your role is to help users discover comics, track their reading, and get personalized recommendations based on their taste. You have cataloged every comic in existence and remember everything about this user's collection.

**User Context:**
- Collection size: ${context.collectionSize || 0} comics
${recentReadsInfo ? `- ${recentReadsInfo}` : ''}
${favoriteCreatorsInfo ? `- ${favoriteCreatorsInfo}` : ''}
${currentlyReadingInfo ? `- ${currentlyReadingInfo}` : ''}
${topRatedInfo ? `- ${topRatedInfo}` : ''}
${statsInfo ? `- ${statsInfo}` : ''}

**Guidelines:**
1. Be conversational, knowledgeable, and passionate about comics
2. Reference specific comics the user has read when making recommendations
3. Explain WHY you're recommending something based on their history
4. Keep responses concise but informative (2-3 paragraphs max unless asked for more)
5. Use the user's reading history to personalize every response
6. If you notice patterns (e.g., they love a specific creator), mention it naturally
7. Format responses in markdown when helpful (bold titles, lists for multiple recommendations)
8. When recommending comics, include writer/artist info when relevant
9. Be honest if you don't have enough context - ask clarifying questions
10. Celebrate their reading achievements and streaks

**Tone:**
- Wise but approachable (like a guardian of knowledge who loves to share)
- Personal and warm (you remember every comic they've read)
- Knowledgeable but not condescending
- Enthusiastic about great comics
- Supportive of all reading preferences

**IMPORTANT - Structured Recommendations:**
When you recommend specific comics, you MUST include a structured JSON block at the end of your response so the user can easily add them to their collection. Format:

RECOMMENDATIONS:
{"comics": [{"title": "Comic Title", "writer": "Writer Name", "artist": "Artist Name", "publisher": "Publisher", "year": 2020}]}

Example response:
"Based on your love of Saga, I'd recommend **Y: The Last Man** by Brian K. Vaughan - it has that same blend of character-driven storytelling and apocalyptic stakes that made Saga so compelling.

RECOMMENDATIONS:
{"comics": [{"title": "Y: The Last Man", "writer": "Brian K. Vaughan", "artist": "Pia Guerra", "publisher": "Vertigo", "year": 2002}]}"

Only include the RECOMMENDATIONS block when suggesting specific comics to read. For general conversation or questions, omit it.

Remember: You are The Archivist - you've preserved the history of every comic ever published, and you're using that vast knowledge to guide this specific reader on their personal journey through comics.`;
  }

  /**
   * Send a message to the archivist and get a response
   */
  async chat(
    userMessage: string,
    context: LibrarianContext,
    conversationHistory: LibrarianMessage[] = []
  ): Promise<string> {
    try {
      if (!this.ai) {
        return "I'd love to help, but I need a Gemini API key to access the archives. Please add your API key to enable The Archivist!";
      }

      const systemPrompt = this.generateSystemPrompt(context);

      // Build conversation as a single prompt with history
      let fullPrompt = systemPrompt + '\n\n';

      for (const msg of conversationHistory) {
        const role = msg.role === 'user' ? 'User' : 'Archivist';
        fullPrompt += `${role}: ${msg.content}\n\n`;
      }

      fullPrompt += `User: ${userMessage}\n\nArchivist:`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
        config: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      return response.text || "The archives are momentarily silent...";

    } catch (error) {
      console.error('Archivist chat error:', error);
      return "The archives are temporarily unavailable. Please try again in a moment.";
    }
  }

  /**
   * Get quick recommendations without conversation
   */
  async getRecommendations(context: LibrarianContext, query?: string): Promise<string> {
    try {
      if (!this.ai) {
        return "API key required for recommendations.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const userQuery = query || "Based on what I've been reading, what should I read next?";

      const prompt = `${systemPrompt}\n\n${userQuery}\n\nProvide 3-5 specific comic recommendations with brief explanations of why they match the user's taste.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      return response.text || "Unable to generate recommendations at the moment.";

    } catch (error) {
      console.error('Recommendations error:', error);
      return "Unable to generate recommendations at the moment.";
    }
  }

  /**
   * Get stats summary with personality
   */
  async getStatsSummary(context: LibrarianContext): Promise<string> {
    try {
      if (!this.ai) {
        return "API key required for stats summaries.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const prompt = `${systemPrompt}\n\nGive the user a fun, personalized summary of their reading stats and patterns. Be encouraging and highlight interesting trends. Keep it to 2-3 short paragraphs.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      return response.text || "Your reading journey is looking great! Keep it up!";

    } catch (error) {
      console.error('Stats summary error:', error);
      return "Your reading journey is looking great! Keep it up!";
    }
  }
}

// Export singleton instance
export const librarianService = new LibrarianService();

/**
 * Parse Archivist response to extract structured recommendations
 */
export function parseArchivistResponse(response: string): ParsedArchivistResponse {
  // Split on RECOMMENDATIONS: to get message and JSON parts
  const parts = response.split('RECOMMENDATIONS:');
  const message = parts[0].trim();

  let recommendations: ArchivistRecommendation[] = [];

  if (parts.length > 1) {
    const jsonPart = parts[1].trim();

    try {
      // Try to find and parse the JSON object
      const jsonMatch = jsonPart.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.comics && Array.isArray(data.comics)) {
          recommendations = data.comics.map((comic: any) => ({
            title: comic.title || '',
            series: comic.series,
            writer: comic.writer,
            artist: comic.artist,
            publisher: comic.publisher,
            year: comic.year ? Number(comic.year) : undefined,
            coverUrl: comic.coverUrl,
            comicVineId: comic.comicVineId,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse Archivist recommendations JSON:', e);
    }
  }

  return { message, recommendations };
}
