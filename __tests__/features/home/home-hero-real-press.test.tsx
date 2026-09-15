import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
  }),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/home/hooks/useHeroFavoriteStatuses', () => ({
  useHeroFavoriteStatuses: () => ({
    statuses: {},
    isLoading: false,
  }),
}));

jest.mock('@/features/details/shared/components/CatalogImage', () => ({
  BackdropImage: () => null,
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

function manualSwipeToActiveIndex(list: FlatList<HomeItem>, activeIndex: number) {
  const slideWidth = getCarouselSlideWidth(list);
  act(() => {
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: (activeIndex + 1) * slideWidth, y: 0 },
        contentSize: { height: 400, width: slideWidth * 4 },
        layoutMeasurement: { height: 400, width: slideWidth },
      },
    });
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: (activeIndex + 1) * slideWidth, y: 0 },
      },
    });
  });
}

describe('HomeHeroCarousel real More Info press', () => {
  it('opens B after A detail return when manually swiping to slide B', async () => {
    const itemA = createItem({ id: 'hero-a', title: 'Hero A' });
    const itemB = createItem({ id: 'hero-b', title: 'Hero B' });
    const itemC = createItem({ id: 'hero-c', title: 'Hero C' });
    const onItemPress = jest.fn();

    const { UNSAFE_getByType, rerender } = render(
      <HomeHeroCarousel
        items={[itemA, itemB, itemC]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={true}
      />,
    );
    const list = UNSAFE_getByType(FlatList);

    fireEvent.press(screen.getByLabelText('More info about Hero A'));
    expect(onItemPress).toHaveBeenCalledWith(itemA);
    onItemPress.mockClear();

    rerender(
      <HomeHeroCarousel
        items={[itemA, itemB, itemC]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={false}
      />,
    );
    rerender(
      <HomeHeroCarousel
        items={[itemA, itemB, itemC]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={true}
      />,
    );

    manualSwipeToActiveIndex(list, 1);

    await waitFor(() => {
      expect(screen.getByLabelText('Slide 2 of 3')).toBeTruthy();
      expect(screen.getByLabelText('More info about Hero B')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('More info about Hero B'));

    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(onItemPress).toHaveBeenCalledWith(itemB);
    expect(onItemPress).not.toHaveBeenCalledWith(itemA);
  });

  it('mounts the active hero slide when the indicator advances', async () => {
    const itemA = createItem({ id: 'hero-a', title: 'Hero A' });
    const itemB = createItem({ id: 'hero-b', title: 'Hero B' });

    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={[itemA, itemB]} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    manualSwipeToActiveIndex(list, 1);

    await waitFor(() => {
      expect(screen.getByLabelText('Slide 2 of 2')).toBeTruthy();
      expect(screen.getByLabelText('More info about Hero B')).toBeTruthy();
    });
  });
});
