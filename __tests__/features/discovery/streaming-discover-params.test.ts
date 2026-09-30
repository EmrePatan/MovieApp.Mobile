import {
  parseStreamingDiscoverParams,
  serializeStreamingDiscoverParams,
} from '@/features/discovery/utils/streaming-discover-params';
import { createDefaultStreamingDiscoverState } from '@/features/discovery/streaming-discover-types';

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
      ...createDefaultStreamingDiscoverState('TR'),
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

  it('round-trips catalog user filters without treating provider as filter payload only', () => {
    const state = parseStreamingDiscoverParams({
      mediaType: 'movie',
      watchRegion: 'US',
      watchProviderId: '8',
      genres: 'g1',
      yearFrom: '2020',
      yearTo: '2029',
      language: 'en',
      originCountry: 'US',
      keywords: 'kw-1',
      sort: 'newest',
    });

    expect(state.genreIds).toEqual(['g1']);
    expect(state.yearFrom).toBe(2020);
    expect(state.yearTo).toBe(2029);
    expect(state.originalLanguage).toBe('en');
    expect(state.originCountry).toBe('US');
    expect(state.keywordIds).toEqual(['kw-1']);
    expect(state.sort).toBe('newest');
  });
});
