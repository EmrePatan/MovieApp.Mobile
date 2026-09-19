import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface HomeBrandMarkProps {
  overlay?: boolean;
  logoWidth: number;
  logoHeight: number;
}

const MOVIE_CAVE_HORIZONTAL_LOGO = require('../../../../assets/movie-cave-horizontal-logo-transparent.png');

export function HomeBrandMark({ overlay = false, logoWidth, logoHeight }: HomeBrandMarkProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <Image
        source={MOVIE_CAVE_HORIZONTAL_LOGO}
        style={[
          styles.logo,
          { width: logoWidth, height: logoHeight },
          overlay && styles.logoOverlay,
        ]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'flex-start',
  },
  logoOverlay: {
    opacity: 0.96,
  },
});
