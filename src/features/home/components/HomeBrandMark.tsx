import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MovieCaveLogo } from '@/features/branding/components/MovieCaveLogo';

interface HomeBrandMarkProps {
  overlay?: boolean;
  logoWidth: number;
  logoHeight: number;
}

export function HomeBrandMark({ overlay = false, logoWidth, logoHeight }: HomeBrandMarkProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel={t('home.brandMark')}>
      <MovieCaveLogo
        width={logoWidth}
        height={logoHeight}
        overlay={overlay}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  logo: {
    marginTop: 1,
  },
});
