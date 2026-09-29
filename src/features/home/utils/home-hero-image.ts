import { resolveImageUri, type ImageSize } from '@/utils/image-url';

/**
 * TMDB backdrop profile that covers a ~3× phone-width hero card.
 * List and rail cards stay on the default w500 size.
 */
export const HOME_HERO_BACKDROP_SIZE: ImageSize = 'w1280';

/**
 * Largest standard TMDB poster profile. w1280 is a backdrop size and is not
 * a valid poster size, so the hero poster fallback uses w780.
 */
export const HOME_HERO_POSTER_SIZE: ImageSize = 'w780';

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

/** Prefetch the same URI the hero will paint: backdrop, then poster. */
export function resolveHomeHeroPrefetchUri(item: {
  backdropUrl?: string | null;
  posterUrl?: string | null;
}): string | null {
  return (
    resolveHomeHeroBackdropUri(item.backdropUrl) ??
    resolveHomeHeroPosterUri(item.posterUrl)
  );
}
