import { render, screen, fireEvent } from '@testing-library/react-native';
import { ReviewComposer } from '@/features/reviews/components/ReviewComposer';
import { MAX_REVIEW_CONTENT_LENGTH } from '@/features/reviews/types';

describe('ReviewComposer', () => {
  it('shows character counter', () => {
    render(
      <ReviewComposer submitLabel="Post review" onSubmit={jest.fn()} initialContent="Hello" />,
    );

    expect(screen.getByText(`5/${MAX_REVIEW_CONTENT_LENGTH}`)).toBeTruthy();
  });

  it('validates empty content', () => {
    const onSubmit = jest.fn();
    render(<ReviewComposer submitLabel="Post review" onSubmit={onSubmit} />);

    fireEvent.press(screen.getByText('Post review'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Review content is required.')).toBeTruthy();
  });

  it('submits trimmed content', () => {
    const onSubmit = jest.fn();
    render(<ReviewComposer submitLabel="Post review" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByLabelText('Review'), '  Great movie.  ');
    fireEvent.press(screen.getByText('Post review'));

    expect(onSubmit).toHaveBeenCalledWith('Great movie.');
  });

  it('shows server error and cancel action', () => {
    const onCancel = jest.fn();
    render(
      <ReviewComposer
        submitLabel="Save review"
        onSubmit={jest.fn()}
        onCancel={onCancel}
        errorMessage="Could not save review."
      />,
    );

    expect(screen.getByText('Could not save review.')).toBeTruthy();
    fireEvent.press(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
