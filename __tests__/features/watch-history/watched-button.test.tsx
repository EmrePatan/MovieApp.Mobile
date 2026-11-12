import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import { useEpisodeWatchStatus } from '@/features/watch-history/hooks/useEpisodeWatchStatus';
import { useMovieWatchStatus } from '@/features/watch-history/hooks/useMovieWatchStatus';
import { useTvShowProgress } from '@/features/watch-history/hooks/useTvShowProgress';
import {
  useToggleEpisodeWatched,
  useToggleMovieWatched,
  useToggleTvShowWatched,
} from '@/features/watch-history/hooks/useWatchHistoryMutations';

const mockMutate = jest.fn();
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/features/watch-history/hooks/useMovieWatchStatus', () => ({
  useMovieWatchStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useEpisodeWatchStatus', () => ({
  useEpisodeWatchStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleMovieWatched: jest.fn(),
  useToggleTvShowWatched: jest.fn(),
  useToggleEpisodeWatched: jest.fn(),
}));

describe('WatchedButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    mockRequireAuth.mockReturnValue(true);
    (useMovieWatchStatus as jest.Mock).mockReturnValue({
      data: { isWatched: false },
      isLoading: false,
    });
    (useEpisodeWatchStatus as jest.Mock).mockReturnValue({
      data: { isWatched: false },
      isLoading: false,
    });
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: {
        isFullyWatched: false,
        regularTotalEpisodes: 0,
        regularWatchedEpisodes: 0,
      },
      isLoading: false,
    });
    (useToggleMovieWatched as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useToggleTvShowWatched as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useToggleEpisodeWatched as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders unwatched movie state', () => {
    render(<WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} />);
    expect(screen.getByLabelText('Mark as watched')).toBeTruthy();
  });

  it('renders watched movie state', () => {
    (useMovieWatchStatus as jest.Mock).mockReturnValue({
      data: { isWatched: true },
      isLoading: false,
    });

    render(<WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} />);
    expect(screen.getByLabelText('Mark as unwatched')).toBeTruthy();
  });

  it('keeps a partially watched TV show selected', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: { isFullyWatched: false, regularTotalEpisodes: 60, regularWatchedEpisodes: 1 },
      isLoading: false,
    });

    render(<WatchedButton target={{ type: 'tvshow', contentId: 'tv-id' }} />);

    const button = screen.getByLabelText('Mark as unwatched');
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('requires confirmation before clearing a started TV show history', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: { isFullyWatched: false, regularTotalEpisodes: 60, regularWatchedEpisodes: 1 },
      isLoading: false,
    });

    render(<WatchedButton target={{ type: 'tvshow', contentId: 'tv-id' }} />);
    fireEvent.press(screen.getByLabelText('Mark as unwatched'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Remove watched status?',
      'This will mark all currently released episodes of this show as unwatched. Your rating will be kept.',
      expect.any(Array),
    );
    expect(mockMutate).not.toHaveBeenCalled();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    buttons.find((button) => button.text === 'Mark as unwatched')?.onPress?.();

    expect(mockMutate).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('does not clear TV show history when the confirmation is cancelled', () => {
    (useTvShowProgress as jest.Mock).mockReturnValue({
      data: { isFullyWatched: false, regularTotalEpisodes: 60, regularWatchedEpisodes: 1 },
      isLoading: false,
    });

    render(<WatchedButton target={{ type: 'tvshow', contentId: 'tv-id' }} />);
    fireEvent.press(screen.getByLabelText('Mark as unwatched'));

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as Array<{
      style?: string;
      onPress?: () => void;
    }>;
    buttons.find((button) => button.style === 'cancel')?.onPress?.();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits movie watched mutation on press', () => {
    render(<WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} />);
    fireEvent.press(screen.getByLabelText('Mark as watched'));
    expect(mockMutate).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('submits episode watched mutation on press', () => {
    render(
      <WatchedButton
        target={{
          type: 'episode',
          contentId: 'episode-id',
          tvShowId: 'tv-id',
          seasonNumber: 1,
        }}
      />,
    );
    fireEvent.press(screen.getByLabelText('Mark as watched'));
    expect(mockMutate).toHaveBeenCalledWith(
      { episodeId: 'episode-id', isWatched: false },
      expect.any(Object),
    );
  });

  it('prompts login when unauthenticated', () => {
    mockRequireAuth.mockReturnValue(false);

    render(<WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} />);
    fireEvent.press(screen.getByLabelText('Mark as watched'));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please sign in to track watch history.')).toBeTruthy();
  });

  describe('detail optimistic UX', () => {
    it('shows inactive icon and stays tappable while initial status is unresolved', () => {
      (useMovieWatchStatus as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(
        <WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} variant="detail" />,
      );

      const button = screen.getByLabelText('Mark as watched');
      expect(button.props.accessibilityState.busy).toBe(false);
      expect(button.props.accessibilityState.disabled).toBe(false);
      fireEvent.press(button);
      expect(mockMutate).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it('shows spinner while mutation is pending', () => {
      (useToggleMovieWatched as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(
        <WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} variant="detail" />,
      );

      const button = screen.getByLabelText('Mark as watched');
      expect(button.props.accessibilityState.busy).toBe(true);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('prevents duplicate mutation while pending', () => {
      (useToggleMovieWatched as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(
        <WatchedButton target={{ type: 'movie', contentId: 'movie-id' }} variant="detail" />,
      );
      fireEvent.press(screen.getByLabelText('Mark as watched'));

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
