import { buildCreditsRoute } from '@/features/details/shared/routes';

describe('buildCreditsRoute', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('builds nested movie and tv credits routes', () => {
    expect(buildCreditsRoute('movie', movieId)).toBe(`/movie/${movieId}/credits`);
    expect(buildCreditsRoute('tv', tvShowId)).toBe(`/tv/${tvShowId}/credits`);
  });

  it('includes title query params when provided', () => {
    expect(buildCreditsRoute('movie', movieId, { title: 'Interstellar' })).toBe(
      `/movie/${movieId}/credits?title=Interstellar`,
    );
  });
});
