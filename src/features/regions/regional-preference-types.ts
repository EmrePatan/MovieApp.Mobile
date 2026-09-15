export type RegionalPreferenceSource = 'saved' | 'device' | 'fallback';

export interface RegionalPreferenceState {
  region: string;
  source: RegionalPreferenceSource;
  isHydrated: boolean;
}

export interface RegionalPreferenceContextValue extends RegionalPreferenceState {
  setRegion: (regionCode: string) => Promise<void>;
  resetToDeviceDefault: () => Promise<void>;
}
