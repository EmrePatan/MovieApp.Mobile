import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DiscoverFeatureEntryProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  accessibilityLabel?: string;
}

export function DiscoverFeatureEntry({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  comingSoon = false,
  accessibilityLabel,
}: DiscoverFeatureEntryProps) {
  const isInteractive = Boolean(onPress) && !disabled && !comingSoon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !isInteractive }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        comingSoon && styles.cardMuted,
        pressed && isInteractive && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, comingSoon && styles.iconWrapMuted]}>
        <Ionicons name={icon} size={20} color={comingSoon ? colors.textMuted : colors.accent} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="body" style={styles.title}>
            {title}
          </AppText>
          {comingSoon ? (
            <View style={styles.soonBadge}>
              <AppText variant="caption" style={styles.soonBadgeText}>
                Coming soon
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="bodySmall" muted>
          {subtitle}
        </AppText>
      </View>
      {isInteractive ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardMuted: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  iconWrapMuted: {
    backgroundColor: colors.surfaceElevated,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  soonBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceElevated,
  },
  soonBadgeText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
