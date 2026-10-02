export const HERO_CAROUSEL_LOOP_HEAD_INDEX = 1;

/**
 * Posters that are on screen at once: left peek, centered slide, right peek.
 * Slides farther than this stay unmounted until the scroll index reaches them.
 */
export const HERO_CAROUSEL_RENDER_WINDOW = 3;

const HERO_CAROUSEL_MOUNT_RADIUS = (HERO_CAROUSEL_RENDER_WINDOW - 1) / 2;

/**
 * Loop indices drawn on first paint when the real first slide is centered:
 * the leading wrap clone, that slide, and the next slide.
 */
export function getHeroCarouselInitialMountedIndices(loopLength: number): number[] {
  const count = Math.max(0, Math.min(loopLength, HERO_CAROUSEL_RENDER_WINDOW));
  return Array.from({ length: count }, (_, index) => index);
}

/**
 * True when this loop slot is the centered slide or a peek beside it.
 * Off-screen heroes (items 4–9 while the first slide is centered) stay unmounted.
 */
export function shouldMountHeroSlide(
  slideIndex: number,
  centeredScrollIndex: number,
): boolean {
  return Math.abs(slideIndex - centeredScrollIndex) <= HERO_CAROUSEL_MOUNT_RADIUS;
}

/**
 * The three on-screen posters decode at high priority.
 * Anything farther out is low, and is not mounted until it scrolls near.
 */
export function getHeroCarouselImagePriority(
  slideIndex: number,
  centeredScrollIndex: number,
): 'high' | 'low' {
  if (Math.abs(slideIndex - centeredScrollIndex) <= HERO_CAROUSEL_MOUNT_RADIUS) {
    return 'high';
  }

  return 'low';
}

export function getActiveIndexFromScrollIndex(scrollIndex: number, itemCount: number): number {
  if (itemCount <= 1) {
    return 0;
  }

  if (scrollIndex <= 0) {
    return itemCount - 1;
  }

  if (scrollIndex >= itemCount + 1) {
    return 0;
  }

  return scrollIndex - HERO_CAROUSEL_LOOP_HEAD_INDEX;
}

export function getScrollIndexForActiveIndex(activeIndex: number): number {
  return activeIndex + HERO_CAROUSEL_LOOP_HEAD_INDEX;
}

export function getScrollIndexFromOffset(offsetX: number, snapInterval: number): number {
  if (snapInterval <= 0) {
    return 0;
  }

  return Math.round(offsetX / snapInterval);
}

/** Dominant slide at ~50% visibility (Math.round on scroll index). */
export function getHeroCarouselActiveIndexFromOffset(
  offsetX: number,
  snapInterval: number,
  itemCount: number,
): number {
  if (itemCount <= 1 || snapInterval <= 0) {
    return 0;
  }

  const scrollIndex = Math.round(offsetX / snapInterval);
  return getActiveIndexFromScrollIndex(scrollIndex, itemCount);
}

export interface HeroCarouselLoopSettledOffset {
  activeIndex: number;
  settledOffsetX: number;
  needsScrollCorrection: boolean;
}

/**
 * Maps a settled FlatList offset to the equivalent in-loop position.
 * Clone slides at scroll index 0 and itemCount + 1 jump to their real twins
 * so scrollX-driven transforms stay aligned with the active slide index.
 */
export function resolveHeroCarouselLoopSettledOffset(
  offsetX: number,
  snapInterval: number,
  itemCount: number,
): HeroCarouselLoopSettledOffset {
  if (itemCount <= 1 || snapInterval <= 0) {
    return {
      activeIndex: 0,
      settledOffsetX: offsetX,
      needsScrollCorrection: false,
    };
  }

  const scrollIndex = Math.round(offsetX / snapInterval);
  const activeIndex = getActiveIndexFromScrollIndex(scrollIndex, itemCount);

  if (scrollIndex === 0) {
    const settledOffsetX = itemCount * snapInterval;
    return {
      activeIndex,
      settledOffsetX,
      needsScrollCorrection: settledOffsetX !== offsetX,
    };
  }

  if (scrollIndex === itemCount + 1) {
    const settledOffsetX = HERO_CAROUSEL_LOOP_HEAD_INDEX * snapInterval;
    return {
      activeIndex,
      settledOffsetX,
      needsScrollCorrection: settledOffsetX !== offsetX,
    };
  }

  return {
    activeIndex,
    settledOffsetX: offsetX,
    needsScrollCorrection: false,
  };
}
