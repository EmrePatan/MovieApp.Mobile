import { buildBrowsePath } from '@/features/discovery/api/routes';
import { discoveryBrowseInfiniteQueryKey } from '@/features/discovery/hooks/discovery-query-keys';
import { serializeDiscoverParams, parseDiscoverParams } from '@/features/discovery/utils/discover-params';
import {
  browseStateToFilterDraft,
  filterDraftToBrowsePatch,
} from '@/features/discovery/utils/browse-filter-adapters';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';

describe('catalog minVoteCount draft and route round-trip', () => {
  it('preserves 500 and 5000 through serialize and parse', () => {
    for (const minVoteCount of [500, 5000]) {
      const serialized = serializeDiscoverParams({
        mode: 'trending',
        type: 'movie',
        filters: {
          ...createDefaultDiscoveryFilters('trending'),
          minVoteCount,
        },
      });

      expect(serialized.minVoteCount).toBe(String(minVoteCount));

      const parsed = parseDiscoverParams(serialized);
      expect(parsed.filters.minVoteCount).toBe(minVoteCount);
    }
  });

  it('maps filter draft minVoteCount into browse patch', () => {
    const draft = browseStateToFilterDraft('all', {
      ...createDefaultDiscoveryFilters('trending'),
      minVoteCount: 500,
    });

    const patch = filterDraftToBrowsePatch({ ...draft, minVoteCount: 5000 });
    expect(patch.filters.minVoteCount).toBe(5000);
  });

  it('keeps popularity_asc and minVoteCount together in route and query key', () => {
    const filters = {
      ...createDefaultDiscoveryFilters('trending'),
      sort: 'popularity_asc' as const,
      minVoteCount: 5000,
    };

    const serialized = serializeDiscoverParams({
      mode: 'trending',
      type: 'all',
      filters,
    });

    expect(serialized.sort).toBe('popularity_asc');
    expect(serialized.minVoteCount).toBe('5000');

    const parsed = parseDiscoverParams(serialized);
    expect(parsed.filters.sort).toBe('popularity_asc');
    expect(parsed.filters.minVoteCount).toBe(5000);

    const path = buildBrowsePath({
      mode: 'trending',
      type: 'all',
      page: 1,
      pageSize: 20,
      ...filters,
    });
    expect(path).toContain('sort=popularity_asc');
    expect(path).toContain('minVoteCount=5000');

    const withoutVote = discoveryBrowseInfiniteQueryKey('trending', 'all', {
      ...createDefaultDiscoveryFilters('trending'),
      sort: 'popularity_asc',
      minVoteCount: null,
    });
    const withVote = discoveryBrowseInfiniteQueryKey('trending', 'all', filters);
    expect(withoutVote).not.toEqual(withVote);
  });
});
