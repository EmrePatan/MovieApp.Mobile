import { resolveImageUri, type ImageSize } from '@/utils/image-url';

/**
 * TMDB backdrop profile used only when the hero has no usable poster.
 * A ~3× phone-width card is wider than w780, so a backdrop fallback stays on w1280.
 */
export const HOME_HERO_BACKDROP_SIZE: ImageSize = 'w1280';

/**
 * Hero posters use TMDB `w780`. The card is a portrait poster at most ~228pt
 * wide, drawn with `contain`. At @3x that is about 684px, so w780 covers the
 * frame. `original` is several times larger and only matched the old wide cover hero.
 */
export const HOME_HERO_POSTER_SIZE: ImageSize = 'w780';

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

/** How many Recommended For You posters to warm when the home feed arrives. */
export const HOME_RECOMMENDED_PREFETCH_COUNT = 4;

/**
 * Visible hero poster plus the next one, wrapping from the last slide to the first.
 * Both use the hero `w780` profile.
 */
export function resolveHomeHeroNeighborPrefetchUris(
  items: readonly { posterUrl?: string | null }[],
  activeIndex: number,
): string[] {
  if (items.length === 0) {
    return [];
  }

  const count = items.length;
  const safeIndex = ((activeIndex % count) + count) % count;
  const indexes = count === 1 ? [safeIndex] : [safeIndex, (safeIndex + 1) % count];
  const uris: string[] = [];

  for (const index of indexes) {
    const uri = resolveHomeHeroPrefetchUri(items[index] ?? {});
    if (uri != null && !uris.includes(uri)) {
      uris.push(uri);
    }
  }

  return uris;
}

/** First resolvable rail posters at the default catalog size (`w500`). */
export function resolveHomeRecommendedPrefetchUris(
  items: readonly { posterUrl?: string | null }[],
): string[] {
  const uris: string[] = [];

  for (const item of items) {
    if (uris.length >= HOME_RECOMMENDED_PREFETCH_COUNT) {
      break;
    }

    const uri = resolveImageUri(item.posterUrl);
    if (uri != null && !uris.includes(uri)) {
      uris.push(uri);
    }
  }

  return uris;
}
