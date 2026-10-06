import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import { useStreamingProviderPreviews } from '@/features/discovery/hooks/useStreamingProviderPreviews';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  resolveStreamingHubRailProviders,
} from '@/features/discovery/streaming-platform-hub-types';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { DISCOVER_HUB_RAIL_GAP } from '@/features/discover/discover-hub-rail-tile';
import { useDiscoverHubRailTileSize } from '@/features/discover/useDiscoverHubRailTileSize';
import { StreamingProviderPosterCard } from './StreamingProviderPosterCard';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const STREAMING_PLATFORMS_DIRECTORY_ROUTE = '/streaming-platforms';

export function StreamingPlatformsHubSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const hubTileSize = useDiscoverHubRailTileSize();
  const { region: watchRegion, isHydrated } = useRegionalPreference();
  const providersQuery = useDiscoveryWatchProviders(
    DEFAULT_STREAMING_HUB_MEDIA_TYPE,
    watchRegion,
    isHydrated,
  );

  const railProviders = useMemo(
    () => resolveStreamingHubRailProviders(providersQuery.data?.providers),
    [providersQuery.data?.providers],
  );
  const providerPreviews = useStreamingProviderPreviews(
    railProviders,
    watchRegion,
    DEFAULT_STREAMING_HUB_MEDIA_TYPE,
    isHydrated,
  );

  const openDirectory = useCallback(() => {
    openLibraryStackScreen(router, STREAMING_PLATFORMS_DIRECTORY_ROUTE, '/discover');
  }, [router]);

  if (!isHydrated) {
    return null;
  }

  return (
    <View style={styles.section} testID="streaming-platforms-hub">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="tv-outline" size={18} color={colors.accent} />
          <AppText variant="subtitle" style={styles.title} accessibilityRole="header">
            {t('discover.streamingPlatformsHub.title')}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('discover.streamingPlatformsHub.seeAllAccessibility')}
          onPress={openDirectory}
          hitSlop={8}
          style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
          testID="streaming-platforms-hub-see-all"
        >
          <AppText variant="bodySmall" style={styles.seeAllLabel}>
            {t('discover.streamingPlatformsHub.seeAll')}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={railProviders}
        key={hubTileSize.width}
        keyExtractor={(item) => String(item.providerId)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.providerList}
        renderItem={({ item }) => (
          <StreamingProviderPosterCard
            provider={item}
            watchRegion={watchRegion}
            spotlightPosterPath={providerPreviews.getSpotlightPosterPath(item.providerId)}
            spotlightLoading={providerPreviews.isSpotlightLoading(item.providerId)}
            tileSize={hubTileSize}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    flexShrink: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seeAllLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  providerList: {
    paddingHorizontal: spacing.lg,
    gap: DISCOVER_HUB_RAIL_GAP,
  },
});
