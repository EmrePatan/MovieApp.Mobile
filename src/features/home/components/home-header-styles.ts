import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

export const HOME_HEADER_COMPACT_TARGET = 36;

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
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: spacing.md,
  },
  actionCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.accentTint18,
  },
  actionClusterOverlay: {
    backgroundColor: 'rgba(196, 163, 90, 0.16)',
    borderColor: colors.borderAccent,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderSubtle,
  },
});
