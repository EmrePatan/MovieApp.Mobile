import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailActionBar } from '@/features/details/shared/components/DetailActionBar';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useToggleTvShowWatched } from '@/features/watch-history/hooks/useWatchHistoryMutations';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';
import { useToggleFavorite } from '@/features/favorites/hooks/useFavoriteMutations';
import { useWatchlistMembership } from '@/features/watchlists/hooks/useWatchlists';

const mockToggleTvShow = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useMovieWatchStatus', () => ({
  useMovieWatchStatus: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('@/features/watch-history/hooks/useEpisodeWatchStatus', () => ({
  useEpisodeWatchStatus: jest.fn(() => ({ data: undefined, isLoading: false })),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleTvShowWatched: jest.fn(),
  useToggleMovieWatched: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useToggleEpisodeWatched: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
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

jest.mock('@/features/watchlists/components/WatchlistPickerModal', () => ({
  WatchlistPickerModal: () => null,
}));

const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

function setupProgress(overrides: {
  isFullyWatched?: boolean;
  regularTotalEpisodes?: number;
  regularWatchedEpisodes?: number;
} = {}) {
  (useTvShowProgress as jest.Mock).mockReturnValue({
    data: {
      tvShowId,
      totalEpisodes: overrides.regularTotalEpisodes ?? 60,
      watchedEpisodes: overrides.regularWatchedEpisodes ?? 0,
      progressPercentage: 0,
      regularTotalEpisodes: overrides.regularTotalEpisodes ?? 60,
      regularWatchedEpisodes: overrides.regularWatchedEpisodes ?? 0,
      isFullyWatched: overrides.isFullyWatched ?? false,
      nextEpisode: null,
      seasons: [],
    },
    isLoading: false,
  });
}

describe('TV Detail watched action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFavoriteStatus as jest.Mock).mockReturnValue({ data: false, isLoading: false });
    (useToggleFavorite as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (useWatchlistMembership as jest.Mock).mockReturnValue({ data: {}, isLoading: false });
    (useToggleTvShowWatched as jest.Mock).mockReturnValue({
      mutate: mockToggleTvShow,
      isPending: false,
    });
  });

  it('shows Watched on TV detail action row', () => {
    setupProgress();
    render(<DetailActionBar contentType="tv" contentId={tvShowId} showWatched />);
    expect(screen.getByText('Watched')).toBeTruthy();
  });

  it('keeps Watched inactive for partial progress', () => {
    setupProgress({ regularWatchedEpisodes: 34, regularTotalEpisodes: 60, isFullyWatched: false });
    render(<DetailActionBar contentType="tv" contentId={tvShowId} showWatched />);
    expect(screen.getByLabelText('Mark as watched').props.accessibilityState.selected).toBe(false);
  });

  it('marks Watched active when all regular episodes are watched', () => {
    setupProgress({ regularWatchedEpisodes: 60, regularTotalEpisodes: 60, isFullyWatched: true });
    render(<DetailActionBar contentType="tv" contentId={tvShowId} showWatched />);
    expect(screen.getByLabelText('Mark as unwatched').props.accessibilityState.selected).toBe(true);
  });

  it('uses one bulk TV mutation when tapping inactive Watched', () => {
    setupProgress({ regularWatchedEpisodes: 0, regularTotalEpisodes: 60, isFullyWatched: false });
    render(<DetailActionBar contentType="tv" contentId={tvShowId} showWatched />);

    fireEvent.press(screen.getByLabelText('Mark as watched'));

    expect(mockToggleTvShow).toHaveBeenCalledTimes(1);
    expect(mockToggleTvShow).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('uses one bulk TV mutation when tapping active Watched', () => {
    setupProgress({ regularWatchedEpisodes: 60, regularTotalEpisodes: 60, isFullyWatched: true });
    render(<DetailActionBar contentType="tv" contentId={tvShowId} showWatched />);

    fireEvent.press(screen.getByLabelText('Mark as unwatched'));

    expect(mockToggleTvShow).toHaveBeenCalledTimes(1);
    expect(mockToggleTvShow).toHaveBeenCalledWith(true, expect.any(Object));
  });
});
