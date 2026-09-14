import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailActionBar } from '@/features/details/shared/components/DetailActionBar';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';
import { useToggleFavorite } from '@/features/favorites/hooks/useFavoriteMutations';
import { useWatchlistMembership } from '@/features/watchlists/hooks/useWatchlists';
import { useMovieWatchStatus } from '@/features/watch-history/hooks/useMovieWatchStatus';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import {
  useToggleMovieWatched,
  useToggleTvShowWatched,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';

const mockFavoriteMutate = jest.fn();
const mockWatchedMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/favorites/hooks/useFavoriteStatus', () => ({
  useFavoriteStatus: jest.fn(),
}));

jest.mock('@/features/favorites/hooks/useFavoriteMutations', () => ({
  useToggleFavorite: jest.fn(),
}));

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlistMembership: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useMovieWatchStatus', () => ({
  useMovieWatchStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useEpisodeWatchStatus', () => ({
  useEpisodeWatchStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleMovieWatched: jest.fn(),
  useToggleTvShowWatched: jest.fn(),
  useToggleEpisodeWatched: jest.fn(),
}));

jest.mock('@/features/watchlists/components/WatchlistPickerModal', () => ({
  WatchlistPickerModal: () => null,
}));

jest.mock('@/features/follows/components/FollowButton', () => ({
  FollowButton: () => null,
}));

describe('DetailActionBar premium circular actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFavoriteStatus as jest.Mock).mockReturnValue({ data: false, isLoading: false });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: mockFavoriteMutate, isPending: false });
    (useWatchlistMembership as jest.Mock).mockReturnValue({ data: {}, isLoading: false });
    (useMovieWatchStatus as jest.Mock).mockReturnValue({ data: { isWatched: false }, isLoading: false });
    (useTvShowProgress as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
    (useToggleMovieWatched as jest.Mock).mockReturnValue({ mutate: mockWatchedMutate, isPending: false });
    (useToggleTvShowWatched as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
  });

  it('renders circular action labels', () => {
    render(<DetailActionBar contentType="movie" contentId="movie-id" showWatched />);

    expect(screen.getByText('Favorite')).toBeTruthy();
    expect(screen.getByText('Watchlist')).toBeTruthy();
    expect(screen.getByText('Watched')).toBeTruthy();
  });

  it('submits favorite mutation without extra calls', () => {
    render(<DetailActionBar contentType="movie" contentId="movie-id" showWatched />);

    fireEvent.press(screen.getByLabelText('Add to favorites'));

    expect(mockFavoriteMutate).toHaveBeenCalledTimes(1);
    expect(mockFavoriteMutate).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('shows loading accessibility state while favorite mutation is pending', () => {
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: mockFavoriteMutate, isPending: true });

    render(<DetailActionBar contentType="movie" contentId="movie-id" showWatched />);

    expect(screen.getByLabelText('Add to favorites').props.accessibilityState.busy).toBe(true);
  });
});
