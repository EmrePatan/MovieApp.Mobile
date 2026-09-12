import {
  buildRecentHistoryRoute,
  getRecentHistoryTitle,
} from '@/features/watch-history/utils/history-navigation';
import type { RecentWatchHistoryItemResponse } from '@/features/watch-history/types';

describe('watch history navigation', () => {
  it('builds movie detail route from recent history item', () => {
    const item: RecentWatchHistoryItemResponse = {
      type: 'movie',
      movieId: 'movie-id',
      episodeId: null,
      tvShowId: null,
      title: 'Interstellar',
      tvShowTitle: null,
      seasonNumber: null,
      episodeNumber: null,
      episodeTitle: null,
      watchedAt: '2026-09-11T14:30:00Z',
    };

    expect(buildRecentHistoryRoute(item)).toBe('/movie/movie-id');
    expect(getRecentHistoryTitle(item)).toBe('Interstellar');
  });

  it('builds episode detail route from recent history item', () => {
    const item: RecentWatchHistoryItemResponse = {
      type: 'episode',
      movieId: null,
      episodeId: 'episode-id',
      tvShowId: 'tv-id',
      title: null,
      tvShowTitle: 'Breaking Bad',
      seasonNumber: 1,
      episodeNumber: 3,
      episodeTitle: 'And the Bag\'s in the River',
      watchedAt: '2026-09-11T13:00:00Z',
    };

    expect(buildRecentHistoryRoute(item)).toBe('/tv/tv-id/season/1/episode/3');
    expect(getRecentHistoryTitle(item)).toContain('Breaking Bad');
  });
});
