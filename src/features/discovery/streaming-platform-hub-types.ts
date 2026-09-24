import type { AdvancedDiscoverMediaType } from './advanced-discover-types';
import type { DiscoveryWatchProvider } from './watch-provider-types';

export const STREAMING_HUB_MAX_PROVIDERS = 8;
export const STREAMING_HUB_PREVIEW_SIZE = 12;
export const STREAMING_HUB_SPOTLIGHT_SIZE = 1;
export const DEFAULT_STREAMING_HUB_MEDIA_TYPE: AdvancedDiscoverMediaType = 'movie';

/** Refresh hub previews during the week without hammering TMDB on every visit. */
export const STREAMING_HUB_WEEKLY_STALE_MS = 12 * 60 * 60 * 1000;

/**
 * Global popularity head — Netflix, Prime, Disney+ first, then other majors.
 * Remaining providers follow regional `displayPriority` from the API.
 */
export const STREAMING_GLOBAL_POPULARITY_ORDER: readonly number[] = [
  8, // Netflix
  119, // Amazon Prime Video
  337, // Disney+
  350, // Apple TV+
  1899, // Max
  531, // Paramount+
  283, // Crunchyroll
  384, // HBO / related
  2, // Apple TV (legacy id in some regions)
];

function curatedPopularityRank(providerId: number): number {
  const index = STREAMING_GLOBAL_POPULARITY_ORDER.indexOf(providerId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function sortStreamingHubProviders(
  providers: DiscoveryWatchProvider[],
): DiscoveryWatchProvider[] {
  return [...providers].sort((a, b) => {
    const curatedA = curatedPopularityRank(a.providerId);
    const curatedB = curatedPopularityRank(b.providerId);
    if (curatedA !== curatedB) {
      return curatedA - curatedB;
    }
    if (a.displayPriority !== b.displayPriority) {
      return a.displayPriority - b.displayPriority;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function pickStreamingHubProviders(
  providers: DiscoveryWatchProvider[],
): DiscoveryWatchProvider[] {
  return sortStreamingHubProviders(providers).slice(0, STREAMING_HUB_MAX_PROVIDERS);
}

export function listAllStreamingHubProviders(
  providers: DiscoveryWatchProvider[],
): DiscoveryWatchProvider[] {
  return sortStreamingHubProviders(providers);
}
