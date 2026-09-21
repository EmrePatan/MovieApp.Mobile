import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { DiscoverPreviewCarousel } from '@/features/discover/components/DiscoverPreviewCarousel';

const items = [
  {
    id: 'movie-1',
    type: 'movie' as const,
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    overview: '',
    posterUrl: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 8,
    voteCount: 100,
    year: 2014,
  },
  {
    id: 'movie-2',
    type: 'movie' as const,
    title: 'Inception',
    originalTitle: 'Inception',
    overview: '',
    posterUrl: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    backdropUrl: null,
    releaseDate: null,
    voteAverage: 7,
    voteCount: 50,
    year: 2010,
  },
];

describe('DiscoverPreviewCarousel images', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  it('keeps CatalogImage mounted while loading and only falls back on error', () => {
    render(
      <DiscoverPreviewCarousel
        title="Top Rated"
        items={items}
        onItemPress={jest.fn()}
      />,
    );

    const images = screen.UNSAFE_queryAllByType(Image);
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    );

    act(() => {
      images[1].props.onError?.();
      screen.UNSAFE_getAllByType(Image)[1]?.props.onError?.();
    });

    expect(screen.getByLabelText('Inception poster')).toBeTruthy();
    expect(screen.getAllByLabelText('film-outline').length).toBeGreaterThan(0);
    expect(screen.UNSAFE_getAllByType(Image)).toHaveLength(1);
  });
});
