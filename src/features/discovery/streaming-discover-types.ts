import type { AdvancedDiscoverSort } from './advanced-discover-types';
import { DEFAULT_WATCH_PROVIDER_REGION } from '@/features/details/watch-providers/api/watch-providers-api';
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

export function createDefaultStreamingDiscoverState(): StreamingDiscoverState {
  return {
    mediaType: 'movie',
    watchRegion: DEFAULT_WATCH_PROVIDER_REGION,
    watchProviderIds: [],
    watchMonetizationTypes: ['stream'],
    minRating: null,
    sort: 'popularity_desc',
  };
}
