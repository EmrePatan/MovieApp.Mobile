import { flattenLibraryPages } from '@/features/library/utils/flatten-library-pages';
import type { LibraryItem, LibraryListResponse } from '@/features/library/types/library';

function createItem(id: string, type: LibraryItem['type'] = 'movie'): LibraryItem {
  return {
    id,
    type,
    title: id,
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    year: 2024,
    voteAverage: 7,
    addedAt: null,
    watchedAt: null,
    lastActivityAt: null,
    progressPercentage: null,
    nextEpisode: null,
    collectionStatus: 'watched',
  };
}

function createPage(items: LibraryItem[]): LibraryListResponse {
  return {
    items,
    page: 1,
    pageSize: 24,
    totalCount: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

describe('flattenLibraryPages', () => {
  it('drops catalog rows that overlap between pages', () => {
    const shared = createItem('shared-movie');
    const items = flattenLibraryPages([
      createPage([shared, createItem('only-page-1')]),
      createPage([createItem('shared-movie'), createItem('only-page-2', 'tv')]),
    ]);

    expect(items.map((item) => `${item.type}:${item.id}`)).toEqual([
      'movie:shared-movie',
      'movie:only-page-1',
      'tv:only-page-2',
    ]);
  });
});
