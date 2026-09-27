import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

const EMPTY_STAR_COLOR = 'rgba(107, 107, 128, 0.45)';

interface WholeStarRatingPickerProps {
  value: number | null;
  disabled?: boolean;
  starSize?: number;
  onSelect: (stars: number) => void;
}

export function WholeStarRatingPicker({
  value,
  disabled = false,
  starSize = 32,
  onSelect,
}: WholeStarRatingPickerProps) {
  return (
    <View style={styles.row} testID="whole-star-rating-picker">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = value != null && value >= starValue - 0.001;

        return (
          <Pressable
            key={starValue}
            accessibilityRole="button"
            accessibilityLabel={`${starValue}`}
            accessibilityState={{ selected: filled, disabled }}
            disabled={disabled}
            onPress={() => onSelect(starValue)}
            testID={`whole-star-${starValue}`}
            style={({ pressed }) => [
              styles.starButton,
              pressed && !disabled && styles.pressed,
            ]}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={starSize}
              color={filled ? colors.accentStrong : EMPTY_STAR_COLOR}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  starButton: {
    minWidth: interaction.touchTarget,
    minHeight: interaction.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
