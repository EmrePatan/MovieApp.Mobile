import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { markEpisodeWatched, markMovieWatched } from '@/features/watch-history/api/watch-history-api';
import {
  useToggleEpisodeWatched,
  useToggleMovieWatched,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';
import {
  episodeWatchStatusQueryKey,
  movieWatchStatusQueryKey,
  seasonProgressQueryKey,
  seasonWatchedEpisodesQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  markMovieWatched: jest.fn(),
  unmarkMovieWatched: jest.fn(),
  markEpisodeWatched: jest.fn(),
  unmarkEpisodeWatched: jest.fn(),
  bulkUpdateEpisodeWatchState: jest.fn(),
  bulkUpdateTvShowWatchState: jest.fn(),
  markThroughEpisode: jest.fn(),
}));

jest.mock('@/features/details/season/api/season-api', () => ({
  getSeason: jest.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe('watch toggle rollback', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const episodeId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears an optimistic movie watch when the previous cache snapshot was empty', async () => {
    (markMovieWatched as jest.Mock).mockRejectedValue(new Error('network'));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useToggleMovieWatched(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(false);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(movieWatchStatusQueryKey(movieId))).toBeUndefined();
  });

  it('restores the previous movie watch snapshot when the toggle fails', async () => {
    (markMovieWatched as jest.Mock).mockRejectedValue(new Error('network'));
    const queryClient = createQueryClient();
    const previous = { movieId, isWatched: false, watchedAt: null };
    queryClient.setQueryData(movieWatchStatusQueryKey(movieId), previous);

    const { result } = renderHook(() => useToggleMovieWatched(movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(false);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(movieWatchStatusQueryKey(movieId))).toEqual(previous);
  });

  it('clears optimistic episode watch caches when the previous snapshots were empty', async () => {
    (markEpisodeWatched as jest.Mock).mockRejectedValue(new Error('network'));
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useToggleEpisodeWatched(tvShowId, 1), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ episodeId, isWatched: false });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(episodeWatchStatusQueryKey(episodeId))).toBeUndefined();
    expect(
      queryClient.getQueryData(seasonWatchedEpisodesQueryKey(tvShowId, 1)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(seasonProgressQueryKey(tvShowId, 1))).toBeUndefined();
  });
});
