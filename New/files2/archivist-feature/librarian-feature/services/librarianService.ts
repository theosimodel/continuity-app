/**
 * Librarian AI Service
 * Handles conversations with the AI librarian using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/genai';
import { LibrarianContext, LibrarianMessage } from '../types/librarian';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export class LibrarianService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Librarian features will be limited.');
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
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
      ? `Currently reading: ${context.currentlyReading.map(c => c.series || c.title).join(', ')}`
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

Remember: You are The Archivist - you've preserved the history of every comic ever published, and you're using that vast knowledge to guide this specific reader on their personal journey through comics.`;
  }

  /**
   * Send a message to the librarian and get a response
   */
  async chat(
    userMessage: string,
    context: LibrarianContext,
    conversationHistory: LibrarianMessage[] = []
  ): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return "I'd love to help, but I need a Gemini API key to access the archives. Please add your API key to enable The Archivist!";
      }

      const systemPrompt = this.generateSystemPrompt(context);

      // Build conversation history for context
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Create chat with history
      const chat = this.model.startChat({
        history,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Add system context as first user message if no history
      const messageToSend = history.length === 0
        ? `${systemPrompt}\n\nUser: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(messageToSend);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Librarian chat error:', error);
      return "The archives are temporarily unavailable. Please try again in a moment.";
    }
  }

  /**
   * Get quick recommendations without conversation
   */
  async getRecommendations(context: LibrarianContext, query?: string): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return "API key required for recommendations.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const userQuery = query || "Based on what I've been reading, what should I read next?";

      const prompt = `${systemPrompt}\n\n${userQuery}\n\nProvide 3-5 specific comic recommendations with brief explanations of why they match the user's taste.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Recommendations error:', error);
      return "Unable to generate recommendations at the moment.";
    }
  }

  /**
   * Analyze reading gaps for a specific series
   */
  async analyzeSeriesGaps(
    seriesName: string,
    ownedIssues: string[],
    context: LibrarianContext
  ): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return "API key required for gap analysis.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const prompt = `${systemPrompt}\n\nThe user owns these issues of "${seriesName}": ${ownedIssues.join(', ')}.\n\nHelp them understand what they're missing and whether those gaps matter for the story. Be concise.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Gap analysis error:', error);
      return "Unable to analyze gaps right now.";
    }
  }

  /**
   * Generate a reading order for a story arc or event
   */
  async getReadingOrder(
    eventOrArc: string,
    userComics: string[],
    context: LibrarianContext
  ): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return "API key required for reading orders.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const userComicsInfo = userComics.length > 0
        ? `\n\nThe user owns: ${userComics.join(', ')}`
        : '';

      const prompt = `${systemPrompt}\n\nProvide a reading order for "${eventOrArc}".${userComicsInfo}\n\nFormat as a numbered list. Highlight which issues the user already owns. Keep it concise.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Reading order error:', error);
      return "Unable to generate reading order.";
    }
  }

  /**
   * Get stats summary with personality
   */
  async getStatsSummary(context: LibrarianContext): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return "API key required for stats summaries.";
      }

      const systemPrompt = this.generateSystemPrompt(context);
      const prompt = `${systemPrompt}\n\nGive the user a fun, personalized summary of their reading stats and patterns. Be encouraging and highlight interesting trends. Keep it to 2-3 short paragraphs.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();

    } catch (error) {
      console.error('Stats summary error:', error);
      return "Your reading journey is looking great! Keep it up!";
    }
  }
}

// Export singleton instance
export const librarianService = new LibrarianService();
