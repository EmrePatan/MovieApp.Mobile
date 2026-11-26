import type { DiscoveryWatchProvider } from '@/features/discovery/watch-provider-types';

/**
 * Leaving-soon service ids to TMDB watch provider ids, which carry the logos.
 * Mirrors StreamingPlatformMap on the server.
 */
const TMDB_PROVIDER_IDS: Record<string, readonly number[]> = {
  netflix: [8, 1796],
  prime: [9, 119, 2100],
  disney: [337],
  hbo: [384, 1899],
  hulu: [15],
  apple: [350],
  paramount: [531, 2303, 2304, 2616],
  peacock: [386, 387],
  starz: [43],
  mubi: [11],
  crunchyroll: [283],
  curiosity: [190],
  discovery: [520, 524],
  britbox: [151],
  criterion: [258],
  amc: [526],
  zee5: [232],
};

/** Ids are tried in the listed order, so the main plan's logo wins. */
export function findLeavingPlatformLogoPath(
  serviceId: string,
  providers: readonly DiscoveryWatchProvider[],
): string | null {
  for (const providerId of TMDB_PROVIDER_IDS[serviceId.toLowerCase()] ?? []) {
    const logoPath = providers.find((provider) => provider.providerId === providerId)?.logoPath;

    if (logoPath) {
      return logoPath;
    }
  }

  return null;
}
