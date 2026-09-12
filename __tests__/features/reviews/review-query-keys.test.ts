import {
  movieMyReviewQueryKey,
  movieReviewsInfiniteQueryKey,
  tvMyReviewQueryKey,
  tvReviewsInfiniteQueryKey,
} from '@/features/reviews/hooks/review-query-keys';

describe('review query keys', () => {
  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  it('uses movie review keys', () => {
    expect(movieReviewsInfiniteQueryKey(id)).toEqual(['reviews', 'movie', id, 20]);
    expect(movieMyReviewQueryKey(id)).toEqual(['reviews', 'movie', id, 'me']);
  });

  it('uses tv review keys', () => {
    expect(tvReviewsInfiniteQueryKey(id, 10)).toEqual(['reviews', 'tv', id, 10]);
    expect(tvMyReviewQueryKey(id)).toEqual(['reviews', 'tv', id, 'me']);
  });
});
