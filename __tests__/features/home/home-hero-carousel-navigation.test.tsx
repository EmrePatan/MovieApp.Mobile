import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';
import { createHomeContentKey } from '@/features/home/utils/selectHeroCandidates';

const mockUseHeroFavoriteStatuses = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
  }),
}));

jest.mock('@/features/home/hooks/useHeroFavoriteStatuses', () => ({
  useHeroFavoriteStatuses: (...args: unknown[]) => mockUseHeroFavoriteStatuses(...args),
}));

jest.mock('@/features/favorites/components/FavoriteButton', () => ({
  FavoriteButton: () => null,
}));

jest.mock('@/features/home/components/HomeHero', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    HomeHero: ({
      item,
      onPress,
    }: {
      item: HomeItem;
      onPress?: (pressedItem: HomeItem) => void;
    }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hero ${item.title}`}
        onPress={() => onPress?.(item)}
      >
        <Text>{item.title}</Text>
      </Pressable>
    ),
  };
});

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

function pressHeroSlide(list: FlatList<HomeItem>, item: HomeItem, index: number) {
  const slide = list.props.renderItem({
    item,
    index,
    separators: {
      highlight: jest.fn(),
      unhighlight: jest.fn(),
      updateProps: jest.fn(),
    },
  });
  const slideRender = render(slide);
  fireEvent.press(slideRender.getByLabelText(`Hero ${item.title}`));
  slideRender.unmount();
}

function advanceCarouselToIndex(list: FlatList<HomeItem>, index: number) {
  fireEvent(list, 'momentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: index * 400, y: 0 },
    },
  });
}

const favoriteStatusesResult = {
  statuses: {},
  isLoading: false,
};

describe('HomeHeroCarousel navigation and focus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseHeroFavoriteStatuses.mockReturnValue(favoriteStatusesResult);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigates using the pressed hero item A', () => {
    const itemA = createItem({ id: 'hero-a', title: 'Hero A' });
    const onItemPress = jest.fn();

    const { getByLabelText } = render(
      <HomeHeroCarousel items={[itemA]} filterKey="all" onItemPress={onItemPress} />,
    );

    fireEvent.press(getByLabelText('Hero Hero A'));

    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(onItemPress).toHaveBeenCalledWith(itemA);
  });

  it('navigates using the pressed hero item B after advancing', async () => {
    const itemA = createItem({ id: 'hero-a', title: 'Hero A' });
    const itemB = createItem({ id: 'hero-b', title: 'Hero B' });
    const onItemPress = jest.fn();

    const { getByLabelText, UNSAFE_getByType } = render(
      <HomeHeroCarousel items={[itemA, itemB]} filterKey="all" onItemPress={onItemPress} />,
    );
    const list = UNSAFE_getByType(FlatList);

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });

    pressHeroSlide(list, itemB, 1);

    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(onItemPress).toHaveBeenCalledWith(itemB);
    expect(onItemPress).not.toHaveBeenCalledWith(itemA);
  });

  it('opens the visible hero item after returning from Detail', async () => {
    const itemA = createItem({ id: 'hero-a', title: 'Hero A' });
    const itemB = createItem({ id: 'hero-b', title: 'Hero B' });
    const onItemPress = jest.fn();

    const { getByLabelText, rerender, UNSAFE_getByType } = render(
      <HomeHeroCarousel
        items={[itemA, itemB]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={true}
      />,
    );
    const list = UNSAFE_getByType(FlatList);

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });

    rerender(
      <HomeHeroCarousel
        items={[itemA, itemB]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={false}
      />,
    );

    rerender(
      <HomeHeroCarousel
        items={[itemA, itemB]}
        filterKey="all"
        onItemPress={onItemPress}
        isScreenFocused={true}
      />,
    );

    pressHeroSlide(list, itemB, 1);

    expect(onItemPress).toHaveBeenCalledTimes(1);
    expect(onItemPress).toHaveBeenCalledWith(itemB);
  });

  it('pauses auto-advance while Home is unfocused', () => {
    const items = [
      createItem({ id: 'hero-1', title: 'Hero One' }),
      createItem({ id: 'hero-2', title: 'Hero Two' }),
    ];

    const { getByLabelText } = render(
      <HomeHeroCarousel
        items={items}
        filterKey="all"
        onItemPress={jest.fn()}
        isScreenFocused={false}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(getByLabelText('Slide 1 of 2')).toBeTruthy();
  });

  it('resumes auto-advance after Home regains focus', async () => {
    const items = [
      createItem({ id: 'hero-1', title: 'Hero One' }),
      createItem({ id: 'hero-2', title: 'Hero Two' }),
    ];

    const { getByLabelText, rerender, UNSAFE_getByType } = render(
      <HomeHeroCarousel
        items={items}
        filterKey="all"
        onItemPress={jest.fn()}
        isScreenFocused={false}
      />,
    );
    const list = UNSAFE_getByType(FlatList);

    rerender(
      <HomeHeroCarousel
        items={items}
        filterKey="all"
        onItemPress={jest.fn()}
        isScreenFocused={true}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    advanceCarouselToIndex(list, 1);

    await waitFor(() => {
      expect(getByLabelText('Slide 2 of 2')).toBeTruthy();
    });
  });

  it('uses stable mediaType:contentId keys for hero slides', () => {
    const items = [
      createItem({ id: 'hero-1', contentType: 'movie' }),
      createItem({ id: 'hero-2', contentType: 'tv' }),
    ];

    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    expect(list.props.keyExtractor(items[0], 0)).toBe('movie:hero-1');
    expect(list.props.keyExtractor(items[1], 1)).toBe('tv:hero-2');
    expect(createHomeContentKey(items[0])).toBe('movie:hero-1');
    expect(createHomeContentKey(items[1])).toBe('tv:hero-2');
  });
});
