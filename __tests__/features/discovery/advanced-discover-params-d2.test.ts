import { createDefaultAdvancedDiscoverFilters } from '@/features/discovery/advanced-discover-types';
import {
  parseAdvancedDiscoverParams,
  serializeAdvancedDiscoverParams,
} from '@/features/discovery/utils/advanced-discover-params';

describe('advanced-discover-params D2', () => {
  it('keeps legacy D1 URLs valid without watch filters', () => {
    const state = parseAdvancedDiscoverParams({
      mediaType: 'movie',
    });

    expect(state.filters.watchRegion).toBeNull();
    expect(state.filters.watchProviderIds).toEqual([]);
    expect(state.filters.watchMonetizationTypes).toEqual([]);
  });

  it('round-trips watch region and provider filters', () => {
    const state = {
      mediaType: 'movie' as const,
      filters: {
        ...createDefaultAdvancedDiscoverFilters(),
        originCountry: 'KR',
        watchRegion: 'TR',
        watchProviderIds: [8],
        watchMonetizationTypes: ['stream' as const],
      },
    };

    const params = serializeAdvancedDiscoverParams(state);
    const parsed = parseAdvancedDiscoverParams(params);

    expect(parsed.filters.originCountry).toBe('KR');
    expect(parsed.filters.watchRegion).toBe('TR');
    expect(parsed.filters.watchProviderIds).toEqual([8]);
    expect(parsed.filters.watchMonetizationTypes).toEqual(['stream']);
  });
});
