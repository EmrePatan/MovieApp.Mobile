import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import UnlinkProviderScreen from '../../../app/profile/unlink-provider';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ provider: 'google' }),
  useSegments: () => ['profile'],
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

const mockMutate = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useUnlinkExternalLoginMutation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('UnlinkProviderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });
  });

  it('submits password-backed unlink and returns to security', async () => {
    render(<UnlinkProviderScreen />);
    fireEvent.changeText(screen.getByLabelText('Current password'), 'current-pass');
    fireEvent.press(screen.getByText('Disconnect'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { provider: 'google', currentPassword: 'current-pass' },
        expect.any(Object),
      );
      expect(mockReplace).toHaveBeenCalledWith('/profile/security');
    });
  });
});
