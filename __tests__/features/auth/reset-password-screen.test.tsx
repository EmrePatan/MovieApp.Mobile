import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ResetPasswordScreen from '../../../app/(auth)/reset-password';
import { resetPasswordRequest } from '@/auth/auth-api';
import { ApiError } from '@/api/errors';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/auth/auth-api', () => ({
  resetPasswordRequest: jest.fn(),
}));

const useLocalSearchParams = jest.requireMock('expo-router').useLocalSearchParams as jest.Mock;

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useLocalSearchParams.mockReturnValue({ token: 'reset-token-value' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses deep-link token without showing the raw token field', () => {
    render(<ResetPasswordScreen />);
    expect(screen.queryByLabelText('Reset token')).toBeNull();
  });

  it('shows manual token entry when deep link token is missing', () => {
    useLocalSearchParams.mockReturnValue({});
    render(<ResetPasswordScreen />);
    expect(screen.getByLabelText('Reset token')).toBeTruthy();
  });

  it('validates password confirmation', async () => {
    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'AnotherPassword123');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'MismatchPassword123');
    fireEvent.press(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Passwords do not match.')).toBeTruthy();
    expect(resetPasswordRequest).not.toHaveBeenCalled();
  });

  it('submits reset request and shows success message', async () => {
    (resetPasswordRequest as jest.Mock).mockResolvedValue({
      message: 'Your password has been reset. You can now sign in with your new password.',
    });

    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'AnotherPassword123');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'AnotherPassword123');
    fireEvent.press(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(resetPasswordRequest).toHaveBeenCalledWith({
        token: 'reset-token-value',
        newPassword: 'AnotherPassword123',
      });
    });

    expect(
      await screen.findByText(
        'Your password has been reset. You can now sign in with your new password.',
      ),
    ).toBeTruthy();

    jest.runAllTimers();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('shows invalid token message for validation errors', async () => {
    (resetPasswordRequest as jest.Mock).mockRejectedValue(
      new ApiError({ kind: 'validation', status: 400 }),
    );

    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'AnotherPassword123');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'AnotherPassword123');
    fireEvent.press(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Invalid or expired reset token.')).toBeTruthy();
  });

  it('shows rate limit message on 429', async () => {
    (resetPasswordRequest as jest.Mock).mockRejectedValue(
      new ApiError({ kind: 'rate_limited', status: 429 }),
    );

    render(<ResetPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('New password'), 'AnotherPassword123');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'AnotherPassword123');
    fireEvent.press(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Too many attempts. Please try again later.')).toBeTruthy();
  });
});
