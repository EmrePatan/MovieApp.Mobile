import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import type { ReviewResponse } from '@/features/reviews/types';

const review: ReviewResponse = {
  id: 'review-id',
  user: { id: 'user-id', displayName: 'Jane Doe' },
  content: 'A'.repeat(300),
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('ReviewCard', () => {
  it('renders author, date, and content', () => {
    render(<ReviewCard review={review} />);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText(/edited/)).toBeTruthy();
    expect(screen.getByText(review.content)).toBeTruthy();
  });

  it('marks own review with a You badge', () => {
    render(<ReviewCard review={review} isOwnReview />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('You')).toBeTruthy();
  });

  it('shows edit and delete actions in the top-right for own review', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ReviewCard
        review={review}
        isOwnReview
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    fireEvent.press(screen.getByLabelText('Edit review'));
    fireEvent.press(screen.getByLabelText('Delete review'));

    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
