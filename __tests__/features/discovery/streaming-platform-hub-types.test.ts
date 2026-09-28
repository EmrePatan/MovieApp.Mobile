import {
  getCuratedStreamingHubFallbackProviders,
  resolveDiscoveryWatchProvider,
  resolveStreamingHubRailProviders,
} from '@/features/discovery/streaming-platform-hub-types';

describe('streaming-platform-hub-types', () => {
  it('resolveStreamingHubRailProviders uses curated fallback when API is empty', () => {
    const rail = resolveStreamingHubRailProviders([]);
    expect(rail.length).toBeGreaterThan(0);
    expect(rail[0]?.providerId).toBe(8);
  });

  it('resolveDiscoveryWatchProvider falls back to curated provider metadata', () => {
    const netflix = resolveDiscoveryWatchProvider(8, []);
    expect(netflix?.name).toBe('Netflix');
  });

  it('resolveDiscoveryWatchProvider prefers API catalog entry', () => {
    const netflix = resolveDiscoveryWatchProvider(8, [
      {
        providerId: 8,
        name: 'Netflix TR',
        logoPath: '/netflix.png',
        displayPriority: 1,
      },
    ]);
    expect(netflix?.name).toBe('Netflix TR');
  });

  it('curated fallback includes major global providers', () => {
    const ids = new Set(getCuratedStreamingHubFallbackProviders().map((p) => p.providerId));
    expect(ids.has(8)).toBe(true);
    expect(ids.has(337)).toBe(true);
  });
});
