import { Platform } from 'react-native';
import {
  BASE_TAB_BAR_HEIGHT,
  getTabBarBottomPadding,
  getTabBarStyle,
  getTabBarTotalMinHeight,
  LEGACY_BASE_TAB_BAR_HEIGHT,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_GAP,
  TAB_BAR_PADDING_TOP,
} from '@/features/navigation/tab-bar-style';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const TYPICAL_IOS_BOTTOM_INSET = 34;

describe('getTabBarStyle', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('sizes the compact content band from icon row geometry', () => {
    const labelLineHeight = typography.caption.lineHeight ?? 16;

    expect(BASE_TAB_BAR_HEIGHT).toBe(
      TAB_BAR_PADDING_TOP + TAB_BAR_ICON_SIZE + TAB_BAR_LABEL_GAP + labelLineHeight,
    );
  });

  it('applies bottom safe-area inset on iOS without the legacy oversized content band', () => {
    Platform.OS = 'ios';
    const insets = { top: 44, bottom: TYPICAL_IOS_BOTTOM_INSET, left: 0, right: 0 };

    const style = getTabBarStyle(insets);

    expect(style.paddingBottom).toBe(TYPICAL_IOS_BOTTOM_INSET);
    expect(style.minHeight).toBe(BASE_TAB_BAR_HEIGHT + TYPICAL_IOS_BOTTOM_INSET);
    expect(style.minHeight).toBeLessThan(LEGACY_BASE_TAB_BAR_HEIGHT + TYPICAL_IOS_BOTTOM_INSET);
    expect(getTabBarTotalMinHeight(insets)).toBe(style.minHeight);
  });

  it('keeps tab labels above the home-indicator padding region on iOS', () => {
    Platform.OS = 'ios';
    const insets = { top: 44, bottom: TYPICAL_IOS_BOTTOM_INSET, left: 0, right: 0 };
    const style = getTabBarStyle(insets);
    const bottomPadding = getTabBarBottomPadding(insets);

    const contentBandHeight =
      (style.minHeight as number) - (style.paddingTop as number) - bottomPadding;

    expect(contentBandHeight).toBe(BASE_TAB_BAR_HEIGHT - TAB_BAR_PADDING_TOP);
    expect(contentBandHeight).toBeGreaterThanOrEqual(
      TAB_BAR_ICON_SIZE + TAB_BAR_LABEL_GAP + (typography.caption.lineHeight ?? 16),
    );
  });

  it('uses minimal bottom padding when inset is zero', () => {
    Platform.OS = 'ios';
    const insets = { top: 0, bottom: 0, left: 0, right: 0 };

    const style = getTabBarStyle(insets);

    expect(style.paddingBottom).toBe(spacing.xs);
    expect(style.minHeight).toBe(BASE_TAB_BAR_HEIGHT + spacing.xs);
  });

  it('applies the Android bottom safe-area inset to tab bar padding and height', () => {
    Platform.OS = 'android';
    const bottomInset = 24;

    expect(getTabBarStyle({ top: 0, bottom: bottomInset, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: TAB_BAR_PADDING_TOP,
      paddingBottom: bottomInset,
      minHeight: BASE_TAB_BAR_HEIGHT + bottomInset,
    });
  });

  it('falls back to minimal padding when bottom inset is zero', () => {
    Platform.OS = 'android';

    expect(getTabBarStyle({ top: 0, bottom: 0, left: 0, right: 0 })).toEqual({
      backgroundColor: '#0F0F16',
      borderTopColor: '#222230',
      borderTopWidth: 1,
      paddingTop: TAB_BAR_PADDING_TOP,
      paddingBottom: spacing.xs,
      minHeight: BASE_TAB_BAR_HEIGHT + spacing.xs,
    });
  });
});
