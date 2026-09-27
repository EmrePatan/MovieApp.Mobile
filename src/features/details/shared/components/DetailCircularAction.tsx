import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';
import { DetailDirectionalFrame } from './DetailDirectionalFrame';

export const DETAIL_ACTION_SIZE = 52;
const ACTION_INNER_SIZE = DETAIL_ACTION_SIZE - 2;

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
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        <DetailDirectionalFrame
          variant={active ? 'gold' : 'neutral'}
          borderRadius={DETAIL_ACTION_SIZE / 2}
          style={styles.frame}
        >
          <View style={styles.buttonSurface}>
            {busy ? (
              <ActivityIndicator color={active ? colors.accent : colors.textPrimary} size="small" />
            ) : (
              children
            )}
          </View>
        </DetailDirectionalFrame>
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
  frame: {
    width: DETAIL_ACTION_SIZE,
    height: DETAIL_ACTION_SIZE,
  },
  buttonSurface: {
    width: ACTION_INNER_SIZE,
    height: ACTION_INNER_SIZE,
    borderRadius: ACTION_INNER_SIZE / 2,
    backgroundColor: 'rgba(12, 12, 18, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.accent,
  },
});
