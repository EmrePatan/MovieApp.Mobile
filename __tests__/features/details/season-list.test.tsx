import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useSeasonCatalog } from '@/features/details/season/hooks/useSeasonCatalog';
import {
  SeasonList,
  SeasonListItemProgress,
} from '@/features/details/tv/components/SeasonList';
import { useAuth } from '@/auth/useAuth';
import { useSeasonProgress } from '@/features/watch-history/hooks/useSeasonProgress';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useToggleSeasonWatched } from '@/features/watch-history/hooks/useWatchHistoryMutations';

const mockPush = jest.fn();
const mockSeasonMutate = jest.fn();
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

jest.mock('@/features/watch-history/hooks/useSeasonProgress', () => ({
  useSeasonProgress: jest.fn(),
}));

jest.mock('@/features/details/season/hooks/useSeasonCatalog', () => ({
  useSeasonCatalog: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleSeasonWatched: jest.fn(),
}));

const seasons = [
  {
    id: 'season-1',
    seasonNumber: 1,
    name: 'Season 1',
    airDate: '2008-01-20',
    episodeCount: 22,
    posterPath: null,
  },
  {
    id: 'season-2',
    seasonNumber: 2,
    name: 'Season 2',
    airDate: '2009-03-08',
    episodeCount: 13,
    posterPath: null,
  },
];

function setupMocks() {
  (useSeasonCatalog as jest.Mock).mockReturnValue({
    data: {
      episodes: Array.from({ length: 22 }, (_, index) => ({
        id: `episode-${index + 1}`,
        episodeNumber: index + 1,
        name: `Episode ${index + 1}`,
        overview: null,
        airDate: null,
        runtimeMinutes: null,
        stillPath: null,
        voteAverage: 0,
      })),
    },
    isLoading: false,
    isError: false,
  });
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  (useTvShowProgress as jest.Mock).mockReturnValue({
    data: {
      tvShowId: 'tv-id',
      totalEpisodes: 35,
      watchedEpisodes: 14,
      progressPercentage: 40,
      nextEpisode: null,
    },
    isLoading: false,
    isError: false,
  });
  (useSeasonProgress as jest.Mock).mockImplementation(
    (_tvShowId: string, seasonNumber: number) => ({
      data: {
        tvShowId: 'tv-id',
        seasonNumber,
        totalEpisodes: seasonNumber === 1 ? 22 : 13,
        watchedEpisodes: seasonNumber === 1 ? 14 : 0,
        progressPercentage: seasonNumber === 1 ? 63.64 : 0,
        nextEpisode: null,
      },
      isLoading: false,
      isError: false,
    }),
  );
  (useToggleSeasonWatched as jest.Mock).mockReturnValue({
    mutate: mockSeasonMutate,
    isPending: false,
  });
}

describe('SeasonList progress UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
    setupMocks();
  });

  it('shows an overall TV watched summary and per-season progress bars', () => {
    render(<SeasonList tvShowId="tv-id" seasons={seasons} />);

    expect(screen.getByText('Seasons (2)')).toBeTruthy();
    expect(screen.getByTestId('tv-show-watched-summary')).toHaveTextContent(
      '14 of 35 episodes watched',
    );
    expect(screen.getAllByTestId('season-list-progress-bar').length).toBe(2);
    expect(screen.getByText('14 / 22')).toBeTruthy();
  });

  it('marks a season watched from the left control', () => {
    render(<SeasonList tvShowId="tv-id" seasons={seasons} />);

    fireEvent.press(screen.getByTestId('season-watched-toggle-1'));

    expect(mockSeasonMutate).toHaveBeenCalledWith(
      {
        isFullyWatched: false,
        totalEpisodes: 22,
        episodeIds: expect.arrayContaining(['episode-1', 'episode-22']),
      },
      expect.any(Object),
    );
  });

  it('shows confetti and a permanent banner when the show becomes fully watched', () => {
    const progressData = {
      tvShowId: 'tv-id',
      totalEpisodes: 35,
      watchedEpisodes: 34,
      progressPercentage: 97,
      nextEpisode: null,
    };

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: progressData,
      isLoading: false,
      isError: false,
    });

    const { rerender } = render(
      <SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />,
    );

    expect(screen.queryByTestId('show-completed-banner')).toBeNull();
    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        ...progressData,
        watchedEpisodes: 35,
        progressPercentage: 100,
      },
      isLoading: false,
      isError: false,
    });

    rerender(<SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />);

    expect(screen.getByTestId('show-completed-confetti')).toBeTruthy();
    expect(screen.getByTestId('show-completed-banner')).toBeTruthy();
    expect(screen.getByText('Show completed!')).toBeTruthy();
    expect(screen.getByText('You watched every episode of Breaking Bad')).toBeTruthy();

    jest.useFakeTimers();
    jest.advanceTimersByTime(1800);
    jest.useRealTimers();
  });

  it('keeps the completion banner visible for already finished shows', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 35,
        watchedEpisodes: 35,
        progressPercentage: 100,
        nextEpisode: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />);

    expect(screen.getByTestId('show-completed-banner')).toBeTruthy();
    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();
  });

  it('collapses long season lists and expands on demand', () => {
    const manySeasons = Array.from({ length: 8 }, (_, index) => ({
      id: `season-${index + 1}`,
      seasonNumber: index + 1,
      name: `Season ${index + 1}`,
      airDate: '2008-01-20',
      episodeCount: 10,
      posterPath: null,
    }));

    render(<SeasonList tvShowId="tv-id" seasons={manySeasons} />);

    expect(screen.getByText('Seasons (8)')).toBeTruthy();
    expect(screen.getByTestId('season-row-3')).toBeTruthy();
    expect(screen.queryByTestId('season-row-4')).toBeNull();
    expect(screen.getByText('Show all 8 seasons')).toBeTruthy();
    expect(screen.getByText('+5 more')).toBeTruthy();

    fireEvent.press(screen.getByTestId('season-list-expand-toggle'));

    expect(screen.getByTestId('season-row-8')).toBeTruthy();
    expect(screen.getByText('Show fewer seasons')).toBeTruthy();
  });

  it('navigates to season detail when content is pressed', () => {
    render(<SeasonList tvShowId="tv-id" seasons={seasons} />);

    fireEvent.press(screen.getByTestId('season-content-2'));

    expect(mockPush).toHaveBeenCalledWith('/tv/tv-id/season/2');
    expect(mockSeasonMutate).not.toHaveBeenCalled();
  });

  it('renders a completed check indicator for finished seasons', () => {
    render(
      <SeasonListItemProgress
        label="Season 3"
        watchedEpisodes={22}
        totalEpisodes={22}
        showProgress
      />,
    );

    expect(screen.getByText('22 / 22')).toBeTruthy();
  });
});
