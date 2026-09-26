import { Platform } from 'react-native';
import { getTabBarStyle, getTabBarTotalMinHeight } from '@/features/navigation/tab-bar-style';
import {
  resolveTabBarLayoutMetrics,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';
import { spacing } from '@/theme/spacing';

describe('getTabBarStyle', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('uses fixed shell height with bottom safe-area padding on iOS', () => {
    Platform.OS = 'ios';
    const insets = { top: 44, bottom: 34, left: 0, right: 0 };
    const metrics = resolveTabBarLayoutMetrics(insets);
    const style = getTabBarStyle(insets);

    expect(style.paddingBottom).toBe(34);
    expect(style.height).toBe(metrics.totalHeight);
    expect(style.minHeight).toBeUndefined();
    expect(metrics.totalHeight).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + 34);
  });

  it('keeps tab content band separate from home-indicator padding', () => {
    const insets = { top: 0, bottom: 34, left: 0, right: 0 };
    const metrics = resolveTabBarLayoutMetrics(insets);
    const style = getTabBarStyle(insets);

    const contentBandHeight =
      (style.height as number) - (style.paddingTop as number) - metrics.paddingBottom;

    expect(contentBandHeight).toBe(TAB_BAR_ROW_HEIGHT);
    expect(metrics.labelBottomToShellBottom).toBe(34);
  });

  it('uses minimal bottom padding when inset is zero', () => {
    Platform.OS = 'ios';
    const insets = { top: 0, bottom: 0, left: 0, right: 0 };

    const style = getTabBarStyle(insets);

    expect(style.paddingBottom).toBe(spacing.xs);
    expect(style.height).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + spacing.xs);
  });

  it('applies the Android bottom safe-area inset to tab bar padding and height', () => {
    Platform.OS = 'android';
    const bottomInset = 24;
    const insets = { top: 0, bottom: bottomInset, left: 0, right: 0 };

    expect(getTabBarStyle(insets)).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: TAB_BAR_PADDING_TOP,
      paddingBottom: bottomInset,
      height: TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + bottomInset,
    });
  });

  it('falls back to minimal padding when bottom inset is zero on Android', () => {
    Platform.OS = 'android';

    expect(getTabBarStyle({ top: 0, bottom: 0, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: TAB_BAR_PADDING_TOP,
      paddingBottom: spacing.xs,
      height: TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + spacing.xs,
    });
  });

  it('exposes total height helper aligned with shell height', () => {
    const insets = { top: 0, bottom: 28, left: 0, right: 0 };
    expect(getTabBarTotalMinHeight(insets)).toBe(resolveTabBarLayoutMetrics(insets).totalHeight);
  });
});
