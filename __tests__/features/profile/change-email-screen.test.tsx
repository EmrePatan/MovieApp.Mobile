import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ChangeEmailScreen from '../../../app/profile/email';
import { requestSocialIdentityToken } from '@/auth/social-auth-service';
import type { UserProfileResponse } from '@/features/profile/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockProfileData: UserProfileResponse | undefined;

const mockRefetch = jest.fn().mockResolvedValue(undefined);

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: () => ({ data: mockProfileData, refetch: mockRefetch, isSuccess: true }),
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

const mockChangeEmail = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useChangeEmailMutation: () => ({
    mutateAsync: mockChangeEmail,
    isPending: false,
  }),
}));

describe('ChangeEmailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue(undefined);
    mockChangeEmail.mockResolvedValue({ message: 'ok' });
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('social-reauth-token');
  });

  it('requires current password for password-backed accounts', async () => {
    mockProfileData = {
      id: '1',
      email: 'user@example.com',
      userName: 'user',
      displayName: 'User',
      createdAt: '2024-01-01T00:00:00Z',
      hasPassword: true,
      linkedProviders: ['google'],
    };

    render(<ChangeEmailScreen />);
    fireEvent.changeText(screen.getByLabelText('New email'), 'new@example.com');
    fireEvent.changeText(screen.getByLabelText('Current password'), 'pass1234');
    fireEvent.press(screen.getByText('Update email'));

    await waitFor(() => {
      expect(mockChangeEmail).toHaveBeenCalledWith({
        email: 'new@example.com',
        currentPassword: 'pass1234',
      });
      expect(requestSocialIdentityToken).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/profile/email-pending');
    });
  });

  it('uses linked provider re-auth for social-only accounts', async () => {
    mockProfileData = {
      id: '1',
      email: 'user@example.com',
      userName: 'user',
      displayName: 'User',
      createdAt: '2024-01-01T00:00:00Z',
      hasPassword: false,
      linkedProviders: ['apple'],
    };

    render(<ChangeEmailScreen />);
    expect(screen.getByText('You will confirm with a linked provider when you submit this change.')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText('New email'), 'new@example.com');
    fireEvent.press(screen.getByText('Update email'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalledWith('apple');
      expect(mockChangeEmail).toHaveBeenCalledWith({
        email: 'new@example.com',
        reauthProvider: 'apple',
        reauthIdentityToken: 'social-reauth-token',
      });
      expect(mockPush).toHaveBeenCalledWith('/profile/email-pending');
    });
  });

  it('does not request email change when social re-auth is cancelled', async () => {
    mockProfileData = {
      id: '1',
      email: 'user@example.com',
      userName: 'user',
      displayName: 'User',
      createdAt: '2024-01-01T00:00:00Z',
      hasPassword: false,
      linkedProviders: ['google'],
    };
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(new SocialAuthCancelledError());

    render(<ChangeEmailScreen />);
    fireEvent.changeText(screen.getByLabelText('New email'), 'new@example.com');
    fireEvent.press(screen.getByText('Update email'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalled();
    });
    expect(mockChangeEmail).not.toHaveBeenCalled();
  });
});
