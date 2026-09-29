import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LinkProviderScreen from '../../../app/profile/link-provider';
import { requestSocialIdentityToken } from '@/auth/social-auth-service';

const mockReplace = jest.fn();
const mockRouteParams: Record<string, string | undefined> = {
  targetProvider: 'apple',
};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useLocalSearchParams: () => mockRouteParams,
  useSegments: () => ['profile'],
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

const mockMutateAsync = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useLinkExternalLoginMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('LinkProviderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteParams.targetProvider = 'apple';
    delete mockRouteParams.targetIdentityToken;
    mockMutateAsync.mockResolvedValue({});
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('fresh-target-token');
  });

  it('receives targetProvider only in route params, not an identity token', () => {
    render(<LinkProviderScreen />);
    expect(mockRouteParams).toEqual({ targetProvider: 'apple' });
    expect(mockRouteParams).not.toHaveProperty('targetIdentityToken');
  });

  it('requests target identity token on submit and sends password-backed link payload', async () => {
    render(<LinkProviderScreen />);
    fireEvent.changeText(screen.getByLabelText('Current password'), 'secret-pass');
    fireEvent.press(screen.getByText('Link account'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalledWith('apple');
      expect(mockMutateAsync).toHaveBeenCalledWith({
        targetProvider: 'apple',
        targetIdentityToken: 'fresh-target-token',
        currentPassword: 'secret-pass',
      });
      expect(mockReplace).toHaveBeenCalledWith('/profile/security');
    });
  });

  it('does not call link API when social auth is cancelled', async () => {
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(new SocialAuthCancelledError());

    render(<LinkProviderScreen />);
    fireEvent.press(screen.getByText('Link account'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalled();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows configuration errors without calling the link API', async () => {
    const { SocialAuthConfigurationError } = require('@/auth/social-auth-service');
    (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(
      new SocialAuthConfigurationError('Google Sign-In is not configured.'),
    );

    render(<LinkProviderScreen />);
    fireEvent.press(screen.getByText('Link account'));

    await waitFor(() => {
      expect(screen.getByText('Google Sign-In is not configured.')).toBeTruthy();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
