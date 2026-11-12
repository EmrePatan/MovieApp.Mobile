import { render, screen } from '@testing-library/react-native';
import { TvShowCompletionCelebrationLayer } from '@/features/details/tv/components/TvShowCompletionCelebrationLayer';
import { useAuth } from '@/auth/useAuth';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

const progressData = {
  tvShowId: 'tv-id',
  totalEpisodes: 35,
  watchedEpisodes: 34,
  progressPercentage: 97,
  isFullyWatched: false,
  isCompleted: false,
  nextEpisode: null,
  seasons: [],
};

describe('TvShowCompletionCelebrationLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: progressData,
      isLoading: false,
      isError: false,
    });
  });

  it('shows confetti from the stack-level layer when the server reports completion', () => {
    const view = render(<TvShowCompletionCelebrationLayer tvShowId="tv-id" />);

    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        ...progressData,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isFullyWatched: true,
        isCompleted: true,
      },
      isLoading: false,
      isError: false,
    });

    view.rerender(<TvShowCompletionCelebrationLayer tvShowId="tv-id" />);

    expect(screen.getByTestId('show-completed-confetti')).toBeTruthy();
  });

  it('does not celebrate a returning series that is only caught up', () => {
    const view = render(<TvShowCompletionCelebrationLayer tvShowId="tv-id" />);

    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        ...progressData,
        watchedEpisodes: 35,
        progressPercentage: 100,
        isFullyWatched: true,
        isCompleted: false,
      },
      isLoading: false,
      isError: false,
    });

    view.rerender(<TvShowCompletionCelebrationLayer tvShowId="tv-id" />);

    expect(screen.queryByTestId('show-completed-confetti')).toBeNull();
  });
});
