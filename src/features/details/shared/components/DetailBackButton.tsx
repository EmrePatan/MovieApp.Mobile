import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface DetailBackButtonProps {
  label?: string;
  topOffset?: number;
  variant?: 'inline' | 'overlay';
}

export function DetailBackButton({
  label,
  topOffset = 0,
  variant = 'inline',
}: DetailBackButtonProps) {
  const router = useRouter();
  const accessibilityLabel = label ?? (variant === 'overlay' ? 'Go back' : 'Back');
  const displayLabel = label ?? 'Back';

  if (variant === 'overlay') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.overlayButton,
          { top: topOffset },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.inlineButton, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      <AppText variant="body">{displayLabel}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  overlayButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 20,
    width: interaction.touchTarget,
    height: interaction.touchTarget,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
