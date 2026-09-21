import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getHomeBrowse, getHomePersonalized } from '@/features/home/api/home-api';
import { getUpcomingCatalog } from '@/features/upcoming/api/upcoming-api';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';

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

  it('adds a catalog Coming Up section when personalized Coming Up is empty', async () => {
    (getUpcomingCatalog as jest.Mock).mockResolvedValue({
      items: [
        {
          contentId: 'movie-1',
          contentType: 'Movie',
          upcomingKind: 'MovieRelease',
          title: 'Avatar 4',
          posterPath: null,
          releaseDate: '2026-12-19',
          isFollowed: false,
        },
      ],
      page: 1,
      pageSize: 5,
      totalCount: 1,
      totalPages: 1,
    });

    const { result } = renderHook(() => useHomeFeed('all', 10), { wrapper: createWrapper() });

    await waitFor(() => {
      const comingUp = result.current.mergedSections.find((section) => section.type === 'ComingUp');
      expect(comingUp?.items).toHaveLength(1);
      expect(comingUp?.items[0]?.title).toBe('Avatar 4');
    });
  });
});
