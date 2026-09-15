import { setDiscoveryRouteParams } from '@/features/navigation/discovery-route-params';

describe('setDiscoveryRouteParams', () => {
  it('sets serialized params and clears omitted keys', () => {
    const setParams = jest.fn();

    setDiscoveryRouteParams(
      { setParams },
      { mediaType: 'tv', watchRegion: 'US', watchProviderId: '8' },
      ['mediaType', 'watchRegion', 'watchProviderId', 'sort'],
    );

    expect(setParams).toHaveBeenCalledWith({
      mediaType: 'tv',
      watchRegion: 'US',
      watchProviderId: '8',
      sort: undefined,
    });
  });
});
