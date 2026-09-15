import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/useAuth';

const mockSocialAuthRequest = jest.fn();
const mockRequestSocialIdentityToken = jest.fn();
const mockSaveAccessToken = jest.fn();

jest.mock('@/auth/auth-api', () => ({
  getCurrentUser: jest.fn(),
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  socialAuthRequest: (...args: unknown[]) => mockSocialAuthRequest(...args),
}));

jest.mock('@/auth/auth-storage', () => ({
  getAccessToken: jest.fn().mockResolvedValue(null),
  saveAccessToken: (...args: unknown[]) => mockSaveAccessToken(...args),
  removeAccessToken: jest.fn(),
}));

jest.mock('@/auth/social-auth-service', () => ({
  requestSocialIdentityToken: (...args: unknown[]) => mockRequestSocialIdentityToken(...args),
}));

function Probe() {
  const { signInWithSocial } = useAuth();

  React.useEffect(() => {
    void signInWithSocial('google');
  }, [signInWithSocial]);

  return <Text>probe</Text>;
}

describe('AuthProvider social sign-in', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestSocialIdentityToken.mockResolvedValue('google-id-token');
    mockSocialAuthRequest.mockResolvedValue({
      accessToken: 'movieapp-jwt',
      expiresAt: '2026-01-01T00:00:00.000Z',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        userName: 'user',
        displayName: 'User',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
  });

  it('stores the MovieApp JWT after a successful social sign-in', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockRequestSocialIdentityToken).toHaveBeenCalledWith('google');
      expect(mockSocialAuthRequest).toHaveBeenCalledWith({
        provider: 'google',
        identityToken: 'google-id-token',
      });
      expect(mockSaveAccessToken).toHaveBeenCalledWith('movieapp-jwt');
    });
  });
});
