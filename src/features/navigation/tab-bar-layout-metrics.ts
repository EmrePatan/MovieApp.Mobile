import { Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { resolveIosTabBarVisualBottomSpacing } from '@/features/navigation/tab-bar-visual-spacing';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export {
  IOS_TAB_BAR_VISUAL_BOTTOM_INSET_RATIO,
  IOS_TAB_BAR_VISUAL_BOTTOM_MAX,
  IOS_TAB_BAR_VISUAL_BOTTOM_MIN,
  resolveIosTabBarVisualBottomSpacing,
} from '@/features/navigation/tab-bar-visual-spacing';

/** Top inset of the tab content band (above icons). */
export const TAB_BAR_PADDING_TOP = spacing.xs;

/** Icon size in PrimaryTabBar — keep in sync with PrimaryTabBar. */
export const TAB_BAR_ICON_SIZE = 22;

/** Gap between icon and label in PrimaryTabBar. */
export const TAB_BAR_LABEL_GAP = 2;

/** Keeps first/last tab labels (e.g. Ana Sayfa, İstatistikler) off the screen edge. */
export const TAB_BAR_ROW_HORIZONTAL_INSET = spacing.sm;

const TAB_BAR_LABEL_LINE_HEIGHT = typography.caption.lineHeight ?? 16;

/** Extra row space so semibold caption glyphs are not clipped on iOS. */
export const TAB_BAR_LABEL_VERTICAL_SLACK = 2;

/** Visual height of icon + label stack (single line). */
export const TAB_BAR_ROW_HEIGHT =
  TAB_BAR_ICON_SIZE +
  TAB_BAR_LABEL_GAP +
  TAB_BAR_LABEL_LINE_HEIGHT +
  TAB_BAR_LABEL_VERTICAL_SLACK;

function resolveAndroidTabBarBottomPadding(insets: EdgeInsets): number {
  return insets.bottom > 0 ? insets.bottom : spacing.xs;
}

/**
 * Visible padding below tab labels inside the full-bleed shell.
 * Android: full system inset (unchanged). iOS: compact spacing derived from inset.
 */
export function resolveTabBarVisualBottomSpacing(insets: EdgeInsets): number {
  if (Platform.OS === 'android') {
    return resolveAndroidTabBarBottomPadding(insets);
  }

  return resolveIosTabBarVisualBottomSpacing(insets.bottom);
}

/** @deprecated Use resolveTabBarVisualBottomSpacing */
export function resolveTabBarBottomPadding(insets: EdgeInsets): number {
  return resolveTabBarVisualBottomSpacing(insets);
}

export interface TabBarLayoutMetrics {
  paddingTop: number;
  rowHeight: number;
  paddingBottom: number;
  /** Outer shell height reported via onLayout. */
  totalHeight: number;
  /** Visible distance from label bottom to shell / screen bottom. */
  labelBottomToShellBottom: number;
  /** Runtime safe-area bottom inset (positioning input, not always equal to paddingBottom on iOS). */
  safeAreaBottomInset: number;
}

export function resolveTabBarLayoutMetrics(insets: EdgeInsets): TabBarLayoutMetrics {
  const paddingBottom = resolveTabBarVisualBottomSpacing(insets);
  const paddingTop = TAB_BAR_PADDING_TOP;
  const rowHeight = TAB_BAR_ROW_HEIGHT;
  const totalHeight = paddingTop + rowHeight + paddingBottom;

  return {
    paddingTop,
    rowHeight,
    paddingBottom,
    totalHeight,
    labelBottomToShellBottom: paddingBottom,
    safeAreaBottomInset: insets.bottom,
  };
}

/**
 * Extends touch targets into the home-gesture region on iOS without growing visible padding.
 */
export function resolveTabBarPressHitSlop(
  insets: EdgeInsets,
  visualBottomSpacing: number,
): { top: number; bottom: number; left: number; right: number } {
  const base = {
    top: spacing.sm,
    left: spacing.xs,
    right: spacing.xs,
    bottom: spacing.xs,
  };

  if (Platform.OS !== 'ios' || insets.bottom <= visualBottomSpacing) {
    return base;
  }

  return {
    ...base,
    bottom: insets.bottom - visualBottomSpacing + spacing.xs,
  };
}
