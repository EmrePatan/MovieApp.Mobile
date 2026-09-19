import { useContext } from 'react';
import { LocalePreferenceContext } from '../LocalePreferenceProvider';

export function useLocalePreference() {
  const context = useContext(LocalePreferenceContext);

  if (!context) {
    throw new Error('useLocalePreference must be used within LocalePreferenceProvider');
  }

  return context;
}
