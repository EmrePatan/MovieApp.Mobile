import { createMovieFollow, getMovieFollowStatus } from '@/features/follows/api/movie-follow-api';
import { resolveMovieFollowUpsert } from '@/features/follows/utils/resolve-movie-follow-upsert';

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  createMovieFollow: jest.fn(),
  getMovieFollowStatus: jest.fn(),
}));

describe('resolve-movie-follow-upsert', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns upsert response after a successful follow', async () => {
    (createMovieFollow as jest.Mock).mockResolvedValue({ isFollowing: true });

    await expect(resolveMovieFollowUpsert(movieId)).resolves.toEqual({ isFollowing: true });
    expect(getMovieFollowStatus).not.toHaveBeenCalled();
  });

  it('reconciles follow when upsert fails but server state is already following', async () => {
    (createMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: true });

    await expect(resolveMovieFollowUpsert(movieId)).resolves.toEqual({ isFollowing: true });
  });

  it('rethrows follow errors when server state is still not following', async () => {
    (createMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: false });

    await expect(resolveMovieFollowUpsert(movieId)).rejects.toThrow('Network error');
  });
});
