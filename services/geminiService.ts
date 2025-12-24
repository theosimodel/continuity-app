
import { GoogleGenAI, Type } from "@google/genai";
import { Comic } from "../types";

const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Fallback cover search using Open Library
export const searchOpenLibraryCover = async (title: string): Promise<string> => {
  try {
    const query = encodeURIComponent(title);
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
    const data = await response.json();
    if (data.docs?.[0]?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
    }
  } catch (e) {
    console.warn('Open Library cover search failed:', e);
  }
  return '';
};

export interface SearchResult {
  comics: Comic[];
  sources: { uri: string; title: string }[];
}

export const getComicRecommendations = async (favorites: Comic[]): Promise<Comic[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `Act as a comic book historian. Based on these favorites: ${favorites.map(f => f.title).join(', ')}, suggest 4 more essential runs or graphic novels. 
  Focus on diverse publishers and high-rated creative teams. Return as JSON array of objects.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              writer: { type: Type.STRING },
              artist: { type: Type.STRING },
              publisher: { type: Type.STRING },
              year: { type: Type.NUMBER },
              description: { type: Type.STRING }
            },
            required: ["title", "writer", "artist", "publisher", "year", "description"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((r: any, idx: number) => ({
      ...r,
      id: `ai-${Date.now()}-${idx}`,
      coverUrl: "" 
    }));
  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return [];
  }
};

export const generateComicCover = async (comic: Partial<Comic>): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `A professional, high-resolution comic book variant cover art for "${comic.title}" by ${comic.writer}. 
  Style: Modern illustrative comic art, no text, no title logos, focus on the characters and atmosphere: ${comic.description}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: prompt }],
      config: {
        imageConfig: {
          aspectRatio: "3:4",
        }
      },
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;

    if (!parts) {
      console.warn("Gemini Vision returned no content parts for cover generation.");
      return null;
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Critical: generateComicCover exception", error);
    return null;
  }
};

export const searchComicsWithGrounding = async (query: string): Promise<SearchResult> => {
  try {
    // Append "comic" to improve search relevance for comics/graphic novels
    const comicQuery = `${query} comic`;
    const encodedQuery = encodeURIComponent(comicQuery);
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodedQuery}&limit=20`
    );
    const data = await response.json();

    // Filter for comic-related results by checking subjects and format
    const comicKeywords = ['comic', 'comics', 'graphic novel', 'graphic novels', 'manga', 'superhero', 'sequential art'];

    const comics: Comic[] = await Promise.all(
      (data.docs || [])
        .filter((doc: any) => {
          if (!doc.title) return false;
          // Check if subject contains comic-related keywords
          const subjects = (doc.subject || []).map((s: string) => s.toLowerCase());
          const hasComicSubject = subjects.some((s: string) =>
            comicKeywords.some(keyword => s.includes(keyword))
          );
          // Also check title for comic indicators
          const titleLower = doc.title.toLowerCase();
          const hasComicTitle = comicKeywords.some(keyword => titleLower.includes(keyword)) ||
            titleLower.includes('vol') || titleLower.includes('issue') || titleLower.includes('#');
          return hasComicSubject || hasComicTitle || doc.cover_i; // Prefer results with covers
        })
        .slice(0, 8)
        .map(async (doc: any, idx: number) => {
          const coverId = doc.cover_i;
          const coverUrl = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : '';

          return {
            id: `search-${Date.now()}-${idx}`,
            title: doc.title || "Unknown Title",
            writer: doc.author_name?.[0] || "Unknown Writer",
            artist: doc.author_name?.[1] || doc.author_name?.[0] || "Unknown Artist",
            publisher: doc.publisher?.[0] || "Unknown Publisher",
            year: doc.first_publish_year || new Date().getFullYear(),
            description: doc.first_sentence?.[0] || `${doc.title} by ${doc.author_name?.[0] || 'Unknown'}`,
            coverUrl,
            readStates: []
          };
        })
    );

    const sources = [{
      uri: `https://openlibrary.org/search?q=${encodedQuery}`,
      title: 'Open Library Search'
    }];

    return { comics, sources };
  } catch (error) {
    console.error("Open Library Search Exception:", error);
    return { comics: [], sources: [] };
  }
};

export const analyzeScreen = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
          { text: "Analyze this screen capture of the Continuity web app. Provide a brief UX/UI audit and suggest one feature to improve comic discovery." }
        ]
      }
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    return "Analysis failed.";
  }
};
