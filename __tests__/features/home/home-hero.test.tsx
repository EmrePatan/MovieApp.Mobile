import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeHero } from '@/features/home/components/HomeHero';
import type { HomeItem } from '@/features/home/types';

const mockOnPress = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

function renderHero(item: HomeItem = createItem()) {
  return render(
    <HomeHero item={item} onPress={mockOnPress} />,
  );
}

describe('HomeHero', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders compact metadata with content type, year, and rating', () => {
    renderHero();

    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByText('Movie  •  2014')).toBeTruthy();
    expect(screen.getByLabelText('Rating 8.4')).toBeTruthy();
  });

  it('navigates when pressing the hero card', () => {
    const item = createItem();

    renderHero(item);
    fireEvent.press(screen.getByLabelText('Open Interstellar'));

    expect(mockOnPress).toHaveBeenCalledWith(item);
  });

  it('renders movie and TV heroes with accessible labels', () => {
    renderHero(
      createItem({
        id: 'tv-id',
        contentType: 'tv',
        title: 'Breaking Bad',
        voteAverage: 8.9,
        releaseDate: '2008-01-20',
      }),
    );

    expect(screen.getByLabelText('Featured, Breaking Bad, TV, 2008, rating 8.9')).toBeTruthy();
    expect(screen.getByText('TV  •  2008')).toBeTruthy();
    expect(screen.getByLabelText('Rating 8.9')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Open Breaking Bad'));
    expect(mockOnPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tv-id', contentType: 'tv' }),
    );
  });

  it('handles missing backdrop and poster with a placeholder', () => {
    renderHero(
      createItem({
        backdropUrl: null,
        posterUrl: null,
      }),
    );

    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByLabelText('Featured, Interstellar, Movie, 2014, rating 8.4')).toBeTruthy();
  });

  it('handles long titles and missing metadata', () => {
    renderHero(
      createItem({
        title:
          'An Extraordinarily Long Movie Title That Should Be Clamped To Multiple Lines Without Breaking Layout',
        releaseDate: null,
        voteAverage: 0,
      }),
    );

    expect(
      screen.getByText(
        'An Extraordinarily Long Movie Title That Should Be Clamped To Multiple Lines Without Breaking Layout',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('★')).toBeNull();
    expect(screen.getByText('Movie')).toBeTruthy();
    expect(
      screen.getByLabelText(
        'Featured, An Extraordinarily Long Movie Title That Should Be Clamped To Multiple Lines Without Breaking Layout, Movie',
      ),
    ).toBeTruthy();
  });
});
