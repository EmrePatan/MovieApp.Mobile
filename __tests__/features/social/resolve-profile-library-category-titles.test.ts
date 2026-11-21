import { resolveProfileLibraryCategoryTitles } from '@/features/social/utils/resolve-profile-library-category-titles';
import type { SocialProfileStatistics } from '@/features/social/types';

const base: SocialProfileStatistics = {
  moviesWatched: 1,
  episodesWatched: 0,
  ratingsCount: 0,
  reviewsCount: 0,
  favoritesCount: 1,
  milestones: [],
  watchingTitles: [
    { id: 'w1', title: 'Watching Show', posterPath: null, contentType: 'TvShow', progressPercentage: 40 },
  ],
  watchedTitles: [
    { id: 'd1', title: 'Done Movie', posterPath: '/a.jpg', contentType: 'Movie' },
  ],
  likedTitles: [
    { id: 'l1', title: 'Liked Movie', posterPath: null, contentType: 'Movie' },
  ],
  watchlistTitles: [
    { id: 's1', title: 'Saved Show', posterPath: null, contentType: 'TvShow' },
  ],
  favoriteMovies: [
    { id: 'f1', title: 'Fav Fallback', posterPath: null, contentType: 'Movie' },
  ],
};

describe('resolveProfileLibraryCategoryTitles', () => {
  it('returns watching shelf', () => {
    expect(resolveProfileLibraryCategoryTitles(base, 'watching')).toEqual(base.watchingTitles);
  });

  it('returns watched shelf', () => {
    expect(resolveProfileLibraryCategoryTitles(base, 'watched')).toEqual(base.watchedTitles);
  });

  it('prefers likedTitles over favorite fallback', () => {
    expect(resolveProfileLibraryCategoryTitles(base, 'liked')).toEqual(base.likedTitles);
  });

  it('falls back to favorites when likedTitles empty', () => {
    const stats = { ...base, likedTitles: [] };
    expect(resolveProfileLibraryCategoryTitles(stats, 'liked')).toEqual(base.favoriteMovies);
  });

  it('returns watchlist shelf', () => {
    expect(resolveProfileLibraryCategoryTitles(base, 'watchlist')).toEqual(base.watchlistTitles);
  });
});
