import type { SocialComment, SocialFeedItem } from '../types';

/** Puan: önce yorum sahibinin katalog puanı; yoksa kendi incelemesine yorumda aktivite puanı. */
export function resolveCommentMomentPosterRating(
  activity: SocialFeedItem,
  comment: SocialComment,
): number | null {
  if (
    activity.highlightCommentAuthorRatingScore !== null &&
    activity.highlightCommentAuthorRatingScore !== undefined
  ) {
    return activity.highlightCommentAuthorRatingScore;
  }

  if (comment.userId === activity.actorId && activity.ratingScore !== null && activity.ratingScore !== undefined) {
    return activity.ratingScore;
  }

  return null;
}