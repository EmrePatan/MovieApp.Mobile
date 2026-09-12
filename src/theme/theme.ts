import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { interaction } from './interaction';
import { layout } from './layout';
import { borderRadius, spacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  layout,
  interaction,
  shadows,
} as const;

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  surfaceCardCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
});

export type Theme = typeof theme;
