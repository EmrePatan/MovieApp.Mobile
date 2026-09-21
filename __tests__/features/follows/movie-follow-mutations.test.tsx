import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { resolveMovieFollowRemoval } from '@/features/follows/utils/resolve-follow-removal';
import { resolveMovieFollowUpsert } from '@/features/follows/utils/resolve-movie-follow-upsert';
import { movieFollowStatusQueryKey } from '@/features/follows/hooks/follow-query-keys';
import {
  useCreateMovieFollow,
  useRemoveMovieFollow,
} from '@/features/follows/hooks/useMovieFollowMutations';

jest.mock('@/features/follows/utils/resolve-follow-removal', () => ({
  resolveMovieFollowRemoval: jest.fn(),
}));

jest.mock('@/features/follows/utils/resolve-movie-follow-upsert', () => ({
  resolveMovieFollowUpsert: jest.fn(),
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
    (resolveMovieFollowUpsert as jest.Mock).mockImplementation(
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
    (resolveMovieFollowUpsert as jest.Mock).mockRejectedValue(new Error('Network error'));

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
    (resolveMovieFollowRemoval as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemove = () => resolve({ isFollowing: false });
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
    (resolveMovieFollowRemoval as jest.Mock).mockRejectedValue(new Error('Network error'));

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
