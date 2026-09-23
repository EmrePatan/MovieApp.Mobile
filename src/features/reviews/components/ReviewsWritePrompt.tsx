import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

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
      <View style={styles.row}>
        <AppText variant="bodySmall" style={styles.prompt} numberOfLines={2}>
          {t('reviews.writePrompt')}
        </AppText>
        <AppText variant="caption" style={styles.action}>
          {t('reviews.writeReviewCta')}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: interaction.touchTarget,
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  prompt: {
    flex: 1,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    minWidth: 0,
  },
  action: {
    color: colors.accent,
    fontWeight: '600',
    flexShrink: 0,
  },
});
