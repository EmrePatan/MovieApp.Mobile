import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { FlatList, Platform, ScrollView } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import HomeScreen from '../../../app/(tabs)/home';
import NotificationsScreen from '../../../app/notifications';
import ProfileScreen from '../../../app/(tabs)/profile';
import { InsightsHubContent } from '@/features/insights/components/InsightsHubContent';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import { useInsightsV3 } from '@/features/insights/hooks/useInsightsV3';
import { useNotificationsInbox } from '@/features/notifications/hooks/useNotificationsInbox';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { createHomeFeedMockReturnValue } from '../../features/home/home-feed-test-utils';
import { insightsV3Fixture } from '@/features/insights/utils/insights-fixtures';

const repoRoot = path.resolve(__dirname, '../../..');

const iosOnlyRefreshSurfaceFiles = [
  'app/(tabs)/profile.tsx',
];

const androidPullRefreshSurfaceFiles = [
  'app/(tabs)/home.tsx',
  'src/features/insights/components/InsightsHubContent.tsx',
];

const sharedRefreshSurfaceFiles = ['app/notifications.tsx'];

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/features/home/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

jest.mock('@/features/insights/hooks/useInsightsV3', () => ({
  useInsightsV3: jest.fn(),
}));

jest.mock('@/features/notifications/hooks/useNotificationsInbox', () => ({
  useNotificationsInbox: jest.fn(),
}));

jest.mock('@/features/notifications/hooks/useMarkNotificationRead', () => ({
  useMarkNotificationRead: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('@/features/notifications/hooks/useMarkAllNotificationsRead', () => ({
  useMarkAllNotificationsRead: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('@/features/notifications/hooks/useDeleteNotification', () => ({
  useDeleteNotification: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: { id: 'user-1' }, logout: jest.fn() })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/notifications/hooks/useUnreadNotificationCount', () => ({
  useUnreadNotificationCount: jest.fn(() => ({ data: { unreadCount: 0 } })),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
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

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

jest.mock('@/features/details/shared/navigation/open-catalog-detail-from-tab', () => ({
  openCatalogDetailFromTab: jest.fn(),
}));

jest.mock('@/features/home/components/HomeHeroCarousel', () => ({
  HomeHeroCarousel: () => null,
}));

jest.mock('@/perf/home-cold-start-trace', () => ({
  markHomePerfEvent: jest.fn(),
  beginHomeColdStartTrace: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function expectMovieAppRefreshControl(refreshControl: React.ReactElement | undefined) {
  expect(refreshControl).toBeTruthy();
  expect(refreshControl?.type).toBe(MovieAppRefreshControl);
}

describe('primary surface refresh presentation', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
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
      isRefetching: true,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('uses createIosRefreshControl in iOS-only primary surface source files', () => {
    for (const relativePath of iosOnlyRefreshSurfaceFiles) {
      const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toContain('createIosRefreshControl');
      expect(source).not.toMatch(/import\s*\{[^}]*\bRefreshControl\b[^}]*\}\s*from 'react-native'/);
    }
  });

  it('uses Android pull refresh wiring in Home and Insights source files', () => {
    for (const relativePath of androidPullRefreshSurfaceFiles) {
      const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toContain('useAndroidPullToRefresh');
      expect(source).toContain('createIosRefreshControl');
      expect(source).not.toContain('MovieAppRefreshControl');
    }
  });

  it('uses MovieAppRefreshControl in shared refresh surface source files', () => {
    for (const relativePath of sharedRefreshSurfaceFiles) {
      const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toContain('MovieAppRefreshControl');
      expect(source).not.toMatch(/import\s*\{[^}]*\bRefreshControl\b[^}]*\}\s*from 'react-native'/);
    }
  });

  it('keeps Home progressive refresh semantics and shared control on iOS', async () => {
    let resolveRefetch: (() => void) | undefined;
    const refetch = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefetch = resolve;
        }),
    );
    (useHomeFeed as jest.Mock).mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [
            {
              type: 'Trending',
              title: 'Trending Now',
              displayOrder: 1,
              items: [
                {
                  id: 'trending-1',
                  contentType: 'movie',
                  title: 'Trending Movie',
                  originalTitle: null,
                  posterUrl: null,
                  backdropUrl: null,
                  releaseDate: '2020-01-01',
                  voteAverage: 8,
                  voteCount: 50,
                },
              ],
            },
          ],
          isPersonalized: false,
        },
        isFetching: true,
        refetch,
      }),
    );

    const { UNSAFE_getByType } = render(<HomeScreen />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(false);

    await act(async () => {
      refreshControl.props.onRefresh();
    });
    expect(refetch).toHaveBeenCalledTimes(1);

    const activeRefreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expect(activeRefreshControl.props.refreshing).toBe(true);

    await act(async () => {
      resolveRefetch?.();
      await Promise.resolve();
    });

    const settledRefreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expect(settledRefreshControl.props.refreshing).toBe(false);
  });

  it('omits native Home refresh control on Android and shows pull refresh header', () => {
    Platform.OS = 'android';
    const refetch = jest.fn();
    (useHomeFeed as jest.Mock).mockReturnValue(
      createHomeFeedMockReturnValue({
        data: {
          sections: [
            {
              type: 'Trending',
              title: 'Trending Now',
              displayOrder: 1,
              items: [
                {
                  id: 'trending-1',
                  contentType: 'movie',
                  title: 'Trending Movie',
                  originalTitle: null,
                  posterUrl: null,
                  backdropUrl: null,
                  releaseDate: '2020-01-01',
                  voteAverage: 8,
                  voteCount: 50,
                },
              ],
            },
          ],
          isPersonalized: false,
        },
        isFetching: true,
        refetch,
      }),
    );

    const { UNSAFE_getByType, getByTestId } = render(<HomeScreen />);
    expect(UNSAFE_getByType(FlatList).props.refreshControl).toBeUndefined();
    expect(getByTestId('android-pull-refresh-header')).toBeTruthy();
  });

  it('does not mount Home refresh control during initial browse loading', () => {
    const refetch = jest.fn();
    (useHomeFeed as jest.Mock).mockReturnValue(
      createHomeFeedMockReturnValue({
        isLoading: true,
        isFetching: true,
        refetch,
      }),
    );

    const { UNSAFE_queryByType } = render(<HomeScreen />);
    expect(UNSAFE_queryByType(FlatList)).toBeNull();
  });

  it('keeps Profile refresh semantics with shared control on iOS', () => {
    const refetch = jest.fn();
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
      isRefetching: true,
      refetch,
    });

    const { UNSAFE_getByType } = render(<ProfileScreen />);
    const refreshControl = UNSAFE_getByType(ScrollView).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('omits Profile refresh control on Android', () => {
    Platform.OS = 'android';
    const refetch = jest.fn();
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
      isRefetching: true,
      refetch,
    });

    const { UNSAFE_getByType } = render(<ProfileScreen />);
    expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
  });

  it('keeps Insights v3 refresh semantics on iOS', () => {
    const refetch = jest.fn();
    (useInsightsV3 as jest.Mock).mockReturnValue({
      data: insightsV3Fixture,
      isLoading: false,
      isFetching: false,
      isRefetching: true,
      isError: false,
      isSuccess: true,
      refetch,
    });

    const { UNSAFE_getByType } = render(<InsightsHubContent />);
    const refreshControl = UNSAFE_getByType(ScrollView).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('omits native Insights refresh control on Android and shows pull refresh header', () => {
    Platform.OS = 'android';
    const refetch = jest.fn();
    (useInsightsV3 as jest.Mock).mockReturnValue({
      data: insightsV3Fixture,
      isLoading: false,
      isFetching: false,
      isRefetching: true,
      isError: false,
      isSuccess: true,
      refetch,
    });

    const { UNSAFE_getByType, getByTestId } = render(<InsightsHubContent />);
    expect(UNSAFE_getByType(ScrollView).props.refreshControl).toBeUndefined();
    expect(getByTestId('android-pull-refresh-header')).toBeTruthy();
  });

  it('keeps Notifications refresh semantics with shared control', () => {
    const refetch = jest.fn();
    (useNotificationsInbox as jest.Mock).mockReturnValue({
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
      refetch,
      isRefetching: true,
      isFetchingNextPage: false,
      isFetching: true,
      isFetchNextPageError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });

    const { UNSAFE_getByType } = render(<NotificationsScreen />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
