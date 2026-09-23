import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewsOwnReviewBar } from '@/features/reviews/components/ReviewsOwnReviewBar';
import type { ReviewResponse } from '@/features/reviews/types';
import { initI18nForTests, t } from '../../i18n/i18n-test-utils';

const ownReview: ReviewResponse = {
  id: 'own-review',
  user: { id: 'me', displayName: 'Jane Doe' },
  content: 'bence çok güzeldiii.',
  createdAt: '2026-01-02T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  userRating: 8,
};

describe('Reviews premium UI', () => {
  beforeEach(async () => {
    await initI18nForTests('en');
  });

  it('renders own-review section with rating, text, and edit action', () => {
    const onEdit = jest.fn();

    render(<ReviewsOwnReviewBar review={ownReview} onEdit={onEdit} />);

    expect(screen.getByTestId('reviews-own-review-bar')).toBeTruthy();
    expect(screen.getByText(t('reviews.yourReview'))).toBeTruthy();
    expect(screen.getByText('4.0')).toBeTruthy();
    expect(screen.getByText('bence çok güzeldiii.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText(t('reviews.editReview')));
    expect(onEdit).toHaveBeenCalled();
  });

  it('uses Turkish localization for review strings', async () => {
    await initI18nForTests('tr');

    render(<ReviewsOwnReviewBar review={ownReview} onEdit={jest.fn()} />);

    expect(screen.getByText(t('reviews.yourReview'))).toBeTruthy();
    expect(screen.getByText(t('reviews.edit'))).toBeTruthy();
  });
});
