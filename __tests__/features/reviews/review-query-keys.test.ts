import {
  movieMyReviewQueryKey,
  movieReviewsQueryKey,
  tvMyReviewQueryKey,
  tvReviewsQueryKey,
} from '@/features/reviews/hooks/review-query-keys';

describe('review query keys', () => {
  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  it('uses movie review keys', () => {
    expect(movieReviewsQueryKey(id, 2, 10, 'ratingDesc', 4)).toEqual([
      'reviews',
      'movie',
      id,
      2,
      10,
      'ratingDesc',
      4,
    ]);
    expect(movieMyReviewQueryKey(id)).toEqual(['reviews', 'movie', id, 'me']);
  });

  it('uses tv review keys', () => {
    expect(tvReviewsQueryKey(id, 1, 10, 'newest', null)).toEqual([
      'reviews',
      'tv',
      id,
      1,
      10,
      'newest',
      null,
    ]);
    expect(tvMyReviewQueryKey(id)).toEqual(['reviews', 'tv', id, 'me']);
  });
});
