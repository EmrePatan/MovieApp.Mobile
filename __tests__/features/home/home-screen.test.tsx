import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useHome } from '@/features/home/hooks/useHome';
import { presentHomeSections } from '@/features/home/utils/present-home-sections';
import HomeScreen from '../../../app/(tabs)/home';

const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockPush = jest.fn();
const mockUseHome = useHome as jest.Mock;

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

jest.mock('@/features/home/hooks/useHome', () => ({
  homeQueryKey: (type: string, sectionSize: number) => ['home', type, sectionSize],
  useHome: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
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

jest.mock('@/features/home/components/HomeHeroCarousel', () => ({
  HomeHeroCarousel: ({ items, onItemPress }: { items: Array<{ id: string; title: string }>; onItemPress: (item: { id: string; title: string }) => void }) => {
    const React = require('react');
    const { View, Pressable, Text } = require('react-native');
    const item = items[0];
    if (!item) {
      return null;
    }

    return React.createElement(
      View,
      null,
      React.createElement(
        Pressable,
        { accessibilityLabel: `More info about ${item.title}`, onPress: () => onItemPress(item) },
        React.createElement(Text, null, item.title),
      ),
    );
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByLabelText('Loading home')).toBeTruthy();
  });

  it('renders home sections on success', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 1,
            items: [
              {
                id: 'trending-1',
                contentType: 'tv',
                title: 'Trending Show',
                originalTitle: 'Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2008-01-20',
                voteAverage: 8.0,
                voteCount: 100,
              },
              {
                id: 'trending-2',
                contentType: 'tv',
                title: 'Another Trending Show',
                originalTitle: 'Another Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2010-01-20',
                voteAverage: 7.8,
                voteCount: 90,
              },
              {
                id: 'trending-3',
                contentType: 'tv',
                title: 'Third Trending Show',
                originalTitle: 'Third Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2011-01-20',
                voteAverage: 7.7,
                voteCount: 85,
              },
              {
                id: 'trending-4',
                contentType: 'tv',
                title: 'Fourth Trending Show',
                originalTitle: 'Fourth Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2012-01-20',
                voteAverage: 7.6,
                voteCount: 80,
              },
              {
                id: 'trending-5',
                contentType: 'tv',
                title: 'Fifth Trending Show',
                originalTitle: 'Fifth Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2013-01-20',
                voteAverage: 7.5,
                voteCount: 75,
              },
              {
                id: 'trending-6',
                contentType: 'tv',
                title: 'Sixth Trending Show',
                originalTitle: 'Sixth Trending Show',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2014-01-20',
                voteAverage: 7.4,
                voteCount: 70,
              },
            ],
          },
          {
            type: 'NewReleases',
            title: 'New Releases',
            displayOrder: 2,
            items: [
              {
                id: 'abc',
                contentType: 'tv',
                title: 'Breaking Bad',
                originalTitle: 'Breaking Bad',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2008-01-20',
                voteAverage: 8.9,
                voteCount: 100,
              },
              {
                id: 'def',
                contentType: 'tv',
                title: 'Better Call Saul',
                originalTitle: 'Better Call Saul',
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2015-02-08',
                voteAverage: 8.7,
                voteCount: 80,
              },
            ],
          },
        ],
        isPersonalized: false,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByText('Find your next favorite')).toBeTruthy();
    expect(screen.getByText('Trending')).toBeTruthy();
    expect(screen.queryByText('New Releases')).toBeNull();
    expect(screen.queryByLabelText('Show TV Shows')).toBeNull();
  });

  it('renders error state with retry', () => {
    mockUseHome.mockReturnValue({
      data: undefined,
      error: new ApiError({ kind: 'network' }),
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders the hero from Recommended For You and hides Continue Watching', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 2,
            items: [
              {
                id: 'trending-id',
                contentType: 'movie',
                title: 'Trending Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 7.0,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'RecommendedForYou',
            title: 'Recommended For You',
            displayOrder: 1,
            items: [
              {
                id: 'recommended-id',
                contentType: 'movie',
                title: 'Recommended Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.5,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'ContinueWatching',
            title: 'Continue Watching',
            displayOrder: 3,
            items: [
              {
                id: 'continue-id',
                contentType: 'tv',
                title: 'Continue Show',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2010-01-01',
                voteAverage: 9.0,
                voteCount: 200,
              },
            ],
          },
        ],
        isPersonalized: true,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    expect(screen.getByLabelText('More info about Recommended Movie')).toBeTruthy();
    expect(screen.queryByText('Trending Movie')).toBeNull();
    expect(screen.queryByText('Continue Show')).toBeNull();
    expect(screen.queryByText('Continue Watching')).toBeNull();
  });

  it('renders personalized sections in Home 2.0 order and excludes Popular', () => {
    const sections = [
          {
            type: 'Popular',
            title: 'Popular',
            displayOrder: 99,
            items: [
              {
                id: 'popular-id',
                contentType: 'movie',
                title: 'Popular Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 7.0,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'TopRated',
            title: 'Top Rated',
            displayOrder: 5,
            items: [
              {
                id: 'top-id',
                contentType: 'movie',
                title: 'Top Rated Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 9.0,
                voteCount: 50,
              },
              {
                id: 'top-id-2',
                contentType: 'movie',
                title: 'Second Top Rated Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.9,
                voteCount: 50,
              },
              {
                id: 'top-id-3',
                contentType: 'movie',
                title: 'Third Top Rated Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.8,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'BecauseYouWatched',
            title: 'Because You Watched',
            displayOrder: 2,
            items: [
              {
                id: 'because-id',
                contentType: 'movie',
                title: 'Because Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.0,
                voteCount: 50,
              },
            ],
          },
          {
            type: 'RecommendedForYou',
            title: 'Recommended For You',
            displayOrder: 1,
            items: [
              {
                id: 'recommended-id',
                contentType: 'movie',
                title: 'Recommended Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.5,
                voteCount: 50,
              },
              {
                id: 'recommended-id-2',
                contentType: 'movie',
                title: 'Second Recommended Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.4,
                voteCount: 50,
              },
              {
                id: 'recommended-id-3',
                contentType: 'movie',
                title: 'Third Recommended Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.3,
                voteCount: 50,
              },
              {
                id: 'recommended-id-4',
                contentType: 'movie',
                title: 'Fourth Recommended Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.2,
                voteCount: 50,
              },
            ],
          },
        ];

    mockUseHome.mockReturnValue({
      data: {
        sections,
        isPersonalized: true,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    const presented = presentHomeSections(sections, true);

    expect(presented.sections.map((section) => section.type)).toEqual([
      'RecommendedForYou',
      'BecauseYouWatched',
    ]);

    render(<HomeScreen />);

    expect(screen.getByText('Recommended For You')).toBeTruthy();
    expect(screen.getByText('Because You Watched')).toBeTruthy();
    expect(screen.queryByText('Top Rated')).toBeNull();
    expect(screen.queryByText('Popular')).toBeNull();
    expect(screen.queryByText('Popular Movie')).toBeNull();
    expect(screen.queryByText('Trending')).toBeNull();
  });

  it('deduplicates hero items from their source rails', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'RecommendedForYou',
            title: 'Recommended For You',
            displayOrder: 1,
            items: [
              {
                id: 'hero-id',
                contentType: 'movie',
                title: 'Hero Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.0,
                voteCount: 100,
              },
              {
                id: 'second-recommended',
                contentType: 'movie',
                title: 'Second Recommended',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2021-01-01',
                voteAverage: 7.5,
                voteCount: 80,
              },
              {
                id: 'third-recommended',
                contentType: 'movie',
                title: 'Third Recommended',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2021-06-01',
                voteAverage: 7.4,
                voteCount: 70,
              },
              {
                id: 'fourth-recommended',
                contentType: 'movie',
                title: 'Fourth Recommended',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2022-01-01',
                voteAverage: 7.3,
                voteCount: 60,
              },
            ],
          },
        ],
        isPersonalized: true,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);

    expect(screen.getAllByText('Hero Movie')).toHaveLength(1);
    expect(screen.getByText('Fourth Recommended')).toBeTruthy();
  });

  it('navigates to Search explore from cold home CTA', () => {
    mockUseHome.mockReturnValue({
      data: { sections: [], isPersonalized: false },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Explore movies and shows'));

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/search?explore=1');
  });

  it('navigates to Discover from Trending See All even when hero dedup empties the rail', () => {
    mockUseHome.mockReturnValue({
      data: {
        sections: [
          {
            type: 'Trending',
            title: 'Trending',
            displayOrder: 1,
            items: [
              {
                id: 'trending-only',
                contentType: 'movie',
                title: 'Trending Movie',
                originalTitle: null,
                posterUrl: null,
                backdropUrl: null,
                releaseDate: '2020-01-01',
                voteAverage: 8.0,
                voteCount: 50,
              },
            ],
          },
        ],
        isPersonalized: false,
      },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('See all Trending'));

    expect(mockPush).toHaveBeenCalledWith('/discover?mode=trending&type=all');
  });
});
