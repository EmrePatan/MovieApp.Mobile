import { openCatalogDetailFromFilmography } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { getMovieDetailsByTmdbId } from '@/features/details/movie/api/movie-api';
import { getTvShowDetailsByTmdbId } from '@/features/details/tv/api/tv-api';

const mockPush = jest.fn();

jest.mock('@/features/details/movie/api/movie-api', () => ({
  getMovieDetailsByTmdbId: jest.fn(),
}));

jest.mock('@/features/details/tv/api/tv-api', () => ({
  getTvShowDetailsByTmdbId: jest.fn(),
}));

describe('openCatalogDetailFromFilmography', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates directly when catalogId is already present', async () => {
    const catalogId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

    await openCatalogDetailFromFilmography(
      { push: mockPush },
      {
        mediaType: 'movie',
        catalogId,
        tmdbId: 900001,
        title: 'Interstellar',
        posterPath: null,
        character: 'Cooper',
        releaseDate: '2014-11-07',
      },
    );

    expect(mockPush).toHaveBeenCalledWith(`/movie/${catalogId}`);
    expect(getMovieDetailsByTmdbId).not.toHaveBeenCalled();
  });

  it('lazy-resolves by tmdb id when catalogId is missing', async () => {
    const catalogId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    (getMovieDetailsByTmdbId as jest.Mock).mockResolvedValue({ id: catalogId });

    await openCatalogDetailFromFilmography(
      { push: mockPush },
      {
        mediaType: 'movie',
        catalogId: null,
        tmdbId: 900001,
        title: 'Interstellar',
        posterPath: null,
        character: 'Cooper',
        releaseDate: '2014-11-07',
      },
    );

    expect(getMovieDetailsByTmdbId).toHaveBeenCalledWith(900001);
    expect(mockPush).toHaveBeenCalledWith(`/movie/${catalogId}`);
  });

  it('lazy-resolves tv shows by tmdb id when catalogId is missing', async () => {
    const catalogId = 'b7652297-65a8-4a9f-9217-b0d0b0140a95';
    (getTvShowDetailsByTmdbId as jest.Mock).mockResolvedValue({ id: catalogId });

    await openCatalogDetailFromFilmography(
      { push: mockPush },
      {
        mediaType: 'tv',
        catalogId: null,
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterPath: null,
        character: 'Walter White',
        releaseDate: '2008-01-20',
      },
    );

    expect(getTvShowDetailsByTmdbId).toHaveBeenCalledWith(1396);
    expect(mockPush).toHaveBeenCalledWith(`/tv/${catalogId}`);
  });
});
