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

  it('renders Google and Apple on iOS', () => {
    Platform.OS = 'ios';

    render(<SocialAuthSection />);

    expect(screen.getByLabelText('Continue with Google')).toBeTruthy();
    expect(screen.getByLabelText('Continue with Apple')).toBeTruthy();
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

  it('reports localized fallback for unauthorized social failures without known code', async () => {
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

  it('maps account collision code to localized product copy', async () => {
    const { ApiError, ACCOUNT_EXISTS_DIFFERENT_SIGN_IN_METHOD_CODE } = require('@/api/errors');
    mockSignInWithSocial.mockRejectedValueOnce(
      new ApiError({
        kind: 'unauthorized',
        detail: 'Social authentication failed.',
        responseBody: { code: ACCOUNT_EXISTS_DIFFERENT_SIGN_IN_METHOD_CODE },
      }),
    );
    const onError = jest.fn();

    render(<SocialAuthSection onError={onError} />);
    fireEvent.press(screen.getByLabelText('Continue with Google'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        'An account with this email already exists. Sign in using your existing method, then link this account from Sign-in & Security.',
      );
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

});
