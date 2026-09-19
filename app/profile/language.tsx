import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { LanguageSelector } from '@/features/locale/components/LanguageSelector';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { getLanguageLabel } from '@/i18n/locale-tags';
import { spacing } from '@/theme/spacing';

export default function LanguagePreferenceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, source, setLanguage, resetToDeviceDefault } = useLocalePreference();
  const [expanded, setExpanded] = useState(true);

  const sourceLabel =
    source === 'saved'
      ? t('profile.languageSourceSaved')
      : source === 'device'
        ? t('profile.languageSourceDevice')
        : t('profile.languageSourceFallback');

  const handleSelect = async (nextLanguage: typeof language) => {
    await setLanguage(nextLanguage);
    setExpanded(false);
    router.back();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('profile.languageTitle')}
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
          expanded={expanded}
          onToggleExpanded={() => setExpanded((current) => !current)}
          onSelect={(nextLanguage) => void handleSelect(nextLanguage)}
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
            onPress={() => void resetToDeviceDefault().then(() => router.back())}
          >
            <AppText variant="bodySmall" style={styles.resetAction}>
              {t('profile.resetLanguageToDevice')}
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
  resetAction: {
    textDecorationLine: 'underline',
  },
});
