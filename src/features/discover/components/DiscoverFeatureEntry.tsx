import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
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
  backgroundSource?: ImageSourcePropType;
  backgroundTestID?: string;
}

export function DiscoverFeatureEntry({
  title,
  subtitle,
  icon,
  onPress,
  disabled = false,
  comingSoon = false,
  accessibilityLabel,
  backgroundSource,
  backgroundTestID,
}: DiscoverFeatureEntryProps) {
  const { t } = useTranslation();
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
        backgroundSource ? styles.cardWithArt : null,
        comingSoon && styles.cardMuted,
        pressed && isInteractive && styles.pressed,
      ]}
    >
      {backgroundSource ? (
        <>
          <Image
            source={backgroundSource}
            resizeMode="cover"
            style={styles.backdrop}
            testID={backgroundTestID}
            accessible={false}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(8, 8, 12, 0.94)',
              'rgba(8, 8, 12, 0.78)',
              'rgba(8, 8, 12, 0.42)',
              'rgba(8, 8, 12, 0.18)',
            ]}
            locations={[0, 0.34, 0.68, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}
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
                {t('discover.hub.comingSoon')}
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
    overflow: 'hidden',
  },
  cardWithArt: {
    paddingVertical: spacing.sm,
    borderColor: 'rgba(196, 163, 90, 0.32)',
    backgroundColor: '#0C0C12',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '78%',
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
