import { flattenRecentWatchHistoryPages } from '@/features/watch-history/utils/flatten-recent-watch-history-pages';
import type {
  RecentWatchHistoryItemResponse,
  RecentWatchHistoryResponse,
} from '@/features/watch-history/types';

function createItem(
  overrides: Partial<RecentWatchHistoryItemResponse>,
): RecentWatchHistoryItemResponse {
  return {
    type: 'movie',
    movieId: 'movie-1',
    episodeId: null,
    tvShowId: null,
    title: 'Movie',
    tvShowTitle: null,
    seasonNumber: null,
    episodeNumber: null,
    episodeTitle: null,
    watchedAt: '2026-09-25T00:00:00Z',
    ...overrides,
  };
}

function createPage(items: RecentWatchHistoryItemResponse[]): RecentWatchHistoryResponse {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

describe('flattenRecentWatchHistoryPages', () => {
  it('drops watch events that overlap between pages', () => {
    const movie = createItem({ movieId: 'movie-1', title: 'Dune' });
    const episode = createItem({
      type: 'episode',
      movieId: null,
      episodeId: 'episode-1',
      tvShowId: 'tv-1',
      title: 'Pilot',
      watchedAt: '2026-09-24T00:00:00Z',
    });

    const items = flattenRecentWatchHistoryPages([
      createPage([movie, episode]),
      createPage([movie, createItem({ movieId: 'movie-2', title: 'Arrival' })]),
    ]);

    expect(items.map((item) => item.title)).toEqual(['Dune', 'Pilot', 'Arrival']);
  });
});
