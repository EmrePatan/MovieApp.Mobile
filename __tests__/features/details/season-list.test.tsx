import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  SeasonList,
  SeasonListItemProgress,
} from '@/features/details/tv/components/SeasonList';
import { TvShowCompletionCelebrationLayer } from '@/features/details/tv/components/TvShowCompletionCelebrationLayer';
import { useAuth } from '@/auth/useAuth';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import { useSeasonProgress } from '@/features/watch-history/hooks/useSeasonProgress';
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

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleSeasonWatched: jest.fn(),
}));

function renderSeasonListWithCelebration(
  props: React.ComponentProps<typeof SeasonList>,
  tvShowId = props.tvShowId,
) {
  return render(
    <>
      <TvShowCompletionCelebrationLayer tvShowId={tvShowId} />
      <SeasonList {...props} />
    </>,
  );
}

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
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  (useTvShowProgress as jest.Mock).mockReturnValue({
    data: {
      tvShowId: 'tv-id',
      totalEpisodes: 35,
      watchedEpisodes: 14,
      progressPercentage: 40,
      nextEpisode: null,
      seasons: [
        {
          seasonNumber: 1,
          totalEpisodes: 22,
          watchedEpisodes: 14,
          progressPercentage: 63.64,
        },
        {
          seasonNumber: 2,
          totalEpisodes: 13,
          watchedEpisodes: 0,
          progressPercentage: 0,
        },
      ],
    },
    isLoading: false,
    isError: false,
  });
  (useSeasonProgress as jest.Mock).mockImplementation(() => {
    throw new Error('SeasonListItem must not call useSeasonProgress');
  });
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
      '14 of 35 episodes',
    );
    expect(screen.getAllByTestId('season-list-progress-bar').length).toBe(2);
    expect(screen.getByText('14 / 22')).toBeTruthy();
    expect(useTvShowProgress).toHaveBeenCalledTimes(1);
    expect(useSeasonProgress).not.toHaveBeenCalled();
  });

  it('marks a season watched from the left control', () => {
    render(<SeasonList tvShowId="tv-id" seasons={seasons} />);

    fireEvent.press(screen.getByTestId('season-watched-toggle-1'));

    expect(mockSeasonMutate).toHaveBeenCalledWith(
      {
        isFullyWatched: false,
        totalEpisodes: 22,
        episodeIds: [],
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
      seasons: [
        {
          seasonNumber: 1,
          totalEpisodes: 22,
          watchedEpisodes: 22,
          progressPercentage: 100,
        },
        {
          seasonNumber: 2,
          totalEpisodes: 13,
          watchedEpisodes: 12,
          progressPercentage: 92.31,
        },
      ],
    };

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: progressData,
      isLoading: false,
      isError: false,
    });

    const { rerender } = renderSeasonListWithCelebration({
      tvShowId: 'tv-id',
      seasons,
      showTitle: 'Breaking Bad',
    });

    expect(screen.queryByTestId('show-completed-banner')).toBeNull();
    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        ...progressData,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isCompleted: true,
        seasons: progressData.seasons.map((season) => ({
          ...season,
          watchedEpisodes: season.totalEpisodes,
          progressPercentage: 100,
        })),
      },
      isLoading: false,
      isError: false,
    });

    rerender(
      <>
        <TvShowCompletionCelebrationLayer tvShowId="tv-id" />
        <SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />
      </>,
    );

    expect(screen.getByTestId('show-completed-confetti')).toBeTruthy();
    expect(screen.getByTestId('show-completed-banner')).toBeTruthy();
    expect(screen.getByText('Show completed!')).toBeTruthy();
    expect(screen.getByText('You watched every episode of Breaking Bad')).toBeTruthy();

    jest.useFakeTimers();
    jest.advanceTimersByTime(1800);
    jest.useRealTimers();
  });

  it('does not show confetti when progress loads in as already complete', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { rerender } = renderSeasonListWithCelebration({
      tvShowId: 'tv-id',
      seasons,
      showTitle: 'Breaking Bad',
    });

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 35,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isCompleted: true,
        nextEpisode: null,
        seasons: [
          {
            seasonNumber: 1,
            totalEpisodes: 22,
            watchedEpisodes: 22,
            progressPercentage: 100,
          },
          {
            seasonNumber: 2,
            totalEpisodes: 13,
            watchedEpisodes: 13,
            progressPercentage: 100,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    rerender(
      <>
        <TvShowCompletionCelebrationLayer tvShowId="tv-id" />
        <SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />
      </>,
    );

    expect(screen.getByTestId('show-completed-banner')).toBeTruthy();
    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();
  });

  it('keeps the completion banner visible for already finished shows', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 35,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isCompleted: true,
        nextEpisode: null,
        seasons: [
          {
            seasonNumber: 1,
            totalEpisodes: 22,
            watchedEpisodes: 22,
            progressPercentage: 100,
          },
          {
            seasonNumber: 2,
            totalEpisodes: 13,
            watchedEpisodes: 13,
            progressPercentage: 100,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Breaking Bad" />);

    expect(screen.getByTestId('show-completed-banner')).toBeTruthy();
    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();
  });

  it('does not show the completion banner for a caught-up returning series', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 35,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isFullyWatched: true,
        isCompleted: false,
        nextEpisode: null,
        seasons: [
          { seasonNumber: 1, totalEpisodes: 22, watchedEpisodes: 22, progressPercentage: 100 },
          { seasonNumber: 2, totalEpisodes: 13, watchedEpisodes: 13, progressPercentage: 100 },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<SeasonList tvShowId="tv-id" seasons={seasons} showTitle="Severance" />);

    expect(screen.queryByTestId('show-completed-banner')).toBeNull();
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

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 80,
        watchedEpisodes: 0,
        progressPercentage: 0,
        nextEpisode: null,
        seasons: manySeasons.map((season) => ({
          seasonNumber: season.seasonNumber,
          totalEpisodes: 10,
          watchedEpisodes: 0,
          progressPercentage: 0,
        })),
      },
      isLoading: false,
      isError: false,
    });

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
