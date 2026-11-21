import { Platform } from 'react-native';
import {
  IOS_TAB_BAR_VISUAL_BOTTOM_MAX,
  IOS_TAB_BAR_VISUAL_BOTTOM_MIN,
  resolveIosTabBarVisualBottomSpacing,
} from '@/features/navigation/tab-bar-visual-spacing';
import {
  resolvePrimaryTabBarInsets,
  resolveTabBarLayoutMetrics,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';
import { spacing } from '@/theme/spacing';

describe('resolveIosTabBarVisualBottomSpacing', () => {
  it('maps a large runtime inset into the compact helper range', () => {
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBe(14);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeLessThan(34);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeGreaterThanOrEqual(IOS_TAB_BAR_VISUAL_BOTTOM_MIN);
    expect(resolveIosTabBarVisualBottomSpacing(34)).toBeLessThanOrEqual(IOS_TAB_BAR_VISUAL_BOTTOM_MAX);
  });

  it('uses normal minimum breathing room when inset is zero', () => {
    expect(resolveIosTabBarVisualBottomSpacing(0)).toBe(spacing.sm);
    expect(resolveIosTabBarVisualBottomSpacing(0)).toBeGreaterThan(0);
  });
});

describe('resolveTabBarLayoutMetrics', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('uses the live iOS bottom inset so labels clear the home indicator', () => {
    Platform.OS = 'ios';
    const metrics = resolveTabBarLayoutMetrics({ top: 0, bottom: 34, left: 0, right: 0 });

    expect(TAB_BAR_PADDING_TOP).toBe(spacing.sm);
    expect(TAB_BAR_ROW_HEIGHT).toBe(43);
    expect(metrics.paddingBottom).toBe(34);
    expect(metrics.totalHeight).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + 34);
  });

  it('falls back to breathing room when iOS inset is zero', () => {
    Platform.OS = 'ios';
    const metrics = resolveTabBarLayoutMetrics({ top: 0, bottom: 0, left: 0, right: 0 });

    expect(metrics.paddingBottom).toBe(spacing.sm);
  });

  it('uses Android system inset for bottom padding', () => {
    Platform.OS = 'android';
    const metrics = resolveTabBarLayoutMetrics({ top: 0, bottom: 24, left: 0, right: 0 });

    expect(metrics.paddingBottom).toBe(24);
    expect(metrics.totalHeight).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + 24);
  });

  it('merges navigation and safe-area insets using the larger bottom value', () => {
    expect(
      resolvePrimaryTabBarInsets(
        { top: 0, bottom: 0, left: 0, right: 0 },
        { top: 59, bottom: 34, left: 0, right: 0 },
      ).bottom,
    ).toBe(34);

    expect(
      resolvePrimaryTabBarInsets(
        { top: 0, bottom: 34, left: 0, right: 0 },
        { top: 0, bottom: 0, left: 0, right: 0 },
      ).bottom,
    ).toBe(34);
  });
});
