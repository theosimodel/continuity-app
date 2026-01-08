/**
 * Comic Matcher Utility
 * Fuzzy matching logic for matching ComicVine results to Archivist recommendations
 */

import { ArchivistRecommendation } from '../types/librarian';
import { Comic } from '../types';

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity between two strings (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

/**
 * Normalize comic title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Score a ComicVine result against the recommendation
 * Returns score from 0-100
 */
export function scoreMatch(cvResult: Comic, recommendation: ArchivistRecommendation): number {
  let score = 0;

  // Title similarity (most important - 50% weight)
  const cvTitle = normalizeTitle(cvResult.title || '');
  const recTitle = normalizeTitle(recommendation.title);
  const titleSimilarity = stringSimilarity(cvTitle, recTitle);
  score += titleSimilarity * 50;

  // Writer match (30% weight)
  if (recommendation.writer && cvResult.writer) {
    const cvWriter = cvResult.writer.toLowerCase();
    const recWriter = recommendation.writer.toLowerCase();

    // Check if any part of the writer names match
    const cvWriterParts = cvWriter.split(/[,&]/).map(w => w.trim());
    const recWriterParts = recWriter.split(/[,&]/).map(w => w.trim());

    const writerMatch = recWriterParts.some(rw =>
      cvWriterParts.some(cvw => cvw.includes(rw) || rw.includes(cvw))
    );

    if (writerMatch) {
      score += 30;
    } else {
      // Partial credit for similar names
      const writerSimilarity = stringSimilarity(cvWriter, recWriter);
      score += writerSimilarity * 15;
    }
  }

  // Publisher match (10% weight)
  if (recommendation.publisher && cvResult.publisher) {
    const cvPub = cvResult.publisher.toLowerCase();
    const recPub = recommendation.publisher.toLowerCase();

    if (cvPub.includes(recPub) || recPub.includes(cvPub)) {
      score += 10;
    }
  }

  // Year proximity (10% weight)
  if (recommendation.year && cvResult.year) {
    const yearDiff = Math.abs(cvResult.year - recommendation.year);

    if (yearDiff === 0) {
      score += 10;
    } else if (yearDiff <= 1) {
      score += 7;
    } else if (yearDiff <= 3) {
      score += 4;
    }
  }

  return score;
}

/**
 * Find best matching comic from search results
 * Returns null if no match above threshold (70%)
 */
export function findBestMatch(
  results: Comic[],
  recommendation: ArchivistRecommendation,
  threshold: number = 70
): Comic | null {
  if (results.length === 0) {
    return null;
  }

  // Score all results
  const scored = results.map(result => ({
    result,
    score: scoreMatch(result, recommendation)
  }));

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Debug logging
  console.log('Comic matching scores:', scored.slice(0, 3).map(s => ({
    title: s.result.title,
    score: s.score
  })));

  // Return best match if above threshold
  return scored[0].score >= threshold ? scored[0].result : null;
}

/**
 * Build an optimal search query for ComicVine from a recommendation
 */
export function buildSearchQuery(rec: ArchivistRecommendation): string {
  const parts: string[] = [rec.title];

  // Add first writer for more specific search
  if (rec.writer) {
    const firstWriter = rec.writer.split(',')[0].trim();
    parts.push(firstWriter);
  }

  return parts.join(' ');
}
