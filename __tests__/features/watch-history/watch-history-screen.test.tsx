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

describe('WatchHistoryScreen', () => {
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
