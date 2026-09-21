import { fireEvent, render, screen } from '@testing-library/react-native';
import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import type { GalleryResponse } from '@/features/gallery/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: jest.fn(() => true) }),
  usePathname: () => '/movie/3fa85f64-5717-4562-b3fc-2c963f66afa6/gallery',
  useSegments: () => ['movie', '3fa85f64-5717-4562-b3fc-2c963f66afa6', 'gallery'],
}));

const gallery: GalleryResponse = {
  backdrops: [
    {
      filePath: '/backdrop.jpg',
      width: 1920,
      height: 1080,
      aspectRatio: 1.778,
      language: null,
      voteAverage: 8,
      voteCount: 20,
    },
  ],
  posters: [
    {
      filePath: '/poster.jpg',
      width: 1000,
      height: 1500,
      aspectRatio: 0.667,
      language: 'en',
      voteAverage: 7,
      voteCount: 10,
    },
  ],
  logos: [],
  profiles: [],
};

describe('GalleryDetailContent', () => {
  it('renders catalog filters and grid', () => {
    render(<GalleryDetailContent gallery={gallery} mode="catalog" subtitle="Interstellar" />);

    expect(screen.getByText('Gallery')).toBeTruthy();
    expect(screen.getByTestId('gallery-filter-tabs')).toBeTruthy();
    expect(screen.getByTestId('gallery-grid')).toBeTruthy();
  });

  it('filters backdrops and posters', () => {
    render(<GalleryDetailContent gallery={gallery} mode="catalog" />);

    fireEvent.press(screen.getByTestId('gallery-filter-backdrops'));
    expect(screen.getAllByTestId(/gallery-grid-item-/)).toHaveLength(1);

    fireEvent.press(screen.getByTestId('gallery-filter-posters'));
    expect(screen.getAllByTestId(/gallery-grid-item-/)).toHaveLength(1);
  });

  it('renders person photos without filters', () => {
    const personGallery: GalleryResponse = {
      backdrops: [],
      posters: [],
      logos: [],
      profiles: [
        {
          filePath: '/profile.jpg',
          width: 800,
          height: 1200,
          aspectRatio: 0.667,
          language: null,
          voteAverage: 6,
          voteCount: 5,
        },
      ],
    };

    render(<GalleryDetailContent gallery={personGallery} mode="person" />);

    expect(screen.getByText('Photos')).toBeTruthy();
    expect(screen.queryByTestId('gallery-filter-tabs')).toBeNull();
    expect(screen.getByTestId('gallery-grid')).toBeTruthy();
  });
});
