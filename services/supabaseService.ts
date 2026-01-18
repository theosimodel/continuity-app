/**
 * Supabase Service - Auth & Database Integration
 */

import { createClient, User, Session } from '@supabase/supabase-js';
import { Comic, ReadState, List, ListItem, ListVisibility, AIEnrichment } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// ============================================
// AUTH
// ============================================

export interface AuthError {
  message: string;
}

export const signUp = async (
  email: string,
  password: string,
  username: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  // Sign up with username in metadata (trigger will use this for profile)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  // Profile is created automatically by database trigger
  return { user: data.user, error: null };
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  return { user: data.user, error: null };
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const onAuthStateChange = (
  callback: (user: User | null, event?: string) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, event);
  });
};

export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/reset-password`,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
};

export const updatePassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
};

// ============================================
// PROFILES
// ============================================

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  is_admin?: boolean;
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
    });

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
};

// ============================================
// COMICS
// ============================================

export const fetchComics = async (): Promise<Comic[]> => {
  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comics:', error);
    return [];
  }

  return data.map(mapDbToComic);
};

export const fetchComicById = async (id: string): Promise<Comic | null> => {
  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching comic:', error);
    return null;
  }

  return mapDbToComic(data);
};

export const fetchComicsByIds = async (ids: string[]): Promise<Map<string, Comic>> => {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching comics by IDs:', error);
    return new Map();
  }

  const map = new Map<string, Comic>();
  data.forEach(row => {
    map.set(row.id, mapDbToComic(row));
  });
  return map;
};

export const upsertComic = async (comic: Comic): Promise<Comic | null> => {
  const { data, error } = await supabase
    .from('comics')
    .upsert({
      id: comic.id,
      title: comic.title,
      writer: comic.writer,
      artist: comic.artist,
      publisher: comic.publisher,
      volume: comic.volume,
      year: comic.year,
      description: comic.description,
      cover_url: comic.coverUrl,
      where_to_read: comic.whereToRead,
      ai_enrichment: comic.aiEnrichment,
      curator_notes: comic.curatorNotes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting comic:', error);
    return null;
  }

  return mapDbToComic(data);
};

/**
 * Save AI enrichment data for a comic
 */
export const saveEnrichment = async (
  comicId: string,
  enrichment: AIEnrichment
): Promise<boolean> => {
  const { error } = await supabase
    .from('comics')
    .update({ ai_enrichment: enrichment })
    .eq('id', comicId);

  if (error) {
    console.error('Error saving enrichment:', error);
    return false;
  }

  return true;
};

/**
 * Save curator notes for a comic
 */
export const saveCuratorNotes = async (
  comicId: string,
  notes: string | null
): Promise<boolean> => {
  const { error } = await supabase
    .from('comics')
    .update({ curator_notes: notes })
    .eq('id', comicId);

  if (error) {
    console.error('Error saving curator notes:', error);
    return false;
  }

  return true;
};

// Only insert comic if it doesn't already exist (preserves admin edits)
export const ensureComicExists = async (comic: Comic): Promise<void> => {
  // Check if comic already exists
  const { data } = await supabase
    .from('comics')
    .select('id')
    .eq('id', comic.id)
    .single();

  // Only insert if it doesn't exist
  if (!data) {
    await supabase.from('comics').insert({
      id: comic.id,
      title: comic.title,
      writer: comic.writer,
      artist: comic.artist,
      publisher: comic.publisher,
      volume: comic.volume,
      year: comic.year,
      description: comic.description,
      cover_url: comic.coverUrl,
      where_to_read: comic.whereToRead,
      curator_notes: comic.curatorNotes,
    });
  }
};

// ============================================
// USER COMICS (read states, ratings, reviews)
// ============================================

export const fetchUserComics = async (userId: string): Promise<Map<string, UserComicData>> => {
  const { data, error } = await supabase
    .from('user_comics')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user comics:', error);
    return new Map();
  }

  const map = new Map<string, UserComicData>();
  data.forEach(row => {
    map.set(row.comic_id, {
      readStates: row.read_states || [],
      rating: row.rating,
      review: row.review,
      dateRead: row.date_read,
    });
  });

  return map;
};

export const updateUserComic = async (
  userId: string,
  comicId: string,
  updates: Partial<UserComicData>
): Promise<boolean> => {
  // First, check if record exists
  const { data: existing } = await supabase
    .from('user_comics')
    .select('*')
    .eq('user_id', userId)
    .eq('comic_id', comicId)
    .single();

  if (existing) {
    // UPDATE existing record
    const { error } = await supabase
      .from('user_comics')
      .update({
        read_states: updates.readStates ?? existing.read_states,
        rating: updates.rating ?? existing.rating,
        review: updates.review ?? existing.review,
        date_read: updates.dateRead ?? existing.date_read,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('comic_id', comicId);

    if (error) {
      console.error('Error updating user comic:', error);
      return false;
    }
  } else {
    // INSERT new record
    const { error } = await supabase
      .from('user_comics')
      .insert({
        user_id: userId,
        comic_id: comicId,
        read_states: updates.readStates ?? [],
        rating: updates.rating,
        review: updates.review,
        date_read: updates.dateRead,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error inserting user comic:', error);
      return false;
    }
  }

  return true;
};

export const toggleReadState = async (
  userId: string,
  comicId: string,
  state: ReadState,
  currentStates: ReadState[]
): Promise<ReadState[]> => {
  const hasState = currentStates.includes(state);
  const newStates = hasState
    ? currentStates.filter(s => s !== state)
    : [...currentStates, state];

  await updateUserComic(userId, comicId, { readStates: newStates });
  return newStates;
};

// ============================================
// CURATED PICKS
// ============================================

export const fetchCuratedPicks = async (pickType: 'starter' | 'trending' | 'featured'): Promise<Comic[]> => {
  const { data, error } = await supabase
    .from('curated_picks')
    .select(`
      sort_order,
      comics (*)
    `)
    .eq('pick_type', pickType)
    .eq('active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching curated picks:', error);
    return [];
  }

  return data.map((row: any) => mapDbToComic(row.comics));
};

// ============================================
// HELPERS
// ============================================

interface DbComic {
  id: string;
  title: string;
  writer: string;
  artist: string;
  publisher: string;
  volume?: string;
  year: number;
  description: string;
  cover_url: string;
  where_to_read?: string;
  ai_enrichment?: AIEnrichment;
  curator_notes?: string;
}

interface UserComicData {
  readStates: ReadState[];
  rating?: number;
  review?: string;
  dateRead?: string;
}

const mapDbToComic = (row: DbComic): Comic => ({
  id: row.id,
  title: row.title,
  writer: row.writer,
  artist: row.artist,
  publisher: row.publisher,
  volume: row.volume,
  year: row.year,
  description: row.description,
  coverUrl: row.cover_url,
  whereToRead: row.where_to_read,
  aiEnrichment: row.ai_enrichment,
  curatorNotes: row.curator_notes,
});

// ============================================
// LISTS
// ============================================

export const getUserLists = async (userId: string): Promise<List[]> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user lists:', error);
    return [];
  }

  return data || [];
};

export const getListById = async (listId: string): Promise<List | null> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (error) {
    console.error('Error fetching list:', error);
    return null;
  }

  return data;
};

export const getListItems = async (listId: string): Promise<ListItem[]> => {
  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching list items:', error);
    return [];
  }

  return data || [];
};

export const createList = async (
  userId: string,
  title: string,
  description?: string,
  visibility: ListVisibility = 'private'
): Promise<List | null> => {
  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: userId,
      title,
      description,
      visibility,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating list:', error);
    return null;
  }

  return data;
};

export const updateList = async (
  listId: string,
  updates: Partial<Pick<List, 'title' | 'description' | 'visibility'>>
): Promise<boolean> => {
  const { error } = await supabase
    .from('lists')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listId);

  if (error) {
    console.error('Error updating list:', error);
    return false;
  }

  return true;
};

export const deleteList = async (listId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);

  if (error) {
    console.error('Error deleting list:', error);
    return false;
  }

  return true;
};

export const addComicToList = async (
  listId: string,
  comicId: string
): Promise<ListItem | null> => {
  // Get current max sort_order
  const { data: existing } = await supabase
    .from('list_items')
    .select('sort_order')
    .eq('list_id', listId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      comic_id: comicId,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comic to list:', error);
    return null;
  }

  // Update list's updated_at
  await supabase
    .from('lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId);

  return data;
};

export const removeComicFromList = async (
  listId: string,
  comicId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('comic_id', comicId);

  if (error) {
    console.error('Error removing comic from list:', error);
    return false;
  }

  return true;
};

export const getListItemCount = async (listId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('list_items')
    .select('*', { count: 'exact', head: true })
    .eq('list_id', listId);

  if (error) {
    console.error('Error getting list item count:', error);
    return 0;
  }

  return count || 0;
};

/**
 * Fork a list to a new user's account.
 * Creates a copy with attribution to the original curator.
 * Per share-list.md: saved copies become independent but retain attribution.
 */
export const forkList = async (
  originalListId: string,
  newUserId: string
): Promise<List | null> => {
  // Get the original list
  const originalList = await getListById(originalListId);
  if (!originalList) {
    console.error('Original list not found');
    return null;
  }

  // Get the original curator's profile for attribution
  const originalCurator = await getProfile(originalList.user_id);

  // Get all items from the original list
  const originalItems = await getListItems(originalListId);

  // Create the new list with attribution
  const { data: newList, error: listError } = await supabase
    .from('lists')
    .insert({
      user_id: newUserId,
      title: originalList.title,
      description: originalList.description,
      visibility: 'private', // Saved lists start as private
      forked_from_list_id: originalListId,
      original_curator_id: originalList.user_id,
      original_curator_username: originalCurator?.username || null,
    })
    .select()
    .single();

  if (listError || !newList) {
    console.error('Error creating forked list:', listError);
    return null;
  }

  // Copy all list items to the new list
  if (originalItems.length > 0) {
    const newItems = originalItems.map((item, index) => ({
      list_id: newList.id,
      comic_id: item.comic_id,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('list_items')
      .insert(newItems);

    if (itemsError) {
      console.error('Error copying list items:', itemsError);
      // List was created but items failed - still return the list
    }
  }

  return newList;
};

// ============================================
// METRICS
// ============================================

/**
 * Get the "In Continuity" count for a comic.
 * Counts unique users who marked the comic as 'read' OR 'reread'.
 * Excludes 'owned' and 'want' per metrics spec.
 */
export const getContinuityCount = async (comicId: string): Promise<number> => {
  // Use database function to bypass RLS and count all users
  const { data, error } = await supabase
    .rpc('get_continuity_count', { p_comic_id: comicId });

  if (error) {
    console.error('Error getting continuity count:', error);
    return 0;
  }

  return data || 0;
};
