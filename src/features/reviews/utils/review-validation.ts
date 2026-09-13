import { MAX_REVIEW_CONTENT_LENGTH } from '../types';
import { getReviewContentLength, hasReviewContent } from './review-content-length';

export interface ReviewFormErrors {
  content?: string;
}

export function validateReviewContent(content: string): ReviewFormErrors {
  const trimmed = content.trim();

  if (!hasReviewContent(trimmed)) {
    return { content: 'Review content is required.' };
  }

  if (getReviewContentLength(trimmed) > MAX_REVIEW_CONTENT_LENGTH) {
    return {
      content: `Review must be at most ${MAX_REVIEW_CONTENT_LENGTH} characters.`,
    };
  }

  return {};
}

export function hasReviewValidationErrors(errors: ReviewFormErrors): boolean {
  return Boolean(errors.content);
}
