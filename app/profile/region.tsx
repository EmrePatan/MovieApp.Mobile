import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { RegionSelector } from '@/features/regions/components/RegionSelector';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getRegionLabel } from '@/features/regions/region-options';
import { spacing } from '@/theme/spacing';

export default function RegionPreferenceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { region, source, setRegion, resetToDeviceDefault } = useRegionalPreference();
  const [expanded, setExpanded] = useState(false);

  const handleSelect = async (regionCode: string) => {
    await setRegion(regionCode);
    setExpanded(false);
    router.back();
  };

  const sourceLabel =
    source === 'saved'
      ? t('profile.regionSourceSaved')
      : source === 'device'
        ? t('profile.regionSourceDevice')
        : t('profile.regionSourceFallback');

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('profile.regionTitle')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.regionDescription')}
        </AppText>
      </View>

      <View style={styles.content}>
        <RegionSelector
          label={t('profile.defaultRegion')}
          value={region}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((current) => !current)}
          onSelect={(regionCode) => void handleSelect(regionCode)}
          testID="user-region-selector"
        />

        <AppText variant="bodySmall" muted>
          {t('profile.regionCurrent', {
            region: getRegionLabel(region),
            source: sourceLabel,
          })}
        </AppText>

        {source === 'saved' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.resetRegionAccessibility')}
            onPress={() => void resetToDeviceDefault().then(() => router.back())}
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
  resetAction: {
    textDecorationLine: 'underline',
  },
});
