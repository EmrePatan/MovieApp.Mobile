import { findLeavingPlatformLogoPath } from '@/features/leaving-soon/leaving-platform-logos';
import { buildLeavingSoonPath } from '@/features/leaving-soon/leaving-soon-api';
import {
  buildLeavingSoonSection,
  flattenLeavingSoonPages,
  formatLeavingPlatforms,
} from '@/features/leaving-soon/leaving-soon-items';
import {
  filterDraftToLeavingSoonState,
  LEAVING_SOON_FILTER_SHEET_CONFIG,
  leavingSoonStateToFilterDraft,
  parseLeavingSoonParams,
  serializeLeavingSoonParams,
} from '@/features/leaving-soon/leaving-soon-params';
import {
  clearLeavingSoonFilters,
  createDefaultLeavingSoonState,
  hasActiveLeavingSoonFilters,
  type LeavingSoonItem,
} from '@/features/leaving-soon/leaving-soon-types';
import { applyHomeSectionPolicy } from '@/features/home/utils/home-section-policy';

const NOW = Date.parse('2026-11-26T12:00:00Z');

function item(id: number, daysAhead: number): LeavingSoonItem {
  return {
    id: `id-${id}`,
    type: 'movie',
    title: `Title ${id}`,
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 10,
    year: 2020,
    leavesAtUtc: new Date(NOW + daysAhead * 86_400_000).toISOString(),
    platforms: [
      { serviceId: 'netflix', name: 'Netflix', leavesAtUtc: '', watchLink: null },
    ],
  };
}

describe('leaving soon rail', () => {
  it('is hidden when fewer than five titles have not left yet', () => {
    const items = [item(1, 1), item(2, 2), item(3, 3), item(4, 4), item(5, -1)];

    expect(buildLeavingSoonSection(items, NOW)).toBeNull();
    expect(buildLeavingSoonSection(undefined, NOW)).toBeNull();
  });

  it('shows the remaining titles with their date and platforms', () => {
    const section = buildLeavingSoonSection(
      [item(1, -1), item(2, 2), item(3, 3), item(4, 4), item(5, 5), item(6, 6)],
      NOW,
    );

    expect(section?.items.map((entry) => entry.id)).toEqual([
      'id-2',
      'id-3',
      'id-4',
      'id-5',
      'id-6',
    ]);
    expect(section?.items[0].leaving?.platforms).toEqual([
      { serviceId: 'netflix', name: 'Netflix' },
    ]);
  });

  it('takes the logo of the main plan first, and none for an unknown service', () => {
    const providers = [
      { providerId: 2100, name: 'Prime with Ads', logoPath: '/ads.png', displayPriority: 1 },
      { providerId: 119, name: 'Prime Video', logoPath: '/prime.png', displayPriority: 2 },
    ];

    expect(findLeavingPlatformLogoPath('prime', providers)).toBe('/prime.png');
    expect(findLeavingPlatformLogoPath('unknown', providers)).toBeNull();
  });

  it('sits between Coming Up and Trending', () => {
    const rail = (type: string) => ({
      type,
      title: type,
      displayOrder: 0,
      items: buildLeavingSoonSection(
        [item(1, 1), item(2, 2), item(3, 3), item(4, 4), item(5, 5)],
        NOW,
      )!.items,
    });

    expect(
      applyHomeSectionPolicy(
        [rail('LeavingSoon'), rail('Trending'), rail('ComingUp')],
        true,
      ).map((section) => section.type),
    ).toEqual(['ComingUp', 'LeavingSoon', 'Trending']);
  });

  it('names two platforms and counts the rest', () => {
    const platforms = ['Netflix', 'Prime Video', 'MUBI'].map((name) => ({
      serviceId: name,
      name,
      leavesAtUtc: '',
      watchLink: null,
    }));

    expect(formatLeavingPlatforms(platforms)).toBe('Netflix · Prime Video +1');
  });

  it('drops passed and repeated titles from the paged list', () => {
    const page = (items: LeavingSoonItem[]) => ({
      items,
      page: 1,
      pageSize: 20,
      totalCount: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(
      flattenLeavingSoonPages([page([item(1, -1), item(2, 2)]), page([item(2, 2)])], NOW),
    ).toHaveLength(1);
  });
});

describe('leaving soon filters', () => {
  it('sends the region, a single year as a range and the saved platforms', () => {
    const url = new URL(
      buildLeavingSoonPath({
        ...createDefaultLeavingSoonState(),
        watchRegion: 'TR',
        year: 2020,
        watchProviderIds: [8, 119],
      }),
      'https://example.test',
    );

    expect(url.pathname).toBe('/api/discovery/leaving-soon');
    expect(url.searchParams.get('watchRegion')).toBe('TR');
    expect(url.searchParams.get('yearFrom')).toBe('2020');
    expect(url.searchParams.get('yearTo')).toBe('2020');
    expect(url.searchParams.get('sort')).toBe('leaving_asc');
    expect(url.searchParams.getAll('watchProviderId')).toEqual(['8', '119']);
    expect(url.searchParams.has('originCountry')).toBe(false);
  });

  it('keeps filters and sort through the route and the filter sheet', () => {
    const state = {
      ...createDefaultLeavingSoonState(),
      mediaType: 'tv' as const,
      sort: 'rating_desc' as const,
      genreIds: ['a', 'b'],
      originCountry: 'TR',
      watchProviderIds: [8],
    };

    expect(parseLeavingSoonParams(serializeLeavingSoonParams(state))).toEqual(state);
    expect(filterDraftToLeavingSoonState(leavingSoonStateToFilterDraft(state), state)).toEqual(
      state,
    );
    expect(serializeLeavingSoonParams(createDefaultLeavingSoonState())).toEqual({});
  });

  it('treats the sort as not a filter and keeps it when clearing', () => {
    const sorted = { ...createDefaultLeavingSoonState(), sort: 'title_asc' as const };

    expect(hasActiveLeavingSoonFilters(sorted)).toBe(false);
    expect(hasActiveLeavingSoonFilters({ ...sorted, minRating: 7 })).toBe(true);
    expect(clearLeavingSoonFilters({ ...sorted, minRating: 7 })).toEqual(sorted);
  });

  it('offers my platforms and hides the filters the server does not have', () => {
    expect(LEAVING_SOON_FILTER_SHEET_CONFIG.supportsMyPlatforms).toBe(true);
    expect(LEAVING_SOON_FILTER_SHEET_CONFIG.fields).not.toContain('keywords');
    expect(LEAVING_SOON_FILTER_SHEET_CONFIG.fields).not.toContain('tvStatus');
  });
});
