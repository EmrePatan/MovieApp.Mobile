import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { useHome } from '@/features/home/hooks/useHome';
import HomeScreen from '../../../app/(tabs)/home';

const mockRefetch = jest.fn();
const mockInvalidateQueries = jest.fn();
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
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
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
            type: 'NewReleases',
            title: 'New Releases',
            displayOrder: 1,
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
    expect(screen.getByText('New Releases')).toBeTruthy();
    expect(screen.getAllByText('Breaking Bad')).toHaveLength(1);
    expect(screen.getByText('Better Call Saul')).toBeTruthy();
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

  it('renders the hero from discovery sections and not Continue Watching', () => {
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
            type: 'ContinueWatching',
            title: 'Continue Watching',
            displayOrder: 1,
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
    expect(screen.getByLabelText('More info about Trending Movie')).toBeTruthy();
    expect(screen.getAllByText('Trending Movie')).toHaveLength(1);
    expect(screen.getByText('Continue Show')).toBeTruthy();
    expect(screen.getByText('Continue Watching')).toBeTruthy();
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

  it('requests a new type when filter changes', () => {
    mockUseHome.mockReturnValue({
      data: { sections: [], isPersonalized: false },
      error: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<HomeScreen />);
    fireEvent.press(screen.getByLabelText('Show TV Shows'));

    expect(mockUseHome).toHaveBeenLastCalledWith('tv', 10);
  });
});
