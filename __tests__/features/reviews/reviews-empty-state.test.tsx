import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReviewsEmptyState } from '@/features/reviews/components/ReviewsEmptyState';

describe('ReviewsEmptyState', () => {
  it('renders title, message, and action', () => {
    const onAction = jest.fn();

    render(
      <ReviewsEmptyState
        title="No reviews yet"
        message="No one has shared their thoughts on this title yet."
        actionLabel="Write the first review"
        onAction={onAction}
      />,
    );

    expect(screen.getByTestId('reviews-empty-state')).toBeTruthy();
    expect(screen.getByText('No reviews yet')).toBeTruthy();
    expect(screen.getByText('No one has shared their thoughts on this title yet.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('reviews-empty-state-action'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the action when no handler is provided', () => {
    render(
      <ReviewsEmptyState
        title="No other reviews yet"
        message="You are the only one who has reviewed this title so far."
      />,
    );

    expect(screen.queryByTestId('reviews-empty-state-action')).toBeNull();
  });
});
