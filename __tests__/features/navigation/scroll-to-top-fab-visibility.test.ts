import {
  SCROLL_TO_TOP_FAB_HIDE_OFFSET,
  SCROLL_TO_TOP_FAB_SHOW_OFFSET,
  resolveScrollToTopFabVisible,
} from '@/features/navigation/scroll-to-top-fab-visibility';

describe('resolveScrollToTopFabVisible', () => {
  it('shows the fab after passing the show threshold', () => {
    expect(resolveScrollToTopFabVisible(SCROLL_TO_TOP_FAB_SHOW_OFFSET, false)).toBe(true);
    expect(resolveScrollToTopFabVisible(SCROLL_TO_TOP_FAB_SHOW_OFFSET - 1, false)).toBe(false);
  });

  it('hides the fab when scrolling back near the top', () => {
    expect(resolveScrollToTopFabVisible(SCROLL_TO_TOP_FAB_HIDE_OFFSET, true)).toBe(false);
    expect(resolveScrollToTopFabVisible(SCROLL_TO_TOP_FAB_HIDE_OFFSET + 1, true)).toBe(true);
  });
});
