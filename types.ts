
export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED' | 'DROPPED';

// Design.md locked read states
export type ReadState = 'read' | 'owned' | 'want' | 'reread';

// AI Enrichment data structure
export interface AIEnrichment {
  storySummary?: string;
  spoilerFreeSummary?: string;
  significance?: 'major' | 'minor' | 'filler';
  significanceNotes?: string;
  keyEvents?: string[];
  firstAppearances?: {
    characters?: string[];
    items?: string[];
    teams?: string[];
  };
  mustRead?: boolean;
  canSkip?: boolean;
  enrichedAt?: number;
  confidence?: number;
}

export interface Comic {
  id: string;
  title: string;
  writer: string;
  artist: string;
  publisher: string;
  volume?: string;
  year: number;
  description: string;
  coverUrl: string;
  rating?: number;
  review?: string;  // User's personal note about the comic
  isFavorite?: boolean;
  isGenerated?: boolean;
  readStates?: ReadState[];
  whereToRead?: string;  // Manual override for Where to Read text
  aiEnrichment?: AIEnrichment;
}

export interface Review {
  id: string;
  comicId: string;
  userId: string;
  rating: number; // 0.5 to 5.0
  text: string;
  dateRead: string;
  likes: number;
  containsSpoilers: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  stats: {
    totalRead: number;
    thisYear: number;
    lists: number;
  };
}

export interface JournalEntry extends Review {
  comic: Comic;
}

// Lists feature
export type ListVisibility = 'private' | 'unlisted' | 'public';

export interface List {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  visibility: ListVisibility;
  created_at: string;
  updated_at: string;
  // Fork attribution
  forked_from_list_id?: string;
  original_curator_id?: string;
  original_curator_username?: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  comic_id: string;
  sort_order: number;
  added_at: string;
}

export interface ListWithComics extends List {
  items: ListItem[];
  comics: Comic[];
}
