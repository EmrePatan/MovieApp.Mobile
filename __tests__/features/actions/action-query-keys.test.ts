import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import {
  movieMyRatingQueryKey,
  movieRatingAggregateQueryKey,
  tvMyRatingQueryKey,
  tvRatingAggregateQueryKey,
} from '@/features/ratings/hooks/rating-query-keys';
import {
  watchlistItemsQueryKey,
  watchlistMembershipQueryKey,
  watchlistQueryKey,
  watchlistsQueryKey,
} from '@/features/watchlists/hooks/watchlist-query-keys';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  recentWatchHistoryInfiniteQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import {
  currentProfileQueryKey,
  profileStatisticsQueryKey,
} from '@/features/profile/hooks/profile-query-keys';
import {
  movieMyReviewQueryKey,
  movieReviewsInfiniteQueryKey,
  tvMyReviewQueryKey,
  tvReviewsInfiniteQueryKey,
} from '@/features/reviews/hooks/review-query-keys';
import {
  recommendationHomeQueryKey,
  recommendationsInfiniteQueryKey,
  similarMoviesQueryKey,
} from '@/features/recommendations/hooks/recommendation-query-keys';
import { discoveryBrowseInfiniteQueryKey } from '@/features/discovery/hooks/discovery-query-keys';

describe('action query keys', () => {
  const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const watchlistId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('uses favorite query keys', () => {
    expect(favoriteStatusQueryKey('movie', id)).toEqual(['favorite', 'movie', id]);
    expect(favoriteStatusQueryKey('tv', id)).toEqual(['favorite', 'tv', id]);
  });

  it('uses rating query keys', () => {
    expect(movieMyRatingQueryKey(id)).toEqual(['rating', 'movie', id, 'me']);
    expect(movieRatingAggregateQueryKey(id)).toEqual(['rating', 'movie', id, 'aggregate']);
    expect(tvMyRatingQueryKey(id)).toEqual(['rating', 'tv', id, 'me']);
    expect(tvRatingAggregateQueryKey(id)).toEqual(['rating', 'tv', id, 'aggregate']);
  });

  it('uses watchlist query keys', () => {
    expect(watchlistsQueryKey()).toEqual(['watchlists']);
    expect(watchlistQueryKey(watchlistId)).toEqual(['watchlist', watchlistId]);
    expect(watchlistItemsQueryKey(watchlistId, 1, 20)).toEqual([
      'watchlist',
      watchlistId,
      'items',
      1,
      20,
    ]);
    expect(watchlistMembershipQueryKey('movie', id)).toEqual([
      'watchlist-membership',
      'movie',
      id,
    ]);
  });

  it('uses watch history query keys', () => {
    expect(movieWatchStatusQueryKey(id)).toEqual(['watch-history', 'movie', id, 'me']);
    expect(episodeWatchStatusQueryKey(id)).toEqual(['watch-history', 'episode', id, 'me']);
    expect(recentWatchHistoryInfiniteQueryKey(20)).toEqual(['watch-history', 'recent', 20]);
  });

  it('uses profile query keys', () => {
    expect(currentProfileQueryKey()).toEqual(['profile', 'me']);
    expect(profileStatisticsQueryKey()).toEqual(['profile', 'statistics']);
  });

  it('uses review query keys', () => {
    expect(movieReviewsInfiniteQueryKey(id, 20)).toEqual(['reviews', 'movie', id, 20]);
    expect(tvReviewsInfiniteQueryKey(id, 20)).toEqual(['reviews', 'tv', id, 20]);
    expect(movieMyReviewQueryKey(id)).toEqual(['reviews', 'movie', id, 'me']);
    expect(tvMyReviewQueryKey(id)).toEqual(['reviews', 'tv', id, 'me']);
  });

  it('uses recommendation and discovery query keys', () => {
    expect(recommendationsInfiniteQueryKey('all', 20)).toEqual([
      'recommendations',
      'list',
      'all',
      20,
    ]);
    expect(recommendationHomeQueryKey()).toEqual(['recommendations', 'home']);
    expect(similarMoviesQueryKey(id, 20)).toEqual(['recommendations', 'similar', 'movie', id, 20]);
    expect(
      discoveryBrowseInfiniteQueryKey(
        'trending',
        'all',
        {
          genreIds: [],
          year: null,
          minRating: null,
          language: null,
          sort: 'popularity_desc',
        },
        20,
      ),
    ).toEqual([
      'discovery',
      'browse',
      'trending',
      'all',
      [],
      null,
      null,
      null,
      'popularity_desc',
      20,
    ]);
  });
});
