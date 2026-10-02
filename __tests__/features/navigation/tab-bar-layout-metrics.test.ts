import {
  IOS_TAB_BAR_VISUAL_BOTTOM_MAX,
  IOS_TAB_BAR_VISUAL_BOTTOM_MIN,
  resolveIosTabBarVisualBottomSpacing,
} from '@/features/navigation/tab-bar-visual-spacing';
import { spacing } from '@/theme/spacing';

const TAB_SHELL_TOP_PADDING = spacing.xs;
const TAB_ROW_HEIGHT = 42;

describe('resolveIosTabBarVisualBottomSpacing', () => {
  it('maps a large runtime inset to the compact design range', () => {
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBe(14);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeLessThan(34);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeGreaterThanOrEqual(IOS_TAB_BAR_VISUAL_BOTTOM_MIN);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeLessThanOrEqual(IOS_TAB_BAR_VISUAL_BOTTOM_MAX);
  });

  it('uses normal minimum breathing room when inset is zero', () => {
    expect(resolveIosTabBarVisualBottomSpacing(0)).toBe(spacing.sm);
    expect(resolveIosTabBarVisualBottomSpacing(0)).toBeGreaterThan(0);
  });

  it('keeps total shell height below the legacy full-inset composition for B=34', () => {
    const visual = resolveIosTabBarVisualBottomSpacing(34);
    const compactTotal = TAB_SHELL_TOP_PADDING + TAB_ROW_HEIGHT + visual;
    const legacyTotal = TAB_SHELL_TOP_PADDING + TAB_ROW_HEIGHT + 34;

    expect(compactTotal).toBe(60);
    expect(compactTotal).toBeLessThan(legacyTotal);
  });
});
