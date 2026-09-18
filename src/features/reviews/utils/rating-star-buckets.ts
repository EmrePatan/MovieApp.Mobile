export const RATING_STAR_COUNT = 5;

export function scoreToStarBucket(score: number): number {
  return Math.ceil(score / 2);
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
