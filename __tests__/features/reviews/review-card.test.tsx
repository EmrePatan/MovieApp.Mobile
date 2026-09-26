import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import type { ReviewResponse } from '@/features/reviews/types';

jest.mock('@/features/reviews/components/ReviewTranslationControls', () => {
  const React = require('react');
  const { Text: NativeText } = require('react-native');

  return {
    ReviewTranslationControls: ({
      review,
      numberOfLines,
    }: {
      review: { content: string };
      numberOfLines?: number;
    }) => React.createElement(NativeText, { numberOfLines }, review.content),
  };
});

const review: ReviewResponse = {
  id: 'review-id',
  user: { id: 'user-id', displayName: 'Jane Doe' },
  content: 'A'.repeat(300),
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const shortReview: ReviewResponse = {
  ...review,
  content: 'A concise and natural short review.',
};

describe('ReviewCard', () => {
  it('renders author, date, and short review content without clamping', () => {
    render(<ReviewCard review={shortReview} />);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText(/edited/)).toBeTruthy();
    expect(screen.getByText(shortReview.content)).toBeTruthy();
    expect(screen.queryByText('Read more')).toBeNull();
  });

  it('collapses long reviews with read more', () => {
    render(<ReviewCard review={review} />);

    expect(screen.getByText('Read more')).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Read more of Jane Doe's review"));
    expect(screen.getByText(review.content)).toBeTruthy();
    expect(screen.getByText('Show less')).toBeTruthy();
  });

  it('marks own review with a You badge', () => {
    render(<ReviewCard review={shortReview} isOwnReview />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('You')).toBeTruthy();
  });

  it('shows edit and delete actions in the top-right for own review', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ReviewCard
        review={shortReview}
        isOwnReview
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    fireEvent.press(screen.getByLabelText('Edit review'));
    fireEvent.press(screen.getByLabelText('Delete'));

    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
