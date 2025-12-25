import { Comic } from '../types';

const API_KEY = 'a73ccafe821c2bc5828f001c9ac21a3d25bb41ed';
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
    const searchUrl = `${BASE_URL}/search/?api_key=${API_KEY}&format=json&resources=issue&query=${encodeURIComponent(query)}&limit=12`;

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
        const writer = issue.person_credits?.find(p =>
          p.role.toLowerCase().includes('writer')
        )?.name || 'Unknown';

        const artist = issue.person_credits?.find(p =>
          p.role.toLowerCase().includes('artist') ||
          p.role.toLowerCase().includes('penciler')
        )?.name || 'Unknown';

        // Build title from volume name and issue number
        const issueNum = issue.issue_number ? ` #${issue.issue_number}` : '';
        const title = `${issue.volume.name}${issueNum}`;

        // Extract year from cover_date
        const year = issue.cover_date
          ? parseInt(issue.cover_date.split('-')[0])
          : new Date().getFullYear();

        // Clean description (remove HTML tags)
        const description = issue.description
          ? issue.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
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
