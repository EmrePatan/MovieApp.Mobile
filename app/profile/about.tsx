import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { MovieCaveLogo } from '@/features/branding/components/MovieCaveLogo';
import { getMovieCaveLogoHeight } from '@/features/branding/movie-cave-branding';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

function getAboutLogoWidth(screenWidth: number): number {
  const contentWidth = screenWidth - layout.screenPaddingHorizontal * 2;

  return Math.min(296, Math.max(248, Math.round(contentWidth * 0.82)));
}

function getAboutContentOpticalInsets(screenHeight: number) {
  const opticalBias = Math.round(Math.min(spacing.xxl * 2, screenHeight * 0.07));

  return {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + opticalBias,
  };
}

export default function AboutScreen() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const logoWidth = getAboutLogoWidth(width);
  const logoHeight = getMovieCaveLogoHeight(logoWidth);

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('profile.aboutTitle')}
        </AppText>
      </View>

      <View style={[styles.content, getAboutContentOpticalInsets(height)]}>
        <View style={styles.brandBlock}>
          <MovieCaveLogo width={logoWidth} height={logoHeight} style={styles.logo} />
          <AppText variant="bodySmall" style={styles.description}>
            {t('profile.aboutDescription')}
          </AppText>
          <AppText variant="caption" style={styles.version}>
            {t('profile.aboutVersion', { version })}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  logo: {
    alignSelf: 'center',
  },
  description: {
    color: 'rgba(245, 245, 247, 0.78)',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    maxWidth: 320,
    letterSpacing: 0.15,
  },
  version: {
    marginTop: spacing.xs,
    color: colors.accentMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '500',
  },
});
