import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';
import {
  getHeroCarouselImagePriority,
  getHeroCarouselInitialMountedIndices,
  getScrollIndexForActiveIndex,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
  HERO_CAROUSEL_RENDER_WINDOW,
} from '@/features/home/utils/home-hero-carousel-index';
import { resolveHomeHeroPosterUri } from '@/features/home/utils/home-hero-image';

const heroRenderLog: {
  slideIndex?: number;
  isActive?: boolean;
  itemId: string;
  posterUrl: string | null;
  imagePriority?: string;
}[] = [];

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
  }),
}));

jest.mock('@/features/home/components/HomeHero', () => ({
  HomeHero: ({
    item,
    slideIndex,
    isActive,
    imagePriority,
  }: {
    item: HomeItem;
    slideIndex?: number;
    isActive?: boolean;
    imagePriority?: string;
  }) => {
    heroRenderLog.push({
      slideIndex,
      isActive,
      itemId: item.id,
      posterUrl: item.posterUrl,
      imagePriority,
    });
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      testID: `hero-slide-${slideIndex ?? 'x'}`,
      accessibilityState: { selected: Boolean(isActive) },
    });
  },
}));

function createItem(id: string, posterUrl = `/${id}.jpg`): HomeItem {
  return {
    id,
    contentType: 'movie',
    title: `Title ${id}`,
    originalTitle: null,
    posterUrl,
    backdropUrl: null,
    releaseDate: '2020-01-01',
    voteAverage: 8,
    voteCount: 10,
  };
}

function getCarouselSlideWidth(list: FlatList<HomeItem>) {
  return list.props.getItemLayout?.(null, 0).length ?? 400;
}

function emitCarouselScroll(list: FlatList<HomeItem>, offsetX: number) {
  act(() => {
    list.props.onScroll?.({
      nativeEvent: { contentOffset: { x: offsetX, y: 0 } },
    } as never);
  });
}

function getActiveHeroRenders() {
  return heroRenderLog.filter((entry) => entry.isActive);
}

describe('HomeHeroCarousel loop boundary consistency', () => {
  beforeEach(() => {
    heroRenderLog.length = 0;
  });

  it('mounts the wrap-around left peek in the initial window at w780', () => {
    const items = [
      createItem('a', '/a.jpg'),
      createItem('b', '/b.jpg'),
      createItem('c', '/c.jpg'),
      createItem('last', '/last.jpg'),
    ];
    const { UNSAFE_getByType, getByLabelText } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);
    const loopLength = items.length + 2;

    expect(getHeroCarouselInitialMountedIndices(loopLength)).toEqual([0, 1, 2]);
    expect(list.props.initialScrollIndex).toBe(0);
    expect(list.props.initialNumToRender).toBe(HERO_CAROUSEL_RENDER_WINDOW);
    expect(list.props.windowSize).toBe(HERO_CAROUSEL_RENDER_WINDOW);
    expect(list.props.contentOffset).toEqual({
      x: slideWidth * HERO_CAROUSEL_LOOP_HEAD_INDEX,
      y: 0,
    });

    const mounted = getHeroCarouselInitialMountedIndices(loopLength).map((index) =>
      heroRenderLog.find((entry) => entry.slideIndex === index),
    );
    expect(mounted.map((entry) => entry?.slideIndex)).toEqual([0, 1, 2]);
    expect(mounted[0]).toEqual(
      expect.objectContaining({
        slideIndex: 0,
        itemId: 'last',
        posterUrl: '/last.jpg',
        isActive: false,
        imagePriority: 'normal',
      }),
    );
    expect(resolveHomeHeroPosterUri(mounted[0]?.posterUrl)).toBe(
      'https://image.tmdb.org/t/p/w780/last.jpg',
    );
    expect(getHeroCarouselImagePriority(0, HERO_CAROUSEL_LOOP_HEAD_INDEX)).toBe('normal');
    expect(mounted[1]).toEqual(
      expect.objectContaining({
        slideIndex: 1,
        itemId: 'a',
        isActive: true,
        imagePriority: 'high',
      }),
    );
    expect(getByLabelText('Slide 1 of 4')).toBeTruthy();
  });

  it('rewrites head clone settle to the real last slide with a matching active cell (FIRST → LAST)', () => {
    const items = [createItem('a'), createItem('b'), createItem('c')];
    const { UNSAFE_getByType, getByLabelText } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);

    heroRenderLog.length = 0;
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });

    // The real last cell sits past the 3-cell startup window in tests, where
    // list metrics never expand the window. Settle still selects that slide.
    expect(getByLabelText('Slide 3 of 3')).toBeTruthy();
    expect(getActiveHeroRenders().some((entry) => entry.slideIndex === 0 && entry.isActive)).toBe(
      false,
    );
    expect(list.props.initialNumToRender).toBe(3);
    expect(list.props.maxToRenderPerBatch).toBe(3);
    expect(list.props.windowSize).toBe(3);
    expect(list.props.removeClippedSubviews).toBe(false);
  });

  it('keeps the centered physical slide active while settling on the tail clone (LAST → FIRST)', () => {
    const items = [createItem('a'), createItem('b'), createItem('c')];
    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);
    const tailCloneOffset = (items.length + 1) * slideWidth;

    heroRenderLog.length = 0;
    emitCarouselScroll(list, tailCloneOffset);

    // The tail clone is outside the 3-slide window, so it is not mounted yet.
    // Settling still has to activate the real first slide, which is in the window.
    expect(getActiveHeroRenders()).toEqual([]);

    heroRenderLog.length = 0;
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: tailCloneOffset, y: 0 } },
    });

    const activeAfterSettle = getActiveHeroRenders();
    expect(activeAfterSettle).toEqual([
      expect.objectContaining({
        slideIndex: HERO_CAROUSEL_LOOP_HEAD_INDEX,
        isActive: true,
        itemId: 'a',
        imagePriority: 'high',
      }),
    ]);
  });

  it('does not change active-slide selection logic for in-range transitions', () => {
    const items = [createItem('a'), createItem('b'), createItem('c')];
    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);
    const middleOffset = getScrollIndexForActiveIndex(1) * slideWidth;

    heroRenderLog.length = 0;
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: middleOffset, y: 0 } },
    });

    expect(getActiveHeroRenders()).toEqual([
      expect.objectContaining({
        slideIndex: getScrollIndexForActiveIndex(1),
        isActive: true,
        itemId: 'b',
        imagePriority: 'high',
      }),
    ]);
  });
});
