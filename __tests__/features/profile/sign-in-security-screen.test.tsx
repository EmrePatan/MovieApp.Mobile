import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SignInSecurityScreen from '../../../app/profile/security';
import type { UserProfileResponse } from '@/features/profile/types';
import { requestSocialIdentityToken } from '@/auth/social-auth-service';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSegments: () => ['profile'],
}));

let mockProfileData: UserProfileResponse | undefined;

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: () => ({ data: mockProfileData }),
}));

jest.mock('@/features/details/shared/components/DetailScreenScaffold', () => ({
  DetailBackButton: () => null,
}));

const mockLinkMutateAsync = jest.fn();
const mockUnlinkMutateAsync = jest.fn();

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useLinkExternalLoginMutation: () => ({
    mutateAsync: mockLinkMutateAsync,
    isPending: false,
  }),
  useUnlinkExternalLoginMutation: () => ({
    mutateAsync: mockUnlinkMutateAsync,
    isPending: false,
  }),
}));

function baseProfile(overrides: Partial<UserProfileResponse> = {}): UserProfileResponse {
  return {
    id: '1',
    email: 'user@example.com',
    userName: 'user',
    displayName: 'User',
    createdAt: '2024-01-01T00:00:00Z',
    hasPassword: false,
    linkedProviders: [],
    ...overrides,
  };
}

function renderSecurity(profile: UserProfileResponse) {
  mockProfileData = profile;
  return render(<SignInSecurityScreen />);
}

describe('SignInSecurityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileData = undefined;
    mockLinkMutateAsync.mockResolvedValue({});
    mockUnlinkMutateAsync.mockResolvedValue({});
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('mock-token');
  });

  describe('password only', () => {
    const profile = baseProfile({ hasPassword: true, linkedProviders: [] });

    it('shows change password and connect actions for Google and Apple', () => {
      renderSecurity(profile);
      expect(screen.getByText('Password set')).toBeTruthy();
      expect(screen.getByText('Change password')).toBeTruthy();
      expect(screen.getAllByText('Connect')).toHaveLength(2);
    });

    it('navigates to link-provider with targetProvider only when connecting', async () => {
      renderSecurity(profile);
      fireEvent.press(screen.getAllByText('Connect')[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/profile/link-provider',
          params: { targetProvider: 'google' },
        });
      });
      expect(requestSocialIdentityToken).not.toHaveBeenCalled();
      const params = mockPush.mock.calls[0][0].params as Record<string, string>;
      expect(params).not.toHaveProperty('targetIdentityToken');
    });
  });

  describe('Google only', () => {
    const profile = baseProfile({ linkedProviders: ['google'] });

    it('offers create password and shows Google connected', () => {
      renderSecurity(profile);
      expect(screen.getByText('Not set')).toBeTruthy();
      expect(screen.getByText('Create password')).toBeTruthy();
      expect(screen.getByText('Connected')).toBeTruthy();
      expect(screen.getByText('Connect')).toBeTruthy();
    });

    it('does not unlink Google as the final sign-in method', async () => {
      renderSecurity(profile);
      fireEvent.press(screen.getByText('Disconnect'));
      await waitFor(() => {
        expect(mockUnlinkMutateAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Apple only', () => {
    const profile = baseProfile({ linkedProviders: ['apple'] });

    it('offers create password and Apple connect for Google', () => {
      renderSecurity(profile);
      expect(screen.getByText('Create password')).toBeTruthy();
      expect(screen.getAllByText('Connected')).toHaveLength(1);
      expect(screen.getByText('Connect')).toBeTruthy();
    });

    it('does not unlink Apple as the final sign-in method', async () => {
      renderSecurity(profile);
      fireEvent.press(screen.getByText('Disconnect'));
      await waitFor(() => {
        expect(mockUnlinkMutateAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('password + Google', () => {
    const profile = baseProfile({ hasPassword: true, linkedProviders: ['google'] });

    it('shows change password and disconnectable Google', () => {
      renderSecurity(profile);
      expect(screen.getByText('Change password')).toBeTruthy();
      expect(screen.getByText('Disconnect')).toBeTruthy();
    });

    it('routes password-backed unlink to unlink-provider', async () => {
      renderSecurity(profile);
      fireEvent.press(screen.getByText('Disconnect'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/profile/unlink-provider',
          params: { provider: 'google' },
        });
      });
    });
  });

  describe('Google + Apple without password', () => {
    const profile = baseProfile({ linkedProviders: ['google', 'apple'] });

    it('offers create password and both providers connected', () => {
      renderSecurity(profile);
      expect(screen.getByText('Create password')).toBeTruthy();
      expect(screen.getAllByText('Connected')).toHaveLength(2);
      expect(screen.getAllByText('Disconnect')).toHaveLength(2);
    });

    it('disconnects Google using fresh Apple re-auth', async () => {
      (requestSocialIdentityToken as jest.Mock).mockResolvedValueOnce('apple-reauth-token');

      renderSecurity(profile);
      fireEvent.press(screen.getAllByText('Disconnect')[0]);

      await waitFor(() => {
        expect(requestSocialIdentityToken).toHaveBeenCalledWith('apple');
        expect(requestSocialIdentityToken).not.toHaveBeenCalledWith('google');
        expect(mockUnlinkMutateAsync).toHaveBeenCalledWith({
          provider: 'google',
          reauthProvider: 'apple',
          reauthIdentityToken: 'apple-reauth-token',
        });
      });
    });

    it('disconnects Apple using fresh Google re-auth', async () => {
      (requestSocialIdentityToken as jest.Mock).mockResolvedValueOnce('google-reauth-token');

      renderSecurity(profile);
      fireEvent.press(screen.getAllByText('Disconnect')[1]);

      await waitFor(() => {
        expect(requestSocialIdentityToken).toHaveBeenCalledWith('google');
        expect(requestSocialIdentityToken).not.toHaveBeenCalledWith('apple');
        expect(mockUnlinkMutateAsync).toHaveBeenCalledWith({
          provider: 'apple',
          reauthProvider: 'google',
          reauthIdentityToken: 'google-reauth-token',
        });
      });
    });

    it('does not unlink when remaining-provider re-auth is cancelled', async () => {
      const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
      (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(new SocialAuthCancelledError());

      renderSecurity(profile);
      fireEvent.press(screen.getAllByText('Disconnect')[0]);

      await waitFor(() => {
        expect(requestSocialIdentityToken).toHaveBeenCalledWith('apple');
      });
      expect(mockUnlinkMutateAsync).not.toHaveBeenCalled();
    });

    it('links Apple with target and reauth tokens without routing tokens', async () => {
      (requestSocialIdentityToken as jest.Mock)
        .mockResolvedValueOnce('target-token')
        .mockResolvedValueOnce('reauth-token');

      renderSecurity(baseProfile({ linkedProviders: ['google'] }));
      fireEvent.press(screen.getByText('Connect'));

      await waitFor(() => {
        expect(mockLinkMutateAsync).toHaveBeenCalledWith({
          targetProvider: 'apple',
          targetIdentityToken: 'target-token',
          reauthProvider: 'google',
          reauthIdentityToken: 'reauth-token',
        });
      });
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/profile/link-provider' }),
      );
    });

    it('does not link when user cancels target provider auth', async () => {
      const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
      (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(
        new SocialAuthCancelledError(),
      );

      renderSecurity(baseProfile({ linkedProviders: ['google'] }));
      fireEvent.press(screen.getByText('Connect'));

      await waitFor(() => {
        expect(requestSocialIdentityToken).toHaveBeenCalled();
      });
      expect(mockLinkMutateAsync).not.toHaveBeenCalled();
    });

    it('does not link when Google re-auth is cancelled after Apple target token succeeds', async () => {
      const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
      (requestSocialIdentityToken as jest.Mock)
        .mockResolvedValueOnce('apple-target-token')
        .mockRejectedValueOnce(new SocialAuthCancelledError());

      renderSecurity(baseProfile({ linkedProviders: ['google'] }));
      fireEvent.press(screen.getByText('Connect'));

      await waitFor(() => {
        expect(requestSocialIdentityToken).toHaveBeenNthCalledWith(1, 'apple');
        expect(requestSocialIdentityToken).toHaveBeenNthCalledWith(2, 'google');
      });
      expect(mockLinkMutateAsync).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/profile/link-provider' }),
      );
    });
  });
});
