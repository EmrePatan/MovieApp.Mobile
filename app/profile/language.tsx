import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { LanguageSelector } from '@/features/locale/components/LanguageSelector';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { RegionSelector } from '@/features/regions/components/RegionSelector';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getRegionLabel } from '@/features/regions/region-options';
import { getLanguageLabel } from '@/i18n/locale-tags';
import { spacing } from '@/theme/spacing';

/** Language and region preferences on one screen. */
export default function LanguageRegionPreferenceScreen() {
  const { t } = useTranslation();
  const { language, source, setLanguage, resetToDeviceDefault } = useLocalePreference();
  const {
    region,
    source: regionSource,
    setRegion,
    resetToDeviceDefault: resetRegionToDeviceDefault,
  } = useRegionalPreference();
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const [regionExpanded, setRegionExpanded] = useState(false);

  const sourceLabel =
    source === 'saved'
      ? t('profile.languageSourceSaved')
      : source === 'device'
        ? t('profile.languageSourceDevice')
        : t('profile.languageSourceFallback');

  const regionSourceLabel =
    regionSource === 'saved'
      ? t('profile.regionSourceSaved')
      : regionSource === 'device'
        ? t('profile.regionSourceDevice')
        : t('profile.regionSourceFallback');

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('extras.languageRegion')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.languageDescription')}
        </AppText>
      </View>

      <View style={styles.content}>
        <LanguageSelector
          label={t('profile.appLanguage')}
          value={language}
          viewerLanguage={language}
          expanded={languageExpanded}
          onToggleExpanded={() => setLanguageExpanded((current) => !current)}
          onSelect={(nextLanguage) => {
            void setLanguage(nextLanguage);
            setLanguageExpanded(false);
          }}
          testID="user-language-selector"
        />

        <AppText variant="bodySmall" muted>
          {t('profile.languageCurrent', {
            language: getLanguageLabel(language, language),
            source: sourceLabel,
          })}
        </AppText>

        {source === 'saved' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.resetLanguageAccessibility')}
            onPress={() => void resetToDeviceDefault()}
          >
            <AppText variant="bodySmall" style={styles.resetAction}>
              {t('profile.resetLanguageToDevice')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.content, styles.regionBlock]}>
        <AppText variant="bodySmall" muted>
          {t('profile.regionDescription')}
        </AppText>

        <RegionSelector
          label={t('profile.defaultRegion')}
          value={region}
          expanded={regionExpanded}
          onToggleExpanded={() => setRegionExpanded((current) => !current)}
          onSelect={(regionCode) => {
            void setRegion(regionCode);
            setRegionExpanded(false);
          }}
          testID="user-region-selector"
        />

        <AppText variant="bodySmall" muted>
          {t('profile.regionCurrent', {
            region: getRegionLabel(region),
            source: regionSourceLabel,
          })}
        </AppText>

        {regionSource === 'saved' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.resetRegionAccessibility')}
            onPress={() => void resetRegionToDeviceDefault()}
          >
            <AppText variant="bodySmall" style={styles.resetAction}>
              {t('profile.resetRegionToDevice')}
            </AppText>
          </Pressable>
        ) : null}
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
  regionBlock: {
    marginTop: spacing.xl,
  },
  resetAction: {
    textDecorationLine: 'underline',
  },
});
