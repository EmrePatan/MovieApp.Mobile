import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
} from '@/features/discovery/streaming-platform-hub-types';
import { createStreamingDiscoverHref } from '@/features/discovery/utils/streaming-discover-params';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';
import { interaction } from '@/theme/interaction';
import {
  StreamingProviderBrandTile,
  type StreamingProviderTileSize,
} from './StreamingProviderBrandTile';

interface StreamingProviderPosterCardProps {
  provider: DiscoveryWatchProvider;
  watchRegion: string;
  spotlightPosterPath?: string | null;
  spotlightLoading?: boolean;
  tileSize?: StreamingProviderTileSize;
}

export function StreamingProviderPosterCard({
  provider,
  watchRegion,
  spotlightPosterPath = null,
  spotlightLoading = false,
  tileSize,
}: StreamingProviderPosterCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const openPlatform = () => {
    openLibraryStackScreen(
      router,
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
      '/discover',
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
        spotlightLoading={spotlightLoading}
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
