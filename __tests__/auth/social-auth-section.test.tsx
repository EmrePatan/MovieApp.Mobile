import React from 'react';
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithSocial.mockResolvedValue(undefined);
  });

  it('renders Google action when configured', () => {
    render(<SocialAuthSection />);

    expect(screen.getByText('or continue with')).toBeTruthy();
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('enters the existing session pipeline on Google success', async () => {
    render(<SocialAuthSection />);

    fireEvent.press(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithSocial).toHaveBeenCalledWith('google');
    });
  });

  it('does not show a failure message when the user cancels', async () => {
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    mockSignInWithSocial.mockRejectedValueOnce(new SocialAuthCancelledError());
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(mockSignInWithSocial).toHaveBeenCalled();
    });

    expect(onError.mock.calls.some(([message]) => message !== null)).toBe(false);
  });

  it('reports backend failures', async () => {
    const { ApiError } = require('@/api/errors');
    mockSignInWithSocial.mockRejectedValueOnce(
      new ApiError({ kind: 'unauthorized', userMessage: 'Social sign-in failed. Please try again.' }),
    );
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Social sign-in failed. Please try again.');
    });
  });
});
