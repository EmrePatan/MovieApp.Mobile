import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';

export const DETAIL_ACTION_SIZE = 56;

interface DetailCircularActionProps {
  label: string;
  accessibilityLabel: string;
  active?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
}

export function DetailCircularAction({
  label,
  accessibilityLabel,
  active = false,
  busy = false,
  disabled = false,
  onPress,
  children,
}: DetailCircularActionProps) {
  const isDisabled = disabled || busy;

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: active, disabled: isDisabled, busy }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          active && styles.buttonActive,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={active ? colors.accent : colors.textPrimary} size="small" />
        ) : (
          children
        )}
      </Pressable>
      <AppText
        variant="caption"
        style={[styles.label, active && styles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: DETAIL_ACTION_SIZE,
  },
  button: {
    width: DETAIL_ACTION_SIZE,
    height: DETAIL_ACTION_SIZE,
    borderRadius: DETAIL_ACTION_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  buttonActive: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint14,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: interaction.subtlePressedOpacity,
  },
  disabled: {
    opacity: interaction.busyOpacity,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.textSecondary,
  },
});
