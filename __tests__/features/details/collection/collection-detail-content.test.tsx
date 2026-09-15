import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CollectionDetailContent } from '@/features/details/collection/components/CollectionDetailContent';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
  useSegments: jest.fn(() => ['(tabs)', 'collection', '[tmdbId]']),
}));

jest.mock('@/features/details/shared/navigation/prefetch-catalog-detail', () => ({
  prefetchCatalogDetail: jest.fn(),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CollectionDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero, overview, and collection parts', () => {
    renderWithQueryClient(
      <CollectionDetailContent
        collection={{
          tmdbId: 9485,
          name: 'The Dark Knight Collection',
          overview: 'Batman trilogy.',
          posterPath: '/collection.jpg',
          backdropPath: '/backdrop.jpg',
          parts: [
            {
              id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              title: 'Batman Begins',
              posterPath: '/begins.jpg',
              releaseDate: '2005-06-15',
              voteAverage: 7.7,
              voteCount: 12000,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('The Dark Knight Collection')).toBeTruthy();
    expect(screen.getByText('Batman trilogy.')).toBeTruthy();
    expect(screen.getByText('Movies in this collection')).toBeTruthy();
    expect(screen.getByText('Batman Begins')).toBeTruthy();
    expect(screen.getByTestId('collection-parts')).toBeTruthy();
  });

  it('shows empty parts state', () => {
    renderWithQueryClient(
      <CollectionDetailContent
        collection={{
          tmdbId: 9485,
          name: 'Empty Collection',
          overview: null,
          posterPath: null,
          backdropPath: null,
          parts: [],
        }}
      />,
    );

    expect(screen.getByTestId('collection-parts-empty')).toBeTruthy();
  });

  it('prefetches and navigates to movie detail when a part is pressed', () => {
    const movieId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    renderWithQueryClient(
      <CollectionDetailContent
        collection={{
          tmdbId: 9485,
          name: 'The Dark Knight Collection',
          overview: null,
          posterPath: null,
          backdropPath: null,
          parts: [
            {
              id: movieId,
              title: 'Batman Begins',
              posterPath: null,
              releaseDate: '2005-06-15',
              voteAverage: 7.7,
              voteCount: 12000,
            },
          ],
        }}
      />,
    );

    fireEvent.press(screen.getByTestId(`collection-part-${movieId}`));

    expect(prefetchCatalogDetail).toHaveBeenCalledWith(expect.anything(), movieId, 'movie');
    expect(mockPush).toHaveBeenCalledWith(`/movie/${movieId}`);
  });
});
