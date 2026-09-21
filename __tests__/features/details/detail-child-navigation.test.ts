import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCreditsRoute,
  buildMovieGalleryRoute,
  buildMovieReviewsRoute,
  parseCatalogIdFromPathname,
} from '@/features/details/shared/routes';
import { detailChildStackScreenOptions } from '@/features/details/shared/navigation/detail-child-stack-options';

const APP_SHELL = 'app/(tabs)/(app-shell)';

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

  it('registers catalog child screens in nested movie and tv detail stacks', () => {
    const movieLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/_layout.tsx`),
      'utf8',
    );
    const movieDetailLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/movie/[id]/_layout.tsx`),
      'utf8',
    );
    const tvDetailLayout = readFileSync(
      path.join(process.cwd(), `${APP_SHELL}/tv/[id]/_layout.tsx`),
      'utf8',
    );

    expect(movieLayout).toContain('name="[id]"');
    expect(movieDetailLayout).toContain('name="reviews"');
    expect(movieDetailLayout).toContain('name="credits"');
    expect(movieDetailLayout).toContain('name="gallery"');
    expect(tvDetailLayout).toContain('name="reviews"');
    expect(tvDetailLayout).toContain('name="credits"');
    expect(tvDetailLayout).toContain('name="gallery"');
  });

  it('keeps edge back gesture enabled on catalog child stack screens', () => {
    expect(detailChildStackScreenOptions).toEqual({
      gestureEnabled: true,
      fullScreenGestureEnabled: false,
    });
  });
});
