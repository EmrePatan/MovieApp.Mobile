import {
  buildStarBucketsFromDistribution,
  scoreToStarBucket,
} from '@/features/reviews/utils/rating-star-buckets';

describe('rating-star-buckets', () => {
  it('maps 1-10 scores into 1-5 star buckets with half-star rounding up', () => {
    expect(scoreToStarBucket(1)).toBe(1);
    expect(scoreToStarBucket(2)).toBe(1);
    expect(scoreToStarBucket(3)).toBe(2);
    expect(scoreToStarBucket(8)).toBe(4);
    expect(scoreToStarBucket(9)).toBe(5);
    expect(scoreToStarBucket(10)).toBe(5);
  });

  it('aggregates score distribution into star buckets', () => {
    const buckets = buildStarBucketsFromDistribution({ '8': 2, '3': 1, '10': 1 });

    expect(buckets[4]).toBe(2);
    expect(buckets[2]).toBe(1);
    expect(buckets[5]).toBe(1);
    expect(buckets[1]).toBe(0);
  });
});
