import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import { markHomePerfEvent } from '@/perf/home-cold-start-trace';
import { createHomeFeedMockReturnValue } from './home-feed-test-utils';
import HomeScreen from '../../../app/(tabs)/(app-shell)/home';

const mockRefetch = jest.fn();
const mockUseHomeFeed = useHomeFeed as jest.Mock;

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/features/home/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/notifications/hooks/useUnreadNotificationCount', () => ({
  useUnreadNotificationCount: jest.fn(() => ({
    data: { unreadCount: 0 },
  })),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'emre@example.com',
      userName: 'emre',
      displayName: 'Emre User',
      createdAt: '2026-01-01T00:00:00Z',
    },
  }),
}));

jest.mock('@/perf/home-cold-start-trace', () => ({
  markHomePerfEvent: jest.fn(),
  beginHomeColdStartTrace: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const browseSection = {
  type: 'Trending' as const,
  title: 'Trending Now',
  displayOrder: 1,
  items: [
    {
      id: 'trending-1',
      contentType: 'movie' as const,
      title: 'Trending Movie',
      originalTitle: null,
      posterUrl: null,
      backdropUrl: null,
      releaseDate: '2020-01-01',
      voteAverage: 8,
      voteCount: 50,
    },
  ],
};

describe('Home progressive feed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders browse content while personalized remains unresolved', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [browseSection],
          isPersonalized: false,
        },
        personalizedLoading: true,
        personalization: 'unknown',
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(screen.getByText('Trending Now')).toBeTruthy();
    expect(screen.getByLabelText('Loading personalized home content')).toBeTruthy();
    expect(screen.queryByText('Find your next favorite')).toBeNull();
  });

  it('shows cold welcome only after personalization is confirmed false', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [],
          isPersonalized: false,
        },
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);
    expect(screen.getByText('Find your next favorite')).toBeTruthy();
  });

  it('keeps browse content visible when personalized fails', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [browseSection],
          isPersonalized: false,
        },
        personalizedError: new ApiError({ kind: 'network' }),
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(screen.getByText('Trending Movie')).toBeTruthy();
    expect(screen.queryByLabelText('Try Again')).toBeNull();
  });

  it('shows full home error when browse fails without cached data', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        browseError: new ApiError({ kind: 'network' }),
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(screen.getByText('Try Again')).toBeTruthy();
    expect(screen.queryByText('Trending Movie')).toBeNull();
  });

  it('does not render personalized skeleton for confirmed cold users', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [browseSection],
          isPersonalized: false,
        },
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(screen.queryByLabelText('Loading personalized home content')).toBeNull();
  });

  it('marks first meaningful render when browse content is visible', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [browseSection],
          isPersonalized: false,
        },
        personalizedLoading: true,
        personalization: 'unknown',
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(markHomePerfEvent).toHaveBeenCalledWith('first_meaningful_render');
  });

  it('does not mark first meaningful render for skeleton-only browse state', () => {
    mockUseHomeFeed.mockReturnValue(
      createHomeFeedMockReturnValue({
        isLoading: true,
        refetch: mockRefetch,
      }),
    );

    render(<HomeScreen />);

    expect(markHomePerfEvent).toHaveBeenCalledWith('home_mount');
    expect(markHomePerfEvent).not.toHaveBeenCalledWith('first_meaningful_render');
  });
});
