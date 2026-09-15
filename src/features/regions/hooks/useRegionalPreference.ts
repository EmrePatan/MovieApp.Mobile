import { useContext } from 'react';
import { RegionalPreferenceContext } from '../RegionalPreferenceProvider';
import type { RegionalPreferenceContextValue } from '../regional-preference-types';

export function useRegionalPreference(): RegionalPreferenceContextValue {
  const context = useContext(RegionalPreferenceContext);

  if (!context) {
    throw new Error('useRegionalPreference must be used within RegionalPreferenceProvider');
  }

  return context;
}
