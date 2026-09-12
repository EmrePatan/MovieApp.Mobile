import {
  getSearchResultItemLayout,
  SEARCH_RESULT_ROW_HEIGHT,
} from '@/features/search/utils/search-list-layout';
import { searchResultKeyExtractor } from '@/features/search/utils/search-list-keys';
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
  it('builds stable result keys', () => {
    expect(searchResultKeyExtractor(createItem({ id: 'abc', type: 'tv' }))).toBe('tv-abc');
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
