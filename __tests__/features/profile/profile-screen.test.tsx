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

  it('renders premium profile header and hero stats', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('Emre')).toBeTruthy();
    expect(screen.getByText('Your movie and TV identity')).toBeTruthy();
    expect(screen.getByText('60')).toBeTruthy();
    expect(screen.getByText('Watched')).toBeTruthy();
    expect(screen.getByText('Your Year')).toBeTruthy();
    expect(screen.getByText('Your Taste')).toBeTruthy();
    expect(screen.getByText('Movies vs Series')).toBeTruthy();
  });

  it('shows a compact My Library shortcut before analytics sections', () => {
    render(<ProfileScreen />);

    function collectText(node: unknown): string[] {
      if (!node || typeof node !== 'object') {
        return [];
      }

      if ('children' in node && Array.isArray((node as { children?: unknown }).children)) {
        return (node as { children: unknown[] }).children.flatMap((child) => {
          if (typeof child === 'string') {
            return [child];
          }

          return collectText(child);
        });
      }

      return [];
    }

    const texts = collectText(screen.toJSON());
    const libraryIndex = texts.findIndex((text) => text === 'My Library');
    const insightIndex = texts.findIndex((text) => text === 'Comedy is your top genre.');

    expect(libraryIndex).toBeGreaterThan(-1);
    expect(insightIndex).toBeGreaterThan(-1);
    expect(libraryIndex).toBeLessThan(insightIndex);
    expect(screen.getByLabelText('Open My Library')).toBeTruthy();
    expect(screen.queryByLabelText('Favorites')).toBeNull();
    expect(screen.queryByLabelText('Watchlist')).toBeNull();
  });

  it('renders compact library summary and keeps account settings', () => {
    render(<ProfileScreen />);

    expect(screen.getByText('6 saved titles · 2 lists · 3 followed titles · 12 movies · 48 episodes')).toBeTruthy();
    expect(screen.getByLabelText('Edit profile')).toBeTruthy();
    expect(screen.getByLabelText('Change email')).toBeTruthy();
    expect(screen.getByLabelText('Change password')).toBeTruthy();
    expect(screen.getByLabelText('Delete account')).toBeTruthy();
  });

  it('shows month detail when a bar is pressed', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('April 2026: 8 watched items, 1 movies and 7 episodes.'));

    expect(screen.getByText('April 2026')).toBeTruthy();
    expect(screen.getByText('8 watched · 1 movies · 7 episodes')).toBeTruthy();
  });

  it('navigates to account settings and the Library tab shortcut', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText('Edit profile'));
    fireEvent.press(screen.getByLabelText('Open My Library'));

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/library');
  });

  it('renders new-user empty analytics states', () => {
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
        activity: {
          last12Months: [],
          mostActiveMonth: null,
          currentMonthTotal: 0,
          previousMonthTotal: 0,
          longestStreakDays: null,
        },
        genres: [],
        insights: [],
        milestones: [],
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
    expect(screen.getByText('Start watching to build your activity timeline.')).toBeTruthy();
    expect(screen.getByText('Your favorite genres will appear here as you watch.')).toBeTruthy();
    expect(screen.getByText('Rate a few titles to reveal your rating style.')).toBeTruthy();
  });

  it('shows statistics error state', () => {
    (useProfileStatistics as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<ProfileScreen />);

    expect(screen.getByText('Unable to load your statistics.')).toBeTruthy();
  });

  it('logs out from profile screen', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByText('Sign out'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
