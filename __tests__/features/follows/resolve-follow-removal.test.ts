import { getMovieFollowStatus, removeMovieFollow } from '@/features/follows/api/movie-follow-api';
import { getTvShowFollowStatus, removeTvShowFollow } from '@/features/follows/api/follow-api';
import {
  resolveMovieFollowRemoval,
  resolveTvShowFollowRemoval,
} from '@/features/follows/utils/resolve-follow-removal';

jest.mock('@/features/follows/api/follow-api', () => ({
  getTvShowFollowStatus: jest.fn(),
  removeTvShowFollow: jest.fn(),
}));

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  getMovieFollowStatus: jest.fn(),
  removeMovieFollow: jest.fn(),
}));

describe('resolve-follow-removal', () => {
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unfollowed tv status after a successful delete', async () => {
    (removeTvShowFollow as jest.Mock).mockResolvedValue(undefined);

    await expect(resolveTvShowFollowRemoval(tvShowId)).resolves.toEqual({
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: false,
    });
    expect(getTvShowFollowStatus).not.toHaveBeenCalled();
  });

  it('reconciles tv unfollow when delete fails but server state is already unfollowed', async () => {
    (removeTvShowFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getTvShowFollowStatus as jest.Mock).mockResolvedValue({
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });

    await expect(resolveTvShowFollowRemoval(tvShowId)).resolves.toEqual({
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });
  });

  it('polls tv status until unfollowed after delete fails', async () => {
    (removeTvShowFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getTvShowFollowStatus as jest.Mock)
      .mockResolvedValueOnce({
        isFollowing: true,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: true,
      })
      .mockResolvedValueOnce({
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: true,
      });

    await expect(resolveTvShowFollowRemoval(tvShowId)).resolves.toEqual({
      isFollowing: false,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });
    expect(getTvShowFollowStatus).toHaveBeenCalledTimes(2);
  });

  it('rethrows tv unfollow errors when server state stays following', async () => {
    (removeTvShowFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getTvShowFollowStatus as jest.Mock).mockResolvedValue({
      isFollowing: true,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });

    await expect(resolveTvShowFollowRemoval(tvShowId)).rejects.toThrow('Network error');
  });

  it('reconciles movie unfollow when delete fails but server state is already unfollowed', async () => {
    (removeMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: false });

    await expect(resolveMovieFollowRemoval(movieId)).resolves.toEqual({ isFollowing: false });
  });

  it('rethrows movie unfollow errors when server state stays following', async () => {
    (removeMovieFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: true });

    await expect(resolveMovieFollowRemoval(movieId)).rejects.toThrow('Network error');
  });
});
