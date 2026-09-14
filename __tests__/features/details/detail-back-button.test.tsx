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
});
