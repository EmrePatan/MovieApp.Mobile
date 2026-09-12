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

  it('renders tv show progress', () => {
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

    expect(screen.getByText('12 / 24 episodes watched')).toBeTruthy();
    expect(screen.getByText('50% complete')).toBeTruthy();
    expect(screen.getByText(/Next: S2 E3/)).toBeTruthy();
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

    expect(screen.getByText('4 / 10 episodes watched')).toBeTruthy();
    expect(screen.getByText('40% complete')).toBeTruthy();
    expect(screen.getByText(/Next: E5/)).toBeTruthy();
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
