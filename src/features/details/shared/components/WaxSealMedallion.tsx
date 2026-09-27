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
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <LinearGradient
          colors={[colors.accentStrong, colors.accentMuted]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {pending ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : completed ? (
        <Ionicons name="checkmark" size={22} color={colors.background} />
      ) : null}
    </>
  );

  const medallionStyle = [styles.medallion, completed && styles.medallionCompleted];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: completed, busy: pending }}
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
    borderWidth: 2,
    borderColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  medallionCompleted: {
    borderColor: colors.progressCompleted,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
