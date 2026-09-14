import { getPersonDetails } from '@/features/details/person/api/person-api';
import { buildPersonDetailsPath } from '@/features/details/person/api/routes';
import { api } from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('person api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds the person details path', () => {
    expect(buildPersonDetailsPath(1001)).toBe('/api/people/tmdb/1001');
  });

  it('fetches person details from the API', async () => {
    const response = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      tmdbId: 1001,
      name: 'Matthew McConaughey',
      profileImagePath: '/profile.jpg',
      biography: 'Bio',
      birthday: '1969-11-04',
      deathday: null,
      placeOfBirth: 'Texas',
      knownForDepartment: 'Acting',
      filmography: [],
    };

    (api.get as jest.Mock).mockResolvedValue(response);

    await expect(getPersonDetails(1001)).resolves.toEqual(response);
    expect(api.get).toHaveBeenCalledWith('/api/people/tmdb/1001', {
      authenticated: false,
      signal: undefined,
    });
  });
});
