import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { shadows } from '@/theme/shadows';

interface ReviewsWriteFabProps {
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

export function ReviewsWriteFab({
  accessibilityLabel,
  onPress,
  testID = 'reviews-write-section',
}: ReviewsWriteFabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      testID={testID}
    >
      <Ionicons name="create-outline" size={24} color={colors.background} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignSelf: 'flex-end',
    marginRight: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
