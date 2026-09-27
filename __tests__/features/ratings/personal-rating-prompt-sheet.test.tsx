import { fireEvent, render } from '@testing-library/react-native';
import { PersonalRatingPromptSheet } from '@/features/ratings/components/PersonalRatingPromptSheet';

describe('PersonalRatingPromptSheet', () => {
  it('initializes StarRatingSelector from an existing backend score', () => {
    const screen = render(
      <PersonalRatingPromptSheet
        visible
        sessionKey={1}
        initialBackendScore={8}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByTestId('star-rating-selector')).toBeTruthy();
    expect(screen.getByTestId('star-4-full')).toBeTruthy();
  });

  it('shows Not now until a star rating is committed, then Save submits', () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn();

    const screen = render(
      <PersonalRatingPromptSheet
        visible
        sessionKey={1}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByTestId('personal-rating-not-now')).toBeTruthy();

    fireEvent(screen.getByTestId('star-rating-selector'), 'onCommit', 4);

    expect(screen.getByTestId('personal-rating-save')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('personal-rating-save'));

    expect(onSubmit).toHaveBeenCalledWith(8);
    expect(onClose).not.toHaveBeenCalled();
  });
});
