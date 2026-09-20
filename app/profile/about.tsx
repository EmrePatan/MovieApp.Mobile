import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { MovieCaveLogo } from '@/features/branding/components/MovieCaveLogo';
import { getMovieCaveLogoHeight } from '@/features/branding/movie-cave-branding';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const ABOUT_LOGO_WIDTH = 184;

export default function AboutScreen() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const logoHeight = getMovieCaveLogoHeight(ABOUT_LOGO_WIDTH);

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('profile.aboutTitle')}
        </AppText>
      </View>

      <View style={styles.content}>
        <View style={styles.brandCard}>
          <MovieCaveLogo width={ABOUT_LOGO_WIDTH} height={logoHeight} />
          <AppText variant="subtitle" style={styles.brandName}>
            {t('profile.aboutBrandName')}
          </AppText>
          <AppText variant="bodySmall" muted style={styles.description}>
            {t('profile.aboutDescription')}
          </AppText>
          <View style={styles.versionPill}>
            <AppText variant="caption" style={styles.versionText}>
              {t('profile.aboutVersion', { version })}
            </AppText>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  content: {
    gap: spacing.lg,
  },
  brandCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  brandName: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  versionPill: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  versionText: {
    color: colors.accent,
    fontWeight: '600',
  },
});
