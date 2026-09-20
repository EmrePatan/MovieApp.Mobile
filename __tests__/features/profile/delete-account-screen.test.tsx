import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import DeleteAccountScreen from '../../../app/profile/delete-account';
import { useCurrentProfile } from '@/features/profile/hooks/useCurrentProfile';
import { useDeleteAccountMutation } from '@/features/profile/hooks/useProfileMutations';
import { requestSocialIdentityToken } from '@/auth/social-auth-service';

const mockMutate = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
  useSegments: jest.fn(() => []),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: jest.fn(),
}));

jest.mock('@/features/profile/hooks/useProfileMutations', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

jest.mock('@/auth/social-auth-service', () => ({
  requestSocialIdentityToken: jest.fn(),
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

const passwordProfile = {
  id: 'user-id',
  email: 'user@example.com',
  userName: 'user',
  displayName: 'User',
  createdAt: '2026-01-01T00:00:00.000Z',
  hasPassword: true,
  linkedProviders: [],
};

const socialProfile = {
  ...passwordProfile,
  hasPassword: false,
  linkedProviders: ['google', 'apple'],
};

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
    (useDeleteAccountMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: passwordProfile,
    });
    (requestSocialIdentityToken as jest.Mock).mockResolvedValue('google-id-token');
  });

  it('requires confirmation before password step', () => {
    render(<DeleteAccountScreen />);
    expect(screen.queryByLabelText('Current password')).toBeNull();
    fireEvent.press(screen.getByText('Continue'));
    expect(screen.getByLabelText('Current password')).toBeTruthy();
  });

  it('submits delete account mutation with password', () => {
    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.changeText(screen.getByLabelText('Current password'), 'password');
    fireEvent.press(screen.getByText('Delete my account'));

    expect(mockMutate).toHaveBeenCalledWith(
      { currentPassword: 'password' },
      expect.any(Object),
    );
  });

  it('shows social confirmation for social-only accounts', () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: socialProfile,
    });

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));

    expect(screen.queryByLabelText('Current password')).toBeNull();
    expect(screen.getByLabelText('Confirm with Google')).toBeTruthy();
    expect(screen.getByLabelText('Confirm with Apple')).toBeTruthy();
  });

  it('submits delete account mutation after social re-authentication', async () => {
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: socialProfile,
    });

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByLabelText('Confirm with Google'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalledWith('google');
      expect(mockMutateAsync).toHaveBeenCalledWith({
        provider: 'google',
        identityToken: 'google-id-token',
      });
    });
  });

  it('does not submit delete account twice while social re-auth is in progress', async () => {
    let resolveToken: ((value: string) => void) | undefined;
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: { ...socialProfile, linkedProviders: ['google'] },
    });
    (requestSocialIdentityToken as jest.Mock).mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveToken = resolve;
        }),
    );

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByLabelText('Confirm with Google'));
    fireEvent.press(screen.getByLabelText('Confirm with Google'));

    expect(requestSocialIdentityToken).toHaveBeenCalledTimes(1);

    resolveToken?.('google-id-token');

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('does not delete the account when social re-authentication is cancelled', async () => {
    const { SocialAuthCancelledError } = require('@/auth/social-auth-service');
    (useCurrentProfile as jest.Mock).mockReturnValue({
      data: { ...socialProfile, linkedProviders: ['google'] },
    });
    (requestSocialIdentityToken as jest.Mock).mockRejectedValueOnce(new SocialAuthCancelledError());

    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByText('Continue'));
    fireEvent.press(screen.getByLabelText('Confirm with Google'));

    await waitFor(() => {
      expect(requestSocialIdentityToken).toHaveBeenCalled();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
