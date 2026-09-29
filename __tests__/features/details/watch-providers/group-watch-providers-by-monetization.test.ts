import { groupWatchProvidersByMonetization } from '@/features/details/watch-providers/utils/group-watch-providers-by-monetization';
import type { WatchProvider } from '@/features/details/watch-providers/types';

function provider(
  providerId: number,
  name: string,
  availabilityTypes: string[],
  displayPriority = providerId,
): WatchProvider {
  return {
    providerId,
    name,
    logoPath: null,
    displayPriority,
    availabilityTypes,
    link: null,
  };
}

describe('groupWatchProvidersByMonetization', () => {
  it('places providers with rent and buy in both groups', () => {
    const providers = [provider(2, 'Apple TV', ['rent', 'buy'])];

    const groups = groupWatchProvidersByMonetization(providers);

    expect(groups.map((group) => group.type)).toEqual(['rent', 'buy']);
    expect(groups[0]?.providers).toHaveLength(1);
    expect(groups[1]?.providers).toHaveLength(1);
    expect(groups[0]?.providers[0]?.providerId).toBe(2);
    expect(groups[1]?.providers[0]?.providerId).toBe(2);
  });

  it('omits empty monetization groups', () => {
    const providers = [provider(8, 'Netflix', ['flatrate'])];

    const groups = groupWatchProvidersByMonetization(providers);

    expect(groups).toEqual([
      {
        type: 'flatrate',
        providers: [providers[0]],
      },
    ]);
  });
});
