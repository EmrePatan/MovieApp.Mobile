import React from 'react';
import { Image } from 'react-native';
import { act, render, screen, fireEvent } from '@testing-library/react-native';
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

function exhaustImageLoad(image: { props: { onError?: () => void } }) {
  act(() => {
    image.props.onError?.();
  });
  act(() => {
    screen.UNSAFE_getByType(Image).props.onError?.();
  });
}

describe('HomeHero', () => {
  const originalImageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalImageBaseUrl;
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

    expect(screen.getByLabelText('Featured, Breaking Bad, TV, 2008, Rating 8.9')).toBeTruthy();
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
    expect(screen.getByLabelText('Featured, Interstellar, Movie, 2014, Rating 8.4')).toBeTruthy();
  });

  it('updates title and rating when the same hero id is refreshed', () => {
    const { rerender } = renderHero();

    rerender(
      <HomeHero
        item={createItem({ title: 'Dune', voteAverage: 9.1, releaseDate: '2021-10-22' })}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText('Dune')).toBeTruthy();
    expect(screen.getByText('Movie  •  2021')).toBeTruthy();
    expect(screen.getByLabelText('Rating 9.1')).toBeTruthy();
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

  it('loads an original poster with contain even when a backdrop exists', () => {
    renderHero(
      createItem({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/poster.jpg',
      }),
    );

    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({
      uri: 'https://image.tmdb.org/t/p/original/poster.jpg',
    });
    expect(image.props.resizeMode).toBe('contain');
  });

  it('shows the placeholder when the hero has no poster', () => {
    renderHero(
      createItem({
        backdropUrl: '/backdrop.jpg',
        posterUrl: null,
      }),
    );

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

  it('shows the placeholder after the poster fails to load', () => {
    renderHero(
      createItem({
        backdropUrl: '/backdrop.jpg',
        posterUrl: '/missing-poster.jpg',
      }),
    );

    exhaustImageLoad(screen.UNSAFE_getByType(Image));

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

  it('shows the placeholder when a poster fails and there is no backdrop', () => {
    renderHero(
      createItem({
        backdropUrl: null,
        posterUrl: '/missing-poster.jpg',
      }),
    );

    exhaustImageLoad(screen.UNSAFE_getByType(Image));

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

});
