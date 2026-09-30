import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getHomePersonalized } from '@/features/home/api/home-api';
import {
  homePersonalizedQueryKey,
  useHomePersonalized,
} from '@/features/home/hooks/useHomePersonalized';
import {
  readHomePersonalizedCache,
  writeHomePersonalizedCache,
} from '@/features/home/storage/home-personalized-cache';

const authState = {
  isAuthenticated: true,
  isSessionRestored: true,
  user: { id: 'user-a' },
};

const regionState = {
  region: 'TR',
  isHydrated: true,
};

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => authState,
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: () => regionState,
}));

jest.mock('@/features/home/api/home-api', () => ({
  getHomePersonalized: jest.fn(),
}));

jest.mock('@/features/home/storage/home-personalized-cache', () => ({
  readHomePersonalizedCache: jest.fn(),
  writeHomePersonalizedCache: jest.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useHomePersonalized', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authState.user = { id: 'user-a' };
    regionState.region = 'TR';
    (readHomePersonalizedCache as jest.Mock).mockResolvedValue(null);
    (getHomePersonalized as jest.Mock).mockResolvedValue({
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-02T00:00:00Z',
    });
  });

  it('hydrates cached personalized content before network completes', async () => {
    (readHomePersonalizedCache as jest.Mock).mockResolvedValue({
      sections: [
        {
          type: 'RecommendedForYou',
          title: 'Recommended For You',
          displayOrder: 1,
          items: [],
        },
      ],
      isPersonalized: true,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    let resolveNetwork!: (value: {
      sections: [];
      isPersonalized: boolean;
      generatedAtUtc: string;
    }) => void;
    (getHomePersonalized as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveNetwork = resolve;
        }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data?.generatedAtUtc).toBe('2026-01-01T00:00:00Z');
    });

    resolveNetwork({
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-02T00:00:00Z',
    });

    await waitFor(() => {
      expect(result.current.data?.generatedAtUtc).toBe('2026-01-02T00:00:00Z');
    });
  });

  it('does not let late disk hydration overwrite newer network data', async () => {
    let resolveCache!: (value: unknown) => void;
    (readHomePersonalizedCache as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCache = resolve;
        }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const queryKey = homePersonalizedQueryKey('user-a', 'all', 10, 'TR');
    queryClient.setQueryData(queryKey, {
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-02T00:00:00Z',
    });

    renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      resolveCache({
        sections: [],
        isPersonalized: true,
        generatedAtUtc: '2026-01-01T00:00:00Z',
      });
      await Promise.resolve();
    });

    expect(queryClient.getQueryData(queryKey)).toEqual({
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-02T00:00:00Z',
    });
  });

  it('keeps same-key data visible during a background refetch', async () => {
    let resolveNetwork!: (value: {
      sections: [];
      isPersonalized: boolean;
      generatedAtUtc: string;
    }) => void;
    (getHomePersonalized as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveNetwork = resolve;
        }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const queryKey = homePersonalizedQueryKey('user-a', 'all', 10, 'TR');
    queryClient.setQueryData(queryKey, {
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(true);
    });

    expect(result.current.data?.generatedAtUtc).toBe('2026-01-01T00:00:00Z');

    resolveNetwork({
      sections: [],
      isPersonalized: true,
      generatedAtUtc: '2026-01-02T00:00:00Z',
    });

    await waitFor(() => {
      expect(result.current.data?.generatedAtUtc).toBe('2026-01-02T00:00:00Z');
      expect(result.current.isFetching).toBe(false);
    });
  });

  it('does not show another user personalized data when the query key changes', async () => {
    (getHomePersonalized as jest.Mock).mockImplementation(() => new Promise(() => undefined));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const userAKey = homePersonalizedQueryKey('user-a', 'all', 10, 'TR');
    queryClient.setQueryData(userAKey, {
      sections: [],
      isPersonalized: true,
      generatedAtUtc: 'user-a-data',
    });

    const { result, rerender } = renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    authState.user = { id: 'user-b' };
    rerender({});

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
    expect(result.current.data?.generatedAtUtc).not.toBe('user-a-data');
  });

  it('does not show another region personalized data when the query key changes', async () => {
    (getHomePersonalized as jest.Mock).mockImplementation(() => new Promise(() => undefined));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const trKey = homePersonalizedQueryKey('user-a', 'all', 10, 'TR');
    queryClient.setQueryData(trKey, {
      sections: [],
      isPersonalized: true,
      generatedAtUtc: 'tr-data',
    });

    const { result, rerender } = renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    regionState.region = 'US';
    rerender({});

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
    expect(result.current.data?.generatedAtUtc).not.toBe('tr-data');
  });

  it('does not reuse personalized data from another section size key', async () => {
    (getHomePersonalized as jest.Mock).mockImplementation(() => new Promise(() => undefined));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const size10Key = homePersonalizedQueryKey('user-a', 'all', 10, 'TR');
    queryClient.setQueryData(size10Key, {
      sections: [],
      isPersonalized: true,
      generatedAtUtc: 'size-10-data',
    });

    const { result } = renderHook(() => useHomePersonalized('all', 5), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });
    expect(result.current.data?.generatedAtUtc).not.toBe('size-10-data');
  });

  it('persists successful network responses', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(writeHomePersonalizedCache).toHaveBeenCalledWith(
        'user-a',
        'all',
        10,
        'TR',
        expect.objectContaining({ generatedAtUtc: '2026-01-02T00:00:00Z' }),
      );
    });
  });

  it('scopes TanStack cache keys by authenticated user id', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderHook(() => useHomePersonalized('all', 10), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().find({
          queryKey: homePersonalizedQueryKey('user-a', 'all', 10, 'TR'),
        }),
      ).toBeTruthy();
    });
  });
});
