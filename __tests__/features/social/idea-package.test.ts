import {
  buildTitleShareMessage,
  describeChatMessagePreview,
  parseChatMessage,
} from '@/features/messages/utils/chat-title-share';
import { groupSocialNotifications } from '@/features/notifications/utils/group-social-notifications';
import { findCommonWatchedTitles } from '@/features/social/utils/find-common-titles';
import {
  describeGroupEpisodeSpan,
  groupRecentWatchHistory,
} from '@/features/watch-history/utils/group-recent-watch-history';
import type { SocialNotificationItem, SocialProfileStatistics } from '@/features/social/types';
import type { RecentWatchHistoryItemResponse } from '@/features/watch-history/types';

function episode(
  episodeNumber: number,
  watchedAt: string,
  tvShowId = 'show-1',
): RecentWatchHistoryItemResponse {
  return {
    type: 'episode',
    movieId: null,
    episodeId: `ep-${tvShowId}-${episodeNumber}`,
    tvShowId,
    title: null,
    tvShowTitle: 'MacGyver',
    seasonNumber: 5,
    episodeNumber,
    episodeTitle: null,
    watchedAt,
  };
}

describe('watch history grouping', () => {
  it('collapses same-day episodes of one show and keeps single episodes plain', () => {
    const rows = groupRecentWatchHistory([
      episode(15, '2026-11-23T20:00:00Z'),
      episode(14, '2026-11-23T19:00:00Z'),
      episode(13, '2026-11-23T18:00:00Z'),
      episode(3, '2026-11-20T18:00:00Z'),
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]!.kind).toBe('show');
    expect(rows[1]!.kind).toBe('single');
    if (rows[0]!.kind === 'show') {
      expect(rows[0]!.episodes).toHaveLength(3);
      expect(describeGroupEpisodeSpan(rows[0]!)).toBe('S5 E13–E15');
    }
  });

  it('does not merge different shows', () => {
    const rows = groupRecentWatchHistory([
      episode(2, '2026-11-23T20:00:00Z', 'a'),
      episode(1, '2026-11-23T19:00:00Z', 'b'),
    ]);
    expect(rows.every((row) => row.kind === 'single')).toBe(true);
  });
});

function notification(id: string, actorId: string, type = 'ActivityLike'): SocialNotificationItem {
  return {
    id,
    notificationType: type,
    actorId,
    userName: actorId,
    displayName: actorId.toUpperCase(),
    avatarUrl: null,
    activityId: 'act-1',
    commentId: null,
    followId: null,
    createdAt: '2026-11-23T10:00:00Z',
    isRead: id !== 'n1',
  };
}

describe('notification grouping', () => {
  it('merges likes on one activity and counts other actors', () => {
    const groups = groupSocialNotifications([
      notification('n1', 'a'),
      notification('n2', 'b'),
      notification('n3', 'c'),
      notification('n4', 'a', 'NewFollower'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]!.otherActorCount).toBe(2);
    expect(groups[0]!.hasUnread).toBe(true);
    expect(groups[0]!.items).toHaveLength(3);
  });
});

describe('common watched titles', () => {
  const stats = (ids: string[]): SocialProfileStatistics => ({
    moviesWatched: 0,
    episodesWatched: 0,
    ratingsCount: 0,
    reviewsCount: 0,
    favoritesCount: 0,
    milestones: [],
    watchedTitles: ids.map((id) => ({ id, title: id, posterPath: null, contentType: 'Movie' })),
  });

  it('returns the intersection in the other persons order', () => {
    const common = findCommonWatchedTitles(stats(['a', 'b', 'c']), stats(['c', 'x', 'a']));
    expect(common.map((item) => item.id)).toEqual(['c', 'a']);
  });

  it('is empty when I have nothing', () => {
    expect(findCommonWatchedTitles(stats([]), stats(['a']))).toEqual([]);
  });
});

describe('chat title share', () => {
  it('round-trips a card with special characters and a note', () => {
    const body = buildTitleShareMessage(
      { contentType: 'tv', id: 'id-1', title: 'Fear~the]Walking Dead', posterPath: '/p.jpg', year: '2015' },
      'izle bence',
    );
    const parsed = parseChatMessage(body);
    expect(parsed.text).toBe('izle bence');
    expect(parsed.share?.title).toBe('Fear~the]Walking Dead');
    expect(parsed.share?.contentType).toBe('tv');
    expect(parsed.share?.year).toBe('2015');
  });

  it('keeps plain messages and previews cards without the raw tag', () => {
    expect(parseChatMessage('selam')).toEqual({ text: 'selam', share: null });
    const body = buildTitleShareMessage({
      contentType: 'movie',
      id: 'm1',
      title: 'Heat',
      posterPath: null,
      year: null,
    });
    expect(describeChatMessagePreview(body, 'Film')).toBe('🎬 Heat');
  });
});
