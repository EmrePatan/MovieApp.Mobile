import { QueryClient } from '@tanstack/react-query';
import { getMovieDetails } from '@/features/details/movie/api/movie-api';
import { movieQueryKey } from '@/features/details/movie/hooks/useMovieDetails';
import {
  openCatalogDetailFromTab,
  resetCatalogDetailOriginForTests,
  returnToCatalogDetailOrigin,
} from '@/features/details/shared/navigation/catalog-detail-navigation';

jest.mock('@/features/details/movie/api/movie-api', () => ({
  getMovieDetails: jest.fn(),
}));

jest.mock('@/features/details/tv/api/tv-api', () => ({
  getTvShowDetails: jest.fn(),
}));

describe('catalog detail navigation', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';

  beforeEach(() => {
    resetCatalogDetailOriginForTests();
    jest.clearAllMocks();
    (getMovieDetails as jest.Mock).mockResolvedValue({ id: movieId, title: 'Matrix' });
  });

  it('replaces detail when opened from home', () => {
    const replace = jest.fn();
    const push = jest.fn();
    const router = { replace, push } as never;

    openCatalogDetailFromTab(router, 'movie-b', 'movie', 'home');

    expect(replace).toHaveBeenCalledWith('/movie/movie-b');
    expect(push).not.toHaveBeenCalled();
  });

  it('pushes detail when opened from search', () => {
    const replace = jest.fn();
    const push = jest.fn();
    const router = { replace, push } as never;

    openCatalogDetailFromTab(router, 'movie-b', 'movie', 'search');

    expect(push).toHaveBeenCalledWith('/movie/movie-b');
    expect(replace).not.toHaveBeenCalled();
  });

  it('prefetches detail data before navigating when queryClient is provided', () => {
    const replace = jest.fn();
    const router = { replace, push: jest.fn() } as never;
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    openCatalogDetailFromTab(router, movieId, 'movie', 'home', { queryClient });

    expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: movieQueryKey(movieId),
      }),
    );
    expect(replace).toHaveBeenCalledWith(`/movie/${movieId}`);
  });

  it('returns to the remembered tab origin', () => {
    const navigate = jest.fn();
    const router = { navigate, replace: jest.fn(), push: jest.fn() } as never;

    openCatalogDetailFromTab(router, 'movie-b', 'movie', 'home');
    returnToCatalogDetailOrigin(router);

    expect(navigate).toHaveBeenCalledWith('/(tabs)/home');
  });
});
