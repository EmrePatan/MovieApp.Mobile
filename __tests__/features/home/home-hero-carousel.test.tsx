import React from 'react';
import { FlatList, Image } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';
const mockPrefetchQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: mockPrefetchQuery,
  }),
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

function scrollCarouselToOffset(list: FlatList<HomeItem>, offsetX: number) {
  fireEvent.scroll(list, {
    nativeEvent: {
      contentOffset: { x: offsetX, y: 0 },
    },
  });
}

describe('HomeHeroCarousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
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

  it('prefetches the next poster, or the backdrop when the poster is missing', () => {
    const originalImageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
    const prefetchSpy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);
    const items = [
      createItem({
        id: 'hero-1',
        posterUrl: '/poster-a.jpg',
        backdropUrl: '/backdrop-a.jpg',
      }),
      createItem({
        id: 'hero-2',
        posterUrl: '/poster-b.jpg',
        backdropUrl: '/backdrop-b.jpg',
      }),
    ];

    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    expect(prefetchSpy).toHaveBeenCalledWith(
      'https://image.tmdb.org/t/p/original/poster-b.jpg',
    );
    prefetchSpy.mockClear();

    const backdropOnly = [
      createItem({ id: 'hero-1', backdropUrl: '/backdrop-a.jpg' }),
      createItem({ id: 'hero-2', backdropUrl: '/backdrop-b.jpg' }),
    ];
    render(
      <HomeHeroCarousel items={backdropOnly} filterKey="movie" onItemPress={jest.fn()} />,
    );
    expect(prefetchSpy).toHaveBeenCalledWith(
      'https://image.tmdb.org/t/p/w1280/backdrop-b.jpg',
    );
    expect(mockPrefetchQuery).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToActiveIndex(list, 1);

    expect(mockPrefetchQuery).not.toHaveBeenCalled();
    prefetchSpy.mockRestore();
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalImageBaseUrl;
  });

  it('keeps the indicator on the current slide below 50% manual drag', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
    ];

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);

    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.4);

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
  });

  it('updates the indicator beyond 50% manual drag before momentum ends', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
    ];

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);

    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.55);

    expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
  });

  it('returns the indicator when dragging back below the 50% threshold', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
    ];

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);

    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.55);
    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.45);

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
  });

});
