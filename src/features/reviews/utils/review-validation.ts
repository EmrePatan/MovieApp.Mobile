import { MAX_REVIEW_CONTENT_LENGTH } from '../types';

export interface ReviewFormErrors {
  content?: string;
}

export function validateReviewContent(content: string): ReviewFormErrors {
  const trimmed = content.trim();

  if (!trimmed) {
    return { content: 'Review content is required.' };
  }

  if (trimmed.length > MAX_REVIEW_CONTENT_LENGTH) {
    return {
      content: `Review must be at most ${MAX_REVIEW_CONTENT_LENGTH} characters.`,
    };
  }

  return {};
}

export function hasReviewValidationErrors(errors: ReviewFormErrors): boolean {
  return Boolean(errors.content);
}
