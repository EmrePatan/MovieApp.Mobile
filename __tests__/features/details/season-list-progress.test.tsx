import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SeasonList } from '@/features/details/tv/components/SeasonList';
import { useAuth } from '@/auth/useAuth';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useSeasonProgress } from '@/features/watch-history/hooks/useSeasonProgress';
import { useToggleSeasonWatched } from '@/features/watch-history/hooks/useWatchHistoryMutations';

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useSeasonProgress', () => ({
  useSeasonProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleSeasonWatched: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockSeasonMutate = jest.fn();

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: () => true,
  }),
}));

function buildSeasons(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `season-${index + 1}`,
    seasonNumber: index + 1,
    name: `Season ${index + 1}`,
    airDate: '2008-01-20',
    episodeCount: 10,
    posterPath: null,
  }));
}

function buildAggregateProgress(seasonCount: number) {
  const seasons = Array.from({ length: seasonCount }, (_, index) => ({
    seasonNumber: index + 1,
    totalEpisodes: 10,
    watchedEpisodes: index === 0 ? 4 : 0,
    progressPercentage: index === 0 ? 40 : 0,
  }));

  return {
    tvShowId: 'tv-id',
    totalEpisodes: seasonCount * 10,
    watchedEpisodes: 4,
    progressPercentage: seasonCount > 0 ? 40 / seasonCount : 0,
    nextEpisode: null,
    seasons,
  };
}

describe('SeasonList aggregate progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSeasonMutate.mockClear();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useToggleSeasonWatched as jest.Mock).mockReturnValue({
      mutate: mockSeasonMutate,
      isPending: false,
    });
    (useSeasonProgress as jest.Mock).mockImplementation(() => {
      throw new Error('SeasonListItem must not call useSeasonProgress');
    });
  });

  it('uses one aggregate TV progress query for three seasons', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: buildAggregateProgress(3),
      isLoading: false,
      isError: false,
    });

    render(<SeasonList tvShowId="tv-id" seasons={buildSeasons(3)} />);

    expect(useTvShowProgress).toHaveBeenCalledTimes(1);
    expect(useSeasonProgress).not.toHaveBeenCalled();
    expect(screen.getByText('4 / 10')).toBeTruthy();
    expect(screen.getAllByTestId('season-list-progress-bar').length).toBe(2);
  });

  it('uses released episode totals instead of the catalog episode count', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 10,
        watchedEpisodes: 4,
        progressPercentage: 40,
        nextEpisode: null,
        seasons: [
          { seasonNumber: 1, totalEpisodes: 10, watchedEpisodes: 4, progressPercentage: 40 },
        ],
      },
      isLoading: false,
      isError: false,
    });
    const catalogSeason = { ...buildSeasons(1)[0], episodeCount: 12 };

    render(<SeasonList tvShowId="tv-id" seasons={[catalogSeason]} />);

    expect(screen.getByText('4 / 10')).toBeTruthy();
    expect(screen.queryByText('4 / 12')).toBeNull();

    fireEvent.press(screen.getByTestId('season-watched-toggle-1'));

    expect(mockSeasonMutate).toHaveBeenCalledWith(
      { isFullyWatched: false, totalEpisodes: 10, episodeIds: [] },
      expect.any(Object),
    );
  });

  it('still uses one aggregate TV progress query for ten seasons', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: buildAggregateProgress(10),
      isLoading: false,
      isError: false,
    });

    render(<SeasonList tvShowId="tv-id" seasons={buildSeasons(10)} />);

    expect(useTvShowProgress).toHaveBeenCalledTimes(1);
    expect(useSeasonProgress).not.toHaveBeenCalled();
  });

  it('keeps TV detail usable when aggregate progress fails', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<SeasonList tvShowId="tv-id" seasons={buildSeasons(2)} />);

    expect(screen.getByText('Seasons (2)')).toBeTruthy();
    expect(screen.queryByTestId('season-list-progress-bar')).toBeNull();
    expect(screen.getByText('Season 1')).toBeTruthy();
  });
});
