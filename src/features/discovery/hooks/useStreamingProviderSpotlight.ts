import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import {
  DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  STREAMING_HUB_SPOTLIGHT_SIZE,
} from '../streaming-platform-hub-types';
import { useStreamingProviderPreview } from './useStreamingProviderPreview';

export function useStreamingProviderSpotlight(
  providerId: number,
  watchRegion: string,
  mediaType: AdvancedDiscoverMediaType = DEFAULT_STREAMING_HUB_MEDIA_TYPE,
  queryEnabled = true,
) {
  return useStreamingProviderPreview(
    providerId,
    watchRegion,
    mediaType,
    queryEnabled,
    STREAMING_HUB_SPOTLIGHT_SIZE,
  );
}
