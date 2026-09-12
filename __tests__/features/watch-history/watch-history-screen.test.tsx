import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAuth } from '@/auth/useAuth';
import { useRecentWatchHistory } from '@/features/watch-history/hooks/useRecentWatchHistory';
import WatchHistoryScreen from '../../../app/watch-history';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
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
    expect(screen.getByText('Sign in to view your watch history')).toBeTruthy();
    fireEvent.press(screen.getByText('Sign In'));
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
    expect(screen.getByText('No watch history yet')).toBeTruthy();
  });
});
