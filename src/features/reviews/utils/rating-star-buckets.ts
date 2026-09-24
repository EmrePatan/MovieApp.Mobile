import { isValidBackendScore } from '@/features/ratings/utils/star-rating';

export const RATING_STAR_COUNT = 5;

export function scoreToStarBucket(score: number): number {
  return Math.ceil(score / 2);
}

export function reviewMatchesStarFilter(
  userRating: number | null | undefined,
  ratingStars: number | null,
): boolean {
  if (ratingStars === null || userRating == null || !isValidBackendScore(userRating)) {
    return false;
  }

  return scoreToStarBucket(userRating) === ratingStars;
}

export function adjustBucketsForExcludedRating(
  buckets: Record<number, number>,
  excludedScore: number | null | undefined,
): Record<number, number> {
  if (excludedScore == null || !isValidBackendScore(excludedScore)) {
    return buckets;
  }

  const bucket = scoreToStarBucket(excludedScore);

  return {
    ...buckets,
    [bucket]: Math.max(0, (buckets[bucket] ?? 0) - 1),
  };
}

export function buildStarBucketsFromDistribution(
  distribution: Record<string, number> | undefined,
): Record<number, number> {
  const buckets: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (!distribution) {
    return buckets;
  }

  for (const [scoreKey, count] of Object.entries(distribution)) {
    const bucket = scoreToStarBucket(Number(scoreKey));
    if (bucket >= 1 && bucket <= RATING_STAR_COUNT) {
      buckets[bucket] += count;
    }
  }

  return buckets;
}

export function sumStarBuckets(buckets: Record<number, number>): number {
  return Object.values(buckets).reduce((total, count) => total + count, 0);
}
