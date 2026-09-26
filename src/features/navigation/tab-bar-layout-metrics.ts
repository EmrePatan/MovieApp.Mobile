import type { EdgeInsets } from 'react-native-safe-area-context';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Top inset of the tab content band (above icons). */
export const TAB_BAR_PADDING_TOP = spacing.xs;

/** Icon size in PrimaryTabBar — keep in sync with PrimaryTabBar. */
export const TAB_BAR_ICON_SIZE = 22;

/** Gap between icon and label in PrimaryTabBar. */
export const TAB_BAR_LABEL_GAP = 2;

const TAB_BAR_LABEL_LINE_HEIGHT = typography.caption.lineHeight ?? 16;

/** Visual height of icon + label stack (single line). */
export const TAB_BAR_ROW_HEIGHT =
  TAB_BAR_ICON_SIZE + TAB_BAR_LABEL_GAP + TAB_BAR_LABEL_LINE_HEIGHT;

export function resolveTabBarBottomPadding(insets: EdgeInsets): number {
  return insets.bottom > 0 ? insets.bottom : spacing.xs;
}

export interface TabBarLayoutMetrics {
  paddingTop: number;
  rowHeight: number;
  paddingBottom: number;
  /** Outer shell height reported via onLayout. */
  totalHeight: number;
  /** Distance from label baseline area to shell bottom (= home-indicator padding). */
  labelBottomToShellBottom: number;
}

/**
 * Custom tab bar geometry:
 * - Shell extends to the physical bottom (background through home-indicator zone).
 * - Tab row sits directly above paddingBottom (runtime safe-area inset).
 * - Total height = paddingTop + rowHeight + paddingBottom (single shell, not stacked bands).
 */
export function resolveTabBarLayoutMetrics(insets: EdgeInsets): TabBarLayoutMetrics {
  const paddingBottom = resolveTabBarBottomPadding(insets);
  const paddingTop = TAB_BAR_PADDING_TOP;
  const rowHeight = TAB_BAR_ROW_HEIGHT;
  const totalHeight = paddingTop + rowHeight + paddingBottom;

  return {
    paddingTop,
    rowHeight,
    paddingBottom,
    totalHeight,
    labelBottomToShellBottom: paddingBottom,
  };
}
