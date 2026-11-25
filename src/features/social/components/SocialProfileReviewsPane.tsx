import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { MyCommentsContent } from '@/features/reviews/components/MyCommentsContent';
import { buildUserCommentsReturnHref } from '@/features/details/shared/navigation/reviews-detail-navigation';

interface SocialProfileReviewsPaneProps {
  userId: string;
  isSelf: boolean;
  /** Extra header above the reviews list. */
  listHeader?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Same list UI as My Comments — own reviews or another user's public reviews. */
export function SocialProfileReviewsPane({
  userId,
  isSelf,
  listHeader,
  contentContainerStyle,
}: SocialProfileReviewsPaneProps) {
  return (
    <MyCommentsContent
      listHeader={listHeader}
      contentContainerStyle={contentContainerStyle}
      userId={isSelf ? undefined : userId}
      reviewsReturnHref={
        isSelf ? undefined : buildUserCommentsReturnHref(userId)
      }
    />
  );
}
