import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

export const waxSealCardStyles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196, 163, 90, 0.35)',
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  cardCompleted: {
    backgroundColor: colors.progressCompletedTint12,
    borderColor: 'rgba(76, 175, 130, 0.35)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
});
