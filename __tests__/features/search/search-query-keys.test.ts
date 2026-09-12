import {
  autocompleteQueryKey,
  searchHistoryQueryKey,
  searchQueryKey,
} from '@/features/search/hooks/search-query-keys';

describe('search query keys', () => {
  it('uses search query key with filters and pagination size', () => {
    expect(searchQueryKey('interstellar', 'movie', 20)).toEqual([
      'search',
      'interstellar',
      'movie',
      20,
    ]);
  });

  it('uses autocomplete query key', () => {
    expect(autocompleteQueryKey('break')).toEqual(['autocomplete', 'break']);
  });

  it('uses search history query key', () => {
    expect(searchHistoryQueryKey(1, 20)).toEqual(['search-history', 1, 20]);
  });
});
