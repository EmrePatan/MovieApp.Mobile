import {
  hasReviewValidationErrors,
  validateReviewContent,
} from '@/features/reviews/utils/review-validation';
import { MAX_REVIEW_CONTENT_LENGTH } from '@/features/reviews/types';

describe('review validation', () => {
  it('requires content', () => {
    const errors = validateReviewContent('   ');
    expect(errors.content).toBe('Review content is required.');
    expect(hasReviewValidationErrors(errors)).toBe(true);
  });

  it('accepts valid content', () => {
    const errors = validateReviewContent('A thoughtful review.');
    expect(errors).toEqual({});
    expect(hasReviewValidationErrors(errors)).toBe(false);
  });

  it('accepts reviews that include emoji alongside text', () => {
    const errors = validateReviewContent('Great movie 🔥 loved it 👍');
    expect(errors).toEqual({});
  });

  it('rejects content over max length', () => {
    const errors = validateReviewContent('a'.repeat(MAX_REVIEW_CONTENT_LENGTH + 1));
    expect(errors.content).toBe(`Review must be at most ${MAX_REVIEW_CONTENT_LENGTH} characters.`);
    expect(hasReviewValidationErrors(errors)).toBe(true);
  });
});
