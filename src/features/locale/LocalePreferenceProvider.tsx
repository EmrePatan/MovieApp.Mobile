import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '@/api/client';
import { queryClient } from '@/api/query-client';
import { changeUiLanguage } from '@/i18n';
import { toFormatLocaleTag } from '@/i18n/locale-tags';
import type { UiLanguage } from '@/i18n/types';
import {
  clearSavedUiLanguage,
  getSavedUiLanguage,
  saveUiLanguage,
} from './locale-preference-storage';
import type { LocalePreferenceContextValue } from './locale-preference-types';
import { getDeviceLanguageCode, resolveInitialUiLanguage } from './resolve-ui-locale';
import { invalidateLocalizedDetailQueries } from './utils/invalidate-localized-detail-queries';

export const LocalePreferenceContext = createContext<LocalePreferenceContextValue | null>(null);

export function LocalePreferenceProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>('en');
  const [source, setSource] = useState<LocalePreferenceContextValue['source']>('fallback');
  const [isHydrated, setIsHydrated] = useState(false);
  const acceptLanguageTagRef = useRef(toFormatLocaleTag('en'));

  useEffect(() => {
    api.setAcceptLanguageGetter(() => acceptLanguageTagRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // A Keychain/SecureStore failure must not keep the app behind the startup gate.
      const savedLanguage = await getSavedUiLanguage().catch(() => null);
      const resolved = resolveInitialUiLanguage(savedLanguage, getDeviceLanguageCode());
      let languageToApply = resolved.language;
      let sourceToApply = resolved.source;

      try {
        await changeUiLanguage(languageToApply);
      } catch (error) {
        // Do not leave the app behind the locale startup gate if i18n initialization fails.
        console.warn('[Locale] Failed to apply the preferred language; falling back to English.', error);
        languageToApply = 'en';
        sourceToApply = 'fallback';
        await changeUiLanguage('en').catch(() => undefined);
      }

      acceptLanguageTagRef.current = toFormatLocaleTag(languageToApply);

      if (!cancelled) {
        if (languageToApply !== 'en') {
          invalidateLocalizedDetailQueries(queryClient);
        }
        setLanguageState(languageToApply);
        setSource(sourceToApply);
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
    acceptLanguageTagRef.current = toFormatLocaleTag(nextLanguage);
    invalidateLocalizedDetailQueries(queryClient);
    setLanguageState(nextLanguage);
    setSource('saved');
  }, []);

  const resetToDeviceDefault = useCallback(async () => {
    await clearSavedUiLanguage();
    const resolved = resolveInitialUiLanguage(null, getDeviceLanguageCode());
    await changeUiLanguage(resolved.language);
    acceptLanguageTagRef.current = toFormatLocaleTag(resolved.language);
    invalidateLocalizedDetailQueries(queryClient);
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
