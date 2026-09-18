import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

interface ReviewsWritePromptProps {
  onPress: () => void;
}

export function ReviewsWritePrompt({ onPress }: ReviewsWritePromptProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Write a review"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      testID="reviews-write-section"
    >
      <AppText variant="bodySmall" muted style={styles.prompt}>
        Share your thoughts
      </AppText>
      <AppText variant="caption" style={styles.action}>
        Write
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: interaction.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  prompt: {
    flex: 1,
  },
  action: {
    color: colors.accent,
    fontWeight: '600',
  },
});
