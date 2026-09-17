import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { FlatList, ScrollView } from 'react-native';
import { render } from '@testing-library/react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import HomeScreen from '../../../app/(tabs)/home';
import NotificationsScreen from '../../../app/notifications';
import { InsightsHubContent } from '@/features/insights/components/InsightsHubContent';
import { LibraryHubContent } from '@/features/library/components/LibraryHubContent';
import { useHomeFeed } from '@/features/home/hooks/useHomeFeed';
import { useInsightsSummary } from '@/features/insights/hooks/useInsightsSummary';
import { useInsightsAnalytics } from '@/features/insights/hooks/useInsightsAnalytics';
import { useNotificationsInbox } from '@/features/notifications/hooks/useNotificationsInbox';
import { createHomeFeedMockReturnValue } from '../../features/home/home-feed-test-utils';
import {
  insightsAnalyticsFixture,
  insightsSummaryFixture,
} from '@/features/insights/utils/insights-fixtures';

const repoRoot = path.resolve(__dirname, '../../..');

const primarySurfaceFiles = [
  'app/(tabs)/home.tsx',
  'src/features/library/components/LibraryHubContent.tsx',
  'src/features/insights/components/InsightsHubContent.tsx',
  'app/notifications.tsx',
];

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/features/home/hooks/useHomeFeed', () => ({
  useHomeFeed: jest.fn(),
}));

jest.mock('@/features/insights/hooks/useInsightsSummary', () => ({
  useInsightsSummary: jest.fn(),
}));

jest.mock('@/features/insights/hooks/useInsightsAnalytics', () => ({
  useInsightsAnalytics: jest.fn(),
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
  useAuth: jest.fn(() => ({ isAuthenticated: true, user: { id: 'user-1' } })),
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

jest.mock('@/features/library/hooks/useLibrary', () => ({
  useLibrary: jest.fn(() => ({
    data: {
      pages: [
        {
          items: [
            {
              id: 'movie-1',
              type: 'movie',
              title: 'Library Movie',
              originalTitle: null,
              posterUrl: null,
              backdropUrl: null,
              year: 2024,
              voteAverage: 7.5,
              addedAt: null,
              watchedAt: null,
              lastActivityAt: '2026-01-01T00:00:00Z',
              progressPercentage: null,
              nextEpisode: null,
              collectionStatus: 'watching',
            },
          ],
          page: 1,
          pageSize: 24,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
  })),
}));

jest.mock('@/features/library/components/LibraryWatchlistsOverview', () => ({
  LibraryWatchlistsOverview: () => null,
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses MovieAppRefreshControl in primary surface source files', () => {
    for (const relativePath of primarySurfaceFiles) {
      const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
      expect(source).toContain('MovieAppRefreshControl');
      expect(source).not.toMatch(/import\s*\{[^}]*\bRefreshControl\b[^}]*\}\s*from 'react-native'/);
    }
  });

  it('keeps Home progressive refresh semantics and shared control', () => {
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

    const { UNSAFE_getByType } = render(<HomeScreen />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalledTimes(1);
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

  it('keeps Library refresh semantics with shared control', () => {
    const refetch = jest.fn();
    const { useLibrary } = jest.requireMock('@/features/library/hooks/useLibrary') as {
      useLibrary: jest.Mock;
    };
    useLibrary.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: 'movie-1',
                type: 'movie',
                title: 'Library Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                year: 2024,
                voteAverage: 7.5,
                addedAt: null,
                watchedAt: null,
                lastActivityAt: '2026-01-01T00:00:00Z',
                progressPercentage: null,
                nextEpisode: null,
                collectionStatus: 'watching',
              },
            ],
            page: 1,
            pageSize: 24,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      isRefetching: true,
      isFetching: true,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
      refetch,
      fetchNextPage: jest.fn(),
    });

    const { UNSAFE_getByType } = render(<LibraryHubContent />);
    const refreshControl = UNSAFE_getByType(FlatList).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps Insights summary and analytics refresh semantics', () => {
    const refetchSummary = jest.fn();
    const refetchAnalytics = jest.fn();
    (useInsightsSummary as jest.Mock).mockReturnValue({
      data: insightsSummaryFixture,
      isLoading: false,
      isFetching: false,
      isRefetching: true,
      isError: false,
      isSuccess: true,
      refetch: refetchSummary,
    });
    (useInsightsAnalytics as jest.Mock).mockReturnValue({
      data: insightsAnalyticsFixture,
      isLoading: false,
      isFetching: false,
      isRefetching: false,
      isError: false,
      isSuccess: true,
      refetch: refetchAnalytics,
    });

    const { UNSAFE_getByType } = render(<InsightsHubContent />);
    const refreshControl = UNSAFE_getByType(ScrollView).props.refreshControl as React.ReactElement;
    expectMovieAppRefreshControl(refreshControl);
    expect(refreshControl.props.refreshing).toBe(true);

    refreshControl.props.onRefresh();
    expect(refetchSummary).toHaveBeenCalledTimes(1);
    expect(refetchAnalytics).toHaveBeenCalledTimes(1);
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
