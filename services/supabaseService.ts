/**
 * Supabase Service - Database Integration (Prep Work)
 *
 * This file is NOT connected to the app yet.
 * It's ready for when you set up Supabase.
 *
 * To activate:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the SQL schema in Supabase SQL Editor
 * 3. Copy .env.example to .env and add your keys
 * 4. Import and use these functions in App.tsx
 */

import { createClient } from '@supabase/supabase-js';
import { Comic, ReadState } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
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

export const upsertComic = async (comic: Comic): Promise<Comic | null> => {
  const { data, error } = await supabase
    .from('comics')
    .upsert({
      id: comic.id,
      title: comic.title,
      writer: comic.writer,
      artist: comic.artist,
      publisher: comic.publisher,
      year: comic.year,
      description: comic.description,
      cover_url: comic.coverUrl,
      where_to_read: comic.whereToRead,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting comic:', error);
    return null;
  }

  return mapDbToComic(data);
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
  const { error } = await supabase
    .from('user_comics')
    .upsert({
      user_id: userId,
      comic_id: comicId,
      read_states: updates.readStates,
      rating: updates.rating,
      review: updates.review,
      date_read: updates.dateRead,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating user comic:', error);
    return false;
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
  year: number;
  description: string;
  cover_url: string;
  where_to_read?: string;
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
  year: row.year,
  description: row.description,
  coverUrl: row.cover_url,
  whereToRead: row.where_to_read,
});
