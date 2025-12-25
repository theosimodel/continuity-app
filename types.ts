
export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED' | 'DROPPED';

// Design.md locked read states
export type ReadState = 'read' | 'owned' | 'want' | 'reread';

export interface Comic {
  id: string;
  title: string;
  writer: string;
  artist: string;
  publisher: string;
  year: number;
  description: string;
  coverUrl: string;
  rating?: number;
  isFavorite?: boolean;
  isGenerated?: boolean;
  readStates?: ReadState[];
  whereToRead?: string;  // Manual override for Where to Read text
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
