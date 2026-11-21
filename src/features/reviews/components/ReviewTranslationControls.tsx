import { useMemo, useState } from 'react';
import { getUiFormatLocaleTag } from '@/i18n';
import { useReviewTranslation } from '../hooks/useReviewTranslation';
import type { ReviewResponse } from '../types';
import { shouldShowReviewTranslationAction } from '../utils/review-locale';
import { ContentTranslationControls } from './ContentTranslationControls';

interface ReviewTranslationControlsProps {
  review: ReviewResponse;
  numberOfLines?: number;
  textVariant?: 'body' | 'bodySmall' | 'caption';
}

export function ReviewTranslationControls({
  review,
  numberOfLines,
  textVariant = 'bodySmall',
}: ReviewTranslationControlsProps) {
  const currentContentLocale = getUiFormatLocaleTag();
  const [requestTranslation, setRequestTranslation] = useState(false);

  const shouldShowAction = useMemo(
    () => shouldShowReviewTranslationAction(review.authoringLocale, currentContentLocale),
    [currentContentLocale, review.authoringLocale],
  );

  const translationQuery = useReviewTranslation(review, requestTranslation && shouldShowAction);

  return (
    <ContentTranslationControls
      content={review.content}
      authoringLocale={review.authoringLocale}
      textVariant={textVariant}
      numberOfLines={numberOfLines}
      translationQuery={translationQuery}
      fetchTranslation={() => setRequestTranslation(true)}
    />
  );
}