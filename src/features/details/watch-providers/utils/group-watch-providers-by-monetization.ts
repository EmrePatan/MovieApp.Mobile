import type { WatchProvider } from '../types';

export const WATCH_PROVIDER_MONETIZATION_ORDER = [
  'flatrate',
  'free',
  'ads',
  'rent',
  'buy',
] as const;

export type WatchProviderMonetizationType = (typeof WATCH_PROVIDER_MONETIZATION_ORDER)[number];

export interface WatchProviderMonetizationGroup {
  type: WatchProviderMonetizationType;
  providers: WatchProvider[];
}

export function groupWatchProvidersByMonetization(
  providers: WatchProvider[],
): WatchProviderMonetizationGroup[] {
  return WATCH_PROVIDER_MONETIZATION_ORDER.flatMap((type) => {
    const groupedProviders = providers
      .filter((provider) => provider.availabilityTypes.includes(type))
      .sort((left, right) => {
        if (left.displayPriority !== right.displayPriority) {
          return left.displayPriority - right.displayPriority;
        }

        return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
      });

    if (groupedProviders.length === 0) {
      return [];
    }

    return [{ type, providers: groupedProviders }];
  });
}
