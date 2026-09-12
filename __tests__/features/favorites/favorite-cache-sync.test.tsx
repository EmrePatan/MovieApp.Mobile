import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  removeMovieFavorite,
  removeTvFavorite,
} from '@/features/favorites/api/favorites-api';
import {
  favoriteStatusQueryKey,
  favoritesInfiniteQueryKey,
} from '@/features/favorites/hooks/favorite-query-keys';
import {
  useRemoveFavoriteMutation,
  useToggleFavorite,
} from '@/features/favorites/hooks/useFavoriteMutations';

jest.mock('@/features/favorites/api/favorites-api', () => ({
  addMovieFavorite: jest.fn(),
  addTvFavorite: jest.fn(),
  removeMovieFavorite: jest.fn(),
  removeTvFavorite: jest.fn(),
}));

jest.mock('@/features/recommendations/utils/invalidate-recommendation-queries', () => ({
  invalidateRecommendationQueries: jest.fn(),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('favorite cache synchronization', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates detail favorite state when removing from favorites list', async () => {
    (removeMovieFavorite as jest.Mock).mockResolvedValue(undefined);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(favoriteStatusQueryKey('movie', movieId), true);

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRemoveFavoriteMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ contentType: 'movie', contentId: movieId });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId))).toBe(false);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favorites'] });
  });

  it('invalidates favorites list when toggling from detail', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(favoriteStatusQueryKey('tv', tvShowId), true);
    queryClient.setQueryData(favoritesInfiniteQueryKey(20), { pages: [], pageParams: [1] });

    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { removeTvFavorite: removeTvFavoriteMock } = jest.requireMock(
      '@/features/favorites/api/favorites-api',
    );
    removeTvFavoriteMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleFavorite('tv', tvShowId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favorites'] });
    expect(queryClient.getQueryData(favoriteStatusQueryKey('tv', tvShowId))).toBe(false);
  });

  it('restores detail favorite state when toggle mutation fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(favoriteStatusQueryKey('movie', movieId), true);

    const { addMovieFavorite: addMovieFavoriteMock } = jest.requireMock(
      '@/features/favorites/api/favorites-api',
    );
    addMovieFavoriteMock.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useToggleFavorite('movie', movieId), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(false);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId))).toBe(true);
  });

  it('invalidates favorites list when removing tv favorite from list', async () => {
    (removeTvFavorite as jest.Mock).mockResolvedValue(undefined);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRemoveFavoriteMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ contentType: 'tv', contentId: tvShowId });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: favoriteStatusQueryKey('tv', tvShowId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['favorites'] });
  });
});
