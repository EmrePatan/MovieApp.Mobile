import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { GlassSurface } from '@/components/common/GlassSurface';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { typography } from '@/theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostDestructive' | 'destructive';

interface AppButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {variant === 'secondary' ? (
        <GlassSurface
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.glassLayer]}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textPrimary : colors.accent} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'destructive' && styles.labelDestructive,
            variant === 'ghostDestructive' && styles.labelGhostDestructive,
            variant !== 'primary' &&
              variant !== 'destructive' &&
              variant !== 'ghostDestructive' &&
              styles.labelSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    minWidth: interaction.touchTarget,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.accentStrong,
    borderWidth: 1,
    borderColor: 'rgba(255, 240, 200, 0.55)',
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  glassLayer: {
    borderRadius: borderRadius.full,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostDestructive: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.disabledOpacity,
  },
  label: {
    ...typography.button,
    color: colors.textPrimary,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
  labelDestructive: {
    color: colors.textPrimary,
  },
  labelGhostDestructive: {
    color: colors.error,
  },
});
