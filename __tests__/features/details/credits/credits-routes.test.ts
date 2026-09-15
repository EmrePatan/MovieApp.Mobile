import { buildCreditsRoute } from '@/features/details/shared/routes';

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('credits routes', () => {
  it('builds movie and tv credits routes', () => {
    expect(buildCreditsRoute('movie', movieId)).toBe(`/credits/movie/${movieId}`);
    expect(buildCreditsRoute('tv', tvShowId)).toBe(`/credits/tv/${tvShowId}`);
  });

  it('includes the title search param when provided', () => {
    expect(buildCreditsRoute('movie', movieId, { title: 'Interstellar' })).toBe(
      `/credits/movie/${movieId}?title=Interstellar`,
    );
  });
});
