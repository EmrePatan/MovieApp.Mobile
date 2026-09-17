import { fireEvent, render, screen } from '@testing-library/react-native';
import ProfileScreen from '../../../app/(tabs)/profile';
import { useAuth } from '@/auth/useAuth';
import { useFollowingCount } from '@/features/following/hooks/useFollowingCount';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useProfileStatistics } from '@/features/profile/hooks/useProfileStatistics';
import { createProfileStatisticsFixture } from '@/features/profile/utils/profile-statistics-fixtures';

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

jest.mock('@/features/following/hooks/useFollowingCount', () => ({
  useFollowingCount: jest.fn(),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: jest.fn(() => ({
    region: 'TR',
    source: 'fallback',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  })),
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
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
      data: createProfileStatisticsFixture(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useFollowingCount as jest.Mock).mockReturnValue({
      totalCount: 3,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
  });

  it('renders profile identity and account sections', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Emre')).toBeTruthy();
    expect(screen.getByText('Your movie and TV identity')).toBeTruthy();
    expect(screen.getByText('My Library')).toBeTruthy();
    expect(screen.queryByText('Your Year')).toBeNull();
    expect(screen.queryByText('Your Taste')).toBeNull();
  });

  it('shows compact library collection stats', () => {
    render(<ProfileScreen />);

    expect(
      screen.getByLabelText(
        'Library collections: 6 saved titles · 2 lists · 3 followed titles · 12 movies · 48 episodes',
      ),
    ).toBeTruthy();
  });

  it('renders compact library summary and keeps account settings', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('6 saved titles · 2 lists · 3 followed titles · 12 movies · 48 episodes')).toBeTruthy();
    expect(screen.getByLabelText('Edit profile')).toBeTruthy();
    expect(screen.getByLabelText('Change email')).toBeTruthy();
    expect(screen.getByLabelText('Change password')).toBeTruthy();
    expect(screen.getByLabelText('Delete account')).toBeTruthy();
  });

  it('navigates to account settings without a redundant library shortcut', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('Edit profile'));

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    expect(mockPush).not.toHaveBeenCalledWith('/(tabs)/library');
  });

  it('renders sparse library summary for new users', () => {
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: createProfileStatisticsFixture({
        summary: {
          moviesWatched: 0,
          episodesWatched: 0,
          showsStarted: 0,
          showsCompleted: 0,
          ratingsCount: 0,
          reviewsCount: 0,
          favoritesCount: 0,
          watchlistCount: 0,
          averageStarRating: null,
        },
      }),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    (useFollowingCount as jest.Mock).mockReturnValue({
      totalCount: 0,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);

    expect(
      screen.getByText('0 saved titles · 0 lists · 0 followed titles · 0 movies · 0 episodes'),
    ).toBeTruthy();
    expect(screen.queryByText('Your Year')).toBeNull();
  });

  it('shows library summary error state', () => {
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);

    expect(screen.getByText('Unable to load your library summary.')).toBeTruthy();
  });

  it('logs out from profile screen', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
