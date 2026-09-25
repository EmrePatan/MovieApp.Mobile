import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeHeroCarousel } from '@/features/home/components/HomeHeroCarousel';
import type { HomeItem } from '@/features/home/types';

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
  }),
}));

function createItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: 'hero-id',
    contentType: 'movie',
    title: 'Interstellar',
    originalTitle: null,
    posterUrl: 'https://example.com/poster.jpg',
    backdropUrl: 'https://example.com/backdrop.jpg',
    releaseDate: '2014-11-07',
    voteAverage: 8.4,
    voteCount: 1000,
    ...overrides,
  };
}

describe('HomeHeroCarousel visual refresh', () => {
  it('updates the visible hero when the same id gets new artwork metadata', () => {
    const onItemPress = jest.fn();
    const { rerender } = render(
      <HomeHeroCarousel
        items={[createItem()]}
        filterKey="all"
        onItemPress={onItemPress}
      />,
    );

    rerender(
      <HomeHeroCarousel
        items={[
          createItem({
            title: 'Dune',
            voteAverage: 9.1,
            releaseDate: '2021-10-22',
            backdropUrl: 'https://example.com/dune.jpg',
          }),
        ]}
        filterKey="all"
        onItemPress={onItemPress}
      />,
    );

    expect(screen.getByText('Dune')).toBeTruthy();
    expect(screen.getByLabelText('Rating 9.1')).toBeTruthy();
  });
});
