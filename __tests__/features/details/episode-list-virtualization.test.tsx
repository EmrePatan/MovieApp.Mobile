import React from 'react';
import { FlatList } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { EpisodeList } from '@/features/details/season/components/EpisodeList';
import { useAuth } from '@/auth/useAuth';
import { useSeasonWatchedEpisodes } from '@/features/watch-history/hooks/useSeasonWatchedEpisodes';

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: () => true,
  }),
}));

jest.mock('@/features/watch-history/hooks/useSeasonWatchedEpisodes', () => ({
  useSeasonWatchedEpisodes: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleEpisodeWatched: () => ({ mutate: jest.fn(), isPending: false }),
  useMarkThroughEpisode: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/features/details/shared/components/CatalogImage', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CatalogImage: () => React.createElement(View, { testID: 'catalog-image-stub' }),
  };
});

const episodes = Array.from({ length: 30 }, (_, index) => ({
  id: `episode-${index + 1}`,
  episodeNumber: index + 1,
  name: `Episode ${index + 1}`,
  airDate: '2008-01-20',
  runtimeMinutes: 48,
  stillPath: '/still.jpg',
  voteAverage: 8,
  voteCount: 10,
}));

describe('EpisodeList virtualization', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useSeasonWatchedEpisodes as jest.Mock).mockReturnValue({
      data: { watchedEpisodeIds: ['episode-1'] },
      isLoading: false,
      isError: false,
    });
  });

  it('renders a FlatList for large episode collections', () => {
    const { UNSAFE_getByType } = render(
      <EpisodeList tvShowId="tv-id" seasonNumber={1} episodes={episodes} />,
    );

    expect(UNSAFE_getByType(FlatList)).toBeTruthy();
    expect(screen.getByText('Episodes')).toBeTruthy();
    expect(screen.getByTestId('episode-row-1')).toBeTruthy();
  });
});
