import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAuth } from '@/auth/useAuth';
import { useRecentWatchHistory } from '@/features/watch-history/hooks/useRecentWatchHistory';
import WatchHistoryScreen from '../../../app/(tabs)/(app-shell)/watch-history';
import { t } from '../../i18n/i18n-test-utils';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/watch-history/hooks/useRecentWatchHistory', () => ({
  useRecentWatchHistory: jest.fn(),
}));

const mockMutate = jest.fn();

jest.mock('@/features/watch-history/hooks/useUpdateWatchDates', () => ({
  useUpdateWatchDates: () => ({
    mutate: mockMutate,
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('@/features/watch-history/hooks/useShowEpisodeCount', () => ({
  useShowEpisodeCount: (tvShowId: string | null) => ({
    data: tvShowId ? 942 : undefined,
    isError: false,
  }),
}));

describe('WatchHistoryScreen', () => {
  it('changes a whole show after showing how many episodes it covers', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    const episode = (episodeNumber: number) => ({
      type: 'episode',
      movieId: null,
      episodeId: `ep-${episodeNumber}`,
      tvShowId: 'show-id',
      title: null,
      tvShowTitle: 'Running Man',
      seasonNumber: 1,
      episodeNumber,
      episodeTitle: null,
      watchedAt: '2026-11-23T14:30:00Z',
    });
    (useRecentWatchHistory as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [episode(2), episode(1)] }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<WatchHistoryScreen />);
    fireEvent.press(screen.getByTestId('watch-history-edit'));
    fireEvent.press(screen.getByTestId('watch-history-whole-show'));
    expect(
      screen.getByText(
        t('extras.historyDatesWholeShowSubtitle', { title: 'Running Man', count: 942 }),
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeUnknown')));
    fireEvent.press(screen.getByText(t('common.save')));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        movieIds: [],
        episodeIds: [],
        tvShowId: 'show-id',
        undated: false,
        mode: 'unknown',
      },
      expect.anything(),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logged-out state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useRecentWatchHistory as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<WatchHistoryScreen />);
    expect(screen.getByText(t('details.actions.signInWatchHistory'))).toBeTruthy();
    fireEvent.press(screen.getByText(t('common.signInTitleCase')));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders recent history items and navigates', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useRecentWatchHistory as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                type: 'movie',
                movieId: 'movie-id',
                episodeId: null,
                tvShowId: null,
                title: 'Interstellar',
                tvShowTitle: null,
                seasonNumber: null,
                episodeNumber: null,
                episodeTitle: null,
                watchedAt: '2026-09-11T14:30:00Z',
              },
            ],
            page: 1,
            pageSize: 20,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<WatchHistoryScreen />);
    fireEvent.press(screen.getByLabelText(/Interstellar, Movie/));
    expect(mockPush).toHaveBeenCalledWith('/movie/movie-id');
  });

  it('selects entries and saves an unknown watch date', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    const base = {
      type: 'movie',
      episodeId: null,
      tvShowId: null,
      tvShowTitle: null,
      seasonNumber: null,
      episodeNumber: null,
      episodeTitle: null,
      watchedAt: '2026-09-11T14:30:00Z',
    };
    (useRecentWatchHistory as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              { ...base, movieId: 'dated', title: 'Interstellar' },
              { ...base, movieId: 'undated', title: 'Matrix', watchedAtPrecision: 'unknown' },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<WatchHistoryScreen />);
    expect(useRecentWatchHistory).toHaveBeenLastCalledWith(false);
    fireEvent.press(screen.getByTestId('watch-history-tab-undated'));
    expect(useRecentWatchHistory).toHaveBeenLastCalledWith(true);

    fireEvent.press(screen.getByTestId('watch-history-edit'));
    fireEvent.press(screen.getByLabelText(/Interstellar, Movie/));
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText(t('extras.historyDatesChange')));
    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeUnknown')));
    fireEvent.press(screen.getByText(t('common.save')));

    expect(mockMutate).toHaveBeenCalledWith(
      { movieIds: ['dated'], episodeIds: [], mode: 'unknown' },
      expect.anything(),
    );
  });

  it('renders empty history state', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useRecentWatchHistory as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            items: [],
            page: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<WatchHistoryScreen />);
    expect(
      screen.getByText(
        t('library.empty.watchedTitle', { mediaLabel: t('library.empty.mediaLabels.titles') }),
      ),
    ).toBeTruthy();
  });
});
