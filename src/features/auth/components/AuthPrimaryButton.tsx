import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

interface AuthPrimaryButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AuthPrimaryButton({
  title,
  loading = false,
  disabled,
  style,
  ...props
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={['#E9CC84', '#D4B36A', '#B8964F']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#0A0A0F" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.title} maxFontSizeMultiplier={1.2}>
              {title}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#0A0A0F" style={styles.arrow} />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 24,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: '#0A0A0F',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    flexShrink: 1,
    textAlign: 'center',
  },
  arrow: {
    flexShrink: 0,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: interaction.disabledOpacity,
  },
});
