import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { glass } from './glass';
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
    backgroundColor: glass.fill,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: glass.border,
    padding: spacing.lg,
  },
  surfaceCardCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: glass.fill,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: glass.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  buttonPrimary: {
    backgroundColor: colors.accentStrong,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 240, 200, 0.55)',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonSecondary: {
    backgroundColor: glass.fill,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: glass.border,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: glass.fill,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    color: colors.textPrimary,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
  },
});

export type Theme = typeof theme;
