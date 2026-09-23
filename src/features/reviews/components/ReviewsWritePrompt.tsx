import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

interface ReviewsWritePromptProps {
  onPress: () => void;
}

export function ReviewsWritePrompt({ onPress }: ReviewsWritePromptProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('reviews.writeAccessibility')}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      testID="reviews-write-section"
    >
      <View style={styles.copyBlock}>
        <AppText variant="bodySmall" style={styles.headline}>
          {t('reviews.writePrompt')}
        </AppText>
        <AppText variant="caption" muted style={styles.subtitle}>
          {t('reviews.writePromptSubtitle')}
        </AppText>
      </View>
      <View style={styles.ctaPill}>
        <AppText variant="caption" style={styles.ctaLabel}>
          {t('reviews.writeReviewCta')}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.sm,
    minHeight: interaction.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  copyBlock: {
    gap: 4,
  },
  headline: {
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    lineHeight: 17,
    fontSize: 12,
  },
  ctaPill: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderAccent,
    minHeight: interaction.touchTarget,
    justifyContent: 'center',
  },
  ctaLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
});
