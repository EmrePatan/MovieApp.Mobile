import { render } from '@testing-library/react-native';
import { PersonalRatingPromptSheet } from '@/features/ratings/components/PersonalRatingPromptSheet';

describe('PersonalRatingPromptSheet', () => {
  it('initializes StarRatingSelector from an existing backend score', () => {
    const screen = render(
      <PersonalRatingPromptSheet
        visible
        initialBackendScore={8}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByTestId('star-rating-selector')).toBeTruthy();
    expect(screen.getByTestId('star-4-full')).toBeTruthy();
  });
});
