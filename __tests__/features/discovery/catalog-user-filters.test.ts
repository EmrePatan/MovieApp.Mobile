import {
  clearDiscoveryUserFilters,
  createDefaultDiscoveryFilters,
  hasActiveDiscoveryUserFilters,
  hasNonDefaultDiscoverySort,
} from '@/features/discovery/types';
import {
  clearWorldCinemaUserFilters,
  createDefaultWorldCinemaState,
  hasActiveWorldCinemaUserFilters,
} from '@/features/discovery/world-cinema-types';
import {
  clearStreamingUserFilters,
  createDefaultStreamingDiscoverState,
  hasActiveStreamingUserFilters,
} from '@/features/discovery/streaming-discover-types';

describe('catalog user filter active semantics', () => {
  it('ignores sort for browse filter-active state', () => {
    const filters = {
      ...createDefaultDiscoveryFilters('trending'),
      sort: 'rating_desc' as const,
    };

    expect(hasActiveDiscoveryUserFilters(filters, 'all')).toBe(false);
    expect(hasNonDefaultDiscoverySort(filters, 'trending')).toBe(true);
  });

  it('counts browse user filters without sort', () => {
    const filters = {
      ...createDefaultDiscoveryFilters('trending'),
      genreIds: ['g1'],
      sort: 'rating_desc' as const,
    };

    expect(hasActiveDiscoveryUserFilters(filters, 'all')).toBe(true);
  });

  it('preserves sort when clearing browse filters', () => {
    const filters = {
      ...createDefaultDiscoveryFilters('trending'),
      genreIds: ['g1'],
      sort: 'title_asc' as const,
    };

    expect(clearDiscoveryUserFilters(filters, 'trending').sort).toBe('title_asc');
    expect(clearDiscoveryUserFilters(filters, 'trending').genreIds).toEqual([]);
  });

  it('does not treat default world cinema country/media as active filters', () => {
    expect(hasActiveWorldCinemaUserFilters(createDefaultWorldCinemaState())).toBe(false);
    expect(
      hasActiveWorldCinemaUserFilters({
        ...createDefaultWorldCinemaState(),
        originCountry: 'JP',
      }),
    ).toBe(true);
  });

  it('preserves sort when clearing world cinema filters', () => {
    const state = {
      ...createDefaultWorldCinemaState(),
      genreIds: ['g1'],
      sort: 'rating_desc' as const,
    };

    expect(clearWorldCinemaUserFilters(state).sort).toBe('rating_desc');
    expect(clearWorldCinemaUserFilters(state).genreIds).toEqual([]);
    expect(clearWorldCinemaUserFilters(state).originCountry).toBe('KR');
  });

  it('ignores provider and region context for streaming filter-active state', () => {
    const state = {
      ...createDefaultStreamingDiscoverState('TR'),
      watchProviderIds: [8],
      watchMonetizationTypes: ['stream' as const],
    };

    expect(hasActiveStreamingUserFilters(state)).toBe(false);
    expect(
      hasActiveStreamingUserFilters({
        ...state,
        minRating: 8,
      }),
    ).toBe(true);
  });

  it('preserves sort and provider context when clearing streaming filters', () => {
    const state = {
      ...createDefaultStreamingDiscoverState('TR'),
      watchProviderIds: [8],
      genreIds: ['g1'],
      sort: 'newest' as const,
    };

    const cleared = clearStreamingUserFilters(state);
    expect(cleared.sort).toBe('newest');
    expect(cleared.watchProviderIds).toEqual([8]);
    expect(cleared.genreIds).toEqual([]);
  });
});
