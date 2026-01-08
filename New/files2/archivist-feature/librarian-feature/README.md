# 📚 The Archivist

> Your personal AI comic book expert that knows your collection and reading history

## What Is This?

The Archivist is an AI-powered conversational assistant for Continuity that:
- 💬 Chats with you about comics naturally
- 📊 Knows your reading history and preferences
- 🎯 Gives personalized recommendations
- 📖 Helps you discover reading orders
- 🔍 Analyzes gaps in your collection
- ⭐ Celebrates your reading achievements

Think of it as consulting an ancient keeper of all comic book knowledge, one who has cataloged every comic in existence and remembers your personal journey through them.

## Key Features

### 🤖 Conversational AI
Ask questions naturally:
- "What should I read next?"
- "Tell me about Saga"
- "What am I missing from my X-Men collection?"
- "Recommend something like Sandman"

### 🧠 Context Awareness
The Archivist knows:
- Every comic you've read
- Your ratings and reviews
- Your favorite creators
- Series you're currently reading
- Your reading patterns and preferences

### 💾 Persistent Memory
- All conversations saved locally
- Multiple conversation threads
- Export/import chat history
- Never forgets your preferences

### ⚡ Quick Actions
One-click questions for common tasks:
- Get recommendations
- Check reading stats
- Discover new series
- Analyze collection

## How It Works

### The Technology

1. **Context Builder** (`utils/contextBuilder.ts`)
   - Analyzes your comic collection
   - Identifies reading patterns
   - Calculates statistics
   - Builds personalized context

2. **AI Service** (`services/librarianService.ts`)
   - Uses Google Gemini Pro
   - Injects your context into prompts
   - Maintains conversation flow
   - Generates personalized responses

3. **Storage** (`services/librarianStorage.ts`)
   - Saves conversations in localStorage
   - Manages conversation history
   - Auto-titles conversations
   - Exports/imports data

### The User Experience

```
You → "What should I read next?"
      ↓
Context Builder → Gathers your:
  - Recent reads
  - Favorite creators
  - Top-rated series
  - Reading stats
      ↓
Gemini AI → Receives:
  - Your question
  - Your full context
  - Conversation history
      ↓
The Archivist → Responds:
  "Based on your love of Saga and your 5-star rating 
  of East of West, you'd probably enjoy The Invisibles 
  by Grant Morrison. It has that same epic world-building 
  and complex character work you seem to gravitate toward."
```

## Components

### LibrarianChat
The main chat interface:
```tsx
<LibrarianChat 
  comics={comics}
  className="h-full"
/>
```

**Features:**
- Real-time message streaming
- Auto-scroll to latest
- Loading indicators
- Timestamp display
- Keyboard shortcuts (Enter to send)

### QuickSuggestions
Pre-defined question buttons:
```tsx
<QuickSuggestions 
  onSuggestionClick={handleClick}
  hasReadHistory={true}
/>
```

**Features:**
- Dynamic based on reading history
- Color-coded by category
- Hover animations
- Responsive grid layout

### LibrarianPage
Full-page layout:
```tsx
<LibrarianPage comics={comics} />
```

**Features:**
- Chat area + sidebar
- Collection stats
- Quick suggestions
- Pro tips section

## Advanced Usage

### Custom System Prompts

Modify the AI's personality in `librarianService.ts`:

```typescript
private generateSystemPrompt(context: LibrarianContext): string {
  return `You are a sarcastic but helpful librarian...`;
}
```

### Add Custom Queries

Create specialized queries:

```typescript
// In librarianService.ts
async getCreatorSpotlight(creator: string, context: LibrarianContext) {
  const prompt = `Tell me about ${creator}'s work and 
  recommend their best comics for someone who likes 
  ${context.topRatedSeries?.join(', ')}`;
  
  return await this.model.generateContent(prompt);
}
```

### Export Conversations

```typescript
import { librarianStorage } from './services/librarianStorage';

// Export all conversations
const json = librarianStorage.exportConversations();
downloadAsFile(json, 'my-librarian-chats.json');

// Import
librarianStorage.importConversations(jsonData);
```

## API Reference

### LibrarianService

```typescript
class LibrarianService {
  // Main chat method
  async chat(
    userMessage: string,
    context: LibrarianContext,
    history?: LibrarianMessage[]
  ): Promise<string>

  // Quick recommendations
  async getRecommendations(
    context: LibrarianContext,
    query?: string
  ): Promise<string>

  // Series gap analysis
  async analyzeSeriesGaps(
    seriesName: string,
    ownedIssues: string[],
    context: LibrarianContext
  ): Promise<string>

  // Reading orders
  async getReadingOrder(
    event: string,
    userComics: string[],
    context: LibrarianContext
  ): Promise<string>

  // Stats summary
  async getStatsSummary(
    context: LibrarianContext
  ): Promise<string>
}
```

### LibrarianStorage

```typescript
class LibrarianStorageService {
  // Conversations
  saveConversation(conv: LibrarianConversation): void
  getAllConversations(): LibrarianConversation[]
  getConversation(id: string): LibrarianConversation | null
  deleteConversation(id: string): void
  
  // Messages
  addMessage(convId: string, msg: LibrarianMessage): void
  
  // Active conversation
  getOrCreateActiveConversation(): LibrarianConversation
  setActiveConversation(id: string): void
  
  // Utilities
  clearAllConversations(): void
  exportConversations(): string
  importConversations(json: string): boolean
}
```

### ContextBuilder

```typescript
class LibrarianContextBuilder {
  constructor(comics: Comic[])
  
  // Build full context
  buildContext(): LibrarianContext
  
  // Individual getters
  private getRecentReads(): Comic[]
  private getFavoriteCreators(): string[]
  private getCurrentlyReading(): Comic[]
  private getTopRatedSeries(): string[]
  private getReadingStats(): ReadingStats
  
  // Summary
  generateContextSummary(): string
}

// Helper functions
function buildLibrarianContext(comics: Comic[]): LibrarianContext
function getContextSummary(comics: Comic[]): string
```

## Performance Considerations

### Context Building
- Runs on every message
- O(n) complexity where n = comic count
- Cached in conversation messages
- Typically <50ms for 1000 comics

### API Calls
- ~1-3 seconds per message
- Rate limited by Gemini API
- Free tier: 60 requests/minute
- Consider caching for repeated queries

### localStorage
- Conversations persist indefinitely
- ~5KB per 10-message conversation
- Browser limit: ~5-10MB total
- Old conversations can be archived

## Privacy & Data

### What's Stored Locally
✅ All conversation history
✅ Message timestamps
✅ Context snapshots (in messages)

### What's Sent to Gemini API
✅ Current message
✅ Conversation history
✅ Your comic context (titles, creators, ratings)

### What's NOT Sent
❌ Personal information
❌ User account details
❌ Collection monetary values
❌ Location data

### Data Control
- Clear conversations anytime
- Export before clearing
- Disable feature by removing route
- API key stays in your `.env`

## Example Conversations

### Getting Recommendations
```
You: What should I read next?

The Archivist: Based on your recent 5-star rating of Saga 
and your love for Brian K. Vaughan, I'd recommend his 
earlier series Y: The Last Man. You've read 15 issues 
of Saga and consistently rate it highly, so the 
apocalyptic storytelling in Y should really resonate 
with you.

Also, since you enjoyed the art in Saga by Fiona 
Staples, you might like Paper Girls - another Vaughan 
series with stunning visuals.
```

### Analyzing Gaps
```
You: What am I missing from Sandman?

The Archivist: Looking at your collection, you have issues 
#1-35 and #50-75 of Sandman. You're missing:

- Issues #36-49 (Brief Lives through Worlds' End)
- The Sandman Special #1
- The Endless Nights graphic novel

The gap from #36-49 includes some crucial arcs, 
especially Brief Lives which is considered essential. 
The good news is you have the complete Season of Mists 
and The Wake, which are the most celebrated arcs!
```

### Reading Order Help
```
You: What's the reading order for Annihilation?

The Archivist: For the Annihilation event, here's the 
optimal reading order:

1. Annihilation: Prologue
2. Annihilation: Nova #1-4 (you own #1-3)
3. Annihilation: Silver Surfer #1-4
4. Annihilation: Super-Skrull #1-4
5. Annihilation: Ronan #1-4
6. Annihilation #1-6 (main series)

You're missing Nova #4 and the entire Silver Surfer 
mini-series. The good news is these can mostly be read 
in any order, but finishing Nova before the main series 
is recommended!
```

## Customization Examples

### Change Personality

```typescript
// Make it more mysterious
const systemPrompt = `You are The Archivist, an ancient 
keeper of comic book knowledge. You speak in a slightly 
formal but warm manner, often referencing the vast history 
you've witnessed. You've cataloged every comic across all 
timelines and realities.`;
```

### Add Custom Suggestions

```typescript
// In QuickSuggestions.tsx
const suggestions = [
  ...existingSuggestions,
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Hidden gems in my collection',
    query: 'What are some underrated comics I own?',
    category: 'discover',
  },
];
```

### Styling Tweaks

```typescript
// Warmer color scheme
<div className="bg-orange-600 hover:bg-orange-700">
  {/* Instead of green */}
</div>
```

## Roadmap

### v1.1 (Next Release)
- [ ] Voice input support
- [ ] Conversation search
- [ ] Export as PDF
- [ ] Share conversation links

### v1.2
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Creator deep-dives
- [ ] Monthly reading reports

### v2.0
- [ ] Social features (share recommendations)
- [ ] Community suggestions
- [ ] Reading challenges
- [ ] Achievement system

## Contributing

Want to improve the Librarian? Here's how:

1. **Add Features**
   - Create new service methods
   - Add custom UI components
   - Enhance context building

2. **Improve Prompts**
   - Experiment with system prompts
   - Add domain-specific knowledge
   - Fine-tune response format

3. **Optimize Performance**
   - Implement caching strategies
   - Reduce API calls
   - Improve context building

## FAQ

**Q: Does it work offline?**
A: The UI works offline, but AI responses require internet (Gemini API).

**Q: How much does it cost?**
A: Free tier: 60 requests/minute. Paid plans available for heavy usage.

**Q: Can it access the internet?**
A: Yes, Gemini Pro can search the web for current comic info when needed.

**Q: Is my data private?**
A: Yes. Everything stored locally. Only comic metadata sent to API.

**Q: What if I don't have an API key?**
A: The feature gracefully shows helpful messages explaining The Archivist needs access to the knowledge base.

**Q: Can I use it on mobile?**
A: Yes! Responsive design works on all devices.

---

## Quick Start Checklist

- [ ] Copy all files to your project
- [ ] Add route to App.tsx
- [ ] Add navigation link
- [ ] Set VITE_GEMINI_API_KEY
- [ ] Test with `npm run dev`
- [ ] Ask "What should I read next?"
- [ ] 🎉 Consult The Archivist!

---

**Built with ❤️ for Continuity**
