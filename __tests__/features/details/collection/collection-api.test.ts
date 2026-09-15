import { getCollectionDetails } from '@/features/details/collection/api/collection-api';
import { buildCollectionDetailsPath } from '@/features/details/collection/api/routes';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('collection api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds the collection details path', () => {
    expect(buildCollectionDetailsPath(9485)).toBe('/api/collections/9485');
  });

  it('fetches collection details from the API', async () => {
    const response = {
      tmdbId: 9485,
      name: 'The Dark Knight Collection',
      overview: 'Batman trilogy.',
      posterPath: '/collection.jpg',
      backdropPath: '/backdrop.jpg',
      parts: [],
    };

    (api.get as jest.Mock).mockResolvedValue(response);

    await expect(getCollectionDetails(9485)).resolves.toEqual(response);
    expect(api.get).toHaveBeenCalledWith('/api/collections/9485', {
      authenticated: false,
      signal: undefined,
    });
  });
});
