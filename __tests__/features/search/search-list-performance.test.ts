import {
  getSearchResultItemLayout,
  SEARCH_RESULT_ROW_HEIGHT,
} from '@/features/search/utils/search-list-layout';
import {
  flattenDedupedSearchResultPages,
  searchResultKeyExtractor,
} from '@/features/search/utils/search-list-keys';
import type { SearchResultItem } from '@/features/search/types';

function createItem(overrides: Partial<SearchResultItem> = {}): SearchResultItem {
  return {
    id: 'item-1',
    type: 'movie',
    title: 'Test',
    originalTitle: null,
    overview: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 10,
    year: null,
    ...overrides,
  };
}

describe('search list performance helpers', () => {
  it('dedupes overlapping infinite-query pages by stable keys', () => {
    const duplicate = createItem({ id: 'c899b002-b166-458d-b7c1-2c010763bf2c', type: 'movie' });
    const unique = createItem({ id: 'other-id', type: 'movie' });

    expect(
      flattenDedupedSearchResultPages([
        { items: [duplicate, unique] },
        { items: [duplicate, createItem({ id: 'page-two', type: 'tv' })] },
      ]),
    ).toHaveLength(3);
  });

  it('builds stable result keys', () => {
    expect(searchResultKeyExtractor(createItem({ id: 'abc', type: 'tv' }))).toBe('tv-abc');
    expect(
      searchResultKeyExtractor({
        id: 'person-id',
        type: 'person',
        title: 'Leonardo DiCaprio',
        tmdbId: 6193,
        knownForDepartment: 'Acting',
        posterUrl: null,
      }),
    ).toBe('person-6193');
  });

  it('returns predictable result row offsets', () => {
    expect(getSearchResultItemLayout(null, 0)).toEqual({
      length: SEARCH_RESULT_ROW_HEIGHT,
      offset: 0,
      index: 0,
    });
    expect(getSearchResultItemLayout(null, 2)).toEqual({
      length: SEARCH_RESULT_ROW_HEIGHT,
      offset: SEARCH_RESULT_ROW_HEIGHT * 2,
      index: 2,
    });
  });
});
