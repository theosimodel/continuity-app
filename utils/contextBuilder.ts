/**
 * Librarian Context Builder
 * Analyzes user's comic collection to provide personalized context
 */

import { Comic } from '../types';
import { LibrarianContext, ReadingStats } from '../types/librarian';

export class LibrarianContextBuilder {
  private comics: Comic[];

  constructor(comics: Comic[]) {
    this.comics = comics;
  }

  /**
   * Build complete context for the archivist
   */
  buildContext(): LibrarianContext {
    return {
      recentReads: this.getRecentReads(),
      favoriteCreators: this.getFavoriteCreators(),
      currentlyReading: this.getCurrentlyReading(),
      topRatedSeries: this.getTopRatedSeries(),
      collectionSize: this.comics.length,
      readingStats: this.getReadingStats(),
    };
  }

  /**
   * Get recently read comics (last 20)
   */
  private getRecentReads(): Comic[] {
    return this.comics
      .filter(comic => comic.readStates?.includes('read'))
      .slice(0, 20);
  }

  /**
   * Get creators that appear most in user's collection
   */
  private getFavoriteCreators(): string[] {
    const creatorCounts = new Map<string, number>();

    this.comics.forEach(comic => {
      if (comic.writer) {
        const writers = comic.writer.split(',').map(w => w.trim());
        writers.forEach(writer => {
          creatorCounts.set(writer, (creatorCounts.get(writer) || 0) + 1);
        });
      }
      if (comic.artist) {
        const artists = comic.artist.split(',').map(a => a.trim());
        artists.forEach(artist => {
          creatorCounts.set(artist, (creatorCounts.get(artist) || 0) + 1);
        });
      }
    });

    return Array.from(creatorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([creator]) => creator);
  }

  /**
   * Get comics user is currently reading
   */
  private getCurrentlyReading(): Comic[] {
    return this.comics
      .filter(comic => comic.readStates?.includes('want'))
      .slice(0, 5);
  }

  /**
   * Get series with highest ratings
   */
  private getTopRatedSeries(): string[] {
    return this.comics
      .filter(comic => comic.rating && comic.rating >= 4)
      .map(comic => comic.title)
      .slice(0, 5);
  }

  /**
   * Calculate comprehensive reading statistics
   */
  private getReadingStats(): ReadingStats {
    const readComics = this.comics.filter(c => c.readStates?.includes('read'));
    const ratedComics = this.comics.filter(c => c.rating);

    // Calculate average rating
    const avgRating = ratedComics.length > 0
      ? ratedComics.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedComics.length
      : 0;

    // Count publishers
    const publisherCounts = new Map<string, number>();
    this.comics.forEach(comic => {
      if (comic.publisher) {
        publisherCounts.set(
          comic.publisher,
          (publisherCounts.get(comic.publisher) || 0) + 1
        );
      }
    });

    const favoritePublishers = Array.from(publisherCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([publisher]) => publisher);

    // Count creator appearances
    const creatorCounts = new Map<string, number>();
    readComics.forEach(comic => {
      [comic.writer, comic.artist].forEach(creators => {
        if (creators) {
          creators.split(',').forEach(creator => {
            const name = creator.trim();
            creatorCounts.set(name, (creatorCounts.get(name) || 0) + 1);
          });
        }
      });
    });

    const mostReadCreators = Array.from(creatorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalIssuesRead: readComics.length,
      averageRating: Math.round(avgRating * 10) / 10,
      favoritePublishers,
      favoriteGenres: [],
      readingStreak: 0,
      mostReadCreators,
    };
  }

  /**
   * Generate a natural language summary
   */
  generateContextSummary(): string {
    const context = this.buildContext();
    const stats = context.readingStats!;

    const parts: string[] = [];

    if (stats.totalIssuesRead > 0) {
      parts.push(`You've read ${stats.totalIssuesRead} issues`);
    }

    if (stats.averageRating > 0) {
      parts.push(`with an average rating of ${stats.averageRating} stars`);
    }

    if (context.favoriteCreators && context.favoriteCreators.length > 0) {
      parts.push(`Your favorite creators include ${context.favoriteCreators.slice(0, 3).join(', ')}`);
    }

    return parts.join('. ') + '.';
  }
}

/**
 * Helper function to build context from comics array
 */
export function buildLibrarianContext(comics: Comic[]): LibrarianContext {
  const builder = new LibrarianContextBuilder(comics);
  return builder.buildContext();
}

/**
 * Helper function to get context summary
 */
export function getContextSummary(comics: Comic[]): string {
  const builder = new LibrarianContextBuilder(comics);
  return builder.generateContextSummary();
}
