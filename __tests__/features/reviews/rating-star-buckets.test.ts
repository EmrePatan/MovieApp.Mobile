import {
  adjustBucketsForExcludedRating,
  buildStarBucketsFromDistribution,
  reviewMatchesStarFilter,
  scoreToStarBucket,
  sumStarBuckets,
} from '@/features/reviews/utils/rating-star-buckets';

describe('rating-star-buckets', () => {
  it('maps 1-10 scores into 1-5 star buckets with half-star rounding up', () => {
    expect(scoreToStarBucket(1)).toBe(1);
    expect(scoreToStarBucket(2)).toBe(1);
    expect(scoreToStarBucket(3)).toBe(2);
    expect(scoreToStarBucket(4)).toBe(2);
    expect(scoreToStarBucket(5)).toBe(3);
    expect(scoreToStarBucket(6)).toBe(3);
    expect(scoreToStarBucket(7)).toBe(4);
    expect(scoreToStarBucket(8)).toBe(4);
    expect(scoreToStarBucket(9)).toBe(5);
    expect(scoreToStarBucket(10)).toBe(5);
  });

  it('matches the backend (score + 1) / 2 integer-division filter for every persisted score', () => {
    for (let score = 1; score <= 10; score += 1) {
      expect(scoreToStarBucket(score)).toBe(Math.trunc((score + 1) / 2));
    }
  });

  it('treats half-star UI values as the integer bucket above them', () => {
    expect(scoreToStarBucket(3)).toBe(scoreToStarBucket(4));
    expect(scoreToStarBucket(3)).toBe(2);
    expect(reviewMatchesStarFilter(3, 2)).toBe(true);
    expect(reviewMatchesStarFilter(4, 2)).toBe(true);
    expect(reviewMatchesStarFilter(3, 1)).toBe(false);
  });

  it('does not put ratings-only scores into review histogram buckets', () => {
    const ratingOnlyBuckets = buildStarBucketsFromDistribution({ '3': 10, '4': 2, '8': 1 });
    const writtenReviewBuckets = buildStarBucketsFromDistribution({ '8': 1 });

    expect(ratingOnlyBuckets[2]).toBe(12);
    expect(writtenReviewBuckets[2]).toBe(0);
    expect(writtenReviewBuckets[4]).toBe(1);
  });

  it('sums star bucket counts for review-rated histogram totals', () => {
    expect(sumStarBuckets({ 1: 0, 2: 1, 3: 0, 4: 2, 5: 1 })).toBe(4);
  });

  it('aggregates score distribution into star buckets', () => {
    const buckets = buildStarBucketsFromDistribution({ '8': 2, '3': 1, '10': 1 });

    expect(buckets[4]).toBe(2);
    expect(buckets[2]).toBe(1);
    expect(buckets[5]).toBe(1);
    expect(buckets[1]).toBe(0);
  });

  it('subtracts the current user rating from histogram buckets', () => {
    const buckets = buildStarBucketsFromDistribution({ '8': 1 });

    expect(adjustBucketsForExcludedRating(buckets, 8)[4]).toBe(0);
  });

  it('matches star filters using the same bucket rules as the API', () => {
    expect(reviewMatchesStarFilter(7, 4)).toBe(true);
    expect(reviewMatchesStarFilter(8, 4)).toBe(true);
    expect(reviewMatchesStarFilter(6, 4)).toBe(false);
    expect(reviewMatchesStarFilter(null, 4)).toBe(false);
  });
});
