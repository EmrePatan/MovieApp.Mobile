import { render, screen } from '@testing-library/react-native';
import { WatchProgressSection } from '@/features/watch-history/components/WatchProgressSection';
import { useAuth } from '@/auth/useAuth';
import { useSeasonProgress } from '@/features/watch-history/hooks/useSeasonProgress';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useSeasonProgress', () => ({
  useSeasonProgress: jest.fn(),
}));

describe('WatchProgressSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useSeasonProgress as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });
  });

  it('renders tv show progress with a progress bar and next episode hierarchy', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 24,
        watchedEpisodes: 12,
        progressPercentage: 50,
        nextEpisode: {
          episodeId: 'episode-id',
          seasonNumber: 2,
          episodeNumber: 3,
          title: 'Bit by a Dead Bee',
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<WatchProgressSection tvShowId="tv-id" />);

    expect(screen.queryByText('0 of 24 episodes')).toBeNull();
    expect(screen.getByText('12 of 24 episodes')).toBeTruthy();
    expect(screen.getByText('50% complete')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
    expect(screen.getByText('S2 · E3 · Bit by a Dead Bee')).toBeTruthy();
    expect(screen.getByTestId('watch-progress-track')).toBeTruthy();
  });

  it('renders zero progress with a visible empty track', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 22,
        watchedEpisodes: 0,
        progressPercentage: 0,
        nextEpisode: {
          episodeId: 'episode-id',
          seasonNumber: 1,
          episodeNumber: 1,
          title: 'Pilot',
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<WatchProgressSection tvShowId="tv-id" />);

    expect(screen.getByText('0 of 22 episodes')).toBeTruthy();
    expect(screen.getByText('0% complete')).toBeTruthy();
    expect(screen.getByText('S1 · E1 · Pilot')).toBeTruthy();
    expect(screen.getByTestId('watch-progress-track')).toBeTruthy();
  });

  it('renders full progress and a completed state when there is no next episode', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 10,
        watchedEpisodes: 10,
        progressPercentage: 100,
        nextEpisode: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<WatchProgressSection tvShowId="tv-id" />);

    expect(screen.getByText('10 of 10 episodes')).toBeTruthy();
    expect(screen.getByText('100% complete')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('All episodes watched')).toBeTruthy();
  });

  it('clamps out-of-range progress percentages', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 10,
        watchedEpisodes: 10,
        progressPercentage: 140,
        nextEpisode: null,
      },
      isLoading: false,
      isError: false,
    });

    render(<WatchProgressSection tvShowId="tv-id" />);

    expect(screen.getByText('100% complete')).toBeTruthy();
  });

  it('renders season progress', () => {
    (useSeasonProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        seasonNumber: 1,
        totalEpisodes: 10,
        watchedEpisodes: 4,
        progressPercentage: 40,
        nextEpisode: {
          episodeId: 'episode-id',
          episodeNumber: 5,
          title: 'Gray Matter',
        },
      },
      isLoading: false,
      isError: false,
    });

    render(<WatchProgressSection tvShowId="tv-id" seasonNumber={1} />);

    expect(screen.getByText('4 of 10 episodes')).toBeTruthy();
    expect(screen.getByText('40% complete')).toBeTruthy();
    expect(screen.getByText('Episode 5 · Gray Matter')).toBeTruthy();
  });

  it('does not render when logged out', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        tvShowId: 'tv-id',
        totalEpisodes: 24,
        watchedEpisodes: 12,
        progressPercentage: 50,
        nextEpisode: null,
      },
      isLoading: false,
      isError: false,
    });

    const { toJSON } = render(<WatchProgressSection tvShowId="tv-id" />);
    expect(toJSON()).toBeNull();
  });
});
