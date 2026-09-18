import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SocialAuthSection } from '@/features/auth/components/SocialAuthSection';

const mockSignInWithSocial = jest.fn();

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    signInWithSocial: mockSignInWithSocial,
  }),
}));

jest.mock('@/auth/social-auth-config', () => ({
  isGoogleSocialAuthConfigured: () => true,
}));

jest.mock('@/auth/social-auth-service', () => ({
  isGoogleSocialAuthAvailable: () => true,
  isAppleSocialAuthAvailable: () => false,
  SocialAuthCancelledError: class SocialAuthCancelledError extends Error {
    constructor() {
      super('cancelled');
      this.name = 'SocialAuthCancelledError';
    }
  },
  SocialAuthConfigurationError: class SocialAuthConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SocialAuthConfigurationError';
    }
  },
}));

describe('SocialAuthSection', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithSocial.mockResolvedValue(undefined);
    Platform.OS = originalPlatform;
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  it('renders only Google on Android', () => {
    Platform.OS = 'android';

    render(<SocialAuthSection />);

    expect(screen.getByLabelText('Continue with Google')).toBeTruthy();
    expect(screen.queryByLabelText('Continue with Apple')).toBeNull();
  });

  it('renders Google action when configured', () => {
    render(<SocialAuthSection />);

    expect(screen.getByLabelText('Continue with Google')).toBeTruthy();
  });

  it('enters the existing session pipeline on Google success', async () => {
    render(<SocialAuthSection />);

    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithSocial).toHaveBeenCalledWith('google');
    });
  });

  it('does not show a failure message when the user cancels', async () => {
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    mockSignInWithSocial.mockRejectedValueOnce(new SocialAuthCancelledError());
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithSocial).toHaveBeenCalled();
    });

    expect(onError.mock.calls.some(([message]) => message !== null)).toBe(false);
  });

  it('reports backend failures', async () => {
    const { ApiError } = require('@/api/errors');
    mockSignInWithSocial.mockRejectedValueOnce(
      new ApiError({
        kind: 'unauthorized',
        detail: 'Google identity token is invalid.',
      }),
    );
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Google identity token is invalid.');
    });
  });

  it('maps unauthorized social failures to a friendly fallback message', async () => {
    const { ApiError } = require('@/api/errors');
    mockSignInWithSocial.mockRejectedValueOnce(
      new ApiError({
        kind: 'unauthorized',
        title: 'Authentication failed.',
      }),
    );
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Social sign-in failed. Please try again.');
    });
  });

  it('shows the backend conflict message for existing password accounts', async () => {
    const { ApiError } = require('@/api/errors');
    mockSignInWithSocial.mockRejectedValueOnce(
      new ApiError({
        kind: 'conflict',
        status: 409,
        title: 'Social authentication conflict.',
        detail:
          'An account with this email already exists. Sign in with your password to continue.',
      }),
    );
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        'An account with this email already exists. Sign in with your password to continue.',
      );
    });
  });
});
