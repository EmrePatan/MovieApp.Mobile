import React from 'react';
import { FlatList } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';
import {
  getScrollIndexForActiveIndex,
  HERO_CAROUSEL_LOOP_HEAD_INDEX,
} from '@/features/home/utils/home-hero-carousel-index';

const heroRenderLog: Array<{
  slideIndex?: number;
  isActive?: boolean;
  itemId: string;
}> = [];

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
  }: {
    item: HomeItem;
    slideIndex?: number;
    isActive?: boolean;
  }) => {
    heroRenderLog.push({ slideIndex, isActive, itemId: item.id });
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, {
      testID: `hero-slide-${slideIndex ?? 'x'}`,
      accessibilityState: { selected: Boolean(isActive) },
    });
  },
}));

function createItem(id: string): HomeItem {
  return {
    id,
    contentType: 'movie',
    title: `Title ${id}`,
    originalTitle: null,
    posterUrl: '/poster.jpg',
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

  it('rewrites head clone settle to the real last slide with a matching active cell (FIRST → LAST)', () => {
    const items = [createItem('a'), createItem('b'), createItem('c')];
    const { UNSAFE_getByType } = render(
      <HomeHeroCarousel items={items} filterKey="all" onItemPress={jest.fn()} />,
    );
    const list = UNSAFE_getByType(FlatList);
    const slideWidth = getCarouselSlideWidth(list);

    heroRenderLog.length = 0;
    fireEvent(list, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });

    const activeAfterSettle = getActiveHeroRenders();
    expect(activeAfterSettle).toEqual([
      {
        slideIndex: items.length,
        isActive: true,
        itemId: 'c',
      },
    ]);
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
      {
        slideIndex: HERO_CAROUSEL_LOOP_HEAD_INDEX,
        isActive: true,
        itemId: 'a',
      },
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
      { slideIndex: getScrollIndexForActiveIndex(1), isActive: true, itemId: 'b' },
    ]);
  });
});
