import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getHomeBrowse, getHomePersonalized } from '@/features/home/api/home-api';
import { getNowInTheaters, getOnTvThisWeek } from '@/features/discovery/api/discovery-api';
import { getUpcomingCatalog } from '@/features/upcoming/api/upcoming-api';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import { resolveHomeSectionTitle } from '@/features/home/utils/resolve-home-section-title';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

function upcomingCatalogItem(
  overrides: Partial<UpcomingCatalogItem> & Pick<UpcomingCatalogItem, 'id' | 'title'>,
): UpcomingCatalogItem {
  return {
    type: 'movie',
    upcomingKind: 'MovieRelease',
    originalTitle: overrides.title,
    overview: '',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2026-12-19',
    voteAverage: 0,
    voteCount: 0,
    year: 2026,
    isFollowed: false,
    ...overrides,
  };
}

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isSessionRestored: true,
    isLoading: false,
    user: { id: 'user-id' },
    token: 'token',
  }),
}));

jest.mock('@/features/home/api/home-api', () => ({
  getHomeBrowse: jest.fn(),
  getHomePersonalized: jest.fn(),
  getHome: jest.fn(),
  buildHomeQueryString: jest.fn(),
}));

jest.mock('@/features/upcoming/api/upcoming-api', () => ({
  getUpcomingCatalog: jest.fn(),
}));

jest.mock('@/features/home/storage/home-personalized-cache', () => ({
  readHomePersonalizedCache: jest.fn().mockResolvedValue(null),
  writeHomePersonalizedCache: jest.fn(),
}));

jest.mock('@/features/discovery/api/discovery-api', () => ({
  getOnTvThisWeek: jest.fn().mockResolvedValue({
    items: [],
    page: 1,
    pageSize: 8,
    totalCount: 0,
    totalPages: 0,
  }),
  getNowInTheaters: jest.fn().mockResolvedValue({
    items: [],
    page: 1,
    pageSize: 8,
    totalCount: 0,
    totalPages: 0,
  }),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: () => ({
    region: 'TR',
    source: 'saved',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useHomeFeed', () => {
  beforeAll(async () => {
    await initI18nForTests('en');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getHomeBrowse as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'Trending',
          title: 'Trending Now',
          displayOrder: 1,
          items: [
            {
              id: '1',
              contentType: 'movie',
              title: 'Trending',
              originalTitle: null,
              posterUrl: null,
              backdropUrl: null,
              releaseDate: null,
              voteAverage: 8,
              voteCount: 10,
            },
          ],
        },
      ],
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });
    (getHomePersonalized as jest.Mock).mockResolvedValue({
      sections: [],
      isPersonalized: false,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });
    (getUpcomingCatalog as jest.Mock).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 5,
      totalCount: 0,
      totalPages: 0,
    });
  });

  it('starts browse and personalized requests independently', async () => {
    renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getHomeBrowse).toHaveBeenCalledTimes(1);
      expect(getHomePersonalized).toHaveBeenCalledTimes(1);
    });
  });

  it('does not fetch home endpoints while the home screen is inactive', async () => {
    renderHook(() => useHomeFeed('all', 10, { screenActive: false }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getHomeBrowse).not.toHaveBeenCalled();
      expect(getHomePersonalized).not.toHaveBeenCalled();
      expect(getUpcomingCatalog).not.toHaveBeenCalled();
    });
  });

  it('refetches browse and personalized in parallel', async () => {
    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getHomeBrowse).toHaveBeenCalledTimes(1);
      expect(getHomePersonalized).toHaveBeenCalledTimes(1);
    });

    await result.current.refetch();

    expect(getHomeBrowse).toHaveBeenCalledTimes(2);
    expect(getHomePersonalized).toHaveBeenCalledTimes(2);
    expect(getUpcomingCatalog).toHaveBeenCalled();
  });

  it('does not refetch the catalog Coming Up fallback once personalized Coming Up is present', async () => {
    (getHomePersonalized as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'ComingUp',
          title: 'Coming Up',
          displayOrder: 0,
          items: [
            {
              id: 'followed-1',
              contentType: 'movie',
              title: 'Followed Release',
              originalTitle: null,
              posterUrl: '/followed.jpg',
              backdropUrl: null,
              releaseDate: '2026-12-19',
              voteAverage: 0,
              voteCount: 0,
            },
          ],
        },
      ],
      isPersonalized: true,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.mergedSections.some((section) => section.type === 'ComingUp')).toBe(
        true,
      );
    });

    const catalogCallsAfterLoad = (getUpcomingCatalog as jest.Mock).mock.calls.length;
    await result.current.refetch();

    expect(getHomeBrowse).toHaveBeenCalledTimes(2);
    expect(getHomePersonalized).toHaveBeenCalledTimes(2);
    expect(getUpcomingCatalog).toHaveBeenCalledTimes(catalogCallsAfterLoad);
  });

  it('skips catalog Coming Up titles without posters', async () => {
    (getUpcomingCatalog as jest.Mock).mockResolvedValue({
      items: [upcomingCatalogItem({ id: 'movie-1', title: 'Avatar 4', posterUrl: null })],
      page: 1,
      pageSize: 40,
      totalCount: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getUpcomingCatalog).toHaveBeenCalled();
    });

    expect(
      result.current.mergedSections.find((section) => section.type === 'ComingUp'),
    ).toBeUndefined();
  });

  it('adds a catalog Coming Up section when personalized Coming Up is empty', async () => {
    (getUpcomingCatalog as jest.Mock).mockResolvedValue({
      items: [
        upcomingCatalogItem({
          id: 'movie-1',
          title: 'Avatar 4',
          posterUrl: 'https://image.tmdb.org/t/p/w500/avatar.jpg',
        }),
      ],
      page: 1,
      pageSize: 40,
      totalCount: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      const comingUp = result.current.mergedSections.find((section) => section.type === 'ComingUp');
      expect(comingUp?.items).toHaveLength(1);
      expect(comingUp?.items[0]?.title).toBe('Avatar 4');
      expect(comingUp?.comingUpSource).toBe('catalog');
      expect(
        resolveHomeSectionTitle('ComingUp', comingUp?.title ?? '', t, {
          comingUpSource: comingUp?.comingUpSource,
        }),
      ).toBe('Coming Up');
    });
  });

  it('marks personalized Coming Up with the personalized source for title localization', async () => {
    (getHomePersonalized as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'ComingUp',
          title: 'Coming Up',
          displayOrder: 0,
          items: [
            {
              id: 'followed-1',
              contentType: 'movie',
              title: 'Followed Release',
              originalTitle: null,
              posterUrl: '/followed.jpg',
              backdropUrl: null,
              releaseDate: '2026-12-19',
              voteAverage: 0,
              voteCount: 0,
            },
          ],
        },
      ],
      isPersonalized: true,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      const comingUp = result.current.mergedSections.find((section) => section.type === 'ComingUp');
      expect(comingUp?.comingUpSource).toBe('for-you');
      expect(
        resolveHomeSectionTitle('ComingUp', comingUp?.title ?? '', t, {
          comingUpSource: comingUp?.comingUpSource,
        }),
      ).toBe('Coming Up');
    });
  });

  it('keeps a backend for-you Coming Up source', async () => {
    (getHomePersonalized as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'ComingUp',
          title: 'Coming Up',
          displayOrder: 0,
          comingUpSource: 'for-you',
          items: [
            {
              id: 'followed-1',
              contentType: 'movie',
              title: 'Followed Release',
              originalTitle: null,
              posterUrl: '/followed.jpg',
              backdropUrl: null,
              releaseDate: '2026-12-19',
              voteAverage: 0,
              voteCount: 0,
            },
          ],
        },
      ],
      isPersonalized: true,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        result.current.mergedSections.find((section) => section.type === 'ComingUp')
          ?.comingUpSource,
      ).toBe('for-you');
    });
  });

  it('fills On TV and Now in Theaters from discovery when home browse omits them', async () => {
    (getOnTvThisWeek as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'tv-1',
          type: 'tv',
          title: 'Airing Drama',
          originalTitle: 'Airing Drama',
          posterUrl: '/tv.jpg',
          backdropUrl: null,
          releaseDate: '2026-01-01',
          voteAverage: 8,
          voteCount: 40,
        },
        {
          id: 'person-1',
          type: 'person',
          title: 'Not A Title',
        },
      ],
      page: 1,
      pageSize: 8,
      totalCount: 1,
      totalPages: 1,
    });
    (getNowInTheaters as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 'movie-1',
          type: 'movie',
          title: 'In Theaters',
          originalTitle: 'In Theaters',
          posterUrl: '/movie.jpg',
          backdropUrl: null,
          releaseDate: '2026-01-01',
          voteAverage: 7,
          voteCount: 20,
        },
      ],
      page: 1,
      pageSize: 8,
      totalCount: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      const types = result.current.mergedSections.map((section) => section.type);
      expect(types).toEqual(expect.arrayContaining(['OnTvThisWeek', 'NowInTheaters']));
    });

    const onTv = result.current.mergedSections.find((section) => section.type === 'OnTvThisWeek');
    expect(onTv?.items.map((item) => item.title)).toEqual(['Airing Drama']);
    expect(
      result.current.mergedSections.find((section) => section.type === 'NowInTheaters')?.items[0]
        ?.title,
    ).toBe('In Theaters');
  });

  it('does not fetch On TV or theaters again when home browse already returned them', async () => {
    (getHomeBrowse as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'OnTvThisWeek',
          title: 'On TV This Week',
          displayOrder: 1,
          items: [
            {
              id: 'tv-1',
              contentType: 'tv',
              title: 'From Home',
              originalTitle: null,
              posterUrl: null,
              backdropUrl: null,
              releaseDate: null,
              voteAverage: 8,
              voteCount: 10,
            },
          ],
        },
        {
          type: 'NowInTheaters',
          title: 'Now in Theaters',
          displayOrder: 2,
          items: [
            {
              id: 'movie-1',
              contentType: 'movie',
              title: 'From Home',
              originalTitle: null,
              posterUrl: null,
              backdropUrl: null,
              releaseDate: null,
              voteAverage: 7,
              voteCount: 10,
            },
          ],
        },
      ],
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        result.current.mergedSections.find((section) => section.type === 'OnTvThisWeek')?.items[0]
          ?.title,
      ).toBe('From Home');
    });

    expect(getOnTvThisWeek).not.toHaveBeenCalled();
    expect(getNowInTheaters).not.toHaveBeenCalled();
  });
});
