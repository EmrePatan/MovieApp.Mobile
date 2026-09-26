export const HERO_CAROUSEL_LOOP_HEAD_INDEX = 1;

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
