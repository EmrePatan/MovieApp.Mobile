import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCreditsRoute,
  buildMovieGalleryRoute,
  buildMovieReviewsRoute,
  parseCatalogIdFromPathname,
} from '@/features/details/shared/routes';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';

describe('catalog child destination navigation', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  it('uses nested catalog stack routes', () => {
    expect(buildMovieReviewsRoute(movieId)).toBe(`/movie/${movieId}/reviews`);
    expect(buildCreditsRoute('movie', movieId)).toBe(`/movie/${movieId}/credits`);
    expect(buildMovieGalleryRoute(movieId)).toBe(`/movie/${movieId}/gallery`);
  });

  it('keeps catalog detail inactive on nested child destination pathnames', () => {
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/reviews`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/credits`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}/gallery`, 'movie')).toBeUndefined();
    expect(parseCatalogIdFromPathname(`/movie/${movieId}`, 'movie')).toBe(movieId);
  });

  it('registers catalog child screens in the root movie and tv stacks', () => {
    const movieLayout = readFileSync(
      path.join(process.cwd(), 'app/movie/_layout.tsx'),
      'utf8',
    );
    const tvLayout = readFileSync(
      path.join(process.cwd(), 'app/tv/[id]/_layout.tsx'),
      'utf8',
    );

    expect(movieLayout).toContain('name="[id]/reviews"');
    expect(movieLayout).toContain('name="[id]/credits"');
    expect(movieLayout).toContain('name="[id]/gallery"');
    expect(tvLayout).toContain('name="reviews"');
    expect(tvLayout).toContain('name="credits"');
    expect(tvLayout).toContain('name="gallery"');
  });

  it('keeps edge back gesture enabled on catalog child stack screens', () => {
    expect(detailChildStackScreenOptions).toEqual({
      gestureEnabled: true,
      fullScreenGestureEnabled: false,
    });
  });
});
