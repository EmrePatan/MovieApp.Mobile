import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { MovieCaveLogo } from '@/features/branding/components/MovieCaveLogo';
import { getMovieCaveLogoHeight } from '@/features/branding/movie-cave-branding';

interface AuthBrandMarkProps {
  compact?: boolean;
}

function getAuthLogoWidth(screenWidth: number, compact: boolean): number {
  if (compact) {
    return Math.min(168, Math.max(140, Math.round(screenWidth * 0.42)));
  }

  if (screenWidth < 360) {
    return 168;
  }

  if (screenWidth < 390) {
    return 184;
  }

  return Math.min(208, Math.round(screenWidth * 0.48));
}

export function AuthBrandMark({ compact = false }: AuthBrandMarkProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const logoWidth = getAuthLogoWidth(width, compact);
  const logoHeight = getMovieCaveLogoHeight(logoWidth);

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <MovieCaveLogo width={logoWidth} height={logoHeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});
