import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { LocalePreferenceProvider } from '@/features/locale/LocalePreferenceProvider';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { changeUiLanguage } from '@/i18n';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'tr' }]),
}));

jest.mock('@/features/locale/locale-preference-storage', () => ({
  getSavedUiLanguage: jest.fn(),
  saveUiLanguage: jest.fn(),
  clearSavedUiLanguage: jest.fn(),
}));

jest.mock('@/api/client', () => ({
  api: { setAcceptLanguageGetter: jest.fn() },
}));

jest.mock('@/api/query-client', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));

jest.mock('@/i18n', () => ({
  ensureI18nInitialized: jest.fn().mockResolvedValue(undefined),
  changeUiLanguage: jest.fn(),
}));

import { getSavedUiLanguage } from '@/features/locale/locale-preference-storage';

function wrapper({ children }: { children: React.ReactNode }) {
  return <LocalePreferenceProvider>{children}</LocalePreferenceProvider>;
}

describe('LocalePreferenceProvider startup hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (getSavedUiLanguage as jest.Mock).mockResolvedValue(null);
    (changeUiLanguage as jest.Mock).mockResolvedValue(undefined);
  });

  it('falls back to device language and completes hydration when SecureStore fails', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain unavailable'));

    const { result } = renderHook(() => useLocalePreference(), { wrapper });

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });
    });

    expect(result.current.language).toBe('tr');
    expect(result.current.source).toBe('device');
    expect(changeUiLanguage).toHaveBeenCalledWith('tr');
  });

  it('falls back to English and completes hydration when i18n initialization fails', async () => {
    (changeUiLanguage as jest.Mock)
      .mockRejectedValueOnce(new Error('locale bundle unavailable'))
      .mockResolvedValueOnce(undefined);
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { result } = renderHook(() => useLocalePreference(), { wrapper });

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });
    });

    expect(result.current.language).toBe('en');
    expect(result.current.source).toBe('fallback');
    expect(changeUiLanguage).toHaveBeenNthCalledWith(2, 'en');
    warning.mockRestore();
  });
});
