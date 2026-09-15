import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { interaction } from '@/theme/interaction';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useSegments: jest.fn(() => ['(tabs)', 'movie', '[id]']),
}));

describe('DetailBackButton', () => {
  it('renders an overlay back button with a 44x44 touch target', () => {
    render(<DetailBackButton variant="overlay" topOffset={12} />);

    const button = screen.getByLabelText('Go back');
    expect(button).toHaveStyle({
      width: interaction.touchTarget,
      height: interaction.touchTarget,
      top: 12,
    });
  });

  it('uses zero left inset when rendered inside padded headers', () => {
    render(<DetailBackButton contentInset />);

    const button = screen.getByLabelText('Back');
    expect(button).toHaveStyle({
      paddingLeft: 0,
      minHeight: interaction.touchTarget,
      minWidth: interaction.touchTarget,
    });
  });

  it('keeps standalone horizontal padding when not inset', () => {
    render(<DetailBackButton contentInset={false} />);

    const button = screen.getByLabelText('Back');
    expect(button).toHaveStyle({
      paddingHorizontal: 24,
    });
  });
});
