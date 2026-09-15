import {
  createNowInTheatersHref,
  parseNowInTheatersParams,
  serializeNowInTheatersRoute,
} from '@/features/discovery/utils/now-in-theaters-params';

describe('now-in-theaters-params', () => {
  it('parses release region from route params', () => {
    const state = parseNowInTheatersParams({ releaseRegion: 'us' });

    expect(state.releaseRegion).toBe('US');
  });

  it('serializes release region into stable route params', () => {
    const route = serializeNowInTheatersRoute({ releaseRegion: 'TR' });

    expect(route).toBe('/now-in-theaters?releaseRegion=TR');
  });

  it('creates href with release region override', () => {
    expect(createNowInTheatersHref({ releaseRegion: 'GB' })).toContain('releaseRegion=GB');
  });
});
