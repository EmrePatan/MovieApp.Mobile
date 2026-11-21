import { resolveCommentMomentPosterRating } from '@/features/social/utils/resolve-comment-moment-poster-rating';
import type { SocialComment, SocialFeedItem } from '@/features/social/types';

const baseActivity: SocialFeedItem = {
  id: 'act-1',
  actorId: 'user-1',
  userName: 'u',
  displayName: 'U',
  avatarUrl: null,
  activityType: 'ReviewedMovie',
  createdAt: '2026-11-18T12:00:00Z',
  targetContentId: 'm1',
  targetContentType: 'Movie',
  targetTitle: 'Venom',
  targetSubtitle: null,
  posterPath: '/p.jpg',
  ratingScore: 8,
  reviewExcerpt: 'Nice',
  likesCount: 0,
  commentsCount: 1,
  isLikedByMe: false,
};

const baseComment: SocialComment = {
  id: 'c1',
  activityId: 'act-1',
  userId: 'user-1',
  userName: 'u',
  displayName: 'U',
  avatarUrl: null,
  parentCommentId: null,
  content: 'Güzel',
  createdAt: '2026-11-18T12:01:00Z',
  updatedAt: null,
  likesCount: 0,
  repliesCount: 0,
  isLikedByMe: false,
};

describe('resolveCommentMomentPosterRating', () => {
  it('prefers highlightCommentAuthorRatingScore', () => {
    expect(
      resolveCommentMomentPosterRating(
        { ...baseActivity, highlightCommentAuthorRatingScore: 9, ratingScore: 8 },
        baseComment,
      ),
    ).toBe(9);
  });

  it('falls back to activity rating when commenter is the activity author', () => {
    expect(
      resolveCommentMomentPosterRating({ ...baseActivity, highlightCommentAuthorRatingScore: null }, baseComment),
    ).toBe(8);
  });

  it('returns null when commenter has no score', () => {
    expect(
      resolveCommentMomentPosterRating(
        { ...baseActivity, ratingScore: null, highlightCommentAuthorRatingScore: null },
        { ...baseComment, userId: 'user-2' },
      ),
    ).toBeNull();
  });
});