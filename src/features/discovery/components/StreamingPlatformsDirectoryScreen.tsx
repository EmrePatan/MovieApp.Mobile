import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { JustWatchAttribution } from '@/features/discovery/components/JustWatchAttribution';
import { StreamingProviderPosterCard } from '@/features/discovery/components/StreamingProviderPosterCard';
import { useDiscoveryWatchProviders } from '@/features/discovery/hooks/useDiscoveryWatchProviders';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  listAllStreamingHubProviders,
} from '@/features/discovery/streaming-platform-hub-types';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const GRID_COLUMNS = 3;
const GRID_GAP = spacing.md;

export function StreamingPlatformsDirectoryScreen() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const { region: watchRegion, isHydrated } = useRegionalPreference();
  const providersQuery = useDiscoveryWatchProviders(
    DEFAULT_STREAMING_HUB_MEDIA_TYPE,
    watchRegion,
    isHydrated,
  );

  const providers = useMemo(
    () => listAllStreamingHubProviders(providersQuery.data?.providers ?? []),
    [providersQuery.data?.providers],
  );

  const gridLayout = useMemo(() => {
    const contentWidth = Math.min(windowWidth, layout.maxContentWidth);
    const horizontalPadding = layout.screenPaddingHorizontal;
    const innerWidth = contentWidth - horizontalPadding * 2;
    const tileWidth = (innerWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
    const tileHeight = tileWidth / layout.posterAspectRatio;

    return {
      contentWidth,
      tileWidth,
      tileHeight,
    };
  }, [windowWidth]);

  const tileSize = useMemo(
    () => ({ width: gridLayout.tileWidth, height: gridLayout.tileHeight }),
    [gridLayout.tileHeight, gridLayout.tileWidth],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('discover.streamingPlatformsHub.directoryTitle')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('discover.streamingPlatformsHub.directorySubtitle')}
        </AppText>
      </View>
    ),
    [t],
  );

  const renderItem = useCallback(
    ({ item }: { item: DiscoveryWatchProvider }) => (
      <StreamingProviderPosterCard
        provider={item}
        watchRegion={watchRegion}
        queryEnabled={isHydrated}
        tileSize={tileSize}
      />
    ),
    [isHydrated, tileSize, watchRegion],
  );

  const listFooter = useMemo(
    () => (
      <View style={styles.footer}>
        <JustWatchAttribution testID="streaming-directory-justwatch" />
      </View>
    ),
    [],
  );

  return (
    <StackListScreen
      testID="streaming-platforms-directory"
      topBar={
        <View style={styles.topBar}>
          <DetailBackButton />
        </View>
      }
    >
      {providersQuery.isLoading && providers.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={providers}
          key={gridLayout.tileWidth}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => String(item.providerId)}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: gridLayout.contentWidth, alignSelf: 'center', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </StackListScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  footer: {
    paddingTop: spacing.lg,
    alignItems: 'flex-end',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
