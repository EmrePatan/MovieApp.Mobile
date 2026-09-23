import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { MAX_STAR_RATING, MIN_STAR_RATING } from '@/features/ratings/utils/star-rating';

interface ReviewStarRowProps {
  starRating: number;
  size?: number;
  testID?: string;
}

export function ReviewStarRow({ starRating, size = 12, testID }: ReviewStarRowProps) {
  const clamped = Math.max(MIN_STAR_RATING, Math.min(MAX_STAR_RATING, starRating));

  return (
    <View style={styles.row} testID={testID}>
      {Array.from({ length: 5 }, (_, index) => {
        const starIndex = index + 1;
        const filled = clamped >= starIndex;
        const half = !filled && clamped >= starIndex - 0.5;

        return (
          <Ionicons
            key={starIndex}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={size}
            color={filled || half ? colors.accentStrong : colors.textMuted}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
});
