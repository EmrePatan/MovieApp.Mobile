import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

interface MyCommentsEmptyStateProps {
  onDiscover: () => void;
}

export function MyCommentsEmptyState({ onDiscover }: MyCommentsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <View style={styles.iconGlow} />
        <Ionicons name="chatbubble-outline" size={34} color={colors.accent} />
      </View>
      <AppText variant="subtitle" center style={styles.title}>
        {t('profile.myComments.emptyTitle')}
      </AppText>
      <AppText variant="bodySmall" muted center style={styles.description}>
        {t('profile.myComments.emptyDescription')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('profile.myComments.emptyCta')}
        onPress={onDiscover}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <AppText variant="bodySmall" style={styles.ctaLabel}>
          {t('profile.myComments.emptyCta')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  iconRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentTint14,
    opacity: 0.65,
  },
  title: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  description: {
    lineHeight: 22,
    maxWidth: 300,
  },
  cta: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    maxWidth: 320,
    minHeight: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ctaPressed: {
    opacity: interaction.pressedOpacity,
    backgroundColor: colors.accentTint18,
  },
  ctaLabel: {
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
