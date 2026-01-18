import { Comic } from '../types';

const API_KEY = import.meta.env.VITE_COMICVINE_API_KEY || '';
const BASE_URL = 'https://comicvine.gamespot.com/api';

interface ComicVineIssue {
  id: number;
  name: string | null;
  issue_number: string | null;
  volume: {
    id: number;
    name: string;
  };
  image: {
    original_url: string;
    medium_url: string;
    small_url: string;
  } | null;
  cover_date: string | null;
  description: string | null;
  person_credits: {
    id: number;
    name: string;
    role: string;
  }[];
}

interface ComicVineResponse {
  error: string;
  results: ComicVineIssue[];
}

export const searchComics = async (query: string): Promise<Comic[]> => {
  try {
    // Use a CORS proxy for browser requests
    const proxyUrl = 'https://corsproxy.io/?';
    // Request specific fields including person_credits for writer/artist data
    const fieldList = 'id,name,issue_number,volume,image,cover_date,description,person_credits';
    const searchUrl = `${BASE_URL}/search/?api_key=${API_KEY}&format=json&resources=issue&query=${encodeURIComponent(query)}&limit=30&field_list=${fieldList}`;

    const response = await fetch(proxyUrl + encodeURIComponent(searchUrl));

    if (!response.ok) {
      throw new Error(`ComicVine API error: ${response.status}`);
    }

    const data: ComicVineResponse = await response.json();

    if (data.error !== 'OK') {
      throw new Error(`ComicVine error: ${data.error}`);
    }

    return data.results
      .filter(issue => issue.image?.medium_url)
      .map((issue): Comic => {
        // Extract writer and artist from person_credits
        const credits = issue.person_credits || [];

        const writerCredit = credits.find(p => {
          const role = p.role?.toLowerCase() || '';
          return role.includes('writer') || role.includes('script');
        });
        const writer = writerCredit?.name || '';

        const artistCredit = credits.find(p => {
          const role = p.role?.toLowerCase() || '';
          return role.includes('artist') || role.includes('penciler') ||
                 role.includes('penciller') || role.includes('illustrator');
        });
        const artist = artistCredit?.name || '';

        // Build title from volume name and issue number
        const issueNum = issue.issue_number ? ` #${issue.issue_number}` : '';
        const title = `${issue.volume.name}${issueNum}`;

        // Extract year from cover_date
        const year = issue.cover_date
          ? parseInt(issue.cover_date.split('-')[0])
          : new Date().getFullYear();

        // Clean description (remove HTML tags) - keep full text
        const description = issue.description
          ? issue.description.replace(/<[^>]*>/g, '').trim()
          : `${issue.volume.name} issue ${issue.issue_number || ''}`;

        return {
          id: `cv-${issue.id}`,
          title,
          writer,
          artist,
          publisher: '', // ComicVine doesn't include publisher in search results
          year,
          description,
          coverUrl: issue.image?.medium_url || '',
          readStates: []
        };
      });
  } catch (error) {
    console.error('ComicVine search error:', error);
    return [];
  }
};
