import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LibraryStackHeader } from '@/features/library/components/LibraryStackHeader';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    dismissTo: jest.fn(),
  }),
  useSegments: jest.fn(() => ['upcoming']),
}));

describe('LibraryStackHeader', () => {
  it('aligns back button with screen edge padding contract', () => {
    render(<LibraryStackHeader title="Coming Up" subtitle="Personalized" />);

    const backButton = screen.getByLabelText('Back');
    expect(backButton).toHaveStyle({
      paddingLeft: 0,
      minHeight: interaction.touchTarget,
      minWidth: interaction.touchTarget,
    });
  });

  it('preserves title and subtitle within the header layout', () => {
    const { toJSON } = render(
      <LibraryStackHeader title="Following" subtitle="Shows you follow" />,
    );

    expect(screen.getByText('Following')).toBeTruthy();
    expect(screen.getByText('Shows you follow')).toBeTruthy();
    expect(JSON.stringify(toJSON())).toContain(`"paddingHorizontal":${layout.screenPaddingHorizontal}`);
  });
});
