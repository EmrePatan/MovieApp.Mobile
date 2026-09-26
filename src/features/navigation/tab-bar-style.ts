import type { ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Top inset of the tab content band (above icons). */
export const TAB_BAR_PADDING_TOP = spacing.xs;

/** Icon size in PrimaryTabBar — keep in sync with PrimaryTabBar. */
export const TAB_BAR_ICON_SIZE = 22;

/** Gap between icon and label in PrimaryTabBar. */
export const TAB_BAR_LABEL_GAP = 2;

const TAB_BAR_LABEL_LINE_HEIGHT = typography.caption.lineHeight ?? 16;

/**
 * Compact content band: top padding + icon row + single-line label.
 * Safe-area bottom inset is applied separately via paddingBottom.
 */
export const BASE_TAB_BAR_HEIGHT =
  TAB_BAR_PADDING_TOP + TAB_BAR_ICON_SIZE + TAB_BAR_LABEL_GAP + TAB_BAR_LABEL_LINE_HEIGHT;

/** Pre-compaction content band (d1e77d5) for regression comparisons in tests. */
export const LEGACY_BASE_TAB_BAR_HEIGHT = 60;

function resolveTabBarBottomPadding(insets: EdgeInsets): number {
  const bottomInset = insets.bottom;
  return bottomInset > 0 ? bottomInset : spacing.xs;
}

export function getTabBarBottomPadding(insets: EdgeInsets): number {
  return resolveTabBarBottomPadding(insets);
}

export function getTabBarTotalMinHeight(insets: EdgeInsets): number {
  return BASE_TAB_BAR_HEIGHT + resolveTabBarBottomPadding(insets);
}

export function getTabBarStyle(insets: EdgeInsets): ViewStyle {
  const bottomPadding = resolveTabBarBottomPadding(insets);

  return {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: TAB_BAR_PADDING_TOP,
    paddingBottom: bottomPadding,
    minHeight: BASE_TAB_BAR_HEIGHT + bottomPadding,
  };
}

export const tabBarLabelStyle = {
  ...typography.caption,
  fontWeight: '600' as const,
};
