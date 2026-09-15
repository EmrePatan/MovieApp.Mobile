import { api } from '@/api/client';
import {
  getMovieGallery,
  getPersonGallery,
  getTvShowGallery,
} from '@/features/gallery/api/gallery-api';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('gallery api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests movie gallery path', async () => {
    (api.get as jest.Mock).mockResolvedValue({ backdrops: [], posters: [], logos: [], profiles: [] });

    await getMovieGallery('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

    expect(api.get).toHaveBeenCalledWith(
      '/api/movies/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/images',
      { authenticated: false, signal: undefined },
    );
  });

  it('requests tv gallery path', async () => {
    (api.get as jest.Mock).mockResolvedValue({ backdrops: [], posters: [], logos: [], profiles: [] });

    await getTvShowGallery('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

    expect(api.get).toHaveBeenCalledWith(
      '/api/tvshows/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/images',
      { authenticated: false, signal: undefined },
    );
  });

  it('requests person gallery path', async () => {
    (api.get as jest.Mock).mockResolvedValue({ backdrops: [], posters: [], logos: [], profiles: [] });

    await getPersonGallery(1001);

    expect(api.get).toHaveBeenCalledWith(
      '/api/people/tmdb/1001/images',
      { authenticated: false, signal: undefined },
    );
  });
});
