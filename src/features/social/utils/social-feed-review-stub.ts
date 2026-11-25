import type { ReviewResponse } from '@/features/reviews/types';
import type { SocialFeedItem } from '../types';

export function socialFeedItemToReviewStub(item: SocialFeedItem): ReviewResponse | null {
  if (!item.reviewId?.trim() || !item.reviewExcerpt?.trim()) {
    return null;
  }

  return {
    id: item.reviewId,
    user: {
      id: item.actorId,
      displayName: item.displayName,
      effectiveAvatarUrl: item.avatarUrl,
    },
    content: item.reviewExcerpt,
    createdAt: item.createdAt,
    updatedAt: item.reviewUpdatedAt ?? item.createdAt,
    authoringLocale: item.reviewAuthoringLocale ?? null,
  };
}