import type { ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import {
  resolveTabBarBottomPadding,
  resolveTabBarLayoutMetrics,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_GAP,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';

export {
  TAB_BAR_ICON_SIZE,
  TAB_BAR_LABEL_GAP,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';

/** @deprecated Use resolveTabBarLayoutMetrics().totalHeight */
export const BASE_TAB_BAR_HEIGHT = TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT;

export function getTabBarBottomPadding(insets: EdgeInsets): number {
  return resolveTabBarBottomPadding(insets);
}

export function getTabBarTotalMinHeight(insets: EdgeInsets): number {
  return resolveTabBarLayoutMetrics(insets).totalHeight;
}

export function getTabBarStyle(insets: EdgeInsets): ViewStyle {
  const metrics = resolveTabBarLayoutMetrics(insets);

  return {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: metrics.paddingTop,
    paddingBottom: metrics.paddingBottom,
    height: metrics.totalHeight,
  };
}

export const tabBarLabelStyle = {
  ...typography.caption,
  fontWeight: '600' as const,
};
