import { getPickSomething } from '@/features/discovery/api/discovery-api';
import { buildPickSomethingPath } from '@/features/discovery/api/routes';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const { api } = jest.requireMock('@/api/client');

describe('pick something api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({ item: null });
  });

  it('builds pick something path with media type and exclusions', () => {
    const path = buildPickSomethingPath('movie', ['id-1', 'id-2']);

    expect(path).toContain('mediaType=movie');
    expect(path).toContain('excludeIds=id-1');
    expect(path).toContain('excludeIds=id-2');
  });

  it('requests pick something from discovery endpoint', async () => {
    await getPickSomething({ mediaType: 'tv', excludeIds: ['abc'] });

    expect(api.get).toHaveBeenCalledWith(
      '/api/discovery/pick-something?mediaType=tv&excludeIds=abc',
      { signal: undefined },
    );
  });
});
