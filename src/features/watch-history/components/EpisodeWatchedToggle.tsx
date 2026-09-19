import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { borderRadius } from '@/theme/spacing';

interface EpisodeWatchedToggleProps {
  isWatched: boolean;
  disabled?: boolean;
  isPending?: boolean;
  onPress: () => void;
}

export function EpisodeWatchedToggle({
  isWatched,
  disabled = false,
  isPending = false,
  onPress,
}: EpisodeWatchedToggleProps) {
  const { t } = useTranslation();
  const label = isWatched ? t('common.markAsUnwatched') : t('common.markAsWatched');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isWatched, disabled: disabled || isPending, busy: isPending }}
      disabled={disabled || isPending}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        isWatched && styles.buttonActive,
        pressed && !disabled && !isPending && styles.pressed,
        (disabled || isPending) && styles.disabled,
      ]}
      testID="episode-watched-toggle"
    >
      {isPending ? (
        <ActivityIndicator color={colors.accent} size="small" />
      ) : (
        <Ionicons
          name={isWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={22}
          color={isWatched ? colors.accent : colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.accentTint12,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
