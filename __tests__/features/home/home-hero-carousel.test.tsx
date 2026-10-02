import React from 'react';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native';
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

function getCarouselSlideWidth(list: ScrollView) {
  const offset = list.props.contentOffset?.x;
  return offset != null && offset > 0 ? offset : 400;
}

function advanceCarouselToActiveIndex(list: ScrollView, activeIndex: number) {
  const slideWidth = getCarouselSlideWidth(list);
  fireEvent(list, 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: (activeIndex + 1) * slideWidth, y: 0 },
    },
  });
}

function scrollCarouselToOffset(list: ScrollView, offsetX: number) {
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
    const list = UNSAFE_getByType(ScrollView);

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    advanceCarouselToActiveIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });

    act(() => {
      jest.advanceTimersByTime(4000);
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
    const list = UNSAFE_getByType(ScrollView);

    act(() => {
      jest.advanceTimersByTime(4000);
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

  it('prefetches the wrap-around left peek when the first slide is centered', () => {
    const originalImageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
    const prefetchSpy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);
    const items = Array.from({ length: 10 }, (_, index) =>
      createItem({
        id: `hero-${index}`,
        posterUrl: `/${index}.jpg`,
      }),
    );

    render(<HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />);

    expect(prefetchSpy).toHaveBeenNthCalledWith(
      1,
      ['https://image.tmdb.org/t/p/w780/0.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    expect(prefetchSpy).toHaveBeenNthCalledWith(
      2,
      [
        'https://image.tmdb.org/t/p/w780/9.jpg',
        'https://image.tmdb.org/t/p/w780/1.jpg',
        'https://image.tmdb.org/t/p/w780/2.jpg',
      ],
      { cachePolicy: 'memory-disk' },
    );
    const prefetched = prefetchSpy.mock.calls.flatMap((call) => call[0] as string[]);
    expect(new Set(prefetched)).toEqual(
      new Set([
        'https://image.tmdb.org/t/p/w780/0.jpg',
        'https://image.tmdb.org/t/p/w780/9.jpg',
        'https://image.tmdb.org/t/p/w780/1.jpg',
        'https://image.tmdb.org/t/p/w780/2.jpg',
      ]),
    );
    expect(prefetched).not.toContain('https://image.tmdb.org/t/p/w780/3.jpg');
    expect(prefetched).not.toContain('https://image.tmdb.org/t/p/w780/8.jpg');
    prefetchSpy.mockRestore();
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalImageBaseUrl;
  });

  it('prefetches the visible and next w780 posters and wraps to the first', () => {
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
    const list = UNSAFE_getByType(ScrollView);

    expect(prefetchSpy).toHaveBeenNthCalledWith(
      1,
      ['https://image.tmdb.org/t/p/w780/poster-a.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    expect(prefetchSpy).toHaveBeenNthCalledWith(
      2,
      ['https://image.tmdb.org/t/p/w780/poster-b.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    prefetchSpy.mockClear();

    const posterOnly = [
      createItem({ id: 'hero-1', posterUrl: '/poster-a.jpg' }),
      createItem({ id: 'hero-2', posterUrl: '/poster-b.jpg' }),
    ];
    render(
      <HomeHeroCarousel items={posterOnly} filterKey="movie" onItemPress={jest.fn()} />,
    );
    expect(prefetchSpy).toHaveBeenNthCalledWith(
      1,
      ['https://image.tmdb.org/t/p/w780/poster-a.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    expect(prefetchSpy).toHaveBeenNthCalledWith(
      2,
      ['https://image.tmdb.org/t/p/w780/poster-b.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    expect(mockPrefetchQuery).not.toHaveBeenCalled();

    prefetchSpy.mockClear();
    act(() => {
      list.props.onMomentumScrollEnd?.({
        nativeEvent: {
          contentOffset: { x: getCarouselSlideWidth(list) * 2, y: 0 },
        },
      } as never);
    });

    expect(prefetchSpy).toHaveBeenNthCalledWith(
      1,
      ['https://image.tmdb.org/t/p/w780/poster-b.jpg'],
      { cachePolicy: 'memory-disk' },
    );
    expect(prefetchSpy).toHaveBeenNthCalledWith(
      2,
      ['https://image.tmdb.org/t/p/w780/poster-a.jpg'],
      { cachePolicy: 'memory-disk' },
    );
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
    const list = UNSAFE_getByType(ScrollView);
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
    const list = UNSAFE_getByType(ScrollView);
    const slideWidth = getCarouselSlideWidth(list);

    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.55);

    expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
  });

  it('rewrites loop clone offsets on momentum end so scroll position matches the real slide', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
      createItem({ id: 'hero-3' }),
    ];
    const scrollTo = jest.fn();
    const originalScrollTo = ScrollView.prototype.scrollTo;
    ScrollView.prototype.scrollTo = scrollTo;

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(ScrollView);
    const slideWidth = getCarouselSlideWidth(list);

    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });

    expect(getByLabelText('Slide 3 of 3')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({
      x: items.length * slideWidth,
      y: 0,
      animated: false,
    });

    scrollTo.mockClear();

    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: (items.length + 1) * slideWidth, y: 0 } },
    });

    expect(getByLabelText('Slide 1 of 3')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({
      x: slideWidth,
      y: 0,
      animated: false,
    });

    ScrollView.prototype.scrollTo = originalScrollTo;
  });

  it('autoplay wrap from the last slide scrolls to the trailing clone, then settles on the first', () => {
    const items = Array.from({ length: 10 }, (_, index) =>
      createItem({ id: `hero-${index + 1}`, title: `Hero ${index + 1}` }),
    );
    const scrollTo = jest.fn();
    const originalScrollTo = ScrollView.prototype.scrollTo;
    ScrollView.prototype.scrollTo = scrollTo;

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(ScrollView);
    const slideWidth = getCarouselSlideWidth(list);
    const lastRealOffset = items.length * slideWidth;
    const trailingCloneOffset = (items.length + 1) * slideWidth;

    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: lastRealOffset, y: 0 } },
    });
    expect(getByLabelText('Slide 10 of 10')).toBeTruthy();

    scrollTo.mockClear();
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(scrollTo).toHaveBeenCalledWith({
      x: trailingCloneOffset,
      y: 0,
      animated: true,
    });
    expect(scrollTo).not.toHaveBeenCalledWith({
      x: slideWidth,
      y: 0,
      animated: true,
    });

    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: trailingCloneOffset, y: 0 } },
    });

    expect(scrollTo).toHaveBeenCalledWith({
      x: slideWidth,
      y: 0,
      animated: false,
    });
    expect(getByLabelText('Slide 1 of 10')).toBeTruthy();

    ScrollView.prototype.scrollTo = originalScrollTo;
  });

  it('returns the indicator when dragging back below the 50% threshold', () => {
    const items = [
      createItem({ id: 'hero-1' }),
      createItem({ id: 'hero-2' }),
    ];

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(ScrollView);
    const slideWidth = getCarouselSlideWidth(list);

    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.55);
    scrollCarouselToOffset(list, slideWidth + slideWidth * 0.45);

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
  });

});
