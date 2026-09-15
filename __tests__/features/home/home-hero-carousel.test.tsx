import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';
import { colors } from '@/theme/colors';

const mockUseHeroFavoriteStatuses = jest.fn();
const mockPrefetchQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: mockPrefetchQuery,
  }),
}));

jest.mock('@/features/home/hooks/useHeroFavoriteStatuses', () => ({
  useHeroFavoriteStatuses: (...args: unknown[]) => mockUseHeroFavoriteStatuses(...args),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/home/components/HomeHero', () => ({
  HomeHero: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Hero Slide');
  },
}));

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: overrides.id ?? 'item-id',
    contentType: overrides.contentType ?? 'movie',
    title: overrides.title ?? 'Test Title',
    originalTitle: null,
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7.5,
    voteCount: 100,
    ...overrides,
  };
}

function getCarouselSlideWidth(list: FlatList<HomeItem>) {
  return list.props.getItemLayout?.(null, 0).length ?? 400;
}

function advanceCarouselToActiveIndex(list: FlatList<HomeItem>, activeIndex: number) {
  const slideWidth = getCarouselSlideWidth(list);
  fireEvent(list, 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: (activeIndex + 1) * slideWidth, y: 0 },
    },
  });
}

const favoriteStatusesResult = {
  statuses: {},
  isLoading: false,
};

describe('HomeHeroCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseHeroFavoriteStatuses.mockReturnValue(favoriteStatusesResult);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not auto-advance when only one hero exists', () => {
    const items = [createItem({ id: 'only-one' })];

    const { queryByLabelText } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(queryByLabelText('Slide 1 of 1')).toBeNull();
    expect(mockUseHeroFavoriteStatuses).toHaveBeenCalledWith(items);
  });

  it('auto-advances across multiple heroes and wraps to the first slide', async () => {
    const items = [
      createItem({ id: 'hero-1', title: 'Hero One' }),
      createItem({ id: 'hero-2', title: 'Hero Two' }),
    ];

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToActiveIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToActiveIndex(list, 0);

    await waitFor(() => {
      expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
    });
  });

  it('resets to the first slide when the filter changes', async () => {
    const items = [
      createItem({ id: 'hero-1', title: 'Hero One' }),
      createItem({ id: 'hero-2', title: 'Hero Two' }),
    ];

    const { getByLabelText, UNSAFE_getByType, rerender } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToActiveIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });

    rerender(
      <HomeHeroCarousel items={items} filterKey="movie" onItemPress={jest.fn()} />,
    );

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
  });

  it('requests favorite statuses once for all hero items', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
      createItem({ id: 'hero-3' }),
    ];

    render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );

    expect(mockUseHeroFavoriteStatuses).toHaveBeenCalledWith(items);
  });

  it('uses the semantic accent color for the active indicator', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
    ];

    const { getByTestId } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );

    const activeStyle = StyleSheet.flatten(getByTestId('hero-indicator-active').props.style);
    expect(activeStyle.backgroundColor).toBe(colors.accent);
  });
});
