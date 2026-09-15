import type { AdvancedDiscoverSort } from './advanced-discover-types';
import { FALLBACK_USER_REGION } from '@/features/regions/region-options';
import type { WatchMonetizationType } from './watch-provider-types';

export type StreamingDiscoverMediaType = 'movie' | 'tv';

export interface StreamingDiscoverState {
  mediaType: StreamingDiscoverMediaType;
  watchRegion: string;
  watchProviderIds: number[];
  watchMonetizationTypes: WatchMonetizationType[];
  minRating: number | null;
  sort: AdvancedDiscoverSort | null;
}

export function createDefaultStreamingDiscoverState(
  watchRegion: string = FALLBACK_USER_REGION,
): StreamingDiscoverState {
  return {
    mediaType: 'movie',
    watchRegion,
    watchProviderIds: [],
    watchMonetizationTypes: ['stream'],
    minRating: null,
    sort: 'popularity_desc',
  };
}
