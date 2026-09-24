import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
} from '@/features/discovery/streaming-platform-hub-types';
import { useStreamingProviderSpotlight } from '@/features/discovery/hooks/useStreamingProviderSpotlight';
import { createStreamingDiscoverHref } from '@/features/discovery/utils/streaming-discover-params';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';
import { interaction } from '@/theme/interaction';
import {
  StreamingProviderBrandTile,
  type StreamingProviderTileSize,
} from './StreamingProviderBrandTile';

interface StreamingProviderPosterCardProps {
  provider: DiscoveryWatchProvider;
  watchRegion: string;
  queryEnabled?: boolean;
  tileSize?: StreamingProviderTileSize;
}

export function StreamingProviderPosterCard({
  provider,
  watchRegion,
  queryEnabled = true,
  tileSize,
}: StreamingProviderPosterCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const spotlightQuery = useStreamingProviderSpotlight(
    provider.providerId,
    watchRegion,
    DEFAULT_STREAMING_HUB_MEDIA_TYPE,
    queryEnabled,
  );

  const spotlight = spotlightQuery.data?.items?.[0];
  const spotlightPosterPath =
    spotlight && spotlight.type !== 'person' ? spotlight.posterUrl : null;

  const openPlatform = () => {
    router.push(
      createStreamingDiscoverHref(
        {
          watchProviderIds: [provider.providerId],
          watchRegion,
          mediaType: DEFAULT_STREAMING_HUB_MEDIA_TYPE,
          watchMonetizationTypes: ['stream'],
          sort: 'popularity_desc',
        },
        watchRegion,
      ),
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('discover.streamingPlatformsHub.openPlatform', {
        provider: provider.name,
      })}
      onPress={openPlatform}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      testID={`streaming-hub-poster-${provider.providerId}`}
    >
      <StreamingProviderBrandTile
        providerId={provider.providerId}
        name={provider.name}
        logoPath={provider.logoPath}
        spotlightPosterPath={spotlightPosterPath}
        spotlightLoading={spotlightQuery.isLoading}
        tileSize={tileSize}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
