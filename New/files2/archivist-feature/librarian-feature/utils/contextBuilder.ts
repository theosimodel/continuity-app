/**
 * Librarian Context Builder
 * Analyzes user's comic collection and reading history to provide personalized context
 */

import { Comic, LibrarianContext, ReadingStats } from '../types/librarian';

export class LibrarianContextBuilder {
  private comics: Comic[];

  constructor(comics: Comic[]) {
    this.comics = comics;
  }

  /**
   * Build complete context for the librarian
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
      .filter(comic => comic.dateRead)
      .sort((a, b) => (b.dateRead || 0) - (a.dateRead || 0))
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
   * Get series user is currently reading (has some read, some unread)
   */
  private getCurrentlyReading(): Comic[] {
    const seriesMap = new Map<string, Comic[]>();

    this.comics.forEach(comic => {
      const series = comic.series || comic.title;
      if (!seriesMap.has(series)) {
        seriesMap.set(series, []);
      }
      seriesMap.get(series)?.push(comic);
    });

    const currentSeries: Comic[] = [];

    seriesMap.forEach((issues, series) => {
      const hasRead = issues.some(i => i.dateRead);
      const hasUnread = issues.some(i => !i.dateRead && i.isOwned);

      if (hasRead && hasUnread) {
        // Add the most recent read issue from this series
        const latestRead = issues
          .filter(i => i.dateRead)
          .sort((a, b) => (b.dateRead || 0) - (a.dateRead || 0))[0];
        
        if (latestRead) {
          currentSeries.push(latestRead);
        }
      }
    });

    return currentSeries.slice(0, 5);
  }

  /**
   * Get series with highest average ratings
   */
  private getTopRatedSeries(): string[] {
    const seriesRatings = new Map<string, { total: number; count: number }>();

    this.comics.forEach(comic => {
      if (comic.rating) {
        const series = comic.series || comic.title;
        const current = seriesRatings.get(series) || { total: 0, count: 0 };
        seriesRatings.set(series, {
          total: current.total + comic.rating,
          count: current.count + 1,
        });
      }
    });

    return Array.from(seriesRatings.entries())
      .map(([series, { total, count }]) => ({
        series,
        avgRating: total / count,
        count,
      }))
      .filter(s => s.count >= 2) // Only series with 2+ rated issues
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5)
      .map(s => s.series);
  }

  /**
   * Calculate comprehensive reading statistics
   */
  private getReadingStats(): ReadingStats {
    const readComics = this.comics.filter(c => c.dateRead);
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

    // Count creator appearances in read comics
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

    // Calculate reading streak (simplified - days with consecutive reads)
    const readingStreak = this.calculateReadingStreak(readComics);

    return {
      totalIssuesRead: readComics.length,
      averageRating: Math.round(avgRating * 10) / 10,
      favoritePublishers,
      favoriteGenres: [], // Can be enhanced with genre data
      readingStreak,
      mostReadCreators,
    };
  }

  /**
   * Calculate reading streak in days
   */
  private calculateReadingStreak(readComics: Comic[]): number {
    if (readComics.length === 0) return 0;

    const sortedDates = readComics
      .map(c => c.dateRead!)
      .sort((a, b) => b - a)
      .map(timestamp => {
        const date = new Date(timestamp);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      });

    const uniqueDates = Array.from(new Set(sortedDates));
    
    let streak = 1;
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const dayDiff = (uniqueDates[i] - uniqueDates[i + 1]) / oneDayMs;
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate a natural language summary of the context
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

    if (context.currentlyReading && context.currentlyReading.length > 0) {
      parts.push(`You're currently reading ${context.currentlyReading.length} series`);
    }

    if (stats.readingStreak && stats.readingStreak > 1) {
      parts.push(`You have a ${stats.readingStreak}-day reading streak`);
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
