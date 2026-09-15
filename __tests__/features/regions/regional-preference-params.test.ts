import { parseNowInTheatersParams } from '@/features/discovery/utils/now-in-theaters-params';
import { parseStreamingDiscoverParams } from '@/features/discovery/utils/streaming-discover-params';

describe('regional preference defaults in discovery params', () => {
  it('defaults streaming discover watchRegion to userRegion', () => {
    const state = parseStreamingDiscoverParams({}, 'US');

    expect(state.watchRegion).toBe('US');
  });

  it('keeps explicit streaming discover watchRegion from URL', () => {
    const state = parseStreamingDiscoverParams({ watchRegion: 'GB' }, 'US');

    expect(state.watchRegion).toBe('GB');
  });

  it('defaults now in theaters releaseRegion to userRegion', () => {
    const state = parseNowInTheatersParams({}, 'US');

    expect(state.releaseRegion).toBe('US');
  });

  it('keeps explicit now in theaters releaseRegion from URL', () => {
    const state = parseNowInTheatersParams({ releaseRegion: 'GB' }, 'US');

    expect(state.releaseRegion).toBe('GB');
  });
});
