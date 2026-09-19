import * as SecureStore from 'expo-secure-store';
import {
  clearSavedUiLanguage,
  getSavedUiLanguage,
  saveUiLanguage,
} from '@/features/locale/locale-preference-storage';
import { UI_LANGUAGE_STORAGE_KEY } from '@/i18n/types';

describe('locale preference storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists supported language codes', async () => {
    await saveUiLanguage('tr');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(UI_LANGUAGE_STORAGE_KEY, 'tr');
  });

  it('reads saved language from SecureStore', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tr');

    await expect(getSavedUiLanguage()).resolves.toBe('tr');
  });

  it('clears saved language override', async () => {
    await clearSavedUiLanguage();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(UI_LANGUAGE_STORAGE_KEY);
  });
});
