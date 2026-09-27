import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import { HOME_HEADER_BAR_HEIGHT } from '../utils/home-header-layout';

export { HOME_HEADER_BAR_HEIGHT };
export const HOME_HEADER_COMPACT_TARGET = 40;

export const homeHeaderStyles = StyleSheet.create({
  shell: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HOME_HEADER_BAR_HEIGHT,
    borderRadius: HOME_HEADER_BAR_HEIGHT / 2,
    backgroundColor: colors.accentSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    paddingRight: spacing.xs,
  },
  headerBarOverlay: {
    backgroundColor: 'rgba(20, 20, 28, 0.82)',
    borderColor: colors.borderAccent,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: HOME_HEADER_BAR_HEIGHT,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMuted,
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: spacing.sm + spacing.xs,
    backgroundColor: colors.borderSubtle,
  },
});
