import { render } from '@testing-library/react-native';
import { PersonalRatingPromptSheet } from '@/features/ratings/components/PersonalRatingPromptSheet';

describe('PersonalRatingPromptSheet', () => {
  it('initializes whole stars from an existing backend score', () => {
    const screen = render(
      <PersonalRatingPromptSheet
        visible
        initialBackendScore={8}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByTestId('whole-star-4')).toBeTruthy();
  });
});
