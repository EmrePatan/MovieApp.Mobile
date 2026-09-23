import { useQuery } from '@tanstack/react-query';
import { getUiFormatLocaleTag } from '@/i18n';
import { translateReview } from '../api/reviews-api';
import { reviewTranslationQueryKey } from './review-query-keys';
import type { ReviewResponse } from '../types';

export function useReviewTranslation(
  review: ReviewResponse,
  enabled: boolean,
) {
  const targetLocale = getUiFormatLocaleTag();

  return useQuery({
    queryKey: reviewTranslationQueryKey(review.id, review.updatedAt, targetLocale),
    queryFn: ({ signal }) => translateReview(review.id, signal),
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
