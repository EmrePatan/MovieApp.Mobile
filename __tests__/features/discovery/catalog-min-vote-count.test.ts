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
});
