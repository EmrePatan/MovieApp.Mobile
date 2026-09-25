import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeListHeader } from '@/features/home/components/HomeListHeader';
import type { HomeItem } from '@/features/home/types';

jest.mock('@/features/home/components/HomeHeroCarousel', () => ({
  HomeHeroCarousel: ({ items }: { items: HomeItem[] }) => {
    const { Text } = require('react-native');
    return <Text>Hero carousel: {items[0]?.title}</Text>;
  },
}));

jest.mock('@/features/home/components/ColdHomeWelcome', () => ({
  ColdHomeWelcome: () => {
    const { Text } = require('react-native');
    return <Text>Find your next favorite</Text>;
  },
}));

const heroItem: HomeItem = {
  id: 'hero-id',
  contentType: 'movie',
  title: 'Hero Movie',
  originalTitle: null,
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2020-01-01',
  voteAverage: 8,
  voteCount: 100,
};

describe('HomeListHeader', () => {
  it('passes a refreshed title through when the hero id stays the same', () => {
    const onItemPress = jest.fn();
    const onExplorePress = jest.fn();
    const { rerender } = render(
      <HomeListHeader
        heroItems={[heroItem]}
        showColdWelcome={false}
        onItemPress={onItemPress}
        onExplorePress={onExplorePress}
      />,
    );

    rerender(
      <HomeListHeader
        heroItems={[{ ...heroItem, title: 'Updated Hero', voteAverage: 9.2 }]}
        showColdWelcome={false}
        onItemPress={onItemPress}
        onExplorePress={onExplorePress}
      />,
    );

    expect(screen.getByText('Hero carousel: Updated Hero')).toBeTruthy();
  });

  it('shows hero carousel for cold users when hero items exist', () => {
    render(
      <HomeListHeader
        heroItems={[heroItem]}
        showColdWelcome={false}
        onItemPress={jest.fn()}
        onExplorePress={jest.fn()}
      />,
    );

    expect(screen.getByText('Hero carousel: Hero Movie')).toBeTruthy();
    expect(screen.queryByText('Find your next favorite')).toBeNull();
  });

  it('shows cold welcome only when requested and there are no hero items', () => {
    render(
      <HomeListHeader
        heroItems={[]}
        showColdWelcome={true}
        onItemPress={jest.fn()}
        onExplorePress={jest.fn()}
      />,
    );

    expect(screen.getByText('Find your next favorite')).toBeTruthy();
    expect(screen.queryByText(/Hero carousel/)).toBeNull();
  });

  it('prefers hero carousel when hero items exist even if cold welcome is flagged', () => {
    render(
      <HomeListHeader
        heroItems={[heroItem]}
        showColdWelcome={true}
        onItemPress={jest.fn()}
        onExplorePress={jest.fn()}
      />,
    );

    expect(screen.getByText('Hero carousel: Hero Movie')).toBeTruthy();
    expect(screen.queryByText('Find your next favorite')).toBeNull();
  });
});
