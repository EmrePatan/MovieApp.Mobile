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
      const savedLanguage = await getSavedUiLanguage();
      const resolved = resolveInitialUiLanguage(savedLanguage, getDeviceLanguageCode());
      await changeUiLanguage(resolved.language);
      acceptLanguageTagRef.current = toFormatLocaleTag(resolved.language);

      if (!cancelled) {
        if (resolved.language !== 'en') {
          invalidateLocalizedDetailQueries(queryClient);
        }
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
