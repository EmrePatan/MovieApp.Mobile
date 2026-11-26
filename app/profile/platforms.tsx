import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { WatchProviderLogo } from '@/features/discovery/components/WatchProviderLogo';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { getRegionLabel } from '@/features/regions/region-options';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import {
  buildPlatformOptions,
  MAX_WATCH_PLATFORMS,
  useUpdateWatchPlatforms,
  useWatchPlatforms,
} from '@/features/watch-platforms/watch-platforms';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

/** Streaming subscriptions, stored per account on the server. */
export default function WatchPlatformsScreen() {
  const { t } = useTranslation();
  const { region, isHydrated } = useRegionalPreference();
  const saved = useWatchPlatforms();
  const update = useUpdateWatchPlatforms();
  const movieProviders = useDiscoveryWatchProviders('movie', region, isHydrated);
  const tvProviders = useDiscoveryWatchProviders('tv', region, isHydrated);

  const selectedIds = saved.data?.providerIds ?? [];
  const options = buildPlatformOptions(
    [movieProviders.data?.providers ?? [], tvProviders.data?.providers ?? []],
    region,
    selectedIds,
  );
  const isError = saved.isError || movieProviders.isError || tvProviders.isError;
  const isLoading = !saved.data || !movieProviders.data || !tvProviders.data;
  const isFull = selectedIds.length >= MAX_WATCH_PLATFORMS;

  const retry = () => {
    void saved.refetch();
    void movieProviders.refetch();
    void tvProviders.refetch();
  };

  const toggle = (providerId: number) => {
    const providerIds = selectedIds.includes(providerId)
      ? selectedIds.filter((id) => id !== providerId)
      : [...selectedIds, providerId];
    update.mutate({ providerIds });
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('extras.myPlatformsTitle')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('extras.myPlatformsDescription', { region: getRegionLabel(region) })}
        </AppText>
        {update.isError ? (
          <AppText variant="bodySmall" style={styles.error} accessibilityRole="alert">
            {t('extras.myPlatformsSaveError')}
          </AppText>
        ) : null}
        {isFull ? (
          <AppText variant="bodySmall" muted>
            {t('extras.myPlatformsLimit', { max: MAX_WATCH_PLATFORMS })}
          </AppText>
        ) : null}
      </View>

      {isError ? (
        <View style={styles.center}>
          <AppText variant="bodySmall" muted>
            {t('extras.myPlatformsError')}
          </AppText>
          <Pressable onPress={retry} accessibilityRole="button">
            <AppText style={styles.retry}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <View style={styles.grid}>
          {options.map((provider) => {
            const selected = selectedIds.includes(provider.providerId);
            const disabled = isFull && !selected;

            return (
              <Pressable
                key={provider.providerId}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled }}
                accessibilityLabel={provider.name}
                disabled={disabled}
                onPress={() => toggle(provider.providerId)}
                style={[styles.tile, selected && styles.tileSelected, disabled && styles.disabled]}
                testID={`watch-platform-${provider.providerId}`}
              >
                <WatchProviderLogo provider={provider} selected={selected} />
                <AppText variant="caption" style={styles.name} numberOfLines={2}>
                  {provider.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    // Three per row: the basis leaves room for the gaps, flexGrow fills the rest.
    flexBasis: '30%',
    flexGrow: 1,
    maxWidth: '32%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  tileSelected: { borderWidth: 1, borderColor: colors.accent },
  disabled: { opacity: 0.4 },
  name: { textAlign: 'center', color: colors.textPrimary },
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  retry: { color: colors.accent, fontWeight: '600' },
  error: { color: colors.accent },
});
