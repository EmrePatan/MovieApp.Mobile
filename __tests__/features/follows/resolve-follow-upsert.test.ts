import { getTvShowFollowStatus, upsertTvShowFollow } from '@/features/follows/api/follow-api';
import { resolveTvShowFollowUpsert } from '@/features/follows/utils/resolve-follow-upsert';

jest.mock('@/features/follows/api/follow-api', () => ({
  getTvShowFollowStatus: jest.fn(),
  upsertTvShowFollow: jest.fn(),
}));

describe('resolve-follow-upsert', () => {
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns upsert response after a successful update', async () => {
    const response = {
      isFollowing: true,
      notifyNewSeasons: true,
      notifyNewEpisodes: false,
      baselineEstablished: true,
    };
    (upsertTvShowFollow as jest.Mock).mockResolvedValue(response);

    await expect(
      resolveTvShowFollowUpsert(tvShowId, {
        notifyNewSeasons: true,
        notifyNewEpisodes: false,
      }),
    ).resolves.toEqual(response);
    expect(getTvShowFollowStatus).not.toHaveBeenCalled();
  });

  it('reconciles update when upsert fails but server state already matches', async () => {
    (upsertTvShowFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getTvShowFollowStatus as jest.Mock).mockResolvedValue({
      isFollowing: true,
      notifyNewSeasons: false,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });

    await expect(
      resolveTvShowFollowUpsert(tvShowId, {
        notifyNewSeasons: false,
        notifyNewEpisodes: true,
      }),
    ).resolves.toEqual({
      isFollowing: true,
      notifyNewSeasons: false,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });
  });

  it('rethrows update errors when server state still differs', async () => {
    (upsertTvShowFollow as jest.Mock).mockRejectedValue(new Error('Network error'));
    (getTvShowFollowStatus as jest.Mock).mockResolvedValue({
      isFollowing: true,
      notifyNewSeasons: true,
      notifyNewEpisodes: true,
      baselineEstablished: true,
    });

    await expect(
      resolveTvShowFollowUpsert(tvShowId, {
        notifyNewSeasons: false,
        notifyNewEpisodes: true,
      }),
    ).rejects.toThrow('Network error');
  });
});
