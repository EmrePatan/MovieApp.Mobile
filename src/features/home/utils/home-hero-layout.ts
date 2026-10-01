import { spacing } from '@/theme/spacing';

/** Portrait poster height / width (2:3). */
export const HOME_HERO_POSTER_ASPECT_RATIO = 3 / 2;

export const HERO_CAROUSEL_SIDE_INSET = spacing.md;

export const HERO_CAROUSEL_INACTIVE_SCALE = 0.79;
export const HERO_CAROUSEL_INACTIVE_OPACITY = 0.55;

/** Nudges inactive posters toward the active center so they read as stacked behind it. */
export const HERO_CAROUSEL_INACTIVE_PEEK_TRANSLATE = 12;

/** Extra space between the home search chrome and the hero poster stage. */
export const HOME_HERO_SEARCH_BREATHING_ROOM = 18;

/** Snap stride as a fraction of active poster width (lower = more overlap / stacked peek). */
export const HERO_CAROUSEL_SNAP_WIDTH_RATIO = 0.64;

export function getHomeHeroActivePosterWidth(screenWidth: number): number {
  return Math.round(Math.min(196, Math.max(148, screenWidth * 0.435)));
}

export function getHomeHeroPosterHeight(screenWidth: number): number {
  return Math.round(
    getHomeHeroActivePosterWidth(screenWidth) * HOME_HERO_POSTER_ASPECT_RATIO,
  );
}

/** Distance between snap positions; smaller than the active poster width so neighbors peek in. */
export function getHomeHeroSnapInterval(screenWidth: number): number {
  const activeWidth = getHomeHeroActivePosterWidth(screenWidth);
  return Math.round(activeWidth * HERO_CAROUSEL_SNAP_WIDTH_RATIO);
}

/** Centers each snap position on the screen. */
export function getHomeHeroCarouselHorizontalPadding(screenWidth: number): number {
  const snapInterval = getHomeHeroSnapInterval(screenWidth);
  return Math.round((screenWidth - snapInterval) / 2);
}

/** Poster stage height (carousel artwork only, excluding metadata). */
export function getHomeHeroHeight(screenWidth: number): number {
  return getHomeHeroPosterHeight(screenWidth);
}

/** Active poster width at the carousel center. */
export function getHomeHeroCardWidth(screenWidth: number): number {
  return getHomeHeroActivePosterWidth(screenWidth);
}
