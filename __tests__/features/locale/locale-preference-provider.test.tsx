import { renderHook, waitFor } from '@testing-library/react-native';
import { useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  LocalePreferenceContext,
  LocalePreferenceProvider,
} from '@/features/locale/LocalePreferenceProvider';
import { changeUiLanguage } from '@/i18n';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
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

// jest.setup.ts already registers the shared expo-localization mock.
// Configure that exact mock instance so the provider and test observe the same locale.
const mockedLocalization = jest.requireMock('expo-localization') as {
  getLocales: jest.Mock;
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <LocalePreferenceProvider>{children}</LocalePreferenceProvider>;
}

describe('LocalePreferenceProvider startup hydration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedLocalization.getLocales.mockReturnValue([{ languageCode: 'tr' }]);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (changeUiLanguage as jest.Mock).mockResolvedValue(undefined);
  });

  it('falls back to device language and completes hydration when SecureStore fails', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Keychain unavailable'));

    const hook = renderHook(() => useContext(LocalePreferenceContext), { wrapper });

    await waitFor(() => {
      expect(hook.result.current.isHydrated).toBe(true);
    });

    expect(mockedLocalization.getLocales).toHaveBeenCalled();
    expect(hook.result.current.language).toBe('tr');
    expect(hook.result.current.source).toBe('device');
    expect(changeUiLanguage).toHaveBeenCalledWith('tr');
  });

  it('falls back to English and completes hydration when i18n initialization fails', async () => {
    (changeUiLanguage as jest.Mock)
      .mockRejectedValueOnce(new Error('locale bundle unavailable'))
      .mockResolvedValueOnce(undefined);
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const hook = renderHook(() => useContext(LocalePreferenceContext), { wrapper });

    await waitFor(() => {
      expect(hook.result.current.isHydrated).toBe(true);
    });

    expect(hook.result.current.language).toBe('en');
    expect(hook.result.current.source).toBe('fallback');
    expect(changeUiLanguage).toHaveBeenNthCalledWith(2, 'en');
    warning.mockRestore();
  });
});
