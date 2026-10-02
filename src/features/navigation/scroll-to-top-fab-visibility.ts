/** Show FAB after scrolling past roughly one screen of list content. */
export const SCROLL_TO_TOP_FAB_SHOW_OFFSET = 320;
/** Hide FAB before the top to avoid flicker when bouncing. */
export const SCROLL_TO_TOP_FAB_HIDE_OFFSET = 160;

export function resolveScrollToTopFabVisible(
  offsetY: number,
  currentlyVisible: boolean,
): boolean {
  if (currentlyVisible) {
    return offsetY > SCROLL_TO_TOP_FAB_HIDE_OFFSET;
  }

  return offsetY >= SCROLL_TO_TOP_FAB_SHOW_OFFSET;
}
