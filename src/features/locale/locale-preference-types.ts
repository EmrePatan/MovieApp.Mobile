import type { LocalePreferenceSource, UiLanguage } from '@/i18n/types';

export interface LocalePreferenceState {
  language: UiLanguage;
  source: LocalePreferenceSource;
  isHydrated: boolean;
}

export interface LocalePreferenceContextValue extends LocalePreferenceState {
  setLanguage: (language: UiLanguage) => Promise<void>;
  resetToDeviceDefault: () => Promise<void>;
}
