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

export const WATCH_MONETIZATION_OPTIONS: {
  value: WatchMonetizationType;
  label: string;
}[] = [
  { value: 'stream', label: 'Stream' },
  { value: 'free', label: 'Free' },
  { value: 'ads', label: 'With Ads' },
  { value: 'rent', label: 'Rent' },
  { value: 'buy', label: 'Buy' },
];

export const WATCH_REGION_OPTIONS: {
  code: string;
  label: string;
}[] = [
  { code: 'TR', label: 'Turkey' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
];

export function getWatchRegionLabel(code: string): string {
  return WATCH_REGION_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

export function reconcileWatchProviderSelection(
  selectedIds: number[],
  availableProviders: DiscoveryWatchProvider[],
): number[] {
  const availableIds = new Set(availableProviders.map((provider) => provider.providerId));
  return selectedIds.filter((id) => availableIds.has(id));
}
