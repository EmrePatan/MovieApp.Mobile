import { TextInput } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ReviewComposer } from '@/features/reviews/components/ReviewComposer';
import { MAX_REVIEW_CONTENT_LENGTH } from '@/features/reviews/types';

describe('ReviewComposer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows character counter', () => {
    render(
      <ReviewComposer submitLabel="Post review" onSubmit={jest.fn()} initialContent="Hello" />,
    );

    expect(screen.getByText(`5/${MAX_REVIEW_CONTENT_LENGTH}`)).toBeTruthy();
  });

  it('counts emoji as a single character in the counter', () => {
    render(
      <ReviewComposer
        submitLabel="Post review"
        onSubmit={jest.fn()}
        initialContent="Great 🔥"
      />,
    );

    expect(screen.getByText(`7/${MAX_REVIEW_CONTENT_LENGTH}`)).toBeTruthy();
  });

  it('submits reviews that include emoji alongside text', () => {
    const onSubmit = jest.fn();
    render(<ReviewComposer submitLabel="Post review" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByLabelText('Review'), 'Loved it 🔥');
    fireEvent.press(screen.getByText('Post review'));

    expect(onSubmit).toHaveBeenCalledWith('Loved it 🔥');
  });

  it('keeps submit disabled until content is entered', () => {
    const onSubmit = jest.fn();
    render(<ReviewComposer submitLabel="Post review" onSubmit={onSubmit} />);

    const submitButton = screen.getByLabelText('Post review');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(submitButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed content', () => {
    const onSubmit = jest.fn();
    render(<ReviewComposer submitLabel="Post review" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByLabelText('Review'), '  Great movie.  ');
    fireEvent.press(screen.getByText('Post review'));

    expect(onSubmit).toHaveBeenCalledWith('Great movie.');
  });

  it('auto focuses the input when requested', () => {
    const focusSpy = jest.spyOn(TextInput.prototype, 'focus').mockImplementation(jest.fn());
    render(<ReviewComposer submitLabel="Post review" onSubmit={jest.fn()} autoFocus />);

    jest.advanceTimersByTime(280);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  it('renders elevated composer shell', () => {
    render(<ReviewComposer submitLabel="Post review" onSubmit={jest.fn()} />);
    expect(screen.getByTestId('review-composer')).toBeTruthy();
    expect(screen.getByText('Write review')).toBeTruthy();
  });

  it('shows server error and closes via header action', () => {
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
    fireEvent.press(screen.getByLabelText('Close composer'));
    expect(onCancel).toHaveBeenCalled();
  });
});
