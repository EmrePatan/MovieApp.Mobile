import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { RegionSelector } from '@/features/regions/components/RegionSelector';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getRegionLabel } from '@/features/regions/region-options';
import { spacing } from '@/theme/spacing';

export default function RegionPreferenceScreen() {
  const router = useRouter();
  const { region, source, setRegion, resetToDeviceDefault } = useRegionalPreference();
  const [expanded, setExpanded] = useState(true);

  const handleSelect = async (regionCode: string) => {
    await setRegion(regionCode);
    setExpanded(false);
    router.back();
  };

  const sourceLabel =
    source === 'saved'
      ? 'Saved preference'
      : source === 'device'
        ? 'Based on device locale'
        : 'Default fallback';

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          Region
        </AppText>
        <AppText variant="bodySmall" muted>
          Sets the default region for streaming availability and theatrical listings.
        </AppText>
      </View>

      <View style={styles.content}>
        <RegionSelector
          label="Default region"
          value={region}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((current) => !current)}
          onSelect={(regionCode) => void handleSelect(regionCode)}
          testID="user-region-selector"
        />

        <AppText variant="bodySmall" muted>
          Current: {getRegionLabel(region)} ({sourceLabel})
        </AppText>

        {source === 'saved' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset to device default region"
            onPress={() => void resetToDeviceDefault().then(() => router.back())}
          >
            <AppText variant="bodySmall" style={styles.resetAction}>
              Reset to device default
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
