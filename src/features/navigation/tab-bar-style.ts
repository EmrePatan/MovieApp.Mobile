import type { ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export const BASE_TAB_BAR_HEIGHT = 60;

function resolveTabBarBottomPadding(insets: EdgeInsets): number {
  const bottomInset = insets.bottom;
  return bottomInset > 0 ? bottomInset : spacing.xs;
}

export function getTabBarStyle(insets: EdgeInsets): ViewStyle {
  const bottomPadding = resolveTabBarBottomPadding(insets);

  return {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    paddingBottom: bottomPadding,
    minHeight: BASE_TAB_BAR_HEIGHT + bottomPadding,
  };
}

export const tabBarLabelStyle = {
  ...typography.caption,
  fontWeight: '600' as const,
  marginBottom: spacing.xs,
};
