import React from 'react';
import { render, screen } from '@testing-library/react-native';
import UpcomingScreen from '../../../app/upcoming';
import { useAuth } from '@/auth/useAuth';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/upcoming/hooks/useUpcomingCatalog', () => ({
  useUpcomingCatalog: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

describe('UpcomingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('renders empty state when there are no upcoming items', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [] }] },
      isLoading: false,
      isError: false,
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<UpcomingScreen />);

    expect(screen.getByText('Nothing upcoming yet')).toBeTruthy();
  });

  it('renders TV episode and movie items with discrimination', () => {
    (useUpcomingCatalog as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'tv-id',
                type: 'tv',
                upcomingKind: 'TvEpisode',
                title: 'Severance',
                originalTitle: 'Severance',
                overview: '',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2026-09-20',
                voteAverage: 0,
                voteCount: 0,
                year: 2026,
                isFollowed: true,
                episodeId: 'episode-id',
                seasonNumber: 1,
                episodeNumber: 2,
                episodeName: 'Good News About Hell',
              },
              {
                id: 'movie-id',
                type: 'movie',
                upcomingKind: 'MovieRelease',
                title: 'Avatar 4',
                originalTitle: 'Avatar 4',
                overview: '',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2026-12-19',
                voteAverage: 8,
                voteCount: 10,
                year: 2026,
                isFollowed: false,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      isRefetching: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    });

    render(<UpcomingScreen />);

    expect(screen.getByText('Severance')).toBeTruthy();
    expect(screen.getByText('S01 E02 · Good News About Hell')).toBeTruthy();
    expect(screen.getByText('Avatar 4')).toBeTruthy();
  });
});
