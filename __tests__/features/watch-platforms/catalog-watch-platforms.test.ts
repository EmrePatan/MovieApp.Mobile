import { buildBrowsePath, buildWorldCinemaPath } from '@/features/discovery/api/routes';
import { createDefaultDiscoveryFilters } from '@/features/discovery/types';
import { getBrowseFilterSheetConfig } from '@/features/discovery/utils/browse-filter-adapters';
import {
  parseDiscoverParams,
  serializeDiscoverParams,
} from '@/features/discovery/utils/discover-params';
import {
  parseWorldCinemaParams,
  serializeWorldCinemaParams,
} from '@/features/discovery/utils/world-cinema-params';

describe('platform filter on browse and world cinema', () => {
  it('is offered only on lists the server can filter by provider', () => {
    expect(getBrowseFilterSheetConfig('popular').supportsMyPlatforms).toBe(true);
    expect(getBrowseFilterSheetConfig('trending').supportsMyPlatforms).toBe(true);
    expect(getBrowseFilterSheetConfig('new_releases').supportsMyPlatforms).toBe(true);
    expect(getBrowseFilterSheetConfig('top_rated').supportsMyPlatforms).toBeFalsy();
    expect(getBrowseFilterSheetConfig('hidden_gems').supportsMyPlatforms).toBeFalsy();
  });

  it('survives the route round trip and is dropped for unsupported lists', () => {
    const state = parseDiscoverParams({ mode: 'popular', watchProviderId: '8,337' });

    expect(state.filters.watchProviderIds).toEqual([8, 337]);
    expect(serializeDiscoverParams(state).watchProviderId).toBe('8,337');
    expect(
      parseDiscoverParams({ mode: 'top_rated', watchProviderId: '8' }).filters.watchProviderIds,
    ).toEqual([]);

    const worldCinema = parseWorldCinemaParams({ watchProviderId: '8' });
    expect(serializeWorldCinemaParams(worldCinema).watchProviderId).toBe('8');
  });

  it('sends the region together with the providers, and neither without them', () => {
    const filters = { ...createDefaultDiscoveryFilters('popular'), watchProviderIds: [8, 337] };

    expect(buildBrowsePath({ mode: 'popular', ...filters, watchRegion: 'TR' })).toContain(
      'watchRegion=TR&watchProviderId=8&watchProviderId=337',
    );
    expect(
      buildBrowsePath({ mode: 'popular', ...filters, watchProviderIds: [], watchRegion: 'TR' }),
    ).not.toContain('watch');
    expect(
      buildWorldCinemaPath({
        ...parseWorldCinemaParams({ watchProviderId: '8' }),
        watchRegion: 'TR',
      }),
    ).toContain('watchRegion=TR&watchProviderId=8');
  });
});
