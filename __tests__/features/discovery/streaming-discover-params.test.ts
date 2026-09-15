import {
  parseStreamingDiscoverParams,
  serializeStreamingDiscoverParams,
} from '@/features/discovery/utils/streaming-discover-params';

describe('streaming-discover-params', () => {
  it('parses watch region, providers, and monetization types', () => {
    const state = parseStreamingDiscoverParams({
      mediaType: 'tv',
      watchRegion: 'tr',
      watchProviderId: '8,337',
      watchMonetizationType: 'stream,rent',
      minRating: '7',
    });

    expect(state.mediaType).toBe('tv');
    expect(state.watchRegion).toBe('TR');
    expect(state.watchProviderIds).toEqual([8, 337]);
    expect(state.watchMonetizationTypes).toEqual(['stream', 'rent']);
    expect(state.minRating).toBe(7);
  });

  it('serializes streaming discover state into stable query params', () => {
    const params = serializeStreamingDiscoverParams({
      mediaType: 'movie',
      watchRegion: 'TR',
      watchProviderIds: [8, 337],
      watchMonetizationTypes: ['stream'],
      minRating: null,
      sort: 'rating_desc',
    });

    expect(params).toEqual({
      mediaType: 'movie',
      watchRegion: 'TR',
      watchProviderId: '8,337',
      watchMonetizationType: 'stream',
      sort: 'rating_desc',
    });
  });
});
