import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { EpisodeList } from '@/features/details/season/components/EpisodeList';
import { useAuth } from '@/auth/useAuth';
import { useSeasonWatchedEpisodes } from '@/features/watch-history/hooks/useSeasonWatchedEpisodes';
import {
  useMarkThroughEpisode,
  useToggleEpisodeWatched,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';

const mockPush = jest.fn();
const mockMutate = jest.fn();
const mockMarkThroughMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/watch-history/hooks/useSeasonWatchedEpisodes', () => ({
  useSeasonWatchedEpisodes: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleEpisodeWatched: jest.fn(),
  useMarkThroughEpisode: jest.fn(),
}));

jest.mock('@/features/details/shared/components/CatalogImage', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CatalogImage: () => React.createElement(View, { testID: 'catalog-image-stub' }),
  };
});

const episodes = [
  {
    id: 'episode-1',
    episodeNumber: 1,
    name: 'Pilot',
    airDate: '2008-01-20',
    runtimeMinutes: 58,
    stillPath: '/still-1.jpg',
    voteAverage: 8.2,
    voteCount: 100,
  },
  {
    id: 'episode-2',
    episodeNumber: 2,
    name: 'Cat\'s in the Bag...',
    airDate: '2008-01-27',
    runtimeMinutes: 48,
    stillPath: '/still-2.jpg',
    voteAverage: 8.0,
    voteCount: 90,
  },
];

function setupMocks({
  watchedEpisodeIds = ['episode-1'] as string[],
  isAuthenticated = true,
}: {
  watchedEpisodeIds?: string[];
  isAuthenticated?: boolean;
} = {}) {
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated });
  (useSeasonWatchedEpisodes as jest.Mock).mockReturnValue({
    data: {
      tvShowId: 'tv-id',
      seasonNumber: 1,
      watchedEpisodeIds,
    },
    isLoading: false,
    isError: false,
  });
  (useToggleEpisodeWatched as jest.Mock).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });
  (useMarkThroughEpisode as jest.Mock).mockReturnValue({
    mutate: mockMarkThroughMutate,
    isPending: false,
  });
}

describe('EpisodeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    setupMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  it('renders watched and unwatched episode states with always-visible controls', () => {
    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    expect(screen.getByText('E1 · Pilot')).toBeTruthy();
    expect(screen.getByText(/Watched/)).toBeTruthy();
    expect(screen.getByTestId('episode-watched-toggle-1')).toBeTruthy();
    expect(screen.getByTestId('episode-watched-toggle-2')).toBeTruthy();
    expect(screen.queryByTestId('episode-select-mode-button')).toBeNull();
  });

  it('marks an episode watched when the left control is pressed', () => {
    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    fireEvent.press(screen.getByTestId('episode-watched-toggle-2'));

    expect(mockMutate).toHaveBeenCalledWith(false);
  });

  it('navigates to episode detail when the content area is pressed', () => {
    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    fireEvent.press(screen.getByTestId('episode-content-2'));

    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id/season/1/episode/2');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('does not show bulk selection UI', () => {
    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    expect(screen.queryByText('Select')).toBeNull();
    expect(screen.queryByText('Select All')).toBeNull();
    expect(screen.queryByTestId('episode-bulk-action-bar')).toBeNull();
  });

  it('hides watched controls when logged out', () => {
    setupMocks({ isAuthenticated: false });

    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    expect(screen.queryByTestId('episode-watched-toggle-1')).toBeNull();
    fireEvent.press(screen.getByTestId('episode-content-1'));
    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id/season/1/episode/1');
  });

  it('opens mark-through action from long press on episode content', () => {
    render(<EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />);

    fireEvent(screen.getByTestId('episode-content-2'), 'onLongPress');

    expect(Alert.alert).toHaveBeenCalled();
  });
});
