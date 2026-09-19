import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  createMovieFollow,
  removeMovieFollow,
} from '@/features/follows/api/movie-follow-api';
import { movieFollowStatusQueryKey } from '@/features/follows/hooks/follow-query-keys';
import {
  useCreateMovieFollow,
  useRemoveMovieFollow,
} from '@/features/follows/hooks/useMovieFollowMutations';

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  createMovieFollow: jest.fn(),
  removeMovieFollow: jest.fn(),
}));

jest.mock('@/features/follows/utils/invalidate-follow-catalog-queries', () => ({
  invalidateFollowCatalogQueries: jest.fn(),
}));

jest.mock('@/features/follows/utils/home-coming-up-cache', () => ({
  removeFollowedCatalogFromHomeCaches: jest.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('movie follow mutations', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('optimistically follows before create resolves', async () => {
    let resolveCreate!: (value: { isFollowing: boolean }) => void;
    (createMovieFollow as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(movieFollowStatusQueryKey(movieId), { isFollowing: false });

    const { result } = renderHook(() => useCreateMovieFollow(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() =>
      expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
        isFollowing: true,
      }),
    );

    resolveCreate({ isFollowing: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back optimistic follow when create fails', async () => {
    (createMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(movieFollowStatusQueryKey(movieId), { isFollowing: false });

    const { result } = renderHook(() => useCreateMovieFollow(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
      isFollowing: false,
    });
  });

  it('optimistically unfollows before remove resolves', async () => {
    let resolveRemove!: () => void;
    (removeMovieFollow as jest.Mock).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRemove = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(movieFollowStatusQueryKey(movieId), { isFollowing: true });

    const { result } = renderHook(() => useRemoveMovieFollow(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() =>
      expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
        isFollowing: false,
      }),
    );

    resolveRemove();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back optimistic unfollow when remove fails', async () => {
    (removeMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(movieFollowStatusQueryKey(movieId), { isFollowing: true });

    const { result } = renderHook(() => useRemoveMovieFollow(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
      isFollowing: true,
    });
  });
});
