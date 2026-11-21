import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

interface WaxSealMedallionProps {
  completed?: boolean;
  pending?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

export function WaxSealMedallion({
  completed = false,
  pending = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  testID,
}: WaxSealMedallionProps) {
  const inner = (
    <>
      {completed ? (
        <LinearGradient
          colors={[colors.progressCompleted, '#3D8A62']}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {pending ? (
        <ActivityIndicator
          color={completed ? colors.textPrimary : colors.textSecondary}
          size="small"
        />
      ) : completed ? (
        <Ionicons name="checkmark" size={22} color={colors.background} />
      ) : (
        <Ionicons name="checkmark" size={18} color={colors.textMuted} />
      )}
    </>
  );

  const medallionStyle = [
    styles.medallion,
    completed ? styles.medallionCompleted : styles.medallionIdle,
    disabled && !completed && styles.medallionDisabled,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: completed, busy: pending, disabled }}
        disabled={disabled || pending}
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => [
          medallionStyle,
          pressed && !pending && styles.pressed,
        ]}
        testID={testID}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={medallionStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  medallion: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  medallionIdle: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
  },
  medallionCompleted: {
    borderColor: colors.progressCompleted,
  },
  medallionDisabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
