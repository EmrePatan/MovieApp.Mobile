import { Platform, type ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const BASE_TAB_BAR_HEIGHT = 60;

const iosTabBarStyle: ViewStyle = {
  backgroundColor: colors.tabBar,
  borderTopColor: colors.tabBarBorder,
  borderTopWidth: 1,
  paddingTop: spacing.xs,
  minHeight: BASE_TAB_BAR_HEIGHT,
};

export function getTabBarStyle(insets: EdgeInsets): ViewStyle {
  if (Platform.OS !== 'android') {
    return iosTabBarStyle;
  }

  const bottomInset = insets.bottom;
  const bottomPadding = bottomInset > 0 ? bottomInset : spacing.xs;

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
