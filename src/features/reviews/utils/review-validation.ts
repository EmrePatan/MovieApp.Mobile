import { i18n } from '@/i18n';
import { MAX_REVIEW_CONTENT_LENGTH } from '../types';
import { getReviewContentLength, hasReviewContent } from './review-content-length';

export interface ReviewFormErrors {
  content?: string;
}

export function validateReviewContent(content: string): ReviewFormErrors {
  const trimmed = content.trim();

  if (!hasReviewContent(trimmed)) {
    return { content: i18n.t('reviews.validation.contentRequired') };
  }

  if (getReviewContentLength(trimmed) > MAX_REVIEW_CONTENT_LENGTH) {
    return {
      content: i18n.t('reviews.validation.contentTooLong', {
        max: MAX_REVIEW_CONTENT_LENGTH,
      }),
    };
  }

  return {};
}

export function hasReviewValidationErrors(errors: ReviewFormErrors): boolean {
  return Boolean(errors.content);
}
