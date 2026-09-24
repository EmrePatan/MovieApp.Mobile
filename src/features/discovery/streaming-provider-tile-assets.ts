import type { ImageSourcePropType } from 'react-native';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export interface StreamingProviderTileWordmarkConfig {
  source: ImageSourcePropType;
  width: number;
  height: number;
}

const TILE_WIDTH = layout.posterCarousel.width;

/** Bundled transparent wordmarks — always bottom-docked on the card (poster stays hero). */
const STREAMING_PROVIDER_TILE_WORDMARKS: Partial<
  Record<number, StreamingProviderTileWordmarkConfig>
> = {
  8: {
    source: require('../../../assets/streaming-platforms/netflix.png'),
    width: TILE_WIDTH - spacing.md,
    height: 30,
  },
  119: {
    source: require('../../../assets/streaming-platforms/prime-video.png'),
    width: TILE_WIDTH - spacing.md,
    height: 32,
  },
  337: {
    source: require('../../../assets/streaming-platforms/disney-plus.png'),
    width: TILE_WIDTH - spacing.md,
    height: 34,
  },
  350: {
    source: require('../../../assets/streaming-platforms/apple-tv-plus.png'),
    width: TILE_WIDTH - spacing.lg,
    height: 28,
  },
  1899: {
    source: require('../../../assets/streaming-platforms/max.png'),
    width: TILE_WIDTH - spacing.lg,
    height: 32,
  },
  531: {
    source: require('../../../assets/streaming-platforms/paramount-plus.png'),
    width: TILE_WIDTH - spacing.md,
    height: 30,
  },
  283: {
    source: require('../../../assets/streaming-platforms/crunchyroll.png'),
    width: TILE_WIDTH - spacing.sm,
    height: 26,
  },
};

export function getStreamingProviderTileWordmarkConfig(
  providerId: number,
): StreamingProviderTileWordmarkConfig | null {
  return STREAMING_PROVIDER_TILE_WORDMARKS[providerId] ?? null;
}

export function getStreamingProviderTileWordmarkSource(
  providerId: number,
): ImageSourcePropType | null {
  return getStreamingProviderTileWordmarkConfig(providerId)?.source ?? null;
}

export function hasStreamingProviderTileWordmark(providerId: number): boolean {
  return STREAMING_PROVIDER_TILE_WORDMARKS[providerId] != null;
}
