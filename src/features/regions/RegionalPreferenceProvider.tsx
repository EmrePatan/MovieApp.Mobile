import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearSavedUserRegion,
  getSavedUserRegion,
  saveUserRegion,
} from './regional-preference-storage';
import type { RegionalPreferenceContextValue } from './regional-preference-types';
import { normalizeRegionCode } from './region-options';
import { resolveInitialRegionalPreference, resolveDeviceRegion } from './utils/device-region';

export const RegionalPreferenceContext = createContext<RegionalPreferenceContextValue | null>(
  null,
);

export function RegionalPreferenceProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState(normalizeRegionCode(null));
  const [source, setSource] = useState<RegionalPreferenceContextValue['source']>('fallback');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const savedRegion = await getSavedUserRegion();
      const resolved = resolveInitialRegionalPreference(savedRegion);

      if (!cancelled) {
        setRegionState(resolved.region);
        setSource(resolved.source);
        setIsHydrated(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const setRegion = useCallback(async (regionCode: string) => {
    const normalized = normalizeRegionCode(regionCode);
    await saveUserRegion(normalized);
    setRegionState(normalized);
    setSource('saved');
  }, []);

  const resetToDeviceDefault = useCallback(async () => {
    await clearSavedUserRegion();
    const resolved = resolveInitialRegionalPreference(null);
    setRegionState(resolved.region);
    setSource(resolved.source);
  }, []);

  const value = useMemo<RegionalPreferenceContextValue>(
    () => ({
      region,
      source,
      isHydrated,
      setRegion,
      resetToDeviceDefault,
    }),
    [region, source, isHydrated, setRegion, resetToDeviceDefault],
  );

  return (
    <RegionalPreferenceContext.Provider value={value}>{children}</RegionalPreferenceContext.Provider>
  );
}

export { resolveDeviceRegion };
