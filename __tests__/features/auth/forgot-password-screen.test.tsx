import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../../../app/(auth)/forgot-password';
import { forgotPasswordRequest } from '@/auth/auth-api';
import { ApiError } from '@/api/errors';
import { changeUiLanguage, i18n } from '@/i18n';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/auth/auth-api', () => ({
  forgotPasswordRequest: jest.fn(),
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await changeUiLanguage('en');
  });

  it('shows neutral supporting copy about password and social sign-in', () => {
    render(<ForgotPasswordScreen />);

    expect(
      screen.getByText(
        'If this email supports password sign-in, we’ll send a reset link. Signed up with Google or Apple? Use that sign-in method instead.',
      ),
    ).toBeTruthy();
  });

  it('shows neutral success message after submit', async () => {
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
          'If this email supports password sign-in, we’ll send reset instructions shortly. Signed up with Google or Apple? Use that sign-in method instead.',
        ),
      ).toBeTruthy();
    });
  });

  it('renders Turkish supporting and success copy', async () => {
    await changeUiLanguage('tr');
    (forgotPasswordRequest as jest.Mock).mockResolvedValue({
      message: 'Bu e-posta adresine kayıtlı bir hesap varsa, şifreni sıfırlamak için talimatlar gönderilecektir.',
    });

    render(<ForgotPasswordScreen />);

    expect(
      screen.getByText(
        'Bu e-posta parola ile girişe uygunsa sıfırlama bağlantısı göndeririz. Google veya Apple ile kaydolduysan, giriş için o yöntemi kullan.',
      ),
    ).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('E-posta'), 'user@example.com');
    fireEvent.press(screen.getByText('Sıfırlama talimatlarını gönder'));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Bu e-posta parola ile girişe uygunsa kısa süre içinde sıfırlama talimatları gönderilir. Google veya Apple ile kaydolduysan, giriş için o yöntemi kullan.',
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

    expect(await screen.findByText(i18n.t('errors.authRateLimited'))).toBeTruthy();
  });

  it('shows a link back to login', () => {
    render(<ForgotPasswordScreen />);
    expect(screen.getByLabelText('Back to sign in')).toBeTruthy();
  });
});
