import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { changeUiLanguage } from '@/i18n';
import type { UiLanguage } from '@/i18n/types';
import {
  clearSavedUiLanguage,
  getSavedUiLanguage,
  saveUiLanguage,
} from './locale-preference-storage';
import type { LocalePreferenceContextValue } from './locale-preference-types';
import { getDeviceLanguageCode, resolveInitialUiLanguage } from './resolve-ui-locale';

export const LocalePreferenceContext = createContext<LocalePreferenceContextValue | null>(null);

export function LocalePreferenceProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>('en');
  const [source, setSource] = useState<LocalePreferenceContextValue['source']>('fallback');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const savedLanguage = await getSavedUiLanguage();
      const resolved = resolveInitialUiLanguage(savedLanguage, getDeviceLanguageCode());
      await changeUiLanguage(resolved.language);

      if (!cancelled) {
        setLanguageState(resolved.language);
        setSource(resolved.source);
        setIsHydrated(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: UiLanguage) => {
    await saveUiLanguage(nextLanguage);
    await changeUiLanguage(nextLanguage);
    setLanguageState(nextLanguage);
    setSource('saved');
  }, []);

  const resetToDeviceDefault = useCallback(async () => {
    await clearSavedUiLanguage();
    const resolved = resolveInitialUiLanguage(null, getDeviceLanguageCode());
    await changeUiLanguage(resolved.language);
    setLanguageState(resolved.language);
    setSource(resolved.source);
  }, []);

  const value = useMemo<LocalePreferenceContextValue>(
    () => ({
      language,
      source,
      isHydrated,
      setLanguage,
      resetToDeviceDefault,
    }),
    [language, source, isHydrated, setLanguage, resetToDeviceDefault],
  );

  return (
    <LocalePreferenceContext.Provider value={value}>{children}</LocalePreferenceContext.Provider>
  );
}
