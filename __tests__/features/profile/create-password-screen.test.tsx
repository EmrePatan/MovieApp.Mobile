import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import CreatePasswordScreen from '../../../app/profile/create-password';
import { requestSocialIdentityToken } from '@/auth/social-auth-service';
import type { UserProfileResponse } from '@/features/profile/types';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

let mockProfileData: UserProfileResponse | undefined;

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: () => ({ data: mockProfileData }),
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

const mockCreatePassword = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useCreatePasswordMutation: () => ({
    mutateAsync: mockCreatePassword,
    isPending: false,
  }),
}));

describe('CreatePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileData = {
      id: '1',
      email: 'user@example.com',
      userName: 'user',
      displayName: 'User',
      createdAt: '2024-01-01T00:00:00Z',
      hasPassword: false,
      linkedProviders: ['google'],
    };
    mockCreatePassword.mockResolvedValue({});
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('reauth-token');
  });

  it('re-authenticates with a linked provider and calls create-password API', async () => {
    render(<CreatePasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'newpassword1');
    fireEvent.changeText(screen.getByLabelText('Confirm new password'), 'newpassword1');
    fireEvent.press(screen.getByText('Create password'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalledWith('google');
      expect(mockCreatePassword).toHaveBeenCalledWith({
        newPassword: 'newpassword1',
        provider: 'google',
        identityToken: 'reauth-token',
      });
      expect(mockReplace).toHaveBeenCalledWith('/profile/security');
    });
  });

  it('does not call API when social auth is cancelled', async () => {
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(new SocialAuthCancelledError());

    render(<CreatePasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'newpassword1');
    fireEvent.changeText(screen.getByLabelText('Confirm new password'), 'newpassword1');
    fireEvent.press(screen.getByText('Create password'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalled();
    });
    expect(mockCreatePassword).not.toHaveBeenCalled();
  });
});
