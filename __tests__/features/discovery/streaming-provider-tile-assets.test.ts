import {
  getStreamingProviderTileWordmarkSource,
  hasStreamingProviderTileWordmark,
} from '@/features/discovery/streaming-provider-tile-assets';

describe('streaming-provider-tile-assets', () => {
  it('bundles wordmarks for major providers', () => {
    expect(hasStreamingProviderTileWordmark(8)).toBe(true);
    expect(hasStreamingProviderTileWordmark(119)).toBe(true);
    expect(hasStreamingProviderTileWordmark(337)).toBe(true);
    expect(getStreamingProviderTileWordmarkSource(8)).toBeTruthy();
  });

  it('falls back for unknown providers', () => {
    expect(hasStreamingProviderTileWordmark(99999)).toBe(false);
    expect(getStreamingProviderTileWordmarkSource(99999)).toBeNull();
  });
});
