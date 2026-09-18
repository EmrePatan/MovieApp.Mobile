import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface AuthBrandMarkProps {
  compact?: boolean;
}

export function AuthBrandMark({ compact = false }: AuthBrandMarkProps) {
  const movieSize = compact ? 13 : 15;
  const caveSize = compact ? 18 : 22;
  const lineHeight = compact ? 22 : 26;

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel="movie cave">
      <Text
        style={[styles.movie, { fontSize: movieSize, lineHeight }]}
        maxFontSizeMultiplier={1.3}
      >
        movie
      </Text>
      <Text
        style={[styles.cave, { fontSize: caveSize, lineHeight }]}
        maxFontSizeMultiplier={1.3}
      >
        cave
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  movie: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'lowercase',
  },
  cave: {
    color: colors.accentStrong,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'lowercase',
  },
});
