import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface PosterWatchedBadgeProps {
  watched: boolean;
  busy?: boolean;
  onPress?: () => void;
}

/**
 * Corner control: outline = tap to mark watched, filled = watched (tap to undo).
 * Always visible when interactive so browse can bulk-mark quickly.
 */
export function PosterWatchedBadge({ watched, busy = false, onPress }: PosterWatchedBadgeProps) {
  const { t } = useTranslation();

  if (!onPress) {
    if (!watched) {
      return null;
    }

    return (
      <View pointerEvents="none" style={styles.anchor} accessible={false} testID="poster-watched-badge">
        <View style={[styles.badge, styles.badgeWatched]}>
          <Ionicons name="checkmark" size={12} color={colors.background} />
        </View>
      </View>
    );
  }

  const label = watched ? t('common.markAsUnwatched') : t('common.markAsWatched');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: watched, busy }}
      disabled={busy}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.anchor,
        pressed && !busy && styles.pressed,
        busy && styles.busy,
      ]}
      testID="poster-watched-badge"
    >
      <View style={[styles.badge, watched ? styles.badgeWatched : styles.badgeIdle]}>
        <Ionicons
          name={watched ? 'checkmark' : 'checkmark-outline'}
          size={12}
          color={watched ? colors.background : colors.textPrimary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 4,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  badgeIdle: {
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  badgeWatched: {
    backgroundColor: colors.accent,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
    transform: [{ scale: 0.94 }],
  },
  busy: {
    opacity: interaction.busyOpacity,
  },
});
