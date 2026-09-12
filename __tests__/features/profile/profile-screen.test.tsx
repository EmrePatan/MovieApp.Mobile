import { fireEvent, render, screen } from '@testing-library/react-native';
import ProfileScreen from '../../../app/(tabs)/profile';
import { useAuth } from '@/auth/useAuth';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileStatistics } from '@/features/profile/hooks/useProfileStatistics';

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useProfileStatistics', () => ({
  useProfileStatistics: jest.fn(),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
  });

  it('renders profile dashboard', () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: {
        favoriteMovieCount: 2,
        favoriteTvShowCount: 1,
        watchlistCount: 1,
        watchlistItemCount: 5,
        ratedMovieCount: 3,
        ratedTvShowCount: 1,
        reviewedMovieCount: 0,
        reviewedTvShowCount: 0,
        watchedMovieCount: 10,
        watchedEpisodeCount: 20,
        totalRatingCount: 4,
        totalReviewCount: 0,
        totalWatchedCount: 30,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);

    expect(screen.getByText('Emre')).toBeTruthy();
    expect(screen.getByText('user@example.com')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('Watched')).toBeTruthy();
  });

  it('navigates to account settings and library routes', () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('Edit profile'));
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');

    fireEvent.press(screen.getByLabelText('Watch History'));
    expect(mockPush).toHaveBeenCalledWith('/watch-history');

    fireEvent.press(screen.getByLabelText('Favorites'));
    expect(mockPush).toHaveBeenCalledWith('/favorites');
  });

  it('logs out through auth context', () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'Emre',
        createdAt: '2026-09-11T14:30:00Z',
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);
    fireEvent.press(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders profile error state', () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { userMessage: 'Unable to load profile.' },
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);
    expect(screen.getByText('Unable to load your profile. Please try again.')).toBeTruthy();
  });
});
