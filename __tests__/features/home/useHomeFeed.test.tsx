import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getHomeBrowse, getHomePersonalized } from '@/features/home/api/home-api';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';

jest.mock('@/features/home/api/home-api', () => ({
  getHomeBrowse: jest.fn(),
  getHomePersonalized: jest.fn(),
  getHome: jest.fn(),
  buildHomeQueryString: jest.fn(),
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
  });
});
