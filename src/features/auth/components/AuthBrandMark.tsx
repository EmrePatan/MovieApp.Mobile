import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { authTypography } from '../auth-typography';
import { colors } from '@/theme/colors';

interface AuthBrandMarkProps {
  compact?: boolean;
}

export function AuthBrandMark({ compact = false }: AuthBrandMarkProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const movieSize = compact ? 22 : width < 360 ? 30 : width < 390 ? 34 : 36;
  const caveSize = compact ? 26 : width < 360 ? 34 : width < 390 ? 38 : 40;
  const lineHeight = compact ? 30 : movieSize * 1.08;

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <Text
        style={[
          styles.movie,
          {
            fontSize: movieSize,
            lineHeight,
          },
        ]}
        maxFontSizeMultiplier={1.2}
      >
        movie
      </Text>
      <Text
        style={[
          styles.cave,
          {
            fontSize: caveSize,
            lineHeight,
          },
        ]}
        maxFontSizeMultiplier={1.2}
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
    gap: 6,
  },
  movie: {
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkRegular,
    letterSpacing: 0.8,
    textTransform: 'lowercase',
  },
  cave: {
    color: colors.accentStrong,
    fontFamily: authTypography.wordmarkSemibold,
    letterSpacing: 0.2,
    textTransform: 'lowercase',
  },
});
