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

/**
 * Poster first, then backdrop.
 *
 * Layout tradeoff: `getHomeHeroHeight` clamps the card, so the frame is often
 * wider than a 2:3 poster (phone ~1.2:1, large windows can pass 16:9 because
 * height stops at 480). `resizeMode="cover"` crops the poster instead of
 * letterboxing. That crop stays sharper than a weak TMDB backdrop for the same
 * title (Unabomber’s poster reads better than its backdrop). A backdrop is used
 * only when `posterUrl` is missing, or after the poster fails to load — not
 * because the card is wide.
 */
export function resolveHomeHeroPrimaryUri(item: {
  backdropUrl?: string | null;
  posterUrl?: string | null;
}): string | null {
  return (
    resolveHomeHeroPosterUri(item.posterUrl) ??
    resolveHomeHeroBackdropUri(item.backdropUrl)
  );
}

/** Prefetch the same URI the hero will paint: poster, then backdrop. */
export function resolveHomeHeroPrefetchUri(item: {
  backdropUrl?: string | null;
  posterUrl?: string | null;
}): string | null {
  return resolveHomeHeroPrimaryUri(item);
}
