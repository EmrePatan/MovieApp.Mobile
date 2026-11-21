import type { SocialFeedItem } from '@/features/social/types';
import { buildSocialFeedTimeline } from '@/features/social/utils/social-feed-presentation';

function feedItem(overrides: Partial<SocialFeedItem> & Pick<SocialFeedItem, 'id'>): SocialFeedItem {
  return {
    id: overrides.id,
    actorId: 'actor-1',
    userName: 'user',
    displayName: 'User',
    avatarUrl: null,
    activityType: 'WatchedMovie',
    createdAt: overrides.createdAt ?? '2026-11-18T12:00:00Z',
    targetContentId: 'movie-1',
    targetContentType: 'Movie',
    targetTitle: 'Test Movie',
    targetSubtitle: null,
    posterPath: null,
    ratingScore: null,
    reviewExcerpt: null,
    reviewId: null,
    reviewAuthoringLocale: null,
    reviewUpdatedAt: null,
    likesCount: 0,
    commentsCount: 1,
    isLikedByMe: false,
    catalogNavigationId: null,
    catalogNavigationType: null,
    highlightComment: overrides.highlightComment ?? null,
    highlightCommentParentContent: null,
    ...overrides,
  };
}

describe('buildSocialFeedTimeline', () => {
  it('keeps the review when it has a root comment highlight', () => {
    const activityId = 'activity-a';
    const items = [
      feedItem({
        id: activityId,
        activityType: 'ReviewedMovie',
        reviewExcerpt: 'My review',
        createdAt: '2026-11-18T10:00:00Z',
        commentsCount: 1,
        highlightComment: {
          id: 'comment-1',
          activityId,
          userId: 'user-2',
          userName: 'other',
          displayName: 'Other',
          avatarUrl: null,
          content: 'Nice',
          createdAt: '2026-11-18T11:00:00Z',
          likesCount: 0,
          repliesCount: 0,
          isLikedByMe: false,
          parentCommentId: null,
        },
      }),
    ];

    const rows = buildSocialFeedTimeline(items);
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('activity');
    if (rows[0].kind === 'activity') {
      expect(rows[0].item.id).toBe(activityId);
      expect(rows[0].presentation).toBe('review');
    }
  });

  it('does not promote nested comment replies into the feed', () => {
    const activityId = 'activity-reply';
    const items = [
      feedItem({
        id: activityId,
        activityType: 'ReviewedMovie',
        reviewExcerpt: 'My review',
        highlightComment: {
          id: 'reply-1',
          activityId,
          userId: 'user-2',
          userName: 'other',
          displayName: 'Other',
          avatarUrl: null,
          content: 'Agreed',
          createdAt: '2026-11-18T12:00:00Z',
          likesCount: 0,
          repliesCount: 0,
          isLikedByMe: false,
          parentCommentId: 'parent-comment',
        },
      }),
    ];

    const rows = buildSocialFeedTimeline(items);
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('activity');
  });

  it('drops watch, rate, and favorite activities from the timeline', () => {
    const items = [
      feedItem({ id: 'watch', activityType: 'WatchedMovie' }),
      feedItem({ id: 'rate', activityType: 'RatedMovie', ratingScore: 8 }),
      feedItem({ id: 'fav', activityType: 'FavoritedMovie' }),
    ];

    expect(buildSocialFeedTimeline(items)).toHaveLength(0);
  });

  it('keeps review activities with excerpt', () => {
    const items = [
      feedItem({
        id: 'review',
        activityType: 'ReviewedMovie',
        reviewExcerpt: 'Great film',
        reviewId: 'rev-1',
        ratingScore: 9,
      }),
    ];

    const rows = buildSocialFeedTimeline(items);
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('activity');
    if (rows[0].kind === 'activity') {
      expect(rows[0].presentation).toBe('review');
    }
  });
});
