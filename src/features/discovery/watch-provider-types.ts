export type WatchMonetizationType = 'stream' | 'free' | 'ads' | 'rent' | 'buy';

export interface DiscoveryWatchProvider {
  providerId: number;
  name: string;
  logoPath: string | null;
  displayPriority: number;
}

export interface DiscoveryWatchProvidersResponse {
  watchRegion: string;
  mediaType: 'movie' | 'tv';
  providers: DiscoveryWatchProvider[];
}

export const WATCH_MONETIZATION_OPTIONS: WatchMonetizationType[] = [
  'stream',
  'free',
  'ads',
  'rent',
  'buy',
];

import {
  DEFAULT_RELEASE_REGION,
  getRegionLabel,
  REGION_OPTIONS,
} from '@/features/regions/region-options';

export const WATCH_REGION_OPTIONS = REGION_OPTIONS;

export const DEFAULT_WATCH_PROVIDER_REGION = DEFAULT_RELEASE_REGION;

export function getWatchRegionLabel(code: string): string {
  return getRegionLabel(code);
}

export function reconcileWatchProviderSelection(
  selectedIds: number[],
  availableProviders: DiscoveryWatchProvider[],
): number[] {
  const availableIds = new Set(availableProviders.map((provider) => provider.providerId));
  return selectedIds.filter((id) => availableIds.has(id));
}
