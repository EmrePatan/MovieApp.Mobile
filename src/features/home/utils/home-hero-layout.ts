import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { HOME_HERO_METADATA_ROW_HEIGHT } from './home-hero-metadata-metrics';
import { HOME_HEADER_BAR_HEIGHT } from './home-header-layout';

/** Portrait poster height / width (2:3). */
export const HOME_HERO_POSTER_ASPECT_RATIO = 3 / 2;

export const HERO_CAROUSEL_SIDE_INSET = spacing.md;

export const HERO_CAROUSEL_INACTIVE_SCALE = 0.79;
export const HERO_CAROUSEL_INACTIVE_OPACITY = 0.55;

/** Nudges inactive posters toward the active center so they read as stacked behind it. */
export const HERO_CAROUSEL_INACTIVE_PEEK_TRANSLATE = 12;

/** Extra space between the home search chrome and the hero poster stage. */
export const HOME_HERO_SEARCH_BREATHING_ROOM = 12;

/**
 * Hero may use part of the peek section's outer spacing; the rail header + row still fit on screen.
 */
export const HOME_HERO_PEEK_SECTION_HEIGHT_DISCOUNT = spacing.lg;

/** Snap stride as a fraction of active poster width (lower = more overlap / stacked peek). */
export const HERO_CAROUSEL_SNAP_WIDTH_RATIO = 0.64;

export const HOME_HERO_ACTIVE_POSTER_MIN_WIDTH = 148;
export const HOME_HERO_ACTIVE_POSTER_MAX_WIDTH = 228;

const HOME_HERO_PAGINATION_ROW_HEIGHT = spacing.xs + 6;

/** Width fraction for the width-only fallback when viewport metrics are unavailable. */
const HOME_HERO_WIDTH_SCREEN_RATIO = 0.5;

export function getHomeTopChromeOccupiedHeight(): number {
  return spacing.sm + HOME_HEADER_BAR_HEIGHT + spacing.md + 1;
}

export interface HomeHeroViewportLayoutInput {
  windowWidth: number;
  windowHeight: number;
  safeAreaTop: number;
  tabBarTotalHeight: number;
  heroOffsetCompensation: number;
  /** Height of the first home section row that should remain visible below the hero. */
  peekSectionRowHeight: number;
  includePaginationDots: boolean;
}

function getHomeHeroFooterHeight(includePaginationDots: boolean): number {
  const paginationHeight = includePaginationDots ? HOME_HERO_PAGINATION_ROW_HEIGHT : 0;
  return spacing.sm + HOME_HERO_METADATA_ROW_HEIGHT + spacing.xs + paginationHeight + spacing.sm;
}

export function getHomeListViewportHeight(
  input: Pick<
    HomeHeroViewportLayoutInput,
    'windowHeight' | 'safeAreaTop' | 'tabBarTotalHeight' | 'heroOffsetCompensation'
  >,
): number {
  const headerNet = getHomeTopChromeOccupiedHeight() - input.heroOffsetCompensation;

  return (
    input.windowHeight - input.safeAreaTop - headerNet - input.tabBarTotalHeight
  );
}

export function resolveHomeHeroPosterDimensions(
  input: HomeHeroViewportLayoutInput,
): { posterWidth: number; posterHeight: number } {
  const footerHeight = getHomeHeroFooterHeight(input.includePaginationDots);
  const heroChrome = HOME_HERO_SEARCH_BREATHING_ROOM + footerHeight + spacing.sm;

  const listViewport = getHomeListViewportHeight(input);
  const peekSectionReserve = Math.max(
    0,
    input.peekSectionRowHeight - HOME_HERO_PEEK_SECTION_HEIGHT_DISCOUNT,
  );
  const maxPosterHeight = Math.max(0, listViewport - peekSectionReserve - heroChrome);

  const widthBasedWidth = getHomeHeroActivePosterWidth(input.windowWidth);
  const widthBasedHeight = Math.round(
    widthBasedWidth * HOME_HERO_POSTER_ASPECT_RATIO,
  );
  const minPosterHeight = Math.round(
    HOME_HERO_ACTIVE_POSTER_MIN_WIDTH * HOME_HERO_POSTER_ASPECT_RATIO,
  );

  const posterHeight = Math.round(
    Math.max(
      minPosterHeight,
      Math.min(maxPosterHeight, Math.max(widthBasedHeight, maxPosterHeight)),
    ),
  );

  let posterWidth = Math.round(posterHeight / HOME_HERO_POSTER_ASPECT_RATIO);
  posterWidth = Math.min(
    HOME_HERO_ACTIVE_POSTER_MAX_WIDTH,
    Math.max(HOME_HERO_ACTIVE_POSTER_MIN_WIDTH, posterWidth),
  );

  return {
    posterWidth,
    posterHeight: Math.round(posterWidth * HOME_HERO_POSTER_ASPECT_RATIO),
  };
}

export function getHomeHeroActivePosterWidth(screenWidth: number): number {
  return Math.round(
    Math.min(
      HOME_HERO_ACTIVE_POSTER_MAX_WIDTH,
      Math.max(
        HOME_HERO_ACTIVE_POSTER_MIN_WIDTH,
        screenWidth * HOME_HERO_WIDTH_SCREEN_RATIO,
      ),
    ),
  );
}

export function getHomeHeroPosterHeight(screenWidth: number): number {
  return Math.round(
    getHomeHeroActivePosterWidth(screenWidth) * HOME_HERO_POSTER_ASPECT_RATIO,
  );
}

/** Distance between snap positions; smaller than the active poster width so neighbors peek in. */
export function getHomeHeroSnapInterval(
  screenWidth: number,
  activePosterWidth?: number,
): number {
  const activeWidth = activePosterWidth ?? getHomeHeroActivePosterWidth(screenWidth);
  return Math.round(activeWidth * HERO_CAROUSEL_SNAP_WIDTH_RATIO);
}

/** Centers each snap position on the screen. */
export function getHomeHeroCarouselHorizontalPadding(
  screenWidth: number,
  snapInterval?: number,
): number {
  const snap = snapInterval ?? getHomeHeroSnapInterval(screenWidth);
  return Math.round((screenWidth - snap) / 2);
}

/** Poster stage height (carousel artwork only, excluding metadata). */
export function getHomeHeroHeight(screenWidth: number): number {
  return getHomeHeroPosterHeight(screenWidth);
}

/** Active poster width at the carousel center. */
export function getHomeHeroCardWidth(screenWidth: number): number {
  return getHomeHeroActivePosterWidth(screenWidth);
}

export function getHomeHeroViewportLayoutInput(
  overrides: Partial<HomeHeroViewportLayoutInput> = {},
): HomeHeroViewportLayoutInput {
  return {
    windowWidth: overrides.windowWidth ?? layout.maxContentWidth,
    windowHeight: overrides.windowHeight ?? 844,
    safeAreaTop: overrides.safeAreaTop ?? 47,
    tabBarTotalHeight: overrides.tabBarTotalHeight ?? 50,
    heroOffsetCompensation: overrides.heroOffsetCompensation ?? 9,
    peekSectionRowHeight: overrides.peekSectionRowHeight ?? layout.homeSection.rowHeight,
    includePaginationDots: overrides.includePaginationDots ?? true,
  };
}
