import { render, screen, fireEvent } from '@testing-library/react-native';
import { ApiError } from '@/api/errors';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { useSimilarMovies } from '@/features/recommendations/hooks/useSimilarMovies';
import { useSimilarTvShows } from '@/features/recommendations/hooks/useSimilarTvShows';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/recommendations/hooks/useSimilarMovies', () => ({
  useSimilarMovies: jest.fn(),
}));

jest.mock('@/features/recommendations/hooks/useSimilarTvShows', () => ({
  useSimilarTvShows: jest.fn(),
}));

const similarItem = {
  id: 'similar-id',
  type: 'movie' as const,
  title: 'Interstellar',
  originalTitle: null,
  overview: null,
  posterUrl: null,
  backdropUrl: null,
  releaseDate: null,
  voteAverage: 8.6,
  voteCount: 1000,
  year: 2014,
  score: 0.7,
  reason: 'Similar genres',
};

describe('SimilarContentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSimilarMovies as jest.Mock).mockReturnValue({
      data: { items: [similarItem] },
      isLoading: false,
      isError: false,
    });
    (useSimilarTvShows as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });
  });

  it('renders similar titles for movies', () => {
    render(<SimilarContentSection contentType="movie" contentId="movie-id" />);
    expect(screen.getByText('You May Also Like')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
  });

  it('navigates to movie detail', () => {
    render(<SimilarContentSection contentType="movie" contentId="movie-id" />);
    fireEvent.press(screen.getByText('Interstellar'));
    expect(mockPush).toHaveBeenCalledWith('/movie/similar-id');
  });

  it('shows loading state', () => {
    (useSimilarMovies as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<SimilarContentSection contentType="movie" contentId="movie-id" />);
    expect(screen.getByText('You May Also Like')).toBeTruthy();
  });

  it('shows error with retry', () => {
    const refetch = jest.fn();
    (useSimilarMovies as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError({ kind: 'server', status: 500, userMessage: 'Server error.' }),
      refetch,
    });

    render(<SimilarContentSection contentType="movie" contentId="movie-id" />);
    expect(screen.getByText('Server error.')).toBeTruthy();
    fireEvent.press(screen.getByText('Try Again'));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows empty state', () => {
    (useSimilarMovies as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });

    render(<SimilarContentSection contentType="movie" contentId="movie-id" />);
    expect(screen.getByText('No similar titles available right now.')).toBeTruthy();
  });

  it('uses tv similar query for tv content', () => {
    render(<SimilarContentSection contentType="tv" contentId="tv-id" />);
    expect(useSimilarTvShows).toHaveBeenCalledWith('tv-id');
  });
});
