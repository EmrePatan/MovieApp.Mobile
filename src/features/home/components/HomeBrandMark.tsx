import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface HomeBrandMarkProps {
  overlay?: boolean;
}

const MOVIE_CAVE_HORIZONTAL_LOGO = require('../../../../assets/images/movie-cave-horizontal-logo.png');

export const HOME_BRAND_LOGO_WIDTH = 135;
const LOGO_ASPECT_RATIO = 724 / 2172;
export const HOME_BRAND_LOGO_HEIGHT = Math.round(HOME_BRAND_LOGO_WIDTH * LOGO_ASPECT_RATIO);

export function HomeBrandMark({ overlay = false }: HomeBrandMarkProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <Image
        source={MOVIE_CAVE_HORIZONTAL_LOGO}
        style={[styles.logo, overlay && styles.logoOverlay]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  logo: {
    width: HOME_BRAND_LOGO_WIDTH,
    height: HOME_BRAND_LOGO_HEIGHT,
  },
  logoOverlay: {
    opacity: 0.96,
  },
});
