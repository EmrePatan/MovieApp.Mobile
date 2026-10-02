import { libraryItemMatchesQuery } from '@/features/library/utils/library-item-matches-query';
import type { LibraryItem } from '@/features/library/types/library';

function createItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    id: 'movie-1',
    type: 'movie',
    title: 'Interstellar',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    year: 2014,
    voteAverage: 8.6,
    addedAt: null,
    watchedAt: null,
    lastActivityAt: null,
    progressPercentage: null,
    nextEpisode: null,
    collectionStatus: 'watched',
    ...overrides,
  };
}

describe('libraryItemMatchesQuery', () => {
  it('matches title and original title case-insensitively', () => {
    const item = createItem({ originalTitle: 'Parasite Gisaengchung' });

    expect(libraryItemMatchesQuery(item, 'inter')).toBe(true);
    expect(libraryItemMatchesQuery(item, 'gisaeng')).toBe(true);
    expect(libraryItemMatchesQuery(item, 'matrix')).toBe(false);
  });
});
