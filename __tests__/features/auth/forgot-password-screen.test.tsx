import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../../../app/(auth)/forgot-password';
import { forgotPasswordRequest } from '@/auth/auth-api';
import { ApiError } from '@/api/errors';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/auth/auth-api', () => ({
  forgotPasswordRequest: jest.fn(),
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows generic success message after submit', async () => {
    (forgotPasswordRequest as jest.Mock).mockResolvedValue({
      message:
        'If an account exists for this email, you will receive instructions to reset your password.',
    });

    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.press(screen.getByText('Send reset instructions'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'If an account exists for this email, you will receive instructions to reset your password.',
        ),
      ).toBeTruthy();
    });
  });

  it('validates email before submit', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByText('Send reset instructions'));

    expect(await screen.findByText('Email is required.')).toBeTruthy();
    expect(forgotPasswordRequest).not.toHaveBeenCalled();
  });

  it('shows rate limit message on 429', async () => {
    (forgotPasswordRequest as jest.Mock).mockRejectedValue(
      new ApiError({ kind: 'rate_limited', status: 429 }),
    );

    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.press(screen.getByText('Send reset instructions'));

    expect(await screen.findByText('Too many attempts. Please try again later.')).toBeTruthy();
  });

  it('shows a link back to login', () => {
    render(<ForgotPasswordScreen />);
    expect(screen.getByLabelText('Back to sign in')).toBeTruthy();
  });
});
