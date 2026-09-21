import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { resolveTvShowFollowRemoval } from '@/features/follows/utils/resolve-follow-removal';
import { resolveTvShowFollowUpsert } from '@/features/follows/utils/resolve-follow-upsert';
import { tvShowFollowStatusQueryKey } from '@/features/follows/hooks/follow-query-keys';
import {
  useCreateTvShowFollow,
  useRemoveTvShowFollow,
  useUpdateTvShowFollow,
} from '@/features/follows/hooks/useTvShowFollowMutations';

jest.mock('@/features/follows/utils/resolve-follow-removal', () => ({
  resolveTvShowFollowRemoval: jest.fn(),
}));

jest.mock('@/features/follows/utils/resolve-follow-upsert', () => ({
  resolveTvShowFollowUpsert: jest.fn(),
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

describe('tv show follow mutations', () => {
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  const initialStatus = {
    isFollowing: true,
    notifyNewSeasons: true,
    notifyNewEpisodes: true,
    baselineEstablished: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('optimistically updates preferences before update resolves', async () => {
    let resolveUpdate!: (value: typeof initialStatus) => void;
    (resolveTvShowFollowUpsert as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), initialStatus);

    const { result } = renderHook(() => useUpdateTvShowFollow(tvShowId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ notifyNewSeasons: true, notifyNewEpisodes: false });

    await waitFor(() =>
      expect(queryClient.getQueryData(tvShowFollowStatusQueryKey(tvShowId))).toEqual({
        ...initialStatus,
        notifyNewEpisodes: false,
      }),
    );

    resolveUpdate({
      ...initialStatus,
      notifyNewEpisodes: false,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back optimistic preference update when update fails', async () => {
    (resolveTvShowFollowUpsert as jest.Mock).mockRejectedValue(new Error('Network error'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), initialStatus);

    const { result } = renderHook(() => useUpdateTvShowFollow(tvShowId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ notifyNewSeasons: false, notifyNewEpisodes: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(tvShowFollowStatusQueryKey(tvShowId))).toEqual(initialStatus);
  });

  it('optimistically unfollows before remove resolves', async () => {
    let resolveRemove!: () => void;
    (resolveTvShowFollowRemoval as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemove = () =>
            resolve({
              isFollowing: false,
              notifyNewSeasons: true,
              notifyNewEpisodes: true,
              baselineEstablished: false,
            });
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), initialStatus);

    const { result } = renderHook(() => useRemoveTvShowFollow(tvShowId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() =>
      expect(queryClient.getQueryData(tvShowFollowStatusQueryKey(tvShowId))).toEqual({
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      }),
    );

    resolveRemove();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('optimistically follows before create resolves', async () => {
    let resolveCreate!: (value: typeof initialStatus) => void;
    (resolveTvShowFollowUpsert as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), {
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: false,
    });

    const { result } = renderHook(() => useCreateTvShowFollow(tvShowId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ notifyNewSeasons: true, notifyNewEpisodes: false });

    await waitFor(() =>
      expect(queryClient.getQueryData(tvShowFollowStatusQueryKey(tvShowId))).toEqual({
        isFollowing: true,
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
        baselineEstablished: false,
      }),
    );

    resolveCreate({
      isFollowing: true,
      notifyNewSeasons: true,
      notifyNewEpisodes: false,
      baselineEstablished: true,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
