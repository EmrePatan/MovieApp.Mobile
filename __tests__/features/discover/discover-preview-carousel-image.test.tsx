import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { DiscoverPreviewCarousel } from '@/features/discover/components/DiscoverPreviewCarousel';
import { REMOTE_IMAGE_LOAD_TIMEOUT_MS } from '@/hooks/useRemoteImageState';

jest.mock('react', () => jest.requireActual('react'));

const items = [
  {
    id: 'movie-1',
    type: 'movie' as const,
    title: 'Loaded Movie',
    originalTitle: 'Loaded Movie',
    overview: '',
    posterUrl: '/w500/loaded.jpg',
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 8,
    voteCount: 100,
    year: 2024,
  },
  {
    id: 'movie-2',
    type: 'movie' as const,
    title: 'Stuck Movie',
    originalTitle: 'Stuck Movie',
    overview: '',
    posterUrl: '/w500/stuck.jpg',
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 50,
    year: 2023,
  },
];

describe('DiscoverPreviewCarousel images', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses CatalogImage and recovers from a hung image load', () => {
    render(
      <DiscoverPreviewCarousel
        title="Top Rated"
        items={items}
        onItemPress={jest.fn()}
      />,
    );

    const images = screen.UNSAFE_queryAllByType(Image);
    expect(images.length).toBeGreaterThan(0);

    const stuckImage = images[1];
    expect(stuckImage).toBeTruthy();

    act(() => {
      stuckImage.props.onLoadStart?.();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(screen.getByLabelText('Stuck Movie poster')).toBeTruthy();
    expect(screen.getAllByLabelText('film-outline').length).toBeGreaterThan(0);
  });
});
