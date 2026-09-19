import { render, screen } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import ProfileScreen from '../../app/(tabs)/profile';
import LoginScreen from '../../app/(auth)/login';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { changeUiLanguage, i18n } from '@/i18n';

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock('@/features/profile/hooks/useCurrentProfile', () => ({
  useCurrentProfile: () => ({
    data: {
      displayName: 'Emre',
      email: 'emre@example.com',
      createdAt: '2024-01-15T00:00:00Z',
    },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/features/regions/hooks/useRegionalPreference', () => ({
  useRegionalPreference: () => ({
    region: 'TR',
    source: 'device',
    isHydrated: true,
    setRegion: jest.fn(),
    resetToDeviceDefault: jest.fn(),
  }),
}));

jest.mock('@/features/auth/components/SocialAuthSection', () => ({
  SocialAuthSection: () => null,
}));

function renderLogin() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LoginScreen />
    </I18nextProvider>,
  );
}

function renderProfile() {
  return render(
    <I18nextProvider i18n={i18n}>
      <ProfileScreen />
    </I18nextProvider>,
  );
}

describe('localized auth and profile rendering', () => {
  beforeEach(async () => {
    await changeUiLanguage('en');
    jest.mocked(useLocalePreference).mockReturnValue({
      language: 'en',
      source: 'fallback',
      isHydrated: true,
      setLanguage: jest.fn(),
      resetToDeviceDefault: jest.fn(),
    });
  });

  it('renders English login copy', () => {
    renderLogin();

    expect(screen.getByText('Sign in')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders Turkish login copy after language change', async () => {
    await changeUiLanguage('tr');
    renderLogin();

    expect(screen.getByText('Giriş yap')).toBeTruthy();
    expect(screen.getByPlaceholderText('E-posta')).toBeTruthy();
  });

  it('renders localized profile preferences when Turkish override is active', async () => {
    jest.mocked(useLocalePreference).mockReturnValue({
      language: 'tr',
      source: 'saved',
      isHydrated: true,
      setLanguage: jest.fn(),
      resetToDeviceDefault: jest.fn(),
    });
    await changeUiLanguage('tr');
    renderProfile();

    expect(screen.getByText('Tercihler')).toBeTruthy();
    expect(screen.getByText('Dil')).toBeTruthy();
    expect(screen.getByText('Bölge')).toBeTruthy();
    expect(screen.getByText('Çıkış yap')).toBeTruthy();
  });
});
