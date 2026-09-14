import { QueryClient } from '@tanstack/react-query';
import { getMovieDetails } from '@/features/details/movie/api/movie-api';
import { movieQueryKey } from '@/features/details/movie/hooks/useMovieDetails';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';

jest.mock('@/features/details/movie/api/movie-api', () => ({
  getMovieDetails: jest.fn(),
}));

jest.mock('@/features/details/tv/api/tv-api', () => ({
  getTvShowDetails: jest.fn(),
}));

describe('prefetchCatalogDetail', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';

  beforeEach(() => {
    jest.clearAllMocks();
    (getMovieDetails as jest.Mock).mockResolvedValue({ id: movieId, title: 'Matrix' });
  });

  it('prefetches movie details for valid ids', async () => {
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    prefetchCatalogDetail(queryClient, movieId, 'movie');

    expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: movieQueryKey(movieId),
        staleTime: 60_000,
      }),
    );

    await queryClient.fetchQuery({
      queryKey: movieQueryKey(movieId),
      queryFn: ({ signal }) => getMovieDetails(movieId, signal),
    });

    expect(getMovieDetails).toHaveBeenCalledWith(movieId, expect.any(AbortSignal));
  });

  it('skips prefetch for invalid ids', () => {
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    prefetchCatalogDetail(queryClient, 'not-a-guid', 'movie');

    expect(prefetchSpy).not.toHaveBeenCalled();
  });
});
