import { resolveImageUri, type ImageSize } from '@/utils/image-url';

/**
 * TMDB backdrop profile used only when the hero has no usable poster.
 * A ~3× phone-width card is wider than w780, so a backdrop fallback stays on w1280.
 */
export const HOME_HERO_BACKDROP_SIZE: ImageSize = 'w1280';

/**
 * Hero posters use TMDB `original`. w780 is the largest fixed poster bucket, but
 * the hero card is about 3× phone width (~1000px). w780 is upscaled under
 * `cover` and looks soft next to New Releases posters. `original` is a valid
 * poster profile (w1280 is backdrop-only).
 */
export const HOME_HERO_POSTER_SIZE: ImageSize = 'original';

/**
 * Home trending rail cards are 120×180pt. w500 is enough for the smaller
 * New Releases rows (88×132pt) and looks soft on this rail at @3x. w780 matches
 * that sharper poster headroom without downloading `original` for every card.
 */
export const HOME_TRENDING_POSTER_SIZE: ImageSize = 'w780';

export function resolveHomeHeroBackdropUri(
  path: string | null | undefined,
): string | null {
  return resolveImageUri(path, HOME_HERO_BACKDROP_SIZE);
}

export function resolveHomeHeroPosterUri(
  path: string | null | undefined,
): string | null {
  return resolveImageUri(path, HOME_HERO_POSTER_SIZE);
}

export function resolveHomeTrendingPosterUri(
  path: string | null | undefined,
): string | null {
  return resolveImageUri(path, HOME_TRENDING_POSTER_SIZE);
}

/** Poster-only URI for the home hero carousel. */
export function resolveHomeHeroPrimaryUri(item: {
  posterUrl?: string | null;
}): string | null {
  return resolveHomeHeroPosterUri(item.posterUrl);
}

/** Prefetch the poster the hero will paint. */
export function resolveHomeHeroPrefetchUri(item: {
  posterUrl?: string | null;
}): string | null {
  return resolveHomeHeroPosterUri(item.posterUrl);
}
