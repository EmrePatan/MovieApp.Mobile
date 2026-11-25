import { Platform } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { resolveIosTabBarVisualBottomSpacing } from '@/features/navigation/tab-bar-visual-spacing';
import { spacing } from '@/theme/spacing';

export {
  IOS_TAB_BAR_VISUAL_BOTTOM_INSET_RATIO,
  IOS_TAB_BAR_VISUAL_BOTTOM_MAX,
  IOS_TAB_BAR_VISUAL_BOTTOM_MIN,
  resolveIosTabBarVisualBottomSpacing,
} from '@/features/navigation/tab-bar-visual-spacing';

/** Top inset of the tab content band (above icons). */
export const TAB_BAR_PADDING_TOP = spacing.sm;

/** Icon size in PrimaryTabBar — keep in sync with PrimaryTabBar. */
export const TAB_BAR_ICON_SIZE = 24;

/** Gap between icon and label in PrimaryTabBar. */
export const TAB_BAR_LABEL_GAP = 3;

/** Label typography — slightly larger than caption for dock readability. */
export const TAB_BAR_LABEL_FONT_SIZE = 12;

export const TAB_BAR_LABEL_LINE_HEIGHT = 16;

/** Visual height of icon + label stack (single line). */
export const TAB_BAR_ROW_HEIGHT =
  TAB_BAR_ICON_SIZE + TAB_BAR_LABEL_GAP + TAB_BAR_LABEL_LINE_HEIGHT;

/** Horizontal inset of the tab row inside the dock — keeps edge tabs off the curve. */
export const TAB_BAR_ROW_PADDING_H = 2;

/**
 * Horizontal inset inside each tab pill.
 * Vertical growth is avoided so the proven shell height stays intact.
 */
export const TAB_BAR_CONTENT_INSET_H = 1;

/** Soft rounded-rect active highlight. */
export const TAB_BAR_ACTIVE_RADIUS = 14;

/** Dock top corner radius — slightly softer on Android gesture bars. */
export const TAB_BAR_DOCK_TOP_RADIUS = Platform.select({ ios: 22, android: 18, default: 20 })!;

function resolveAndroidTabBarBottomPadding(insets: EdgeInsets): number {
  return insets.bottom > 0 ? insets.bottom : spacing.xs;
}

/**
 * Prefer the larger live inset from React Navigation tabBar props and
 * safe-area context — simulators sometimes report 0 on one of the two.
 */
export function resolvePrimaryTabBarInsets(
  navigationInsets: EdgeInsets | undefined,
  safeAreaInsets: EdgeInsets,
): EdgeInsets {
  if (!navigationInsets) {
    return safeAreaInsets;
  }

  return {
    top: Math.max(navigationInsets.top, safeAreaInsets.top),
    right: Math.max(navigationInsets.right, safeAreaInsets.right),
    bottom: Math.max(navigationInsets.bottom, safeAreaInsets.bottom),
    left: Math.max(navigationInsets.left, safeAreaInsets.left),
  };
}

/**
 * Visible padding below tab labels inside the full-bleed shell.
 * Uses the live system bottom inset on both platforms so home-indicator /
 * gesture-bar clearance is not capped by a fixed compact constant.
 */
export function resolveTabBarVisualBottomSpacing(insets: EdgeInsets): number {
  if (Platform.OS === 'android') {
    return resolveAndroidTabBarBottomPadding(insets);
  }

  if (insets.bottom > 0) {
    return insets.bottom;
  }

  return spacing.sm;
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
  dockTopRadius: number;
  activeRadius: number;
  rowPaddingHorizontal: number;
  contentInsetHorizontal: number;
  iconSize: number;
  labelFontSize: number;
  labelLineHeight: number;
  labelGap: number;
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
    dockTopRadius: TAB_BAR_DOCK_TOP_RADIUS,
    activeRadius: TAB_BAR_ACTIVE_RADIUS,
    rowPaddingHorizontal: TAB_BAR_ROW_PADDING_H,
    contentInsetHorizontal: TAB_BAR_CONTENT_INSET_H,
    iconSize: TAB_BAR_ICON_SIZE,
    labelFontSize: TAB_BAR_LABEL_FONT_SIZE,
    labelLineHeight: TAB_BAR_LABEL_LINE_HEIGHT,
    labelGap: TAB_BAR_LABEL_GAP,
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
