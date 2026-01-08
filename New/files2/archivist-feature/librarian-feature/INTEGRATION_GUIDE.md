# The Archivist - Integration Guide

## Overview
This guide will help you integrate The Archivist feature into your existing Continuity app.

## File Structure

Add these files to your Continuity project:

```
continuity/
├── src/
│   ├── types/
│   │   └── librarian.ts              # NEW - Librarian type definitions
│   ├── utils/
│   │   └── contextBuilder.ts         # NEW - User context builder
│   ├── services/
│   │   ├── librarianService.ts       # NEW - Gemini AI integration
│   │   └── librarianStorage.ts       # NEW - localStorage for conversations
│   ├── components/
│   │   ├── LibrarianChat.tsx         # NEW - Main chat interface
│   │   └── QuickSuggestions.tsx      # NEW - Quick question buttons
│   └── pages/
│       └── LibrarianPage.tsx         # NEW - Full librarian page
```

## Step-by-Step Integration

### 1. Copy Files

Copy all the files from the `librarian-feature` folder into your project:

```bash
# Assuming you're in your continuity project root
cp -r librarian-feature/types/* src/types/
cp -r librarian-feature/utils/* src/utils/
cp -r librarian-feature/services/* src/services/
cp -r librarian-feature/components/* src/components/
cp -r librarian-feature/pages/* src/pages/
```

### 2. Update Your App Router

In your `App.tsx`, add The Archivist route:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibrarianPage from './pages/LibrarianPage';

function App() {
  const [comics, setComics] = useState<Comic[]>([]);
  
  // ... your existing code ...

  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        
        {/* NEW: The Archivist route */}
        <Route 
          path="/archivist" 
          element={<LibrarianPage comics={comics} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. Add Navigation Link

In your `Navbar.tsx`, add a link to The Archivist:

```tsx
import { Sparkles } from 'lucide-react';

// Inside your navigation links:
<Link 
  to="/archivist"
  className="flex items-center gap-2 hover:text-purple-400 transition-colors"
>
  <Sparkles className="w-5 h-5" />
  The Archivist
</Link>
```

### 4. Verify Dependencies

Make sure you have these packages installed:

```bash
npm install @google/genai lucide-react
```

Your `package.json` should already have:
- `react` ^19.0.0
- `react-router-dom` ^7.0.0
- `lucide-react` (for icons)
- `@google/genai` (for AI features)

### 5. Environment Variables

Make sure your `.env.local` has the Gemini API key:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage Examples

### Basic Usage (Full Page)

```tsx
// In App.tsx or wherever you manage routes
<Route 
  path="/librarian" 
  element={<LibrarianPage comics={comics} />} 
/>
```

### Embedded Chat (Sidebar)

```tsx
import { LibrarianChat } from './components/LibrarianChat';

function MyComponent() {
  const { comics } = useComics(); // Your comics state

  return (
    <div className="flex">
      <main className="flex-1">
        {/* Your main content */}
      </main>
      
      <aside className="w-96 h-screen sticky top-0">
        <LibrarianChat comics={comics} className="h-full" />
      </aside>
    </div>
  );
}
```

### Quick Suggestions Only

```tsx
import { QuickSuggestions } from './components/QuickSuggestions';

function Dashboard() {
  const { comics } = useComics();
  
  const handleSuggestion = (query: string) => {
    // Navigate to librarian with pre-filled query
    navigate(`/librarian?q=${encodeURIComponent(query)}`);
  };

  return (
    <QuickSuggestions 
      onSuggestionClick={handleSuggestion}
      hasReadHistory={comics.some(c => c.dateRead)}
    />
  );
}
```

## Type Compatibility

If your existing `Comic` type is different from the one in `types/librarian.ts`, you have two options:

### Option 1: Extend Your Type
Add the missing fields to your existing Comic type:

```typescript
// In your existing types.ts
export interface Comic {
  // Your existing fields...
  
  // Add these if missing:
  series?: string;
  dateRead?: number;
  isOwned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}
```

### Option 2: Create Adapter
Create an adapter function:

```typescript
// utils/librarianAdapter.ts
import { Comic as LibrarianComic } from '../types/librarian';
import { Comic as AppComic } from '../types';

export function toLibrarianComic(comic: AppComic): LibrarianComic {
  return {
    ...comic,
    series: comic.series || comic.title,
    dateRead: comic.dateRead || undefined,
    isOwned: comic.isOwned || false,
    isFavorite: comic.isFavorite || false,
  };
}
```

## localStorage Keys

The Librarian feature uses these localStorage keys:
- `continuity_librarian_conversations` - Saved conversations
- `continuity_librarian_active` - Active conversation ID
- `continuity_librarian_preferences` - User preferences (future use)

These won't conflict with your existing Continuity localStorage keys.

## Features Available

✅ **Chat Interface** - Full conversational AI
✅ **Quick Suggestions** - One-click common questions
✅ **Context Awareness** - Knows user's reading history
✅ **Conversation History** - Saves all chats locally
✅ **Stats Summary** - Personalized reading insights
✅ **Recommendations** - Based on taste
✅ **Reading Orders** - For events/arcs
✅ **Gap Analysis** - Find missing issues

## Customization

### Change Colors
Edit the Tailwind classes in components:
- Primary: `text-green-400`, `bg-green-600`
- Backgrounds: `bg-gray-800`, `bg-gray-900`

### Modify System Prompt
Edit `services/librarianService.ts` → `generateSystemPrompt()` method

### Add Custom Suggestions
Edit `components/QuickSuggestions.tsx` → `suggestions` array

## Testing

1. **Navigate to `/archivist`** - Should see the full page
2. **Ask a question** - "What should I read next?"
3. **Check localStorage** - Open DevTools → Application → Local Storage
4. **Verify context** - Ask "What have I been reading?" to test context awareness

## Troubleshooting

**"API key required"**
- Make sure `VITE_GEMINI_API_KEY` is set in `.env.local`
- Restart dev server after adding

**"Cannot read properties of undefined"**
- Check that `comics` prop is being passed correctly
- Verify Comic type matches expected structure

**Styles not working**
- Make sure Tailwind is configured
- Check `tailwind.config.js` includes component paths

**Messages not saving**
- Check browser console for localStorage errors
- Try clearing localStorage and starting fresh

## Next Steps

After basic integration:
1. Add voice input support
2. Implement export conversation feature
3. Add conversation search
4. Create notification system for new suggestions
5. Build analytics dashboard

## Need Help?

Common issues:
- Type mismatches → Use adapter pattern
- Styling conflicts → Wrap in isolated container with specific classes
- State management → Consider using Context API for comics data

---

You're ready to go! The Archivist is fully self-contained and should work immediately after copying the files and adding the route.
